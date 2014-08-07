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
try {
	// Start time for the application for timing
	var applicationStartTime = 0; //TODO getMicroseconds();

	// The number of puzzles solved or generated.
	var puzzleCount = 0;

	// defaults for options
	var printPuzzle = false;
	var printSolution = false;
	var printHistory = false;
	var printInstructions = false;
	var timer = false;
	var countSolutions = false;
	var action = "NONE"; // TODO NONE
	var logHistory = false;
	var printStyle = qqwing.PrintStyle.READABLE;
	var numberToGenerate = 1;
	var printStats = false;
	var difficulty = "UNKNOWN"; //TODO Difficulty.UNKNOWN;
	var symmetry = "NONE"; //TODO Symmetry.NONE;
	var argv = process.argv;

	// Read the arguments and set the options
	for (var i=2; i<argv.length; i++){
		if (argv[i] == "--puzzle"){
			printPuzzle = true;
		} else if (argv[i] == "--nopuzzle"){
			printPuzzle = false;
		} else if (argv[i] == "--solution"){
			printSolution = true;
		} else if (argv[i] == "--nosolution"){
			printSolution = false;
		} else if (argv[i] == "--history"){
			printHistory = true;
		} else if (argv[i] == "--nohistory"){
			printHistory = false;
		} else if (argv[i] == "--instructions"){
			printInstructions = true;
		} else if (argv[i] == "--noinstructions"){
			printInstructions = false;
		} else if (argv[i] == "--stats"){
			printStats = true;
		} else if (argv[i] == "--nostats"){
			printStats = false;
		} else if (argv[i] == "--timer"){
			timer = true;
		} else if (argv[i] == "--notimer"){
			timer = false;
		} else if (argv[i] == "--count-solutions"){
			countSolutions = true;
		} else if (argv[i] == "--nocount-solutions"){
			countSolutions = false;
		/*} else if (argv[i] == "--generate"){
			action = GENERATE;
			printPuzzle = true;
			if (i+1 < argv.length && !argv[i+1].startsWith("-")){
				numberToGenerate = Integer.parseInt(argv[i+1]);
				i++;
			}
		} else if (argv[i].equals("--difficulty")){
			if (argv.length <= i+1){
				console.log("Please specify a difficulty.");
				System.exit(1);
			} else if (argv[i+1].equalsIgnoreCase("simple")){
				difficulty = Difficulty.SIMPLE;
			} else if (argv[i+1].equalsIgnoreCase("easy")){
				difficulty = Difficulty.EASY;
			} else if (argv[i+1].equalsIgnoreCase("intermediate")){
				difficulty = Difficulty.INTERMEDIATE;
			} else if (argv[i+1].equalsIgnoreCase("expert")){
				difficulty = Difficulty.EXPERT;
			} else if (argv[i+1].equalsIgnoreCase("any")){
				difficulty = Difficulty.UNKNOWN;
			} else {
				console.log("Difficulty expected to be simple, easy, intermediate, expert, or any, not "+argv[i+1]);
				System.exit(1);
			}
			i++;
		} else if (argv[i].equals("--symmetry")){
			if (argv.length <= i+1){
				console.log("Please specify a symmetry.");
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
				console.log("Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not " + argv[i+1]);
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
				console.log("Please specify a number.");
				System.exit(1);
			}
		} else if (argv[i].equals("-h") || argv[i].equals("--help") || argv[i].equals("help") || argv[i].equals("?")){
			printHelp();
			System.exit(0);
		} else if (argv[i].equals("--version")){
			printVersion();
			System.exit(0);
		} else if (argv[i].equals("--about")){
			printAbout();
			System.exit(0);
		*/
		} else {
			console.log("Unknown argument: '"+argv[i]+"'");
			printHelp();
			process.exit(0);
		}
	}
/*
	if (action == NONE){
		console.log("Either --solve or --generate must be specified.");
		printHelp();
		System.exit(1);
	}

	// Initialize the random number generator
	QQWing.r = new Random(new Date().getTime());

	// If printing out CSV, print a header
	if (printStyle == PrintStyle.CSV){
		if (printPuzzle) System.out.print("Puzzle,");
		if (printSolution) System.out.print("Solution,");
		if (printHistory) System.out.print("Solve History,");
		if (printInstructions) System.out.print("Solve Instructions,");
		if (countSolutions) System.out.print("Solution Count,");
		if (timer) System.out.print("Time (milliseconds),");
		if (printStats) System.out.print("Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty");
		console.log("");
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
					console.log(",");
				} else {
					console.log();
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
							console.log();
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
						console.log();
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
						console.log("There are no solutions to the puzzle.");
					} else if (solutions == 1){
						console.log("The solution to the puzzle is unique.");
					} else {
						console.log("There are "+solutions+" solutions to the puzzle.");
					}
				}
			}

			// Print out the time it took to solve the puzzle.
			if (timer){
				double t = ((double)(puzzleDoneTime - puzzleStartTime))/1000.0;
				if (printStyle == PrintStyle.CSV){
					System.out.print(t+",");
				} else {
					console.log("Time: "+t +" milliseconds");
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
					console.log(givenCount+"," +singleCount+","+hiddenSingleCount
							+","+nakedPairCount+","+hiddenPairCount
							+"," +pointingPairTripleCount +"," +boxReductionCount
							+","+guessCount+","+backtrackCount
							+","+difficultyString+",");
				} else {
					console.log("Number of Givens: "+givenCount );
					console.log("Number of Singles: "+singleCount);
					console.log("Number of Hidden Singles: "+hiddenSingleCount );
					console.log("Number of Naked Pairs: "+nakedPairCount );
					console.log("Number of Hidden Pairs: "+hiddenPairCount );
					console.log("Number of Pointing Pairs/Triples: "+pointingPairTripleCount );
					console.log("Number of Box/Line Intersections: "+boxReductionCount );
					console.log("Number of Guesses: "+guessCount );
					console.log("Number of Backtracks: "+backtrackCount );
					console.log("Difficulty: "+difficultyString );
				}
			}
			puzzleCount++;
		}
		if (printedSomething && printStyle == PrintStyle.CSV){
			console.log();
		}
	}

	ss = null;

	long applicationDoneTime = getMicroseconds();
	// Print out the time it took to do everything
	if (timer){
		double t = ((double)(applicationDoneTime - applicationStartTime))/1000000.0;
		console.log(puzzleCount+" puzzle"+((puzzleCount==1)?"":"s")+" "+(action==GENERATE?"generated":"solved")+" in "+t+" seconds.");
	}*/
} catch (e){
	console.log(e);
	process.exit(1);
}
process.exit(0);

function printHelp(){
	console.log("qqwing <options>");
	console.log("Sudoku solver and generator.");
	console.log("  --generate <num>     Generate new puzzles");
	console.log("  --solve              Solve all the puzzles from standard input");
	console.log("  --difficulty <diff>  Generate only simple, easy, intermediate, expert, or any");
	console.log("  --symmetry <sym>     Symmetry: none, rotate90, rotate180, mirror, flip, or random");
	console.log("  --puzzle             Print the puzzle (default when generating)");
	console.log("  --nopuzzle           Do not print the puzzle (default when solving)");
	console.log("  --solution           Print the solution (default when solving)");
	console.log("  --nosolution         Do not print the solution (default when generating)");
	console.log("  --stats              Print statistics about moves used to solve the puzzle");
	console.log("  --nostats            Do not print statistics (default)");
	console.log("  --timer              Print time to generate or solve each puzzle");
	console.log("  --notimer            Do not print solve or generation times (default)");
	console.log("  --count-solutions    Count the number of solutions to puzzles");
	console.log("  --nocount-solutions  Do not count the number of solutions (default)");
	console.log("  --history            Print trial and error used when solving");
	console.log("  --nohistory          Do not print trial and error to solve (default)");
	console.log("  --instructions       Print the steps (at least 81) needed to solve the puzzle");
	console.log("  --noinstructions     Do not print steps to solve (default)");
	console.log("  --log-history        Print trial and error to solve as it happens");
	console.log("  --nolog-history      Do not print trial and error  to solve as it happens");
	console.log("  --one-line           Print puzzles on one line of 81 characters");
	console.log("  --compact            Print puzzles on 9 lines of 9 characters");
	console.log("  --readable           Print puzzles in human readable form (default)");
	console.log("  --csv                Ouput CSV format with one line puzzles");
	console.log("  --help               Print this message");
	console.log("  --about              Author and license information");
	console.log("  --version            Display current version number");
}
