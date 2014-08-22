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
qqwing.PrintStyle = {
	ONE_LINE: 0,
	COMPACT: 1,
	READABLE: 2,
	CSV: 3
};

qqwing.Difficulty = {
	UNKNOWN: 0,
	SIMPLE: 1,
	EASY: 2,
	INTERMEDIATE: 3,
	EXPERT: 4
};

qqwing.Symmetry = {
	NONE: 0,
	ROTATE90: 1,
	ROTATE180: 2,
	MIRROR: 3,
	FLIP: 4,
	RANDOM: 5
};

qqwing.LogType = {
	GIVEN: 0,
	SINGLE: 1,
	HIDDEN_SINGLE_ROW: 2,
	HIDDEN_SINGLE_COLUMN: 3,
	HIDDEN_SINGLE_SECTION: 4,
	GUESS: 5,
	ROLLBACK: 6,
	NAKED_PAIR_ROW: 7,
	NAKED_PAIR_COLUMN: 8,
	NAKED_PAIR_SECTION: 9,
	POINTING_PAIR_TRIPLE_ROW: 10,
	POINTING_PAIR_TRIPLE_COLUMN: 11,
	ROW_BOX: 12,
	COLUMN_BOX: 13,
	HIDDEN_PAIR_ROW: 14,
	HIDDEN_PAIR_COLUMN: 15,
	HIDDEN_PAIR_SECTION: 16
};

qqwing.GRID_SIZE = 3;
qqwing.ROW_COL_SEC_SIZE = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.SEC_GROUP_SIZE = qqwing.ROW_COL_SEC_SIZE*qqwing.GRID_SIZE;
qqwing.BOARD_SIZE = qqwing.ROW_COL_SEC_SIZE*qqwing.ROW_COL_SEC_SIZE;
qqwing.POSSIBILITY_SIZE = qqwing.BOARD_SIZE*qqwing.ROW_COL_SEC_SIZE;
