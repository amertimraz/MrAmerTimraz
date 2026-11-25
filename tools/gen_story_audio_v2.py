#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
صوت «قصة كنز الصحراء» (النسخة الحوارية): عمر وسلمى ونوفا (الروبوت). كل سطر بيتولّد في ملف لوحده
بصوت شخصيته، عشان نتحكم في التوقيت وفي مين بيتكلم. بيكلّم Gemini TTS (Google AI Studio) بالـ REST مباشرة.

التشغيل (المفتاح من متغيّر بيئة، مش بيتكتب في أي ملف):
    $env:GEMINI_API_KEY = "مفتاحك"
    python tools/gen_story_audio_v2.py                 # يولّد كل الأسطر (27 مقطع) ويكمّل من اللي اتولّد قبل كده
    python tools/gen_story_audio_v2.py --scene 3       # مشهد واحد بس
    python tools/gen_story_audio_v2.py --redo 3.2      # يعيد سطر واحد (المشهد 3 السطر 2)
    python tools/gen_story_audio_v2.py --voice-omar Puck --voice-salma Kore --voice-nova Charon

الناتج: essay_out/story_audio_v2/s{مشهد}_l{سطر}.wav  +  lines.json (فيه المدة بالثواني لكل سطر).
الطبقة المجانية ليها حد طلبات في الدقيقة، فالسكربت بيستنّى ويعيد المحاولة تلقائياً لو الحد اتعدّى.
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request
import wave

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "essay_out", "story_audio_v2")
API = "https://generativelanguage.googleapis.com/v1beta"

STYLE = {
    "omar": ("اقرأ الجملة التالية بلهجة مصرية طبيعية بصوت ولد صغير (حوالي عشر سنين) مليان حماس وفضول وعفوية، "
             "بإيقاع سريع نسبياً ونبرة مبتهجة. الجملة:\n"),
    "salma": ("اقرأ الجملة التالية بلهجة مصرية طبيعية بصوت بنت صغيرة (حوالي عشر سنين) ذكية وهادئة وودودة، "
              "بوضوح ونبرة واثقة ومشجّعة. الجملة:\n"),
    "nova": ("اقرأ الجملة التالية بلهجة مصرية طبيعية بصوت روبوت ودود ومرح، مساعد ذكي بيشرح للأطفال، "
             "بنبرة دافئة وواضحة ومعبّرة من غير مبالغة في الصوت الآلي، ونطق سليم للأسماء الإنجليزية. الجملة:\n"),
}

# (المشهد, الشخصية, النص)
LINES = [
    (1, "omar", "يا سلمى، وصلنا أخيراً! الصحرا واسعة قوي!"),
    (1, "salma", "أيوه يا عمر، إحنا هنا عشان نلاقي كنز قديم مدفون تحت الرمل."),
    (1, "omar", "طب هنبدأ منين؟"),

    (2, "salma", "المشكلة إن مفيش خريطة، ولا حد عارف مكانه بالظبط!"),
    (2, "omar", "يعني هندوّر في الرمل كله؟ ده هيأخد سنين!"),
    (2, "salma", "ولا يهمّك، معانا نوفا! يا نوفا، ساعدنا!"),
    (2, "nova", "أكيد! عندنا تكنولوجيا بتساعد المستكشفين. تعالوا أعرّفكم عليها واحدة واحدة."),

    (3, "nova", "أول أداة هي القمر الصناعي. بيلف حوالين الأرض وبيصوّر المكان من فوق."),
    (3, "omar", "من الفضا؟! طب والطيارة الصغيرة دي؟"),
    (3, "salma", "دي الطائرة بدون طيّار، اسمها درون. بتصوّر صور قريبة وواضحة."),
    (3, "omar", "يا سلام! كده عرفنا شكل المنطقة كلها."),

    (4, "salma", "بس لسه محتاجين نعرف إحنا فين بالظبط."),
    (4, "nova", "هنا يجي دور نظام تحديد المواقع، جي بي إس. بيستخدم الأقمار الصناعية عشان يحدّد مكانكم على سطح الأرض."),
    (4, "omar", "شوفي! الدبوس الأحمر ده مكاننا!"),

    (5, "omar", "طب والكنز نفسه؟ ده مدفون تحت الرمل!"),
    (5, "nova", "ده شغل الرادار المخترق للأرض. بيلاقي الأجسام المدفونة زي الآثار."),
    (5, "salma", "طب والمعادن زي الدهب؟"),
    (5, "nova", "للمعادن في مقياس المغناطيسية. بيكشف المعادن اللي تحت الأرض."),
    (5, "omar", "واو! يعني في حاجة تحت الرمل فعلاً!"),

    (6, "salma", "وفي جهاز اسمه روفر سي فور، صح؟"),
    (6, "nova", "بالظبط! جهاز مطوّر لكشف المعادن، وماسح أرضي بيعمل صورة ثلاثية الأبعاد للمكان."),
    (6, "omar", "يعني هيقولنا مكان الكنز وعلى عمق قد إيه؟"),
    (6, "nova", "أيوه يا عمر!"),

    (7, "salma", "بص يا عمر! الجهاز لقط حاجة!"),
    (7, "omar", "صندوق! لقينا الكنز!"),
    (7, "salma", "مكنّاش هنلاقيه من غير التكنولوجيا!"),

    (8, "nova", "شُفتوا يا أصحابي؟ القمر الصناعي والدرون صوّروا المكان، وجي بي إس حدّد مكانهم، والرادار ومقياس المغناطيسية كشفوا اللي تحت الأرض، وروفر سي فور رسم صورة ثلاثية الأبعاد. تفتكروا إيه أداة تانية ممكن تساعد المستكشفين؟"),
]


def call(url, key, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if data else "GET",
                                 headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")
            if e.code in (429, 500, 503) and attempt < 5:
                wait = 20 * (attempt + 1)
                print(f"   حد الطلبات/ضغط ({e.code})، هستنى {wait} ثانية وأعيد…")
                time.sleep(wait)
                continue
            sys.exit(f"خطأ من Google ({e.code}): {msg[:700]}")


def save_wav(path, pcm, rate=24000):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scene", type=int, help="مشهد واحد بس")
    ap.add_argument("--redo", help="يعيد سطر واحد بصيغة مشهد.سطر (مثلاً 3.2)")
    ap.add_argument("--model", default="gemini-2.5-flash-preview-tts")
    ap.add_argument("--voice-omar", default="Puck")
    ap.add_argument("--voice-salma", default="Kore")
    ap.add_argument("--voice-nova", default="Charon")
    a = ap.parse_args()
    voices = {"omar": a.voice_omar, "salma": a.voice_salma, "nova": a.voice_nova}

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("اضبط متغيّر البيئة GEMINI_API_KEY الأول (مفتاح Google AI Studio).")
    os.makedirs(OUT, exist_ok=True)

    counters, jobs = {}, []
    for scene, who, text in LINES:
        counters[scene] = counters.get(scene, 0) + 1
        jobs.append((scene, counters[scene], who, text))

    redo = tuple(int(x) for x in a.redo.split(".")) if a.redo else None
    manifest = []
    for scene, n, who, text in jobs:
        path = os.path.join(OUT, f"s{scene}_l{n}.wav")
        wanted = (a.scene is None or a.scene == scene) and (redo is None or redo == (scene, n))
        if wanted and (redo == (scene, n) or not os.path.exists(path)):
            body = {
                "contents": [{"parts": [{"text": STYLE[who] + text}]}],
                "generationConfig": {
                    "responseModalities": ["AUDIO"],
                    "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voices[who]}}},
                },
            }
            d = call(f"{API}/models/{a.model}:generateContent", key, body)
            try:
                part = d["candidates"][0]["content"]["parts"][0]
                pcm = base64.b64decode((part.get("inlineData") or part.get("inline_data"))["data"])
            except (KeyError, IndexError, TypeError):
                sys.exit("الرد مفيهوش صوت: " + json.dumps(d, ensure_ascii=False)[:600])
            save_wav(path, pcm)
            print(f"تم s{scene}_l{n} ({who}) {len(pcm) / 48000:.1f} ث")
            time.sleep(4)
        if os.path.exists(path):
            with wave.open(path) as w:
                dur = round(w.getnframes() / w.getframerate(), 2)
            manifest.append({"scene": scene, "line": n, "who": who, "file": f"s{scene}_l{n}.wav", "dur": dur, "text": text})
    with open(os.path.join(OUT, "lines.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    print(f"خلاص. {len(manifest)} مقطع جاهز من {len(jobs)}. الملفات في: {os.path.normpath(OUT)}")


if __name__ == "__main__":
    main()
