export function calculateOrderBilling(subtotal: number) {
  const delivery = subtotal > 0 && subtotal < 5000 ? 150 : 0;
  const handling = subtotal > 0 ? 0 : 0;
  const grandTotal = subtotal + delivery + handling;

  return {
    subtotal,
    delivery,
    handling,
    grandTotal,
    freeDelivery: subtotal >= 5000,
  };
}
