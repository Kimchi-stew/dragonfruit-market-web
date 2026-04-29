export function notifyCartChange(delta: number) {
  window.dispatchEvent(new CustomEvent('cart-count-change', { detail: delta }))
}
