import inquirer from "inquirer";

export async function askQuestions() {
  const questions = [
    {
      type: "input",
      name: "command",
      message: "What command would you like to run?",
      default: "ls",
    },
  ];

  return inquirer.prompt(questions);
}
