# 🕹 Memecoin Trading Game 💎

```bash

git clone https://github.com/damianmarti/fruit-market2

cd fruit-market

yarn install

```

> Configure Burner Address: copy `packages/hardhat/.env.example` to the name `.env` and edit ```BURNER_ADDRESS``` to the public address of your main orchestrating wallet (we usually use a punkwallet for this)

> ⚙️ bring up the chain and deploy your contracts

```bash

yarn chain

yarn deploy

yarn start

```

> 🖨 copy `packages/nextjs/.env.example` to the name `.env` and edit your frontend env:

> 💿 you'll need to spin up a KV (key value storage) in vercel and copy/paste in the env.local fields:

```
NEXT_PUBLIC_DEPLOY_BLOCK=0
NEXT_PUBLIC_LIVE_URL=https://event-wallet.vercel.app
KV_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

> 📱 hit the frontend at `http://localhost:3000`

> 📝 next, inspect the `targetNetwork` var in `packages/nextjs/scaffold.config.ts`

(if you are deploying locally it needs to be `chains.hardhat` or `chains.gnosis` out in prod)

> 💁‍♂️ login as with your nickname:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/bfbbe1a3-8fee-4b73-8ff9-12954827a962)

> 🏷 now you can use the browser to navigate to the `/checkedIn` route to drop tokens and gas to players:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/1d1e19e1-35fb-4302-9bd6-780fed7af7cf)

⚠️ your frontend address will need to be an admin to drop tokens to players

> 📝 edit `packages/hardhat/deploy/00_deploy_your_contract.ts` and add your address to `dexPausers`

> ⚙️ redeploy the whole stack with `yarn deploy --reset`

🤔 try visiting [http://localhost:3000](http://localhost:3000) from an incognito window or another browser to have a fresh burner to play with

(check in with a burner and drop some funds to it using your other account and the `/checkedIn` page)

⚖️ at this point, player should be able to trade credits for resources on the dexes:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/09a019de-8112-4912-9889-d1fa47cb0d4d)

---

## 🍓 Fruit Market Land

💵 Buy Land and Grow Strawberries!

<img width="719" alt="image" src="https://github.com/austintgriffith/fruit-market-land/assets/2653167/8ec660c1-bd7c-4e10-97b6-3d0fff5a86f5">

📱 very ugly buttons for each land tile:

<img width="592" alt="image" src="https://github.com/austintgriffith/fruit-market-land/assets/2653167/c45dc837-2ecd-452a-b011-e7e584ef73b8">

🗺 check out the land contract in `packages/hardhat/contracts/Land.sol`

## Charts and Leaderboard

If you want to keep the charts and leaderboard updated you have to run a cron job requesting /api/admin/track-prices:

```
* * * * * /usr/bin/curl https://domain/api/admin/track-prices >> prices.log
```

Or you can set the cron job at Vercel using the /packages/nextjs/vercel.json config file.

(On localhost you can just use the browser to hit `http://localhost:3000/api/admin/track-prices` manually)

---

## Trading Bots

If you want prices to fluctuate you need to run bots with a bunch of liquidity and trade them through a target price.

> ✏️ copy the `.env.example` to the `.env` file in the `packages/trading-bots` dir. Fill in the DEPLOYER_PRIVATE_KEY and change the RPC value if you want.
> (you can get this private key from the local storage. it's called `scaffoldEth2.burnerWallet.sk`)

> ✏️ You can find the bots config file at `packages/trading-bots/config.ts`.

> ✏️ You can fill in the token's target price at `packages/trading-bots/data.json`. These are the values that the bots will try to reach doing some swaps.

⛽️ if this address is loaded up with local funds, you should be good to run:

```bash
yarn trading:setup
```

⚙️ this is going to generate a bunch of trader accounts, send them tokens, and save the private keys in your `.env` file:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/d59b9c72-0a6d-4029-8257-0f4d0b8212dd)

(if anything fails here it probably means your burner is not correctly funded with credits and assets and you can debug balances using http://localhost:3000/debug)

> 🍎 now you can start a trading bot for each resource like:

```bash
yarn trading:trade Apple
```

OR

you can run all the bots with one command at once: 

```bash
yarn trading:bots
```



## GPT Dungeon Master

If you want GPT to create assets with prices based on some vibe you can set the vibe with:

```bash
yarn oracle
```
This generates a `packages/oracle/prompt.txt` file

(If you ever want to start fresh, remove the prompt.txt and run `yarn oracle` again)

You will need an OpenAI API key in your `packages/oracle/.env` file:
```bash
OPENAI_API_KEY=sk-xxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxx
```

Behind the scenes, the oracle will run these commands for you:
```bash
node generateRawAssetList.js 12 
node cleanRawAssets.js 6 
node generatePriceData.js
node setTokens.js
```

Then go deploy your contracts normally and hopefully it works 🫡


----



## 🏗 Built using Scaffold-ETH 2

<h4 align="center">
  <a href="https://github.com/scaffold-eth/scaffold-eth-2">Code</a> |
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 An open-source, up-to-date toolkit for building decentralized applications (dapps) on the Ethereum blockchain. It's designed to make it easier for developers to create and deploy smart contracts and build user interfaces that interact with those contracts.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, and Typescript.

- ✅ **Contract Hot Reload**: Your frontend auto-adapts to your smart contract as you edit it.
- 🔥 **Burner Wallet & Local Faucet**: Quickly test your application with a burner wallet and local faucet.
- 🔐 **Integration with Wallet Providers**: Connect to different wallet providers and interact with the Ethereum network.

![Debug Contracts tab](https://github.com/scaffold-eth/scaffold-eth-2/assets/55535804/1171422a-0ce4-4203-bcd4-d2d1941d198b)
