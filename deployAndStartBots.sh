#/bin/bash
echo "-=-==-=-=-=-=-=-DEPLOYING"
yarn deploy --reset
echo "-=-==-=-=-=-=-=-SETUPTRADING"
yarn trading:setup
pm2 start yarnBots
pm2 start yarnOracle