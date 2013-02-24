EXPORT=presenter
GRAPH = node_modules/.bin/sourcegraph.js src/index.js --plugins=javascript
BIGFILE = node_modules/.bin/bigfile --export $(EXPORT)
REPORTER=spec

all: test/built.js Readme.md

browser: clean dist dist/presenter.min.js.gz presenter.js
	@du -bah dist/*

dist:
	@mkdir -p dist

dist/%.min.js.gz: dist/Laissez-faire.min.js
	@gzip --best -c dist/Laissez-faire.min.js > $@

dist/%.min.js: dist
	@$(GRAPH) | $(BIGFILE) --production > $@

dist/%.js: dist
	@$(GRAPH) | $(BIGFILE) > $@

clean:
	@rm -rf dist
	@rm -rf tests/built.js

test/built.js: src/* test/*
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile \
		 	--export null \
		 	--plugins nodeish > $@

example/built.js: example/* src/*
	@node_modules/.bin/sourcegraph.js example/todo.js \
		--plugins nodeish,javascript \
		| node_modules/.bin/bigfile \
		 	--export null \
		 	--plugins nodeish > $@

Readme.md: src/* docs/*
	@cat docs/head.md > $@
	@cat src/index.js \
	 | sed s/.*=.$$// \
	 | dox -a >> $@
	@cat docs/tail.md >> $@

.PHONY: all test clean browser
