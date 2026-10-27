// node tests/test-kahoot-quiz-checker.js
var kq = require("../docs/guides/kahoot-quiz-checker.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function q1(text) { return kq.parse(text)[0]; }

// Parsing: the formats ChatGPT, Gemini and Claude produce
var qs = kq.parse("1. What is 2+2?\nA) 3\nB) 4\nC) 5\nD) 22\nAnswer: B\n\n2. Capital of France?\nA) Paris\nB) Lyon\nAnswer: A");
t("two questions", qs.length === 2);
t("question text", qs[0].text === "What is 2+2?");
t("four answers", qs[0].answers.length === 4 && qs[0].answers[3].text === "22");
t("answer letter", qs[0].correct.join() === "1");
t("second", qs[1].correct.join() === "0" && qs[1].answers.length === 2);
t("lowercase a.", q1("1) Q?\na. x\nb. y\nc. z\nCorrect answer: c").correct.join() === "2");
t("bracket (a)", q1("Q1: Q?\n(a) x\n(b) y\nAnswer: (b)").correct.join() === "1");
t("Question 3 label", q1("Question 3: Which?\nA. x\nB. y\nAnswer: A").text === "Which?");
t("bold markdown", q1("**1. Which planet is red?**\nA) Venus\nB) Mars\n**Answer:** B").correct.join() === "1");
t("bold question text", q1("**1. Which planet is red?**\nA) Venus\nB) Mars\nAnswer: B").text === "Which planet is red?");
t("star marks correct", q1("1. Q?\nA) x\nB) y *\nC) z").correct.join() === "1");
t("star prefix", q1("1. Q?\nA) x\n*C) z").correct.join() === "1");
t("(correct) marker", q1("1. Q?\nA) x (correct)\nB) y").correct.join() === "0");
t("marker removed", q1("1. Q?\nA) x (correct)\nB) y").answers[0].text === "x");
t("tick marker", q1("1. Q?\nA) x\nB) y ✓").correct.join() === "1");
t("answer by text", q1("1. Q?\nA) Paris\nB) Lyon\nAnswer: Lyon").correct.join() === "1");
t("answer letter + text", q1("1. Q?\nA) Paris\nB) Lyon\nAnswer: B) Lyon").correct.join() === "1");
t("multiple answers", q1("1. Q?\nA) x\nB) y\nC) z\nAnswers: A, C").correct.join() === "0,2");
t("A and C", q1("1. Q?\nA) x\nB) y\nC) z\nAnswer: A and C").correct.join() === "0,2");
t("numeric answer", q1("1. Q?\n1) x\n2) y\nAnswer: 2").correct.join() === "1");
t("time line", q1("1. Q?\nA) x\nB) y\nAnswer: A\nTime limit: 30").time === 30);
t("time (sec)", q1("1. Q?\nA) x\nB) y\nAnswer: A\nTime (seconds): 60").time === 60);
t("bullets as options", q1("1. Q?\n- x\n- y *").answers.length === 2 && q1("1. Q?\n- x\n- y *").correct.join() === "1");
t("wrapped question", q1("1. A long question\nthat wraps?\nA) x\nB) y\nAnswer: A").text === "A long question that wraps?");
t("conflict", q1("1. Q?\nA) x *\nB) y\nAnswer: B").conflict === true);
t("no conflict", !q1("1. Q?\nA) x\nB) y *\nAnswer: B").conflict);
t("unmatched answer kept raw", q1("1. Q?\nA) x\nB) y\nAnswer: Rome").rawCorrect === "Rome" && q1("1. Q?\nA) x\nB) y\nAnswer: Rome").correct.length === 0);
t("numbered options don't start questions", kq.parse("1. Q?\nA) 1. first\nB) 2. second\nAnswer: A").length === 1);
var md = kq.parse("Here is your quiz:\n\n### Question 1\n**What gas do plants release?**\n\nA) Oxygen  \nB) Nitrogen  \n\n**Correct answer:** A) Oxygen\n\n---\n\n### Question 2\n**Which organelle?**\nA) Nucleus\nB) Chloroplast\nAnswer: B\n\nLet me know if you want more questions!");
t("chatgpt markdown: intro and outro dropped", md.length === 2 && md[0].text === "What gas do plants release?" && md[1].text === "Which organelle?");
t("chatgpt markdown: answers", md[0].correct.join() === "0" && md[1].correct.join() === "1");
var miss = kq.parse("1. Q?\nA) x\nB) y\nAnswer: A\n\n2. What is missing?\n\n3. R?\nA) x\nB) y\nAnswer: B");
t("numbered question with no options kept", miss.length === 3 && miss[1].answers.length === 0);
t("empty", kq.parse("  \n ").length === 0);
t("build empty", kq.build("").ok === false);

// Spreadsheet / table rows
qs = kq.parse("Question\tAnswer 1\tAnswer 2\tAnswer 3\tAnswer 4\tTime\tCorrect\nWhat is 2+2?\t3\t4\t5\t\t20\t2\nRed planet?\tMars\tVenus\t\t\t10\t1");
t("tsv rows", qs.length === 2 && qs[0].answers.length === 3 && qs[0].correct.join() === "1" && qs[1].time === 10);
qs = kq.parse("| # | Question | A1 | A2 | A3 | A4 | Time | Correct |\n|---|---|---|---|---|---|---|---|\n| 1 | Q? | x | y | z | w | 30 | 1,3 |");
t("markdown table with #", qs.length === 1 && qs[0].text === "Q?" && qs[0].correct.join() === "0,2" && qs[0].time === 30);
t("table letters", kq.parse("Q?\tx\ty\tz\tw\t20\tC")[0].correct.join() === "2");

// Question checks
function issues(text) { return kq.checkQuestion(q1(text)); }
var long = "Which of these statements best describes the main reason why the Roman Empire eventually split in two?";
t("long question fix", has(issues("1. " + long + "\nA) x\nB) y\nAnswer: A"), "fix", /characters; Kahoot's import limit is 95/));
t("95 ok", !has(issues("1. " + "x".repeat(95) + "\nA) a\nB) b\nAnswer: A"), "fix", /characters/));
t("96 fix", has(issues("1. " + "x".repeat(96) + "\nA) a\nB) b\nAnswer: A"), "fix", /Cut 1/));
t("emoji counted once", !has(issues("1. " + "x".repeat(94) + "🌍\nA) a\nB) b\nAnswer: A"), "fix", /characters/));
t("long answer", has(issues("1. Q?\nA) " + "y".repeat(61) + "\nB) b\nAnswer: B"), "fix", /Answer A is 61 characters/));
t("60 answer ok", !has(issues("1. Q?\nA) " + "y".repeat(60) + "\nB) b\nAnswer: B"), "fix", /characters/));
t("one answer", has(issues("1. Q?\nA) x\nAnswer: A"), "fix", /at least 2/));
t("five answers", has(issues("1. Q?\nA) a\nB) b\nC) c\nD) d\n- e\nAnswer: A"), "fix", /takes 4 answers/));
t("no correct", has(issues("1. Q?\nA) x\nB) y"), "fix", /No correct answer/));
t("unmatched", has(issues("1. Q?\nA) x\nB) y\nAnswer: Rome"), "fix", /Couldn't match/));
t("out of range", has(issues("1. Q?\nA) x\nB) y\nAnswer: D"), "fix", /doesn't exist/));
t("conflict fix", has(issues("1. Q?\nA) x *\nB) y\nAnswer: B"), "fix", /disagree/));
t("multi review", has(issues("1. Q?\nA) x\nB) y\nC) z\nAnswer: A, C"), "review", /More than one/));
t("all correct", has(issues("1. Q?\nA) x\nB) y\nAnswer: A, B"), "fix", /Every option/));
t("bad time", has(issues("1. Q?\nA) x\nB) y\nAnswer: A\nTime: 15"), "review", /15 s isn't/));
t("good time", !has(issues("1. Q?\nA) x\nB) y\nAnswer: A\nTime: 120"), "review", /isn't/));
t("duplicate options", has(issues("1. Q?\nA) Mars\nB) mars.\nAnswer: A"), "fix", /A and B are the same/));
t("all of the above", has(issues("1. Q?\nA) x\nB) y\nC) All of the above\nAnswer: C"), "review", /All \/ none/));
t("none of these", has(issues("1. Q?\nA) x\nB) None of these\nAnswer: A"), "review", /All \/ none/));
t("negative lowercase", has(issues("1. Which is not a mammal?\nA) Dog\nB) Shark\nAnswer: B"), "review", /capitals/));
t("negative capitals ok", !has(issues("1. Which is NOT a mammal?\nA) Dog\nB) Shark\nAnswer: B"), "review", /capitals/));
t("except", has(issues("1. All are planets except?\nA) Mars\nB) Moon\nAnswer: B"), "review", /capitals/));
t("nothing is not 'not'", !has(issues("1. Which is a note?\nA) x\nB) y\nAnswer: A"), "review", /capitals/));
t("longest answer giveaway", has(issues("1. Why are leaves flat?\nA) Water\nB) To give a large surface area to absorb light\nC) Looks\nD) Food\nAnswer: B"), "review", /much longer/));
t("similar lengths fine", !has(issues("1. Q?\nA) Respiration\nB) Photosynthesis\nC) Digestion\nAnswer: B"), "review", /much longer/));
t("short time lots to read", has(issues("1. " + "x".repeat(85) + "\nA) " + "a".repeat(30) + "\nB) " + "b".repeat(30) + "\nAnswer: A\nTime: 10"), "review", /A lot to read/));
t("which of the following note", has(issues("1. Which of the following processes do plants use to make food from sunlight and water?\nA) x\nB) y\nAnswer: A"), "note", /Which of the following/));
t("clean question", issues("1. What is 2+2?\nA) 3\nB) 4\nC) 5\nAnswer: B\nTime: 20").length === 0);

// Whole-quiz checks
function quiz(n, letter) {
  var s = [];
  for (var i = 0; i < n; i++) s.push((i + 1) + ". Question number " + i + "?\nA) alpha " + i + "\nB) bravo " + i + "\nC) charlie " + i + "\nD) delta " + i + "\nAnswer: " + letter(i));
  return s.join("\n\n");
}
var allB = kq.parse(quiz(8, function () { return "B"; }));
t("always B", has(kq.checkQuiz(allB), "review", /8 of 8 answers are B/));
var mixed = kq.parse(quiz(8, function (i) { return "ABCD"[i % 4]; }));
t("mixed ok", !has(kq.checkQuiz(mixed), "review", /answers are/) && has(kq.checkQuiz(mixed), "note", /A 2, B 2, C 2, D 2/));
t("3 questions: no position check", kq.checkQuiz(kq.parse(quiz(3, function () { return "B"; }))).length === 0);
t("duplicate questions", has(kq.checkQuiz(kq.parse("1. Same?\nA) x\nB) y\nAnswer: A\n\n2. same\nA) x\nB) z\nAnswer: A")), "fix", /1 and 2 are the same/));

// Spreading answers
var sp = kq.spread(allB, 3);
var counts = [0, 0, 0, 0];
sp.questions.forEach(function (q) { counts[q.correct[0]]++; });
t("spread even", counts.join() === "2,2,2,2");
t("spread keeps right answer", sp.questions.every(function (q, i) { return q.answers[q.correct[0]].text === "bravo " + i; }));
t("spread keeps options", sp.questions.every(function (q, i) { return q.answers.map(function (a) { return a.text; }).sort().join() === ["alpha " + i, "bravo " + i, "charlie " + i, "delta " + i].join(); }));
t("spread doesn't mutate input", allB.every(function (q) { return q.correct[0] === 1 && q.answers[1].text.indexOf("bravo") === 0; }));
t("spread deterministic", JSON.stringify(kq.spread(allB, 3)) === JSON.stringify(sp));
t("spread passes quiz check", !has(kq.checkQuiz(sp.questions), "review", /answers are/));
t("ordered numbers", kq.ordered(q1("1. Q?\nA) 2\nB) 4\nC) 6\nD) 8\nAnswer: B")));
t("ordered descending", kq.ordered(q1("1. Q?\nA) 10%\nB) 5%\nC) 1%\nAnswer: B")));
t("unordered numbers", !kq.ordered(q1("1. Q?\nA) 4\nB) 2\nC) 8\nAnswer: B")));
t("true/false ordered", kq.ordered(q1("1. Q?\nA) True\nB) False\nAnswer: B")));
var tf = kq.spread(kq.parse("1. Q?\nA) True\nB) False\nAnswer: B\n\n2. R?\nA) 1\nB) 2\nC) 3\nAnswer: C"));
t("ordered kept in place", tf.kept === 2 && tf.moved === 0 && tf.questions[0].correct[0] === 1);
var multi = kq.spread(kq.parse("1. Q?\nA) x\nB) y\nC) z\nAnswer: A, C"));
t("multi-answer untouched", multi.questions[0].correct.join() === "0,2" && multi.moved === 0);

// Output
var res = kq.build("1. What is 2+2?\nA) 3\nB) 4\nC) 5\nAnswer: B\n\n2. Red planet?\nA) Mars\nB) Venus\nAnswer: A\nTime: 15", { time: 30, title: "Y7 recap" });
t("build ok", res.ok && res.questions.length === 2);
t("row shape", res.rows[0].length === 7 && res.rows[0][4] === "" && res.rows[0][6] === "2");
t("default time used", res.rows[0][5] === "30");
t("invalid time falls back", res.rows[1][5] === "30");
t("tsv tabs", res.tsv.split("\n")[0] === "What is 2+2?\t3\t4\t5\t\t30\t2");
t("csv header", res.csv.split("\n")[0] === "Question,Answer 1,Answer 2,Answer 3,Answer 4,Time limit (sec),Correct answer(s)");
t("multi correct in rows", kq.build("1. Q?\nA) x\nB) y\nC) z\nAnswer: A, C").rows[0][6] === "1,3");
t("csv quotes", kq.csvCell("a, b") === "\"a, b\"" && kq.csvCell("say \"hi\"") === "\"say \"\"hi\"\"\"");
t("csv formula guard", kq.csvCell("=SUM(A1)") === "'=SUM(A1)" && kq.csvCell("-5") === "-5" && kq.csvCell("+cmd") === "'+cmd");
t("tsv strips tabs", kq.tsv([["a\tb", "c\nd"]]) === "a b\tc d");
t("student copy", /^Y7 recap\nName: _+\n\n1\. What is 2\+2\?\n   A\) 3\n   B\) 4/.test(res.student));
t("student copy no answers", res.student.indexOf("Answer") < 0);
t("answer key", res.key === "Y7 recap: answer key\n\n1. B (4)\n2. A (Mars)");
t("flags count review", res.flags === 1 && res.fix === 0);
var sres = kq.build(quiz(8, function () { return "B"; }), { spread: true, seed: 3 });
t("build with spread", sres.spread.moved === 6 && !has(sres.quiz, "review", /answers are/));
t("fix count", kq.build("1. Q?\nA) x\nB) y").fix === 1);

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
