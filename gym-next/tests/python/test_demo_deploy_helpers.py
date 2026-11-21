import hashlib
import json
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[2] / "scripts"
sys.path.insert(0, str(SCRIPTS))
import demo_deploy_helpers as helpers  # noqa: E402


class DeployCommandTests(unittest.TestCase):
    def test_prepared_artifact_cannot_target_production(self):
        with self.assertRaisesRegex(ValueError, "isolated preview"):
            helpers.validate_deploy_mode(preview_mode=False, prepared_mode=True)

    def test_prepared_artifact_is_allowed_for_preview(self):
        helpers.validate_deploy_mode(preview_mode=True, prepared_mode=True)

    def test_preview_deploy_reuses_prepared_output_without_building(self):
        command = helpers.build_deploy_command(
            node_cli=Path("netlify-cli/bin/run.js"),
            site_id="site-id",
            context="branch:gym-demo-preview-20261117",
            source_commit="a" * 40,
            preview_alias="gym-demo-preview-20261117",
        )

        self.assertIn("--no-build", command)
        self.assertNotIn("--build", command)
        self.assertIn("--alias", command)
        self.assertEqual(command[command.index("--alias") + 1], "gym-demo-preview-20261117")
        self.assertEqual(command[command.index("--site") + 1], "site-id")

    def test_production_command_is_explicit_and_also_does_not_rebuild(self):
        command = helpers.build_deploy_command(
            node_cli=Path("netlify-cli/bin/run.js"),
            site_id="site-id",
            context="production",
            source_commit="b" * 40,
            preview_alias=None,
        )

        self.assertIn("--no-build", command)
        self.assertIn("--prod", command)
        self.assertNotIn("--alias", command)


class PreparedArtifactTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.build_id = "build-123"
        self.commit = "c" * 40
        self.sources = {"gym-next/app/demo/page.tsx": "abc123"}
        self.static_dir = self.root / ".netlify/static/_next/static"
        self.static_dir.mkdir(parents=True)
        (self.static_dir / "asset.js").write_text("ok", encoding="utf-8")
        self.build_id_path = self.root / ".next/BUILD_ID"
        self.build_id_path.parent.mkdir()
        self.build_id_path.write_text(self.build_id, encoding="utf-8")
        self.archive = self.root / ".netlify/functions/server.zip"
        self.archive.parent.mkdir(parents=True)
        with zipfile.ZipFile(self.archive, "w") as bundle:
            bundle.writestr("node_modules/next/dist/server/lib/start-server.js", "runtime")
        self.manifest = self.root / ".netlify/verified-source.json"
        self.write_manifest()

    def tearDown(self):
        self.temp.cleanup()

    def write_manifest(self, **overrides):
        data = {
            "sourceCommit": self.commit,
            "sources": self.sources,
            "archiveSHA256": hashlib.sha256(self.archive.read_bytes()).hexdigest(),
            "staticSHA256": helpers.hash_directory(self.static_dir),
            "buildId": self.build_id,
        }
        data.update(overrides)
        self.manifest.write_text(json.dumps(data), encoding="utf-8")

    def test_accepts_exact_prepared_source_build_and_runtime_archive(self):
        proof = helpers.verify_prepared_artifact(
            manifest_path=self.manifest,
            source_commit=self.commit,
            sources=self.sources,
            build_id_path=self.build_id_path,
            archive_path=self.archive,
            static_dir=self.static_dir,
        )

        self.assertEqual(proof["buildId"], self.build_id)

    def test_rejects_stale_source_commit(self):
        with self.assertRaisesRegex(ValueError, "source commit"):
            helpers.verify_prepared_artifact(
                self.manifest, "d" * 40, self.sources,
                self.build_id_path, self.archive, self.static_dir,
            )

    def test_rejects_changed_source_hashes(self):
        with self.assertRaisesRegex(ValueError, "source hashes"):
            helpers.verify_prepared_artifact(
                self.manifest, self.commit, {"gym-next/app/demo/page.tsx": "changed"},
                self.build_id_path, self.archive, self.static_dir,
            )

    def test_rejects_changed_archive_even_when_manifest_exists(self):
        with zipfile.ZipFile(self.archive, "w") as bundle:
            bundle.writestr("node_modules/next/dist/server/lib/start-server.js", "changed")

        with self.assertRaisesRegex(ValueError, "archive SHA-256"):
            helpers.verify_prepared_artifact(
                self.manifest, self.commit, self.sources,
                self.build_id_path, self.archive, self.static_dir,
            )

    def test_rejects_build_id_mismatch(self):
        self.build_id_path.write_text("other-build", encoding="utf-8")

        with self.assertRaisesRegex(ValueError, "build ID"):
            helpers.verify_prepared_artifact(
                self.manifest, self.commit, self.sources,
                self.build_id_path, self.archive, self.static_dir,
            )

    def test_rejects_changed_static_bundle(self):
        (self.static_dir / "asset.js").write_text("changed", encoding="utf-8")

        with self.assertRaisesRegex(ValueError, "static SHA-256"):
            helpers.verify_prepared_artifact(
                self.manifest, self.commit, self.sources,
                self.build_id_path, self.archive, self.static_dir,
            )


if __name__ == "__main__":
    unittest.main()
