test:
	./node_modules/mocha/bin/mocha test/*.test.js
fasttest:
	./node_modules/mocha/bin/mocha test/*.test.js -ig "(slow)"

cover:
	node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- test/*.test.js

lint:
	./node_modules/jshint/bin/jshint lib/*.js

check: test lint cover

.PHONY: all test fasttest lint cover check
