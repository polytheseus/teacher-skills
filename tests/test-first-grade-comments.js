// node tests/test-first-grade-comments.js
var k = require("../docs/guides/first-grade-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
function c(text, o) { return k.check(text, o || {}); }

// Every built comment, at every level, style, pronoun and timing, passes its own checker.
var styles = ["us", "ca", "uk", "au"], prons = ["she", "he", "they"], timings = ["early", "end"], lv = ["s", "g", "f"];
var all = 0, clean = 0, bad = [];
k.AREAS.forEach(function (a, i) {
  lv.forEach(function (l) {
    styles.forEach(function (st) { prons.forEach(function (p) { timings.forEach(function (tm) {
      ["Ava", "Noah", "Mia", "Leo"].forEach(function (nm) {
        var levels = {}; levels[a.id] = l; levels[k.AREAS[(i + 3) % k.AREAS.length].id] = "s";
        var r = k.build({ name: nm, pronoun: p, style: st, timing: tm, levels: levels, opening: "settled" });
        all++;
        var s = serious(r.issues.filter(function (x) { return !/No strength/.test(x.msg); }));
        if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined/.test(r.text)) clean++; else bad.push(a.id + "/" + l + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(s) + " " + r.text);
      });
    }); }); });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));
t("18 skills, 2 strengths and 2 on-track lines each", k.AREAS.length === 18 && k.AREAS.every(function (a) { return a.s.length === 2 && a.g.length === 2 && a.f && a.sch && a.home; }));

// "they" takes a plural verb in every sentence that can start with the pronoun.
k.AREAS.forEach(function (a) {
  a.s.concat(a.g).forEach(function (v) {
    var p = k.plural(v);
    t("plural: " + p, !/^(\w+s )/.test(p.replace(/^(across|is) /, "")) && !/\b(and|,) (corrects|needs|spots|rereads|shows|explains|adds|gets|makes|spells|leaves|follows|stays|checks|takes|includes|sorts|bounces|asks)\b/.test(p));
  });
});

// Basic build
var r = k.build({ name: "Maya", pronoun: "she", style: "us", moment: "read a whole page in a dinosaur voice.", levels: { phonics: "s", facts: "g", sentences: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("names first grade", /first grade/.test(r.text));
t("moment", /I loved seeing her read a whole page in a dinosaur voice\./.test(r.text));
t("subject groups", /In reading, Maya .*In math/.test(r.text));
t("pronoun alternates", /\. She|In math, she/.test(r.text));
t("on-track clause once", (r.text.match(/right on track/g) || []).length === 1);
t("next step with school", /Our next step is writing two or three sentences on one idea, which we're practicing in our daily writing time\./.test(r.text));
t("home tip from next step", /At home, you could write something real together/.test(r.text));
t("no issues", r.issues.length === 0);

// Wording by country
function txt(o) { return k.build(o).text; }
var opts = { name: "Leo", pronoun: "he", levels: { spelling: "f", time: "g", shapes: "s" }, opening: "confident" };
function st(s, extra) { var o = {}; for (var x in opts) o[x] = opts[x]; o.style = s; for (var y in extra || {}) o[y] = extra[y]; return o; }
t("US: period, math, quarter", /a period/.test(txt(st("us"))) && /In math/.test(txt(st("us"))) && /this quarter/.test(txt(st("us"))) && /practicing/.test(txt(st("us"))));
t("Canada: Grade 1 end of year", /Grade 2/.test(txt(st("ca", { timing: "end" }))) && /this term/.test(txt(st("ca"))) && /practising/.test(txt(st("ca"))));
t("UK: full stop, maths, term, the time", /a full stop/.test(txt(st("uk"))) && /In maths/.test(txt(st("uk"))) && /this term/.test(txt(st("uk"))));
t("the time / time", /telling the time/.test(txt({ name: "A", pronoun: "she", style: "uk", levels: { time: "f" } })) && /telling time/.test(txt({ name: "A", pronoun: "she", style: "us", levels: { time: "f" } })));
t("Australia: Year 2, semester, no September", /Year 2/.test(txt(st("au", { timing: "end" }))) && /this semester/.test(txt(st("au"))) && !/September/.test(txt(st("au", { timing: "end" }))));
var q = k.AREAS.filter(function (a) { return a.id === "shapes"; })[0];
t("fourths token present", /\{fourths\}/.test(q.home));
t("UK home tip says quarters", /quarters/.test(txt({ name: "A", pronoun: "she", style: "uk", levels: { shapes: "f" } })));
t("US home tip says fourths", /fourths/.test(txt({ name: "A", pronoun: "she", style: "us", levels: { shapes: "f" } })));
t("period override", /trimester/.test(txt({ name: "A", pronoun: "she", style: "us", period: "trimester", opening: "confident", levels: { phonics: "g" } })));
t("end of year", /next step for the summer/.test(txt({ name: "A", timing: "end", levels: { phonics: "f" } })) && /second grade/.test(txt({ name: "A", timing: "end", levels: { phonics: "s" } })));
t("end of year no on-track clause", !/on track/.test(txt({ name: "A", timing: "end", levels: { phonics: "g" } })));

// They
var they = k.build({ name: "Sam", pronoun: "they", style: "us", levels: { phonics: "s", sight: "s", fluency: "g" } });
t("they: plural verb after pronoun", /They (read|reads?)\b/.test(they.text) && !/They reads\b/.test(they.text));
t("they: no he/she words", !/\b(his|her|she|he)\b/i.test(they.text));

// Build limits and prompts
t("nothing picked", k.build({ name: "A", levels: {} }).ok === false);
t("no name -> placeholder flagged", has(k.build({ pronoun: "she", levels: { phonics: "s" } }).issues, "fix", /Placeholder/));
t("too many skills", has(k.build({ name: "A", levels: { phonics: "s", sight: "s", fluency: "g", vowels: "g", facts: "g", tens: "f" } }).issues, "review", /6 skills/));
t("too many next steps", has(k.build({ name: "A", levels: { phonics: "f", sight: "f", facts: "f" } }).issues, "review", /Three or more/));
t("strong only -> next-step note", has(k.build({ name: "A", levels: { phonics: "s" } }).issues, "note", /No next step picked/));
t("second next step", /We're also working on/.test(txt({ name: "A", levels: { phonics: "f", facts: "f" } })));
var long = { name: "Maya", pronoun: "she", moment: "read a whole page in a dinosaur voice", levels: { phonics: "s", fluency: "g", sentences: "f" } };
var full = k.build(long), fit = k.build(Object.assign({}, long, { limit: 600 }));
t("trims to fit the limit", full.chars > 600 && fit.chars <= 600 && !has(fit.issues, "fix", /limit/));
t("trim keeps next step and home tip", /Our next step/.test(fit.text) && /At home/.test(fit.text));
t("limit flagged", has(k.build({ name: "A", limit: 200, levels: { phonics: "s", facts: "f" } }).issues, "fix", /over your limit of 200/));

// Checker: first-grade specifics
var base = " Our next step is sounding out short words. At home, you could read together.";
t("label", has(c("Ava is lazy." + base), "fix", /lazy/));
t("disrupts and sloppy", has(c("Ava disrupts the class." + base), "fix", /disrupts/) && has(c("Noah is sloppy." + base), "fix", /sloppy/));
t("verdict names the conversation", has(c("Ava is behind in reading." + base), "review", /talk to the family first/));
t("six-year-old wording", has(c("Ava never listens." + base), "review", /six-year-old/));
t("reading level jargon", has(c("Ava reads at level E." + base), "review", /Jargon/));
t("Lexile jargon", has(c("Ava has a Lexile of 200." + base), "review", /Jargon/));
t("DIBELS jargon", has(c("Ava scored well on DIBELS." + base), "review", /Jargon/));
t("words per minute code", has(c("Ava read 40 WCPM." + base), "review", /Jargon/));
t("standards code", has(c("Ava met RF.1.3." + base), "review", /Jargon/));
t("math code", has(c("Ava met 1.OA.6." + base), "review", /Jargon/));
t("diagnosis", has(c("Ava may have dyslexia." + base), "fix", /./) || has(c("Ava may have dyslexia." + base), "review", /./));
t("family detail", has(c("Since the divorce Ava is sad." + base), "fix", /./) || has(c("Since the divorce Ava is sad." + base), "review", /./));
t("comparison", c("Ava reads better than most students." + base).some(function (i) { return i.level !== "note"; }));
t("UK fail phonics", has(c("Ava failed the phonics check." + base, { style: "uk" }), "review", /expected standard/));
t("US phonics rule off", !has(c("Ava failed the phonics check." + base, { style: "us" }), "review", /expected standard/));
t("UK flags first grade", has(c("Ava enjoys first grade." + base, { style: "uk" }), "review", /North American/));
t("AU flags math", has(c("Ava enjoys math." + base, { style: "au" }), "review", /North American/));
t("Canada keeps math and Grade 1", !has(c("Ava enjoys math in Grade 1." + base, { style: "ca" }), "review", /North American/));
t("mixed pronouns", has(c("She reads well and he adds well." + base), "review", /Both/));
t("no next step", has(c("Ava reads well at home."), "review", /No next step/));
t("empty", has(c(""), "fix", /Nothing/));
t("curly quotes plain", k.plain("“a” — b’s…") === "\"a\", b's...");

// Every level's wording, in every style, has no leftover template tokens.
k.AREAS.forEach(function (a) {
  ["us", "ca", "uk", "au"].forEach(function (s) {
    a.s.concat(a.g, [a.f, a.sch, a.home]).forEach(function (line) {
      t("filled " + a.id + "/" + s, !/\{/.test(k.fill(line, { name: "A", pronoun: "they", style: s })));
    });
  });
});

// When the character limit drops the opening, the comment still names the
// student before any pronoun ("I loved seeing her ..." with no name was the fault).
(function () {
  var built = 0, early = 0, dropped = 0, ex = "";
  ["she", "he", "they"].forEach(function (p) { [0, 1, 2, 3, 4, 5].forEach(function (seed) { [300, 400, 500, 600].forEach(function (limit) {
    k.AREAS.forEach(function (a, i) {
      var levels = {}; levels[a.id] = "s"; levels[k.AREAS[(i + 2) % k.AREAS.length].id] = "g"; levels[k.AREAS[(i + 4) % k.AREAS.length].id] = "f";
      var o = { name: "Zara" + seed, pronoun: p, style: "us", levels: levels, limit: limit, band: "35", moment: seed % 2 ? "" : "build a tall tower with a friend" };
      var r = k.build(o), full = k.build(Object.assign({}, o, { limit: 0 }));
      built++;
      if (r.text.indexOf("Zara") !== 0 && full.text.indexOf("Zara") === 0) dropped++;
      var ni = r.text.indexOf("Zara"), m = r.text.match(/\b(she|he|they|her|him|them|his|their)\b/i);
      if (m && (ni < 0 || m.index < ni)) { early++; if (!ex) ex = r.text.slice(0, 120); }
    });
  }); }); });
  t("opening dropped in some builds (" + dropped + " of " + built + ")", dropped > 10);
  t("no pronoun before the name when the opening is dropped" + (ex ? ": " + ex : ""), early === 0);
})();

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
