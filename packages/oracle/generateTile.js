import { Configuration, OpenAIApi } from "openai";
import sharp from "sharp";
import fs from "fs";
import https from "https"; // You can also use axios or any other HTTP client
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();
if (!process.env.OPENAI_API_KEY) {
  console.log("Please set OPENAI_API_KEY in your environment variables");
  process.exit();
}

console.log("📺 node generatePriceData");

const configuration = new Configuration({
  //apiKey: "",//,
  //organization: "BuidlGuidl",
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const removeBackground = async (
  inputPath,
  outputPath,
  backgroundThreshold = 25
) => {
  try {
    // This example assumes the background is a simple, solid color
    // Complex backgrounds may require a more advanced approach

    const { data, info } = await sharp(inputPath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Calculate the position of the reference pixel (5,5)
    const refPixelIndex = (30 * info.width + 30) * info.channels;
    const refColor = {
      r: data[refPixelIndex],
      g: data[refPixelIndex + 1],
      b: data[refPixelIndex + 2],
    };

    // Function to check if a color is close to the reference color
    const isColorClose = (color, threshold = backgroundThreshold) => {
      return (
        Math.abs(color.r - refColor.r) < threshold &&
        Math.abs(color.g - refColor.g) < threshold &&
        Math.abs(color.b - refColor.b) < threshold
      );
    };

    // Create a new buffer for the output image with an alpha channel
    const outputBuffer = Buffer.alloc(info.width * info.height * 4);

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const idx = (y * info.width + x) * info.channels;
        const outIdx = (y * info.width + x) * 4; // 4 channels for RGBA
        const color = { r: data[idx], g: data[idx + 1], b: data[idx + 2] };

        // Copy the color to the output buffer
        outputBuffer[outIdx] = color.r;
        outputBuffer[outIdx + 1] = color.g;
        outputBuffer[outIdx + 2] = color.b;

        // Set alpha based on color closeness
        outputBuffer[outIdx + 3] = isColorClose(color) ? 0 : 255;
      }
    }

    // Save the modified image
    await sharp(outputBuffer, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4, // RGBA
      },
    })
      .toFormat("png")
      .toFile(outputPath);

    console.log("Image processed and saved.");
  } catch (error) {
    console.error("Error processing image:", error);
  }
};

const downloadImage = (url, outputPath) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath); // Delete the file async. (But we don't check the result)
        reject(err.message);
      });
  });
};

// Destructure the OPENAI_API_KEY from the process.env object
const { OPENAI_API_KEY } = process.env;

const tileType =
  process.argv[2] ||
  "whimsical trees and bushes with a few scattered small flowers for a playful look";

const artStyle = await fs.readFileSync("artStyle.txt", "utf8");

console.log("rendering ", tileType, "...");

// Define the data for the POST request
// notes
//" this tile should be flat (not isometric background like you are inside a box but make it a flat surface instead) as if it exists withing a bigger map of other similar tiles " +

const fullPrompt =
  "Generate an image of an isometric game tile featuring " +
  tileType +
  ". " +
  "The tile should have a flat white background and cast no shadows. " +
  "The tile should maintaining a perfect 2:1 width to height ratio. " +
  "Any subtle shadows within the tile should be cast to the bottom right. " +
  "Create this image using the art style " +
  artStyle +
  ".";

console.log("fullPrompt", fullPrompt);

const data = {
  model: "dall-e-3",
  prompt: fullPrompt,
  n: 1,
  quality: "hd",
  size: "1024x1024",
};

// Define the function to make the API call
const generateImage = async () => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Image generation successful:", result);

    // Handle the result as needed, e.g., save to a file or database

    const imageUrl = result.data[0].url; // Assuming the URL is in this path
    const outputPath = "./downloaded_image.png";

    //openBrowser(imageUrl);

    try {
      await downloadImage(imageUrl, outputPath);
      console.log("Image downloaded successfully:", outputPath);

      // Now you can use this image for the second script to make edits with DALL-E 2
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  } catch (error) {
    console.error("Error during image3 generation:", error.message);
  }
};

// Call the function to execute the API call
console.log("🔮 generating image...");
await generateImage();

console.log("👯‍♀️ removing background...");

for (let i = 0; i < 16; i++) {
  const lastValue = i * 3 + 2;
  const outputPath = `./downloaded_image_no_bg${i + 1}.png`;

  await removeBackground("./downloaded_image.png", outputPath, lastValue);
}

/*

console.log("🔮 generating first prices...");

const assetList = await fs.readFileSync("assetList.json", "utf8");

const priceList = await generatePrices(assetList);
const priceListString = JSON.stringify(priceList);


console.log("👀 priceListString", priceListString);
//let's write this to a rawAssetList.json file
await fs.writeFileSync("priceList.json", priceListString);

await fs.writeFileSync("../trading-bots/data.json", priceListString);


console.log("👀 priceListString", priceListString);

*/
