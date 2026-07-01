import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import FeaturedCourses from '@/components/FeaturedCourses'
import SocialSection from '@/components/SocialSection'
import Footer from '@/components/Footer'
import WhatsAppWidget from '@/components/WhatsAppWidget'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <FeaturedCourses />
      <SocialSection />
      <Footer />
      <WhatsAppWidget />
    </main>
  )
}
