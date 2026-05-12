--- project/aitoearn-web/src/app/[lng]/calendar/page.tsx (原始)


+++ project/aitoearn-web/src/app/[lng]/calendar/page.tsx (修改后)
'use client';

import { useState } from 'react';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Örnek veri - gerçekte API'den gelecek
  const scheduledPosts = [
    { id: 1, day: 5, title: 'Altın Yüzük Koleksiyonu', platform: 'instagram', status: 'scheduled' },
    { id: 2, day: 8, title: 'El Yapımı Kolye', platform: 'facebook', status: 'published' },
    { id: 3, day: 12, title: 'Yılbaşı İndirimi', platform: 'instagram', status: 'draft' },
    { id: 4, day: 15, title: 'Müşteri Yorumu', platform: 'twitter', status: 'scheduled' },
    { id: 5, day: 20, title: 'Yeni Gelenler', platform: 'linkedin', status: 'draft' },
  ];

  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Ayın günlerini oluştur
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // İlk günün haftanın hangi günü olduğunu bul (0=Pazar, 1=Pazartesi, ...)
    let startingDay = firstDay.getDay();
    // Pazartesi'yi ilk gün yap
    startingDay = startingDay === 0 ? 6 : startingDay - 1;

    const days = [];

    // Önceki aydan gelen boşluklar
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }

    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getPostsForDay = (day: number) => {
    return scheduledPosts.filter(post => post.day === day);
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      facebook: '📘',
      twitter: '🐦',
      linkedin: '💼',
      tiktok: '🎵',
    };
    return icons[platform] || '📱';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700 border-gray-300',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-300',
      published: 'bg-green-100 text-green-700 border-green-300',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📅 İçerik Takvimi
          </h1>
          <p className="text-gray-600">
            Gönderilerinizi planlayın ve otomatik yayınlayın
          </p>
        </div>

        {/* Takvim Kontrolü */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              ← Önceki
            </button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              Sonraki →
            </button>
          </div>

          {/* Hafta Günleri */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Günler */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const posts = day ? getPostsForDay(day) : [];
              const isToday = day &&
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border ${
                    !day ? 'bg-gray-50 border-transparent' :
                    isToday ? 'bg-blue-50 border-blue-300' :
                    'bg-white border-gray-200 hover:border-blue-300'
                  } cursor-pointer transition-colors`}
                  onClick={() => day && setSelectedDay(day)}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {posts.slice(0, 3).map((post) => (
                          <div
                            key={post.id}
                            className={`text-xs p-1 rounded border ${getStatusColor(post.status)}`}
                          >
                            <span className="mr-1">{getPlatformIcon(post.platform)}</span>
                            {post.title.length > 15 ? post.title.substring(0, 15) + '...' : post.title}
                          </div>
                        ))}
                        {posts.length > 3 && (
                          <div className="text-xs text-gray-500 text-center">
                            +{posts.length - 3} daha
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-blue-600 text-white rounded-lg p-4 hover:bg-blue-700 transition-colors">
            <div className="text-2xl mb-2">➕</div>
            <h3 className="font-semibold">Yeni Gönderi Oluştur</h3>
            <p className="text-sm text-blue-100 mt-1">AI ile içerik üret</p>
          </button>

          <button className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-colors">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="font-semibold">Taslakları Görüntüle</h3>
            <p className="text-sm text-gray-600 mt-1">{scheduledPosts.filter(p => p.status === 'draft').length} taslak bekliyor</p>
          </button>

          <button className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
            <div className="text-2xl mb-2">⚙️</div>
            <h3 className="font-semibold">Otomasyon Ayarları</h3>
            <p className="text-sm text-gray-600 mt-1">Zamanlama kuralları</p>
          </button>
        </div>

        {/* Seçili Gün Detayı Modal */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {selectedDay} {monthNames[currentDate.getMonth()]} Gönderileri
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {getPostsForDay(selectedDay).length > 0 ? (
                  getPostsForDay(selectedDay).map((post) => (
                    <div
                      key={post.id}
                      className={`p-3 rounded-lg border ${getStatusColor(post.status)}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                        <span className="font-medium">{post.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-2 py-1 bg-white/50 rounded hover:bg-white">
                          Düzenle
                        </button>
                        <button className="text-xs px-2 py-1 bg-white/50 rounded hover:bg-white">
                          Sil
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📭</div>
                    <p>Bu gün için planlanmış gönderi yok.</p>
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Gönderi Ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}