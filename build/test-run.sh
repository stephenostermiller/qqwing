#!/bin/sh

set -e
set -o pipefail

version=`build/version.sh`

case $1 in
	"java")
		export QQWINGTESTYPE=java
		export QQWING="java -jar target/qqwing-$version.jar"
		export QQWINGSRCWITHCOPYRIGHT=java/QQWing.java
		;;
	"cpp")
		export QQWINGTESTYPE=cpp
		export QQWING="target/qqwing"
		export QQWINGSRCWITHCOPYRIGHT=cpp/qqwing.cpp
		;;
	*)
		echo "Expected java or cpp as argument"
		exit 1
		;;
esac

echo "Running tests for $QQWINGTESTTYPE:"

for test in test/*.sh
do
	echo -n '.'
	$test
done

echo
