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
  console.log(`Smoke test against: ${API_BASE}`);

  const store = await request('POST', '/stores', {
    name: `Smoke Store ${unique}`,
    slug: `smoke-store-${unique}`,
  });
  assert(store.id, 'store.id exists');

  const product = await request('POST', '/catalog/products', {
    storeId: store.id,
    name: 'Vitamin C Serum',
    slug: `vitamin-c-serum-${unique}`,
    status: 'active',
    variants: [
      {
        sku: `VITC-30ML-${unique}`,
        name: '30ml',
        price: '49.99',
        currency: 'BGN',
        attributes: { size: '30ml' },
      },
    ],
  });
  assert(product.variants?.length === 1, 'product has one variant');

  const variant = product.variants[0];

  const inventory = await request('POST', '/inventory/receive', {
    variantId: variant.id,
    quantity: 25,
  });
  assert(inventory.quantity === 25, 'inventory quantity is 25');

  const customer = await request('POST', '/customers', {
    storeId: store.id,
    email: `test-${unique}@example.com`,
    firstName: 'Test',
    lastName: 'Customer',
    phone: '+359888000000',
  });
  assert(customer.id, 'customer.id exists');

  const cartItem = await request('POST', '/carts/items', {
    customerId: customer.id,
    variantId: variant.id,
    quantity: 2,
  });
  assert(cartItem.quantity === 2, 'cart item quantity is 2');

  const order = await request('POST', '/checkout', {
    customerId: customer.id,
    addressLine1: 'Test Street 1',
    city: 'Vidin',
    postalCode: '3700',
    country: 'BG',
    shipping: '5.00',
    tax: '0.00',
  });
  assert(order.items?.length === 1, 'order has one item');

  const payment = await request('POST', '/payments', {
    orderId: order.id,
    provider: 'manual',
    amount: '104.98',
    currency: 'BGN',
  });
  assert(payment.orderId === order.id, 'payment belongs to order');

  const shipment = await request('POST', '/shipments', {
    orderId: order.id,
    provider: 'manual',
    trackingNumber: `TEST-${unique}`,
  });
  assert(shipment.orderId === order.id, 'shipment belongs to order');

  const returnObject = await request('POST', '/returns', {
    orderId: order.id,
    reason: 'Smoke test return',
    items: [
      {
        orderItemId: order.items[0].id,
        sku: variant.sku,
        quantity: 1,
        reason: 'Smoke test',
      },
    ],
  });
  assert(returnObject.items?.length === 1, 'return has one item');

  const campaign = await request('POST', '/coupons/campaigns', {
    storeId: store.id,
    name: `Smoke Campaign ${unique}`,
  });
  assert(campaign.id, 'campaign.id exists');

  const visitor = await request('POST', '/attribution/visitors', {
    storeId: store.id,
    sessionId: `session-${unique}`,
    referralCode: 'smoke',
    utmSource: 'test',
    utmMedium: 'script',
    utmCampaign: 'smoke-flow',
  });
  assert(visitor.id, 'visitor.id exists');

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

  console.log('🎉 Smoke commerce flow passed with assertions');
}

main().catch((error) => {
  console.error('❌ Smoke test crashed');
  console.error(error);
  process.exit(1);
});
