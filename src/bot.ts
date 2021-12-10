import * as discord from "discord.js";
import { ignoreUnhandledRejection, sendMsgInGuild } from "./util";

export class AntiTokenBot {
  private readonly client = null as discord.Client;
  
  get clientId(){return this.client && this.client.user && this.client.user.id};

  constructor(){
    this.client = new discord.Client({
      intents: [
        "GUILD_BANS",
        "GUILD_MESSAGES",
        "GUILDS",
      ]
    });

    this.client
      .on("ready", () => ignoreUnhandledRejection(this.onReady()))
      .on("guildCreate", (guild) => ignoreUnhandledRejection(this.onGuildCreate(guild)))
      .on("messageCreate", (message) => ignoreUnhandledRejection(this.onMessage(message)))
      ;
  }

  private async onReady(){
    console.log("discord bot is ready now");
    this.client.user.setActivity({
      type: "WATCHING",
      name: "サーバーの安全を監視中 / " + this.client.guilds.cache.size + "サーバー"
    });
  }

  private async onGuildCreate(guild:discord.Guild){
    const permissions = guild.members.resolve(this.client.user.id).permissions;
    if(!([
      "SEND_MESSAGES",
      "BAN_MEMBERS",
      "KICK_MEMBERS",
      "READ_MESSAGE_HISTORY",
      "MANAGE_MESSAGES"
    ] as discord.PermissionResolvable[]).every(permission => permissions.has(permission))){
      const noticeMsg = "必要な権限が不足しています。メッセージの送信権限、メンバーのBANおよびキック権限、メッセージ履歴閲覧権限、メッセージの管理権限のすべてが与えられているか確認してください。";
      await sendMsgInGuild(guild, noticeMsg);
      await guild.leave();
    }else{
      const noticeMsg = "本ボットを追加していただきありがとうございます。本ボットは、トークンを検出すると自動的にBANします。\r\n今後もセキュリティ関連の機能が追加される予定です。\r\n（※本ボットの使用に関する全責任を開発者は負いません）"
      await sendMsgInGuild(guild, noticeMsg);
    }
  }

  private async onMessage(message:discord.Message){
    if(message.content.match(/[a-zA-Z0-9_-]{23,28}\.[a-zA-Z0-9_-]{6,7}\.[a-zA-Z0-9_-]{27}/)){
      if(message.guild.ownerId === message.author.id || !message.deletable || !message.member.bannable){
        await message.reply({
          content: "トークンが検出されましたが削除されませんでした",
          allowedMentions: {
            repliedUser: false
          }
        });
      }else{
        await message.delete();
        await message.member.ban({
          reason: `トークンの送信 (自動BAN by ${this.client.user.username})`
        });
        await message.channel.send("トークンが検出されたためBANされました");
      }
    }
  }

  Run(token:string){
    if(this.client){
      this.client.login(token);
    }else{
      throw new Error("Client instance has not been initialized yet.");
    }
  }
}