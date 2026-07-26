from __future__ import annotations

import hashlib
import json
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "governance" / "fil_rouge_manifest.json"


def load_manifest() -> dict:
    return json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def sha1_of_file(path: Path) -> str:
    digest = hashlib.sha1()
    with path.open("rb") as handle:
        while True:
            chunk = handle.read(65536)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def iter_watched_files(manifest: dict) -> list[Path]:
    watched: list[Path] = []
    extensions = {ext.lower() for ext in manifest.get("watch_extensions", [])}
    for rel in manifest.get("sensitive_paths", []):
        base = ROOT / rel
        if not base.exists():
            continue
        if base.is_file():
            if base.suffix.lower() in extensions:
                watched.append(base)
            continue
        for path in base.rglob("*"):
            if path.is_file() and path.suffix.lower() in extensions:
                watched.append(path)
    return sorted(set(watched))


def build_state(manifest: dict) -> dict:
    files = {}
    for path in iter_watched_files(manifest):
        rel = path.relative_to(ROOT).as_posix()
        stat = path.stat()
        files[rel] = {
            "sha1": sha1_of_file(path),
            "mtime": int(stat.st_mtime),
            "size": stat.st_size,
        }
    return {
        "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "files": files,
    }


def load_previous_state(manifest: dict) -> dict:
    state_path = ROOT / manifest["state_path"]
    if not state_path.exists():
        return {"files": {}}
    try:
        return json.loads(state_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {"files": {}}


def save_state(manifest: dict, state: dict) -> None:
    state_path = ROOT / manifest["state_path"]
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def diff_states(previous: dict, current: dict) -> dict[str, list[str]]:
    previous_files = previous.get("files", {})
    current_files = current.get("files", {})

    added = sorted(set(current_files) - set(previous_files))
    removed = sorted(set(previous_files) - set(current_files))
    changed = sorted(
        rel
        for rel in set(current_files).intersection(previous_files)
        if current_files[rel]["sha1"] != previous_files[rel]["sha1"]
    )

    return {
        "added": added,
        "removed": removed,
        "changed": changed,
    }


def check_required_files(manifest: dict, ok_items: list[str], issues: list[str]) -> None:
    for rel in manifest["required_files"]:
        path = ROOT / rel
        if path.exists():
            ok_items.append(f"- OK fichier present : `{rel}`")
        else:
            issues.append(f"- MANQUANT : `{rel}`")


def check_priority_sources(manifest: dict, ok_items: list[str], issues: list[str]) -> None:
    for rel in manifest.get("source_priority", []) + manifest.get("source_socle", []):
        path = ROOT / rel
        if path.exists():
            ok_items.append(f"- OK source referencee : `{rel}`")
        else:
            issues.append(f"- SOURCE INTROUVABLE : `{rel}`")


def check_required_terms(manifest: dict, issues: list[str]) -> None:
    for rel in manifest.get("role_files", []) + manifest.get("user_story_files", []):
        path = ROOT / rel
        if not path.exists():
            continue
        content = read_text(path).lower()
        for term in manifest.get("required_terms", []):
            if term.lower() not in content:
                issues.append(f"- TERME ABSENT dans `{rel}` : `{term}`")


def check_mojibake(manifest: dict, issues: list[str], ok_items: list[str]) -> None:
    markers = manifest.get("mojibake_markers", [])
    flagged: list[str] = []
    for path in iter_watched_files(manifest):
        if path == MANIFEST_PATH:
            continue
        try:
            content = read_text(path)
        except OSError:
            continue
        for marker in markers:
            if marker in content:
                flagged.append(f"{path.relative_to(ROOT).as_posix()} -> `{marker}`")
                break

    if flagged:
        issues.append("- MARQUEURS DE TEXTE CORROMPU detectes :")
        issues.extend(f"  - {item}" for item in flagged[:30])
        if len(flagged) > 30:
            issues.append(f"  - ... {len(flagged) - 30} autres fichiers")
    else:
        ok_items.append("- OK aucun marqueur de texte corrompu detecte dans les zones sensibles")


def check_change_governance_sync(manifest: dict, state_diff: dict[str, list[str]], issues: list[str], ok_items: list[str]) -> None:
    changed_all = state_diff["added"] + state_diff["changed"] + state_diff["removed"]
    governance_roots = tuple(manifest.get("governance_paths", []))

    changed_governance = [rel for rel in changed_all if rel.startswith(governance_roots)]
    changed_code = [
        rel
        for rel in changed_all
        if rel.startswith("gym-next/") or rel.startswith("prototype-site/") or rel.startswith("docs/prototype-site/")
    ]

    if changed_code and not changed_governance:
        issues.append(
            "- CODE SENSIBLE MODIFIE sans mise a jour de gouvernance detectee. "
            "Verifier README, user stories, matrice de tracabilite ou fil rouge."
        )
    elif changed_code and changed_governance:
        ok_items.append("- OK modifications code sensibles accompagnees de mises a jour de gouvernance")
    else:
        ok_items.append("- OK aucune modification code sensible non reliee a la gouvernance sur ce cycle")


def build_report(manifest: dict, state_diff: dict[str, list[str]]) -> tuple[bool, str]:
    issues: list[str] = []
    ok_items: list[str] = []

    check_required_files(manifest, ok_items, issues)
    check_priority_sources(manifest, ok_items, issues)
    check_required_terms(manifest, issues)
    check_mojibake(manifest, issues, ok_items)
    check_change_governance_sync(manifest, state_diff, issues, ok_items)

    report_lines = [
        "# Rapport de supervision Fil Rouge GYM",
        "",
        f"- Date d'execution : {time.strftime('%Y-%m-%d %H:%M:%S')}",
        f"- Racine : `{ROOT}`",
        "",
        "## Resultat",
        "",
    ]

    report_lines.append("STATUT : ALERTE" if issues else "STATUT : CONFORME")

    report_lines.extend(["", "## Fichiers verifies", ""])
    report_lines.extend(ok_items or ["- Aucun fichier verifie"])

    report_lines.extend(["", "## Changements detectes depuis le dernier passage", ""])
    if state_diff["added"] or state_diff["changed"] or state_diff["removed"]:
        if state_diff["added"]:
            report_lines.append("- Ajoutes :")
            report_lines.extend(f"  - `{rel}`" for rel in state_diff["added"][:40])
        if state_diff["changed"]:
            report_lines.append("- Modifies :")
            report_lines.extend(f"  - `{rel}`" for rel in state_diff["changed"][:40])
        if state_diff["removed"]:
            report_lines.append("- Supprimes :")
            report_lines.extend(f"  - `{rel}`" for rel in state_diff["removed"][:40])
    else:
        report_lines.append("- Aucun changement sensible detecte")

    report_lines.extend(["", "## Alertes", ""])
    report_lines.extend(issues or ["- Aucune alerte"])

    return (len(issues) == 0, "\n".join(report_lines) + "\n")


def main() -> int:
    manifest = load_manifest()
    previous_state = load_previous_state(manifest)
    current_state = build_state(manifest)
    state_diff = diff_states(previous_state, current_state)
    is_ok, report = build_report(manifest, state_diff)

    report_path = ROOT / manifest["report_path"]
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(report, encoding="utf-8")
    save_state(manifest, current_state)
    print(report)
    return 0 if is_ok else 2


if __name__ == "__main__":
    raise SystemExit(main())
