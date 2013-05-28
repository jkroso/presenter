
var chai = require('chai')

chai.use(require('chai-spies'))

global.should = chai.should()
global.expect = chai.expect

chai.Assertion.includeStack = true

module.exports = chai