import { Check, X } from 'lucide-react';
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

function WritingLines({ count }: { count: number }) {
  return (
    <div aria-hidden className="mt-3 space-y-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border-b border-dashed border-slate-400" />
      ))}
    </div>
  );
}

function ItemView({ item, n, showAnswers }: { item: AssessmentItem; n: number; showAnswers: boolean }) {
  return (
    <li className="break-inside-avoid border-b border-slate-200 py-3 last:border-0">
      <div className="flex gap-3">
        <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-extrabold text-white">{n}</span>
        <div className="min-w-0 flex-1">
          {item.type === 'tf' && (
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
                <span aria-hidden className="mt-1 inline-block h-8 w-14 shrink-0 rounded-md border-2 border-slate-500" />
              )}
            </div>
          )}

          {item.type === 'mcq' && (
            <>
              <p className="whitespace-pre-wrap text-lg font-black leading-9 text-slate-950">
                <Rich text={item.text} />
              </p>
              {item.code && <CodeBlock code={item.code} />}
              <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
                {item.options.map((opt, i) => {
                  const correct = showAnswers && i === item.answer;
                  return (
                    <li
                      key={i}
                      className={`flex items-start gap-2 rounded-lg border px-3 py-1.5 text-base ${
                        correct
                          ? 'border-2 border-emerald-700 font-extrabold text-emerald-900'
                          : 'border-slate-300 font-medium text-slate-700'
                      }`}
                    >
                      <span className="w-5 shrink-0 font-bold">{LETTERS[i]}.</span>
                      <bdi className="min-w-0 flex-1">
                        <Rich text={opt} />
                      </bdi>
                      {correct && (
                        <span className="inline-flex shrink-0 items-center gap-1 text-sm">
                          <Check size={15} aria-hidden />
                          <span>الإجابة الصحيحة</span>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {item.type === 'open' && (
            <>
              <p className="whitespace-pre-wrap text-lg font-black leading-9 text-slate-950">
                <Rich text={item.text} />
              </p>
              {showAnswers ? (
                <div className="mt-2 rounded-xl border-2 border-emerald-700 p-3">
                  <p className="mb-1 text-sm font-extrabold text-emerald-800">الإجابة النموذجية</p>
                  <p className="whitespace-pre-wrap text-base leading-8 text-slate-900">
                    <Rich text={item.answer} />
                  </p>
                  {item.code && <CodeBlock code={item.code} />}
                  {item.output != null && (
                    <>
                      <p className="mt-1 text-sm font-bold text-slate-700">الناتج:</p>
                      <CodeBlock code={item.output} />
                    </>
                  )}
                </div>
              ) : (
                <WritingLines count={item.code ? 5 : 3} />
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
}: {
  content: AssessmentContent;
  showAnswers: boolean;
}) {
  return (
    <article dir="rtl" className="rounded-2xl border-2 border-slate-300 bg-white p-4 text-slate-900 sm:p-6">
      <header className="border-b-2 border-slate-900 pb-3">
        <p className="text-sm font-bold text-slate-600">الصف الثالث الإعدادي — التقييم الأسبوعي والواجب المنزلي</p>
        <h3 className="mt-1 text-xl font-black">الأسبوع {content.week}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-700">{content.unit}</p>
        <p className="text-sm font-semibold text-slate-700">{content.lesson}</p>
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
