const features = [
  {
    icon: 'fa-video',
    title: 'محاضرات مسجلة',
    description: 'محاضرات فيديو عالية الجودة متاحة على مدار الساعة لتتمكن من المشاهدة في أي وقت يناسبك من خلال روابط يوتيوب Unlisted آمنة',
    iconBg: 'bg-teal/10',
    iconText: 'text-teal',
  },
  {
    icon: 'fa-file-pdf',
    title: 'ملفات PDF',
    description: 'ملفات PDF تفصيلية لكل محاضرة عبر روابط Google Drive يمكنك فتحها في تاب جديد والرجوع إليها في أي وقت',
    iconBg: 'bg-coral/10',
    iconText: 'text-coral',
  },
  {
    icon: 'fa-chart-line',
    title: 'متابعة التقدم',
    description: 'نظام متابعة متطور يتيح لك تتبع تقدمك في كل كورس ومحاضرة بدقة وتحديد المحاضرات المكتملة',
    iconBg: 'bg-gold/10',
    iconText: 'text-gold',
  },
  {
    icon: 'fa-shield-halved',
    title: 'محتوى محمي',
    description: 'حماية متقدمة للمحتوى التعليمي تشمل منع النسخ والطباعة وفتح أدوات المطور لضمان خصوصية الكورس',
    iconBg: 'bg-navy/10',
    iconText: 'text-navy',
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-bglight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-teal font-semibold text-sm uppercase tracking-wide">مميزاتنا</span>
          <h2 className="font-heading font-extrabold text-3xl md:text-4xl text-navy mt-2 mb-4">
            لماذا تختار ABC Pharma؟
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
            نقدم لك تجربة تعليمية متكاملة بأحدث الأساليب التقنية وأفضل المحتوى العلمي في مجال الصيدلة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card p-6 text-center group hover:shadow-xl hover:-translate-y-1">
              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 ${feature.iconBg}`}>
                <i className={`fa-solid ${feature.icon} ${feature.iconText} text-2xl`}></i>
              </div>
              <h3 className="font-heading font-bold text-xl text-navy mb-3">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
