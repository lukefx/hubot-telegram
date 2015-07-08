var hubot = require('./hubot.stub');
var telegram = require('./../src/telegram').use(hubot);
var assert = require("assert");

describe('Telegram', function() {

    describe('#cleanMessageText()', function () {

        it('all chat: should remove any leading / characters from commands', function () {

            var message = { text: '/ship it', chat: { id: -1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal('ship it', text);

            var message = { text: '/ship it', chat: { id: -1 } };
            var text = telegram.cleanMessageText(message);
            assert.notEqual(text.substr(0, 1), '/');
        });

        // eg. ship it => BotName ship it
        it('private chat: should auto prepend the bot name to message text', function () {

            var message = { text: 'ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);
        });

        // eg. BotName ship it => BotName ship it
        it('private chat: should not prepend bot name if has already been provided', function () {

            var message = { text: hubot.name + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);

            var message = { text: hubot.name.toLowerCase() + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);

            var message = { text: '@' + hubot.name.toLowerCase() + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);
        });

        // eg. BotAliasName ship it => BotAliasName ship it
        it('private chat: should not prepend bot name if an alias has already been provided', function () {

            var message = { text: hubot.alias + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);

            var message = { text: hubot.alias.toLowerCase() + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);

            var message = { text: '@' + hubot.alias.toLowerCase() + ' ship it', chat: { id: 1 } };
            var text = telegram.cleanMessageText(message);
            assert.equal(hubot.name + ' ' + message.text, text);
        });
    });
});