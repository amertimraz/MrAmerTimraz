import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { quizzesApi } from '../../api/quizzes';
import { aiApi } from '../../api/ai';
import { uploadsApi } from '../../api/uploads';
import type { InteractiveQuizSummary, InteractiveQuiz, InteractiveQuestion } from '../../types';
import toast from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import {
  Plus, Pencil, Trash2, Play, BookOpen, X, FileText,
  Upload, ClipboardList, CheckCircle, AlertCircle, Sparkles,
  Settings, Download, Trophy, Timer, Star, Layers, Link2, Copy,
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

interface ParsedQuestion {
  text: string;
  type: 'MCQ' | 'TrueFalse';
  options: string[];
  correctAnswer?: string;
}

const ARABIC_OPTIONS = ['أ', 'ب', 'ج', 'د', 'هـ'];

function normalizeArabicNums(s: string): string {
  return s.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

function isTrueFalseQuestion(opts: string[], text: string): boolean {
  if (/[(\[]\s*صح\s*[\/|\\]\s*خطأ\s*[)\]]|\bصح\s+أم\s+خطأ\b/i.test(text)) return true;
  if (opts.length === 2) {
    const a = opts[0].replace(/\s/g, '');
    const b = opts[1].replace(/\s/g, '');
    if (/(صح|صواب)/.test(a) && /(خطأ|خطا)/.test(b)) return true;
    if (/(خطأ|خطا)/.test(a) && /(صح|صواب)/.test(b)) return true;
  }
  return false;
}

function buildQuestion(text: string, options: string[], correctAnswer?: string): ParsedQuestion {
  const cleanText = text
    .replace(/[(\[]\s*صح\s*[\/|\\]\s*خطأ\s*[)\]]/gi, '')
    .replace(/\bصح\s+أم\s+خطأ\b/gi, '')
    .replace(/^\d+\s*[-–.،)]\s*/, '')
    .trim();
  const isTF = isTrueFalseQuestion(options, cleanText);
  return {
    text: cleanText,
    type: isTF ? 'TrueFalse' : 'MCQ',
    options: isTF ? (options.length >= 2 ? options : ['صح', 'خطأ']) : options,
    correctAnswer,
  };
}

function parsePdfText(rawText: string): ParsedQuestion[] {
  const normalized = normalizeArabicNums(rawText);
  const rawLines = normalized.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const questions: ParsedQuestion[] = [];

  const hasTab       = (l: string) => l.includes('\t');
  const isLetterOpt  = (l: string) => /^([أابتثجحخدذهوي])\s*[-–.،)(]\s*.+/.test(l);
  const isAnswerLine = (l: string) => /^(?:الإجابة|الجواب|الحل|الإجابه)\s*[:\s=]/i.test(l);
  const isNumberedQ  = (l: string) => /^(\d+)\s*[-–.،)]\s*\S/.test(l);
  const isTFHeader   = (l: string) => /صح\s*(أم|أو|و)\s*خطأ|حدد\s+صح|اكتب\s+صح|ضع\s+(علامة|✓)|ثانياً?\s*[:–-]/i.test(l);
  const isMCQHeader  = (l: string) => /اختر|اختار|أكمل|أجب|الإجابة\s+الصحيحة/i.test(l) && l.length < 80;

  const isQByEnding = (l: string) =>
    !hasTab(l) && l.length >= 8 && !isLetterOpt(l) && !isAnswerLine(l) &&
    (l.endsWith('؟') || l.endsWith('?') || (l.endsWith(':') && l.length >= 12));

  const isStmt = (l: string) =>
    l.length >= 12 && !l.endsWith('؟') && !l.endsWith('?') &&
    !isLetterOpt(l) && !isAnswerLine(l) && !hasTab(l) &&
    /[\u0600-\u06FF]/.test(l) && l.includes(' ');

  const getLetterOpt = (l: string) => {
    const m = l.match(/^([أابتثجحخدذهوي])\s*[-–.،)(]\s*(.+)/);
    return m ? m[2].trim() : null;
  };
  const getAnswerFromLine = (l: string): string | undefined => {
    const m = l.match(/^(?:الإجابة|الجواب|الحل|الإجابه)\s*[:\s=]\s*([أابتثجحخدذ])/i);
    if (m) return String(ARABIC_OPTIONS.indexOf(m[1]));
    const m2 = l.match(/^(?:الإجابة|الجواب|الحل|الإجابه)\s*[:\s=]\s*(صح|صواب|خطأ|خطا)/i);
    if (m2) return /صح|صواب/i.test(m2[1]) ? 'true' : 'false';
    return undefined;
  };
  const stripNum = (l: string) => l.replace(/^\d+\s*[-–.،)]\s*/, '').trim();
  const getTabParts = (l: string) => l.split('\t').map(p => p.trim()).filter(p => p.length > 0 && p.length < 200);
  const isQuestion = (l: string) => isNumberedQ(l) || isQByEnding(l);
  const isBreak = (l: string) => isQuestion(l) || isTFHeader(l) || isMCQHeader(l);

  let i = 0;
  let inTF = false;

  while (i < rawLines.length) {
    const line = rawLines[i];

    if (isTFHeader(line))  { inTF = true;  i++; continue; }
    if (isMCQHeader(line)) { inTF = false; i++; continue; }

    if (isQuestion(line)) {
      inTF = false;
      let qText = stripNum(line);
      const opts: string[] = [];
      let ans: string | undefined;
      i++;

      while (i < rawLines.length) {
        const next = rawLines[i];
        if (isAnswerLine(next)) { ans = getAnswerFromLine(next); i++; continue; }
        if (isLetterOpt(next)) { const t = getLetterOpt(next); if (t) { opts.push(t); i++; continue; } }
        if (hasTab(next)) {
          const parts = getTabParts(next);
          if (parts.length >= 1) { opts.push(...parts); i++; continue; }
        }
        if (isBreak(next)) break;
        if (opts.length === 0 && next.length > 3 && !isAnswerLine(next) && !hasTab(next)) {
          qText += ' ' + next; i++; continue;
        }
        break;
      }

      if (qText.length < 5) continue;

      if (opts.length >= 2) {
        questions.push(buildQuestion(qText, opts, ans));
      } else if (opts.length === 0) {
        questions.push({ text: qText, type: 'TrueFalse', options: ['صح', 'خطأ'], correctAnswer: ans });
      }
      continue;
    }

    if (inTF && isStmt(line)) {
      questions.push({ text: line, type: 'TrueFalse', options: ['صح', 'خطأ'] });
      i++; continue;
    }

    if (hasTab(line)) {
      const parts = getTabParts(line);
      if (parts.length >= 1) {
        const allOpts: string[] = [...parts];
        i++;
        while (i < rawLines.length && hasTab(rawLines[i]) && !isBreak(rawLines[i])) {
          allOpts.push(...getTabParts(rawLines[i]));
          i++;
        }
        const prevQ = questions[questions.length - 1];
        if (prevQ && prevQ.options.length === 0) {
          prevQ.options = allOpts;
          if (isTrueFalseQuestion(allOpts, prevQ.text)) prevQ.type = 'TrueFalse';
        }
        continue;
      }
    }

    i++;
  }

  return questions.filter(q =>
    q.text.length >= 5 &&
    (q.type === 'TrueFalse' || q.options.length >= 2)
  );
}

const emptyForm = { title: '', subject: '', grade: '', description: '', coverImageUrl: '', teacherName: '', teacherImage: '', whatsappUrl: '', youtubeUrl: '', facebookUrl: '', showSupportButton: true };

export default function AdminQuizzes() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [modal, setModal] = useState<'create' | 'edit' | 'questions' | null>(null);
  const [editing, setEditing] = useState<InteractiveQuizSummary | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeQuiz, setActiveQuiz] = useState<InteractiveQuiz | null>(null);

  const [importTab, setImportTab] = useState<'paste' | 'pdf'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [parsed, setParsed] = useState<ParsedQuestion[] | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [modalTab, setModalTab] = useState<'import' | 'questions' | 'settings' | 'results'>('import');
  const [quizSettings, setQuizSettings] = useState({ stageCount: 3, questionsPerStage: 20, mcqPerStage: 0, tfPerStage: 0, goldenEvery: 10, timerEnabled: false, timerDuration: 30 });
  const [settingsTab, setSettingsTab] = useState<'general' | 'mcq' | 'tf'>('general');

  const [coverImgUploading, setCoverImgUploading] = useState(false);
  const coverImgRef = useRef<HTMLInputElement>(null);
  const [teacherImgUploading, setTeacherImgUploading] = useState(false);
  const teacherImgRef = useRef<HTMLInputElement>(null);

  const [linkEditorId, setLinkEditorId] = useState<number | null>(null);
  const [linkEditorUrl, setLinkEditorUrl] = useState('');

  const [savedEditId, setSavedEditId] = useState<number | null>(null);
  const [savedEditData, setSavedEditData] = useState<{ text: string; type: 'MCQ' | 'TrueFalse'; options: string[]; correctAnswer?: string } | null>(null);
  const [savedAiLoadingIds, setSavedAiLoadingIds] = useState<Set<number>>(new Set());

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['interactive-quizzes'],
    queryFn: quizzesApi.getAll,
  });

  const loadQuiz = useQuery({
    queryKey: ['interactive-quiz', activeQuiz?.id],
    queryFn: () => quizzesApi.getById(activeQuiz!.id),
    enabled: !!activeQuiz,
  });

  const createMutation = useMutation({
    mutationFn: quizzesApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactive-quizzes'] }); toast.success('تم إنشاء الاختبار!'); closeModal(); },
    onError: () => toast.error('فشل في الإنشاء'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof emptyForm }) => quizzesApi.update(id, data),
    onSuccess: (updatedQuiz) => {
      qc.setQueryData<InteractiveQuizSummary[]>(['interactive-quizzes'], old =>
        old?.map(q => q.id === updatedQuiz.id
          ? { ...q, ...updatedQuiz, questionCount: q.questionCount }
          : q
        )
      );
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      toast.success('تم التحديث!');
      closeModal();
    },
    onError: () => toast.error('فشل في التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: quizzesApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactive-quizzes'] }); toast.success('تم الحذف'); },
  });

  const duplicateMutation = useMutation({
    mutationFn: quizzesApi.duplicate,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['interactive-quizzes'] }); toast.success('تم تكرار الاختبار!'); },
    onError: () => toast.error('فشل في التكرار'),
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: quizzesApi.deleteQuestion,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactive-quiz', activeQuiz?.id] });
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { text: string; type: string; options: string[]; correctAnswer?: string } }) =>
      quizzesApi.updateQuestion(id, {
        text: data.text,
        type: data.type as 'MCQ' | 'TrueFalse',
        options: data.options.length ? JSON.stringify(data.options) : undefined,
        correctAnswer: data.correctAnswer,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['interactive-quiz', activeQuiz?.id] });
      setSavedEditId(null);
      setSavedEditData(null);
      toast.success('تم تحديث السؤال');
    },
    onError: () => toast.error('فشل في التحديث'),
  });

  const bulkMutation = useMutation({
    mutationFn: ({ id, qs }: { id: number; qs: ParsedQuestion[] }) =>
      quizzesApi.bulkAddQuestions(id, qs.map((q) => ({
        text: q.text,
        type: q.type,
        options: q.options.length ? JSON.stringify(q.options) : undefined,
        correctAnswer: q.correctAnswer,
      }))),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['interactive-quiz', id] });
      qc.invalidateQueries({ queryKey: ['interactive-quizzes'] });
      toast.success(`تم إضافة ${parsed?.length} سؤال!`);
      setParsed(null);
      setPastedText('');
    },
    onError: () => toast.error('فشل في الإضافة'),
  });

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModal('create'); };
  const openEdit = async (q: InteractiveQuizSummary) => {
    setEditing(q);
    setForm({ title: q.title, subject: q.subject ?? '', grade: q.grade ?? '', description: q.description ?? '', coverImageUrl: q.coverImageUrl ?? '', teacherName: q.teacherName ?? '', teacherImage: q.teacherImage ?? '', whatsappUrl: q.whatsappUrl ?? '', youtubeUrl: q.youtubeUrl ?? '', facebookUrl: q.facebookUrl ?? '', showSupportButton: q.showSupportButton ?? true });
    setModal('edit');
    try {
      const fresh = await quizzesApi.getById(q.id);
      setForm({ title: fresh.title, subject: fresh.subject ?? '', grade: fresh.grade ?? '', description: fresh.description ?? '', coverImageUrl: fresh.coverImageUrl ?? '', teacherName: fresh.teacherName ?? '', teacherImage: fresh.teacherImage ?? '', whatsappUrl: fresh.whatsappUrl ?? '', youtubeUrl: fresh.youtubeUrl ?? '', facebookUrl: fresh.facebookUrl ?? '', showSupportButton: fresh.showSupportButton ?? true });
    } catch { }
  };
  const openQuestions = (q: InteractiveQuizSummary) => {
    const saved = localStorage.getItem(`quiz-settings-${q.id}`);
    const def = { stageCount: 3, questionsPerStage: 20, mcqPerStage: 0, tfPerStage: 0, goldenEvery: 10, timerEnabled: false, timerDuration: 30 };
    if (saved) try { setQuizSettings({ ...def, ...JSON.parse(saved) }); } catch { setQuizSettings(def); }
    else setQuizSettings(def);
    setModalTab('import');
    setActiveQuiz({ ...q, questions: [] });
    setParsed(null);
    setPastedText('');
    setModal('questions');
  };
  const closeModal = () => { setModal(null); setEditing(null); setActiveQuiz(null); setForm(emptyForm); setParsed(null); setPastedText(''); setModalTab('import'); };

  const saveQuizSettings = () => {
    if (!activeQuiz) return;
    localStorage.setItem(`quiz-settings-${activeQuiz.id}`, JSON.stringify(quizSettings));
    toast.success('تم حفظ إعدادات الاختبار');
  };

  const exportResults = () => {
    if (!activeQuiz) return;
    const data: { name: string; score: number; correct: number; total: number; pct: number; date: string }[] = JSON.parse(localStorage.getItem(`quiz-leaderboard-${activeQuiz.id}`) ?? '[]');
    if (!data.length) { toast.error('لا توجد نتائج بعد'); return; }
    const csv = 'الاسم,النقاط,الصحيح,النسبة,التاريخ\n' + data.map(r => `${r.name},${r.score},${r.correct}/${r.total},${r.pct}%,${r.date}`).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeQuiz.title}-results.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير النتائج');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('العنوان مطلوب'); return; }
    if (modal === 'edit' && editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const parsePaste = () => {
    if (!pastedText.trim()) { toast.error('الصق النص أولاً'); return; }
    const result = parsePdfText(pastedText);
    if (!result.length) { toast.error('لم يتم العثور على أسئلة. تحقق من تنسيق النص'); return; }
    setParsed(result);
    toast.success(`تم العثور على ${result.length} سؤال`);
  };

  const extractPdf = async (file: File, useAI = false) => {
    setPdfLoading(true);
    let extractedText = '';
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      let fullText = '';

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();

        type TextItem = { str: string; transform: number[]; width: number };
        const items = (content.items as unknown[]).filter((item): item is TextItem => typeof item === 'object' && item !== null && 'str' in item && typeof (item as TextItem).str === 'string' && (item as TextItem).str.trim() !== '');

        const LINE_THRESHOLD = 4;
        const lineMap = new Map<number, TextItem[]>();
        for (const item of items) {
          const y = Math.round(item.transform[5] / LINE_THRESHOLD) * LINE_THRESHOLD;
          if (!lineMap.has(y)) lineMap.set(y, []);
          lineMap.get(y)!.push(item);
        }

        const sortedYs = [...lineMap.keys()].sort((a, b) => b - a);
        const pageLines: string[] = [];
        for (const y of sortedYs) {
          const lineItems = lineMap.get(y)!.sort((a, b) => b.transform[4] - a.transform[4]);
          if (!lineItems.length) continue;
          let lineText = lineItems[0].str;
          for (let j = 1; j < lineItems.length; j++) {
            const prev = lineItems[j - 1];
            const curr = lineItems[j];
            const prevLeftEdge = prev.transform[4] - Math.abs(prev.width ?? 0);
            const gap = prevLeftEdge - curr.transform[4];
            lineText += (gap > 40 ? '\t' : ' ') + curr.str;
          }
          const trimmed = lineText.trim();
          if (trimmed) pageLines.push(trimmed);
        }
        fullText += pageLines.join('\n') + '\n';
      }

      extractedText = fullText;
      setPastedText(fullText);

      if (!useAI) {
        const result = parsePdfText(fullText);
        if (!result.length) {
          toast('لم يُعثر على أسئلة تلقائياً — النص مُستخرج في حقل اللصق، يمكنك التحليل بالذكاء الاصطناعي', { icon: '⚠️' });
        } else {
          setParsed(result);
          toast.success(`تم العثور على ${result.length} سؤال`);
        }
      }
    } catch {
      toast.error('فشل في قراءة الـ PDF');
      return;
    } finally {
      setPdfLoading(false);
    }

    if (useAI && extractedText.trim()) {
      await parseWithAI(extractedText);
    }
  };

  const parseWithAI = async (text?: string) => {
    const src = (text ?? pastedText).trim();
    if (!src) { toast.error('لا يوجد نص للتحليل — استخرج PDF أو الصق النص أولاً'); return; }

    const CHUNK = 6000;
    const chunks: string[] = [];
    if (src.length <= CHUNK) {
      chunks.push(src);
    } else {
      const lines = src.split('\n');
      let cur = '';
      for (const line of lines) {
        if (cur.length + line.length > CHUNK && cur.length > 0) {
          chunks.push(cur.trim());
          cur = line + '\n';
        } else {
          cur += line + '\n';
        }
      }
      if (cur.trim()) chunks.push(cur.trim());
    }

    setAiLoading(true);
    const allQs: ParsedQuestion[] = [];
    try {
      for (let ci = 0; ci < chunks.length; ci++) {
        setAiProgress(`جاري التحليل... جزء ${ci + 1} من ${chunks.length}`);
        const res = await aiApi.parseQuiz(chunks[ci]);
        for (const q of res.questions) {
          allQs.push({
            text: q.text,
            type: q.type,
            options: q.options.length ? q.options : (q.type === 'TrueFalse' ? ['صح', 'خطأ'] : []),
            correctAnswer: q.correctAnswer ?? undefined,
          });
        }
      }
      if (!allQs.length) { toast.error('لم يتمكن الذكاء الاصطناعي من استخراج أسئلة. جرّب التحليل اليدوي.'); return; }
      setParsed(allQs);
      toast.success(`🤖 استخرج الذكاء الاصطناعي ${allQs.length} سؤال`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? 'فشل التحليل بالذكاء الاصطناعي');
    } finally {
      setAiLoading(false);
      setAiProgress('');
    }
  };

  const saveQuestions = () => {
    if (!parsed?.length || !activeQuiz) return;
    bulkMutation.mutate({ id: activeQuiz.id, qs: parsed });
  };

  const detectAnswerForSaved = async (q: InteractiveQuestion) => {
    setSavedAiLoadingIds(ids => new Set([...ids, q.id]));
    try {
      const opts: string[] = q.options ? JSON.parse(q.options) : [];
      const res = await aiApi.detectAnswer(q.text, opts, q.type);
      if (res.correctAnswer !== null && res.correctAnswer !== undefined) {
        await quizzesApi.updateQuestion(q.id, {
          text: q.text,
          type: q.type,
          options: q.options ?? undefined,
          correctAnswer: res.correctAnswer,
        });
        qc.invalidateQueries({ queryKey: ['interactive-quiz', activeQuiz?.id] });
        toast.success('✅ تم تحديد الإجابة الصحيحة');
      } else {
        toast.error(res.hint ? `لم يتمكن AI من التحديد — ${res.hint}` : 'لم يتمكن الذكاء الاصطناعي من تحديد الإجابة');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg ?? 'فشل الاتصال بخدمة AI');
    } finally {
      setSavedAiLoadingIds(ids => { const n = new Set(ids); n.delete(q.id); return n; });
    }
  };

  const quizData = loadQuiz.data;

  return (
    <>
      <div className="space-y-6 animate-fade-in" dir="rtl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="text-primary-500" size={26} />
              الاختبارات التفاعلية
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">إنشاء وإدارة اختبارات تفاعلية جذابة للعرض على يوتيوب</p>
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> إنشاء اختبار
          </button>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" />
        ) : !quizzes?.length ? (
          <div className="card p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">لا توجد اختبارات بعد</p>
            <button onClick={openCreate} className="btn-primary mt-4">إنشاء أول اختبار</button>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-600 flex items-center justify-center shrink-0">
                  <BookOpen size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{quiz.title}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    {quiz.subject && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{quiz.subject}</span>}
                    {quiz.grade && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">{quiz.grade}</span>}
                    <span className="text-xs text-gray-500 dark:text-gray-400">{quiz.questionCount} سؤال</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/quiz-presenter/${quiz.id}`)}
                    title="تشغيل العرض التقديمي"
                    className="p-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <Play size={16} />
                  </button>
                  <button
                    onClick={() => openQuestions(quiz)}
                    title="إدارة الأسئلة"
                    className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 hover:bg-primary-200 transition-colors"
                  >
                    <ClipboardList size={16} />
                  </button>
                  <button
                    onClick={() => openEdit(quiz)}
                    title="تعديل"
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (linkEditorId === quiz.id) {
                        setLinkEditorId(null);
                      } else {
                        setLinkEditorId(quiz.id);
                        setLinkEditorUrl(`${window.location.origin}/quiz/${quiz.id}`);
                      }
                    }}
                    title="الرابط العام (بدون تسجيل)"
                    className={`p-2.5 rounded-xl transition-colors ${linkEditorId === quiz.id ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30'}`}
                  >
                    <Link2 size={16} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`تكرار "${quiz.title}" بكل أسئلته؟`)) duplicateMutation.mutate(quiz.id); }}
                    title="تكرار الاختبار"
                    disabled={duplicateMutation.isPending}
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => { if (window.confirm(`حذف "${quiz.title}"؟`)) deleteMutation.mutate(quiz.id); }}
                    title="حذف"
                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {linkEditorId === quiz.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700" dir="rtl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">🔗 الرابط العام (قابل للتعديل)</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { navigator.clipboard.writeText(linkEditorUrl); toast.success('تم نسخ الرابط!'); }}
                        className="shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        نسخ
                      </button>
                      <input
                        type="text"
                        value={linkEditorUrl}
                        onChange={e => setLinkEditorUrl(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs font-mono outline-none focus:border-purple-400 transition-colors text-left"
                        dir="ltr"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {(modal === 'create' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modal === 'create' ? 'إنشاء اختبار جديد' : 'تعديل الاختبار'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">عنوان الاختبار *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="مثال: مراجعة شهر مارس — تكنولوجيا" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">المادة</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-field" placeholder="تكنولوجيا" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الصف</label>
                  <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="input-field" placeholder="الصف الرابع" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">الوصف</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field min-h-[70px] resize-none" placeholder="وصف اختياري" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">🖼️ صورة الغلاف (اختياري)</label>
                <div className="flex gap-2">
                  <input value={form.coverImageUrl} onChange={e => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} className="input-field flex-1" placeholder="https://... أو /teacher.png" dir="ltr" />
                  <button
                    type="button"
                    onClick={() => coverImgRef.current?.click()}
                    disabled={coverImgUploading}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium shrink-0 disabled:opacity-50"
                  >
                    {coverImgUploading ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Upload size={14} />}
                    {coverImgUploading ? '' : 'رفع'}
                  </button>
                  <input
                    ref={coverImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCoverImgUploading(true);
                      try {
                        const url = await uploadsApi.image(file);
                        setForm(f => ({ ...f, coverImageUrl: url }));
                        toast.success('تم رفع الصورة');
                      } catch {
                        toast.error('فشل رفع الصورة');
                      } finally {
                        setCoverImgUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                {form.coverImageUrl && (
                  <img src={form.coverImageUrl} alt="" className="mt-2 h-16 rounded-xl object-cover border border-gray-200 dark:border-gray-600" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <hr className="border-gray-100 dark:border-gray-700" />
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">⚙️ إعدادات البانر السفلي</p>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">اسم المعلم</label>
                      <input value={form.teacherName} onChange={e => setForm(f => ({ ...f, teacherName: e.target.value }))} className="input-field text-sm" placeholder="مستر عامر تمراز" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">صورة المعلم</label>
                      <div className="flex gap-1.5">
                        <input value={form.teacherImage} onChange={e => setForm(f => ({ ...f, teacherImage: e.target.value }))} className="input-field text-sm flex-1 min-w-0" placeholder="/teacher2.png" dir="ltr" />
                        <button
                          type="button"
                          onClick={() => teacherImgRef.current?.click()}
                          disabled={teacherImgUploading}
                          className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs font-medium shrink-0 disabled:opacity-50"
                        >
                          {teacherImgUploading ? <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <Upload size={12} />}
                          {teacherImgUploading ? '' : 'رفع'}
                        </button>
                        <input
                          ref={teacherImgRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async e => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setTeacherImgUploading(true);
                            try {
                              const url = await uploadsApi.image(file);
                              setForm(f => ({ ...f, teacherImage: url }));
                              toast.success('تم رفع الصورة');
                            } catch {
                              toast.error('فشل رفع الصورة');
                            } finally {
                              setTeacherImgUploading(false);
                              e.target.value = '';
                            }
                          }}
                        />
                      </div>
                      {form.teacherImage && (
                        <img src={form.teacherImage} alt="" className="mt-1.5 w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" onError={e => (e.currentTarget.style.display = 'none')} />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">واتساب (رابط القناة)</label>
                    <input value={form.whatsappUrl} onChange={e => setForm(f => ({ ...f, whatsappUrl: e.target.value }))} className="input-field text-sm" placeholder="https://whatsapp.com/channel/..." dir="ltr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">يوتيوب</label>
                      <input value={form.youtubeUrl} onChange={e => setForm(f => ({ ...f, youtubeUrl: e.target.value }))} className="input-field text-sm" placeholder="https://youtube.com/@..." dir="ltr" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">فيسبوك</label>
                      <input value={form.facebookUrl} onChange={e => setForm(f => ({ ...f, facebookUrl: e.target.value }))} className="input-field text-sm" placeholder="https://facebook.com/..." dir="ltr" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div
                      onClick={() => setForm(f => ({ ...f, showSupportButton: !f.showSupportButton }))}
                      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${form.showSupportButton ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.showSupportButton ? 'right-1' : 'left-1'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إظهار زر الدعم المادي 💛</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending || updateMutation.isPending ? 'جاري الحفظ...' : modal === 'create' ? 'إنشاء' : 'حفظ'}
                </button>
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'questions' && activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeQuiz.title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{quizData?.questions?.length ?? 0} سؤال محفوظ</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} /></button>
            </div>

            {!parsed && (
              <div className="flex gap-1 px-6 pt-4 shrink-0 flex-wrap">
                {([
                  ['import', '📥 استيراد'],
                  ['questions', `📋 الأسئلة${quizData?.questions?.length ? ` (${quizData.questions.length})` : ''}`],
                  ['settings', '⚙️ الإعدادات'],
                  ['results', '📊 النتائج'],
                ] as const).map(([tab, label]) => (
                  <button
                    key={tab}
                    onClick={() => setModalTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${modalTab === tab ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!parsed ? (
                <>
                  {modalTab === 'settings' && (
                    <div className="space-y-5" dir="rtl">
                      {/* Settings type tabs */}
                      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                        {([['general', '⚙️ عام'], ['mcq', '📝 اختيارات'], ['tf', '✅ صح/خطأ']] as const).map(([t, label]) => (
                          <button key={t} onClick={() => setSettingsTab(t)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${settingsTab === t ? 'bg-primary-500 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                            {label}
                          </button>
                        ))}
                      </div>

                      {settingsTab === 'general' && (<>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Layers size={14} /> عدد المراحل: <span className="text-primary-500 font-bold">{quizSettings.stageCount}</span></label>
                          <input type="range" min={1} max={10} value={quizSettings.stageCount} onChange={e => setQuizSettings(s => ({ ...s, stageCount: Number(e.target.value) }))} className="w-full accent-primary-500" />
                          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>مرحلة واحدة</span><span>10 مراحل</span></div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2"><Star size={14} className="text-yellow-500" /> السؤال الذهبي كل: <span className="text-yellow-500 font-bold">{quizSettings.goldenEvery === 0 ? 'معطّل' : `${quizSettings.goldenEvery} سؤال`}</span></label>
                          <input type="range" min={0} max={20} step={1} value={quizSettings.goldenEvery} onChange={e => setQuizSettings(s => ({ ...s, goldenEvery: Number(e.target.value) }))} className="w-full accent-yellow-500" />
                          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>معطّل</span><span>كل 20</span></div>
                        </div>
                        <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Timer size={14} /> تفعيل المؤقت</span>
                          <button onClick={() => setQuizSettings(s => ({ ...s, timerEnabled: !s.timerEnabled }))} className={`w-12 h-6 rounded-full transition-colors relative ${quizSettings.timerEnabled ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow ${quizSettings.timerEnabled ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                        {quizSettings.timerEnabled && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">مدة السؤال: <span className="text-primary-500 font-bold">{quizSettings.timerDuration} ثانية</span></label>
                            <input type="range" min={10} max={120} step={5} value={quizSettings.timerDuration} onChange={e => setQuizSettings(s => ({ ...s, timerDuration: Number(e.target.value) }))} className="w-full accent-primary-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>10 ث</span><span>120 ث</span></div>
                          </div>
                        )}
                      </>)}

                      {settingsTab === 'mcq' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl">
                            <span className="text-3xl">📝</span>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">أسئلة الاختيارات (MCQ)</p>
                              <p className="text-xs text-gray-500 mt-0.5">تحديد عدد أسئلة الاختيار من متعدد في كل مرحلة</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">اختيارات كل مرحلة: <span className="text-blue-500 font-bold">{quizSettings.mcqPerStage === 0 ? 'تلقائي' : quizSettings.mcqPerStage}</span></label>
                            <input type="range" min={0} max={40} step={1} value={quizSettings.mcqPerStage} onChange={e => setQuizSettings(s => ({ ...s, mcqPerStage: Number(e.target.value) }))} className="w-full accent-blue-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>تلقائي</span><span>40 سؤال</span></div>
                            <p className="text-xs text-gray-400 mt-2">🔵 0 = توزيع تلقائي على عدد المراحل</p>
                          </div>
                        </div>
                      )}

                      {settingsTab === 'tf' && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                            <span className="text-3xl">✅</span>
                            <div>
                              <p className="font-bold text-gray-800 dark:text-gray-200">أسئلة صح وخطأ (TF)</p>
                              <p className="text-xs text-gray-500 mt-0.5">تظهر أولاً في كل مرحلة قبل الاختيارات</p>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">صح/خطأ كل مرحلة: <span className="text-emerald-500 font-bold">{quizSettings.tfPerStage === 0 ? 'تلقائي' : quizSettings.tfPerStage}</span></label>
                            <input type="range" min={0} max={30} step={1} value={quizSettings.tfPerStage} onChange={e => setQuizSettings(s => ({ ...s, tfPerStage: Number(e.target.value) }))} className="w-full accent-emerald-500" />
                            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>تلقائي</span><span>30 سؤال</span></div>
                            <p className="text-xs text-gray-400 mt-2">🟢 0 = توزيع تلقائي على عدد المراحل</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 mb-3">الإعدادات تُحفظ في المتصفح وتُطبَّق تلقائياً عند فتح الاختبار.</p>
                        <button onClick={saveQuizSettings} className="btn-primary flex items-center gap-2"><Settings size={15} /> حفظ الإعدادات</button>
                      </div>
                    </div>
                  )}

                  {modalTab === 'results' && (
                    <div className="space-y-4" dir="rtl">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Trophy size={16} className="text-yellow-500" /> قائمة المتصدرين</h3>
                        <button onClick={exportResults} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-sm font-medium transition-colors">
                          <Download size={14} /> تصدير CSV
                        </button>
                      </div>
                      {(() => {
                        const lb: { name: string; score: number; correct: number; total: number; pct: number; date: string }[] = JSON.parse(localStorage.getItem(`quiz-leaderboard-${activeQuiz.id}`) ?? '[]');
                        if (!lb.length) return (
                          <div className="text-center py-10 text-gray-400">
                            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                            <p>لا توجد نتائج بعد — شارك الاختبار مع الطلاب</p>
                          </div>
                        );
                        return (
                          <div className="space-y-2 max-h-80 overflow-y-auto">
                            {lb.map((r, i) => {
                              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
                              return (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                  <span className="text-lg w-8 text-center shrink-0">{medal}</span>
                                  <span className="flex-1 font-semibold text-gray-800 dark:text-gray-200">{r.name}</span>
                                  <span className="text-yellow-500 font-bold text-sm">{r.score} نقطة</span>
                                  <span className="text-emerald-500 text-sm font-medium">{r.correct}/{r.total}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${r.pct >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : r.pct >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>{r.pct}%</span>
                                  <span className="text-xs text-gray-400 shrink-0">{r.date}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => { if (window.confirm('هل تريد مسح جميع النتائج؟')) { localStorage.removeItem(`quiz-leaderboard-${activeQuiz.id}`); toast.success('تم مسح النتائج'); setModalTab('import'); setModalTab('results'); } }}
                          className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                        >
                          <X size={13} /> مسح جميع النتائج
                        </button>
                      </div>
                    </div>
                  )}

                  {modalTab === 'import' && <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => setImportTab('paste')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${importTab === 'paste' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                      >
                        📋 لصق النص
                      </button>
                      <button
                        onClick={() => setImportTab('pdf')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${importTab === 'pdf' ? 'bg-primary-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                      >
                        📄 رفع PDF
                      </button>
                    </div>

                    {(aiLoading) && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700 mb-3">
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">{aiProgress}</span>
                      </div>
                    )}

                    {importTab === 'paste' ? (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">الصق نص الأسئلة بالتنسيق: رقم- السؤال / أ- الخيار</p>
                        <textarea
                          value={pastedText}
                          onChange={e => setPastedText(e.target.value)}
                          className="input-field min-h-[150px] resize-none font-mono text-sm"
                          placeholder={`1- ما هو أكبر كوكب في المجموعة الشمسية؟\nأ- الأرض\nب- المريخ\nج- زحل\nد- المشتري\nالإجابة: د\n\n2- الشمس نجم (صح/خطأ)`}
                        />
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={parsePaste} className="btn-primary flex items-center gap-2 text-sm">
                            <CheckCircle size={15} /> تحليل يدوي
                          </button>
                          <button onClick={() => parseWithAI()} disabled={aiLoading || !pastedText.trim()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors">
                            <Sparkles size={15} /> تحليل بالذكاء الاصطناعي
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400">ارفع ملف PDF وسيتم استخراج الأسئلة تلقائياً</p>
                        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) extractPdf(f, false); e.target.value=''; }} />
                        <input id="pdf-ai-input" type="file" accept=".pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) extractPdf(f, true); e.target.value=''; }} />
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => fileRef.current?.click()} disabled={pdfLoading || aiLoading} className="btn-primary flex items-center gap-2 text-sm">
                            {pdfLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري القراءة...</> : <><Upload size={15} /> PDF (يدوي)</>}
                          </button>
                          <button
                            onClick={() => document.getElementById('pdf-ai-input')?.click()}
                            disabled={pdfLoading || aiLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                          >
                            <Sparkles size={15} /> PDF (ذكاء اصطناعي)
                          </button>
                        </div>
                        {pastedText && !pdfLoading && (
                          <button onClick={() => parseWithAI(pastedText)} disabled={aiLoading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium w-full justify-center transition-colors">
                            <Sparkles size={15} /> حلّل النص المستخرج بالذكاء الاصطناعي
                          </button>
                        )}
                      </div>
                    )}
                  </div>}

                  {modalTab === 'questions' && (loadQuiz.isLoading ? (
                    <LoadingSpinner />
                  ) : quizData?.questions?.length ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">الأسئلة المحفوظة ({quizData.questions.length})</h3>
                        <span className="text-xs text-gray-400">اضغط <Sparkles size={10} className="inline mx-0.5 text-purple-500" /> لتحديد الإجابة بالذكاء الاصطناعي</span>
                      </div>
                      <div className="space-y-3">
                        {quizData.questions.map((q: InteractiveQuestion, i: number) => {
                          const opts: string[] = q.options ? (() => { try { return JSON.parse(q.options!); } catch { return []; } })() : [];
                          const correctIdx = q.type === 'TrueFalse'
                            ? (q.correctAnswer === 'true' ? 0 : q.correctAnswer === 'false' ? 1 : -1)
                            : (q.correctAnswer != null ? Number(q.correctAnswer) : -1);
                          const isEditing = savedEditId === q.id;
                          const isAiLoading = savedAiLoadingIds.has(q.id);
                          return (
                            <div key={q.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden">
                              {isEditing && savedEditData ? (
                                <div className="p-4 space-y-3" dir="rtl">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-primary-500">تعديل السؤال {i + 1}</span>
                                    <div className="flex gap-2">
                                      <button onClick={() => { setSavedEditId(null); setSavedEditData(null); }} className="text-xs text-gray-500 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">إلغاء</button>
                                      <button
                                        disabled={updateQuestionMutation.isPending}
                                        onClick={() => updateQuestionMutation.mutate({ id: q.id, data: savedEditData })}
                                        className="text-xs bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-400 disabled:opacity-50"
                                      >
                                        {updateQuestionMutation.isPending ? 'حفظ...' : 'حفظ'}
                                      </button>
                                    </div>
                                  </div>
                                  <textarea
                                    value={savedEditData.text}
                                    onChange={e => setSavedEditData({ ...savedEditData, text: e.target.value })}
                                    className="input-field text-sm min-h-[60px] resize-none"
                                    placeholder="نص السؤال"
                                  />
                                  <div className="flex items-center gap-3">
                                    <label className="text-xs text-gray-500 shrink-0">النوع:</label>
                                    <select
                                      value={savedEditData.type}
                                      onChange={e => {
                                        const t = e.target.value as 'MCQ' | 'TrueFalse';
                                        setSavedEditData({ ...savedEditData, type: t, options: t === 'TrueFalse' ? ['صح', 'خطأ'] : (savedEditData.options.length >= 4 ? savedEditData.options : ['', '', '', '']), correctAnswer: undefined });
                                      }}
                                      className="input-field text-sm py-1 flex-1"
                                    >
                                      <option value="MCQ">اختيار متعدد (MCQ)</option>
                                      <option value="TrueFalse">صح أو خطأ</option>
                                    </select>
                                  </div>
                                  {savedEditData.type === 'MCQ' && (
                                    <div className="space-y-2">
                                      <p className="text-xs text-gray-500">الخيارات — اضغط الحرف لتحديد الصحيح:</p>
                                      {savedEditData.options.map((opt, j) => (
                                        <div key={j} className="flex items-center gap-2">
                                          <button
                                            onClick={() => setSavedEditData({ ...savedEditData, correctAnswer: String(j) })}
                                            className={`w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${savedEditData.correctAnswer === String(j) ? 'bg-green-500 text-white ring-2 ring-green-300' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}
                                          >
                                            {ARABIC_OPTIONS[j]}
                                          </button>
                                          <input
                                            value={opt}
                                            onChange={e => {
                                              const o = [...savedEditData.options];
                                              o[j] = e.target.value;
                                              setSavedEditData({ ...savedEditData, options: o });
                                            }}
                                            className="input-field text-sm py-1 flex-1"
                                            placeholder={`الخيار ${ARABIC_OPTIONS[j]}`}
                                          />
                                          {savedEditData.options.length > 2 && (
                                            <button
                                              onClick={() => {
                                                const o = savedEditData.options.filter((_, i) => i !== j);
                                                const ca = savedEditData.correctAnswer === String(j) ? undefined : savedEditData.correctAnswer;
                                                setSavedEditData({ ...savedEditData, options: o, correctAnswer: ca });
                                              }}
                                              className="text-red-400 hover:text-red-600 shrink-0 text-lg leading-none"
                                              title="حذف الخيار"
                                            >×</button>
                                          )}
                                        </div>
                                      ))}
                                      {savedEditData.options.length < 4 && (
                                        <button
                                          onClick={() => setSavedEditData({ ...savedEditData, options: [...savedEditData.options, ''] })}
                                          className="text-xs text-primary-500 hover:text-primary-400 flex items-center gap-1 mt-1"
                                        >
                                          + إضافة خيار ({savedEditData.options.length}/4)
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  {savedEditData.type === 'TrueFalse' && (
                                    <div className="flex items-center gap-3">
                                      <p className="text-xs text-gray-500 shrink-0">الإجابة:</p>
                                      {[{ val: 'true', label: '✅ صح' }, { val: 'false', label: '❌ خطأ' }].map(o => (
                                        <button key={o.val} onClick={() => setSavedEditData({ ...savedEditData, correctAnswer: o.val })}
                                          className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${savedEditData.correctAnswer === o.val ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                                          {o.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-3" dir="rtl">
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs font-bold text-primary-500 mt-0.5 shrink-0 w-5 text-center">{i + 1}</span>
                                    <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{q.text}</p>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => detectAnswerForSaved(q)}
                                        disabled={isAiLoading}
                                        title="تحديد الإجابة بالذكاء الاصطناعي"
                                        className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 hover:bg-purple-200 transition-colors disabled:opacity-40"
                                      >
                                        {isAiLoading ? <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <Sparkles size={13} />}
                                      </button>
                                      <button
                                        onClick={() => { setSavedEditId(q.id); setSavedEditData({ text: q.text, type: q.type, options: opts.length ? opts : ['', '', '', ''], correctAnswer: q.correctAnswer ?? undefined }); }}
                                        title="تعديل"
                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                      >
                                        <Pencil size={13} />
                                      </button>
                                      <button onClick={() => deleteQuestionMutation.mutate(q.id)} title="حذف" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1.5 mb-2 mr-7">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.type === 'TrueFalse' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
                                      {q.type === 'TrueFalse' ? 'صح/خطأ' : 'MCQ'}
                                    </span>
                                    {correctIdx >= 0
                                      ? <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5 font-medium"><CheckCircle size={11} /> الإجابة: {q.type === 'TrueFalse' ? (q.correctAnswer === 'true' ? 'صح' : 'خطأ') : (opts[correctIdx] ?? `خيار ${correctIdx + 1}`)}</span>
                                      : <span className="text-xs text-amber-500 flex items-center gap-0.5"><AlertCircle size={11} /> بدون إجابة — اضغط <Sparkles size={10} className="inline mx-0.5" /> للتحديد</span>
                                    }
                                  </div>
                                  {opts.length > 0 && (
                                    <div className="grid grid-cols-2 gap-1 mr-7">
                                      {opts.map((opt, j) => (
                                        <div key={j} className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${j === correctIdx ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold border border-green-300 dark:border-green-700' : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'}`}>
                                          <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center shrink-0 font-bold ${j === correctIdx ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>{ARABIC_OPTIONS[j]}</span>
                                          <span className="truncate">{opt}</span>
                                          {j === correctIdx && <CheckCircle size={10} className="shrink-0 text-green-500" />}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">
                      <FileText size={40} className="mx-auto mb-3 opacity-40" />
                      <p className="text-sm">لا توجد أسئلة بعد</p>
                      <button onClick={() => setModalTab('import')} className="mt-3 text-primary-500 text-sm hover:underline">← اذهب للاستيراد</button>
                    </div>
                  ))}
                </>
              ) : (
                <ParsedPreview
                  parsed={parsed}
                  setParsed={setParsed}
                  onSave={saveQuestions}
                  onBack={() => setParsed(null)}
                  saving={bulkMutation.isPending}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const LETTERS = ['أ', 'ب', 'ج', 'د'];

function ParsedPreview({ parsed, setParsed, onSave, onBack, saving }: {
  parsed: ParsedQuestion[];
  setParsed: (qs: ParsedQuestion[] | null) => void;
  onSave: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editQ, setEditQ] = useState<ParsedQuestion | null>(null);

  const startEdit = (i: number) => {
    setEditIdx(i);
    setEditQ({ ...parsed[i], options: [...parsed[i].options] });
  };

  const saveEdit = () => {
    if (editIdx === null || !editQ) return;
    setParsed(parsed.map((q, i) => i === editIdx ? editQ : q));
    setEditIdx(null);
    setEditQ(null);
  };

  const remove = (i: number) => {
    setParsed(parsed.filter((_, idx) => idx !== i));
    if (editIdx === i) { setEditIdx(null); setEditQ(null); }
  };

  const isCorrect = (q: ParsedQuestion, j: number) =>
    q.correctAnswer === String(j) ||
    (q.type === 'TrueFalse' && ((j === 0 && q.correctAnswer === 'true') || (j === 1 && q.correctAnswer === 'false')));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            {parsed.length} سؤال — راجع وعدّل قبل الحفظ
          </span>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">← رجوع</button>
      </div>

      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
        {parsed.map((q, i) => (
          <div key={i} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-600">
            {editIdx === i && editQ ? (
              <div className="p-4 space-y-3" dir="rtl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-primary-500">تعديل السؤال {i + 1}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditIdx(null); setEditQ(null); }} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">إلغاء</button>
                    <button onClick={saveEdit} className="text-xs bg-primary-500 text-white px-3 py-1 rounded-lg hover:bg-primary-400">حفظ</button>
                  </div>
                </div>

                <textarea
                  value={editQ.text}
                  onChange={e => setEditQ({ ...editQ, text: e.target.value })}
                  className="input-field text-sm min-h-[60px] resize-none"
                  placeholder="نص السؤال"
                />

                <div className="flex items-center gap-3">
                  <label className="text-xs text-gray-500">النوع:</label>
                  <select
                    value={editQ.type}
                    onChange={e => {
                      const t = e.target.value as 'MCQ' | 'TrueFalse';
                      setEditQ({ ...editQ, type: t, options: t === 'TrueFalse' ? ['صح', 'خطأ'] : editQ.options, correctAnswer: undefined });
                    }}
                    className="input-field text-sm py-1 flex-1"
                  >
                    <option value="MCQ">اختيار متعدد (MCQ)</option>
                    <option value="TrueFalse">صح أو خطأ</option>
                  </select>
                </div>

                {editQ.type === 'MCQ' && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">الخيارات (اختر الصحيح بالضغط):</p>
                    {(editQ.options.length < 2 ? ['', '', '', ''] : editQ.options).map((opt, j) => (
                      <div key={j} className="flex items-center gap-2">
                        <button
                          onClick={() => setEditQ({ ...editQ, correctAnswer: String(j) })}
                          className={`w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors ${editQ.correctAnswer === String(j) ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'}`}
                        >
                          {LETTERS[j]}
                        </button>
                        <input
                          value={opt}
                          onChange={e => {
                            const opts = [...editQ.options];
                            while (opts.length <= j) opts.push('');
                            opts[j] = e.target.value;
                            setEditQ({ ...editQ, options: opts });
                          }}
                          className="input-field text-sm py-1 flex-1"
                          placeholder={`الخيار ${LETTERS[j]}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {editQ.type === 'TrueFalse' && (
                  <div className="flex gap-3">
                    <p className="text-xs text-gray-500 ml-1">الإجابة:</p>
                    {[{ val: 'true', label: '✅ صح' }, { val: 'false', label: '❌ خطأ' }].map(o => (
                      <button
                        key={o.val}
                        onClick={() => setEditQ({ ...editQ, correctAnswer: o.val })}
                        className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-colors ${editQ.correctAnswer === o.val ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-start gap-3 p-3">
                <span className="text-xs font-bold text-primary-500 mt-0.5 shrink-0 w-5 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1 text-right">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${q.type === 'TrueFalse' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                      {q.type === 'TrueFalse' ? 'صح/خطأ' : `MCQ (${q.options.length})`}
                    </span>
                    {q.correctAnswer !== undefined
                      ? <span className="text-xs text-green-600 flex items-center gap-0.5"><CheckCircle size={11} /> إجابة محددة</span>
                      : <span className="text-xs text-amber-500 flex items-center gap-0.5"><AlertCircle size={11} /> بدون إجابة</span>}
                  </div>
                  {q.options.length > 0 && (
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {q.options.map((opt, j) => (
                        <div key={j} className={`text-xs px-2 py-1 rounded-lg truncate ${isCorrect(q, j) ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold' : 'bg-gray-100 dark:bg-gray-600/50 text-gray-500 dark:text-gray-400'}`}>
                          {LETTERS[j] ?? j + 1}) {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button onClick={() => startEdit(i)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="تعديل">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف">
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
        <button onClick={onSave} disabled={saving || !parsed.length} className="btn-primary flex-1">
          {saving ? 'جاري الحفظ...' : `💾 حفظ ${parsed.length} سؤال`}
        </button>
        <button onClick={onBack} className="btn-secondary px-4">إلغاء</button>
      </div>
    </div>
  );
}
