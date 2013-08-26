
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
		spy.should.have.been.called.once
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
			Car.action('keydown', function(e){
				this.dispatch('down')
			}).on('down', spy)

			runKeyDown(new Car)
		})

		describe('with predefined actions', function(){
			it('should work with hooks defined at bind time', function(){
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)

				Car.action('keydown', dispatch)
				runKeyDown(new Car)
			})

			it('should copy all attributes of the action when instantiated', function(){
				var dispatch = action()
				dispatch.myattr = {}
				dispatch.myfn = function(){}
				Car.action('keydown', dispatch)
				var car = new Car
				var copy = car.actions.keydown.out[0].action
				copy.should.deep.equal(dispatch)
				// same identity for functions
				copy.myfn.should.equal(dispatch.myfn)
				// different identity same value for objects
				copy.myattr.should.not.equal(dispatch.myattr)
			})

			it('should maintain identity across actions', function(){
				var dispatch = action()
				Car.action('keydown', dispatch)
				Car.action('keyup', dispatch)
				var car = new Car
				car.actions.keydown.out[0].action
					.should.equal(car.actions.keyup.out[0].action)
			})
		})

		describe('with non-standard input pins', function(){
			it('should work', function(){
				var key = action({
					keydown: spy
				})
				Car.action('keydown=>keydown', key)
				runKeyDown(new Car)
			})
		})
	})
})