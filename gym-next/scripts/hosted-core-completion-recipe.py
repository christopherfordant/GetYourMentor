"""Real-clock acceptance on the isolated demo; no real payment or external message."""
import datetime, json, os, sys, time, urllib.error, urllib.request, uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://getyourmentor-demo-20261014.netlify.app"
SITE = "86e0379e-4d1a-4cf0-936c-1439397354f4"
OUT = ROOT / "docs/assets/persistence-reviews-2026-10-17"
OUT.mkdir(parents=True, exist_ok=True)
MANIFEST = OUT / "hosted-recipe.json"
state = {"baseURL": BASE, "checks": [], "created": {}, "phase": "started"}

def save(): MANIFEST.write_text(json.dumps(state, indent=2)+"\n", encoding="utf-8")
def check(name, condition=True):
    assert condition, name
    if name not in state["checks"]: state["checks"].append(name)
    save(); print("PASS", name, flush=True)

def call(method, path, cookie="", body=None, expected=200, multipart=False):
    headers = {"Cookie": cookie}
    if multipart:
        boundary = "gym-" + uuid.uuid4().hex
        headers["Content-Type"] = "multipart/form-data; boundary=" + boundary
        data = ("".join(f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n' for key,value in body.items())+f"--{boundary}--\r\n").encode()
    else:
        headers["Content-Type"] = "application/json"
        data = json.dumps(body).encode() if body is not None else None
    request = urllib.request.Request(BASE+path, data=data, method=method, headers=headers)
    try: response = urllib.request.urlopen(request, timeout=60)
    except urllib.error.HTTPError as error: response = error
    raw = response.read(); cookie = response.headers.get("Set-Cookie", "").split(";")[0]
    assert response.status == expected, f"{method} {path}: {response.status}, expected {expected}"
    return json.loads(raw), cookie

def login(name):
    record = state["created"][name]
    return call("POST", "/api/auth/sign-in", body={"email": record["email"], "role": record["role"], "password": "demo-password"})[1]

def published():
    config = json.loads((Path(os.environ["APPDATA"])/"netlify/Config/config.json").read_text(encoding="utf-8"))
    user = config["users"][config["userId"]]
    token = user["auth"] if isinstance(user["auth"], str) else user["auth"]["token"]
    request = urllib.request.Request("https://api.netlify.com/api/v1/sites/"+SITE, headers={"Authorization": "Bearer "+token})
    with urllib.request.urlopen(request, timeout=45) as response: site = json.load(response)
    assert site["ssl_url"] == BASE and site["published_deploy"]["state"] == "ready"
    return site["published_deploy"]["id"]

def initial():
    assert not MANIFEST.exists(), "Existing recipe preserved; use --complete or --verify"
    health,_ = call("GET", "/api/health")
    check("isolated demo with no real integrations", health["ready"] and health["mode"] == "demo" and not any(health["checks"][key] for key in ["supabase","stripe","resend"]))
    state["baselineDeploy"] = published()
    state["sourceCommit"] = json.loads((ROOT/"gym-next/.netlify/verified-source.json").read_text())["sourceCommit"]
    marker = uuid.uuid4().hex[:10]
    cookies = {}
    for name,role in [("coach","coach"),("athlete","sportif"),("other","sportif"),("club","club")]:
        email = f"core-{name}-{marker}@example.com"
        payload,cookie = call("POST", "/api/auth/sign-up", body={"email":email,"role":role,"password":"demo-password","firstName":"Fictif"+name+marker,"lastName":"Recette","phone":"0600000000","city":"Marseille","termsAccepted":True}, expected=201)
        state["created"][name] = {"email":email,"role":role,"coachId":payload["data"].get("coachId")}; cookies[name]=cookie;save()
    admin = call("POST", "/api/auth/sign-in", body={"email":"admin@example.com","role":"admin","password":"demo-password"})[1]
    cid = state["created"]["coach"]["coachId"]
    call("PATCH", f"/api/coaches/{cid}", cookies["coach"], {"priceFrom":50,"city":"Marseille","description":"Profil exclusivement fictif de recette"})
    call("PATCH", f"/api/admin/coaches/{cid}", admin, {"verified":True})
    commission,_ = call("GET", "/api/admin/commission", admin); check("commission unchanged at 15 percent", commission["data"]["bps"]==1500)
    lead,_ = call("POST", "/api/clubs/leads", body={"clubName":"Structure fictive "+marker,"managerName":"Responsable fictif","email":state["created"]["club"]["email"].upper(),"phone":"0600000000"}, expected=201, multipart=True)
    state["created"]["leadId"] = lead["data"]["id"];save()
    call("PATCH", "/api/admin/overview", admin, {"clubLeadId":lead["data"]["id"],"status":"contacted"})
    own,_ = call("GET", "/api/clubs/me", cookies["club"]); check("club request stored and normalized", own["data"]["id"]==lead["data"]["id"] and own["data"]["status"]=="contacted")
    message,_ = call("POST", "/api/messages", cookies["athlete"], {"recipientName":cid,"body":"Question fictive de recette hebergee","requestId":uuid.uuid4().hex}, 201)
    state["created"]["messageId"] = message["data"]["id"];save()
    reply = {"replyToId":message["data"]["id"],"body":"Reponse fictive du coach","requestId":uuid.uuid4().hex}
    answer,_ = call("POST", "/api/messages", cookies["coach"], reply, 201)
    repeat,_ = call("POST", "/api/messages", cookies["coach"], reply, 201)
    state["created"]["replyId"] = answer["data"]["id"];save()
    check("coach reply is idempotent", answer["data"]["id"]==repeat["data"]["id"])
    call("POST", "/api/messages", cookies["other"], {"replyToId":message["data"]["id"],"body":"Intrusion fictive"}, 403)
    slot = (datetime.datetime.now(datetime.timezone.utc)+datetime.timedelta(seconds=120)).isoformat(timespec="milliseconds").replace("+00:00","Z")
    state["reviewAt"] = (datetime.datetime.fromisoformat(slot.replace("Z","+00:00"))+datetime.timedelta(minutes=1)).isoformat();save()
    offer,_ = call("POST", "/api/coaches/sessions", cookies["coach"], {"title":"Seance fictive courte de recette "+marker,"location":"Terrain fictif","duration":"1 minute","capacity":2,"slots":[slot]}, 201)
    state["created"]["offerId"] = offer["data"]["id"];save()
    reservation,_ = call("POST", "/api/reservations", cookies["athlete"], {"structureOfferId":offer["data"]["id"],"slots":[slot]}, 201)
    rid = reservation["data"]["id"];state["created"]["reservationId"]=rid;save()
    call("PATCH", f"/api/reservations/{rid}", cookies["coach"], {"status":"accepted"})
    call("POST", f"/api/reservations/{rid}/payment", cookies["athlete"])
    call("POST", "/api/reviews", cookies["athlete"], {"reservationId":rid,"rating":5,"comment":"Avis avant la fin refuse"}, 409)
    check("review rejected before scheduled session end")
    state["phase"]="awaiting-real-clock";save();print("Review eligible at",state["reviewAt"],flush=True)

def complete():
    assert datetime.datetime.now(datetime.timezone.utc)>=datetime.datetime.fromisoformat(state["reviewAt"]), "Scheduled session has not ended; no clock override"
    athlete=login("athlete");rid=state["created"]["reservationId"]
    own,_=call("GET","/api/reviews",athlete)
    review=next((row for row in own["data"] if row["reservationId"]==rid),None)
    if not review:
        payload,_=call("POST","/api/reviews",athlete,{"reservationId":rid,"rating":5,"comment":"Avis fictif apres la fin prevue, aucune seance reelle attestee."},201);review=payload["data"]
    state["created"]["reviewId"]=review["id"];save()
    call("POST","/api/reviews",athlete,{"reservationId":rid,"rating":4,"comment":"Doublon refuse"},409)
    check("review accepted after real scheduled end and duplicate refused")
    verify_records()
    state["phase"]="ready-for-redeployment";save()

def verify_records():
    athlete=login("athlete");coach=login("coach");club=login("club");other=login("other")
    messages,_=call("GET","/api/messages",athlete);ids={row["id"] for row in messages["data"]}
    check("athlete retains original and coach reply",{state["created"]["messageId"],state["created"]["replyId"]}<=ids)
    foreign,_=call("GET","/api/messages",other);check("foreign account sees no conversation",not any(row["id"] in ids for row in foreign["data"]))
    inbox,_=call("GET","/api/messages",coach);check("coach retains authored reply",any(row["id"]==state["created"]["replyId"] and row["authorRole"]=="coach" for row in inbox["data"]))
    lead,_=call("GET","/api/clubs/me",club);check("club retains request status",lead["data"]["id"]==state["created"]["leadId"] and lead["data"]["status"]=="contacted")
    cid=state["created"]["coach"]["coachId"]
    public,_=call("GET",f"/api/reviews?coachId={cid}");review=next(row for row in public["data"] if row["id"]==state["created"]["reviewId"])
    check("public review excludes identities and reservation IDs",set(review)=={"id","rating","comment","createdAt"})
    profile,_=call("GET",f"/api/coaches/{cid}");check("rating calculated from recorded review",profile["data"]["rating"]==5 and profile["data"]["reviewCount"]==1)
    own,_=call("GET","/api/reviews",athlete);check("private review retained",any(row["id"]==review["id"] for row in own["data"]))

if "--complete" in sys.argv or "--verify" in sys.argv:
    state=json.loads(MANIFEST.read_text())
    if "--verify" in sys.argv:
        deployed=published();assert deployed!=state["baselineDeploy"], "A distinct redeployment is required"
        verify_records();state["verifiedDeploy"]=deployed;state["phase"]="verified-after-redeployment";save();check("records survive distinct redeployment and fresh sign-ins")
    else: complete()
else: initial()
