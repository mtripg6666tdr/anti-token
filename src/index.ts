import * as http from "http";
import { AntiTokenBot } from "./bot";

const bot = new AntiTokenBot();

http.createServer((req, res) => {
  res
    .writeHead(200, {"Content-Type": "text/plain"})
    .end(`Server is ready now. (Client ID:${bot.clientId})`)
}).listen(8080);

bot.Run(process.env.TOKEN);