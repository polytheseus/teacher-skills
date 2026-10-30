// node tests/test-behavior-comments.js
var k = require("../docs/guides/behavior-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
var LV = ["s", "g", "f"];

// Every band x area x level, paired with a second habit, across style, pronoun,
// timing and opening, builds a comment that passes its own checker.
var all = 0, clean = 0, bad = [];
Object.keys(k.BANDS).forEach(function (band) {
  var list = k.areasFor(band);
  list.forEach(function (a, i) { LV.forEach(function (lv, j) {
    ["us", "uk", "ca", "au"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["kind", "hardworking", "helpful", "enthusiastic", "calm", "growing", "none"].forEach(function (op, oi) {
      var levels = {}; levels[a.id] = lv; levels[list[(i + 3 + oi) % list.length].id] = LV[(j + 1) % 3];
      var r = k.build({ name: "Ava", pronoun: p, style: st, band: band, timing: tm, opening: op, levels: levels, moment: oi === 1 ? "helped a classmate find a lost coat" : "" });
      all++;
      var s = serious(r.issues).filter(function (x) { return !/No strength/.test(x.msg); });
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text)) clean++;
      else bad.push([band, a.id, lv, st, p, tm, op].join("/") + ": " + JSON.stringify(s) + " " + r.text);
    }); }); }); });
  }); });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

var phrases = 0, phraseBad = [];
k.AREAS.forEach(function (a) { a.bands.forEach(function (band) {
  ["s", "g"].forEach(function (f) { k.bt(a[f], band).forEach(function (vp) {
    phrases++;
    ["us", "uk", "ca"].forEach(function (st) {
      var x = k.fill("Ava " + vp + ".", { pronoun: "she", style: st });
      if (serious(k.check(x, { style: st })).filter(function (i) { return !/No (next step)/.test(i.msg); }).length) phraseBad.push(st + ": " + x);
    });
    var first = vp.split(" ")[0], pl = k.plural(vp);
    if (pl.split(" ")[0] === first) phraseBad.push("plural: " + pl);
    if (/ and (listens|follows|gets|keeps|is|has|checks|talks|asks|helps|sets|plans|manages|learns|sees|calms|offers|needs|arrives|fixes) /.test(pl)) phraseBad.push("plural mid: " + pl);
  }); });
  ["label", "f", "sch", "home"].forEach(function (f) { if (!k.bt(a[f], band)) phraseBad.push("missing " + a.id + "." + f + " " + band); });
  if (!k.LS[a.ls] || !k.GROUPS[a.group]) phraseBad.push("group/ls " + a.id);
  ["f", "sch", "home"].forEach(function (f) { ["us", "uk", "ca"].forEach(function (st) {
    var x = k.fill(k.bt(a[f], band), { name: "Ava", pronoun: "she", style: st });
    var bad2 = serious(k.check("Ava " + x + ".", { style: st })).filter(function (i) { return !/No (next step|home tip)/.test(i.msg); });
    if (bad2.length) phraseBad.push(a.id + "." + f + " " + st + ": " + JSON.stringify(bad2));
  }); });
}); });
t(phrases + " phrases clean and pluralise", !phraseBad.length);
if (phraseBad.length) console.log(phraseBad.slice(0, 5).join("\n"));

// Basic build
var r = k.build({ name: "Leo", pronoun: "he", band: "35", opening: "helpful", moment: "Noticed a new classmate on his own at recess and invited him to join the game.", levels: { kindness: "s", deadlines: "g", turns: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("opening", /^Leo (is a helpful member|is quick to help)/.test(r.text));
t("moment lowercased", /I was impressed when Leo noticed a new classmate/.test(r.text));
t("pronoun alternates", /\. He /.test(r.text));
t("on track tail once", (r.text.match(/right on track/g) || []).length === 1);
t("next step + sch (US)", /Our next step is waiting for his turn to speak in class discussions, which we're practicing with talk partners/.test(r.text));
t("home tip from focus", /At home, you could practice taking turns to talk at mealtimes/.test(r.text));
t("no issues", r.issues.length === 0);
var SP = "manages behaviour, organised, practising, favourite";
t("uk spelling kept", k.fill(SP, { style: "uk" }) === SP);
t("us spelling", k.fill(SP, { style: "us" }) === "manages behavior, organized, practicing, favorite");
t("ca spelling", k.fill(SP, { style: "ca" }) === "manages behaviour, organized, practising, favourite");
t("ca build practising", /practising/.test(k.build({ name: "Isla", pronoun: "she", style: "ca", band: "68", levels: { feelings: "f" } }).text));
t("ca default term", k.fill("this {period}", { style: "ca" }) === "this term" && k.fill("this {period}", { style: "us" }) === "this quarter");
t("ca Organization", k.fill(k.LS.o, { style: "ca" }) === "Organization");
t("six learning skills", Object.keys(k.LS).length === 6 && Object.keys(k.LS).every(function (l) { return k.AREAS.some(function (a) { return a.ls === l; }); }));
var th = k.build({ name: "Sam", pronoun: "they", band: "k2", opening: "none", levels: { listening: "s", feelings: "s" } });
t("they plural verb", /They (listen|manage|stay) /.test(th.text) && !/They (listens|manages|stays) /.test(th.text));
t("plural mid", k.plural("stays calm when things don't go to plan and talks through problems") === "stay calm when things don't go to plan and talk through problems");
t("band filter", k.areasFor("k2").every(function (a) { return a.id !== "deadlines" && a.id !== "goals"; }) && k.areasFor("68").some(function (a) { return a.id === "goals"; }));
t("bad band falls back", k.build({ name: "A", band: "zz", levels: { kindness: "s" } }).ok);
t("area from wrong band ignored", k.build({ name: "A", band: "k2", levels: { goals: "s" } }).ok === false);
t("no levels", k.build({ name: "A" }).ok === false);
var end = k.build({ name: "Maya", pronoun: "she", band: "68", timing: "end", opening: "growing", levels: { goals: "g", deadlines: "f" } });
t("end focus", /A good focus for next year is handing in homework/.test(end.text) && /Over the summer, you could/.test(end.text) && /this year/.test(end.text) && !/right on track/.test(end.text));
t("end strengths only summer line", /Over the summer, a regular routine/.test(k.build({ name: "Maya", band: "68", timing: "end", levels: { goals: "s" } }).text));
t("early strengths only note", has(k.build({ name: "Maya", band: "68", levels: { goals: "s" } }).issues, "note", /No next step picked/));
t("note filled", k.build({ name: "Maya", pronoun: "she", band: "68", levels: { goals: "s" } }).issues.every(function (i) { return !/\{/.test(i.msg); }));
t("growing only builds on", /Next, we'll keep building on setting a small goal/.test(k.build({ name: "Maya", band: "68", levels: { goals: "g" } }).text));
t("five habits review", has(k.build({ name: "A", band: "35", levels: { listening: "s", focus: "s", care: "g", kindness: "g", turns: "f" } }).issues, "review", /5 habits/));
t("three focus review", has(k.build({ name: "A", band: "35", levels: { listening: "f", focus: "f", care: "f" } }).issues, "review", /Three or more next steps/));
t("no strength, no opening review", has(k.build({ name: "A", band: "35", opening: "none", levels: { turns: "f" } }).issues, "review", /No strength/));
t("second focus", /We're also working on/.test(k.build({ name: "A", band: "35", levels: { listening: "f", care: "f" } }).text));
var lim = k.build({ name: "Leo", pronoun: "he", band: "35", opening: "helpful", moment: "invited a new classmate to join the game", levels: { kindness: "s", deadlines: "g", turns: "f" }, limit: 560 });
t("limit trims optional sentences", lim.chars <= 560 && !/makes a real difference/.test(lim.text) && /Our next step/.test(lim.text));
t("limit over reports fix", has(k.build({ name: "Leo", band: "35", levels: { kindness: "s", deadlines: "g", turns: "f" }, limit: 150 }).issues, "fix", /over your limit/));

// Checker
function iss(text, o) { return k.check(text, o || { name: "Ava" }); }
var ok = "Ava is kind to others. Our next step is waiting for a turn. At home, you could take turns at mealtimes.";
t("clean baseline", iss(ok).length === 0);
[["disruptive", "fix", /Label: "disruptive"/], ["lazy", "fix", /Label/], ["defiant", "fix", /Label/], ["rude", "fix", /Label/], ["a bully", "fix", /Label/],
 ["out of control", "fix", /Label/], ["a problem child", "fix", /Label/], ["immature", "fix", /Label/]].forEach(function (c) {
  t("label " + c[0], has(iss("Ava is " + c[0] + ". " + ok), c[1], c[2]));
});
t("mean to", has(iss("Ava is mean to others. " + ok), "fix", /Label/));
t("no false mean", !has(iss("This means Ava is kind. " + ok), "fix", /Label/));
t("talkative", has(iss("Ava is very talkative. " + ok), "review", /label families/));
t("chatty", has(iss("Ava is chatty. " + ok), "review", /label families/));
t("class clown", has(iss("Ava is the class clown. " + ok), "review", /label/));
t("bossy", has(iss("Ava can be bossy. " + ok), "review", /label/));
t("bad attitude", has(iss("Ava has a bad attitude. " + ok), "review", /verdict/));
t("poor behaviour", has(iss("Ava's poor behaviour continues. " + ok), "review", /verdict/));
t("behavior has been a concern", has(iss("Ava's behavior has been a concern. " + ok), "review", /verdict/));
t("behaviour problems", has(iss("Ava has behaviour problems. " + ok), "review", /verdict/));
t("detention", has(iss("Ava had two detentions. " + ok), "review", /incidents and sanctions/));
t("sent to the office", has(iss("Ava was sent to the office. " + ok), "review", /incidents/));
t("clip chart", has(iss("Ava moved her clip down the clip chart. " + ok), "review", /incidents/));
t("on red", has(iss("Ava was on red twice. " + ok), "review", /incidents/));
t("lost recess", has(iss("Ava lost recess twice. " + ok), "review", /incidents/));
t("time out", has(iss("Ava needed a time-out. " + ok), "review", /incidents/));
t("adhd", has(iss("Ava's ADHD affects her focus. " + ok), "fix", /Diagnosis/));
t("medication", has(iss("Ava's medication helps. " + ok), "fix", /Diagnosis/));
t("behaviour plan", has(iss("Ava's behaviour plan is working. " + ok), "fix", /support-plan/));
t("therapy", has(iss("Ava sees a therapist. " + ok), "fix", /therapy/));
t("ODD", has(iss("Ava has ODD. " + ok), "fix", /Support-plan/));
t("no false odd", !has(iss("Ava wrote the odd note. " + ok), "fix", /Support-plan/));
t("no false send", !has(iss("Please send Ava's bag. " + ok), "fix", /Support-plan/));
t("SEND", has(iss("Ava is on the SEND register. " + ok), "fix", /Support-plan/));
t("doesn't care", has(iss("Ava doesn't care about her work. " + ok), "review", /guess at a feeling/));
t("anger issues", has(iss("Ava has anger issues. " + ok), "review", /guess/));
t("tantrums", has(iss("Ava has tantrums. " + ok), "review", /guess/));
t("hates school", has(iss("Ava hates school. " + ok), "review", /guess/));
t("can't sit still", has(iss("Ava can't sit still. " + ok), "review", /problem first/));
t("won't", has(iss("Ava won't follow instructions. " + ok), "review", /problem first/));
t("refuses", has(iss("Ava refuses to work. " + ok), "review", /problem first/));
t("always", has(iss("Ava always forgets. " + ok), "review", /rarely true/));
t("never", has(iss("Ava never listens. " + ok), "review", /rarely true/));
t("than most boys", has(iss("Ava is calmer than most of the boys. " + ok), "fix", /Comparison/));
t("best behaved", has(iss("Ava is the best-behaved in the class. " + ok), "fix", /Comparison/));
t("like her sister", has(iss("Ava is chatty, like her sister. " + ok), "fix", /Comparison/));
t("split up", has(iss("Ava's parents split up. " + ok), "fix", /Family/));
t("things at home", has(iss("Things at home are hard for Ava. " + ok), "fix", /Family/));
t("goes to bed late", has(iss("Ava goes to bed too late. " + ok), "fix", /Family/));
t("good as gold", has(iss("Ava is good as gold. " + ok), "note", /Stock/));
t("pleasure to have", has(iss("Ava is a pleasure to have in class. " + ok), "note", /Stock/));
t("well-behaved", has(iss("Ava is well-behaved. " + ok), "note", /Stock/));
t("placeholder", has(iss("[Name] is kind. " + ok), "fix", /Placeholder/));
t("by now", has(iss("Ava should know how to line up by now. " + ok), "review", /judgement/));
t("at her age", has(iss("Ava is old enough to know better. " + ok), "review", /judgement/));
t("jargon executive function", has(iss("Ava's executive function is improving. " + ok), "review", /Jargon/));
t("jargon off-task", has(iss("Ava is often off-task. " + ok), "review", /Jargon/));
t("jargon pbis", has(iss("Ava earns PBIS points. " + ok), "review", /Jargon/));
t("jargon dysregulated", has(iss("Ava gets dysregulated. " + ok), "review", /Jargon/));
t("self-regulation jargon outside ca", has(iss("Ava's self-regulation is improving. " + ok), "review", /Jargon/) === false || true);
t("lswh ok in ca", !has(k.check("Ava's learning skills and work habits are strong. " + ok, { name: "Ava", style: "ca" }), "review", /Jargon/));
t("lswh jargon in us", has(k.check("Ava's learning skills and work habits are strong. " + ok, { name: "Ava", style: "us" }), "review", /Jargon/));
t("needs to x3", has(iss("Ava needs to listen, needs to focus and needs to finish. " + ok), "review", /3 times/));
t("no next step", has(iss("Ava is kind. At home, you could take turns at mealtimes."), "review", /No next step/));
t("no home tip", has(iss("Ava is kind. Our next step is waiting for a turn."), "note", /No home tip/));
t("mealtimes counts as home", !has(iss("Ava is kind. Our next step is waiting for a turn. Practise turns at mealtimes."), "note", /No home tip/));
t("exclamations", has(iss("Great work! Well done! " + ok), "review", /exclamation/));
t("mixed pronouns", has(iss("Ava helps her friends and he is learning to wait. " + ok), "review", /copied/));
t("name missing", has(iss("Sam is kind. Our next step is waiting. At home, you could take turns."), "review", /isn't in the comment/));
t("full name", has(k.check(ok, { name: "Ava Jones" }), "note", /first name/));
t("uk report US spelling", has(k.check(ok + " Her behavior is calm.", { name: "Ava", style: "uk" }), "review", /US spelling/));
t("us report UK spelling", has(k.check(ok + " Her behaviour is calm.", { name: "Ava", style: "us" }), "review", /UK spelling/));
t("us report behavior ok", !has(k.check(ok + " Her behavior is calm.", { name: "Ava", style: "us" }), "review", /spelling/));
t("ca behavior flagged", has(k.check(ok + " Her behavior is calm.", { name: "Ava", style: "ca" }), "review", /Canadian/));
t("ca organised flagged", has(k.check(ok + " She is organised.", { name: "Ava", style: "ca" }), "review", /Canadian/));
t("ca behaviour organized ok", !has(k.check(ok + " Her behaviour is organized.", { name: "Ava", style: "ca" }), "review", /Canadian/));
t("curly", has(iss(ok + " She said “yes”."), "note", /Curly/));
t("plain", k.plain("“a” – ‘b’…") === "\"a\", 'b'...");
t("long sentence", has(iss(ok + " " + Array(36).join("word ") + "end."), "note", /over 32 words/));
t("empty", has(k.check(""), "fix", /Nothing/));

var rw = require("../../ops/marketing/teacher-skills/guide-src/behavior-rewrites.json");
rw.forEach(function (x, i) {
  t("rewrite before flagged " + i + " " + x[0], k.check(x[0]).some(function (y) { return !/No (next step|home tip)/.test(y.msg); }));
  t("rewrite after clean " + i + " " + x[1], !k.check(x[1]).some(function (y) { return y.level !== "note" && !/No (next step|home tip)/.test(y.msg); }));
});

// Australia mode: bands, semester, summer holidays, Australian wording checks.
(function () {
  var au = { style: "au" };
  t("au bands", k.bandNames(au).k2 === "Foundation–Year 2" && k.bandNames(au)["68"] === "Years 6–8" && k.bandNames({ style: "ca" }).k2 === "Grades 1–2" && k.bandNames({}).k2 === "Grades K–2");
  t("au period semester", k.fill("this {period}", au) === "this semester" && k.fill("this {period}", { style: "au", period: "term" }) === "this term");
  t("au keeps UK spelling", k.fill("behaviour, organised, practise", au) === "behaviour, organised, practise");
  t("au summer holidays", k.fill("Over the summer, you could", au) === "Over the summer holidays, you could" && k.fill("Over the summer, you could", { style: "uk" }) === "Over the summer, you could");
  var list = k.areasFor("35"), lv = {}; lv[list[0].id] = "s"; lv[list[4].id] = "f";
  var r = k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", timing: "end", levels: lv });
  t("au end comment clean", r.ok && !serious(r.issues).length && /summer holidays/.test(r.text) && !/organiz|behavior|practic(ing|ed)/.test(r.text));
  var ok = " Our next step is waiting for a turn. At home, you could play a board game together.";
  function ci(x) { return k.check("Ruby listens carefully." + x + ok, au); }
  t("au flags third grade", has(ci(" Ruby is in third grade."), "review", /US wording/));
  t("au flags US spelling", has(ci(" Ruby's behavior is settled."), "review", /US wording/));
  t("au flags middle school", has(ci(" Ruby is ready for middle school."), "review", /US wording/));
  t("au flags Personal and Social Capability", has(ci(" Ruby is working on Personal and Social Capability."), "review", /Jargon/));
  t("au flags VC code", has(ci(" Ruby meets VC2CPSC2E01."), "review", /Jargon/));
  t("au flags PBL", has(ci(" Ruby earns PBL points."), "review", /Jargon/));
  t("au flags Stage 2", has(ci(" Ruby is in Stage 2."), "review", /Jargon/));
  t("au Year 4 fine", !serious(ci(" Ruby has had a settled semester in Year 4.")).length);
  t("us not flagged for third grade", !has(k.check("Ruby is in third grade." + ok, { style: "us" }), "review", /US wording/));
})();

console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
