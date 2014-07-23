.PHONY: all
all: jar
        
.PHONY: javaversion
javaversion:
	build/java_version.sh

.PHONY: javacompile
javacompile: javaversion
	build/java_compile.sh

.PHONY: jar
jar: javacompile
	build/jar_build.sh

.PHONY: cppautomake
cppautomake:
	build/cpp_automake.sh

.PHONY: cppconfigure
cppconfigure: cppautomake
	build/cpp_configure.sh

.PHONY: cppcompile
	build/cpp_compile.sh
        
.PHONY: cppdist
cppdist:
	build/cpp_dist.sh
     
.PHONY: clean
clean:
	rm -rf target/

.PHONY: rpm-dist
rpm-dist:
	build/rpm_build.sh

