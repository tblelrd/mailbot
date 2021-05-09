const { Message, Client } = require('discord.js');
const mongoose = require('mongoose');

const Mail = require('../models/mail');
/**
 * @type {Map<String, Date>}
 */
const LastMessaged = new Map();
const waitTime = 1000 * 60 * 5;

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

            const seenMailsList = seenMails.get(msg.author)
            const newMails = mails.filter(mail => !seenMailsList.includes(mail));
            
            if(!newMails.length) return;

            msg.channel.send(`You've got ${mails.length} unread ${mails.length > 1 ? 'mails' : 'mail'}! \nUse the [read] command to read your mail.`);
        });
        LastMessaged.delete(msg.author.id);
        LastMessaged.set(msg.author.id, Date.now()); 
        return;
    }
    LastMessaged.set(msg.author.id, Date.now());
};

module.exports = checker;