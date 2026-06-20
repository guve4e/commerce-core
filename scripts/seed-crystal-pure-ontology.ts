import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const STORE_SLUG = 'ava-cosmetica'

const skinTypes = [
  'normal',
  'dry',
  'oily',
  'combination',
  'sensitive',
  'mature',
  'acne-prone',
]

const concerns = [
  'dryness',
  'redness',
  'dullness',
  'uneven-tone',
  'pigmentation',
  'fine-lines',
  'wrinkles',
  'loss-of-firmness',
  'acne',
  'barrier-support',
]

const benefits = [
  'hydration',
  'radiance',
  'brightening',
  'firmness',
  'elasticity',
  'calming',
  'barrier-support',
  'anti-aging-support',
  'smoother-texture',
]

const productMap: Record<string, {
  concerns: string[]
  benefits: string[]
  skinTypes: string[]
}> = {
  'vitamin-c': {
    concerns: ['dullness', 'uneven-tone', 'pigmentation', 'fine-lines'],
    benefits: ['radiance', 'brightening', 'anti-aging-support'],
    skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive', 'mature'],
  },
  'hydrating': {
    concerns: ['dryness', 'barrier-support', 'fine-lines'],
    benefits: ['hydration', 'barrier-support', 'smoother-texture'],
    skinTypes: ['normal', 'dry', 'combination', 'sensitive', 'mature'],
  },
  'hyaluronic': {
    concerns: ['dryness', 'fine-lines'],
    benefits: ['hydration', 'smoother-texture'],
    skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive', 'mature'],
  },
  'repair': {
    concerns: ['acne', 'fine-lines', 'wrinkles', 'barrier-support'],
    benefits: ['anti-aging-support', 'smoother-texture', 'barrier-support'],
    skinTypes: ['normal', 'oily', 'combination', 'mature', 'acne-prone'],
  },
  'soothing': {
    concerns: ['redness', 'barrier-support', 'dryness'],
    benefits: ['calming', 'hydration', 'barrier-support'],
    skinTypes: ['normal', 'dry', 'combination', 'sensitive'],
  },
  'collagen': {
    concerns: ['loss-of-firmness', 'wrinkles', 'fine-lines'],
    benefits: ['firmness', 'elasticity', 'anti-aging-support'],
    skinTypes: ['normal', 'dry', 'combination', 'mature'],
  },
  'anti-aging': {
    concerns: ['wrinkles', 'fine-lines', 'uneven-tone'],
    benefits: ['anti-aging-support', 'smoother-texture', 'radiance'],
    skinTypes: ['normal', 'dry', 'combination', 'mature'],
  },
  'brightening': {
    concerns: ['dullness', 'pigmentation', 'uneven-tone'],
    benefits: ['brightening', 'radiance', 'smoother-texture'],
    skinTypes: ['normal', 'dry', 'oily', 'combination', 'sensitive'],
  },
}

function label(slug: string) {
  return slug
    .split('-')
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ')
}

async function main() {
  const store = await prisma.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
  })

  const skinTypeRows = new Map()
  for (const slug of skinTypes) {
    const row = await prisma.skinType.upsert({
      where: { storeId_slug: { storeId: store.id, slug } },
      create: { storeId: store.id, slug, name: label(slug) },
      update: { name: label(slug) },
    })
    skinTypeRows.set(slug, row)
  }

  const concernRows = new Map()
  for (const slug of concerns) {
    const row = await prisma.skinConcern.upsert({
      where: { storeId_slug: { storeId: store.id, slug } },
      create: { storeId: store.id, slug, name: label(slug) },
      update: { name: label(slug) },
    })
    concernRows.set(slug, row)
  }

  const benefitRows = new Map()
  for (const slug of benefits) {
    const row = await prisma.benefit.upsert({
      where: { storeId_slug: { storeId: store.id, slug } },
      create: { storeId: store.id, slug, name: label(slug) },
      update: { name: label(slug) },
    })
    benefitRows.set(slug, row)
  }

  for (const [productSlug, config] of Object.entries(productMap)) {
    const product = await prisma.product.findUnique({
      where: { storeId_slug: { storeId: store.id, slug: productSlug } },
    })

    if (!product) {
      console.warn(`Missing product: ${productSlug}`)
      continue
    }

    for (const concernSlug of config.concerns) {
      const concern = concernRows.get(concernSlug)
      await prisma.productConcern.upsert({
        where: {
          productId_concernId: {
            productId: product.id,
            concernId: concern.id,
          },
        },
        create: {
          productId: product.id,
          concernId: concern.id,
          strength: 2,
        },
        update: { strength: 2 },
      })
    }

    for (const benefitSlug of config.benefits) {
      const benefit = benefitRows.get(benefitSlug)
      await prisma.productBenefitAssignment.upsert({
        where: {
          productId_benefitId: {
            productId: product.id,
            benefitId: benefit.id,
          },
        },
        create: {
          productId: product.id,
          benefitId: benefit.id,
          strength: 2,
          sortOrder: 0,
        },
        update: { strength: 2 },
      })
    }

    for (const skinTypeSlug of config.skinTypes) {
      const skinType = skinTypeRows.get(skinTypeSlug)
      await prisma.productSkinType.upsert({
        where: {
          productId_skinTypeId: {
            productId: product.id,
            skinTypeId: skinType.id,
          },
        },
        create: {
          productId: product.id,
          skinTypeId: skinType.id,
          suitability: 'suitable',
          strength: 1,
        },
        update: {
          suitability: 'suitable',
          strength: 1,
        },
      })
    }

    console.log(`Seeded ontology for ${productSlug}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
