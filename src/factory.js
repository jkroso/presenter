
var emitter = require('dom-emitter')
var reactive = require('reactive')
var clone = require('clone')
var View = require('./view')
var Graph = require('graph')
var bindAction = View.bindAction
var own = {}.hasOwnProperty

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
		'	var arr = this.init.toArray()\n' +
		'	for (var i = 0, len = arr.length; i < len; i++) {\n' +
		'		arr[i].apply(this, arguments)\n' +
		'	}\n' +
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

	var fns = [makeReactive, bindEvents, bindActions]
	if (typeof init == 'function') fns.push(init)
	Presenter.prototype.init = new Graph(fns)
	Presenter.use = use

	return Presenter
}

function use(plugin){
	if (!own.call(this.prototype, 'init')) {
		this.prototype.init = this.prototype.init
			? this.prototype.clone()
			: new Graph
	}
	return plugin(this)
}

function bindActions(){
	var actions = clone(this.actions)
	actions.forEach(bindAction, this)
}

function bindEvents(){}

function makeReactive(model){
	this.reactive = reactive(this.el, model, this)
}