/*
 * qqwing - A Sudoku solver and generator
 * Copyright (C) 2006-2011 Stephen Ostermiller
 * http://ostermiller.org/qqwing/
 * Copyright (C) 2007 Jacques Bensimon (jacques@ipm.com)
 * Copyright (C) 2011 Jean Guillerez (j.guillerez - orange.fr)
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

#include "config.h"
#include <iostream>
#if HAVE_STRING_H == 1
    #include <string.h>
#else
    #include <string>
#endif
#include <stdio.h>
#include <vector>
#if HAVE_STDLIB_H == 1
    #include <stdlib.h>
#else
    #include <stdlib>
#endif
#if HAVE_GETTIMEOFDAY == 1
    #include <sys/time.h>
#else
    #include <time.h>
#endif

using namespace std;
class SuddokuBoard;
class LogItem;

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
            CSV,
        };
        enum Difficulty {
            UNKNOWN,
            SIMPLE,
            EASY,
            INTERMEDIATE,
            EXPERT,
        };
        SudokuBoard();
        bool setPuzzle(int* initPuzzle);
        void printPuzzle();
        void printSolution();
        bool solve();
        int countSolutions();
        void printPossibilities();
        bool isSolved();
        void printSolveHistory();
        void setRecordHistory(bool recHistory);
        void setLogHistory(bool logHist);
        void setPrintStyle(PrintStyle ps);
        bool generatePuzzle();
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
         * Givens are 1-9, unknows are 0.
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
         * values for a suduko puzzle. (9 possibilities
         * for each of 81 squares).  If possibilities[i]
         * is zero, then the possibility could still be
         * filled in according to the sudoku rules.  When
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
        void markRandomPossibility(int round);
        void shuffleRandomArrays();
        void print(int* sudoku);
        void rollbackNonGuesses();
        void clearPuzzle();
        void printHistory(vector<LogItem*>* v);
        bool removePossibilitiesInOneFromTwo(int position1, int position2, int round);

};

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
            HIDDEN_PAIR_SECTION,
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

string IntToString(int num);
long getMicroseconds();
void shuffleArray(int* array, int size);
bool readPuzzleFromStdIn(int* puzzle);
int main(int argc, char *argv[]);
void printHelp(char* programName);
void printVersion();
void printAbout();
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

#define GRID_SIZE 3
#define ROW_LENGTH          (GRID_SIZE*GRID_SIZE)
#define COL_HEIGHT          (GRID_SIZE*GRID_SIZE)
#define SEC_SIZE            (GRID_SIZE*GRID_SIZE)
#define SEC_COUNT           (GRID_SIZE*GRID_SIZE)
#define SEC_GROUP_SIZE      (SEC_SIZE*GRID_SIZE)
#define NUM_POSS            (GRID_SIZE*GRID_SIZE)
#define BOARD_SIZE          (ROW_LENGTH*COL_HEIGHT)
#define POSSIBILITY_SIZE    (BOARD_SIZE*NUM_POSS)

/**
 * Main method -- the entry point into the program.
 * Run with --help as an argument for usage and documentation
 */
int main(int argc, char *argv[]){
    try {
        // Start time for the application for timing
        long applicationStartTime = getMicroseconds();

        // The number of puzzles solved or generated.
        int puzzleCount = 0;

        enum Action {NONE, GENERATE, SOLVE};

        // defaults for options
        bool printPuzzle = false;
        bool printSolution = false;
        bool printHistory = false;
        bool printInstructions = false;
        bool timer = false;
        bool countSolutions = false;
        Action action = NONE;
        bool logHistory = false;
        SudokuBoard::PrintStyle printStyle = SudokuBoard::READABLE;
        int numberToGenerate = 1;
        bool printStats = false;
        SudokuBoard::Difficulty difficulty = SudokuBoard::UNKNOWN;

        // Read the arguments and set the options
        {for (int i=1; i<argc; i++){
            if (!strcmp(argv[i],"--puzzle")){
                printPuzzle = true;
            } else if (!strcmp(argv[i],"--nopuzzle")){
                printPuzzle = false;
            } else if (!strcmp(argv[i],"--solution")){
                printSolution = true;
            } else if (!strcmp(argv[i],"--nosolution")){
                printSolution = false;
            } else if (!strcmp(argv[i],"--history")){
                printHistory = true;
            } else if (!strcmp(argv[i],"--nohistory")){
                printHistory = false;
            } else if (!strcmp(argv[i],"--instructions")){
                printInstructions = true;
            } else if (!strcmp(argv[i],"--noinstructions")){
                printInstructions = false;
            } else if (!strcmp(argv[i],"--stats")){
                printStats = true;
            } else if (!strcmp(argv[i],"--nostats")){
                printStats = false;
            #if HAVE_GETTIMEOFDAY == 1
                } else if (!strcmp(argv[i],"--timer")){
                    timer = true;
                } else if (!strcmp(argv[i],"--notimer")){
                    timer = false;
            #endif
            } else if (!strcmp(argv[i],"--count-solutions")){
                countSolutions = true;
            } else if (!strcmp(argv[i],"--nocount-solutions")){
                countSolutions = false;
            } else if (!strcmp(argv[i],"--generate")){
                action = GENERATE;
                printPuzzle = true;
                if (i+1 < argc && argv[i+1][0] >= '1' && argv[i+1][0] <= '9'){
                    numberToGenerate = atoi(argv[i+1]);
                    i++;
                }
            } else if (!strcmp(argv[i],"--difficulty")){
                if (argc <= i+1){
                    cout << "Please specify a difficulty." << endl;
                    return 1;
                } else if (!strcmp(argv[i+1],"simple")){
                    difficulty = SudokuBoard::SIMPLE;
                } else if (!strcmp(argv[i+1],"easy")){
                    difficulty = SudokuBoard::EASY;
                } else if (!strcmp(argv[i+1],"intermediate")){
                    difficulty = SudokuBoard::INTERMEDIATE;
                } else if (!strcmp(argv[i+1],"expert")){
                    difficulty = SudokuBoard::EXPERT;
                } else {
                    cout << "Difficulty expected to be simple, easy, intermediate, or expert, not " << argv[i+1] << endl;
                    return 1;
                }
                i++;
            } else if (!strcmp(argv[i],"--solve")){
                action = SOLVE;
                printSolution = true;
            } else if (!strcmp(argv[i],"--log-history")){
                logHistory = true;
            } else if (!strcmp(argv[i],"--nolog-history")){
                logHistory = false;
            } else if (!strcmp(argv[i],"--one-line")){
                printStyle=SudokuBoard::ONE_LINE;
            } else if (!strcmp(argv[i],"--compact")){
                printStyle=SudokuBoard::COMPACT;
            } else if (!strcmp(argv[i],"--readable")){
                printStyle=SudokuBoard::READABLE;
            } else if (!strcmp(argv[i],"--csv")){
                printStyle=SudokuBoard::CSV;
            } else if (!strcmp(argv[i],"-n") || !strcmp(argv[i],"--number")){
                if (i+1 < argc){
                    numberToGenerate = atoi(argv[i+1]);
                    i++;
                } else {
                    cout << "Please specify a number." << endl;
                    return 1;
                }
            } else if (!strcmp(argv[i],"-h") || !strcmp(argv[i],"--help") || !strcmp(argv[i],"help") || !strcmp(argv[i],"?")){
                printHelp(argv[0]);
                return 0;
            } else if (!strcmp(argv[i],"--version")){
                printVersion();
                return 0;
            } else if (!strcmp(argv[i],"--about")){
                printAbout();
                return 0;
            } else {
                cout << "Unknown argument: '" << argv[i] << "'" << endl;
                printHelp(argv[0]);
                return 1;
            }
        }}

        if (action == NONE){
            cout << "Either --solve or --generate must be specified." << endl;
            printHelp(argv[0]);
            return 1;
        }

        // Initialize the random number generator
        int timeSeed = time(NULL);
        srand(timeSeed);

        // If printing out CSV, print a header
        if (printStyle == SudokuBoard::CSV){
            if (printPuzzle) cout << "Puzzle,";
            if (printSolution) cout << "Solution,";
            if (printHistory) cout << "Solve History,";
            if (printInstructions) cout << "Solve Instructions,";
            if (countSolutions) cout << "Solution Count,";
            if (timer) cout << "Time (milliseconds),";
            if (printStats) cout << "Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty";
            cout << "" << endl;
        }

        // Create a new puzzle board
        // and set the options
        SudokuBoard* ss = new SudokuBoard();
        ss->setRecordHistory(printHistory || printInstructions || printStats || difficulty!=SudokuBoard::UNKNOWN);
        ss->setLogHistory(logHistory);
        ss->setPrintStyle(printStyle);

        // Solve puzzle or generate puzzles
        // until end of input for solving, or
        // until we have generated the specified number.
        bool done = false;
        int numberGenerated = 0;
        while (!done){
            // record the start time for the timer.
            long puzzleStartTime = getMicroseconds();

            // iff something has been printed for this particular puzzle
            bool printedSomething = false;

            // Record whether the puzzle was possible or not,
            // so that we don't try to solve impossible givens.
            bool havePuzzle = false;
            if (action == GENERATE){
                // Generate a puzzle
                havePuzzle = ss->generatePuzzle();
                if (!havePuzzle && printPuzzle){
                    cout << "Could not generate puzzle.";
                    if (printStyle==SudokuBoard::CSV){
                        cout << ",";
                    } else {
                        cout << endl;
                    }
                    printedSomething = true;
                }
            } else {
                // Read the next puzzle on STDIN
                int* puzzle = new int[BOARD_SIZE];
                if (readPuzzleFromStdIn(puzzle)){
                    havePuzzle = ss->setPuzzle(puzzle);
                    if (!havePuzzle){
                        if (printPuzzle){
                            ss->printPuzzle();
                            printedSomething = true;
                        }
                        if (printSolution) {
                            cout << "Puzzle is not possible.";
                            if (printStyle==SudokuBoard::CSV){
                                cout << ",";
                            } else {
                                cout << endl;
                            }
                            printedSomething = true;
                        }
                    }
                } else {
                    // Set loop to terminate when nothing is left on STDIN
                    havePuzzle = false;
                    done = true;
                }
                delete puzzle;
            }

           int solutions = 0;

            if (havePuzzle){

                // Count the solutions if requested.
                // (Must be done before solving, as it would
                // mess up the stats.)
                if (countSolutions){
                    solutions = ss->countSolutions();
                }

                // Solve the puzzle
                if (printSolution || printHistory || printStats || printInstructions || difficulty!=SudokuBoard::UNKNOWN){
                    ss->solve();
                }

                // Bail out if it didn't meet the difficulty standards for generation
                if (action == GENERATE){
                    if (difficulty!=SudokuBoard::UNKNOWN && difficulty!=ss->getDifficulty()){
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
                if (printPuzzle) ss->printPuzzle();

                // Print the solution if there is one
                if (printSolution){
                    if (ss->isSolved()){
                        ss->printSolution();
                    } else {
                        cout << "Puzzle has no solution.";
                        if (printStyle==SudokuBoard::CSV){
                            cout << ",";
                        } else {
                            cout << endl;
                        }
                    }
                }

                // Print the steps taken to solve or attempt to solve the puzzle.
                if (printHistory) ss->printSolveHistory();
                // Print the instructions for solving the puzzle
                if (printInstructions) ss->printSolveInstructions();

                // Print the number of solutions to the puzzle.
                if (countSolutions){
                    if (printStyle == SudokuBoard::CSV){
                        cout << solutions << ",";
                    } else {
                        if (solutions == 0){
                            cout << "There are no solutions to the puzzle." << endl;
                        } else if (solutions == 1){
                            cout << "The solution to the puzzle is unique." << endl;
                        } else {
                            cout << "There are " << solutions << " solutions to the puzzle." << endl;
                        }
                    }
                }

                // Print out the time it took to solve the puzzle.
                if (timer){
                    double t = ((double)(puzzleDoneTime - puzzleStartTime))/1000.0;
                    if (printStyle == SudokuBoard::CSV){
                        cout << t << ",";
                    } else {
                        cout << "Time: " << t  << " milliseconds" << endl;
                    }
                }

                // Print any stats we were able to gather while solving the puzzle.
                if (printStats){
                    int givenCount = ss->getGivenCount();
                    int singleCount = ss->getSingleCount();
                    int hiddenSingleCount = ss->getHiddenSingleCount();
                    int nakedPairCount = ss->getNakedPairCount();
                    int hiddenPairCount = ss->getHiddenPairCount();
                    int pointingPairTripleCount = ss->getPointingPairTripleCount();
                    int boxReductionCount = ss->getBoxLineReductionCount();
                    int guessCount = ss->getGuessCount();
                    int backtrackCount = ss->getBacktrackCount();
                    string difficultyString = ss->getDifficultyAsString();
                    if (printStyle == SudokuBoard::CSV){
                        cout << givenCount << ","  << singleCount << "," << hiddenSingleCount
                                << "," << nakedPairCount << "," << hiddenPairCount
                                << ","  << pointingPairTripleCount  << ","  << boxReductionCount
                                << "," << guessCount << "," << backtrackCount
                                << "," << difficultyString << ",";
                    } else {
                        cout << "Number of Givens: " << givenCount  << endl;
                        cout << "Number of Singles: " << singleCount << endl;
                        cout << "Number of Hidden Singles: " << hiddenSingleCount  << endl;
                        cout << "Number of Naked Pairs: " << nakedPairCount  << endl;
                        cout << "Number of Hidden Pairs: " << hiddenPairCount  << endl;
                        cout << "Number of Pointing Pairs/Triples: " << pointingPairTripleCount  << endl;
                        cout << "Number of Box/Line Intersections: " << boxReductionCount  << endl;
                        cout << "Number of Guesses: " << guessCount  << endl;
                        cout << "Number of Backtracks: " << backtrackCount  << endl;
                        cout << "Difficulty: " << difficultyString  << endl;
                    }
                }
                puzzleCount++;
            }
            if (printedSomething && printStyle == SudokuBoard::CSV){
                cout << endl;
            }
        }

        delete ss;

        long applicationDoneTime = getMicroseconds();
        // Print out the time it took to do everything
        if (timer){
            double t = ((double)(applicationDoneTime - applicationStartTime))/1000000.0;
            cout << puzzleCount << " puzzle" << ((puzzleCount==1)?"":"s") << " " << (action==GENERATE?"generated":"solved") << " in " << t << " seconds." << endl;
        }


    } catch (char const* s){
        cout << s <<  endl;
        return 1;
    }

    return 0;
}

void printVersion(){
    cout << PACKAGE_STRING << endl;
}

void printAbout(){
    cout << PACKAGE_NAME << " - Sudoku solver and generator." << endl;
    cout << "Written by Stephen Ostermiller copyright 2006." << endl;
    cout << "http://ostermiller.org/qqwing/" << endl;
    cout << "" << endl;
    cout << "This program is free software; you can redistribute it and/or modify" << endl;
    cout << "it under the terms of the GNU General Public License as published by" << endl;
    cout << "the Free Software Foundation; either version 2 of the License, or" << endl;
    cout << "(at your option) any later version." << endl;
    cout << "" << endl;
    cout << "This program is distributed in the hope that it will be useful," << endl;
    cout << "but WITHOUT ANY WARRANTY; without even the implied warranty of" << endl;
    cout << "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the" << endl;
    cout << "GNU General Public License for more details." << endl;
    cout << "" << endl;
    cout << "You should have received a copy of the GNU General Public License" << endl;
    cout << "along with this program; if not, write to the Free Software" << endl;
    cout << "Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA" << endl;
}

void printHelp(char* programName){
    cout << programName << " <options>" << endl;
    cout << "Sudoku solver and generator." << endl;
    cout << "  --generate <num>     Generate new puzzles" << endl;
    cout << "  --solve              Solve all the puzzles from standard input" << endl;
    cout << "  --difficulty <diff>  Generate only simple,easy, intermediate, or expert" << endl;
    cout << "  --puzzle             Print the puzzle (default when generating)" << endl;
    cout << "  --nopuzzle           Do not print the puzzle (default when solving)" << endl;
    cout << "  --solution           Print the solution (default when solving)" << endl;
    cout << "  --nosolution         Do not print the solution (default when generating)" << endl;
    cout << "  --stats              Print statistics about moves used to solve the puzzle" << endl;
    cout << "  --nostats            Do not print statistics (default)" << endl;
    #if HAVE_GETTIMEOFDAY == 1
        cout << "  --timer              Print time to generate or solve each puzzle" << endl;
        cout << "  --notimer            Do not print solve or generation times (default)" << endl;
    #endif
    cout << "  --count-solutions    Count the number of solutions to puzzles" << endl;
    cout << "  --nocount-solutions  Do not count the number of solutions (default)" << endl;
    cout << "  --history            Print trial and error used when solving" << endl;
    cout << "  --nohistory          Do not print trial and error to solve (default)" << endl;
    cout << "  --instructions       Print the steps (at least 81) needed to solve the puzzle" << endl;
    cout << "  --noinstructions     Do not print steps to solve (default)" << endl;
    cout << "  --log-history        Print trial and error to solve as it happens" << endl;
    cout << "  --nolog-history      Do not print trial and error  to solve as it happens" << endl;
    cout << "  --one-line           Print puzzles on one line of 81 characters" << endl;
    cout << "  --compact            Print puzzles on 9 lines of 9 characters" << endl;
    cout << "  --readable           Print puzzles in human readable form (default)" << endl;
    cout << "  --csv                Ouput CSV format with one line puzzles" << endl;
    cout << "  --help               Print this message" << endl;
    cout << "  --about              Author and license information" << endl;
    cout << "  --version            Display current version number" << endl;
}

/**
 * Create a new Sudoku board
 */
SudokuBoard::SudokuBoard(){
    puzzle = new int[BOARD_SIZE];
    solution = new int[BOARD_SIZE];
    solutionRound = new int[BOARD_SIZE];
    possibilities = new int[POSSIBILITY_SIZE];
    recordHistory = false;
    printStyle = READABLE;
    randomBoardArray = new int[BOARD_SIZE];
    randomPossibilityArray = new int[NUM_POSS];
    solveHistory = new vector<LogItem*>();
    solveInstructions = new vector<LogItem*>();
    {for (int i=0; i<BOARD_SIZE; i++){
        randomBoardArray[i] = i;
    }}
    {for (int i=0; i<NUM_POSS; i++){
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

    {for (int i=0;i<solveHistory->size();i++){
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
        case SudokuBoard::EXPERT: return "Expert"; break;
        case SudokuBoard::INTERMEDIATE: return "Intermediate"; break;
        case SudokuBoard::EASY: return "Easy"; break;
        case SudokuBoard::SIMPLE: return "Simple"; break;
        default: return "Unknown"; break;
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

void SudokuBoard::markRandomPossibility(int round){
    int remainingPossibilities = 0;
    {for (int i=0; i<POSSIBILITY_SIZE; i++){
        if (possibilities[i] == 0) remainingPossibilities++;
    }}

    int randomPossibility = rand()%remainingPossibilities;

    int possibilityToMark = 0;
    {for (int i=0; i<POSSIBILITY_SIZE; i++){
        if (possibilities[i] == 0){
            if (possibilityToMark == randomPossibility){
                int position = i/NUM_POSS;
                int value = i%NUM_POSS+1;
                mark(position, round, value);
                return;
            }
            possibilityToMark++;
        }
    }}
}

void SudokuBoard::shuffleRandomArrays(){
    shuffleArray(randomBoardArray, BOARD_SIZE);
    shuffleArray(randomPossibilityArray, NUM_POSS);
}

void SudokuBoard::clearPuzzle(){
    // Clear any existing puzzle
    {for (int i=0; i<BOARD_SIZE; i++){
        puzzle[i] = 0;
    }}
    reset();
}

bool SudokuBoard::generatePuzzle(){

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

    // Rollback any square for which it is obvious that
    // the square doesn't contribute to a unique solution
    // (ie, squares that were filled by logic rather
    // than by guess)
    rollbackNonGuesses();

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
    // If it does, leave it0 out the point because
    // it is not needed.
    {for (int i=0; i<BOARD_SIZE; i++){
        // check all the positions, but in shuffled order
        int position = randomBoardArray[i];
        if (puzzle[position] > 0){
            // try backing out the value and
            // counting solutions to the puzzle
            int savedValue = puzzle[position];
            puzzle[position] = 0;
            reset();
            if (countSolutions(2, true) > 1){
                // Put it back in, it is needed
                puzzle[position] = savedValue;
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
    {for (int i=0;i<v->size();i++){
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

int SudokuBoard::countSolutions(){
    // Don't record history while generating.
    bool recHistory = recordHistory;
    setRecordHistory(false);
    bool lHistory = logHistory;
    setLogHistory(false);

    reset();
    int solutionCount = countSolutions(2, false);

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

int SudokuBoard::findPositionWithFewestPossibilities(){
    int minPossibilities = 10;
    int bestPosition = 0;
    {for (int i=0; i<BOARD_SIZE; i++){
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
    }}
    return bestPosition;
}

bool SudokuBoard::guess(int round, int guessNumber){
    int localGuessCount = 0;
    int position = findPositionWithFewestPossibilities();
    {for (int i=0; i<NUM_POSS; i++){
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
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
        for (int col=0; col<9; col++){
            int colStart = columnToFirstCell(col);
            bool inOneBox = true;
            int colBox = -1;
            {for (int i=0; i<3; i++){
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
            }}
            if (inOneBox && colBox != -1){
                bool doneSomething = false;
                int row = 3*colBox;
                int secStart = cellToSectionStartCell(rowColumnToCell(row, col));
                int secStartRow = cellToRow(secStart);
                int secStartCol = cellToColumn(secStart);
                {for (int i=0; i<3; i++){
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
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
        for (int row=0; row<9; row++){
            int rowStart = rowToFirstCell(row);
            bool inOneBox = true;
            int rowBox = -1;
            {for (int i=0; i<3; i++){
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
            }}
            if (inOneBox && rowBox != -1){
                bool doneSomething = false;
                int column = 3*rowBox;
                int secStart = cellToSectionStartCell(rowColumnToCell(row, column));
                int secStartRow = cellToRow(secStart);
                int secStartCol = cellToColumn(secStart);
                {for (int i=0; i<3; i++){
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
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
        for (int section=0; section<9; section++){
            int secStart = sectionToFirstCell(section);
            bool inOneRow = true;
            int boxRow = -1;
            for (int j=0; j<3; j++){
                {for (int i=0; i<3; i++){
                    int secVal=secStart+i+(9*j);
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

                {for (int i=0; i<9; i++){
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
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
        for (int section=0; section<9; section++){
            int secStart = sectionToFirstCell(section);
            bool inOneCol = true;
            int boxCol = -1;
            {for (int i=0; i<3; i++){
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
            }}
            if (inOneCol && boxCol != -1){
                bool doneSomething = false;
                int col = cellToColumn(secStart) + boxCol;
                int colStart = columnToFirstCell(col);

                {for (int i=0; i<9; i++){
                    int position = colStart+(9*i);
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
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
        int valPos = getPossibilityIndex(valIndex,position);
        if (possibilities[valPos] == 0) count++;
    }
    return count;
}

bool SudokuBoard::arePossibilitiesSame(int position1, int position2){
    for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
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

bool SudokuBoard::hiddenPairInColumn(int round){
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
                        bool doneSomething = false;
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
                        bool doneSomething = false;
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
                        bool doneSomething = false;
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
                            for (int column2=0; column2<9; column2++){
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
                            for (int row2=0; row2<9; row2++){
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
                            {for (int i=0; i<3; i++){
                                for (int j=0; j<3; j++){
                                    int position3=secStart+i+(9*j);
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
    for (int sec=0; sec<SEC_COUNT; sec++){
        int secPos = sectionToFirstCell(sec);
        for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
            int count = 0;
            int lastPosition = 0;
            {for (int i=0; i<3; i++){
                for (int j=0; j<3; j++){
                    int position = secPos + i + 9*j;
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
            for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
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
    int rowStart = cellToRow(position)*9;
    for (int col=0; col<COL_HEIGHT; col++){
        int rowVal=rowStart+col;
        int valPos = getPossibilityIndex(valIndex,rowVal);
        //cout << "Row Start: " << rowStart << " Row Value: " << rowVal << " Value Position: " << valPos << endl;
        if (possibilities[valPos] == 0){
            possibilities[valPos] = round;
        }
    }

    // Take this value out of the possibilities for everything in the column
    int colStart = cellToColumn(position);
    {for (int i=0; i<9; i++){
        int colVal=colStart+(9*i);
        int valPos = getPossibilityIndex(valIndex,colVal);
        //cout << "Col Start: " << colStart << " Col Value: " << colVal << " Value Position: " << valPos << endl;
        if (possibilities[valPos] == 0){
            possibilities[valPos] = round;
        }
    }}

    // Take this value out of the possibilities for everything in section
    int secStart = cellToSectionStartCell(position);
    {for (int i=0; i<3; i++){
        for (int j=0; j<3; j++){
            int secVal=secStart+i+(9*j);
            int valPos = getPossibilityIndex(valIndex,secVal);
            //cout << "Sec Start: " << secStart << " Sec Value: " << secVal << " Value Position: " << valPos << endl;
            if (possibilities[valPos] == 0){
                possibilities[valPos] = round;
            }
        }
    }}

    //This position itself is determined, it should have possibilities.
    {for (int valIndex=0; valIndex<9; valIndex++){
        int valPos = getPossibilityIndex(valIndex,position);
        if (possibilities[valPos] == 0){
            possibilities[valPos] = round;
        }
    }}

    //cout << "Col Start: " << colStart << " Row Start: " << rowStart << " Section Start: " << secStart<< " Value: " << value << endl;
    //printPossibilities();
}

/**
 * Print a human readable list of all the possibilities for the
 * squares that have not yet been filled in.
 */
void SudokuBoard::printPossibilities(){
    for(int i=0; i<BOARD_SIZE; i++){
        cout << " ";
        for (int valIndex=0; valIndex<NUM_POSS; valIndex++){
            int posVal = (9*i)+valIndex;
            int value = valIndex+1;
            if (possibilities[posVal]==0){
                cout << value;
            } else {
                cout << ".";
            }
        }
        if (i != BOARD_SIZE-1 && i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
            cout << endl << "-------------------------------|-------------------------------|-------------------------------" << endl;
        } else if (i%9==8){
            cout << endl;
        } else if (i%3==2){
            cout << " |";
        }
    }
    cout << endl;
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
        } else if (i%9==8){
            if (printStyle == READABLE || printStyle == COMPACT){
                cout << endl;
            }
            if (i%SEC_GROUP_SIZE==SEC_GROUP_SIZE-1){
                if (printStyle == READABLE){
                    cout << "-------|-------|-------" << endl;
                }
            }
        } else if (i%3==2){
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
    delete puzzle;
    delete solution;
    delete possibilities;
    delete solutionRound;
    delete randomBoardArray;
    delete randomPossibilityArray;
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
        cout  << ")";
    }

}

/**
 * Given a vector of LogItems, determine how many
 * log items in the vector are of the specified type.
 */
int getLogCount(vector<LogItem*>* v, LogItem::LogType type){
    int count = 0;
    {for (int i=0; i<v->size(); i++){
        if(v->at(i)->getType() == type) count++;
    }}
    return count;
}

/**
 * Get the current time in microseconds.
 */
long getMicroseconds(){
    #if HAVE_GETTIMEOFDAY == 1
        struct timeval tv;
        gettimeofday(&tv, NULL);
        return tv.tv_sec*1000000+tv.tv_usec;
    #else
        return 0;
    #endif
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

/**
 * Read a sudoku puzzle from standard input.
 * STDIN is processed one character at a time
 * until the sudoku is filled in.  Any digit
 * or period is used to fill the sudoku, any
 * other character is ignored.
 */
bool readPuzzleFromStdIn(int* puzzle){
    int read = 0;
    while (read < BOARD_SIZE){
        char c = getchar();
        if (c == EOF) return false;
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
static inline int cellToColumn(int cell){
    return cell%COL_HEIGHT;
}

/**
 * Given the index of a cell (0-80) calculate
 * the row (0-8) in which it resides.
 */
static inline int cellToRow(int cell){
    return cell/ROW_LENGTH;
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
    return 9*row;
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
    return valueIndex+(NUM_POSS*cell);
}

/**
 * Given a row (0-8) and a column (0-8) calculate the
 * cell (0-80).
 */
static inline int rowColumnToCell(int row, int column){
    return (row*COL_HEIGHT)+column;
}

/**
 * Given a section (0-8) and an offset into that section (0-8)
 * calculate the cell (0-80)
 */
static inline int sectionToCell(int section, int offset){
    return sectionToFirstCell(section)
            + ((offset/GRID_SIZE)*SEC_SIZE)
            + (offset%GRID_SIZE);
}
