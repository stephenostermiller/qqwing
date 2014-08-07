#!/bin/sh
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

buildjs qqwing-$version.js qqwing-object-start.js qqwing-private-static.js qqwing-private-instance.js qqwing-object-end.js qqwing-public-static.js

buildjs qqwing-main-$version.js qqwing-$version.js qqwing-main.js

buildjs qqwing-test-$version.js qqwing-private-static.js qqwing-test.js

echo
touch target/jscompile
