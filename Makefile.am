bin_PROGRAMS = qqwing
qqwing_SOURCES = qqwing.cpp

java:
	make -C java

super-dist: dist rpm-dist java

super-clean:
	rm -rf `cat .gitignore | xargs echo`
	cd java && rm -rf `cat .gitignore | xargs echo`
    
rpm-dist:
	./rpmbuild.sh

