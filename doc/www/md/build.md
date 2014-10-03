% Building QQWing
## Get the source code

The full source code for QQWing can be checked out of github:

	git clone https://github.com/stephenostermiller/qqwing.git

## Build requirements

QQwing requires the following packages for development:

 - [git](http://git-scm.com/) — source code control
 - bash, sed, grep, cat, touch, chmod, head, sudo, tar, perl, make, find — Standard Linux utilities used during the build
 - java ([OpenJDK](http://openjdk.java.net/) or [Oracle](https://www.java.com/en/download/index.jsp)) — Building the java source code
 - [Node JS](http://nodejs.org/), [YUI Compressor](https://yui.github.io/yuicompressor/) — Building the JavaScript version
 - autoconf, automake, gcc, debuild, rpm  — Building the C++ version
 - [pandoc](http://johnmacfarlane.net/pandoc/) — Building the website


All of this software can be installed with `apt` on Debian or Ubuntu Linux:

	sudo apt-get install autoconf automake bash devscripts git gcc grep make nodejs openjdk-7-jdk pandoc perl rpm sed sudo tar yui-compressor

## Building

QQWing can be built with a single command:

	make

This builds *everything*: Executables for all supported languages, files for distributing QQWing, unit tests, and the website.
You could consider building just a specific component with one of:

 - `make tgz` -- Just the C++ version in tar.gz format
 - `make jsgz` -- Just the JavaScript version
 - `make jar` -- Just the Java version
 - `make www` -- Just the website
