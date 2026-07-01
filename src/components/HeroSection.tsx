export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-navy via-navy to-teal py-20 md:py-32">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-block mb-6 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-gold font-semibold text-sm">منصة التعليم الصيدلي الرائدة</span>
        </div>

        <h1 className="font-heading font-extrabold text-4xl md:text-6xl text-white mb-6 leading-tight">
          تعلّم الصيدلة <span className="text-gold">باحترافية</span>
          <br />
          مع <span className="text-coral">ABC Pharma</span>
        </h1>

        <p className="text-white/80 text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          كورسات صيدلية متكاملة تشمل محاضرات مسجلة بجودة عالية وملفات PDF قابلة للتحميل ومتابعة مستمرة لتقدمك في رحلتك التعليمية
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/catalog" className="btn-primary">
            <i className="fa-solid fa-graduation-cap"></i>
            تصفح الكورسات
          </a>
          <a href="/register" className="btn-coral">
            <i className="fa-solid fa-user-plus"></i>
            ابدأ مجاناً
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-extrabold text-gold">+50</div>
            <div className="text-white/70 text-sm mt-1">كورس متخصص</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-extrabold text-gold">+500</div>
            <div className="text-white/70 text-sm mt-1">محاضرة مسجلة</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-extrabold text-gold">+2000</div>
            <div className="text-white/70 text-sm mt-1">طالب نشط</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-heading font-extrabold text-gold">24/7</div>
            <div className="text-white/70 text-sm mt-1">وصول متاح</div>
          </div>
        </div>
      </div>
    </section>
  )
}
