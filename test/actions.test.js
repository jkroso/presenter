
var chai = require('chai')
  , should = chai.should()
  , happen = require('happen/src/happen.js')
  , spies = require('chai-spies')
	, presenter = require('../src')
	, Presenter = presenter.Base
	, action = require('action')

chai.use(spies)

describe('actions', function () {
	var spy
	beforeEach(function () {
		spy = chai.spy()
	})

	// helper function
	function runKeyDown(instance){
		document.body.appendChild(instance.view)
		instance.view.focus()
		happen.keydown(instance.view)
		spy.should.have.been.called.once
		document.body.removeChild(instance.view)
	}

	describe('applied to instances', function () {
		var car
		beforeEach(function () {
			car = new Presenter('<div tabIndex="1" class="car"></div>')
		})

		describe('with plain functions', function () {
			it('with the hook defined in the functions name', function () {					
				car.action(function keydown(e){
					this.dispatch('down')
				}).on('down', spy)

				runKeyDown(car)
			})

			it('with the hook defined with a string', function () {					
				car.action('keydown', function(e){
					this.dispatch('down')
				}).on('down', spy)

				runKeyDown(car)
			})
		})
		
		describe('with predefined actions', function () {
			it('should work with hooks defined on the action', function () {
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)
				dispatch.hooks = ['keydown']

				car.action(dispatch)
				runKeyDown(car)
			})

			it('should work with hooks defined at bind time', function () {
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)

				car.action('keydown', dispatch)
				runKeyDown(car)
			})
		})
	})
	
	describe('applied to classes', function () {
		var Car, car
		beforeEach(function () {
			Car = presenter('<div tabIndex="1" class="car"></div>')
		})
		afterEach(function () {
		})
		describe('with plain functions', function () {
			it('with the hook defined in the functions name', function () {					
				Car.action(function keydown(e){
					this.dispatch('down')
				}).on('down', spy)

				runKeyDown(new Car)
			})

			it('with the hook defined with a string', function () {					
				Car.action('keydown', function(e){
					this.dispatch('down')
				}).on('down', spy)

				runKeyDown(new Car)
			})
		})
		
		describe('with predefined actions', function () {
			it('should work with hooks defined on the action', function () {
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)
				dispatch.hooks = ['keydown']

				Car.action(dispatch)
				runKeyDown(new Car)
			})

			it('should work with hooks defined at bind time', function () {
				var dispatch = action(function(e){
					this.dispatch('down')
				}).on('down', spy)

				Car.action('keydown', dispatch)
				runKeyDown(new Car)
			})
		})
	})
})