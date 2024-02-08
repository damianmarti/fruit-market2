import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

console.log("📺 node cleanRawAssets 3");

const configuration = new Configuration({
  //apiKey: "",//,
  //organization: "BuidlGuidl",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const cleanList = async (list, amount) => {
  let state = [];
  state.push({
    role: "system",
    content:
      "you are the credibly neutral dungeon master for a game that involves trading items as a base mechanic that any player can participate in (a liquid and active economy as an underlying starter kit for a bigger game)...",
  });
  state.push({
    role: "system",
    content:
      "you have already listed these assets but now we will clean and refine the list down starting with " +
      JSON.stringify(list),
  });
  if (process.argv[2]) {
    state.push({
      role: "system",
      content: "" + process.argv[2],
    });
  }

  state.push({
    role: "user",
    content: "please reduce this list down to " + amount + " items  -- ",
  });

  state.push({
    role: "system",
    content:
      "it's a game and we want to make an economy here, pick basic assets that are diverse and interesting that could even possibly be crafted into more advanced items -- " +
      "and then more expensive items that are more rare or harder to make but could possibly com from other bisic assets from the game -- " +
      "maybe if it was a baking game you might have flour, sugar, and eggs as basic assets but also cakes and muffins etc -- " +
      "if it was a game about moonshining, you might have corn, sugar, and water as basic assets but also wood and copper and hooch -- ",
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
        ]`,
  });

  state.push({
    role: "system",
    content: "please simplify names down to single words",
  });
  console.log(state);

  state.push({
    role: "system",
    content: "please return them in valid json and no other text",
  });
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

const amountOfAssets = process.argv[2] || 3;

console.log("🔮 cleaning raw assets down to " + amountOfAssets + "...");

const rawAssetList = await fs.readFileSync("rawAssetList.json", "utf8");

console.log("👉 rawAssetList", rawAssetList);

const assetList = await cleanList(rawAssetList, amountOfAssets);

//let's write this to a rawAssetList.json file
await fs.writeFileSync("assetList.json", JSON.stringify(assetList));

console.log("👀 assetList", assetList);
