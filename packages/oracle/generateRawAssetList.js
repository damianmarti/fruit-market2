import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

console.log("📺 node generateRawAssetList 9");

//make sure the prompt.txt is there or complain

const configuration = new Configuration({
  //apiKey: "",//,
  //organization: "BuidlGuidl",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const getList = async (amount, prompt) => {
  let state = [];
  state.push({
    role: "system",
    content:
      "you are the credibly neutral dungeon master for a game that involves trading items as a base mechanic that any player can participate in (a liquid and active economy as an underlying starter kit for a bigger game)...",
  });

  state.push({
    role: "user",
    content:
      "please list " +
      amount +
      " items that might be generated, traded, collected, and/or consumed in this game",
  });
  state.push({
    role: "system",
    content:
      "please return them in valid json in this format:" +
      `[
            { "contractName": "AvocadoToken", "name": "Avocado", "emoji": "🥑" },
            { "contractName": "BananaToken", "name": "Banana", "emoji": "🍌" },
            { "contractName": "TomatoToken", "name": "Tomato", "emoji": "🍅" },
            { "contractName": "StrawberryToken", "name": "Strawberry", "emoji": "🍓" },
            { "contractName": "AppleToken", "name": "Apple", "emoji": "🍏" },
            { "contractName": "LemonToken", "name": "Lemon", "emoji": "🍋" },
        ]
        ` +
      " please use this exact format , thanks! love you!",
  });
  if (prompt) {
    state.push({
      role: "user",
      content: prompt,
    });
  }
  console.log(state);

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: state,
    temperature: 1,
  });
  console.log("--------------------");
  if (completion.data.choices[0].message) {
    console.log(completion.data.choices[0].message.content);

    //try to parse it as json, it should be an array of objects....

    const bracketLocation =
      completion.data.choices[0].message.content.indexOf("[");
    const endBracketLocation =
      completion.data.choices[0].message.content.indexOf("]");
    const cleanedMaybe = completion.data.choices[0].message.content.substring(
      bracketLocation,
      endBracketLocation + 1
    );

    try {
      const arrayOfAssets = JSON.parse(cleanedMaybe);
      console.log("PARSED!", arrayOfAssets);

      if (Array.isArray(arrayOfAssets)) {
        console.log("ARRAY OF ASSETS", arrayOfAssets);
        console.log("LENGTH:", arrayOfAssets.length);
        return arrayOfAssets;
      }
    } catch (e) {
      console.log("ERROR PARSING", e);
    }
  }
};

const prompt = await fs.readFileSync("prompt.txt", "utf8");
if (!prompt) {
  console.log("🚨 please create a prompt.txt by running node index.js");
} else {
  const amountOfRawAssets = process.argv[2] || 9;

  console.log("🔮 generating ", amountOfRawAssets, " initial raw assets...");

  const rawAssetList = await getList(amountOfRawAssets, prompt);

  //let's write this to a rawAssetList.json file
  await fs.writeFileSync("rawAssetList.json", JSON.stringify(rawAssetList));

  console.log("👀 rawAssetList", rawAssetList);
}
