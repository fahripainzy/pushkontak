import { isJidGroup, jidDecode, proto } from "@bayumahadika/baileysx";
import chalk from "chalk";

export default {
  description: "Save kontak",
  onlyOwner: true,
  onlyPremium: false,
  handle: async (sock, m) => {
    if (!m.args[0])
      return m.reply(
        `Perintah tidak valid atau argument nama dibutuhkan\n*Contoh:* ${global.bot.prefix}${m.cmd} ${global.bot.name}`,
      );
    const name = m.args[0].trim().normalize("NFKC");
    const gid = m.args[1];

    const groups = Object.values(await sock.groupFetchAllParticipating());
    if (groups.length < 1) return m.reply("Tidak asa group");

    if (!isJidGroup(gid)) {
      return await sock.sendMessage(
        m.chatId,
        {
          text: "Save Kontak Otomatis, pilih group pada daftar dibawah ini",
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
                      title: "Pilih group untuk save kontak",
                      rows: groups.map((group, index) => {
                        return {
                          title: `${index + 1}. ${group.subject}`,
                          id: `${global.bot.prefix}${m.cmd} ${name}${global.bot.splitArgs}${group.id}`,
                        };
                      }),
                    },
                  ],
                }),
              },
            },
          ],
        },
        { quoted: m.quoted },
      );
    } else {
      const group = groups.find((group) => group.id === gid);
      if (!group) return m.reply(`Group dengan id ${gid} tidak terdaftar`);

      const participants = group.participants
        .map((p) => p.id)
        .filter((p) => jidDecode(p).user !== jidDecode(sock.user.id).user);
      if (participants.length < 1)
        return m.reply("Tidak ada member yang perlu disimpan");

      await m.reply(`Save kontak dimulai

- *Nama:* ${name}
- *Group:* ${group.subject}
- *Member:* ${participants.length}`);

      let vcard = "";

      for (let i = 0; i < participants.length; i++) {
        try {
          const jid = (await sock.onWhatsApp(participants[i]))[0]?.jid;
          const number = jidDecode(jid).user;
          if (!jid) continue;
          vcard = vcard
            .concat(
              `BEGIN:VCARD
VERSION:3.0
FN:${name + " " + (i + 1)}
TEL;type=CELL;type=VOICE;waid=${number}:+${number}
NOTE:Save Kontak Otomatis Menggunakan ${global.bot.name} (Member ${group.subject})
END:VCARD`,
            )
            .concat("\n\n");
          console.log(
            `${chalk.bgBlueBright.bold.white(`\x20[${i + 1}/${participants.length}] ${m.cmd.toUpperCase()}\x20`)} ${number}`,
          );
        } catch (err) {
          console.log(err);
        }
      }

      await sock.sendMessage(
        m.chatId,
        {
          document: Buffer.from(vcard),
          mimetype: "text/vcard",
        },
        { quoted: m.quoted },
      );
    }
  },
};
