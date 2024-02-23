#/bin/bash
echo "-=-==-=-=-=-=-=-CLEAR"
pm2 stop all
pm2 ls
rm packages/oracle/prompt.txt
rm packages/oracle/artStyle.txt
pm2 start yarnStart
pm2 start yarnChain
pm2 ls
echo "-=-==-=-=-=-=-=-REPROMPT"
cd packages/oracle && node index