import { useState } from 'react';
import { Check, Eye, RotateCcw, X } from 'lucide-react';
import { Rich } from '../shared/RichText';
import type { AssessmentContent, AssessmentItem, AssessmentPart } from '../../api/assessments';

const INSTRUCTIONS: Record<AssessmentItem['type'], string> = {
  tf: 'ضع علامة (√) أمام العبارة الصحيحة أو علامة (×) أمام العبارة غير الصحيحة.',
  mcq: 'اختر الإجابة الصحيحة من بين الخيارات التالية.',
  open: 'أجب عن الأسئلة التالية:',
};

const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];

function groupParts(parts: AssessmentPart[]): [string, AssessmentPart[]][] {
  const map = new Map<string, AssessmentPart[]>();
  for (const p of parts) map.set(p.group, [...(map.get(p.group) ?? []), p]);
  return [...map.entries()];
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      dir="ltr"
      className="my-2 overflow-x-auto whitespace-pre rounded-lg border border-slate-300 bg-slate-50 p-3 text-left font-mono text-sm leading-6 text-slate-900"
    >
      {code}
    </pre>
  );
}

function BarChart({ chart }: { chart: { title?: string; labels: string[]; values: number[] } }) {
  const max = Math.max(...chart.values, 1);
  const W = 420, H = 230, top = 34, base = 180, left = 36;
  const slot = (W - left - 10) / chart.values.length;
  const barW = Math.min(70, slot * 0.6);
  return (
    <figure className="my-3 break-inside-avoid">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={chart.title ?? 'رسم بياني'} className="mx-auto w-full max-w-md">
        {chart.title && (
          <text x={W / 2} y={16} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{chart.title}</text>
        )}
        {Array.from({ length: max + 1 }).map((_, i) => {
          const y = base - (i / max) * (base - top);
          return (
            <g key={i}>
              <line x1={left} x2={W - 10} y1={y} y2={y} stroke="#cbd5e1" strokeWidth="1" />
              <text x={left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#475569">{i}</text>
            </g>
          );
        })}
        <line x1={left} x2={left} y1={top} y2={base} stroke="#0f172a" strokeWidth="1.5" />
        <line x1={left} x2={W - 10} y1={base} y2={base} stroke="#0f172a" strokeWidth="1.5" />
        {chart.values.map((v, i) => {
          const h = (v / max) * (base - top);
          const cx = left + slot * i + slot / 2;
          return (
            <g key={i}>
              <rect x={cx - barW / 2} y={base - h} width={barW} height={h} rx="4" fill="#0d9488" stroke="#0f172a" strokeWidth="1.5" />
              <text x={cx} y={base - h - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0f172a">{v}</text>
              <text x={cx} y={base + 18} textAnchor="middle" fontSize="11" fill="#0f172a">{chart.labels[i]}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function FlowDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="my-3 flex flex-wrap items-center gap-2 break-inside-avoid" aria-label="مخطط انسيابي">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="rounded-xl border-2 border-slate-900 bg-teal-50 px-3 py-2 text-sm font-bold text-slate-900">{s}</span>
          {i < steps.length - 1 && <span aria-hidden className="text-lg font-black text-orange-600">←</span>}
        </div>
      ))}
    </div>
  );
}

function WritingLines({ count }: { count: number }) {
  return (
    <div aria-hidden className="mt-3 space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-dashed border-slate-400" />
      ))}
    </div>
  );
}

// Practice mode (showAnswers = false): the student can tap an answer and gets instant feedback.
// Everything marked "live-only" is hidden in the printed copy so the PDF stays a clean worksheet.
function Feedback({ ok, text, note }: { ok: boolean; text: string; note?: string }) {
  return (
    <div
      role="status"
      className={`live-only mt-2 rounded-lg border-2 px-3 py-2 text-sm font-bold leading-7 ${
        ok ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-rose-700 bg-rose-50 text-rose-900'
      }`}
    >
      <span className="inline-flex items-center gap-1">
        {ok ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />} {text}
      </span>
      {note && (
        <span className="mt-1 block font-medium text-slate-700">
          <span className="font-bold">توضيح: </span>
          <Rich text={note} />
        </span>
      )}
    </div>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="live-only mt-2 inline-flex min-h-9 items-center gap-1 rounded-lg border border-slate-400 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
    >
      <RotateCcw size={13} aria-hidden /> حاول مرة أخرى
    </button>
  );
}

function ItemView({ item, n, showAnswers }: { item: AssessmentItem; n: number; showAnswers: boolean }) {
  const [pick, setPick] = useState<number | null>(null); // tf: 1 = صح, 0 = خطأ; mcq: option index
  const [shown, setShown] = useState(false); // open: reveal the model answer
  const answered = pick !== null;

  return (
    <li className="break-inside-avoid border-b border-slate-200 py-3 last:border-0">
      <div className="flex gap-3">
        <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-extrabold text-white">{n}</span>
        <div className="min-w-0 flex-1">
          {item.type === 'tf' && (
            <>
              <div className="flex items-start justify-between gap-4">
                <p className="whitespace-pre-wrap text-lg font-black leading-9 text-slate-950">
                  <Rich text={item.text} />
                </p>
                {showAnswers ? (
                  <span
                    className={`mt-1 inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-sm font-extrabold ${
                      item.answer ? 'border-emerald-700 text-emerald-800' : 'border-rose-700 text-rose-800'
                    }`}
                  >
                    {item.answer ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}
                    {item.answer ? 'صح' : 'خطأ'}
                  </span>
                ) : (
                  <>
                    <span aria-hidden className="print-only mt-1 hidden h-8 w-14 shrink-0 rounded-md border-2 border-slate-500" />
                    <div className="live-only mt-1 flex shrink-0 gap-2" role="group" aria-label="اختر صح أو خطأ">
                      {([1, 0] as const).map(v => {
                        const isRight = (v === 1) === item.answer;
                        const state = !answered
                          ? 'border-slate-400 bg-white text-slate-800 hover:bg-orange-100'
                          : isRight
                            ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                            : pick === v
                              ? 'border-rose-700 bg-rose-50 text-rose-900'
                              : 'border-slate-300 bg-white text-slate-400';
                        return (
                          <button
                            key={v}
                            type="button"
                            disabled={answered}
                            aria-pressed={pick === v}
                            onClick={() => setPick(v)}
                            className={`inline-flex min-h-11 min-w-16 items-center justify-center gap-1 rounded-xl border-2 px-3 text-sm font-extrabold ${state}`}
                          >
                            {v === 1 ? <Check size={15} aria-hidden /> : <X size={15} aria-hidden />}
                            {v === 1 ? 'صح' : 'خطأ'}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              {!showAnswers && answered && (
                <>
                  <Feedback
                    ok={(pick === 1) === item.answer}
                    text={(pick === 1) === item.answer ? 'إجابة صحيحة' : `إجابة خاطئة — الصحيح: ${item.answer ? 'صح' : 'خطأ'}`}
                    note={item.note}
                  />
                  <ResetButton onClick={() => setPick(null)} />
                </>
              )}
            </>
          )}

          {item.type === 'mcq' && (
            <>
              <p className="whitespace-pre-wrap text-lg font-black leading-9 text-slate-950">
                <Rich text={item.text} />
              </p>
              {item.code && <CodeBlock code={item.code} />}
              <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
                {item.options.map((opt, i) => {
                  const correct = showAnswers ? i === item.answer : answered && i === item.answer;
                  const wrong = !showAnswers && answered && pick === i && i !== item.answer;
                  const cls = correct
                    ? 'border-2 border-emerald-700 bg-emerald-50 font-extrabold text-emerald-900'
                    : wrong
                      ? 'border-2 border-rose-700 bg-rose-50 font-extrabold text-rose-900'
                      : 'border-slate-300 font-medium text-slate-700';
                  const inner = (
                    <>
                      <span className="w-5 shrink-0 font-bold">{LETTERS[i]}.</span>
                      <bdi className="min-w-0 flex-1 text-start">
                        <Rich text={opt} />
                      </bdi>
                      {correct && (
                        <span className="live-only inline-flex shrink-0 items-center gap-1 text-sm">
                          <Check size={15} aria-hidden />
                          <span>الإجابة الصحيحة</span>
                        </span>
                      )}
                      {wrong && (
                        <span className="live-only inline-flex shrink-0 items-center gap-1 text-sm">
                          <X size={15} aria-hidden />
                          <span>إجابتك</span>
                        </span>
                      )}
                    </>
                  );
                  return (
                    <li key={i}>
                      {showAnswers ? (
                        <div className={`flex items-start gap-2 rounded-lg border px-3 py-1.5 text-base ${cls}`}>{inner}</div>
                      ) : (
                        <button
                          type="button"
                          data-live-state={correct ? 'correct' : wrong ? 'wrong' : 'idle'}
                          disabled={answered}
                          onClick={() => setPick(i)}
                          className={`flex min-h-11 w-full items-start gap-2 rounded-lg border px-3 py-1.5 text-start text-base ${cls} ${
                            answered ? '' : 'hover:bg-orange-100'
                          }`}
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              {!showAnswers && answered && (
                <>
                  <Feedback
                    ok={pick === item.answer}
                    text={pick === item.answer ? 'إجابة صحيحة' : `إجابة خاطئة — الصحيح: ${LETTERS[item.answer]}`}
                    note={item.note}
                  />
                  <ResetButton onClick={() => setPick(null)} />
                </>
              )}
            </>
          )}

          {item.type === 'open' && (
            <>
              <p className="whitespace-pre-wrap text-lg font-black leading-9 text-slate-950">
                <Rich text={item.text} />
              </p>
              {showAnswers || shown ? (
                <div className={`mt-2 rounded-xl border-2 border-emerald-700 p-3 ${showAnswers ? '' : 'live-only'}`}>
                  <p className="mb-1 text-sm font-extrabold text-emerald-800">الإجابة النموذجية</p>
                  <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
                    <Rich text={item.answer} />
                  </p>
                  {item.chart && <BarChart chart={item.chart} />}
                  {item.flow && <FlowDiagram steps={item.flow} />}
                  {item.code && <CodeBlock code={item.code} />}
                  {item.output != null && (
                    <>
                      <p className="mt-1 text-sm font-bold text-slate-700">الناتج:</p>
                      <CodeBlock code={item.output} />
                    </>
                  )}
                </div>
              ) : null}
              {!showAnswers && (
                <>
                  <WritingLines count={item.code ? 5 : 3} />
                  <button
                    type="button"
                    onClick={() => setShown(v => !v)}
                    aria-expanded={shown}
                    className="live-only mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-slate-400 px-4 text-sm font-extrabold text-slate-800 hover:bg-orange-100"
                  >
                    <Eye size={16} aria-hidden /> {shown ? 'إخفاء الإجابة النموذجية' : 'اعرض الإجابة النموذجية'}
                  </button>
                </>
              )}
            </>
          )}

          {showAnswers && (item.type === 'tf' || item.type === 'mcq') && item.note && (
            <p className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm leading-7 text-slate-700">
              <span className="font-bold">توضيح: </span>
              <Rich text={item.note} />
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

const TYPE_ORDER: AssessmentItem['type'][] = ['tf', 'mcq', 'open'];

function GroupItems({ parts, showAnswers }: { parts: AssessmentPart[]; showAnswers: boolean }) {
  // Merge every part of the group: all true/false first, then MCQ, then written questions.
  const items = parts.flatMap(p => p.items);
  let n = 0;
  return (
    <div>
      {TYPE_ORDER.map(type => {
        const list = items.filter(i => i.type === type);
        if (list.length === 0) return null;
        return (
          <section key={type} className="mt-4">
            <p className="text-sm font-extrabold text-orange-800">{INSTRUCTIONS[type]}</p>
            <ol>
              {list.map((item, i) => (
                <ItemView key={i} item={item} n={++n} showAnswers={showAnswers} />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

export default function AssessmentSheet({
  content,
  showAnswers,
  stageLabel,
}: {
  content: AssessmentContent;
  showAnswers: boolean;
  stageLabel: string;
}) {
  return (
    <article dir="rtl" className="rounded-2xl border-2 border-slate-300 bg-white p-4 text-slate-900 sm:p-6">
      <div className="mb-3 flex items-center justify-between rounded-xl bg-teal-700 px-4 py-2 text-white">
        <span className="text-base font-black">منصة الأستاذ عامر تمراز</span>
        <span dir="ltr" className="text-sm font-bold">amertimraz.com</span>
      </div>
      <header className="border-b-2 border-slate-900 pb-3">
        <p className="text-sm font-bold text-slate-600">{stageLabel} — التقييم الأسبوعي والواجب المنزلي</p>
        <h3 className="mt-1 text-xl font-black">الأسبوع {content.week}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-700">{content.unit}</p>
        <p className="text-sm font-semibold text-slate-700">{content.lesson}</p>
        {!showAnswers && (
          <p className="live-only mt-2 text-sm font-bold text-teal-800">وضع التدريب: اضغط على إجابتك (صح/خطأ أو الاختيار) وسيظهر التصحيح فوراً.</p>
        )}
        {showAnswers && (
          <p className="mt-2 inline-block rounded-full border-2 border-emerald-700 px-3 py-0.5 text-sm font-extrabold text-emerald-800">
            نموذج الإجابة
          </p>
        )}
      </header>

      {groupParts(content.parts).map(([group, parts]) => (
        <div key={group} className="mt-6">
          <h4 className="border-r-4 border-teal-700 pr-3 text-lg font-black text-teal-900">{group}</h4>
          <GroupItems parts={parts} showAnswers={showAnswers} />
        </div>
      ))}

      <footer className="mt-8 border-t border-slate-300 pt-3 text-xs leading-6 text-slate-600">
        المصدر: وزارة التربية والتعليم والتعليم الفني — إدارة تنمية مادة الكمبيوتر التعليمي. التنسيق والإجابات النموذجية: منصة الأستاذ عامر تمراز (amertimraz.com).
      </footer>
    </article>
  );
}
