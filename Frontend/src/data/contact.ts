// Owner WhatsApp number (international format, no +).
export const WHATSAPP_NUMBER = '201096066818';

export const waLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
