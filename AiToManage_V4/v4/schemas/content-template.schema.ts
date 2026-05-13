/**
 * V4 #08 — İçerik Şablon Kütüphanesi
 *
 * - Başarılı gönderilerden şablon oluştur
 * - Ramazan, Anneler Günü gibi hazır paketler
 * - Kuyumculuğa özel sektör şablonları
 * - Onboarding "ilk içerik" adımını besler
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

// ─── ŞEMA ──────────────────────────────────────────────────────────────────

export interface IContentTemplate extends Document {
  // Sahiplik — global şablonlar (null) veya tenant'a özel
  organizationId?: string | null;
  isGlobal: boolean;
  createdByUserId?: string;

  // Şablon bilgileri
  title: string;
  description?: string;
  category: TemplateCategory;
  subcategory?: string;

  // Hedef sektörler
  sectors: string[];            // ['kuyumculuk', 'restoran', ...]

  // Platform
  platforms: ('instagram' | 'facebook' | 'twitter' | 'linkedin')[];
  contentType: 'feed' | 'story' | 'reel' | 'carousel';

  // İçerik şablonu
  template: {
    captionTemplate: string;    // "{{ürün_adı}} için özel fırsat! 💛 {{fiyat}} TL"
    variables: TemplateVariable[];
    hashtagGroups: string[][];  // [[grup1], [grup2]] — random seçilir
    ctaOptions: string[];       // Çağrı metni alternatifleri
    emojiStyle: 'minimal' | 'moderate' | 'heavy';
  };

  // Görsel önerileri
  visual: {
    mood: string;               // AI görsel prompt için tema
    colorPalette?: string[];    // Renk önerileri
    aspectRatio: '1:1' | '4:5' | '9:16' | '16:9';
    styleKeywords: string[];    // AI prompt için anahtar kelimeler
    examplePrompt?: string;     // Hazır AI görsel prompt
  };

  // Özel gün bağlantısı
  specialDay?: {
    specialDayId?: string;
    dayName?: string;
    daysBeforeEvent: number;    // Kaç gün önce kullanılacak
  };

  // Performans istatistikleri (şablon kullanıldıkça güncellenir)
  stats: {
    usageCount: number;
    avgEngagementRate?: number;
    avgReach?: number;
    lastUsedAt?: Date;
    rating?: number;            // Kullanıcı puanı (1-5)
    ratingCount?: number;
  };

  // Kaynak gönderi (şablon bir gönderiden türetildiyse)
  sourcePostId?: string;
  isFromSuccessfulPost?: boolean;

  // Durum
  isActive: boolean;
  isFeatured: boolean;          // Öne çıkarılmış şablon

  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateVariable {
  key: string;                  // 'ürün_adı', 'fiyat', 'indirim_oranı'
  label: string;                // Kullanıcıya gösterilecek isim
  type: 'text' | 'number' | 'price' | 'percentage' | 'date';
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
}

export type TemplateCategory =
  | 'product_showcase'          // Ürün tanıtımı
  | 'promotion'                 // İndirim / kampanya
  | 'special_day'               // Özel gün kutlaması
  | 'behind_scenes'             // Perde arkası
  | 'customer_story'            // Müşteri hikayesi
  | 'educational'               // Bilgilendirme
  | 'collection_launch'         // Koleksiyon lansmanı
  | 'seasonal'                  // Mevsimsel içerik
  | 'brand_story';              // Marka hikayesi

const ContentTemplateSchema = new Schema<IContentTemplate>(
  {
    organizationId: { type: String, default: null, index: true },
    isGlobal: { type: Boolean, required: true, default: false, index: true },
    createdByUserId: { type: String },

    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      required: true,
      enum: [
        'product_showcase', 'promotion', 'special_day', 'behind_scenes',
        'customer_story', 'educational', 'collection_launch', 'seasonal', 'brand_story',
      ],
    },
    subcategory: { type: String },

    sectors: [{ type: String }],
    platforms: [{ type: String, enum: ['instagram', 'facebook', 'twitter', 'linkedin'] }],
    contentType: {
      type: String,
      enum: ['feed', 'story', 'reel', 'carousel'],
      default: 'feed',
    },

    template: {
      captionTemplate: { type: String, required: true },
      variables: [
        {
          key: { type: String, required: true },
          label: { type: String, required: true },
          type: { type: String, enum: ['text', 'number', 'price', 'percentage', 'date'], default: 'text' },
          placeholder: { type: String },
          required: { type: Boolean, default: true },
          defaultValue: { type: String },
        },
      ],
      hashtagGroups: [[{ type: String }]],
      ctaOptions: [{ type: String }],
      emojiStyle: { type: String, enum: ['minimal', 'moderate', 'heavy'], default: 'moderate' },
    },

    visual: {
      mood: { type: String },
      colorPalette: [{ type: String }],
      aspectRatio: { type: String, enum: ['1:1', '4:5', '9:16', '16:9'], default: '1:1' },
      styleKeywords: [{ type: String }],
      examplePrompt: { type: String },
    },

    specialDay: {
      specialDayId: { type: String },
      dayName: { type: String },
      daysBeforeEvent: { type: Number, default: 1 },
    },

    stats: {
      usageCount: { type: Number, default: 0 },
      avgEngagementRate: { type: Number },
      avgReach: { type: Number },
      lastUsedAt: { type: Date },
      rating: { type: Number, min: 1, max: 5 },
      ratingCount: { type: Number, default: 0 },
    },

    sourcePostId: { type: String },
    isFromSuccessfulPost: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Indexler
ContentTemplateSchema.index({ isGlobal: 1, category: 1, isActive: 1 });
ContentTemplateSchema.index({ organizationId: 1, isActive: 1 });
ContentTemplateSchema.index({ sectors: 1, isGlobal: 1 });

// Şablonu doldur (değişkenleri gerçek değerlerle doldur)
ContentTemplateSchema.methods.fill = function (values: Record<string, string>): string {
  let caption = this.template.captionTemplate;
  for (const variable of this.template.variables) {
    const value = values[variable.key] ?? variable.defaultValue ?? `{{${variable.key}}}`;
    caption = caption.replaceAll(`{{${variable.key}}}`, value);
  }
  return caption;
};

// Kullanım sayısını artır
ContentTemplateSchema.methods.recordUsage = async function (engagementRate?: number) {
  this.stats.usageCount += 1;
  this.stats.lastUsedAt = new Date();
  if (engagementRate !== undefined) {
    const prev = this.stats.avgEngagementRate ?? 0;
    const count = this.stats.usageCount;
    this.stats.avgEngagementRate = (prev * (count - 1) + engagementRate) / count;
  }
  return this.save();
};

// Sektöre göre global şablonları getir
ContentTemplateSchema.statics.getForSector = function (
  sector: string,
  category?: TemplateCategory
) {
  const filter: any = { isGlobal: true, isActive: true, sectors: sector };
  if (category) filter.category = category;
  return this.find(filter).sort({ 'stats.usageCount': -1, isFeatured: -1 });
};

// Başarılı gönderiden şablon oluştur
ContentTemplateSchema.statics.createFromPost = async function ({
  organizationId,
  createdByUserId,
  postContent,
  platforms,
  engagementRate,
}: {
  organizationId: string;
  createdByUserId: string;
  postContent: string;
  platforms: string[];
  engagementRate?: number;
}) {
  // Basit değişken tespiti: {{}} içindeki alanlar
  const variableMatches = postContent.match(/\{\{([^}]+)\}\}/g) ?? [];
  const variables: TemplateVariable[] = variableMatches.map((match) => {
    const key = match.replace(/[{}]/g, '').trim();
    return { key, label: key, type: 'text', required: false };
  });

  return this.create({
    organizationId,
    isGlobal: false,
    createdByUserId,
    title: `Özel şablon — ${new Date().toLocaleDateString('tr-TR')}`,
    category: 'product_showcase',
    sectors: [],
    platforms,
    template: {
      captionTemplate: postContent,
      variables,
      hashtagGroups: [],
      ctaOptions: [],
      emojiStyle: 'moderate',
    },
    visual: { mood: '', aspectRatio: '1:1', styleKeywords: [] },
    stats: { usageCount: 0, avgEngagementRate: engagementRate },
    isFromSuccessfulPost: true,
  });
};

export const ContentTemplate =
  models.ContentTemplate || model<IContentTemplate>('ContentTemplate', ContentTemplateSchema);

// ─── GLOBAL SEED ŞABLONLARı ────────────────────────────────────────────────

export const JEWELRY_SEED_TEMPLATES: Partial<IContentTemplate>[] = [
  {
    isGlobal: true,
    title: 'Yeni Ürün Tanıtımı — Kuyumculuk',
    category: 'product_showcase',
    sectors: ['kuyumculuk'],
    platforms: ['instagram', 'facebook'],
    contentType: 'feed',
    template: {
      captionTemplate:
        '✨ Yeni Gelenler! ✨\n\n{{ürün_adı}} koleksiyonumuza hoş geldiniz.\n\n🪙 {{ayar}} Ayar | {{ağırlık}}gr\n💰 {{fiyat}} TL\'den başlayan fiyatlarla\n\n{{mağaza_adı}} olarak en kaliteli işçiliği en uygun fiyatla sunuyoruz.\n\n📍 {{adres}}\n📞 {{telefon}}\n\n#Kuyumculuk #AltınTakı #{{şehir}}Kuyumcu',
      variables: [
        { key: 'ürün_adı', label: 'Ürün adı', type: 'text', required: true },
        { key: 'ayar', label: 'Altın ayarı', type: 'number', required: true, placeholder: '22' },
        { key: 'ağırlık', label: 'Ağırlık (gram)', type: 'number', required: false },
        { key: 'fiyat', label: 'Başlangıç fiyatı', type: 'price', required: true },
        { key: 'mağaza_adı', label: 'Mağaza adı', type: 'text', required: true },
        { key: 'adres', label: 'Adres', type: 'text', required: false },
        { key: 'telefon', label: 'Telefon', type: 'text', required: false },
        { key: 'şehir', label: 'Şehir', type: 'text', required: false },
      ],
      hashtagGroups: [
        ['#AltınTakı', '#Kuyumculuk', '#Altın', '#Mücevher'],
        ['#GoldJewelry', '#FineJewelry', '#HeykelAltın'],
      ],
      ctaOptions: [
        'DM\'den fiyat al →',
        'Linkteki mağazayı ziyaret et →',
        'Stoklar sınırlı, hemen ulaş! →',
      ],
      emojiStyle: 'moderate',
    },
    visual: {
      mood: 'Profesyonel ürün çekimi, beyaz veya siyah arka plan, altın parlaklığı, stüdyo aydınlatması',
      colorPalette: ['#D4AF37', '#FFFFFF', '#000000'],
      aspectRatio: '1:1',
      styleKeywords: ['luxury', 'gold', 'jewelry', 'studio', 'professional'],
      examplePrompt: 'Professional jewelry photography, gold necklace on white velvet, studio lighting, high resolution, luxury brand aesthetic',
    },
    stats: { usageCount: 0 },
    isFeatured: true,
    isActive: true,
    tags: ['altın', 'ürün', 'kuyumculuk'],
  },
  {
    isGlobal: true,
    title: 'Bayram Tebriği — Kuyumculuk',
    category: 'special_day',
    sectors: ['kuyumculuk', 'genel'],
    platforms: ['instagram', 'facebook'],
    contentType: 'feed',
    template: {
      captionTemplate:
        '🌙 {{bayram_adı}} Mübarek Olsun! 🌙\n\nSevdiklerinizle dolu, huzur ve bereket içinde bir {{bayram_adı}} geçirmenizi dileriz.\n\n{{mağaza_adı}} ailesi olarak tüm müşterilerimizin bayramını kutluyoruz. 🙏\n\n#{{bayram_adı_hashtag}} #BayramMübarekOlsun #Kuyumculuk',
      variables: [
        { key: 'bayram_adı', label: 'Bayram adı', type: 'text', required: true, placeholder: 'Ramazan Bayramı' },
        { key: 'bayram_adı_hashtag', label: 'Bayram hashtag', type: 'text', required: true, placeholder: 'RamazanBayramı' },
        { key: 'mağaza_adı', label: 'Mağaza adı', type: 'text', required: true },
      ],
      hashtagGroups: [
        ['#BayramMübarekOlsun', '#Bayram', '#Kandil'],
      ],
      ctaOptions: ['Tüm müşterilerimizin bayramını kutlarız 🙏'],
      emojiStyle: 'moderate',
    },
    visual: {
      mood: 'Ay ve yıldız, cami silueti, sıcak amber ve altın tonlar, bayram atmosferi',
      aspectRatio: '1:1',
      styleKeywords: ['ramadan', 'moon', 'warm', 'gold', 'celebration'],
      examplePrompt: 'Islamic holiday greeting card, crescent moon and stars, warm golden light, mosque silhouette, elegant and festive',
    },
    stats: { usageCount: 0 },
    isFeatured: true,
    isActive: true,
    tags: ['bayram', 'özel gün', 'tebrik'],
  },
];
