"""Bounded local qualification. No corpus ingestion, database access or provider API.

Usage: python tools/agentic-workbench/qualify_embeddings.py --download --output PATH
Weights stay outside Git. The explicit --download flag is required for missing assets.
"""
import argparse
import ctypes
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import time
import urllib.request

REVISION = '761b726dd34fb83930e26aab4e9ac3899aa1fa78'
ORIGINAL_REVISION = '614241f622f53c4eeff9890bdc4f31cfecc418b3'
WEIGHTS_SHA256 = 'f80102d3f2a1229f387d3c81909990d8945513e347b0eab049f7de3c6f98c193'
ASSET_SHA256 = {
    'model_quantized.onnx': WEIGHTS_SHA256,
    'tokenizer.json': '0b44a9d7b51c3c62626640cda0e2c2f70fdacdc25bbbd68038369d14ebdf4c39',
    'original-model-card.md': '0038de97aee16258cecbad7ffda4b4febd6953e747a00e0ddbc8e6ed241e9c1c',
    'conversion-model-card.md': '561a19594636657fe033f8b4427a7743b5f6f3a12f16cecc5f286feca0453245',
}
PIPELINE = 'e5-onnx-int8-mean-mask-l2-max256-v1'


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def download(url, target, limit):
    """Fixed public URLs only; bounded size and socket timeout, atomic replacement."""
    temp = target.with_suffix(target.suffix + '.partial')
    target.parent.mkdir(parents=True, exist_ok=True)
    total = 0
    try:
        with urllib.request.urlopen(url, timeout=60) as response, temp.open('wb') as stream:
            while block := response.read(1024 * 1024):
                total += len(block)
                if total > limit:
                    raise ValueError('Download exceeds the asset budget')
                stream.write(block)
        temp.replace(target)
    finally:
        temp.unlink(missing_ok=True)


def peak_working_set():
    if os.name != 'nt':
        return None
    class Counters(ctypes.Structure):
        _fields_ = [('cb', ctypes.c_ulong), ('PageFaultCount', ctypes.c_ulong)] + [
            (name, ctypes.c_size_t) for name in ('PeakWorkingSetSize', 'WorkingSetSize',
            'QuotaPeakPagedPoolUsage', 'QuotaPagedPoolUsage', 'QuotaPeakNonPagedPoolUsage',
            'QuotaNonPagedPoolUsage', 'PagefileUsage', 'PeakPagefileUsage')]
    counters = Counters()
    counters.cb = ctypes.sizeof(counters)
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    kernel.GetCurrentProcess.restype = ctypes.c_void_p
    query = ctypes.WinDLL('psapi', use_last_error=True).GetProcessMemoryInfo
    query.argtypes = [ctypes.c_void_p, ctypes.POINTER(Counters), ctypes.c_ulong]
    if not query(kernel.GetCurrentProcess(), ctypes.byref(counters), counters.cb):
        raise ctypes.WinError(ctypes.get_last_error())
    return counters.PeakWorkingSetSize


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--download', action='store_true')
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    import numpy as np
    import onnxruntime as ort
    from tokenizers import Tokenizer

    cache = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'GetYourMentor/models/e5-small' / REVISION
    assets = {
        'model_quantized.onnx': (f'https://huggingface.co/Xenova/multilingual-e5-small/resolve/{REVISION}/onnx/model_quantized.onnx', 120_000_000),
        'tokenizer.json': (f'https://huggingface.co/Xenova/multilingual-e5-small/resolve/{REVISION}/tokenizer.json', 25_000_000),
        'original-model-card.md': (f'https://huggingface.co/intfloat/multilingual-e5-small/resolve/{ORIGINAL_REVISION}/README.md', 1_000_000),
        'conversion-model-card.md': (f'https://huggingface.co/Xenova/multilingual-e5-small/resolve/{REVISION}/README.md', 1_000_000),
    }
    for name, (url, limit) in assets.items():
        if not (cache / name).exists():
            if not args.download:
                raise RuntimeError('Missing local asset; explicit --download required')
            print('Downloading ' + name, flush=True)
            download(url, cache / name, limit)
        if (cache / name).stat().st_size > limit or sha256(cache / name) != ASSET_SHA256[name]:
            raise ValueError('Pinned asset checksum or size mismatch: ' + name)
    if 'license: mit' not in (cache / 'original-model-card.md').read_text(encoding='utf-8').lower():
        raise ValueError('Expected upstream license metadata missing')

    tokenizer = Tokenizer.from_file(str(cache / 'tokenizer.json'))
    tokenizer.enable_truncation(max_length=256)
    options = ort.SessionOptions()
    options.intra_op_num_threads = 2
    options.inter_op_num_threads = 1
    start = time.perf_counter()
    session = ort.InferenceSession(str(cache / 'model_quantized.onnx'), sess_options=options, providers=['CPUExecutionProvider'])
    load_seconds = time.perf_counter() - start
    samples = [
        ('query', 'Comment annuler une reservation ?'),
        ('passage', 'Pour annuler une reservation, ouvrir son compte et choisir Annuler.'),
        ('passage', 'Les bananes et les pommes sont des fruits.'),
        ('query', 'Comment annuler une reservation ?'),
        ('passage', 'Un exemple synthetique pour verifier la longueur du texte. ' * 300),
    ]
    vectors, timings, tokens = [], [], []
    for kind, text in samples:
        encoded = tokenizer.encode(kind + ': ' + text)
        values = {'input_ids': np.array([encoded.ids], dtype=np.int64),
                  'attention_mask': np.array([encoded.attention_mask], dtype=np.int64),
                  'token_type_ids': np.array([encoded.type_ids], dtype=np.int64)}
        inputs = {node.name: values[node.name] for node in session.get_inputs()}
        start = time.perf_counter()
        hidden = session.run(None, inputs)[0]
        if hidden.shape != (1, len(encoded.ids), 384):
            raise ValueError('Unexpected token embedding dimensions')
        mask = values['attention_mask'][..., None]
        vector = (hidden * mask).sum(axis=1) / mask.sum(axis=1)
        vector = vector[0].astype(np.float32)
        norm = float(np.linalg.norm(vector))
        if not np.isfinite(vector).all() or norm <= 0:
            raise ValueError('Invalid vector')
        vector /= norm
        timings.append(time.perf_counter() - start)
        tokens.append(len(encoded.ids))
        vectors.append(vector)
    norms = [float(np.linalg.norm(v)) for v in vectors]
    assert all(abs(n - 1) < 1e-5 for n in norms)
    max_difference = float(np.max(np.abs(vectors[0] - vectors[3])))
    assert max_difference <= 1e-6
    assert tokens[-1] == 256
    scores = [float(vectors[0] @ v) for v in vectors[1:3]]
    assert scores[0] > scores[1], 'Tiny French sanity check failed; not a relevance benchmark'
    report = {
        'model': 'intfloat/multilingual-e5-small', 'upstreamRevision': ORIGINAL_REVISION,
        'conversion': 'Xenova/multilingual-e5-small', 'conversionRevision': REVISION,
        'pipeline': PIPELINE, 'dimension': 384, 'maxTokens': 256,
        'prefixes': ['query: ', 'passage: '], 'pooling': 'attention-mask mean then L2',
        'license': 'MIT declared by upstream; conversion card has no independent license declaration',
        'assets': {name: {'sha256': sha256(cache / name), 'bytes': (cache / name).stat().st_size, 'url': url} for name, (url, _) in assets.items()},
        'dependencies': {name: importlib.metadata.version(name) for name in ('numpy', 'onnxruntime', 'tokenizers')},
        'provider': session.get_providers(), 'threads': {'intra': 2, 'inter': 1},
        'sessionLoadSeconds': load_seconds, 'inferenceSeconds': timings, 'tokenCounts': tokens,
        'norms': norms, 'finite': True, 'repeatabilityMaxAbsDifference': max_difference,
        'longSyntheticInputTruncatedTo256': True,
        'tinyFrenchSimilarity': {'related': scores[0], 'unrelated': scores[1]},
        'peakProcessWorkingSetBytes': peak_working_set(),
        'databaseAccess': False, 'privateCorpusRead': False, 'paidProviderCalls': 0,
        'limits': 'Five synthetic inputs, including truncation at 256 tokens; no recall, abstention, concurrent load or real corpus qualification. Quantized conversion; max256 truncates longer inputs. Not an operational RAG.'
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: report[k] for k in ('dimension', 'sessionLoadSeconds', 'inferenceSeconds', 'peakProcessWorkingSetBytes', 'tinyFrenchSimilarity')}))


if __name__ == '__main__':
    main()
