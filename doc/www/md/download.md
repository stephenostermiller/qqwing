% Download QQwing - Sudoku Generator and Solver

QQWing is Sudoku generating and solving software that has been ported to 3 programming
languages: C++, Java, and JavaScript.   Various versions are available to run on different
platforms and different environments.

## Full source code ([GNU Public License 2.0](about.html))

<div class=downloadsection><div class=downloadsubsection><div>
<a class=button href="https://github.com/stephenostermiller/qqwing/archive/vVERSION.zip">VERSION full source (zip)</a>
<a class=button href="https://github.com/stephenostermiller/qqwing/archive/vVERSION.zip">VERSION full source (tar.gz)</a>
</div>

 - [Browse the entire source tree on GitHub](https://github.com/stephenostermiller/qqwing)
 - [Instructions and requirements for building](build.html)

View the major source files on this site:
[qqwing.cpp](qqwing.cpp.html),
[main.cpp](main.cpp.html),
[qqwing.hpp](qqwing.hpp.html),
[QQWing.java](QQWing.java.html),
[qqwing-main.js](qqwing-main.js.html)

</div></div>

## Java QQWing

The Java version of QQWing the only multi-threaded version of QQWing and is therefore the fastest.   It can generate
1000 Sudoku puzzles per second.  If you are planning to generate thousands of Sudoku puzzles, you will want this version.
It can be run from the command line, or used as a library from other Java programs to generate or solve
Sudoku puzzles.

<div class=downloadsection><div class=downloadsubsection>
<a class=button href="qqwing-VERSION.jar">VERSION Java archive (jar)</a>

 1. Requires the [Java runtime environment (JRE)](https://www.java.com/en/download/index.jsp)
 1. Run: `java -jar qqwing-VERSION.jar --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

</div></div>

## JavaScript QQWing

The Javascript version of QQWing can run in web pages to power Sudoku puzzles on web pages.   The "play", "generate",
and "solve" on this website are powered it.  QQWing in JavaScript is very slow compared to the Java or C++ versions, however.

<div class=downloadsection><div class=downloadsubsection>
<a class=button href="qqwing-js-VERSION.tar.gz">VERSION JavaScript (tar.gz)</a>

 1. Requires [NodeJS](http://nodejs.org/) to run from the command line.
 1. Run: `node qqwing-main-VERSION.min.js --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

</div></div>

## Native QQWing built from C++

This is the most efficient version of QQWing.  It has the lowest startup overhead and uses the least CPU per puzzle
generated. It also can be used as a library to power other Sudoku applications. (See:
[Gnome Sudoku](https://wiki.gnome.org/Apps/Sudoku), which uses the QQWing C++ library.)

<div class=downloadsection><div class=downloadsubsection>

### Windows

<a class=button href="qqwing-1.0.1-1.windows.bin.zip">1.0.1 Windows binary (zip)</a>

 1. Extract qqwing-1.0.1-1.windows.bin.zip using your favorite zip extraction tool
 1. Run command: `qqwing.exe --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

</div><div class=downloadsubsection>

### Redhat or Fedora Linux

<a class=button href="qqwing-1.0.3-1.i686.rpm">1.0.3 32 bit (rpm)</a> or <a class=button href="qqwing-VERSION-1.x86_64.rpm">VERSION 64 bit (rpm)</a>

 1. Install: `sudo rpm --upgrade --verbose qqwing-*.rpm`
 1. Run: `qqwing --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

<a class=button href="qqwing-VERSION-1.src.rpm">VERSION Source RPM (rpm)</a>

 1. Build: `rpmbuild --rebuild qqwing-VERSION-1.src.rpm`
 1. A binary RPM file for your system will have created in you system's rpm directory (often a sub-directory of /usr/src/redhat/).  Use the installation instructions above for installing it.
 1. If no binary RPM for your system is available for download, please contact Stephen, to have your binary put on the QQwing website.

</div><div class=downloadsubsection>

### Debian or Ubuntu Linux

<a class=button href="qqwing_VERSION-1_amd64.deb">VERSION 64 bit (deb)</a>

 1. Install: `sudo dpkg --install qqwing_*.deb`
 1. Run: `qqwing --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

</div><div class=downloadsubsection>

### Any platform C++ Source
<a class=button href="qqwing-VERSION.tar.gz">VERSION C++ Source (tar.gz)</a>

 1. Extract: `tar xfvz qqwing-VERSION.tar.gz`
 1. Build: `cd qqwing-VERSION`
 1. `./configure`
 1. `make`
 1. `sudo make install`
 1. Run: `qqwing --help`
 1. See the [command line program instructions](instructions.html) for help running QQWing from the command line.

</div></div>
