import * as discord from "discord.js";

export async function ignoreUnhandledRejection<T>(prom:Promise<T>) {
  try{
    return await prom;
  }
  catch{
    return null;
  }
}

export async function sendMsgInGuild(guild:discord.Guild, message:Parameters<typeof discord.TextChannel.prototype.send>[0]){
  try{
    await guild.systemChannel.send(message);
  }
  catch{
    const chs = [...guild.channels.cache.values()].filter(ch => ch.isText());
    for(let i = 0; i < chs.length; i++) {
      try{
        await (chs[i] as discord.TextBasedChannels).send(message)
        break;
      }
      catch{}
    }
  }
}