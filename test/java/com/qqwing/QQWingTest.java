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
package com.qqwing;

import java.util.*;

public class QQWingTest {

	/* Range is inclusive */
	private static final void assertRange(int actual, int min, int max){
		if (actual < min || actual > max) throw new RuntimeException (actual + " is outside range " + min + "-" + max);
		System.out.print(".");
	}

	private static final void assertUnique(int actual, HashSet<Integer> values){
		Integer i = actual;
		if (values.contains(i)) throw new RuntimeException (actual + " is not unique");
		values.add(i);
		System.out.print(".");
	}

	private static final void assertEqual(int actual, int expected){
		if (actual != expected) throw new RuntimeException (actual + " is expected " + expected);
		System.out.print(".");
	}

	public static void main(String [] args){
		try {
			sectionCellConversion();
			rowColumnCellConversion();
			possibilityConversion();
		} catch (Exception x){
			System.out.println();
			x.printStackTrace(System.err);
			System.exit(1);
		}
		System.out.println();
		System.exit(0);

	}

	private static void sectionCellConversion(){
		HashSet<Integer> set = new HashSet<>();
		for (int section=0; section<QQWing.ROW_COL_SEC_SIZE; section++){
			int sectionStartCell = -1;
			for (int offset=0; offset<QQWing.ROW_COL_SEC_SIZE; offset++){
				int cell = QQWing.sectionToCell(section,offset);
				if (offset == 0) sectionStartCell = cell;
				assertRange(cell,0,QQWing.BOARD_SIZE);
				assertUnique(cell, set);
				assertEqual(section, QQWing.cellToSection(cell));
				assertEqual(sectionStartCell, QQWing.cellToSectionStartCell(cell));
				assertEqual(sectionStartCell, QQWing.sectionToFirstCell(section));
			}
		}
	}

	private static void rowColumnCellConversion(){
		HashSet<Integer> set = new HashSet<>();
		for (int row=0; row<QQWing.ROW_COL_SEC_SIZE; row++){
			for (int col=0; col<QQWing.ROW_COL_SEC_SIZE; col++){
				int cell = QQWing.rowColumnToCell(row,col);
				assertRange(cell,0,QQWing.BOARD_SIZE);
				assertUnique(cell, set);
				assertEqual(row, QQWing.cellToRow(cell));
				assertEqual(col, QQWing.cellToColumn(cell));
				assertEqual(QQWing.rowColumnToCell(0,col), QQWing.columnToFirstCell(col));
			}
			assertEqual(QQWing.rowColumnToCell(row,0), QQWing.rowToFirstCell(row));
		}
	}

	private static void possibilityConversion(){
		HashSet<Integer> set = new HashSet<>();
		for (int value=0; value<QQWing.ROW_COL_SEC_SIZE; value++){
			for (int cell=0; cell<QQWing.BOARD_SIZE; cell++){
				assertUnique(QQWing.getPossibilityIndex(value, cell), set);
			}
		}
	}
}
