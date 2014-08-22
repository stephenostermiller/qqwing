
function getMicroseconds(){
	return new Date().getTime() * 1000;
}

function generate(form){
	try {
		var dat = getOptData(form);
		var output = "";
		var numberGenerated=0;

		if (dat.printStyle == qqwing.PrintStyle.CSV) output+=csvHeader(dat, true, dat.printSolution);

		while(numberGenerated<form.generatenumber.value){
			var puzzleStartTime = getMicroseconds();
			dat.qqwing.setRecordHistory(dat.printHistory || dat.printInstructions || dat.printStats || dat.difficulty!=qqwing.Difficulty.UNKNOWN);
			dat.qqwing.setPrintStyle(dat.printStyle);
			dat.qqwing.generatePuzzleSymmetry(dat.symmetry);
			if (dat.printSolution || dat.printHistory || dat.printStats || dat.printInstructions || dat.difficulty!=qqwing.Difficulty.UNKNOWN) dat.qqwing.solve();
			if (dat.difficulty==qqwing.Difficulty.UNKNOWN || dat.difficulty==dat.qqwing.getDifficulty()){
				numberGenerated++;
				output += dat.qqwing.getPuzzleString();
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
				}
				if (dat.printStats) output += stats(dat);
				if (dat.printStyle==qqwing.PrintStyle.CSV) output += "\n";
			}
		}
		var applicationDoneTime = getMicroseconds();
		if (dat.timer){
			var t = (applicationDoneTime - dat.applicationStartTime)/1000000.0;
			output += numberGenerated+" puzzle"+((numberGenerated==1)?"":"s")+" generated in "+t+" seconds.";
		}
		document.getElementById('output').innerHTML = output;
	} catch (e){
		console.log(e);
		console.log(e.stack);
	}
}

function getOptData(form){
	return {
		printSolution: form.printsolution.checked,
		printPuzzle: form.printpuzzle.checked,
		printHistory: form.printhistory.checked,
		printInstructions: form.printinstructions.checked,
		timer: form.timer.checked,
		countSolutions: form.countsolutions.checked,
		printStyle: parseInt(form.outputselect.value),
		printStats: form.printstats.checked,
		difficulty: parseInt(form.difficultyselect.value),
		symmetry: parseInt(form.symmetryselect.value),
		applicationStartTime: getMicroseconds(),
		qqwing: new qqwing()

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

function solve(form){
	try {
		var dat = getOptData(form);
		var output = "";
		var numberSolved=0;
		if (dat.printStyle == qqwing.PrintStyle.CSV)  output+=csvHeader(dat, dat.printPuzzle, true);
		var puzzles = getPuzzles(form.tosolve.value);

		for(;numberSolved<puzzles.length;numberSolved++){
			var puzzleStartTime = getMicroseconds();
			dat.qqwing.setRecordHistory(dat.printHistory || dat.printInstructions || dat.printStats || dat.difficulty!=qqwing.Difficulty.UNKNOWN);
			dat.qqwing.setPrintStyle(dat.printStyle);
			dat.qqwing.setPuzzle(puzzles[numberSolved]);
			dat.qqwing.solve();
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
				if (dat.printStyle==qqwing.PrintStyle.CSV) output += "\n";
			}
		}
		var applicationDoneTime = getMicroseconds();
		if (dat.timer){
			var t = (applicationDoneTime - dat.applicationStartTime)/1000000.0;
			output += numberSolved+" puzzle"+((numberSolved==1)?"":"s")+" in "+t+" seconds.";
		}
		document.getElementById('output').innerHTML = output;
	} catch (e){
		console.log(e);
		console.log(e.stack);
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
