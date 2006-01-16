#!/bin/sh

touch config.h.in
aclocal
automake -a -c
autoreconf
rm -f config.h.in~
