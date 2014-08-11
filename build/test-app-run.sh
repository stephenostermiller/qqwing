#!/bin/sh

version=`build/version.sh`

exitstatus=0

case $1 in
	"java")
		export QQWINGTESTTYPE=java
		export QQWING="java -jar target/qqwing-$version.jar"
		export QQWINGSRCWITHCOPYRIGHT=src/java/QQWing.java
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
