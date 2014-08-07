#!/bin/sh
set -e

echo "Running java unit tests"
java -classpath 'target/classes:target/testclasses' QQWingTest
