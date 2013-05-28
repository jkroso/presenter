
var Base = require('./presenter')
  , ChildList = require('./childlist')
  , Action = require('action').Action
  , graph = require('graph')
  , clone = require('clone')

module.exports = makePresenter

var id = 1

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
		name = 'anon_' + (id++)
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
		'  this.init && this.init.apply(this, arguments)\n' +
		'})\n' +
		'//@ sourceURL=/compiled/presenters/'+name
	)

	Pres.behaviour = []
	Pres.on = addBehaviour
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
	actions = clone(actions)
	for (var hook in actions) {
		actions[hook].forEach(function(action){
			self.action(hook, action)
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
