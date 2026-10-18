import type { ReactNode } from 'react';

// Latin identifiers/calls/indexing (int(), range(1,6), text[-1]) are isolated as LTR so the
// bidi algorithm can't flip their parentheses/brackets inside Arabic sentences.
const CODE_TOKEN = /\([0-9A-Fa-f]+\)[₀-₉]+|[A-Za-z_][\w.]*(?:\([^()]*\)|\[[^[\]]*\])*/g;

export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(CODE_TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const isCode = /[([]/.test(m[0]);
    out.push(
      <bdi key={start} dir="ltr" className={isCode ? 'font-mono text-[0.95em]' : undefined}>
        {m[0]}
      </bdi>
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}
