
var matches = require('matches-selector')
var DomEmitter = require('dom-emitter')
var ChildList = require('./childlist')
var classes = require('classes')
var domify = require('domify')
var action = require('action')
var event = require('event')
var Action = action.Action
var dev = require('dev')

module.exports = Presenter

/**
 * Presenter
 * 
 * If `el` is a string it will 
 * be converted to a HTML DOM element
 *
 * @param {String|Element} el
 */

function Presenter(el){
	if (typeof el == 'string') el = domify(el)
	this.el = el
	this.kids = new ChildList(el, this)
	this.events = new DomEmitter(el, this)
	this.actions = {}
	dev(el, this)
}

/**
 * mixin class methods
 */

classes(Presenter.prototype)

/**
 * hook an action to a DOM event. If you omit `hook`
 * `fn.name` will be used as the DOM event hook
 *
 *   view.action('click', function(e, view){})
 *
 * @param {String} hook
 * @param {Function|Action} act
 * @return {Action}
 */

Presenter.prototype.action = function(hook, act){
	var con = action.parseConnection(hook)
	con.action = action.toAction(act)
	var dispatch = this.actions[con.from]

	if (!dispatch) {
		var self = this
		dispatch = function(e){
			var out = dispatch.out
			for (var i = 0, len = out.length; i < len; i++) {
				var con = out[i]
				con.action[con.to](e, self, this)
			}
		}
		dispatch.out = []
		this.actions[con.from] = dispatch
		event.bind(this.el, con.from, dispatch)
	}

	dispatch.out = dispatch.out.concat(con)
	return con.action 
}

/**
 * add an event listener
 * 
 * @param {String} trigger
 * @param {Function} fn
 * @return {this}
 */

Presenter.prototype.on = function(trigger, fn){
	this.events.on(trigger, fn)
	return this
}

/**
 * remove an event listener
 * 
 * @param {String} trigger
 * @param {Function} fn
 * @return {this}
 */

Presenter.prototype.off = function(trigger, fn){
	this.events.off(trigger, fn)
	return this
}

/**
 * use a plugin
 *
 * @param {Function} plugin
 * @return {Any} plugin.return
 */

Presenter.prototype.use = function(plugin){
	return plugin(this)
}

/**
 * Insert `this` as the `prevSibling` of `sib`
 *
 * @param {Presenter} sib
 */

Presenter.prototype.insertBefore = function(sib){
	this.parent = sib.parent
	var prev = sib.prevSibling
	if (prev) prev.nextSibling = this
	sib.prevSibling = this
	this.nextSibling = sib
	this.prevSibling = prev

	sib.el.parentNode.insertBefore(this.el, sib.el)
}

/**
 * Insert `this` as the `nextSibling` of `sib`
 * 
 * @param {Presenter} sib
 */

Presenter.prototype.insertAfter = function(sib){
	this.parent = sib.parent

	var next = sib.nextSibling
	this.nextSibling = next
	if (next) next.prevSibling = this
	sib.nextSibling = this
	this.prevSibling = sib

	sib.el.parentNode.insertBefore(this.el, sib.el.nextSibling)
}

/**
 * Get a list of siblings in DOM order
 *
 * @param {Boolean} inc to include `this` in the list
 * @return {Array}
 */

Presenter.prototype.siblings = function(inc){
	var sibs = prevSibs(this.prevSibling)
	inc && sibs.push(this)
	var sib = this.nextSibling
	while (sib) {
		sibs.push(sib)
		sib = sib.nextSibling
	}
	return sibs
}

function prevSibs (el) {
	if (!el) return []
	var prev = prevSibs(el.prevSibling)
	prev.push(el)
	return prev
}

/**
 * Remove a el from the DOM
 * 
 * @emits "remove"
 */
 
Presenter.prototype.remove = function(){
	var parent = this.el.parentNode
	if (parent) {
		this.events.emit('remove')
		parent.removeChild(this.el)
	}
}

/**
 * Find the first parent matching `sel`
 *
 * @param {String} sel
 * @return {Presenter}
 */

Presenter.prototype.up = function(sel){
	var parent = this
	while (parent = parent.parent) {
		if (matches(parent.el, sel)) return parent
	}
}

/**
 * Find the closest child matching `sel`.
 * The search is run breadth first.
 *
 * @param {String} sel
 * @return {Presenter}
 */

Presenter.prototype.down = function(sel){
	var childs = this.kids.toArray()
	for (var i = 0; i < childs.length; i++) {
		var child = childs[i]
		if (matches(child.el, sel)) return child
		child.kids.each(push)
	}

	function push(child){
		childs.push(child)
	}
}

/**
 * Works like `.down` except later siblings are prefered
 *
 * @param {String} sel
 * @return {Presenter}
 */

Presenter.prototype.downLast = function(sel){
	var childs = this.kids.toArray().reverse()
	for (var i = 0; i < childs.length; i++) {
		var child = childs[i]
		if (matches(child.el, sel)) return child
		reversePush(child.kids.last)
	}

	function reversePush(child){
		while (child) {
			childs.push(child)
			child = child.prevSibling
		}
	}
}
