EXPORT=Presenter
GRAPH = node_modules/.bin/sourcegraph.js src/index.js -p javascript,nodeish
BIGFILE = node_modules/.bin/bigfile -p nodeish -x $(EXPORT)
REPORTER=spec

all: test/built.js Readme.md

dist/%.js:
	@mkdir -p dist
	@$(GRAPH) | $(BIGFILE) > $@

clean:
	@rm -rf dist
	@rm -rf tests/built.js

test/built.js: src/* test/*
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile.js \
		 	--export null \
		 	--plugins nodeish,javascript > $@

Readme.md: src/* docs/*
	@cat docs/head.md > $@
	@cat src/index.js \
	 | sed s/.*=.$$// \
	 | dox -a >> $@
	@cat docs/tail.md >> $@

.PHONY: all test clean browser
