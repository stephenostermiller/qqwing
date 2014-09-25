ACLOCAL_AMFLAGS = -I m4
EXTRA_DIST = debian

include_HEADERS = qqwing.hpp

lib_LTLIBRARIES = libqqwing.la
libqqwing_la_SOURCES = qqwing.cpp qqwing.hpp
libqqwing_la_LDFLAGS = -no-undefined -version-info $(QQWING_CURRENT):$(QQWING_REVISION):$(QQWING_AGE)

bin_PROGRAMS = qqwing
qqwing_SOURCES = main.cpp
qqwing_LDADD = $(top_builddir)/libqqwing.la

pkgconfigdir = $(libdir)/pkgconfig
dist_pkgconfig_DATA = qqwing.pc

dist_man_MANS = qqwing.1
