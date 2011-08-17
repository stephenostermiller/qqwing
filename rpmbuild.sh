#/bin/sh

set -e
set -x

srcdir=$1
PACKAGE=$2
RPM_BUILD_DIR=$3
VERSION=$4
RPM_BUILD_TARGET=$5
MAKE=$6

if [ "z$srcdir" == "z" ]
then
  echo "specifiy srcdir as arg 1"
  exit 1;
fi

if [ "z$PACKAGE" == "z" ]
then
  echo "specifiy PACKAGE as arg 2"
  exit 1;
fi

if [ "z$RPM_BUILD_DIR" == "z" ]
then
  echo "specifiy RPM_BUILD_DIR as arg 3"
  exit 1;
fi

if [ "z$VERSION" == "z" ]
then
  echo "specifiy VERSION as arg 4"
  exit 1;
fi

if [ "z$RPM_BUILD_TARGET" == "z" ]
then
  echo "specifiy RPM_BUILD_TARGET as arg 5"
  exit 1;
fi

if [ "z$MAKE" == "z" ]
then
  echo "specifiy z$MAKE as arg 6"
  exit 1;
fi

if ! test -f $srcdir/$PACKAGE.spec
then 
	echo "RPM spec file '$PACKAGE.spec' missing from '$srcdir' directory; aborting rpm build" 1>&2 
	exit 1 
fi 
mkdir -p $RPM_BUILD_DIR/BUILD
mkdir -p $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET
mkdir -p $RPM_BUILD_DIR/SOURCES
mkdir -p $RPM_BUILD_DIR/SPECS
mkdir -p $RPM_BUILD_DIR/SRPMS
rm -f $srcdir/$PACKAGE-$VERSION.tar.gz 
rm -f $srcdir/$PACKAGE-$VERSION-1.src.rpm 
rm -f $srcdir/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm 
cat $srcdir/$PACKAGE.spec | sed s/VERSION/$VERSION/g > $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
$MAKE dist
cp -f $srcdir/$PACKAGE-$VERSION.tar.gz $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rpmbuild -ba --target=$RPM_BUILD_TARGET -v $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
cp -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm $srcdir 
cp -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm $srcdir
rm -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm 
rm -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm 
rm -f $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
rm -f $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rm -rf $RPM_BUILD_DIR/BUILD/$PACKAGE-$VERSION
