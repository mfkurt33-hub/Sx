'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: API call to backend
      console.log('Register attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(2);
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Kaydınız Başarılı!</h1>
          <p className="text-gray-300 mb-8 max-w-md">
            E-posta adresinize doğrulama linki gönderildi. 
            Lütfen e-postanızı kontrol edin ve hesabınızı aktifleştirin.
          </p>
          <Link
            href="/login"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Giriş Yapmaya Dön
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
            <span className="text-2xl font-bold text-white">AiToManage</span>
          </Link>
        </div>

        {/* Register Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Ücretsiz Hesap Oluştur</h1>
          <p className="text-gray-400 text-center mb-8">14 gün ücretsiz deneyin, kredi kartı gerekmez</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Ad Soyad
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Ahmet Yılmaz"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                İş E-postası
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="ahmet@sirket.com"
                  required
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                Şirket Adı
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Şirketiniz A.Ş."
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="En az 8 karakter"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                En az 8 karakter, büyük harf ve rakam içermelidir
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-500 bg-white/5"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">Kullanım Koşulları</Link>
                {' '}ve{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Gizlilik Politikası</Link>
                {' '}nı kabul ediyorum
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Hesap oluşturuluyor...
                </>
              ) : (
                <>
                  Ücretsiz Başla <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-white/20" />
            <span className="px-4 text-gray-400 text-sm">veya</span>
            <div className="flex-1 border-t border-white/20" />
          </div>

          {/* Social Register */}
          <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-3 transition">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Devam Et
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-400">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition">
              Giriş Yapın
            </Link>
          </p>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-400 text-xs">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-400" />
            AI İçerik Üretimi
          </div>
          <div className="text-gray-400 text-xs">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-400" />
            Akıllı Planlama
          </div>
          <div className="text-gray-400 text-xs">
            <CheckCircle className="w-4 h-4 mx-auto mb-1 text-green-400" />
            Detaylı Analitik
          </div>
        </div>
      </motion.div>
    </div>
  );
}
