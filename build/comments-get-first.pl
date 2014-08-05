#!/usr/bin/perl
use strict;

for my $file (@ARGV){
	open (FILE, $file) or die $!;
	my $done = 0;
	my $line;
	my $style = "";
	my $sawblank = 0;
	my $printedsomething = 0;
	while (!$done and $line = <FILE>){
		if ($style eq ""){
			if ($line =~ /^\#\!/){
				# ignore first line with hash bang
			} elsif ($line =~ /^$/){
				# ignore blank lines
			} elsif ($line =~ /^\/\*/){
				$style = "/*";
			} elsif ($line =~ /^\#/){
				$style = "#";
			} else {
				print "\n";
				$done = 1;
			}
		}
		if ($style eq "#"){
			if ($line !~ /^\#/){
				$done = 1;
			}
		}
		if (!$done and $style ne ""){
			my $text = $line;
			$text =~ s/^\# //g if ($style eq '#');
			$text =~ s/^((\/\*)|( ?\*\/?)) ?//g if ($style eq '/*');
			if ($text =~ /^[ \t\r\n]*$/){
				$sawblank=1;
			} else {
				print "\n" if ($printedsomething and $sawblank);
				print "$text";
				$printedsomething=1;
				$sawblank=0;
			}
		}
		if ($style eq "/*"){
			if ($line =~ /\*\//){
				$done = 1;
			}
		}
	}
	close (FILE);
}
