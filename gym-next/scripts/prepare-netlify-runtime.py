"""Materialize installed runtime dependencies: worktree junctions must not ship as Windows links."""
import json, os, shutil, zipfile
from pathlib import Path
app=Path(__file__).resolve().parents[1]
handler=app/".netlify/functions-internal/___netlify-server-handler"
source=(app/"node_modules").resolve()
target=handler/"node_modules"
assert handler.is_dir() and (source/"next/package.json").is_file()
if target.is_symlink(): target.unlink() # Link only; never deletes the source dependency directory.
assert not target.is_junction()
target.mkdir(exist_ok=True)
seen=set()
def copy_package(name, parent=None):
    nested=parent/"node_modules"/name if parent else None
    src=nested if nested and nested.exists() else source/name
    assert (src/"package.json").is_file(), "Missing installed dependency: "+name
    real=src.resolve()
    relative=src.relative_to(source) if src.is_relative_to(source) else Path(name)
    dest=target/relative
    key=str(dest)
    if key in seen: return
    seen.add(key)
    for current,dirs,files in os.walk(real):
        dirs[:]=[d for d in dirs if d != "node_modules"]
        for filename in files:
            inp=Path(current)/filename
            out=dest/inp.relative_to(real);out.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(inp,out)
    for dependency in json.loads((real/"package.json").read_text(encoding="utf-8")).get("dependencies",{}): copy_package(dependency,real)
for name in ["next","react","react-dom","@netlify/blobs"]: copy_package(name)
assert (target/"next/dist/server/lib/start-server.js").is_file()
archive=app/".netlify/functions/___netlify-server-handler.zip"
with zipfile.ZipFile(archive) as original:
    entries=[(i,original.read(i.filename)) for i in original.infolist() if i.filename != "node_modules" and not i.filename.startswith("node_modules/")]
with zipfile.ZipFile(archive,"w",zipfile.ZIP_DEFLATED) as result:
    for info,data in entries: result.writestr(info,data)
    for file in target.rglob("*"):
        if file.is_file(): result.write(file,file.relative_to(handler).as_posix())
with zipfile.ZipFile(archive) as checked: assert "node_modules/next/dist/server/lib/start-server.js" in checked.namelist()
print("Runtime packages materialized:",len(seen),"; verified ZIP bytes:",archive.stat().st_size)
