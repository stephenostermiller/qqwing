---
title: QQwing Sudoku Instructions
description: Instructions for using a fast command line program written in C++ for generating and solving Sudoku puzzles.
...

# Instructions for QQwing

QQWing is a command line program that accepts many options.

<pre>qqwing &lt;options&gt;
Sudoku solver and generator.
&nbsp; --generate &lt;num&gt;     Generate new puzzles
&nbsp; --solve              Solve all the puzzles from standard input
&nbsp; --difficulty &lt;diff&gt;  Generate only simple,easy, intermediate, or expert
&nbsp; --symmetry &lt;sym&gt;     Symmetry: none, rotate90, rotate180, mirror, flip, or random
&nbsp; --puzzle             Print the puzzle (default when generating)
&nbsp; --nopuzzle           Do not print the puzzle (default when solving)
&nbsp; --solution           Print the solution (default when solving)
&nbsp; --nosolution         Do not print the solution (default when generating)
&nbsp; --stats              Print statistics about moves used to solve the puzzle
&nbsp; --nostats            Do not print statistics (default)
&nbsp; --timer              Print time to generate or solve each puzzle
&nbsp; --notimer            Do not print solve or generation times (default)
&nbsp; --count-solutions    Count the number of solutions to puzzles
&nbsp; --nocount-solutions  Do not count the number of solutions (default)
&nbsp; --history            Print trial and error used when solving
&nbsp; --nohistory          Do not print trial and error to solve (default)
&nbsp; --instructions       Print the steps (at least 81) needed to solve the puzzle
&nbsp; --noinstructions     Do not print steps to solve (default)
&nbsp; --log-history        Print trial and error to solve as it happens
&nbsp; --nolog-history      Do not print trial and error  to solve as it happens
&nbsp; --one-line           Print puzzles on one line of 81 characters
&nbsp; --compact            Print puzzles on 9 lines of 9 characters
&nbsp; --readable           Print puzzles in human readable form (default)
&nbsp; --csv                Output CSV format with one line puzzles
&nbsp; --help               Print this message
&nbsp; --about              Author and license information
&nbsp; --version            Display current version number</pre>

## Examples

### Generate a single Sudoku

	$ qqwing --generate

<pre class=output> . 4 3 | 5 . . | . . 2
&nbsp;. . 2 | . . 4 | . 8 3
&nbsp;. 1 . | . . . | 6 . .
-------|-------|-------
&nbsp;. 8 . | 7 3 . | . . 5
&nbsp;2 6 . | . 4 5 | . . .
&nbsp;1 . . | . . 8 | . . .
-------|-------|-------
&nbsp;. 7 . | 3 . . | . 6 .
&nbsp;. . . | . . . | . . .
&nbsp;. . . | 6 . 7 | . . .</pre>

### Generate a single Sudoku and print the solution too

	$ qqwing --generate --solution

<pre class=output> 2 . . | . . 9 | . 8 .
&nbsp;. 4 6 | . . . | . . .
&nbsp;7 . . | 4 . 2 | 1 . .
-------|-------|-------
&nbsp;6 . . | . . 1 | 4 . 8
&nbsp;. . . | 6 3 . | . 2 .
&nbsp;9 2 7 | . . . | . . 3
-------|-------|-------
&nbsp;1 . . | 9 . . | 8 4 .
&nbsp;. 9 . | . . . | . . .
&nbsp;4 . . | . . . | . 6 .

&nbsp;2 3 1 | 7 6 9 | 5 8 4
&nbsp;5 4 6 | 3 1 8 | 2 9 7
&nbsp;7 8 9 | 4 5 2 | 1 3 6
-------|-------|-------
&nbsp;6 5 3 | 2 9 1 | 4 7 8
&nbsp;8 1 4 | 6 3 7 | 9 2 5
&nbsp;9 2 7 | 5 8 4 | 6 1 3
-------|-------|-------
&nbsp;1 6 5 | 9 7 3 | 8 4 2
&nbsp;3 9 2 | 8 4 6 | 7 5 1
&nbsp;4 7 8 | 1 2 5 | 3 6 9</pre>

### Generate ten puzzles and print out full stats in CSV format

	$ qqwing --generate 10 --solution --csv --stats --timer

<pre class=output>Puzzle,Solution,Time (milliseconds),Givens,Singles,Hidden Singles,Naked Pairs,Hidden Pairs,Pointing Pairs/Triples,Box/Line Intersections,Guesses,Backtracks,Difficulty
.13.....22.....48....7...19...9..8..7......2....3.......263.9..4.9.7.6....149...8,913584762257169483648723519136942857795816324824357196572638941489271635361495278,46.717,26,34,21,0,0,0,0,0,0,Easy,
5...7.6..41..53..7.6712...884.....1.....1.3.6...7...2........65......87..3.......,529478631418653297367129458846532719275914386193786524982347165654291873731865942,30.1,26,55,0,0,0,0,0,0,0,Simple,
...........8..4.1...4.7....8..3...69..71....4.95......4..51.7.3.7.8..9..5....6.8.,712983645938654217654271398841327569267195834395468172486519723173842956529736481,44.492,25,41,13,3,0,1,1,2,2,Expert,
.6..5..3...1.2..5.7....34..426.38.....3.......574.12.......7......81...7....6...1,264159738381724956795683412426538179913276584857491263138947625642815397579362841,28.002,26,55,0,0,0,0,0,0,0,Simple,
...6..4.9..8........3..9.....17.5...8.......1.4.3......3.....561......3..94..8..7,512673489978142563463859712321795648859426371746381295237914856185267934694538127,235.508,22,35,24,1,0,0,0,0,0,Intermediate,
.46...58.718.....65...4....1....675..8.....1..2...58.4.....74...69....7.2....1...,946712583718359246532648197193486752485273619627195834351967428869524371274831965,72.421,27,40,14,0,0,0,0,0,0,Easy,
6.......1...63.....8241...9.....5.1..4.......2.9..8..5..4....8.....2.46.5........,697852341451639278382417659873265914145973826269148735714396582938521467526784193,71.251,22,35,24,0,0,0,0,0,0,Easy,
..28.5..7.9..274......1...9.8....7313........4...71...........4.1.9...........253,142895367893627415756413829685249731371568942429371586238756194514932678967184253,74.806,24,37,20,0,0,0,0,0,0,Easy,
4....791....4.....2..5...365.3....2.....7.1...7.129......9.3...3.5....6.....6....,456237918931486572287591436513648729629375184874129653762953841395814267148762395,76.731,24,40,17,0,0,0,0,0,0,Easy,
........49.1.6.5....8....9.8..4.37.6....1....54...718.....39..7....4..5....7..81.,756981234921364578438572691819453726673218945542697183285139467197846352364725819,75.17,26,43,11,0,0,1,0,1,0,Expert,
10 puzzles generated in 0.757244 seconds.</pre>

### Generate a puzzle of expert difficulty and print it in compact format

	$ qqwing --generate --difficulty expert --compact

<pre class=output>8........
......5.7
.......61
.1..869.5
....14...
.965....4
..8..7...
75.3....9
..9..13..</pre>

### Solve a puzzle

	$ echo ........49.1.6.5....8....9.8..4.37.6....1....54...718.....39..7....4..5....7..81. | qqwing --solve

<pre class=output> 7 5 6 | 9 8 1 | 2 3 4
&nbsp;9 2 1 | 3 6 4 | 5 7 8
&nbsp;4 3 8 | 5 7 2 | 6 9 1
-------|-------|-------
&nbsp;8 1 9 | 4 5 3 | 7 2 6
&nbsp;6 7 3 | 2 1 8 | 9 4 5
&nbsp;5 4 2 | 6 9 7 | 1 8 3
-------|-------|-------
&nbsp;2 8 5 | 1 3 9 | 4 6 7
&nbsp;1 9 7 | 8 4 6 | 3 5 2
&nbsp;3 6 4 | 7 2 5 | 8 1 9</pre>

### Solve a puzzle and print out complete stats and solve instructions

	$ echo .....1.....2....9..1.97.83.7...2.6...81..6.4..9.....2....389.6....71........62... | qqwing --solve --stats --instructions --count-solutions

<pre class=output> 9 4 8 | 2 3 1 | 7 5 6
&nbsp;3 7 2 | 6 5 8 | 1 9 4
&nbsp;5 1 6 | 9 7 4 | 8 3 2
-------|-------|-------
&nbsp;7 5 4 | 8 2 3 | 6 1 9
&nbsp;2 8 1 | 5 9 6 | 3 4 7
&nbsp;6 9 3 | 1 4 7 | 5 2 8
-------|-------|-------
&nbsp;1 2 7 | 3 8 9 | 4 6 5
&nbsp;4 6 9 | 7 1 5 | 2 8 3
&nbsp;8 3 5 | 4 6 2 | 9 7 1

1. Round: 1 - Mark given (Row: 1 - Column: 6 - Value: 1)
2. Round: 1 - Mark given (Row: 2 - Column: 3 - Value: 2)
3. Round: 1 - Mark given (Row: 2 - Column: 8 - Value: 9)
4. Round: 1 - Mark given (Row: 3 - Column: 2 - Value: 1)
5. Round: 1 - Mark given (Row: 3 - Column: 4 - Value: 9)
6. Round: 1 - Mark given (Row: 3 - Column: 5 - Value: 7)
7. Round: 1 - Mark given (Row: 3 - Column: 7 - Value: 8)
8. Round: 1 - Mark given (Row: 3 - Column: 8 - Value: 3)
9. Round: 1 - Mark given (Row: 4 - Column: 1 - Value: 7)
10. Round: 1 - Mark given (Row: 4 - Column: 5 - Value: 2)
11. Round: 1 - Mark given (Row: 4 - Column: 7 - Value: 6)
12. Round: 1 - Mark given (Row: 5 - Column: 2 - Value: 8)
13. Round: 1 - Mark given (Row: 5 - Column: 3 - Value: 1)
14. Round: 1 - Mark given (Row: 5 - Column: 6 - Value: 6)
15. Round: 1 - Mark given (Row: 5 - Column: 8 - Value: 4)
16. Round: 1 - Mark given (Row: 6 - Column: 2 - Value: 9)
17. Round: 1 - Mark given (Row: 6 - Column: 8 - Value: 2)
18. Round: 1 - Mark given (Row: 7 - Column: 4 - Value: 3)
19. Round: 1 - Mark given (Row: 7 - Column: 5 - Value: 8)
20. Round: 1 - Mark given (Row: 7 - Column: 6 - Value: 9)
21. Round: 1 - Mark given (Row: 7 - Column: 8 - Value: 6)
22. Round: 1 - Mark given (Row: 8 - Column: 4 - Value: 7)
23. Round: 1 - Mark given (Row: 8 - Column: 5 - Value: 1)
24. Round: 1 - Mark given (Row: 9 - Column: 5 - Value: 6)
25. Round: 1 - Mark given (Row: 9 - Column: 6 - Value: 2)
26. Round: 2 - Mark only possibility for cell (Row: 5 - Column: 4 - Value: 5)
27. Round: 2 - Mark only possibility for cell (Row: 9 - Column: 4 - Value: 4)
28. Round: 2 - Mark only possibility for cell (Row: 8 - Column: 6 - Value: 5)
29. Round: 2 - Mark only possibility for cell (Row: 3 - Column: 6 - Value: 4)
30. Round: 2 - Mark only possibility for cell (Row: 8 - Column: 8 - Value: 8)
31. Round: 2 - Mark single possibility for value in section (Row: 1 - Column: 4 - Value: 2)
32. Round: 2 - Mark single possibility for value in section (Row: 2 - Column: 4 - Value: 6)
33. Round: 2 - Mark single possibility for value in section (Row: 2 - Column: 6 - Value: 8)
34. Round: 2 - Mark only possibility for cell (Row: 4 - Column: 6 - Value: 3)
35. Round: 2 - Mark only possibility for cell (Row: 5 - Column: 5 - Value: 9)
36. Round: 2 - Mark only possibility for cell (Row: 6 - Column: 5 - Value: 4)
37. Round: 2 - Mark only possibility for cell (Row: 6 - Column: 6 - Value: 7)
38. Round: 2 - Mark single possibility for value in section (Row: 3 - Column: 9 - Value: 2)
39. Round: 2 - Mark single possibility for value in section (Row: 1 - Column: 9 - Value: 6)
40. Round: 2 - Mark single possibility for value in section (Row: 5 - Column: 1 - Value: 2)
41. Round: 2 - Mark single possibility for value in section (Row: 4 - Column: 9 - Value: 9)
42. Round: 2 - Mark single possibility for value in section (Row: 6 - Column: 9 - Value: 8)
43. Round: 2 - Mark only possibility for cell (Row: 6 - Column: 4 - Value: 1)
44. Round: 2 - Mark only possibility for cell (Row: 4 - Column: 4 - Value: 8)
45. Round: 2 - Mark single possibility for value in section (Row: 4 - Column: 8 - Value: 1)
46. Round: 2 - Mark single possibility for value in section (Row: 6 - Column: 7 - Value: 5)
47. Round: 2 - Mark single possibility for value in column (Row: 8 - Column: 2 - Value: 6)
48. Round: 2 - Mark single possibility for value in section (Row: 7 - Column: 2 - Value: 2)
49. Round: 2 - Mark single possibility for value in section (Row: 8 - Column: 7 - Value: 2)
50. Round: 2 - Mark single possibility for value in section (Row: 9 - Column: 7 - Value: 9)
51. Round: 2 - Mark single possibility for value in column (Row: 5 - Column: 7 - Value: 3)
52. Round: 2 - Mark only possibility for cell (Row: 5 - Column: 9 - Value: 7)
53. Round: 2 - Remove possibilities for naked pair in section (Row: 3 - Column: 1)
54. Round: 2 - Remove possibilities from hidden pair in row (Row: 1 - Column: 1 - Value: 8)
55. Round: 2 - Remove possibilities for column because all values are in one section (Row: 1 - Column: 2 - Value: 7)
56. Round: 3 - Mark guess (start round) (Row: 4 - Column: 3 - Value: 4)
57. Round: 4 - Mark only possibility for cell (Row: 4 - Column: 2 - Value: 5)
58. Round: 4 - Mark only possibility for cell (Row: 9 - Column: 2 - Value: 3)
59. Round: 4 - Mark only possibility for cell (Row: 8 - Column: 3 - Value: 9)
60. Round: 4 - Mark only possibility for cell (Row: 1 - Column: 3 - Value: 8)
61. Round: 4 - Mark only possibility for cell (Row: 1 - Column: 1 - Value: 9)
62. Round: 4 - Mark only possibility for cell (Row: 8 - Column: 1 - Value: 4)
63. Round: 4 - Mark only possibility for cell (Row: 2 - Column: 1 - Value: 3)
64. Round: 4 - Mark only possibility for cell (Row: 2 - Column: 5 - Value: 5)
65. Round: 4 - Mark only possibility for cell (Row: 1 - Column: 5 - Value: 3)
66. Round: 4 - Mark only possibility for cell (Row: 6 - Column: 1 - Value: 6)
67. Round: 4 - Mark only possibility for cell (Row: 3 - Column: 1 - Value: 5)
68. Round: 4 - Mark only possibility for cell (Row: 3 - Column: 3 - Value: 6)
69. Round: 4 - Mark only possibility for cell (Row: 6 - Column: 3 - Value: 3)
70. Round: 4 - Mark only possibility for cell (Row: 7 - Column: 1 - Value: 1)
71. Round: 4 - Mark only possibility for cell (Row: 8 - Column: 9 - Value: 3)
72. Round: 4 - Mark only possibility for cell (Row: 9 - Column: 1 - Value: 8)
73. Round: 4 - Mark single possibility for value in section (Row: 1 - Column: 8 - Value: 5)
74. Round: 4 - Mark only possibility for cell (Row: 9 - Column: 8 - Value: 7)
75. Round: 4 - Mark only possibility for cell (Row: 7 - Column: 7 - Value: 4)
76. Round: 4 - Mark only possibility for cell (Row: 1 - Column: 7 - Value: 7)
77. Round: 4 - Mark only possibility for cell (Row: 1 - Column: 2 - Value: 4)
78. Round: 4 - Mark only possibility for cell (Row: 2 - Column: 2 - Value: 7)
79. Round: 4 - Mark only possibility for cell (Row: 2 - Column: 7 - Value: 1)
80. Round: 4 - Mark only possibility for cell (Row: 2 - Column: 9 - Value: 4)
81. Round: 4 - Mark only possibility for cell (Row: 7 - Column: 9 - Value: 5)
82. Round: 4 - Mark only possibility for cell (Row: 7 - Column: 3 - Value: 7)
83. Round: 4 - Mark only possibility for cell (Row: 9 - Column: 3 - Value: 5)
84. Round: 4 - Mark only possibility for cell (Row: 9 - Column: 9 - Value: 1)

The solution to the puzzle is unique.
Number of Givens: 25
Number of Singles: 39
Number of Hidden Singles: 16
Number of Naked Pairs: 1
Number of Hidden Pairs: 1
Number of Pointing Pairs/Triples: 1
Number of Box/Line Intersections: 0
Number of Guesses: 1
Number of Backtracks: 2
Difficulty: Expert</pre>
