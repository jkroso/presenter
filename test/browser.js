var mocha = require('mocha')

mocha.setup('bdd')

require('./index.test.js')
require('./actions.test.js')

mocha.run(function () {
   console.log('Done!')
})
