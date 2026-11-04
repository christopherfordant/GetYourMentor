"""Offline A4.3 benchmark. Uses verified local assets; never downloads or calls a DB.

Run from any directory: python tools/agentic-workbench/compare_retrieval.py --output PATH
No raw corpus or embedding arrays are written to the report.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import statistics
import subprocess
import time

from qualify_embeddings import REVISION, PIPELINE, ASSET_SHA256, sha256, peak_working_set

ROOT = Path(__file__).resolve().parents[2]
BRIDGE = ROOT / 'tools/agentic-workbench/comparison-bridge.mjs'


def bridge(payload):
    p = subprocess.run(['node', str(BRIDGE)], cwd=ROOT, input=json.dumps(payload, ensure_ascii=False).encode('utf-8'), capture_output=True, timeout=120)
    if p.returncode:
        raise RuntimeError(p.stderr.decode('utf-8', errors='replace')[-1500:])
    return json.loads(p.stdout)


def correct(case, result, corpus):
    if result['status'] != case['expectedStatus']:
        return False
    if case.get('expectedIds'):
        return set(case['expectedIds']).issubset(result['ids'])
    if case.get('expectedDocuments'):
        return bool(set(case['expectedDocuments']) & {corpus[i]['documentId'] for i in result['ids']})
    return True


def metrics(indices, cases, rows, corpus):
    positives = [i for i in indices if cases[i]['expectedStatus'] == 'sources']
    negatives = [i for i in indices if cases[i]['expectedStatus'] == 'abstained' and cases[i]['loaded']]
    labelled = [i for i in positives if cases[i].get('expectedIds')]
    return {
        'cases': len(indices), 'strictCorrect': sum(correct(cases[i], rows[i], corpus) for i in indices),
        'positiveCases': len(positives), 'positiveAllGoldRetrieved': sum(correct(cases[i], rows[i], corpus) for i in positives),
        'syntheticMeanRecallAt8': statistics.mean(len(set(cases[i]['expectedIds']) & set(rows[i]['ids'])) / len(cases[i]['expectedIds']) for i in labelled) if labelled else None,
        'negativeCases': len(negatives), 'falsePositiveNegatives': sum(rows[i]['status'] in ('sources', 'review') for i in negatives),
        'falseAbstentionPositives': sum(rows[i]['status'] == 'abstained' for i in positives),
        'wrongPositiveSourceSet': sum(rows[i]['status'] == 'sources' and not correct(cases[i], rows[i], corpus) for i in positives),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    import numpy as np
    import onnxruntime as ort
    from tokenizers import Tokenizer
    ort.disable_telemetry_events()
    prepared = bridge({'operation': 'prepare'})
    cases, chunks = prepared['cases'], prepared['corpus']
    corpus = {c['id']: c for c in chunks}
    assert len(corpus) == len(chunks), 'Duplicate source IDs'
    cache = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'GetYourMentor/models/e5-small' / REVISION
    for name, expected in ASSET_SHA256.items():
        if not (cache / name).is_file() or sha256(cache / name) != expected:
            raise RuntimeError('Missing or unverified asset; run the authorised qualification script first')
    tok = Tokenizer.from_file(str(cache / 'tokenizer.json'))
    tok.enable_truncation(max_length=256)
    options = ort.SessionOptions()
    options.intra_op_num_threads, options.inter_op_num_threads = 2, 1
    start = time.perf_counter()
    session = ort.InferenceSession(str(cache / 'model_quantized.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
    load_seconds = time.perf_counter() - start
    durations, truncations = [], []

    def encode(kind, text, identity):
        tok.no_truncation()
        full_tokens = len(tok.encode(kind + ': ' + text).ids)
        tok.enable_truncation(max_length=256)
        encoded = tok.encode(kind + ': ' + text)
        if full_tokens > 256:
            truncations.append({'id': identity, 'kind': kind, 'fullTokens': full_tokens, 'usedTokens': len(encoded.ids)})
        values = {'input_ids': np.array([encoded.ids], dtype=np.int64), 'attention_mask': np.array([encoded.attention_mask], dtype=np.int64), 'token_type_ids': np.array([encoded.type_ids], dtype=np.int64)}
        t = time.perf_counter()
        hidden = session.run(None, {node.name: values[node.name] for node in session.get_inputs()})[0]
        mask = values['attention_mask'][..., None]
        v = ((hidden * mask).sum(axis=1) / mask.sum(axis=1))[0].astype(np.float32)
        norm = float(np.linalg.norm(v))
        if v.shape != (384,) or not np.isfinite(v).all() or norm <= 0:
            raise ValueError('Invalid embedding')
        v /= norm
        elapsed = time.perf_counter() - t
        durations.append(elapsed)
        return v, elapsed

    allowed_union = set().union(*(set(c['allowedIds']) for c in cases if c['loaded']))
    eligible = [c for c in chunks if c['id'] in allowed_union]
    assert all(c['visibility'] == 'internal' and c['status'] == 'active' for c in eligible)
    vectors = []
    indexing_start = time.perf_counter()
    for index, chunk in enumerate(eligible):
        vectors.append(encode('passage', chunk['excerpt'], chunk['id'])[0])
        if index % 100 == 0:
            print(f'Local passages: {index + 1}/{len(eligible)}', flush=True)
    matrix = np.stack(vectors)
    index_seconds = time.perf_counter() - indexing_start
    scores, query_times = {}, {}
    for i, case in enumerate(cases):
        if not case['loaded'] or not case['allowedIds']:
            scores[i] = []
            query_times[i] = 0.0
            continue
        vector, elapsed = encode('query', case['question'], case['id'])
        t = time.perf_counter()
        cosine = matrix @ vector
        allowed = set(case['allowedIds'])
        scores[i] = [{'id': c['id'], 'score': float(s)} for c, s in zip(eligible, cosine) if c['id'] in allowed]
        query_times[i] = elapsed + time.perf_counter() - t

    def rank(requests):
        return bridge({'operation': 'rank', 'corpus': chunks, 'cases': cases, 'scores': scores, 'requests': requests})

    tune = [i for i, c in enumerate(cases) if c['split'] == 'tune']
    validation = [i for i, c in enumerate(cases) if c['split'] == 'validation']
    baseline = {i: c['baseline'] for i, c in enumerate(cases)}
    grid = prepared['dataset']['protocol']['thresholdGrid']
    rows = rank([{'caseIndex': i, 'threshold': threshold, 'method': 'vector'} for threshold in grid for i in tune])
    calibration = []
    for threshold in grid:
        candidates = {r['caseIndex']: r for r in rows if r['threshold'] == threshold}
        m = metrics(tune, cases, candidates, corpus)
        wrong_status = sum(candidates[i]['status'] != cases[i]['expectedStatus'] for i in tune if cases[i]['expectedStatus'] not in ('sources', 'abstained'))
        cost = 2 * m['falsePositiveNegatives'] + (1 - m['positiveAllGoldRetrieved'] / m['positiveCases']) + wrong_status
        calibration.append({'threshold': threshold, 'cost': cost, 'metrics': m})
    choice = min(calibration, key=lambda c: (c['cost'], -c['threshold']))
    threshold = choice['threshold']
    selected_tune = {r['caseIndex']: r for r in rows if r['threshold'] == threshold}
    unique_lexical = [cases[i]['id'] for i in tune if correct(cases[i], baseline[i], corpus) and not correct(cases[i], selected_tune[i], corpus)]
    unique_vector = [cases[i]['id'] for i in tune if correct(cases[i], selected_tune[i], corpus) and not correct(cases[i], baseline[i], corpus)]
    methods = ['vector'] + (['hybrid'] if unique_lexical and unique_vector else [])
    final = rank([{'caseIndex': i, 'threshold': threshold, 'method': method} for method in methods for i in range(len(cases))])
    summaries, details = {}, []
    for method in ['lexical', *methods]:
        results = baseline if method == 'lexical' else {r['caseIndex']: r for r in final if r['method'] == method}
        summaries[method] = {split: metrics([i for i, c in enumerate(cases) if c['split'] == split], cases, results, corpus) for split in ('tune', 'validation', 'historical')}
        summaries[method]['medianRankMilliseconds'] = statistics.median(results[i]['milliseconds'] for i in validation)
        if method != 'lexical':
            assert all(r['citationExact'] for r in results.values())
            assert all(set(r['ids']).issubset(cases[i]['allowedIds']) for i, r in results.items())
        for i, c in enumerate(cases):
            r = results[i]
            # No excerpts or vectors in the archived output.
            details.append({'case': c['id'], 'split': c['split'], 'method': method, 'expectedStatus': c['expectedStatus'], 'expectedIds': c.get('expectedIds'), 'expectedDocuments': c.get('expectedDocuments'), 'status': r['status'], 'ids': r['ids'], 'strictCorrect': correct(c, r, corpus), 'queryEmbeddingAndDotSeconds': query_times[i] if method != 'lexical' else 0.0, 'rankMilliseconds': r['milliseconds']})
    report = {
        'datasetSha256': sha256(ROOT / 'docs/architecture/rag-comparison-2026-11-04.json'),
        'sourceCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
        'pipeline': PIPELINE, 'modelSha256': ASSET_SHA256['model_quantized.onnx'],
        'sourceVersions': {c['path']: c['version'] for c in chunks if c['path'] != 'synthetic-fixture'},
        'threshold': threshold, 'calibration': calibration, 'hybridCondition': {'uniqueLexicalTuneSuccesses': unique_lexical, 'uniqueVectorTuneSuccesses': unique_vector, 'evaluated': 'hybrid' in methods},
        'summaries': summaries, 'details': details, 'truncations': truncations,
        'resources': {'sessionLoadSeconds': load_seconds, 'localPassagesEncoded': len(eligible), 'localPassageEncodingSeconds': index_seconds, 'queryEmbeddingAndDotMedianSeconds': statistics.median(v for v in query_times.values() if v), 'peakProcessWorkingSetBytes': peak_working_set()},
        'safety': {'providerCalls': 0, 'databaseCalls': 0, 'applicationNetworkCalls': 0, 'onnxTelemetryDisabled': True, 'unauthorizedPassagesEmbedded': 0, 'retrievedIdsAuthorized': True, 'citationExactByConstructionAndIdentity': True},
        'limitations': ['Small author-annotated fixture; no independent benchmark or population estimate', 'Validation vocabulary and corpus overlap with calibration; not an external generalization test', 'Real corpus document labels are alternatives and incomplete; no real-corpus passage precision claimed', 'Latency excludes tokenizer, Node IPC and end-to-end workflow; cold load/indexing reported separately', 'Vector uses 256-token truncation while lexical/citations use entire original chunks', 'Cosine dot products in volatile RAM, not a Supabase performance measurement; no vector store persisted', 'Existing lexical Jupiter false positive is diagnostic, not silently fixed', 'Safety gates reused from native workflow; no comprehensive prompt-injection protection claimed']
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'threshold': threshold, 'summaries': summaries, 'resources': report['resources']}), flush=True)


if __name__ == '__main__':
    main()
