#!/bin/sh

set -e

mkdir -p target

if [ -e target/website ]
then
	newer=`find src/ build/configure.ac doc/www -type f -newer target/website`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

version=`build/version.sh`

mkdir -p target/www

for file in doc/www/bte/*.bte
do
	sed "s/VERSION/$version/g" $file > target/www/${file##*/}
done
for file in doc/www/*.html
do
	name=${file##*/}
	sed "s/VERSION/$version/g" $file > target/www/$name
done

cp doc/www/css/*.css target/www/
cp target/jsmin/qqwing-html-$version.min.js target/www
cp target/jsmin/qqwing-play-$version.min.js target/www

cd target/www
bte *.bte
tohtml ../../src/cpp/qqwing.cpp -s "" -f -i whitespace -t cppsource.bte -o ./qqwing.cpp.html
tohtml ../../src/cpp/qqwing.hpp -s "" -f -i whitespace -t cppsource.bte -o ./qqwing.hpp.html
tohtml ../../src/cpp/main.cpp -s "" -f -i whitespace -t cppsource.bte -o ./main.cpp.html
tohtml ../../src/java/QQWing.java -s "" -f -i whitespace -t javasource.bte -o ./QQWing.java.html
rm *.bte
cp ../qqwing*.* .
cd ../..

echo "Website built in target/www"
touch target/website
