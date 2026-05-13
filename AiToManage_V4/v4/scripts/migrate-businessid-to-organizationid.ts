/**
 * V4 Migration #01
 * businessId → organizationId unifikasyonu
 *
 * V3'teki 7 yeni şema "Business" modeline ref veriyor.
 * V2 şemaları "Organization" modeline ref veriyor.
 * Bu script tüm V3 koleksiyonlarını standartlaştırır.
 *
 * Çalıştırmak için:
 *   npx ts-node scripts/migrate-businessid-to-organizationid.ts
 *
 * ÖNEMLİ: Önce staging'de test et, backup al.
 */

import mongoose from 'mongoose';

const COLLECTIONS_TO_MIGRATE = [
  'whatsappbotsessions',
  'productcatalogs',
  'whatsappmessagelogs',
  'qrmenus',
  'qrscanlog',
  'crisisalerts',
  'brandreputationscores',
  'voicecontentdrafts',
  'voicecommandlogs',
  'competitors',
  'competitorpostanalyses',
  'competitorbenchmarkreports',
  'brandguidelines',
  'visualcompliancechecks',
  'specialdays',
  'contentcalendarevents',
  'autoschedulingrules',
];

interface MigrationResult {
  collection: string;
  matched: number;
  modified: number;
  errors: string[];
}

async function migrateCollection(
  db: mongoose.mongo.Db,
  collectionName: string
): Promise<MigrationResult> {
  const result: MigrationResult = {
    collection: collectionName,
    matched: 0,
    modified: 0,
    errors: [],
  };

  try {
    const collection = db.collection(collectionName);

    // Kaç döküman var kontrol et
    const totalDocs = await collection.countDocuments({ businessId: { $exists: true } });
    result.matched = totalDocs;

    if (totalDocs === 0) {
      console.log(`  ⏭  ${collectionName}: businessId alanı bulunamadı, atlandı`);
      return result;
    }

    // businessId → organizationId rename + ref düzeltme
    const updateResult = await collection.updateMany(
      { businessId: { $exists: true } },
      [
        {
          $set: {
            organizationId: '$businessId',
          },
        },
        {
          $unset: 'businessId',
        },
      ]
    );

    result.modified = updateResult.modifiedCount;
    console.log(`  ✅ ${collectionName}: ${totalDocs} döküman → ${updateResult.modifiedCount} güncellendi`);
  } catch (err: any) {
    result.errors.push(err.message);
    console.error(`  ❌ ${collectionName}: ${err.message}`);
  }

  return result;
}

async function createIndexes(db: mongoose.mongo.Db): Promise<void> {
  console.log('\n📊 Index\'ler güncelleniyor...');

  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    try {
      const collection = db.collection(collectionName);

      // Eski businessId indexini kaldır (varsa)
      try {
        await collection.dropIndex('businessId_1');
        console.log(`  🗑  ${collectionName}: eski businessId index kaldırıldı`);
      } catch {
        // Index yoksa hata vermez
      }

      try {
        await collection.dropIndex('businessId_1_status_1');
      } catch { }

      // Yeni organizationId indexi oluştur
      await collection.createIndex({ organizationId: 1 });
      console.log(`  ✅ ${collectionName}: organizationId index oluşturuldu`);
    } catch (err: any) {
      console.error(`  ❌ ${collectionName} index hatası: ${err.message}`);
    }
  }
}

async function runMigration(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable tanımlanmamış');
  }

  console.log('🚀 V4 Migration #01 başlıyor: businessId → organizationId\n');
  console.log(`📡 Bağlanılıyor: ${mongoUri.replace(/\/\/.*@/, '//***@')}\n`);

  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db!;

  const results: MigrationResult[] = [];

  console.log('🔄 Koleksiyonlar güncelleniyor...');
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    const result = await migrateCollection(db, collectionName);
    results.push(result);
  }

  await createIndexes(db);

  // Özet rapor
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 MİGRASYON ÖZET RAPORU');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let totalMatched = 0;
  let totalModified = 0;
  let totalErrors = 0;

  for (const r of results) {
    totalMatched += r.matched;
    totalModified += r.modified;
    totalErrors += r.errors.length;

    if (r.errors.length > 0) {
      console.log(`❌ ${r.collection}: ${r.errors.join(', ')}`);
    }
  }

  console.log(`\n✅ Toplam eşleşen döküman : ${totalMatched}`);
  console.log(`✅ Toplam güncellenen     : ${totalModified}`);
  console.log(`❌ Toplam hata           : ${totalErrors}`);

  if (totalErrors === 0) {
    console.log('\n🎉 Migrasyon başarıyla tamamlandı!');
  } else {
    console.log('\n⚠️  Migrasyon hatalara sahip, logları kontrol et.');
    process.exit(1);
  }

  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error('💥 Kritik hata:', err);
  process.exit(1);
});
