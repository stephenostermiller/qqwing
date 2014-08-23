#!/bin/sh
# qqwing - Sudoku solver and generator
# Copyright (C) 2014 Stephen Ostermiller
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

set -e
set -o pipefail

test="$1"
options="$2"
puzzle="$3"

if [ "z$puzzle" == "z" ]
then
	puzzle=`$QQWING --generate --one-line $options`
fi

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

solutions=`echo "$puzzle" | $QQWING --solve --one-line --count-solutions | tail -n 1`
expected="The solution to the puzzle is unique."
if [ "$solutions" != "$expected" ]
then
	echo
	echo "Solution is not unique for this puzzle"
	echo "qqwing:   $QQWING"
	echo "test: $test"
	echo "Solving:  $puzzle"
	echo "$solutions"
	exit 1
fi
