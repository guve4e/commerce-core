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

async function getInventory(variantId: string) {
  return request('GET', `/inventory/${variantId}`);
}

async function createStoreAndProduct(unique: number) {
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

  const variant = product.variants[0];

  await request('POST', '/inventory/receive', {
    variantId: variant.id,
    quantity: 25,
  });

  return { store, product, variant };
}

async function verifyLegacyProductRoutes(store: any, product: any) {
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
}

async function verifyLegacyVisitorRoutes(unique: number) {
  const legacyHash = `legacy-${unique}`;

  const visitor = await request('POST', `/visitors/getOrCreateVisitor/${legacyHash}`, {
    visit: {
      ipAddress: '127.0.0.1',
      page: '/legacy-test',
      referrer: 'smoke',
      userAgent: 'smoke-script',
      sessionId: `legacy-session-${unique}`,
    },
    influencerId: 'legacy-influencer',
  });

  assert(visitor.hash === legacyHash, 'legacy visitor hash saved');

  const visitorAgain = await request('POST', `/visitors/getOrCreateVisitor/${legacyHash}`, {
    visit: { page: '/legacy-test-again' },
  });

  assert(visitorAgain.id === visitor.id, 'legacy visitor getOrCreate is idempotent');

  await request('PUT', `/visitors/addEvent/${visitor.id}`, {
    page: '/legacy-event',
    referrer: 'smoke',
    userAgent: 'smoke-script',
  });

  return visitor;
}

async function createCustomer(store: any, unique: number) {
  return request('POST', '/customers', {
    storeId: store.id,
    email: `legacy-${unique}@example.com`,
    firstName: 'Legacy',
    lastName: 'Customer',
  });
}

async function verifyLegacyCartRoutes(customer: any, variant: any) {
  await request('POST', `/shoppingCart/${customer.id}`);

  const cart = await request(
    'PUT',
    `/shoppingCart/addToShoppingCart/${customer.id}?sku=${variant.sku}&qty=2`,
  );
  assert(cart.items?.length === 1, 'legacy cart has one item');

  const updatedCart = await request(
    'PUT',
    `/shoppingCart/updateShoppingCart/${customer.id}?sku=${variant.sku}&qty=3`,
  );
  assert(updatedCart.items?.[0]?.quantity === 3, 'legacy cart quantity updated');
}

async function verifyLegacyCouponRoutes(store: any, customer: any, unique: number) {
  const campaign = await request('POST', '/coupons/campaigns', {
    storeId: store.id,
    name: `Legacy Campaign ${unique}`,
  });

  const couponCode = await request('POST', '/coupons/codes', {
    campaignId: campaign.id,
    code: `LEGACY${unique}`,
    percentageOff: '10',
    maxUses: 100,
  });

  const couponByToken = await request('GET', `/coupon/getByToken/${couponCode.code}`);
  assert(couponByToken.code === couponCode.code, 'legacy coupon getByToken works');

  const publicCoupons = await request('GET', `/coupon/getPublicCoupons/${store.slug}`);
  assert(Array.isArray(publicCoupons), 'legacy public coupons returns array');

  const cartWithCoupon = await request(
    'POST',
    `/shoppingCart/applyCoupon/${customer.id}?couponToken=${couponCode.code}`,
  );

  assert(
    cartWithCoupon.legacyAppliedCoupon?.code === couponCode.code,
    'legacy apply coupon works',
  );
}

async function createLegacyOrder(store: any, customer: any) {
  const order = await request('POST', `/order/user/${customer.id}?company=${store.slug}`, {
    shippingInfo: {
      firstName: 'Legacy',
      lastName: 'Customer',
      email: customer.email,
      phoneNumber: '+359888000000',
      address: {
        streetName: 'Test Street',
        city: 'Vidin',
        zip: '3700',
        country: 'BG',
      },
      cost: 5,
    },
  });

  assert(order.id, 'legacy order created');
  assert(order.orderNumber, 'legacy order number exists');

  return order;
}

async function verifyLegacyOrderLookupAndStatus(order: any) {
  const orderById = await request('GET', `/order/${order.id}`);
  assert(orderById.id === order.id, 'legacy get order by id works');

  const orderByNumber = await request('GET', `/order/orderNumber/${order.orderNumber}`);
  assert(
    orderByNumber.orderNumber === order.orderNumber,
    'legacy get order by orderNumber works',
  );

  const orderByNumberAndZip = await request(
    'GET',
    `/order/orderNumber/${order.orderNumber}/zipCode?zip_code=3700`,
  );
  assert(
    orderByNumberAndZip.id === order.id,
    'legacy get order by orderNumber and zip works',
  );

  const shippedOrder = await request(
    'PUT',
    `/order/changeOrderStatusShipped/${order.id}`,
    { note: 'Legacy smoke shipped' },
  );
  assert(shippedOrder.status === 'shipped', 'legacy shipped status works');

  const deliveredOrder = await request(
    'PUT',
    `/order/changeOrderStatusDelivered/${order.id}`,
    { note: 'Legacy smoke delivered' },
  );
  assert(deliveredOrder.status === 'delivered', 'legacy delivered status works');
}

async function verifyLegacyCancelFlow(store: any, customer: any, variant: any) {
  await verifyLegacyCartRoutes(customer, variant);

  const inventoryBeforeCancelOrder = await getInventory(variant.id);
  const cancelOrder = await createLegacyOrder(store, customer);
  const inventoryAfterCancelOrder = await getInventory(variant.id);

  assert(
    inventoryAfterCancelOrder.quantity === inventoryBeforeCancelOrder.quantity,
    'cancel order did not consume inventory',
  );
  assert(
    inventoryAfterCancelOrder.reservedQuantity === 3,
    'cancel order reserved inventory',
  );

  const cancelledOrder = await request(
    'PUT',
    `/order/changeOrderStatus/${cancelOrder.id}?status=cancelled`,
    { note: 'cancel smoke' },
  );

  assert(cancelledOrder.status === 'cancelled', 'legacy cancel status works');

  const inventoryAfterCancel = await getInventory(variant.id);

  assert(
    inventoryAfterCancel.quantity === inventoryBeforeCancelOrder.quantity,
    'cancel preserved quantity',
  );
  assert(
    inventoryAfterCancel.reservedQuantity === 0,
    'cancel released reservation',
  );
}

async function verifyLegacyReturnFlow(order: any, variant: any, unique: number) {
  const returnId = `RET-${unique}`;

  const returnTicket = await request(
    'POST',
    `/return/openReturnTicket/${order.orderNumber}?returnId=${returnId}`,
    {
      note: 'Smoke return',
      returnProducts: [{ sku: variant.sku, quantity: 1 }],
    },
  );

  assert(returnTicket.id, 'return created');

  const returnsByOrder = await request(
    'GET',
    `/return/getByOrderNumber/${order.orderNumber}`,
  );

  assert(Array.isArray(returnsByOrder), 'returnsByOrder returns array');
  assert(returnsByOrder.length === 1, 'one return exists');

  const approvedReturn = await request(
    'PUT',
    `/return/changeState/${returnTicket.id}?state=APPROVED&note=approved`,
  );
  assert(approvedReturn.status === 'APPROVED', 'return approved');

  const refundedReturn = await request(
    'PUT',
    `/return/changeState/${returnTicket.id}?state=REFUNDED&note=refund`,
  );
  assert(refundedReturn.status === 'REFUNDED', 'return refunded');

  const orderAfterRefund = await request('GET', `/order/${order.id}`);
  assert(
    orderAfterRefund.status === 'return_refunded',
    'order status updated after refund',
  );
}

async function cleanupCart(customer: any) {
  await request('DELETE', `/shoppingCart/deleteShoppingCart/${customer.id}`);

  const cartAfterDelete = await request('GET', `/shoppingCart/${customer.id}`);
  assert(cartAfterDelete.items?.length === 0, 'legacy cart emptied');
}

async function verifyShippingInventoryFlow(store: any, customer: any, variant: any) {
  const inventoryBeforeOrder = await getInventory(variant.id);
  console.log('inventoryBeforeOrder', inventoryBeforeOrder);

  const shippedOrder = await createLegacyOrder(store, customer);

  const inventoryAfterOrder = await getInventory(variant.id);
  console.log('inventoryAfterOrder', inventoryAfterOrder);

  assert(
    inventoryAfterOrder.quantity === inventoryBeforeOrder.quantity,
    'order did not consume inventory quantity',
  );
  assert(
    inventoryAfterOrder.reservedQuantity === 3,
    'order reserved inventory',
  );

  await verifyLegacyOrderLookupAndStatus(shippedOrder);

  const inventoryAfterShip = await getInventory(variant.id);
  console.log('inventoryAfterShip', inventoryAfterShip);

  assert(
    inventoryAfterShip.quantity === inventoryBeforeOrder.quantity - 3,
    'shipping consumed inventory',
  );
  assert(
    inventoryAfterShip.reservedQuantity === 0,
    'shipping released reservation',
  );
}

async function main() {
  const unique = Date.now();

  console.log(`Legacy smoke test against: ${API_BASE}`);

  const { store, product, variant } = await createStoreAndProduct(unique);

  await verifyLegacyProductRoutes(store, product);
  await verifyLegacyVisitorRoutes(unique);

  const customer = await createCustomer(store, unique);

  await verifyLegacyCartRoutes(customer, variant);
  await verifyLegacyCouponRoutes(store, customer, unique);

  await verifyShippingInventoryFlow(store, customer, variant);

  await verifyLegacyCancelFlow(store, customer, variant);

  await verifyLegacyCartRoutes(customer, variant);

  const returnOrder = await createLegacyOrder(store, customer);

  await verifyLegacyReturnFlow(returnOrder, variant, unique);

  await cleanupCart(customer);

  console.log('🎉 Legacy smoke flow passed');
}

main().catch((error) => {
  console.error('❌ Legacy smoke test crashed');
  console.error(error);
  process.exit(1);
});
