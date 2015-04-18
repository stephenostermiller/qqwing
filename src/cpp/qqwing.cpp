/*
 * qqwing - Sudoku solver and generator
 * Copyright (C) 2006-2014 Stephen Ostermiller http://ostermiller.org/
 * Copyright (C) 2007 Jacques Bensimon (jacques@ipm.com)
 * Copyright (C) 2011 Jean Guillerez (j.guillerez - orange.fr)
 * Copyright (C) 2014 Michael Catanzaro (mcatanzaro@gnome.org)
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
#include "config.h"

#include <cstdlib>
#include <iostream>

#include "qqwing.hpp"

namespace qqwing {

	string getVersion(){
		return VERSION;
	}

	/**
	 * While solving the puzzle, log steps taken in a log item.
	 * This is useful for later printing out the solve history
	 * or gathering statistics about how hard the puzzle was to
	 * solve.
	 */
	class LogItem {
		public:
			enum LogType {
				GIVEN,
				SINGLE,
				HIDDEN_SINGLE_ROW,
				HIDDEN_SINGLE_COLUMN,
				HIDDEN_SINGLE_SECTION,
				GUESS,
				ROLLBACK,
				NAKED_PAIR_ROW,
				NAKED_PAIR_COLUMN,
				NAKED_PAIR_SECTION,
				POINTING_PAIR_TRIPLE_ROW,
				POINTING_PAIR_TRIPLE_COLUMN,
				ROW_BOX,
				COLUMN_BOX,
				HIDDEN_PAIR_ROW,
				HIDDEN_PAIR_COLUMN,
				HIDDEN_PAIR_SECTION
			};
			LogItem(int round, LogType type);
			LogItem(int round, LogType type, int value, int position);
			int getRound();
			void print();
			LogType getType();
			~LogItem();
		private:
			void init(int round, LogType type, int value, int position);
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
			LogType type;

			/**
			 * Value that was set by the operation (or zero for no value)
			 */
			int value;

			/**
			 * position on the board at which the value (if any) was set.
			 */
			int position;
	};

	void shuffleArray(int* array, int size);
	SudokuBoard::Symmetry getRandomSymmetry();
	int getLogCount(vector<LogItem*>* v, LogItem::LogType type);
	static inline int cellToColumn(int cell);
	static inline int cellToRow(int cell);
	static inline int cellToSectionStartCell(int cell);
	static inline int cellToSection(int cell);
	static inline int rowToFirstCell(int row);
	static inline int columnToFirstCell(int column);
	static inline int sectionToFirstCell(int section);
	static inline int getPossibilityIndex(int valueIndex, int cell);
	static inline int rowColumnToCell(int row, int column);
	static inline int sectionToCell(int section, int offset);

	/**
	 * Create a new Sudoku board
	 */
	SudokuBoard::SudokuBoard() :
		puzzle ( new int[BOARD_SIZE] ),
		solution ( new int[BOARD_SIZE] ),
		solutionRound ( new int[BOARD_SIZE] ),
		possibilities ( new int[POSSIBILITY_SIZE] ),
		randomBoardArray ( new int[BOARD_SIZE] ),
		randomPossibilityArray ( new int[ROW_COL_SEC_SIZE] ),
		recordHistory ( false ),
		logHistory( false ),
		solveHistory ( new vector<LogItem*>() ),
		solveInstructions ( new vector<LogItem*>() ),
		printStyle ( READABLE ),
		lastSolveRound (0)
	{
		{for (int i=0; i<BOARD_SIZE; i++){
			randomBoardArray[i] = i;
		}}
		{for (int i=0; i<ROW_COL_SEC_SIZE; i++){
			randomPossibilityArray[i] = i;
		}}
	}

	/**
	 * Get the number of cells that are
	 * set in the puzzle (as opposed to
	 * figured out in the solution
	 */
	int SudokuBoard::getGivenCount(){
		int count = 0;
		{for (int i=0; i<BOARD_SIZE; i++){
			if (puzzle[i] != 0) count++;
		}}
		return count;
	}

	/**
	 * Set the board to the given puzzle.
	 * The given puzzle must be an array of 81 integers.
	 */
	bool SudokuBoard::setPuzzle(int* initPuzzle){
		{for (int i=0; i<BOARD_SIZE; i++){
			puzzle[i] = (initPuzzle==NULL)?0:initPuzzle[i];
		}}
		return reset();
	}

	/**
	 * Retrieves the puzzle as an unmodifiable array of 81 integers.
	 */
	const int* SudokuBoard::getPuzzle(){
		return puzzle;
	}

	/**
	 * Retrieves the puzzle's solution as an unmodifiable array of 81 integers.
	 */
	const int* SudokuBoard::getSolution(){
		return solution;
	}

	/**
	 * Reset the board to its initial state with
	 * only the givens.
	 * This method clears any solution, resets statistics,
	 * and clears any history messages.
	 */
	bool SudokuBoard::reset(){
		{for (int i=0; i<BOARD_SIZE; i++){
			solution[i] = 0;
		}}
		{for (int i=0; i<BOARD_SIZE; i++){
			solutionRound[i] = 0;
		}}
		{for (int i=0; i<POSSIBILITY_SIZE; i++){
			possibilities[i] = 0;
		}}

		{for (unsigned int i=0; i<solveHistory->size(); i++){
			delete solveHistory->at(i);
		}}
		solveHistory->clear();
		solveInstructions->clear();

		int round = 1;
		for (int position=0; position<BOARD_SIZE; position++){
			if (puzzle[position] > 0){
				int valIndex = puzzle[position]-1;
				int valPos = getPossibilityIndex(valIndex,position);
				int value = puzzle[position];
				if (possibilities[valPos] != 0) return false;
				mark(position,round,value);
				if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::GIVEN, value, position));
			}
		}
		return true;
	}

	/**
	 * Get the difficulty rating.
	 */
	SudokuBoard::Difficulty SudokuBoard::getDifficulty(){
		if (getGuessCount() > 0) return SudokuBoard::EXPERT;
		if (getBoxLineReductionCount() > 0) return SudokuBoard::INTERMEDIATE;
		if (getPointingPairTripleCount() > 0) return SudokuBoard::INTERMEDIATE;
		if (getHiddenPairCount() > 0) return SudokuBoard::INTERMEDIATE;
		if (getNakedPairCount() > 0) return SudokuBoard::INTERMEDIATE;
		if (getHiddenSingleCount() > 0) return SudokuBoard::EASY;
		if (getSingleCount() > 0) return SudokuBoard::SIMPLE;
		return SudokuBoard::UNKNOWN;
	}

	/**
	 * Get the difficulty rating.
	 */
	string SudokuBoard::getDifficultyAsString(){
		SudokuBoard::Difficulty difficulty = getDifficulty();
		switch (difficulty){
			case SudokuBoard::EXPERT: return "Expert";
			case SudokuBoard::INTERMEDIATE: return "Intermediate";
			case SudokuBoard::EASY: return "Easy";
			case SudokuBoard::SIMPLE: return "Simple";
			default: return "Unknown";
		}
	}

	/**
	 * Get the number of cells for which the solution was determined
	 * because there was only one possible value for that cell.
	 */
	int SudokuBoard::getSingleCount(){
		return getLogCount(solveInstructions, LogItem::SINGLE);
	}

	/**
	 * Get the number of cells for which the solution was determined
	 * because that cell had the only possibility for some value in
	 * the row, column, or section.
	 */
	int SudokuBoard::getHiddenSingleCount(){
		return getLogCount(solveInstructions, LogItem::HIDDEN_SINGLE_ROW) +
				getLogCount(solveInstructions, LogItem::HIDDEN_SINGLE_COLUMN) +
				getLogCount(solveInstructions, LogItem::HIDDEN_SINGLE_SECTION);
	}

	/**
	 * Get the number of naked pair reductions that were performed
	 * in solving this puzzle.
	 */
	int SudokuBoard::getNakedPairCount(){
		return getLogCount(solveInstructions, LogItem::NAKED_PAIR_ROW) +
				getLogCount(solveInstructions, LogItem::NAKED_PAIR_COLUMN) +
				getLogCount(solveInstructions, LogItem::NAKED_PAIR_SECTION);
	}

	/**
	 * Get the number of hidden pair reductions that were performed
	 * in solving this puzzle.
	 */
	int SudokuBoard::getHiddenPairCount(){
		return getLogCount(solveInstructions, LogItem::HIDDEN_PAIR_ROW) +
				getLogCount(solveInstructions, LogItem::HIDDEN_PAIR_COLUMN) +
				getLogCount(solveInstructions, LogItem::HIDDEN_PAIR_SECTION);
	}

	/**
	 * Get the number of pointing pair/triple reductions that were performed
	 * in solving this puzzle.
	 */
	int SudokuBoard::getPointingPairTripleCount(){
		return getLogCount(solveInstructions, LogItem::POINTING_PAIR_TRIPLE_ROW)+
			getLogCount(solveInstructions, LogItem::POINTING_PAIR_TRIPLE_COLUMN);
	}

	/**
	 * Get the number of box/line reductions that were performed
	 * in solving this puzzle.
	 */
	int SudokuBoard::getBoxLineReductionCount(){
		return getLogCount(solveInstructions, LogItem::ROW_BOX)+
			getLogCount(solveInstructions, LogItem::COLUMN_BOX);
	}

	/**
	 * Get the number lucky guesses in solving this puzzle.
	 */
	int SudokuBoard::getGuessCount(){
		return getLogCount(solveInstructions, LogItem::GUESS);
	}

	/**
	 * Get the number of backtracks (unlucky guesses) required
	 * when solving this puzzle.
	 */
	int SudokuBoard::getBacktrackCount(){
		return getLogCount(solveHistory, LogItem::ROLLBACK);
	}

	void SudokuBoard::shuffleRandomArrays(){
		shuffleArray(randomBoardArray, BOARD_SIZE);
		shuffleArray(randomPossibilityArray, ROW_COL_SEC_SIZE);
	}

	void SudokuBoard::clearPuzzle(){
		// Clear any existing puzzle
		{for (int i=0; i<BOARD_SIZE; i++){
			puzzle[i] = 0;
		}}
		reset();
	}

	bool SudokuBoard::generatePuzzle(){
		return generatePuzzleSymmetry(SudokuBoard::NONE);
	}

	bool SudokuBoard::generatePuzzleSymmetry(SudokuBoard::Symmetry symmetry){

		if (symmetry == SudokuBoard::RANDOM) symmetry = getRandomSymmetry();

		// Don't record history while generating.
		bool recHistory = recordHistory;
		setRecordHistory(false);
		bool lHistory = logHistory;
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

		if (symmetry == SudokuBoard::NONE){
			// Rollback any square for which it is obvious that
			// the square doesn't contribute to a unique solution
			// (ie, squares that were filled by logic rather
			// than by guess)
			rollbackNonGuesses();
		}

		// Record all marked squares as the puzzle so
		// that we can call countSolutions without losing it.
		{for (int i=0; i<BOARD_SIZE; i++){
			puzzle[i] = solution[i];
		}}

		// Rerandomize everything so that we test squares
		// in a different order than they were added.
		shuffleRandomArrays();

		// Remove one value at a time and see if
		// the puzzle still has only one solution.
		// If it does, leave it out the point because
		// it is not needed.
		{for (int i=0; i<BOARD_SIZE; i++){
			// check all the positions, but in shuffled order
			int position = randomBoardArray[i];
			if (puzzle[position] > 0){
				int positionsym1 = -1;
				int positionsym2 = -1;
				int positionsym3 = -1;
				switch (symmetry){
					case ROTATE90:
						positionsym2 = rowColumnToCell(ROW_COL_SEC_SIZE-1-cellToColumn(position),cellToRow(position));
						positionsym3 = rowColumnToCell(cellToColumn(position),ROW_COL_SEC_SIZE-1-cellToRow(position));
					case ROTATE180:
						positionsym1 = rowColumnToCell(ROW_COL_SEC_SIZE-1-cellToRow(position),ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case MIRROR:
						positionsym1 = rowColumnToCell(cellToRow(position),ROW_COL_SEC_SIZE-1-cellToColumn(position));
					break;
					case FLIP:
						positionsym1 = rowColumnToCell(ROW_COL_SEC_SIZE-1-cellToRow(position),cellToColumn(position));
					break;
					case RANDOM: // NOTE: Should never happen
					break;
					case NONE: // NOTE: No need to do anything
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
					if (positionsym1 >= 0 && savedSym1 != 0) puzzle[positionsym1] = savedSym1;
					if (positionsym2 >= 0 && savedSym2 != 0) puzzle[positionsym2] = savedSym2;
					if (positionsym3 >= 0 && savedSym3 != 0) puzzle[positionsym3] = savedSym3;
				}
			}
		}}

		// Clear all solution info, leaving just the puzzle.
		reset();

		// Restore recording history.
		setRecordHistory(recHistory);
		setLogHistory(lHistory);

		return true;

	}

	void SudokuBoard::rollbackNonGuesses(){
		// Guesses are odd rounds
		// Non-guesses are even rounds
		{for (int i=2; i<=lastSolveRound; i+=2){
			rollbackRound(i);
		}}
	}

	void SudokuBoard::setPrintStyle(PrintStyle ps){
		printStyle = ps;
	}

	void SudokuBoard::setRecordHistory(bool recHistory){
		recordHistory = recHistory;
	}

	void SudokuBoard::setLogHistory(bool logHist){
		logHistory = logHist;
	}

	void SudokuBoard::addHistoryItem(LogItem* l){
		if (logHistory){
			l->print();
			cout << endl;
		}
		if (recordHistory){
			solveHistory->push_back(l);
			solveInstructions->push_back(l);
		} else {
			delete l;
		}
	}

	void SudokuBoard::printHistory(vector<LogItem*>* v){
		if (!recordHistory){
			cout << "History was not recorded.";
			if (printStyle == CSV){
				cout << " -- ";
			} else {
				cout << endl;
			}
		}
		{for (unsigned int i=0;i<v->size();i++){
			cout << i+1 << ". ";
			v->at(i)->print();
			if (printStyle == CSV){
				cout << " -- ";
			} else {
				cout << endl;
			}
		}}
		if (printStyle == CSV){
			cout << ",";
		} else {
			cout << endl;
		}
	}

	void SudokuBoard::printSolveInstructions(){
		if (isSolved()){
			printHistory(solveInstructions);
		} else {
			cout << "No solve instructions - Puzzle is not possible to solve." << endl;
		}
	}

	void SudokuBoard::printSolveHistory(){
		printHistory(solveHistory);
	}

	bool SudokuBoard::solve(){
		reset();
		shuffleRandomArrays();
		return solve(2);
	}

	bool SudokuBoard::solve(int round){
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

	bool SudokuBoard::hasUniqueSolution(){
		return countSolutionsLimited() == 1;
	}

	int SudokuBoard::countSolutions(){
		return countSolutions(false);
	}

	int SudokuBoard::countSolutionsLimited(){
		return countSolutions(true);
	}

	int SudokuBoard::countSolutions(bool limitToTwo){
		// Don't record history while generating.
		bool recHistory = recordHistory;
		setRecordHistory(false);
		bool lHistory = logHistory;
		setLogHistory(false);

		reset();
		int solutionCount = countSolutions(2, limitToTwo);

		// Restore recording history.
		setRecordHistory(recHistory);
		setLogHistory(lHistory);

		return solutionCount;
	}

	int SudokuBoard::countSolutions(int round, bool limitToTwo){
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

	void SudokuBoard::rollbackRound(int round){
		if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::ROLLBACK));
		{for (int i=0; i<BOARD_SIZE; i++){
			if (solutionRound[i] == round){
				solutionRound[i] = 0;
				solution[i] = 0;
			}
		}}
		{for (int i=0; i<POSSIBILITY_SIZE; i++){
			if (possibilities[i] == round){
				possibilities[i] = 0;
			}
		}}

		while(solveInstructions->size() > 0 && solveInstructions->back()->getRound() == round){
			solveInstructions->pop_back();
		}
	}

	bool SudokuBoard::isSolved(){
		{for (int i=0; i<BOARD_SIZE; i++){
			if (solution[i] == 0){
				return false;
			}
		}}
		return true;
	}

	bool SudokuBoard::isImpossible(){
		for (int position=0; position<BOARD_SIZE; position++){
			if (solution[position] == 0){
				int count = 0;
				for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
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

	int SudokuBoard::findPositionWithFewestPossibilities(){
		int minPossibilities = 10;
		int bestPosition = 0;
		{for (int i=0; i<BOARD_SIZE; i++){
			int position = randomBoardArray[i];
			if (solution[position] == 0){
				int count = 0;
				for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0) count++;
				}
				if (count < minPossibilities){
					minPossibilities = count;
					bestPosition = position;
				}
			}
		}}
		return bestPosition;
	}

	bool SudokuBoard::guess(int round, int guessNumber){
		int localGuessCount = 0;
		int position = findPositionWithFewestPossibilities();
		{for (int i=0; i<ROW_COL_SEC_SIZE; i++){
			int valIndex = randomPossibilityArray[i];
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0){
				if (localGuessCount == guessNumber){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::GUESS, value, position));
					mark(position, round, value);
					return true;
				}
				localGuessCount++;
			}
		}}
		return false;
	}

	bool SudokuBoard::singleSolveMove(int round){
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

	bool SudokuBoard::colBoxReduction(int round){
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			for (int col=0; col<ROW_COL_SEC_SIZE; col++){
				int colStart = columnToFirstCell(col);
				bool inOneBox = true;
				int colBox = -1;
				{for (int i=0; i<GRID_SIZE; i++){
					for (int j=0; j<GRID_SIZE; j++){
						int row = i*GRID_SIZE+j;
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
				}}
				if (inOneBox && colBox != -1){
					bool doneSomething = false;
					int row = GRID_SIZE*colBox;
					int secStart = cellToSectionStartCell(rowColumnToCell(row, col));
					int secStartRow = cellToRow(secStart);
					int secStartCol = cellToColumn(secStart);
					{for (int i=0; i<GRID_SIZE; i++){
						for (int j=0; j<GRID_SIZE; j++){
							int row2 = secStartRow+i;
							int col2 = secStartCol+j;
							int position = rowColumnToCell(row2, col2);
							int valPos = getPossibilityIndex(valIndex,position);
							if (col != col2 && possibilities[valPos] == 0){
								possibilities[valPos] = round;
								doneSomething = true;
							}
						}
					}}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::COLUMN_BOX, valIndex+1, colStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::rowBoxReduction(int round){
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			for (int row=0; row<ROW_COL_SEC_SIZE; row++){
				int rowStart = rowToFirstCell(row);
				bool inOneBox = true;
				int rowBox = -1;
				{for (int i=0; i<GRID_SIZE; i++){
					for (int j=0; j<GRID_SIZE; j++){
						int column = i*GRID_SIZE+j;
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
				}}
				if (inOneBox && rowBox != -1){
					bool doneSomething = false;
					int column = GRID_SIZE*rowBox;
					int secStart = cellToSectionStartCell(rowColumnToCell(row, column));
					int secStartRow = cellToRow(secStart);
					int secStartCol = cellToColumn(secStart);
					{for (int i=0; i<GRID_SIZE; i++){
						for (int j=0; j<GRID_SIZE; j++){
							int row2 = secStartRow+i;
							int col2 = secStartCol+j;
							int position = rowColumnToCell(row2, col2);
							int valPos = getPossibilityIndex(valIndex,position);
							if (row != row2 && possibilities[valPos] == 0){
								possibilities[valPos] = round;
								doneSomething = true;
							}
						}
					}}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::ROW_BOX, valIndex+1, rowStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::pointingRowReduction(int round){
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			for (int section=0; section<ROW_COL_SEC_SIZE; section++){
				int secStart = sectionToFirstCell(section);
				bool inOneRow = true;
				int boxRow = -1;
				for (int j=0; j<GRID_SIZE; j++){
					{for (int i=0; i<GRID_SIZE; i++){
						int secVal=secStart+i+(ROW_COL_SEC_SIZE*j);
						int valPos = getPossibilityIndex(valIndex,secVal);
						if(possibilities[valPos] == 0){
							if (boxRow == -1 || boxRow == j){
								boxRow = j;
							} else {
								inOneRow = false;
							}
						}
					}}
				}
				if (inOneRow && boxRow != -1){
					bool doneSomething = false;
					int row = cellToRow(secStart) + boxRow;
					int rowStart = rowToFirstCell(row);

					{for (int i=0; i<ROW_COL_SEC_SIZE; i++){
						int position = rowStart+i;
						int section2 = cellToSection(position);
						int valPos = getPossibilityIndex(valIndex,position);
						if (section != section2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::POINTING_PAIR_TRIPLE_ROW, valIndex+1, rowStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::pointingColumnReduction(int round){
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			for (int section=0; section<ROW_COL_SEC_SIZE; section++){
				int secStart = sectionToFirstCell(section);
				bool inOneCol = true;
				int boxCol = -1;
				{for (int i=0; i<GRID_SIZE; i++){
					for (int j=0; j<GRID_SIZE; j++){
						int secVal=secStart+i+(ROW_COL_SEC_SIZE*j);
						int valPos = getPossibilityIndex(valIndex,secVal);
						if(possibilities[valPos] == 0){
							if (boxCol == -1 || boxCol == i){
								boxCol = i;
							} else {
								inOneCol = false;
							}
						}
					}
				}}
				if (inOneCol && boxCol != -1){
					bool doneSomething = false;
					int col = cellToColumn(secStart) + boxCol;
					int colStart = columnToFirstCell(col);

					{for (int i=0; i<ROW_COL_SEC_SIZE; i++){
						int position = colStart+(ROW_COL_SEC_SIZE*i);
						int section2 = cellToSection(position);
						int valPos = getPossibilityIndex(valIndex,position);
						if (section != section2 && possibilities[valPos] == 0){
							possibilities[valPos] = round;
							doneSomething = true;
						}
					}}
					if (doneSomething){
						if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::POINTING_PAIR_TRIPLE_COLUMN, valIndex+1, colStart));
						return true;
					}
				}
			}
		}
		return false;
	}

	int SudokuBoard::countPossibilities(int position){
		int count = 0;
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0) count++;
		}
		return count;
	}

	bool SudokuBoard::arePossibilitiesSame(int position1, int position2){
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			int valPos1 = getPossibilityIndex(valIndex,position1);
			int valPos2 = getPossibilityIndex(valIndex,position2);
			if ((possibilities[valPos1] == 0 || possibilities[valPos2] == 0) && (possibilities[valPos1] != 0 || possibilities[valPos2] != 0)){
				return false;
			}
		}
		return true;
	}

	bool SudokuBoard::removePossibilitiesInOneFromTwo(int position1, int position2, int round){
		bool doneSomething = false;
		for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			int valPos1 = getPossibilityIndex(valIndex,position1);
			int valPos2 = getPossibilityIndex(valIndex,position2);
			if (possibilities[valPos1] == 0 && possibilities[valPos2] == 0){
				possibilities[valPos2] = round;
				doneSomething = true;
			}
		}
		return doneSomething;
	}

	bool SudokuBoard::hiddenPairInColumn(int round){
		for (int column=0; column<ROW_COL_SEC_SIZE; column++){
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int r1 = -1;
				int r2 = -1;
				int valCount = 0;
				for (int row=0; row<ROW_COL_SEC_SIZE; row++){
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
					for (int valIndex2=valIndex+1; valIndex2<ROW_COL_SEC_SIZE; valIndex2++){
						int r3 = -1;
						int r4 = -1;
						int valCount2 = 0;
						for (int row=0; row<ROW_COL_SEC_SIZE; row++){
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
							bool doneSomething = false;
							for (int valIndex3=0; valIndex3<ROW_COL_SEC_SIZE; valIndex3++){
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_PAIR_COLUMN, valIndex+1, rowColumnToCell(r1,column)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::hiddenPairInSection(int round){
		for (int section=0; section<ROW_COL_SEC_SIZE; section++){
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int si1 = -1;
				int si2 = -1;
				int valCount = 0;
				for (int secInd=0; secInd<ROW_COL_SEC_SIZE; secInd++){
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
					for (int valIndex2=valIndex+1; valIndex2<ROW_COL_SEC_SIZE; valIndex2++){
						int si3 = -1;
						int si4 = -1;
						int valCount2 = 0;
						for (int secInd=0; secInd<ROW_COL_SEC_SIZE; secInd++){
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
							bool doneSomething = false;
							for (int valIndex3=0; valIndex3<ROW_COL_SEC_SIZE; valIndex3++){
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_PAIR_SECTION, valIndex+1, sectionToCell(section,si1)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::hiddenPairInRow(int round){
		for (int row=0; row<ROW_COL_SEC_SIZE; row++){
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int c1 = -1;
				int c2 = -1;
				int valCount = 0;
				for (int column=0; column<ROW_COL_SEC_SIZE; column++){
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
					for (int valIndex2=valIndex+1; valIndex2<ROW_COL_SEC_SIZE; valIndex2++){
						int c3 = -1;
						int c4 = -1;
						int valCount2 = 0;
						for (int column=0; column<ROW_COL_SEC_SIZE; column++){
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
							bool doneSomething = false;
							for (int valIndex3=0; valIndex3<ROW_COL_SEC_SIZE; valIndex3++){
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
								if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_PAIR_ROW, valIndex+1, rowColumnToCell(row,c1)));
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}

	bool SudokuBoard::handleNakedPairs(int round){
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
								bool doneSomething = false;
								for (int column2=0; column2<ROW_COL_SEC_SIZE; column2++){
									int position3 = rowColumnToCell(row,column2);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::NAKED_PAIR_ROW, 0, position));
									return true;
								}
							}
							if (column == cellToColumn(position2)){
								bool doneSomething = false;
								for (int row2=0; row2<ROW_COL_SEC_SIZE; row2++){
									int position3 = rowColumnToCell(row2,column);
									if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
										doneSomething = true;
									}
								}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::NAKED_PAIR_COLUMN, 0, position));
									return true;
								}
							}
							if (section == cellToSectionStartCell(position2)){
								bool doneSomething = false;
								int secStart = cellToSectionStartCell(position);
								{for (int i=0; i<GRID_SIZE; i++){
									for (int j=0; j<GRID_SIZE; j++){
										int position3=secStart+i+(ROW_COL_SEC_SIZE*j);
										if (position3 != position && position3 != position2 && removePossibilitiesInOneFromTwo(position, position3, round)){
											doneSomething = true;
										}
									}
								}}
								if (doneSomething){
									if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::NAKED_PAIR_SECTION, 0, position));
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
	bool SudokuBoard::onlyValueInRow(int round){
		for (int row=0; row<ROW_COL_SEC_SIZE; row++){
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int count = 0;
				int lastPosition = 0;
				for (int col=0; col<ROW_COL_SEC_SIZE; col++){
					int position = (row*ROW_COL_SEC_SIZE)+col;
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_SINGLE_ROW, value, lastPosition));
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
	bool SudokuBoard::onlyValueInColumn(int round){
		for (int col=0; col<ROW_COL_SEC_SIZE; col++){
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int count = 0;
				int lastPosition = 0;
				for (int row=0; row<ROW_COL_SEC_SIZE; row++){
					int position = rowColumnToCell(row,col);
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastPosition = position;
					}
				}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_SINGLE_COLUMN, value, lastPosition));
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
	bool SudokuBoard::onlyValueInSection(int round){
		for (int sec=0; sec<ROW_COL_SEC_SIZE; sec++){
			int secPos = sectionToFirstCell(sec);
			for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
				int count = 0;
				int lastPosition = 0;
				{for (int i=0; i<GRID_SIZE; i++){
					for (int j=0; j<GRID_SIZE; j++){
						int position = secPos + i + ROW_COL_SEC_SIZE*j;
						int valPos = getPossibilityIndex(valIndex,position);
						if (possibilities[valPos] == 0){
							count++;
							lastPosition = position;
						}
					}
				}}
				if (count == 1){
					int value = valIndex+1;
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::HIDDEN_SINGLE_SECTION, value, lastPosition));
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
	bool SudokuBoard::onlyPossibilityForCell(int round){
		for (int position=0; position<BOARD_SIZE; position++){
			if (solution[position] == 0){
				int count = 0;
				int lastValue = 0;
				for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
					int valPos = getPossibilityIndex(valIndex,position);
					if (possibilities[valPos] == 0){
						count++;
						lastValue=valIndex+1;
					}
				}
				if (count == 1){
					mark(position, round, lastValue);
					if (logHistory || recordHistory) addHistoryItem(new LogItem(round, LogItem::SINGLE, lastValue, position));
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
	void SudokuBoard::mark(int position, int round, int value){
		if (solution[position] != 0) throw ("Marking position that already has been marked.");
		if (solutionRound[position] !=0) throw ("Marking position that was marked another round.");
		int valIndex = value-1;
		solution[position] = value;

		int possInd = getPossibilityIndex(valIndex,position);
		if (possibilities[possInd] != 0) throw ("Marking impossible position.");

		// Take this value out of the possibilities for everything in the row
		solutionRound[position] = round;
		int rowStart = cellToRow(position)*ROW_COL_SEC_SIZE;
		for (int col=0; col<ROW_COL_SEC_SIZE; col++){
			int rowVal=rowStart+col;
			int valPos = getPossibilityIndex(valIndex,rowVal);
			//cout << "Row Start: " << rowStart << " Row Value: " << rowVal << " Value Position: " << valPos << endl;
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}

		// Take this value out of the possibilities for everything in the column
		int colStart = cellToColumn(position);
		{for (int i=0; i<ROW_COL_SEC_SIZE; i++){
			int colVal=colStart+(ROW_COL_SEC_SIZE*i);
			int valPos = getPossibilityIndex(valIndex,colVal);
			//cout << "Col Start: " << colStart << " Col Value: " << colVal << " Value Position: " << valPos << endl;
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}}

		// Take this value out of the possibilities for everything in section
		int secStart = cellToSectionStartCell(position);
		{for (int i=0; i<GRID_SIZE; i++){
			for (int j=0; j<GRID_SIZE; j++){
				int secVal=secStart+i+(ROW_COL_SEC_SIZE*j);
				int valPos = getPossibilityIndex(valIndex,secVal);
				//cout << "Sec Start: " << secStart << " Sec Value: " << secVal << " Value Position: " << valPos << endl;
				if (possibilities[valPos] == 0){
					possibilities[valPos] = round;
				}
			}
		}}

		//This position itself is determined, it should have possibilities.
		{for (int valIndex=0; valIndex<ROW_COL_SEC_SIZE; valIndex++){
			int valPos = getPossibilityIndex(valIndex,position);
			if (possibilities[valPos] == 0){
				possibilities[valPos] = round;
			}
		}}
	}

	/**
	 * print the given BOARD_SIZEd array of ints
	 * as a sudoku puzzle.  Use print options from
	 * member variables.
	 */
	void SudokuBoard::print(int* sudoku){
		for(int i=0; i<BOARD_SIZE; i++){
			if (printStyle == READABLE){
				cout << " ";
			}
			if (sudoku[i]==0){
				cout << '.';
			} else {
				cout << sudoku[i];
			}
			if (i == BOARD_SIZE-1){
				if (printStyle == CSV){
					cout << ",";
				} else {
					cout << endl;
				}
				if (printStyle == READABLE || printStyle == COMPACT){
					cout << endl;
				}
			} else if (i%ROW_COL_SEC_SIZE==ROW_COL_SEC_SIZE-1){
				if (printStyle == READABLE || printStyle == COMPACT){
					cout << endl;
				}
				if (i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
					if (printStyle == READABLE){
						cout << "-------|-------|-------" << endl;
					}
				}
			} else if (i%GRID_SIZE==GRID_SIZE-1){
				if (printStyle == READABLE){
					cout << " |";
				}
			}
		}
	}

	/**
	 * Print the sudoku puzzle.
	 */
	void SudokuBoard::printPuzzle(){
		print(puzzle);
	}

	/**
	 * Print the sudoku solution.
	 */
	void SudokuBoard::printSolution(){
		print(solution);
	}

	SudokuBoard::~SudokuBoard(){
		clearPuzzle();
		delete[] puzzle;
		delete[] solution;
		delete[] possibilities;
		delete[] solutionRound;
		delete[] randomBoardArray;
		delete[] randomPossibilityArray;
		delete solveHistory;
		delete solveInstructions;
	}

	LogItem::LogItem(int r, LogType t){
		init(r,t,0,-1);
	}

	LogItem::LogItem(int r, LogType t, int v, int p){
		init(r,t,v,p);
	}

	void LogItem::init(int r, LogType t, int v, int p){
		round = r;
		type = t;
		value = v;
		position = p;
	}

	LogItem::~LogItem(){
	}

	int LogItem::getRound(){
		return round;
	}

	/**
	 * Get the type of this log item.
	 */
	LogItem::LogType LogItem::getType(){
		return type;
	}

	/**
	 * Print the current log item.  The message used is
	 * determined by the type of log item.
	 */
	void LogItem::print(){
		cout << "Round: " << getRound() << " - ";
		switch(type){
			case GIVEN:{
				cout << "Mark given";
			} break;
			case ROLLBACK:{
				cout << "Roll back round";
			} break;
			case GUESS:{
				cout << "Mark guess (start round)";
			} break;
			case HIDDEN_SINGLE_ROW:{
				cout << "Mark single possibility for value in row";
			} break;
			case HIDDEN_SINGLE_COLUMN:{
				cout << "Mark single possibility for value in column";
			} break;
			case HIDDEN_SINGLE_SECTION:{
				cout << "Mark single possibility for value in section";
			} break;
			case SINGLE:{
				cout << "Mark only possibility for cell";
			} break;
			case NAKED_PAIR_ROW:{
				cout << "Remove possibilities for naked pair in row";
			} break;
			case NAKED_PAIR_COLUMN:{
				cout << "Remove possibilities for naked pair in column";
			} break;
			case NAKED_PAIR_SECTION:{
				cout << "Remove possibilities for naked pair in section";
			} break;
			case POINTING_PAIR_TRIPLE_ROW: {
				cout << "Remove possibilities for row because all values are in one section";
			} break;
			case POINTING_PAIR_TRIPLE_COLUMN: {
				cout << "Remove possibilities for column because all values are in one section";
			} break;
			case ROW_BOX: {
				cout << "Remove possibilities for section because all values are in one row";
			} break;
			case COLUMN_BOX: {
				cout << "Remove possibilities for section because all values are in one column";
			} break;
			case HIDDEN_PAIR_ROW: {
				cout << "Remove possibilities from hidden pair in row";
			} break;
			case HIDDEN_PAIR_COLUMN: {
				cout << "Remove possibilities from hidden pair in column";
			} break;
			case HIDDEN_PAIR_SECTION: {
				cout << "Remove possibilities from hidden pair in section";
			} break;
			default:{
				cout << "!!! Performed unknown optimization !!!";
			} break;
		}
		if (value > 0 || position > -1){
			cout << " (";
			bool printed = false;
			if (position > -1){
				if (printed) cout << " - ";
				cout << "Row: " << cellToRow(position)+1 << " - Column: " << cellToColumn(position)+1;
				printed = true;
			}
			if (value > 0){
				if (printed) cout << " - ";
				cout << "Value: " << value;
				printed = true;
			}
			cout << ")";
		}
	}

	/**
	 * Given a vector of LogItems, determine how many
	 * log items in the vector are of the specified type.
	 */
	int getLogCount(vector<LogItem*>* v, LogItem::LogType type){
		unsigned int count = 0;
		{for (unsigned int i=0; i<v->size(); i++){
			if(v->at(i)->getType() == type) count++;
		}}
		return count;
	}

	/**
	 * Shuffle the values in an array of integers.
	 */
	void shuffleArray(int* array, int size){
		{for (int i=0; i<size; i++){
			int tailSize = size-i;
			int randTailPos = rand()%tailSize+i;
			int temp = array[i];
			array[i] = array[randTailPos];
			array[randTailPos] = temp;
		}}
	}

	SudokuBoard::Symmetry getRandomSymmetry(){
		switch (rand()%4){
			case 0: return SudokuBoard::ROTATE90;
			case 1: return SudokuBoard::ROTATE180;
			case 2: return SudokuBoard::MIRROR;
			case 3: return SudokuBoard::FLIP;
		}
		return SudokuBoard::ROTATE90; // NOTE: default action
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the column (0-8) in which that cell resides.
	 */
	static inline int cellToColumn(int cell){
		return cell%ROW_COL_SEC_SIZE;
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the row (0-8) in which it resides.
	 */
	static inline int cellToRow(int cell){
		return cell/ROW_COL_SEC_SIZE;
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the section (0-8) in which it resides.
	 */
	static inline int cellToSection(int cell){
		return (cell/SEC_GROUP_SIZE*GRID_SIZE)
				+ (cellToColumn(cell)/GRID_SIZE);
	}

	/**
	 * Given the index of a cell (0-80) calculate
	 * the cell (0-80) that is the upper left start
	 * cell of that section.
	 */
	static inline int cellToSectionStartCell(int cell){
		return (cell/SEC_GROUP_SIZE*SEC_GROUP_SIZE)
				+ (cellToColumn(cell)/GRID_SIZE*GRID_SIZE);
	}

	/**
	 * Given a row (0-8) calculate the first cell (0-80)
	 * of that row.
	 */
	static inline int rowToFirstCell(int row){
		return ROW_COL_SEC_SIZE*row;
	}

	/**
	 * Given a column (0-8) calculate the first cell (0-80)
	 * of that column.
	 */
	static inline int columnToFirstCell(int column){
		return column;
	}

	/**
	 * Given a section (0-8) calculate the first cell (0-80)
	 * of that section.
	 */
	static inline int sectionToFirstCell(int section){
		return (section%GRID_SIZE*GRID_SIZE)
				+ (section/GRID_SIZE*SEC_GROUP_SIZE);
	}

	/**
	 * Given a value for a cell (0-8) and a cell (0-80)
	 * calculate the offset into the possibility array (0-728).
	 */
	static inline int getPossibilityIndex(int valueIndex, int cell){
		return valueIndex+(ROW_COL_SEC_SIZE*cell);
	}

	/**
	 * Given a row (0-8) and a column (0-8) calculate the
	 * cell (0-80).
	 */
	static inline int rowColumnToCell(int row, int column){
		return (row*ROW_COL_SEC_SIZE)+column;
	}

	/**
	 * Given a section (0-8) and an offset into that section (0-8)
	 * calculate the cell (0-80)
	 */
	static inline int sectionToCell(int section, int offset){
		return sectionToFirstCell(section)
				+ ((offset/GRID_SIZE)*ROW_COL_SEC_SIZE)
				+ (offset%GRID_SIZE);
	}
}
