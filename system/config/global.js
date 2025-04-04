import fs from "fs";
import chokidar from "chokidar";
import chalk from "chalk";

const pkg = JSON.parse(fs.readFileSync("./package.json"));

global.dev = process.env.NODE_ENV === "development";

/// BOT CONFIGURATION
global.bot = {
  name: "𝗡𝗘𝗫𝗣𝗨𝗦𝗛",
  number: "",
  version: pkg.version,
  prefix: ".",
  splitArgs: "|",
  locale: "id",
  timezone: "Asia/Jakarta",
  adsUrl: "https://youtube.com/@bayumahadika",
  newsletterJid: "120363393482713223@newsletter",
  password: "bayumahadika",
  expiredAt: "",
};

/// BOT SETTING
global.setting = JSON.parse(fs.readFileSync("./system/config/setting.json"));
global.saveSetting = () =>
  fs.writeFileSync(
    "./system/config/setting.json",
    JSON.stringify(global.setting),
  );

/// OWNER INFORMATION
global.owner = {
  name: "Bayu Mahadika",
  number: "6285174174657",
};

global.db = {
  users: JSON.parse(fs.readFileSync("./system/data/users.json")),
  groups: JSON.parse(fs.readFileSync("./system/data/groups.json")),
  save: (name) => {
    switch (name.toLowerCase()) {
      case "users":
        fs.writeFileSync(
          "./system/data/users.json",
          JSON.stringify(global.db.users),
        );
        break;
      case "groups":
        fs.writeFileSync(
          "./system/data/groups.json",
          JSON.stringify(global.db.groups),
        );
        break;
    }
  },
};

global.images = {
  logo: "./system/data/images/logo.jpg",
};

global.mess = {
  dev: "Masih dalam tahap pengembangan",
};

global.quoted = {
  key: {
    fromMe: false,
    participant: "0@s.whatsapp.net",
    remoteJid: "status@broadcast",
  },
  message: {
    conversation: `✅ ${global.bot.name} - ${global.owner.name}`,
  },
};

process.on("unhandledRejection", (reason) => {
  if (
    reason instanceof Error &&
    reason.message.includes(
      "ENOSPC: System limit for number of file watchers reached",
    )
  )
    return;
  console.log(reason);
});
process.on("uncaughtException", (error) => {
  console.log(error);
});

chokidar
  .watch(process.cwd(), {
    ignored: [
      "**/node_modules/**",
      "**/sessions/**",
      "**/session/**",
      (path, stats) =>
        stats?.isFile() && !path.endsWith(".js") && !path.endsWith(".cjs"),
    ],
    persistent: true,
  })
  .on("all", (event, path) => {
    if (!["change", "error"].includes(event)) return;
    console.log(
      `${chalk.bgRedBright.bold.white("\x20RESTART\x20")} ${chalk.redBright(
        event,
      )}: ${path}`,
    );
    process.send("restart");
  });
