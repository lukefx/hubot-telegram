// Create a basic Hubot stub object so
// we don't have to include the Hubot dependency
// in our tests

module.exports = {
  name: 'TestBot',
  alias: 'TestAliasBot',
  logger: {
    info: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  },
  brain: {},
  listenerMiddleware: jest.fn()
}
