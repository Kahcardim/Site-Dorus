import { SITE } from "./site.js";

export const WHATSAPP_CTA_MESSAGE =
  "Olá! 👋 Vim pelo site da D’orus e preciso de assistência técnica para meu eletrodoméstico. Gostaria de explicar o problema e verificar a disponibilidade de atendimento na minha região. Pode me ajudar?";

export const WHATSAPP_CTA_URL = `${SITE.whatsapp}?text=${encodeURIComponent(WHATSAPP_CTA_MESSAGE)}`;
