// node tests/test-struggling-comments.js
var k = require("../docs/guides/struggling-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/struggling-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every area x level x told x style x pronoun x timing builds a clean comment.
var all = 0, clean = 0, bad = [];
k.AREAS.forEach(function (a, i) {
  ["mild", "big"].forEach(function (lv) { ["no", "yes"].forEach(function (told) {
    ["us", "uk"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) {
      var s1 = k.STRENGTHS[i % 13].id, s2 = k.STRENGTHS[(i + 5) % 13].id, a2 = k.AREAS[(i + 4) % k.AREAS.length].id;
      var r = k.build({ name: "Ava", pronoun: p, style: st, timing: tm, strengths: [s1, s2], areas: [a.id, a2], level: lv, told: told });
      all++;
      var s = serious(r.issues.filter(function (x) { return !/hasn't heard yet/.test(x.msg); }));
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text) && r.text.split("Ava").length <= 9) clean++;
      else bad.push(a.id + "/" + lv + "/" + told + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(s) + " " + r.text);
    }); }); });
  }); });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Every strength and every concern variant passes the checker on its own.
k.STRENGTHS.forEach(function (s) { if (s.s) { var x = k.fill("Ava " + s.s + ".", { pronoun: "she" }); t("strength " + s.id, !serious(k.check(x)).filter(function (i) { return !/No (support|next step)/.test(i.msg); }).length); } });
k.AREAS.forEach(function (a) { a.c.forEach(function (c, j) { var x = k.fill("Ava " + c + ".", { pronoun: "he" }); t("concern " + a.id + j, !k.check(x).some(function (i) { return i.level === "fix" || /Label|guesses|potential|puts the gap|rarely literally/.test(i.msg); })); }); });

// Basic build
var r = k.build({ name: "Jordan", pronoun: "he", strengths: ["tries", "oral"], improved: "Now reads chapter books with a partner.", areas: ["comprehension"], level: "big", told: "yes" });
t("ok", r.ok && r.chars === r.text.length);
t("strength first", /^Jordan keeps trying/.test(r.text));
t("second strength", /Jordan also explains his thinking/.test(r.text));
t("improved lowercased", /progress this quarter: Jordan now reads chapter books with a partner\./.test(r.text));
t("big line", /main focus/.test(r.text));
t("support", /To help, we're working on/.test(r.text));
t("met contact", /Thank you for talking this through/.test(r.text));
t("no issues", r.issues.length === 0);
t("is also", /Ava is also a kind classmate/.test(k.build({ name: "Ava", strengths: ["tries", "kind"], areas: ["focus"] }).text));
t("has also", /Ava has also a creative/.test(k.build({ name: "Ava", strengths: ["tries", "creative"], areas: ["focus"] }).text) === false);
var u = k.build({ name: "Ava", pronoun: "they", style: "uk", strengths: ["kind"], areas: ["facts"], timing: "end" });
t("uk maths + term-less end", /maths facts/.test(u.text) && /practise a few/.test(u.text) && /This year, Ava/.test(u.text) && /summer|next year/.test(u.text));
t("uk they", /learning their number facts/.test(u.text));
t("us practice", /practice/.test(k.build({ name: "Ava", strengths: ["kind"], areas: ["spelling"] }).text));
t("custom support", /we're working on handing in every assignment on time, with a homework club on Thursdays\./.test(k.build({ name: "Ava", strengths: ["kind"], areas: ["work"], support: "With a homework club on Thursdays." }).text));
t("attendance home line", /please let me know so we can help\./.test(k.build({ name: "Ava", strengths: ["kind"], areas: ["attendance"] }).text) && !/A few minutes most days/.test(k.build({ name: "Ava", strengths: ["kind"], areas: ["attendance"] }).text));
t("no area", k.build({ strengths: ["kind"] }).ok === false);
t("no strength review", has(k.build({ name: "Ava", areas: ["focus"] }).issues, "review", /No strength/));
t("improved counts as strength", !has(k.build({ name: "Ava", improved: "finishes more work", areas: ["focus"] }).issues, "review", /No strength/));
t("not told big", has(k.build({ name: "Ava", strengths: ["kind"], areas: ["focus"], level: "big", told: "no" }).issues, "review", /hasn't heard yet/));
t("three areas trimmed", has(k.build({ name: "Ava", strengths: ["kind"], areas: ["focus", "talking", "work"] }).issues, "review", /3 areas/));
var lim = k.build({ name: "Jordan", pronoun: "he", strengths: ["tries", "oral"], improved: "now reads chapter books with a partner", areas: ["comprehension", "writing"], level: "big", told: "yes", limit: 700 });
t("limit trims", lim.chars <= 700 && !/A few minutes most days/.test(lim.text) && !/also explains/.test(lim.text));
t("limit over reports fix", has(k.build({ name: "Jordan", strengths: ["tries", "oral"], areas: ["comprehension", "writing"], level: "big", limit: 300 }).issues, "fix", /over your limit/));

// Checker
function iss(text) { return k.check(text, { name: "Ava" }); }
t("lazy", has(iss("Ava is lazy."), "fix", /Label: "lazy"/));
t("chatty", has(iss("Ava is chatty."), "fix", /chatty/));
t("attention-seeking", has(iss("Ava is attention-seeking."), "fix", /attention-seeking/));
t("potential", has(iss("Ava is not working to her potential."), "review", /potential/));
t("applied", has(iss("Ava could do better if she applied herself."), "review", /could do better|applied/));
t("doesn't care", has(iss("Ava doesn't care about school."), "review", /guesses/));
t("failing note", has(iss("Ava is failing math."), "note", /failing/));
t("can't", has(iss("Ava can't read."), "review", /can't/));
t("never", has(iss("Ava never does homework."), "review", /never/));
t("compare", has(iss("Ava is in the bottom group."), "fix", /Comparison/));
t("compare2", has(iss("Ava reads less than most students."), "fix", /Comparison/));
t("adhd", has(iss("Ava may have ADHD."), "fix", /Diagnosis/));
t("iep", has(iss("Ava's IEP goals"), "fix", /IEP/));
t("SEND caps", has(iss("Ava gets SEND support."), "fix", /Support-plan/));
t("send lower ok", !has(iss("Please send in a coat for Ava."), "fix", /Support-plan/));
t("add ok", !has(iss("Ava is learning to add detail."), "fix", /Diagnosis/));
t("odd ok", !has(iss("Ava knows odd and even numbers."), "fix", /Diagnosis/));
t("family", has(iss("Since the divorce, Ava is upset."), "fix", /Family/));
t("counsellor review", has(iss("Ava sees the school counselor."), "review", /private support/));
t("placeholder", has(iss("[Name] is kind."), "fix", /Placeholder/));
t("stock", has(iss("Ava is a joy to have in class."), "note", /Stock/));
t("needs to pile", has(iss("Ava needs to focus. Ava needs to listen. Ava must finish work."), "review", /3 times/));
t("no support", has(iss("Ava finds reading hard."), "review", /No support/));
t("no contact", has(iss("Ava finds reading hard. To help, we're working on it. At home, read."), "note", /invitation/));
t("pronoun mix", has(iss("Ava did her best and he tried."), "review", /pronouns/));
t("name missing", has(k.check("Mia is kind.", { name: "Ava" }), "review", /isn't in the comment/));
t("curly", has(iss("Ava’s work."), "note", /Curly/));
t("plain", k.plain("Ava’s “work” — done…") === "Ava's \"work\", done...");
t("alarm", has(iss("I am very concerned about Ava."), "review", /alarm/));

// Rewrite table: every "instead of" line is flagged; every rewrite passes (bar the "don't write it" advice rows).
rewrites.forEach(function (rw, i) {
  var bad = k.check(rw[0]), good = rw[1];
  t("rewrite bad flagged " + i + " " + rw[0], bad.some(function (x) { return x.level !== "note" || /failing|behind|Stock/.test(x.msg); }) && bad.some(function (x) { return !/^No |invitation|home tip/.test(x.msg); }));
  if (!/^(Don't write it|Leave)/.test(good)) {
    var g = serious(k.check(good)).filter(function (x) { return !/^No (next step|support)/.test(x.msg); });
    t("rewrite good clean " + i + ": " + JSON.stringify(g), !g.length);
  }
});

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
