
var ChildList = require('./src/childlist')
var makeView = require('./src/factory')
var View = require('./src/presenter')

/**
 * if used as a constuctor it creates an instance of the 
 * base class otherwise it creates a new View class
 * 
 * @return {Function|View}
 */

exports = module.exports = function(){
	if (this instanceof View) View.apply(this, arguments)
	else return makeView.apply(null, arguments)
}

exports.prototype = View.prototype
exports.Base =
exports.Class = 
exports.Presenter = View
exports.ChildList = ChildList