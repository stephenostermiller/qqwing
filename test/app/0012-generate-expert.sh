#!/bin/sh

set -e
set -o pipefail

./test/app/helper/generate.sh $0 "--difficulty expert"
 