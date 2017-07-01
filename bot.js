'use strict';

const builder = require('botbuilder');

const connector = new builder.ChatConnector({
    appId: null,
    appPassword: null
});

const bot = new builder.UniversalBot(connector, [
    (session, args, next) => {

        const card = new builder.ThumbnailCard(session);
        card.buttons([
            new builder.CardAction(session).title('Mean').value('Mean').type('imBack'),
            new builder.CardAction(session).title('Get help').value('Help').type('imBack'),
        ]).text(`What would you like to do?`);
        
        const message = new builder.Message(session);
        message.addAttachment(card);

        session.send(`Hi! I'm a chat bot and I can help you find the mean, median and mode`);
        // we can end the conversation here
        // the buttons will provide the appropriate message
        session.endConversation(message);
    },
]);

var counter = 0;
var finalValue= 0;

bot.dialog('Mean', [
    (session, args, next) => {
        let message = null;
        if(!session.privateConversationData.runningTotal) {
            message = `Give me the first number`;
            session.privateConversationData.runningTotal = 0;
        } else {
            message = `Give me the next number, or say **total** to display the mean`;
        }
        builder.Prompts.number(session, message, {maxRetries: 3});
    },
    (session, results, next) => {
        if(results.response) {
            session.privateConversationData.runningTotal += results.response;
            counter++;
            session.replaceDialog('Mean');
        } else {
            session.endConversation(`Sorry, I don't understand. Let's start over.`);
        }
    },
])
.triggerAction({matches: /^mean$/i})
.cancelAction('CancelMean', 'Operation cancelled', {
    matches: /^cancel$/,
    onSelectAction: (session, args) => {
        session.endConversation(`Operation cancelled.`);
    },
    confirmPrompt: `Are you sure you wish to cancel?`
})
.beginDialogAction('Total', 'Total', { matches: /^total$/})
.beginDialogAction('HelpMean', 'Help', { matches: /^help$/, dialogArgs: {action: 'Mean'} });

bot.dialog('Total', [
    (session, results, next) => {
        finalValue = (session.privateConversationData.runningTotal)/counter;
        session.endConversation(`The total is ${finalValue}`);
    },
]);

bot.dialog('Help', [
    (session, args, next) => {
        let message = '';
        switch(args.action) {
            case 'Mean':
                message = 'You can either type the next number, or use **total** to get the final mean.';
                break;
            default:
                message = 'You can type **add** to add numbers.';
                break;
        }
        session.endDialog(message);
    }
]).triggerAction({
    matches: /^help/i, 
    onSelectAction: (session, args) => {
        session.beginDialog(args.action, args);
    }
});

module.exports = bot;