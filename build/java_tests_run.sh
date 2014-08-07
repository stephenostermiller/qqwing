#!/bin/sh
set -e

if [ -e target/javatestsrun ]
then
	newer=`find target/classes/ target/testclasses -type f -newer target/javatestsrun`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

java -classpath 'target/classes:target/testclasses' QQWingTest
