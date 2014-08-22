#!/bin/sh

set -e
test/app/helper/test-symmetry.pl flip `$QQWING --generate --one-line --symmetry flip`
