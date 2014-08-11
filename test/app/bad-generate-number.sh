#!/bin/sh

set -e
set -o pipefail

expected="Bad number of puzzles to generate: foo"
actual=`$QQWING --generate foo | head -n 1 || true`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
