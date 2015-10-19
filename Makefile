source := $(shell find src -name '*.js')

.PHONY: test browser clean

bundle.js: $(source)
	npm run build

test:
	npm test

browser:
	npm run browser

clean:
	rm bundle.js
