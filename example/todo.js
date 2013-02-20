var Presenter = require('../src')
  , items = require('./data')

// Todo item container
var list = new Presenter('<div id="list"></div>', items)

// Item class
function Item (model) {
  Presenter.call(this, '<div class="item"></div>')
  this.view.innerHTML = model.title
  this.model = model
  this.events.on('click')
}

Item.prototype.onClick = function (e) {
  this.classList.toggle('done')
  this.model.done = !this.model.done
}

// insert items
items.forEach(function (model) {
  list.appendChild(new Item(model))
})

document.body.appendChild(list.view)
