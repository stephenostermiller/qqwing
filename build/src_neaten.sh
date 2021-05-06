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

mkdir -p target

neaten_time_file="target/src.neaten"

if [ ! -e $neaten_time_file ]
then
	touch --date 1980-01-01 $neaten_time_file
fi

find build/ doc/ src/ test/ Makefile -type f -newer $neaten_time_file | grep -vEi 'changelog|copyright|COPYING|README|\.gif|\.png|\.jpg|\.gch$' | xargs ./build/src_neaten.pl

touch $neaten_time_file
