#!/bin/sh

set -e
set -o pipefail

test="$1"
options="$2"

puzzle=`$QQWING --generate --one-line $options`

if ! echo "$puzzle" | grep -qE '^[0-9\.]{81}$'
then
	echo
	echo "Generated puzzle is not 81 number and dots"
	echo "qqwing: $QQWING"
	echo "test: $test"
	echo "Puzzle: $puzzle"
	exit 1
fi

if [ `echo "$puzzle" | wc -l` != 1 ]
then
	echo
	echo "Expected one line of output"
	echo "qqwing: $QQWING"
	echo "test: $test"
	echo "Puzzle: $puzzle"
	exit 1
fi

if ! echo "$puzzle" | sed 's/\.//g' |  grep -qE '^[0-9]{15}'
then
	echo
	echo "Generated puzzle does not have at least 15 givens"
	echo "qqwing: $QQWING"
	echo "test: $test"
	echo "Puzzle: $puzzle"
	exit 1
fi

if ! echo "$puzzle" | sed -r 's/[0-9]//g' |  grep -qE '^\.{30}'
then
	echo
	echo "Generated puzzle does not have at least 30 unknowns"
	echo "qqwing: $QQWING"
	echo "test: $test"
	echo "Puzzle: $puzzle"
	exit 1
fi

solution=`echo "$puzzle" | $QQWING --solve --one-line`

if ! echo "$solution" | grep -q "$puzzle"
then
	echo
	echo "Solution does not appear to be correct for puzzle"
	echo "qqwing:   $QQWING"
	echo "test: $test"
	echo "Solving:  $puzzle"
	echo "Solution: $solution"
	exit 1
fi

