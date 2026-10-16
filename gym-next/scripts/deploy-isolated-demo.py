"""Build, verify runtime packaging, then deploy ONLY the existing isolated demo."""
import json, os, subprocess, sys, urllib.request, zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SITE="86e0379e-4d1a-4cf0-936c-1439397354f4"
URL="https://getyourmentor-demo-20261014.netlify.app"
config=json.loads((Path(os.environ["APPDATA"])/"netlify/Config/config.json").read_text(encoding="utf-8"))
user=config["users"][config["userId"]]
token=user["auth"] if isinstance(user["auth"],str) else user["auth"]["token"]
def get(path):
    with urllib.request.urlopen(urllib.request.Request("https://api.netlify.com/api/v1/"+path,headers={"Authorization":"Bearer "+token}),timeout=45) as response: return json.load(response)
site=get("sites/"+SITE)
assert site["id"]==SITE and site["ssl_url"]==URL and site["name"]=="getyourmentor-demo-20261014", "Wrong site: abort"
assert not any((site.get("build_settings") or {}).get("env",{}).get(k) for k in ["SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","STRIPE_SECRET_KEY","RESEND_API_KEY"]), "Unexpected legacy service configuration"
variables=get("accounts/"+site["account_id"]+"/env?site_id="+SITE)
allowed={"DEPLOY_ENV","GETYOURMENTOR_ALLOW_DEMO","PAYMENT_PROVIDER","NEXT_PUBLIC_APP_URL","SESSION_SECRET","PLATFORM_COMMISSION_BPS"}
assert {item["key"] for item in variables}==allowed, "Unexpected environment: abort"
env=dict(os.environ)
for key in ["SUPABASE_URL","NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","SUPABASE_ANON_KEY","STRIPE_SECRET_KEY","STRIPE_WEBHOOK_SECRET","RESEND_API_KEY"]: env.pop(key,None)
for item in variables:
    values=[v for v in item["values"] if v.get("context") in ("all","production")]
    assert values and values[0].get("value"), "Missing demo environment variable"
    env[item["key"]]=values[0]["value"]
assert env["DEPLOY_ENV"]=="demo" and env["GETYOURMENTOR_ALLOW_DEMO"]=="true" and env["PAYMENT_PROVIDER"]=="local" and env["NEXT_PUBLIC_APP_URL"]==URL
assert len(env["SESSION_SECRET"])>=32 and env["PLATFORM_COMMISSION_BPS"]=="1500"
env.update({"SITE_ID":SITE,"NETLIFY_SITE_ID":SITE,"NETLIFY_AUTH_TOKEN":token,"NETLIFY_TELEMETRY_DISABLED":"1"})
cli=Path(os.environ["LOCALAPPDATA"])/"npm-cache/_npx/da5c1b6ea715e8b4/node_modules/netlify-cli/bin/run.js"
assert cli.is_file(), "Existing Netlify CLI not found; no automatic installation"
app=ROOT/"gym-next";temporary=app/"netlify.toml"
assert not temporary.exists(), "Refuse to overwrite application configuration"
base='[build]\nbase = "'+app.as_posix()+'"\ncommand = "npm run build"\npublish = "'+(app/".next").as_posix()+'"\n[build.environment]\nNODE_VERSION = "22"\n[[plugins]]\npackage = "@netlify/plugin-nextjs"\n'
temporary.write_text(base,encoding="utf-8")
try:
    if "--prepared" not in sys.argv:
        subprocess.run(["node",str(cli),"build","--context","production"],cwd=app,env=env,check=True)
        subprocess.run([sys.executable,str(app/"scripts/prepare-netlify-runtime.py")],cwd=ROOT,check=True)
    archive=app/".netlify/functions/___netlify-server-handler.zip"
    with zipfile.ZipFile(archive) as bundle:
        assert "node_modules/next/dist/server/lib/start-server.js" in bundle.namelist(), "Missing Next runtime: publication blocked"
        assert sum(i.file_size for i in bundle.infolist())<250*1024*1024, "Runtime package too large"
    assert (app/".netlify/static/_next/static").is_dir()
    temporary.write_text(base+'\n[[headers]]\nfor = "/*"\n[headers.values]\nX-Robots-Tag = "noindex, nofollow"\n[[headers]]\nfor = "/_next/static/*"\n[headers.values]\nCache-Control = "public, max-age=31536000, immutable"\n[[redirects]]\nfrom = "/_next/image"\nto = "/.netlify/images?url=:url&w=:width&q=:quality"\nstatus = 200\n[redirects.query]\nurl = ":url"\nw = ":width"\nq = ":quality"\n',encoding="utf-8")
    print("Publishing verified package to the isolated demo only",flush=True)
    subprocess.run(["node",str(cli),"deploy","--site",SITE,"--prod","--no-build","--dir",str(app/".netlify/static"),"--message","GetYourMentor isolated demo: source 46f3450 + storage health / demo robots; verified runtime package"],cwd=app,env=env,check=True)
finally:
    temporary.unlink()
