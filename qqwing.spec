Summary: Sudoku generator and solver
License: GNU General Public License, http://www.gnu.org/copyleft/gpl.html
Name: qqwing
Group: Games
Prefix: /usr
Release: 1
Version: VERSION
Source: %{name}-%{version}.tar.gz
URL: http://ostermiller.org/qqwing/
Buildroot: /tmp/qqwingrpm
Packager: Stephen Ostermiller, http://ostermiller.org/contact.pl?regarding=QQwing

%description
QQwing can solve or generate Sudoku puzzles.
http://ostermiller.org/qqwing/

%prep
%setup -q

%build
./configure --prefix=$RPM_BUILD_ROOT/%{_prefix}
make 

%install
make install

%clean
rm -rf $RPM_BUILD_ROOT

%files
%defattr(-,root,root)
%doc AUTHORS COPYING ChangeLog NEWS README
%{_bindir}/%{name}
