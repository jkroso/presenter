
var ChildList = require('./childlist')
  , Action = require('action').Action
  , reactive = require('reactive')
  , View = require('./presenter')
  , graph = require('graph')
  , clone = require('clone')

var id = 1

/**
 * Create a Presenter factory
 * 
 * If you pass a String as `el` it will be converted to 
 * a DOM element. If you pass a function it will be called 
 * with `model.toJSON()` to produce a string which gets 
 * converted to a DOM element.
 *
 * @param {String} [name]
 * @param {Function|String} template
 * @param {Function} init
 * @return {Function}
 */

module.exports = function(template, init){
	var name = (init && init.name) || 'view_' + (id++)

	// compile constructor
	var Presenter = eval(
		'(function '+name+'(model){\n' +
		'	this.model = model\n' +
		(typeof template == 'string'
			? '	View.call(this, template)\n'
			: '	View.call(this, template(model))\n'
		) +
		'	this.reactive = reactive(this.el, model, this)\n' +
		'	installBehaviour(this, '+name+'.behaviour)\n' +
		'	installActions(this, '+name+'.actions)\n' +
		(typeof init == 'function'
			? '	init.apply(this, arguments)\n'
			: ''
		) +
		'})\n' +
		'//@ sourceURL=/compiled/views/'+name
	)

	// share prototype
	if (typeof init == 'function') {
		Presenter.prototype = init.prototype
		Presenter.prototype.constructor = Presenter
	}

	if (!(Presenter.prototype instanceof View)) {
		Presenter.prototype.__proto__ = View.prototype
	}

	Presenter.behaviour = []
	Presenter.on = addBehaviour
	Presenter.actions = {}
	Presenter.action = addAction
	Presenter.use = addPlugin

	return Presenter
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
