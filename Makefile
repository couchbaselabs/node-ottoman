test:
	./node_modules/mocha/bin/mocha test/*.test.js
fasttest:
	./node_modules/mocha/bin/mocha test/*.test.js -ig "(slow)"

lint:
	./node_modules/jshint/bin/jshint --verbose lib/*.js

cover:
	node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- test/*.test.js
fastcover:
	node ./node_modules/istanbul/lib/cli.js cover ./node_modules/mocha/bin/_mocha -- test/*.test.js -ig "(slow)"

check: lint cover

apidocs: node_modules
	node ./node_modules/jsdoc/jsdoc.js -c .jsdoc

.PHONY: test fasttest lint cover fastcover check apidocs
