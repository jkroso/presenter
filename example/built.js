!function (context, definition) {
	if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		module.exports = definition()
	} else if (typeof define === 'function' && typeof define.amd  === 'object') {
		define(definition)
	} else {
		definition()
	}
}(this, function () {
	/**	
	 * Require the given path.	
	 *	
	 * @param {String} path   Full path to the required file	
	 * @param {String} parent The file which this call originated from	
	 * @return {Object} module.exports	
	 */	
		
	function require (path, parent){	
		// Determine the correct path	
		var fullpath = resolve(parent, path)	
		  , module = modules[fullpath]	
		
		if (module == null) throw Error('failed to require '+path+' from '+(parent || 'root'))	
		
		// It hasn't been loaded before	
		if (typeof module === 'string') {	
			var code = module	
			module = {	
				src: code,	
				exports: {}	
			}	
			modules[fullpath] = module	
			Function(	
				'module',	
				'exports',	
				'require',	
				// The source allows the browser to present this module as if it was a normal file	
				code+'\n//@ sourceURL='+encodeURI(fullpath)	
			).call(module.exports, module, module.exports,	
				// Relative require function	
				function (rp) {	
					if (rp[0] === '.') rp = join(dirname(fullpath), rp)	
					return require(rp, fullpath)	
				}	
			)	
		}	
		return module.exports	
	}	
		
	/**	
	 * Figure out what the full path to the module is	
	 *	
	 * @param {String} base, the current directory	
	 * @param {String} path, what was inside the call to require	
	 * @return {String}	
	 * @api private	
	 */	
		
	function resolve (base, path) {	
		if (path.match(/^\/|(?:[a-zA-Z]+:)/)) {	
			return modules[path] && path	
				|| modules[path+'.js'] && path+'.js'	
				|| modules[path+'.json'] && path+'.json'	
				|| modules[path+'index.js'] && path+'index.js'	
				|| modules[path+'/index.js'] && path+'/index.js'	
		}	
		
		while (true) {	
			var res = node_modules(base, path, modules)	
			if (res != null) return res	
			if (base === '/') break	
			base = dirname(base)	
		}	
	}	
		
	function dirname (path) {	
		if (path[path.length - 1] === '/') path = path.slice(0, -1)	
		return path.split('/').slice(0,-1).join('/') || '/'	
	}	
		
	function normalize (path) {	
		var isAbsolute = path[0] === '/'	
		  , res = []	
		path = path.split('/')	
		
		for (var i = 0, len = path.length; i < len; i++) {	
			var seg = path[i]	
			if (seg === '..') res.pop()	
			else if (seg && seg !== '.') res.push(seg)	
		}	
		
		return (isAbsolute ? '/' : '') + res.join('/')	
	}	
		
	function join () {	
		return normalize(slice(arguments).filter(function(p) {	
			return p	
		}).join('/'))	
	}	
		
	function slice (args) {	
		return Array.prototype.slice.call(args)	
	}	
	
	function node_modules (dir, name, hash) {
		var match = variants(dir, name).filter(function (p) {
			return p in hash
		})
	
		if (match.length) {
			if (match.length > 1) console.warn('%s -> %s has several matches', dir, name)
			return match[0]
		}
	
		// core modules
		if (dir === '/' && hash['/node_modules/'+name+'.js']) {
			return '/node_modules/'+name+'.js'
		}
	}
	function variants(dir, path) {
		// Is it a full path already
		if (path.match(/\.js(?:on)?$/)) {
			path = [path]
		}
		// A directory
		else if (path.match(/\/$/)) {
			path = [
				path+'index.js',
				path+'index.json',
				path+'package.json'
			]
		}
		// could be a directory or a file
		else {
			path = [
				path+'.js',
				path+'.json',
				path+'/index.js',
				path+'/index.json',
				path+'/package.json'
			]
		}
	
		return path.map(function (name) {
			return join(dir, 'node_modules', name)
		})
	}
	var modules = {
		"/example/todo.js": "var Presenter = require('../src')\n  , items = require('./data')\n\n// Todo item container\nvar list = new Presenter('<div id=\"list\"></div>', items)\n\n// Item class\nfunction Item (model) {\n  Presenter.call(this, '<div class=\"item\"></div>')\n  this.view.innerHTML = model.title\n  this.model = model\n  this.events.on('click')\n}\n\nItem.prototype.onClick = function (e) {\n  this.classList.toggle('done')\n  this.model.done = !this.model.done\n}\n\n// insert items\nitems.forEach(function (model) {\n  list.appendChild(new Item(model))\n})\n\ndocument.body.appendChild(list.view)\n",
		"/example/data.js": "module.exports = [\n  {\n    title: \"see how jQuery does remove()\",\n    done: false\n  },\n  {\n    title: \"learn SVG\",\n    done: false\n  },\n  {\n    title: \"come up with a decent plugin system\",\n    done: false\n  },\n  {\n    title: \"build a better package manager\",\n    done: false\n  }\n]",
		"/src/index.js": "\nvar DomEmitter = require('dom-emitter')\n  , classlist = require('classes')\n  , domify = require('domify')\n\nmodule.exports = Presenter\n\n/**\n * Presenter constructor. \n * If you pass a String as `view` it will be converted to \n * a DOM element. If you pass a function it will be called \n * with `model.toJSON()` to produce a string which gets \n * converted to a DOM element.\n *\n * @param {String|DomElement} view\n * @param {Any} model\n */\n\nfunction Presenter (view, model) {\n  if (typeof view === 'function') {\n    view = view(model && model.toJSON ? model.toJSON() : model)\n  }\n  if (typeof view === 'string') {\n    view = domify(view)\n  }\n  this.view = view\n  this.model = model\n  this.classList = classlist(view)\n  this.events = new DomEmitter(view, this)\n}\n\n// default properties\nPresenter.prototype.lastChild = null\nPresenter.prototype.firstChild = null\nPresenter.prototype.parent = null\n\n/**\n * Insert `child` as the `firstChild` of `this`\n *\n * @param {Presenter} child\n * @return {this}\n */\n\nPresenter.prototype.appendChild = function (child) {\n  child.parent = this\n  var last = this.lastChild\n  if (last) last.nextSibling = child\n  child.prevSibling = last\n  this.lastChild = child\n  if (!this.firstChild) this.firstChild = child;\n\n  (this.childViewContainer || this.view).appendChild(child.view)\n  return this\n}\n\n/**\n * Insert `child` as the `lastChild` of `this`\n * \n * @param {Presenter} child\n */\n\nPresenter.prototype.prependChild = function (child) {\n  child.parent = this\n  var first = this.firstChild\n  if (first) first.prevSibling = child\n  child.nextSibling = first\n  this.firstChild = child\n  if (!this.lastChild) this.lastChild = child\n\n  var view = (this.childViewContainer || this.view)\n  view.insertBefore(child.view, view.firstChild)\n}\n\n/**\n * Insert `this` as the `prevSibling` of `sib`\n *\n * @param {Presenter} sib\n */\n\nPresenter.prototype.insertBefore = function (sib) {\n  this.parent = sib.parent\n  var prev = sib.prevSibling\n  if (prev) prev.nextSibling = this\n  sib.prevSibling = this\n  this.nextSibling = sib\n  this.prevSibling = prev\n\n  sib.view.parentNode.insertBefore(this.view, sib.view)\n}\n\n/**\n * Insert `this` as the `nextSibling` of `sib`\n * \n * @param {Presenter} sib\n */\n\nPresenter.prototype.insertAfter = function (sib) {\n  this.parent = sib.parent\n\n  var next = sib.nextSibling\n  this.nextSibling = next\n  if (next) next.prevSibling = this\n  sib.nextSibling = this\n  this.prevSibling = sib\n\n  sib.view.parentNode.insertBefore(this.view, sib.view.nextSibling)\n}\n\n/**\n * Get a list of siblings in DOM order\n *\n * @param {Boolean} inc to include `this` in the list\n * @return {Array}\n */\n\nPresenter.prototype.siblings = function (inc) {\n  var sibs = prevSibs(this.prevSibling)\n  inc && sibs.push(this)\n  var sib = this.nextSibling\n  while (sib) {\n    sibs.push(sib)\n    sib = sib.nextSibling\n  }\n  return sibs\n}\n\nfunction prevSibs (view) {\n  if (!view) return []\n  var prev = prevSibs(view.prevSibling)\n  prev.push(view)\n  return prev\n}\n\n/**\n * Get a list of `this` presenters children\n * \n * @return {Array}\n */\n\nPresenter.prototype.children = function () {\n  var child = this.firstChild\n  var res = []\n  while (child) {\n    res.push(child)\n    child = child.nextSibling\n  }\n  return res\n}\n\n/**\n * Remove a view from the DOM\n * \n * @emits \"remove\"\n */\n \nPresenter.prototype.remove = function () {\n  var parent = this.view.parentNode\n  if (parent) {\n    this.events.emit('remove')\n    parent.removeChild(this.view)\n  }\n}\n",
		"/node_modules/dom-emitter/index.js": "var bind = require('event').bind\n  , unbind = require('event').unbind\n  , match = require('delegate').match\n  , domEvent = require('dom-event')\n  , mouseEvent = domEvent.mouse\n  , keyEvent = domEvent.key\n  , customEvent = domEvent.custom\n\nmodule.exports = DomEmitter\n\n/**\n * Initialize a `DomEmitter`\n *\n *   new DomEmitter(document.body, {\n *     onClick: console.log  \n *   })\n *   \n * @param {Object} view\n * @param {Object} context\n */\n\nfunction DomEmitter(view, context) {\n\tthis.__view__ = view\n\tthis.__context__ = context || {}\n\tthis.__domBindings__ = {}\n\tthis.behaviours = {}\n}\n\n/**\n * Bind to `type` with optional `method`. When `method` is \n * undefined it inferred from `type`. Delegation is can be\n * specified in `type`\n *\n *    events.on('click', 'onClick')\n *    events.on('click') // implies \"onClick\"\n *    events.on('click', function (e) {})\n *    events.on('click .ok') // will only trigger if the click happened within a child with .ok class\n *\n * @param {String} type\n * @param {String} [method]\n * @return {Function} acts as a key to remove the behaviour\n */\n\nDomEmitter.prototype.on = function(type, method){\n\tvar parsed = parse(type)\n\t  , name = parsed.name\n\t  , binding = this.__domBindings__[name]\n\n\t// lookup a function if one wasn't passed\n\tif (typeof method !== 'function') {\n\t\tmethod = getMethod(method, name, this.__context__)\n\t}\n\n\t// bind to the dom\n\tif (!binding) {\n\t\tvar self = this\n\t\tbinding = this.__domBindings__[name] = function dispatcher (e) {\n\t\t\temit(self.__context__, self.behaviours[name], e)\n\t\t\t\n\t\t\tvar selectors = dispatcher.selectors\n\t\t\tfor (var i = 0, len = selectors.length; i < len; i++) {\n\t\t\t\tif (e.delegate = match(e.target, this, selectors[i])) {\n\t\t\t\t\temit(self.__context__, self.behaviours[name+' '+selectors[i]], e)\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tbinding.deps = 0\n\t\tbinding.selectors = []\n\t\tbind(this.__view__, name, binding)\n\t}\n\n\t// keep count of the number of subscriptions depending on\n\t// this dom binding\n\tbinding.deps++\n\t\n\tif (parsed.selector) {\n\t\tbinding.selectors = binding.selectors.concat(parsed.selector)\n\t}\n\n\taddBehavior(this.behaviours, type, method)\n\n\treturn method\n}\n\nfunction getMethod (name, type, context) {\n\tname = typeof name === 'string'\n\t\t? context[name]\n\t\t: context['on' + type[0].toUpperCase() + type.slice(1)]\n\tif (!name) throw new Error('Can\\'t find a method for '+type)\n\treturn name\n}\n\nfunction emit (context, handlers, data) {\n\tif (!handlers) return \n\tfor (var i = 0, len = handlers.length; i < len; i++) {\n\t\thandlers[i].call(context, data)\n\t}\n}\n\nfunction addBehavior (hash, name, fn) {\n\tif (hash[name]) hash[name] = hash[name].concat(fn)\n\telse hash[name] = [fn]\n}\n\nfunction removeBehaviour (hash, name, fn) {\n\tif (hash[name]) hash[name] = hash[name].filter(function (a) {\n\t\treturn a !== fn\n\t})\n\telse delete hash[name]\n}\n\n/**\n * Remove a single behaviour\n * \n * All the following are equivilent:\n *\n *   events.off('click', 'onClick')\n *   events.off('click') // implies 'onClick'\n *   events.off('click', events.onClick)\n *\n * @param {String} type\n * @param {String} [method]\n */\n\nDomEmitter.prototype.off = function(type, method){\n\tvar parsed = parse(type)\n\t  , name = parsed.name\n\t  , binding = this.__domBindings__[name]\n\n\tif (typeof method !== 'function') {\n\t\tmethod = getMethod(method, name, this.__context__)\n\t}\n\n\tif (--binding.deps <= 0) {\n\t\tdelete this.__domBindings__[name]\n\t\tunbind(this.__view__, name, binding)\n\t} \n\telse if (parsed.selector) {\n\t\tbinding.selectors = binding.selectors.filter(function (s) {\n\t\t\treturn s !== parsed.selector\n\t\t})\n\t}\n\n\tremoveBehaviour(this.behaviours, type, method)\n}\n\n/**\n * Add listener but remove it as soon as its called once\n * @see DomEmitter#on\n */\n\nDomEmitter.prototype.once = function (topic, method) {\n\tvar self = this\n\tthis.on(topic, once)\n\tif (typeof method !== 'function') {\n\t\tmethod = getMethod(method, parse(topic).name, this.__context__)\n\t}\n\tfunction once (e) {\n\t\tmethod.call(this, e)\n\t\tself.off(topic, once)\n\t}\n\treturn once\n}\n\n// Native events tests\nvar isMouse = /^mouse(?:up|down|move|o(?:ver|ut)|enter|leave)|(?:dbl)?click$/\nvar isKey = /^key(up|down|press) +([\\w\\/]+(?: \\w+)?)$/\n\n/**\n * Create a DOM event and send it down to the DomEmitter's target\n *\n *   manager.emit('mousedown', {clientX:50, clientY:50})\n *   manager.emit('login', {user: user})\n * \n * @param {String} event type\n * @param {Any} data to merged with the dom event object\n */\n\nDomEmitter.prototype.emit = function (topic, data) {\n\tif (isMouse.test(topic)) {\n\t\tdata = mouseEvent(topic, data)\n\t} \n\telse if (isKey.test(topic)) {\n\t\ttopic = isKey.exec(topic)\n\t\tdata = keyEvent(topic[1], topic[2], data)\n\t} \n\telse {\n\t\tdata = customEvent(topic, data)\n\t}\n\n\tthis.__view__.dispatchEvent(data)\n}\n\n/**\n * Remove all bound functions\n *\n *   this.clear() // removes all\n *   this.clear('click') // just click handlers\n *\n * @param {String} topic if you want to limit to a certain topic\n */\n\nDomEmitter.prototype.clear = function (topic) {\n\tif (topic != null) return clearTopic(this, topic)\n\tfor (topic in this.behaviours) {\n\t\tclearTopic(this, topic)\n\t}\n}\n\nfunction clearTopic (self, topic) {\n\tvar name = parse(topic).name\n\tvar binding = self.__domBindings__[name]\n\n\tbinding && unbind(self.__view__, binding);\n\n\tdelete self.__domBindings__[name];\n\tdelete self.behaviours[topic];\n}\n\n/**\n * Parse event / selector string.\n *\n * @param {String} string\n * @return {Object}\n * @api private\n */\n\nfunction parse(str) {\n\tstr = str.split(' ')\n\tvar event = str.shift()\n\treturn { name: event, selector: str.join(' ') }\n}\n",
		"/node_modules/classes/index.js": "\n/**\n * Module dependencies.\n */\n\nvar index = require('indexof');\n\n/**\n * Whitespace regexp.\n */\n\nvar re = /\\s+/;\n\n/**\n * toString reference.\n */\n\nvar toString = Object.prototype.toString;\n\n/**\n * Wrap `el` in a `ClassList`.\n *\n * @param {Element} el\n * @return {ClassList}\n * @api public\n */\n\nmodule.exports = function(el){\n  return new ClassList(el);\n};\n\n/**\n * Initialize a new ClassList for `el`.\n *\n * @param {Element} el\n * @api private\n */\n\nfunction ClassList(el) {\n  this.el = el;\n  this.list = el.classList;\n}\n\n/**\n * Add class `name` if not already present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.add = function(name){\n  // classList\n  if (this.list) {\n    this.list.add(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (!~i) arr.push(name);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove class `name` when present, or\n * pass a regular expression to remove\n * any which match.\n *\n * @param {String|RegExp} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.remove = function(name){\n  if ('[object RegExp]' == toString.call(name)) {\n    return this.removeMatching(name);\n  }\n\n  // classList\n  if (this.list) {\n    this.list.remove(name);\n    return this;\n  }\n\n  // fallback\n  var arr = this.array();\n  var i = index(arr, name);\n  if (~i) arr.splice(i, 1);\n  this.el.className = arr.join(' ');\n  return this;\n};\n\n/**\n * Remove all classes matching `re`.\n *\n * @param {RegExp} re\n * @return {ClassList}\n * @api private\n */\n\nClassList.prototype.removeMatching = function(re){\n  var arr = this.array();\n  for (var i = 0; i < arr.length; i++) {\n    if (re.test(arr[i])) {\n      this.remove(arr[i]);\n    }\n  }\n  return this;\n};\n\n/**\n * Toggle class `name`.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.toggle = function(name){\n  // classList\n  if (this.list) {\n    this.list.toggle(name);\n    return this;\n  }\n\n  // fallback\n  if (this.has(name)) {\n    this.remove(name);\n  } else {\n    this.add(name);\n  }\n  return this;\n};\n\n/**\n * Return an array of classes.\n *\n * @return {Array}\n * @api public\n */\n\nClassList.prototype.array = function(){\n  var arr = this.el.className.split(re);\n  if ('' === arr[0]) arr.pop();\n  return arr;\n};\n\n/**\n * Check if class `name` is present.\n *\n * @param {String} name\n * @return {ClassList}\n * @api public\n */\n\nClassList.prototype.has =\nClassList.prototype.contains = function(name){\n  return this.list\n    ? this.list.contains(name)\n    : !! ~index(this.array(), name);\n};\n",
		"/node_modules/domify/index.js": "var slice = require('sliced')\n\nmodule.exports = parse\n\n/**\n * Wrap map from jquery.\n */\n\nvar map = {\n  option: [1, '<select multiple=\"multiple\">', '</select>'],\n  optgroup: [1, '<select multiple=\"multiple\">', '</select>'],\n  legend: [1, '<fieldset>', '</fieldset>'],\n  thead: [1, '<table>', '</table>'],\n  tbody: [1, '<table>', '</table>'],\n  tfoot: [1, '<table>', '</table>'],\n  colgroup: [1, '<table>', '</table>'],\n  caption: [1, '<table>', '</table>'],\n  tr: [2, '<table><tbody>', '</tbody></table>'],\n  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],\n  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],\n  _default: [0, '', '']\n};\n\nvar div = document.createElement('div')\n  , tagregex = /<([\\w:]+)/\n\n/**\n * Parse `html` and return the Element's it generates.\n *\n * @param {String} html\n * @return {Array|Element}\n */\n\nfunction parse(html) {\n  if ('string' != typeof html) throw new TypeError('String expected');\n  \n  // tag name\n  var m = html.match(tagregex)\n  if (!m) return document.createTextNode(html)\n  var tag = m[1];\n  \n  // body support\n  if (tag == 'body') {\n    var el = document.createElement('html');\n    el.innerHTML = html;\n    return el.removeChild(el.lastChild)\n  }\n  \n  // wrap so the browser isn't forced do anything clever\n  var wrap = map[tag] || map._default;\n  var depth = wrap[0];\n  var prefix = wrap[1];\n  var suffix = wrap[2];\n  div.innerHTML = prefix + html + suffix;\n  var el = div\n  while (depth--) el = el.lastChild;\n\n  html = el.childNodes\n  html = html.length > 1 ? slice(html) : html[0];\n  // clear the parent so the new dom elements don't have an incorrect parentElement\n  el.innerHTML = ''\n  return html\n}\n\n/**\n * A version of domify which always returns an Array\n * Its handy in cases where you don't know much about\n * the html you are inputing\n *\n * @param {String} html\n * @return {Array}\n */\n\nparse.all =\nparse.list =\nparse.array = function (html) {\n  html = parse(html)\n  return html instanceof Array ? html : [html]\n}\n",
		"/node_modules/dom-emitter/node_modules/event/index.js": "\n/**\n * Bind `el` event `type` to `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.bind = function(el, type, fn, capture){\n  el.addEventListener(type, fn, capture);\n  return fn;\n}\n\n/**\n * Unbind `el` event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nexports.unbind = function(el, type, fn, capture){\n  el.removeEventListener(type, fn, capture);\n  return fn;\n}\n\n// fallback for older IE\nif (!window.addEventListener) {\n  exports.bind = function (el, type, fn) {\n    el.attachEvent('on' + type, fn);\n    return fn\n  }\n  exports.unbind = function (el, type, fn) {\n    el.detachEvent('on' + type, fn);\n    return fn\n  }\n}\n",
		"/node_modules/dom-emitter/node_modules/delegate/index.js": "var bind = require('event').bind\n  , globalize = require('dom-query').expand\n\n/**\n * Delegate event `type` to `selector` and invoke `fn(e)`.\n * A callback function is returned which may be passed to `.unbind()`.\n *\n * @param {Element} el\n * @param {String} selector\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @return {Function}\n * @api public\n */\n\nfunction delegate (el, selector, type, fn, capture){\n\tselector = globalize(selector, el)\n\treturn bind(el, type, function delegator (e) {\n\t\tif (e.delegate = match(e.target, this, selector)) {\n\t\t\tfn.call(e.delegate, e)\n\t\t}\n\t}, capture)\n}\n\n/**\n * Return the first Element between bottom and top that matches the selector\n *\n * @param {Element} bottom\n * @param {Element} top the context for the search\n * @param {String} selector\n * @return {Element}\n */\n\nfunction match (bottom, top, selector) {\n\tvar nodes = top.querySelectorAll(selector)\n\t  , len = nodes.length\n\n\twhile (bottom !== top) {\n\t\tfor (var i = 0; i < len; i++) {\n\t\t\tif (nodes[i] === bottom) return bottom\n\t\t}\n\t\tbottom = bottom.parentElement\n\t}\n}\n\n/**\n * Unbind event `type`'s callback `fn`.\n *\n * @param {Element} el\n * @param {String} type\n * @param {Function} fn\n * @param {Boolean} capture\n * @api public\n */\n\nexports.unbind = require('event').unbind\nexports.match = match\nexports.bind = delegate\n",
		"/node_modules/classes/node_modules/indexof/index.js": "module.exports = function(arr, obj){\n  for (var i = 0, len = arr.length; i < len; ++i) {\n    if (arr[i] === obj) return i;\n  }\n  return -1;\n}\n",
		"/node_modules/domify/node_modules/sliced/index.js": "module.exports = exports = require('./lib/sliced');\n",
		"/node_modules/dom-emitter/node_modules/dom-event/package.json": "module.exports = require(\"./src/index.js\")",
		"/node_modules/domify/node_modules/sliced/lib/sliced.js": "\n/**\n * An Array.prototype.slice.call(arguments) alternative\n *\n * @param {Object} args something with a length\n * @param {Number} slice\n * @param {Number} sliceEnd\n * @api public\n */\n\nmodule.exports = function (args, slice, sliceEnd) {\n  var ret = [];\n  var len = args.length;\n\n  if (0 === len) return ret;\n\n  var start = slice < 0\n    ? Math.max(0, slice + len)\n    : slice || 0;\n\n  if (sliceEnd !== undefined) {\n    len = sliceEnd < 0\n      ? sliceEnd + len\n      : sliceEnd\n  }\n\n  while (len-- > start) {\n    ret[len - start] = args[len];\n  }\n\n  return ret;\n}\n\n",
		"/node_modules/dom-emitter/node_modules/dom-event/src/index.js": "var code = require('keycode').code\nvar Event = window.Event\n\n/**\n * Create a keyboard event\n *\n *   key('keypress', 'enter')\n *   key('keydown', 'caps lock')\n *   key('keyup', 'k')\n *\n * @param {String} type 'up', 'down', or 'press'\n * @param {String} key the key being pressed\n * @param {Object} o any options such as ctrl etc..\n * @return {KeyboardEvent}\n */\n\nexports.key = function (type, key, o) {\n  o || (o = {})\n  var keycode = code[key]\n  if (keycode === undefined) throw new Error('invalid key: '+key)\n  key = key.length === 1 ? key.charCodeAt(0) : 0\n\n  // Prefer custom events to avoid webkits bug https://bugs.webkit.org/show_bug.cgi?id=16735\n  if (Event) {\n    var e = new Event(type, {\n      bubbles: o.bubbles !== false,\n      cancelable: o.cancelable !== false\n    })\n    e.keyCode = keycode\n    e.charCode = key\n    e.shift = o.shift || false\n    e.meta = o.meta || false\n    e.ctrl = o.ctrl || false\n    e.alt = o.alt || false\n  } else {\n    var e = document.createEvent('KeyboardEvent')\n    // https://developer.mozilla.org/en/DOM/event.initKeyEvent\n    // https://developer.mozilla.org/en/DOM/KeyboardEvent\n    e[e.initKeyEvent ? 'initKeyEvent' : 'initKeyboardEvent'](\n      type,                   // DOMString typeArg\n      o.bubbles !== false,    // boolean canBubbleArg\n      o.cancelable !== false, // boolean cancelableArg\n      window,                 // Specifies UIEvent.view.\n      o.ctrl === true,        // ctrl\n      o.alt === true,         // alt\n      o.shift === true,       // shift\n      o.meta === true,        // meta\n      keycode,                // unsigned long keyCodeArg\n      key                     // unsigned long charCodeArg\n    )\n  }\n  return e\n}\n\n/**\n * Create a native mouse event\n *\n *   mouse('mousemove', {clientX: 50, clientY: 50})\n *   mouse('mousemove') // apply defualts\n * \n * @param {String} type of mouse event\n * @param {Object} [o] options\n * @return {MouseEvent}\n */\n\nexports.mouse = function (type, o) {\n  var e = document.createEvent('MouseEvents')\n  o || (o = {})\n\n  // https://developer.mozilla.org/en/DOM/event.initMouseEvent\n  e.initMouseEvent(\n    type,\n    o.bubbles !== false,                      // canBubble\n    o.cancelable !== false,                   // cancelable\n    window,                                   // 'AbstractView'\n    o.clicks || (type === 'dbclick' ? 2 : 0), // click count\n    o.screenX || 0,                           // screenX\n    o.screenY || 0,                           // screenY\n    o.clientX || 0,                           // clientX\n    o.clientY || 0,                           // clientY\n    o.ctrl === true,                          // ctrl\n    o.alt === true,                           // alt\n    o.shift === true,                         // shift\n    o.meta === true,                          // meta\n    o.button || 0,                            // mouse button defaults to left\n    null                                      // relatedTarget\n  )\n  return e\n}\n\n/**\n * Create a custom event\n *\n *   custom('select', {item: item})\n *   custom('select', {bubbles: false}) // to prevent bubbling\n *   custom('select', {cancelable: false}) // to prevent bubbling\n *\n * @param {String} type can be anthing\n * @param {Object} o custom properties you would like your event to have\n * @return {Event}\n */\n\nexports.custom = function (type, o) {\n  o || (o = {})\n  var e = new Event(type, {\n    bubbles: o.bubbles !== false,\n    cancelable: o.cancelable !== false\n  })\n  for (var prop in o) e[prop] = o[prop]\n  return e\n}\n",
		"/node_modules/dom-emitter/node_modules/delegate/node_modules/dom-query/package.json": "module.exports = require(\"./src/index.js\")",
		"/node_modules/dom-emitter/node_modules/delegate/node_modules/dom-query/src/index.js": "var unique = require('unique-selector')\n\n/**\n * Run a query within a section of the document\n *\n * @param {String} selector\n * @param {Element} context\n * @return {NodeList}\n */\n\nfunction query (selector, context) {\n\tif (context) {\n\t\tselector = unique(context) + ' ' + selector\n\t}\n\treturn document.querySelectorAll(selector)\n}\n\n/**\n * Select all elements within the document which match the selector\n * If you pass a value for `el` the results will be filtered to include\n * only those which are children of the `el`\n *\n * @param {String} selector a CSS selector\n * @param {Element} [context] defaults to document\n * @return {NodeList}\n */\n\nfunction all (selector, context) {\n\treturn (context ||document).querySelectorAll(selector)\n}\n\n/**\n * Covert a local query to one which can be run globally with the same results\n *\n * @param {String} selector\n * @param {Element} context\n * @return {String}\n */\n\nfunction expand (selector, context) {\n\treturn unique(context || document.body) + ' ' + selector\n}\n\nmodule.exports = query\nquery.all = all\nquery.expand = expand",
		"/node_modules/dom-emitter/node_modules/dom-event/node_modules/keycode/index.js": "/**\n * Conenience method returns corresponding value for given keyName or keyCode.\n *\n * @param {Mixed} keyCode {Number} or keyName {String}\n * @return {Mixed}\n * @api public\n */\n\nexports = module.exports = function (search) {\n  if (typeof search === 'string') return codes[search.toLowerCase()]\n  return names[search]\n}\n\n/**\n * Get by name\n *\n *   exports.code['Enter'] // => 13\n */\n\nvar codes = exports.codes = exports.code = {\n  'backspace': 8,\n  'tab': 9,\n  'enter': 13,\n  'shift': 16,\n  'ctrl': 17,\n  'alt': 18,\n  'pause/break': 19,\n  'caps lock': 20,\n  'esc': 27,\n  'space': 32,\n  'page up': 33,\n  'page down': 34,\n  'end': 35,\n  'home': 36,\n  'left': 37,\n  'up': 38,\n  'right': 39,\n  'down': 40,\n  'insert': 45,\n  'delete': 46,\n  'windows': 91,\n  'right click': 93,\n  'numpad *': 106,\n  'numpad +': 107,\n  'numpad -': 109,\n  'numpad .': 110,\n  'numpad /': 111,\n  'num lock': 144,\n  'scroll lock': 145,\n  'my computer': 182,\n  'my calculator': 183,\n  ';': 186,\n  '=': 187,\n  ',': 188,\n  '-': 189,\n  '.': 190,\n  '/': 191,\n  '`': 192,\n  '[': 219,\n  '\\\\': 220,\n  ']': 221,\n  \"'\": 222\n}\n\n/*!\n * Programatically add the following\n */\nfor (var i = 48; i < 58; i++) codes[i - 48] = i\n// '0': 48,\n// '1': 49,\n// '2': 50,\n// '3': 51,\n// '4': 52,\n// '5': 53,\n// '6': 54,\n// '7': 55,\n// '8': 56,\n// '9': 57,\n\nfor (i = 97; i < 123; i++) codes[String.fromCharCode(i)] = i - 32\n// 'a': 65,\n// 'b': 66,\n// 'c': 67,\n// 'd': 68,\n// 'e': 69,\n// 'f': 70,\n// 'g': 71,\n// 'h': 72,\n// 'i': 73,\n// 'j': 74,\n// 'k': 75,\n// 'l': 76,\n// 'm': 77,\n// 'n': 78,\n// 'o': 79,\n// 'p': 80,\n// 'q': 81,\n// 'r': 82,\n// 's': 83,\n// 't': 84,\n// 'u': 85,\n// 'v': 86,\n// 'w': 87,\n// 'x': 88,\n// 'y': 89,\n// 'z': 90,\n\nfor (i = 1; i < 13; i++) codes['f'+i] = i + 111\n// 'f1': 112,\n// 'f2': 113,\n// 'f3': 114,\n// 'f4': 115,\n// 'f5': 116,\n// 'f6': 117,\n// 'f7': 118,\n// 'f8': 119,\n// 'f9': 120,\n// 'f10': 121,\n// 'f11': 122,\n// 'f12': 123,\n\nfor (i = 0; i < 10; i++) codes['numpad '+i] = i + 96\n// 'numpad 0': 96,\n// 'numpad 1': 97,\n// 'numpad 2': 98,\n// 'numpad 3': 99,\n// 'numpad 4': 100,\n// 'numpad 5': 101,\n// 'numpad 6': 102,\n// 'numpad 7': 103,\n// 'numpad 8': 104,\n// 'numpad 9': 105,\n\n/**\n * Get by code\n *\n *   exports.name[13] // => 'Enter'\n */\n\nvar names = exports.title = exports.titles = exports.names = {}\n\n// Create reverse mapping\nfor (i in codes) names[codes[i]] = i\n",
		"/node_modules/dom-emitter/node_modules/delegate/node_modules/dom-query/node_modules/unique-selector/index.js": "/**\n * Expose `unique`\n */\n\nmodule.exports = unique;\n\n/**\n * Generate unique CSS selector for given DOM element\n *\n * @param {Element} el\n * @return {String}\n * @api private\n */\n\nfunction unique(el) {\n  if (!el || !el.tagName) {\n    throw new TypeError('Element expected');\n  }\n\n  var selector  = selectors(el).join(' > ');\n  var matches   = document.querySelectorAll(selector);\n\n  // If selector is not unique enough (wow!), then\n  // force the `nth-child` pseido selector\n  if (matches.length > 1) {\n    for (var i = 0; i < matches.length; i++) {\n      if (el === matches[i]) {\n        selector += ':nth-child(' + (i + 1) +')';\n        break;\n      }\n    }\n  }\n\n  return selector;\n};\n\n/**\n * CSS selectors to generate unique selector for DOM element\n *\n * @param {Element} el\n * @return {Array}\n * @api prviate\n */\n\nfunction selectors(el) {\n  var parts = [];\n  var label = null;\n  var title = null;\n  var alt   = null;\n\n  do {\n    // IDs are unique enough\n    if (el.id) {\n      label = '#' + el.id;\n    } else {\n      // Otherwise, use tag name\n      label     = el.tagName.toLowerCase();\n      var className = el.getAttribute('class');\n\n      // Tag names could use classes for specificity\n      if (className && className.length) {\n        label += '.' + className.split(' ').join('.');\n      }\n    }\n\n    // Titles & Alt attributes are very useful for specificity and tracking\n    if (title = el.getAttribute('title')) {\n      label += '[title=\"' + title + '\"]';\n    } else if (alt = el.getAttribute('alt')) {\n      label += '[alt=\"' + alt + '\"]';\n    }\n\n    parts.unshift(label);\n  } while (!el.id && (el = el.parentNode) && el.tagName);\n\n  // Some selectors should have matched at least\n  if (!parts.length) {\n    throw new Error('Failed to identify CSS selector');\n  }\n\n  return parts;\n}\n"
	}
	return require("/example/todo.js")
})