# Inventory Flow

InventoryAggregate owns inventory rules.

Methods:

reserve()
release()
consume()
restock()

Rules:

available = quantity - reservedQuantity

Cannot reserve more than available.

Cannot consume more than reserved.

Shipping consumes inventory.

Cancellation releases inventory.
