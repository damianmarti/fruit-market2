import { checkAndRequestOpenAIKey } from "./scripts/checkAndRequestOpenAIKey.js";
import { checkAndCreatePromptFile } from "./scripts/checkAndCreatePromptFile.js";
import { checkAndGenerateAssetList } from "./scripts/checkAndGenerateAssetList.js";

import { runCommandWithSpinner } from "./scripts/runCommandWithSpinner.js";
import chalk from "chalk";

// New function to deploy contracts
async function deployContracts() {
  console.log(chalk.blue("Deploying contracts with `yarn deploy --reset`..."));
  await runCommandWithSpinner("yarn deploy --reset");
}

async function main() {
  console.log(chalk.cyan("🔮 gpt dungeon master"));

  await checkAndRequestOpenAIKey();
  await checkAndCreatePromptFile();
  await checkAndGenerateAssetList();

  console.log(
    "  🛰 you are ready to deploy your contracts with `yarn deploy --reset`"
  );

  // Example of how to continue with other commands
  // const answers = await askQuestions();
  // console.log(chalk.blue(`Running command: ${answers.command}`));
  /*
  try {
    await runCommandWithSpinner(answers.command);
  } catch (error) {
    console.error(chalk.red("Failed to execute command."));
  }*/
}

main();
