export default {
  description: "Menampilkan semua group",
  onlyOwner: true,
  onlyPremium: false,
  handle: async (sock, m) => {
    const groups = Object.values(await sock.groupFetchAllParticipating());
    if (groups.length < 1) return m.reply("Tidak ada group");
    await m.reply(`*Daftar Group*

${groups
  .map((group, index) => {
    return `*${index + 1}. ${group.subject?.trim()}*
- *Gid:* ${group.id}
- *Member:* ${group.participants.length}`;
  })
  .join("\n\n")}`);
  },
};
