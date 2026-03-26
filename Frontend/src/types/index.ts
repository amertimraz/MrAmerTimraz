export type UserRole = 'Student' | 'Teacher' | 'Admin';

export interface User {
  id: number;
  name: string;
  username: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  profileImage?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  isPublished: boolean;
  price: number;
  isFree: boolean;
  teacherName: string;
  teacherId: number;
  createdAt: string;
  videoCount: number;
  testCount: number;
  enrolledCount: number;
}

export interface LiveSession {
  id: number;
  title: string;
  description?: string;
  scheduledAt: string;
  joinUrl?: string; // May be null if not enrolled
  price: number;
  isActive: boolean;
  isEnrolled?: boolean;
  createdAt: string;
}

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PaymentRequest {
  id: number;
  studentId: number;
  studentName: string;
  studentUsername: string;
  studentPhone: string;
  
  courseId?: number;
  courseTitle?: string;
  coursePrice?: number;

  bookletId?: number;
  bookletTitle?: string;
  bookletPrice?: number;

  liveSessionId?: number;
  liveSessionTitle?: string;
  liveSessionPrice?: number;

  amountPaid: number;
  receiptImageUrl?: string;
  notes?: string;
  status: PaymentStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Video {
  id: number;
  courseId: number;
  title: string;
  description?: string;
  url: string;
  source: 'YouTube' | 'Vimeo' | 'Upload';
  durationSeconds: number;
  orderIndex: number;
  pdfUrl?: string;
  slug: string;
  createdAt: string;
}

export interface VideoComment {
  id: number;
  videoId: number;
  studentId: number;
  student: User;
  content: string;
  createdAt: string;
}

export interface Question {
  id: number;
  questionText: string;
  questionType: 'TrueFalse' | 'MultipleChoice' | 'FillBlank' | 'Ordering';
  options?: string;
  correctAnswer?: string;
  points: number;
  orderIndex: number;
  imageUrl?: string;
}

export interface Test {
  id: number;
  title: string;
  description?: string;
  courseId: number;
  courseName: string;
  durationMinutes: number;
  passingScore: number;
  isPublished: boolean;
  createdAt: string;
  questions: Question[];
}

export interface TestResult {
  resultId: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  completedAt: string;
}

export interface StudentResult {
  id: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  completedAt: string;
  testTitle: string;
  courseTitle: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface InteractiveQuizSummary {
  id: number;
  title: string;
  subject?: string;
  grade?: string;
  description?: string;
  coverImageUrl?: string;
  slug?: string;
  teacherName?: string;
  teacherImage?: string;
  whatsappUrl?: string;
  teacherWhatsappNumber?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  showSupportButton: boolean;
  allowSkipWithoutRegistration?: boolean;
  stageCount?: number;
  questionsPerStage?: number;
  mcqPerStage?: number;
  tfPerStage?: number;
  goldenEvery?: number;
  timerEnabled?: boolean;
  timerDuration?: number;
  viewCount: number;
  theme?: string;
  createdAt: string;
  questionCount: number;
}

export interface InteractiveQuestion {
  id: number;
  quizId: number;
  text: string;
  type: 'MCQ' | 'TrueFalse';
  options?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  orderIndex: number;
}

export interface InteractiveQuiz extends InteractiveQuizSummary {
  questions: InteractiveQuestion[];
}

export interface InteractiveQuizResult {
  sessionId: string;
  name: string;
  score: number;
  correct: number;
  total: number;
  pct: number;
  date: string;
}

export interface LibraryItem {
  id: number;
  title: string;
  description?: string;
  fileUrl: string;
  category?: string;
  thumbnailUrl?: string;
  quizUrl?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}

export interface Booklet {
  id: number;
  title: string;
  description?: string;
  pdfUrl: string;
  coverImageUrl?: string;
  subject?: string;
  gradeLevel?: string;
  price: number;
  isPublished: boolean;
  createdAt: string;
}

export interface BookletPurchaseItem {
  id: number;
  studentName: string;
  studentUsername: string;
  bookletTitle: string;
  amountPaid: number;
  purchaseDate: string;
}

export interface BookletSummary {
  bookletId: number;
  title: string;
  purchaseCount: number;
  totalRevenue: number;
}

export interface BookletPurchaseStats {
  totalPurchases: number;
  totalRevenue: number;
  recentPurchases: BookletPurchaseItem[];
  topBooklets: BookletSummary[];
}
