// node tests/test-reading-writing-comments.js
var k = require("../docs/guides/reading-writing-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
var LV = ["s", "g", "f"];

// Every band x area x level, paired with a second strand, across style, pronoun,
// timing and opening, builds a comment that passes its own checker.
var all = 0, clean = 0, bad = [];
Object.keys(k.BANDS).forEach(function (band) {
  var list = k.areasFor(band);
  list.forEach(function (a, i) { LV.forEach(function (lv, j) {
    ["us", "uk", "au"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["hardworking", "curious", "creative", "growing", "none"].forEach(function (op, oi) {
      var levels = {}; levels[a.id] = lv; levels[list[(i + 3 + oi) % list.length].id] = LV[(j + 1) % 3];
      var r = k.build({ name: "Ava", pronoun: p, style: st, band: band, timing: tm, opening: op, levels: levels, grade: st === "au" && oi === 2 ? "C" : "", moment: oi === 1 ? "explained a character's choice to a partner" : "" });
      all++;
      var s = serious(r.issues).filter(function (x) { return !/No strength/.test(x.msg); });
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text)) clean++;
      else bad.push([band, a.id, lv, st, p, tm, op].join("/") + ": " + JSON.stringify(s) + " " + r.text);
    }); }); }); });
  }); });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Every phrase on its own is clean in both styles, and plural() changes the
// first verb for "they".
var phrases = 0, phraseBad = [];
k.AREAS.forEach(function (a) { a.bands.forEach(function (band) {
  ["s", "g"].forEach(function (f) { k.bt(a[f], band).forEach(function (vp) {
    phrases++;
    ["us", "uk"].forEach(function (st) {
      var x = k.fill("Ava " + vp + ".", { pronoun: "she", style: st });
      if (serious(k.check(x, { style: st })).filter(function (i) { return !/No (next step)/.test(i.msg); }).length) phraseBad.push(st + ": " + x);
    });
    var first = vp.split(" ")[0], pl = k.plural(vp);
    if (pl.split(" ")[0] === first) phraseBad.push("plural: " + pl);
    if (/ and (knows|reads|uses|is|has|makes|writes|spells|explains|picks|builds|takes|shares|acts|answers) /.test(pl)) phraseBad.push("plural mid: " + pl);
  }); });
  ["label", "f", "sch", "home"].forEach(function (f) { if (!k.bt(a[f], band)) phraseBad.push("missing " + a.id + "." + f + " " + band); });
  ["f", "sch", "home"].forEach(function (f) { ["us", "uk"].forEach(function (st) {
    var x = k.fill(k.bt(a[f], band), { name: "Ava", pronoun: "she", style: st });
    var bad2 = serious(k.check("Ava " + x + ".", { style: st })).filter(function (i) { return !/No (next step|home tip)/.test(i.msg); });
    if (bad2.length) phraseBad.push(a.id + "." + f + " " + st + ": " + JSON.stringify(bad2));
  }); });
}); });
t(phrases + " phrases clean and pluralise", !phraseBad.length);
if (phraseBad.length) console.log(phraseBad.slice(0, 5).join("\n"));

// Basic build
var r = k.build({ name: "Amara", pronoun: "she", band: "35", opening: "curious", moment: "Explained why the main character lied, using three clues.", levels: { inference: "s", spelling: "g", organisation: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("opening", /^Amara (is a curious reader|brings great questions)/.test(r.text));
t("moment lowercased", /I was impressed when Amara explained why the main character lied, using three clues\./.test(r.text));
t("pronoun alternates", /\. She /.test(r.text));
t("on track tail once", (r.text.match(/right on track/g) || []).length === 1);
t("next step + sch (US)", /Our next step is organizing writing into paragraphs, each with one main idea, which we're practicing with planning frames/.test(r.text));
t("home tip from focus", /At home, you could ask Amara to tell you the plan for a story/.test(r.text));
t("no issues", r.issues.length === 0);
var u = k.build({ name: "Isla", pronoun: "they", style: "uk", band: "k2", levels: { sentences: "f", sight: "g" } });
t("uk full stop + practise", /full stop in every sentence/.test(u.text) && /practising/.test(u.text) && !/period/.test(u.text));
t("uk tricky words", /tricky words/.test(u.text) && !/sight words/.test(u.text));
var us = k.build({ name: "Isla", band: "k2", levels: { sentences: "f", sight: "g" } });
t("us period + sight words", /a period in every sentence/.test(us.text) && /sight words/.test(us.text) && /practicing/.test(us.text));
t("us nonfiction", /nonfiction/.test(k.build({ name: "A", band: "35", levels: { nonfiction: "f" } }).text));
t("uk non-fiction", /non-fiction/.test(k.build({ name: "A", style: "uk", band: "35", levels: { nonfiction: "f" } }).text));
t("us favorite", /favorite/.test(k.build({ name: "A", band: "k2", levels: { fluency: "f" } }).text));
var th = k.build({ name: "Sam", pronoun: "they", band: "k2", opening: "none", levels: { phonics: "s", handwriting: "s" } });
t("they plural verb", /They (know|sound|form|write) /.test(th.text) && !/They (knows|sounds|forms|writes) /.test(th.text));
t("they has -> have", k.plural("has clear handwriting and takes pride") === "have clear handwriting and take pride");
t("band filter", k.areasFor("k2").every(function (a) { return a.id !== "analysis"; }) && k.areasFor("68").some(function (a) { return a.id === "analysis"; }) && k.areasFor("68").every(function (a) { return a.id !== "phonics" && a.id !== "handwriting"; }));
t("band labels", k.bt(k.area("opinion").label, "68") === "Argument writing" && k.fill(k.area("sight").label, { style: "uk" }) === "Tricky words");
t("comprehension label pronoun", k.fill(k.area("comprehension").label, { name: "Ava", pronoun: "he" }) === "Understanding what he reads");
t("groups", k.AREAS.every(function (a) { return k.GROUPS[a.group]; }));
t("bad band falls back", k.build({ name: "A", band: "zz", levels: { inference: "s" } }).ok);
t("area from wrong band ignored", k.build({ name: "A", band: "k2", levels: { analysis: "s" } }).ok === false);
t("no levels", k.build({ name: "A" }).ok === false);
var end = k.build({ name: "Maya", pronoun: "she", band: "68", timing: "end", opening: "growing", levels: { analysis: "g", opinion: "f" } });
t("end focus", /A good focus for next year is supporting claims/.test(end.text) && /Over the summer, you could/.test(end.text) && /this year/.test(end.text) && !/right on track/.test(end.text));
t("end strengths only summer line", /Over the summer, reading for pleasure/.test(k.build({ name: "Maya", band: "68", timing: "end", levels: { analysis: "s" } }).text));
t("early strengths only note", has(k.build({ name: "Maya", band: "68", levels: { analysis: "s" } }).issues, "note", /No next step picked/));
t("growing only builds on", /Next, we'll keep building on explaining how a writer/.test(k.build({ name: "Maya", band: "68", levels: { analysis: "g" } }).text));
t("five strands review", has(k.build({ name: "A", band: "35", levels: { fluency: "s", vocab: "s", spelling: "g", sentences: "g", editing: "f" } }).issues, "review", /5 skills/));
t("three focus review", has(k.build({ name: "A", band: "35", levels: { fluency: "f", vocab: "f", spelling: "f" } }).issues, "review", /Three or more next steps/));
t("second focus", /We're also working on/.test(k.build({ name: "A", band: "35", levels: { fluency: "f", editing: "f" } }).text));
var lim = k.build({ name: "Amara", pronoun: "she", band: "35", opening: "curious", moment: "explained why the main character lied", levels: { inference: "s", spelling: "g", organisation: "f" }, limit: 560 });
t("limit trims optional sentences", lim.chars <= 560 && !/A few minutes a few times/.test(lim.text) && /Our next step/.test(lim.text));
t("limit over reports fix", has(k.build({ name: "Leo", band: "35", levels: { inference: "s", spelling: "g", organisation: "f" }, limit: 150 }).issues, "fix", /over your limit/));

// Checker
function iss(text, o) { return k.check(text, o || { name: "Ava" }); }
var ok = "Ava reads widely. Our next step is paragraphs. At home, you could read together.";
t("clean baseline", iss(ok).length === 0);
t("lazy", has(iss("Ava is lazy. " + ok), "fix", /Label: "lazy"/));
t("reluctant reader", has(iss("Ava is a reluctant reader. " + ok), "review", /reluctant reader/));
t("struggling reader", has(iss("Ava is a struggling reader. " + ok), "review", /label families/));
t("messy", has(iss("Ava's handwriting is messy. " + ok), "review", /verdict/));
t("illegible", has(iss("Ava's writing is illegible. " + ok), "review", /verdict/));
t("poor speller", has(iss("Ava is a poor speller. " + ok), "fix", /ability is fixed/));
t("bad at spelling", has(iss("Ava is bad at spelling. " + ok), "fix", /ability is fixed/));
t("not a reader", has(iss("Ava is not a reader. " + ok), "fix", /ability is fixed/));
t("not a natural writer", has(iss("Ava is not a natural writer. " + ok), "fix", /ability is fixed/));
t("writing not her strength", has(iss("Writing is not her strength. " + ok), "fix", /ability is fixed/));
t("hates writing", has(iss("Ava hates writing. " + ok), "review", /guess at a feeling/));
t("doesn't enjoy reading", has(iss("Ava doesn't enjoy reading. " + ok), "review", /guess at a feeling/));
t("weak", has(iss("Ava's comprehension is weak. " + ok), "review", /weak/));
t("can't", has(iss("Ava can't spell. " + ok), "review", /puts the gap first/));
t("always", has(iss("Ava always rushes. " + ok), "review", /rarely true/));
t("bottom reading group", has(iss("Ava is in the bottom reading group. " + ok), "fix", /Comparison or group/));
t("top table", has(iss("Ava sits on the top table. " + ok), "fix", /Comparison/));
t("best reader in the class", has(iss("Ava is the best reader in the class. " + ok), "fix", /Comparison/));
t("than most", has(iss("Ava reads more than most students. " + ok), "fix", /Comparison/));
t("below grade level", has(iss("Ava is reading below grade level. " + ok), "review", /struggling-students/));
t("level letter", has(iss("Ava is reading at Level M. " + ok), "review", /Reading level letter/));
t("guided reading level", has(iss("Ava's guided reading level is J. " + ok), "review", /Reading level or score/));
t("lexile", has(iss("Ava has a Lexile of 520L. " + ok), "review", /Reading level or score/));
t("520L alone", has(iss("Ava reads at 520L. " + ok), "review", /Reading level or score/));
t("dra", has(iss("Ava's DRA 18 shows growth. " + ok), "review", /Reading level or score/));
t("reading age", has(iss("Ava has a reading age of 7. " + ok), "review", /Reading level or score/));
t("book band", has(iss("Ava is on the orange book band. " + ok), "review", /Reading level or score/));
t("no false level", !has(iss("Ava reads at a level that suits her. " + ok), "review", /Reading level/));
t("dyslexia", has(iss("Ava may have dyslexia. " + ok), "fix", /Diagnosis/));
t("speech therapy", has(iss("Ava goes to speech therapy. " + ok), "fix", /Diagnosis/));
t("iep", has(iss("Ava's IEP goals are going well. " + ok), "fix", /support-plan/));
t("ell", has(iss("Ava is an ELL student. " + ok), "review", /school category/));
t("eal", has(iss("As an EAL pupil, Ava is doing well. " + ok), "review", /school category/));
t("like her dad", has(iss("Ava finds spelling hard, just like her dad. " + ok), "fix", /Family/));
t("never reads at home", has(iss("Ava never reads at home. " + ok), "review", /blame/));
t("no books at home", has(iss("There are few books at home. " + ok), "review", /blame/));
t("reading log", has(iss("Ava's reading log is rarely signed. " + ok), "review", /blame/));
t("jargon digraph", has(iss("Ava knows her digraphs. " + ok), "review", /Jargon: "digraphs"/));
t("jargon decoding", has(iss("Ava's decoding is improving. " + ok), "review", /Jargon/));
t("jargon cvc", has(iss("Ava reads CVC words. " + ok), "review", /Jargon/));
t("jargon fronted adverbials", has(iss("Ava uses fronted adverbials. " + ok), "review", /Jargon/));
t("jargon standard code", has(iss("Ava meets RL.3.1. " + ok), "review", /Jargon/));
t("jargon greater depth", has(iss("Ava is working at greater depth. " + ok), "review", /Jargon/));
t("jargon cew", has(iss("Ava can spell the common exception words. " + ok), "review", /Jargon/));
t("stock bookworm", has(iss("Ava is a real bookworm. " + ok), "note", /Stock phrase/));
t("stock joy", has(iss("Ava is a joy to have in class. " + ok), "note", /Stock phrase/));
t("placeholder", has(iss("[Name] reads widely. " + ok), "fix", /Placeholder/));
t("by now", has(iss("Ava should know her sight words by now. " + ok), "review", /judgement/));
t("needs to x3", has(iss("Ava needs to read, needs to check and needs to finish. " + ok), "review", /3 times/));
t("no next step", has(iss("Ava reads widely. At home, you could read together."), "review", /No next step/));
t("no home tip", has(iss("Ava reads widely. Our next step is paragraphs."), "note", /No home tip/));
t("bedtime counts as home", !has(iss("Ava reads widely. Our next step is paragraphs. Read a story at bedtime."), "note", /No home tip/));
t("exclamations", has(iss("Great work! Well done! " + ok), "review", /exclamation/));
t("mixed pronouns", has(iss("Ava reads her books and he is learning paragraphs. " + ok), "review", /copied/));
t("name missing", has(iss("Sam reads. Our next step is paragraphs. At home, you could read together."), "review", /isn't in the comment/));
t("full name", has(k.check(ok, { name: "Ava Jones" }), "note", /first name/));
t("uk report US spelling", has(k.check(ok + " She loves her favorite books.", { name: "Ava", style: "uk" }), "review", /US wording/));
t("us report UK spelling", has(k.check(ok + " She is organising her ideas.", { name: "Ava", style: "us" }), "review", /UK wording/));
t("us report full stops", has(k.check(ok + " She uses full stops.", { name: "Ava", style: "us" }), "review", /UK wording/));
t("uk marking period ok", !has(k.check(ok + " This marking period went well.", { name: "Ava", style: "uk" }), "review", /US wording/));
t("check msg filled", iss("Ava's guided reading level is J. " + ok).every(function (i) { return !/\{/.test(i.msg); }));
t("curly", has(iss(ok + " She said “yes”."), "note", /Curly/));
t("plain", k.plain("“a” – ‘b’…") === "\"a\", 'b'...");
t("long sentence", has(iss(ok + " " + Array(36).join("word ") + "end."), "note", /over 32 words/));
t("empty", has(k.check(""), "fix", /Nothing/));

// Every rewrite: the "before" is flagged, the "after" is clean.
var rw = require("../../ops/marketing/teacher-skills/guide-src/reading-writing-rewrites.json");
rw.forEach(function (x, i) {
  t("rewrite before flagged " + i + " " + x[0], k.check(x[0]).some(function (y) { return !/No (next step|home tip)/.test(y.msg); }));
  t("rewrite after clean " + i + " " + x[1], !k.check(x[1]).some(function (y) { return y.level !== "note" && !/No (next step|home tip)/.test(y.msg); }));
});


// Australia mode: wording, bands, semester, A-E grade agreement.
(function () {
  var au = { style: "au" };
  t("au bands", k.bandNames(au).k2 === "Foundation–Year 2" && k.bandNames(au)["35"] === "Years 3–5" && k.bandNames({ style: "uk" }).k2 === "Years 1–3" && k.bandNames({}).k2 === "Grades K–2");
  t("au period semester", k.fill("this {period}", au) === "this semester" && k.fill("this {period}", { style: "au", period: "term" }) === "this term");
  t("au UK spelling", /practis/.test(k.fill("practise", au)));
  var lv = {}; lv[k.areasFor("k2")[0].id] = "s"; lv[k.areasFor("k2")[1].id] = "f";
  var r = k.build({ name: "Ruby", pronoun: "she", style: "au", band: "k2", grade: "C", levels: lv });
  t("au C sentence", /Ruby is working at the expected standard in English\./.test(r.text) && !/grade level/.test(r.text));
  t("au C clean", !serious(r.issues).length);
  var u = k.build({ name: "Ruby", pronoun: "she", style: "us", band: "k2", grade: "C", levels: lv });
  t("us C grade level", /grade level/.test(u.text));
  t("no grade no sentence", !/expected standard|grade level/.test(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "k2", levels: lv }).text));
  t("they C plural", /They are working at the expected standard|Ruby is working at the expected standard/.test(k.build({ name: "Ruby", pronoun: "they", style: "au", band: "k2", grade: "C", opening: "none", moment: "read a poem aloud", levels: lv }).text));
  var only = {}; only[k.areasFor("35")[0].id] = "f";
  t("A with no strength", has(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", grade: "A", levels: only }).issues, "review", /no (strand|skill) is a strength/));
  var st = {}; st[k.areasFor("35")[0].id] = "s";
  t("D without next step", has(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", grade: "D", levels: st }).issues, "review", /^A D needs one clear next step/));
  t("E article", has(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", grade: "E", levels: st }).issues, "review", /^An E needs/));
  var two = {}; two[k.areasFor("35")[0].id] = "s"; two[k.areasFor("35")[1].id] = "s"; two[k.areasFor("35")[2].id] = "f";
  t("D two strengths", has(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", grade: "D", levels: two }).issues, "review", /read like a B/));
  var gr = {}; gr[k.areasFor("k2")[0].id] = "g"; gr[k.areasFor("k2")[1].id] = "f";
  t("D no on-track tail", !/right on track/.test(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "k2", grade: "D", levels: gr }).text) && /right on track/.test(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "k2", grade: "C", levels: gr }).text));
  t("B fine", !serious(k.build({ name: "Ruby", pronoun: "she", style: "au", band: "35", grade: "B", levels: two }).issues).length);
  var ok = "Our next step is reading longer words. At home, you could read together.";
  function ci(x, g) { return k.check(x, { style: "au", grade: g || "" }); }
  t("au flags third grade", has(ci("Ruby is in third grade. " + ok), "review", /US wording/));
  t("au flags kindergartner", has(ci("Ruby was a confident kindergartner. " + ok), "review", /US wording/));
  t("au flags AC9", has(ci("Ruby meets AC9X4N01. " + ok), "review", /jargon/));
  t("au flags achievement standard", has(ci("Ruby meets the achievement standard. " + ok), "review", /jargon/));
  t("au flags Early Stage 1", has(ci("Ruby is in Early Stage 1. " + ok), "review", /jargon/));
  t("au NAPLAN note", has(ci("Ruby did well in NAPLAN. " + ok), "note", /NAPLAN/));
  t("au Year 3 fine", !serious(ci("Ruby has had a great semester in Year 3. " + ok)).length);
  t("au Grade 3 fine (Vic)", !serious(ci("Ruby has had a great semester in Grade 3. " + ok)).length);
  t("D excellent", has(ci("Ruby does excellent work. " + ok, "D"), "review", /beside a D/));
  t("E outstanding", has(ci("Ruby is outstanding. " + ok, "E"), "review", /beside an E/));
  t("A basic understanding", has(ci("Ruby has a basic understanding of this. " + ok, "A"), "review", /reads like a D or E/));
  t("C excellent note", has(ci("Ruby does excellent work. " + ok, "C"), "note", /beside a C/));
  t("no grade no grade checks", !ci("Ruby does excellent work. " + ok).some(function (i) { return /beside/.test(i.msg); }));
  t("us unaffected by au checks", !k.check("Ruby is in third grade. " + ok, { style: "us" }).some(function (i) { return /Australian/.test(i.msg); }));
})();

console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
