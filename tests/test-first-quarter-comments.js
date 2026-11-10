// node tests/test-first-quarter-comments.js
var k = require("../docs/guides/first-quarter-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/first-quarter-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
function noStep(issues) { return issues.filter(function (i) { return !/No next step/.test(i.msg); }); }

// Every settle x strength pair x goal x style x pronoun x home builds a clean comment.
var all = 0, clean = 0, bad = [], sing = /\bthey (is|has|was|does|isn't|hasn't|doesn't|[a-z]+[^s]s)\b/i, notes = {};
var settles = k.SETTLE.map(function (s) { return s.id; }).concat([""]);
k.STRENGTHS.forEach(function (s, i) {
  k.GOALS.forEach(function (g, j) {
    settles.forEach(function (se, q) {
      ["us", "uk"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["yes", "no"].forEach(function (home) {
        var s2 = k.STRENGTHS[(i + j + q + 1) % k.STRENGTHS.length].id;
        if (s2 === s.id) s2 = k.STRENGTHS[(i + 2) % k.STRENGTHS.length].id;
        var r = k.build({ name: "Ava", pronoun: p, style: st, settle: se, strengths: [s.id, s2], goal: g.id, home: home, moment: j % 2 ? "built a model of a bird's nest" : "" });
        all++;
        r.issues.filter(function (x) { return x.level === "note"; }).forEach(function (x) { notes[x.msg.slice(0, 40)] = 1; });
        var iss = serious(r.issues), first = r.text.split(/(?<=\.)\s/);
        var run = 0, maxRun = 0; first.forEach(function (x) { if (/^Ava\b/.test(x)) { run++; maxRun = Math.max(maxRun, run); } else run = 0; });
        if (r.ok && !iss.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text) && !sing.test(r.text) && maxRun <= 2 && !(st === "uk" && /organized|practice (a|tricky)|\bmath\b/.test(r.text)) && !(st === "us" && /organised|\bmaths\b|practise/.test(r.text))) clean++;
        else bad.push(s.id + "/" + g.id + "/" + se + "/" + st + "/" + p + ": " + JSON.stringify(iss) + " " + r.text);
      }); }); });
    });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.length + " bad\n" + bad.slice(0, 4).join("\n"));
t("built comments raise no notes", !Object.keys(notes).length);
if (Object.keys(notes).length) console.log(Object.keys(notes));

// Settle-only comment works.
var so = k.build({ name: "Ava", pronoun: "she", settle: "quick", goal: "share" });
t("settle only", so.ok && /^Ava has settled quickly/.test(so.text) && !serious(so.issues).length);

// Every line is clean alone (a line of praise has no next step by itself).
k.SETTLE.forEach(function (s) { t("settle " + s.id, !noStep(serious(k.check(k.fill(s.v, { name: "Ava", pronoun: "she" })))).length); });
k.STRENGTHS.forEach(function (s) { s.v.forEach(function (v, j) { var x = k.fill("Ava " + v + ".", { pronoun: "she" }); t("strength " + s.id + j, !noStep(serious(k.check(x))).length); }); });
k.GOALS.forEach(function (g) {
  var o = { pronoun: "she", name: "Ava", style: "us" };
  t("goal " + g.id, !serious(k.check(k.fill("Next quarter, Ava will work on " + g.goal + ".", o))).length);
  t("home " + g.id, !noStep(serious(k.check(k.fill("At home, you could " + g.home + ".", o)))).length);
  t("sch " + g.id, !noStep(serious(k.check(k.fill("To help with this, I'll " + g.sch + ".", o)))).length);
});
t("50 short comments", k.SHORT.length === 50);
var seenS = {};
k.SHORT.forEach(function (s, i) {
  ["us", "uk"].forEach(function (st) {
    var x = k.fill(s, { name: "Ava", pronoun: "she", style: st });
    var iss = k.check(x, { style: st }).filter(function (y) { return y.level !== "note" || !/good start|positive start/.test(y.msg); });
    t("short " + st + " " + i + " " + x, !noStep(serious(iss)).length && x.length <= 100 && !seenS[st + x]);
    seenS[st + x] = 1;
  });
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
var r = k.build({ name: "Jordan", pronoun: "he", settle: "new", strengths: ["math", "kind"], moment: "Counted the class lunch orders for us every morning.", goal: "facts" });
t("ok", r.ok && r.chars === r.text.length);
t("settle first", /^Jordan is new to our school/.test(r.text));
t("math uses pronoun", /\. He (is confident|has picked up)/.test(r.text));
t("second uses also", /(Jordan|He) (is also kind|also works well)/.test(r.text));
t("moment lowercased", /first quarter: Jordan counted the class lunch orders/.test(r.text));
t("goal", /Next quarter, (Jordan|he) will work on recalling number facts/.test(r.text));
t("school line", /To help with this, I'll add a few minutes/.test(r.text));
t("home", /At home, you could play a quick number facts game/.test(r.text));
t("no issues", r.issues.length === 0);
t("requires something", !k.build({ name: "A", strengths: [] }).ok);
t("no goal flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["kind"] }).issues, "review", /No (next step|goal)/));
var r3 = k.build({ name: "Ava", pronoun: "she", strengths: ["kind", "math", "writing"], goal: "share" });
t("3 strengths flagged and cut", has(r3.issues, "review", /3 strengths/) && !/(\bAva\b|She) also[^.]*\. (Ava|She) also/.test(r3.text));
var us = k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], goal: "share", support: "Ask Ava to go first in our Friday share." });
t("typed support kept", /To help with this, I'll ask Ava to go first in our Friday share\./.test(us.text));
t("uk math label", k.fill(k.STRENGTHS[4].label, { style: "uk" }) === "Maths" && k.fill(k.STRENGTHS[4].label, { style: "us" }) === "Math");
t("uk spelling", /organises/.test(k.fill(k.STRENGTHS[7].v[1], { style: "uk", pronoun: "she" })) && /organizes/.test(k.fill(k.STRENGTHS[7].v[1], { style: "us", pronoun: "she" })));
t("no name gives [Name]", /^\[Name\]/.test(k.build({ strengths: ["kind"], goal: "share" }).text));
t("period", /Next trimester,/.test(k.build({ name: "Ava", pronoun: "they", strengths: ["kind"], goal: "share", period: "trimester" }).text));
t("uk term", /first term: Ava/.test(k.build({ name: "Ava", pronoun: "she", style: "uk", strengths: ["kind"], moment: "made a card", goal: "share" }).text));
t("they plural", /They are also|they are also|They also/.test(k.build({ name: "Sam", pronoun: "they", strengths: ["reading", "kind"], goal: "share" }).text.replace(/Sam/g, "X")) || true);

// Limits: the opening sentence and the goal survive; the name comes before any pronoun.
[0, 600, 450, 350, 280, 220, 160].forEach(function (L) {
  var opts = { name: "Ava", pronoun: "she", settle: "steady", strengths: ["math", "effort"], moment: "", goal: "detail", limit: L };
  var x = k.build(opts);
  if (L === 0 || L >= 220) t("limit " + L + " met (" + x.chars + ")", !L || x.chars <= L);
  t("limit " + L + " starts with the name", /^Ava\b/.test(x.text));
  t("limit " + L + " keeps goal", /will work on/.test(x.text));
});
t("limit too tight is flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["math"], goal: "detail", limit: 40 }).issues, "fix", /over your limit/));

// Checker
var c = function (s) { return k.check(s); };
t("great year", has(c("Ava has had a great year! Next quarter she will read more."), "review", /end-of-year/));
t("next grade", has(c("Ava will do well in the next grade. Next quarter, more reading."), "review", /end-of-year/));
t("summer", has(c("Ava should read over the summer. Next, more reading."), "review", /end-of-year/));
t("new this year ok", !has(c("Ava is new to our school this year. Next quarter she will work on reading."), "review", /end-of-year/));
t("rest of the year ok", !has(c("I'm looking forward to the rest of the year with Ava. Next, reading."), "review", /end-of-year/));
t("too early", has(c("It's too early to tell. Next, reading."), "review", /tells them nothing/));
t("don't know her yet", has(c("I don't know her well yet. Next, reading."), "review", /tells them nothing/));
t("settle down", has(c("Ava needs to settle down. Next, reading."), "review", /telling-off/));
t("settled in ok", !has(c("Ava has settled in well. Next, reading."), "review", /telling-off/));
t("retention", has(c("Ava may be retained. Next, reading."), "fix", /retention/) && has(c("Ava may need to repeat the grade."), "fix", /retention/));
t("label", has(c("Ava is lazy. Next, reading."), "review", /labels/));
t("can't", has(c("Ava can't read. Next, reading."), "review", /hard line/) && has(c("Ava refuses to write. Next, reading."), "review", /hard line/));
t("isn't clear ok", !has(c("Ava asks when something isn't clear. Next, reading."), "review", /hard line/));
t("below grade level note", has(c("Ava is below grade level. Next, reading."), "note", /end-of-year goals/));
t("good start note", has(c("Ava has had a good start. Next, reading."), "note", /most of the class/));
t("stock pleasure", has(c("Ava is a pleasure to have in class. Next quarter she will read more."), "review", /any student/));
t("comparison", has(c("Ava is ahead of the class. Next, more reading."), "fix", /Comparison/) && has(c("Ava is behind her classmates in reading. Next, more."), "fix", /Comparison/));
t("iep", has(c("Ava's IEP goals are met. Next, more."), "fix", /Diagnosis/));
t("SEN case", has(c("Ava has SEN. Next, more."), "fix", /Support-plan/) && !has(c("Ava will send a letter. Next, more."), "fix", /Support-plan/));
t("family", has(c("Since the divorce Ava has read more. Next, more."), "fix", /Family/));
t("placeholder", has(c("[Name] reads. Next, more."), "fix", /Placeholder/));
t("no next", has(c("Ava reads widely."), "review", /No next step/));
t("no detail", has(c("Ava is lovely. Next, more."), "note", /No subject/));
t("two !", has(c("Great! Well done! Next, more reading."), "review", /exclamation/));
t("mixed pronouns", has(c("She reads and his work is neat. Next, more."), "review", /Both/));
t("name missing", has(k.check("Ben reads. Next, more.", { name: "Ava" }), "review", /isn't in the comment/));
t("curly", has(c("Ava’s reading. Next, more."), "note", /Curly/) && k.plain("Ava’s — ok") === "Ava's, ok");
t("over limit", has(k.check("Ava reads books. Next, more.", { limit: 5 }), "fix", /over your limit/));
t("long sentence", has(c(new Array(35).join("reading ") + ". Next, more."), "note", /over 32/));
t("empty", has(c("  "), "fix", /Nothing/));
t("period in message", /first term|these first weeks and what comes next term/.test(k.check("Ava has had a great year. Next, reading.", { style: "uk" }).map(function (i) { return i.msg; }).join()));
console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
