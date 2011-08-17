all: build jar

version.txt: ../configure.ac
	grep AC_INIT ../configure.ac | grep -oE '[0-9]+\.[0-9]+\.[0-9\.]+' > version.txt
        
version: version.txt
	./ensure_version.sh

build: version
	javac *.java

jar: build version.txt
	jar cvmf QQWing.mf ../qqwing-`cat version.txt`.jar *.java *.class COPYING
