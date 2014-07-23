/*
 * qqwing - A Sudoku solver and generator
 * Copyright (C) 2006-2014 Stephen Ostermiller
 * http://ostermiller.org/qqwing/
 * Copyright (C) 2007 Jacques Bensimon (jacques@ipm.com)
 * Copyright (C) 2007 Joel Yarde (joel.yarde - gmail.com)
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
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Calendar;
import java.util.Random;
import java.util.ArrayList;

/**
 * The board containing all the memory structures and
 * methods for solving or generating sudoku puzzles.
 */
public class QQWing {

	private static final String QQWING_VERSION = "1.1.0";

	private enum PrintStyle {
		ONE_LINE,
		COMPACT,
		READABLE,
		CSV
	};

	private enum Difficulty {
		UNKNOWN,
		SIMPLE,
		EASY,
		INTERMEDIATE,
		EXPERT
	}

	private enum Symmetry {
		NONE,
		ROTATE90,
		ROTATE180,
		MIRROR,
		FLIP,
		RANDOM
	};

	public static final int GRID_SIZE = 3;
	public static final int ROW_LENGTH = (GRID_SIZE*GRID_SIZE);
	public static final int COL_HEIGHT = (GRID_SIZE*GRID_SIZE);
	public static final int SEC_SIZE = (GRID_SIZE*GRID_SIZE);
	public static final int SEC_COUNT = (GRID_SIZE*GRID_SIZE);
	public static final int SEC_GROUP_SIZE = (SEC_SIZE*GRID_SIZE);
	public static final int NUM_POSS = (GRID_SIZE*GRID_SIZE);
	public static final int BOARD_SIZE = (ROW_LENGTH*COL_HEIGHT);
	public static final int POSSIBILITY_SIZE = (BOARD_SIZE*NUM_POSS);

	public static final int NONE = 1;
	public static final int GENERATE = 2;
	public static final int SOLVE = 3;

	public static Random r;
	/**
	 * The last round of solving
	 */
	int lastSolveRound;

	/**
	 * The 81 integers that make up a sudoku puzzle.
	 * Givens are 1-9, unknows are 0.
	 * Once initialized, this puzzle remains as is.
	 * The answer is worked out in "solution".
	 */
	int[] puzzle;

	/**
	 * The 81 integers that make up a sudoku puzzle.
	 * The solution is built here, after completion
	 * all will be 1-9.
	 */
	int[] solution;

	/**
	 * Recursion depth at which each of the numbers
	 * in the solution were placed.  Useful for backing
	 * out solve branches that don't lead to a solution.
	 */
	int[] solutionRound;

	/**
	 * The 729 integers that make up a the possible
	 * values for a suduko puzzle. (9 possibilities
	 * for each of 81 squares).  If possibilities[i]
	 * is zero, then the possibility could still be
	 * filled in according to the sudoku rules.  When
	 * a possibility is eliminated, possibilities[i]
	 * is assigned the round (recursion level) at
	 * which it was determined that it could not be
	 * a possibility.
	 */
	int[] possibilities;

	/**
	 * An array the size of the board (81) containing each
	 * of the numbers 0-n exactly once.  This array may
	 * be shuffled so that operations that need to
	 * look at each cell can do so in a random order.
	 */
	int[] randomBoardArray;

	/**
	 * An array with one element for each position (9), in
	 * some random order to be used when trying each
	 * position in turn during guesses.
	 */
	int[] randomPossibilityArray;

	/**
	 * Whether or not to record history
	 */
	boolean recordHistory;

	/**
	 * Whether or not to print history as it happens
	 */
	boolean logHistory;

	/**
	 * A list of moves used to solve the puzzle.
	 * This list contains all moves, even on solve
	 * branches that did not lead to a solution.
	 */
	ArrayList<LogItem> solveHistory;

	/**
	 * A list of moves used to solve the puzzle.
	 * This list contains only the moves needed
	 * to solve the puzzle, but doesn't contain
	 * information about bad guesses.
	 */
	ArrayList<LogItem> solveInstructions;

	/**
	 * The style with which to print puzzles and solutions
	 */
	PrintStyle printStyle;

	/**
	 * Create a new Sudoku board
	 */
	public QQWing(){
		puzzle = new int[BOARD_SIZE];
		solution = new int[BOARD_SIZE];
		solutionRound = new int[BOARD_SIZE];
		possibilities = new int[POSSIBILITY_SIZE];
		recordHistory = false;
		printStyle = PrintStyle.READABLE;
		randomBoardArray = new int[BOARD_SIZE];
		randomPossibilityArray = new int[NUM_POSS];
		solveHistory = new ArrayList<LogItem>();
		solveInstructions = new ArrayList<LogItem>();

		for (int i=0; i<BOARD_SIZE; i++){
				randomBoardArray[i] = i;
		}

		for (int i=0; i<NUM_POSS; i++){
				randomPossibilityArray[i] = i;
		}
	}

	/**
	 * Get the number of cells that are
	 * set in the puzzle (as opposed to
	 * figured out in the solution
	 */
	int getGivenCount(){
		int count = 0;
		for (int i=0; i<BOARD_SIZE; i++){
			if (puzzle[i] != 0) count++;
		}
		return count;
	}

	/**
	 * Set the board to the given puzzle.
	 * The given puzzle must be an array of 81 integers.
	 */
	boolean setPuzzle(int[] initPuzzle) throws Exception {
		for (int i=0; i<BOARD_SIZE; i++){
				puzzle[i] = (initPuzzle == null) ? 0:initPuzzle[i];
		}
		return reset();
	}

	/**
	 * Reset the board to its initial state with
	 * only the givens.
	 * This method clears any solution, resets statistics,
	 * and clears any history messages.
	 */
	boolean reset() throws Exception {
		for (int i=0; i<BOARD_SIZE; i++){
			solution[i] = 0;
		}
		for (int i=0; i<BOARD_SIZE; i++){
			solutionRound[i] = 0;
		}
		for (int i=0; i<POSSIBILITY_SIZE; i++){
			possibilities[i] = 0;
		}

		for (int i=0;i<solveHistory.size();i++){
			solveHistory.remove(i);
		}
		solveHistory.clear();
		solveInstructions.clear();

		int round = 1;
		for (int position=0; position<BOARD_SIZE; position++){
			if (puzzle[position] > 0){
				int valIndex = puzzle[position]-1;
				int valPos = getPossibilityIndex(valIndex,position);
				int value = puzzle[position];
				if (possibilities[valPos] != 0) return false;
				mark(position,round,value);
				if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.GIVEN, value, position));
			}
		}

		return true;
	}

	/**
	 * Get the difficulty rating.
	 */
	private Difficulty getDifficulty(){
		if (getGuessCount() > 0) return Difficulty.EXPERT;
		if (getBoxLineReductionCount() > 0) return Difficulty.INTERMEDIATE;
		if (getPointingPairTripleCount() > 0) return Difficulty.INTERMEDIATE;
		if (getHiddenPairCount() > 0) return Difficulty.INTERMEDIATE;
		if (getNakedPairCount() > 0) return Difficulty.INTERMEDIATE;
		if (getHiddenSingleCount() > 0) return Difficulty.EASY;
		if (getSingleCount() > 0) return Difficulty.SIMPLE;
		return Difficulty.UNKNOWN;
	}

	/**
	 * Get the difficulty rating.
	 */
	String getDifficultyAsString(){
		Difficulty difficulty = getDifficulty();
		switch (difficulty){
			case EXPERT: return "Expert";
			case INTERMEDIATE: return "Intermediate";
			case EASY: return "Easy";
			case SIMPLE: return "Simple";
			default: return "Unknown";
		}
	}

	/**
	 * Get the number of cells for which the solution was determined
	 * because there was only one possible value for that cell.
	 */
	int getSingleCount(){
		return getLogCount(solveInstructions, LogItem.SINGLE);
	}

	/**
	 * Get the number of cells for which the solution was determined
	 * because that cell had the only possibility for some value in
	 * the row, column, or section.
	 */
	int getHiddenSingleCount(){
		return (
			getLogCount(solveInstructions, LogItem.HIDDEN_SINGLE_ROW) +
			getLogCount(solveInstructions, LogItem.HIDDEN_SINGLE_COLUMN) +
			getLogCount(solveInstructions, LogItem.HIDDEN_SINGLE_SECTION)
		);
	}

	/**
	 * Get the number of naked pair reductions that were performed
	 * in solving this puzzle.
	 */
	int getNakedPairCount(){
		return (
			getLogCount(solveInstructions, LogItem.NAKED_PAIR_ROW) +
			getLogCount(solveInstructions, LogItem.NAKED_PAIR_COLUMN) +
			getLogCount(solveInstructions, LogItem.NAKED_PAIR_SECTION)
		);
	}

	/**
	 * Get the number of hidden pair reductions that were performed
	 * in solving this puzzle.
	 */
	int getHiddenPairCount(){
		return (
			getLogCount(solveInstructions, LogItem.HIDDEN_PAIR_ROW) +
			getLogCount(solveInstructions, LogItem.HIDDEN_PAIR_COLUMN) +
			getLogCount(solveInstructions, LogItem.HIDDEN_PAIR_SECTION)
		);
	}

	/**
	 * Get the number of pointing pair/triple reductions that were performed
	 * in solving this puzzle.
	 */
	int getPointingPairTripleCount(){
		return (
			getLogCount(solveInstructions, LogItem.POINTING_PAIR_TRIPLE_ROW)+
			getLogCount(solveInstructions, LogItem.POINTING_PAIR_TRIPLE_COLUMN)
		);
	}

	/**
	 * Get the number of box/line reductions that were performed
	 * in solving this puzzle.
	 */
	int getBoxLineReductionCount(){
		return (
			getLogCount(solveInstructions, LogItem.ROW_BOX)+
			getLogCount(solveInstructions, LogItem.COLUMN_BOX)
		);
	}

	/**
	 * Get the number lucky guesses in solving this puzzle.
	 */
	int getGuessCount(){
		return getLogCount(solveInstructions, LogItem.GUESS);
	}

	/**
	 * Get the number of backtracks (unlucky guesses) required
	 * when solving this puzzle.
	 */
	int getBacktrackCount(){
		return getLogCount(solveHistory, LogItem.ROLLBACK);
	}

	void markRandomPossibility(int round) throws Exception {
		int remainingPossibilities = 0;
		for (int i=0; i<POSSIBILITY_SIZE; i++){
			if (possibilities[i] == 0) remainingPossibilities++;
		}

		int randomPossibility = Math.abs(r.nextInt())%remainingPossibilities;

		int possibilityToMark = 0;
		for (int i=0; i<POSSIBILITY_SIZE; i++){
			if (possibilities[i] == 0){
				if (possibilityToMark == randomPossibility){
					int position = i/NUM_POSS;
					int value = i%NUM_POSS+1;
					mark(position, round, value);
					return;
				}
				possibilityToMark++;
			}
		}
	}

	void shuffleRandomArrays(){
		shuffleArray(randomBoardArray, BOARD_SIZE);
		shuffleArray(randomPossibilityArray, NUM_POSS);
	}

	void clearPuzzle() throws Exception {
		// Clear any existing puzzle
		for (int i=0; i<BOARD_SIZE; i++){
				puzzle[i] = 0;
		}
		reset();
	}

	boolean generatePuzzle() throws Exception {
		return generatePuzzleSymmetry(Symmetry.NONE);
	}

	boolean generatePuzzleSymmetry(Symmetry symmetry) throws Exception {

		if (symmetry ==  Symmetry.RANDOM) symmetry = getRandomSymmetry();

		// Don't record history while generating.
		boolean recHistory = recordHistory;
		setRecordHistory(false);
		boolean lHistory = logHistory;
		setLogHistory(false);

		clearPuzzle();

		// Start by getting the randomness in order so that
		// each puzzle will be different from the last.
		shuffleRandomArrays();

		// Now solve the puzzle the whole way.  The solve
		// uses random algorithms, so we should have a
		// really randomly totally filled sudoku
		// Even when starting from an empty grid
		solve();

		if (symmetry == Symmetry.NONE){
			// Rollback any square for which it is obvious that
			// the square doesn't contribute to a unique solution
			// (ie, squares that were filled by logic rather
			// than by guess)
			rollbackNonGuesses();
		}

		// Record all marked squares as the puzzle so
		// that we can call countSolutions without losing it.
		for (int i=0; i<BOARD_SIZE; i++){
			puzzle[i] = solution[i];
		}

		// Rerandomize everything so that we test squares
		// in a different order than they were added.
		shuffleRandomArrays();

		// Remove one value at a time and see if
		// the puzzle still has only one solution.
		// If it does, leave it0 out the point because
		// it is not needed.
		for (int i=0; i<BOARD_SIZE; i++){
			// check all the positions, but in shuffled order
			int position = randomBoardArray[i];
			if (puzzle[position] > 0){
				int positionsym1 = -1;
				int positionsym2 = -1;
				int positionsym3 = -1;
				switch (symmetry){
					case ROTATE90:
						positionsym2 = rowColumnToCell(COL_HEIGHT-1-cellToColumn(position),cellToRow(position));
						positionsym3 = rowColumnToCell(cellToColumn(position),ROW_LENGTH-1-cellToRow(position));
					case ROTATE180:
						positionsym1 = rowColumnToCell(ROW_LENGTH-1-cellToRow(position),COL_HEIGHT-1-cellToColumn(position));
					break;
					case MIRROR:
						positionsym1 = rowColumnToCell(cellToRow(position),COL_HEIGHT-1-cellToColumn(position));
					break;
					case FLIP:
						positionsym1 = rowColumnToCell(ROW_LENGTH-1-cellToRow(position),cellToColumn(position));
					break;
				}
				// try backing out the value and
				// counting solutions to the puzzle
				int savedValue = puzzle[position];
				puzzle[position] = 0;
				int savedSym1 = 0;
				if (positionsym1 >= 0){
					savedSym1 = puzzle[positionsym1];
					puzzle[positionsym1] = 0;
				}
				int savedSym2 = 0;
				if (positionsym2 >= 0){
					savedSym2 = puzzle[positionsym2];
					puzzle[positionsym2] = 0;
				}
				int savedSym3 = 0;
				if (positionsym3 >= 0){
					savedSym3 = puzzle[positionsym3];
					puzzle[positionsym3] = 0;
				}
				reset();
				if (countSolutions(2, true) > 1){
					// Put it back in, it is needed
					puzzle[position] = savedValue;
					if (positionsym1 >= 0) puzzle[positionsym1] = savedSym1;
					if (positionsym2 >= 0) puzzle[positionsym2] = savedSym2;
					if (positionsym3 >= 0) puzzle[positionsym3] = savedSym3;
				}
			}
		}

		// Clear all solution info, leaving just the puzzle.
		reset();

		// Restore recording history.
		setRecordHistory(recHistory);
		setLogHistory(lHistory);

		return true;
	}

	void rollbackNonGuesses(){
		// Guesses are odd rounds
		// Non-guesses are even rounds
		for (int i=2; i<=lastSolveRound; i+=2){
			rollbackRound(i);
		}
	}

	void setPrintStyle(PrintStyle ps){
		printStyle = ps;
	}

	void setRecordHistory(boolean recHistory){
		recordHistory = recHistory;
	}

	void setLogHistory(boolean logHist){
		logHistory = logHist;
	}

	void addHistoryItem(LogItem l){
		if (logHistory){
			l.print();
			System.out.println();
		}
		if (recordHistory) {
			solveHistory.add(l); //->push_back(l);
			solveInstructions.add(l); //->push_back(l);
		} else {
			l = null;
		}
	}

	void printHistory(ArrayList<LogItem> v){
		if (!recordHistory){
			System.out.println("History was not recorded.");
			if (printStyle == PrintStyle.CSV){
				System.out.println(" -- ");
			} else {
				System.out.println();
			}
		}
		for (int i=0;i<v.size();i++){
			System.out.println(i+1+". ");
			(v.get(i)).print();
			if (printStyle == PrintStyle.CSV){
				System.out.println(" -- ");
			} else {
				System.out.println();
			}
		}
		if (printStyle == PrintStyle.CSV){
			System.out.println(",");
		} else {
			System.out.println();
		}
	}

	void printSolveInstructions(){
		if (isSolved()){
			printHistory(solveInstructions);
		} else {
			System.out.println("No solve instructions - Puzzle is not possible to solve.");
		}
	}

	void printSolveHistory(){
		printHistory(solveHistory);
	}

	boolean solve() throws Exception {
		reset();
		shuffleRandomArrays();
		return solve(2);
	}

	boolean solve(int round) throws Exception {
		lastSolveRound = round;

		while (singleSolveMove(round)){
			if (isSolved()) return true;
			if (isImpossible()) return false;
		}

		int nextGuessRound = round+1;
		int nextRound = round+2;
		for (int guessNumber=0; guess(nextGuessRound, guessNumber); guessNumber++){
			if (isImpossible() || !solve(nextRound)){
				rollbackRound(nextRound);
				rollbackRound(nextGuessRound);
			} else {
				return true;
			}
		}
		return false;
	}

	int countSolutions() throws Exception {
		// Don't record history while generating.
		boolean recHistory = recordHistory;
		setRecordHistory(false);
		boolean lHistory = logHistory;
		setLogHistory(false);

		reset();
		int solutionCount = countSolutions(2, false);

		// Restore recording history.
		setRecordHistory(recHistory);
		setLogHistory(lHistory);

		return solutionCount;
	}

	int countSolutions(int round, boolean limitToTwo) throws Exception {
		while (singleSolveMove(round)){
			if (isSolved()){
				rollbackRound(round);
				return 1;
			}
			if (isImpossible()){
				rollbackRound(round);
				return 0;
			}
		}

		int solutions = 0;
		int nextRound = round+1;
		for (int guessNumber=0; guess(nextRound, guessNumber); guessNumber++){
			solutions += countSolutions(nextRound, limitToTwo);
			if (limitToTwo && solutions >=2){
				rollbackRound(round);
				return solutions;
			}
		}
		rollbackRound(round);
		return solutions;
	}

	void rollbackRound(int round){
		if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.ROLLBACK));
		for (int i=0; i<BOARD_SIZE; i++){
			if (solutionRound[i] == round){
				solutionRound[i] = 0;
				solution[i] = 0;
			}
		}
		for (int i=0; i<POSSIBILITY_SIZE; i++){
			if (possibilities[i] == round){
				possibilities[i] = 0;
			}
		}
		while(solveInstructions.size() > 0 && (solveInstructions.get(solveInstructions.size()-1)).getRound() == round){
			int i = solveInstructions.size()-1;
			solveInstructions.remove(i);
		}
	}

	boolean isSolved(){
		for (int i=0; i<BOARD_SIZE; i++){
			if (solution[i] == 0){
				return false;
			}
		}
		return true;
	}

	boolean isImpossible(){
		for (int position=0; position<BOARD_SIZE; position++){
			if (solution[position] == 0){
				int count = 0;
				for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0) count++;
				}
				if (count == 0) {
					return true;
				}
			}
		}
		return false;
	}

	int findPositionWithFewestPossibilities(){
		int minPossibilities = 10;
		int bestPosition = 0;
		for (int i=0; i<BOARD_SIZE; i++){
			int position = randomBoardArray[i];
			if (solution[position] == 0){
				int count = 0;
				for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0) count++;
				}
				if (count < minPossibilities){
					minPossibilities = count;
					bestPosition = position;
				}
			}
		}
		return bestPosition;
	}

	boolean guess(int round, int guessNumber) throws Exception {
		int localGuessCount = 0;
		int position = findPositionWithFewestPossibilities();
		for (int i=0; i<NUM_POSS; i++){
			int valIndex = randomPossibilityArray[i];
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0){
				if (localGuessCount == guessNumber){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.GUESS, value, position));
					mark(position, round, value);
					return true;
				}
				localGuessCount++;
			}
		}
		return false;
	}

	boolean singleSolveMove(int round) throws Exception {
		if (onlyPossibilityForCell(round)) return true;
		if (onlyValueInSection(round)) return true;
		if (onlyValueInRow(round)) return true;
		if (onlyValueInColumn(round)) return true;
		if (handleNakedPairs(round)) return true;
		if (pointingRowReduction(round)) return true;
		if (pointingColumnReduction(round)) return true;
		if (rowBoxReduction(round)) return true;
		if (colBoxReduction(round)) return true;
		if (hiddenPairInRow(round)) return true;
		if (hiddenPairInColumn(round)) return true;
		if (hiddenPairInSection(round)) return true;
		return false;
	}

	boolean colBoxReduction(int round){
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			for (int col=0; col<9; col++){
				int colStart = columnToFirstCell(col);
				boolean inOneBox = true;
				int colBox = -1;
				for (int i=0; i<3; i++){
					for (int j=0; j<3; j++){
						int row = i*3+j;
						int position = rowColumnToCell(row, col);
						int valPos = getPossibilityIndex(valIndex,position);
						if(possibilities[valPos] == 0){
							if (colBox == -1 || colBox == i){
								colBox = i;
							} else {
								inOneBox = false;
							}
						}
					}
				}
				if (inOneBox && colBox != -1){
					boolean doneSomething = false;
					int row = 3*colBox;
					int secStart = cellToSectionStartCell(rowColumnToCell(row, col));
					int secStartRow = cellToRow(secStart);
					int secStartCol = cellToColumn(secStart);
					for (int i=0; i<3; i++){
						for (int j=0; j<3; j++){
							int row2 = secStartRow+i;
							int col2 = secStartCol+j;
							int position = rowColumnToCell(row2, col2);
							int valPos = getPossibilityIndex(valIndex,position);
							if (col != col2 && possibilities[valPos] == 0){
								possibilities[valPos] = round;
								doneSomething = true;
							}
						}
					}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.COLUMN_BOX, valIndex+1, colStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	boolean rowBoxReduction(int round){
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			for (int row=0; row<9; row++){
				int rowStart = rowToFirstCell(row);
				boolean inOneBox = true;
				int rowBox = -1;
				for (int i=0; i<3; i++){
					for (int j=0; j<3; j++){
						int column = i*3+j;
						int position = rowColumnToCell(row, column);
						int valPos = getPossibilityIndex(valIndex,position);
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
					boolean doneSomething = false;
					int column = 3*rowBox;
					int secStart = cellToSectionStartCell(rowColumnToCell(row, column));
					int secStartRow = cellToRow(secStart);
					int secStartCol = cellToColumn(secStart);
					for (int i=0; i<3; i++){
						for (int j=0; j<3; j++){
							int row2 = secStartRow+i;
							int col2 = secStartCol+j;
							int position = rowColumnToCell(row2, col2);
							int valPos = getPossibilityIndex(valIndex,position);
							if (row != row2 && possibilities[valPos] == 0){
								possibilities[valPos] = round;
								doneSomething = true;
							}
						}
					}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.ROW_BOX, valIndex+1, rowStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	boolean pointingRowReduction(int round){
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			for (int section=0; section<9; section++){
				int secStart = sectionToFirstCell(section);
				boolean inOneRow = true;
				int boxRow = -1;
				for (int j=0; j<3; j++){
					for (int i=0; i<3; i++){
						int secVal=secStart+i+(9*j);
						int valPos = getPossibilityIndex(valIndex,secVal);
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
					boolean doneSomething = false;
					int row = cellToRow(secStart) + boxRow;
					int rowStart = rowToFirstCell(row);

					for (int i=0; i<9; i++){
						int position = rowStart+i;
						int section2 = cellToSection(position);
						int valPos = getPossibilityIndex(valIndex,position);
						if (section != section2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.POINTING_PAIR_TRIPLE_ROW, valIndex+1, rowStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	boolean pointingColumnReduction(int round){
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			for (int section=0; section<9; section++){
				int secStart = sectionToFirstCell(section);
				boolean inOneCol = true;
				int boxCol = -1;
				for (int i=0; i<3; i++){
					for (int j=0; j<3; j++){
						int secVal=secStart+i+(9*j);
						int valPos = getPossibilityIndex(valIndex,secVal);
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
					boolean doneSomething = false;
					int col = cellToColumn(secStart) + boxCol;
					int colStart = columnToFirstCell(col);

					for (int i=0; i<9; i++){
						int position = colStart+(9*i);
						int section2 = cellToSection(position);
						int valPos = getPossibilityIndex(valIndex,position);
						if (section != section2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.POINTING_PAIR_TRIPLE_COLUMN, valIndex+1, colStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	int countPossibilities(int position){
		int count = 0;
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0) count++;
		}
		return count;
	}

	boolean arePossibilitiesSame(int position1, int position2){
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			int valPos1 = getPossibilityIndex(valIndex,position1);
			int valPos2 = getPossibilityIndex(valIndex,position2);
			if ((possibilities[valPos1] == 0 || possibilities[valPos2] == 0) && (possibilities[valPos1] != 0 || possibilities[valPos2] != 0)){
					return false;
			}
		}
		return true;
	}

	boolean removePossibilitiesInOneFromTwo(int position1, int position2, int round){
		boolean doneSomething = false;
		for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
			int valPos1 = getPossibilityIndex(valIndex,position1);
			int valPos2 = getPossibilityIndex(valIndex,position2);
			if (possibilities[valPos1] == 0 && possibilities[valPos2] == 0){
				possibilities[valPos2] = round;
				doneSomething = true;
			}
		}
		return doneSomething;
	}

	boolean hiddenPairInColumn(int round){
		for (int column=0; column<9; column++){
			for (int valIndex=0; valIndex<9; valIndex++){
				int r1 = -1;
				int r2 = -1;
				int valCount = 0;
				for (int row=0; row<9; row++){
					int position = rowColumnToCell(row,column);
					int valPos = getPossibilityIndex(valIndex,position);
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
					for (int valIndex2=valIndex+1; valIndex2<9; valIndex2++){
						int r3 = -1;
						int r4 = -1;
						int valCount2 = 0;
						for (int row=0; row<9; row++){
							int position = rowColumnToCell(row,column);
							int valPos = getPossibilityIndex(valIndex2,position);
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
							boolean doneSomething = false;
							for (int valIndex3=0; valIndex3<9; valIndex3++){
								if (valIndex3 != valIndex && valIndex3 != valIndex2){
									int position1 = rowColumnToCell(r1,column);
									int position2 = rowColumnToCell(r2,column);
									int valPos1 = getPossibilityIndex(valIndex3,position1);
									int valPos2 = getPossibilityIndex(valIndex3,position2);
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_PAIR_COLUMN, valIndex+1, rowColumnToCell(r1,column)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	boolean hiddenPairInSection(int round){
		for (int section=0; section<9; section++){
			for (int valIndex=0; valIndex<9; valIndex++){
				int si1 = -1;
				int si2 = -1;
				int valCount = 0;
				for (int secInd=0; secInd<9; secInd++){
					int position = sectionToCell(section,secInd);
					int valPos = getPossibilityIndex(valIndex,position);
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
					for (int valIndex2=valIndex+1; valIndex2<9; valIndex2++){
						int si3 = -1;
						int si4 = -1;
						int valCount2 = 0;
						for (int secInd=0; secInd<9; secInd++){
							int position = sectionToCell(section,secInd);
							int valPos = getPossibilityIndex(valIndex2,position);
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
							boolean doneSomething = false;
							for (int valIndex3=0; valIndex3<9; valIndex3++){
								if (valIndex3 != valIndex && valIndex3 != valIndex2){
									int position1 = sectionToCell(section,si1);
									int position2 = sectionToCell(section,si2);
									int valPos1 = getPossibilityIndex(valIndex3,position1);
									int valPos2 = getPossibilityIndex(valIndex3,position2);
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_PAIR_SECTION, valIndex+1, sectionToCell(section,si1)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	boolean hiddenPairInRow(int round){
		for (int row=0; row<9; row++){
			for (int valIndex=0; valIndex<9; valIndex++){
				int c1 = -1;
				int c2 = -1;
				int valCount = 0;
				for (int column=0; column<9; column++){
					int position = rowColumnToCell(row,column);
					int valPos = getPossibilityIndex(valIndex,position);
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
					for (int valIndex2=valIndex+1; valIndex2<9; valIndex2++){
						int c3 = -1;
						int c4 = -1;
						int valCount2 = 0;
						for (int column=0; column<9; column++){
							int position = rowColumnToCell(row,column);
							int valPos = getPossibilityIndex(valIndex2,position);
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
							boolean doneSomething = false;
							for (int valIndex3=0; valIndex3<9; valIndex3++){
								if (valIndex3 != valIndex && valIndex3 != valIndex2){
									int position1 = rowColumnToCell(row,c1);
									int position2 = rowColumnToCell(row,c2);
									int valPos1 = getPossibilityIndex(valIndex3,position1);
									int valPos2 = getPossibilityIndex(valIndex3,position2);
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_PAIR_ROW, valIndex+1, rowColumnToCell(row,c1)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	boolean handleNakedPairs(int round){
		for (int position=0; position<BOARD_SIZE; position++){
			int possibilities = countPossibilities(position);
			if (possibilities == 2){
				int row = cellToRow(position);
				int column = cellToColumn(position);
				int section = cellToSectionStartCell(position);
				for (int position2=position; position2<BOARD_SIZE; position2++){
					if (position != position2){
						int possibilities2 = countPossibilities(position2);
						if (possibilities2 == 2 && arePossibilitiesSame(position, position2)){
							if (row == cellToRow(position2)){
								boolean doneSomething = false;
								for (int column2=0; column2<9; column2++){
									int position3 = rowColumnToCell(row,column2);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.NAKED_PAIR_ROW, 0, position));
									return true;
								}
							}
							if (column == cellToColumn(position2)){
								boolean doneSomething = false;
								for (int row2=0; row2<9; row2++){
									int position3 = rowColumnToCell(row2,column);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.NAKED_PAIR_COLUMN, 0, position));
									return true;
								}
							}
							if (section == cellToSectionStartCell(position2)){
								boolean doneSomething = false;
								int secStart = cellToSectionStartCell(position);
								for (int i=0; i<3; i++){
									for (int j=0; j<3; j++){
										int position3=secStart+i+(9*j);
										if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
											doneSomething = true;
										}
									}
								}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.NAKED_PAIR_SECTION, 0, position));
									return true;
								}
							}
						}
					}
				}
			}
		}
		return false;
	}

	/**
	 * Mark exactly one cell which is the only possible value for some row, if
	 * such a cell exists.
	 * This method will look in a row for a possibility that is only listed
	 * for one cell.  This type of cell is often called a "hidden single"
	 */
	boolean onlyValueInRow(int round) throws Exception {
		for (int row=0; row<ROW_LENGTH; row++){
			for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
				int count = 0;
				int lastPosition = 0;
				for (int col=0; col<COL_HEIGHT; col++){
					int position = (row*ROW_LENGTH)+col;
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_SINGLE_ROW, value, lastPosition));
					mark(lastPosition, round, value);
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
	boolean onlyValueInColumn(int round) throws Exception {
		for (int col=0; col<COL_HEIGHT; col++){
			for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
				int count = 0;
				int lastPosition = 0;
				for (int row=0; row<ROW_LENGTH; row++){
					int position = rowColumnToCell(row,col);
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_SINGLE_COLUMN, value, lastPosition));
					mark(lastPosition, round, value);
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
	boolean onlyValueInSection(int round) throws Exception {
		for (int sec=0; sec<SEC_COUNT; sec++){
			int secPos = sectionToFirstCell(sec);
			for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
				int count = 0;
				int lastPosition = 0;
				for (int i=0; i<3; i++){
					for (int j=0; j<3; j++){
						int position = secPos + i + 9*j;
						int valPos = getPossibilityIndex(valIndex,position);
						if (possibilities[valPos] == 0){
							count++;
							lastPosition = position;
						}
					}
				}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.HIDDEN_SINGLE_SECTION, value, lastPosition));
					mark(lastPosition, round, value);
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Mark exactly one cell that has a single possibility, if such a cell exists.
	 * This method will look for a cell that has only one possibility.  This type
	 * of cell is often called a "single"
	 */
	boolean onlyPossibilityForCell(int round) throws Exception {
		for (int position=0; position<BOARD_SIZE; position++){
			if (solution[position] == 0){
				int count = 0;
				int lastValue = 0;
				for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastValue=valIndex+1;
					}
				}
				if (count == 1){
					mark(position, round, lastValue);
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem.SINGLE, lastValue, position));
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Mark the given value at the given position.  Go through
	 * the row, column, and section for the position and remove
	 * the value from the possibilities.
	 *
	 * @param position Position into the board (0-80)
	 * @param round Round to mark for rollback purposes
	 * @param value The value to go in the square at the given position
	 */
	void mark(int position, int round, int value) throws Exception {
		if (solution[position] != 0)
			throw new Exception("Marking position that already has been marked.");
		if (solutionRound[position] !=0)
			throw new Exception("Marking position that was marked another round.");
		int valIndex = value-1;
		solution[position] = value;

		int possInd = getPossibilityIndex(valIndex,position);
		if (possibilities[possInd] != 0)
			throw new Exception("Marking impossible position.");

		// Take this value out of the possibilities for everything in the row
		solutionRound[position] = round;
		int rowStart = cellToRow(position)*9;
		for (int col=0; col<COL_HEIGHT; col++){
			int rowVal=rowStart+col;
			int valPos = getPossibilityIndex(valIndex,rowVal);
			//System.out.println("Row Start: "+rowStart+" Row Value: "+rowVal+" Value Position: "+valPos);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}

		// Take this value out of the possibilities for everything in the column
		int colStart = cellToColumn(position);
		for (int i=0; i<9; i++){
			int colVal=colStart+(9*i);
			int valPos = getPossibilityIndex(valIndex,colVal);
			//System.out.println("Col Start: "+colStart+" Col Value: "+colVal+" Value Position: "+valPos);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}

		// Take this value out of the possibilities for everything in section
		int secStart = cellToSectionStartCell(position);
		for (int i=0; i<3; i++){
			for (int j=0; j<3; j++){
				int secVal=secStart+i+(9*j);
				int valPos = getPossibilityIndex(valIndex,secVal);
				//System.out.println("Sec Start: "+secStart+" Sec Value: "+secVal+" Value Position: "+valPos);
				if (possibilities[valPos] == 0){
					possibilities[valPos] = round;
				}
			}
		}

		//This position itself is determined, it should have possibilities.
		for (valIndex=0; valIndex<9; valIndex++){
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}

		//System.out.println("Col Start: "+colStart+" Row Start: "+rowStart+" Section Start: "+secStart<< " Value: "+value);
		//printPossibilities();
	}

	/**
	 * Print a human readable list of all the possibilities for the
	 * squares that have not yet been filled in.
	 */
	void printPossibilities(){
		for(int i=0; i<BOARD_SIZE; i++){
			System.out.print(" ");
			for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
				int posVal = (9*i)+valIndex;
				int value = valIndex+1;
				if (possibilities[posVal]==0){
					System.out.println(value);
				} else {
					System.out.print(".");
				}
			}
			if (i != BOARD_SIZE-1 && i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
				System.out.println();
				System.out.println("-------------------------------|-------------------------------|-------------------------------");
			} else if (i%9==8){
				System.out.println();
			} else if (i%3==2){
				System.out.print(" |");
			}
		}
		System.out.println();
	}

	/**
	 * print the given BOARD_SIZEd array of ints
	 * as a sudoku puzzle.  Use print options from
	 * member variables.
	 */
	void print(int[] sudoku){
		for(int i=0; i<BOARD_SIZE; i++){
			if (printStyle == PrintStyle.READABLE){
				System.out.print(" ");
			}
			if (sudoku[i]==0){
				System.out.print('.');
			} else {
				System.out.print(sudoku[i]);
			}
			if (i == BOARD_SIZE-1){
				if (printStyle == PrintStyle.CSV){
					System.out.print(",");
				} else {
					System.out.println();
				}
				if (printStyle == PrintStyle.READABLE || printStyle == PrintStyle.COMPACT){
					System.out.println();
				}
			} else if (i%9==8){
				if (printStyle == PrintStyle.READABLE || printStyle == PrintStyle.COMPACT){
					System.out.println();
				}
				if (i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
					if (printStyle == PrintStyle.READABLE){
						System.out.println("-------|-------|-------");
					}
				}
			} else if (i%3==2){
				if (printStyle == PrintStyle.READABLE){
					System.out.print(" |");
				}
			}
		}
	}

	/**
	 * Print the sudoku puzzle.
	 */
	void printPuzzle(){
		print(puzzle);
	}

	/**
	 * Print the sudoku solution.
	 */
	void printSolution(){
		print(solution);
	}

	/**
	 * Main method -- the entry point into the program.
	 * Run with --help as an argument for usage and documentation
	 */
	public static void main(String[] argv){
		try {
			// Start time for the application for timing
			long applicationStartTime = getMicroseconds();

			// The number of puzzles solved or generated.
			int puzzleCount = 0;

			// defaults for options
			boolean printPuzzle = false;
			boolean printSolution = false;
			boolean printHistory = false;
			boolean printInstructions = false;
			boolean timer = false;
			boolean countSolutions = false;
			int action = NONE;
			boolean logHistory = false;
			PrintStyle printStyle = PrintStyle.READABLE;
			int numberToGenerate = 1;
			boolean printStats = false;
			Difficulty difficulty = Difficulty.UNKNOWN;
			Symmetry symmetry = Symmetry.NONE;

			// Read the arguments and set the options
			for (int i=0; i<argv.length; i++){
				if (argv[i].equals("--puzzle")){
					printPuzzle = true;
				} else if (argv[i].equals("--nopuzzle")){
					printPuzzle = false;
				} else if (argv[i].equals("--solution")){
					printSolution = true;
				} else if (argv[i].equals("--nosolution")){
					printSolution = false;
				} else if (argv[i].equals("--history")){
					printHistory = true;
				} else if (argv[i].equals("--nohistory")){
					printHistory = false;
				} else if (argv[i].equals("--instructions")){
					printInstructions = true;
				} else if (argv[i].equals("--noinstructions")){
					printInstructions = false;
				} else if (argv[i].equals("--stats")){
					printStats = true;
				} else if (argv[i].equals("--nostats")){
					printStats = false;
				} else if (argv[i].equals("--timer")){
					timer = true;
				} else if (argv[i].equals("--notimer")){
					timer = false;
				} else if (argv[i].equals("--count-solutions")){
					countSolutions = true;
				} else if (argv[i].equals("--nocount-solutions")){
					countSolutions = false;
				} else if (argv[i].equals("--generate")){
					action = GENERATE;
					printPuzzle = true;
					if (i+1 < argv.length){
						numberToGenerate = Integer.parseInt(argv[i+1]);
						i++;
					}
				} else if (argv[i].equals("--difficulty")){
					if (argv.length <= i+1){
						System.out.println("Please specify a difficulty.");
						System.exit(1);
					} else if (argv[i+1].equalsIgnoreCase("simple")){
						difficulty = Difficulty.SIMPLE;
					} else if (argv[i+1].equalsIgnoreCase("easy")){
						difficulty = Difficulty.EASY;
					} else if (argv[i+1].equalsIgnoreCase("intermediate")){
						difficulty = Difficulty.INTERMEDIATE;
					} else if (argv[i+1].equalsIgnoreCase("expert")){
						difficulty = Difficulty.EXPERT;
					} else {
						System.out.println("Difficulty expected to be simple, easy, intermediate, or expert, not "+argv[i+1]);
						System.exit(1);
					}
					i++;
				} else if (argv[i].equals("--symmetry")){
					if (argv.length <= i+1){
						System.out.println("Please specify a symmetry.");
						System.exit(1);
					} else if (argv[i+1].equals("none")){
						symmetry = Symmetry.NONE;
					} else if (argv[i+1].equals("rotate90")){
						symmetry = Symmetry.ROTATE90;
					} else if (argv[i+1].equals("rotate180")){
						symmetry = Symmetry.ROTATE180;
					} else if (argv[i+1].equals("mirror")){
						symmetry = Symmetry.MIRROR;
					} else if (argv[i+1].equals("flip")){
						symmetry = Symmetry.FLIP;
					} else if (argv[i+1].equals("random")){
						symmetry = Symmetry.RANDOM;
					} else {
						System.out.println("Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not " + argv[i+1]);
						System.exit(1);
					}
					i++;
				} else if (argv[i].equals("--solve")){
					action = SOLVE;
					printSolution = true;
				} else if (argv[i].equals("--log-history")){
					logHistory = true;
				} else if (argv[i].equals("--nolog-history")){
					logHistory = false;
				} else if (argv[i].equals("--one-line")){
					printStyle=PrintStyle.ONE_LINE;
				} else if (argv[i].equals("--compact")){
					printStyle=PrintStyle.COMPACT;
				} else if (argv[i].equals("--readable")){
					printStyle=PrintStyle.READABLE;
				} else if (argv[i].equals("--csv")){
					printStyle=PrintStyle.CSV;
				} else if (argv[i].equals("-n") || argv[i].equals("--number")){
					if (i+1 < argv.length){
						numberToGenerate = Integer.parseInt(argv[i+1]);
						i++;
					} else {
						System.out.println("Please specify a number.");
						System.exit(1);
					}
				} else if (argv[i].equals("-h") || argv[i].equals("--help") || argv[i].equals("help") || argv[i].equals("?")){
					printHelp("GameGenerator");
					System.exit(0);
				} else if (argv[i].equals("--version")){
					printVersion();
					System.exit(0);
				} else if (argv[i].equals("--about")){
					printAbout();
					System.exit(0);
				} else {
					System.out.println("Unknown argument: '"+argv[i]+"'");
					printHelp("GameGenerator");
					System.exit(0);
				}
			}

			if (action == NONE){
				System.out.println("Either --solve or --generate must be specified.");
				printHelp("GameGenerator");
				System.exit(1);
			}

			// Initialize the random number generator
			Calendar c = Calendar.getInstance();
			QQWing.r = new Random(c.getTimeInMillis());

			// If printing out CSV, print a header
			if (printStyle == PrintStyle.CSV){
				if (printPuzzle) System.out.print("Puzzle,");
				if (printSolution) System.out.print("Solution,");
				if (printHistory) System.out.print("Solve History,");
				if (printInstructions) System.out.print("Solve Instructions,");
				if (countSolutions) System.out.print("Solution Count,");
				if (timer) System.out.print("Time (milliseconds),");
				if (printStats) System.out.print("Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty");
				System.out.println("");
			}

			// Create a new puzzle board
			// and set the options
			QQWing ss = new QQWing();
			ss.setRecordHistory(printHistory || printInstructions || printStats || difficulty!=Difficulty.UNKNOWN);
			ss.setLogHistory(logHistory);
			ss.setPrintStyle(printStyle);

			// Solve puzzle or generate puzzles
			// until end of input for solving, or
			// until we have generated the specified number.
			boolean done = false;
			int numberGenerated = 0;
			while (!done){
				// record the start time for the timer.
				long puzzleStartTime = getMicroseconds();

				// iff something has been printed for this particular puzzle
				boolean printedSomething = false;

				// Record whether the puzzle was possible or not,
				// so that we don't try to solve impossible givens.
				boolean havePuzzle = false;
				if (action == GENERATE){
					// Generate a puzzle
					havePuzzle = ss.generatePuzzleSymmetry(symmetry);
					if (!havePuzzle && printPuzzle){
						System.out.print("Could not generate puzzle.");
						if (printStyle==PrintStyle.CSV){
							System.out.println(",");
						} else {
							System.out.println();
						}
						printedSomething = true;
					}
				} else {
					// Read the next puzzle on STDIN
					int[] puzzle = new int[BOARD_SIZE];
					if (readPuzzleFromStdIn(puzzle)){
						havePuzzle = ss.setPuzzle(puzzle);
						if (!havePuzzle){
							if (printPuzzle){
								ss.printPuzzle();
								printedSomething = true;
							}
							if (printSolution) {
								System.out.print("Puzzle is not possible.");
								if (printStyle==PrintStyle.CSV){
									System.out.print(",");
								} else {
									System.out.println();
								}
								printedSomething = true;
							}
						}
					} else {
						// Set loop to terminate when nothing is left on STDIN
						havePuzzle = false;
						done = true;
					}
					puzzle = null;
				}

				int solutions = 0;

				if (havePuzzle){

					// Count the solutions if requested.
					// (Must be done before solving, as it would
					// mess up the stats.)
					if (countSolutions){
						solutions = ss.countSolutions();
					}

					// Solve the puzzle
					if (printSolution || printHistory || printStats || printInstructions || difficulty!=Difficulty.UNKNOWN){
						ss.solve();
					}

					// Bail out if it didn't meet the difficulty standards for generation
					if (action == GENERATE){
						if (difficulty!=Difficulty.UNKNOWN && difficulty!=ss.getDifficulty()){
							havePuzzle = false;
						} else {
							numberGenerated++;
							// Set loop to terminate if enough have been generated.
							if (numberGenerated >= numberToGenerate) done = true;
						}
					}
				}

				if (havePuzzle){

					// With a puzzle now in hand and possibly solved
					// print out the solution, stats, etc.
					printedSomething = true;

					// Record the end time for the timer.
					long puzzleDoneTime = getMicroseconds();

					// Print the puzzle itself.
					if (printPuzzle) ss.printPuzzle();

					// Print the solution if there is one
					if (printSolution){
						if (ss.isSolved()){
							ss.printSolution();
						} else {
							System.out.print("Puzzle has no solution.");
							if (printStyle==PrintStyle.CSV){
								System.out.print(",");
							} else {
								System.out.println();
							}
						}
					}

					// Print the steps taken to solve or attempt to solve the puzzle.
					if (printHistory) ss.printSolveHistory();
					// Print the instructions for solving the puzzle
					if (printInstructions) ss.printSolveInstructions();

					// Print the number of solutions to the puzzle.
					if (countSolutions){
						if (printStyle == PrintStyle.CSV){
							System.out.print(solutions+",");
						} else {
							if (solutions == 0){
								System.out.println("There are no solutions to the puzzle.");
							} else if (solutions == 1){
								System.out.println("The solution to the puzzle is unique.");
							} else {
								System.out.println("There are "+solutions+" solutions to the puzzle.");
							}
						}
					}

					// Print out the time it took to solve the puzzle.
					if (timer){
						double t = ((double)(puzzleDoneTime - puzzleStartTime))/1000.0;
						if (printStyle == PrintStyle.CSV){
							System.out.print(t+",");
						} else {
							System.out.println("Time: "+t +" milliseconds");
						}
					}

					// Print any stats we were able to gather while solving the puzzle.
					if (printStats){
						int givenCount = ss.getGivenCount();
						int singleCount = ss.getSingleCount();
						int hiddenSingleCount = ss.getHiddenSingleCount();
						int nakedPairCount = ss.getNakedPairCount();
						int hiddenPairCount = ss.getHiddenPairCount();
						int pointingPairTripleCount = ss.getPointingPairTripleCount();
						int boxReductionCount = ss.getBoxLineReductionCount();
						int guessCount = ss.getGuessCount();
						int backtrackCount = ss.getBacktrackCount();
						String difficultyString = ss.getDifficultyAsString();
						if (printStyle == PrintStyle.CSV){
							System.out.println(givenCount+"," +singleCount+","+hiddenSingleCount
									+","+nakedPairCount+","+hiddenPairCount
									+"," +pointingPairTripleCount +"," +boxReductionCount
									+","+guessCount+","+backtrackCount
									+","+difficultyString+",");
						} else {
							System.out.println("Number of Givens: "+givenCount );
							System.out.println("Number of Singles: "+singleCount);
							System.out.println("Number of Hidden Singles: "+hiddenSingleCount );
							System.out.println("Number of Naked Pairs: "+nakedPairCount );
							System.out.println("Number of Hidden Pairs: "+hiddenPairCount );
							System.out.println("Number of Pointing Pairs/Triples: "+pointingPairTripleCount );
							System.out.println("Number of Box/Line Intersections: "+boxReductionCount );
							System.out.println("Number of Guesses: "+guessCount );
							System.out.println("Number of Backtracks: "+backtrackCount );
							System.out.println("Difficulty: "+difficultyString );
						}
					}
					puzzleCount++;
				}
				if (printedSomething && printStyle == PrintStyle.CSV){
					System.out.println();
				}
			}

			ss = null;

			long applicationDoneTime = getMicroseconds();
			// Print out the time it took to do everything
			if (timer){
				double t = ((double)(applicationDoneTime - applicationStartTime))/1000000.0;
				System.out.println(puzzleCount+" puzzle"+((puzzleCount==1)?"":"s")+" "+(action==GENERATE?"generated":"solved")+" in "+t+" seconds.");
			}
		} catch (Exception e){
			//System.out.println(e);
			e.printStackTrace(System.out);
			System.exit(1);
		}
		System.exit(0);
	}

	static void printVersion(){
		System.out.println(QQWING_VERSION);
	}

	static void printAbout(){
		System.out.println(" - Sudoku solver and generator.");
		System.out.println("Written by Stephen Ostermiller copyright 2006.");
		System.out.println("http://ostermiller.org/qqwing/");
		System.out.println("");
		System.out.println("This program is free software; you can redistribute it and/or modify");
		System.out.println("it under the terms of the GNU General Public License as published by");
		System.out.println("the Free Software Foundation; either version 2 of the License, or");
		System.out.println("(at your option) any later version.");
		System.out.println("");
		System.out.println("This program is distributed in the hope that it will be useful,");
		System.out.println("but WITHOUT ANY WARRANTY; without even the implied warranty of");
		System.out.println("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
		System.out.println("GNU General Public License for more details.");
		System.out.println("");
		System.out.println("You should have received a copy of the GNU General Public License");
		System.out.println("along with this program; if not, write to the Free Software");
		System.out.println("Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA");
	}

	static void printHelp(String programName){
		System.out.println(programName+" <options>");
		System.out.println("Sudoku solver and generator.");
		System.out.println("  --generate <num>     Generate new puzzles");
		System.out.println("  --solve              Solve all the puzzles from standard input");
		System.out.println("  --difficulty <diff>  Generate only simple,easy, intermediate, or expert");
		System.out.println("  --symmetry <sym>     Symmetry: none, rotate90, rotate180, mirror, flip, or random");
		System.out.println("  --puzzle             Print the puzzle (default when generating)");
		System.out.println("  --nopuzzle           Do not print the puzzle (default when solving)");
		System.out.println("  --solution           Print the solution (default when solving)");
		System.out.println("  --nosolution         Do not print the solution (default when generating)");
		System.out.println("  --stats              Print statistics about moves used to solve the puzzle");
		System.out.println("  --nostats            Do not print statistics (default)");
		System.out.println("  --timer              Print time to generate or solve each puzzle");
		System.out.println("  --notimer            Do not print solve or generation times (default)");
		System.out.println("  --count-solutions    Count the number of solutions to puzzles");
		System.out.println("  --nocount-solutions  Do not count the number of solutions (default)");
		System.out.println("  --history            Print trial and error used when solving");
		System.out.println("  --nohistory          Do not print trial and error to solve (default)");
		System.out.println("  --instructions       Print the steps (at least 81) needed to solve the puzzle");
		System.out.println("  --noinstructions     Do not print steps to solve (default)");
		System.out.println("  --log-history        Print trial and error to solve as it happens");
		System.out.println("  --nolog-history      Do not print trial and error  to solve as it happens");
		System.out.println("  --one-line           Print puzzles on one line of 81 characters");
		System.out.println("  --compact            Print puzzles on 9 lines of 9 characters");
		System.out.println("  --readable           Print puzzles in human readable form (default)");
		System.out.println("  --csv                Ouput CSV format with one line puzzles");
		System.out.println("  --help               Print this message");
		System.out.println("  --about              Author and license information");
		System.out.println("  --version            Display current version number");
	}

	/**
	 * Given a vector of LogItems, determine how many
	 * log items in the vector are of the specified type.
	 */
	int getLogCount(ArrayList<LogItem> v, int type){
		int count = 0;
		for (int i=0; i<v.size(); i++){
			if((v.get(i)).getType() == type) count++;
		}
		return count;
	}

	/**
	 * Get the current time in microseconds.
	 */
	static long getMicroseconds(){
		Calendar c = Calendar.getInstance();
		return c.getTimeInMillis()*1000;
	}

	/**
	 * Shuffle the values in an array of integers.
	 */
	void shuffleArray(int[] array, int size){
		//Random r = new Random();
		for (int i=0; i<size; i++){
			int tailSize = size-i;
			int randTailPos = Math.abs(r.nextInt())%tailSize+i;
			int temp = array[i];
			//System.out.println("tailSize "+tailSize+" randTailPos "+randTailPos+ " arraySize "+array.length);
			array[i] = array[randTailPos];
			array[randTailPos] = temp;
		}
	}

	static Symmetry getRandomSymmetry(){
		int rand = Math.abs(r.nextInt())%4;
		switch (rand){
			case 0: return  Symmetry.ROTATE90;
			case 1: return  Symmetry.ROTATE180;
			case 2: return  Symmetry.MIRROR;
			case 3: return  Symmetry.FLIP;
		}
		throw new UnsupportedOperationException("Unexpected random value: " + rand);
	}

	/**
	 * Read a sudoku puzzle from standard input.
	 * STDIN is processed one character at a time
	 * until the sudoku is filled in.  Any digit
	 * or period is used to fill the sudoku, any
	 * other character is ignored.
	 */
	static boolean readPuzzleFromStdIn(int[] puzzle) throws IOException {
		int read = 0;
		char c; //= getchar();
		BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
		String input = "";
		StringBuffer buffer = new StringBuffer();
		int inputLoops = 0;
		while(true){
				inputLoops++;
				if (inputLoops == 1)
						System.out.print("PUZZLE: ");
				else
						System.out.print("  MORE: ");
			//As easy as that. Just readline, and receive a string with
			//the LF/CR stripped away.
			input = in.readLine();
			//Is a faster alternative to: if (input == null || input.equals(""))
			//The implementation of equals method inside String checks for
			// nulls before making any reference to the object.
			// Also the operator instance of returns false if the left-hand operand is null
			if ("".equals(input)){
				break;
			} else {
				//Output in uppercase
				buffer.append(input);
				if (buffer.length() < BOARD_SIZE)
						continue;
				else
						break;
			}
		}
		System.out.print("  DONE! ");
		/**
		 * load buffer into puzzle
		 */
		for (int i=0;i<buffer.length(); i++) {
				c = buffer.charAt(i);
				if (c >= '1' && c <='9'){
						puzzle[read] = c-'0';
						read++;
				}
				if (c == '.' || c == '0'){
						puzzle[read] = 0;
						read++;
				}
		}

		return true;
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the column (0-8) in which that cell resides.
	 */
	static int cellToColumn(int cell){
		return cell%COL_HEIGHT;
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the row (0-8) in which it resides.
	 */
	static int cellToRow(int cell){
		return cell/ROW_LENGTH;
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the section (0-8) in which it resides.
	 */
	static int cellToSection(int cell){
		return (
			(cell/SEC_GROUP_SIZE*GRID_SIZE)
			+ (cellToColumn(cell)/GRID_SIZE)
		);
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the cell (0-80) that is the upper left start
	 * cell of that section.
	 */
	static int cellToSectionStartCell(int cell){
		return (
			(cell/SEC_GROUP_SIZE*SEC_GROUP_SIZE)
			+ (cellToColumn(cell)/GRID_SIZE*GRID_SIZE)
		);
	}

	/**
	 * Given a row (0-8) calculate the first cell (0-80)
	 * of that row.
	 */
	static int rowToFirstCell(int row){
		return 9*row;
	}

	/**
	 * Given a column (0-8) calculate the first cell (0-80)
	 * of that column.
	 */
	static int columnToFirstCell(int column){
		return column;
	}

	/**
	 * Given a section (0-8) calculate the first cell (0-80)
	 * of that section.
	 */
	static int sectionToFirstCell(int section){
		return (
			(section%GRID_SIZE*GRID_SIZE)
			+ (section/GRID_SIZE*SEC_GROUP_SIZE)
		);
	}

	/**
	 * Given a value for a cell (0-8) and a cell (0-80)
	 * calculate the offset into the possibility array (0-728).
	 */
	static int getPossibilityIndex(int valueIndex, int cell){
		return valueIndex+(NUM_POSS*cell);
	}

	/**
	 * Given a row (0-8) and a column (0-8) calculate the
	 * cell (0-80).
	 */
	static int rowColumnToCell(int row, int column){
		return (row*COL_HEIGHT)+column;
	}

	/**
	 * Given a section (0-8) and an offset into that section (0-8)
	 * calculate the cell (0-80)
	 */
	static int sectionToCell(int section, int offset){
		return (
			sectionToFirstCell(section)
			+ ((offset/GRID_SIZE)*SEC_SIZE)
			+ (offset%GRID_SIZE)
		);
	}

	/**
	 * While solving the puzzle, log steps taken in a log item.
	 * This is useful for later printing out the solve history
	 * or gathering statistics about how hard the puzzle was to
	 * solve.
	 */
	private class LogItem {
		public static final int GIVEN = 1;
		public static final int SINGLE = 2;
		public static final int HIDDEN_SINGLE_ROW = 3;
		public static final int HIDDEN_SINGLE_COLUMN = 4;
		public static final int HIDDEN_SINGLE_SECTION = 5;
		public static final int GUESS = 6;
		public static final int ROLLBACK = 7;
		public static final int NAKED_PAIR_ROW = 8;
		public static final int NAKED_PAIR_COLUMN = 9;
		public static final int NAKED_PAIR_SECTION = 10;
		public static final int POINTING_PAIR_TRIPLE_ROW = 11;
		public static final int POINTING_PAIR_TRIPLE_COLUMN = 12;
		public static final int ROW_BOX = 13;
		public static final int COLUMN_BOX = 14;
		public static final int HIDDEN_PAIR_ROW = 15;
		public static final int HIDDEN_PAIR_COLUMN = 16;
		public static final int HIDDEN_PAIR_SECTION = 17;

		/**
		 * The recursion level at which this item was gathered.
		 * Used for backing out log items solve branches that
		 * don't lead to a solution.
		 */
		int round;

		/**
		 * The type of log message that will determine the
		 * message printed.
		 */
		int type;

		/**
		 * Value that was set by the operation (or zero for no value)
		 */
		int value;

		/**
		 * position on the board at which the value (if any) was set.
		 */
		int position;


		LogItem(int r, int t){
			init(r,t,0,-1);
		}

		LogItem(int r, int t, int v, int p){
			init(r,t,v,p);
		}

		void init(int r, int t, int v, int p){
			round = r;
			type = t;
			value = v;
			position = p;
		}

		int getRound(){
			return round;
		}

		/**
		 * Get the type of this log item.
		 */
		int getType(){
			return type;
		}

		/**
		 * Print the current log item.  The message used is
		 * determined by the type of log item.
		 */
		void print(){
			System.out.println("Round: "+getRound()+" - ");
			switch(type){
				case GIVEN:{
					System.out.println("Mark given");
				} break;
				case ROLLBACK:{
					System.out.println("Roll back round");
				} break;
				case GUESS:{
					System.out.println("Mark guess (start round)");
				} break;
				case HIDDEN_SINGLE_ROW:{
					System.out.println("Mark single possibility for value in row");
				} break;
				case HIDDEN_SINGLE_COLUMN:{
					System.out.println("Mark single possibility for value in column");
				} break;
				case HIDDEN_SINGLE_SECTION:{
					System.out.println("Mark single possibility for value in section");
				} break;
				case SINGLE:{
					System.out.println("Mark only possibility for cell");
				} break;
				case NAKED_PAIR_ROW:{
					System.out.println("Remove possibilities for naked pair in row");
				} break;
				case NAKED_PAIR_COLUMN:{
					System.out.println("Remove possibilities for naked pair in column");
				} break;
				case NAKED_PAIR_SECTION:{
					System.out.println("Remove possibilities for naked pair in section");
				} break;
				case POINTING_PAIR_TRIPLE_ROW: {
					System.out.println("Remove possibilities for row because all values are in one section");
				} break;
				case POINTING_PAIR_TRIPLE_COLUMN: {
					System.out.println("Remove possibilities for column because all values are in one section");
				} break;
				case ROW_BOX: {
					System.out.println("Remove possibilities for section because all values are in one row");
				} break;
				case COLUMN_BOX: {
					System.out.println("Remove possibilities for section because all values are in one column");
				} break;
				case HIDDEN_PAIR_ROW: {
					System.out.println("Remove possibilities from hidden pair in row");
				} break;
				case HIDDEN_PAIR_COLUMN: {
					System.out.println("Remove possibilities from hidden pair in column");
				} break;
				case HIDDEN_PAIR_SECTION: {
					System.out.println("Remove possibilities from hidden pair in section");
				} break;
				default:{
					System.out.println("!!! Performed unknown optimization !!!");
				} break;
			}
			if (value > 0 || position > -1){
				System.out.println(" (");
				boolean printed = false;
				if (position > -1){
					if (printed) System.out.println(" - ");
					System.out.println("Row: "+QQWing.cellToRow(position)+1+" - Column: "+QQWing.cellToColumn(position)+1);
					printed = true;
				}
				if (value > 0){
					if (printed) System.out.println(" - ");
					System.out.println("Value: "+value);
					printed = true;
				}
				System.out.println(")");
			}
		}
	}
}
