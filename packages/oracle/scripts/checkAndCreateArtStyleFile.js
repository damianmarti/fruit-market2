import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

export async function checkAndCreateArtStyleFile() {
  const artStyleFilePath = path.resolve(process.cwd(), "artStyle.txt");

  // Check if prompt.txt already exists
  if (fs.existsSync(artStyleFilePath)) {
    console.log(
      chalk.green("artStyle.txt file already exists. Skipping prompt.")
    );
    return; // Skip further processing if prompt.txt exists
  }

  // If artStyle.txt does not exist, prompt the user for the artStyle
  console.log(chalk.yellow("artStyle.txt file not found."));
  const { artStyle } = await inquirer.prompt([
    {
      type: "input",
      name: "artStyle",
      message:
        "What should the art style be? (pixel art or impressionist or something else): ",
    },
  ]);

  // Write the style to artStyle.txt
  fs.writeFileSync(artStyleFilePath, artStyle, { encoding: "utf8" });
  console.log(chalk.green("art style saved to artStyle.txt."));
}
