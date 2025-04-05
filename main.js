import "./system/config/global.js";
import chalk from "chalk";
import { Boom } from "@hapi/boom";
import pino from "pino";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import cases from "./cases.js";
import {
  makeWASocket,
  Browsers,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  jidDecode,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  proto,
} from "@bayumahadika/baileysx";
import utils from "@bayumahadika/utils";

const logger = pino({});
logger.level = global.dev ? "trace" : "fatal";

let usePairingCode = true;

(async function init() {
  utils.clearConsole();
  if (global.bot.password) {
    const pwPath = "system/pw.txt";
    let pw = "";
    if (!fs.existsSync(pwPath)) {
      pw = await utils.question("Masukkan password: ");
      await fs.promises.writeFile(pwPath, pw, "utf8");
    } else {
      pw = fs.readFileSync(pwPath, "utf8");
    }
    if (pw !== global.bot.password) {
      console.log(chalk.red.bold("Password tidak sesuai, ulangi...."));
      if (fs.existsSync(pwPath)) await fs.promises.unlink(pwPath);
      await utils.sleep(2000);
      return init();
    }
  }
  global.bot.commands = await (async () => {
    console.log(chalk.magentaBright.bold("LOAD COMMANDS....\x20"));
    const commands = [];
    const commandPath = path.join(process.cwd(), "commands");
    const files = fs
      .readdirSync("./commands", {
        recursive: true,
      })
      .filter((val) => val.endsWith(".js"))
      .map((filepath) => `${commandPath}/${filepath}`);
    for (let file of files) {
      const filecont = (await import(file))?.default;
      const cmd = path.basename(file).replace(".js", "");
      const cmdIsExists = commands.find((command) => command.cmd === cmd);
      if (cmdIsExists) {
        throw new Error(
          `Terdapat command duplicate\n${file}\n${cmdIsExists.path}`,
        );
      }
      commands.push({
        path: file,
        cmd,
        ...filecont,
      });
    }
    utils.clearConsole();
    return commands;
  })();
  if (global.bot.expiredAt) {
    (function validateExpired() {
      const expiredAt = new Date(global.bot.expiredAt).getTime();
      const now = Date.now();

      if (expiredAt <= now) {
        throw new Error(`Script ini sudah kadaluarsa, Silahkan download script terbaru...
  - Owner: ${global.owner.name}
  - WhatsApp Number: ${global.owner.number}`);
      }
      setTimeout(validateExpired, 1000);
    })();
  }
})().then(async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");
  const sock = makeWASocket({
    version: (await fetchLatestBaileysVersion()).version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.ubuntu("Chrome"),
    defaultQueryTimeoutMs: undefined,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: false,
    printQRInTerminal: !usePairingCode,
    shouldSyncHistoryMessage: () => true,
    syncFullHistory: false,
    msgRetryCounterCache: new NodeCache(),
    getMessage: proto.Message.fromObject({}),
  });
  if (usePairingCode && !sock.user && !sock.authState.creds.registered) {
    usePairingCode = !(
      await utils.question(
        chalk.cyanBright("Menggunakan pairing code [Y/n]:\n"),
      )
    )
      .trim()
      .toLowerCase()
      .startsWith("n");
    if (!usePairingCode) return start();
    const waNumber = (
      await utils.question(
        `${chalk.greenBright(
          "Masukkan nomor WhatsApp (Example: +6285174174657):",
        )}\n`,
      )
    ).replace(/\D/g, "");
    await utils.sleep(1000);
    let code = await sock.requestPairingCode(waNumber);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(
      `${chalk.bgGreenBright.black("\x20PAIRING CODE\x20")}${chalk.greenBright(
        `: ${code}`,
      )}`,
    );
  }
  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
    if (connection === "connecting" && sock.user) {
      sock.user.number = jidDecode(sock.user.id).user;
      console.log(
        `${chalk.bgCyanBright.bold.black("\x20MENGHUBUNGKAN\x20")}: ${
          sock.user.number
        }`,
      );
    }
    if (connection === "open") {
      if (global.bot.newsletterJid)
        await sock.newsletterFollow(global.bot.newsletterJid).catch();
      if (global.bot.number && global.bot.number !== sock.user.number) {
        await sock.logout();
        throw new ReferenceError(
          `Nomor ini tidak diizinkan menggunakan SC ini, Silahkan order di ${global.owner.name}, WA: ${global.owner.number}`,
        );
      }
      console.log(
        `${chalk.bgBlueBright.bold.white("\x20TERHUBUNG\x20")}: ${
          sock.user.number
        }`,
      );
    }
    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      console.log(lastDisconnect.error);
      if (lastDisconnect.error === "Error: Stream Errored (unknown)") {
        return process.send("restart");
      } else if (reason === DisconnectReason.badSession) {
        console.log(`Bad Session File, Please Delete Session and Scan Again`);
        return process.send("restart");
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting...");
        return process.send("restart");
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection lost, trying to reconnect");
        return process.send("restart");
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection Replaced, Another New Session Opened, Please Close Current Session First",
        );
        return sock.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart Required...");
        return start();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(`Device Logged Out, Please Scan Again And Run.`);
        return sock.logout();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection TimedOut, Reconnecting...");
        return start();
      } else start();
    }
  });
  sock.ev.on("creds.update", saveCreds);
  /// ANTICALL
  sock.ev.on("call", (arg) => {
    const { id, from, status } = arg[0];
    if (status === "offer" && global.setting.anticall) {
      sock.rejectCall(id, from).catch(console.log);
    }
  });
  /// MESSAGE UPSERT
  sock.ev.on("messages.upsert", async ({ messages }) =>
    cases(sock, messages[0]),
  );
});
