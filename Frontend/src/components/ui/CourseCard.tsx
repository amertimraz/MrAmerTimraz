import { BookOpen, Video, FileText, Users } from 'lucide-react';
import type { Course } from '../../types';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export default function CourseCard({ course, onClick, actions }: CourseCardProps) {
  return (
    <div
      className="card overflow-hidden hover:shadow-md transition-all duration-200 animate-fade-in cursor-pointer group"
      onClick={onClick}
    >
      <div className="relative h-40 bg-gradient-to-br from-primary-500 to-accent-600 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen size={48} className="text-white/60" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={course.isPublished ? 'badge-green' : 'badge-yellow'}>
            {course.isPublished ? 'منشور' : 'مسودة'}
          </span>
          {course.isFree ? (
            <span className="badge-blue">مجاني</span>
          ) : (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {course.price} ج.م
            </span>
          )}
        </div>
        {course.category && (
          <div className="absolute bottom-2 left-2">
            <span className="badge-blue">{course.category}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{course.description}</p>
        )}

        <p className="text-xs text-gray-400 mt-2">بواسطة: {course.teacherName}</p>

        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Video size={12} /> {course.videoCount} فيديو
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <FileText size={12} /> {course.testCount} اختبار
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Users size={12} /> {course.enrolledCount} طالب
          </span>
        </div>

        {actions && (
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2" onClick={e => e.stopPropagation()}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
