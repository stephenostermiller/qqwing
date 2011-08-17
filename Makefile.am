bin_PROGRAMS = qqwing
qqwing_SOURCES = qqwing.cpp

super-clean:
	rm -rf `cat .gitignore | xargs echo`
	cd java && rm -rf `cat .gitignore | xargs echo`
    
rpm-dist:
	./rpmbuild.sh

