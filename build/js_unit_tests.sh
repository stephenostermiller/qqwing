#!/bin/sh
set -e

version=`build/version.sh`

echo "Running js unit tests"
node target/js/qqwing-test-$version.js
