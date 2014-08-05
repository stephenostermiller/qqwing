.PHONY: all
all: dist test

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
test: testcpp testjava

.PHONY: testjava
testjava: jar
	@build/test-run.sh java

.PHONY: testcpp
testcpp: cppcompile
	@build/test-run.sh cpp

.PHONY: clean
clean:
	rm -rf target/
