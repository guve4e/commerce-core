import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'

const prisma = new PrismaClient()

type OldProduct = any

const STORE_SLUG = 'ava-cosmetica'

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

function ingredientSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function splitIngredients(text?: string) {
  if (!text) return []

  return text
    .replace(/\s+/g, ' ')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
    .filter((x) => x.length > 1)
}

async function main() {
  const store = await prisma.store.findUniqueOrThrow({
    where: { slug: STORE_SLUG },
  })

  const raw = fs.readFileSync('scripts/data/INVENTORY.product.json', 'utf8')
  const oldProducts: OldProduct[] = JSON.parse(raw)

  const enProducts = oldProducts.filter(
    (p) => !p.company?.includes(':BG') && !p.group?.includes(':bg'),
  )

  for (const oldProduct of enProducts) {
    const product = await prisma.product.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: slugOf(baseGroupOf(oldProduct)),
        },
      },
    })

    if (!product) continue

    const ingredients = splitIngredients(oldProduct.fullIngredients)

    for (let i = 0; i < ingredients.length; i++) {
      const name = ingredients[i]
      const slug = ingredientSlug(name)

      if (!slug) continue

      const ingredient = await prisma.ingredient.upsert({
        where: {
          storeId_slug: {
            storeId: store.id,
            slug,
          },
        },
        create: {
          storeId: store.id,
          slug,
          name,
        },
        update: {
          name,
        },
      })

      await prisma.productIngredient.upsert({
        where: {
          productId_ingredientId: {
            productId: product.id,
            ingredientId: ingredient.id,
          },
        },
        create: {
          productId: product.id,
          ingredientId: ingredient.id,
          sortOrder: i,
        },
        update: {
          sortOrder: i,
        },
      })
    }

    console.log(`Seeded ${ingredients.length} ingredients for ${product.slug}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
