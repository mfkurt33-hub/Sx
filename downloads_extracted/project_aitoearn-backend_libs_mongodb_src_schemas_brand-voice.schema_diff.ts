--- project/aitoearn-backend/libs/mongodb/src/schemas/brand-voice.schema.ts (原始)


+++ project/aitoearn-backend/libs/mongodb/src/schemas/brand-voice.schema.ts (修改后)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BrandVoiceDocument = BrandVoice & Document;

/**
 * Marka Sesi Tonları
 * İçerik üretiminde AI'ın kullanacağı ton ve stil
 */
export enum BrandTone {
  PROFESSIONAL = 'professional', // Resmi, kurumsal
  FRIENDLY = 'friendly', // Samimi, dostane
  HUMOROUS = 'humorous', // Komik, eğlenceli
  INSPIRING = 'inspiring', // İlham verici, motive edici
  EDUCATIONAL = 'educational', // Eğitici, bilgilendirici
  PERSUASIVE = 'persuasive', // İkna edici, satış odaklı
  LUXURIOUS = 'luxurious', // Lüks, premium (Kuyumcular için ideal)
  MINIMALIST = 'minimalist', // Sade, minimalist
}

/**
 * Hedef Kitle Tipleri
 */
export enum TargetAudience {
  GEN_Z = 'gen_z', // 18-24 yaş
  MILLENNIAL = 'millennial', // 25-40 yaş
  GEN_X = 'gen_x', // 41-56 yaş
  BOOMER = 'boomer', // 57+ yaş
  BUSINESS = 'business', // İş insanları
  LUXURY_BUYERS = 'luxury_buyers', // Lüks ürün alıcıları
  LOCAL_COMMUNITY = 'local_community', // Yerel topluluk
}

/**
 * Örnek Gönderi (AI Eğitimi İçin)
 * Markanın geçmiş gönderilerinden örnekler saklanır
 */
@Schema({ _id: false })
export class VoiceExample {
  @Prop({ required: true })
  caption: string; // Örnek başlık

  @Prop()
  imageUrl?: string; // Varsa görsel URL

  @Prop({ default: 0 })
  likes: number; // Bu gönderinin aldığı beğeni (Başarı metriği)

  @Prop({ default: 0 })
  comments: number; // Yorum sayısı

  @Prop()
  notes?: string; // Neden bu örnek seçildi? (İç not)
}

/**
 * Yasaklı Kelimeler ve Konular
 * AI asla bunları kullanmamalı
 */
@Schema({ _id: false })
export class ContentRestriction {
  @Prop({ required: true })
  type: 'word' | 'phrase' | 'topic' | 'competitor';

  @Prop({ required: true })
  value: string; // Yasaklı kelime veya ifade

  @Prop()
  reason?: string; // Neden yasaklandı?
}

/**
 * Sık Kullanılan Hashtag Grupları
 * Marka için önceden belirlenmiş hashtag setleri
 */
@Schema({ _id: false })
export class HashtagGroup {
  @Prop({ required: true })
  name: string; // Grup adı (Örn: "Ürün Tanıtımı")

  @Prop([String], { required: true })
  hashtags: string[]; // Hashtag listesi

  @Prop({ default: true })
  isActive: boolean; // Aktif mi?
}

/**
 * Emoji Tercihleri
 * Marka hangi emojileri kullanır, hangilerini kullanmaz?
 */
@Schema({ _id: false })
export class EmojiPreferences {
  @Prop([String])
  preferredEmojis: string[]; // Sık kullanılan emojiler

  @Prop([String])
  bannedEmojis: string[]; // Asla kullanılmaması gereken emojiler
}

@Schema({ timestamps: true })
export class BrandVoice {
  /**
   * Organizasyon ID (Çok kiracılık için zorunlu)
   * Her organizasyonun sadece bir brand voice kaydı olur.
   */
  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true, unique: true })
  organizationId: Types.ObjectId;

  /**
   * Marka Adı
   */
  @Prop({ required: true })
  brandName: string;

  /**
   * Marka Açıklaması
   * AI'a markayı tanıtmak için kullanılan ana metin.
   * Örn: "Salih Çetinkaya Kuyumculuk, 1985'ten beri Mersin'de..."
   */
  @Prop({ required: true })
  description: string;

  /**
   * Marka Hikayesi (Uzun Form)
   * Detaylı hikaye, misyon, vizyon
   */
  @Prop()
  story?: string;

  /**
   * Anahtar Kelimeler
   * Markayla özdeşleşmiş kelimeler
   * Örn: ["kalite", "güven", "el işçiliği", "özel tasarım"]
   */
  @Prop([String])
  keywords: string[];

  /**
   * Marka Tonu
   * Hangi ton kullanılacak?
   */
  @Prop({ type: String, enum: BrandTone, default: BrandTone.PROFESSIONAL })
  tone: BrandTone;

  /**
   * İkincil Tonlar
   * Ana tonun yanında kullanılabilen destek tonları
   */
  @Prop([String], { enum: BrandTone })
  secondaryTones: BrandTone[];

  /**
   * Hedef Kitle
   */
  @Prop({ type: [String], enum: TargetAudience })
  targetAudiences: TargetAudience[];

  /**
   * Değerler
   * Markanın temsil ettiği değerler
   * Örn: ["Güven", "Şeffaflık", "Mükemmellik"]
   */
  @Prop([String])
  values: string[];

  /**
   * Örnek Gönderiler (AI Eğitimi İçin)
   * En az 5, en fazla 20 örnek gönderi
   */
  @Prop({ type: [VoiceExample], default: [] })
  examples: VoiceExample[];

  /**
   * Yasaklı Kelimeler ve Konular
   */
  @Prop({ type: [ContentRestriction], default: [] })
  restrictions: ContentRestriction[];

  /**
   * Hashtag Grupları
   */
  @Prop({ type: [HashtagGroup], default: [] })
  hashtagGroups: HashtagGroup[];

  /**
   * Emoji Tercihleri
   */
  @Prop({ type: EmojiPreferences })
  emojiPreferences: EmojiPreferences;

  /**
   * Hitap Şekli
   * Müşterilere nasıl hitap edilmeli?
   */
  @Prop({ default: 'siz' })
  addressForm: 'sen' | 'siz';

  /**
   * CTA (Call-to-Action) Tercihleri
   * Sık kullanılan eylem çağrıları
   * Örn: ["Hemen İnceleyin", "Bize Ulaşın", "Randevu Alın"]
   */
  @Prop([String])
  ctas: string[];

  /**
   * Rakip Markalar
   * AI rakiplerden bahsederken dikkatli olmalı
   */
  @Prop([String])
  competitors: string[];

  /**
   * Logo URL
   */
  @Prop()
  logoUrl?: string;

  /**
   * Renk Paleti (Hex Kodları)
   * Görsel üretimde kullanılacak renkler
   */
  @Prop([String])
  colorPalette: string[];

  /**
   * Son Güncelleme Tarihi
   * Otomatik olarak timestamps ile yönetilir
   */

  /**
   * AI Eğitim Durumu
   * Marka sesi AI tarafından öğrenildi mi?
   */
  @Prop({ default: false })
  isAiTrained: boolean;

  /**
   * Son Eğitim Tarihi
   */
  @Prop()
  lastAiTrainingDate?: Date;

  /**
   * Eğitim Model ID'si
   * Fine-tuning yapıldıysa model ID'si
   */
  @Prop()
  aiModelId?: string;
}

export const BrandVoiceSchema = SchemaFactory.createForClass(BrandVoice);

// Indexler
BrandVoiceSchema.index({ organizationId: 1 });