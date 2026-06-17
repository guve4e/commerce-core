type Json = Record<string, any>;

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
}

async function request<T = any>(
  method: string,
  path: string,
  body?: Json,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    console.error(`❌ ${method} ${path} failed`);
    console.error(data);
    process.exit(1);
  }

  console.log(`✅ ${method} ${path}`);
  return data;
}

async function main() {
  const unique = Date.now();
  console.log(`Legacy smoke test against: ${API_BASE}`);

  const store = await request('POST', '/stores', {
    name: 'CP',
    slug: `cp-${unique}`,
  });

  const product = await request('POST', '/catalog/products', {
    storeId: store.id,
    name: 'Legacy Product',
    slug: `legacy-product-${unique}`,
    status: 'active',
    variants: [
      {
        sku: `LEGACY-SKU-${unique}`,
        name: 'Default',
        price: '19.99',
        currency: 'BGN',
      },
    ],
  });

  const products = await request('GET', `/product/getAllByCompany/${store.slug}`);
  assert(Array.isArray(products), 'legacy products returns array');
  assert(products.length > 0, 'legacy products not empty');

  const byGroup = await request('GET', `/product/getByGroup/${product.slug}`);
  assert(Array.isArray(byGroup), 'legacy getByGroup returns array');

  const byCompanyAndGroup = await request(
    'GET',
    `/product/getByCompanyAndGroup/${store.slug}?group=${product.slug}`,
  );
  assert(byCompanyAndGroup?.id === product.id, 'legacy getByCompanyAndGroup works');

  const names = await request('GET', `/product/getProductNames/${store.slug}`);
  assert(Array.isArray(names), 'legacy product names returns array');

  const legacyHash = `legacy-${unique}`;

  const legacyVisitor = await request(
    'POST',
    `/visitors/getOrCreateVisitor/${legacyHash}`,
    {
      visit: {
        ipAddress: '127.0.0.1',
        page: '/legacy-test',
        referrer: 'smoke',
        userAgent: 'smoke-script',
        sessionId: `legacy-session-${unique}`,
      },
      influencerId: 'legacy-influencer',
    },
  );

  assert(legacyVisitor.hash === legacyHash, 'legacy visitor hash saved');

  const legacyVisitorAgain = await request(
    'POST',
    `/visitors/getOrCreateVisitor/${legacyHash}`,
    {
      visit: {
        page: '/legacy-test-again',
      },
    },
  );

  assert(
    legacyVisitorAgain.id === legacyVisitor.id,
    'legacy visitor getOrCreate is idempotent',
  );

  await request('PUT', `/visitors/addEvent/${legacyVisitor.id}`, {
    page: '/legacy-event',
    referrer: 'smoke',
    userAgent: 'smoke-script',
  });

  console.log('🎉 Legacy smoke flow passed');


  const customer = await request('POST', '/customers', {
    storeId: store.id,
    email: `legacy-${unique}@example.com`,
    firstName: 'Legacy',
    lastName: 'Customer',
  });

  const variant = product.variants[0];

  await request('POST', `/shoppingCart/${customer.id}`);

  const legacyCart = await request(
    'PUT',
    `/shoppingCart/addToShoppingCart/${customer.id}?sku=${variant.sku}&qty=2`,
  );
  assert(legacyCart.items?.length === 1, 'legacy cart has one item');

  const updatedLegacyCart = await request(
    'PUT',
    `/shoppingCart/updateShoppingCart/${customer.id}?sku=${variant.sku}&qty=3`,
  );
  assert(
    updatedLegacyCart.items?.[0]?.quantity === 3,
    'legacy cart quantity updated',
  );

  const emptiedLegacyCart = await request(
    'DELETE',
    `/shoppingCart/deleteShoppingCart/${customer.id}`,
  );
  assert(emptiedLegacyCart.items?.length === 0, 'legacy cart emptied');
}

main().catch((error) => {
  console.error('❌ Legacy smoke test crashed');
  console.error(error);
  process.exit(1);
});
