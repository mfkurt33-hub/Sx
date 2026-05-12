--- project/aitoearn-web/src/app/[lng]/dashboard/page.tsx (原始)


+++ project/aitoearn-web/src/app/[lng]/dashboard/page.tsx (修改后)
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // Örnek veri - gerçekte API'den gelecek
  const organizations = [
    { id: '1', name: 'Salih Çetinkaya Kuyumculuk', plan: 'Professional' },
  ];

  const quickStats = {
    totalPosts: 24,
    scheduledPosts: 5,
    engagementRate: '4.8%',
    followersGrowth: '+128',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoş Geldiniz
          </h1>
          <p className="text-gray-600">
            Sosyal medya hesaplarınızı yapay zeka ile yönetin
          </p>
        </div>

        {/* Organizasyon Seçici */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Aktif İşletme</h2>
          <div className="flex items-center gap-4">
            <select
              value={selectedOrg || ''}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">İşletme seçin...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name} - {org.plan}
                </option>
              ))}
            </select>
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Yeni İşletme Ekle
            </button>
          </div>
        </div>

        {/* Hızlı İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Toplam Gönderi</div>
            <div className="text-3xl font-bold text-gray-900">
              {quickStats.totalPosts}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Planlanmış</div>
            <div className="text-3xl font-bold text-blue-600">
              {quickStats.scheduledPosts}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Etkileşim Oranı</div>
            <div className="text-3xl font-bold text-green-600">
              {quickStats.engagementRate}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-2">Takipçi Artışı</div>
            <div className="text-3xl font-bold text-purple-600">
              {quickStats.followersGrowth}
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => router.push('/studio')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-xl font-semibold mb-2">AI Stüdyo</h3>
            <p className="text-blue-100">
              Fotoğraf yükle, AI ile profesyonel hale getir
            </p>
          </button>

          <button
            onClick={() => router.push('/calendar')}
            className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-blue-500 transition-colors"
          >
            <div className="text-2xl mb-2">📅</div>
            <h3 className="text-xl font-semibold mb-2">İçerik Takvimi</h3>
            <p className="text-gray-600">
              Gönderilerini planla ve otomatik yayınla
            </p>
          </button>

          <button
            onClick={() => router.push('/analytics')}
            className="bg-white rounded-lg p-6 border-2 border-gray-200 hover:border-green-500 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analiz & Rapor</h3>
            <p className="text-gray-600">
              Performansını takip et, rapor al
            </p>
          </button>
        </div>

        {/* Son Gönderiler */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Son Gönderiler</h2>
          <div className="text-gray-500 text-center py-8">
            Henüz gönderi yok. AI Stüdyo'dan ilk gönderinizi oluşturun!
          </div>
        </div>
      </div>
    </div>
  );
}