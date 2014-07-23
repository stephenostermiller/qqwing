#/bin/sh

set -e

export PACKAGE=`grep AC_INIT build/configure.ac | sed 's|AC_INIT(||g' | sed 's|,.*||g'`
export VERSION=`build/version.sh`
export RPM_BUILD_TARGET=`uname -m`

mkdir -p target/rpm
cp -v build/qqwing.spec target/qqwing*.tar.gz target/rpm
cd target/rpm
RPM_BUILD_DIR=`rpmbuild qqwing.spec 2>&1 | sed 's|.*File ||g' | sed 's|/SOURCES.*||g'`
cd ../..

mkdir -p $RPM_BUILD_DIR/BUILD
mkdir -p $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET
mkdir -p $RPM_BUILD_DIR/SOURCES
mkdir -p $RPM_BUILD_DIR/SPECS
mkdir -p $RPM_BUILD_DIR/SRPMS
cat build/$PACKAGE.spec | sed s/VERSION/$VERSION/g > $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
cp -f target/$PACKAGE-$VERSION.tar.gz $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rpmbuild -ba --target $RPM_BUILD_TARGET -v $RPM_BUILD_DIR/SPECS/$PACKAGE.spec
cp -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm target/
cp -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm target/
rm -f $RPM_BUILD_DIR/RPMS/$RPM_BUILD_TARGET/$PACKAGE-$VERSION-1.$RPM_BUILD_TARGET.rpm 
rm -f $RPM_BUILD_DIR/SRPMS/$PACKAGE-$VERSION-1.src.rpm 
rm -f $RPM_BUILD_DIR/SPECS/$PACKAGE.spec 
rm -f $RPM_BUILD_DIR/SOURCES/$PACKAGE-$VERSION.tar.gz 
rm -rf $RPM_BUILD_DIR/BUILD/$PACKAGE-$VERSION
