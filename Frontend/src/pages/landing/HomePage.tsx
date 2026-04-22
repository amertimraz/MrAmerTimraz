import { Helmet } from 'react-helmet-async';
import Hero from '../../components/landing/HeroNew';
import StatisticsSection from '../../components/landing/StatisticsSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import CoursesSection from '../../components/landing/CoursesSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import Testimonials from '../../components/landing/Testimonials';
import NewsletterSection from '../../components/landing/NewsletterSection';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>منصة الأستاذ عامر تمراز | البرمجة والذكاء الاصطناعي — أول ثانوي</title>
        <meta name="description" content="منصة تعليمية إلكترونية للأستاذ عامر تمراز — دروس البرمجة والذكاء الاصطناعي لطلاب أول ثانوي. منهج الحاسب الآلي ونظم المعلومات بأسلوب تفاعلي مميز." />
        <meta property="og:title" content="منصة الأستاذ عامر تمراز | البرمجة والذكاء الاصطناعي" />
        <meta property="og:description" content="تعلّم البرمجة والذكاء الاصطناعي مع الأستاذ عامر تمراز — منصة تعليمية تفاعلية لطلاب أول ثانوي." />
        <meta property="og:url" content="https://www.amertimraz.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.amertimraz.com/teacher.png" />
        <meta property="og:locale" content="ar_EG" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="منصة الأستاذ عامر تمراز | البرمجة والذكاء الاصطناعي" />
        <meta name="twitter:description" content="تعلّم البرمجة والذكاء الاصطناعي مع الأستاذ عامر تمراز — منصة تعليمية تفاعلية لطلاب أول ثانوي." />
        <meta name="twitter:image" content="https://www.amertimraz.com/teacher.png" />
      </Helmet>
      <Hero />
      <StatisticsSection />
      <HowItWorksSection />
      <CoursesSection />
      <FeaturesSection />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
