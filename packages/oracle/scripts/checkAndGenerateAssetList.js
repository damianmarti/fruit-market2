import fs from "fs";
import path from "path";
import ora from "ora";
import chalk from "chalk";
import { exec } from "child_process";

export async function checkAndGenerateAssetList() {
  const assetListPath = path.resolve(process.cwd(), "assetList.json");

  if (!fs.existsSync(assetListPath)) {
    console.log(
      chalk.yellow("assetList.json not found. Starting generation process...")
    );

    // Step 1: Generate raw asset list
    await new Promise((resolve, reject) => {
      const spinner = ora({
        text: "Generating asset list...",
        spinner: "dots",
        color: "yellow",
      }).start();

      exec("node generateRawAssetList.js 32", (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
          console.error(
            chalk.red(`Error generating asset list: ${error.message}`)
          );
          reject(error);
          return;
        }
        if (stderr) {
          console.error(chalk.red(`Stderr during asset generation: ${stderr}`));
          reject(new Error(stderr));
          return;
        }
        console.log(chalk.green("Asset list generated successfully."));
        resolve(stdout);
      });
    });

    // Step 2: Clean raw assets
    await new Promise((resolve, reject) => {
      const spinner = ora({
        text: "Cleaning raw assets...",
        spinner: "dots",
        color: "yellow",
      }).start();

      exec("node cleanRawAssets.js 16", (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
          console.error(chalk.red(`Error cleaning assets: ${error.message}`));
          reject(error);
          return;
        }
        if (stderr) {
          console.error(chalk.red(`Stderr during asset cleaning: ${stderr}`));
          reject(new Error(stderr));
          return;
        }
        console.log(chalk.green("Raw assets cleaned successfully."));
        resolve(stdout);
      });
    });

    // New Step: Generate price data
    await new Promise((resolve, reject) => {
      const spinner = ora({
        text: "Generating price data...",
        spinner: "dots",
        color: "yellow",
      }).start();

      exec("node generatePriceData.js", (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
          console.error(
            chalk.red(`Error generating price data: ${error.message}`)
          );
          reject(error);
          return;
        }
        if (stderr) {
          console.error(
            chalk.red(`Stderr during price data generation: ${stderr}`)
          );
          reject(new Error(stderr));
          return;
        }
        console.log(chalk.green("Price data generated successfully."));
        resolve(stdout);
      });
    });

    // Final Step: Set tokens
    await new Promise((resolve, reject) => {
      const spinner = ora({
        text: "Setting tokens...",
        spinner: "dots",
        color: "yellow",
      }).start();

      exec("node setTokens", (error, stdout, stderr) => {
        spinner.stop();
        if (error) {
          console.error(chalk.red(`Error setting tokens: ${error.message}`));
          reject(error);
          return;
        }
        if (stderr) {
          console.error(chalk.red(`Stderr during token setting: ${stderr}`));
          reject(new Error(stderr));
          return;
        }
        console.log(chalk.green("Tokens set successfully."));
        resolve(stdout);
      });
    });
  } else {
    console.log(
      chalk.green("assetList.json already exists. Skipping generation.")
    );
  }
}
