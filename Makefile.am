bin_PROGRAMS = qqwing
qqwing_SOURCES = qqwing.cpp


# RPM related happenings
#ifndef RPM_BUILD_DIR
RPM_BUILD_DIR=/usr/src/redhat
#endif
#ifndef RPM_BUILD_TARGET
RPM_BUILD_TARGET=`uname -m`
#endif

rpm-dist:
	./rpmbuild.sh $(srcdir) $(PACKAGE) $(RPM_BUILD_DIR) $(VERSION) $(RPM_BUILD_TARGET) $(MAKE)

