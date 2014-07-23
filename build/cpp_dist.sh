#!/bin/sh
 
 set -e
  
 cd target/automake
 make dist
 cp qqwing*.tar.gz ..
 