
var ChildList = require('./src/childlist')
var makeView = require('./src/factory')
var Component = require('./component')
var View = require('./src/view')

/**
 * if used as a constuctor it creates an instance of the 
 * base class otherwise it creates a new View class
 * 
 * @return {Function|View}
 */

module.exports = exports = function(){
	if (this instanceof View) View.apply(this, arguments)
	else return makeView.apply(null, arguments)
}

exports.prototype = View.prototype
exports.Base =
exports.Class =
exports.View =
exports.Presenter = View
exports.ChildList = ChildList
exports.component = Component