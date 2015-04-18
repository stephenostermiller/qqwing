AC_PREREQ(2.59)
AC_INIT(qqwing, 1.3.4, http://qqwing.com/)
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_SRCDIR([config.h.in])
AC_CONFIG_HEADER([config.h])

# Before making a release, the LT_VERSION string should be modified.
# The string is of the form C:R:A.
# - If interfaces have been changed or added, but binary compatibility has
#   been preserved, change to C+1:0:A+1
# - If binary compatibility has been broken (eg removed or changed interfaces)
#   change to C+1:0:0
# - If the interface is the same as the previous version, change to C:R+1:A
QQWING_CURRENT=3
QQWING_REVISION=0
QQWING_AGE=1

AC_SUBST([QQWING_CURRENT])
AC_SUBST([QQWING_REVISION])
AC_SUBST([QQWING_AGE])

AM_INIT_AUTOMAKE([foreign])

# Checks for programs.
AC_PROG_CXX
AC_PROG_CC

LT_PREREQ([2.2])
LT_INIT([disable-static])

# Checks for libraries.

# Checks for header files.
AC_HEADER_STDC
AC_CHECK_HEADERS([stdlib.h sys/time.h])

# Checks for typedefs, structures, and compiler characteristics.
AC_HEADER_STDBOOL
AC_C_CONST
AC_C_INLINE
AC_HEADER_TIME

# Checks for library functions.
AC_CHECK_FUNCS([gettimeofday])

AC_CONFIG_FILES([Makefile qqwing.pc])
AC_OUTPUT
