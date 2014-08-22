#!/bin/sh

set -e
test/app/helper/test-symmetry.pl rotate90 `$QQWING --generate --one-line --symmetry rotate90`
