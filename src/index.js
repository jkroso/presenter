
var Base = require('./base')
  , ChildList = require('./childlist')
  , Action = require('action').Action
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
		'  installBehaviour(this, '+name+'.behaviour)\n' +
		'  installActions(this, '+name+'.actions)\n' +
		'  \'init\' in this && this.init.apply(this, arguments)\n' +
		'})'
	)

	Pres.behaviour = []
	Pres.behave = addBehaviour
	Pres.actions = {}
	Pres.action = addAction
	Pres.use = addPlugin

	// inherit Base
	Pres.prototype.__proto__ = Base.prototype

	return Pres
}

function addPlugin(plugin){
	return plugin(this)
}

function addAction(hook, action){
	if (!action) action = hook, hook = action.name
	if (typeof action == 'function') action = new Action(action);
	(this.actions[hook] || (this.actions[hook] = [])).push(action)
	return action
}

function installActions(self, actions){
	for (var hook in actions) {
		var acts = actions[hook]
		acts.forEach(function(action){
			connectPins(self.action(hook, action.send), action.pins)
		})
	}
}

function connectPins(action, pins){
	for (var pin in pins) {
		pins[pin].forEach(function(child){
			connectPins(action.connect(pin, child.send), child.pins)
		})
	}
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

function installBehaviour(self, behaviour){
	for (var i = 0, len = behaviour.length; i < len; i++) {
		var b = behaviour[i]
		if (typeof b.action == "object") b.action = graph(b.action)
		self.events.on(b.trigger, b.action)
	}
}
