GRAPH=node_modules/.bin/sourcegraph.js -p nodeish,mocha
COMPILE=node_modules/.bin/_bigfile -p nodeish
REPORTER=dot

all: test/built.js
	open test/index.html

examples/presenter.js: src/* index.js
	@$(GRAPH) index.js | $(COMPILE) -x require > $@

clean:
	@rm -f test/built.js

test/built.js: index.js src/* test/*
	@$(GRAPH) test/browser.js | $(COMPILE) -x null > $@

.PHONY: all test clean
