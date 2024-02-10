import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

export async function checkAndCreatePromptFile() {
  const promptFilePath = path.resolve(process.cwd(), "prompt.txt");
  const assetListPath = path.resolve(process.cwd(), "assetList.json");

  // Check if prompt.txt already exists
  if (fs.existsSync(promptFilePath)) {
    console.log(
      chalk.green("prompt.txt file already exists. Skipping prompt.")
    );
    return; // Skip further processing if prompt.txt exists
  }

  // If prompt.txt does not exist, prompt the user for the game vibe
  console.log(chalk.yellow("prompt.txt file not found."));
  const { gameVibe } = await inquirer.prompt([
    {
      type: "input",
      name: "gameVibe",
      message: "What should the game be about (what's the vibe)?",
    },
  ]);

  // Write the game vibe to prompt.txt
  fs.writeFileSync(promptFilePath, gameVibe, { encoding: "utf8" });
  console.log(chalk.green("Game vibe saved to prompt.txt."));

  // Delete assetList.json if it exists, since prompt.txt was just created/updated
  if (fs.existsSync(assetListPath)) {
    console.log(
      chalk.yellow("Deleting assetList.json to trigger regeneration...")
    );
    fs.unlinkSync(assetListPath);
    console.log(chalk.green("assetList.json deleted successfully."));
  }
}
