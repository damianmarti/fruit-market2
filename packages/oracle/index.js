import { checkAndRequestOpenAIKey } from "./scripts/checkAndRequestOpenAIKey.js";
import { checkAndCreatePromptFile } from "./scripts/checkAndCreatePromptFile.js";
import { checkAndGenerateAssetList } from "./scripts/checkAndGenerateAssetList.js";
import { checkAndCreateArtStyleFile } from "./scripts/checkAndCreateArtStyleFile.js";
import { checkAndGenerateArt } from "./scripts/checkAndGenerateArt.js";
import { checkAndGenerateAssetArt } from "./scripts/checkAndGenerateAssetArt.js";

import chalk from "chalk";

async function main() {
  console.log(chalk.cyan("🔮 gpt dungeon master"));

  await checkAndRequestOpenAIKey();
  await checkAndCreatePromptFile();
  await checkAndCreateArtStyleFile();
  await checkAndGenerateAssetList();
  await checkAndGenerateAssetArt();
  await checkAndGenerateArt();

  console.log(
    "  🛰 you are ready to deploy your contracts with `yarn deploy --reset`"
  );
}

main();
