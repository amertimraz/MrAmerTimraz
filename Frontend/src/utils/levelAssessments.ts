import type { InteractiveQuizSummary } from '../types';

export interface LevelAttemptRecord {
  quizId: number;
  quizTitle: string;
  score: number;
  total: number;
  pct: number;
  passed: boolean;
  completedAt: string;
}

const PASSING_PERCENTAGE = 70;

function keyForUser(userId?: number) {
  return `level-attempts-${userId ?? 'guest'}`;
}

export function extractLevelNumber(title: string): number | null {
  const m = title.match(/(?:level|lvl|المستوى)\s*([0-9]+)/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export function isJavaScriptLevelQuiz(quiz: Pick<InteractiveQuizSummary, 'title' | 'subject'>): boolean {
  const subject = (quiz.subject ?? '').toLowerCase();
  const title = quiz.title.toLowerCase();
  return subject === 'javascript levels' ||
    (title.includes('javascript') && extractLevelNumber(quiz.title) !== null) ||
    (title.includes('js level'));
}

export function getStoredAttempts(userId?: number): Record<number, LevelAttemptRecord> {
  try {
    const raw = localStorage.getItem(keyForUser(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLevelAttempt(
  userId: number | undefined,
  payload: Omit<LevelAttemptRecord, 'passed' | 'completedAt'>,
) {
  const all = getStoredAttempts(userId);
  const pct = payload.total > 0 ? Math.round((payload.score / payload.total) * 100) : 0;
  const next: LevelAttemptRecord = {
    ...payload,
    pct,
    passed: pct >= PASSING_PERCENTAGE,
    completedAt: new Date().toISOString(),
  };
  all[payload.quizId] = next;
  localStorage.setItem(keyForUser(userId), JSON.stringify(all));
}

export function canOpenLevel(quiz: InteractiveQuizSummary, quizzes: InteractiveQuizSummary[], userId?: number) {
  const level = extractLevelNumber(quiz.title);
  if (!level || level <= 1) return true;

  const prev = quizzes.find(q => extractLevelNumber(q.title) === level - 1);
  if (!prev) return true;

  const attempts = getStoredAttempts(userId);
  return Boolean(attempts[prev.id]?.passed);
}

export function buildCertificateId(userId: number | undefined, quizId: number, completedAt: string) {
  const base = `${userId ?? 'guest'}-${quizId}-${completedAt}`;
  const hash = Array.from(base).reduce((acc, ch) => ((acc * 31 + ch.charCodeAt(0)) >>> 0), 7);
  return `KORYO-JS-${quizId}-${hash.toString(16).toUpperCase()}`;
}

export function getPassedCertificates(userId?: number): LevelAttemptRecord[] {
  return Object.values(getStoredAttempts(userId))
    .filter(v => v.passed)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
}
