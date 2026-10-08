"""Versión vertical (TikTok / Instagram Reels) del vídeo de NEXA Process."""
import json, sys
sys.path.insert(0, '..')
LEAD, TAIL, END_HOLD = 0.35, 0.55, 2.2
g = json.load(open("guion.json"))
t = 0.0; S = {}
for i, sc in enumerate(g):
    length = LEAD + sc["dur"] + TAIL + (END_HOLD if i == len(g) - 1 else 0)
    S[sc["id"]] = {"s": round(t, 3), "d": round(length, 3), "text": sc["text"], "dur": sc["dur"], "voice": round(t + LEAD, 3)}
    t += length
TOTAL = round(t, 3)

def m(scene, phrase):
    sc = S[scene]; i = sc["text"].find(phrase); assert i >= 0, (scene, phrase)
    return round(LEAD + sc["dur"] * i / len(sc["text"]) - 0.12, 2)

# Reutiliza iconos y logo de la versión horizontal
src = open("../build.py").read()
ns = {}
exec(src[src.index("ICON = {"):src.index("def scene(")], ns)
ico, LOGO, MARK = ns["ico"], ns["LOGO"], ns["MARK"]

def scene(sid, body, cls="", last=False):
    sc = S[sid]; out = "" if last else " has-out"
    return f'<section class="scene sc-{sid} {cls}{out}" style="--s:{sc["s"]}s;--d:{sc["d"]}s"><div class="in">{body}</div></section>'

def e(t, anim="up", extra=""):
    return f'class="e {anim} {extra}" style="--t:{t}s"'

sc = []
sc.append(scene("hook", f'''<div class="bg-grid"></div><div class="blob b1"></div><div class="blob b2"></div>
<div class="vbox">
  <div {e(0.1, "pop")}><div class="clock"><svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/></svg><span class="hand"></span><span class="hand h2"></span></div></div>
  <h1><span {e(0.25, "up", "blk")}>¿Tu equipo pierde horas cada semana en</span><span {e(m("hook", "tareas"), "up", "blk g")}>tareas repetitivas?</span></h1>
</div>''', "dark"))

rows = [("mail", "Facturas", "Facturas"), ("grid", "Excels", "Excels"), ("copy", "Copiar y pegar", "copiar")]
rr = "".join(f'<div {e(m("problem", k), "left")}><div class="prow"><div class="pico">{ico(i)}</div><h3>{h}</h3><span class="lost">{ico("clock", "ico sm")} horas perdidas</span></div></div>' for i, h, k in rows)
sc.append(scene("problem", f'''<div class="vbox">
  <div class="plist">{rr}</div>
  <div {e(m("problem", "Y quien"), "pop", "payoff")}>Y quien lo paga…<br><span class="g">eres tú.</span></div>
</div>''', "light"))

sc.append(scene("brand", f'''<div class="vbox brand">
  <div class="brand-logo">{LOGO.replace("{cls}", "")}</div>
  <h2 {e(m("brand", "implantamos"))}>Implantamos <span class="g">la IA</span> en tu empresa</h2>
</div>''', "light"))

emails = [("LS", "Logística Sur S.L.", "Factura F-2026/0412", "1.240,00 €"), ("MR", "Marta Ruiz", "Re: reunión del jueves", None),
          ("EN", "Energía Norte", "Tu factura de luz", "389,50 €"), ("PM", "Papelería Mediterráneo", "Adjuntamos factura nº 8831", "2.915,75 €"),
          ("NL", "Newsletter", "10 tendencias para este año", None), ("TC", "TeleCom Empresas", "Factura mensual", "74,99 €")]
t0 = m("demo", "detecta"); t1 = m("demo", "y te las"); step = (t1 - t0 + 0.4) / len(emails)
lis = "".join(f'<li class="{"inv" if a else "oth"}" style="--t:{round(t0 + k*step, 2)}s"><span class="av">{av}</span><div><b>{w}</b><em>{sub}</em></div><span class="tag">{("Factura · " + a) if a else "Ignorado"}</span></li>' for k, (av, w, sub, a) in enumerate(emails))
tc = m("demo", "un solo clic")
sc.append(scene("demo", f'''<div class="bg-grid"></div><div class="blob b2"></div>
<div class="vbox">
  <h2 {e(0.1)}>Todas tus facturas,<br><span class="g">en un solo clic.</span></h2>
  <div {e(0.25, "up", "win")}>
    <div class="bar"><i></i><i></i><i></i><span>NEXA · Asistente de facturas</span></div>
    <div class="wbody">
      <div class="ai">{MARK}<div><strong>Analizando tu correo…</strong><small>correo@tuempresa.es</small></div></div>
      <div class="prog"><span style="--t:{t0 - 0.3}s;--len:{round(t1 - t0 + 0.8, 2)}s"></span></div>
      <ul class="mails">{lis}</ul>
      <div class="wfoot"><div><small>Facturas detectadas</small><strong class="e fade" style="--t:{tc}s">4 · 4.620,24 €</strong></div>
      <span class="dlbtn" style="--t:{tc}s">{ico("dl", "ico sm")} Descargar todas</span></div>
    </div>
  </div>
</div>''', "dark"))

sc.append(scene("stats", f'''<div class="vbox">
  <div {e(m("stats", "noventa"), "pop", "big")}><span class="cnt" style="--t:{m("stats", "noventa")}s;--to:95"></span>%</div>
  <p {e(m("stats", "menos"), "up", "bigsub")}>menos tiempo en<br><span class="g">tareas repetitivas</span></p>
  <p {e(m("stats", "menos") + 0.4, "fade", "vnote")}>* Cifra orientativa</p>
</div>''', "light"))

sc.append(scene("cta", f'''<div class="bg-grid"></div><div class="blob b1"></div><div class="blob b2"></div>
<div class="vbox cta-v">
  <div {e(0.1, "pop", "gift")}>{ico("check")} 1ª conversación gratis</div>
  <div {e(m("cta", "NEXA"), "pop")}>{LOGO.replace("{cls}", "light")}</div>
  <h2 {e(m("cta", "deja"))}>Deja que <span class="g">la IA</span><br>trabaje por ti.</h2>
  <div {e(m("cta", "deja") + 1.2, "pop")}><span class="btn">Solicita tu diagnóstico {ico("arrow", "ico sm")}</span></div>
  <p {e(m("cta", "deja") + 1.8, "fade", "where")}>Valencia y Barcelona · Presencial<br>Resto de España · En remoto</p>
</div>''', "dark", last=True))

html = open("template.html").read().replace("__SCENES__", "\n".join(sc)).replace("__TOTAL__", str(TOTAL))
open("video.html", "w").write(html)
json.dump({"total": TOTAL, "voice": {k: v["voice"] for k, v in S.items()}}, open("timing.json", "w"), indent=1)
print("total", TOTAL)
