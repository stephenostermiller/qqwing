#!/bin/sh

set -e
set -o pipefail

expected="Please specify a symmetry."
actual=`$QQWING --symmetry || true`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
