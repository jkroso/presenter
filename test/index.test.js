
var should = require('chai').should()
  , Presenter = require('../src')
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
    p.appendChild(a)
    p.appendChild(b)
  })
  describe('.appendChild(child)', function () {
    it('should insert as `lastChild` of `this`', function () {
      var child = new Presenter('<a></a>')
      p.appendChild(child)
      p.should.have.property('firstChild', a)
      p.should.have.property('lastChild', child)
      child.should.have.property('parent', p)
      p.view.lastChild.should.equal(child.view)
      child.prevSibling.should.equal(b)
    })

    it('should obey `this` presenters `childViewContainer`', function () {
      var child = new Presenter('<a></a>')
      var p = new Presenter('<a><h1></h1></a>')
      p.childViewContainer = p.view.querySelector('h1')
      p.appendChild(child)
      p.childViewContainer.lastChild.should.equal(child.view)
    })
  })

  describe('.prependChild(child)', function () {
    it('should insert as `firstChild` of `this`', function () {
      var child = new Presenter('<a></a>')
      p.prependChild(child)
      p.should.have.property('firstChild', child)
      p.should.have.property('lastChild', b)
      child.should.have.property('parent', p)
      p.view.firstChild.should.equal(child.view)
      child.should.have.property('nextSibling', a)
    })

    it('should obey `this` presenters `childViewContainer`', function () {
      var child = new Presenter('<a></a>')
      var p = new Presenter('<a><h1></h1></a>')
      p.childViewContainer = p.view.querySelector('h1')
      p.appendChild(child)
      p.childViewContainer.lastChild.should.equal(child.view)
    })
  })

  runInsert('Before')
  runInsert('After')

  function runInsert (which) {
    describe('.insert'+which+'(sib)', function () {
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
    p.appendChild(a)
    p.appendChild(b)
    p.appendChild(c)
    p.children().should.deep.equal([a,b,c])
  })
})

describe('.siblings', function () {
  var a,b,c
  beforeEach(function () {
    a = new Presenter('<a></a>')
    b = new Presenter('<b></b>')
    c = new Presenter('<c></c>')
    p.appendChild(a)
    p.appendChild(b)
    p.appendChild(c)
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
    p.appendChild(a)
    a.appendChild(b)
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
