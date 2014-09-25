Summary: Sudoku generator and solver
License: GNU General Public License, http://www.gnu.org/copyleft/gpl.html
Name: qqwing
Group: Games
Prefix: /usr
Release: 1
Version: VERSION
Source: %{name}-%{version}.tar.gz
URL: http://qqwing.com/
Buildroot: /tmp/qqwingrpm
Packager: Stephen Ostermiller, http://ostermiller.org/contact.pl?regarding=QQwing

%description
QQwing can solve or generate Sudoku puzzles.
http://qqwing.com/

%prep
%setup -q

%build
%configure
make

%install
make install DESTDIR=$RPM_BUILD_ROOT
rm -f $RPM_BUILD_ROOT%{_libdir}/*.la

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root)
%doc AUTHORS COPYING README
%{_bindir}/%{name}
%{_includedir}/%{name}.hpp
%{_libdir}/lib%{name}.so*
%{_libdir}/pkgconfig/%{name}.pc
%{_mandir}/man1/%{name}.1*
