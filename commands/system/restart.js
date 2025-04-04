import utils from "@bayumahadika/utils";

export default {
  description: "Restart",
  onlyOwner: true,
  onlyPremium: false,
  handle: async (sock, m) => {
    await m.reply("Bot akan segera dimulai ulang...");
    await utils.sleep(1000);
    process.send("restart");
  },
};
