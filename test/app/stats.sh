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

actual=`echo '9..6...7...1..428.7..2.............81.8....45.9..4.6....7.9.5.....4.5....1..6..29' | $QQWING --solve --csv --log-history --stats`

expected="Solution,Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty
Round: 1 - Mark given (Row: 1 - Column: 1 - Value: 9)
Round: 1 - Mark given (Row: 1 - Column: 4 - Value: 6)
Round: 1 - Mark given (Row: 1 - Column: 8 - Value: 7)
Round: 1 - Mark given (Row: 2 - Column: 3 - Value: 1)
Round: 1 - Mark given (Row: 2 - Column: 6 - Value: 4)
Round: 1 - Mark given (Row: 2 - Column: 7 - Value: 2)
Round: 1 - Mark given (Row: 2 - Column: 8 - Value: 8)
Round: 1 - Mark given (Row: 3 - Column: 1 - Value: 7)
Round: 1 - Mark given (Row: 3 - Column: 4 - Value: 2)
Round: 1 - Mark given (Row: 4 - Column: 9 - Value: 8)
Round: 1 - Mark given (Row: 5 - Column: 1 - Value: 1)
Round: 1 - Mark given (Row: 5 - Column: 3 - Value: 8)
Round: 1 - Mark given (Row: 5 - Column: 8 - Value: 4)
Round: 1 - Mark given (Row: 5 - Column: 9 - Value: 5)
Round: 1 - Mark given (Row: 6 - Column: 2 - Value: 9)
Round: 1 - Mark given (Row: 6 - Column: 5 - Value: 4)
Round: 1 - Mark given (Row: 6 - Column: 7 - Value: 6)
Round: 1 - Mark given (Row: 7 - Column: 3 - Value: 7)
Round: 1 - Mark given (Row: 7 - Column: 5 - Value: 9)
Round: 1 - Mark given (Row: 7 - Column: 7 - Value: 5)
Round: 1 - Mark given (Row: 8 - Column: 4 - Value: 4)
Round: 1 - Mark given (Row: 8 - Column: 6 - Value: 5)
Round: 1 - Mark given (Row: 9 - Column: 2 - Value: 1)
Round: 1 - Mark given (Row: 9 - Column: 5 - Value: 6)
Round: 1 - Mark given (Row: 9 - Column: 8 - Value: 2)
Round: 1 - Mark given (Row: 9 - Column: 9 - Value: 9)
Round: 1 - Mark given (Row: 1 - Column: 1 - Value: 9)
Round: 1 - Mark given (Row: 1 - Column: 4 - Value: 6)
Round: 1 - Mark given (Row: 1 - Column: 8 - Value: 7)
Round: 1 - Mark given (Row: 2 - Column: 3 - Value: 1)
Round: 1 - Mark given (Row: 2 - Column: 6 - Value: 4)
Round: 1 - Mark given (Row: 2 - Column: 7 - Value: 2)
Round: 1 - Mark given (Row: 2 - Column: 8 - Value: 8)
Round: 1 - Mark given (Row: 3 - Column: 1 - Value: 7)
Round: 1 - Mark given (Row: 3 - Column: 4 - Value: 2)
Round: 1 - Mark given (Row: 4 - Column: 9 - Value: 8)
Round: 1 - Mark given (Row: 5 - Column: 1 - Value: 1)
Round: 1 - Mark given (Row: 5 - Column: 3 - Value: 8)
Round: 1 - Mark given (Row: 5 - Column: 8 - Value: 4)
Round: 1 - Mark given (Row: 5 - Column: 9 - Value: 5)
Round: 1 - Mark given (Row: 6 - Column: 2 - Value: 9)
Round: 1 - Mark given (Row: 6 - Column: 5 - Value: 4)
Round: 1 - Mark given (Row: 6 - Column: 7 - Value: 6)
Round: 1 - Mark given (Row: 7 - Column: 3 - Value: 7)
Round: 1 - Mark given (Row: 7 - Column: 5 - Value: 9)
Round: 1 - Mark given (Row: 7 - Column: 7 - Value: 5)
Round: 1 - Mark given (Row: 8 - Column: 4 - Value: 4)
Round: 1 - Mark given (Row: 8 - Column: 6 - Value: 5)
Round: 1 - Mark given (Row: 9 - Column: 2 - Value: 1)
Round: 1 - Mark given (Row: 9 - Column: 5 - Value: 6)
Round: 1 - Mark given (Row: 9 - Column: 8 - Value: 2)
Round: 1 - Mark given (Row: 9 - Column: 9 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 3 - Column: 8 - Value: 5)
Round: 2 - Mark single possibility for value in section (Row: 3 - Column: 7 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 2 - Column: 4 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 2 - Column: 5 - Value: 7)
Round: 2 - Mark single possibility for value in section (Row: 1 - Column: 5 - Value: 5)
Round: 2 - Mark single possibility for value in section (Row: 6 - Column: 9 - Value: 2)
Round: 2 - Mark single possibility for value in section (Row: 4 - Column: 8 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 5 - Column: 6 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 4 - Column: 6 - Value: 6)
Round: 2 - Mark single possibility for value in section (Row: 5 - Column: 2 - Value: 6)
Round: 2 - Mark single possibility for value in section (Row: 4 - Column: 2 - Value: 7)
Round: 2 - Mark single possibility for value in section (Row: 5 - Column: 7 - Value: 7)
Round: 2 - Mark only possibility for cell (Row: 5 - Column: 4 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 5 - Column: 5 - Value: 2)
Round: 2 - Mark only possibility for cell (Row: 4 - Column: 5 - Value: 1)
Round: 2 - Mark only possibility for cell (Row: 4 - Column: 4 - Value: 5)
Round: 2 - Mark only possibility for cell (Row: 4 - Column: 7 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 6 - Column: 8 - Value: 1)
Round: 2 - Mark single possibility for value in section (Row: 8 - Column: 3 - Value: 9)
Round: 2 - Mark single possibility for value in section (Row: 7 - Column: 6 - Value: 2)
Round: 2 - Mark single possibility for value in section (Row: 7 - Column: 4 - Value: 1)
Round: 2 - Mark single possibility for value in section (Row: 8 - Column: 9 - Value: 7)
Round: 2 - Mark single possibility for value in section (Row: 8 - Column: 7 - Value: 1)
Round: 2 - Mark only possibility for cell (Row: 1 - Column: 7 - Value: 4)
Round: 2 - Mark only possibility for cell (Row: 9 - Column: 7 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 9 - Column: 4 - Value: 7)
Round: 2 - Mark only possibility for cell (Row: 6 - Column: 4 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 6 - Column: 6 - Value: 7)
Round: 2 - Mark only possibility for cell (Row: 9 - Column: 6 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 8 - Column: 5 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 3 - Column: 5 - Value: 3)
Round: 2 - Mark single possibility for value in section (Row: 7 - Column: 9 - Value: 4)
Round: 2 - Mark single possibility for value in column (Row: 7 - Column: 1 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 7 - Column: 2 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 2 - Column: 2 - Value: 5)
Round: 2 - Mark only possibility for cell (Row: 7 - Column: 8 - Value: 6)
Round: 2 - Mark only possibility for cell (Row: 8 - Column: 2 - Value: 2)
Round: 2 - Mark only possibility for cell (Row: 1 - Column: 2 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 1 - Column: 6 - Value: 1)
Round: 2 - Mark only possibility for cell (Row: 1 - Column: 9 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 1 - Column: 3 - Value: 2)
Round: 2 - Mark only possibility for cell (Row: 2 - Column: 9 - Value: 6)
Round: 2 - Mark only possibility for cell (Row: 2 - Column: 1 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 3 - Column: 2 - Value: 4)
Round: 2 - Mark only possibility for cell (Row: 3 - Column: 3 - Value: 6)
Round: 2 - Mark only possibility for cell (Row: 3 - Column: 6 - Value: 8)
Round: 2 - Mark only possibility for cell (Row: 3 - Column: 9 - Value: 1)
Round: 2 - Mark only possibility for cell (Row: 4 - Column: 3 - Value: 4)
Round: 2 - Mark only possibility for cell (Row: 4 - Column: 1 - Value: 2)
Round: 2 - Mark only possibility for cell (Row: 6 - Column: 1 - Value: 5)
Round: 2 - Mark only possibility for cell (Row: 6 - Column: 3 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 8 - Column: 1 - Value: 6)
Round: 2 - Mark only possibility for cell (Row: 8 - Column: 8 - Value: 3)
Round: 2 - Mark only possibility for cell (Row: 9 - Column: 1 - Value: 4)
Round: 2 - Mark only possibility for cell (Row: 9 - Column: 3 - Value: 5)
982651473351974286746238951274516398168329745593847612837192564629485137415763829,26,36,19,0,0,0,0,0,0,Easy,"

if [ "$actual" != "$expected" ]
then
	actualfile=`mktemp /tmp/actual.XXXXXXXXX`
	expectedfile=`mktemp /tmp/expected.XXXXXXXX`
	echo "$actual" > "$actualfile"
	echo "$expected" > "$expectedfile"
	echo
	echo "Test: $0"
	echo "qqwing: $QQWING"
	diff -s "$actualfile" "$expectedfile"
	exit 1
fi

