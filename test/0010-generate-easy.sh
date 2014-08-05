#!/bin/sh

set -e
set -o pipefail

./test/helper/generate.sh $0 "--difficulty easy"
 