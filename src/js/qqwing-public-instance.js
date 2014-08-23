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
		println(this.toString());
	};

	this.getType = function(){
		return type;
	};

	this.getColumn = function(){
		if (position == -1) return -1;
		return cellToColumn(position);
	};

	this.getRow = function(){
		if (position == -1) return -1;
		return cellToRow(position);
	}

	this.getPosition = function(){
		return position;
	}

	this.getValue = function(){
		return value;
	}

	this.getDescription = function(){
		switch(this.getType()){
			case qqwing.LogType.GIVEN: return "Mark given";
			case qqwing.LogType.ROLLBACK: return "Roll back round";
			case qqwing.LogType.GUESS: return "Mark guess (start round)";
			case qqwing.LogType.HIDDEN_SINGLE_ROW: return "Mark single possibility for value in row";
			case qqwing.LogType.HIDDEN_SINGLE_COLUMN: return "Mark single possibility for value in column";
			case qqwing.LogType.HIDDEN_SINGLE_SECTION: return "Mark single possibility for value in section";
			case qqwing.LogType.SINGLE: return "Mark only possibility for cell";
			case qqwing.LogType.NAKED_PAIR_ROW: return "Remove possibilities for naked pair in row";
			case qqwing.LogType.NAKED_PAIR_COLUMN: return "Remove possibilities for naked pair in column";
			case qqwing.LogType.NAKED_PAIR_SECTION: return "Remove possibilities for naked pair in section";
			case qqwing.LogType.POINTING_PAIR_TRIPLE_ROW: return "Remove possibilities for row because all values are in one section";
			case qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN: return "Remove possibilities for column because all values are in one section";
			case qqwing.LogType.ROW_BOX: return "Remove possibilities for section because all values are in one row";
			case qqwing.LogType.COLUMN_BOX: return "Remove possibilities for section because all values are in one column";
			case qqwing.LogType.HIDDEN_PAIR_ROW: return "Remove possibilities from hidden pair in row";
			case qqwing.LogType.HIDDEN_PAIR_COLUMN: return "Remove possibilities from hidden pair in column";
			case qqwing.LogType.HIDDEN_PAIR_SECTION: return "Remove possibilities from hidden pair in section";
			default: return "!!! Performed unknown optimization !!!";
		}
	}

	this.toString = function(){
		var s = "Round: " + this.getRound() + " - ";
		s += this.getDescription();
		if (value > 0 || position > -1){
			s += " (";
			var printed = false;
			if (position > -1){
				if (printed) s += " - ";
				s += "Row: " + (cellToRow(position)+1) + " - Column: " + (cellToColumn(position)+1);
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
	return reset.call(this);
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


this.countSolutions = function(round, limitToTwo){
	if (!round || round <= 1){
		// Don't record history while generating.
		var recHistory = recordHistory;
		this.setRecordHistory(false);
		var lHistory = logHistory;
		this.setLogHistory(false);

		reset.call(this);
		var solutionCount = this.countSolutions(2, false);

		// Restore recording history.
		this.setRecordHistory(recHistory);
		this.setLogHistory(lHistory);

		return solutionCount;
	} else {
		while (singleSolveMove.call(this, round)){
			if (this.isSolved()){
				rollbackRound.call(this, round);
				return 1;
			}
			if (isImpossible.call(this)){
				rollbackRound.call(this, round);
				return 0;
			}
		}

		var solutions = 0;
		var nextRound = round+1;
		for (var guessNumber=0; guess.call(this, nextRound, guessNumber); guessNumber++){
			solutions += this.countSolutions(nextRound, limitToTwo);
			if (limitToTwo && solutions >=2){
				rollbackRound.call(this, round);
				return solutions;
			}
		}
		rollbackRound.call(this, round);
		return solutions;
	}
};

this.isSolved = function(){
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (solution[i] == 0){
			return false;
		}
	}
	return true;
};

this.getSolveHistory = function(){
	if (this.isSolved()){
		return solveHistory;
	} else {
		return "No solve history - Puzzle is not possible to solve.";
	}
};

this.getSolveHistoryString = function(){
	if (this.isSolved()){
		return getHistoryString.call(this, solveHistory);
	} else {
		return "No solve history - Puzzle is not possible to solve.";
	}
};

this.printSolveHistory = function(){
	if (this.isSolved()){
		printHistory(solveHistory);
	} else {
		println("No solve history - Puzzle is not possible to solve.");
	}
};

this.setRecordHistory = function(recHistory){
	recordHistory = recHistory;
};

this.setLogHistory = function(logHist){
	logHistory = logHist;
};

this.setPrintStyle = function(ps){
	printStyle = ps;
};

this.generatePuzzle = function(){
	return this.generatePuzzleSymmetry(qqwing.Symmetry.NONE);
};

this.generatePuzzleSymmetry = function(symmetry){
		if (symmetry == qqwing.Symmetry.RANDOM) symmetry = getRandomSymmetry.call(this);

		// Don't record history while generating.
		var recHistory = recordHistory;
		this.setRecordHistory(false);
		var lHistory = logHistory;
		this.setLogHistory(false);

		clearPuzzle.call(this);

		// Start by getting the randomness in order so that
		// each puzzle will be different from the last.
		shuffleRandomArrays.call(this);

		// Now solve the puzzle the whole way.  The solve
		// uses random algorithms, so we should have a
		// really randomly totally filled sudoku
		// Even when starting from an empty grid
		this.solve();

		if (symmetry == qqwing.Symmetry.NONE){
			// Rollback any square for which it is obvious that
			// the square doesn't contribute to a unique solution
			// (ie, squares that were filled by logic rather
			// than by guess)
			rollbackNonGuesses.call(this);
		}

		// Record all marked squares as the puzzle so
		// that we can call countSolutions without losing it.
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			puzzle[i] = solution[i];
		}

		// Rerandomize everything so that we test squares
		// in a different order than they were added.
		shuffleRandomArrays.call(this);

		// Remove one value at a time and see if
		// the puzzle still has only one solution.
		// If it does, leave it out the point because
		// it is not needed.
		for (var i=0; i<qqwing.BOARD_SIZE; i++){
			// check all the positions, but in shuffled order
			var position = randomBoardArray[i];
			if (puzzle[position] > 0){
				var positionsym1 = -1;
				var positionsym2 = -1;
				var positionsym3 = -1;
				switch (symmetry){
					case qqwing.Symmetry.ROTATE90:
						positionsym2 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position),cellToRow(position));
						positionsym3 = rowColumnToCell(cellToColumn(position),qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position));
					case qqwing.Symmetry.ROTATE180:
						positionsym1 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position),qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case qqwing.Symmetry.MIRROR:
						positionsym1 = rowColumnToCell(cellToRow(position),qqwing.ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case qqwing.Symmetry.FLIP:
						positionsym1 = rowColumnToCell(qqwing.ROW_COL_SEC_SIZE-1-cellToRow(position),cellToColumn(position));
					break;
				}
				// try backing out the value and
				// counting solutions to the puzzle
				var savedValue = puzzle[position];
				puzzle[position] = 0;
				var savedSym1 = 0;
				if (positionsym1 >= 0){
					savedSym1 = puzzle[positionsym1];
					puzzle[positionsym1] = 0;
				}
				var savedSym2 = 0;
				if (positionsym2 >= 0){
					savedSym2 = puzzle[positionsym2];
					puzzle[positionsym2] = 0;
				}
				var savedSym3 = 0;
				if (positionsym3 >= 0){
					savedSym3 = puzzle[positionsym3];
					puzzle[positionsym3] = 0;
				}
				reset.call(this);
				if (this.countSolutions(2, true) > 1){
					// Put it back in, it is needed
					puzzle[position] = savedValue;
					if (positionsym1 >= 0 && savedSym1 != 0) puzzle[positionsym1] = savedSym1;
					if (positionsym2 >= 0 && savedSym2 != 0) puzzle[positionsym2] = savedSym2;
					if (positionsym3 >= 0 && savedSym3 != 0) puzzle[positionsym3] = savedSym3;
				}
			}
		}

		// Clear all solution info, leaving just the puzzle.
		reset.call(this);

		// Restore recording history.
		this.setRecordHistory(recHistory);
		this.setLogHistory(lHistory);

		return true;
};

/**
 * Get the number of cells that are
 * set in the puzzle (as opposed to
 * figured out in the solution
 */
this.getGivenCount = function(){
	var count = 0;
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (puzzle[i] != 0) count++;
	}
	return count;
};

/**
 * Get the number of cells for which the solution was determined
 * because there was only one possible value for that cell.
 */
this.getSingleCount = function(){
	return getLogCount.call(this, solveInstructions, qqwing.LogType.SINGLE);
}

/**
 * Get the number of cells for which the solution was determined
 * because that cell had the only possibility for some value in
 * the row, column, or section.
 */
this.getHiddenSingleCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_SINGLE_SECTION)
	);
};

/**
 * Get the number of naked pair reductions that were performed
 * in solving this puzzle.
 */

this.getNakedPairCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.NAKED_PAIR_SECTION)
	);
};

/**
 * Get the number of hidden pair reductions that were performed
 * in solving this puzzle.
 */
this.getHiddenPairCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_ROW) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_COLUMN) +
		getLogCount.call(this, solveInstructions, qqwing.LogType.HIDDEN_PAIR_SECTION)
	);
};

/**
 * Get the number of box/line reductions that were performed
 * in solving this puzzle.
 */
this.getBoxLineReductionCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.ROW_BOX)+
		getLogCount.call(this, solveInstructions, qqwing.LogType.COLUMN_BOX)
	);
};

/**
 * Get the number of pointing pair/triple reductions that were performed
 * in solving this puzzle.
 */

this.getPointingPairTripleCount = function(){
	return (
		getLogCount.call(this, solveInstructions, qqwing.LogType.POINTING_PAIR_TRIPLE_ROW)+
		getLogCount.call(this, solveInstructions, qqwing.LogType.POINTING_PAIR_TRIPLE_COLUMN)
	);
};

/**
 * Get the number lucky guesses in solving this puzzle.
 */
this.getGuessCount = function(){
	return getLogCount.call(this, solveInstructions, qqwing.LogType.GUESS);
};

/**
 * Get the number of backtracks (unlucky guesses) required
 * when solving this puzzle.
 */
this.getBacktrackCount = function(){
	return getLogCount.call(this, solveHistory, qqwing.LogType.ROLLBACK);
};

this.getSolveInstructions = function(){
	if (this.isSolved()){
		return solveInstructions;
	} else {
		return "No solve instructions - Puzzle is not possible to solve.";
	}
};

this.getSolveInstructionsString = function(){
	if (this.isSolved()){
		return getHistoryString.call(this, solveInstructions);
	} else {
		return "No solve instructions - Puzzle is not possible to solve.";
	}
};

this.printSolveInstructions = function(){
	if (this.isSolved()){
		printHistory(solveInstructions);
	} else {
		println("No solve instructions - Puzzle is not possible to solve.");
	}
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
