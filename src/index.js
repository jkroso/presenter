
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
		'  if (typeof this.init == "function") this.init(model)\n' +
		'})'
	)

	Pres.behaviour = []
	Pres.actions = []
	Pres.behave = addBehaviour
	Pres.action = addAction

	// inherit Base
	Pres.prototype.__proto__ = Base.prototype

	return Pres
}

function installBehaviour(self, behaviour){
	for (var i = 0, len = behaviour.length; i < len; i++) {
		var b = behaviour[i]
		if (typeof b.action == "object") b.action = graph(b.action)
		self.events.on(b.trigger, b.action)
	}
}

function installActions(self, actions){
	for (var i = 0, len = actions.length; i < len; i++) {
		var act = actions[i]
		var action = self.action(act.trigger, act.action)
		connectPins(action, act.pins)
	}
}

function connectPins(action, pins){
	for (var pin in pins) {
		pins[pin].forEach(function(child){
			child = action.connect(pin, child.send)
			connectPins(child, child.pins)
		})
	}
}

function addAction(trigger, action){
	if (typeof trigger == 'function') {
		action = trigger
		trigger = trigger.name
	}
	var action = new Action(action)
	action.trigger = trigger
	this.actions.push(action)
	return action
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
