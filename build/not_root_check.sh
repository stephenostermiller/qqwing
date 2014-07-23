#!/bin/sh
set -e

if [ `whoami` = "root" ]
then
    echo "Don't build or install as root: it causes permission problems"
    echo "Install will use sudo at the appropriate time"
    exit 1
fi