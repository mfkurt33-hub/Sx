--- project/aitoearn-web/src/app/[lng]/studio/page.tsx (原始)


+++ project/aitoearn-web/src/app/[lng]/studio/page.tsx (修改后)
'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function StudioPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [autoPrompt, setAutoPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dosya seçimi
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setEnhancedUrl(null);

      // AI otomatik prompt oluşturma (simülasyon)
      generateAutoPrompt(file);
    }
  };

  // AI ile otomatik prompt oluşturma
  const generateAutoPrompt = async (file: File) => {
    // Gerçek implementasyonda backend'e görsel gönderilip Qwen/LLM ile analiz yapılacak
    const samplePrompts = [
      'Profesyonel stüdyo çekimi, beyaz arka plan, yumuşak ışıklandırma, yüksek çözünürlük, altın yüzük detayları belirgin, lüks mücevher fotoğrafçılığı',
      'Doğal gün ışığı, minimalist arka plan, makro çekim, el yapımı detaylar vurgulu, Instagram için optimize edilmiş',
      'Dramatik ışıklandırma, koyu arka plan, premium görünüm, 4K çözünürlük, mücevher vitrini kalitesi',
    ];

    // Simüle edilmiş gecikme
    setTimeout(() => {
      const randomPrompt = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      setAutoPrompt(randomPrompt);
      setPrompt(randomPrompt);
    }, 1500);
  };

  // AI İyileştirme işlemi
  const handleEnhance = async () => {
    if (!selectedFile || !prompt) return;

    setIsProcessing(true);

    try {
      // TODO: Backend API çağrısı
      // const formData = new FormData();
      // formData.append('image', selectedFile);
      // formData.append('prompt', prompt);
      // const response = await fetch('/api/v1/ai/enhance', { method: 'POST', body: formData });

      // Simülasyon: 3 saniye sonra sonuç göster
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Demo için aynı görseli kullan (gerçekte AI işlenmiş görsel gelecek)
      setEnhancedUrl(previewUrl);
    } catch (error) {
      console.error('AI iyileştirme hatası:', error);
      alert('Görsel işleme sırasında bir hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Öncesi/Sonrası karşılaştırma
  const ComparisonSlider = () => {
    const [sliderPosition, setSliderPosition] = useState(50);

    return (
      <div className="relative w-full h-96 rounded-lg overflow-hidden">
        {/* Sonrası görsel */}
        {enhancedUrl && (
          <img
            src={enhancedUrl}
            alt="Sonrası"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          />
        )}

        {/* Öncesi görsel */}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Öncesi"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Slider çubuğu */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
        />

        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <span className="text-gray-600 text-xs">↔</span>
          </div>
        </div>

        {/* Etiketler */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          Öncesi
        </div>
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          Sonrası (AI)
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ✨ AI Stüdyo
          </h1>
          <p className="text-gray-600">
            Amatör fotoğraflarınızı yapay zeka ile profesyonel stüdyo çekimine dönüştürün
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sol Panel - Yükleme ve Ayarlar */}
          <div className="space-y-6">
            {/* Dosya Yükleme */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-white"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="text-4xl mb-4">📸</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Fotoğrafı Buraya Sürükle veya Tıkla
              </p>
              <p className="text-sm text-gray-500">
                JPG, PNG formatlarında yükleme yapabilirsiniz
              </p>
            </div>

            {/* Prompt Sihirbazı */}
            {previewUrl && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">🎨 AI Prompt Sihirbazı</h3>

                {autoPrompt ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Önerilen Prompt (Otomatik Oluşturuldu)
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="AI'ın oluşturduğu prompt burada görünecek..."
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>AI görseli analiz ediyor...</span>
                  </div>
                )}

                <button
                  onClick={handleEnhance}
                  disabled={!prompt || isProcessing}
                  className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
                    !prompt || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                  }`}
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      AI İşleniyor...
                    </span>
                  ) : (
                    '✨ Stüdyo Çekimi Yap'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Sağ Panel - Önizleme */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              {enhancedUrl ? 'Öncesi / Sonrası Karşılaştırması' : 'Önizleme'}
            </h3>

            {!previewUrl ? (
              <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">🖼️</div>
                  <p>Fotoğraf yükleyerek önizlemeyi görün</p>
                </div>
              </div>
            ) : enhancedUrl ? (
              <ComparisonSlider />
            ) : (
              <div className="h-96 rounded-lg overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Önizleme"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* İşlem Sonrası Aksiyonlar */}
            {enhancedUrl && (
              <div className="mt-6 space-y-3">
                <button className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                  ✓ Onayla ve Kaydet
                </button>
                <button className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold">
                  🔄 Tekrar Dene
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Özellikler */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold mb-2">Otomatik Arka Plan Temizleme</h4>
            <p className="text-sm text-gray-600">
              Karmaşık arka planları tek tıkla temizle, ürününü öne çıkar.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">💡</div>
            <h4 className="font-semibold mb-2">Akıllı Işıklandırma</h4>
            <p className="text-sm text-gray-600">
              AI, ürününüzün en iyi görüneceği ışık ayarlarını otomatik yapar.
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="text-3xl mb-3">📈</div>
            <h4 className="font-semibold mb-2">Çözünürlük Artırma</h4>
            <p className="text-sm text-gray-600">
              Düşük kaliteli fotoğrafları 4K kalitesine yükselt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}