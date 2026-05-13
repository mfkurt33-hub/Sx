'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  BarChart3, 
  Bot, 
  Calendar, 
  CheckCircle2, 
  ArrowRight,
  Play,
  Users,
  Shield,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: Bot,
    title: 'AI İçerik Üretimi',
    description: 'Yapay zeka ile saniyeler içinde profesyonel sosyal medya içerikleri oluşturun.',
  },
  {
    icon: Calendar,
    title: 'Akıllı Planlama',
    description: 'En uygun yayın zamanlarını AI ile belirleyin, otomatik paylaşım yapın.',
  },
  {
    icon: BarChart3,
    title: 'Detaylı Analitik',
    description: 'Performans metriklerini takip edin, veriye dayalı kararlar alın.',
  },
  {
    icon: Users,
    title: 'Müşteri Yönetimi',
    description: 'Ajanslar için müşteri hesaplarını tek panelden yönetin.',
  },
  {
    icon: Shield,
    title: 'KVKK Uyumlu',
    description: 'Türkiye veri koruma standartlarına tam uyumluluk.',
  },
  {
    icon: Zap,
    title: 'Otomasyon',
    description: 'Tekrarlayan görevleri otomatikleştirin, zamandan tasarruf edin.',
  },
];

const pricingPlans = [
  {
    name: 'Başlangıç',
    price: '₺299',
    period: '/ay',
    description: 'Küçük işletmeler için ideal',
    features: [
      '5 Sosyal Medya Hesabı',
      '50 AI İçerik/Ay',
      'Temel Analitik',
      '7/24 Destek',
      'E-Fatura Entegrasyonu',
    ],
    highlighted: false,
  },
  {
    name: 'Profesyonel',
    price: '₺599',
    period: '/ay',
    description: 'Büyüyen işletmeler için',
    features: [
      '15 Sosyal Medya Hesabı',
      '200 AI İçerik/Ay',
      'Gelişmiş Analitik',
      'Öncelikli Destek',
      'E-Fatura + E-Arşiv',
      'Akıllı Zamanlama',
      'Müşteri Portalı',
    ],
    highlighted: true,
  },
  {
    name: 'Kurumsal',
    price: '₺1.299',
    period: '/ay',
    description: 'Ajanslar ve büyük ekipler',
    features: [
      'Sınırsız Hesap',
      'Sınırsız AI İçerik',
      'Özel Raporlama',
      'Dedicated Support',
      'White-Label Çözüm',
      'API Erişimi',
      'SLA Garantisi',
    ],
    highlighted: false,
  },
];

const stats = [
  { value: '10,000+', label: 'Aktif Kullanıcı' },
  { value: '500K+', label: 'AI İçerik Üretildi' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '24/7', label: 'Türkçe Destek' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold text-white">AiToManage</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition">Özellikler</Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition">Fiyatlandırma</Link>
              <Link href="#about" className="text-gray-300 hover:text-white transition">Hakkımızda</Link>
              <Link href="/login" className="text-gray-300 hover:text-white transition">Giriş Yap</Link>
              <Link 
                href="/register" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Ücretsiz Dene
              </Link>
            </div>

            <button 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-white/10">
            <div className="px-4 py-4 space-y-4">
              <Link href="#features" className="block text-gray-300 hover:text-white">Özellikler</Link>
              <Link href="#pricing" className="block text-gray-300 hover:text-white">Fiyatlandırma</Link>
              <Link href="/login" className="block text-gray-300 hover:text-white">Giriş Yap</Link>
              <Link href="/register" className="block bg-purple-600 text-white px-4 py-2 rounded-lg text-center">
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Sosyal Medya Yönetiminizi
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                AI ile Güçlendirin
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Türkiye'nin en gelişmiş sosyal medya yönetim platformu. 
              AI destekli içerik üretimi, akıllı planlama ve detaylı analitik ile 
              markanızı bir üst seviyeye taşıyın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition"
              >
                14 Gün Ücretsiz Dene <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#demo" 
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition backdrop-blur-sm"
              >
                <Play className="w-5 h-5" /> Demo İzle
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-purple-400">{stat.value}</div>
                <div className="text-gray-400 mt-2">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Güçlü Özellikler</h2>
            <p className="text-xl text-gray-400">İhtiyacınız olan tüm araçlar tek bir platformda</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Basit Fiyatlandırma</h2>
            <p className="text-xl text-gray-400">Gizli ücret yok, istediğiniz zaman iptal edin</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative p-8 rounded-2xl border ${
                  plan.highlighted 
                    ? 'bg-purple-900/20 border-purple-500' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    En Popüler
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center text-gray-300">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block w-full py-3 rounded-lg font-semibold text-center transition ${
                    plan.highlighted
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Başla
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 p-12 rounded-3xl"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-white/80 mb-8">
              14 gün ücretsiz deneyin, kredi kartı gerekmez.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition"
            >
              Ücretsiz Hesap Oluştur
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Rocket className="w-6 h-6 text-purple-400" />
                <span className="text-lg font-bold text-white">AiToManage</span>
              </div>
              <p className="text-gray-400 text-sm">
                Türkiye'nin en gelişmiş AI destekli sosyal medya yönetim platformu.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Ürün</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#features" className="hover:text-white">Özellikler</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Fiyatlandırma</Link></li>
                <li><Link href="#" className="hover:text-white">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Şirket</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">Hakkımızda</Link></li>
                <li><Link href="#" className="hover:text-white">Blog</Link></li>
                <li><Link href="#" className="hover:text-white">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Yasal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link href="#" className="hover:text-white">Gizlilik Politikası</Link></li>
                <li><Link href="#" className="hover:text-white">Kullanım Koşulları</Link></li>
                <li><Link href="#" className="hover:text-white">KVKK</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
            © 2024 AiToManage. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
