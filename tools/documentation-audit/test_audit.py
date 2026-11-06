import importlib.util
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('documentation_audit', Path(__file__).with_name('audit.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class AuditTest(unittest.TestCase):
    def test_historical_tabs_point_to_current_authority(self):
        self.assertEqual(module.classify('governance/ai/ARCHITECTURE_IA_RAG_GYM.md'),
                         ('historique-confirme', 'docs/architecture/ARCHITECTURE_MEMORY_RAG_GYM.md'))
        self.assertEqual(module.classify('governance/ai/AGENT_MISSION_EXECUTION_PROMPT.md'),
                         ('contrat-runner-historique', 'AGENTS.md'))

    def test_copy_is_not_canonical_and_unknown_not_fabricated(self):
        self.assertEqual(module.classify('project_readable/README.md')[0], 'copie-export-non-canonique')
        self.assertEqual(module.classify('docs/unknown.md')[0], 'a-qualifier-selon-lot')
        self.assertEqual(module.classify('docs/TEST_2026-11-06.md')[0], 'rapport-date-non-consigne-permanente')

    def test_nul_worktree_parser_preserves_spaces_and_detached(self):
        result = module.parse_worktrees('worktree C:/Documents/GetYourMentor\0HEAD abc\0branch refs/heads/main\0\0worktree C:/Documents/GYM copy\0HEAD def\0detached\0\0')
        self.assertEqual(len(result), 2)
        self.assertEqual(result[1]['worktree'], 'C:/Documents/GYM copy')
        self.assertTrue(result[1]['detached'])

    def test_full_audit_read_only_copies_duplicates_and_ci_on(self):
        with tempfile.TemporaryDirectory(prefix='gym-doc-audit-') as directory:
            parent = Path(directory)
            self.assertEqual(parent.resolve().parent, Path(tempfile.gettempdir()).resolve())
            self.assertTrue(parent.name.startswith('gym-doc-audit-'))
            root = parent / 'GetYourMentor'
            root.mkdir()
            subprocess.run(['git', 'init', '-q', '-b', 'design/refonte-progressive-lot1', str(root)], check=True)
            subprocess.run(['git', 'config', '--local', 'core.hooksPath', str(parent/'no-hooks')], cwd=root, check=True)
            files = {
                'AGENTS.md': 'rules', 'docs/example.md': 'same', 'project_readable/example.md': 'same',
                'docs/unknown.md': 'unknown', 'private-untracked.md': 'never read',
                '.github/workflows/manual.yml': 'name: Manual\non:\n  workflow_dispatch:\njobs:\n  qa:\n    steps:\n      - name: Test\n        run: node test.js\n',
                '.github/workflows/branch.yml': 'name: Branch\non:\n  push:\n    branches: [main]\njobs: {}\n',
                'netlify.toml': '[build]\nbase="gym-next"\ncommand="npm run build"\npublish=".next"\n[build.environment]\nPRIVATE_VALUE="never-export"\n',
            }
            for name, content in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding='utf8')
            subprocess.run(['git', 'add', 'AGENTS.md', 'docs', 'project_readable', '.github', 'netlify.toml'], cwd=root, check=True)
            subprocess.run(['git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath='+str(parent/'no-hooks'), 'commit', '-qm', 'fixture'], cwd=root, check=True)
            worktree = parent / 'GYM fixture'
            subprocess.run(['git', 'worktree', 'add', '--detach', '-q', str(worktree)], cwd=root, check=True)
            # Relevant support folder, and unrelated sensitive folder that must not be read.
            (parent / 'GetYourMentor_Checkpoints').mkdir()
            (parent / 'unrelated-private').mkdir()
            (parent / 'unrelated-private/secret.txt').write_text('not read', encoding='utf8')
            before = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
            index_before = (root / '.git/index').read_bytes()
            result = module.audit(root, inspect_siblings=True)
            self.assertEqual(result, module.audit(root, inspect_siblings=True))
            self.assertEqual(before, {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts})
            self.assertEqual(index_before, (root / '.git/index').read_bytes())
            self.assertEqual(result['documents']['count'], 4)
            self.assertEqual(result['documents']['exactDuplicateGroups'], [['docs/example.md', 'project_readable/example.md']])
            self.assertTrue(all(w['pushWouldMatchCurrentBranch'] is False for w in result['ci']['workflows']))
            self.assertIn('workflow_dispatch', result['ci']['workflows'][1]['events'])
            self.assertEqual(result['ci']['netlify']['build']['base'], 'gym-next')
            self.assertEqual(result['siblings']['countExcludingMain'], 2)
            self.assertEqual(result['siblings']['counts']['registered-worktree'], 1)
            self.assertNotIn('unrelated-private', json.dumps(result))
            self.assertNotIn('never-export', json.dumps(result))
            self.assertTrue(all('head' not in row for row in result['siblings']['records']))


if __name__ == '__main__':
    unittest.main()
