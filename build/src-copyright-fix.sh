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

for file in "$@"
do
	copyright=`build/src-first-comment.pl "$file" | grep -i copyright`
	if [ "z$copyright" = "z" ]
	then
		extension="${file##*.}"
		echo "Adding copyright notice to $file"
		tmp=`mktemp`
		permissions=`stat --format=%a "$file"`
		year=`date '+%Y'`
		case $extension in
			sh|pl)
				execline="`head -n 1 "$file" | grep -c "^#!" || true`"
				if [ $execline != "0" ]
				then
					head -n 1 "$file" >> "$tmp"
				fi
				sed "s/YEAR/$year/g;s/^/# /g;s/ $//g;" doc/license-header-template.txt >> "$tmp"
				if [ $execline == "0" ]
				then
					cat "$file" >> "$tmp"
				else
					sed 1d "$file" >> "$tmp"
				fi
				;;
			css|hpp|cpp|js)
				echo '/*' >> "$tmp"
				sed "s/YEAR/$year/g;s/^/ * /g;s/ $//g;" doc/license-header-template.txt >> "$tmp"
				echo ' */' >> "$tmp"
				cat "$file" >> "$tmp"
				;;
			java)
				echo '// @formatter:off' >> "$tmp"
				echo '/*' >> "$tmp"
				sed "s/YEAR/$year/g;s/^/ * /g;s/ $//g;" doc/license-header-template.txt >> "$tmp"
				echo ' */' >> "$tmp"
				echo '// @formatter:on' >> "$tmp"
				cat "$file" >> "$tmp"
				;;
			html)
				doctypeline="`head -n 1 "$file" | grep -ic "doctype" || true`"
				if [ doctypeline != "0" ]
				then
					head -n 1 "$file" >> "$tmp"
				fi
				echo '<!--' >> "$tmp"
				sed "s/YEAR/$year/g;s/^/  - /g;s/ $//g;" doc/license-header-template.txt >> "$tmp"
				echo '  -->' >> "$tmp"
				if [ doctypeline == "0" ]
				then
					cat "$file" >> "$tmp"
				else
					sed 1d "$file" >> "$tmp"
				fi
				;;
			*)
				echo "Comment style unknown for $extension files"
				exit 1;
				;;
		esac
		mv "$tmp" "$file"
		chmod $permissions "$file"
	fi
done
