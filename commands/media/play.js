import { generateWAMessageFromContent, proto } from "@bayumahadika/baileysx";
import { isValidYouTubeURL } from "@bayumahadika/utils";
import ytSearch from "yt-search";
import { dlBuffer, ytmp4V2 } from "../../system/lib/downloader.js";

export default {
  description: "Search YT & Play",
  onlyOwner: false,
  onlyPremium: true,
  handle: async (sock, m) => {
    if (!m.args[0])
      return m.reply(
        `Perintah tidak valid, Yt URL atau Text dibutuhkan.\n*Contoh:* ${global.bot.prefix}${m.cmd} Hello World`,
      );
    if (!isValidYouTubeURL(m.args[0])) {
      /// Jika bukan url
      await m.reply(
        `Mohon tunggu sebentar, sedang mencari video dengan judul: ${m.args[0]}`,
      );
      const videos = (await ytSearch.search(m.args[0])).all.filter(
        (video) => video.type === "video",
      );
      if (!videos)
        return m.reply(`Hasil pencarian ${m.args[0]} tidak ditemukan`);
      const msg = generateWAMessageFromContent(
        m.chatId,
        {
          viewOnceMessage: {
            message: {
              buttonsMessage: {
                contentText: `${videos
                  .map((video, index) => {
                    return `*${index + 1}. ${video.title}*
*Author:* ${video.author?.name || "-"}
*Timestamp:*.${video.timestamp}`;
                  })
                  .join("\n\n")}
*Download pilih menu dibawah*`,
                headerType: proto.Message.ButtonsMessage.HeaderType.TEXT,
                text: `Hasil pencarian: ${m.args[0]}`,
                buttons: [
                  {
                    buttonId: `x`,
                    buttonText: {
                      displayText: "SEMUA DAFTAR PUTAR",
                    },
                    nativeFlowInfo: {
                      name: "single_select",
                      paramsJson: JSON.stringify({
                        title: "SEMUA DAFTAR PUTAR",
                        sections: [
                          {
                            title: `Hasil pencarian: ${m.args[0]}`,
                            rows: videos.map((video, index) => {
                              return {
                                title: `${index + 1}. ${video.title}`,
                                id: `${global.bot.prefix}${m.cmd} ${video.url}`,
                              };
                            }),
                          },
                        ],
                      }),
                    },
                    type: proto.Message.ButtonsMessage.Button.Type.NATIVE_FLOW,
                  },
                ],
              },
            },
          },
        },
        { quoted: m.quoted },
      );
      await sock.relay(m.chatId, msg.message, { messageId: msg.key.id });
    } else {
      /// Jika valid youtube url
      const data = await ytmp4V2(m.args[0]);
      await m.reply(`*Audio sedang didownload, mohon tunggu sebentar...*`);
      const buffer = await dlBuffer(data.url);
      await sock.sendMessage(
        m.chatId,
        {
          audio: Buffer.from(buffer),
          mimetype: "audio/mp4",
          caption: "Download selesai",
        },
        { quoted: m.quoted },
      );
    }
  },
};
