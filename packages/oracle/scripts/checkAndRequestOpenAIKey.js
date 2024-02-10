import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import chalk from "chalk";

export async function checkAndRequestOpenAIKey() {
  const envPath = path.resolve(process.cwd(), ".env");
  let envContent;

  try {
    envContent = fs.readFileSync(envPath, { encoding: "utf8" });
  } catch (error) {
    envContent = "";
  }

  const keyName = "OPENAI_API_KEY";
  const keyRegex = new RegExp(`^${keyName}="(.+)"$`, "m");
  const apiKeyExists = keyRegex.test(envContent);

  if (!apiKeyExists) {
    console.log(chalk.yellow("No OpenAI API key found in your .env file."));
    const { apiKey } = await inquirer.prompt([
      {
        type: "input",
        name: "apiKey",
        message: "Please paste your OpenAI API key to continue:",
      },
    ]);

    const newEnvContent = `${envContent}\n${keyName}="${apiKey}"\n`;
    fs.writeFileSync(envPath, newEnvContent, { encoding: "utf8" });
    console.log(chalk.green("OpenAI API key saved to .env file."));
  }
}
