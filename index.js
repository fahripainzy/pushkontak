import { spawn } from "child_process";
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});

(function start() {
  const x = spawn(process.argv0, ["main.js"], {
    stdio: ["inherit", "inherit", "inherit", "ipc"],
  });
  x.on("message", (msg) => {
    if (msg === "restart") {
      x.kill();
      x.once("exit", start);
    }
  });
  x.on("exit", (code) => {
    if (code) {
      start();
    }
  });
  x.on("error", console.log);
})();
