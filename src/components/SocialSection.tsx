const socials = [
  { icon: 'fa-tiktok', url: 'https://www.tiktok.com/@yahya.azab.abcpharma', name: 'TikTok' },
  { icon: 'fa-youtube', url: 'https://youtube.com/@abcpharmaya', name: 'YouTube' },
  { icon: 'fa-instagram', url: 'https://www.instagram.com/yahya.azab.abcpharma', name: 'Instagram' },
  { icon: 'fa-facebook', url: 'https://www.facebook.com/share/1CxsobAfwm/', name: 'Facebook' },
  { icon: 'fa-x-twitter', url: 'https://x.com/abcpharmaYA', name: 'X' },
  { icon: 'fa-linkedin', url: 'https://www.linkedin.com/in/yahya-azab-54a579385', name: 'LinkedIn' },
]

export default function SocialSection() {
  return (
    <section className="py-16 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-white mb-2">
          تابعنا على منصاتنا
        </h2>
        <p className="text-white/60 mb-10">كن دائماً على اطلاع بأحدث الكورسات والمحاضرات</p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {socials.map((social, index) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.name}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-teal hover:scale-110 transition-all"
            >
              <i className={`fa-brands ${social.icon} text-xl`}></i>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
