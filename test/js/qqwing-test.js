/*
 * Unit tests for qqwing - Sudoku solver and generator
 * Copyright (C) 2014 Stephen Ostermiller
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* Range is inclusive */
function assertRange(actual, min, max){
	if (actual < min || actual > max) throw new Error(actual + " is outside range " + min + "-" + max);
	process.stdout.write(".");
}

function assertUnique(actual, values){
	var i = "" + actual;
	if (values[i]) throw new Error(actual + " is not unique");
	values[i] = 1;
	process.stdout.write(".");
}

function assertEqual(actual, expected){
	if (actual != expected) throw new Error(actual + " is expected " + expected);
	process.stdout.write(".");
}

sectionCellConversion();
rowColumnCellConversion();
possibilityConversion();
console.log("");

function sectionCellConversion(){
	var set = {};
	for (var section=0; section<qqwing.SEC_SIZE; section++){
		var sectionStartCell = -1;
		for (var offset=0; offset<qqwing.SEC_SIZE; offset++){
			var cell = qqwing.sectionToCell(section,offset);
			if (offset == 0) sectionStartCell = cell;
			assertRange(cell,0,qqwing.BOARD_SIZE);
			assertUnique(cell, set);
			assertEqual(section, qqwing.cellToSection(cell));
			assertEqual(sectionStartCell, qqwing.cellToSectionStartCell(cell));
			assertEqual(sectionStartCell, qqwing.sectionToFirstCell(section));
		}
	}
}

function rowColumnCellConversion(){
	var set = {};
	for (var row=0; row<qqwing.ROW_LENGTH; row++){
		for (var col=0; col<qqwing.COL_HEIGHT; col++){
			var cell = qqwing.rowColumnToCell(row,col);
			assertRange(cell,0,qqwing.BOARD_SIZE);
			assertUnique(cell, set);
			assertEqual(row, qqwing.cellToRow(cell));
			assertEqual(col, qqwing.cellToColumn(cell));
			assertEqual(qqwing.rowColumnToCell(0,col), qqwing.columnToFirstCell(col));
		}
		assertEqual(qqwing.rowColumnToCell(row,0), qqwing.rowToFirstCell(row));
	}
}

function possibilityConversion(){
	var set = {};
	for (var value=0; value<qqwing.SEC_SIZE; value++){
		for (var cell=0; cell<qqwing.BOARD_SIZE; cell++){
			assertUnique(qqwing.getPossibilityIndex(value, cell), set);
		}
	}
}
