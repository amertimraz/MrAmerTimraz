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
