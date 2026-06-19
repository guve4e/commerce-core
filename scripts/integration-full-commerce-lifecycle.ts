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

async function main() {
  const unique = Date.now();

  console.log(`Full commerce lifecycle integration test against: ${API_BASE}`);

  const store = await request('POST', '/stores', {
    name: `Integration Store ${unique}`,
    slug: `integration-store-${unique}`,
  });

  const product = await request('POST', '/catalog/products', {
    storeId: store.id,
    name: 'Integration Product',
    slug: `integration-product-${unique}`,
    status: 'active',
    variants: [
      {
        sku: `INT-SKU-${unique}`,
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

  let inventory = await getInventory(variant.id);
  assert(inventory.quantity === 25, 'initial inventory quantity is 25');
  assert(inventory.reservedQuantity === 0, 'initial reserved inventory is 0');

  const customer = await request('POST', '/customers', {
    storeId: store.id,
    email: `integration-${unique}@example.com`,
    firstName: 'Integration',
    lastName: 'Customer',
    phone: '+359888000000',
  });

  const firstCartItem = await request('POST', '/carts/items', {
    customerId: customer.id,
    variantId: variant.id,
    quantity: 2,
  });

  assert(firstCartItem.quantity === 2, 'cart item quantity is 2');

  const secondCartItem = await request('POST', '/carts/items', {
    customerId: customer.id,
    variantId: variant.id,
    quantity: 1,
  });

  assert(secondCartItem.quantity === 3, 'cart item quantity increments to 3');

  const order = await request('POST', '/checkout', {
    customerId: customer.id,
    addressLine1: 'Integration Street 1',
    city: 'Vidin',
    postalCode: '3700',
    country: 'BG',
    shipping: '5.00',
    tax: '0.00',
  });

  assert(order.id, 'order id exists');
  assert(order.items?.length === 1, 'order has one item');
  assert(order.items[0].quantity === 3, 'order quantity is 3');
  assert(order.status === 'created', 'order starts created');

  inventory = await getInventory(variant.id);
  assert(inventory.quantity === 25, 'checkout does not consume inventory');
  assert(inventory.reservedQuantity === 3, 'checkout reserves 3');

  const payment = await request('POST', '/payments', {
    orderId: order.id,
    provider: 'manual',
    amount: '64.97',
    currency: 'BGN',
  });

  assert(payment.id, 'payment id exists');
  assert(payment.orderId === order.id, 'payment belongs to order');
  assert(payment.status === 'captured', 'payment captured');

  const shipment = await request('POST', '/shipments', {
    orderId: order.id,
    provider: 'manual',
    trackingNumber: `INT-${unique}`,
  });

  assert(shipment.id, 'shipment id exists');
  assert(shipment.orderId === order.id, 'shipment belongs to order');
  assert(shipment.status === 'pending', 'shipment starts pending');

  const shippedOrder = await request(
    'PUT',
    `/order/changeOrderStatusShipped/${order.id}`,
    { note: 'Integration shipped' },
  );

  assert(shippedOrder.status === 'shipped', 'order shipped');

  inventory = await getInventory(variant.id);
  assert(inventory.quantity === 22, 'shipping consumes 3 inventory');
  assert(inventory.reservedQuantity === 0, 'shipping clears reservation');

  const deliveredOrder = await request(
    'PUT',
    `/order/changeOrderStatusDelivered/${order.id}`,
    { note: 'Integration delivered' },
  );

  assert(deliveredOrder.status === 'delivered', 'order delivered');

  const returnObject = await request('POST', '/returns', {
    orderId: order.id,
    reason: 'Integration return',
    items: [
      {
        orderItemId: order.items[0].id,
        sku: variant.sku,
        quantity: 1,
        reason: 'Integration test return',
      },
    ],
  });

  assert(returnObject.id, 'return id exists');
  assert(returnObject.items?.length === 1, 'return has one item');

  const approvedReturn = await request(
    'PUT',
    `/returns/${returnObject.id}/approve`,
  );

  assert(approvedReturn.status === 'approved', 'return approved');

  const refundedReturn = await request(
    'PUT',
    `/returns/${returnObject.id}/refund`,
  );

  assert(refundedReturn.status === 'refunded', 'return refunded');

  const finalOrder = await request('GET', `/orders/${order.id}`);
  assert(finalOrder.id === order.id, 'final order can be fetched');

  const finalInventory = await getInventory(variant.id);
  assert(finalInventory.quantity === 22, 'refund does not restock yet');
  assert(finalInventory.reservedQuantity === 0, 'final reserved inventory is 0');

  console.log('🎉 Full commerce lifecycle integration test passed');
}

main().catch((error) => {
  console.error('❌ Full commerce lifecycle integration test crashed');
  console.error(error);
  process.exit(1);
});
