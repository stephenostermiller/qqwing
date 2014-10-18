ACLOCAL_AMFLAGS = -I m4

include_HEADERS = src/cpp/qqwing.hpp

lib_LTLIBRARIES = libqqwing.la
libqqwing_la_SOURCES = src/cpp/qqwing.cpp src/cpp/qqwing.hpp
libqqwing_la_LDFLAGS = -no-undefined -version-info $(QQWING_CURRENT):$(QQWING_REVISION):$(QQWING_AGE)

bin_PROGRAMS = qqwing
qqwing_SOURCES = src/cpp/main.cpp
qqwing_LDADD = $(top_builddir)/libqqwing.la

pkgconfigdir = $(libdir)/pkgconfig
dist_pkgconfig_DATA = qqwing.pc

dist_man1_MANS = doc/qqwing.man
