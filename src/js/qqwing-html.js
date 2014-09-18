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
function getMicroseconds(){
	return new Date().getTime() * 1000;
}

var workingButton = null;
var workingImg = null;
var puzzleStartTime;

function generateNum(dat, num){
	if (!workingButton) return;
	if (num > 0){
		dat.qqwing.setRecordHistory(dat.printHistory || dat.printInstructions || dat.printStats || dat.difficulty!=qqwing.Difficulty.UNKNOWN);
		dat.qqwing.setPrintStyle(dat.printStyle);
		dat.qqwing.generatePuzzleSymmetry(dat.symmetry);
		if (dat.printSolution || dat.printHistory || dat.printStats || dat.printInstructions || dat.difficulty!=qqwing.Difficulty.UNKNOWN) dat.qqwing.solve();
		if (dat.difficulty==qqwing.Difficulty.UNKNOWN || dat.difficulty==dat.qqwing.getDifficulty()){
			dat.doneCount++;
			var output = dat.qqwing.getPuzzleString();
			if (dat.printSolution) output += dat.qqwing.getSolutionString();
			if (dat.printHistory) output += dat.qqwing.getSolveHistoryString();
			if (dat.printInstructions) output += dat.qqwing.getSolveInstructionsString();
			var puzzleDoneTime = getMicroseconds();
			if (dat.timer){
				var t = (puzzleDoneTime - puzzleStartTime)/1000.0;
				if (dat.printStyle == qqwing.PrintStyle.CSV){
					output += t+",";
				} else {
					output += "Time: "+t +" milliseconds\n";
				}
				puzzleStartTime = puzzleDoneTime;
			}
			if (dat.printStats) output += stats(dat);
			output += "\n";
			addOutput(output);
			num--;
		}
		setTimeout(function(){generateNum(dat,num)}, 0);
	} else {
		var applicationDoneTime = getMicroseconds();
		if (dat.timer){
			var t = (applicationDoneTime - dat.applicationStartTime)/1000000.0;
			addOutput(dat.doneCount+" puzzle"+((dat.doneCount==1)?"":"s")+" generated in "+t+" seconds.");
		}
		clearWorking('Generate');
	}
}

function clearWorking(s){
	setError('');
	if(workingButton && s) {
		workingButton.value=s;
		workingButton = null;
	}
	if (workingImg) workingImg.parentElement.removeChild(workingImg);
	workingImg = null;
	el('downloadavailable').style.display='block';
}

function el(elementid){
	return document.getElementById(elementid);
}

function startWork(button){
	el('output').innerHTML = "";
	if (button) {
		button.value = 'Stop';
		workingButton = button;
	}
	workingImg = document.createElement("img");
	workingImg.src = "loading.gif";
	el('working').appendChild(workingImg);
}

function setError(s){
	var err = el('error');
	if (err) err.innerHTML = s;
}

function addOutput(s){
	el('output').appendChild(document.createTextNode(s));
}

function getOptData(form){
	return {
		printSolution: form.printsolution && form.printsolution.checked,
		printPuzzle: form.printpuzzle && form.printpuzzle.checked,
		printHistory: form.printhistory.checked,
		printInstructions: form.printinstructions.checked,
		timer: form.timer.checked,
		countSolutions: form.countsolutions && form.countsolutions.checked,
		printStyle: parseInt(form.outputselect.value),
		printStats: form.printstats.checked,
		difficulty: form.difficultyselect?parseInt(form.difficultyselect.value):0,
		symmetry: form.symmetryselect?parseInt(form.symmetryselect.value):0,
		applicationStartTime: getMicroseconds(),
		qqwing: new qqwing(),
		doneCount: 0
	};
}

function csvHeader(dat, puzzle, solution){
	var h = "";
	if (puzzle) h += "Puzzle,";
	if (solution) h += "Solution,";
	if (dat.printHistory) h +="Solve History,";
	if (dat.printInstructions) h +="Solve Instructions,";
	if (dat.timer) h +="Time (milliseconds),";
	if (dat.printStats) h +="Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty";
	h += "\n";
	return h;
}

function stats(dat){
	var s = "";
	var givenCount = dat.qqwing.getGivenCount();
	var singleCount = dat.qqwing.getSingleCount();
	var hiddenSingleCount = dat.qqwing.getHiddenSingleCount();
	var nakedPairCount = dat.qqwing.getNakedPairCount();
	var hiddenPairCount = dat.qqwing.getHiddenPairCount();
	var pointingPairTripleCount = dat.qqwing.getPointingPairTripleCount();
	var boxReductionCount = dat.qqwing.getBoxLineReductionCount();
	var guessCount = dat.qqwing.getGuessCount();
	var backtrackCount = dat.qqwing.getBacktrackCount();
	var difficultyString = dat.qqwing.getDifficultyAsString();
	if (dat.printStyle == qqwing.PrintStyle.CSV){
		s+=givenCount+"," +singleCount+","+hiddenSingleCount
				+","+nakedPairCount+","+hiddenPairCount
				+"," +pointingPairTripleCount +"," +boxReductionCount
				+","+guessCount+","+backtrackCount
				+","+difficultyString+",";
	} else {
		s+="Number of Givens: "+givenCount+"\n";
		s+="Number of Singles: "+singleCount+"\n";
		s+="Number of Hidden Singles: "+hiddenSingleCount +"\n";
		s+="Number of Naked Pairs: "+nakedPairCount +"\n";
		s+="Number of Hidden Pairs: "+hiddenPairCount +"\n";
		s+="Number of Pointing Pairs/Triples: "+pointingPairTripleCount +"\n";
		s+="Number of Box/Line Intersections: "+boxReductionCount +"\n";
		s+="Number of Guesses: "+guessCount +"\n";
		s+="Number of Backtracks: "+backtrackCount +"\n";
		s+="Difficulty: "+difficultyString +"\n";
	}
	return s;
}

function generate(form){
	clearWorking();
	if (workingButton){
		clearWorking('Generate');
	} else {
		startWork(form.generatebutton);
		var dat = getOptData(form);
		if (dat.printStyle == qqwing.PrintStyle.CSV) addOutput(csvHeader(dat, true, dat.printSolution));
		puzzleStartTime = getMicroseconds();
		generateNum(dat, form.generatenumber.value);
	}
}

function solve(form){
	clearWorking();
	if (workingButton){
		clearWorking('Solve');
	} else {
		var dat = getOptData(form);
		var puzzles = getPuzzles(form.tosolve.value);
		if (!puzzles.length) return setError("No puzzles were found.  Puzzles must be 81 numbers with zeros or periods for the unknowns.   For example: <pre>.47..2....18.5.7.4..59...2...............9..2....713.9.72....3...1......5.38.....</pre>");
		startWork(form.solvebutton);
		if (dat.printStyle == qqwing.PrintStyle.CSV) addOutput(csvHeader(dat, dat.printPuzzle, true));
		solveNum(dat, puzzles);
	}
}


function solveNum(dat, puzzles){
	if (!workingButton) return;
	if (dat.doneCount<puzzles.length){
		puzzleStartTime = getMicroseconds();
		dat.qqwing.setRecordHistory(dat.printHistory || dat.printInstructions || dat.printStats || dat.difficulty!=qqwing.Difficulty.UNKNOWN);
		dat.qqwing.setPrintStyle(dat.printStyle);
		dat.qqwing.setPuzzle(puzzles[dat.doneCount]);
		dat.qqwing.solve();
		var output = "";
		if (dat.printPuzzle) output += dat.qqwing.getPuzzleString();
		if (!dat.qqwing.isSolved()){
			output += "Puzzle has no solution.";
			output += printStyle==qqwing.PrintStyle.CSV?",":"\n";
		} else {
			output += dat.qqwing.getSolutionString();
			if (dat.printHistory) output += dat.qqwing.getSolveHistoryString();
			if (dat.printInstructions) output += dat.qqwing.getSolveInstructionsString();
			if (dat.countSolutions){
				var solutions = dat.qqwing.countSolutions();
				if (dat.printStyle == qqwing.PrintStyle.CSV){
					output+= solutions+",";
				} else if (solutions == 1){
					output += "solution to the puzzle is unique.\n";
				} else {
					output += "There are "+solutions+" solutions to the puzzle.\n";
				}
			}
			var puzzleDoneTime = getMicroseconds();
			if (dat.timer){
				var t = (puzzleDoneTime - puzzleStartTime)/1000.0;
				if (dat.printStyle == qqwing.PrintStyle.CSV){
					output += t+",";
				} else {
					output += "Time: "+t +" milliseconds\n";
				}
			}
			if (dat.printStats) output += stats(dat);
			output += "\n";
		}
		addOutput(output);
		dat.doneCount++;
		setTimeout(function(){solveNum(dat,puzzles)}, 0);
	} else {
		var applicationDoneTime = getMicroseconds();
		if (dat.timer){
			var t = (applicationDoneTime - dat.applicationStartTime)/1000000.0;
			addOutput(dat.doneCount+" puzzle"+((dat.doneCount==1)?"":"s")+" in "+t+" seconds.");
		}
		clearWorking('Solve');
	}
}

function getPuzzles(s){
	var ps = [];
	var p = [];
	for (var i=0; i<s.length; i++){
		var c = s.charAt(i);
		if (c[0] >= '1' && c[0] <='9') p.push(c-'0');
		if (c[0] == '.' || c[0] == '0') p.push(0);
		if (p.length == qqwing.BOARD_SIZE){
			ps.push(p);
			p = [];
		}
	}
	return ps;

}
