/*
 * qqwing - A Sudoku solver and generator
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
#ifndef QQWING_HPP
	#define QQWING_HPP

	#include <string>
	#include <vector>

	namespace qqwing {

		using namespace std;

		class LogItem;

		const int GRID_SIZE = 3;
		const int ROW_COL_SEC_SIZE = GRID_SIZE*GRID_SIZE;
		const int SEC_GROUP_SIZE = ROW_COL_SEC_SIZE*GRID_SIZE;
		const int BOARD_SIZE = ROW_COL_SEC_SIZE*ROW_COL_SEC_SIZE;
		const int POSSIBILITY_SIZE = BOARD_SIZE*ROW_COL_SEC_SIZE;

		/**
		 * The version of QQwing, e.g. 1.2.3
		 */
		string getVersion();

		/**
		 * The board containing all the memory structures and
		 * methods for solving or generating sudoku puzzles.
		 */
		class SudokuBoard {
			public:
				enum PrintStyle {
					ONE_LINE,
					COMPACT,
					READABLE,
					CSV
				};
				enum Difficulty {
					UNKNOWN,
					SIMPLE,
					EASY,
					INTERMEDIATE,
					EXPERT
				};
				enum Symmetry {
					NONE,
					ROTATE90,
					ROTATE180,
					MIRROR,
					FLIP,
					RANDOM
				};
				SudokuBoard();
				bool setPuzzle(int* initPuzzle);
				const int* getPuzzle();
				const int* getSolution();
				void printPuzzle();
				void printSolution();
				bool solve();

				/**
				 * Count the number of solutions to the puzzle
				 */
				int countSolutions();

				/**
				 * Count the number of solutions to the puzzle
				 * but return two any time there are two or
				 * more solutions.  This method will run much
				 * falter than countSolutions() when there
				 * are many possible solutions and can be used
				 * when you are interested in knowing if the
				 * puzzle has zero, one, or multiple solutions.
				 */
				int countSolutionsLimited();

				/**
				 * return true if the puzzle has a solution
				 * and only a single solution
				 */
				bool hasUniqueSolution();
				bool isSolved();
				void printSolveHistory();
				void setRecordHistory(bool recHistory);
				void setLogHistory(bool logHist);
				void setPrintStyle(PrintStyle ps);
				bool generatePuzzle();
				bool generatePuzzleSymmetry(SudokuBoard::Symmetry symmetry);
				int getGivenCount();
				int getSingleCount();
				int getHiddenSingleCount();
				int getNakedPairCount();
				int getHiddenPairCount();
				int getBoxLineReductionCount();
				int getPointingPairTripleCount();
				int getGuessCount();
				int getBacktrackCount();
				void printSolveInstructions();
				SudokuBoard::Difficulty getDifficulty();
				string getDifficultyAsString();
				~SudokuBoard();

			private:
				/**
				 * The 81 integers that make up a sudoku puzzle.
				 * Givens are 1-9, unknowns are 0.
				 * Once initialized, this puzzle remains as is.
				 * The answer is worked out in "solution".
				 */
				int* puzzle;

				/**
				 * The 81 integers that make up a sudoku puzzle.
				 * The solution is built here, after completion
				 * all will be 1-9.
				 */
				int* solution;

				/**
				 * Recursion depth at which each of the numbers
				 * in the solution were placed.  Useful for backing
				 * out solve branches that don't lead to a solution.
				 */
				int* solutionRound;

				/**
				 * The 729 integers that make up a the possible
				 * values for a Sudoku puzzle. (9 possibilities
				 * for each of 81 squares).  If possibilities[i]
				 * is zero, then the possibility could still be
				 * filled in according to the Sudoku rules.  When
				 * a possibility is eliminated, possibilities[i]
				 * is assigned the round (recursion level) at
				 * which it was determined that it could not be
				 * a possibility.
				 */
				int* possibilities;

				/**
				 * An array the size of the board (81) containing each
				 * of the numbers 0-n exactly once.  This array may
				 * be shuffled so that operations that need to
				 * look at each cell can do so in a random order.
				 */
				int* randomBoardArray;

				/**
				 * An array with one element for each position (9), in
				 * some random order to be used when trying each
				 * position in turn during guesses.
				 */
				int* randomPossibilityArray;

				/**
				 * Whether or not to record history
				 */
				bool recordHistory;

				/**
				 * Whether or not to print history as it happens
				 */
				bool logHistory;

				/**
				 * A list of moves used to solve the puzzle.
				 * This list contains all moves, even on solve
				 * branches that did not lead to a solution.
				 */
				vector<LogItem*>* solveHistory;

				/**
				 * A list of moves used to solve the puzzle.
				 * This list contains only the moves needed
				 * to solve the puzzle, but doesn't contain
				 * information about bad guesses.
				 */
				vector<LogItem*>* solveInstructions;

				/**
				 * The style with which to print puzzles and solutions
				 */
				PrintStyle printStyle;

				/**
				 * The last round of solving
				 */
				int lastSolveRound;
				bool reset();
				bool singleSolveMove(int round);
				bool onlyPossibilityForCell(int round);
				bool onlyValueInRow(int round);
				bool onlyValueInColumn(int round);
				bool onlyValueInSection(int round);
				bool solve(int round);
				int countSolutions(bool limitToTwo);
				int countSolutions(int round, bool limitToTwo);
				bool guess(int round, int guessNumber);
				bool isImpossible();
				void rollbackRound(int round);
				bool pointingRowReduction(int round);
				bool rowBoxReduction(int round);
				bool colBoxReduction(int round);
				bool pointingColumnReduction(int round);
				bool hiddenPairInRow(int round);
				bool hiddenPairInColumn(int round);
				bool hiddenPairInSection(int round);
				void mark(int position, int round, int value);
				int findPositionWithFewestPossibilities();
				bool handleNakedPairs(int round);
				int countPossibilities(int position);
				bool arePossibilitiesSame(int position1, int position2);
				void addHistoryItem(LogItem* l);
				void shuffleRandomArrays();
				void print(int* sudoku);
				void rollbackNonGuesses();
				void clearPuzzle();
				void printHistory(vector<LogItem*>* v);
				bool removePossibilitiesInOneFromTwo(int position1, int position2, int round);
		};
	}
#endif
