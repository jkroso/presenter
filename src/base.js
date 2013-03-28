
var DomEmitter = require('dom-emitter')
	, ChildList = require('./childlist')
	, Action = require('action').Action
	, classlist = require('classes')
	, domify = require('domify')
	, matches = require('matches-selector')
	, event = require('event')

module.exports = Presenter

/**
 * Presenter
 * 
 * If `view` is a string it will 
 * be converted to a HTML DOM element
 *
 * @param {String|Element} view
 */

function Presenter(view){
	if (typeof view == 'string') view = domify(view)
	this.view = view
	this.kids =
	this.children = new ChildList(view, this)
	this.classes = 
	this.classList = classlist(view)
	this.events = new DomEmitter(view, this)
	this.actions = {}
}

/**
 * hook an action to a DOM event. If you omit `hook`
 * `fn.name` will be used as the DOM event hook
 *
 *   pres.action(function click(domEvent, presenter){
 *     // this === Action
 *   })
 *   // equivalent to
 *   pres.action('click', function(e, subj){})
 *
 * @param {String} [hook]
 * @param {Function|Action} act
 * @return {Action}
 */

Presenter.prototype.action = function(hook, act){
	if (!act) act = hook, hook = act.name
	if (typeof act == 'function') act = new Action(act)
	var dispatch = this.actions[hook]
	if (dispatch) dispatch.out = dispatch.out.concat(act)
	else {
		var self = this
		dispatch = function multi(e){
			var out = multi.out
			for (var i = 0, len = out.length; i < len; i++) {
				out[i].send(e, self, this)
			}
		}
		dispatch.out = [act]
		this.actions[hook] = dispatch
		event.bind(this.view, hook, dispatch)
	}
	
	return act 
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

	sib.view.parentNode.insertBefore(this.view, sib.view)
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

	sib.view.parentNode.insertBefore(this.view, sib.view.nextSibling)
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

function prevSibs (view) {
	if (!view) return []
	var prev = prevSibs(view.prevSibling)
	prev.push(view)
	return prev
}

/**
 * Remove a view from the DOM
 * 
 * @emits "remove"
 */
 
Presenter.prototype.remove = function(){
	var parent = this.view.parentNode
	if (parent) {
		this.events.emit('remove')
		parent.removeChild(this.view)
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
		if (matches(parent.view, sel)) return parent
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
	var childs = this.children.toArray()
	for (var i = 0; i < childs.length; i++) {
		var child = childs[i]
		if (matches(child.view, sel)) return child
		child.children.each(push)
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
	var childs = this.children.toArray().reverse()
	for (var i = 0; i < childs.length; i++) {
		var child = childs[i]
		if (matches(child.view, sel)) return child
		reversePush(child.children.last)
	}

	function reversePush(child){
		while (child) {
			childs.push(child)
			child = child.prevSibling
		}
	}
}
