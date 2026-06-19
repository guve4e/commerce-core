# Domain Events

Domain events describe important business facts that happened inside aggregates.

They are not commands.

They do not say what should happen next.

They say what already happened.

## Examples

```text

checkout.created

checkout.ready

order.created

payment.captured

shipment.created

return.approved

inventory.reserved