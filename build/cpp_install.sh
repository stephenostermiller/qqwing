#/bin/sh
set -e

if [ -e target/install ]
then
	newer=`find target/qqwing -type f -newer target/install`
	if [ "z$newer" = "z" ]
	then
		exit 0
	fi
fi

cd target/automake
sudo make install
cd ../..
touch target/install
