"""Local tokenizer diagnostic; no inference, download, database or provider call.

Measures text unseen by max256 E5 and proposes offset-preserving windows.
Does not change the live corpus or establish retrieval quality.
"""
import hashlib
import json
import os
from pathlib import Path
import subprocess
from tokenizers import Tokenizer
from qualify_embeddings import REVISION, ASSET_SHA256, sha256

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/assets/rag-quality-2026-11-04'
CACHE = Path(os.environ.get('LOCALAPPDATA', Path.home() / '.cache')) / 'GetYourMentor/models/e5-small' / REVISION
TOKENIZER = CACHE / 'tokenizer.json'
if sha256(TOKENIZER) != ASSET_SHA256['tokenizer.json']:
    raise RuntimeError('Tokenizer missing or modified; no automatic download')
tok = Tokenizer.from_file(str(TOKENIZER))
tok.no_truncation()


def encode(text):
    return tok.encode('passage: ' + text)


def windows(text):
    """200 body tokens, 32 token overlap, exact character offsets, <=256 total."""
    body = tok.encode(text, add_special_tokens=False)
    result = []
    start = 0
    while start < len(body.ids):
        end = min(start + 200, len(body.ids))
        left, right = body.offsets[start][0], body.offsets[end - 1][1]
        excerpt = text[left:right]
        assert len(encode(excerpt).ids) <= 256
        result.append({'startCharacter': left, 'endCharacter': right,
                       'tokensWithPrefix': len(encode(excerpt).ids),
                       'sha256': hashlib.sha256(excerpt.encode()).hexdigest()})
        if end == len(body.ids):
            break
        start = end - 32
    return result


script = "import {loadCorpus} from './tools/agentic-workbench/retrieval.mjs';process.stdout.write(JSON.stringify(await loadCorpus(process.cwd())));"
corpus = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], cwd=ROOT))
rows = []
for c in corpus:
    full = encode(c['excerpt'])
    if len(full.ids) <= 256:
        continue
    tok.enable_truncation(max_length=256)
    clipped = encode(c['excerpt'])
    tok.no_truncation()
    # Offsets refer to prefixed Python strings; special token offsets are (0,0).
    cutoff = max(b for a, b in clipped.offsets) - len('passage: ')
    cutoff = max(0, min(cutoff, len(c['excerpt'])))
    proposed = windows(c['excerpt'])
    assert proposed[0]['startCharacter'] == 0
    assert proposed[-1]['endCharacter'] == len(c['excerpt'])
    assert all(a['endCharacter'] >= b['startCharacter'] for a, b in zip(proposed, proposed[1:]))
    rows.append({'id': c['id'], 'path': c['path'], 'documentVersion': c['version'],
                 'fullTokens': len(full.ids), 'usedTokens': len(clipped.ids),
                 'unseenCharacters': len(c['excerpt']) - cutoff,
                 'visibleEndCharacter': cutoff,
                 'unseenTailPreview': c['excerpt'][cutoff:cutoff + 180],
                 'proposedWindows': proposed})

# Separate synthetic stress, not inserted into the frozen A4.3 fixture.
stress = []
for name, tail in [('payment', 'La réservation nécessite une acceptation avant paiement.'),
                   ('access', 'Les documents privés restent interdits au public.')]:
    filler = 'Contexte de démonstration sans information décisive. ' * 100
    full_text = filler + tail
    tok.enable_truncation(max_length=256)
    truncated = encode(full_text)
    tok.no_truncation()
    boundary = max(b for a, b in truncated.offsets) - len('passage: ')
    proposed = windows(full_text)
    recovered = any(full_text[w['startCharacter']:w['endCharacter']].endswith(tail) for w in proposed)
    assert len(encode(full_text).ids) > 256 and boundary < len(filler) and recovered
    stress.append({'id': name, 'fullTokens': len(encode(full_text).ids),
                   'tailStartCharacter': len(filler), 'visibleEndCharacter': boundary,
                   'decisiveTailAbsentBefore': True, 'tailCoveredByProposedWindow': recovered,
                   'windows': len(proposed), 'textSha256': hashlib.sha256(full_text.encode()).hexdigest()})

old = json.loads((ROOT/'docs/assets/rag-comparison-2026-11-04/results.json').read_text(encoding='utf-8'))
old_ids = {r['id'] for r in old['truncations'] if r['kind'] == 'passage'}
report = {'tokenizerSha256': sha256(TOKENIZER), 'prefix': 'passage: ', 'maxTokens': 256,
          'realTruncatedCount': len(rows), 'sameIdsAsA43': {r['id'] for r in rows} == old_ids,
          'real': rows, 'stress': stress,
          'proposalOnly': True, 'embeddingInferenceExecuted': False,
          'limitations': ['Token visibility only, not measured retrieval accuracy',
                         'Windows are experimental; corpus, IDs and live citations unchanged',
                         'A43 files unchanged; stress cases are separate and author-created']}
OUT.mkdir(parents=True, exist_ok=True)
(OUT/'truncation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({k: report[k] for k in ['realTruncatedCount', 'sameIdsAsA43', 'embeddingInferenceExecuted']}))
