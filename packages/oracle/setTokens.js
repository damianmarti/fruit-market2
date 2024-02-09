import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

console.log("📺 node setTokens");

const assetList = JSON.parse(await fs.readFileSync("assetList.json", "utf8"));
console.log("👉 assetList", assetList);

const priceList = JSON.parse(await fs.readFileSync("priceList.json", "utf8"));
console.log("💸 priceList", priceList);

const currentTokenList = await fs.readFileSync(
  "../nextjs/tokens.config.ts",
  "utf8"
);

console.log("currentTokenList", currentTokenList);

//replace everything between the [ ] with the new assetList
const bracketLocation = currentTokenList.indexOf("[");
const endBracketLocation = currentTokenList.indexOf("]");
const startingStuff = currentTokenList.substring(0, bracketLocation);
const endingStuff = currentTokenList.substring(endBracketLocation + 1);

console.log("startingStuff", startingStuff);
console.log("endingStuff", endingStuff);

for (let asset = 0; asset < assetList.length; asset++) {
  const thisAsset = assetList[asset];
  console.log("thisAsset", thisAsset);

  const price = priceList[thisAsset.name.toLowerCase()];
  console.log("price", price);

  if (price > 1000) price = 1000; // cap the price at 1000

  if (price >= 1) {
    assetList[asset].initAssetAmount = "" + 1001 / price;
    assetList[asset].initCreditAmount = "" + 1000;
  } else {
    assetList[asset].initAssetAmount = "" + 1001 / price;
    assetList[asset].initCreditAmount = "" + 1000;
  }
}

const fullFile = JSON.stringify(assetList, null, 2);

console.log("fullFile", fullFile);

fs.writeFileSync(
  "../nextjs/tokens.config.ts",
  `import { TTokenInfo } from "./types/wallet";

  export type TokensConfig = TTokenInfo[];
  
  const tokensConfig = ` +
    fullFile +
    ` satisfies TokensConfig;
  
  export default tokensConfig;`
);
