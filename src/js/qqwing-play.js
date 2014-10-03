/*
 * qqwing - Sudoku solver and generator
 * Copyright (C) 2005-2014 Stephen Ostermiller
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
var board = new Array(qqwing.BOARD_SIZE);
var boardcolors = new Array(qqwing.BOARD_SIZE);
var possibilities = new Array(qqwing.POSSIBILITY_SIZE);
var startTime = 0;
var gameType = "blank";
var usedHint = false;
var stats = new Array();
var qq = new qqwing();
var hintPosition = -1;
var hintArray;
var links = {};

function stringToStats(statString){
	stats = new Array();
	var statList = statString.split("|");
	for (var i=0; i<statList.length; i++){
		var sp = statList[i].split(",");
		if (sp.length > 4){
			stats[sp[0]] = new Stat(sp[0],sp[1],sp[2],sp[3],sp[4],sp.length>5?sp[5]:0);
		}
	}
}

function init(){
	initStats();
	if (!newUrlGame()) showScreen('title');
}
window.onload = init;

function initStats(){
	var c = getCookie("sudokuStats");
	var ar = c.split("||");
	if (ar.length > 0){
		stringToStats(ar[0]);
	}
	fillDifficultySelect();
	if (ar.length > 1){
		var nv = ar[1].split("&");
		for(var i=0; i<nv.length; i++){
			var nvp = nv[i].split("=");
			if (nvp.length==2){
				if (nvp[0]=='diff'){
					setDifficulty(nvp[1]);
				}
			}
		}
	}
	drawStats();
}

var difficultyLevels = new Array("simple","easy","intermediate","expert","random");

function drawStats(){
	var statsDiv = el("stats");
	var advMsg = "";
	var s = "<table>"
	for (var i=0; i<difficultyLevels.length-1; i++){
		var d = difficultyLevels[i];
		var stat = getStat(d);
		var n = getDiffName(d);
		s+="<tr><th>"+n+"</th><td>"+(stat.besttime?"Best: "+toPrettyTime(stat.besttime)+"<br>":"")+"Solved: "+stat.wincount;
		if (stat.wincount == 0 && d != "expert"){
			s += "<br>You must solve "+d+" puzzles without asking for hints to advance and play more difficult games."
			i=9;
		}
		s+="</td></tr>";
	}
	s+="</table>"
	statsDiv.innerHTML = s;
}

function haveStats(){
	for (var i=0; i<difficultyLevels.length; i++){
		var d = difficultyLevels[i];
		if (stats[d] != null  && stats[d].time) return true;
	}
	return false;
}

function fillDifficultySelect(){
	var count = 0;
	var done = false;
	for (var i=0; i<difficultyLevels.length && !done; i++){
		var d = difficultyLevels[i];
		addDifficultyToSelect(d);
		count++;
		if (stats[d] == null || stats[d].wincount == 0) done=true;
	}
	el('difficultyoption').style.display=count>1?'block':'none';
}

function getDiffName(d){
	return d.substring(0,1).toUpperCase()+d.substring(1,d.length);
}

function addDifficultyToSelect(d){
	var s = document.gameform.difficultyselect;
	var o = s.options;
	var i;
	for (i=0; i<o.length; i++){
		if (o[i].value == d) return;
	}
	o[i] = new Option(getDiffName(d),d);
	s.selectedIndex=i;
}

function setDifficulty(d){
	var s = document.gameform.difficultyselect;
	var o = s.options;
	var i;
	for (i=0; i<o.length; i++){
		if (o[i].value == d) s.selectedIndex=i;
	}
}

function getCookie(name) {
	var prefix = name + "=";
	var begin = document.cookie.indexOf("; " + prefix);
	if (begin == -1) {
		begin = document.cookie.indexOf(prefix);
		if (begin != 0) return "";
	} else begin += 2;
	var end = document.cookie.indexOf(";", begin);
	if (end == -1) end = document.cookie.length;
	return unescape(document.cookie.substring(begin + prefix.length, end));
}

function statsToString(){
	var s = "";
	for (var i in stats) {
		if(s!="") s+="|";
		s+=stats[i].type+","+stats[i].wincount+","+stats[i].time+","+stats[i].winwithhintcount+","+stats[i].gaveupcount+","+stats[i].besttime;
	}
	return s;
}

function Stat(type,wincount,time,winwithhintcount,gaveupcount,besttime){
	this.type=type;
	this.wincount=ensureNum(wincount);
	this.time=ensureNum(time);
	this.winwithhintcount=ensureNum(winwithhintcount);
	this.gaveupcount=ensureNum(gaveupcount);
	this.besttime=ensureNum(besttime);
}

function ensureNum(n){
	if (""+n == "NaN") return 0;
	if (typeof n == 'string') n = parseInt(n);
	return n;
}

function draw(){
	drawStats();
	determineSquareSize();
	el("game").innerHTML=getFullHtml();
}

function clickValue(event, cell, value){
	clearHint();
	if ((event.ctrlKey || event.altKey || event.shiftKey) && !isOnlyPossibilityInCell(cell)){
		removePossibility(cell,value);
	} else {
		mark(cell,value,getColor());
	}
	setLink('Everything filled in');
	draw();
	detectComplete();
}

function clickset(cell){
	clearHint();
	unmark(cell);
	setLink('Everything filled in');
	draw();
}

function removePossibility(cell, value){
	possibilities[getPossibilityIndex(cell,value-1)] = 1;
}

function checkPossibility(cell, value){
	var allowed = true;
	var row = cellToRow(cell);
	var column = cellToColumn(cell);
	var section = cellToSection(cell);
	var workingCell;

	for (var rowIndex=0; rowIndex<9; rowIndex++){
		workingCell = rowColumnToCell(rowIndex, column);
		if (board[workingCell] == value) allowed = false;
	}

	for (var columnIndex=0; columnIndex<9; columnIndex++){
		workingCell = rowColumnToCell(row, columnIndex);
		if (board[workingCell] == value) allowed = false;
	}

	for (var offset=0; offset<9; offset++){
		workingCell = sectionToCell(section, offset);
		if (board[workingCell] == value) allowed = false;
	}

	possibilities[getPossibilityIndex(cell,value-1)] = allowed?0:1;
}

function unmark(cell){
	var value = board[cell];
	board[cell] = 0;
	boardcolors[cell] = 0;
	var possibilityIndex;
	var workingCell;

	for (var valueIndex = 0; valueIndex<9; valueIndex++){
		checkPossibility(cell, valueIndex+1);
	}

	var row = cellToRow(cell);
	var column = cellToColumn(cell);
	var section = cellToSection(cell);

	for (var rowIndex=0; rowIndex<9; rowIndex++){
		workingCell = rowColumnToCell(rowIndex, column);
		checkPossibility(workingCell,value);
	}

	for (var columnIndex=0; columnIndex<9; columnIndex++){
		workingCell = rowColumnToCell(row, columnIndex);
		checkPossibility(workingCell,value);
	}

	for (var offset=0; offset<9; offset++){
		workingCell = sectionToCell(section, offset);
		checkPossibility(workingCell,value);
	}
}

function mark(cell, value, color){
	board[cell] = value;
	boardcolors[cell] = color;
	var possibilityIndex;
	var workingCell;


	for (var valueIndex = 0; valueIndex<9; valueIndex++){
		possibilityIndex = getPossibilityIndex(cell,valueIndex);
		if (possibilities[possibilityIndex] == 0){
			possibilities[possibilityIndex] = 1;
		}
	}

	var row = cellToRow(cell);
	var column = cellToColumn(cell);
	var section = cellToSection(cell);

	for (var rowIndex=0; rowIndex<9; rowIndex++){
		workingCell = rowColumnToCell(rowIndex, column);
		possibilityIndex = getPossibilityIndex(workingCell,value-1);
		if (possibilities[possibilityIndex] == 0){
			possibilities[possibilityIndex] = 1;
		}
	}

	for (var columnIndex=0; columnIndex<9; columnIndex++){
		workingCell = rowColumnToCell(row, columnIndex);
		possibilityIndex = getPossibilityIndex(workingCell,value-1);
		if (possibilities[possibilityIndex] == 0){
			possibilities[possibilityIndex] = 1;
		}
	}

	for (var offset=0; offset<9; offset++){
		workingCell = sectionToCell(section, offset);
		possibilityIndex = getPossibilityIndex(workingCell,value-1);
		if (possibilities[possibilityIndex] == 0){
			possibilities[possibilityIndex] = 1;
		}
	}
}

function isOnlyPossibilityInCell(cell){
	var count = 0;
	for (var valueIndex = 0; valueIndex<9; valueIndex++){
		if (possibilities[getPossibilityIndex(cell,valueIndex)]==0) count++;
	}
	return count==1;
}

function detectComplete(){
	var complete = true;
	for (var cell=0; cell<qqwing.BOARD_SIZE; cell++){
		if (board[cell] == 0) complete = false;
	}
	if (complete && gameType!="complete"){
		var gamet = getGameTime();
		var msg = getDiffName(gameType) + " Sudoku solved in " + toPrettyTime(gamet);
		var s = getStat(gameType);
		if (!usedHint){
			s.wincount++;
			s.time+=gamet;
			if (!s.besttime || gamet < s.besttime){
				s.besttime=gamet;
				msg += "; your best time!";
			}
		} else {
			msg += " although you needed a hint."
			s.winwithhintcount++;
		}
		el('endgamemessage').innerHTML = msg;
		saveStats();
		gameType = "complete";
		usedHint = false;
		pauseTime = 0;
		startTime = new Date().getTime();
		fillDifficultySelect();
		showScreen('over');
		draw();
	}
}

function getStat(name){
	var s = stats[name];
	if (s == null){
		s = new Stat(name,0,0,0,0);
		stats[name] = s;
	}
	return s;
}

function getDifficulty(){
	return document.gameform.difficultyselect[document.gameform.difficultyselect.selectedIndex].value;
}

function getSymmetry(){
	return parseInt(document.gameform.symmetryselect[document.gameform.symmetryselect.selectedIndex].value);
}

function saveStats(){
	var expires = new Date();
	// cookie expires in one year
	expires.setTime(expires.getTime() + 365 * 24 * 60 * 60 * 1000);
	document.cookie = (
		'sudokuStats' + '=' +
		escape(statsToString() + "||diff=" + getDifficulty()) +
		'; expires=' + expires.toGMTString()
	);
}

function getGameTime(){
	return ((new Date()).getTime() - startTime - pauseTime);
}

function toPrettyTime(ms){
	var hours = Math.floor(ms / 3600000);
	ms = ms % 3600000;
	var minutes = Math.floor(ms / 60000);
	ms = ms % 60000;
	var seconds = Math.floor(ms / 1000);
	ms = ms % 1000;
	if (hours > 0){
		return hours + " hour"+((hours!=1)?"s":"")+", "+ minutes + " minute"+((minutes!=1)?"s":"");
	} else if (minutes > 0){
		return minutes + " minute"+((minutes!=1)?"s":"")+", "+ seconds + " second"+((seconds!=1)?"s":"");
	} else {
		return seconds + " second"+((seconds!=1)?"s":"");
	}
}

function getFullHtml(){
	var s="<table>";
	for (var section=0; section<9; section++){
		if (section%3==0) s+="<tr>";
		s+="<td class=sudokusection>";
		s+=getSectionHtml(section);
		s+=("</td>");
		if (section%3==2) s+="</tr>";
	}
	s+="</table>";
	return s;
}

var squareSize=0;
var smallSquareFontSize;
var largeSquareFontSize;
function determineSquareSize(){
	var h = getWindowHeight();
	var z = 100000;
	var g = el("testcell");
	var f = 100;
	var lastz = 0;
	while (z > h && z != lastz){
		lastz = z;
		smallSquareFontSize="font-size:"+f+"%;";
		largeSquareFontSize="font-size:"+(3*f)+"%;";
		var s = "";
		s+="<table>";
		for (var valueIndex=0; valueIndex<9; valueIndex++){
			if (valueIndex%3==0) s+="<tr>";
			s+="<td style='font-family:monospace;"+smallSquareFontSize+"'>5</td>";
			if (valueIndex%3==2) s+="</tr>";
		}
		s+="</table>";
		g.innerHTML=s;
		squareSize = g.offsetHeight+4; // include 4 for padding (1 top, 1 bottom), and border  (1 top, 1 bottom)
		g.innerHTML="";
		z = squareSize * 10;
		f *= .9;
	}
}

function getWindowHeight(){
	var myWidth = 0, myHeight = 0;
	if( typeof( window.innerWidth ) == 'number' ) {
		return window.innerHeight;
	} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
		return document.documentElement.clientHeight;
	} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
		return document.body.clientHeight;
	}
	return 800;
}

function getSectionHtml(section){
	var s="<table class=unselectable unselectable=on>";
	for (var offset=0; offset<9; offset++){
		if (offset%3==0) s+="<tr>";
		var cell = sectionToCell(section, offset);
		var hintclass = (cell==hintPosition)?" hintcell":"";
		s+="<td style='width:"+squareSize+"px;height:"+squareSize+"px;' align=center class='cell unselectable"+hintclass+"' unselectable=on>";
		s+=getCellHtml(cell);
		s+="</td>";
		if (offset%3==2) s+="</tr>";
	}
	s+="</table>";
	return s;
}

function getCellHtml(cell){
	var s = "";
	if (board[cell] == 0){
		var possleft = 0;
		var click = "";
		var s1="<table class=unselectable unselectable=on>";
		for (var valueIndex=0; valueIndex<9; valueIndex++){
			if (valueIndex%3==0) s1+="<tr class=unselectable unselectable=on>";
			var value=valueIndex+1;
			var possibilityIndex = getPossibilityIndex(cell,valueIndex);
			if (possibilities[possibilityIndex]==0){
				click = "onmouseup='clickValue(event,"+cell+","+value+");'";
				s1+="<td "+click+" style='font-family:monospace;cursor:pointer;cursor:hand;"+smallSquareFontSize+"' class=unselectable unselectable=on>";
				s1+=value;
				s1+="</td>";
				possleft++;
			} else {
				s1+="<td style='font-family:monospace;"+smallSquareFontSize+"' class=unselectable unselectable=on>&nbsp;</td>";
			}
			if (valueIndex%3==2) s1+="</tr>";
		}
		s1+="</table>";
		if (possleft > 1){
			s+=s1;
		} else if (possleft == 1){
			s+="<div style='cursor:pointer;cursor:hand' "+click+" class=unselectable unselectable=on>";
			s+=s1;
			s+="</div>";
		} else {
			s+= "<div style='"+largeSquareFontSize+"font-weight:bold;background-color:red;color:orange' class=unselectable unselectable=on>X</div>";
		}
	} else if (boardcolors[cell]){
		s+= "<div style='"+largeSquareFontSize+"font-weight:bold;cursor:pointer;cursor:hand;color:"+boardcolors[cell]+";' onmouseup='clickset("+cell+")' class=unselectable unselectable=on>"+board[cell]+"</div>";
	} else {
		s+= "<div style='"+largeSquareFontSize+"font-weight:bold;' class='unselectable given' unselectable=on>"+board[cell]+"</div>";
	}
	return s;

}

function sectionToFirstCell(section){
	return ((section%3)*3)
			+ (Math.floor(section/3)*3*9);
}

function sectionToCell(section, offset){
	return sectionToFirstCell(section)
			+ (Math.floor(offset/3)*9)
			+ (offset%3);
}

function getColor(){
	var r = document.gameform.color;
	for (var i=0; i<r.length; i++){
		if (r[i].checked){
			return r[i].value;
		}
	}
	return "black";
}

function setColor(c){
	var r = document.gameform.color;
	for (var i=0; i<r.length; i++){
		if (r[i].value == c){
			r[i].checked = true;
		}
	}
}

function cellToColumn(cell){
	return cell%9;
}

function cellToRow(cell){
	return Math.floor(cell/9);
}

function cellToSection(cell){
	return (Math.floor(cell/27)*3)
			+ Math.floor(cellToColumn(cell)/3);
}

function getPossibilityIndex(cell, valueIndex){
	return valueIndex+(9*cell);
}

function rowColumnToCell(row, column){
	return (row*9)+column;
}

var generateNewGame = function(){
	qq.generatePuzzleSymmetry(getSymmetry());
	qq.setRecordHistory(true);
	qq.solve();
	var diff = qq.getDifficultyAsString().toLowerCase();
	if ("random" != getDifficulty() && diff != getDifficulty()){
		setTimeout(generateNewGame, 0);
	} else {
		newGame(diff,qq.getPuzzleString());
		el('newgamemessage').innerHTML="";
	}
}

function newQQwingGame(){
	showScreen('loading');
	var workingImg = document.createElement("img");
	workingImg.src = "loading.gif";
	var msg = el('newgamemessage');
	msg.innerHTML="Loading new game ";
	msg.appendChild(workingImg);
	setTimeout(generateNewGame, 0);
}


function clearHint(){
	hintArray = null;
	hintPosition = -1;
	document.gameform.hintButton.disabled=false;
	document.gameform.hintButton.value='Hint';
	setHint("");
}

function hint(){
	usedHint = true;
	var hint = "";
	hintPosition = -1;
	if (!hintArray){
		qq.setPuzzle(board);
		qq.setRecordHistory(true);
		qq.solve();
		var instructions = qq.getSolveHistory();
		if (typeof instructions == 'string'){
			hint = instructions;
		} else {
			hintArray = instructions;
		}
	}
	while (!hint && hintArray && hintArray.length){
		var next = hintArray.shift();
		if (!haveUsedHint(next)){
			hint = next.getDescription();
			if (next.getValue() > 0) hint += " - " + next.getValue();
			hintPosition = next.getPosition();
		}
	}
	if (!hintArray || !hintArray.length) {
		document.gameform.hintButton.disabled=true;
	} else if (hint) {
		document.gameform.hintButton.value="More hints";
	}
	setHint(hint);
	draw();
}

function haveUsedHint(hint){
	switch(hint.getType()){
		case qqwing.LogType.GIVEN:
			return true;
		case qqwing.LogType.NAKED_PAIR_ROW:
			var row = cellToRow(hint.getPosition());
			var cellposs = [];
			for (var valueIndex = 0; valueIndex<9; valueIndex++){
				cellposs[valueIndex] = possibilities[getPossibilityIndex(hint.getPosition(),valueIndex)];
			}
			for (var columnIndex=0; columnIndex<9; columnIndex++){
				workingCell = rowColumnToCell(row, columnIndex);
				var isPartOfPair = true;
				var hasPairPoss = false;
				for (var valueIndex = 0; !board[workingCell] && valueIndex<9; valueIndex++){
					var poss=possibilities[getPossibilityIndex(workingCell,valueIndex)];
					if (cellposs[valueIndex] != poss) isPartOfPair = false;
					if (!cellposs[valueIndex] && !poss) hasPairPoss = true;
				}
				if (!isPartOfPair && hasPairPoss) return false;
			}
			return true;
		case qqwing.LogType.NAKED_PAIR_COLUMN:
			var col = cellToColumn(hint.getPosition());
			var cellposs = [];
			for (var valueIndex = 0; valueIndex<9; valueIndex++){
				cellposs[valueIndex] = possibilities[getPossibilityIndex(hint.getPosition(),valueIndex)];
			}
			for (var rowIndex=0; rowIndex<9; rowIndex++){
				workingCell = rowColumnToCell(rowIndex, col);
				var isPartOfPair = true;
				var hasPairPoss = false;
				for (var valueIndex = 0; !board[workingCell] && valueIndex<9; valueIndex++){
					var poss=possibilities[getPossibilityIndex(workingCell,valueIndex)];
					if (cellposs[valueIndex] != poss) isPartOfPair = false;
					if (!cellposs[valueIndex] && !poss) hasPairPoss = true;
				}
				if (!isPartOfPair && hasPairPoss) return false;
			}
			return true;
		case qqwing.LogType.NAKED_PAIR_SECTION:
			var section = cellToSection(hint.getPosition());
			var cellposs = [];
			for (var valueIndex = 0; valueIndex<9; valueIndex++){
				cellposs[valueIndex] = possibilities[getPossibilityIndex(hint.getPosition(),valueIndex)];
			}
			for (var sectionOffset=0; sectionOffset<9; sectionOffset++){
				workingCell = sectionToCell(section, sectionOffset);
				var isPartOfPair = true;
				var hasPairPoss = false;
				for (var valueIndex = 0; !board[workingCell] && valueIndex<9; valueIndex++){
					var poss=possibilities[getPossibilityIndex(workingCell,valueIndex)];
					if (cellposs[valueIndex] != poss) isPartOfPair = false;
					if (!cellposs[valueIndex] && !poss) hasPairPoss = true;
				}
				if (!isPartOfPair && hasPairPoss) return false;
			}
			return true;
		default:
			return false;
	}
}

function setHint(s){
	var hintdiv = el('hint');
	hintdiv.innerHTML = s;
	hintdiv.style.display=s?'block':'none';
}

function clearBoard(){
	recordgaveup();
	clearHint();
	for (var boardindex=0; boardindex<qqwing.BOARD_SIZE; boardindex++) board[boardindex]=0;
	for (var boardcolorsindex=0; boardcolorsindex<qqwing.BOARD_SIZE; boardcolorsindex++) boardcolors[boardcolorsindex]=0;
	for (var possibilitiesindex=0; possibilitiesindex<qqwing.POSSIBILITY_SIZE; possibilitiesindex++) possibilities[possibilitiesindex]=0;
	setLink();
	usedHint = false;
	pauseTime = 0;
	startTime = new Date().getTime();
}

function clearColor(color){
	clearHint();
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (board[i] != 0 && boardcolors[i] == color){
			unmark(i);
		}
	}
	draw();
}

function newGame(type, s){
	clearBoard();
	gameType=type;
	showScreen('game');
	var count = 0;
	for (var ca=0; ca<s.length; ca++){
		var c = s.charAt(ca);
		if ((c == '.' || (c >= '0' && c <= '9')) && count < qqwing.BOARD_SIZE){
			if (c >= '1' && c <= '9') mark(count,c-'0',null);
			count++;
		}
	}
	setLink("Link to this game");
	draw();
}

function setLink(type){
	if (type){
		links[type] = getGameUrl();
	} else {
		links={};
	}
	var s = getLinkHtml('Link to this game') + getLinkHtml('Everything filled in');
	el('gamelinks').innerHTML = s;
	el('ingamelinks').innerHTML = s;

}
function getLinkHtml(type){
	if (!links[type]) return "";
	var id = type.replace(/ /g,"");
	return '<div><a href="'+ links[type] +'">' + type + '</a>:</div><div onclick="select(this);" class=textlink>' + links[type] + '</div>';
}

function select(node) {
	var range;
	if (document.selection) {
		range = document.body.createTextRange();
		range.moveToElementText(node);
		range.select();
	} else if (window.getSelection) {
		range = document.createRange();
		range.selectNodeContents(node);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(range);
	}
}


function getGameUrl(){
	var url = document.location.href;
	if (url.indexOf('?') != -1){
		url = url.substring(0,url.indexOf('?'));
	}
	return url+"?game="+gameToString();
}

function gameToString(){
	var s = "";
	for (var i=0; i<qqwing.BOARD_SIZE; i++){
		if (board[i] == 0){
			s += '.';
		} else {
			s += board[i];
		}
	}
	return s;
}

function recordgaveup(){
	var filled = 0;
	for (var cell=0; cell<qqwing.BOARD_SIZE; cell++){
		if (board != null && cell < board.length && board[cell] && board[cell] != 0) filled++;
	}
	if (filled !=0 && filled != qqwing.BOARD_SIZE){
		var s = getStat(gameType);
		s.gaveupcount++;
		saveStats();
	}
}
window.onunload=recordgaveup;

function startBlank(){
	newGame('blank','');
	return false;
}

function newUrlGame(){
	var cgiData = location.search.substring(1,location.search.length);
	var nameValPairs = new Array();
	var newgame = false;
	nameValPairs = cgiData.split('&');
	for (var i=0; i<nameValPairs.length; i++){
		var nameValPair;
		var value;
		if (nameValPairs[i].indexOf('game=') == 0) {
			var game = nameValPairs[i].substring(5);
			newGame('url',game);
			newgame=true;
		}
	}
	return newgame;
}

var pauseStart = 0;
var pauseTime = 0;
var pauseState = "";
var resumecountdown=5;

function pauseGame(){
	pauseStart = (new Date()).getTime();
	el('elapsedtime').innerHTML = "Game play time: " + toPrettyTime(getGameTime());
	showScreen('pause');
}

function resumeGame(){
	resumecountdown=5;
	finishResume();
}

function finishResume(){
	if (resumecountdown > 0){
		el('resumecount').innerHTML = resumecountdown;
		showScreen('resume');
		resumecountdown--;
		setTimeout(finishResume, 1000);
	} else {
		showScreen('game');
		pauseTime += (new Date()).getTime()-pauseStart;
	}
}

function showScreen(screen){
	el('head').style.display = screen=='game'?'none':'block';
	el('foot').style.display = screen=='game'?'none':'block';
	el('entiregame').style.display = screen=='game'?'block':'none';
	el('content').style.padding = (getWindowHeight()<=400&&screen=='game')?"0":"1em 0";
	document.body.style.backgroundColor = screen=='game'?'white':'#598059';
	el('titlescreen').style.display = /title|over/.test(screen)?'block':'none';
	el('pausescreen').style.display = screen=='pause'?'block':'none';
	el('resumescreen').style.display = screen=='resume'?'block':'none';
	el('newgamemessage').style.display = screen=='loading'?'block':'none';
	el('endgamescreen').style.display = screen=='over'?'block':'none';
	console.log(screen + " " + haveStats());
	el('statsarea').style.display = (!/game|loading|resume/.test(screen)&&haveStats())?'block':'none';
	console.log(el('statsarea').style.display);
	el('gamelinks').style.display = 'none';
	el('instructions').style.display='none';
	el('options').style.display='none';
}

function toggleDisp(id){
	var sty = el(id).style;
	sty.display=sty.display=='block'?'none':'block';
	return false;
}

function showOptions(){
	var sty = el('options').style;
	sty.display=sty.display=='block'?'none':'block';
}

function el(elementid){
	return document.getElementById(elementid);
}
