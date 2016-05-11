/* eslint-disable no-console */
import {preProcess} from './io';
import Bot from '@kikinteractive/kik';
import PrettyError from 'pretty-error';
import {recallHistory} from './history';

const pretty = new PrettyError();

const kikConfig = {
  auth: {
    username: 'kipthis',
    apiKey: 'ffb9e340-0302-40eb-82a5-16ae10154f59',
    baseUrl: 'http://52.23.253.95/kikincoming'
  }
};

// configure the bot
const bot = new Bot(kikConfig.auth);

// update the config options
bot.updateBotConfiguration();

// send a message to Tom on boot.
bot.send('Hi Tom', 'kiptom');

/**
 * process the input from kik client through iokip.preProcess
 * @param  {Object} payload   input from kik client
 * @return {Promise}
 */
function processInput(payload) {
  return new Promise((resolve, reject) => {
    console.log({payload});
    const x = preProcess(payload);

    resolve({x});
  });
}

function initializeHandlers() {
  bot.onTextMessage((message) => {
    console.log('KIK INPUT: %s', message.body);

    const inputOptions = {
      msg: message.body.trim(),
      source: {
        channel: message.chatId,
        origin: 'kip',
        org: 'kip',
        id: `kip_${message.id}`,
        user: message.from
      },
      flags: {kik: true},
      kikInfo: {message}
    };

    const h = recallHistory(inputOptions, (data) => {
      console.log({data});
    });

    processInput(inputOptions)
      .catch((err) => {
        console.error(pretty.render(err));
      });
  });
}

export function configure() {
  // initialize handlers for kik bot events
  initializeHandlers(bot);

  // return the bot middleware to be handed to express
  return bot.incoming();
}

export function handleKikResponse(response) {
  const {user} = response.source;

  if (response.action === 'smalltalk' || response.action === 'smallTalk') {
    if (typeof response.client_res[0] !== 'undefined') {
      return bot.send(response.client_res[0], user);
    }

    console.log(response);
  }

  if (response.action === 'initial') {
    if (response.client_res && response.client_res[0]) {
      bot.send(Bot.Message.text(response.client_res[0]), user);
    }

    if (response.amazon && response.amazon.length) {
      console.log(response);

      for (let i = 0; i < 3; i++) {
        const item = response.amazon[i];
        const msg = Bot.Message
          .link(item.DetailPageURL[0])
          .setPicUrl(item.MediumImage[0].URL[0])
          .setText(`${item.realPrice} - ${item.ItemAttributes[0].Title[0]}`)
          .setTitle(item.ItemAttributes[0].Title[0]);

        bot.send(msg, user);
      }

      return true;
    }
  }

  return console.log({response});
}
