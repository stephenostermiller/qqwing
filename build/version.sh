#!/bin/sh

set -e

grep AC_INIT build/configure.ac | grep -oE '[0-9]+\.[0-9]+\.[0-9\.]+'
