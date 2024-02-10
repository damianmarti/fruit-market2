import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

console.log("📺 node generatePriceData");

const configuration = new Configuration({
  //apiKey: "",//,
  //organization: "BuidlGuidl",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generatePrices = async (assetList) => {
  let state = [];
  state.push({
    role: "system",
    content:
      "you are the credibly neutral dungeon master for a game that involves trading items as a base mechanic that any player can participate in (a liquid and active economy as an underlying starter kit for a bigger game)...",
  });
  state.push({
    role: "system",
    content: "please take this list:" + JSON.stringify(assetList),
  });

  state.push({
    role: "system",
    content:
      "and set an initial price in credits for each item in the following format:" +
      `
      {
        "silver": "5",
        "avocado": "2",
        "banana": "1.4",
        "lemon": "0.8",
        "strawberry": "3",
        "tomato": "0.9"
        }
      
        you'll use their lowercase name and give them a price that is fair relative to the other assets ranging from 0.1 credits each to 10 credits each 
      `,
  });

  state.push({
    role: "user",
    content: "please list the price for each item in this format in valid json",
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
      completion.data.choices[0].message.content.indexOf("{");
    const endBracketLocation =
      completion.data.choices[0].message.content.indexOf("}");
    const cleanedMaybe = completion.data.choices[0].message.content.substring(
      bracketLocation,
      endBracketLocation + 1
    );

    console.log("cleanedMaybe", cleanedMaybe);

    try {
      const objectOfPrices = JSON.parse(cleanedMaybe);
      console.log("PARSED!", objectOfPrices);
      return objectOfPrices;
    } catch (e) {
      console.log("ERROR PARSING", e);
    }
  }
};

console.log("🔮 generating first prices...");

const assetList = await fs.readFileSync("assetList.json", "utf8");

const priceList = await generatePrices(assetList);

//let's write this to a rawAssetList.json file
await fs.writeFileSync("priceList.json", JSON.stringify(priceList));

console.log("👀 priceList", priceList);

await fs.writeFileSync("../trading-bots/data.json", JSON.stringify(priceList));
