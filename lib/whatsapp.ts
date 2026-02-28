export function makeWhatsAppLink(message: string, phoneE164?: string) {
  const text = encodeURIComponent(message);
  if (phoneE164) return `https://wa.me/${phoneE164.replace(/[^\d]/g, "")}?text=${text}`;
  return `https://wa.me/?text=${text}`;
}