// @formatter:off
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
// @formatter:on
package com.qqwing;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

class QQWingMain {

	private static final String NL = System.getProperties().getProperty("line.separator");

	private QQWingMain(){
	}

	/**
	 * Main method -- the entry point into the program. Run with --help as an
	 * argument for usage and documentation
	 */
	public static void main(String[] argv) {
		// Start time for the application for timing
		long applicationStartTime = getMicroseconds();

		final QQWingOptions opts = new QQWingOptions();

		// Read the arguments and set the options
		for (int i = 0; i < argv.length; i++) {
			if (argv[i].equals("--puzzle")) {
				opts.printPuzzle = true;
			} else if (argv[i].equals("--nopuzzle")) {
				opts.printPuzzle = false;
			} else if (argv[i].equals("--solution")) {
				opts.printSolution = true;
			} else if (argv[i].equals("--nosolution")) {
				opts.printSolution = false;
			} else if (argv[i].equals("--history")) {
				opts.printHistory = true;
			} else if (argv[i].equals("--nohistory")) {
				opts.printHistory = false;
			} else if (argv[i].equals("--instructions")) {
				opts.printInstructions = true;
			} else if (argv[i].equals("--noinstructions")) {
				opts.printInstructions = false;
			} else if (argv[i].equals("--stats")) {
				opts.printStats = true;
			} else if (argv[i].equals("--nostats")) {
				opts.printStats = false;
			} else if (argv[i].equals("--timer")) {
				opts.timer = true;
			} else if (argv[i].equals("--notimer")) {
				opts.timer = false;
			} else if (argv[i].equals("--count-solutions")) {
				opts.countSolutions = true;
			} else if (argv[i].equals("--nocount-solutions")) {
				opts.countSolutions = false;
			} else if (argv[i].equals("--threads")) {
				i++;
				if (i >= argv.length) {
					System.err.println("Please specify a number of threads.");
					System.exit(1);
				}
				try {
					opts.threads = Integer.parseInt(argv[i]);
				} catch (NumberFormatException nfx) {
					System.err.println("Invalid number of threads: " + argv[i]);
					System.exit(1);
				}
			} else if (argv[i].equals("--generate")) {
				opts.action = Action.GENERATE;
				opts.printPuzzle = true;
				if (i + 1 < argv.length && !argv[i + 1].startsWith("-")) {
					try {
						opts.numberToGenerate = Integer.parseInt(argv[i + 1]);
					} catch (NumberFormatException nfx) {
						opts.numberToGenerate = 0;
					}
					if (opts.numberToGenerate <= 0) {
						System.err.println("Bad number of puzzles to generate: " + argv[i + 1]);
						System.exit(1);
					}
					i++;
				}
			} else if (argv[i].equals("--difficulty")) {
				if (argv.length <= i + 1) {
					System.err.println("Please specify a difficulty.");
					System.exit(1);
				}
				opts.difficulty = Difficulty.get(argv[i + 1]);
				if (opts.difficulty == null){
					System.err.println("Difficulty expected to be simple, easy, intermediate, expert, or any, not " + argv[i + 1]);
					System.exit(1);
				}
				i++;
			} else if (argv[i].equals("--symmetry")) {
				if (argv.length <= i + 1) {
					System.err.println("Please specify a symmetry.");
					System.exit(1);
				}
				opts.symmetry = Symmetry.get(argv[i + 1]);
				if (opts.symmetry == null){
					System.err.println("Symmetry expected to be none, rotate90, rotate180, mirror, flip, or random, not " + argv[i + 1]);
					System.exit(1);
				}
				i++;
			} else if (argv[i].equals("--solve")) {
				opts.action = Action.SOLVE;
				opts.printSolution = true;
			} else if (argv[i].equals("--log-history")) {
				opts.logHistory = true;
			} else if (argv[i].equals("--nolog-history")) {
				opts.logHistory = false;
			} else if (argv[i].equals("--one-line")) {
				opts.printStyle = PrintStyle.ONE_LINE;
			} else if (argv[i].equals("--compact")) {
				opts.printStyle = PrintStyle.COMPACT;
			} else if (argv[i].equals("--readable")) {
				opts.printStyle = PrintStyle.READABLE;
			} else if (argv[i].equals("--csv")) {
				opts.printStyle = PrintStyle.CSV;
			} else if (argv[i].equals("-n") || argv[i].equals("--number")) {
				if (i + 1 < argv.length) {
					opts.numberToGenerate = Integer.parseInt(argv[i + 1]);
					i++;
				} else {
					System.err.println("Please specify a number.");
					System.exit(1);
				}
			} else if (argv[i].equals("-h") || argv[i].equals("--help") || argv[i].equals("help") || argv[i].equals("?")) {
				printHelp();
				System.exit(0);
			} else if (argv[i].equals("--version")) {
				printVersion();
				System.exit(0);
			} else if (argv[i].equals("--about")) {
				printAbout();
				System.exit(0);
			} else {
				System.out.println("Unknown argument: '" + argv[i] + "'");
				printHelp();
				System.exit(0);
			}
		}

		if (opts.action == Action.NONE) {
			System.out.println("Either --solve or --generate must be specified.");
			printHelp();
			System.exit(1);
		}

		// If printing out CSV, print a header
		if (opts.printStyle == PrintStyle.CSV) {
			if (opts.printPuzzle) System.out.print("Puzzle,");
			if (opts.printSolution) System.out.print("Solution,");
			if (opts.printHistory) System.out.print("Solve History,");
			if (opts.printInstructions) System.out.print("Solve Instructions,");
			if (opts.countSolutions) System.out.print("Solution Count,");
			if (opts.timer) System.out.print("Time (milliseconds),");
			if (opts.printStats) System.out.print("Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty");
			System.out.println("");
		}

		// The number of puzzles solved or generated.
		final AtomicInteger puzzleCount = new AtomicInteger(0);
		final AtomicBoolean done = new AtomicBoolean(false);

		Thread[] threads = new Thread[opts.threads];
		for (int threadCount = 0; threadCount < threads.length; threadCount++) {
			threads[threadCount] = new Thread(
				new Runnable() {

					// Create a new puzzle board
					// and set the options
					private QQWing ss = createQQWing();

					private QQWing createQQWing() {
						QQWing ss = new QQWing();
						ss.setRecordHistory(opts.printHistory || opts.printInstructions || opts.printStats || opts.difficulty != Difficulty.UNKNOWN);
						ss.setLogHistory(opts.logHistory);
						ss.setPrintStyle(opts.printStyle);
						return ss;
					}

					@Override public void run() {
						try {

							// Solve puzzle or generate puzzles
							// until end of input for solving, or
							// until we have generated the specified number.
							while (!done.get()) {

								// record the start time for the timer.
								long puzzleStartTime = getMicroseconds();

								// iff something has been printed for this
								// particular puzzle
								StringBuilder output = new StringBuilder();

								// Record whether the puzzle was possible or
								// not,
								// so that we don't try to solve impossible
								// givens.
								boolean havePuzzle = false;

								if (opts.action == Action.GENERATE) {
									// Generate a puzzle
									havePuzzle = ss.generatePuzzleSymmetry(opts.symmetry);

									if (!havePuzzle && opts.printPuzzle) {
										output.append("Could not generate puzzle.");
										if (opts.printStyle == PrintStyle.CSV) {
											output.append(",").append(NL);
										} else {
											output.append(NL);
										}
									}
								} else {
									// Read the next puzzle on STDIN
									int[] puzzle = new int[QQWing.BOARD_SIZE];
									if (readPuzzleFromStdIn(puzzle)) {
										havePuzzle = ss.setPuzzle(puzzle);
										if (havePuzzle) {
											puzzleCount.getAndDecrement();
										} else {
											if (opts.printPuzzle) {
												output.append(ss.getPuzzleString());
											}
											if (opts.printSolution) {
												output.append("Puzzle is not possible.");
												if (opts.printStyle == PrintStyle.CSV) {
													output.append(",");
												} else {
													output.append(NL);
												}
											}
										}
									} else {
										// Set loop to terminate when nothing is
										// left on STDIN
										havePuzzle = false;
										done.set(true);
									}
									puzzle = null;
								}

								int solutions = 0;

								if (havePuzzle) {

									// Count the solutions if requested.
									// (Must be done before solving, as it would
									// mess up the stats.)
									if (opts.countSolutions) {
										solutions = ss.countSolutions();
									}

									// Solve the puzzle
									if (opts.printSolution || opts.printHistory || opts.printStats || opts.printInstructions || opts.difficulty != Difficulty.UNKNOWN) {
										ss.solve();
									}

									// Bail out if it didn't meet the difficulty
									// standards for generation
									if (opts.action == Action.GENERATE) {
										if (opts.difficulty != Difficulty.UNKNOWN && opts.difficulty != ss.getDifficulty()) {
											havePuzzle = false;
											// check if other threads have
											// finished the job
											if (puzzleCount.get() >= opts.numberToGenerate) done.set(true);
										} else {
											int numDone = puzzleCount.incrementAndGet();
											if (numDone >= opts.numberToGenerate) done.set(true);
											if (numDone > opts.numberToGenerate) havePuzzle = false;
										}
									}
								}

								// Check havePuzzle again, it may have changed
								// based on difficulty
								if (havePuzzle) {
									// With a puzzle now in hand and possibly
									// solved
									// print out the solution, stats, etc.
									// Record the end time for the timer.
									long puzzleDoneTime = getMicroseconds();

									// Print the puzzle itself.
									if (opts.printPuzzle) output.append(ss.getPuzzleString());

									// Print the solution if there is one
									if (opts.printSolution) {
										if (ss.isSolved()) {
											output.append(ss.getSolutionString());
										} else {
											output.append("Puzzle has no solution.");
											if (opts.printStyle == PrintStyle.CSV) {
												output.append(",");
											} else {
												output.append(NL);
											}
										}
									}

									// Print the steps taken to solve or attempt
									// to solve the puzzle.
									if (opts.printHistory) output.append(ss.getSolveHistoryString());
									// Print the instructions for solving the
									// puzzle
									if (opts.printInstructions) output.append(ss.getSolveInstructionsString());

									// Print the number of solutions to the
									// puzzle.
									if (opts.countSolutions) {
										if (opts.printStyle == PrintStyle.CSV) {
											output.append(solutions + ",");
										} else {
											if (solutions == 0) {
												output.append("There are no solutions to the puzzle.").append(NL);
											} else if (solutions == 1) {
												output.append("The solution to the puzzle is unique.").append(NL);
											} else {
												output.append("There are " + solutions + " solutions to the puzzle.").append(NL);
											}
										}
									}

									// Print out the time it took to solve the
									// puzzle.
									if (opts.timer) {
										double t = ((double) (puzzleDoneTime - puzzleStartTime)) / 1000.0;
										if (opts.printStyle == PrintStyle.CSV) {
											output.append(t + ",");
										} else {
											output.append("Time: " + t + " milliseconds").append(NL);
										}
									}

									// Print any stats we were able to gather
									// while solving the puzzle.
									if (opts.printStats) {
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
										if (opts.printStyle == PrintStyle.CSV) {
											output.append(givenCount).append(",").append(singleCount).append(",")
												.append(hiddenSingleCount).append(",").append(nakedPairCount)
												.append(",").append(hiddenPairCount).append(",")
												.append(pointingPairTripleCount).append(",").append(boxReductionCount)
												.append(",").append(guessCount).append(",").append(backtrackCount)
												.append(",").append(difficultyString).append(",");
										} else {
											output.append("Number of Givens: ").append(givenCount).append(NL);
											output.append("Number of Singles: ").append(singleCount).append(NL);
											output.append("Number of Hidden Singles: ").append(hiddenSingleCount).append(NL);
											output.append("Number of Naked Pairs: ").append(nakedPairCount).append(NL);
											output.append("Number of Hidden Pairs: ").append(hiddenPairCount).append(NL);
											output.append("Number of Pointing Pairs/Triples: ").append(pointingPairTripleCount).append(NL);
											output.append("Number of Box/Line Intersections: ").append(boxReductionCount).append(NL);
											output.append("Number of Guesses: ").append(guessCount).append(NL);
											output.append("Number of Backtracks: ").append(backtrackCount).append(NL);
											output.append("Difficulty: ").append(difficultyString).append(NL);
										}
									}
								}
								if (output.length() > 0) {
									if (opts.printStyle == PrintStyle.CSV) output.append(NL);
									System.out.print(output);
								}
							}
						} catch (Exception e) {
							e.printStackTrace(System.err);
							System.exit(1);
						}
					}

				}
				);
			threads[threadCount].start();
		}

		while (isAlive(threads)) {
			try {
				Thread.sleep(200);
			} catch (InterruptedException ix) {
				ix.printStackTrace(System.err);
				System.exit(1);
			}
		}

		long applicationDoneTime = getMicroseconds();
		// Print out the time it took to do everything
		if (opts.timer) {
			double t = ((double) (applicationDoneTime - applicationStartTime)) / 1000000.0;
			int count = opts.action == Action.GENERATE ? opts.numberToGenerate : puzzleCount.get();
			System.out.println(count + " puzzle" + ((count == 1) ? "" : "s") + " " + (opts.action == Action.GENERATE ? "generated" : "solved") + " in " + t + " seconds.");
		}
		System.exit(0);
	}

	private static boolean isAlive(Thread[] threads) {
		for (int i = 0; i < threads.length; i++) {
			if (threads[i].isAlive()) return true;
		}
		return false;
	}

	private static void printVersion() {
		System.out.println("qqwing " + QQWing.QQWING_VERSION);
	}


	private static class QQWingOptions {
		// defaults for options
		boolean printPuzzle = false;

		boolean printSolution = false;

		boolean printHistory = false;

		boolean printInstructions = false;

		boolean timer = false;

		boolean countSolutions = false;

		Action action = Action.NONE;

		boolean logHistory = false;

		PrintStyle printStyle = PrintStyle.READABLE;

		int numberToGenerate = 1;

		boolean printStats = false;

		Difficulty difficulty = Difficulty.UNKNOWN;

		Symmetry symmetry = Symmetry.NONE;

		int threads = Runtime.getRuntime().availableProcessors();
	}

	private static void printAbout() {
		System.out.println("qqwing - Sudoku solver and generator");
		System.out.println("Copyright (C) 2006-2014 Stephen Ostermiller http://ostermiller.org/");
		System.out.println("Copyright (C) 2007 Jacques Bensimon (jacques@ipm.com)");
		System.out.println("Copyright (C) 2007 Joel Yarde (joel.yarde - gmail.com)");
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
		System.out.println("You should have received a copy of the GNU General Public License along");
		System.out.println("with this program; if not, write to the Free Software Foundation, Inc.,");
		System.out.println("51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.");
	}

	private static void printHelp() {
		System.out.println("qqwing <options>");
		System.out.println("Sudoku solver and generator.");
		System.out.println("  --generate <num>     Generate new puzzles");
		System.out.println("  --solve              Solve all the puzzles from standard input");
		System.out.println("  --difficulty <diff>  Generate only simple, easy, intermediate, expert, or any");
		System.out.println("  --symmetry <sym>     Symmetry: none, rotate90, rotate180, mirror, flip, or random");
		System.out.println("  --puzzle             Print the puzzle (default when generating)");
		System.out.println("  --nopuzzle           Do not print the puzzle (default when solving)");
		System.out.println("  --solution           Print the solution (default when solving)");
		System.out.println("  --nosolution         Do not print the solution (default when generating)");
		System.out.println("  --stats              Print statistics about moves used to solve the puzzle");
		System.out.println("  --nostats            Do not print statistics (default)");
		System.out.println("  --timer              Print time to generate or solve each puzzle");
		System.out.println("  --notimer            Do not print solve or generation times (default)");
		System.out.println("  --threads            Number of processes (default available processors)");
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
		System.out.println("  --csv                Output CSV format with one line puzzles");
		System.out.println("  --help               Print this message");
		System.out.println("  --about              Author and license information");
		System.out.println("  --version            Display current version number");
	}

	/**
	 * Read a sudoku puzzle from standard input. STDIN is processed one
	 * character at a time until the sudoku is filled in. Any digit or period is
	 * used to fill the sudoku, any other character is ignored.
	 */
	private static boolean readPuzzleFromStdIn(int[] puzzle) throws IOException {
		synchronized (System.in) {
			int read = 0;
			while (read < QQWing.BOARD_SIZE) {
				int c = System.in.read();
				if (c < 0) return false;
				if (c >= '1' && c <= '9') {
					puzzle[read] = c - '0';
					read++;
				}
				if (c == '.' || c == '0') {
					puzzle[read] = 0;
					read++;
				}
			}
			return true;
		}
	}

	/**
	 * Get the current time in microseconds.
	 */
	private static long getMicroseconds() {
		return new Date().getTime() * 1000;
	}

}
