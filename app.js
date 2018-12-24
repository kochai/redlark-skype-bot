require('dotenv').config();
const restify = require('restify');
const builder = require('botbuilder');
const weather = require('weather-js');
const parser = require('rss-parser');
const apod = require('nasa-apod');
const randomPuppy = require('random-puppy');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8080, function () {
	console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
const connector = new builder.ChatConnector({
	appId: process.env.APP_ID,
	appPassword: process.env.APP_PW
});

const bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Bot on
bot.on('contactRelationUpdate', function (message) {
	if (message.action === 'add') {
		var name = message.user ? message.user.name : null;
		var reply = new builder.Message()
			.address(message.address)
			.text("Desi %s... Šta ima? Ako ti treba nešto preko veze, tutni jednu ciglu ispod stola i isčitaj: https://github.com/kochai/redlark-bot", name || 'there');
		bot.send(reply);
	} else {
		// delete their data
	}
});

// Bots Dialogs

String.prototype.contains = function (content) {
	return this.indexOf(content) !== -1;
}

bot.dialog('/', function (session) {
	let lcMessage = session.message.text.toLowerCase();
	console.log(lcMessage);
	console.log(session.message);
	// prevent replying unless mentioned
	if (lcMessage.contains(process.env.BOT_ID)) {
		
		// Because javascript things
		switch (true) {
			case lcMessage.contains('ćao'):
			case lcMessage.contains('cao'):
				session.send(`De si brate, e si mi dobar?`);
				break;
			case lcMessage.contains('pomoć'):
			case lcMessage.contains('pomoc'):
				session.send(`Ako ti treba pomoć, uvek je moš naći, samo treba znati gde potražiti.`);
				break;
			case lcMessage.contains('basshunter'):
				session.send(`https://www.youtube.com/watch?v=Y7EQaNlsEFs`);
				break;
			case lcMessage.contains('zar nije te stid?'):
			case lcMessage.contains('zar nije te sram?'):
				session.send(`Ne, ne, ne o ne ne`);
				break;
			case lcMessage.contains('rodices mu sina'):
				session.send(`kralja kokaina`);
				break;
			case lcMessage.contains('ti rodices mu decu'):
				session.send(`belu kao sneg \n\n o mama!`);
				break;
			case lcMessage.contains('ta stvar'):
				session.send('https://www.youtube.com/watch?v=T6QKqFPRZSA');
				break;
			case lcMessage.contains('i love you'):
				var responseName = session.message.user.name;
				session.send('I love you too ' + responseName + '! (heart) (hearteyes)');
				break;
			case lcMessage.contains('kucaaa'):
			case lcMessage.contains('kucaa'):
			case lcMessage.contains('kuca'):
				randomPuppy()
					.then(url => {
						session.send(url);
					})
				break;
			case lcMessage.contains('nasa pod'):
				var response = '';
				
				apod().then(function (data) {
					response += data.title + '\n\n';
					response += data.explanation + '\n\n';
					response += data.hdurl + '\n\n';
					session.send(response);
				});
				
				break;
			case lcMessage.contains('šta radit večeras?'):
			case lcMessage.contains('sta radit veceras?'):
				parser.parseURL('https://belgradeatnight.com/feed/', function (err, parsed) {
					if (err) console.log(err);
					var response = '';
					
					parsed.feed.entries.forEach(function (entry) {
						response += entry.title + '\n\n';
						response += entry.link + '\n\n';
					})
					
					session.send(response);
				});
				break;
			case lcMessage.contains('vreme'):
				if (lcMessage.contains('dugorocna')) {
					var pattern = /dugorocna\b(.*)\b/;
					var city = lcMessage.match(pattern)[1];
					
					weather.find({search: city, degreeType: 'C'}, function (err, result) {
						if (err) console.log(err);
						session.send('Trenutno u ' + result[0].location.name + ' je ' + result[0].current.temperature + ' stepeni, najviša dnevna temperatura će biti ' + result[0].forecast[0].high + ' stepeni, a najniža ' + result[0].forecast[0].low + ". Sutra se očekuje najviša temperatura od " + result[0].forecast[1].high + " stepeni.");
					});
					
				} else {
					var pattern = /vreme\b(.*)\b/;
					var city = lcMessage.match(pattern)[1];
					
					weather.find({search: city, degreeType: 'C'}, function (err, result) {
						if (err) console.log(err);
						session.send('Trenutno u ' + result[0].location.name + ' je ' + result[0].current.temperature + ' stepeni, najviša dnevna temperatura će biti ' + result[0].forecast[0].high + ' stepeni, a najniža ' + result[0].forecast[0].low + ".");
					});
					
				}
				break;
			default:
				session.send(`Ako ti treba pomoć, moš slobodno pogledati listu komandi na sledećem URL-u: https://github.com/kochai/redlark-bot`);
				break;
		}
	}
});