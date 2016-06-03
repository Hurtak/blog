### Directory setup 
cd "$(dirname "$0")" # cd into directory where script is located
cd .. # cd into app director

### EXPORTED VARIABLES
export NODE_ENV="development"

### LOCAL VARIABLES
NODE_BIN="node_modules/.bin" 

### START SERVER
${NODE_BIN}/nodemon src/server/index.js \
  --ext js,html,json # extensions to look for when file wathing
  --watch src/templates \
  --watch src/server \
  --watch src/config
   

