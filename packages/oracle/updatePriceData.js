import { Configuration, OpenAIApi } from "openai";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  console.log("Please set OPENAI_API_KEY in your environment variables");
  process.exit();
}

console.log("📺 node updatePriceData");

const configuration = new Configuration({
  //apiKey: "",//,
  //organization: "BuidlGuidl",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const generatePrices = async (assetList, currentPrices) => {
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
      "and set the initial prices in credits for each item in the following format: " +
      currentPrices,
  });

  state.push({
    role: "user",
    content:
      "please slightly update the price for each item slight up or down relative to the current price in this format in valid json maybe pick one asset to go up 10% or down 10%",
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

while (true) {
  console.log("🔮 updating first prices...");

  const currentPrices = await fs.readFileSync("priceList.json", "utf8");
  console.log("it starts asas ", currentPrices);

  const parsedCurrentPrices = JSON.parse(currentPrices);

  console.log("parsedCurrentPrices", parsedCurrentPrices);

  //for each key in object parsedCurrentPrices
  for (const asset in parsedCurrentPrices) {
    const fnum = parseFloat(parsedCurrentPrices[asset]);
    console.log("parsed float to ", fnum);
    if (Math.random() > 0.98) {
      console.log("SENDING TO THE MOON", asset, fnum * 2);
      parsedCurrentPrices[asset] = (fnum * 2).toFixed(2);
    } else if (Math.random() < 0.01) {
      console.log("CRASH IT", asset, fnum / 2);
      parsedCurrentPrices[asset] = (fnum / 2).toFixed(2);
    } else if (Math.random() > 0.5) {
      parsedCurrentPrices[asset] = (fnum * 1.105).toFixed(2);
    } else {
      parsedCurrentPrices[asset] = (fnum * 0.9).toFixed(2);
    }
  }

  console.log("finally parsedCurrentPrices", parsedCurrentPrices);

  const priceList = JSON.stringify(parsedCurrentPrices); //await generatePrices(assetList, currentPrices);

  //let's write this to a rawAssetList.json file
  await fs.writeFileSync("priceList.json", priceList);

  console.log("👀 NEW priceList", priceList);

  await fs.writeFileSync("../trading-bots/data.json", priceList);

  await new Promise((r) => setTimeout(r, 40000));
}
