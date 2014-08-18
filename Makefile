.PHONY: all
all: dist test website

.PHONY: dist
dist: jar tgz rpm deb jsgz
	@build/show_dist.sh

.PHONY: compile
compile: javacompile cppcompile jsmin

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

.PHONY: jscompile
jscompile: neaten
	@build/js_build.sh

.PHONY: jsmin
jsmin: jscompile
	@build/js_minimize.sh

.PHONY: jsgz
jsgz: jsmin
	@build/js_archive.sh

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
testunit: testjavaunit testjsunit

.PHONY: testjavaunit
testjavaunit: javacompile javatestcompile
	@build/java_unit_tests.sh

.PHONY: testjsunit
testjsunit: jscompile
	@build/js_unit_tests.sh

.PHONY: javatestcompile
javatestcompile: javacompile
	@build/java_test_compile.sh

.PHONY: testapp
testapp: testcppapp testjavaapp testjsapp

.PHONY: testjavaapp
testjavaapp: jar
	@build/test-app-run.sh java

.PHONY: testcppapp
testcppapp: cppcompile
	@build/test-app-run.sh cpp

.PHONY: testjsapp
testjsapp: jsmin
	@build/test-app-run.sh js

.PHONY: website
website:
	@build/build_website.sh

.PHONY: javatest
javatest: testjavaunit testjavaapp

.PHONY: cpptest
cpptest: testcppapp

.PHONY: jstest
jstest: testjsunit testjsapp

.PHONY: release
release: neaten
	@build/release.sh

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

.PHONY: cpp
cpp: cppcompile

.PHONY: js
js: jsmin

.PHONY: configurecpp
configurecpp: cppconfigure

.PHONY: compilecpp
compilecpp: cppcompile

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

.PHONY: jsapptest
jsapptest: testjsapp

.PHONY: cppapptest
cppapptest: testcppapp

.PHONY: testjava
testjava: javatest

.PHONY: testcpp
testcpp: cpptest

.PHONY: testjs
testjs: jstest

.PHONY: unittestjava
unittestjava: javaunittest

.PHONY: compilejavatest
compilejavatest: testcompilejava

.PHONY: apptestjava
apptestjava: javaapptest

.PHONY: apptestjs
apptestjs: jsapptest

.PHONY: apptestcpp
apptestcpp: cppapptest

.PHONY: www
www: website
