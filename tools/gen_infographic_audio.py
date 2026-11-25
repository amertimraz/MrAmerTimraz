#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
صوت تعليق إنفوجرافيك «رحلة الرقم 85» (أولى ثانوي، الدرس الأول): 4 مقاطع (مقطع لكل مرحلة) بصوت راوي واحد،
بـ Gemini TTS من Google AI Studio (REST مباشر من غير مكتبة).

التشغيل (المفتاح من متغيّر بيئة، مش بيتكتب في أي ملف):
    $env:GEMINI_API_KEY = "مفتاحك"
    python tools/gen_infographic_audio.py                 # يولّد الـ4 مقاطع (ويكمّل من اللي اتولّد)
    python tools/gen_infographic_audio.py --redo 2        # يعيد المقطع رقم 2 بس
    python tools/gen_infographic_audio.py --voice Puck    # صوت تاني

الناتج: essay_out/infographic_audio/inf_s1.wav ... inf_s4.wav
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

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "essay_out", "infographic_audio")
API = "https://generativelanguage.googleapis.com/v1beta"

STYLE = ("اقرأ النص التالي بلهجة مصرية طبيعية ودافئة، بصوت مدرّس شاب ودود ومتحمّس بيشرح لطلاب ثانوي، "
         "بإيقاع هادئ مع وقفات قصيرة بين الجمل، ونطق واضح للأرقام والمصطلحات. النص:\n")

LINES = {
    1: "تعالوا نشوف رحلة الرقم خمسة وتمانين. في الأول، أرقام وحروف ورموز كده خام… لوحدها ملهاش أي معنى. دي اسمها البيانات.",
    2: "طب لما نديها معنى وسياق؟ الرقم ده طلع درجة أحمد في امتحان البرمجة من مية! هنا بقى الرقم بقى ليه معنى، وبقى معلومة.",
    3: "وبعد كده، لما نجمع نتايج الامتحان ونحلّلها وننظّمها عشان نحل مشكلة: مسابقة البرمجة بتطلب تسعين، وأحمد جاب خمسة وتمانين، يبقى محتاج يزوّد خمس درجات عشان يدخلها. وهنا بتبقى معرفة!",
    4: "يعني نلخّص: بيانات، ولما يبقى ليها معنى بتبقى معلومات، ولما نحلّلها لحل مشكلة بتبقى معرفة. ودايمًا نتحقق من المصدر.",
}


def call(url, key, body):
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), method="POST",
                                 headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")
            if e.code in (429, 500, 503) and attempt < 5 and "per day" not in msg.lower():
                wait = 20 * (attempt + 1)
                print(f"   ضغط/حد الطلبات ({e.code})، هستنى {wait} ثانية وأعيد…")
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
    ap.add_argument("--redo", type=int, help="رقم المقطع اللي يتعاد (1-4)")
    ap.add_argument("--voice", default="Kore")
    ap.add_argument("--model", default="gemini-2.5-flash-preview-tts")
    a = ap.parse_args()
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("اضبط متغيّر البيئة GEMINI_API_KEY الأول (مفتاح Google AI Studio).")
    os.makedirs(OUT, exist_ok=True)
    for n, text in LINES.items():
        path = os.path.join(OUT, f"inf_s{n}.wav")
        if os.path.exists(path) and a.redo != n:
            print(f"موجود: inf_s{n}.wav")
            continue
        body = {"contents": [{"parts": [{"text": STYLE + text}]}],
                "generationConfig": {"responseModalities": ["AUDIO"],
                                     "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}}}}
        d = call(f"{API}/models/{a.model}:generateContent", key, body)
        try:
            part = d["candidates"][0]["content"]["parts"][0]
            pcm = base64.b64decode((part.get("inlineData") or part.get("inline_data"))["data"])
        except (KeyError, IndexError, TypeError):
            sys.exit("الرد مفيهوش صوت: " + json.dumps(d, ensure_ascii=False)[:600])
        save_wav(path, pcm)
        print(f"تم inf_s{n}.wav ({len(pcm) / 48000:.1f} ث)")
        time.sleep(4)
    print("خلاص. الملفات في:", os.path.normpath(OUT))


if __name__ == "__main__":
    main()
