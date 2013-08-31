
var emitter = require('dom-emitter')
var reactive = require('reactive')
var Graph = require('topograph')
var inherit = require('inherit')
var clone = require('clone')
var View = require('./view')
var bindAction = View.bindAction
var own = {}.hasOwnProperty

var id = 1

/**
 * Create a new View class. if `template` is a function it 
 * will be passed `model` and can return either an Element
 * or an HTML string.
 *
 *   var P = view('<p>{body}</p>')
 *   new P({ body: 'some text' }).el
 *   // <p>some text</p>
 *
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
		'	var fns = this.init.toArray()\n' +
		'	var i = fns.length\n' +
		'	while (i--) fns[i].apply(this, arguments)\n' +
		'})\n' +
		'//@ sourceURL=/compiled/views/'+name
	)

	if (typeof init == 'function') {
		Presenter.prototype = init.prototype
		Presenter.prototype.constructor = Presenter
	} else {
		inherit(Presenter, View)
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
	return plugin.call(this, this)
}

function bindActions(){
	var actions = clone(this.actions)
	actions.forEach(bindAction, this)
}

function bindEvents(){
	emitter.bindEvents(this)
}

function makeReactive(model){
	this.reactive = reactive(this.el, model, this)
}