#!/bin/sh

set -e

mkdir -p target/classes

javac -sourcepath java/ -d target/classes/ java/*.java