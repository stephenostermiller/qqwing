#!/bin/sh

set -e
set -o pipefail

version=`build/version.sh`

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
	*)
		echo "Expected java or cpp as argument"
		exit 1
		;;
esac

echo "Running app tests for $QQWINGTESTTYPE ($QQWING):"

for test in test/app/*.sh
do
	echo -n '.'
	$test
done

echo
