#!/bin/sh

set -e
set -o pipefail

puzzle=`$QQWING --generate --one-line`

if ! echo "$puzzle" | grep -qE '^[0-9\.]{81}$'
then
    echo
    echo "Generated puzzle is not 81 number and dots"
    echo "Puzzle: $puzzle" 
fi

if ! echo "$puzzle" | sed 's/\.//g' |  grep -qE '^[0-9]{15}'
then
    echo
    echo "Generated puzzle does not have at least 15 givens"
    echo "Puzzle: $puzzle" 
fi

if ! echo "$puzzle" | sed -r 's/[0-9]//g' |  grep -qE '^\.{40}'
then
    echo
    echo "Generated puzzle does not have at least 40 unknows"
    echo "Puzzle: $puzzle" 
fi