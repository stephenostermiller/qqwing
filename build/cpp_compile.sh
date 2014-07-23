#!/bin/sh
 
 set -e
  
 cp cpp/*.cpp target/automake
 cd target/automake
 make
 cp qqwing ..
 