#!/usr/bin/perl

use strict;

for my $file (@ARGV){
	my $contents = "";
	open(FILE, $file) or die "cannot open $file: $!";
	my $changed = 0;
	while (my $line = <FILE>){
		if ($line =~ /(.*[^ \t])[ \t]+\n$/){
			print "$file: eol ws: $line";
			$line = "$1\n";
			$changed = 1;
		}
		if ($line !~ /\n$/){
			print "$file: no new line and end of line\n";
			$line .= "\n";
			$changed = 1;
		}
		if ($line =~ /^[ \t]+$/){
			print "$file: empty line with ws: $line";
			$line = "\n";
			$changed = 1;
		}
		if ($line =~ /^([\t]*[ ]+[\t ]*)([^ \t](.*))/){
			my ($ws, $code) = ($1, $2);
			my $oldline = $line;
			my @spaces = split(//,$ws);
			$line = "";
			my $spacecount = 0;
			my $linechanged = 0;
			for my $space (@spaces){
				if ("\t" eq $space){
					if ($spacecount != 0){
						die "Line in $file has other than four space tabs: $code";
					}
					$line .= "\t";
				} elsif (" " eq $space){
					$spacecount++;
					if ($spacecount == 4){
						$line .= "\t";
						$spacecount = 0;
						$changed = 1;
						$linechanged = 1;
					}
				}
			}
			if ($spacecount == 2 and $code =~ /^--/ and $file =~ /\.(sh)$/){
				$line .= " ";
			} elsif ($spacecount == 1 and $code =~ /^\*/ and $file =~ /\.(java|cpp|hpp)$/){
				$line .= " ";
			} elsif ($spacecount != 0){
				die "Line in $file has other than four space tabs: $code";
			}
			$line .= "$code\n";
			if ($linechanged){
				print "$file: spaces for tabs at start of: $oldline\n";
			}
		}
		$contents .= $line;
	}
	close(FILE) or die;
	if ($changed){
		print "Rewriting neatened: $file\n";
		open(FILE, ">$file") or die;
		print FILE $contents;
		close(FILE) or die;
	}
}
