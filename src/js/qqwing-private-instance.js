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

/**
 * The 81 integers that make up a sudoku puzzle.
 * Givens are 1-9, unknowns are 0.
 * Once initialized, this puzzle remains as is.
 * The answer is worked out in "solution".
 */
var puzzle = new Array(qqwing.BOARD_SIZE);

/**
 * The 81 integers that make up a sudoku puzzle.
 * The solution is built here, after completion
 * all will be 1-9.
 */
var solution = new Array(qqwing.BOARD_SIZE);

/**
 * Recursion depth at which each of the numbers
 * in the solution were placed.  Useful for backing
 * out solve branches that don't lead to a solution.
 */
var solutionRound = new Array(qqwing.BOARD_SIZE);

/**
 * The 729 integers that make up a the possible
 * values for a Sudoku puzzle. (9 possibilities
 * for each of 81 squares).  If possibilities[i]
 * is zero, then the possibility could still be
 * filled in according to the Sudoku rules.  When
 * a possibility is eliminated, possibilities[i]
 * is assigned the round (level) at
 * which it was determined that it could not be
 * a possibility.
 */
var possibilities = new Array(qqwing.POSSIBILITY_SIZE);

/**
 * An array the size of the board (81) containing each
 * of the numbers 0-n exactly once.  This array may
 * be shuffled so that operations that need to
 * look at each cell can do so in a random order.
 */
var randomBoardArray = new Array(qqwing.BOARD_SIZE);

for (var i=0; i<qqwing.BOARD_SIZE; i++){
	randomBoardArray[i] = i;
}

/**
 * An array with one element for each position (9), in
 * some random order to be used when trying each
 * position in turn during guesses.
 */
var randomPossibilityArray = new Array(qqwing.ROW_COL_SEC_SIZE);

for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
	randomPossibilityArray[i] = i;
}

/**
 * Whether or not to record history
 */
var recordHistory = false;

/**
 * Whether or not to print history as it happens
 */
var logHistory = false;

/**
 * A list of moves used to solve the puzzle.
 * This list contains all moves, on solve
 * branches that did not lead to a solution.
 */
var solveHistory = [];

/**
 * A list of moves used to solve the puzzle.
 * This list contains only the moves needed
 * to solve the puzzle, doesn't contain
 * information about bad guesses.
 */
var solveInstructions = [];

/**
 * The style with which to print puzzles and solutions
 */
var printStyle = qqwing.PrintStyle.READABLE;

/**
 * The last round of solving
 */
var lastSolveRound = 0;

/**
 * Reset the board to its initial state with
 * only the givens.
 * This method clears any solution, resets statistics,
 * and clears any history messages.
 */
var reset = function(){
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		solution[i] = 0;
	}
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		solutionRound[i] = 0;
	}
	for (var i=0; i<qqwing.POSSIBILITY_SIZE; i++){
		possibilities[i] = 0;
	}
	solveHistory = [];
	solveInstructions = [];

	var round = 1;
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (puzzle[position] > 0){
			var valIndex = puzzle[position]-1;
			var valPos = getPossibilityIndex(valIndex,position);
			var value = puzzle[position];
			if (possibilities[valPos] != 0) return false;
			mark.call(this,position,round,value);
			if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.GIVEN, value, position));
		}
	}
	return true;
};

var singleSolveMove = function(round){
	if (onlyPossibilityForCell.call(this, round)) return true;
	if (onlyValueInSection.call(this, round)) return true;
	if (onlyValueInRow.call(this, round)) return true;
	if (onlyValueInColumn.call(this, round)) return true;
	if (handleNakedPairs.call(this, round)) return true;
	if (pointingRowReduction.call(this, round)) return true;
	if (pointingColumnReduction.call(this, round)) return true;
	if (rowBoxReduction.call(this, round)) return true;
	if (colBoxReduction.call(this, round)) return true;
	if (hiddenPairInRow.call(this, round)) return true;
	if (hiddenPairInColumn.call(this, round)) return true;
	if (hiddenPairInSection.call(this, round)) return true;
	return false;
};

/**
 * Mark exactly one cell that has a single possibility, if such a cell exists.
 * This method will look for a cell that has only one possibility.  This type
 * of cell is often called a "single"
 */
var onlyPossibilityForCell = function(round){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			var lastValue = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastValue=valIndex+1;
				}
			}
			if (count == 1){
				mark.call(this, position, round, lastValue);
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.SINGLE, lastValue, position));
				return true;
			}
		}
	}
	return false;
};

/**
 * Mark exactly one cell which is the only possible value for some row, if
 * such a cell exists.
 * This method will look in a row for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInRow = function(round){
	for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
				var position = (row*qqwing.ROW_COL_SEC_SIZE)+col;
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastPosition = position;
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_ROW, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}

/**
 * Mark exactly one cell which is the only possible value for some column, if
 * such a cell exists.
 * This method will look in a column for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInColumn = function(round){
	for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
				var position = rowColumnToCell(row,col);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					count++;
					lastPosition = position;
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_COLUMN, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}


/**
 * Mark exactly one cell which is the only possible value for some section, if
 * such a cell exists.
 * This method will look in a section for a possibility that is only listed
 * for one cell.  This type of cell is often called a "hidden single"
 */
var onlyValueInSection = function(round){
	for (var sec=0; sec<qqwing.ROW_COL_SEC_SIZE; sec++){
		var secPos = sectionToFirstCell(sec);
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var count = 0;
			var lastPosition = 0;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var position = secPos + i + qqwing.ROW_COL_SEC_SIZE*j;
					var valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
			}
			if (count == 1){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_SINGLE_SECTION, value, lastPosition));
				mark.call(this, lastPosition, round, value);
				return true;
			}
		}
	}
	return false;
}

var guess = function(round, guessNumber){
	var localGuessCount = 0;
	var position = findPositionWithFewestPossibilities.call(this);
	for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
		var valIndex = randomPossibilityArray[i];
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0){
			if (localGuessCount == guessNumber){
				var value = valIndex+1;
				if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.GUESS, value, position));
				mark.call(this, position, round, value);
				return true;
			}
			localGuessCount++;
		}
	}
	return false;
};

var isImpossible = function(){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0) count++;
			}
			if (count == 0) {
				return true;
			}
		}
	}
	return false;
};

var rollbackRound = function(round){
	if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROLLBACK));
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (solutionRound[i] == round){
			solutionRound[i] = 0;
			solution[i] = 0;
		}
	}
	{for (var i=0; i<qqwing.POSSIBILITY_SIZE; i++){
		if (possibilities[i] == round){
			possibilities[i] = 0;
		}
	}}

	while(solveInstructions.length > 0 && solveInstructions[solveInstructions.length-1] == round){
		solveInstructions.pop();
	}
};

var pointingRowReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
			var secStart = sectionToFirstCell(section);
			var inOneRow = true;
			var boxRow = -1;
			for (var j=0; j<qqwing.GRID_SIZE; j++){
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
					var valPos = getPossibilityIndex(valIndex,secVal);
					if(possibilities[valPos] == 0){
						if (boxRow == -1 || boxRow == j){
							boxRow = j;
						} else {
							inOneRow = false;
						}
					}
				}
			}
			if (inOneRow && boxRow != -1){
				var doneSomething = false;
				var row = cellToRow(secStart) + boxRow;
				var rowStart = rowToFirstCell(row);

				for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
					var position = rowStart+i;
					var section2 = cellToSection(position);
					var valPos = getPossibilityIndex(valIndex,position);
					if (section != section2 && possibilities[valPos] == 0){
						possibilities[valPos] = round;
						doneSomething = true;
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.POINTING_PAIR_TRIPLE_ROW, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var rowBoxReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
			var rowStart = rowToFirstCell(row);
			var inOneBox = true;
			var rowBox = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var column = i*qqwing.GRID_SIZE+j;
					var position = rowColumnToCell(row, column);
					var valPos = getPossibilityIndex(valIndex,position);
					if(possibilities[valPos] == 0){
						if (rowBox == -1 || rowBox == i){
							rowBox = i;
						} else {
							inOneBox = false;
						}
					}
				}
			}
			if (inOneBox && rowBox != -1){
				var doneSomething = false;
				var column = qqwing.GRID_SIZE*rowBox;
				var secStart = cellToSectionStartCell(rowColumnToCell(row, column));
				var secStartRow = cellToRow(secStart);
				var secStartCol = cellToColumn(secStart);
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					for (var j=0; j<qqwing.GRID_SIZE; j++){
						var row2 = secStartRow+i;
						var col2 = secStartCol+j;
						var position = rowColumnToCell(row2, col2);
						var valPos = getPossibilityIndex(valIndex,position);
						if (row != row2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROW_BOX, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var colBoxReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
			var rowStart = rowToFirstCell(row);
			var inOneBox = true;
			var rowBox = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var column = i*qqwing.GRID_SIZE+j;
					var position = rowColumnToCell(row, column);
					var valPos = getPossibilityIndex(valIndex,position);
					if(possibilities[valPos] == 0){
						if (rowBox == -1 || rowBox == i){
							rowBox = i;
						} else {
							inOneBox = false;
						}
					}
				}
			}
			if (inOneBox && rowBox != -1){
				var doneSomething = false;
				var column = qqwing.GRID_SIZE*rowBox;
				var secStart = cellToSectionStartCell(rowColumnToCell(row, column));
				var secStartRow = cellToRow(secStart);
				var secStartCol = cellToColumn(secStart);
				for (var i=0; i<qqwing.GRID_SIZE; i++){
					for (var j=0; j<qqwing.GRID_SIZE; j++){
						var row2 = secStartRow+i;
						var col2 = secStartCol+j;
						var position = rowColumnToCell(row2, col2);
						var valPos = getPossibilityIndex(valIndex,position);
						if (row != row2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.ROW_BOX, valIndex+1, rowStart));
					return true;
				}
			}
		}
	}
	return false;
};

var pointingColumnReduction = function(round){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
			var secStart = sectionToFirstCell(section);
			var inOneCol = true;
			var boxCol = -1;
			for (var i=0; i<qqwing.GRID_SIZE; i++){
				for (var j=0; j<qqwing.GRID_SIZE; j++){
					var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
					var valPos = getPossibilityIndex(valIndex,secVal);
					if(possibilities[valPos] == 0){
						if (boxCol == -1 || boxCol == i){
							boxCol = i;
						} else {
							inOneCol = false;
						}
					}
				}
			}
			if (inOneCol && boxCol != -1){
				var doneSomething = false;
				var col = cellToColumn(secStart) + boxCol;
				var colStart = columnToFirstCell(col);

				for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
					var position = colStart+(qqwing.ROW_COL_SEC_SIZE*i);
					var section2 = cellToSection(position);
					var valPos = getPossibilityIndex(valIndex,position);
					if (section != section2 && possibilities[valPos] == 0){
						possibilities[valPos] = round;
						doneSomething = true;
					}
				}
				if (doneSomething){
					if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN, valIndex+1, colStart));
					return true;
				}
			}
		}
	}
	return false;
}

var hiddenPairInRow = function(round){
	for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var c1 = -1;
			var c2 = -1;
			var valCount = 0;
			for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
				var position = rowColumnToCell(row,column);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (c1 == -1 || c1 == column){
						c1 = column;
					} else if (c2 == -1 || c2 == column){
						c2 = column;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var c3 = -1;
					var c4 = -1;
					var valCount2 = 0;
					for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
						var position = rowColumnToCell(row,column);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (c3 == -1 || c3 == column){
								c3 = column;
							} else if (c4 == -1 || c4 == column){
								c4 = column;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && c1==c3 && c2==c4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = rowColumnToCell(row,c1);
								var position2 = rowColumnToCell(row,c2);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_ROW, valIndex+1, rowColumnToCell(row,c1)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

var hiddenPairInColumn = function(round){
	for (var column=0; column<qqwing.ROW_COL_SEC_SIZE; column++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var r1 = -1;
			var r2 = -1;
			var valCount = 0;
			for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
				var position = rowColumnToCell(row,column);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (r1 == -1 || r1 == row){
						r1 = row;
					} else if (r2 == -1 || r2 == row){
						r2 = row;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var r3 = -1;
					var r4 = -1;
					var valCount2 = 0;
					for (var row=0; row<qqwing.ROW_COL_SEC_SIZE; row++){
						var position = rowColumnToCell(row,column);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (r3 == -1 || r3 == row){
								r3 = row;
							} else if (r4 == -1 || r4 == row){
								r4 = row;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && r1==r3 && r2==r4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = rowColumnToCell(r1,column);
								var position2 = rowColumnToCell(r2,column);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_COLUMN, valIndex+1, rowColumnToCell(r1,column)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

var hiddenPairInSection = function(round){
	for (var section=0; section<qqwing.ROW_COL_SEC_SIZE; section++){
		for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
			var si1 = -1;
			var si2 = -1;
			var valCount = 0;
			for (var secInd=0; secInd<qqwing.ROW_COL_SEC_SIZE; secInd++){
				var position = sectionToCell(section,secInd);
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0){
					if (si1 == -1 || si1 == secInd){
						si1 = secInd;
					} else if (si2 == -1 || si2 == secInd){
						si2 = secInd;
					}
					valCount++;
				}
			}
			if (valCount==2){
				for (var valIndex2=valIndex+1; valIndex2<qqwing.ROW_COL_SEC_SIZE; valIndex2++){
					var si3 = -1;
					var si4 = -1;
					var valCount2 = 0;
					for (var secInd=0; secInd<qqwing.ROW_COL_SEC_SIZE; secInd++){
						var position = sectionToCell(section,secInd);
						var valPos = getPossibilityIndex(valIndex2,position);
						if (possibilities[valPos] == 0){
							if (si3 == -1 || si3 == secInd){
								si3 = secInd;
							} else if (si4 == -1 || si4 == secInd){
								si4 = secInd;
							}
							valCount2++;
						}
					}
					if (valCount2==2 && si1==si3 && si2==si4){
						var doneSomething = false;
						for (var valIndex3=0; valIndex3<qqwing.ROW_COL_SEC_SIZE; valIndex3++){
							if (valIndex3 != valIndex && valIndex3 != valIndex2){
								var position1 = sectionToCell(section,si1);
								var position2 = sectionToCell(section,si2);
								var valPos1 = getPossibilityIndex(valIndex3,position1);
								var valPos2 = getPossibilityIndex(valIndex3,position2);
								if (possibilities[valPos1] == 0){
									possibilities[valPos1] = round;
									doneSomething = true;
								}
								if (possibilities[valPos2] == 0){
									possibilities[valPos2] = round;
									doneSomething = true;
								}
							}
						}
						if (doneSomething){
							if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.HIDDEN_PAIR_SECTION, valIndex+1, sectionToCell(section,si1)));
							return true;
						}
					}
				}
			}
		}
	}
	return false;
};

/**
 * Mark the given value at the given position.  Go through
 * the row, column, and section for the position and remove
 * the value from the possibilities.
 *
 * @param position Position into the board (0-80)
 * @param round Round to mark for rollback purposes
 * @param value The value to go in the square at the given position
 */
var mark = function(position, round, value){
	if (solution[position] != 0) throw ("Marking position that already has been marked.");
	if (solutionRound[position] !=0) throw ("Marking position that was marked another round.");
	var valIndex = value-1;
	solution[position] = value;

	var possInd = getPossibilityIndex(valIndex,position);
	if (possibilities[possInd] != 0) throw ("Marking impossible position.");

	// Take this value out of the possibilities for everything in the row
	solutionRound[position] = round;
	var rowStart = cellToRow(position)*qqwing.ROW_COL_SEC_SIZE;
	for (var col=0; col<qqwing.ROW_COL_SEC_SIZE; col++){
		var rowVal=rowStart+col;
		var valPos = getPossibilityIndex(valIndex,rowVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in the column
	var colStart = cellToColumn(position);
	for (var i=0; i<qqwing.ROW_COL_SEC_SIZE; i++){
		var colVal=colStart+(qqwing.ROW_COL_SEC_SIZE*i);
		var valPos = getPossibilityIndex(valIndex,colVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in section
	var secStart = cellToSectionStartCell(position);
	for (var i=0; i<qqwing.GRID_SIZE; i++){
		for (var j=0; j<qqwing.GRID_SIZE; j++){
			var secVal=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
			var valPos = getPossibilityIndex(valIndex,secVal);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}
	}

	//This position itself is determined, it should have possibilities.
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}
};

var findPositionWithFewestPossibilities = function(){
	var minPossibilities = 10;
	var bestPosition = 0;
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		var position = randomBoardArray[i];
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
				var valPos = getPossibilityIndex(valIndex,position);
				if (possibilities[valPos] == 0) count++;
			}
			if (count < minPossibilities){
				minPossibilities = count;
				bestPosition = position;
			}
		}
	}
	return bestPosition;
};

var handleNakedPairs = function(round){
	for (var position=0; position<qqwing.BOARD_SIZE; position++){
		var possibilities = countPossibilities(position);
		if (possibilities == 2){
			var row = cellToRow(position);
			var column = cellToColumn(position);
			var section = cellToSectionStartCell(position);
			for (var position2=position; position2<qqwing.BOARD_SIZE; position2++){
				if (position != position2){
					var possibilities2 = countPossibilities(position2);
					if (possibilities2 == 2 && arePossibilitiesSame(position, position2)){
						if (row == cellToRow(position2)){
							var doneSomething = false;
							for (var column2=0; column2<qqwing.ROW_COL_SEC_SIZE; column2++){
								var position3 = rowColumnToCell(row,column2);
								if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
									doneSomething = true;
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_ROW, 0, position));
								return true;
							}
						}
						if (column == cellToColumn(position2)){
							var doneSomething = false;
							for (var row2=0; row2<qqwing.ROW_COL_SEC_SIZE; row2++){
								var position3 = rowColumnToCell(row2,column);
								if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
									doneSomething = true;
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_COLUMN, 0, position));
								return true;
							}
						}
						if (section == cellToSectionStartCell(position2)){
							var doneSomething = false;
							var secStart = cellToSectionStartCell(position);
							for (var i=0; i<qqwing.GRID_SIZE; i++){
								for (var j=0; j<qqwing.GRID_SIZE; j++){
									var position3=secStart+i+(qqwing.ROW_COL_SEC_SIZE*j);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
							}
							if (doneSomething){
								if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.NAKED_PAIR_SECTION, 0, position));
								return true;
							}
						}
					}
				}
			}
		}
	}
	return false;
};

var countPossibilities = function(position){
	var count = 0;
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0) count++;
	}
	return count;
};

var arePossibilitiesSame = function(position1, position2){
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos1 = getPossibilityIndex(valIndex,position1);
		var valPos2 = getPossibilityIndex(valIndex,position2);
		if ((possibilities[valPos1] == 0 || possibilities[valPos2] == 0) && (possibilities[valPos1] != 0 || possibilities[valPos2] != 0)){
				return false;
		}
	}
	return true;
};

var addHistoryItem = function(l){
	if (logHistory) l.print();
	if (recordHistory){
		solveHistory.push(l);
		solveInstructions.push(l);
	}
};

var shuffleRandomArrays = function(){
	shuffleArray(randomBoardArray, qqwing.BOARD_SIZE);
	shuffleArray(randomPossibilityArray, qqwing.ROW_COL_SEC_SIZE);
};

/**
 * print the given BOARD_SIZEd array of ints
 * as a sudoku puzzle.  Use print options from
 * member variables.
 */
var print = function(puz){
	printnoln(sudokuToString.call(this, puz));
};

var sudokuToString = function(puz){
	var s = "";
	for(var i=0; i<qqwing.BOARD_SIZE; i++){
		if (printStyle == qqwing.PrintStyle.READABLE){
			s += " ";
		}
		if (puz[i]==0){
			s += '.';
		} else {
			s += puz[i];
		}
		if (i == qqwing.BOARD_SIZE-1){
			if (printStyle == qqwing.PrintStyle.CSV){
				s += ",";
			} else {
				s += "\n";
			}
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
		} else if (i%qqwing.ROW_COL_SEC_SIZE==qqwing.ROW_COL_SEC_SIZE-1){
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
			if (i%qqwing.SEC_GROUP_SIZE==qqwing.SEC_GROUP_SIZE-1){
				if (printStyle == qqwing.PrintStyle.READABLE){
					s += "-------|-------|-------\n";
				}
			}
		} else if (i%qqwing.GRID_SIZE==qqwing.GRID_SIZE-1){
			if (printStyle == qqwing.PrintStyle.READABLE){
				s += " |";
			}
		}
	}
	return s;
};

var rollbackNonGuesses = function(){
	// Guesses are odd rounds
	// Non-guesses are even rounds
	for (var i=2; i<=lastSolveRound; i+=2){
		rollbackRound.call(this, i);
	}
};

var clearPuzzle = function(){
	// Clear any existing puzzle
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		puzzle[i] = 0;
	}
	reset.call(this);
};

var printHistory = function(v){
	printnoln(getHistoryString(v));
};

var getHistoryString = function(v){
	var s = "";
	if (!recordHistory){
		s += "History was not recorded.";
		if (printStyle == qqwing.PrintStyle.CSV){
			s += " -- ";
		} else {
			s += "\n";
		}
	}
	for (var i=0;i<v.length;i++){
		s += i+1 + ". " + v[i].toString();
		if (printStyle == qqwing.PrintStyle.CSV){
			s += " -- ";
		} else {
			s += "\n";
		}
	}
	if (printStyle == qqwing.PrintStyle.CSV){
		s += ",";
	} else {
		s += "\n";
	}
	return s;
};

var removePossibilitiesInOneFromTwo = function(position1, position2, round){
	var doneSomething = false;
	for (var valIndex=0; valIndex<qqwing.ROW_COL_SEC_SIZE; valIndex++){
		var valPos1 = getPossibilityIndex(valIndex,position1);
		var valPos2 = getPossibilityIndex(valIndex,position2);
		if (possibilities[valPos1] == 0 && possibilities[valPos2] == 0){
			possibilities[valPos2] = round;
			doneSomething = true;
		}
	}
	return doneSomething;
};

/**
 * Shuffle the values in an array of integers.
 */
var shuffleArray = function(array, size){
	for (var i=0; i<size; i++){
		var tailSize = size-i;
		var randTailPos = Math.floor(Math.random() * tailSize) + i;
		var temp = array[i];
		array[i] = array[randTailPos];
		array[randTailPos] = temp;
	}
};

var getRandomSymmetry = function(){
	var rand = Math.floor(Math.random() * 4)
	switch (rand){
		case 0: return qqwing.Symmetry.ROTATE90;
		case 1: return qqwing.Symmetry.ROTATE180;
		case 2: return qqwing.Symmetry.MIRROR;
		case 3: return qqwing.Symmetry.FLIP;
	}
	throw ("Unexpected random value: " + rand);
};

var getLogCount = function(v, type){
	var count = 0;
	for (var i=0; i<v.length; i++){
		if((v[i]).getType() == type) count++;
	}
	return count;
};
