const { Client } = require('discord.js');
const mongoose = require('mongoose');

const message = require('./utils/msg');
const { token } = require('./config.json');

const bot = new Client();

bot.once('ready', () => {
    mongoose.connect('mongodb+srv://televox:getjacked@jackack-bot.r14ha.mongodb.net/mailbot', { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
    console.log(`${bot.user.username} ready`);
});

bot.on('message', msg => message(msg, bot));


bot.login(token);