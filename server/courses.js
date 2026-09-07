// أكاديمية المستقبل — Single source of truth for courses/services & prices.
// Prices are in the smallest currency unit's whole number (e.g. SAR) and
// converted to Stripe's minor units (x100) at checkout time.
module.exports = [
  {
    id: 'hairstyling-pro',
    title: 'دبلوم تصفيف الشعر الاحترافي',
    category: 'كوافير',
    duration: '8 أسابيع',
    level: 'مبتدئ إلى متقدم',
    price: 1800,
    currency: 'SAR',
    icon: '💇‍♀️',
    summary: 'قصّات عصرية، تسريحات المناسبات، تقنيات السشوار والفير، وأساسيات تركيب الشعر.'
  },
  {
    id: 'hair-color-expert',
    title: 'دورة صبغات وتقنيات الألوان',
    category: 'كوافير',
    duration: '6 أسابيع',
    level: 'متوسط',
    price: 1500,
    currency: 'SAR',
    icon: '🎨',
    summary: 'الأومبريه، البلياج، تصحيح الألوان، وحماية الشعر أثناء التلوين.'
  },
  {
    id: 'makeup-artist',
    title: 'دبلوم فن المكياج الاحترافي',
    category: 'تجميل',
    duration: '10 أسابيع',
    level: 'مبتدئ إلى محترف',
    price: 2200,
    currency: 'SAR',
    icon: '💄',
    summary: 'مكياج سهرة، عرايس، تصوير فوتوغرافي، وتركيب الرموش الاحترافي.'
  },
  {
    id: 'skincare-facial',
    title: 'دورة العناية بالبشرة والتنظيف العميق',
    category: 'تجميل',
    duration: '5 أسابيع',
    level: 'مبتدئ',
    price: 1200,
    currency: 'SAR',
    icon: '✨',
    summary: 'تحليل أنواع البشرة، بروتوكولات التنظيف، الأقنعة، وأجهزة العناية الحديثة.'
  },
  {
    id: 'nails-art',
    title: 'دورة العناية بالأظافر والنيل آرت',
    category: 'تجميل',
    duration: '4 أسابيع',
    level: 'مبتدئ',
    price: 950,
    currency: 'SAR',
    icon: '💅',
    summary: 'المانيكير، البديكير، تركيب الأظافر الجل، وأحدث تصاميم النيل آرت.'
  },
  {
    id: 'bridal-styling',
    title: 'دبلوم تجهيز العرائس الشامل',
    category: 'كوافير وتجميل',
    duration: '12 أسبوعًا',
    level: 'متقدم',
    price: 2800,
    currency: 'SAR',
    icon: '👰',
    summary: 'باقة متكاملة: تسريحات، مكياج عرائس، وإدارة يوم الزفاف باحترافية.'
  }
];
