import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import tokensConfig from "../../nextjs/tokens.config";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  function delay(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  const signer = await hre.ethers.getSigner(deployer);

  const YOUR_LOCAL_BURNER_ADDRESS = "0x92C8Fd39A4582E6Fe8bb5Be6e7Fdf6533566EA69"; //use punkwallet.io to create a burner that holds credits and can disperse

  const ownerAddress = deployer;
  const dexOwner = "0xEC1A970311702f3d356eB010A500EE4B5ab5C3Bb";
  const dispenserOwner = dexOwner;
  const dexPausers = [
    dexOwner,
    YOUR_LOCAL_BURNER_ADDRESS,
    "0xd6f85d9d79E3a87eCFe98d907495f85Fb6DAF74f", //Damu
    /*
    "0xD26536C559B10C5f7261F3FfaFf728Fe1b3b0dEE", //Damu
    "0x6CE015E312e7240e85323A2a506cbD799534aB68", //Toady
    "0xD26536C559B10C5f7261F3FfaFf728Fe1b3b0dEE", //Toady
    "0xA7430Da2932cf53B329B4eE1307edb361B5852ea", //Austin
    "0x9312Ead97CD5cfDd43EEd47261FB69081e2e17c3", //Austin
    */
  ];
  const dispersers = dexPausers;
  const minters = dexPausers;

  const salt = await deploy("SaltToken", {
    from: deployer,
    args: [ownerAddress],
    log: true,
    autoMine: true,
  });

  const tokens = tokensConfig;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    await deploy(token.contractName, {
      from: deployer,
      args: [token.name, token.emoji, ownerAddress],
      log: true,
      autoMine: true,
      contract: "FruitToken",
    });
  }

  await deploy("EventSBT", {
    from: deployer,
    // Contract constructor arguments
    args: [ownerAddress, salt.address],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const saltContract = await hre.ethers.getContract("SaltToken", deployer);

  await deploy("CreditNwCalc", {
    from: deployer,
    args: [saltContract.address],
    log: true,
    autoMine: true,
  });

  const tokensContracts = [];

  for (let i = 0; i < tokens.length; i++) {
    tokensContracts.push(await hre.ethers.getContract(tokens[i].contractName, deployer));
  }

  for (let i = 0; i < minters.length; i++) {
    const hasRole = await saltContract.hasRole(
      hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")),
      minters[i],
    );
    console.log("has salt minter role: ", hasRole, minters[i]);
    if (hasRole) {
      continue;
    }
    console.log("granting salt minter role: ", minters[i]);
    await saltContract.grantRole(hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")), minters[i]);
  }

  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < minters.length; j++) {
      const hasRole = await tokensContracts[i].hasRole(
        hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        minters[j],
      );
      console.log("has token minter role: ", tokens[i].name, hasRole, minters[j]);
      if (hasRole) {
        continue;
      }
      console.log("granting token minter role: ", tokens[i].name, minters[j]);
      await tokensContracts[i].grantRole(
        hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("MINTER_ROLE")),
        minters[j],
      );
    }
  }

  console.log("waiting...");
  await delay(5000);

  const disperseFunds = await deploy("DisperseFunds", {
    from: deployer,
    args: [salt.address],
    log: true,
    autoMine: true,
  });

  const disperseFundsContract = await hre.ethers.getContract("DisperseFunds", deployer);

  for (let i = 0; i < dispersers.length; i++) {
    const hasRole = await disperseFundsContract.hasRole(
      hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("DISPENSER_ROLE")),
      dispersers[i],
    );
    console.log("has disperser role: ", hasRole, dispersers[i]);
    if (hasRole) {
      continue;
    }
    console.log("granting disperser role: ", dispersers[i]);
    await disperseFundsContract.grantRole(
      hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("DISPENSER_ROLE")),
      dispersers[i],
    );
  }

  const disperseFundsSaltBalance = await saltContract.balanceOf(disperseFunds.address);
  console.log("disperseFunds salt balance: ", disperseFundsSaltBalance.toString());
  if (disperseFundsSaltBalance.eq(0)) {
    console.log("sending salt to disperseFunds");
    await saltContract.transfer(disperseFunds.address, hre.ethers.utils.parseEther("5000"));
  }

  //send credits to a burner for other things like the trading bots
  const burnerSaltBalance = await saltContract.balanceOf(YOUR_LOCAL_BURNER_ADDRESS);
  console.log("burner salt balance: ", burnerSaltBalance.toString());
  if (burnerSaltBalance.eq(0)) {
    console.log("sending salt to burner");
    await saltContract.transfer(YOUR_LOCAL_BURNER_ADDRESS, hre.ethers.utils.parseEther("5000"));
  }

  const disperseFundsXDaiBalance = await hre.ethers.provider.getBalance(disperseFunds.address);
  console.log("disperseFunds xDai balance: ", disperseFundsXDaiBalance.toString());
  if (disperseFundsXDaiBalance.eq(0)) {
    console.log("sending xDai to disperseFunds");
    const sendXDai = await signer.sendTransaction({
      to: disperseFunds.address,
      value: hre.ethers.utils.parseEther("0.001"),
    });
    sendXDai.wait();
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    //send some tokens to your burner too
    const burnerTokenBalance = await tokensContracts[i].balanceOf(YOUR_LOCAL_BURNER_ADDRESS);
    console.log("burner token balance: ", token.name, burnerTokenBalance.toString());
    if (burnerTokenBalance.eq(0)) {
      console.log("sending token to burner wallet: ", token.name);
      await tokensContracts[i].transfer(YOUR_LOCAL_BURNER_ADDRESS, hre.ethers.utils.parseEther("1000"));
    }

    console.log("waiting...");
    await delay(5000);

    const dex = await deploy(`BasicDex${token.name}`, {
      from: deployer,
      args: [salt.address, tokensContracts[i].address],
      log: true,
      autoMine: true,
      contract: "BasicDex",
      gasPrice: "20000000000", // 20 gwei
    });

    const dexContract = await hre.ethers.getContractAt("BasicDex", dex.address, deployer);

    const dexSaltAlowance = await saltContract.allowance(deployer, dex.address);
    console.log("dex salt allowance: ", dexSaltAlowance.toString());
    if (dexSaltAlowance.eq(0)) {
      console.log("approving salt for dex");
      await saltContract.approve(dex.address, hre.ethers.constants.MaxUint256);
    }

    const dexTokenAlowance = await tokensContracts[i].allowance(deployer, dex.address);
    console.log("dex token allowance: ", dexTokenAlowance.toString());
    if (dexTokenAlowance.eq(0)) {
      console.log("approving token for dex");
      await tokensContracts[i].approve(dex.address, hre.ethers.constants.MaxUint256);
      console.log("waiting...");
      await delay(5000);
    }

    const dexTotalLiquidity = await dexContract.totalLiquidity();
    console.log("dex total liquidity: ", dexTotalLiquidity.toString());
    if (dexTotalLiquidity.eq(0)) {
      console.log("adding liquidity to dex");
      await dexContract.init(hre.ethers.utils.parseEther("100"));
    }

    for (let i = 0; i < dexPausers.length; i++) {
      const hasRole = await dexContract.hasRole(
        hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("PAUSER_ROLE")),
        dexPausers[i],
      );
      console.log("has dex pauser role: ", hasRole, dexPausers[i]);
      if (hasRole) {
        continue;
      }
      console.log("granting dex pauser role: ", dexPausers[i]);
      await dexContract.grantRole(
        hre.ethers.utils.keccak256(hre.ethers.utils.toUtf8Bytes("PAUSER_ROLE")),
        dexPausers[i],
      );
    }

    if (dexOwner !== deployer) {
      const hasRole = await dexContract.hasRole(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        dexOwner,
      );
      console.log("has dex owner role: ", hasRole, dexOwner);
      if (hasRole) {
        continue;
      }
      console.log("transferring dex ownership");
      await dexContract.transferOwnership(dexOwner);
    }
    console.log("waiting...");
    await delay(5000);
  }

  const landContract = await deploy("Land", {
    from: deployer,
    args: [salt.address, tokensContracts[3].address],
    log: true,
    autoMine: true,
    contract: "Land",
  });

  //put some strawberries into the land contract (really it should just get mint privs right?)
  console.log("sending tokens to land contract");
  await tokensContracts[3].transfer(landContract.address, hre.ethers.utils.parseEther("100"));

  if (dispenserOwner !== deployer) {
    const hasRole = await disperseFundsContract.hasRole(
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      dispenserOwner,
    );
    console.log("has disperseFunds owner role: ", hasRole, dispenserOwner);
    if (!hasRole) {
      console.log("transferring disperseFunds ownership");
      await disperseFundsContract.transferOwnership(dispenserOwner);
    }
  }
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["GameWallet"];
