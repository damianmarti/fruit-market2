import ora from "ora";
import chalk from "chalk";
import { exec } from "child_process";

export async function checkAndGenerateArt() {
  console.log(chalk.cyan("🔮 generating art..."));

  // Generate Background Image
  await new Promise((resolve, reject) => {
    const spinner = ora({
      text: "Generating arts...",
      spinner: "dots",
      color: "yellow",
    }).start();

    exec("node generateArt.js", (error, stdout, stderr) => {
      spinner.stop();
      if (error) {
        console.error(chalk.red(`Error generating art: ${error.message}`));
        reject(error);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Stderr during art generation: ${stderr}`));
        reject(new Error(stderr));
        return;
      }
      console.log(chalk.green("art generated successfully."));
      resolve(stdout);
    });
  });
  /*
  exec("node generateArt.js", (error, stdout, stderr) => {
    spinner.stop();
    if (error) {
      console.error(chalk.red(`Error generating art: ${error.message}`));
      reject(error);
      return;
    }
    if (stderr) {
      console.error(chalk.red(`Stderr during art generation: ${stderr}`));
      reject(new Error(stderr));
      return;
    }
    console.log(chalk.green("art generated successfully."));
    resolve(stdout);
  });
  */
}
