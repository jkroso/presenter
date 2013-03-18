EXPORT=presenter
GRAPH = node_modules/.bin/sourcegraph.js src/index.js -p javascript,nodeish
BIGFILE = node_modules/.bin/bigfile.js -p nodeish,javascript -x $(EXPORT)
REPORTER=spec

all: test/built.js browser

browser: dist/presenter.js

dist/%.js: src/*
	@mkdir -p dist
	@$(GRAPH) | $(BIGFILE) > $@

clean:
	@rm -rf dist
	@rm -rf tests/built.js

test/built.js: src/* test/*
	@node_modules/.bin/sourcegraph.js test/browser.js \
		-p mocha,nodeish,javascript \
		| node_modules/.bin/bigfile.js \
			-x null \
			-p nodeish,javascript > $@

.PHONY: all clean
