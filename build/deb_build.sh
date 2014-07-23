#/bin/sh
set -e

version=`build/version.sh`
tgz=qqwing-$version.tar.gz

if ls target/*.deb &> /dev/null;
then
	file=`ls target/*.deb -1 | head -n 1`
	newer=`find build/debian* target/$tgz -type f -newer $file`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

echo "Building debian package"
rm -rf target/deb
mkdir -p target/deb
cp target/qqwing-$version.tar.gz target/deb/qqwing_$version.orig.tar.gz
cd target/deb
tar xfz qqwing_$version.orig.tar.gz
cd qqwing-$version
mkdir debian
export DEBEMAIL='debian@ostermiller.org'
export DEBFULLNAME='Stephen Ostermiller'
cp ../../../build/debian-changelog.txt debian/changelog
cp ../../../build/debian-control.txt debian/control
cp ../../../build/debian-copyright.txt debian/copyright
cp ../../../build/debian-rules.txt debian/rules
mkdir -p debian/source
echo "3.0 (quilt)" > debian/source/format
echo 9 > debian/compat

debuild -us -uc

cd ../../..
cp target/deb/qqwing*.deb target/
ls target/*.deb
