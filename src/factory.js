
var bindEvents = require('dom-emitter').bindEvents
var reactive = require('reactive')
var clone = require('clone')
var View = require('./view')
var bindAction = View.bindAction

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
		'	bindEvents(this)\n' +
		'	bindActions(this)\n' +
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

	Presenter.use = use

	return Presenter
}

function use(plugin){
	return plugin(this)
}

function bindActions(self){
	var actions = clone(self.actions)
	actions.forEach(bindAction, self)
}