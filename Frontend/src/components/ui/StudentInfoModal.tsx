import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Phone, MapPin, GraduationCap, Download, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export type UserType = 'student' | 'parent' | 'teacher';

export interface StudentInfo {
  name: string;
  userType: UserType;
  phone: string;
  governorate: string;
}

interface StudentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: StudentInfo) => void;
  noteTitle: string;
  action: 'view' | 'download';
}

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'شمال سيناء',
  'جنوب سيناء',
  'البحر الأحمر',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'الوادي الجديد',
];

const USER_TYPES: { value: UserType; label: string; icon: typeof GraduationCap }[] = [
  { value: 'student', label: 'طالب', icon: GraduationCap },
  { value: 'parent', label: 'ولي أمر', icon: User },
  { value: 'teacher', label: 'مدرس', icon: User },
];

export default function StudentInfoModal({ isOpen, onClose, onSubmit, noteTitle, action }: StudentInfoModalProps) {
  const { isDark } = useAuthStore();
  const [formData, setFormData] = useState<StudentInfo>({
    name: '',
    userType: 'student',
    phone: '',
    governorate: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StudentInfo, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudentInfo, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الرجاء إدخال الاسم';
    } else if (formData.name.length < 3) {
      newErrors.name = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'الرجاء إدخال رقم التليفون';
    } else if (!/^01[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'الرجاء إدخال رقم موبايل مصري صحيح (مثل: 01012345678)';
    }

    if (!formData.governorate) {
      newErrors.governorate = 'الرجاء اختيار المحافظة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-orange-500'
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-orange-500'
  }`;

  const labelClass = `block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  const errorClass = 'text-red-500 text-xs mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-100'
        }`}
        dir="rtl"
      >
        <button
          onClick={onClose}
          className={`absolute top-3 left-3 p-1.5 rounded-full transition-colors ${
            isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
          }`}
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-pink-500">
            {action === 'download' ? (
              <Download size={28} className="text-white" />
            ) : (
              <Eye size={28} className="text-white" />
            )}
          </div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {action === 'download' ? 'تحميل المذكرة' : 'معاينة المذكرة'}
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            قبل {action === 'download' ? 'التحميل' : 'المعاينة'}، يرجى إكمال بياناتك
          </p>
          <p className={`text-sm font-medium ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
            {noteTitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* الاسم */}
          <div>
            <label className={labelClass}>الاسم *</label>
            <div className="relative">
              <User size={18} className={`absolute top-1/2 -translate-y-1/2 right-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="اكتب اسمك الكامل"
                className={`${inputClass} pr-10`}
              />
            </div>
            {errors.name && <p className={errorClass}>{errors.name}</p>}
          </div>

          {/* نوع المستخدم */}
          <div>
            <label className={labelClass}>نوع المستخدم *</label>
            <div className="grid grid-cols-3 gap-2">
              {USER_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: value })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    formData.userType === value
                      ? 'border-orange-500 bg-orange-500/10 text-orange-500'
                      : isDark
                      ? 'border-white/10 hover:border-white/20 text-gray-400'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* رقم التليفون */}
          <div>
            <label className={labelClass}>رقم الموبايل *</label>
            <div className="relative">
              <Phone size={18} className={`absolute top-1/2 -translate-y-1/2 right-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="مثال: 01012345678"
                className={`${inputClass} pr-10`}
                dir="ltr"
              />
            </div>
            {errors.phone && <p className={errorClass}>{errors.phone}</p>}
          </div>

          {/* المحافظة */}
          <div>
            <label className={labelClass}>المحافظة *</label>
            <div className="relative">
              <MapPin size={18} className={`absolute top-1/2 -translate-y-1/2 right-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <select
                value={formData.governorate}
                onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                className={`${inputClass} pr-10 appearance-none cursor-pointer`}
              >
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov} className={isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}>
                    {gov}
                  </option>
                ))}
              </select>
              <div className="absolute top-1/2 -translate-y-1/2 left-3 pointer-events-none">
                <svg className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.governorate && <p className={errorClass}>{errors.governorate}</p>}
          </div>

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري التحقق...
              </>
            ) : action === 'download' ? (
              <>
                <Download size={16} />
                متابعة التحميل
              </>
            ) : (
              <>
                <Eye size={16} />
                متابعة المعاينة
              </>
            )}
          </button>

          <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            البيانات تستخدم فقط لتحسين جودة المحتوى التعليمي
          </p>
        </form>
      </motion.div>
    </div>
  );
}
