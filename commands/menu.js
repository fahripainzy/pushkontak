import moment from "moment-timezone";
import fs from "fs";
moment.locale(global.bot.locale);

export default {
  description: "Menampilkan list perintah",
  onlyOwner: false,
  onlyPremium: false,
  handle: async (sock, m) => {
    await sock.sendMessage(
      m.chatId,
      {
        text: `*${(() => {
          const hours = moment.tz(global.bot.timezone).hours();
          if (hours >= 5 && hours < 12) {
            return "Hallo selamat pagi";
          } else if (hours >= 12 && hours < 15) {
            return "Hallo selamat siang";
          } else if (hours >= 15 && hours < 18) {
            return "Hallo selamat sore";
          } else {
            return "Hallo selamat malam";
          }
        })()}${m.pushName ? ` ${m.pushName}` : ""} 👋*
Berikut adalah beberapa perintah yang bisa anda gunakan:

┏━━ *𖮌 ALL MENU 𖮌*
┃┏━━━━━━━━━━━━━━━━━━━━
┃┃ ⨳ *\`${global.bot.prefix}addprem\`*
┃┃ ⨳ *\`${global.bot.prefix}delprem\`*
┃┃ ⨳ *\`${global.bot.prefix}group\`*
┃┃ ⨳ *\`${global.bot.prefix}save\`*
┃┃ ⨳ *\`${global.bot.prefix}push\`*
┃┃ ⨳ *\`${global.bot.prefix}push2\`*
┃┃ ⨳ *\`${global.bot.prefix}sticker\`*
┃┃ ⨳ *\`${global.bot.prefix}brat\`*
┃┃ ⨳ *\`${global.bot.prefix}bratvid\`*
┃┃ ⨳ *\`${global.bot.prefix}play\`*
┃┃ ⨳ *\`${global.bot.prefix}public\`* ${global.setting.public ? "✅" : "❎"}
┃┃ ⨳ *\`${global.bot.prefix}self\`* ${global.setting.self ? "✅" : "❎"}
┃┃ ⨳ *\`${global.bot.prefix}readstory\`* ${global.setting.readstory ? "✅" : "❎"}
┃┃ ⨳ *\`${global.bot.prefix}anticall\`* ${global.setting.anticall ? "✅" : "❎"}
┃┃ ⨳ *\`${global.bot.prefix}antilink\`* ${m.isGroup && m.isMyGroup && m.isMyGroup.antilink ? "✅" : "❎"}
┃┃ ⨳ *\`${global.bot.prefix}restart\`*
┗━━━━━━━━━━━━━━━━━━━━━
        `,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 2,
          forwardedNewsletterMessageInfo: {
            newsletterJid: global.bot.newsletterJid,
            newsletterName: global.bot.name,
            serverMessageId: 101,
          },
          externalAdReply: {
            mediaType: 1,
            renderLargerThumbnail: true,
            showAdAttribution: true,
            sourceUrl: global.bot.adsUrl,
            thumbnail: fs.readFileSync(global.images.logo),
            thumbnailUrl: global.images.logo,
            title: global.bot.name,
          },
        },
      },
      {
        quoted: global.quoted,
      },
    );
  },
};
