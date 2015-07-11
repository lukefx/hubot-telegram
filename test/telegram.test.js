var hubot = require('./hubot.stub');
var telegram = require('./../src/telegram').use(hubot);
var assert = require("assert");

describe('Telegram', function() {

    describe('#cleanMessageText()', function () {

        it('all chat: should remove any leading / characters from commands', function () {

            var input = '/ship it';
            var text = telegram.cleanMessageText(input, 0);
            assert.equal('ship it', text);

            var input = '/ship it'
            var text = telegram.cleanMessageText(input, 0);
            assert.notEqual(text.substr(0, 1), '/');
        });

        // eg. ship it => BotName ship it
        it('private chat: should auto prepend the bot name to message text', function () {

            var input = 'ship it'
            var text = telegram.cleanMessageText(input, 1);
            assert.equal(hubot.name + ' ' + input, text);
        });

        // eg. BotName ship it => BotName ship it
        it('private chat: should not prepend bot name if has already been provided', function () {

            var input = 'ship it';
            var text = telegram.cleanMessageText(hubot.name + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);

            var text = telegram.cleanMessageText(hubot.name.toLowerCase() + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);

            var text = telegram.cleanMessageText('@' + hubot.name.toLowerCase() + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);
        });

        // eg. BotAliasName ship it => BotAliasName ship it
        it('private chat: should not prepend bot name if an alias has already been provided', function () {

            var input = 'ship it';
            var text = telegram.cleanMessageText(hubot.alias + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);

            var text = telegram.cleanMessageText(hubot.alias.toLowerCase() + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);

            var text = telegram.cleanMessageText('@' + hubot.alias.toLowerCase() + ' ' + input, 1);
            assert.equal(hubot.name + ' ' + input, text);
        });
    });
});