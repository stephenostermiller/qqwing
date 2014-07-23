#/bin/sh
set -e

if [ -e target/dist ]
then
	newer=`find target/qqwing* -type f -newer target/dist`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo
ls -1 target/qqwing*
touch target/dist
