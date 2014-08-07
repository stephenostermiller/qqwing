#!/bin/sh

set -e
set -o pipefail

expected=`build/version.sh`
expected="qqwing $expected"
actual=`$QQWING --version`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi

