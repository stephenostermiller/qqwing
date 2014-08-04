#!/bin/sh

set -e
set -o pipefail

version=`build/version.sh`

case $1 in
	"java")
		export QQWING="java -jar target/qqwing-$version.jar"
		;;
	"cpp")
		export QQWING="target/qqwing"
		;;
	*)
		echo "Expected java or cpp as argument"
		exit 1
		;;
esac

for test in test/*.sh
do
	$test
done
