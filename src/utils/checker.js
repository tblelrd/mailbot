const { Message, Client } = require('discord.js');
const mongoose = require('mongoose');

const Mail = require('../models/mail');
/**
 * @type {Map<String, Date>}
 */
const LastMessaged = new Map();
const waitTime = 1000 * 60 * 60 * 24;

/**
 * 
 * @param {Message} msg 
 * @param {Client} bot 
 * @param {Map<User, Array>} seenMails
 */
const checker = (msg, bot, seenMails) => {
    const lmsged = LastMessaged.get(msg.author.id);

    if(!lmsged || lmsged + waitTime < Date.now()) {
        Mail.find({ targetID: msg.author.id }, async (err, mails) => {
            if(!mails.length) return;

            // const seenMailsList = seenMails.get(msg.author);
            // const newMails = [];

			// console.log(seenMailsList.map(mail => mail.title));
			// console.log(mails);
			// console.log(seenMailsList.map(mail => mail.title) == mails.map(mail => mail.title));

            // for(const mail of mails) {
            //     if(seenMailsList && seenMailsList.includes(mail)) {
            //         console.log('seem');
            //         newMails.push(mail);
            //     }
            // }
            // console.log(seenMailsList && seenMailsList.map(mail => mail.title));
            // console.log(newMails.map(mail => mail.title));
            // if(newMails.length == 0) return;

            msg.channel.send(`You've got ${mails.length} new ${mails.length > 1 ? 'mails' : 'mail'}! \nType [read] to read your mail.`);
        });
        LastMessaged.delete(msg.author.id);
        LastMessaged.set(msg.author.id, Date.now()); 
        return;
    }
    LastMessaged.set(msg.author.id, Date.now());
};

module.exports = checker;