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
 * Givens are 1-9, unknows are 0.
 * Once initialized, this puzzle remains as is.
 * The answer is worked out in "solution".
 */
var puzzle = new Array(BOARD_SIZE);

/**
 * The 81 integers that make up a sudoku puzzle.
 * The solution is built here, after completion
 * all will be 1-9.
 */
var solution = new Array(BOARD_SIZE);

/**
 * Recursion depth at which each of the numbers
 * in the solution were placed.  Useful for backing
 * out solve branches that don't lead to a solution.
 */
var solutionRound = new Array(BOARD_SIZE);

/**
 * The 729 integers that make up a the possible
 * values for a suduko puzzle. (9 possibilities
 * for each of 81 squares).  If possibilities[i]
 * is zero, then the possibility could still be
 * filled in according to the sudoku rules.  When
 * a possibility is eliminated, possibilities[i]
 * is assigned the round (level) at
 * which it was determined that it could not be
 * a possibility.
 */
var possibilities = new Array(POSSIBILITY_SIZE);

/**
 * An array the size of the board (81) containing each
 * of the numbers 0-n exactly once.  This array may
 * be shuffled so that operations that need to
 * look at each cell can do so in a random order.
 */
var randomBoardArray = new Array(BOARD_SIZE);

for (var i=0; i<BOARD_SIZE; i++){
	randomBoardArray[i] = i;
}

/**
 * An array with one element for each position (9), in
 * some random order to be used when trying each
 * position in turn during guesses.
 */
var randomPossibilityArray = new Array(NUM_POSS);

for (var i=0; i<NUM_POSS; i++){
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
	for (var i=0; i<BOARD_SIZE; i++){
		solution[i] = 0;
	}
	for (var i=0; i<BOARD_SIZE; i++){
		solutionRound[i] = 0;
	}
	for (var i=0; i<POSSIBILITY_SIZE; i++){
		possibilities[i] = 0;
	}
	solveHistory = [];
	solveInstructions = [];

	var round = 1;
	for (var position=0; position<BOARD_SIZE; position++){
		if (puzzle[position] > 0){
			var valIndex = puzzle[position]-1;
			var valPos = getPossibilityIndex(valIndex,position);
			var value = puzzle[position];
			if (possibilities[valPos] != 0) return false;
			mark.call(this,position,round,value);
			if (logHistory || recordHistory) addHistoryItem.call(this, new this.LogItem(round, qqwing.LogType.GIVEN, value, position));
		}
	}
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
	for (var position=0; position<BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			var lastValue = 0;
			for (var valIndex=0; valIndex<NUM_POSS; valIndex++){
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
var onlyValueInRow = function(round){
	/* TODO */
};
var onlyValueInColumn = function(round){
	/* TODO */
};
var onlyValueInSection = function(round){
	/* TODO */
};
var countSolutions = function(round, limitToTwo){
	/* TODO */
};

var guess = function(round, guessNumber){
	var localGuessCount = 0;
	var position = findPositionWithFewestPossibilities.call(this);
	for (var i=0; i<NUM_POSS; i++){
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
	for (var position=0; position<BOARD_SIZE; position++){
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<NUM_POSS; valIndex++){
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
	for (var i=0; i<BOARD_SIZE; i++){
		if (solutionRound[i] == round){
			solutionRound[i] = 0;
			solution[i] = 0;
		}
	}
	{for (var i=0; i<POSSIBILITY_SIZE; i++){
		if (possibilities[i] == round){
			possibilities[i] = 0;
		}
	}}

	while(solveInstructions.length > 0 && solveInstructions[solveInstructions.length-1] == round){
		solveInstructions.pop();
	}
};

var pointingRowReduction = function(round){
	/* TODO */
};
var rowBoxReduction = function(round){
	/* TODO */
};
var colBoxReduction = function(round){
	/* TODO */
};
var pointingColumnReduction = function(round){
	/* TODO */
};
var hiddenPairInRow = function(round){
	/* TODO */
};
var hiddenPairInColumn = function(round){
	/* TODO */
};
var hiddenPairInSection = function(round){
	/* TODO */
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
	var rowStart = cellToRow(position)*9;
	for (var col=0; col<COL_HEIGHT; col++){
		var rowVal=rowStart+col;
		var valPos = getPossibilityIndex(valIndex,rowVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in the column
	var colStart = cellToColumn(position);
	for (var i=0; i<9; i++){
		var colVal=colStart+(9*i);
		var valPos = getPossibilityIndex(valIndex,colVal);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}

	// Take this value out of the possibilities for everything in section
	var secStart = cellToSectionStartCell(position);
	for (var i=0; i<3; i++){
		for (var j=0; j<3; j++){
			var secVal=secStart+i+(9*j);
			var valPos = getPossibilityIndex(valIndex,secVal);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}
	}

	//This position itself is determined, it should have possibilities.
	for (var valIndex=0; valIndex<9; valIndex++){
		var valPos = getPossibilityIndex(valIndex,position);
		if (possibilities[valPos] == 0){
			possibilities[valPos] = round;
		}
	}
};

var findPositionWithFewestPossibilities = function(){
	var minPossibilities = 10;
	var bestPosition = 0;
	for (var i=0; i<BOARD_SIZE; i++){
		var position = randomBoardArray[i];
		if (solution[position] == 0){
			var count = 0;
			for (var valIndex=0; valIndex<NUM_POSS; valIndex++){
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
	/* TODO */
};
var countPossibilities = function(position){
	/* TODO */
};
var arePossibilitiesSame = function(position1, position2){
	/* TODO */
};

var addHistoryItem = function(l){
	//if (logHistory) l.print();
	if (recordHistory){
		solveHistory.push(l);
		solveInstructions.push(l);
	}
};

var shuffleRandomArrays = function(){
	shuffleArray(randomBoardArray, BOARD_SIZE);
	shuffleArray(randomPossibilityArray, NUM_POSS);
};

/**
 * print the given BOARD_SIZEd array of ints
 * as a sudoku puzzle.  Use print options from
 * member variables.
 */
var print = function(puz){
	console.log(sudokuToString.call(this, puz));
};

var sudokuToString = function(puz){
	var s = "";
	for(var i=0; i<BOARD_SIZE; i++){
		if (printStyle == qqwing.PrintStyle.READABLE){
			s += " ";
		}
		if (puz[i]==0){
			s += '.';
		} else {
			s += puz[i];
		}
		if (i == BOARD_SIZE-1){
			if (printStyle == qqwing.PrintStyle.CSV){
				s += ",";
			} else {
				s += "\n";
			}
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
		} else if (i%9==8){
			if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
				s += "\n";
			}
			if (i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
				if (printStyle == qqwing.PrintStyle.READABLE){
					s += "-------|-------|-------\n";
				}
			}
		} else if (i%3==2){
			if (printStyle == qqwing.PrintStyle.READABLE){
				s += " |";
			}
		}
	}
	return s;
};

var rollbackNonGuesses = function(){
	/* TODO */
};
var clearPuzzle = function(){
	/* TODO */
};

var printHistory = function(v){
	console.log(getHistory(v));
};

var getHistory = function(v){
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
	/* TODO */
};
var IntToString = function(num){
	/* TODO */
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
	/* TODO */
};
var getLogCount = function(v, type){
	/* TODO */
};
