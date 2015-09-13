// Create a basic Hubot stub object so
// we don't have to include the Hubot dependency
// in our tests

// Function that does/return nothing
var void_func = function () {};

module.exports = {
    name: "TestBot",
    alias: "TestAliasBot",
    logger: {
        info: void_func,
        warning: void_func,
        error: void_func,
        debug: void_func
    },
    brain: {}
}