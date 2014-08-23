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

if [ -e target/jscompile ]
then
	newer=`find src/js/ test/js/ -type f -newer target/jscompile`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

buildjs () {
	output=""
	first=""
	for file in "$@"
	do
		if [ "z$output" == "z" ]
		then
			output=target/js/$file
		else
			if [ -f src/js/$file ]
			then
				file=src/js/$file
			elif [ -f test/js/$file ]
			then
				file=test/js/$file
			elif [ -f target/js/$file ]
			then
				file=target/js/$file
			fi
			if [ "z$first" == "z" ]
			then
				first=$file
				# The put a ! in the license comment so it doesn't get removed during minimization
				sed -r '1s|\/\*\!?|/*!|' $file > $output
			else
				# Remove the license comment
				perl -pe 'BEGIN{undef $/;} s/\/\*.*?\*\/\n?//s' $file >> $output
			fi
		fi
	done
	echo -n ".";
}

version=`build/version.sh`

mkdir -p target/js
echo "Compiling js sources"

buildjs qqwing-$version.js qqwing-object-start.js qqwing-private-static.js qqwing-private-instance.js qqwing-public-instance.js qqwing-object-end.js qqwing-public-static.js

buildjs qqwing-main-$version.js qqwing-$version.js qqwing-main.js

buildjs qqwing-html-$version.js qqwing-$version.js qqwing-html.js

buildjs qqwing-play-$version.js qqwing-$version.js qqwing-play.js

buildjs qqwing-test-$version.js qqwing-object-start.js qqwing-object-end.js qqwing-public-static.js qqwing-private-static.js qqwing-test.js

echo
touch target/jscompile
