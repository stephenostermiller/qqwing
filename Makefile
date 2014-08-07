.PHONY: all
all: dist test

.PHONY: dist
dist: jar tgz rpm deb jsmin
	@build/show_dist.sh

.PHONY: compile
compile: javacompile cppcompile jscompile

.PHONY: javaversion
javaversion: notroot neaten
	@build/java_version.sh

.PHONY: jscompile
jscompile:
	@build/js_build.sh

.PHONY: jsmin
jsmin: jscompile
	@build/js_minimize.sh

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
testjsapp: jscompile
	@build/test-app-run.sh js

.PHONY: clean
clean:
	rm -rf target/
