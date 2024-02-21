import { Configuration } from "openai";
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

// const tileType =
//   process.argv[2] ||
//   "whimsical trees and bushes with a few scattered small flowers for a playful look";

const promptTxt = await fs.readFileSync("prompt.txt", "utf8");

const artStyle = await fs.readFileSync("artStyle.txt", "utf8");

console.log("rendering title image...");

console.log("promptTxt", promptTxt);

console.log("artStyle", artStyle);

const fullPrompt =
  "create a full background image for a game (no text please) " +
  "the image should depiect a scene from a game about: " +
  promptTxt +
  "The art style should be " +
  artStyle +
  " - lighten the image to make it a background";

console.log("fullPrompt", fullPrompt);

// Define the data for the POST request
const data = {
  model: "dall-e-3",
  prompt: fullPrompt,
  n: 1,
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
    const outputPath = "../nextjs/public/assets/titleImage.png";

    //openBrowser(imageUrl);

    try {
      await downloadImage(imageUrl, outputPath);
      console.log("Image downloaded successfully:", outputPath);

      // Now you can use this image for the second script to make edits with DALL-E 2
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  } catch (error) {
    console.error("Error during image generation:", error.message);
  }
};

// Call the function to execute the API call
console.log("🔮 generating image...");
await generateImage();
