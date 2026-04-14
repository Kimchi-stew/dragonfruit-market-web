import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight,
  Sparkles, Shirt, Utensils, CalendarDays, Dumbbell, PawPrint,
} from 'lucide-react'
import Button from '../components/ui/Button'
import CategoryChip from '../components/ui/CategoryChip'
import ProductCard from '../components/product/ProductCard'
import { MOCK_PRODUCTS } from '../data/mockProducts'

const CATEGORIES = [
  { label: '뷰티',    icon: <Sparkles size={22} strokeWidth={1.8} />,    color: 'var(--color-cat-beauty)',  iconColor: '#C2185B', value: 'beauty' },
  { label: '패션',    icon: <Shirt size={22} strokeWidth={1.8} />,        color: 'var(--color-cat-fashion)', iconColor: '#3B5BDB', value: 'fashion' },
  { label: '식품',    icon: <Utensils size={20} strokeWidth={1.8} />,     color: 'var(--color-cat-food)',    iconColor: '#2E7D32', value: 'food' },
  { label: '가전',    icon: <CalendarDays size={20} strokeWidth={1.8} />, color: 'var(--color-cat-tool)',    iconColor: '#E65100', value: 'tool' },
  { label: '스포츠',  icon: <Dumbbell size={22} strokeWidth={1.8} />,     color: 'var(--color-cat-sports)',  iconColor: '#6A1B9A', value: 'sports' },
  { label: '반려동물', icon: <PawPrint size={20} strokeWidth={1.8} />,    color: 'var(--color-cat-pet)',     iconColor: '#4E342E', value: 'pet' },
]

const HERO_SLIDES = [
  {
    headline: '리뷰를 확인하고\n현명한 쇼핑을',
    sub: '알고마켓이 선택한 제품으로\n현명하게 고를 수 있는 쇼핑',
    base: '#F0EAFF',
    tagBg: 'rgba(124,58,237,0.12)',
    tagColor: '#7C3AED',
    tag: '리뷰 기반 추천',
    blobs: [
      { size: 340, top: '-80px', right: '5%',   color: 'rgba(167,139,250,0.55)' },
      { size: 260, bottom: '-60px', left: '30%', color: 'rgba(196,181,253,0.45)' },
      { size: 180, top: '20px',  left: '-40px',  color: 'rgba(139,92,246,0.30)' },
    ],
  },
  {
    headline: '오늘의 특가\n최대 50% 할인',
    sub: '매일 바뀌는 특가 상품을\n빠르게 만나보세요',
    base: '#FFF0F5',
    tagBg: 'rgba(255,61,135,0.12)',
    tagColor: '#FF3D87',
    tag: '오늘만 특가',
    blobs: [
      { size: 320, top: '-60px',  right: '10%',  color: 'rgba(255,105,180,0.50)' },
      { size: 240, bottom: '-50px', left: '20%', color: 'rgba(255,182,193,0.55)' },
      { size: 160, top: '30px',  left: '5%',    color: 'rgba(255,61,135,0.25)' },
    ],
  },
  {
    headline: '신규 입점 브랜드\n지금 확인하세요',
    sub: '새로운 브랜드의 첫 번째\n할인 혜택을 놓치지 마세요',
    base: '#EFF6FF',
    tagBg: 'rgba(25,118,210,0.12)',
    tagColor: '#1976D2',
    tag: '신규 브랜드',
    blobs: [
      { size: 300, top: '-70px',  right: '8%',   color: 'rgba(96,165,250,0.50)' },
      { size: 220, bottom: '-40px', left: '25%', color: 'rgba(147,197,253,0.55)' },
      { size: 170, top: '40px',  left: '-30px',  color: 'rgba(59,130,246,0.28)' },
    ],
  },
]

const HERO_IMGS = [
  { src: 'https://loremflickr.com/320/320/skincare,cosmetics?lock=201' },
  { src: 'https://loremflickr.com/320/320/fashion,clothing?lock=202' },
  { src: 'https://loremflickr.com/320/320/sport,fitness?lock=203' },
  { src: 'https://loremflickr.com/320/320/food,healthy?lock=204' },
  { src: 'https://loremflickr.com/320/320/interior,design?lock=205' },
]

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
        {title}
      </h2>
      {sub && (
        <p className="text-sm mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          {sub}
        </p>
      )}
    </div>
  )
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [progressKey, setProgressKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const goTo = useCallback((idx: number) => {
    setActiveSlide(idx)
    setProgressKey((k) => k + 1)
  }, [])

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveSlide((v) => { setProgressKey((k) => k + 1); return (v + 1) % HERO_SLIDES.length })
    }, 5000)
  }, [])

  useEffect(() => {
    startInterval()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [startInterval])

  const handlePrev = () => { goTo((activeSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); startInterval() }
  const handleNext = () => { goTo((activeSlide + 1) % HERO_SLIDES.length); startInterval() }
  const handleDot  = (i: number) => { goTo(i); startInterval() }
  const slide = HERO_SLIDES[activeSlide]

  const catRef     = useReveal()
  const popularRef = useReveal()
  const couponRef  = useReveal()
  const newRef     = useReveal()
  const recRef     = useReveal()

  return (
    <div className="flex flex-col">

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden select-none" style={{ height: 380 }}>
        {/* 슬라이드 트랙 */}
        <div
          className="flex h-full"
          style={{
            width: `${HERO_SLIDES.length * 100}%`,
            transform: `translateX(-${activeSlide * (100 / HERO_SLIDES.length)}%)`,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {HERO_SLIDES.map((s, idx) => (
            <div
              key={idx}
              className="relative h-full flex-shrink-0 overflow-hidden"
              style={{ width: `${100 / HERO_SLIDES.length}%`, background: s.base }}
            >
              {/* Mesh blobs */}
              {s.blobs.map((b, bi) => (
                <div
                  key={bi}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: b.size,
                    height: b.size,
                    background: b.color,
                    filter: 'blur(72px)',
                    top: 'top' in b ? b.top : undefined,
                    bottom: 'bottom' in b ? b.bottom : undefined,
                    left: 'left' in b ? b.left : undefined,
                    right: 'right' in b ? b.right : undefined,
                  }}
                />
              ))}

              {/* Subtle dot pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Content */}
              <div className="relative max-w-[1200px] mx-auto px-10 h-full flex items-center justify-between z-10">
                {/* Left text */}
                <div key={`text-${activeSlide}`} className="flex flex-col gap-4 max-w-[420px]">
                  <span
                    className="text-xs font-semibold px-3 py-1.5 rounded-full w-fit animate-fade-up"
                    style={{ background: s.tagBg, color: s.tagColor }}
                  >
                    {s.tag}
                  </span>
                  <h1
                    className="font-bold leading-tight whitespace-pre-line animate-fade-up"
                    style={{ fontSize: 36, color: '#1A1A1A', letterSpacing: '-0.8px', lineHeight: 1.25, animationDelay: '100ms' }}
                  >
                    {s.headline}
                  </h1>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-line animate-fade-up"
                    style={{ color: '#757575', animationDelay: '200ms' }}
                  >
                    {s.sub}
                  </p>
                  <div className="flex gap-3 mt-1 animate-fade-up" style={{ animationDelay: '300ms' }}>
                    <Button onClick={() => navigate('/products')}>직접 쇼핑하기</Button>
                    <Button variant="ghost" onClick={() => navigate('/products')}>둘러보기</Button>
                  </div>
                </div>

                {/* Right: bento-style floating images */}
                <div className="hidden md:flex gap-3 h-[280px] pr-6 items-center">
                  {/* Col 1 */}
                  <div className="flex flex-col gap-3 w-[150px] h-full justify-center">
                    <div className="bento-box bento-img-0 h-[140px] rounded-3xl overflow-hidden shadow-lg bg-black/5" style={{ zIndex: 2 }}>
                      <img src={HERO_IMGS[0].src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="bento-box bento-img-1 h-[100px] rounded-2xl overflow-hidden shadow-lg bg-black/5" style={{ zIndex: 2 }}>
                      <img src={HERO_IMGS[1].src} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {/* Col 2 */}
                  <div className="flex flex-col gap-3 w-[160px] h-full justify-center">
                    <div className="bento-box bento-img-2 h-[110px] rounded-2xl overflow-hidden shadow-lg bg-black/5" style={{ zIndex: 3 }}>
                      <img src={HERO_IMGS[2].src} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="bento-box bento-img-3 h-[150px] rounded-3xl overflow-hidden shadow-lg bg-black/5" style={{ zIndex: 3 }}>
                      <img src={HERO_IMGS[3].src} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {/* Col 3 */}
                  <div className="bento-box bento-img-4 w-[130px] h-[220px] rounded-3xl overflow-hidden shadow-lg bg-black/5 flex-shrink-0" style={{ zIndex: 1, alignSelf: 'center' }}>
                    <img src={HERO_IMGS[4].src} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/75 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-20 shadow-sm"
        >
          <ChevronLeft size={18} style={{ color: '#1A1A1A' }} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/75 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors z-20 shadow-sm"
        >
          <ChevronRight size={18} style={{ color: '#1A1A1A' }} />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/10 z-20">
          <div
            key={progressKey}
            className="hero-progress h-full"
            style={{ background: slide.tagColor, opacity: 0.75 }}
          />
        </div>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDot(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeSlide ? 22 : 6,
                height: 6,
                background: i === activeSlide ? slide.tagColor : 'rgba(0,0,0,0.22)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ───── Main content ───── */}
      <div className="max-w-[1200px] mx-auto w-full px-8 flex flex-col gap-14 py-12">

        {/* Categories */}
        <section ref={catRef} className="reveal">
          <SectionHeader title="카테고리" />
          <div className="flex gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.value}
                label={cat.label}
                icon={cat.icon}
                color={cat.color}
                iconColor={cat.iconColor}
                active={activeCategory === cat.value}
                onClick={() => {
                  setActiveCategory(activeCategory === cat.value ? null : cat.value)
                  navigate(`/products?category=${cat.value}`)
                }}
              />
            ))}
          </div>
        </section>

        {/* Popular products */}
        <section ref={popularRef} className="reveal">
          <SectionHeader title="인기 상품 🔥" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {MOCK_PRODUCTS.slice(0, 4).map((p, i) => (
              <div key={p.id} className="reveal visible" style={{ transitionDelay: `${i * 80}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Coupon Banner */}
        <div
          ref={couponRef}
          className="reveal relative overflow-hidden flex items-center justify-between px-8 rounded-2xl"
          style={{
            height: 80,
            background: 'linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)',
            border: '1.5px dashed #FFB300',
          }}
        >
          {/* bg decoration */}
          <div
            className="absolute -right-8 -top-8 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'rgba(255,193,7,0.15)', filter: 'blur(30px)' }}
          />
          <p className="text-sm font-semibold relative z-10" style={{ color: '#1A1A1A' }}>
            🎉 첫 구매 10% 할인 쿠폰 지급!
          </p>
          <Button size="sm" onClick={() => navigate('/login')} className="relative z-10">
            받으러가기
          </Button>
        </div>

        {/* New products */}
        <section ref={newRef} className="reveal">
          <SectionHeader title="신상품 ✨" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {MOCK_PRODUCTS.slice(4, 8).map((p, i) => (
              <div key={p.id} className="reveal visible" style={{ transitionDelay: `${i * 80}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>

        {/* Recommended */}
        <section ref={recRef} className="reveal">
          <SectionHeader
            title="나를 위한 추천 상품 💜"
            sub="행동 분석을 기반으로 상품을 추천해드립니다"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[...MOCK_PRODUCTS].reverse().slice(0, 4).map((p, i) => (
              <div key={p.id} className="reveal visible" style={{ transitionDelay: `${i * 80}ms` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
