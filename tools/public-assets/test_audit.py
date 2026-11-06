import importlib.util
from pathlib import Path
import unittest
import subprocess
import tempfile
import json

spec = importlib.util.spec_from_file_location('asset_audit', Path(__file__).with_name('audit.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ReferencesTest(unittest.TestCase):
    def test_application_alias_and_query(self):
        self.assertEqual(module.references('import x from "@/public/design_assets/e/entrance.js?v=2#x";', 'gym-next/components/a.tsx'),
                         [(1, 'e/entrance.js', 'exact')])

    def test_template_is_not_unused_proof(self):
        self.assertEqual(module.references('src={`/design_assets/people/${id}-640.webp`}', 'gym-next/app/a.tsx'),
                         [(1, 'people/', 'prefix')])

    def test_relative_public_resources_and_encoded_names(self):
        self.assertEqual(module.references('<img src="../images/a%20b.webp?x=1">', module.PUBLIC + 'preview/index.html'),
                         [(1, 'images/a b.webp', 'exact')])

    def test_external_and_data_ignored(self):
        self.assertEqual(module.references('<img src="https://example.org/a.png"><img src="data:image/png,x">', module.PUBLIC + 'p/index.html'), [])

    def test_root_replacement_not_all_files_reachable(self):
        self.assertEqual(module.references('replace("../design_assets/", "/design_assets/")', 'gym-next/app/page.tsx'),
                         [(1, '', 'unresolved-root')])

    def test_parent_traversal_unresolved(self):
        self.assertEqual(module.references('"/design_assets/../../private.png"', 'gym-next/app/page.tsx'), [(1, '', 'unresolved-root')])

    def test_document_markdown_and_categories(self):
        self.assertEqual(module.references('[demo](../gym-next/public/design_assets/p/index.html)', 'docs/a.md'),
                         [(1, 'p/index.html', 'exact')])
        self.assertEqual(module.category('docs/a.md'), 'documentation')
        self.assertEqual(module.category(module.PUBLIC + 'p/index.html'), 'public-text')

    def test_inventory_is_read_only_conservative_and_reproducible(self):
        with tempfile.TemporaryDirectory(prefix='gym-assets-audit-') as directory:
            root = Path(directory)
            subprocess.run(['git', 'init', '-q', str(root)], check=True)
            files = {
                module.PUBLIC + 'equipment/entrance.js': 'export const x=1;',
                module.PUBLIC + 'equipment/a.webp': 'fake-image',
                module.PUBLIC + 'equipment/apercu.html': '<img src="a.webp">',
                module.PUBLIC + 'old/index.html': '<h1>Preview</h1>',
                'gym-next/components/a.tsx': 'import x from "@/public/design_assets/equipment/entrance.js"; const x=`/design_assets/equipment/${id}.webp`;',
                'docs/a.md': '[preview](../gym-next/public/design_assets/old/index.html)',
                'delivery-private/private.md': 'DO NOT READ',
                '.env': 'DO NOT READ',
                'docs/assets/public-assets-2026-11-06/inventory.json': '"/design_assets/old/index.html"',
            }
            for name, body in files.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(body, encoding='utf8')
            subprocess.run(['git', 'add', '--all'], cwd=root, check=True)
            before = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
            result = module.audit(root)
            self.assertEqual(result, module.audit(root))
            after = {p.relative_to(root): p.read_bytes() for p in root.rglob('*') if p.is_file() and '.git' not in p.parts}
            self.assertEqual(before, after)
            self.assertFalse(any('private' in p or p == '.env' for p in result['scannedFiles']))
            self.assertNotIn('docs/assets/public-assets-2026-11-06/inventory.json', result['scannedFiles'])
            by_path = {a['path']: a for a in result['assets']}
            self.assertEqual(by_path['equipment/entrance.js']['disposition'], 'retain-application-reference')
            self.assertEqual(by_path['equipment/apercu.html']['disposition'], 'retain-application-prefix')
            self.assertEqual(by_path['old/index.html']['disposition'], 'review-prototype-entry')


if __name__ == '__main__':
    unittest.main()
