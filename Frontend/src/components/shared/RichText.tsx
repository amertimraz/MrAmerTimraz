import type { ReactNode } from 'react';

// Latin runs (whole phrases like "Social Engineering", "Apple iOS", identifiers, calls such as
// range(1,6)) are isolated as LTR so the bidi algorithm can't reverse their word order or flip
// their parentheses/brackets inside Arabic sentences.
const CODE_TOKEN =
  /\([0-9A-Fa-f]+\)[₀-₉]+|\([A-Za-z][A-Za-z0-9 _.'+#&/-]*\)|=?[A-Za-z_][\w.'+#&/*-]*(?: +(?:[-–] +)?[A-Za-z_][\w.'+#&/*-]*)*(?:\([^()]*\)|\[[^[\]]*\])*/g;

export function Rich({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(CODE_TOKEN)) {
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const isCode = /^=?[A-Za-z_][\w.]*[([]/.test(m[0]);
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
