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

actual=`$QQWING --help | grep -v threads`
expected="qqwing <options>
Sudoku solver and generator.
  --generate <num>     Generate new puzzles
  --solve              Solve all the puzzles from standard input
  --difficulty <diff>  Generate only simple, easy, intermediate, expert, or any
  --symmetry <sym>     Symmetry: none, rotate90, rotate180, mirror, flip, or random
  --puzzle             Print the puzzle (default when generating)
  --nopuzzle           Do not print the puzzle (default when solving)
  --solution           Print the solution (default when solving)
  --nosolution         Do not print the solution (default when generating)
  --stats              Print statistics about moves used to solve the puzzle
  --nostats            Do not print statistics (default)
  --timer              Print time to generate or solve each puzzle
  --notimer            Do not print solve or generation times (default)
  --count-solutions    Count the number of solutions to puzzles
  --nocount-solutions  Do not count the number of solutions (default)
  --history            Print trial and error used when solving
  --nohistory          Do not print trial and error to solve (default)
  --instructions       Print the steps (at least 81) needed to solve the puzzle
  --noinstructions     Do not print steps to solve (default)
  --log-history        Print trial and error to solve as it happens
  --nolog-history      Do not print trial and error  to solve as it happens
  --one-line           Print puzzles on one line of 81 characters
  --compact            Print puzzles on 9 lines of 9 characters
  --readable           Print puzzles in human readable form (default)
  --csv                Output CSV format with one line puzzles
  --help               Print this message
  --about              Author and license information
  --version            Display current version number"

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

