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

version=`build/version.sh`

exitstatus=0

case $1 in
	"java")
		export QQWINGTESTTYPE=java
		export QQWING="java -jar target/qqwing-$version.jar"
		export QQWINGSRCWITHCOPYRIGHT=src/java/com/qqwing/QQWing.java
		;;
	"cpp")
		export QQWINGTESTTYPE=cpp
		export QQWING="target/qqwing"
		export QQWINGSRCWITHCOPYRIGHT=src/cpp/qqwing.cpp
		;;
	"js")
		export QQWINGTESTTYPE=js
		export QQWING="node target/jsmin/qqwing-main-$version.min.js"
		export QQWINGSRCWITHCOPYRIGHT=src/js/qqwing-main.js
		;;
	*)
		echo "Expected java, cpp, or js as argument"
		exit 1
		;;
esac

echo "Running app tests for $QQWINGTESTTYPE ($QQWING):"

for test in test/app/*.sh
do
	echo -n '.'
	$test
	if [ $? -ne 0 ]
	then
		exitstatus=1
		echo
		echo "Failed $test"
	fi
done

echo

exit $exitstatus
