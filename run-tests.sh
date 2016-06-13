#!/bin/sh
# A simple shell script to control how jshint/istanbul/mocha are run,
# without going as far as introducing gulp.
JSHINT=./node_modules/jshint/bin/jshint
ISTANBUL=./node_modules/.bin/istanbul
MOCHA=./node_modules/mocha/bin/_mocha
TESTS=./test/*.test.js

# Optionally stage the test-results.xml file
# to the directory where CircleCI will see it.
if [ -z ${CIRCLE_TEST_REPORTS} ]; then
  TEST_RESULTS_LOC=./test-results.xml ;
else
  TEST_RESULTS_LOC=$CIRCLE_TEST_REPORTS/test-results.xml ;
fi

echo Sending JUnit XML test report to
echo $TEST_RESULTS_LOC

$JSHINT --verbose lib/*.js && $ISTANBUL cover $MOCHA -- $TESTS \
   --reporter mocha-junit-reporter \
   --reporter-options mochaFile=$TEST_RESULTS_LOC

