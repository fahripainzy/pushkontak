export default {
  description: "Antilink group",
  onlyOwner: false,
  onlyPremium: true,
  handle: async (sock, m) => {
    if (!m.isGroup)
      return m.replyError("Perintah ini hanya bisa digunakan didalam group");
    if (!m.isMyGroup) {
      m.isMyGroup = {
        id: m.chatId,
        antilink: false,
      };
      global.db.groups.push(m.isMyGroup);
    }
    m.isMyGroup.antilink = !m.isMyGroup.antilink;
    global.db.save("groups");
    await m.reply(
      `Done, Status antilink saat ini: ${m.isMyGroup.antilink ? "ACTIVE" : "INACTIVE"}`,
    );
  },
};
