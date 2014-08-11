#!/bin/sh

set -e
set -o pipefail

expected="Please specify a difficulty."
actual=`$QQWING --difficulty || true`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
