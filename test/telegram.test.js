var hubot = require('./hubot.stub');
var telegram = require('./../src/telegram').use(hubot);
var assert = require("assert");

describe('Telegram', function () {

  describe('#cleanMessageText()', function () {

    it('private chat: should remove any leading / characters from commands', function () {

      var input = '/ship it';
      var text = telegram.cleanMessageText(input, 1);
      assert.equal(/\/ship it/.test(text), false);

      var input = '/ship it'
      var text = telegram.cleanMessageText(input, 1);
      assert.notEqual(text.split(' ')[1].substr(0, 1), '/');
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

  describe("#applyExtraOptions()", function () {

    it("should automatically add the markdown option if the text contains markdown characters", function () {

      var message = {text: "normal"}
      message = telegram.applyExtraOptions(message);
      assert(typeof message.parse_mode === 'undefined');

      message = {text: "markdown *message*"}
      message = telegram.applyExtraOptions(message);
      assert.equal(message.parse_mode, "Markdown");

      message = {text: "markdown _message_"}
      message = telegram.applyExtraOptions(message);
      assert.equal(message.parse_mode, "Markdown");

      message = {text: "markdown `message`"}
      message = telegram.applyExtraOptions(message);
      assert.equal(message.parse_mode, "Markdown");

      message = {text: "markdown [message](http://link.com)"}
      message = telegram.applyExtraOptions(message);
      assert.equal(message.parse_mode, "Markdown");

    });

    it("should apply any extra options passed the message envelope", function () {

      var message = {text: "test"}
      var extra = {extra: true, nested: {extra: true}, nullObject: null};
      message = telegram.applyExtraOptions(message, extra);

      assert.equal("" + extra.extra, message.extra);
      assert.equal("" + extra.nested.extra, message.nested.extra);
      assert.equal("" + extra.nullObject, message.nullObject);

      // Mock the API object
      telegram.api = {
        invoke: function (method, opts, cb) {
          assert.equal("" + extra.extra, opts.extra);
          assert.equal("" + extra.nested.extra, opts.nested.extra);
          cb.apply(this, [null, {}]);
        }
      };

      telegram.send({telegram: extra}, "text");
    });

  });

  describe("#createUser()", function () {

    it("should use the new user object if the first_name or last_name changed", function () {

      telegram.robot.brain.data = {users: []};

      var original = {
        id: 1234,
        first_name: "Firstname",
        last_name: "Surname",
        username: "username"
      };

      telegram.robot.brain.userForId = function () {
        return original;
      };

      var user = {
        id: 1234,
        first_name: "Updated",
        last_name: "Surname",
        username: "username"
      };

      var result = telegram.createUser(original, 1);
      assert.equal(original.first_name, result.first_name);

      var result = telegram.createUser(user, 1);
      assert.equal(user.first_name, result.first_name);
    });

    it("should use the new user object if the username changed", function () {

      telegram.robot.brain.data = {users: []};

      var original = {
        id: 1234,
        first_name: "Firstname",
        last_name: "Surname",
        username: "old"
      };

      telegram.robot.brain.userForId = function () {
        return original;
      };

      var user = {
        id: 1234,
        first_name: "Firstname",
        last_name: "Surname",
        username: "username"
      };

      var result = telegram.createUser(user, 1);
      assert.equal(user.username, result.username);
    });
  });

  describe("#send()", function () {

    it('should not split messages below or equal to 4096 characters', function () {

      var called = 0;

      var message = "";
      for (var i = 0; i < 4096; i++) message += 'a';

      // Mock the API object
      telegram.api = {
        invoke: function (method, opts, cb) {
          assert.equal(opts.text.length, 4096);
          called++;
          cb.apply(this, [null, {}]);
        }
      };

      telegram.send({room: 1}, message);
      assert.equal(called, 1);
    });

    it('should split messages when they are above 4096 characters', function () {

      var called = 0;

      var message = "";
      for (var i = 0; i < 5000; i++) message += 'a';

      // Mock the API object
      telegram.api = {
        invoke: function (method, opts, cb) {
          var offset = called * 4096;
          assert.equal(opts.text.length, message.substring(offset, offset + 4096).length);
          called++;
          cb.apply(this, [null, {}]);
        }
      };

      telegram.send({room: 1}, message);
      assert.equal(called, 2);
    });

    it('should not split messages on new line characters', function () {

      var called = 0;

      var message = "";
      for (var i = 0; i < 1000; i++) message += 'a';
      message += '\n';
      for (var i = 0; i < 1000; i++) message += 'b';
      message += '\n';
      for (var i = 0; i < 1000; i++) message += 'c';
      message += '\n';
      for (var i = 0; i < 1000; i++) message += 'd';
      message += '\n';
      for (var i = 0; i < 1000; i++) message += 'e';
      message += '\n';

      // Mock the API object
      telegram.api = {
        invoke: function (method, opts, cb) {
          var offset = called * 4096;
          assert.equal(opts.text.length, message.substring(offset, offset + 4096).length);
          called++;
          cb.apply(this, [null, {}]);
        }
      };

      telegram.send({room: 1}, message);
      assert.equal(called, 2);
    });
  });
});
