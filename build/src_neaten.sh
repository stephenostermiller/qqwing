#!/bin/sh
set -e

mkdir -p target

neaten_time_file="target/src.neaten"

if [ ! -e $neaten_time_file ]
then
	touch --date 1980-01-01 $neaten_time_file
fi

find build/ doc/ src/ test/ Makefile -type f -newer $neaten_time_file | grep -vEi 'changelog|debian-copyright|COPYING|README' | xargs ./build/src_neaten.pl

touch $neaten_time_file
