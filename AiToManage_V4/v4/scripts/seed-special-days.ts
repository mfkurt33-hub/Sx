/**
 * V4 #02 — SpecialDay Global/Tenant Ayrımı
 *
 * Global günler (kandil, bayram, tatil) → isGlobal: true, organizationId: null
 * Tenant özel günler → isGlobal: false, organizationId: zorunlu
 *
 * Kullanım:
 *   npx ts-node scripts/seed-special-days.ts
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── ŞEMA ──────────────────────────────────────────────────────────────────

export interface ISpecialDay extends Document {
  // Global günler için null, tenant özel için organizationId
  organizationId?: string | null;
  isGlobal: boolean;

  name: string;
  nameEn?: string;
  date: {
    day?: number;           // Sabit tarih (14 Şubat gibi)
    month?: number;
    isLunar: boolean;       // Hicri takvim (kandiller için)
    lunarOffset?: number;   // Hicri tarihten gün farkı
    dynamicYear?: number;   // Hesaplanan yıl (her yıl değişen günler)
  };
  type: 'resmi_tatil' | 'kandil' | 'dini' | 'geleneksel' | 'farkindalik' | 'ulusal' | 'ozel';
  sector?: string[];        // Hangi sektörler için önemli (kuyumculuk, restoran vb.)

  contentSuggestions: {
    tone: 'samimi' | 'resmi' | 'coskultu' | 'huzunlu';
    captionIdeas: string[];
    hashtagSuggestions: string[];
    visualMood: string;
    callToAction?: string;
  };

  autoScheduleDefaults: {
    daysBeforeEvent: number;    // Kaç gün önce paylaşım yapılsın
    preferredHour: number;      // Tercih edilen saat (0-23)
    platforms: string[];
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecialDaySchema = new Schema<ISpecialDay>(
  {
    organizationId: { type: String, default: null, index: true },
    isGlobal: { type: Boolean, required: true, default: false, index: true },

    name: { type: String, required: true },
    nameEn: { type: String },

    date: {
      day: { type: Number, min: 1, max: 31 },
      month: { type: Number, min: 1, max: 12 },
      isLunar: { type: Boolean, default: false },
      lunarOffset: { type: Number, default: 0 },
      dynamicYear: { type: Number },
    },

    type: {
      type: String,
      required: true,
      enum: ['resmi_tatil', 'kandil', 'dini', 'geleneksel', 'farkindalik', 'ulusal', 'ozel'],
    },

    sector: [{ type: String }],

    contentSuggestions: {
      tone: { type: String, enum: ['samimi', 'resmi', 'coskultu', 'huzunlu'], default: 'samimi' },
      captionIdeas: [{ type: String }],
      hashtagSuggestions: [{ type: String }],
      visualMood: { type: String },
      callToAction: { type: String },
    },

    autoScheduleDefaults: {
      daysBeforeEvent: { type: Number, default: 1 },
      preferredHour: { type: Number, default: 9 },
      platforms: [{ type: String }],
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Global günleri getir (tüm tenantlar için ortak)
SpecialDaySchema.statics.getGlobalDays = function (sector?: string) {
  const filter: any = { isGlobal: true, isActive: true };
  if (sector) filter.sector = sector;
  return this.find(filter).sort({ 'date.month': 1, 'date.day': 1 });
};

// Organizasyona özel günleri getir (global + tenant'ın kendi günleri)
SpecialDaySchema.statics.getDaysForOrganization = function (
  organizationId: string,
  sector?: string
) {
  const filter: any = {
    isActive: true,
    $or: [{ isGlobal: true }, { organizationId }],
  };
  if (sector) filter.sector = sector;
  return this.find(filter).sort({ 'date.month': 1, 'date.day': 1 });
};

export const SpecialDay =
  models.SpecialDay || model<ISpecialDay>('SpecialDay', SpecialDaySchema);

// ─── SEED VERİSİ ───────────────────────────────────────────────────────────

export const TURKEY_SPECIAL_DAYS_SEED: Partial<ISpecialDay>[] = [
  // Resmi Tatiller
  {
    isGlobal: true,
    name: 'Yılbaşı',
    nameEn: "New Year's Day",
    date: { day: 1, month: 1, isLunar: false },
    type: 'resmi_tatil',
    sector: ['genel', 'kuyumculuk', 'restoran', 'tekstil'],
    contentSuggestions: {
      tone: 'coskultu',
      captionIdeas: [
        'Yeni yıl, yeni umutlar! 🎊 Hayallerinizin gerçeğe dönüştüğü bir yıl dileriz.',
        '2025\'e merhaba! Sevdiklerinizle güzel anılar biriktireceğiniz bir yıl olsun.',
      ],
      hashtagSuggestions: ['#YeniYıl2025', '#HappyNewYear', '#Mutluyıllar', '#2025'],
      visualMood: 'Altın konfetiler, şampanya, gece gökyüzü, parlak ışıklar',
      callToAction: 'Yeni yılı özel kıl! Yeni koleksiyonumuzu keşfet →',
    },
    autoScheduleDefaults: { daysBeforeEvent: 1, preferredHour: 20, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Ulusal Egemenlik ve Çocuk Bayramı',
    date: { day: 23, month: 4, isLunar: false },
    type: 'ulusal',
    sector: ['genel', 'kuyumculuk', 'restoran'],
    contentSuggestions: {
      tone: 'resmi',
      captionIdeas: [
        '23 Nisan Ulusal Egemenlik ve Çocuk Bayramı kutlu olsun! 🇹🇷',
        'Geleceğimiz olan çocukların bayramı ne mutlu! Atatürk\'ün çocuklara armağanını gururla kutluyoruz.',
      ],
      hashtagSuggestions: ['#23Nisan', '#UlusalEgemenlik', '#ÇocukBayramı', '#Atatürk'],
      visualMood: 'Türk bayrağı, çocuk yüzleri, bahar çiçekleri, mavi gökyüzü',
    },
    autoScheduleDefaults: { daysBeforeEvent: 1, preferredHour: 9, platforms: ['instagram', 'facebook', 'twitter'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Emek ve Dayanışma Günü',
    date: { day: 1, month: 5, isLunar: false },
    type: 'resmi_tatil',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'resmi',
      captionIdeas: ['1 Mayıs Emek ve Dayanışma Günü kutlu olsun! Tüm çalışanlara saygıyla.'],
      hashtagSuggestions: ['#1Mayıs', '#EmeğinBayramı', '#İşçiBayramı'],
      visualMood: 'Dayanışma, eller, gün batımı tonları',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 9, platforms: ['instagram'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Atatürk\'ü Anma, Gençlik ve Spor Bayramı',
    date: { day: 19, month: 5, isLunar: false },
    type: 'ulusal',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'resmi',
      captionIdeas: [
        '19 Mayıs Atatürk\'ü Anma, Gençlik ve Spor Bayramı kutlu olsun! 🇹🇷',
      ],
      hashtagSuggestions: ['#19Mayıs', '#GençlikveSpor', '#Atatürk'],
      visualMood: 'Türk bayrağı, gençlik, dinamizm, mavi-kırmızı',
    },
    autoScheduleDefaults: { daysBeforeEvent: 1, preferredHour: 9, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Zafer Bayramı',
    date: { day: 30, month: 8, isLunar: false },
    type: 'ulusal',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'resmi',
      captionIdeas: ['30 Ağustos Zafer Bayramımız kutlu olsun! 🇹🇷 Bu topraklar için canını veren kahramanlarımızı saygıyla anıyoruz.'],
      hashtagSuggestions: ['#30Ağustos', '#ZaferBayramı', '#Türkiye'],
      visualMood: 'Türk bayrağı, zafer anıtı, kırmızı-beyaz',
    },
    autoScheduleDefaults: { daysBeforeEvent: 1, preferredHour: 9, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Cumhuriyet Bayramı',
    date: { day: 29, month: 10, isLunar: false },
    type: 'ulusal',
    sector: ['genel', 'kuyumculuk', 'restoran'],
    contentSuggestions: {
      tone: 'coskultu',
      captionIdeas: [
        '29 Ekim Cumhuriyet Bayramımızın 101. yılı kutlu olsun! 🇹🇷 Ne mutlu Türk\'üm diyene!',
        'Cumhuriyetimizin kuruluşunu gururla kutluyoruz. Atatürk ve silah arkadaşlarını saygıyla anıyoruz.',
      ],
      hashtagSuggestions: ['#29Ekim', '#CumhuriyetBayramı', '#101YılCumhuriyet', '#Türkiye'],
      visualMood: 'Türk bayrağı, havai fişek, atatürk portresi, kırmızı-beyaz tonlar',
      callToAction: 'Cumhuriyet koleksiyonumuzu incele →',
    },
    autoScheduleDefaults: { daysBeforeEvent: 2, preferredHour: 9, platforms: ['instagram', 'facebook', 'twitter'] },
    isActive: true,
  },

  // Dini Günler (Kandiller)
  {
    isGlobal: true,
    name: 'Mevlid Kandili',
    date: { isLunar: true, lunarOffset: 0 },
    type: 'kandil',
    sector: ['genel', 'kuyumculuk'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: [
        'Mevlid Kandili\'niz mübarek olsun. Bu mübarek gecede dualarınız kabul olsun. 🌙',
        'Sevgi, huzur ve bereketle dolu bir kandil gecesi dileriz.',
      ],
      hashtagSuggestions: ['#MevlidKandili', '#KandilMübarekOlsun', '#Kandil'],
      visualMood: 'Ay ve yıldız, cami silueti, sıcak amber tonlar, mumlar',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 20, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Regaib Kandili',
    date: { isLunar: true, lunarOffset: 0 },
    type: 'kandil',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: ['Regaib Kandili\'niz mübarek olsun. 🌙'],
      hashtagSuggestions: ['#RegaibKandili', '#KandilMübarekOlsun'],
      visualMood: 'Ay ışığı, cami, huzur',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 20, platforms: ['instagram'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Mirac Kandili',
    date: { isLunar: true, lunarOffset: 0 },
    type: 'kandil',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: ['Mirac Kandili\'niz mübarek olsun. Bu mübarek gecenin huzurunu kalbinizde hissedin. 🌙'],
      hashtagSuggestions: ['#MiracKandili', '#KandilMübarekOlsun'],
      visualMood: 'Yıldızlı gece, spiritüel ışık, huzur',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 20, platforms: ['instagram'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Berat Kandili',
    date: { isLunar: true, lunarOffset: 0 },
    type: 'kandil',
    sector: ['genel'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: ['Berat Kandili\'niz mübarek olsun. Günahların affedildiği bu gecede dualarınız kabul olsun. 🌙'],
      hashtagSuggestions: ['#BeratKandili', '#KandilMübarekOlsun'],
      visualMood: 'Af ve merhamet, beyaz ışık, huzur',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 20, platforms: ['instagram'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Kadir Gecesi',
    date: { isLunar: true, lunarOffset: 0 },
    type: 'kandil',
    sector: ['genel', 'kuyumculuk'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: [
        'Kadir Geceniz mübarek olsun. Bin aydan hayırlı bu gecede dualarınız kabul olsun. 🌙✨',
        'Bu mübarek gecede sevdiklerinizle huzur ve bereket içinde olmanızı dileriz.',
      ],
      hashtagSuggestions: ['#KadirGecesi', '#KandilMübarekOlsun', '#RamazanKarimi'],
      visualMood: 'Altın ışık, cami, yıldızlar, derin huzur',
    },
    autoScheduleDefaults: { daysBeforeEvent: 0, preferredHour: 21, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },

  // Geleneksel & Ticari Günler
  {
    isGlobal: true,
    name: 'Sevgililer Günü',
    date: { day: 14, month: 2, isLunar: false },
    type: 'geleneksel',
    sector: ['kuyumculuk', 'çiçekçi', 'restoran', 'tekstil'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: [
        '14 Şubat Sevgililer Günü\'nde sevdiklerinize altın gibi değer verin! 💛',
        'Aşkınızı ölümsüz kılın — özel koleksiyonumuzu keşfedin. ❤️',
      ],
      hashtagSuggestions: ['#SevgililerGünü', '#Valentines', '#AşkGünü', '#HediyeFikirleri', '#Altın'],
      visualMood: 'Kırmızı güller, altın kalp, romantik ışık, kadife kutu',
      callToAction: 'Sevgililer Günü koleksiyonunu gör →',
    },
    autoScheduleDefaults: { daysBeforeEvent: 7, preferredHour: 18, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Anneler Günü',
    date: { day: 12, month: 5, isLunar: false },  // 2. pazar, yaklaşık
    type: 'geleneksel',
    sector: ['kuyumculuk', 'çiçekçi', 'tekstil', 'restoran'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: [
        'Anneler Günü\'nde en değerli varlığınıza en değerli hediyeyi götürün. 💛',
        'Annenizi sevginizle taçlandırın. Özel Anneler Günü koleksiyonumuzu inceleyin.',
      ],
      hashtagSuggestions: ['#AnnelerGünü', '#MothersDay', '#AnneHediyesi', '#AltınHediye'],
      visualMood: 'Sarı-altın tonlar, çiçekler, sıcak aile atmosferi, gülümseyen yüzler',
      callToAction: 'Annene özel bir hediye seç →',
    },
    autoScheduleDefaults: { daysBeforeEvent: 7, preferredHour: 9, platforms: ['instagram', 'facebook'] },
    isActive: true,
  },
  {
    isGlobal: true,
    name: 'Babalar Günü',
    date: { day: 15, month: 6, isLunar: false },  // 3. pazar, yaklaşık
    type: 'geleneksel',
    sector: ['kuyumculuk', 'tekstil'],
    contentSuggestions: {
      tone: 'samimi',
      captionIdeas: ['Babalar Günü\'nde babanıza en güzel hediyeyi götürün. 💛'],
      hashtagSuggestions: ['#BabalarGünü', '#FathersDay', '#BabaHediyesi'],
      visualMood: 'Erkek takısı, güçlü-sade estetik, altın-kahverengi tonlar',
    },
    autoScheduleDefaults: { daysBeforeEvent: 7, preferredHour: 9, platforms: ['instagram'] },
    isActive: true,
  },
];

// ─── SEED RUNNER ───────────────────────────────────────────────────────────

export async function seedSpecialDays(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error('MONGODB_URI tanımlanmamış');

  await mongoose.connect(mongoUri);
  console.log('🌱 SpecialDay seed başlıyor...\n');

  let inserted = 0;
  let skipped = 0;

  for (const day of TURKEY_SPECIAL_DAYS_SEED) {
    const existing = await SpecialDay.findOne({ name: day.name, isGlobal: true });
    if (existing) {
      console.log(`  ⏭  "${day.name}" zaten mevcut, atlandı`);
      skipped++;
      continue;
    }

    await SpecialDay.create(day);
    console.log(`  ✅ "${day.name}" eklendi`);
    inserted++;
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Eklenen : ${inserted}`);
  console.log(`⏭  Atlanan : ${skipped}`);
  console.log(`📦 Toplam  : ${TURKEY_SPECIAL_DAYS_SEED.length}`);

  await mongoose.disconnect();
  console.log('\n🎉 Seed tamamlandı!');
}

// Doğrudan çalıştırılırsa
if (require.main === module) {
  seedSpecialDays().catch(console.error);
}
