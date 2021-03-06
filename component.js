
module.exports = function(fn){
	function component(View){
		var graph = View.prototype.init
		if (fn) {
			graph.addNode(fn)
			component.deps.forEach(function(dep){
				graph.addNode(dep)
				graph.addRelationship(fn, dep)
			})
		}
		component.events.forEach(function(event, i){
			View.prototype.on(event, component.fns[i])
		})
		return View
	}

	component.init = fn
	component.events = []
	component.fns = []
	component.deps = []
	component.need = addDep
	component.on = addListener

	return component
}

function addDep(dep){
	if (dep.init) this.deps.push(dep.init)
	this.deps = this.deps.concat(dep.deps)
	return this
}

function addListener(type, fn){
	this.events.push(type)
	this.fns.push(fn)
	return this
}