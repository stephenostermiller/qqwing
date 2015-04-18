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
	var applicationStartTime = getMicroseconds();

	// The number of puzzles solved or generated.
	var puzzleCount = 0;

	// defaults for options
	var printPuzzle = false;
	var printSolution = false;
	var printHistory = false;
	var printInstructions = false;
	var timer = false;
	var countSolutions = false;
	var action = "NONE";
	var logHistory = false;
	var printStyle = qqwing.PrintStyle.READABLE;
	var numberToGenerate = 1;
	var printStats = false;
	var difficulty = qqwing.Difficulty.UNKNOWN;
	var symmetry = qqwing.Symmetry.NONE;
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
		} else if (argv[i] == "--generate"){
			action = "GENERATE";
			printPuzzle = true;
			if (i+1 < argv.length && argv[i+1].charAt(0) != "-"){
				numberToGenerate = parseInt(argv[i+1]);
				if (isNaN(numberToGenerate) || numberToGenerate <= 0){
					console.log("Bad number of puzzles to generate: "+argv[i+1]);
					process.exit(1);
				}
				i++;
			}
		} else if (argv[i] == "--difficulty") {
			if (argv.length <= i+1){
				console.log("Please specify a difficulty.");
				process.exit(1);
			} else if (argv[i+1].toLowerCase() == "simple"){
				difficulty = qqwing.Difficulty.SIMPLE;
			} else if (argv[i+1].toLowerCase() == "easy"){
				difficulty = qqwing.Difficulty.EASY;
			} else if (argv[i+1].toLowerCase() == "intermediate"){
				difficulty = qqwing.Difficulty.INTERMEDIATE;
			} else if (argv[i+1].toLowerCase() == "expert"){
				difficulty = qqwing.Difficulty.EXPERT;
			} else if (argv[i+1].toLowerCase() == "any"){
				difficulty = qqwing.Difficulty.UNKNOWN;
			} else {
				console.log("Difficulty expected to be simple, easy, intermediate, expert, or any, not "+argv[i+1]);
				process.exit(1);
			}
			i++;
		} else if (argv[i] == "--symmetry") {
			if (argv.length <= i+1){
				console.log("Please specify a symmetry.");
				process.exit(1);
			} else if (argv[i+1] == "none") {
				symmetry = qqwing.Symmetry.NONE;
			} else if (argv[i+1] == "rotate90") {
				symmetry = qqwing.Symmetry.ROTATE90;
			} else if (argv[i+1] == "rotate180") {
				symmetry = qqwing.Symmetry.ROTATE180;
			} else if (argv[i+1] == "mirror") {
				symmetry = qqwing.Symmetry.MIRROR;
			} else if (argv[i+1] == "flip") {
				symmetry = qqwing.Symmetry.FLIP;
			} else if (argv[i+1] == "random") {
				symmetry = qqwing.Symmetry.RANDOM;
			} else {
				console.log("Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not " + argv[i+1]);
				process.exit(1);
			}
			i++;
		} else if (argv[i] == "--solve") {
			action = "SOLVE";
			printSolution = true;
		} else if (argv[i] == "--log-history") {
			logHistory = true;
		} else if (argv[i] == "--nolog-history") {
			logHistory = false;
		} else if (argv[i] == "--one-line") {
			printStyle=qqwing.PrintStyle.ONE_LINE;
		} else if (argv[i] == "--compact") {
			printStyle=qqwing.PrintStyle.COMPACT;
		} else if (argv[i] == "--readable") {
			printStyle=qqwing.PrintStyle.READABLE;
		} else if (argv[i] == "--csv") {
			printStyle=qqwing.PrintStyle.CSV;
		} else if (argv[i] == "-n" || argv[i] == "--number") {
			if (i+1 < argv.length){
				numberToGenerate = parseInt(argv[i+1]);
				i++;
			} else {
				console.log("Please specify a number.");
				process.exit(1);
			}
		} else if (argv[i] == "-h" || argv[i] == "--help" || argv[i] == "help" || argv[i] == "?") {
			printHelp();
			process.exit(0);
		} else if (argv[i] == "--version") {
			printVersion();
			process.exit(0);
		} else if (argv[i] == "--about") {
			printAbout();
			process.exit(0);
		} else {
			console.log("Unknown argument: '"+argv[i]+"'");
			printHelp();
			process.exit(0);
		}
	}

	if (action == "NONE"){
		console.log("Either --solve or --generate must be specified.");
		printHelp();
		process.exit(1);
	}

	// If printing out CSV, print a header
	if (printStyle == qqwing.PrintStyle.CSV){
		if (printPuzzle) process.stdout.write("Puzzle,");
		if (printSolution) process.stdout.write("Solution,");
		if (printHistory) process.stdout.write("Solve History,");
		if (printInstructions) process.stdout.write("Solve Instructions,");
		if (countSolutions) process.stdout.write("Solution Count,");
		if (timer) process.stdout.write("Time (milliseconds),");
		if (printStats) process.stdout.write("Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty");
		console.log("");
	}

	// Create a new puzzle board
	// and set the options
	var ss = new qqwing();
	ss.setRecordHistory(printHistory || printInstructions || printStats || difficulty!=qqwing.Difficulty.UNKNOWN);
	ss.setLogHistory(logHistory);
	ss.setPrintStyle(printStyle);

	// Solve puzzle or generate puzzles
	// until end of input for solving, or
	// until we have generated the specified number.
	var done = false;
	var numberGenerated = 0;
	while (!done){
		// record the start time for the timer.
		var puzzleStartTime = getMicroseconds();

		// iff something has been printed for this particular puzzle
		var printedSomething = false;

		// Record whether the puzzle was possible or not,
		// so that we don't try to solve impossible givens.
		var havePuzzle = false;
		if (action == "GENERATE"){
			// Generate a puzzle
			havePuzzle = ss.generatePuzzleSymmetry(symmetry);
			if (!havePuzzle && printPuzzle){
				process.stdout.write("Could not generate puzzle.");
				if (printStyle==qqwing.PrintStyle.CSV){
					console.log(",");
				} else {
					console.log("");
				}
				printedSomething = true;
					process.exit(1);
			}
		} else {
			// Read the next puzzle on STDIN
			var puzzle = [];
			if (readPuzzleFromStdIn(puzzle)){
				havePuzzle = ss.setPuzzle(puzzle);
				if (!havePuzzle){
					if (printPuzzle){
						ss.printPuzzle();
						printedSomething = true;
					}
					if (printSolution) {
						process.stdout.write("Puzzle is not possible.");
						if (printStyle==qqwing.PrintStyle.CSV){
							process.stdout.write(",");
						} else {
							console.log("");
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

		var solutions = 0;

		if (havePuzzle){

			// Count the solutions if requested.
			// (Must be done before solving, as it would
			// mess up the stats.)
			if (countSolutions){
				solutions = ss.countSolutions();
			}

			// Solve the puzzle
			if (printSolution || printHistory || printStats || printInstructions || difficulty!=qqwing.Difficulty.UNKNOWN){
				ss.solve();
			}

			// Bail out if it didn't meet the difficulty standards for generation
			if (action == "GENERATE"){
				if (difficulty!=qqwing.Difficulty.UNKNOWN && difficulty!=ss.getDifficulty()){
					havePuzzle = false;
				} else {
					numberGenerated++;
					// Set loop to terminate if enough have been generated.
					if (numberGenerated >= numberToGenerate) done = true;
				}
			}
		}

		// Check havePuzzle again, it may have changed based on difficulty
		if (havePuzzle){

			// With a puzzle now in hand and possibly solved
			// print out the solution, stats, etc.
			printedSomething = true;

			// Record the end time for the timer.
			var puzzleDoneTime = getMicroseconds();

			// Print the puzzle itself.
			if (printPuzzle) ss.printPuzzle();

			// Print the solution if there is one
			if (printSolution){
				if (ss.isSolved()){
					ss.printSolution();
				} else {
					process.stdout.write("Puzzle has no solution.");
					if (printStyle==qqwing.PrintStyle.CSV){
						process.stdout.write(",");
					} else {
						console.log("");
					}
				}
			}

			// Print the steps taken to solve or attempt to solve the puzzle.
			if (printHistory) ss.printSolveHistory();
			// Print the instructions for solving the puzzle
			if (printInstructions) ss.printSolveInstructions();

			// Print the number of solutions to the puzzle.
			if (countSolutions){
				if (printStyle == qqwing.PrintStyle.CSV){
					process.stdout.write(solutions+",");
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
				var t = (puzzleDoneTime - puzzleStartTime)/1000.0;
				if (printStyle == qqwing.PrintStyle.CSV){
					process.stdout.write(t+",");
				} else {
					console.log("Time: "+t +" milliseconds");
				}
			}

			// Print any stats we were able to gather while solving the puzzle.
			if (printStats){
				var givenCount = ss.getGivenCount();
				var singleCount = ss.getSingleCount();
				var hiddenSingleCount = ss.getHiddenSingleCount();
				var nakedPairCount = ss.getNakedPairCount();
				var hiddenPairCount = ss.getHiddenPairCount();
				var pointingPairTripleCount = ss.getPointingPairTripleCount();
				var boxReductionCount = ss.getBoxLineReductionCount();
				var guessCount = ss.getGuessCount();
				var backtrackCount = ss.getBacktrackCount();
				var difficultyString = ss.getDifficultyAsString();
				if (printStyle == qqwing.PrintStyle.CSV){
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
		if (printedSomething && printStyle == qqwing.PrintStyle.CSV){
			console.log("");
		}
	}

	var applicationDoneTime = getMicroseconds();
	// Print out the time it took to do everything
	if (timer){
		var t = (applicationDoneTime - applicationStartTime)/1000000.0;
		console.log(puzzleCount+" puzzle"+((puzzleCount==1)?"":"s")+" "+(action=="GENERATE"?"generated":"solved")+" in "+t+" seconds.");
	}
} catch (e){
	console.log(e.stack);
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
	console.log("  --csv                Output CSV format with one line puzzles");
	console.log("  --help               Print this message");
	console.log("  --about              Author and license information");
	console.log("  --version            Display current version number");
}

function printVersion(){
	console.log("qqwing 1.3.4");
}

function printAbout(){
	console.log("qqwing - Sudoku solver and generator");
	console.log("Copyright (C) 2014 Stephen Ostermiller");
	console.log("");
	console.log("This program is free software; you can redistribute it and/or modify");
	console.log("it under the terms of the GNU General Public License as published by");
	console.log("the Free Software Foundation; either version 2 of the License, or");
	console.log("(at your option) any later version.");
	console.log("");
	console.log("This program is distributed in the hope that it will be useful,");
	console.log("but WITHOUT ANY WARRANTY; without even the implied warranty of");
	console.log("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
	console.log("GNU General Public License for more details.");
	console.log("");
	console.log("You should have received a copy of the GNU General Public License along");
	console.log("with this program; if not, write to the Free Software Foundation, Inc.,");
	console.log("51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.");
}

function getMicroseconds(){
	return new Date().getTime() * 1000;
}


/**
 * Read a sudoku puzzle from standard input.
 * STDIN is processed one character at a time
 * until the sudoku is filled in.  Any digit
 * or period is used to fill the sudoku, any
 * other character is ignored.
 */
function readPuzzleFromStdIn(puzzle){
	var fs = require('fs');
	var read = 0;
	while (read < qqwing.BOARD_SIZE){
		var c = fs.readSync(process.stdin.fd, 1);
		if (c[1] == 0) return false;
		if (c[0] >= '1' && c[0] <='9'){
			puzzle[read] = c[0]-'0';
			read++;
		}
		if (c[0] == '.' || c[0] == '0'){
			puzzle[read] = 0;
			read++;
		}
	}
	return true;
}
