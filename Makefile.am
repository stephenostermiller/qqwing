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
	if ! test -f $(srcdir)/$(PACKAGE).spec; then \
		echo "RPM spec file '$(PACKAGE).spec' missing from '$(srcdir)' directory; aborting rpm build" 1>&2; \
		exit 1; \
	fi; \
	mkdir -p $(RPM_BUILD_DIR)/BUILD
	mkdir -p $(RPM_BUILD_DIR)/RPMS
	mkdir -p $(RPM_BUILD_DIR)/SOURCES
	mkdir -p $(RPM_BUILD_DIR)/SPECS
	mkdir -p $(RPM_BUILD_DIR)/SRPMS
	rm -f $(srcdir)/$(PACKAGE)-$(VERSION).tar.gz; \
	rm -f $(srcdir)/$(PACKAGE)-$(VERSION)-1.src.rpm; \
	rm -f $(srcdir)/$(PACKAGE)-$(VERSION)-1.$(RPM_BUILD_TARGET).rpm; \
	cat $(srcdir)/$(PACKAGE).spec | sed s/VERSION/$(VERSION)/g > $(RPM_BUILD_DIR)/SPECS/$(PACKAGE).spec; \
	$(MAKE) dist; \
	cp -f $(srcdir)/$(PACKAGE)-$(VERSION).tar.gz $(RPM_BUILD_DIR)/SOURCES/$(PACKAGE)-$(VERSION).tar.gz; \
	rpmbuild -ba --target=$(RPM_BUILD_TARGET) -v $(RPM_BUILD_DIR)/SPECS/$(PACKAGE).spec; \
	cp -f $(RPM_BUILD_DIR)/RPMS/$(RPM_BUILD_TARGET)/$(PACKAGE)-$(VERSION)-1.$(RPM_BUILD_TARGET).rpm $(srcdir); \
	cp -f $(RPM_BUILD_DIR)/SRPMS/$(PACKAGE)-$(VERSION)-1.src.rpm $(srcdir);\
	rm -f $(RPM_BUILD_DIR)/RPMS/$(RPM_BUILD_TARGET)/$(PACKAGE)-$(VERSION)-1.$(RPM_BUILD_TARGET).rpm; \
	rm -f $(RPM_BUILD_DIR)/SRPMS/$(PACKAGE)-$(VERSION)-1.src.rpm; \
	rm -f $(RPM_BUILD_DIR)/SPECS/$(PACKAGE).spec; \
	rm -f $(RPM_BUILD_DIR)/SOURCES/$(PACKAGE)-$(VERSION).tar.gz; \
	rm -rf $(RPM_BUILD_DIR)/BUILD/$(PACKAGE)-$(VERSION)
