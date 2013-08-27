
var happen = require('happen/src/happen')
var action = require('action')
var chai = require('./chai')
var view = require('..')
var View = view.View

describe('actions', function(){
	var spy
	beforeEach(function(){
		spy = chai.spy()
	})

	// helper function
	function runKeyDown(instance){
		document.body.appendChild(instance.el)
		instance.el.focus()
		happen.keydown(instance.el)
		spy.should.have.been.called(1)
		document.body.removeChild(instance.el)
	}

	describe('applied to instances', function(){
		var car
		beforeEach(function(){
			car = new View('<div tabIndex="1" class="car"></div>')
		})

		it('with plain functions', function(){
			car.action('keydown', function(e){
				this.dispatch('down')
			}).on('down', spy)

			runKeyDown(car)
		})

		describe('with predefined actions', function(){
			it('should work with hooks defined at bind time', function(){
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)

				car.action('keydown', dispatch)
				runKeyDown(car)
			})
		})

		describe('with non-standard input pins', function(){
			it('should work', function(){
				var key = action({
					keydown: spy
				})
				car.action('keydown=>keydown', key)
				runKeyDown(car)
			})
		})
	})

	describe('applied to classes', function(){
		var Car, car
		beforeEach(function(){
			Car = view('<div tabIndex="1" class="car"></div>')
		})

		it('with plain functions', function(){
			Car.prototype.action('keydown', function(e){
				this.dispatch('down')
			}).on('down', spy)

			runKeyDown(new Car)
		})

		describe('with predefined actions', function(){
			it('should work with hooks defined at bind time', function(){
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)

				Car.prototype.action('keydown', dispatch)
				runKeyDown(new Car)
			})

			it('should copy all attributes of the action when instantiated', function(){
				var dispatch = action({
					myattr: {},
					stdin: chai.spy(function(){
						this.should.not.equal(dispatch)
						this.should.deep.equal(dispatch)
						this.stdin.should.equal(dispatch.stdin)
						this.myattr.should.not.equal(dispatch.myattr)
					})
				})
				Car.prototype.action('keydown', dispatch)
				happen.keydown(new Car().el)
				dispatch.stdin.should.have.been.called(1)
			})

			it('should maintain identity across actions', function(){
				var first
				var dispatch = action({
					stdin: chai.spy(function(){
						this.should.not.equal(dispatch)
						if (first) this.should.equal(first)
						else first = this
					})
				})
				Car.prototype.action('keydown', dispatch)
				Car.prototype.action('keyup', dispatch)
				var car = new Car
				happen.keydown(car.el)
				happen.keyup(car.el)
				dispatch.stdin.should.have.been.called(2)
			})
		})

		describe('with custom input pins', function(){
			it('should work', function(){
				Car.prototype.action('keydown=>keydown', action({
					keydown: spy
				}))
				runKeyDown(new Car)
			})
		})
	})
})