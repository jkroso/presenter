
var DomEmitter = require('dom-emitter')
  , classlist = require('classes')
  , domify = require('domify')

module.exports = Presenter

/**
 * Presenter constructor. 
 * If you pass a String as `view` it will be converted to 
 * a DOM element. If you pass a function it will be called 
 * with `model.toJSON()` to produce a string which gets 
 * converted to a DOM element.
 *
 * @param {String|DomElement} view
 * @param {Any} model
 */

function Presenter (view, model) {
  if (typeof view === 'function') {
    view = view(model && model.toJSON ? model.toJSON() : model)
  }
  if (typeof view === 'string') {
    view = domify(view)
  }
  this.view = view
  this.model = model
  this.classList = classlist(view)
  this.events = new DomEmitter(view, this)
}

// default properties
Presenter.prototype.lastChild = null
Presenter.prototype.firstChild = null
Presenter.prototype.parent = null

/**
 * Insert `child` as the `firstChild` of `this`
 *
 * @param {Presenter} child
 * @return {this}
 */

Presenter.prototype.appendChild = function (child) {
  child.parent = this
  var last = this.lastChild
  if (last) last.nextSibling = child
  child.prevSibling = last
  this.lastChild = child
  if (!this.firstChild) this.firstChild = child;

  (this._childEl || this.view).appendChild(child.view)
  return this
}

/**
 * Insert `child` as the `lastChild` of `this`
 * 
 * @param {Presenter} child
 */

Presenter.prototype.prependChild = function (child) {
  child.parent = this
  var first = this.firstChild
  if (first) first.prevSibling = child
  child.nextSibling = first
  this.firstChild = child
  if (!this.lastChild) this.lastChild = child

  var view = (this._childEl || this.view)
  view.insertBefore(child.view, view.firstChild)
}

/**
 * Insert `this` as the `prevSibling` of `sib`
 *
 * @param {Presenter} sib
 */

Presenter.prototype.insertBefore = function (sib) {
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

Presenter.prototype.insertAfter = function (sib) {
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

Presenter.prototype.siblings = function (inc) {
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
 * Get a list of `this` presenters children
 * 
 * @return {Array}
 */

Presenter.prototype.children = function () {
  var child = this.firstChild
  var res = []
  while (child) {
    res.push(child)
    child = child.nextSibling
  }
  return res
}

/**
 * Remove a view from the DOM
 * 
 * @emits "remove"
 */
 
Presenter.prototype.remove = function () {
  var parent = this.view.parentNode
  if (parent) {
    this.events.emit('remove')
    parent.removeChild(this.view)
  }
}
