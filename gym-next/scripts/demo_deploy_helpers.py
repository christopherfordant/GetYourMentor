"""Small deterministic helpers for the isolated demo deployment flow."""

import hashlib
import json
import zipfile
from pathlib import Path
from urllib.parse import urlsplit


def validate_deploy_mode(*, preview_mode: bool, prepared_mode: bool) -> None:
    if prepared_mode and not preview_mode:
        raise ValueError("Prepared artifacts are restricted to the isolated preview")


def build_netlify_config(app: Path, *, preview_url: str | None) -> str:
    app_path = app.as_posix()
    config = (
        f'[build]\nbase = "{app_path}"\ncommand = "npm run build"\n'
        f'publish = "{(app / ".next").as_posix()}"\n'
        '[build.environment]\nNODE_VERSION = "22"\n'
        '[[plugins]]\npackage = "@netlify/plugin-nextjs"\n'
    )
    if preview_url is None:
        return config
    parsed = urlsplit(preview_url)
    if parsed.scheme != "https" or parsed.netloc != "gym-demo-preview-20261117--getyourmentor-demo-20261014.netlify.app" or parsed.path or parsed.query or parsed.fragment:
        raise ValueError("Preview URL must be the exact isolated demo alias")
    return config + (
        '\n[context.branch-deploy.environment]\n'
        f'NEXT_PUBLIC_APP_URL = "{preview_url}"\n'
    )




def build_deploy_command(
    *, node_cli: Path, site_id: str, source_commit: str,
    preview_alias: str | None,
) -> list[str]:
    command = [
        "node", str(node_cli), "deploy", "--site", site_id,
        "--no-build", "--dir", ".netlify/static", "--message",
        f"GetYourMentor isolated demo: verified source {source_commit}",
    ]
    if preview_alias:
        command.extend(["--alias", preview_alias])
    else:
        command.append("--prod")
    return command


def hash_directory(directory: Path) -> str:
    if not directory.is_dir():
        raise ValueError("Prepared static output is missing")
    digest = hashlib.sha256()
    files = sorted(path for path in directory.rglob("*") if path.is_file())
    for path in files:
        digest.update(path.relative_to(directory).as_posix().encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def verify_prepared_artifact(
    manifest_path: Path,
    source_commit: str,
    sources: dict[str, str],
    build_id_path: Path,
    archive_path: Path,
    static_dir: Path,
) -> dict:
    if not manifest_path.is_file():
        raise ValueError("Prepared artifact manifest is missing")
    if not archive_path.is_file() or not static_dir.is_dir():
        raise ValueError("Prepared runtime output is incomplete")

    try:
        proof = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError("Prepared artifact manifest is invalid") from error

    if proof.get("sourceCommit") != source_commit:
        raise ValueError("Prepared artifact source commit does not match")
    if proof.get("sources") != sources:
        raise ValueError("Prepared artifact source hashes do not match")
    if not build_id_path.is_file() or proof.get("buildId") != build_id_path.read_text(encoding="utf-8").strip():
        raise ValueError("Prepared artifact build ID does not match")

    actual_sha = hashlib.sha256(archive_path.read_bytes()).hexdigest()
    if proof.get("archiveSHA256") != actual_sha:
        raise ValueError("Prepared artifact archive SHA-256 does not match")
    if proof.get("staticSHA256") != hash_directory(static_dir):
        raise ValueError("Prepared artifact static SHA-256 does not match")

    try:
        with zipfile.ZipFile(archive_path) as bundle:
            names = bundle.namelist()
            uncompressed_size = sum(info.file_size for info in bundle.infolist())
    except (OSError, zipfile.BadZipFile) as error:
        raise ValueError("Prepared runtime archive is invalid") from error
    if "node_modules/next/dist/server/lib/start-server.js" not in names:
        raise ValueError("Prepared runtime archive is missing the Next server")
    if uncompressed_size >= 250 * 1024 * 1024:
        raise ValueError("Prepared runtime archive exceeds the package limit")
    return proof
