#!/bin/sh

set -e
set -o pipefail

expected=`build/comments-get-first.pl $QQWINGSRCWITHCOPYRIGHT`
actual=`$QQWING --about`

if [ "$actual" != "$expected" ]
then
    actualfile=`mktemp /tmp/actual.XXXXXXXXX`
    expectedfile=`mktemp /tmp/expected.XXXXXXXX`
    echo "$actual" > "$actualfile"
    echo "$expected" > "$expectedfile"
    echo
    echo "Test: $0"
    echo "qqwing: $QQWING"
    diff -s "$actualfile" "$expectedfile"
    exit 1
fi
 