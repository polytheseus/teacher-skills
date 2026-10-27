// node tests/test-sub-plan-builder.js
var sp = require("../docs/guides/sub-plan-builder.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function none(issues) { return issues.length === 0; }

// Parsing
var rows = sp.parse("Time | Class | Task | Materials | Collect\n8:30 | Reading | x | y | z\n\n9:00\tMath\tq\tr\ts | more");
t("header skipped", rows.length === 2 && rows[0].time === "8:30");
t("pipe cells", rows[0].task === "x" && rows[0].collect === "z");
t("tab cells", rows[1].what === "Math" && rows[1].materials === "r");
rows = sp.parse("| Time | Class | Task | Materials | Collect |\n|---|---|---|---|---|\n| 9:00 | Art | a | b | c |");
t("markdown table", rows.length === 1 && rows[0].what === "Art" && rows[0].collect === "c");
t("missing cells", sp.parse("9:00 | Art")[0].task === "");
t("empty build", sp.build({}, "  ").ok === false);

// Times
t("8:30", sp.toMinutes("8:30") === 510);
t("8.30", sp.toMinutes("8.30") === 510);
t("1:15 pm", sp.toMinutes("1:15 pm") === 795);
t("12:00am", sp.toMinutes("12:00am") === 0);
t("12 pm", sp.toMinutes("12 pm") === 720);
t("bare number not a time", sp.toMinutes("3") === null);
t("bad minutes", sp.toMinutes("8:75") === null);
t("range", sp.duration("8:30-9:20") === 50);
t("range en dash", sp.duration("8:30 – 9:20") === 50);
t("range to", sp.duration("10:10 to 11:00") === 50);
t("range in brackets", sp.duration("Period 2 (9:20-10:10)") === 50);
t("range across noon", sp.duration("11:30-1:00") === 90);
t("range pm", sp.duration("1:00pm-1:45pm") === 45);
t("24h", sp.duration("13:15-14:05") === 50);
t("no range", sp.duration("Period 3") === null);

// A good lesson has no issues
var good = { time: "8:50-9:50", what: "Reading", task: "Read pp. 42-47 together, then answer Q1-6 in full sentences", materials: "blue tray on my desk", collect: "question sheets, names on top" };
t("good lesson clean", none(sp.checkRow(good, "puzzle sheets")));
t("good lesson long, no early finisher", has(sp.checkRow(good, ""), "review", /early-finisher/));
var g2 = Object.assign({}, good, { task: good.task + "; extension: write 3 questions for a partner" });
t("extension in row counts", !has(sp.checkRow(g2, ""), "review", /early-finisher/));
t("short block no early finisher ok", !has(sp.checkRow(Object.assign({}, good, { time: "8:30-8:50" }), ""), "review", /early-finisher/));

// Missing parts
function only(over) { return sp.checkRow(Object.assign({}, good, over), "x"); }
t("no time", has(only({ time: "" }), "fix", /No time/));
t("no task", has(only({ task: "" }), "fix", /No task/));
t("no materials", has(only({ materials: "" }), "review", /materials location/));
t("no materials needed ok", !has(only({ materials: "none" }), "review", /materials location/));
t("no collect", has(only({ collect: "" }), "review", /Nothing to collect/));
t("collect word in task ok", !has(only({ collect: "", task: "Answer Q1-6 in their books, then hand in" }), "review", /Nothing to collect/));

// Vague and new content
t("continue with their work", has(only({ task: "Continue with their work" }), "review", /vague/));
t("carry on", has(only({ task: "carry on" }), "review", /vague/));
t("worksheet alone", has(only({ task: "Worksheet" }), "review", /vague/));
t("finish off work in sentence", has(only({ task: "Students finish off their work from Monday's lesson please" }), "review", /vague/));
t("short with no pages", has(only({ task: "Fractions practice" }), "review", /Short task/));
t("short with pages ok", !has(only({ task: "Fractions pp. 12-13" }), "review", /Short task|vague/));
t("introduce", has(only({ task: "Introduce persuasive writing with the model text" }), "review", /new content/));
t("teach them", has(only({ task: "Teach them long division using the board" }), "review", /new content/));
t("practice is fine", !has(only({ task: "Practise long division: 10 problems from the sheet, check with the answer key" }), "review", /new content/));

// Logins and tech
t("my google drive", has(only({ materials: "Video link in my Google Drive" }), "fix", /login/));
t("password", has(only({ task: "Use the password on the sticky note to open the slides" }), "fix", /login/));
t("my laptop", has(only({ materials: "on my laptop" }), "fix", /login/));
t("login fix suppresses tech review", !has(only({ materials: "Video link in my Google Drive" }), "review", /Relies on tech/));
t("youtube no fallback", has(only({ task: "Watch the YouTube video on food chains, then draw a food chain" }), "review", /Relies on tech/));
t("chromebooks no fallback", has(only({ task: "Students do 20 minutes of IXL on their Chromebooks" }), "review", /Relies on tech/));
t("tech with fallback", !has(only({ task: "Watch the video on food chains; if the video won't play, read the printed transcript" }), "review", /Relies on tech/));
t("tech with paper copy", !has(only({ task: "Slides 1-5 on the board, paper copies in the tray" }), "review", /Relies on tech/));
t("no tech words", !has(only({}), "review", /Relies on tech/));
t("'link' word detected", has(only({ task: "Open the link on the board and do the quiz, 10 questions" }), "review", /Relies on tech/));

// Privacy
t("IEP", has(only({ collect: "J.T. has an IEP so give extra time" }), "privacy", /IEP/));
t("ADHD", has(only({ task: good.task + " (A.B. has ADHD)" }), "privacy", /ADHD/));
t("504", has(only({ task: good.task + ", 504 plan students get a reader" }), "privacy", /504/));
t("full name", has(only({ collect: "give sheets to Ella Morris" }), "privacy", /full name/));
t("teacher title ok", !has(only({ collect: "send to Mr Okafor" }), "privacy", /full name/));
t("book title words ok", !has(only({ task: "Read The Stray pp. 42-47 and answer Q1-6" }), "privacy", /full name/));
t("add is not sensitive", !has(only({ task: "Add the numbers in each row, 12 problems, check with a partner" }), "privacy", /./));
t("names not joined across fields", !has(sp.checkRow({ time: "1:00-1:40", what: "Writing", task: "Introduce persuasive writing", materials: "", collect: "" }, "x"), "privacy", /full name/));
t("initials ok", !has(only({ collect: "A.K. collects the sheets" }), "privacy", /./));

// Class info
var info = { help: "Office ext. 200", attendance: "paper list", seating: "red folder", arrival: "start morning work", dismissal: "line up at 3:05", early: "reading book", helpers: "A.K. and R.M.", notes: "" };
t("good info clean", none(sp.checkInfo(info)));
function inf(over) { return sp.checkInfo(Object.assign({}, info, over)); }
t("no help", has(inf({ help: "" }), "fix", /help contact/));
t("no arrival", has(inf({ arrival: "" }), "review", /arrival/));
t("no dismissal", has(inf({ dismissal: "" }), "review", /Dismissal/));
t("no seating", has(inf({ seating: "" }), "review", /seating/));
t("no early", has(inf({ early: "" }), "review", /early-finisher/));
t("no attendance", has(inf({ attendance: "" }), "review", /attendance/));
t("helpers full name", has(inf({ helpers: "Amira Khan and Ravi Mehta" }), "privacy", /full name/));
t("notes safeguarding", has(inf({ notes: "C.D. is on a child protection plan" }), "privacy", /child protection/));
t("notes custody", has(inf({ notes: "Only mum may collect E.F. (custody order)" }), "privacy", /custody/));
t("medical note", has(inf({ notes: "G.H.'s inhaler is in the top drawer" }), "note", /Medical/));
t("medical not privacy", !has(inf({ notes: "G.H.'s inhaler is in the top drawer" }), "privacy", /./));

// Build output
var res = sp.build(Object.assign({ teacher: "Ms R", class: "Grade 4", room: "Room 12", style: "us" }, info),
  "Time | Class | Task | Materials | Collect\n8:50-9:50 | Reading | Read pp. 42-47, answer Q1-6 in full sentences | blue tray | sheets\n1:00-1:40 | Writing | Introduce persuasive writing | |");
t("build ok", res.ok && res.lessons.length === 2);
t("title emergency", /^SUB PLAN · Emergency plan/.test(res.text));
t("room not doubled", /Room 12/.test(res.text) && !/Room Room/.test(res.text));
t("header line", /Ms R · Grade 4 · Room 12/.test(res.text));
t("help line", /IF YOU NEED HELP: Office ext\. 200/.test(res.text));
t("attendance label us", /ATTENDANCE: paper list/.test(res.text));
t("schedule label", /\nSCHEDULE\n/.test(res.text));
t("lesson lines", /8:50-9:50  Reading\n   Do: Read pp\. 42-47/.test(res.text) && /   Collect: sheets/.test(res.text));
t("empty materials omitted", !/Materials: \n/.test(res.text) && !/Materials:\s*$/m.test(res.text));
t("end of day", /END OF DAY: line up at 3:05/.test(res.text));
t("note request", /PLEASE LEAVE ME A NOTE/.test(res.text));
t("flags counted", res.flags === res.general.length + res.lessons[0].issues.length + res.lessons[1].issues.length && res.flags >= 3);
var uk = sp.build(Object.assign({ style: "uk", date: "Tuesday 3 November", class: "8B Science" }, info), "Period 1 (8:50-9:50) | 8B Science | Read pp. 112-115, answer Q1-5 | green tray | worksheets");
t("uk title", /^COVER WORK · Tuesday 3 November/.test(uk.text));
t("uk register", /REGISTER: paper list/.test(uk.text) && /\nLESSONS\n/.test(uk.text));
t("uk toilets label", !/BATHROOM/.test(uk.text));
t("uk end", /END OF LESSON \/ DAY:/.test(uk.text));
t("uk thanks", /covering my lessons/.test(uk.text));
var bare = sp.build({}, "9:00 | Art | Draw a still life of the fruit bowl for 30 minutes | paper in the art cupboard | drying rack");
t("bare build ok", bare.ok && !/IF YOU NEED HELP/.test(bare.text) && has(bare.general, "fix", /help contact/));
t("bare no who line", bare.text.split("\n")[1] === "");

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
