# Hubot Telegram Adapter

[![Build Status](https://travis-ci.org/lukefx/hubot-telegram.svg)](https://travis-ci.org/lukefx/hubot-telegram)

[Hubot](https://hubot.github.com/docs/) adapter for interfacting with the [Telegram Bot API](https://core.telegram.org/bots/api)

## Installation & Usage

First of read the docs on how to create a new [Telegram Bot](https://core.telegram.org/bots#botfather). Once you have a bot created, follow these steps:

- `npm install --save hubot-telegram`
- Set the environment variables specified in **Configuration**
- Run hubot `bin/hubot -a telegram`

## Configuration

This adapter uses the following environment variables:

**TELEGRAM_TOKEN** (required)

The token that the [BotFather](https://core.telegram.org/bots#botfather) gives you

**TELEGRAM_WEBHOOK** (optional)

You can specify a [webhook](https://core.telegram.org/bots/api#setwebhook) URL. The adapter will register TELEGRAM_WEBHOOK/TELEGRAM_TOKEN with Telegram and listen there.

**TELEGRAM_INTERVAL** (optional)

You can specify the interval (in milliseconds) in which the adapter will poll Telegram for updates. This option only applies if you are not using a [webhook](https://core.telegram.org/bots/api#setwebhook).

## Telegram Specific Functionality (ie. Stickers, Images)

the adapter will enhance the Response object with some custom methods with the same signature of the APIs.
For example, sending an image:

```js
module.exports = function (robot) {
  robot.hear(/send totoro/i, res => {
    const image = fs.createReadStream(__dirname + '/image.png')
    // https://core.telegram.org/bots/api#sendphoto
    res.sendPhoto(res.envelope.room, image, {
      caption: 'Totoro!'
    })
  })
}
```

**Note:** An example script of how to use this is located in the `example/` folder

If you want to supplement your message delivery with extra features such as **markdown** syntax or **keyboard** replies, you can specify these settings on the `res.envelope` variable in your plugin.

```js
robot.respond(/(.*)/i, res => {
  res.sendMessage(
    res.envelope.room,
    'Select the option from the keyboard specified.',
    {
      reply_markup: {
        keyboard: [['Start', 'Stop']]
      }
    }
  )
})
```

## Contributors

- Luca Simone - [https://github.com/lukefx](https://github.com/lukefx)
- Chris Brand - [https://github.com/arcturial](https://github.com/arcturial)
