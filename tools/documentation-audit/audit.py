"""Local document/CI inventory and opt-in shallow sibling inspection. No mutations."""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tomllib

import yaml  # Existing local PyYAML; BaseLoader preserves the literal 'on' key.

REFERENCES = {
    'AGENTS.md': ('instructions', None),
    'BRANCH_STRATEGY_GYM.md': ('instructions-git-hierarchie', None),
    'DOCUMENT_MAITRE_GYM.md': ('reference-produit', None),
    'docs/ETAT_REPRISE_COURANT.md': ('relais-operationnel', None),
    'docs/README.md': ('index-general', None),
    'docs/REFONTE_PROGRESSIVE_2026-10-15.md': ('couverture-design', None),
    'docs/architecture/README.md': ('index-architecture', None),
    'docs/architecture/ARCHITECTURE_TARGET_GYM.md': ('cible-architecture-non-preuve-runtime', None),
    'docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md': ('canonique-memoire-rag', None),
    'docs/architecture/RAG_READINESS_GYM.md': ('criteres-rag-non-activation', None),
    'docs/architecture/AGENTIC_REFACTOR_2026-11-03.md': ('plan-et-preuve-datee-atelier', None),
    'governance/ai/ARCHITECTURE_IA_RAG_GYM.md': ('historique-confirme', 'docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md'),
    'governance/ai/AGENT_MISSION_EXECUTION_PROMPT.md': ('contrat-runner-historique', 'AGENTS.md'),
    'ARCHITECTURE_MEMOIRE_GYM.md': ('historique-confirme', 'docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md'),
    'MVP_ECRANS_GYM.md': ('contrat-selon-lot', None),
    'DESIGN_SYSTEM_GYM.md': ('contrat-selon-lot', None),
    'MIGRATION_NEXT_GYM.md': ('contrat-selon-lot', None),
    'docs/ORCHESTRATION_ENTREES_ET_GARDES_2026-11-06.md': ('preuve-active-orchestration', None),
    'docs/VALIDATION_CANDIDAT_ARC3_3_2026-11-06.md': ('preuve-active-rangement', None),
    'tools/agentic-workbench/AGENTS.md': ('instructions-atelier-local', None),
    'supabase/README.md': ('index-donnees-selon-lot', None),
    'prototypes/README.md': ('guide-apercu-local', None),
    'scripts/README.md': ('guide-entrees-encadrees', None),
}


def git(root, *args):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS='0')
    return subprocess.check_output(['git', '-C', str(root), *args], env=env, stderr=subprocess.DEVNULL).decode('utf8').strip()


def classify(name):
    if name in REFERENCES:
        return REFERENCES[name]
    if name.startswith('project_readable/'):
        return ('copie-export-non-canonique', None)
    if name.startswith(('governance/ai/CYCLE_', 'governance/ai/LOT_AUTO_')):
        return ('historique-orchestration', 'scripts/README.md')
    if '/mission_evidence/' in name or name.startswith('docs/assets/'):
        return ('preuve-a-contextualiser', None)
    if name.startswith('docs/audits/') or re.search(r'20\d{2}-\d{2}-\d{2}', name):
        return ('rapport-date-non-consigne-permanente', None)
    return ('a-qualifier-selon-lot', None)


def documents(root):
    records, hashes, omissions = [], defaultdict(list), []
    for name in sorted(git(root, 'ls-files', '-z').split('\0')):
        if not name.lower().endswith('.md'):
            continue
        # Audit outputs do not feed back into their own findings.
        if name.startswith(('docs/assets/documentation-ci-2026-11-06/', 'docs/architecture/DOCUMENTATION_CI_2026-11-06')) or name == 'docs/DOCUMENTATION_ET_DOSSIERS_ARC4_2026-11-06.md':
            continue
        path = root / name
        if not path.is_file() or path.is_symlink() or not path.resolve().is_relative_to(root.resolve()):
            omissions.append(name)
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        status, replacement = classify(name)
        records.append({'path': name, 'status': status, 'replacement': replacement, 'sha256': digest})
        hashes[digest].append(name)
    return {'scope': 'Tracked Markdown only; actual working bytes; targeted semantic review, not full semantic audit',
            'count': len(records), 'counts': dict(Counter(r['status'] for r in records)), 'records': records,
            'exactDuplicateGroups': [v for v in hashes.values() if len(v) > 1], 'omitted': omissions}


def workflows(root, branch):
    records = []
    for path in sorted((root / '.github/workflows').glob('*.y*ml')):
        data = yaml.load(path.read_text(encoding='utf-8-sig'), Loader=yaml.BaseLoader)
        events = data.get('on', {})
        if not isinstance(events, dict):
            raise ValueError('Unsupported workflow event form; review manually')
        push = events.get('push')
        branches = push.get('branches', []) if isinstance(push, dict) else []
        # Current workflows use exact branch names. Do not approximate GitHub glob rules.
        exact = all(not re.search(r'[*!?\[\]]', b) for b in branches)
        push_match = branch in branches if exact and branches else None
        if 'push' not in events:
            push_match = False
        jobs = []
        for key, job in data.get('jobs', {}).items():
            jobs.append({'id': key, 'condition': job.get('if'),
                         'steps': [{'name': step.get('name', '(unnamed)'),
                                    'uses': step.get('uses'),
                                    'commands': [line.strip() for line in step.get('run', '').splitlines()
                                                 if line.strip().startswith(('node ', 'npm ', 'npx '))]}
                                   for step in job.get('steps', [])]})
        records.append({'path': path.relative_to(root).as_posix(), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                        'name': data.get('name'), 'events': events, 'pushWouldMatchCurrentBranch': push_match, 'jobs': jobs})
    netlify_path = root / 'netlify.toml'
    netlify = tomllib.loads(netlify_path.read_text(encoding='utf-8-sig')) if netlify_path.is_file() else {}
    return {'branch': branch, 'scope': 'Local declarations only; no Actions run, remote settings or branch-protection check',
            'workflows': records, 'netlify': {'file': 'netlify.toml',
            'sha256': hashlib.sha256(netlify_path.read_bytes()).hexdigest() if netlify_path.is_file() else None,
            'build': {k: netlify.get('build', {})[k] for k in ('base', 'command', 'publish') if k in netlify.get('build', {})},
            'plugins': [p.get('package') for p in netlify.get('plugins', [])],
            'remoteGitIntegration': 'not inspected'}}


def parse_worktrees(raw):
    result, entry = [], {}
    for field in raw.split('\0'):
        if not field:
            if entry:
                result.append(entry)
                entry = {}
        else:
            key, _, value = field.partition(' ')
            entry[key] = value or True
    if entry:
        result.append(entry)
    return result


def siblings(root):
    parent = root.parent
    registered = parse_worktrees(git(root, 'worktree', 'list', '--porcelain', '-z'))
    by_path = {str(Path(e['worktree']).resolve()).casefold(): e for e in registered}
    main_common = git(root, 'rev-parse', '--path-format=absolute', '--git-common-dir')
    records = []
    for folder in sorted(parent.iterdir()):
        if not folder.is_dir() or folder == root:
            continue
        entry = by_path.get(str(folder.resolve()).casefold())
        if not (entry or folder.name.lower().startswith(('gym-', 'getyourmentor', 'jgetyourmentor'))):
            continue
        if folder.is_symlink() or str(folder.resolve()) != str(folder.absolute()):
            records.append({'name': folder.name, 'kind': 'link-not-traversed'})
            continue
        item = {'name': folder.name, 'scope': 'Top-level metadata and Git metadata only; no source or secret contents',
                'hasAppDirectory': (folder / 'gym-next').is_dir(), 'gitMarker': (folder / '.git').exists(),
                'synchronization': 'not assessed; no merge/push/deletion authorized'}
        if entry:
            item.update(kind='registered-worktree', headPresent=bool(entry.get('HEAD')), branch=entry.get('branch'),
                        detached=bool(entry.get('detached')), sharedRepository=True)
        elif item['gitMarker']:
            try:
                common = git(folder, 'rev-parse', '--path-format=absolute', '--git-common-dir')
                same = Path(common).resolve() == Path(main_common).resolve()
                item.update(kind='shared-git-checkout' if same else 'independent-git-checkout', sharedRepository=same)
            except subprocess.CalledProcessError:
                item['kind'] = 'git-marker-unresolved'
        else:
            item['kind'] = 'support-or-copy-without-git-marker'
        records.append(item)
    return {'scope': 'Immediate relevant children of Documents only; other personal/business folders excluded',
            'countExcludingMain': len(records), 'counts': dict(Counter(r['kind'] for r in records)),
            'registeredIncludingMain': len(registered), 'records': records,
            'limits': ['No recursive file/content audit of siblings', 'No worktree status or branch-history compatibility audit',
                       'Name alone does not prove backup role or redundancy', 'No stale worktree may be pushed without cleaned-history review']}


def audit(root, inspect_siblings=False):
    root = Path(root).resolve()
    branch = git(root, 'branch', '--show-current')
    result = {'version': 1, 'documents': documents(root), 'ci': workflows(root, branch)}
    if inspect_siblings:
        result['siblings'] = siblings(root)
    return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--inspect-siblings', action='store_true')
    args = parser.parse_args()
    print(json.dumps(audit(args.root, args.inspect_siblings), ensure_ascii=True, indent=2))
