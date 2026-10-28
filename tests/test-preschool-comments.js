// node tests/test-preschool-comments.js
var k = require("../docs/guides/preschool-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every verb phrase starts with a verb the "they" form knows how to agree.
k.AREAS.forEach(function (a) { a.s.concat(a.g).forEach(function (vp) {
  var w = vp.split(" ")[0];
  t("verb known: " + w, /^(is|has)$/.test(w) || k.plural(vp) !== vp);
}); });
t("plural ies", k.plural("tidies up and washes hands") === "tidy up and wash hands");
t("plural list", k.plural("runs, jumps and climbs well") === "run, jump and climb well");
t("plural is", k.plural("is learning and has fun") === "are learning and have fun");

// Every built comment, at every level, style, pronoun and timing, passes its own checker.
var styles = ["us", "uk"], prons = ["she", "he", "they"], timings = ["early", "end"], lv = ["s", "g", "f"];
var all = 0, clean = 0, bad = [];
k.AREAS.forEach(function (a, i) {
  lv.forEach(function (l) {
    styles.forEach(function (st) { prons.forEach(function (p) { timings.forEach(function (tm) {
      var levels = {}; levels[a.id] = l; levels[k.AREAS[(i + 3) % k.AREAS.length].id] = "s";
      var r = k.build({ name: "Ava", pronoun: p, style: st, timing: tm, levels: levels, opening: "settled" });
      all++;
      var s = serious(r.issues);
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined/.test(r.text) && !/\b(they|They) (is|has|[a-z]+[^s]s) /.test(r.text.replace(/they do|They do/g, ""))) clean++;
      else bad.push(a.id + "/" + l + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(s) + " " + r.text);
    }); }); });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Two-year check: every area at every level, every pronoun, passes and covers all 3 prime areas.
var all2 = 0, clean2 = 0, bad2 = [];
k.TWO.forEach(function (a, i) { lv.forEach(function (l) { prons.forEach(function (p) {
  var levels = { "t-feel": "s", "t-talk": "g", "t-move": "g" }; levels[a.id] = l;
  var r = k.build({ name: "Ava", pronoun: p, style: "two", levels: levels });
  all2++;
  var s = serious(r.issues);
  if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined/.test(r.text) && /Personal, social and emotional development: /.test(r.text) && /Communication and language: /.test(r.text) && /Physical development: /.test(r.text)) clean2++;
  else bad2.push(a.id + "/" + l + "/" + p + ": " + JSON.stringify(s) + " " + r.text);
}); }); });
t("all " + all2 + " two-year summaries pass", clean2 === all2);
if (bad2.length) console.log(bad2.slice(0, 2).join("\n"));

// Basic build
var r = k.build({ name: "Rosa", pronoun: "she", style: "us", timing: "early", moment: "count all the ducks in our pond book.", levels: { friends: "s", counting: "g", listening: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("moment", /I loved seeing Rosa count all the ducks in our pond book\./.test(r.text));
t("pre-K", /pre-K/.test(r.text));
t("math lead", /In math, /.test(r.text));
t("on-track clause once", (r.text.match(/just right for this point/g) || []).length === 1);
t("next step + school", /Our next step is listening at group time.*practicing with listening games/.test(r.text));
t("home tip from next step", /At home, you could give two-step jobs/.test(r.text));
t("no issues", r.issues.length === 0);
var uk = k.build({ name: "Leo", pronoun: "he", style: "uk", timing: "early", levels: { shapes: "g", letters: "f", settling: "g" } });
t("UK words", /nursery/.test(uk.text) && /maths/.test(uk.text) && k.fill("{colour} {favourite}", { style: "uk" }) === "colour favourite" && /practising/.test(uk.text) && /recognising/.test(uk.text));
var us = k.build({ name: "Leo", pronoun: "he", style: "us", timing: "early", levels: { shapes: "g", letters: "f", settling: "g" } });
t("US words", k.fill("{colour} {favourite}", { style: "us" }) === "color favorite" && !/colour|recognis|favourite/.test(us.text) && /recognizing/.test(us.text));
var usPeg = k.build({ name: "Leo", pronoun: "he", style: "us", levels: { letters: "g" } });
var ukPeg = k.build({ name: "Leo", pronoun: "he", style: "uk", levels: { letters: "g" } });
t("cubby/peg", (/cubby/.test(usPeg.text) || !/peg/.test(usPeg.text)) && !/cubby/.test(ukPeg.text));
var end = k.build({ name: "Ava", pronoun: "she", style: "us", timing: "end", levels: { counting: "s" } });
t("end of year ready for kindergarten", /ready for kindergarten/.test(end.text) && /summer/.test(end.text));
t("needs a level", k.build({ levels: {} }).ok === false);
t("no name -> [Name]", /\[Name\]/.test(k.build({ levels: { counting: "s" } }).text));
var many = k.build({ name: "Ava", levels: { friends: "s", counting: "s", shapes: "g", books: "f", hands: "f", moving: "f" } });
t("too many areas", has(many.issues, "review", /6 areas/) && has(many.issues, "review", /Three or more next steps/));
var lim = k.build({ name: "Ava", pronoun: "she", style: "us", limit: 400, moment: "build a tall tower", levels: { friends: "s", counting: "g", listening: "f" } });
t("limit trims", lim.chars <= 400 || has(lim.issues, "fix", /over your limit/));
t("limit drops few-minutes first", !/A few minutes/.test(lim.text));

// Two-year mode details
var two = k.build({ name: "Theo", pronoun: "he", style: "two", senco: true, review: "four weeks", levels: { "t-play": "g", "t-feel": "s", "t-talk": "f", "t-understand": "g", "t-move": "s" } });
t("two title", /^Progress check at age 2: Theo/.test(two.text));
t("two extra support + how", /extra support: using more words/.test(two.text) && /How we'll help: naming things/.test(two.text));
t("two review weeks", /in four weeks/.test(two.text));
t("two senco", /SENCO/.test(two.text) && two.issues.length === 0);
t("two health visitor", /health visitor/.test(two.text));
var gap = k.build({ name: "Ivy", pronoun: "she", style: "two", levels: { "t-play": "s" } });
t("two missing prime areas flagged", has(gap.issues, "review", /Communication and language has nothing picked/) && has(gap.issues, "review", /Physical development has nothing picked/));
t("two pasted text without PD", has(k.check("Communication and language: Ivy talks. Personal, social and emotional development: Ivy plays. Next we will work on turns at home.", { style: "two" }), "review", /No "Physical development" section/));
t("two diagnosis is review, not fix", has(k.check("Ivy may have a speech delay. We'll work on words at home.", { style: "two" }), "review", /shouldn't name or suggest a diagnosis/));
t("two named condition is fix", has(k.check("Ivy may be autistic. We'll work on words at home.", { style: "two" }), "fix", /Diagnosis/));
t("report diagnosis is fix", has(k.check("Ivy may have a speech delay. We'll work on words at home.", { style: "us" }), "fix", /Diagnosis/));
t("SEND caps flagged", has(k.check("Ivy is on the SEND register. Next we work on words at home.", {}), "fix", /SEND/));
t("send lowercase fine", !has(k.check("We'll send home a book. Next, we'll work on counting at home.", {}), "fix", /Diagnosis/));
t("gold star fine", !k.check("Ivy got a gold star. Next, counting at home.", {}).some(function (i) { return /Jargon/.test(i.msg); }));

// Checker catches the "instead of" column
var BAD = [
  ["Rosa is very clingy at drop-off.", "fix", /Label/],
  ["Leo is naughty at circle time.", "fix", /Label/],
  ["Sam is behind in talking.", "review", /verdict/],
  ["Ava can't hold a pencil.", "review", /puts the gap first/],
  ["Noah never sits still.", "review", /rarely true/],
  ["Zara talks less than most children.", "fix", /Comparison/],
  ["Eli is the youngest in the class.", "fix", /Comparison/],
  ["Omar might be autistic.", "fix", /Diagnosis/],
  ["Since the new baby arrived, Mia is upset.", "fix", /Family/],
  ["Ruby's fine motor and self-regulation are emerging.", "review", /Jargon/],
  ["Kai should be talking in sentences by now.", "review", /judgement/],
  ["[Name] is a delight.", "fix", /Placeholder/],
  ["We are worried about Leo.", "review", /alarm/]
];
BAD.forEach(function (b) { t("catches: " + b[0], has(k.check(b[0] + " Next we'll work on turns at home.", { style: "us" }), b[1], b[2])); });
var mixed = k.check("Rosa plays well and she shares. He is learning to count. Next we work on numbers at home.", { name: "Rosa" });
t("mixed pronouns", has(mixed, "review", /she\/her/));
t("name missing", has(k.check("Leo plays well. Next, counting at home.", { name: "Rosa" }), "review", /isn't in the comment/));
t("no next step", has(k.check("Rosa plays well with friends. Thank you.", {}), "review", /No next step/));
t("no home tip", has(k.check("Rosa plays well. Our next step is counting.", {}), "note", /No home tip/));
t("curly + plain", has(k.check("Rosa’s next step is counting at home.", {}), "note", /Curly/) && k.plain("Rosa’s “next” — step…") === "Rosa's \"next\", step...");
t("exclamations", has(k.check("Great! Super! Next, counting at home.", {}), "review", /exclamation/));
t("stock phrase", has(k.check("Rosa is a joy to have in class. Next, counting at home.", {}), "note", /Stock phrase/));
t("empty", has(k.check("", {}), "fix", /Nothing/));

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
