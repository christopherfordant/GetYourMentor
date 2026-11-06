"""Conservative, offline inventory. No deletion or move decision is automated."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
from urllib.parse import unquote, urlsplit

PUBLIC = 'gym-next/public/design_assets/'
TEXT = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.html', '.md', '.json', '.toml', '.yml', '.yaml'}
QUOTED = re.compile(r'''["'`]([^"'`\r\n]+)["'`]''')
MARKER = re.compile(r'(?:gym-next/public/|@/public/|(?:\.\./)*|/)design_assets/')


def references(text, source):
    """Extract exact paths and conservative prefixes; never evaluate templates."""
    found = set()
    for line_no, line in enumerate(text.splitlines(), 1):
        tokens = [m.group(1) for m in QUOTED.finditer(line)]
        # Markdown/HTML-like unquoted paths, including repository-relative links.
        tokens += re.findall(r'(?:gym-next/public/|@/public/|/|(?:\.\./)+)design_assets/[^\s<>"\'`)]*', line)
        for token in tokens:
            marker = MARKER.search(token)
            if marker:
                value = token[marker.end():]
            elif source.startswith(PUBLIC) and not urlsplit(token).scheme and not token.startswith(('#', '/', 'data:')):
                # Only resource-shaped relative literals in public text files.
                if not re.search(r'\.(?:png|jpe?g|webp|svg|js|css|html|json)(?:[?#]|$)', token, re.I):
                    continue
                parent = PurePosixPath(source).parent
                parts = list(parent.parts)
                for part in unquote(token.split('#')[0].split('?')[0]).split('/'):
                    if part == '..':
                        if parts:
                            parts.pop()
                    elif part not in ('', '.'):
                        parts.append(part)
                path = '/'.join(parts)
                if path.startswith(PUBLIC):
                    found.add((line_no, path[len(PUBLIC):], 'exact'))
                continue
            else:
                continue
            value = unquote(value.split('#')[0].split('?')[0])
            if not value or '..' in PurePosixPath(value).parts:
                found.add((line_no, '', 'unresolved-root'))
                continue
            # Template interpolation, glob, or a root constant require manual resolution.
            dynamic = re.search(r'\$\{|[*{]', value)
            if dynamic:
                found.add((line_no, value[:dynamic.start()], 'prefix'))
            else:
                found.add((line_no, value, 'exact'))
    return sorted(found)


def category(path):
    if path.startswith(PUBLIC):
        return 'public-text'
    if path.startswith(('gym-next/app/', 'gym-next/components/', 'gym-next/lib/')):
        return 'application-source'
    if path.startswith(('docs/', 'governance/')) or path.endswith('.md'):
        return 'documentation'
    return 'tooling-or-config'


def audit(root):
    root = Path(root).resolve()
    base = root / PUBLIC
    assets, skipped = [], []
    for path in sorted(base.rglob('*')):
        if path.is_symlink() or not path.resolve().is_relative_to(base.resolve()):
            skipped.append({'path': path.relative_to(root).as_posix(), 'reason': 'symlink-or-outside'})
        elif path.is_file():
            data = path.read_bytes()
            assets.append({'path': path.relative_to(base).as_posix(), 'bytes': len(data),
                           'sha256': hashlib.sha256(data).hexdigest(), 'references': []})
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode('utf-8').split('\0')
    # Only known source/document roots. No private folders, caches, worktrees or secrets.
    candidates = {p for p in tracked if p and (
        p.startswith(('gym-next/app/', 'gym-next/components/', 'gym-next/lib/', 'gym-next/scripts/',
                      'gym-next/tests/', 'docs/', 'scripts/', '.github/workflows/'))
        or '/' not in p or p in ('gym-next/next.config.ts', 'gym-next/package.json'))}
    # Include local source drafts, without walking unrelated directories.
    for folder in ('gym-next/app', 'gym-next/components', 'gym-next/lib'):
        candidates.update(p.relative_to(root).as_posix() for p in (root / folder).rglob('*') if p.is_file())
    candidates.update(PUBLIC + a['path'] for a in assets)
    by_path = {a['path']: a for a in assets}
    refs, scanned = [], []
    for name in sorted(candidates):
        path = root / name
        # Generated audit evidence/report must not feed back into its own findings.
        if name.startswith('docs/assets/public-assets-2026-11-06/') or name == 'docs/ASSETS_PUBLICS_ARC3_2026-11-06.md':
            continue
        if path.suffix.lower() not in TEXT or not path.is_file():
            continue
        if path.is_symlink() or not path.resolve().is_relative_to(root):
            skipped.append({'path': name, 'reason': 'symlink-or-outside'})
            continue
        # Exclude state/secret-shaped files even inside a source allowlist.
        if any(part.startswith('.env') or part.lower() in ('secrets', 'coffre', 'delivery-private') for part in path.parts):
            skipped.append({'path': name, 'reason': 'private-pattern'})
            continue
        if path.stat().st_size > 2_000_000:
            skipped.append({'path': name, 'reason': 'over-2MB'})
            continue
        try:
            text = path.read_text(encoding='utf-8-sig')
        except (UnicodeError, OSError) as error:
            skipped.append({'path': name, 'reason': type(error).__name__})
            continue
        scanned.append(name)
        for line, target, kind in references(text, name):
            ref = {'source': name, 'line': line, 'category': category(name), 'target': target, 'kind': kind}
            if kind == 'exact' and target not in by_path:
                kind = ref['kind'] = 'prefix' if any(p.startswith(target.rstrip('/') + '/') for p in by_path) else 'missing-literal'
            matches = [target] if kind == 'exact' else [p for p in by_path if p.startswith(target)] if kind == 'prefix' else []
            ref['matchedAssets'] = len(matches)
            refs.append(ref)
            for match in matches:
                by_path[match]['references'].append(len(refs) - 1)
    for asset in assets:
        uses = [refs[i] for i in asset['references']]
        asset['disposition'] = ('retain-application-reference' if any(r['category'] == 'application-source' and r['kind'] == 'exact' for r in uses)
                                else 'retain-application-prefix' if any(r['category'] == 'application-source' for r in uses)
                                else 'review-prototype-entry' if asset['path'].endswith('.html')
                                else 'retain-review-required')
    return {'version': 1, 'scope': PUBLIC, 'method': 'Static conservative references, not runtime reachability',
            'limitations': ['No unused-file proof', 'Dynamic construction outside a literal prefix may be missed',
                           'Source reference does not prove reachable route', 'No remote deployed site inspected',
                           'Governance journals/state, private data, dependencies and generated builds not scanned'],
            'summary': {'assets': len(assets), 'bytes': sum(a['bytes'] for a in assets),
                        'htmlEntries': sum(a['path'].endswith('.html') for a in assets),
                        'sourceFilesRead': len(scanned), 'references': len(refs), 'skipped': len(skipped)},
            'assets': assets, 'references': refs, 'scannedFiles': scanned, 'skipped': skipped}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    print(json.dumps(audit(args.root), ensure_ascii=False, indent=2))
