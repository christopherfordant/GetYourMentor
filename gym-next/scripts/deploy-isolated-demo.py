"""Build, verify runtime packaging, then deploy ONLY the existing isolated demo."""
import hashlib, io, json, os, re, shutil, subprocess, sys, tarfile, tempfile, urllib.request, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SITE="86e0379e-4d1a-4cf0-936c-1439397354f4"
URL="https://getyourmentor-demo-20261014.netlify.app"
PREVIEW_ALIAS="gym-demo-preview-20261117"
PREVIEW_URL=f"https://{PREVIEW_ALIAS}--getyourmentor-demo-20261014.netlify.app"
preview_mode="--preview" in sys.argv
deploy_context="deploy-preview" if preview_mode else "production"
deploy_url=PREVIEW_URL if preview_mode else URL
source_commit=os.environ.get("GYM_DEMO_SOURCE_COMMIT") or subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
assert re.fullmatch(r"[0-9a-f]{40}",source_commit), "A full source commit is required"
with tarfile.open(fileobj=io.BytesIO(subprocess.check_output(["git","archive",source_commit,"gym-next"],cwd=ROOT)),mode="r:") as snapshot:
    assert not any(member.issym() or member.islnk() for member in snapshot.getmembers()), "Unreviewed source symlinks: abort"
    expected_files={member.name:snapshot.extractfile(member).read() for member in snapshot.getmembers() if member.isfile()}
def source_hashes():
    paths=sorted(expected_files)
    extras=subprocess.check_output(["git","ls-files","--others","--exclude-standard","gym-next/app","gym-next/components","gym-next/lib","gym-next/public"],cwd=ROOT,text=True).splitlines()
    assert not set(extras)-set(paths), "Unreviewed application files: abort"
    hashes={}
    text_extensions={".ts",".tsx",".mts",".cts",".js",".jsx",".mjs",".cjs",".json",".css",".md",".html",".svg",".txt",".toml",".yml",".yaml",".py",".example",""}
    for path in paths:
        actual=(ROOT/path).read_bytes()
        expected=expected_files[path]
        if Path(path).suffix in text_extensions: actual=actual.replace(b"\r\n",b"\n");expected=expected.replace(b"\r\n",b"\n")
        assert actual==expected, "Source differs from reviewed commit: "+path
        hashes[path]=hashlib.sha256(actual).hexdigest()
    return hashes
verified_sources=source_hashes()
assert not any(path.is_file() and not path.name.endswith(".example") for folder in [ROOT,ROOT/"gym-next"] for path in folder.glob(".env*")), "Unreviewed local environment file: abort"
config=json.loads((Path(os.environ["APPDATA"])/"netlify/Config/config.json").read_text(encoding="utf-8"))
user=config["users"][config["userId"]]
token=user["auth"] if isinstance(user["auth"],str) else user["auth"]["token"]
def get(path):
    with urllib.request.urlopen(urllib.request.Request("https://api.netlify.com/api/v1/"+path,headers={"Authorization":"Bearer "+token}),timeout=45) as response: return json.load(response)
site=get("sites/"+SITE)
assert site["id"]==SITE and site["ssl_url"]==URL and site["name"]=="getyourmentor-demo-20261014", "Wrong site: abort"
assert not any((site.get("build_settings") or {}).get("env",{}).get(k) for k in ["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","STRIPE_SECRET_KEY","RESEND_API_KEY"]), "Unexpected legacy service configuration"
variables=get("accounts/"+site["account_id"]+"/env?site_id="+SITE)
allowed={"DEPLOY_ENV","GETYOURMENTOR_ALLOW_DEMO","PAYMENT_PROVIDER","NEXT_PUBLIC_APP_URL","SESSION_SECRET","PLATFORM_COMMISSION_BPS",
         "GYM_DEMO_SESSION_ENABLED","GYM_DEMO_SUPABASE_URL","GYM_DEMO_SUPABASE_PUBLISHABLE_KEY","GYM_DEMO_SUPABASE_SECRET_KEY",
         "GYM_DEMO_SESSION_SECRET","GYM_DEMO_PURGE_SECRET"}
assert {item["key"] for item in variables}==allowed, "Unexpected environment: abort"
secret_names={"GYM_DEMO_SUPABASE_SECRET_KEY","GYM_DEMO_SESSION_SECRET","GYM_DEMO_PURGE_SECRET"}
env=dict(os.environ)
for key in list(env):
    if key.startswith(("SUPABASE_","NEXT_PUBLIC_SUPABASE_","GYM_DEMO_","STRIPE_","RESEND_","LEGAL_")) or key in ["OPENAI_API_KEY","ANTHROPIC_API_KEY","GEMINI_API_KEY","GETYOURMENTOR_ACCEPTANCE_MODE"]: env.pop(key,None)
for item in variables:
    specific=[v for v in item["values"] if v.get("context")==deploy_context]
    shared=[v for v in item["values"] if v.get("context")=="all"]
    values=specific or shared
    assert values, "Missing demo environment variable"
    if preview_mode and item["key"].startswith("GYM_DEMO_"):
        assert specific, "Demo configuration must be scoped to Deploy Previews"
    if item["key"] in secret_names:
        # Netlify intentionally withholds secret values from its API. The authenticated
        # CLI build/runtime fetches them from the project; never copy them into this process.
        continue
    assert values[0].get("value"), "Missing non-secret demo environment variable"
    env[item["key"]]=values[0]["value"]
assert env["DEPLOY_ENV"]=="demo" and env["GETYOURMENTOR_ALLOW_DEMO"]=="true" and env["PAYMENT_PROVIDER"]=="local" and env["NEXT_PUBLIC_APP_URL"]==deploy_url
assert len(env["SESSION_SECRET"])>=32 and env["PLATFORM_COMMISSION_BPS"]=="1500"
assert env["GYM_DEMO_SESSION_ENABLED"]=="true" and env["GYM_DEMO_SUPABASE_URL"]=="https://rqxoovriacgoriimpbwi.supabase.co"
assert env["GYM_DEMO_SUPABASE_PUBLISHABLE_KEY"].startswith("sb_publishable_")
env.update({"SITE_ID":SITE,"NETLIFY_SITE_ID":SITE,"NETLIFY_AUTH_TOKEN":token,"NETLIFY_TELEMETRY_DISABLED":"1","CONTEXT":deploy_context,"DEPLOY_PRIME_URL":deploy_url})
cli=Path(os.environ.get("GYM_NETLIFY_CLI",Path(os.environ["LOCALAPPDATA"])/"npm-cache/_npx/da5c1b6ea715e8b4/node_modules/netlify-cli/bin/run.js"))
assert cli.is_file(), "Existing Netlify CLI not found; no automatic installation"
app=ROOT/"gym-next";temporary=app/"netlify.toml"
assert not temporary.exists(), "Refuse to overwrite application configuration"
base='[build]\nbase = "'+app.as_posix()+'"\ncommand = "npm run build"\npublish = "'+(app/".next").as_posix()+'"\n[build.environment]\nNODE_VERSION = "22"\n[[plugins]]\npackage = "@netlify/plugin-nextjs"\n'
runtime_plugin=None
temporary.write_text(base,encoding="utf-8")
try:
    if "--prepared" not in sys.argv:
        subprocess.run(["node",str(cli),"build","--context",deploy_context],cwd=app,env=env,check=True)
        subprocess.run(["node",str(app/"scripts/check-client-secret-boundary.mjs")],cwd=app,env=env,check=True)
        subprocess.run([sys.executable,str(app/"scripts/prepare-netlify-runtime.py")],cwd=ROOT,check=True)
    archive=app/".netlify/functions/___netlify-server-handler.zip"
    with zipfile.ZipFile(archive) as bundle:
        assert "node_modules/next/dist/server/lib/start-server.js" in bundle.namelist(), "Missing Next runtime: publication blocked"
        assert sum(i.file_size for i in bundle.infolist())<250*1024*1024, "Runtime package too large"
    assert (app/".netlify/static/_next/static").is_dir()
    proof={"sourceCommit":source_commit,"sources":verified_sources,"archiveSHA256":hashlib.sha256(archive.read_bytes()).hexdigest(),"buildId":(app/".next/BUILD_ID").read_text().strip()}
    assert source_hashes()==verified_sources, "Source changed during preparation: abort"
    manifest=app/".netlify/verified-source.json"
    if "--prepared" in sys.argv:
        assert manifest.is_file() and json.loads(manifest.read_text())==proof, "Prepared artifact is stale or unverified: abort"
    else: manifest.write_text(json.dumps(proof,indent=2)+"\n",encoding="utf-8")
    temporary.write_text(base+'\n[[headers]]\nfor = "/*"\n[headers.values]\nX-Robots-Tag = "noindex, nofollow"\n[[headers]]\nfor = "/_next/static/*"\n[headers.values]\nCache-Control = "public, max-age=31536000, immutable"\n[[redirects]]\nfrom = "/_next/image"\nto = "/.netlify/images?url=:url&w=:width&q=:quality"\nstatus = 200\n[redirects.query]\nurl = ":url"\nw = ":width"\nq = ":quality"\n',encoding="utf-8")
    if "--prepare-only" in sys.argv:
        print("Verified isolated-demo package prepared; no publication requested",flush=True)
        sys.exit(0)
    print("Publishing verified package to the isolated demo only",flush=True)
    # Netlify CLI requires --context to accompany a build. For a context-scoped
    # draft deploy, keep that supported path and materialize the Windows runtime
    # bundle in a final local onPostBuild plugin, after the Next adapter finishes.
    # The existing --prepared manifest still guards the source used for this build.
    runtime_plugin=Path(tempfile.mkdtemp(prefix="gym-demo-runtime-plugin-",dir=app/".netlify"))
    (runtime_plugin/"package.json").write_text(json.dumps({"name":"gym-demo-runtime-materializer","version":"1.0.0","type":"module"}),encoding="utf-8")
    runtime_plugin_entry={
        "python":sys.executable,
        "script":str(app/"scripts/prepare-netlify-runtime.py"),
        "cwd":str(ROOT),
    }
    plugin_source=(
        'import { spawnSync } from "node:child_process";\n'
        f'const config={json.dumps(runtime_plugin_entry)};\n'
        'export const onPostBuild=async()=>{\n'
        '  const result=spawnSync(config.python,[config.script],{cwd:config.cwd,stdio:"inherit",windowsHide:true});\n'
        '  if(result.error) throw result.error;\n'
        '  if(result.status!==0) throw new Error("Runtime package verification failed");\n'
        '};\n'
    )
    (runtime_plugin/"index.mjs").write_text(plugin_source,encoding="utf-8")
    plugin_config=base+f'[[plugins]]\npackage = "{runtime_plugin.relative_to(app).as_posix()}"\n'
    temporary.write_text(plugin_config,encoding="utf-8")
    command=["node",str(cli),"deploy","--site",SITE,"--context",deploy_context,"--build","--dir",str(app/".netlify/static"),"--functions",str(app/".netlify/functions"),"--message","GetYourMentor isolated demo: verified source "+source_commit]
    if preview_mode: command.extend(["--alias",PREVIEW_ALIAS])
    else: command.append("--prod")
    subprocess.run(command,cwd=app,env=env,check=True)
    assert source_hashes()==verified_sources, "Source changed during publication"
    with zipfile.ZipFile(archive) as bundle:
        assert "node_modules/next/dist/server/lib/start-server.js" in bundle.namelist(), "Published runtime package lost the Next server"
finally:
    temporary.unlink()
    if runtime_plugin is not None: shutil.rmtree(runtime_plugin)
