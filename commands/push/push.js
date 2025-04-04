import { isJidGroup, jidDecode, proto } from "@bayumahadika/baileysx";
import chalk from "chalk";
import utils from "@bayumahadika/utils";

export default {
  description: "Push kontak",
  onlyOwner: true,
  onlyPremium: false,
  handle: async (sock, m) => {
    /// Validasi argument
    if (m.args.length < 2 || isNaN(m.args[0]))
      return m.reply(
        `Perintah tidak valid, atau [jead, pesan] dibutukan\n*Contoh:* ${global.bot.prefix}${m.cmd} 3${global.bot.splitArgs}Pesan push kontak`,
      );

    /// Fetch groups
    const groups = Object.values(await sock.groupFetchAllParticipating());

    /// NEXT
    if (!isJidGroup(m.args[2])) {
      await sock.sendMessage(
        m.chatId,
        {
          text: `*𝗣𝗨𝗦𝗛 𝗞𝗢𝗡𝗧𝗔𝗞 - ${global.bot.name}*\nBerikut daftar group yang tersedia:

${groups
  .map((group, i) => {
    return `*${i + 1}. ${group.subject}*
- *GID:* ${group.id}
- *Member:* ${group.participants.length}`;
  })
  .join("\n\n")}

‼️ Untuk menjalankan push kontak, silahkan pilih group dibawah:`,
          viewOnce: true,
          headerType: proto.Message.ButtonsMessage.HeaderType.TEXT,
          buttons: [
            {
              buttonId: "action",
              buttonText: {
                displayText: "ALL GROUP",
              },
              nativeFlowInfo: {
                name: "single_select",
                paramsJson: JSON.stringify({
                  title: "ALL GROUP",
                  sections: [
                    {
                      title: "DAFTAR GROUP UNTUK PUSH KONTAK",
                      rows: groups.map((g, i) => {
                        return {
                          title: `${i + 1}. ${g.subject}`,
                          id: `${global.bot.prefix}${m.cmd} ${m.args[0]}${global.bot.splitArgs}${m.args[1]}${global.bot.splitArgs}${g.id}`,
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
        { quoted: m.quoted },
      );
    } else {
      const jeda = parseInt(`${m.args[0]}000`);
      const pesan = m.args[1];
      const gid = m.args[2];

      const group = groups.find((g) => g.id === gid);
      if (!group) return m.reply(`Group dengan id ${gid} tidak terdaftar`);
      const participants = group.participants
        .map((p) => p.id)
        .filter((p) => jidDecode(p).user !== jidDecode(sock.user.id).user);

      if (participants.length < 1)
        return m.reply(`Anggota group tidak cukup untuk push kontak`);

      await m.reply(`*𝗣𝗨𝗦𝗛 𝗞𝗢𝗡𝗧𝗔𝗞 - 𝗡𝗘𝗫𝗣𝗨𝗦𝗛*

*Push Kontak dimulai:*
- *Target:* ${group.subject}
- *Member:* ${participants.length}
- *Jeda:* ${jeda / 1000} detik
- *Waktu yang dibutuhkan:* ${(participants.length * jeda) / 1000 / 60} menit
`);

      for (let i = 0; i < participants.length; i++) {
        try {
          await utils.sleep(jeda);
          await sock.sendMessage(
            participants[i],
            {
              text: pesan,
            },
            { quoted: global.quoted },
          );
          console.log(
            `${chalk.bgBlueBright.bold.white(`\x20[${i + 1}/${participants.length}]\x20${m.cmd.toUpperCase()}\x20`)}\x20${jidDecode(participants[i]).user}`,
          );
        } catch (err) {
          console.log(err);
        }
      }
    }
  },
};
