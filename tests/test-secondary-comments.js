// node tests/test-secondary-comments.js
var k = require("../docs/guides/secondary-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/secondary-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every area x level x second area x level x style x pronoun x timing x concern builds a clean comment.
var all = 0, clean = 0, bad = [];
k.AREAS.forEach(function (a1, i) { k.LEVELS.forEach(function (l1) { [""].concat(k.AREAS.map(function (a) { return a.id; })).forEach(function (a2, j) { k.LEVELS.forEach(function (l2) {
  ["us", "uk"].forEach(function (sty) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { k.CONCERNS.forEach(function (c) {
    var n = i * 7 + j * 3 + all;
    var s1 = k.STRENGTHS[n % k.STRENGTHS.length].id, s2 = k.STRENGTHS[(n + 4) % k.STRENGTHS.length].id;
    var r = k.build({ name: "Ava", pronoun: p, style: sty, timing: tm, course: n % 3 ? "" : "Chemistry", unit: n % 2 ? "our unit on rates of reaction" : "",
      area: a1.id, level: l1.id, area2: a2, level2: l2.id, strengths: [s1, s2], habit: k.HABITS[n % k.HABITS.length].id,
      concern: c.id, deadline: n % 4 ? "" : "Friday 20 November", help: n % 5 ? "" : "Thursday lunchtime help in room 12" });
    all++;
    if (r.ok && !r.issues.length && !/\{|\}|\[Name\]|undefined|\||also also|is also also/.test(r.text)) clean++;
    else bad.push([a1.id, l1.id, a2, l2.id, sty, p, tm, c.id].join("/") + ": " + JSON.stringify(r.issues) + " " + r.text);
  }); }); }); });
}); }); }); });
t("all " + all + " built comments pass the checker with no notes", clean === all);
if (bad.length) console.log(bad.length + " bad, e.g.\n" + bad.slice(0, 3).join("\n"));

// Each phrase on its own is clean (apart from the structure checks).
var STRUCT = /No (learning named|next step)/;
function lone(x, o) { var is = k.check(k.fill(x, o)).filter(function (i) { return !STRUCT.test(i.msg); }); if (is.length) console.log(x, JSON.stringify(is)); return !is.length; }
["us", "uk"].forEach(function (sty) {
  k.STRENGTHS.forEach(function (s) { t("strength " + s.id + "/" + sty, lone("Ava " + s.s + ".", { pronoun: "she", style: sty })); });
  k.AREAS.forEach(function (a) { k.LEVELS.forEach(function (l) {
    t("area " + a.id + "/" + l.id + "/s/" + sty, lone("Ava " + a[l.id].s + ".", { pronoun: "he", style: sty }));
    t("area " + a.id + "/" + l.id + "/g/" + sty, lone("Next, Ava is working on " + a[l.id].g + ".", { pronoun: "they", style: sty }));
  }); });
  k.HABITS.forEach(function (h) { if (h.s) t("habit " + h.id + "/" + sty, lone("Ava is also working on " + h.s + ".", { style: sty })); });
  k.CONCERNS.forEach(function (c) { if (c.s) t("concern " + c.id + "/" + sty, lone(c.s, { name: "Ava", pronoun: "she", style: sty })); });
});

// Build details
var r = k.build({ name: "Jordan", pronoun: "he", course: "Biology", unit: "cells and microscopy", area: "practical", level: "strong", area2: "writing", level2: "developing", strengths: ["curious"], concern: "missing", deadline: "November 20", help: "Tuesday after-school help in room 114" });
t("ok", r.ok && r.chars === r.text.length && r.issues.length === 0);
t("strength first + course", /^Jordan shows real curiosity about Biology\./.test(r.text));
t("unit", /In our work on cells and microscopy, Jordan plans and carries out practical work/.test(r.text));
t("area2 also", /Jordan is also learning to organize written answers/.test(r.text));
t("concern + deadline", /Jordan has some missing work this quarter, and handing it in by November 20 will give a fuller picture of what Jordan can do\./.test(r.text));
t("next from lower level", /Next, Jordan is working on planning each answer before writing/.test(r.text));
t("help", /Jordan is welcome at Tuesday after-school help in room 114\./.test(r.text));
t("concern close", /Please get in touch if you would like to talk about how we can support Jordan\.$/.test(r.text));
t("help cleaned", /Ava is welcome at catch-up club\./.test(k.build({ name: "Ava", help: "come to catch-up club.", strengths: ["effort"] }).text));
t("deadline 'by' not doubled", /handing it in by Friday\b/.test(k.build({ name: "Ava", concern: "missing", deadline: "by Friday", strengths: ["effort"] }).text));
t("no deadline", /handing it in will give/.test(k.build({ name: "Ava", concern: "missing", strengths: ["effort"] }).text));
t("gaps deadline", /catching up on that work by 1 December is the priority/.test(k.build({ name: "Ava", concern: "gaps", deadline: "1 December", strengths: ["effort"] }).text));
var risk = k.build({ name: "Sam", pronoun: "they", concern: "atrisk", strengths: ["respect"] });
t("at risk US default course", /Sam is currently at risk of not passing this class, and there is still time to turn this around\./.test(risk.text));
var riskc = k.build({ name: "Sam", pronoun: "they", concern: "atrisk", course: "Algebra 1", strengths: ["respect"] });
t("at risk US course", /at risk of not passing Algebra 1,/.test(riskc.text));
var riskuk = k.build({ name: "Sam", pronoun: "she", style: "uk", concern: "atrisk", strengths: ["respect"] });
t("below target UK", /Sam is currently working below her target grade, and there is still time to close the gap\./.test(riskuk.text) && /next term/.test(riskuk.text) === false);
t("UK period term", /next term/.test(k.build({ name: "Sam", style: "uk", strengths: ["respect"] }).text) || /Best wishes|enjoyed/.test(k.build({ name: "Sam", style: "uk", strengths: ["respect"] }).text));
t("UK spelling", /organised notes/.test(k.build({ name: "Sam", style: "uk", area: "independent", level: "secure", strengths: ["respect"] }).text));
t("UK practising + papers", /practising with short quizzes/.test(k.build({ name: "Sam", style: "uk", area: "assessments", level: "developing", strengths: ["respect"] }).text) &&
  /past papers/.test(k.build({ name: "Sam", style: "uk", area: "assessments", level: "secure", strengths: ["respect"] }).text));
t("US past tests", /past tests/.test(k.build({ name: "Sam", area: "assessments", level: "secure", strengths: ["respect"] }).text));
t("level labels", k.fill(k.LEVELS[2].label, { style: "uk" }) === "Below target" && k.fill(k.LEVELS[2].label, {}) === "Not yet meeting expectations");
t("concern label UK", k.fill(k.CONCERNS[2].label, { style: "uk" }) === "Working below target" && k.fill(k.CONCERNS[2].label, {}) === "At risk of not passing");
var f = k.build({ name: "Leo", area: "applying", level: "strong", area2: "writing", level2: "developing", focus: "applying", strengths: ["questions"] });
t("explicit focus", /working on tackling the most challenging extension problems/.test(f.text));
t("focus default area1 when area2 higher", /working on reviewing earlier units/.test(k.build({ area: "knowledge", level: "secure", area2: "applying", level2: "strong", strengths: ["effort"] }).text));
t("is also", /Ava is also respectful/.test(k.build({ name: "Ava", strengths: ["effort", "respect"] }).text));
t("also works", /Ava also works hard/.test(k.build({ name: "Ava", strengths: ["respect", "effort"] }).text));
t("also has", /Ava also has a detailed grasp/.test(k.build({ name: "Ava", area: "writing", level: "secure", area2: "knowledge", level2: "strong", strengths: ["effort"] }).text));
t("unit cleaned", /In our work on poetry, /.test(k.build({ unit: "Our poetry.", strengths: ["effort"] }).text));
t("unit keeps the", /In our work on the Cold War, /.test(k.build({ unit: "the Cold War", strengths: ["effort"] }).text));
t("unit cleaned 3", /In our work on poetry, /.test(k.build({ unit: "the unit on poetry", strengths: ["effort"] }).text));
t("unit cleaned 2", /In our work on poetry, /.test(k.build({ unit: "in our unit on poetry", strengths: ["effort"] }).text));
t("blank name placeholder flagged", has(k.build({ strengths: ["effort"] }).issues, "fix", /Placeholder/));
t("they pronoun", /their own targets/.test(k.build({ name: "Ava", pronoun: "they", area: "assessments", level: "strong", strengths: ["effort"] }).text));
t("no strengths flagged", has(k.build({ name: "Ava" }).issues, "review", /No learning strength/));
t("concern without strength flagged", has(k.build({ name: "Ava", concern: "missing" }).issues, "review", /all bad news/));
t("3 strengths trimmed", has(k.build({ name: "Ava", strengths: ["effort", "respect", "group"] }).issues, "note", /first two/));
t("end close", /enjoyed teaching Ava|Best wishes to Ava/.test(k.build({ name: "Ava", timing: "end", strengths: ["effort"] }).text));

// Limits: the longest build fits 500 and 350 by dropping optional parts, keeps the core.
var longest = { name: "Alexandra", pronoun: "they", course: "World History", unit: "causes of the First World War", area: "knowledge", level: "developing", area2: "practical", level2: "developing",
  strengths: ["effort", "group"], habit: "review", concern: "gaps", deadline: "Friday 4 December", help: "Wednesday lunchtime catch-up sessions in the history office" };
var full = k.build(longest);
t("longest full is long", full.text.length > 650);
[600, 500].forEach(function (lim) {
  var o = JSON.parse(JSON.stringify(longest)); o.limit = lim;
  var x = k.build(o);
  t("fits " + lim + " (" + x.chars + ")", x.chars <= lim && !has(x.issues, "fix", /over your limit/));
  t("core kept at " + lim, /^Alexandra works hard/.test(x.text) && /Missed lessons/.test(x.text) && /Next, Alexandra is working on/.test(x.text));
});
var typical = k.build({ name: "Ava", pronoun: "she", course: "Spanish 2", area: "discussion", level: "secure", area2: "writing", level2: "developing", strengths: ["effort", "respect"], habit: "review", limit: 350 });
t("typical fits 350 (" + typical.chars + ")", typical.chars <= 350 && /Next, Ava is working on/.test(typical.text));
var sw = k.build({ name: "Jordan", pronoun: "he", course: "Biology", unit: "cells and microscopy", area: "practical", level: "strong", area2: "writing", level2: "developing", strengths: ["curious"], concern: "missing", deadline: "November 20", help: "Tuesday after-school help in room 114", limit: 500 });
t("dropped area2 switches next step to area 1", !/written answers/.test(sw.text) && /Next, Jordan is working on evaluating his methods/.test(sw.text));
var tiny = k.build({ name: "Ava", strengths: ["effort"], area: "knowledge", level: "developing", limit: 100 });
t("over limit flagged when it can't fit", has(tiny.issues, "fix", /over your limit/));

// Checker catches the bad phrases.
var C = function (x, o) { return k.check(x, o || {}); };
t("math person", has(C("Ava is not a math person but tries. Next she is working on fractions."), "fix", /Fixed-ability/));
t("not academic", has(C("Ava is not very academic."), "fix", /Fixed-ability/));
t("bad at", has(C("Ava is bad at writing."), "fix", /Fixed-ability/));
t("will fail", has(C("If nothing changes Ava will fail this class."), "review", /Prediction/));
t("won't pass", has(C("Ava won't pass the exam."), "review", /Prediction/));
t("college", has(C("Ava won't get into college at this rate."), "review", /Prediction/));
t("percent", has(C("Ava has a 62% average."), "note", /percentage/));
t("grade of", has(C("Ava has a grade of 58 this quarter."), "note", /percentage/));
t("detention", has(C("Ava had three detentions this term."), "review", /Discipline/));
t("referral", has(C("After a behavior referral, Ava improved."), "review", /Discipline/));
t("on report ok", !has(C("Next, Ava is working on the skills on report cards."), "review", /Discipline/));
t("divorce", has(C("Since her parents' divorce Ava has struggled."), "fix", /Personal/));
t("job", has(C("Ava works a part-time job and is tired."), "fix", /Personal/));
t("course not court", !has(C("Ava enjoys the course."), "fix", /Personal/));
t("adhd", has(C("Ava's ADHD makes focus hard."), "fix", /Medical/));
t("extra time exams", has(C("Ava gets extra time in exams."), "fix", /Medical/));
t("extra time ok", !has(C("Ava spends extra time reviewing notes."), "fix", /Medical/));
t("SEN case", has(C("Ava is on the SEN register."), "fix", /Support-plan/) && !has(C("Please send it in."), "fix", /Support-plan/));
t("comparison", has(C("Ava is the best in the class at algebra."), "review", /Comparison/));
t("bottom set", has(C("Ava is in the bottom set."), "review", /Comparison/));
t("lazy", has(C("Ava is lazy."), "fix", /Label/));
t("attitude", has(C("Ava has a bad attitude."), "fix", /Label/));
t("class clown", has(C("Ava is the class clown."), "fix", /Label/));
t("phone", has(C("Ava is glued to her phone."), "review", /label/));
t("potential", has(C("Ava could reach her full potential."), "review", /vague/));
t("could do better", has(C("Ava could do better."), "review", /vague/));
t("if applied", has(C("Ava would do well if she applied herself."), "review", /vague/));
t("can't", has(C("Ava can't solve equations."), "review", /gap first/));
t("always", has(C("Ava always forgets her book."), "review", /rarely literally/));
t("placeholder", has(C("[Name] works hard."), "fix", /Placeholder/));
t("placeholder course", has(C("Ava works hard in [course]."), "fix", /Placeholder/));
t("jargon", has(C("Ava meets the success criteria at DOK 2."), "note", /jargon/));
t("jargon AO", has(C("Ava does well on AO3."), "note", /jargon/));
t("stock", has(C("Ava is a pleasure to have in class."), "note", /Stock/));
t("stock AI", has(C("Ava's essay showcases a tapestry of ideas."), "note", /Stock/));
t("alarm", has(C("I am very concerned about Ava."), "review", /alarm/));
t("disappointing", has(C("Ava's test results were disappointing."), "review", /alarm/));
t("no learning", has(C("Ava is a lovely student. Next she is working on focus."), "review", /No learning/));
t("no next step", has(C("Ava writes clear essays with evidence."), "review", /No next step/));
t("needs x3", has(C("Ava needs to revise, must attend and should ask questions."), "review", /Needs to/));
t("exclaim", has(C("Great essay! Keep going! Next, more evidence."), "review", /exclamation/));
t("pronouns mixed", has(C("Ava writes her essays well and he revises."), "review", /pronouns/));
t("name missing", has(C("Leo writes well. Next, evidence.", { name: "Ava" }), "review", /isn't in the comment/));
t("you mix", has(C("Ava writes well. Next, you should add evidence.", { name: "Ava" }), "note", /mixes/));
t("you ok in contact line", !has(C("Ava writes well. Next, evidence. Please get in touch if you would like to talk.", { name: "Ava" }), "note", /mixes/));
t("curly", has(C("Ava’s essay — great. Next, evidence."), "note", /Curly/));
t("plain", k.plain("Ava’s “essay” — great…") === "Ava's \"essay\", great...");
t("long sentence", has(C("Ava works hard and listens and writes and reads and revises and plans and asks questions and takes notes and helps others and checks answers and reviews tests and practises problems every single day of the week."), "note", /over 30 words/));
t("empty", has(C(""), "fix", /Nothing/));
t("limit check", has(C("Ava writes clear essays. Next, evidence.", { limit: 10 }), "fix", /over your limit/));

// Rewrites: every "before" is flagged, every "after" is clean.
rewrites.forEach(function (rw, i) {
  t("rewrite " + i + " before flagged", serious(C(rw[0])).length > 0 || C(rw[0]).length > 0);
  if (!/^Leave it out\./.test(rw[1])) {
    var after = C(rw[1].replace(/^"|"$/g, ""));
    if (after.length) console.log("rewrite after:", rw[1], JSON.stringify(after));
    t("rewrite " + i + " after clean", after.length === 0);
  } else {
    var quoted = rw[1].replace(/^Leave it out\.\s*/, "").replace(/^"|"$/g, "");
    var aq = C(quoted);
    if (aq.length) console.log("rewrite after:", quoted, JSON.stringify(aq));
    t("rewrite " + i + " leave-out alternative clean", aq.length === 0);
  }
});

console.log(pass + "/" + (pass + fail) + " passed");
process.exit(fail ? 1 : 0);
