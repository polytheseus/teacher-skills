// node tests/test-kinder-comments.js
var k = require("../docs/guides/kinder-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every built comment, at every level, style, pronoun and timing, passes its own checker.
var styles = ["us", "uk", "au", "au-kindy", "au-prep", "au-reception", "au-pp", "au-transition"], prons = ["she", "he", "they"], timings = ["early", "end"], lv = ["s", "g", "f"];
var all = 0, clean = 0, bad = [];
k.AREAS.forEach(function (a, i) {
  lv.forEach(function (l) {
    styles.forEach(function (st) { prons.forEach(function (p) { timings.forEach(function (tm) {
      var levels = {}; levels[a.id] = l; levels[k.AREAS[(i + 3) % k.AREAS.length].id] = "s";
      var r = k.build({ name: "Ava", pronoun: p, style: st, timing: tm, levels: levels, opening: "settled" });
      all++;
      var s = serious(r.issues.filter(function (x) { return !/No strength/.test(x.msg); }));
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined/.test(r.text)) clean++; else bad.push(a.id + "/" + l + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(s) + " " + r.text);
    }); }); });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Basic build
var r = k.build({ name: "Maya", pronoun: "she", style: "us", timing: "early", moment: "count every block in the tower she built.", levels: { letters: "s", counting: "s", sight: "g", writing: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("moment sentence", /I loved seeing Maya count every block in the tower she built\./.test(r.text));
t("subject groups", /In reading, Maya .*In math/.test(r.text));
t("pronoun alternates", /\. She /.test(r.text));
t("on-track clause once", (r.text.match(/right on track/g) || []).length === 1);
t("next step with school", /Our next step is writing her name.*practicing in our daily writing time\./.test(r.text));
t("home tip from next step", /At home, you could let Maya write/.test(r.text));
t("US spelling", /practicing/.test(r.text) && !/practising/.test(r.text) && /kindergarten|quarter/.test(r.text));
t("no issues", r.issues.length === 0);
var uk = k.build({ name: "Leo", pronoun: "he", style: "uk", timing: "early", levels: { numbers: "f", sounds: "g" } });
t("UK spelling", /maths/.test(uk.text) && /practising/.test(uk.text) && /term/.test(uk.text) && /Reception/.test(uk.text));
t("UK recognising", /recognising/.test(uk.text));
var us = k.build({ name: "Leo", pronoun: "he", style: "us", timing: "early", levels: { numbers: "f" } });
t("US recognizing", /recognizing/.test(us.text) && !/recognis/.test(us.text));
var end = k.build({ name: "Leo", pronoun: "he", style: "uk", timing: "end", levels: { friends: "s", numbers: "g", motor: "f" } });
t("end of year next step", /next step for the summer is a comfortable pencil grip/.test(end.text));
t("end of year no on-track clause", !/on track/.test(end.text));
t("end of year close", /Year 1/.test(end.text));
var they = k.build({ name: "Sam", pronoun: "they", style: "us", timing: "early", levels: { letters: "s", sight: "s", rhyme: "g" } });
t("they plural verb", /They (read|have learned|hear|are|can)/.test(they.text) && !/They (reads|has|is|hears)\b/.test(they.text));
t("they possessive", !/\b(his|her)\b/.test(they.text));
t("period override", /trimester/.test(k.build({ name: "A", pronoun: "she", period: "trimester", opening: "confident", levels: { letters: "g" } }).text));
t("no name -> placeholder flagged", has(k.build({ pronoun: "she", levels: { letters: "s" } }).issues, "fix", /Placeholder/));
t("nothing picked", k.build({ name: "A", levels: {} }).ok === false);
t("too many skills", has(k.build({ name: "A", levels: { letters: "s", sounds: "s", rhyme: "g", sight: "g", books: "g", writing: "f" } }).issues, "review", /6 skills/));
t("too many next steps", has(k.build({ name: "A", levels: { letters: "f", sounds: "f", rhyme: "f" } }).issues, "review", /Three or more/));
t("no strength (no opening) review", has(k.build({ name: "A", opening: "none", levels: { letters: "g" } }).issues, "review", /No strength/));
t("no strength with opening = note", has(k.build({ name: "A", opening: "kind", levels: { letters: "g" } }).issues, "note", /No strength/));
t("strong only -> next-step note", has(k.build({ name: "A", levels: { letters: "s" } }).issues, "note", /No next step picked/));
t("strong only end: no note", !has(k.build({ name: "A", timing: "end", levels: { letters: "s" } }).issues, "note", /No next step/));
t("second next step", /We're also working on/.test(k.build({ name: "A", levels: { letters: "f", counting: "f" } }).text));
t("opening none", /^In reading/.test(k.build({ name: "A", opening: "none", levels: { letters: "s" } }).text));
var seen = {}; ["Ava", "Noah", "Mia", "Leo", "Zoe", "Eli"].forEach(function (n) { seen[k.build({ name: n, levels: { letters: "s" } }).text.split(n).join("X")] = 1; });
t("wording varies by child", Object.keys(seen).length >= 2);
t("end opening", /wonderful year|great progress this year/.test(k.build({ name: "A", timing: "end", levels: { letters: "s" } }).text));
var full = k.build({ name: "Maya", pronoun: "she", moment: "count every block", levels: { letters: "s", sight: "g", writing: "f" } });
var fit = k.build({ name: "Maya", pronoun: "she", moment: "count every block", limit: 600, levels: { letters: "s", sight: "g", writing: "f" } });
t("trims to fit the limit", full.chars > 600 && fit.chars <= 600 && !has(fit.issues, "fix", /limit/));
t("trim keeps next step and home tip", /Our next step/.test(fit.text) && /At home/.test(fit.text) && /loved seeing/.test(fit.text));
t("no trim when it fits", k.build({ name: "A", limit: 2000, levels: { letters: "f" } }).text.indexOf("A few minutes") > 0);
t("limit flagged", has(k.build({ name: "A", limit: 200, levels: { letters: "s", counting: "f" } }).issues, "fix", /over your limit of 200/));

// Checker
function c(text, o) { return k.check(text, o || {}); }
var good = "Ava has settled happily into kindergarten. She knows most letter names and is learning their sounds. Our next step is counting objects one at a time. At home, count the stairs together.";
t("good comment clean", serious(c(good, { name: "Ava" })).length === 0);
t("empty", has(c("  "), "fix", /Nothing/));
t("lazy", has(c("Ava is lazy at writing. Next we are working on it at home."), "fix", /lazy/));
t("immature", has(c("Ava is immature. Next, at home..."), "fix", /immature/));
t("behind", has(c("Ava is behind in reading."), "review", /behind/));
t("below grade level", has(c("Ava is below grade level in math."), "review", /below grade level/));
t("can't", has(c("Ava can't write her name."), "review", /can't/));
t("refuses", has(c("Ava refuses to join in."), "review", /refuses to/));
t("struggles note", has(c("Ava struggles with counting."), "note", /struggles/));
t("always", has(c("Ava always shouts out."), "review", /always/));
t("never", has(c("Ava never listens."), "review", /never/));
t("comparison", has(c("Ava reads better than most children in the class."), "fix", /than most children/));
t("rest of class", has(c("Ava is catching up with the rest of the class."), "fix", /rest of the class/));
t("compared to the class", has(c("Weak compared to the class."), "fix", /compared to the class/));
t("youngest", has(c("As the youngest in the class, Ava..."), "fix", /youngest in the class/));
t("adhd", has(c("Ava may have ADHD."), "fix", /ADHD/));
t("speech delay", has(c("Ava has a speech delay."), "fix", /speech delay/));
t("evaluated", has(c("Ava needs to be evaluated."), "fix", /needs to be evaluated/));
t("IEP", has(c("Ava's IEP goals"), "fix", /IEP/));
t("adds is not ADD", !has(c("Ava adds within 10."), "fix", /Diagnosis/));
t("divorce", has(c("Since the divorce Ava has been quiet."), "fix", /divorce/));
t("separated parents", has(c("Ava's parents have separated."), "fix", /separated/));
t("words separated ok", !has(c("Words are separated by spaces. Next at home."), "fix", /Family/));
t("dad's house", has(c("After weekends at dad's house..."), "fix", /dad's house/));
t("jargon CVC", has(c("Ava blends CVC words."), "review", /CVC/));
t("jargon phonemic", has(c("Ava's phonemic awareness is growing."), "review", /phonemic/));
t("jargon standard code", has(c("Ava has met K.CC.1."), "review", /K\.CC\.1/));
t("jargon subitize", has(c("Ava can subitize to 5."), "review", /subitize/));
t("jargon ELG", has(c("Ava is working towards the ELG."), "review", /ELG/));
t("cliche joy", has(c("Ava is a joy to have in class."), "note", /joy to have in class/));
t("cliche thrive", has(c("Ava continues to thrive."), "note", /thrive/));
t("placeholder [Name]", has(c("[Name] knows letters."), "fix", /\[Name\]/));
t("placeholder [Student Name]", has(c("[Student Name] knows letters."), "fix", /Student Name/));
t("placeholder XX", has(c("XX knows letters."), "fix", /XX/));
t("worried", has(c("We are worried about Ava's speech."), "review", /We are worried/));
t("by now", has(c("Ava should be reading by now."), "review", /should be reading/));
t("no next step", has(c("Ava has settled in well and loves books. Thank you for your support at home."), "review", /No next step/));
t("no home tip", has(c("Ava loves books. Our next step is writing her name."), "note", /No home tip/));
t("exclamations", has(c("Great start! Super reader! Next step at home."), "review", /2 exclamation/));
t("one exclamation ok", !has(c("Great start! Next step at home."), "review", /exclamation/));
t("mixed pronouns", has(c("Ava knows her letters and he is learning sounds. Next at home."), "review", /pronouns/));
t("name missing", has(c("Noah knows his letters. Next at home.", { name: "Ava" }), "review", /isn't in the comment/));
t("full name note", has(c("Ava Smith knows letters. Next at home.", { name: "Ava Smith" }), "note", /first name only/));
t("curly chars", has(c("Ava’s writing — lovely. Next at home."), "note", /Curly quotes/));
t("plain", k.plain("Ava’s “best” — lovely…") === "Ava's \"best\", lovely...");
t("UK expected in autumn", has(c("Ava is at the expected level. Next at home.", { style: "uk", timing: "early" }), "review", /EYFS profile/));
t("UK expected at end ok", !has(c("Ava is at the expected level. Next at home.", { style: "uk", timing: "end" }), "review", /EYFS profile/));
t("US expected ok", !has(c("Ava is meeting expected progress. Next at home.", { style: "us" }), "review", /EYFS/));
t("long sentence", has(c("Ava " + "really ".repeat(35) + "likes books. Next at home."), "note", /over 32 words/));
t("limit check", has(c(good, { limit: 50 }), "fix", /over your limit of 50/));
t("bad is a label", has(c("Ava had a bad week."), "fix", /bad/));
t("badge not flagged", !has(c("Ava earned a badge. Next at home."), "fix", /Label/));
t("slowly not flagged", !has(c("Ava reads slowly and carefully. Next at home."), "review", /verdict/));

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
