
module.exports = ChildList

/**
 * Manage a list of sibling presenters
 *
 * @param {DOMElement} el
 * @param {Presenter} owner
 */

function ChildList (el, owner) {
	this.el = el
  this.owner = owner
}

// default properties
ChildList.prototype.last = null
ChildList.prototype.first = null

/**
 * Insert `child` as the `firstChild` of `this`
 *
 * @param {Presenter} child
 * @return {this}
 */

ChildList.prototype.append = function (child) {
  child.parent = this.owner
  var last = this.last
  if (last) last.nextSibling = child
  child.prevSibling = last
  this.last = child
  if (!this.first) this.first = child

  this.el.appendChild(child.view)
  return this
}

/**
 * Insert `child` as the `lastChild` of `this`
 * 
 * @param {Presenter} child
 * @return {this}
 */

ChildList.prototype.prepend = function (child) {
  child.parent = this.owner
  var first = this.first
  if (first) first.prevSibling = child
  child.nextSibling = first
  this.first = child
  if (!this.last) this.last = child

  this.el.insertBefore(child.view, this.el.firstChild)
  return this
}

/**
 * produce `this` as an `Array`
 * 
 * @return {Array}
 */

ChildList.prototype.toArray = function () {
  var child = this.first
  var res = []
  while (child) {
    res.push(child)
    child = child.nextSibling
  }
  return res
}

/**
 * apply `fn` to each item in `this`
 *
 * @param {Function} fn
 * @return {this}
 */

ChildList.prototype.each = function (fn) {
	var child = this.first
	while (child) {
		fn(child)
    child = child.nextSibling
	}
	return this
}
