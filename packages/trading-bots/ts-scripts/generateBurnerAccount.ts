import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
 
import { parse, stringify } from "envfile";
import * as fs from "fs";

const envFilePath = "./.env";

/**
 * Generate a new random private key and write it to the .env file
 * @param existingEnvConfig
 */
const setNewEnvConfig = (name: string, existingEnvConfig = {}) => {
  console.log("👛 Generating new burner wallet");
  const privateKey = generatePrivateKey()

  const newEnvConfig = {
    ...existingEnvConfig,
    [name]: privateKey,
  };

  // Store in .env
  fs.writeFileSync(envFilePath, stringify(newEnvConfig));
  console.log("📄 Private Key saved to packages/hardhat/.env file");

  return privateKeyToAccount(privateKey);
};

async function generateBurner(burnerName: string) {
  if (!fs.existsSync(envFilePath)) {
    // No .env file yet.
    console.log('env doesnt exist');
    return setNewEnvConfig(burnerName);
  }

  // .env file exists
  console.log("env exists");
  const existingEnvConfig = parse(fs.readFileSync(envFilePath).toString());
  return setNewEnvConfig(burnerName, existingEnvConfig);
}

export { generateBurner };
