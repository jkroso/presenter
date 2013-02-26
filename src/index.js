
var DomEmitter = require('dom-emitter')
  , ChildList = require('./childlist')
  , classlist = require('classes')
  , domify = require('domify')

module.exports = Presenter
Presenter.ChildList = ChildList

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
  this.kids =
  this.children = new ChildList(view, this)
  this.classList = classlist(view)
  this.events = new DomEmitter(view, this)
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
