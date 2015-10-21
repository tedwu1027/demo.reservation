source := $(shell find src -name '*.js')

.PHONY: test browser clean

public/bundle.js: node_modules $(source)
	npm run build

node_modules: package.json
	npm install
	touch node_modules

test:
	npm test

browser:
	npm run browser

clean:
	rm bundle.js
