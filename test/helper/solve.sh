#!/bin/sh

set -e
set -o pipefail

puzzle="$1"
solution="$2"

output=`echo "$puzzle" | $QQWING --solve --one-line`

if [ "$solution" != "$output" ]
then
    echo "Solving:  $puzzle"
    echo "Expected: $solution"
    echo "Actual:   $output"
    exit 1
fi
 