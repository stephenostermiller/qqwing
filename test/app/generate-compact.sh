#!/bin/sh

set -e
set -o pipefail

actual=`$QQWING --generate --compact`
lines=`echo "$actual" | wc -l`
if [ "$lines" != "9" ]
then
	echo "test: $0"
	echo "Expected 9 lines of output:"
	echo "$actual"
	exit 1
fi

if [ `echo "$actual" | grep -vcE '^[\.0-9]{9}$'` != 0 ]
then
	echo "test: $0"
	echo "Output format not as expected"
	echo "$actual"
	exit 1
fi
