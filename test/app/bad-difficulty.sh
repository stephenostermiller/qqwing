#!/bin/sh

set -e
set -o pipefail

expected="Difficulty expected to be simple, easy, intermediate, expert, or any, not foo"
actual=`$QQWING --difficulty foo || true`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
