import readline from "readline";
import fs from "fs";
import { exec } from "child_process";

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "\n\n\n🧌 GPT Dungeon Master: What should our game be about? ",
  async (answer) => {
    await fs.writeFileSync("prompt.txt", "the game is about: " + answer);
    // Close the readline interface
    rl.close();

    console.log("💾 prompt.txt saved");

    /* const cmd = `node generateRawAssetList.js 25 '` + answer + `'`;
    console.log("⚙️ cmd", cmd);
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
    });*/
  }
);
