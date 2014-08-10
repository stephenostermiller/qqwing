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
				s += "Row: " + cellToRow(position)+1 + " - Column: " + cellToColumn(position)+1;
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
	for (var i=0; i<BOARD_SIZE; i++){
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


this.countSolutions = function(){
	/* TODO */
};

this.printPossibilities = function(){
	/* TODO */
};

this.isSolved = function(){
	for (var i=0; i<BOARD_SIZE; i++){
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

this.setPrintStyle = function(ps){
	printStyle = ps;
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
