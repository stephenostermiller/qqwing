---
title: QQWing - Solve Sudoku Puzzles
description: Solve Sudoku in your web browser using QQWing solving software.
css: gensolve.css
js: qqwing-html.js
...

<noscript >You must have JavaScript enabled to solve Sudoku puzzles online.</noscript>

<div id=error></div>

<form name=generateform onsubmit="return false;">
<div class=optionsection>
<div>Enter your puzzles here:</div>
<textarea name=tosolve></textarea>
</div>
<div class=optionsection>Output format:
<select name=outputselect>
<option value=2>Readable</option>
<option value=1>Compact</option>
<option value=0>One line</option>
<option value=3>CSV</option>
</select>
</div>
<div class=optionsection>
<label><input type=checkbox name=printpuzzle> Puzzle</label>
<label><input type=checkbox name=countsolutions> Count solutions</label>
<label><input type=checkbox name=printhistory> History</label>
<label><input type=checkbox name=printinstructions> Instructions</label>
<label><input type=checkbox name=timer> Timer</label>
<label><input type=checkbox name=printstats checked> Rating</label>
</div>
<div class=optionsection><span id=working></span> <input name=solvebutton type=submit class=button value=Solve onclick="solve(this.form);"></div>
</form>

<pre id=output></pre>

<div id=downloadavailable>A command line version of QQWing that can generate and solve Sudoku puzzles much faster is [available for download](download.html).</div>
