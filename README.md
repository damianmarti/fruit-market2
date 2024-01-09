# 🕹 Memecoin Trading Game 💎

```bash

git clone https://github.com/damianmarti/fruit-market2

cd fruit-market

yarn install

```

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


> 📝  next, inspect the `targetNetwork` var in `packages/nextjs/scaffold.config.ts` 

(if you are deploying locally it needs to be `chains.hardhat` or `chains.gnosis` out in prod)


> 💁‍♂️ login as with your nickname:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/bfbbe1a3-8fee-4b73-8ff9-12954827a962)

> 🏷 now you can use the browser to navigate to the `/checkedIn` route to drop tokens and gas to players:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/1d1e19e1-35fb-4302-9bd6-780fed7af7cf)

⚠️ your frontend address will need to be an admin to drop tokens to players

> 📝 edit `packages/hardhat/deploy/00_deploy_your_contract.ts` and add your address to `dexPausers`

> ⚙️ redeploy the whole stack with `yarn deploy --reset`

🤔 try visiting [http://localhost:3000](http://localhost:3000) from an incognito window or another browser to have a fresh burner to play with

(check in with a burner and drop some funds to it using your other account and the  `/checkedIn` page)

⚖️ at this point, player should be able to trade credits for resources on the dexes:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/09a019de-8112-4912-9889-d1fa47cb0d4d)

---


## Charts and Leaderboard

If you want to keep the charts and leaderboard updated you have to run a cron job requesting /api/admin/track-prices:

```
* * * * * /usr/bin/curl https://domain/api/admin/track-prices >> prices.log
```

Or you can set the cron job at Vercel using the /packages/nextjs/vercel.json config file.

(On localhost you can just use the browser to hit `http://localhost:3000/api/admin/track-prices` manually) 


---

## Trading Bots 

If you want prices to randomly fluctuate you need to run bots that have a bunch of liquidity and trade randomly:

```bash
git clone https://github.com/BuidlGuidl/fruit-market-trader

cd fruit-market-trader

yarn install
```

> 💾 you will need to copy your `fruit-market` `packages/nextjs/generated/deployedContracts.ts` into this `fruit-market-trader/deployedContracts.js`

⚠️ notice it changes from `.ts` to `.js` - you will also have to remove the `as const` from the end

(this tells your bots about the new contracts you've deployed)

☢️ Notice: any time you need to redeploy, do `yarn deploy --reset` and recopy over your `deployedContracts.js` 

> ✏️ copy the `.env.example` to `.env` file in the `fruit-market-trader` dir with the following info filled in:

```
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_FROM_YOUR_LOCAL_STORAGE
GNOSIS_RPC=http://127.0.0.1:8545
GNOSIS_NETWORK_ID=31337
```

(you can get this private key from the local storage. it's called `scaffoldEth2.burnerWallet.sk`) 

⛽️ if your this address is loaded up with local funds, you should be good to run:

```bash
node batchPrep.js
```

⚙️ this is going to generate a bunch of trader accounts, send them tokens, and save the private keys up in your `.env` file:

![image](https://github.com/BuidlGuidl/event-wallet/assets/2653167/d59b9c72-0a6d-4029-8257-0f4d0b8212dd)

(if anything fails here it probably means your burner is not correctly funded with credits and assets and you can debug balances using http://localhost:3000/debug)

> 🍎 now you can start a trading bot for each resource like:

```bash
node tradeDex.js Apple
```



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


