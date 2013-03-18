
var Base = require('./base')
  , ChildList = require('./childlist')
  , graph = require('graph')

module.exports = makePresenter
makePresenter.ChildList = ChildList
makePresenter.Base = Base


/**
 * Create a Presenter factory
 * 
 * If you pass a String as `view` it will be converted to 
 * a DOM element. If you pass a function it will be called 
 * with `model.toJSON()` to produce a string which gets 
 * converted to a DOM element.
 *
 * @param {String} [name]
 * @param {Function|String} template
 * @return {Function}
 */

function makePresenter(name, template){
	if (arguments.length < 2) {
		template = name
		name = 'anonymous_presenter'
	}

	// compile constructor
	var Pres = eval(
		'(function '+name+'(model){\n' +
		'  this.model = model\n' +
		(typeof template == 'string' 
			? '  Base.call(this, template)'
			: '  Base.call(this, template(model && model.toJSON ? model.toJSON() : model))'
		) + '\n' +
		'  var behaviour = '+name+'.behaviour\n' +
		'  for (var i = 0, len = behaviour.length; i < len; i++) {\n' +
		'    var b = behaviour[i]\n' +
		'    var act = b.action\n' +
		'    if (typeof act == "object") act = graph(act)\n' +
		'    this.events.on(b.trigger, act)\n' +
		'  }\n' +
		'  if (typeof this.init == "function") this.init(model)\n' +
		'})'
	)

	Pres.behaviour = []

	Pres.behave = addBehaviour

	// inherit Base
	Pres.prototype.__proto__ = Base.prototype

	return Pres
}

function addBehaviour(trigger, action){
	if (typeof trigger == 'function') {
		action = trigger
		trigger = trigger.name
	}
	this.behaviour.push({
		trigger: trigger,
		action: action
	})
	return this
}
