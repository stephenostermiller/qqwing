---
title: Play QQWing Sudoku
description: Play Stephen Ostermiller's QQWing sudoku online in your web browser.
css: play.css
js: qqwing-play.js
...

<noscript >You must have JavaScript enabled to be able play online.</noscript>
<form onsubmit="return false" name=gameform>

<div id=gamelinks></div>

<div id=endgamescreen>
<span id=endgamemessage></span> <img src="linkicon.png" onclick="return toggleDisp('gamelinks');">
</div>

<div id=pausescreen>
<h1>Sudoku paused <img src="linkicon.png" onclick="return toggleDisp('gamelinks');"></h1>
<div id=elapsedtime></div>
<input type=button class="button mainbutton" value="Resume Game" onclick="resumeGame();">
<div>
<input type=button class=button value="Quit" onclick="recordgaveup();showScreen('title');">
</div>

<ul id=pauselinks class=gamecontrollinks>
<li><a href="#" onclick="return toggleDisp('instructions');">Instructions</a></li>
</ul>
</div>

<div id=titlescreen>
<div id=newgamediv>
<input name=newgamebutton type=button class="button mainbutton" value="New Game" onclick="newQQwingGame()">

<div id=options>
<div id=difficultyoption>
Difficulty:
<select name=difficultyselect></select>
</div>
<div>
Symmetry:
<select name=symmetryselect>
<option value=0>None</option>
<option value=1>Rotational symmetry 90&deg;</option>
<option value=2>Rotational symmetry 180&deg;</option>
<option value=3>Mirror image left to right</option>
<option value=4>Mirror image top and bottom</option>
<option value=5 selected>Random</option>
</select>
</div>
<a href="#" onclick="return startBlank();">Start with a blank board</a>
</div>

<ul id=titlelinks class=gamecontrollinks>
<li><a href="#" onclick="return toggleDisp('options');">Options</a></li>
<li><a href="#" onclick="return toggleDisp('instructions');">Instructions</a></li>
</ul>
</div>
</div>

<div id=newgamemessage></div>
<div id=entiregame>
<div id=gamecolumns>
<div id=playingarea>
<div id=game></div>
</div>
<div id=optionsarea>
<input id=pausebutton type=button class=button value=Pause onclick="pauseGame();">
<input id=hintbutton name=hintButton type=button class=button value=Hint onclick="hint();">
<img src="linkicon.png" onclick="return toggleDisp('ingamelinks');">
<div id=ingamelinks></div>
<div id="hint"></div>
<div id=markingcolors><table>
<tr><td><label style="color:#3D613D;"><input type=radio name=color value="#3D613D" checked>Green</label></td><td><input type=button value="Clear" style="color:#3D613D;" onclick="clearColor('#3D613D')"></td></tr>
<tr><td><label style="color:#204864;"><input type=radio name=color value="#204864">Blue</label></td><td><input type=button value="Clear" style="color:#204864;" onclick="clearColor('#204864')"></td></tr>
<tr><td><label style="color:#79215A;"><input type=radio name=color value="#79215A">Purple</label></td><td><input type=button value="Clear" style="color:#79215A;" onclick="clearColor('#79215A')"></td></tr>
<tr><td><label style="color:#9C2B2B;"><input type=radio name=color value="#9C2B2B">Red</label></td><td><input type=button value="Clear" style="color:#9C2B2B;" onclick="clearColor('#9C2B2B')"></td></tr>
<tr><td><label style="color:#363636;"><input type=radio name=color value="#363636">Black</label></td><td><input type=button value="Clear" style="color:#363636;" onclick="clearColor('#363636')"></td></tr>
<tr><td><label style="color:#999999;"><input type=radio name=color value="#999999">Gray</label></td><td><input type=button value="Clear" style="color:#999999;" onclick="clearColor('#999999')"></td></tr>
</table></div>
</div>
</div>
</div>
<div id=testcell></div>
<div id=resumescreen>
Game will resume in: <span id=resumecount></span>
</div>

<div id=instructions>
### Instructions for Sudoku

This Sudoku playing board will help you solve the puzzles.

 1. The goal of the game is to choose a number for each square such that no digit appears twice in any row, column, or section.</li>
 1. Start a new game with your desired level of difficulty.</li>
 1. Click on a possibility to choose that number for the square.  The possibility will be removed from other squares in the row, column, and section.</li>
 1. Hold down control, alt, or shift to and click on a possibility to remove the possibility from the square, but not mark the square.</li>
 1. Click on an assigned number to remove it from the square and put back any possibilities.</li>
 1. Use the colors however you wish.  You may find it helpful to switch the color whenever you guess.</li>

</div>

<div id=statsarea><div id=stats></div></div>
</form>
