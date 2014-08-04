#!/bin/sh

set -e
set -o pipefail

test="$1"
puzzle="$2"
solution="$3"

output=`echo "$puzzle" | $QQWING --solve --one-line`

if [ "$solution" != "$output" ]
then
    echo
    echo "Test: $test"
    echo "qqwing: $QQWING"
    echo "Solving:  $puzzle"
    echo "Expected: $solution"
    echo "Actual:   $output"
    exit 1
fi
 