// node tests/test-math-comments.js
var k = require("../docs/guides/math-comments.js");
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
    ["us", "uk", "au"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["hardworking", "curious", "growing", "none"].forEach(function (op, oi) {
      var levels = {}; levels[a.id] = lv; levels[list[(i + 3 + oi) % list.length].id] = LV[(j + 1) % 3];
      var r = k.build({ name: "Ava", pronoun: p, style: st, band: band, timing: tm, opening: op, levels: levels, grade: st === "au" && oi === 2 ? "C" : "", moment: oi === 1 ? "explained a method to a partner" : "" });
      all++;
      var s = serious(r.issues).filter(function (x) { return !/No strength/.test(x.msg); });
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text)) clean++;
      else bad.push([band, a.id, lv, st, p, tm, op].join("/") + ": " + JSON.stringify(s) + " " + r.text);
    }); }); }); });
  }); });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Every phrase on its own is clean, and plural() gives grammatical "they" forms.
var phrases = 0, phraseBad = [];
k.AREAS.forEach(function (a) { a.bands.forEach(function (band) {
  ["s", "g"].forEach(function (f) { k.bt(a[f], band).forEach(function (vp) {
    phrases++;
    var x = k.fill("Ava " + vp + ".", { pronoun: "she" });
    if (serious(k.check(x)).filter(function (i) { return !/No (next step)/.test(i.msg); }).length) phraseBad.push(x);
    var pl = k.plural(vp);
    if (/\b(knows|is|uses|works|explains|solves|checks|reads|adds|finds) /.test(pl.replace(/when a problem is|what each digit in a number is|that a letter can|a task is/g, ""))) phraseBad.push("plural: " + pl);
  }); });
  ["label", "f", "sch", "home"].forEach(function (f) { if (!k.bt(a[f], band)) phraseBad.push("missing " + a.id + "." + f + " " + band); });
}); });
t(phrases + " phrases clean and pluralise", !phraseBad.length);
if (phraseBad.length) console.log(phraseBad.slice(0, 5).join("\n"));

// Basic build
var r = k.build({ name: "Leo", pronoun: "he", band: "35", opening: "curious", moment: "Showed the class two ways to work out 25 x 12.", levels: { facts: "s", reasoning: "g", fractions: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("opening", /^Leo (is curious|likes to know)/.test(r.text));
t("moment lowercased", /I was impressed when Leo showed the class two ways to work out 25 x 12\./.test(r.text));
t("pronoun alternates", /\. He /.test(r.text));
t("on track tail once", (r.text.match(/right on track/g) || []).length === 1);
t("next step + sch", /Our next step is comparing fractions and finding equivalent fractions, which we're practicing with fraction strips/.test(r.text));
t("home tip from focus", /At home, you could use fractions when cooking/.test(r.text));
t("no issues", r.issues.length === 0);
var u = k.build({ name: "Isla", pronoun: "they", style: "uk", band: "35", levels: { facts: "f" } });
t("uk maths + practise", /maths/.test(u.text) && /practising/.test(u.text) && /practise one times table/.test(u.text) && !/\bmath\b/.test(u.text));
t("uk they possessive", /learning their times tables/.test(u.text));
var us = k.build({ name: "Isla", band: "35", levels: { facts: "f" } });
t("us practice", /practicing/.test(us.text) && /practice one times table/.test(us.text) && !/maths/.test(us.text));
var th = k.build({ name: "Sam", pronoun: "they", band: "k2", opening: "none", levels: { facts: "s", geometry: "s" } });
t("they plural verb", /They (know|recall|name|spot) /.test(th.text));
t("band filter", k.areasFor("k2").every(function (a) { return a.id !== "algebra"; }) && k.areasFor("68").some(function (a) { return a.id === "algebra"; }));
t("band labels", k.bt(k.area("facts").label, "35") === "Times tables" && k.bt(k.area("fractions").label, "68") === "Fractions, decimals and percentages");
t("bad band falls back", k.build({ name: "A", band: "zz", levels: { multdiv: "s" } }).ok && /divid|multipl/.test(k.build({ name: "A", band: "zz", levels: { multdiv: "s" } }).text));
t("area from wrong band ignored", k.build({ name: "A", band: "k2", levels: { algebra: "s" } }).ok === false);
t("no levels", k.build({ name: "A" }).ok === false);
var end = k.build({ name: "Maya", pronoun: "she", band: "68", timing: "end", opening: "growing", levels: { algebra: "g", ratio: "f" } });
t("end focus", /A good focus for next year is solving ratio/.test(end.text) && /Over the summer, you could/.test(end.text) && /this year/.test(end.text) && !/right on track/.test(end.text));
var strongEnd = k.build({ name: "Maya", band: "68", timing: "end", levels: { algebra: "s" } });
t("end strengths only summer line", /Over the summer, a few minutes of math games/.test(strongEnd.text));
t("early strengths only note", has(k.build({ name: "Maya", band: "68", levels: { algebra: "s" } }).issues, "note", /No next step picked/));
t("growing only builds on", /Next, we'll keep building on solving two-step equations/.test(k.build({ name: "Maya", band: "68", levels: { algebra: "g" } }).text));
t("five strands review", has(k.build({ name: "A", band: "35", levels: { facts: "s", place: "s", addsub: "g", multdiv: "g", fractions: "f" } }).issues, "review", /5 strands/));
t("three focus review", has(k.build({ name: "A", band: "35", levels: { facts: "f", place: "f", addsub: "f" } }).issues, "review", /Three or more next steps/));
t("issue msg filled", k.build({ name: "A", style: "uk", band: "35", levels: { facts: "f" } }).issues.every(function (i) { return !/\{math\}/.test(i.msg); }));
t("second focus", /We're also working on checking|also working on slowing down/.test(k.build({ name: "A", band: "35", levels: { facts: "f", checking: "f" } }).text));
var lim = k.build({ name: "Leo", pronoun: "he", band: "35", opening: "curious", moment: "showed the class two ways to work out 25 x 12", levels: { facts: "s", reasoning: "g", fractions: "f" }, limit: 540 });
t("limit trims optional sentences", lim.chars <= 540 && !/A few minutes a few times/.test(lim.text) && /Our next step/.test(lim.text));
t("limit over reports fix", has(k.build({ name: "Leo", band: "35", levels: { facts: "s", reasoning: "g", fractions: "f" }, limit: 150 }).issues, "fix", /over your limit/));

// Checker
function iss(text, o) { return k.check(text, o || { name: "Ava" }); }
var ok = "Ava knows her facts. Our next step is fractions. At home, you could cook together.";
t("clean baseline", iss(ok).length === 0);
t("lazy", has(iss("Ava is lazy. " + ok), "fix", /Label: "lazy"/));
t("careless", has(iss("Ava makes careless mistakes. " + ok), "review", /careless mistakes/));
t("bad at math", has(iss("Ava is bad at math. " + ok), "fix", /ability is fixed/));
t("not a maths person", has(iss("Ava is not a maths person. " + ok), "fix", /ability is fixed/));
t("not her strong suit", has(iss("Maths is not her strong suit. " + ok), "fix", /ability is fixed/));
t("weak", has(iss("Ava has weak number skills. " + ok), "review", /weak/));
t("anxiety", has(iss("Ava has math anxiety. " + ok), "review", /guess at a feeling/));
t("fingers note", has(iss("Ava still counts on her fingers. " + ok), "note", /normal stage/));
t("calculator", has(iss("Ava relies on a calculator. " + ok), "review", /calculator is a check/));
t("copying", has(iss("Ava has been copying answers. " + ok), "review", /academic honesty/));
t("can't", has(iss("Ava can't divide. " + ok), "review", /puts the gap first/));
t("doesn't know", has(iss("Ava doesn't know her tables. " + ok), "review", /puts the gap first/));
t("always", has(iss("Ava always rushes. " + ok), "review", /rarely true/));
t("bottom set", has(iss("Ava is in the bottom set. " + ok), "fix", /Comparison or set/));
t("top group", has(iss("Ava is in the top group. " + ok), "fix", /Comparison or set/));
t("than most", has(iss("Ava is faster than most students. " + ok), "fix", /Comparison/));
t("below grade level", has(iss("Ava is below grade level. " + ok), "review", /struggling-students/));
t("dyscalculia", has(iss("Ava may have dyscalculia. " + ok), "fix", /Diagnosis/));
t("iep", has(iss("Ava's IEP goals are going well. " + ok), "fix", /support-plan/));
t("like her dad", has(iss("Ava finds fractions hard, just like her dad. " + ok), "fix", /Family/));
t("mum bad at maths", has(iss("Her mum was bad at maths too. " + ok), "fix", /Family/));
t("jargon decompose", has(iss("Ava can decompose numbers. " + ok), "review", /Jargon: "decompose"/));
t("jargon regrouping", has(iss("Ava is learning regrouping. " + ok), "review", /Jargon/));
t("jargon standard code", has(iss("Ava meets 4.NF.1. " + ok), "review", /Jargon/));
t("jargon greater depth", has(iss("Ava is working at greater depth. " + ok), "review", /Jargon/));
t("stock phrase", has(iss("Ava is a joy to have in class. " + ok), "note", /Stock phrase/));
t("whiz", has(iss("Ava is a math whiz. " + ok), "note", /Stock phrase/));
t("placeholder", has(iss("[Name] knows her facts. " + ok), "fix", /Placeholder/));
t("by now", has(iss("Ava should know her tables by now. " + ok), "review", /judgement/));
t("needs to x3", has(iss("Ava needs to focus, needs to check and needs to finish. " + ok), "review", /3 times/));
t("no next step", has(iss("Ava knows her facts. At home, you could cook."), "review", /No next step/));
t("no home tip", has(iss("Ava knows her facts. Our next step is fractions."), "note", /No home tip/));
t("exclamations", has(iss("Great work! Well done! " + ok), "review", /exclamation/));
t("mixed pronouns", has(iss("Ava knows her facts and he is learning fractions. " + ok), "review", /copied/));
t("name missing", has(iss("Sam knows facts. Our next step is fractions. At home, you could cook."), "review", /isn't in the comment/));
t("full name", has(k.check(ok, { name: "Ava Jones" }), "note", /first name/));
t("uk math", has(k.check(ok + " She enjoys math.", { name: "Ava", style: "uk" }), "review", /UK families/));
t("us maths", has(k.check(ok + " She enjoys maths.", { name: "Ava", style: "us" }), "review", /US families/));
t("curly", has(iss(ok + " She said “yes”."), "note", /Curly/));
t("plain", k.plain("“a” – ‘b’…") === "\"a\", 'b'...");
t("long sentence", has(iss(ok + " " + Array(36).join("word ") + "end."), "note", /over 32 words/));
t("empty", has(k.check(""), "fix", /Nothing/));
t("slowing not slow", !iss("Ava is slowing down to check. Our next step is fractions. At home, you could cook.").some(function (i) { return /verdict/.test(i.msg); }));

// Every rewrite: the "before" is flagged, the "after" is clean.
var rw = require("../../ops/marketing/teacher-skills/guide-src/math-rewrites.json");
rw.forEach(function (r, i) {
  t("rewrite before flagged " + i, k.check(r[0]).some(function (x) { return !/No (next step|home tip)/.test(x.msg); }));
  t("rewrite after clean " + i, !k.check(r[1]).some(function (x) { return x.level !== "note" && !/No (next step|home tip)/.test(x.msg); }));
});
t("gives up", has(iss("Ava gives up easily. " + ok), "review", /character verdict/));


// Australia mode: wording, bands, semester, A-E grade agreement.
(function () {
  var au = { style: "au" };
  t("au bands", k.bandNames(au).k2 === "Foundation–Year 2" && k.bandNames(au)["35"] === "Years 3–5" && k.bandNames({ style: "uk" }).k2 === "Years 1–3" && k.bandNames({}).k2 === "Grades K–2");
  t("au period semester", k.fill("this {period}", au) === "this semester" && k.fill("this {period}", { style: "au", period: "term" }) === "this term");
  t("au UK spelling", /practis/.test(k.fill("practise", au)));
  var lv = {}; lv[k.areasFor("k2")[0].id] = "s"; lv[k.areasFor("k2")[1].id] = "f";
  var r = k.build({ name: "Ruby", pronoun: "she", style: "au", band: "k2", grade: "C", levels: lv });
  t("au C sentence", /Ruby is working at the expected standard in maths\./.test(r.text) && !/grade level/.test(r.text));
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
