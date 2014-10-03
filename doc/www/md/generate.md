---
title: QQWing - Generate Sudoku Puzzles
description: Generate Sudoku in your web browser using QQWing.
css: gensolve.css
js: qqwing-html.js
...

<noscript >You must have JavaScript enabled to generate Sudoku puzzles online.</noscript>

<form name=generateform onsubmit="return false;">
<div class=optionsection>How many? <input type=number name=generatenumber value=1 min=1></div>
<div class=optionsection>Difficulty:
<select name=difficultyselect>
<option value=0>Any</option>
<option value=1>Simple</option>
<option value=2>Easy</option>
<option value=3>Intermediate</option>
<option value=4>Expert</option>
</select>
</div>
<div class=optionsection>Symmetry:
<select name=symmetryselect>
<option value=0>None</option>
<option value=1>Rotate 90&deg;</option>
<option value=2>Rotate 180&deg;</option>
<option value=3>Mirror</option>
<option value=4>Flip</option>
<option value=5>Random</option>
</select>
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
<label><input type=checkbox name=printsolution> Solution</label>
<label><input type=checkbox name=printhistory> History</label>
<label><input type=checkbox name=printinstructions> Instructions</label>
<label><input type=checkbox name=timer> Timer</label>
<label><input type=checkbox name=printstats checked> Rating</label>
</div>
<div class=optionsection><span id=working></span> <input name=generatebutton type=submit class=button value=Generate onclick="generate(this.form);"></div>
</form>

<pre id=output></pre>

<div id=downloadavailable>A command line version of QQWing that can generate and solve Sudoku puzzles much faster is [available for download](download.html).</div>
