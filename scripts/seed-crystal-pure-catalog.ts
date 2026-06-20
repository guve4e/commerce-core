import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'

const prisma = new PrismaClient()

type OldProduct = any

const STORE_SLUG = 'ava-cosmetica'
const STORE_NAME = 'AVA Cosmetica'

function localeOf(p: OldProduct) {
  return p.company?.includes(':BG') || p.group?.includes(':bg') ? 'bg' : 'en'
}

function baseGroupOf(p: OldProduct) {
  return String(p.group).replace(':bg', '')
}

function slugOf(group: string) {
  return group
    .replace('vitcserum', 'vitamin-c')
    .replace('hydserum', 'hydrating')
    .replace('hyserum', 'hyaluronic')
    .replace('iserum', 'repair')
    .replace('soothserum', 'soothing')
    .replace('collagenserum', 'collagen')
    .replace('antiageserum', 'anti-aging')
    .replace('brserum', 'brightening')
    .replace('cserum', 'ava-vitamin-c')
    .replace('hserum', 'ava-hyaluronic')
    .replace('q10serum', 'ava-q10')
}

async function main() {
  const raw = fs.readFileSync('scripts/data/INVENTORY.product.json', 'utf8')
  const oldProducts: OldProduct[] = JSON.parse(raw)

  const store = await prisma.store.upsert({
    where: { slug: STORE_SLUG },
    create: { slug: STORE_SLUG, name: STORE_NAME },
    update: { name: STORE_NAME },
  })

  const groups = new Map<string, OldProduct[]>()

  for (const p of oldProducts) {
    const baseGroup = baseGroupOf(p)
    groups.set(baseGroup, [...(groups.get(baseGroup) ?? []), p])
  }

  const defaultEur = await prisma.priceList.upsert({
    where: {
      storeId_name_currency: {
        storeId: store.id,
        name: 'Default',
        currency: 'EUR',
      },
    },
    create: {
      storeId: store.id,
      name: 'Default',
      currency: 'EUR',
      active: true,
    },
    update: { active: true },
  })

  const defaultUsd = await prisma.priceList.upsert({
    where: {
      storeId_name_currency: {
        storeId: store.id,
        name: 'Default',
        currency: 'USD',
      },
    },
    create: {
      storeId: store.id,
      name: 'Default',
      currency: 'USD',
      active: true,
    },
    update: { active: true },
  })

  for (const [baseGroup, localizedProducts] of groups) {
    const en = localizedProducts.find((p) => localeOf(p) === 'en') ?? localizedProducts[0]
    const slug = slugOf(baseGroup)

    const product = await prisma.product.upsert({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug,
        },
      },
      create: {
        storeId: store.id,
        slug,
        name: en.name,
        description: en.description ?? '',
        status: 'active',
      },
      update: {
        name: en.name,
        description: en.description ?? '',
        status: 'active',
      },
    })

    for (const p of localizedProducts) {
      const locale = localeOf(p)

      await prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: product.id,
            locale,
          },
        },
        create: {
          productId: product.id,
          locale,
          name: p.name,
          shortDescription: p.info ?? null,
          description: p.description ?? null,
          keyIngredients: p.keyIngredients ?? null,
          fullIngredients: p.fullIngredients ?? null,
          directions: p.directions ?? null,
          warnings: p.warnings ?? null,
          whatToExpect: p.whatToExpect ?? null,
        },
        update: {
          name: p.name,
          shortDescription: p.info ?? null,
          description: p.description ?? null,
          keyIngredients: p.keyIngredients ?? null,
          fullIngredients: p.fullIngredients ?? null,
          directions: p.directions ?? null,
          warnings: p.warnings ?? null,
          whatToExpect: p.whatToExpect ?? null,
        },
      })
    }

    const imageTypes = [
      ['MAIN', en.picture?.art ?? []],
      ['REVIEW', en.picture?.review ?? []],
      ['SHOP', en.picture?.shop ?? []],
      ['CAROUSEL', en.picture?.carousel ?? []],
    ] as const

    for (const [type, paths] of imageTypes) {
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i]
        await prisma.productImage.upsert({
          where: { id: `${product.id}:${type}:${i}` },
          create: {
            id: `${product.id}:${type}:${i}`,
            productId: product.id,
            type,
            path,
            sortOrder: i,
          },
          update: {
            path,
            sortOrder: i,
          },
        })
      }
    }

    for (const variantInput of en.productTypes ?? []) {
      const variant = await prisma.productVariant.upsert({
        where: { sku: variantInput.sku },
        create: {
          productId: product.id,
          sku: variantInput.sku,
          name: variantInput.name,
          attributes: {
            type: variantInput.type,
            concentration: variantInput.concentration ?? null,
            legacyGroup: variantInput.group,
            properties: variantInput.properties ?? null,
          },
        },
        update: {
          name: variantInput.name,
          attributes: {
            type: variantInput.type,
            concentration: variantInput.concentration ?? null,
            legacyGroup: variantInput.group,
            properties: variantInput.properties ?? null,
          },
        },
      })

      await prisma.inventoryItem.upsert({
        where: { variantId: variant.id },
        create: {
          variantId: variant.id,
          quantity: variantInput.quantity ?? 0,
          reservedQuantity: 0,
        },
        update: {
          quantity: variantInput.quantity ?? 0,
        },
      })

      await prisma.variantPrice.upsert({
        where: { id: `${variant.id}:EUR` },
        create: {
          id: `${variant.id}:EUR`,
          variantId: variant.id,
          priceListId: defaultEur.id,
          regularPrice: variantInput.price ?? 0,
          compareAtPrice: variantInput.originalPrice && variantInput.originalPrice > variantInput.price
            ? variantInput.originalPrice
            : null,
          active: true,
        },
        update: {
          regularPrice: variantInput.price ?? 0,
          compareAtPrice: variantInput.originalPrice && variantInput.originalPrice > variantInput.price
            ? variantInput.originalPrice
            : null,
          active: true,
        },
      })

      await prisma.variantPrice.upsert({
        where: { id: `${variant.id}:USD` },
        create: {
          id: `${variant.id}:USD`,
          variantId: variant.id,
          priceListId: defaultUsd.id,
          regularPrice: variantInput.price ?? 0,
          compareAtPrice: variantInput.originalPrice && variantInput.originalPrice > variantInput.price
            ? variantInput.originalPrice
            : null,
          active: true,
        },
        update: {
          regularPrice: variantInput.price ?? 0,
          compareAtPrice: variantInput.originalPrice && variantInput.originalPrice > variantInput.price
            ? variantInput.originalPrice
            : null,
          active: true,
        },
      })
    }

    console.log(`Seeded ${slug}`)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
