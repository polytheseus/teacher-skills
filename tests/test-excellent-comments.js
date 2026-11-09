// node tests/test-excellent-comments.js
var k = require("../docs/guides/excellent-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/excellent-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
function noStep(issues) { return issues.filter(function (i) { return !/No next step/.test(i.msg); }); }

// Every strength pair x stretch x style x pronoun x timing builds a clean comment,
// with and without a typed moment and home tip.
var all = 0, clean = 0, bad = [], sing = /\bthey (is|has|was|does|isn't|hasn't|doesn't|[a-z]+[^s]s)\b/i;
k.STRENGTHS.forEach(function (s, i) {
  k.STRETCH.forEach(function (n, j) {
    ["us", "uk"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["yes", "no"].forEach(function (home) {
      var s2 = k.STRENGTHS[(i + j + 1) % k.STRENGTHS.length].id;
      if (s2 === s.id) s2 = k.STRENGTHS[(i + 2) % k.STRENGTHS.length].id;
      var r = k.build({ name: "Ava", pronoun: p, style: st, timing: tm, strengths: [s.id, s2], stretch: n.id, home: home, moment: j % 2 ? "built a working model of a bridge" : "" });
      all++;
      var iss = serious(r.issues), first = r.text.split(/(?<=\.)\s/);
      var run = 0, maxRun = 0; first.forEach(function (x) { if (/^Ava\b/.test(x)) { run++; maxRun = Math.max(maxRun, run); } else run = 0; });
      if (r.ok && !iss.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text) && !sing.test(r.text) && maxRun <= 2) clean++;
      else bad.push(s.id + "/" + n.id + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(iss) + " " + r.text);
    }); }); }); });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Every variant is clean alone (a line of praise has no next step by itself).
k.STRENGTHS.forEach(function (s) { s.v.forEach(function (v, j) { var x = k.fill("Ava " + v + ".", { pronoun: "she" }); t("strength " + s.id + j, !noStep(serious(k.check(x))).length); }); });
k.STRETCH.forEach(function (n) {
  var o = { pronoun: "she", name: "Ava", style: "us" };
  t("ready " + n.id, !serious(k.check(k.fill("Next quarter, Ava is ready to " + n.ready + ".", o))).length);
  t("home " + n.id, !noStep(serious(k.check(k.fill("At home, you could " + n.home + ".", o)))).length);
  t("sch " + n.id, !noStep(serious(k.check(k.fill("To help with this, I'll " + n.sch + ".", o)))).length);
});
t("50 short comments", k.SHORT.length === 50);
var seenS = {};
k.SHORT.forEach(function (s, i) {
  var x = k.fill(s, { name: "Ava", pronoun: "she", style: "us" });
  t("short " + i, !noStep(serious(k.check(x))).length && x.length <= 100 && !seenS[x]);
  seenS[x] = 1;
});

// Rewrites: every before is flagged; every after is clean.
rewrites.forEach(function (r, i) {
  var before = k.check(r[0]).filter(function (x) { return !/No next step|No subject/.test(x.msg); });
  t("before flagged " + i + " " + r[0], before.length > 0);
  var after = k.fill(r[1], { style: "us" }).replace(/\[Name\]/g, "Ava");
  var a = k.check(after).filter(function (x) { return !/No next step|No subject/.test(x.msg); });
  t("after clean " + i + " " + JSON.stringify(a), a.length === 0);
});

// Build details
var r = k.build({ name: "Jordan", pronoun: "he", strengths: ["math", "persist"], moment: "Solved the bridge problem three ways.", stretch: "mathwhy" });
t("ok", r.ok && r.chars === r.text.length);
t("math first", /^Jordan (explains his reasoning|spots patterns)/.test(r.text));
t("second uses also", /(Jordan|He) also (sticks|treats)/.test(r.text));
t("moment lowercased", /highlight this quarter: Jordan solved the bridge problem three ways\./.test(r.text));
t("next step", /Next quarter, (Jordan|he) is ready to tackle/.test(r.text));
t("school line", /To help with this, I'll add problems/.test(r.text));
t("home", /At home, you could ask Jordan/.test(r.text));
t("no issues", r.issues.length === 0);
t("requires a strength", !k.build({ name: "A", strengths: [] }).ok);
t("no stretch flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["kind"] }).issues, "review", /No next step/));
var r3 = k.build({ name: "Ava", pronoun: "she", strengths: ["kind", "math", "writing"], stretch: "lead" });
t("3 strengths flagged and cut", has(r3.issues, "review", /3 strengths/) && !/(\bAva\b|She) also[^.]*\. (Ava|She) also/.test(r3.text));
var e = k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], stretch: "lead", timing: "end" });
t("end says next year", /Next year, (Ava|she) is ready/i.test(e.text));
t("end has no promise from this teacher", !/I'll/.test(e.text));
var es = k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], stretch: "lead", timing: "end", support: "Pass my notes to next year's teacher." });
t("end typed support kept", /To help with this, I'll pass my notes to next year's teacher\./.test(es.text));
t("uk math label", k.fill(k.STRENGTHS[2].label, { style: "uk" }) === "Maths" && k.fill(k.STRENGTHS[2].label, { style: "us" }) === "Math");
t("uk spelling", /organises/.test(k.fill(k.STRENGTHS[6].v[0], { style: "uk", pronoun: "she" })) && /organizes/.test(k.fill(k.STRENGTHS[6].v[0], { style: "us", pronoun: "she" })));
t("no name gives [Name]", /^\[Name\]/.test(k.build({ strengths: ["kind"], stretch: "lead" }).text));
t("period", /Next trimester,/.test(k.build({ name: "Ava", pronoun: "they", strengths: ["kind"], stretch: "lead", period: "trimester" }).text));

// Limits: the opening strength and the next step survive; the name comes before any pronoun.
[0, 500, 400, 320, 260, 200, 140].forEach(function (L) {
  var opts = { name: "Ava", pronoun: "she", strengths: ["math", "persist"], moment: "", stretch: "research", limit: L };
  var x = k.build(opts);
  if (L === 0 || L >= 260) t("limit " + L + " met", !L || x.chars <= L);
  t("limit " + L + " starts with the name", /^Ava\b/.test(x.text));
  t("limit " + L + " keeps next step", /is ready to/.test(x.text));
});
t("limit too tight is flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["math"], stretch: "research", limit: 40 }).issues, "fix", /over your limit/));

// Checker
var c = function (s) { return k.check(s); };
t("stock pleasure", has(c("Ava is a pleasure to have in class. Next quarter she is ready to read more."), "review", /any student/));
t("keep up", has(c("Keep up the good work next quarter."), "review", /any student/));
t("role model", has(c("Ava is a role model. Next she will read more."), "review", /any student/));
t("gifted", has(c("Ava is gifted. Next she will read more."), "review", /praises what the student is/));
t("bright", has(c("Ava is very bright. Next she will read more."), "review", /praises/));
t("bright future not bright", !has(c("A bright idea in the science project. Next, we aim higher."), "review", /praises/));
t("comparison", has(c("Ava is the top student in the class. Next, more reading."), "fix", /Comparison/));
t("best in class", has(c("Ava is the best reader in the class. Next, more reading."), "fix", /Comparison/));
t("ahead of", has(c("Ava is ahead of the class. Next, more reading."), "fix", /Comparison/));
t("nothing to improve", has(c("There is nothing to improve."), "review", /leaves nothing/));
t("perfect", has(c("Ava does everything perfectly. Next, more."), "review", /leaves nothing/));
t("first attempt perfect ok", !has(c("Next, she will accept that a first draft is a starting point."), "review", /leaves nothing/));
t("potential", has(c("Ava has great potential. Next, more."), "review", /future/));
t("bored", has(c("Ava is bored in class. Next, more."), "review", /feeling/));
t("helper", has(c("Ava helps the weaker students finish their work. Next, more."), "review", /assistant/));
t("kind help ok", !has(c("Ava notices when a classmate needs help and offers it kindly. Next, more."), "review", /assistant/));
t("grades", has(c("Straight A's again. Next, more."), "note", /grade is already/));
t("well behaved", has(c("Ava is well behaved. Next, more."), "note", /doesn't do/));
t("always note", has(c("Ava always reads. Next, more."), "note", /rarely literally/));
t("iep", has(c("Ava's IEP goals are met. Next, more."), "fix", /Diagnosis/));
t("SEN case", has(c("Ava has SEN. Next, more."), "fix", /Support-plan/) && !has(c("Ava will send a letter. Next, more."), "fix", /Support-plan/));
t("family", has(c("Since the divorce Ava has read more. Next, more."), "fix", /Family/));
t("placeholder", has(c("[Name] reads. Next, more."), "fix", /Placeholder/));
t("no next", has(c("Ava reads widely."), "review", /No next step/));
t("no detail", has(c("Ava is lovely. Next, more."), "note", /No subject/));
t("detail ok", !has(c("Ava reads a lot. Next, more."), "note", /No subject/));
t("two !", has(c("Great! Well done! Next, more reading."), "review", /exclamation/));
t("mixed pronouns", has(c("She reads and his work is neat. Next, more."), "review", /Both/));
t("name missing", has(k.check("Ben reads. Next, more.", { name: "Ava" }), "review", /isn't in the comment/));
t("curly", has(c("Ava’s reading. Next, more."), "note", /Curly/) && k.plain("Ava’s — ok") === "Ava's, ok");
t("over limit", has(k.check("Ava reads books. Next, more.", { limit: 5 }), "fix", /over your limit/));
t("long sentence", has(c(new Array(35).join("reading ") + ". Next, more."), "note", /over 32/));
t("empty", has(c("  "), "fix", /Nothing/));
t("period in message", /this term/.test(k.check("A pleasure to have in class.", { style: "uk" }).map(function (i) { return i.msg; }).join()));
console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
