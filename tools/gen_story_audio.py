#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
يولّد صوت تعليق لمشاهد «قصة كنز الصحراء» (رابعة ابتدائي، الدرس 1) بـ Gemini TTS من Google AI Studio.
بيكلّم الـ REST API مباشرة (من غير مكتبة google-genai) فمفيش حاجة تتنزّل.

التشغيل (مفتاح الـ API من متغيّر بيئة، مش بيتكتب في أي ملف):
    $env:GEMINI_API_KEY = "مفتاحك"
    python tools/gen_story_audio.py --list          # يعرض نماذج الصوت (TTS) المتاحة لحسابك
    python tools/gen_story_audio.py                 # يولّد كل المشاهد
    python tools/gen_story_audio.py 3               # يعيد مشهد واحد بس (رقم 3)
    python tools/gen_story_audio.py --voice Puck --model gemini-2.5-flash-preview-tts

الناتج: essay_out/story_audio/story_6_1_s1.wav ... s6.wav  (WAV أحادي 24kHz). اسمع العينات قبل ما نرفعها.
"""
import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
import wave

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "essay_out", "story_audio")
API = "https://generativelanguage.googleapis.com/v1beta"

# تعليمات الأسلوب: لهجة مصرية دافئة بإيقاع معلّم ابتدائي (عدّلها لو الصوت مش عاجبك)
STYLE = ("اقرأ النص التالي بلهجة مصرية طبيعية وواضحة، بصوت معلّمة أو معلّم ودود ومتحمّس "
         "يحكي قصة لأطفال في المرحلة الابتدائية، بإيقاع هادئ مع وقفات قصيرة بين الجمل، "
         "ونطق سليم للأسماء الإنجليزية (GPS = جي بي إس، Rover C4 = روفر سي فور). النص:\n")

SCENES = {
    1: "في صحرا بعيدة… فريق مستكشفين بيدوّر على كنز قديم مدفون تحت الرمل!",
    2: "بس فين مكان الكنز بالظبط؟ مفيش خريطة! … ولا يهمّك، هنستعين بالتكنولوجيا!",
    3: "من فوق: قمر صناعي وطيارة من غير طيّار، بيصوّروا المكان كله من السما!",
    4: "ونظام جي بي إس بيحدّد مكانهم على سطح الأرض بالظبط، عن طريق الأقمار الصناعية.",
    5: "ومن تحت الأرض: الرادار بيلاقي الآثار، ومقياس المغناطيسية بيكشف المعادن!",
    6: "وجهاز روفر سي فور مسح المكان وعمل صورة ثلاثية الأبعاد… ولقينا الكنز! شُفتوا التكنولوجيا ساعدت المستكشفين إزاي؟",
}


def call(url, key, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if data else "GET",
                                 headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit(f"خطأ من Google ({e.code}): {e.read().decode('utf-8', 'replace')[:700]}")


def save_wav(path, pcm, rate=24000):
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scene", nargs="?", type=int, help="رقم مشهد واحد (اختياري)")
    ap.add_argument("--voice", default="Kore", help="اسم الصوت (جرّب Kore أو Puck أو Charon أو Aoede)")
    ap.add_argument("--model", default="gemini-2.5-flash-preview-tts")
    ap.add_argument("--list", action="store_true", help="اعرض النماذج اللي فيها TTS وخلاص")
    a = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("اضبط متغيّر البيئة GEMINI_API_KEY الأول (مفتاح Google AI Studio).")

    if a.list:
        d = call(f"{API}/models?pageSize=200", key)
        names = [m["name"].replace("models/", "") for m in d.get("models", []) if "tts" in m["name"].lower()]
        print("نماذج الصوت المتاحة:", *names, sep="\n  ") if names else print("مفيش نموذج TTS ظاهر لحسابك.")
        return

    os.makedirs(OUT, exist_ok=True)
    todo = [a.scene] if a.scene else sorted(SCENES)
    for n in todo:
        if n not in SCENES:
            sys.exit(f"مفيش مشهد رقم {n}")
        body = {
            "contents": [{"parts": [{"text": STYLE + SCENES[n]}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": a.voice}}},
            },
        }
        d = call(f"{API}/models/{a.model}:generateContent", key, body)
        try:
            part = d["candidates"][0]["content"]["parts"][0]
            pcm = base64.b64decode((part.get("inlineData") or part.get("inline_data"))["data"])
        except (KeyError, IndexError, TypeError):
            sys.exit("الرد مفيهوش صوت: " + json.dumps(d, ensure_ascii=False)[:600])
        path = os.path.join(OUT, f"story_6_1_s{n}.wav")
        save_wav(path, pcm)
        print("تم:", os.path.normpath(path), f"({len(pcm) / 48000:.0f} ث تقريباً)")


if __name__ == "__main__":
    main()
