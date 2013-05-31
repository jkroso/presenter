
var chai = require('./chai')
  , presenter = require('..')
  , Presenter = presenter.Base
  , DomEmitter = require('dom-emitter')

var p
beforeEach(function () {
	p = new Presenter('<div></div>')
})

describe('new Presenter', function () {
	it('should convert a view string to DOM', function () {
		p.view.should.be.an.instanceOf(Node)
		p.view.tagName.should.equal('DIV')
	})

	it('should have an event emitter', function () {
		p.should.have.property('events')
			.and.be.an.instanceOf(DomEmitter)
	})

	it('should have a classList', function () {
		p.should.have.property('classList')
		p.classList.add.should.be.a('function')
	})  
})

describe('insertion', function () {
	var a, b
	beforeEach(function () {
		a = new Presenter('<a></a>')
		b = new Presenter('<b></b>')
		p.children.append(a)
		p.children.append(b)
	})

	describe('.children.append(<presenter>)', function () {
		it('should insert as `lastChild` of `this`', function () {
			var child = new Presenter('<a></a>')
			p.children.append(child)
			p.children.should.have.property('first', a)
			p.children.should.have.property('last', child)
			child.should.have.property('parent', p)
			p.view.lastChild.should.equal(child.view)
			child.prevSibling.should.equal(b)
		})

		it('should insert within `children.el`', function () {
			var child = new Presenter('<a></a>')
			var p = new Presenter('<a><h1></h1></a>')
			p.children.el = p.view.querySelector('h1')
			p.children.append(child)
			p.children.el.lastChild.should.equal(child.view)
		})
	})

	describe('.children.prepend(<presenter>)', function () {
		it('should insert as `firstChild` of `this`', function () {
			var child = new Presenter('<a></a>')
			p.children.prepend(child)
			p.children.should.have.property('first', child)
			p.children.should.have.property('last', b)
			child.should.have.property('parent', p)
			p.view.firstChild.should.equal(child.view)
			child.should.have.property('nextSibling', a)
		})

		it('should insert within `children.el`', function () {
			var child = new Presenter('<a></a>')
			var p = new Presenter('<a><h1></h1></a>')
			p.children.el = p.view.querySelector('h1')
			p.children.prepend(child)
			p.children.el.lastChild.should.equal(child.view)
		})
	})

	runInsert('Before')
	runInsert('After')

	function runInsert (which) {
		describe('.insert'+which+'(<presenter>)', function () {
			var child
			beforeEach(function () {
				child = new Presenter('<i></i>')
				if (which === 'Before') {
					child.insertBefore(b)
				} else {
					child.insertAfter(a)
				}
			})
			
			it('should insert as a sibling of `sib`', function () {
				child.should.have.property('prevSibling', a)
				child.should.have.property('nextSibling', b)
				b.should.have.property('prevSibling', child)
				a.should.have.property('nextSibling', child)
				child.should.have.property('parent', p)
			})

			it('should insert the Presenters `view` into the DOM', function () {
				p.view.children[0].should.equal(a.view)
				p.view.children[1].should.equal(child.view)
				p.view.children[2].should.equal(b.view)
			})
		})
	}
})

describe('.children', function () {
	it('should return a list of children', function () {
		var a = new Presenter('<a></a>')
		var b = new Presenter('<b></b>')
		var c = new Presenter('<c></c>')
		p.children.append(a)
		p.children.append(b)
		p.children.append(c)
		p.children.toArray().should.deep.equal([a,b,c])
	})
})

describe('.siblings', function () {
	var a,b,c
	beforeEach(function () {
		a = new Presenter('<a></a>')
		b = new Presenter('<b></b>')
		c = new Presenter('<c></c>')
		p.children.append(a)
		p.children.append(b)
		p.children.append(c)
	})
	it('should return a list of `this` presenters siblings', function () {
		b.siblings().should.deep.equal([a,c])
	})
	
	describe('.siblings(true)', function () {
		it('should include `this`', function () {
			b.siblings(true).should.deep.equal([a,b,c])
		})
	})
})

describe('.remove', function () {
	var a,b
	beforeEach(function () {
		a = new Presenter('<a></a>')
		b = new Presenter('<b></b>')
		p.children.append(a)
		a.children.append(b)
		document.body.appendChild(p.view)
	})

	it('should take the presenters view out of the DOM', function () {
		p.remove()
		should.not.exist(p.view.parentNode)
	})

	// TODO: is this necessary?
	it.skip('should unbind all its event listeners', function () {
		var c = 0
		p.events.on('click', function () {
			if (c++) throw new Error('should not be called')
		})
		p.events.emit('click')
		p.remove()
		p.events.emit('click')
		c.should.equal(1)
	})

	// TODO: is this necessary?
	it.skip('should clear the event listeners of all children', function () {
		var c = 0
		function inc() { 
			c++ 
		}
		a.events.on('click', inc)
		b.events.on('click', inc)
		p.events.on('click', inc)

		b.events.emit('click')
		p.remove()
		b.events.emit('click')

		c.should.equal(3)
	})
})

describe('navigation', function () {
	var a1,a2,b1,b2
	beforeEach(function () {
		a1 = new Presenter('<a class="a"></a>')
		a2 = new Presenter('<a class="a"></a>')
		b1 = new Presenter('<b class="b"></b>')
		b2 = new Presenter('<b class="b"></b>')
		p.kids.append(a1)
		p.kids.append(a2)
		a1.kids.append(b1)
		a2.kids.append(b2)
	})
	
	describe('.up(<string>)', function () {
		it('should select by class', function () {
			b1.up('.a').should.equal(a1)
			b2.up('.a').should.equal(a2)
		})

		it('should select by tag', function () {
			b1.up('a').should.equal(a1)
			b2.up('a').should.equal(a2)
		})
	})

	describe('.down(<string>)', function () {
		it('should select by class', function () {
			a1.down('.b').should.equal(b1)
			a2.down('.b').should.equal(b2)
			p.down('.a').should.equal(a1)
			p.down('.b').should.equal(b1)
		})

		it('should select by tag', function () {
			a1.down('b').should.equal(b1)
			a2.down('b').should.equal(b2)
			p.down('a').should.equal(a1)
			p.down('b').should.equal(b1)
		})
	})

	describe('.downLast(<string>)', function () {
		it('should select the last matching child', function () {
			p.downLast('b').should.equal(b2)
			p.downLast('a').should.equal(a2)
		})
	})
})
