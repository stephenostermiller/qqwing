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

mkdir -p target/www/html target/www/min target/www/debug

if [ -e target/www/.tstamp ]
then
	newer=`find src/ build/configure.ac doc/www -type f -newer target/www/.tstamp`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`

for file in doc/www/bte/*.bte
do
	sed "s/VERSION/$version/g" $file > target/www/html/${file##*/}
done

cd target/www/html
bte *.bte
tohtml ../../../src/cpp/qqwing.cpp -s "" -f -i whitespace -t cppsource.bte -o ./qqwing.cpp.html
tohtml ../../../src/cpp/qqwing.hpp -s "" -f -i whitespace -t cppsource.bte -o ./qqwing.hpp.html
tohtml ../../../src/cpp/main.cpp -s "" -f -i whitespace -t cppsource.bte -o ./main.cpp.html
tohtml ../../../src/java/QQWing.java -s "" -f -i whitespace -t javasource.bte -o ./QQWing.java.html
tohtml ../../../target/js/qqwing-main-$version.js -s "" -f -i whitespace -t jssource.bte -o ./qqwing-main.js.html
rm *.bte
cd ../../..

cp target/www/html/*.html target/www/debug/
cp doc/www/css/*.css target/www/debug/
cp doc/www/img/*.* target/www/debug/
cp target/js/qqwing-html-$version.js target/www/debug/qqwing-html.js
cp target/js/qqwing-play-$version.js target/www/debug/qqwing-play.js
cp target/qqwing*.* target/www/debug/

cp target/www/html/*.html target/www/min/
sed -ri 's/^[ \t]*//' target/www/min/*.html
sed -ri '/^\s*$/d' target/www/min/*.html
yui-compressor --type css --charset UTF-8 -o 'doc\/www\/css\/(.*)\.css$:target\/www\/min\/$1.css' doc/www/css/*.css
cp doc/www/img/*.* target/www/min/
cp target/jsmin/qqwing-html-$version.min.js target/www/min/qqwing-html.js
cp target/jsmin/qqwing-play-$version.min.js target/www/min/qqwing-play.js
cp target/qqwing*.* target/www/min/

echo "Website built in target/www"
touch target/www/.tstamp
