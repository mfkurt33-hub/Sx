/**
 * V4 #07 — Studio Gerçek AI Entegrasyonu
 *
 * setTimeout simülasyonunu kaldırır, gerçek Replicate API'ya bağlar.
 * fal.ai fallback + retry stratejisi + ai-credit-usage kaydı.
 *
 * Kurulum:
 *   npm install replicate @fal-ai/serverless-client
 *
 * .env gereksinimleri:
 *   REPLICATE_API_TOKEN=r8_...
 *   FAL_KEY=...
 */

// ─── TİPLER ────────────────────────────────────────────────────────────────

export interface ImageEnhanceInput {
  imageUrl: string;
  prompt?: string;
  negativePrompt?: string;
  operations: ImageOperation[];
  outputFormat?: 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export type ImageOperation =
  | 'remove_background'
  | 'upscale'
  | 'enhance_lighting'
  | 'color_grade'
  | 'sharpen'
  | 'denoise';

export interface ImageEnhanceResult {
  outputUrl: string;
  provider: 'replicate' | 'fal_ai';
  model: string;
  processingTimeMs: number;
  creditsUsed: number;
  cost: { amount: number; currency: 'TRY' | 'USD' };
}

// ─── REPLICATE MODELLER ────────────────────────────────────────────────────

const REPLICATE_MODELS = {
  remove_background: 'lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285d65c14638e5393285897d69',
  upscale: 'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
  enhance_lighting: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
} as const;

const FAL_MODELS = {
  remove_background: 'fal-ai/background-removal',
  upscale: 'fal-ai/esrgan',
  enhance_lighting: 'fal-ai/flux/schnell',
} as const;

// ─── RETRY YARDIMCISI ──────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }

  throw lastError;
}

// ─── REPLICATE SERVİSİ ─────────────────────────────────────────────────────

async function runReplicate(
  operation: ImageOperation,
  input: Record<string, any>
): Promise<string> {
  // Dynamic import — replicate paketi kurulu olmalı
  const Replicate = (await import('replicate')).default;
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

  const modelId = REPLICATE_MODELS[operation as keyof typeof REPLICATE_MODELS];
  if (!modelId) throw new Error(`Replicate modeli bulunamadı: ${operation}`);

  const output = await replicate.run(modelId as any, { input });

  if (Array.isArray(output)) return output[0] as string;
  if (typeof output === 'string') return output;
  throw new Error('Beklenmeyen Replicate çıktı formatı');
}

// ─── FAL.AI FALLBACK ───────────────────────────────────────────────────────

async function runFalAi(
  operation: ImageOperation,
  input: Record<string, any>
): Promise<string> {
  const fal = await import('@fal-ai/serverless-client');

  const modelId = FAL_MODELS[operation as keyof typeof FAL_MODELS];
  if (!modelId) throw new Error(`fal.ai modeli bulunamadı: ${operation}`);

  const result = await fal.subscribe(modelId, {
    input,
    pollInterval: 1000,
  }) as any;

  return result?.image?.url ?? result?.images?.[0]?.url;
}

// ─── ANA SERVİS ────────────────────────────────────────────────────────────

export async function enhanceImage(
  params: ImageEnhanceInput,
  organizationId: string,
  userId: string
): Promise<ImageEnhanceResult> {
  const startTime = Date.now();
  let provider: 'replicate' | 'fal_ai' = 'replicate';
  let outputUrl: string;
  let modelUsed: string;

  const primaryOperation = params.operations[0] ?? 'upscale';

  const input: Record<string, any> = {
    image: params.imageUrl,
    prompt: params.prompt ?? 'professional product photo, studio lighting, high quality',
    negative_prompt: params.negativePrompt ?? 'blurry, low quality, distorted',
  };

  // 1. Replicate dene (3 retry)
  try {
    outputUrl = await withRetry(() => runReplicate(primaryOperation, input), 3, 1000);
    modelUsed = REPLICATE_MODELS[primaryOperation as keyof typeof REPLICATE_MODELS] ?? 'unknown';
  } catch (replicateErr) {
    console.warn(`⚠️ Replicate başarısız, fal.ai deneniyor: ${replicateErr}`);

    // 2. fal.ai fallback
    try {
      provider = 'fal_ai';
      outputUrl = await withRetry(() => runFalAi(primaryOperation, input), 2, 1500);
      modelUsed = FAL_MODELS[primaryOperation as keyof typeof FAL_MODELS] ?? 'unknown';
    } catch (falErr) {
      throw new Error(`Her iki sağlayıcı da başarısız. Replicate: ${replicateErr}, fal.ai: ${falErr}`);
    }
  }

  const processingTimeMs = Date.now() - startTime;

  // Kredi hesaplama (operasyon başına sabit maliyet)
  const CREDIT_COSTS: Record<ImageOperation, number> = {
    remove_background: 2,
    upscale: 5,
    enhance_lighting: 8,
    color_grade: 3,
    sharpen: 1,
    denoise: 2,
  };
  const creditsUsed = params.operations.reduce(
    (sum, op) => sum + (CREDIT_COSTS[op] ?? 3),
    0
  );

  // AI kredi kullanımını kaydet
  try {
    // Dynamic import — şema kurulu olmalı
    const { AICreditUsage } = await import('../schemas/ai-credit-usage.schema' as any);
    await AICreditUsage.create({
      organizationId,
      userId,
      actionType: 'image_generation',
      provider,
      model: modelUsed,
      cost: {
        amount: creditsUsed * 0.5, // 1 kredi = 0.5 TL
        currency: 'TRY',
        creditsUsed,
        unitPrice: 0.5,
      },
      requestDetails: {
        prompt: params.prompt,
        inputImages: [params.imageUrl],
        outputUrls: [outputUrl],
        parameters: { operations: params.operations },
      },
      status: 'completed',
      result: { success: true, outputUrl, processingTimeMs },
    });
  } catch (logErr) {
    // Kayıt hatası işlemi durdurmasın
    console.error('AI kredi kaydı başarısız:', logErr);
  }

  return {
    outputUrl,
    provider,
    model: modelUsed,
    processingTimeMs,
    creditsUsed,
    cost: { amount: creditsUsed * 0.5, currency: 'TRY' },
  };
}

// ─── NEXT.JS API ROUTE (app/api/studio/enhance/route.ts) ───────────────────

export const STUDIO_API_ROUTE = `
// app/api/studio/enhance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { enhanceImage } from '@/services/image-enhance.service';
import { auth } from '@/lib/auth';  // kendi auth servisiniz

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, prompt, operations, negativePrompt } = body;

    if (!imageUrl || !operations?.length) {
      return NextResponse.json({ error: 'imageUrl ve operations zorunlu' }, { status: 400 });
    }

    const result = await enhanceImage(
      { imageUrl, prompt, operations, negativePrompt },
      session.organizationId,
      session.userId
    );

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    console.error('Studio enhance hatası:', err);
    return NextResponse.json(
      { error: err.message ?? 'Görsel işleme başarısız' },
      { status: 500 }
    );
  }
}
`;
