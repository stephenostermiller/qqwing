#!/bin/sh

set -e
set -o pipefail

test="$1"
puzzle="$2"
expected="$3"

actual=`echo "$puzzle" | $QQWING --solve --one-line`

if [ "$expected" != "$actual" ]
then
    echo
    echo "Test: $test"
    echo "qqwing: $QQWING"
    echo "Solving:  $puzzle"
    echo "Expected: $expected"
    echo "Actual:   $actual"
    exit 1
fi
 