# Hubot Telegram Adapter

[![Build Status](https://travis-ci.org/lukefx/hubot-telegram.svg?branch=feature-issue-5)](https://travis-ci.org/lukefx/hubot-telegram)

[Hubot](https://hubot.github.com/docs/) adapter for interfacting with the [Telegram Bot API](https://core.telegram.org/bots/api)

## Installation & Usage

First of read the docs on how to create a new [Telegram Bot](https://core.telegram.org/bots#botfather). Once you have a bot created, follow these steps:

* `npm install --save hubot-telegram`
* Set the environment variables specified in **Configuration**
* Run hubot `bin/hubot -a telegram`

## Configuration

This adapter uses the following environment variables:

**TELEGRAM_TOKEN** (required)

The token that the [BotFather](https://core.telegram.org/bots#botfather) gives you

**TELEGRAM_WEBHOOK** (optional)

You can specify a [webhook](https://core.telegram.org/bots/api#setwebhook) URL which the adapter will register with Telegram. This URL will receive updates from Telegram. The adapter automatically registers an endpoint with Hubot at http://your-hobot-host/hubot/telegram/receive.

**TELEGRAM_INTERVAL** (optional)

You can specify the interval (in milliseconds) in which the adapter will poll Telegram for updates. This option only applies if you are not using a [webhook](https://core.telegram.org/bots/api#setwebhook).

**TELEGRAM_PRIVACY** (optional)

VALUES: 0 or 1

When you turn off privacy mode, you should mark this variable as false. With privacy mode disabled, all messages will be processed and any leading slashes will be stripped. If you mark this variable as disabled, the messages will be processed "as is" and any slashes will be kept. This is useful if you want to run a bot that relies heavily on `head` functionality.

## Telegram Specific Functionality (ie. Stickers, Images)

If you want to create a script that relies on specific Telegram functionality that is not available to Hubot normall, you can do so by emitting the `telegram:invoke` event in your script:

``` nodejs

module.exports = function (robot) {

    robot.hear(/send sticker/i, function (res) {

        # https://core.telegram.org/bots/api#sendsticker

        robot.emit('telegram:invoke', 'sendSticker', { chat_id: xxx, sticker: 'sticker_id' }, function (error, response) {
            console.log(error);
            console.log(response);
        });
    });
};

```

**Note:** An example script of how to use this is located in the `example/` folder

## Contributors

* Luke Simone - [https://github.com/lukefx](https://github.com/lukefx)
* Chris Brand - [https://github.com/arcturial](https://github.com/arcturial)