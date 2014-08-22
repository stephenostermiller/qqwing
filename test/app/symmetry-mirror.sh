#!/bin/sh

set -e
test/app/helper/test-symmetry.pl mirror `$QQWING --generate --one-line --symmetry mirror`
