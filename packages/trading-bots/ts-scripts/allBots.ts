import { exec } from "child_process";

import tokensConfig from "../../nextjs/tokens.config";

function runCommandWithSpinner(command: string) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      console.log(stdout);
      resolve(0);
    });
  });
}

async function main() {
  console.log("🤖 running all trader bots...");

  for (const token of tokensConfig) {
    console.log("⚙️ starting up trader for ", token.emoji, token.name);
    try {
      runCommandWithSpinner(
        "yarn trading:trade " + token.name + " > " + token.name + ".txt"
      );
    } catch (error) {
      console.error("Failed to execute command.");
    }
  }

  while (true) {
    console.log(" ⚙️ all bots running, kill this to stop...");
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}

main();
