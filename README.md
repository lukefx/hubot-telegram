# hubot-telegram
Hubot adapter for Telegram

### Setup

First of read the docs on how to create a new bot: https://core.telegram.org/bots/api

    mkdir <botname>
    cd <botname>
    yo hubot --adapter telegram
    # Follow the instructions

Or if you already have a bot:

    cd <botname>
    npm install --save hubot-telegram

### Adapter configuration

This adapter uses the following environment variables:

*TELEGRAM_TOKEN*

Required, the token that the BotFather gives you

*TELEGRAM_WEBHOOK*

Optional, the WebHook of the bot

## Run the bot

    ./bin/hubot -a telegram

Or with Foreman, create a file .env with the env vars in key=val format:

    # HUBOT_LOG_LEVEL=debug
    TELEGRAM_TOKEN=1234567890:XXXXXXXXXXX
    REDIS_URL=redis://user:pass@redsurl:8080
    TELEGRAM_WEBHOOK=https://urlofhubot/hubot/telegram/receive

Then start the service with:

    nf start
