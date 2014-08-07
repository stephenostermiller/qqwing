function qqwing () {
	/**
	 * The 81 integers that make up a sudoku puzzle.
	 * Givens are 1-9, unknows are 0.
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
	 * values for a suduko puzzle. (9 possibilities
	 * for each of 81 squares).  If possibilities[i]
	 * is zero, then the possibility could still be
	 * filled in according to the sudoku rules.  When
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
	var randomPossibilityArray = new Array(qqwing.NUM_POSS);

	for (var i=0; i<qqwing.NUM_POSS; i++){
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
				for (var valIndex=0; valIndex<qqwing.NUM_POSS; valIndex++){
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
		for (var i=0; i<qqwing.NUM_POSS; i++){
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
				for (var valIndex=0; valIndex<qqwing.NUM_POSS; valIndex++){
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
		for (var col=0; col<qqwing.COL_HEIGHT; col++){
			var rowVal=rowStart+col;
			var valPos = getPossibilityIndex(valIndex,rowVal);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}

		// Take this value out of the possibilities for everything in the column
		var colStart = qqwing.cellToColumn(position);
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
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			var position = randomBoardArray[i];
			if (solution[position] == 0){
				var count = 0;
				for (var valIndex=0; valIndex<qqwing.NUM_POSS; valIndex++){
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
		shuffleArray(randomBoardArray, qqwing.BOARD_SIZE);
		shuffleArray(randomPossibilityArray, qqwing.NUM_POSS);
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
			} else if (i%9==8){
				if (printStyle == qqwing.PrintStyle.READABLE || printStyle == qqwing.PrintStyle.COMPACT){
					s += "\n";
				}
				if (i%qqwing.SEC_GROUP_SIZE==qqwing.SEC_GROUP_SIZE-1){
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

	this.LogItem = function(r, t, v, p){
		/**
		 * The recursion level at which this item was gathered.
		 * Used for backing out log items solve branches that
		 * don't lead to a solution.
		 */
		var round = r;

		/**
		 * The type of log message that will determine the
		 * message printed.
		 */
		var type = t;

		/**
		 * Value that was set by the operation (or zero for no value)
		 */
		var value = v;

		/**
		 * position on the board at which the value (if any) was set.
		 */
		var position = p;

		this.getRound = function (){
			return round;
		};

		this.print = function(){
			console.log(this.toString());
		};

		this.getType =function(){
			return type;
		};

		this.toString = function(){
			var s = "Round: " + this.getRound() + " - ";
			switch(this.getType()){
				case qqwing.LogType.GIVEN:{
					s += "Mark given";
				} break;
				case qqwing.LogType.ROLLBACK:{
					s += "Roll back round";
				} break;
				case qqwing.LogType.GUESS:{
					s += "Mark guess (start round)";
				} break;
				case qqwing.LogType.HIDDEN_SINGLE_ROW:{
					s += "Mark single possibility for value in row";
				} break;
				case qqwing.LogType.HIDDEN_SINGLE_COLUMN:{
					s += "Mark single possibility for value in column";
				} break;
				case qqwing.LogType.HIDDEN_SINGLE_SECTION:{
					s += "Mark single possibility for value in section";
				} break;
				case qqwing.LogType.SINGLE:{
					s += "Mark only possibility for cell";
				} break;
				case qqwing.LogType.NAKED_PAIR_ROW:{
					s += "Remove possibilities for naked pair in row";
				} break;
				case qqwing.LogType.NAKED_PAIR_COLUMN:{
					s += "Remove possibilities for naked pair in column";
				} break;
				case qqwing.LogType.NAKED_PAIR_SECTION:{
					s += "Remove possibilities for naked pair in section";
				} break;
				case qqwing.LogType.POINTING_PAIR_TRIPLE_ROW: {
					s += "Remove possibilities for row because all values are in one section";
				} break;
				case qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN: {
					s += "Remove possibilities for column because all values are in one section";
				} break;
				case qqwing.LogType.ROW_BOX: {
					s += "Remove possibilities for section because all values are in one row";
				} break;
				case qqwing.LogType.COLUMN_BOX: {
					s += "Remove possibilities for section because all values are in one column";
				} break;
				case qqwing.LogType.HIDDEN_PAIR_ROW: {
					s += "Remove possibilities from hidden pair in row";
				} break;
				case qqwing.LogType.HIDDEN_PAIR_COLUMN: {
					s += "Remove possibilities from hidden pair in column";
				} break;
				case qqwing.LogType.HIDDEN_PAIR_SECTION: {
					s += "Remove possibilities from hidden pair in section";
				} break;
				default:{
					s += "!!! Performed unknown optimization !!!";
				} break;
			}
			if (value > 0 || position > -1){
				s += " (";
				var printed = false;
				if (position > -1){
					if (printed) s += " - ";
					s += "Row: " + cellToRow(position)+1 + " - Column: " + qqwing.cellToColumn(position)+1;
					printed = true;
				}
				if (value > 0){
					if (printed) s += " - ";
					s += "Value: " + value;
					printed = true;
				}
				s += ")";
			}
			return s;
		}
	};

	/**
	 * Set the board to the given puzzle.
	 * The given puzzle must be an array of 81 integers.
	 */
	this.setPuzzle = function(initPuzzle){
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			puzzle[i] = initPuzzle[i];
		}
		reset();
	}

	/**
	 * Print the sudoku puzzle.
	 */
	this.printPuzzle = function(){
		return print.call(this, puzzle);
	}

	/**
	 * Get the sudoku puzzle as a String.
	 */
	this.getPuzzleString = function(){
		return sudokuToString.call(this, puzzle);
	}

	/**
	 * Print the sudoku solution.
	 */
	this.printSolution = function(){
		return print.call(this, solution);
	}

	/**
	 * Get the sudoku puzzle as a String.
	 */
	this.getSolutionString = function(){
		return sudokuToString.call(this, solution);
	}

	this.solve = function(round){
		if (!round || round <= 1){
			reset.call(this);
			shuffleRandomArrays();
			return this.solve(2);
		}

		lastSolveRound = round;

		while (singleSolveMove.call(this, round)){
			if (this.isSolved()) return true;
			if (isImpossible.call(this)) return false;
		}

		var nextGuessRound = round+1;
		var nextRound = round+2;
		for (var guessNumber=0; guess.call(this, nextGuessRound, guessNumber); guessNumber++){
			if (isImpossible.call(this) || !this.solve(nextRound)){
				rollbackRound.call(this, nextRound);
				rollbackRound.call(this, nextGuessRound);
			} else {
				return true;
			}
		}
		return false;
	};


	this.countSolutions = function(){
		/* TODO */
	};
	this.printPossibilities = function(){
		/* TODO */
	};

	this.isSolved = function(){
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			if (solution[i] == 0){
				return false;
			}
		}
		return true;
	};

	this.printSolveHistory = function(){
		printHistory.call(this, solveHistory);
	};
	this.getSolveHistory = function(){
		return getHistory.call(this, solveHistory);
	};

	this.setRecordHistory = function(recHistory){
		recordHistory = recHistory;
	};
	this.setLogHistory = function(logHist){
		logHistory = logHist;
	};
	this.setPrintStyle = function(printstyle){
		/* TODO */
	};
	this.generatePuzzle = function(){
		/* TODO */
	};
	this.generatePuzzleSymmetry = function(symmetry){
		/* TODO */
	};
	this.getGivenCount = function(){
		/* TODO */
	};
	this.getSingleCount = function(){
		/* TODO */
	};
	this.getHiddenSingleCount = function(){
		/* TODO */
	};
	this.getNakedPairCount = function(){
		/* TODO */
	};
	this.getHiddenPairCount = function(){
		/* TODO */
	};
	this.getBoxLineReductionCount = function(){
		/* TODO */
	};
	this.getPointingPairTripleCount = function(){
		/* TODO */
	};
	this.getGuessCount = function(){
		/* TODO */
	};
	this.getBacktrackCount = function(){
		/* TODO */
	};
	this.printSolveInstructions = function(){
		/* TODO */
	};
	this.getDifficulty = function(){
		if (this.getGuessCount() > 0) return qqwing.Difficulty.EXPERT;
		if (this.getBoxLineReductionCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
		if (this.getPointingPairTripleCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
		if (this.getHiddenPairCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
		if (this.getNakedPairCount() > 0) return qqwing.Difficulty.INTERMEDIATE;
		if (this.getHiddenSingleCount() > 0) return qqwing.Difficulty.EASY;
		if (this.getSingleCount() > 0) return qqwing.Difficulty.SIMPLE;
		return qqwing.Difficulty.UNKNOWN;
	};
	this.getDifficultyAsString = function(){
		var difficulty = this.getDifficulty();
		switch (difficulty){
			case qqwing.Difficulty.EXPERT: return "Expert";
			case qqwing.Difficulty.INTERMEDIATE: return "Intermediate";
			case qqwing.Difficulty.EASY: return "Easy";
			case qqwing.Difficulty.SIMPLE: return "Simple";
			default: return "Unknown";
		}
	};
}

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
qqwing.ROW_LENGTH = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.COL_HEIGHT = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.SEC_SIZE = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.SEC_COUNT = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.SEC_GROUP_SIZE = qqwing.SEC_SIZE*qqwing.GRID_SIZE;
qqwing.NUM_POSS = qqwing.GRID_SIZE*qqwing.GRID_SIZE;
qqwing.BOARD_SIZE = qqwing.ROW_LENGTH*qqwing.COL_HEIGHT;
qqwing.POSSIBILITY_SIZE = qqwing.BOARD_SIZE*qqwing.NUM_POSS;

/**
 * Given the index of a cell (0-80) calculate
 * the column (0-8) in which that cell resides.
 */
qqwing.cellToColumn = function(cell){
	return cell%qqwing.COL_HEIGHT;
};

/**
 * Given the index of a cell (0-80) calculate
 * the row (0-8) in which it resides.
 */
qqwing.cellToRow = function(cell){
	return Math.floor(cell/qqwing.ROW_LENGTH);
};

/**
 * Given the index of a cell (0-80) calculate
 * the cell (0-80) that is the upper left start
 * cell of that section.
 */
qqwing.cellToSectionStartCell = function(cell){
	return Math.floor(cell/qqwing.SEC_GROUP_SIZE)*qqwing.SEC_GROUP_SIZE
			+ Math.floor(qqwing.cellToColumn(cell)/qqwing.GRID_SIZE)*qqwing.GRID_SIZE;
};

/**
 * Given the index of a cell (0-80) calculate
 * the section (0-8) in which it resides.
 */
qqwing.cellToSection = function(cell){
	return Math.floor(cell/qqwing.SEC_GROUP_SIZE)*qqwing.GRID_SIZE
			+ Math.floor(qqwing.cellToColumn(cell)/qqwing.GRID_SIZE);
};

/**
 * Given a row (0-8) calculate the first cell (0-80)
 * of that row.
 */
qqwing.rowToFirstCell = function(row){
	return 9*row;
};

/**
 * Given a column (0-8) calculate the first cell (0-80)
 * of that column.
 */
qqwing.columnToFirstCell = function(column){
	return column;
};

/**
 * Given a section (0-8) calculate the first cell (0-80)
 * of that section.
 */
qqwing.sectionToFirstCell = function(section){
	return (section%qqwing.GRID_SIZE*qqwing.GRID_SIZE) + Math.floor(section/qqwing.GRID_SIZE)*qqwing.SEC_GROUP_SIZE;
};

/**
 * Given a value for a cell (0-8) and a cell (0-80)
 * calculate the offset into the possibility array (0-728).
 */
qqwing.getPossibilityIndex = function(valueIndex, cell){
	return valueIndex+(qqwing.NUM_POSS*cell);
};

/**
 * Given a row (0-8) and a column (0-8) calculate the
 * cell (0-80).
 */
qqwing.rowColumnToCell = function(row, column){
	return (row*qqwing.COL_HEIGHT)+column;
};

/**
 * Given a section (0-8) and an offset into that section (0-8)
 * calculate the cell (0-80)
 */
qqwing.sectionToCell = function(section, offset){
	return qqwing.sectionToFirstCell(section)
			+ Math.floor(offset/qqwing.GRID_SIZE)*qqwing.SEC_SIZE
			+ (offset%qqwing.GRID_SIZE);
};
