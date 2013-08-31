
var matches = require('matches-selector')
var ChildList = require('./childlist')
var emitter = require('dom-emitter')
var classes = require('classes')
var domify = require('domify')
var action = require('action')
var own = {}.hasOwnProperty
var Action = action.Action
var dev = require('dev')

module.exports = exports = View
exports.bindAction = bindAction

/**
 * View base class. If `el` is a string it will
 * be converted to a DOM element
 *
 * @param {String|Element} el
 */

function View(el){
	if (typeof el == 'string') el = domify(el)
	this.kids = new ChildList(el, this)
	this.el = el
	dev(el, this)
}

/**
 * actions to be bound at construction
 *
 * @type {Array}
 * @api private
 */

View.prototype.actions = []

/**
 * add mixins
 */

classes(View.prototype)
emitter(View.prototype)

/**
 * hook an action to a DOM event. If you omit `hook`
 * `fn.name` will be used as the DOM event hook
 *
 *   view.when('click', function(e, view){})
 *
 * @param {String} hook
 * @param {Function|Action} act
 * @return {Action}
 */

View.prototype.when = function(hook, act){
	var con = action.parseConnection(hook)
	con.action = action.toAction(act)
	if (!own.call(this, 'actions')) {
		this.actions = this.actions.slice()
	}
	if (this.el) bindAction.call(this, con)
	else this.actions.push(con)
	return con.action
}

function bindAction(connection){
	var from = connection.from
	var to = connection.to
	var action = connection.action
	this.on(from, function(e){
		action[to](e, this)
	})
}

/**
 * chainable version of `.when()`
 *
 * @param {String} hook
 * @param {Function|Action} act
 * @return {this}
 */

View.prototype.action = function(hook, act){
	this.when(hook, act)
	return this
}

/**
 * use a plugin
 *
 * @param {Function} plugin
 * @return {Any} plugin.return
 */

View.prototype.use = function(plugin){
	return plugin(this)
}

/**
 * Insert `this` as the `prevSibling` of `sib`
 *
 * @param {Presenter} sib
 */

View.prototype.insertBefore = function(sib){
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

View.prototype.insertAfter = function(sib){
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

View.prototype.siblings = function(inc){
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

View.prototype.remove = function(){
	var parent = this.el.parentNode
	if (parent) {
		parent.removeChild(this.el)
		this.emit('remove')
	}
}

/**
 * Find the first parent matching `sel`
 *
 * @param {String} sel
 * @return {Presenter}
 */

View.prototype.up = function(sel){
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

View.prototype.down = function(sel){
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

View.prototype.downLast = function(sel){
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