const { Client } = require('discord.js');
const Database = require("@replit/database")
const mongoose = require('mongoose');

const message = require('./utils/msg');
const web = require('./utils/http');

const bot = new Client();
const db = new Database()

bot.once('ready', () => {
    mongoose.connect('mongodb+srv://televox:getjacked@jackack-bot.r14ha.mongodb.net/mailbot', { 
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
    });
	bot.startDate = Date.now();
	web(bot);
    console.log(`${bot.user.username} ready`);
});

bot.on('message', msg => message(msg, bot));


db.get("token").then(token => {
	bot.login(token);
});