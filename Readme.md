# presenter 

(work in progress)

A controller-ish class. Helps glue model to interface.

## Getting Started

_With component_  

	$ component install jkroso/presenter

_With npm_  

	$ npm install jkroso/presenter --save

then in your app:

```javascript
var presenter = require('presenter')
```

## API

  - [Presenter()](#presenter)
  - [Presenter.appendChild()](#presenterappendchildchildpresenter)
  - [Presenter.prependChild()](#presenterprependchildchildpresenter)
  - [Presenter.insertBefore()](#presenterinsertbeforesibpresenter)
  - [Presenter.insertAfter()](#presenterinsertaftersibpresenter)
  - [Presenter.siblings()](#presentersiblingsincboolean)
  - [Presenter.children()](#presenterchildren)
  - [Presenter.remove()](#presenterremove)

### Presenter()

  Presenter constructor. 
  If you pass a String as `view` it will be converted to 
  a DOM element. If you pass a function it will be called 
  with `model.toJSON()` to produce a string which gets 
  converted to a DOM element.

### Presenter.appendChild(child:Presenter)

  Insert `child` as the `firstChild` of `this`

### Presenter.prependChild(child:Presenter)

  Insert `child` as the `lastChild` of `this`

### Presenter.insertBefore(sib:Presenter)

  Insert `this` as the `prevSibling` of `sib`

### Presenter.insertAfter(sib:Presenter)

  Insert `this` as the `nextSibling` of `sib`

### Presenter.siblings(inc:Boolean)

  Get a list of siblings in DOM order

### Presenter.children()

  Get a list of `this` presenters children

### Presenter.remove()

  Remove a view from the DOM

## Stability

Experimental: Expect the unexpected. Please provide feedback on api and your use-case.

## Running the tests

```bash
$ npm install
$ make
```
Then open your browser to the `./test` directory.

_Note: these commands don't work on windows._ 

## License 

[MIT](License)
