"""Explicitly restricted to the isolated GetYourMentor demo; no secrets in reports."""
import os, json, urllib.request, urllib.error, datetime, time, concurrent.futures
from pathlib import Path
BASE = "https://getyourmentor-demo-20261014.netlify.app"
OUT = Path(__file__).resolve().parents[2] / "docs/assets/hosted-demo-2026-10-17"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST = OUT / "recipe.json"
state = {"date": "2026-10-17", "baseURL": BASE, "checks": [], "created": {}, "phase": "started"}
def persist(): MANIFEST.write_text(json.dumps(state, indent=2)+"\n", encoding="utf-8")
def call(method, path, cookie="", body=None, expected=200):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE+path, data=data, method=method, headers={"Content-Type":"application/json", "Cookie":cookie})
    try:
        response = urllib.request.urlopen(req, timeout=60)
    except urllib.error.HTTPError as error:
        response = error
    raw = response.read()
    try: payload = json.loads(raw)
    except Exception: payload = {"text":raw.decode(errors="replace")}
    if response.status != expected: raise AssertionError(f"{method} {path}: {response.status}, expected {expected}")
    return payload, response.headers.get("Set-Cookie", "").split(";")[0]
def check(name, ok=True):
    if not ok: raise AssertionError(name)
    state["checks"].append(name);persist();print("PASS",name,flush=True)
def login(email, role): return call("POST", "/api/auth/sign-in", body={"email":email,"role":role,"password":"demo-password"})[1]
def signup(prefix, role, marker):
    email=f"{prefix}-{marker}@example.com"
    data,cookie=call("POST","/api/auth/sign-up",body={"email":email,"role":role,"password":"demo-password","firstName":prefix+marker,"lastName":"Fictif","city":"Marseille","phone":"0600000000","termsAccepted":True},expected=201)
    state["created"][prefix]={"email":email,"role":role, "coachId":data["data"].get("coachId")};persist()
    return email,cookie,data["data"].get("coachId")
def published_demo():
    config=json.loads((Path(os.environ["APPDATA"])/"netlify/Config/config.json").read_text(encoding="utf-8"))
    user=config["users"][config["userId"]]
    token=user["auth"] if isinstance(user["auth"],str) else user["auth"]["token"]
    request=urllib.request.Request("https://api.netlify.com/api/v1/sites/86e0379e-4d1a-4cf0-936c-1439397354f4",headers={"Authorization":"Bearer "+token})
    with urllib.request.urlopen(request,timeout=45) as response: site=json.load(response)
    assert site["ssl_url"]==BASE and site["published_deploy"]["state"]=="ready"
    return site["published_deploy"]["id"]
def initial():
    state["baselineDeploy"]=published_demo()
    health,_=call("GET","/api/health");check("runtime isolated demo",health["mode"]=="demo" and health["ready"] and not any(health["checks"][k] for k in ["supabase","stripe","resend"]))
    robots,_=call("GET","/robots.txt");check("robots disallow crawling", "Disallow: /" in robots["text"])
    marker=str(int(time.time()))
    ce,coach,cid=signup("coach","coach",marker)
    se,club,_=signup("club","club",marker)
    te,second,_=signup("second","club",marker)
    ae,a,_=signup("athletea","sportif",marker)
    be,b,_=signup("athleteb","sportif",marker)
    admin=login("admin@example.com","admin")
    commission,_=call("GET","/api/admin/commission",admin);check("commission remains 15 percent",commission["data"]["bps"]==1500)
    call("PATCH",f"/api/coaches/{cid}",coach,{"priceFrom":50,"city":"Marseille","description":"Profil fictif de recette hebergee"})
    call("PATCH",f"/api/admin/coaches/{cid}",admin,{"verified":True})
    call("PATCH","/api/coaches/group-prices",coach,{"prices":[{"participantCount":2,"totalCents":10000},{"participantCount":3,"totalCents":12000}]})
    f,_=call("POST","/api/affiliations",club,{"coachId":cid});fid=f["data"]["id"]
    call("PATCH","/api/affiliations",club,{"id":fid,"action":"accept"},403)
    call("PATCH","/api/affiliations",second,{"id":fid,"action":"accept"},403)
    call("PATCH","/api/affiliations",coach,{"id":fid,"action":"accept"})
    reverse,_=call("POST","/api/affiliations",coach,{"structureEmail":te})
    call("PATCH","/api/affiliations",second,{"id":reverse["data"]["id"],"action":"accept"})
    again,_=call("POST","/api/affiliations",club,{"coachId":cid});check("bilateral consent, isolation and idempotence",again["data"]["id"]==fid)
    slot=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=120)).isoformat(timespec="milliseconds").replace("+00:00","Z")
    offer,_=call("POST","/api/coaches/sessions",coach,{"title":"Recette hebergee "+marker,"location":"Terrain fictif Marseille","duration":"60 minutes","slots":[slot],"capacity":3},201);oid=offer["data"]["id"]
    structslot=(datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(days=121)).isoformat(timespec="milliseconds").replace("+00:00","Z")
    struct,_=call("POST","/api/structures/offers",club,{"coachId":cid,"title":"Structure fictive "+marker,"duration":"1 heure","slots":[structslot],"capacity":2},201)
    state["created"].update({"affiliation":fid,"reverseAffiliation":reverse["data"]["id"],"coachOffer":oid,"structureOffer":struct["data"]["id"]});persist()
    body={"structureOfferId":oid,"slots":[slot],"participantCount":2,"additionalParticipants":[{"firstName":"Fictif","lastName":"Participant","age":25,"email":"participant@example.com"}]}
    def race(cookie):
        try: return call("POST","/api/reservations",cookie,body,201)[0]
        except AssertionError as error:
            if ": 409, expected 201" in str(error): return None
            raise
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: result=list(pool.map(race,[a,b]))
    check("concurrent two-seat claims: one success, one conflict",sum(x is not None for x in result)==1)
    winner=a if result[0] else b;loser=b if result[0] else a;reservation=next(x for x in result if x)["data"];rid=reservation["id"]
    state["created"]["reservation"]=rid;state["winner"]="athletea" if result[0] else "athleteb";persist()
    call("POST","/api/reservations",winner,body,409)
    call("GET",f"/api/reservations/{rid}",loser,expected=403)
    public,_=call("GET",f"/api/coaches/sessions?coachId={cid}");check("public capacity and privacy",next(o for o in public["data"] if o["id"]==oid)["availability"][0]["remaining"]==1 and "participant@example.com" not in json.dumps(public))
    call("POST",f"/api/reservations/{rid}/payment",winner,expected=409)
    call("PATCH",f"/api/reservations/{rid}",coach,{"status":"accepted"})
    call("PATCH","/api/coaches/group-prices",coach,{"prices":[{"participantCount":2,"totalCents":15000},{"participantCount":3,"totalCents":12000}]})
    call("POST",f"/api/reservations/{rid}/payment",winner)
    cancelled,_=call("POST",f"/api/reservations/{rid}/cancel",winner)
    check("historical refund after price change",cancelled["data"]["refundAmount"]==100 and cancelled["data"]["financials"]["grossCents"]==10000)
    repeated,_=call("POST",f"/api/reservations/{rid}/cancel",winner);check("repeat cancellation idempotent",repeated["data"]["refundAmount"]==100)
    freed,_=call("POST","/api/reservations",loser,body,201);state["created"]["replacementReservation"]=freed["data"]["id"];persist()
    call("PATCH",f"/api/reservations/{freed['data']['id']}",coach,{"status":"rejected"})
    individual,_=call("POST","/api/reservations",a,{"structureOfferId":struct["data"]["id"],"slots":[structslot]},201);state["created"]["individualReservation"]=individual["data"]["id"];persist()
    call("PATCH",f"/api/reservations/{individual['data']['id']}",coach,{"status":"rejected"})
    check("places freed after cancellation and refusal; individual structure request")
    state["phase"]="before-redeploy";persist();verify()
def verify():
    if MANIFEST.exists(): state.update(json.loads(MANIFEST.read_text(encoding="utf-8")))
    cr=state["created"];coach=login(cr["coach"]["email"],"coach");club=login(cr["club"]["email"],"club");a=login(cr[state["winner"]]["email"],"sportif");cid=cr["coach"]["coachId"]
    profile,_=call("GET",f"/api/coaches/{cid}",coach);check("fresh-session profile and tariff persistence",profile["data"]["priceFrom"]==50 and profile["data"]["groupPrices"][0]["totalCents"]==15000)
    affiliations,_=call("GET","/api/affiliations",club);check("fresh-session affiliation persistence",any(f["id"]==cr["affiliation"] and f["status"]=="accepted" for f in affiliations["data"]))
    offers,_=call("GET","/api/coaches/sessions?mine=1",coach);check("coach session persistence",any(o["id"]==cr["coachOffer"] for o in offers["data"]))
    structures,_=call("GET","/api/structures/offers?mine=1",club);check("structure session persistence",any(o["id"]==cr["structureOffer"] for o in structures["data"]))
    reservation,_=call("GET",f"/api/reservations/{cr['reservation']}",a);check("reservation status and historical amount persistence",reservation["data"]["status"]=="cancelled" and reservation["data"]["financials"]["grossCents"]==10000)
    private,_=call("GET",f"/api/reservations/{cr['reservation']}",coach)
    check("coach cannot read participant emails",all(not p.get("email") for p in private["data"].get("additionalParticipants",[])))
    summary,_=call("GET","/api/structures/reservations",club)
    check("structure cannot read private coach sessions",not any(r["id"]==cr["reservation"] for r in summary["data"]) and "participant@example.com" not in json.dumps(summary))
    admin=login("admin@example.com","admin")
    call("PATCH","/api/affiliations",admin,{"id":cr["affiliation"],"action":"accept"},401)
    othercoach=login("coach@example.com","coach")
    call("PATCH",f"/api/coaches/{cid}",othercoach,{"priceFrom":1},403)
    check("administrator cannot replace consent; foreign coach edit denied")
    if state["phase"]=="after-redeploy": check("persistence across distinct deployment and new sign-ins")
if __name__=="__main__":
    import sys
    if "--verify" in sys.argv:
        state.update(json.loads(MANIFEST.read_text(encoding="utf-8")));state["verifiedDeploy"]=published_demo();assert state["verifiedDeploy"]!=state["baselineDeploy"], "No distinct redeployment: persistence across redeploy not proven";state["phase"]="after-redeploy";persist();verify()
    else:
        if MANIFEST.exists(): raise SystemExit("Existing manifest: use --verify after redeploy, or archive the prior recipe first")
        initial()
