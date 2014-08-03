AC_PREREQ(2.59)
AC_INIT(qqwing, 1.1.2, http://ostermiller.org/qqwing/)
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_SRCDIR([config.h.in])
AC_CONFIG_HEADER([config.h])

# Increment on interface add, remove, or change.
QQWING_CURRENT=1
# Increment on source change. Reset when CURRENT changes.
QQWING_REVISION=0
# Increment on interface addition. Reset on removal.
QQWING_AGE=1

AC_SUBST([QQWING_CURRENT])
AC_SUBST([QQWING_REVISION])
AC_SUBST([QQWING_AGE])

AM_INIT_AUTOMAKE

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
