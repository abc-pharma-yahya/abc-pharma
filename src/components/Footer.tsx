import Link from 'next/link'

const socials = [
  { icon: 'fa-tiktok', url: 'https://www.tiktok.com/@yahya.azab.abcpharma' },
  { icon: 'fa-youtube', url: 'https://youtube.com/@abcpharmaya' },
  { icon: 'fa-instagram', url: 'https://www.instagram.com/yahya.azab.abcpharma' },
  { icon: 'fa-facebook', url: 'https://www.facebook.com/share/1CxsobAfwm/' },
  { icon: 'fa-x-twitter', url: 'https://x.com/abcpharmaYA' },
  { icon: 'fa-linkedin', url: 'https://www.linkedin.com/in/yahya-azab-54a579385' },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a1f33] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal to-coral flex items-center justify-center">
                <i className="fa-solid fa-pills text-white text-lg"></i>
              </div>
              <span className="font-heading font-extrabold text-xl">ABC Pharma</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              منصة تعليمية متخصصة في تقديم المحتوى الصيدلي العلمي بأعلى جودة وأحدث الأساليب التعليمية لتخدم طلاب الصيدلة في الوطن العربي
            </p>
            <p className="text-white/60 text-sm">
              <i className="fa-solid fa-user-tie text-teal ml-2"></i>
              المالك: يحيى ياسين عزب
            </p>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-white/60 hover:text-teal transition-colors text-sm">الرئيسية</Link></li>
              <li><Link href="/catalog" className="text-white/60 hover:text-teal transition-colors text-sm">الكورسات</Link></li>
              <li><Link href="/login" className="text-white/60 hover:text-teal transition-colors text-sm">تسجيل الدخول</Link></li>
              <li><Link href="/register" className="text-white/60 hover:text-teal transition-colors text-sm">إنشاء حساب</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-bold text-lg mb-4">تواصل معنا</h3>
            <div className="space-y-3 mb-6">
              <a href="https://wa.me/201019755523" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-white/60 hover:text-teal transition-colors text-sm">
                <i className="fa-brands fa-whatsapp text-teal text-lg w-5 text-center"></i>
                <span dir="ltr">+20 101 975 5523</span>
              </a>
              <a href="mailto:abcpharma000@gmail.com" className="flex items-center gap-3 text-white/60 hover:text-teal transition-colors text-sm">
                <i className="fa-solid fa-envelope text-teal text-lg w-5 text-center"></i>
                <span dir="ltr">abcpharma000@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:scale-110 transition-all"
                >
                  <i className={`fa-brands ${social.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} ABC Pharma. جميع الحقوق محفوظة. تم التطوير بواسطة يحيى ياسين عزب
          </p>
        </div>
      </div>
    </footer>
  )
}
