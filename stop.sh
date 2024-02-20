#/bin/bash
yarn install
pm2 stop yarnBots
pm2 stop yarnOracle
pm2 restart yarnStart
pm2 restart yarnChain
pm2 ls