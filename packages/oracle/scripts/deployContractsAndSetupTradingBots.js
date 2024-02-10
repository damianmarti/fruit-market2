import { runCommandWithSpinner } from "./runCommandWithSpinner.js";
import chalk from "chalk";

export async function deployContractsAndSetupTradingBots() {
  console.log(chalk.blue("Deploying contracts with `yarn deploy --reset`..."));
  await runCommandWithSpinner("yarn deploy --reset");

  console.log(
    chalk.blue("Setting up trading bots with `yarn trading:setup`...")
  );
  await runCommandWithSpinner("yarn trading:setup");
}
