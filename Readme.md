# presenter

A controller-ish class. Helps glue model to interface. Currently in the very early stages of conception.

## Getting Started

_With component_  

	$ component install jkroso/presenter

_With npm_  

	$ npm install jkroso/presenter --save

## API

```javascript
var Presenter = require('presenter')
```
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

## Running the tests

Before you can run any tests you will need to execute `$ npm install`

Running the test in node is just a matter of executing `$ make test`

Running in the browser though requires a build. To do that execute `$ make test/built.js`. If all goes well you should then be able to open your browser to the test directory and watch the test suite run.

_Note: these commands don't work on windows._ 

## Release History
_(Nothing yet)_

## License
Copyright (c) 2012 Jakeb Rosoman

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
