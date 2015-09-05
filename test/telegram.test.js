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

    describe("#send()", function () {

        it('should not split messages below or equal to 4096 bytes', function () {

            var called = 0;

            var message = "";
            for (var i = 0; i < 4096; i++) message += 'a';

            // Mock the API object
            telegram.api = {
                invoke: function (method, opts) {
                    assert.equal(Buffer.byteLength(opts.text, 'utf8'), 4096);
                    called++;
                }
            };

            telegram.send({ room: 1 }, message);
            assert.equal(called, 1);
        });

        it('should split messages when they are above 4096 bytes', function () {

            var called = 0;

            var message = "";
            for (var i = 0; i < 5000; i++) message += 'a';

            // Mock the API object
            telegram.api = {
                invoke: function (method, opts) {
                    var offset = called * 4096;
                    assert.equal(Buffer.byteLength(opts.text, 'utf8'), Buffer.byteLength(message.substr(offset, offset + 4096)));
                    called++;
                }
            };

            telegram.send({ room: 1 }, message);
            assert.equal(called, 2);
        });

        it('should split unicode messages when they are above 4096 bytes', function () {

            var called = 0;
            var chars = 3000;

            var message = "";
            for (var i = 0; i < chars; i++) message += '╚';

            // Mock the API object
            telegram.api = {
                invoke: function (method, opts) {
                    var offset = called * 4096;
                    assert.equal(Buffer.byteLength(opts.text, 'utf8'), Buffer.byteLength(message.substr(offset, offset + 4096)));
                    called++;
                }
            };

            telegram.send({ room: 1 }, message);
            assert.equal(called, Math.ceil((chars * 4) / 4096));
        });

    });
});