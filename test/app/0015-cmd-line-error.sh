#!/bin/sh

set -e
set -o pipefail

actual=`$QQWING --xyzzy | head -n 1 || true`

expected="Unknown argument: '--xyzzy'"

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
