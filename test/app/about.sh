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

expected=`build/src-first-comment.pl $QQWINGSRCWITHCOPYRIGHT`
actual=`$QQWING --about`

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

