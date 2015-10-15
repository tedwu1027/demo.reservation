source := $(shell find src -name '*.js')

.PHONY: seed test clean

bundle.js: $(source)
	npm run build

seed:
	node bin/seed.js

test:
	npm test

clean:
	rm bundle.js
