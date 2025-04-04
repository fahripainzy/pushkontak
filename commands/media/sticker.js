import { downloadMediaMessage } from "@bayumahadika/baileysx";
import pino from "pino";
import { createSticker } from "wa-sticker-formatter";

export default {
  description: "Sticker",
  onlyOwner: false,
  onlyPremium: true,
  handle: async (sock, m) => {
    if (m.type === "imageMessage") {
      const imageBuffer = await downloadMediaMessage(
        m,
        "buffer",
        {},
        { logger: pino({ level: "silent" }) },
      );
      const sticker = await createSticker(imageBuffer, {
        author: m.pushName ?? "NoName",
        pack: global.bot.name,
        type: "full",
      });
      await sock.sendMessage(
        m.chatId,
        {
          sticker: Buffer.from(sticker),
        },
        { quoted: m.quoted },
      );
    } else {
      await m.replyError("Kirim pesan gambar beserta caption sticker");
    }
  },
};
