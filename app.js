const restify = require('restify');
require('dotenv').config();
const bot = require('./bot.js');



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

server.post('/api/messages', bot.connector('*').listen());