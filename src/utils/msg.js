const { Message, MessageEmbed, Client } = require('discord.js');
const mongoose = require('mongoose');
const mongodb = require('mongodb');

const prefix = '[';
const suffix = ']';

const checker = require('./checker');
const Mail = require('../models/mail');
/**
 * 
 * @param {Message} msg 
 * @param {Client} bot
 */
const msg = async (msg, bot) => {
    if(msg.author.bot) return;

    const tempArgs = msg.content.split(/[ ]+/);

    const firstArg = tempArgs[0];
    const lastArg = tempArgs[tempArgs.length - 1];

    if((firstArg.length == 1 || lastArg.length == 1) || !firstArg.startsWith(prefix) || !lastArg.endsWith(suffix)) return checker(msg, bot);

    const args = tempArgs.map((arg, i) => {
        if(i == 0) arg = arg.substring(prefix.length);
        if(i == tempArgs.length - 1) arg = arg.substring(0, arg.length - suffix.length);
        return arg;
    });

    const cmd = args[0].toLowerCase();


    switch (cmd) {

        case 'help':
            msg.channel.send('`send` `delete` `read` `sent` `invite`');
        break;

        case 'invite':
            msg.channel.send('https://discord.com/api/oauth2/authorize?client_id=840711718379323473&permissions=485440&scope=bot');
        break;

        case 'send':
            const target = msg.mentions.users.first()
            const filter = m => m.author == msg.author;
            if(target.bot || !target.id) return; 
            args.shift();
            args.shift();
            const title = args.join(' ');

            await msg.delete();
            const message = await msg.channel.send(`What do you want to send to ${target.username}`);
            const collector = msg.channel.createMessageCollector(filter, {
                time: 90000, 
                max: 1,
            });
            
            collector.on('collect', async collected => {
                if(!collected.content) return;

                await collected.delete();
                const mail = new Mail({
                    _id: mongoose.Types.ObjectId(),
                    userID: msg.author.id,
                    targetID: target.id,
                    title: title || 'Mail',
                    content: collected.content,
                });
                mail.save()
                .then(async() => {
                    try {
                        await message.delete();
                    } catch (e) {
                        //
                    }
                    msg.reply(`Message id is: ${mail._id}`);
                })
                .catch(console.error);
            });
            collector.on('end', async () => {
                try {
                    await message.delete();
                } catch (e) {
                    //
                }
            });

        break;

        case 'delete':
            if(!args[1]) return msg.channel.send('You must provide an id');
            const id = new mongodb.ObjectId(args[1].trim());

            Mail.findByIdAndDelete(id, (err, docs) => {
                if (err) return console.log(err)
                msg.channel.send('Deleted');    
            });
        break;

        case 'read':
            Mail.find({ targetID: msg.author.id }, async (err, mails) => {
                if(!mails.length) return msg.channel.send('You got no mail :(');

                let currentId = 0;

                const list = mails.map((mail, id) => {
                    let user = bot.users.cache.find(user => user.id == mail.targetID); 

                    if(id == currentId) {
                        return `------------------\n${id + 1}. ${mail.title} (from ${user.username})\n------------------`;
                    }
                    return `${id + 1}. ${mail.title} (from ${user.username})`;
                }).join('\n');
                const mailsMsg = await msg.channel.send('```nim\n---Your mailss---\n\n' + list + '```');

                try {
                    await mailsMsg.react('⬆');
                    await mailsMsg.react('⬇');
                    await mailsMsg.react('✔');
                } catch (e) {
                    console.log(e);
                }

                const collector = mailsMsg.createReactionCollector((reaction, user) => user.id == msg.author.id);

                collector.on('collect', async (reaction, user) => {
                    switch(reaction.emoji.name) {
                        case '⬆':
                            currentId = editMsg(mails, mailsMsg, currentId, -1);
                        break;
                        
                        case '⬇':
                            currentId = editMsg(mails, mailsMsg, currentId, 1);
                        break;

                        case '✔':
                            await msg.delete();
                            await mailsMsg.delete();

                            const mail = mails[currentId];
                            
                            const from = bot.users.cache.find(user => user.id == mail.userID);
                            const e = new MessageEmbed()
                            .setTitle(mail.title)
                            .setAuthor(from.username, from.avatarURL())
                            .setDescription(mail.content);
                            msg.channel.send(e);

                            // const id = new mongodb.ObjectId(mail._id.trim());
                            Mail.findByIdAndDelete(mail._id, (err, docs) => {
                                if (err) return console.log(err)
                            });
                        return;
                    }
                    for(const reactionn of mailsMsg.reactions.cache) {
                        reactionn[1].users.remove(user.id);
                    }
                });
            });
        break;

        case 'sent':
            Mail.find({ userID: msg.author.id }, (err, mails) => {
                if(!mails.length) return msg.channel.send('Either the sent mail was read or it didnt exist');

                const list = mails.map((mail, id) => {
                    let user = bot.users.cache.find(user => user.id == mail.targetID); 
                    return `${id + 1}. ${mail.title} to ${user.username} (ID: ${mail._id})`
                }).join('\n');

                msg.channel.send('```nim\n---Sent mails---\n\n' + list + '```');
            });
        break;
    }

};

/**
 * 
 * @param {Array} mails 
 * @param {Message} message 
 * @param {Number} id
 * @param {Number} increment 
 */
const editMsg = (mails, message, id, increment) => {

    if(!mails[id + increment]) return id;
    
    const list = mails.map((mails, ID) => {
        if(ID == id + increment) {
            return `------------------\n${ID + 1}. ${mails.title}\n------------------`;
        }
        return `${ID + 1}. ${mails.title}`;
    }).join('\n');
    message.edit('```nim\n---Your mailss---\n\n' + list + '```')

    return id + increment;
}

module.exports = msg;