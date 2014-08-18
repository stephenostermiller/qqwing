#!/bin/sh

set -e
set -o pipefail

actual=`$QQWING --generate`
lines=`echo "$actual" | wc -l`
if [ "$lines" != "11" ]
then
	echo "test: $0"
	echo "Expected 11 lines of output:"
	echo "$actual"
	exit 1
fi

if [ `echo "$actual" | grep -vcE '^([ \.\|0-9]|-){22,23}$'` != 0 ]
then
	echo "test: $0"
	echo "Output format not as expected"
	echo "$actual"
	exit 1
fi
