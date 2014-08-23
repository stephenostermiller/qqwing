#!/usr/bin/perl
# qqwing - Sudoku solver and generator
# Copyright (C) 2014 Stephen Ostermiller
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License along
# with this program; if not, write to the Free Software Foundation, Inc.,
# 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
use strict;

for my $file (@ARGV){
	open (FILE, $file) or die $!;
	my $done = 0;
	my $line;
	my $style = "";
	while (!$done and $line = <FILE>){
		if ($style eq ""){
			if ($line =~ /^\<\!\-\-/){
				$style = "<!--";
			} elsif ($line =~ /^[\#\<]\!/){
				# ignore first line with hash bang or doctype
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
			print "$line";
		}
		if ($style eq "/*"){
			if ($line =~ /\*\//){
				$done = 1;
			}
		}
		if ($style eq "<!--"){
			if ($line =~ /\-\-\>/){
				$done = 1;
			}
		}
	}
	close (FILE);
}
