const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client();
const { MongoClient } = require('mongodb');
/**
 * client.on is the entry point then run a async function to get database calls
 */
client.on('ready', (msg) => {
    console.log('Bot is ready');
    console.log('Users online: ' + getOnlineUsers());
    console.log('Total users: ' + getTotalUsers());

    //mongo--------------
    mongo();
    //-----------------
    setInterval(function() {
            console.log(getNumberOfUsersInVoice());
        }, 1000) // 1000 represents 1 secord
});

async function mongo() {
    console.log('mongoing');
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await listDatabases(client);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    console.log('mongoed');
}

async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

client.on('message', (msg) => {
    if (msg.content === 'Hello') msg.reply('Hi');
    else if (msg.content === 'Bello') msg.reply('Hi');
});

client.on('voiceStateUpdate', (oldMember, newMember) => { //this needs to be fixed
    const newUserChannel = newMember.voice.channelID
    const oldUserChannel = oldMember.voice.channelID

    if (newUserChannel === '715646727457210390') {
        console.log(`${newMember.user.username} (${newMember.id}) has joined the channel`);
    } else if (oldUserChannel === '715646727457210390' && newUserChannel !== '715646727457210390') {
        console.log(`${newMember.user.username} (${newMember.id}) has left the channel`);
    }
})

client.login(process.env.BOT_TOKEN)

function factEverySecond() {
    var facts = ['1', '2', '3', '4', '5', '6']
    setInterval(function() {
            var fact = Math.floor(Math.random() * facts.length)
            console.log(facts[fact]) // Every second, this will return a _new random_ fact
        }, 1000) // 1000 represents 1 secord
}

function getNumberOfUsersInVoice() {
    const voiceChannels = client.channels.cache.filter(c => c.type === 'voice');
    let count = 0;
    for (const [id, voiceChannel] of voiceChannels) count += voiceChannel.members.size;
    return count;
}

function getOnlineUsers() {
    const guild = client.guilds.cache.get("311892068630790165");
    return guild.members.cache.filter(m => m.presence.status === 'online').size;
}

function getTotalUsers() {
    const guild = client.guilds.cache.get("311892068630790165");
    return guild.memberCount;
}