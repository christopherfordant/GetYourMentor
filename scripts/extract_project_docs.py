from __future__ import annotations

import html
import re
import sys
import zipfile
from pathlib import Path
import json
from typing import Iterable
from xml.etree import ElementTree as ET

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "project_readable"
HUB_PATH = ROOT / "visualiser-documents.html"
FOCUSED_HUB_PATH = ROOT / "visualiser-documents-design-mvp.html"

TEXT_EXTENSIONS = {
    ".md",
    ".html",
    ".css",
    ".js",
    ".py",
    ".json",
    ".sql",
    ".txt",
    ".toml",
    ".err",
    ".out",
    ".sample",
}

OFFICE_EXTENSIONS = {".docx", ".xlsx", ".pptx", ".pdf", ".xls"}
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"}

SKIP_PARTS = {
    ".git",
    "project_readable",
    ".netlify",
}

AUXILIARY_PARTS = {
    "image libre de droit sportif - Recherche Images_files",
}

FOCUSED_KEYWORDS = (
    "design",
    "maquette",
    "figma",
    "preview",
    "mvp",
    "prototype-site",
    "docs/prototype-site",
    "design_assets",
    "montage_planity",
    "parcours utilisateur",
    "responsive",
    "microcopy",
    "contenu_ecrans",
    "workflow_planity_reference",
    "document_maitre",
)

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}


def should_skip(path: Path) -> bool:
    return any(part in SKIP_PARTS for part in path.parts)


def is_auxiliary(path: Path) -> bool:
    as_posix = path.as_posix()
    return any(part in as_posix for part in AUXILIARY_PARTS)


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def normalize_text(text: str) -> str:
    text = repair_mojibake(html.unescape(text))
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def mojibake_score(text: str) -> int:
    patterns = ("Ã", "â", "�", "Â", "Ð", "¤")
    return sum(text.count(pattern) for pattern in patterns)


def repair_mojibake(text: str) -> str:
    candidates = [text]
    for encoding in ("latin-1", "cp1252"):
        try:
            candidates.append(text.encode(encoding).decode("utf-8"))
        except (UnicodeEncodeError, UnicodeDecodeError):
            pass
    candidates.sort(key=mojibake_score)
    return candidates[0]


def read_text_file(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            return normalize_text(path.read_text(encoding=encoding))
        except UnicodeDecodeError:
            continue
    data = path.read_bytes()
    return normalize_text(data.decode("latin-1", errors="replace"))


def extract_docx(path: Path) -> str:
    paragraphs: list[str] = []
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("word/document.xml")
    root = ET.fromstring(xml)
    for para in root.findall(".//w:p", NS):
        runs = []
        for text_node in para.findall(".//w:t", NS):
            runs.append(text_node.text or "")
        joined = "".join(runs).strip()
        if joined:
            paragraphs.append(joined)
    return normalize_text("\n".join(paragraphs))


def extract_shared_strings(zf: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zf.namelist():
        return []
    root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
    shared = []
    for item in root.findall(".//s:si", NS):
        parts = [node.text or "" for node in item.findall(".//s:t", NS)]
        shared.append("".join(parts))
    return shared


def extract_xlsx(path: Path) -> str:
    lines: list[str] = []
    with zipfile.ZipFile(path) as zf:
        shared = extract_shared_strings(zf)
        worksheets = sorted(
            name for name in zf.namelist() if name.startswith("xl/worksheets/sheet") and name.endswith(".xml")
        )
        for sheet_name in worksheets:
            lines.append(f"# {Path(sheet_name).stem}")
            root = ET.fromstring(zf.read(sheet_name))
            for row in root.findall(".//s:row", NS):
                values = []
                for cell in row.findall("s:c", NS):
                    cell_type = cell.get("t")
                    value_node = cell.find("s:v", NS)
                    if value_node is None:
                        inline = cell.find(".//s:t", NS)
                        if inline is not None and inline.text:
                            values.append(inline.text)
                        continue
                    value = value_node.text or ""
                    if cell_type == "s":
                        try:
                            values.append(shared[int(value)])
                        except (ValueError, IndexError):
                            values.append(value)
                    else:
                        values.append(value)
                cleaned = [v.strip() for v in values if v and v.strip()]
                if cleaned:
                    lines.append(" | ".join(cleaned))
            lines.append("")
    return normalize_text("\n".join(lines))


def extract_pptx(path: Path) -> str:
    lines: list[str] = []
    with zipfile.ZipFile(path) as zf:
        slides = sorted(
            name for name in zf.namelist() if name.startswith("ppt/slides/slide") and name.endswith(".xml")
        )
        for index, slide_name in enumerate(slides, start=1):
            lines.append(f"# Slide {index}")
            root = ET.fromstring(zf.read(slide_name))
            texts = [node.text or "" for node in root.findall(".//a:t", NS)]
            slide_text = "\n".join(piece.strip() for piece in texts if piece and piece.strip())
            if slide_text:
                lines.append(slide_text)
            lines.append("")
    return normalize_text("\n".join(lines))


def extract_pdf(path: Path) -> str:
    pages: list[str] = []
    reader = PdfReader(str(path))
    for index, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = normalize_text(text)
        if text:
            pages.append(f"# Page {index}\n{text}")
    return normalize_text("\n\n".join(pages))


def extract_document(path: Path) -> tuple[str | None, str]:
    suffix = path.suffix.lower()
    try:
        if suffix in TEXT_EXTENSIONS:
            return read_text_file(path), "ok"
        if suffix == ".docx":
            return extract_docx(path), "ok"
        if suffix == ".xlsx":
            return extract_xlsx(path), "ok"
        if suffix == ".pptx":
            return extract_pptx(path), "ok"
        if suffix == ".pdf":
            return extract_pdf(path), "ok"
        if suffix == ".xls":
            return None, "legacy_xls_not_supported"
        if suffix in IMAGE_EXTENSIONS:
            return None, "image_asset"
        return None, "binary_or_auxiliary"
    except Exception as exc:  # noqa: BLE001
        return None, f"error: {exc}"


def iter_project_files() -> Iterable[Path]:
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        if should_skip(path.relative_to(ROOT)):
            continue
        yield path


def write_preview(source: Path, content: str) -> Path:
    relative = source.relative_to(ROOT)
    output = OUTPUT_DIR / relative
    output = output.with_suffix(output.suffix + ".txt")
    ensure_parent(output)
    output.write_text(content + "\n", encoding="utf-8")
    return output


def to_href(path: Path) -> str:
    return path.as_posix()


def group_label(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in {".docx", ".xlsx", ".xls", ".pptx", ".pdf"}:
        return "Documents bureautiques"
    if suffix in {".md", ".txt", ".html", ".css", ".js", ".py", ".json", ".sql", ".toml", ".err", ".out", ".sample"}:
        return "Fichiers texte et web"
    if suffix in IMAGE_EXTENSIONS:
        return "Images et visuels"
    if is_auxiliary(path):
        return "Fichiers auxiliaires web"
    return "Autres fichiers"


def build_hub(rows: list[dict[str, str]]) -> None:
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in rows:
        grouped.setdefault(row["group"], []).append(row)

    style = """
body{font-family:Arial,sans-serif;background:#0f1115;color:#eef2f7;margin:0;padding:32px}
.wrap{max-width:1200px;margin:0 auto}
h1,h2{margin:0 0 16px}
p{color:#b7c0cc}
.card{background:#171b22;border:1px solid #2a313b;border-radius:18px;padding:20px;margin:20px 0}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:12px;border-top:1px solid #252b34;vertical-align:top}
th{color:#f5f5f3;font-weight:600;border-top:none}
a{color:#9dc6ff;text-decoration:none}
a:hover{text-decoration:underline}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#222933;color:#d7dee8;font-size:12px}
.muted{color:#95a1b1}
.thumb{width:120px;height:72px;object-fit:cover;border-radius:10px;border:1px solid #2a313b;background:#0b0d10}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
.stat{background:#11151b;border:1px solid #252b34;border-radius:14px;padding:14px}
code{background:#11151b;padding:2px 6px;border-radius:6px}
"""

    parts = [
        "<!doctype html><html lang='fr'><head><meta charset='utf-8'>",
        "<meta name='viewport' content='width=device-width, initial-scale=1'>",
        "<title>Visualiser les documents du projet</title>",
        f"<style>{style}</style></head><body><div class='wrap'>",
        "<h1>Visualiser les documents du projet</h1>",
        "<p>Cette page centralise les documents du projet avec, quand c'est possible, une version lisible en texte en plus du fichier d'origine.</p>",
    ]

    stats = [
        ("Documents avec version lisible", str(sum(1 for row in rows if row["preview"]))),
        ("Documents originaux indexés", str(len(rows))),
        ("Dossier d'extraction", "project_readable"),
    ]
    parts.append("<div class='grid'>")
    for label, value in stats:
        parts.append(f"<div class='stat'><div class='muted'>{label}</div><div>{value}</div></div>")
    parts.append("</div>")

    ordered_groups = [
        "Documents bureautiques",
        "Fichiers texte et web",
        "Images et visuels",
        "Fichiers auxiliaires web",
        "Autres fichiers",
    ]

    for group in ordered_groups:
        items = grouped.get(group, [])
        if not items:
            continue
        parts.append(f"<section class='card'><h2>{group}</h2>")
        parts.append("<table><thead><tr><th>Fichier</th><th>Type</th><th>Visualiser</th><th>Version lisible</th></tr></thead><tbody>")
        for row in items:
            preview_link = (
                f"<a href='{row['preview']}' target='_blank'>Ouvrir</a>"
                if row["preview"]
                else "<span class='muted'>Non disponible</span>"
            )
            visual = f"<a href='{row['source']}' target='_blank'>Original</a>"
            if row["is_image"] == "1":
                visual += f"<br><img class='thumb' src='{row['source']}' alt='aperçu'>"
            parts.append(
                "<tr>"
                f"<td><code>{row['label']}</code></td>"
                f"<td><span class='badge'>{row['status']}</span></td>"
                f"<td>{visual}</td>"
                f"<td>{preview_link}</td>"
                "</tr>"
            )
        parts.append("</tbody></table></section>")

    parts.append("</div></body></html>")
    HUB_PATH.write_text("".join(parts), encoding="utf-8")


def is_focused(row: dict[str, str]) -> bool:
    label = row["label"].lower()
    if is_auxiliary(Path(row["label"])):
        return False
    return any(keyword in label for keyword in FOCUSED_KEYWORDS)


def build_focused_hub(rows: list[dict[str, str]]) -> None:
    focused = [row for row in rows if is_focused(row)]
    grouped: dict[str, list[dict[str, str]]] = {}
    for row in focused:
        grouped.setdefault(row["group"], []).append(row)

    style = """
body{font-family:Arial,sans-serif;background:#0c0f14;color:#eef2f7;margin:0;padding:32px}
.wrap{max-width:1180px;margin:0 auto}
h1,h2{margin:0 0 14px}
p{color:#b7c0cc}
.intro,.card{background:#161b22;border:1px solid #28303b;border-radius:18px;padding:20px;margin:20px 0}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:12px;border-top:1px solid #242b35;vertical-align:top}
th{color:#f5f5f3;font-weight:600;border-top:none}
a{color:#9dc6ff;text-decoration:none}
a:hover{text-decoration:underline}
.badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#222933;color:#d7dee8;font-size:12px}
.thumb{width:120px;height:72px;object-fit:cover;border-radius:10px;border:1px solid #2a313b;background:#0b0d10}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
.stat{background:#10141a;border:1px solid #242b35;border-radius:14px;padding:14px}
code{background:#10141a;padding:2px 6px;border-radius:6px}
.list{margin:10px 0 0;padding-left:18px;color:#c6d0db}
"""
    parts = [
        "<!doctype html><html lang='fr'><head><meta charset='utf-8'>",
        "<meta name='viewport' content='width=device-width, initial-scale=1'>",
        "<title>Documents utiles design / MVP</title>",
        f"<style>{style}</style></head><body><div class='wrap'>",
        "<h1>Documents utiles en ce moment</h1>",
        "<p>Version filtrée du hub, centrée sur le design, le maquettage, le MVP et le prototype web actuel.</p>",
        "<section class='intro'><h2>À garder ouverts</h2>",
        "<ul class='list'>"
        "<li><code>DOCUMENT_MAITRE_GYM.md</code></li>"
        "<li><code>MVP_ECRANS_GYM.md</code></li>"
        "<li><code>DESIGN_SYSTEM_GYM.md</code></li>"
        "<li><code>FIGMA_MAQUETTE_GYM.md</code></li>"
        "<li><code>FIGMA_CONTENU_ECRANS_GYM.md</code></li>"
        "<li><code>FIGMA_MICROCOPY_TUNNEL_GYM.md</code></li>"
        "<li><code>prototype-site/</code></li>"
        "<li><code>design_assets/</code></li>"
        "</ul></section>",
    ]
    parts.append("<div class='grid'>")
    stats = [
        ("Fichiers utiles filtrés", str(len(focused))),
        ("Avec version lisible", str(sum(1 for row in focused if row["preview"]))),
        ("Images utiles", str(sum(1 for row in focused if row["is_image"] == "1"))),
    ]
    for label, value in stats:
        parts.append(f"<div class='stat'><div>{label}</div><strong>{value}</strong></div>")
    parts.append("</div>")

    ordered_groups = [
        "Documents bureautiques",
        "Fichiers texte et web",
        "Images et visuels",
        "Autres fichiers",
    ]
    for group in ordered_groups:
        items = grouped.get(group, [])
        if not items:
            continue
        parts.append(f"<section class='card'><h2>{group}</h2>")
        parts.append("<table><thead><tr><th>Fichier</th><th>Type</th><th>Original</th><th>Version lisible</th></tr></thead><tbody>")
        for row in items:
            preview_link = (
                f"<a href='{row['preview']}' target='_blank'>Ouvrir</a>"
                if row["preview"]
                else "<span style='color:#95a1b1'>Non disponible</span>"
            )
            original = f"<a href='{row['source']}' target='_blank'>Ouvrir</a>"
            if row["is_image"] == "1":
                original += f"<br><img class='thumb' src='{row['source']}' alt='aperçu'>"
            parts.append(
                "<tr>"
                f"<td><code>{row['label']}</code></td>"
                f"<td><span class='badge'>{row['status']}</span></td>"
                f"<td>{original}</td>"
                f"<td>{preview_link}</td>"
                "</tr>"
            )
        parts.append("</tbody></table></section>")
    parts.append("</div></body></html>")
    FOCUSED_HUB_PATH.write_text("".join(parts), encoding="utf-8")


def main() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    index_lines = [
        "# Lecture du projet",
        "",
        "Ce dossier contient des versions lisibles des documents du projet quand le fichier d'origine est binaire ou mal encodé.",
        "",
        "| Fichier source | Statut | Version lisible |",
        "| --- | --- | --- |",
    ]

    rows: list[dict[str, str]] = []
    for path in iter_project_files():
        relative = path.relative_to(ROOT)
        content, status = extract_document(path)
        preview_path = ""
        if content:
            preview = write_preview(path, content)
            preview_path = preview.relative_to(ROOT).as_posix()
        index_lines.append(
            f"| `{relative.as_posix()}` | `{status}` | `{preview_path}` |"
        )
        rows.append(
            {
                "label": relative.as_posix(),
                "source": to_href(relative),
                "preview": preview_path,
                "status": status,
                "group": group_label(relative),
                "is_image": "1" if relative.suffix.lower() in IMAGE_EXTENSIONS else "0",
            }
        )

    (OUTPUT_DIR / "INDEX.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
    (OUTPUT_DIR / "INDEX.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    build_hub(rows)
    build_focused_hub(rows)
    print(f"Index écrit dans {OUTPUT_DIR / 'INDEX.md'}")
    print(f"Hub écrit dans {HUB_PATH}")
    print(f"Hub filtré écrit dans {FOCUSED_HUB_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
