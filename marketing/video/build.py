"""Genera video.html con las escenas sincronizadas con la locución (guion.json)."""
import json
import re

LEAD = 0.55   # silencio antes de que hable la voz en cada escena
TAIL = 0.95   # margen tras la voz
END_HOLD = 2.6

g = json.load(open("guion.json"))
t = 0.0
S = {}
for i, sc in enumerate(g):
    length = LEAD + sc["dur"] + TAIL + (END_HOLD if i == len(g) - 1 else 0)
    S[sc["id"]] = {"s": round(t, 3), "d": round(length, 3), "text": sc["text"], "voice": round(t + LEAD, 3)}
    t += length
TOTAL = round(t, 3)


def m(scene, phrase):
    """Segundo (relativo a la escena) en que la voz empieza a decir `phrase` (aprox. por caracteres)."""
    sc = S[scene]
    i = sc["text"].find(phrase)
    assert i >= 0, (scene, phrase)
    dur = next(x["dur"] for x in g if x["id"] == scene)
    return round(LEAD + dur * i / len(sc["text"]) - 0.15, 2)


ICON = {
    "mail": '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
    "box": '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    "grid": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "link": '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h5a4 4 0 0 1 4 4v5M15 18h-5a4 4 0 0 1-4-4V9"/>',
    "chart": '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    "chat": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 11h.01M12 11h.01M15.5 11h.01"/>',
    "shield": '<path d="M12 3 4 6v6c0 5 3.4 8.3 8 9 4.6-.7 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    "pen": '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    "plug": '<path d="M9 7H7a5 5 0 0 0 0 10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8"/>',
    "lock": '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    "copy": '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "dl": '<path d="M12 4v12M6 10l6 6 6-6M4 20h16"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
}


def ico(name, cls="ico"):
    return f'<svg viewBox="0 0 24 24" class="{cls}">{ICON[name]}</svg>'


LOGO = '''<svg class="logo {cls}" viewBox="-10 -10 785 310" aria-label="NEXA Process">
  <g class="ink">
    <polygon points="0,190 0,0 48,0 124,104 124,0 170,0 170,190 122,190 46,86 46,190"/>
    <path d="M190 0h150v40H236v35h96v40h-96v35h104v40H190z"/>
    <polygon class="xnavy" points="500,0 555,0 410,190 355,190" mask="url(#gap)"/>
    <polygon points="575,190 648,0 692,0 765,190 715,190 670,72 625,190"/>
    <text x="4" y="282" font-family="Montserrat, Arial, sans-serif" font-size="66" font-weight="500" textLength="757" lengthAdjust="spacing">PROCESS</text>
  </g>
  <polygon class="xgreen" points="350,0 405,0 565,190 510,190" fill="#00A86B"/>
</svg>'''

MARK = '''<svg class="mark" viewBox="330 -20 255 230">
  <polygon class="mk-navy" points="500,0 555,0 410,190 355,190" mask="url(#gap)"/>
  <polygon class="mk-green" points="350,0 405,0 565,190 510,190" fill="#00A86B"/>
</svg>'''


def scene(sid, body, cls="", last=False):
    sc = S[sid]
    out = "" if last else " has-out"
    return f'<section class="scene sc-{sid} {cls}{out}" style="--s:{sc["s"]}s;--d:{sc["d"]}s"><div class="in">{body}</div></section>'


def e(t, anim="up", extra=""):
    return f'class="e {anim} {extra}" style="--t:{t}s"'


scenes = []

# 1. Gancho
scenes.append(scene("hook", f'''
  <div class="bg-grid"></div><div class="blob b1"></div><div class="blob b2"></div>
  <div class="hook">
    <div {e(0.15, "pop")}><div class="clock"><svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/></svg><span class="hand"></span><span class="hand h2"></span></div></div>
    <h1 {e(0.35)}>¿Cuántas horas pierde tu equipo</h1>
    <h1 {e(m("hook", "en tareas"))}><span class="g">en tareas repetitivas?</span></h1>
  </div>''', "dark"))

# 2. Problema
pains = [
    ("mail", "Facturas, correo a correo", "Abrir, descargar, renombrar, enviar…", "Descargar facturas"),
    ("grid", "Excels que nunca cuadran", "Versiones distintas y datos duplicados", "Actualizar Excels"),
    ("copy", "Copiar y pegar entre programas", "De la tienda al ERP, del correo a contabilidad", "Copiar datos"),
]
cards = "".join(f'''<div {e(m("problem", k), "left")}><div class="pcard">
  <div class="pico">{ico(i)}</div><div><h3>{h}</h3><p>{p}</p></div>
  <span class="lost">{ico("clock", "ico sm")} horas perdidas</span></div></div>''' for i, h, p, k in pains)
scenes.append(scene("problem", f'''
  <div class="prob">
    <p {e(0.1, "up", extra="kicker")}>El día a día de muchas empresas</p>
    <div class="pcards">{cards}</div>
    <div {e(m("problem", "Pequeñas"), "pop", extra="sum")}>= <strong>días enteros</strong> perdidos cada mes</div>
    <div {e(m("problem", "Y quien"), "pop", extra="payoff")}>Y quien lo paga… <span class="g">eres tú.</span></div>
  </div>''', "light"))

# 3. Marca
scenes.append(scene("brand", f'''
  <div class="brand">
    <div class="brand-logo">{LOGO.replace("{cls}", "")}</div>
    <h2 {e(m("brand", "implantamos"))}>Implantamos <span class="g">la IA</span> en tu empresa<br>para que <span class="g">trabaje por ti.</span></h2>
  </div>''', "light brand-sc"))

# 4. Demo de facturas
emails = [
    ("LS", "Logística Sur S.L.", "Factura F-2026/0412", "1.240,00 €"),
    ("MR", "Marta Ruiz", "Re: reunión del jueves", None),
    ("EN", "Energía Norte", "Tu factura de luz ya está disponible", "389,50 €"),
    ("PM", "Papelería Mediterráneo", "Adjuntamos factura nº 8831", "2.915,75 €"),
    ("NL", "Newsletter Marketing", "10 tendencias para este año", None),
    ("TC", "TeleCom Empresas", "Factura mensual de telefonía", "74,99 €"),
]
t0 = m("demo", "detecta")
t1 = m("demo", "extrae")
step = (t1 - t0 + 0.6) / len(emails)
lis = ""
for k, (av, who, sub, amt) in enumerate(emails):
    tk = round(t0 + k * step, 2)
    kind = "inv" if amt else "oth"
    tag = f'Factura · {amt}' if amt else "Ignorado"
    lis += f'''<li class="{kind}" style="--t:{tk}s"><span class="av">{av}</span><div><b>{who}</b><em>{sub}</em></div><span class="tag">{tag}</span></li>'''
steps = [("Revisa tu correo", "revisa"), ("Detecta cada factura", "detecta"), ("Extrae sus datos", "extrae"), ("Descarga en un clic", "listas")]
stl = "".join(f'<li {e(m("demo", k), "left")}><span class="n">{i+1}</span>{txt}</li>' for i, (txt, k) in enumerate(steps))
tc = m("demo", "un solo clic")
scenes.append(scene("demo", f'''
  <div class="bg-grid"></div><div class="blob b2"></div>
  <div class="demo-wrap">
    <div class="demo-copy">
      <p {e(0.1, "up", extra="kicker light")}>Ejemplo real</p>
      <h2 {e(0.25)}>Todas tus facturas,<br><span class="g">en un solo clic.</span></h2>
      <ol class="steps">{stl}</ol>
    </div>
    <div {e(0.3, "right", extra="win")}>
      <div class="bar"><i></i><i></i><i></i><span>NEXA · Asistente de facturas</span></div>
      <div class="wbody">
        <div class="ai">{MARK}<div><strong>Analizando bandeja de entrada…</strong><small>correo@tuempresa.es</small></div></div>
        <div class="prog"><span style="--t:{m("demo", "revisa")}s;--len:{round(t1 - m("demo", "revisa") + 0.8, 2)}s"></span></div>
        <ul class="mails">{lis}</ul>
        <div class="wfoot"><div><small>Facturas detectadas</small><strong class="e fade" style="--t:{tc}s">4 · 4.620,24 €</strong></div>
        <span class="dlbtn" style="--t:{tc}s">{ico("dl", "ico sm")} Descargar todas</span></div>
      </div>
    </div>
  </div>''', "dark"))

# 5. Soluciones
sols = [("mail", "Facturas y documentos", "solo facturas"), ("box", "Control de stock", "Control de stock"),
        ("grid", "Paneles que sustituyen al Excel", "paneles"), ("link", "Programas conectados", "programas"),
        ("chart", "Informes automáticos", "informes"), ("chat", "Atención al cliente con IA", "asistentes")]
tiles = "".join(f'<div {e(m("solutions", k), "pop")}><div class="tile"><div class="tico">{ico(i)}</div><h3>{h}</h3></div></div>' for i, h, k in sols)
scenes.append(scene("solutions", f'''
  <div class="sols">
    <h2 {e(0.1)}>Todo lo que <span class="g">la IA puede hacer</span> por tu empresa</h2>
    <div class="tiles">{tiles}</div>
  </div>''', "soft"))

# 6. Cifras
scenes.append(scene("stats", f'''
  <div class="bg-grid"></div><div class="blob b1"></div>
  <div class="stats">
    <h2 {e(0.1)}>Lo que antes era una tarde entera,<br><span class="g">ahora son minutos.</span></h2>
    <div class="nums">
      <div {e(m("stats", "Hasta"), "pop")}><div class="num"><strong><span class="cnt" style="--t:{m("stats", "Hasta")}s;--to:95"></span>%</strong><span>menos tiempo en tareas repetitivas</span></div></div>
      <div {e(m("stats", "Hasta") + 0.5, "pop")}><div class="num"><strong>+<span class="cnt" style="--t:{m("stats", "Hasta") + 0.5}s;--to:340"></span> h</strong><span>recuperadas al año</span></div></div>
      <div {e(m("stats", "Hasta") + 1.0, "pop")}><div class="num"><strong>0</strong><span>facturas olvidadas</span></div></div>
    </div>
    <p {e(m("stats", "Hasta") + 1.4, "fade", extra="note")}>* Cifras orientativas para una empresa con unas 600 facturas al mes.</p>
  </div>''', "dark"))

# 7. Valores
vals = [("shield", "Software privado", "privado"), ("pen", "Hecho a tu medida", "hecho a tu medida"), ("plug", "Se conecta a lo que ya usas", "se conecta")]
cols = "".join(f'<div {e(m("values", k), "up")}><div class="val"><div class="vico">{ico(i)}</div><h3>{h}</h3></div></div>' for i, h, k in vals)
scenes.append(scene("values", f'''
  <div class="vals">
    <div class="vrow">{cols}</div>
    <div {e(m("values", "Tus datos"), "pop", extra="vbadge")}>{ico("lock")} Tus datos, <span class="g">siempre bajo tu control</span></div>
  </div>''', "light"))

# 8. Método
ph = [("Conversación inicial", "Primero"), ("Diagnóstico", "entendemos"), ("Desarrollo", "Después"), ("Puesta en marcha", "construimos")]
phases = "".join(f'<div {e(m("method", k), "pop")}><div class="ph"><span>0{i+1}</span><h3>{h}</h3></div></div>' for i, (h, k) in enumerate(ph))
scenes.append(scene("method", f'''
  <div class="meth">
    <h2 {e(0.1)}>Primero entendemos tu empresa. <span class="g">Después construimos.</span></h2>
    <div class="tl"><div class="line"><span style="--t:{m("method", "Primero")}s;--len:{round(m("method", "construimos") - m("method", "Primero") + 0.6, 2)}s"></span></div>{phases}</div>
    <div {e(m("method", "la primera"), "pop", extra="free")}>{ico("check")} Primera conversación <strong>gratuita y sin compromiso</strong></div>
  </div>''', "soft"))

# 9. Llamada a la acción
scenes.append(scene("cta", f'''
  <div class="bg-grid"></div><div class="blob b1"></div><div class="blob b2"></div>
  <div class="cta">
    <div {e(0.2, "pop")}>{LOGO.replace("{cls}", "light")}</div>
    <h2 {e(m("cta", "Deja"))}>Deja que <span class="g">la IA</span> trabaje por ti.</h2>
    <div {e(m("cta", "Solicita"), "pop")}><span class="btn">Solicita tu diagnóstico gratuito {ico("arrow", "ico sm")}</span></div>
    <p {e(m("cta", "Solicita") + 0.8, "fade", extra="where")}>Valencia y Barcelona · Presencial &nbsp;|&nbsp; Resto de España · En remoto</p>
  </div>''', "dark", last=True))

html = open("template.html").read()
html = html.replace("__SCENES__", "\n".join(scenes)).replace("__TOTAL__", str(TOTAL))
html = html.replace("__BRAND_S__", str(S["brand"]["s"]))
open("video.html", "w").write(html)
json.dump({"total": TOTAL, "voice": {k: v["voice"] for k, v in S.items()}}, open("timing.json", "w"), indent=1)
print("total", TOTAL)
