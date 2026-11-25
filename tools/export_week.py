import json, os, sys, html, subprocess, zipfile, base64
import pymupdf

WEEK = int(sys.argv[1])
ROOT = "F:/Amer/Mr Amer Platform/Backend/EduPlatform.API/Assessments/Content"
TOOLS = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
OUT = f"{TOOLS}/../exports/week{WEEK}"
FONT = f"file:///{os.path.abspath(TOOLS + '/fonts').replace(chr(92), '/')}"
CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe"
GRADES = [("prim4-ict-t1", "الصف الرابع الابتدائي", "تكنولوجيا المعلومات والاتصالات"),
          ("prim5-ict-t1", "الصف الخامس الابتدائي", "تكنولوجيا المعلومات والاتصالات"),
          ("prim6-ict-t1", "الصف السادس الابتدائي", "تكنولوجيا المعلومات والاتصالات"),
          ("prep1-ict-t1", "الصف الأول الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات"),
          ("prep2-ict-t1", "الصف الثاني الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات"),
          ("prep3-ict-t1", "الصف الثالث الإعدادي", "الكمبيوتر وتكنولوجيا المعلومات والاتصالات"),
          ("sec1-ai-t1", "الصف الأول الثانوي", "البرمجة والذكاء الاصطناعي")]
GROUPS = ["التقييم الأسبوعي", "التقييم الصفي", "الواجب المنزلي"]
ORDER = {"tf": 0, "mcq": 1, "open": 2}
LET = ["أ", "ب", "ج", "د", "هـ"]
e = html.escape
os.makedirs(OUT, exist_ok=True)

wm_svg = ("<svg xmlns='http://www.w3.org/2000/svg' width='360' height='260'><text x='180' y='130' fill='%23000' fill-opacity='0.055' "
          "font-family='Cairo,Tahoma,Arial' font-size='30' font-weight='bold' text-anchor='middle' transform='rotate(-28 180 130)'>"
          "منصة الأستاذ عامر تمراز</text></svg>")
wm = "url(\"data:image/svg+xml;utf8," + wm_svg.replace('"', "'").replace("#", "%23").replace("<", "%3C").replace(">", "%3E") + "\")"

CSS = f"""
@font-face {{ font-family:"Cairo"; font-weight:400; src:url("{FONT}/Cairo-400.ttf"); }}
@font-face {{ font-family:"Cairo"; font-weight:700; src:url("{FONT}/Cairo-700.ttf"); }}
@font-face {{ font-family:"Cairo"; font-weight:800; src:url("{FONT}/Cairo-800.ttf"); }}
@font-face {{ font-family:"Cairo"; font-weight:900; src:url("{FONT}/Cairo-900.ttf"); }}
@page {{ size: A4; margin: 0; }}
* {{ box-sizing: border-box; }}
body {{ margin:0; font-family:"Cairo","Segoe UI",Tahoma,sans-serif; color:#111; font-size:14px; line-height:1.8; background:#fff; }}
.sheet {{ padding: 0 14mm 10mm; background-image:{wm}; background-repeat:repeat; }}
.band {{ background:#0f766e; color:#fff; padding:9px 14mm; margin:0 -14mm 14px; display:flex; justify-content:space-between; font-weight:700; font-size:13px; }}
.hero {{ border-radius:16px; background:linear-gradient(135deg,#0f766e,#115e59 60%,#0c4a6e); color:#fff; padding:14px 18px 12px; margin:2px 0 6px; }}
.hero .subj {{ font-size:26px; font-weight:900; line-height:1.35; }}
.hero .row {{ display:flex; gap:10px; align-items:center; margin-top:8px; flex-wrap:wrap; }}
.pill {{ background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.4); border-radius:99px; padding:2px 16px; font-weight:800; font-size:17px; }}
.week {{ background:#fb923c; color:#431407; border-radius:12px; padding:2px 18px; font-weight:900; font-size:22px; }}
.week small {{ font-size:13px; font-weight:800; }}
.lesson {{ margin-top:8px; font-size:14px; font-weight:700; opacity:.95; }}
.runhead {{ position:fixed; top:0; left:0; right:0; }}
h2 {{ font-size:15px; background:#fff7ed; border-right:5px solid #ea580c; padding:4px 10px; margin:16px 0 6px; break-after:avoid; }}
.q {{ margin:8px 0; break-inside:avoid; display:flex; gap:9px; }}
.n {{ flex:0 0 26px; height:26px; border-radius:50%; background:#0f766e; color:#fff; text-align:center; font-weight:800; font-size:13px; line-height:26px; margin-top:3px; }}
.b {{ flex:1; min-width:0; }} .t {{ font-weight:700; }}
.tf {{ display:inline-block; margin-top:2px; padding:1px 12px; border-radius:99px; border:1.5px solid; font-weight:800; font-size:13px; }}
.tf.t1 {{ color:#047857; border-color:#047857; }} .tf.f0 {{ color:#be123c; border-color:#be123c; }}
.note {{ font-size:12.5px; color:#444; border:1px solid #ccc; border-radius:6px; padding:2px 8px; margin-top:4px; }}
.opts {{ display:grid; grid-template-columns:1fr 1fr; gap:4px 10px; margin-top:3px; }}
.o {{ border:1px solid #ccc; border-radius:7px; padding:2px 8px; font-size:13px; }} .o.ok {{ border:2px solid #047857; background:#ecfdf5; color:#065f46; font-weight:800; }}
.ans {{ border:2px solid #047857; border-radius:10px; padding:5px 10px; margin-top:4px; }} .ans b {{ color:#047857; font-size:12.5px; display:block; }}
.ans div {{ white-space:pre-wrap; }}
pre {{ direction:ltr; text-align:left; background:#f3f4f6; border:1px solid #ddd; border-radius:6px; padding:6px 9px; font-family:Consolas,monospace; font-size:12px; line-height:1.45; white-space:pre; margin:4px 0; }}
.foot {{ text-align:center; color:#666; font-size:11px; margin-top:12px; border-top:1px solid #ddd; padding-top:5px; }}
"""


def render(track, label, subject, zoom=1.0):
    d = json.load(open(f"{ROOT}/{track}/week-{WEEK:02d}.json", encoding="utf-8"))
    by = {g: [] for g in GROUPS}
    for p in d["parts"]:
        by[p["group"]].extend(p["items"])
    out = [f'<div class="sheet"><div class="band"><span>منصة الأستاذ عامر تمراز</span><span dir="ltr">amertimraz.com</span></div>',
           f'<div class="hero"><div class="subj">{e(subject)}</div><div class="row"><span class="pill">{e(label)}</span>'
           f'<span class="week"><small>الأسبوع</small> {WEEK}</span><span class="pill">التقييم الأسبوعي والواجب المنزلي (محلول)</span></div>'
           f'<div class="lesson">{e(d["lesson"])}</div></div>']
    for g in GROUPS:
        items = sorted(by[g], key=lambda x: ORDER[x["type"]])
        if not items: continue
        out.append(f"<h2>{g}</h2>")
        for n, it in enumerate(items, 1):
            body = f'<div class="t">{e(it["text"]).replace(chr(10), "<br>")}</div>'
            if it["type"] == "open" and it.get("code") and ("الكود التالي" in it["text"]):
                body += f'<pre>{e(it["code"])}</pre>'
            if it["type"] == "mcq" and it.get("code"):
                body += f'<pre>{e(it["code"])}</pre>'
            if it["type"] == "tf":
                a = it["answer"]
                body += f'<span class="tf {"t1" if a else "f0"}">{"✓ صح" if a else "✗ خطأ"}</span>'
                if it.get("note"): body += f'<div class="note">توضيح: {e(it["note"])}</div>'
            elif it["type"] == "mcq":
                body += '<div class="opts">' + "".join(
                    f'<div class="o {"ok" if i == it["answer"] else ""}">{LET[i]}. {e(o)}{" ✓" if i == it["answer"] else ""}</div>' for i, o in enumerate(it["options"])) + "</div>"
                if it.get("note"): body += f'<div class="note">توضيح: {e(it["note"])}</div>'
            else:
                a = f'<b>الإجابة النموذجية</b><div>{e(it["answer"])}</div>'
                if it.get("code") and "الكود التالي" not in it["text"]:
                    a += f'<pre>{e(it["code"])}</pre>'
                if it.get("output") is not None:
                    a += f'<b>الناتج:</b><pre>{e(it["output"])}</pre>'
                body += f'<div class="ans">{a}</div>'
            out.append(f'<div class="q"><span class="n">{n}</span><div class="b">{body}</div></div>')
    out.append('<div class="foot">منصة الأستاذ عامر تمراز — amertimraz.com</div></div>')
    return f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{CSS} body {{ zoom:{zoom}; }}</style><title>{label} - الأسبوع {WEEK}</title></head><body>{"".join(out)}</body></html>'


made = []


def build(track, label, subject, z):
    h = f"{OUT}/{track}.html"
    open(h, "w", encoding="utf-8").write(render(track, label, subject, z))
    pdf = f"{OUT}/{track}.pdf"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox", "--no-pdf-header-footer", f"--print-to-pdf={pdf}", f"file:///{h}"], check=True, timeout=120)
    return pdf, len(pymupdf.open(pdf))


ZOOMS = [1.0, 0.97, 0.94, 0.91, 0.88, 0.85, 0.82]
for track, label, subject in GRADES:
    if not os.path.exists(f"{ROOT}/{track}/week-{WEEK:02d}.json"):
        continue
    # Pull content together: use the largest zoom that gets the minimum possible page count
    # (so a single question never ends up alone on a last page).
    _, best = build(track, label, subject, ZOOMS[-1])
    for z in ZOOMS:
        pdf, n = build(track, label, subject, z)
        if n == best:
            print(f"{label}: zoom {z} -> {n} pages")
            break
    made.append((track, label, pdf))

merged = pymupdf.open()
zpath = f"{OUT}/تقييمات_الأسبوع_{WEEK}_صور_حسب_الصف.zip"
with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
    for track, label, pdf in made:
        d = pymupdf.open(pdf)
        merged.insert_pdf(d)
        for i, p in enumerate(d, 1):
            png = f"{OUT}/{track}_{i}.png"
            p.get_pixmap(dpi=110).save(png)
            z.write(png, f"{label}/{label}_صفحة_{i}.png")
        print(label, len(d), "pages")
mp = f"{OUT}/تقييمات_الأسبوع_{WEEK}_محلولة_كل_الصفوف.pdf"
merged.save(mp)
print(mp)
print(zpath)
