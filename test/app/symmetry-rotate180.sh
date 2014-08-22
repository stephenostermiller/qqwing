#!/bin/sh

set -e
test/app/helper/test-symmetry.pl rotate180 `$QQWING --generate --one-line --symmetry rotate180`
