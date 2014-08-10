#!/bin/sh

set -e
set -o pipefail

expected="Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not foo"
actual=`$QQWING --symmetry foo || true`

if [ "$expected" != "$actual" ]
then
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	echo "Expected: $expected"
	echo "Actual:   $actual"
	exit 1
fi
