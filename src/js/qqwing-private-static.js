/*
 * qqwing - Sudoku solver and generator
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
var GRID_SIZE = 3;
var ROW_LENGTH = GRID_SIZE*GRID_SIZE;
var COL_HEIGHT = GRID_SIZE*GRID_SIZE;
var SEC_SIZE = GRID_SIZE*GRID_SIZE;
var SEC_COUNT = GRID_SIZE*GRID_SIZE;
var SEC_GROUP_SIZE = SEC_SIZE*GRID_SIZE;
var NUM_POSS = GRID_SIZE*GRID_SIZE;
var BOARD_SIZE = ROW_LENGTH*COL_HEIGHT;
var POSSIBILITY_SIZE = BOARD_SIZE*NUM_POSS;

/**
 * Given the index of a cell (0-80) calculate
 * the column (0-8) in which that cell resides.
 */
var cellToColumn = function(cell){
	return cell%COL_HEIGHT;
};

/**
 * Given the index of a cell (0-80) calculate
 * the row (0-8) in which it resides.
 */
var cellToRow = function(cell){
	return Math.floor(cell/ROW_LENGTH);
};

/**
 * Given the index of a cell (0-80) calculate
 * the cell (0-80) that is the upper left start
 * cell of that section.
 */
var cellToSectionStartCell = function(cell){
	return Math.floor(cell/SEC_GROUP_SIZE)*SEC_GROUP_SIZE
			+ Math.floor(cellToColumn(cell)/GRID_SIZE)*GRID_SIZE;
};

/**
 * Given the index of a cell (0-80) calculate
 * the section (0-8) in which it resides.
 */
var cellToSection = function(cell){
	return Math.floor(cell/SEC_GROUP_SIZE)*GRID_SIZE
			+ Math.floor(cellToColumn(cell)/GRID_SIZE);
};

/**
 * Given a row (0-8) calculate the first cell (0-80)
 * of that row.
 */
var rowToFirstCell = function(row){
	return 9*row;
};

/**
 * Given a column (0-8) calculate the first cell (0-80)
 * of that column.
 */
var columnToFirstCell = function(column){
	return column;
};

/**
 * Given a section (0-8) calculate the first cell (0-80)
 * of that section.
 */
var sectionToFirstCell = function(section){
	return (section%GRID_SIZE*GRID_SIZE) + Math.floor(section/GRID_SIZE)*SEC_GROUP_SIZE;
};

/**
 * Given a value for a cell (0-8) and a cell (0-80)
 * calculate the offset into the possibility array (0-728).
 */
var getPossibilityIndex = function(valueIndex, cell){
	return valueIndex+(NUM_POSS*cell);
};

/**
 * Given a row (0-8) and a column (0-8) calculate the
 * cell (0-80).
 */
var rowColumnToCell = function(row, column){
	return (row*COL_HEIGHT)+column;
};

/**
 * Given a section (0-8) and an offset into that section (0-8)
 * calculate the cell (0-80)
 */
var sectionToCell = function(section, offset){
	return sectionToFirstCell(section)
			+ Math.floor(offset/GRID_SIZE)*SEC_SIZE
			+ (offset%GRID_SIZE);
};
