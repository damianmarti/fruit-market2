import ora from "ora";
import chalk from "chalk";
import { exec } from "child_process";

export function runCommandWithSpinner(command) {
  return new Promise((resolve, reject) => {
    const spinner = ora({
      text: "Processing...",
      spinner: "dots",
      color: "yellow",
    }).start();

    exec(command, (error, stdout, stderr) => {
      spinner.stop();
      if (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        reject(error);
        return;
      }
      if (stderr) {
        console.error(chalk.red(`Stderr: ${stderr}`));
        reject(new Error(stderr));
        return;
      }
      console.log(chalk.green(stdout));
      resolve(0);
    });
  });
}
