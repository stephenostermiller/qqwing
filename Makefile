.PHONY: all
all: dist test website

.PHONY: dist
dist: jar tgz rpm deb
	@build/show_dist.sh

.PHONY: compile
compile: javacompile cppcompile

.PHONY: javaversion
javaversion: notroot neaten
	@build/java_version.sh

.PHONY: javacompile
javacompile: javaversion
	@build/java_compile.sh

.PHONY: jar
jar: javacompile
	@build/jar_build.sh

.PHONY: cppconfigure
cppconfigure: notroot neaten
	@build/cpp_configure.sh

.PHONY: cppcompile
cppcompile: cppconfigure
	@build/cpp_compile.sh

.PHONY: tgz
tgz: cppcompile
	@build/cpp_dist.sh

.PHONY: rpm
rpm: tgz
	@build/rpm_build.sh

.PHONY: deb
deb: tgz
	@build/deb_build.sh

.PHONY: install
install: cppcompile
	@build/cpp_install.sh

.PHONY: notroot
notroot:
	@build/not_root_check.sh

.PHONY: neaten
neaten:
	@build/src_neaten.sh

.PHONY: test
test: testunit testapp

.PHONY: testunit
testunit: testjavaunit

.PHONY: testjavaunit
testjavaunit: javacompile javatestcompile
	@build/java_unit_tests.sh

.PHONY: javatestcompile
javatestcompile: javacompile
	@build/java_test_compile.sh

.PHONY: testapp
testapp: testcppapp testjavaapp

.PHONY: testjavaapp
testjavaapp: jar
	@build/test-app-run.sh java

.PHONY: testcppapp
testcppapp: cppcompile
	@build/test-app-run.sh cpp

.PHONY: website
website:
	@build/build_website.sh

.PHONY: clean
clean:
	rm -rf target/

# Target aliases

.PHONY: versionjava
versionjava: javaversion

.PHONY: compilejava
compilejava: javacompile

.PHONY: java
java: javacompile

.PHONY: configurecpp
configurecpp: cppconfigure

.PHONY: compilecpp
compilecpp: cppcompile

.PHONY: cpp
cpp: cppcompile

.PHONY: unittest
unittest: testunit

.PHONY: javaunittest
javaunittest: testjavaunit

.PHONY: testcompilejava
testcompilejava: javatestcompile

.PHONY: apptest
apptest: testapp

.PHONY: javaapptest
javaapptest: testjavaapp

.PHONY: cppapptest
cppapptest: testcppapp

.PHONY: unittestjava
unittestjava: javaunittest

.PHONY: compilejavatest
compilejavatest: testcompilejava

.PHONY: apptestjava
apptestjava: javaapptest

.PHONY: apptestcpp
apptestcpp: cppapptest

.PHONY: www
www: website
