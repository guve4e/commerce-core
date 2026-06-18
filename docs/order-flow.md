# Order Flow

Receive stock:

quantity = 25
reserved = 0

Checkout:

reserve(3)

quantity = 25
reserved = 3

Ship:

consume(3)

quantity = 22
reserved = 0

Cancel:

release(3)

quantity unchanged
reserved released
