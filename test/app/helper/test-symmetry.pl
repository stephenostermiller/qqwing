#!/usr/bin/perl

use strict;

my $symmetry = "none";
my $board = "";
for my $arg (@ARGV){
	if ($arg =~ /rotate90|rotate180|mirror|flip/){
		$symmetry = $arg;
	} elsif ($arg =~ /[1-9\.]{81}/){
		$board = $arg;
	} else {
		die "\nUnknown argument $arg";
	}
}
die "\nSpecify a symmetry" if ($symmetry eq "none");
die "\nBoard not specified" if ($board eq "");
$board =~ s/[1-9]/1/g;
my @boardarr = $board =~ /(.{9})/g;

if ($symmetry eq "mirror"){
	for (my $i=0; $i<9; $i++){
		for (my $j=0; $j<4; $j++){
			die "\nnot $symmetry symmetric: $board" if (&get($i,$j) ne &get($i,8-$j));
		}
	}
} elsif ($symmetry eq "flip"){
	for (my $i=0; $i<4; $i++){
		for (my $j=0; $j<9; $j++){
			die "\nnot $symmetry symmetric: $board" if (&get($i,$j) ne &get(8-$i,$j));
		}
	}
} elsif ($symmetry eq "rotate180"){
	for (my $i=0; $i<9; $i++){
		for (my $j=0; $j<9; $j++){
			die "\nnot $symmetry symmetric: $board" if (&get($i,$j) ne &get(8-$i,8-$j));
		}
	}
} elsif ($symmetry eq "rotate90"){
	for (my $i=0; $i<9; $i++){
		for (my $j=0; $j<9; $j++){
			die "\nnot $symmetry symmetric: $board" if (&get($i,$j) ne &get($j,8-$i));
		}
	}
}

sub get(){
	my ($i,$j) = @_;
	return substr(@boardarr[$i], $j, 1);
}
