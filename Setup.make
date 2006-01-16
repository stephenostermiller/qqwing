all: build

autoconf:
	touch config.h.in
	aclocal
	automake -a -c
	autoreconf
	rm -f config.h.in~

build: autoconf
	./configure
	make

install: build
	make install

clean:
	rm -rf `cat .cvsignore`

dist: build
	make dist    
