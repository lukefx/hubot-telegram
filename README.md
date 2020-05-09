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

**TELEGRAM_INTERVAL** (optional)

You can specify the interval (in milliseconds) in which the adapter will poll Telegram for updates. This option only applies if you are not using a [webhook](https://core.telegram.org/bots/api#setwebhook).

**TELEGRAM_WEBHOOK** (optional)

You can specify a [webhook](https://core.telegram.org/bots/api#setwebhook) URL. The adapter will register TELEGRAM_WEBHOOK/TELEGRAM_TOKEN with Telegram and listen there.

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

If you want to supplement your message delivery with extra features such as **markdown** syntax or **keyboard** replies, you can specify these parameters on the `options` of sendMessage:

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

`inlineQuery` are a way to reply without a conversation to the bot. That's why they don't really fit into the normal hear/respond flow of Hubot.
To support `inlineQuery` you can listen to event on the `telegram` object exposed by the `robot` object.

```js
module.exports = function (robot) {
  robot.telegram.on('inline_query', async inlineQuery => {
    // Initially there is always a query with empty string
    // Usually is to provide suggestions
    if (inlineQuery.query) {
      const searches = await google.search(inlineQuery.query, 50) // Max 50 results for inlineQuery
      const results = searches.map(result => ({
        type: 'photo',
        id: result.id,
        thumb_url: result['thumbnail'],
        photo_url: result['url']
      }))
      robot.telegram.answerInlineQuery(inlineQuery.id, results)
    }
  })
}
```

## Contributors

- Luca Simone - [https://github.com/lukefx](https://github.com/lukefx)
- Chris Brand - [https://github.com/arcturial](https://github.com/arcturial)
