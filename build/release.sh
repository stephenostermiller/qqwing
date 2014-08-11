#/bin/sh

set -e

version=`build/version.sh`
major=`echo $version | cut -f1 -d.`
let "nextmajor=major+1"
minor=`echo $version | cut -f2 -d.`
let "nextminor=minor+1"
bugfix=`echo $version | cut -f3 -d.`
let "nextbugfix=bugfix+1"

nextversion="0"
while [ $nextversion == "0" ]
do
	echo "Current version: $version"
	echo "Release type: "
	echo "1) Major ($nextmajor.0.0)"
	echo "2) Minor ($major.$nextminor.0)"
	echo "3) Bugfix ($major.$minor.$nextbugfix)"
	read release_type
	case $release_type in
		"1" )
			nextversion="$nextmajor.0.0"
			;;
		"2" )
			nextversion="$major.$nextminor.0"
			;;
		"3" )
			nextversion="$major.$minor.$nextbugfix"
			;;
	esac
done

rm -rf debian/
mkdir -p debian
cp build/debian-changelog.txt  debian/changelog
cp build/debian-control.txt  debian/control
dch -v $nextversion-1 -M

if ! grep -q $nextversion debian/changelog
then
	echo "Aborting release"
	rm -rf debian/
	exit 1
fi
sed -i 's/UNRELEASED/RELEASED/g' build/debian-changelog.txt
cp debian/changelog build/debian-changelog.txt
rm -rf debian

sed -i s/$version/$nextversion/g src/java/QQWing.java build/configure.ac

make clean
make

echo "Changed to next version: $nextversion"
