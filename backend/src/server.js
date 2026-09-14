const app = require("./app");

const serverConfig = require('./config/app.config').serverConfig();

app.listen(serverConfig.PORT, serverConfig.HOST, ()=>{
    console.log("A szerver futt on: "+ serverConfig.PORT)
})