// node tests/test-parents-evening.js
var pe = require("../docs/guides/parents-evening.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }

// Parsing
var rows = pe.parse("Initials | Strength | Next step | Home\nAB | x | y | z\n\nCD\tp\tq\tr\tnote here");
t("header skipped", rows.length === 2 && rows[0].who === "AB");
t("pipe cells", rows[0].strength === "x" && rows[0].home === "z");
t("tab cells + note", rows[1].target === "q" && rows[1].note === "note here");
rows = pe.parse("| Student | S | T | H |\n|---|---|---|---|\n| AB | a | b | c |");
t("markdown table", rows.length === 1 && rows[0].who === "AB" && rows[0].home === "c");
t("empty build", pe.build("  ").ok === false);
t("missing cells", pe.parse("AB | only strength")[0].target === "");

// Names
t("full name", pe.looksLikeFullName("Ella Morris"));
t("initials ok", !pe.looksLikeFullName("EM") && !pe.looksLikeFullName("E. M.") && !pe.looksLikeFullName("Ella"));

// Generic praise
t("generic lovely", pe.isGeneric("lovely and polite"));
t("generic works hard", pe.isGeneric("Works hard."));
t("specific with example", !pe.isGeneric("good at explaining, e.g. the fractions task"));
t("specific with number", !pe.isGeneric("9/10 on the last two quizzes"));
t("long specific", !pe.isGeneric("her persuasive letter used three pieces of evidence"));

// Row checks
var good = { who: "AB", strength: "explains her method out loud in group work, e.g. fractions last week", target: "show every step of working on 2-mark questions", home: "ask her to teach you one homework question each week", note: "" };
var c = pe.checkRow(good, 10);
t("good row clean", c.issues.length === 0);
t("talk time sane", c.talkSeconds > 20 && c.talkSeconds < 120);
c = pe.checkRow({ who: "CD", strength: "lovely and polite", target: "try harder", home: "", note: "" }, 5);
t("generic flagged", has(c.issues, "review", /general praise/));
t("vague target flagged", has(c.issues, "review", /try harder/));
t("no home flagged", has(c.issues, "review", /No home step/));
["work harder", "put in more effort", "focus more in class", "be more confident", "participate more", "revise more", "keep it up", "push himself", "improve her writing", "be more organised", "concentrate"].forEach(function (v) {
  t("vague: " + v, pe.checkRow({ who: "X", strength: "9/10", target: v, home: "h" }, 0).issues.some(function (i) { return /Vague target/.test(i.msg); }));
});
["improve her writing by using a capital letter in every sentence", "revise using the knowledge organiser 3 times a week", "show every step of working"].forEach(function (v) {
  t("not vague: " + v, !pe.checkRow({ who: "X", strength: "9/10", target: v, home: "h" }, 0).issues.some(function (i) { return /Vague target/.test(i.msg); }));
});
c = pe.checkRow({ who: "Ella Morris", strength: "a", target: "b", home: "c", note: "has ADHD, check with SENCO" }, 0);
t("full name privacy", has(c.issues, "privacy", /full name/));
t("sensitive privacy", has(c.issues, "privacy", /ADHD/));
t("SEN caps", has(pe.checkRow({ who: "X", strength: "a", target: "b", home: "c", note: "on the SEN register" }, 0).issues, "privacy", /SEN/));
t("send verb ok", !has(pe.checkRow({ who: "X", strength: "a", target: "send the homework on time", home: "add a reminder" }, 0).issues, "privacy", /./));
t("missing all", pe.checkRow({ who: "", strength: "", target: "", home: "" }, 0).issues.filter(function (i) { return i.level === "fix"; }).length === 3);
t("two targets", has(pe.checkRow({ who: "X", strength: "9/10", target: "show working; check units", home: "h" }, 0).issues, "review", /More than one target/));
var long = new Array(300).join("word ");
t("too long for slot", has(pe.checkRow({ who: "X", strength: long, target: "show working", home: "h" }, 5).issues, "review", /min of a 5-min slot/));
t("no slot no time check", !has(pe.checkRow({ who: "X", strength: long, target: "show working", home: "h" }, 0).issues, "review", /slot/));

// Script + follow-up
var s = pe.script(good, { subject: "maths" });
t("script has 5 parts + handover", /1\. Welcome[\s\S]*5\. Home[\s\S]*Then, their turn/.test(s));
t("script uses subject", /I teach AB maths/.test(s));
t("script lowercases + strips stop", /does really well is explains her method/.test(s) && /is to show every step of working on 2-mark questions\."/.test(s));
t("script placeholders", /\[one specific next step\]/.test(pe.script({ who: "AB", strength: "x", target: "", home: "" })));
t("note line", /Note for me: hi/.test(pe.script({ who: "AB", strength: "", target: "", home: "", note: "hi" })));
var f = pe.followUp(good, {});
t("follow-up uk", /parents' evening/.test(f) && /Next step: show every step/.test(f));
t("follow-up us", /the conference/.test(pe.followUp(good, { us: true })));

// Schedule
var sc = pe.schedule("16:00", 5, 4);
t("schedule basic", sc.join(",") === "16:00,16:05,16:10,16:15");
sc = pe.schedule("15.50", 10, 5, 2, 15);
t("schedule breaks", sc.join(",") === "15:50,16:00,16:25,16:35,17:00");
t("schedule no trailing break", pe.schedule("16:00", 5, 2, 2, 10).join(",") === "16:00,16:05");
t("schedule bad", pe.schedule("4pm", 5, 3).length === 0 && pe.schedule("16:00", 0, 3).length === 0);

// Build
var b = pe.build("AB | 9/10 on quizzes | show working | ask one question\nCD | lovely | try harder |", { start: "16:00", minutes: 5 });
t("build ok", b.ok && b.students.length === 2);
t("build times", b.students[1].time === "16:05");
t("build flags", b.students[1].issues.length >= 3 && b.students[0].issues.length === 0);
t("build no start", pe.build("AB | a | b | c", { minutes: 5 }).students[0].time === "");

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
