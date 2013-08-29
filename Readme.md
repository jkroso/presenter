# presenter

Create MVC style Views and View classes. This is a _highly_ experimental project aiming to find a nice composable style of defining interface components. Major influencers are the component entity systems which are becoming popular in game development. Though it also aims to allow inheritance. In presenter, components play the role of mixins though you can also think of them as providing a form a multiple inheritance.

## Installation

_With [component](//github.com/component/component), [packin](//github.com/jkroso/packin) or [npm](//github.com/isaacs/npm)_  

	$ {package mananger} install jkroso/presenter

then in your app:

```javascript
var view = require('presenter')
```

## API

### view(template, fn)

  Create a new View class. if `template` is a function it
  will be passed `model` and can return either an Element
  or an HTML string.

```js
var P = view('<p>{body}</p>')
new P({ body: 'some text' }).el
// <p>some text</p>
```

## Stability

Experimental: Expect the unexpected. Please provide feedback on api and your use-case.

## Running the tests

Just run `make` and navigate to the test directory