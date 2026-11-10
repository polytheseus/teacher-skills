// node tests/test-special-needs-comments.js
var k = require("../docs/guides/special-needs-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/special-needs-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
function noStep(issues) { return issues.filter(function (i) { return !/No next step/.test(i.msg); }); }

// Every strength pair x focus x style x pronoun x timing builds a clean comment,
// with and without typed progress and a home tip.
var all = 0, clean = 0, bad = [], sing = /\bthey (is|has|was|does|isn't|hasn't|doesn't|[a-z]+[^s]s)\b/i;
k.STRENGTHS.forEach(function (s, i) {
  k.FOCUS.forEach(function (n, j) {
    ["us", "uk"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["yes", "no"].forEach(function (home) {
      var s2 = k.STRENGTHS[(i + j + 1) % k.STRENGTHS.length].id;
      if (s2 === s.id) s2 = k.STRENGTHS[(i + 2) % k.STRENGTHS.length].id;
      var r = k.build({ name: "Ava", pronoun: p, style: st, timing: tm, strengths: [s.id, s2], focus: n.id, home: home, progress: j % 2 ? "has learned all of the letter sounds" : "" });
      all++;
      var iss = serious(r.issues), first = r.text.split(/(?<=\.)\s/);
      var run = 0, maxRun = 0; first.forEach(function (x) { if (/^Ava\b/.test(x)) { run++; maxRun = Math.max(maxRun, run); } else run = 0; });
      var wrongSp = st === "us" ? /\b(practise|practising|organised|favourite|maths|humour|break time)\b/ : /\b(practicing|organized|favorite|humor|recess)\b/;
      if (r.ok && !iss.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text) && !sing.test(r.text) && maxRun <= 2 && !wrongSp.test(r.text)) clean++;
      else bad.push(s.id + "/" + n.id + "/" + st + "/" + p + "/" + tm + ": " + JSON.stringify(iss) + " " + r.text);
    }); }); }); });
  });
});
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Every line is clean alone.
k.STRENGTHS.forEach(function (s) { s.v.forEach(function (v, j) { var x = k.fill("Ava " + v + ".", { pronoun: "she" }); t("strength " + s.id + j, !noStep(serious(k.check(x))).length); }); });
k.FOCUS.forEach(function (n) {
  var o = { pronoun: "she", name: "Ava", style: "us" };
  t("now " + n.id, !serious(k.check(k.fill("Ava is working on " + n.now + ".", o))).length);
  t("next " + n.id, !serious(k.check(k.fill("Next quarter, the goal is for Ava to " + n.next + ".", o))).length);
  t("help " + n.id, !noStep(serious(k.check(k.fill(n.help, o)))).length && /help/.test(n.help));
  t("home " + n.id, !noStep(serious(k.check(k.fill("At home, you could " + n.home + ".", o)))).length);
});
t("40 short comments", k.SHORT.length === 40);
var seenS = {};
k.SHORT.forEach(function (s, i) {
  var x = k.fill(s, { name: "Ava", pronoun: "she", style: "us" });
  t("short " + i + " " + x, !noStep(serious(k.check(x))).length && x.length <= 100 && !seenS[x]);
  seenS[x] = 1;
});

// Rewrites: every before is flagged; every after is clean.
rewrites.forEach(function (r, i) {
  var before = k.check(r[0]).filter(function (x) { return x.level !== "note" && !/No next step/.test(x.msg); });
  t("before flagged " + i + " " + r[0], before.length > 0);
  var after = k.fill(r[1], { style: "us" }).replace(/\[Name\]/g, "Ava");
  var a = k.check(after).filter(function (x) { return x.level !== "note" && !/No next step/.test(x.msg); });
  t("after clean " + i + " " + JSON.stringify(a), a.length === 0);
});

// Build details
var r = k.build({ name: "Jordan", pronoun: "he", strengths: ["effort", "kind"], progress: "Has learned all of the letter sounds.", focus: "decoding" });
t("ok", r.ok && r.chars === r.text.length);
t("strength first", /^Jordan (keeps trying|comes to school)/.test(r.text));
t("second uses also", /He (is )?also /.test(r.text));
t("progress lowercased", /Since the start of the quarter, Jordan has learned all of the letter sounds\./.test(r.text));
t("working on", /(Jordan|He) is working on reading longer words/.test(r.text));
t("help line", /small group, with books matched to his reading, is helping\./.test(r.text));
t("next", /Next quarter, the goal is for Jordan to read new words/.test(r.text));
t("home", /At home, you could read together/.test(r.text));
t("no issues", r.issues.length === 0);
t("requires a strength", !k.build({ name: "A", strengths: [] }).ok);
t("no focus flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["kind"] }).issues, "review", /No next step|No skill/));
var r3 = k.build({ name: "Ava", pronoun: "she", strengths: ["kind", "math", "music"], focus: "calm" });
t("3 strengths flagged and cut", has(r3.issues, "review", /3 strengths/) && (r3.text.match(/ also /g) || []).length === 1);
var e = k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], focus: "calm", timing: "end" });
t("end says next year", /Next year, the goal is for Ava/.test(e.text) && /this year's progress|this year\./.test(e.text));
var ts = k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], focus: "focus", support: "a wobble cushion and a quiet table" });
t("typed support", /A wobble cushion and a quiet table are helping\./.test(ts.text));
t("single support", /A visual timer is helping\./.test(k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], focus: "focus", support: "a visual timer" }).text));
t("uk practise", /practise the same calming/.test(k.build({ name: "Ava", pronoun: "she", style: "uk", strengths: ["kind"], focus: "calm" }).text));
t("us practice", /practice the same calming/.test(k.build({ name: "Ava", pronoun: "she", style: "us", strengths: ["kind"], focus: "calm" }).text));
t("uk break time", /break time/.test(k.build({ name: "Ava", pronoun: "she", style: "uk", strengths: ["kind"], focus: "turns" }).text));
t("no name gives [Name]", /^\[Name\]/.test(k.build({ strengths: ["kind"], focus: "calm" }).text));
t("period", /Next trimester,/.test(k.build({ name: "Ava", pronoun: "they", strengths: ["kind"], focus: "calm", period: "trimester" }).text));

// Limits: the opening strength and the next step survive.
[0, 500, 400, 320, 260].forEach(function (L) {
  var x = k.build({ name: "Ava", pronoun: "she", strengths: ["effort", "kind"], focus: "writing", limit: L });
  t("limit " + L + " met " + x.chars, !L || x.chars <= L);
  t("limit " + L + " starts with the name", /^Ava\b/.test(x.text));
  t("limit " + L + " keeps next step", /the goal is for Ava/.test(x.text));
});
t("limit too tight is flagged", has(k.build({ name: "Ava", pronoun: "she", strengths: ["kind"], focus: "writing", limit: 40 }).issues, "fix", /over your limit/));

// Checker
var c = function (s) { return k.check(s); };
t("adhd", has(c("Ava has ADHD. Next, she is working on reading."), "fix", /Diagnosis or label/));
t("autism", has(c("Ava is autistic. Next, she is working on reading."), "fix", /Diagnosis or label/));
t("special needs", has(c("Ava has special needs. Next, she is working on reading."), "fix", /Diagnosis/));
t("ASD code", has(c("Ava has ASD. Next, she is working on reading."), "fix", /code/));
t("add word not code", !has(c("Ava can add within 20. Next, she is working on reading."), "fix", /code/));
t("send verb not code", !has(c("We will send home a book. Next, she is working on reading."), "fix", /code/));
t("IEP review", has(c("Ava met her IEP goal. Next, she is working on reading."), "review", /Support plan/));
t("504", has(c("Her 504 plan helps. Next, she is working on reading."), "review", /Support plan/));
t("therapist", has(c("Ava sees the speech therapist. Next, she is working on reading."), "review", /Service/));
t("aide", has(c("Ava works with her aide. Next, she is working on reading."), "review", /Service/));
t("paragraph not para", !has(c("Ava writes a paragraph. Next, she is working on reading."), "review", /Service/));
t("low functioning", has(c("Ava is low functioning. Next, she is working on reading."), "fix", /labels the child/));
t("suffers from", has(c("Ava suffers from anxiety. Next, she is working on reading."), "fix", /labels/));
t("wheelchair bound", has(c("Ava is wheelchair-bound. Next, she is working on reading."), "fix", /labels/));
t("uses a wheelchair ok", !serious(c("Ava uses her wheelchair to get around the room on her own. Next, she is working on reading with a partner.")).length);
t("very low", has(c("Ava is very low. Next, she is working on reading."), "fix", /labels/));
t("meltdowns", has(c("Ava has meltdowns. Next, she is working on reading."), "fix", /labels/));
t("can't", has(c("Ava can't read. Next, she is working on reading."), "review", /doesn't do/));
t("refuses", has(c("Ava refuses to write. Next, she is working on reading."), "review", /doesn't do/));
t("despite", has(c("Despite her disability, Ava reads. Next, she is working on reading."), "review", /patronising/));
t("inspiration", has(c("Ava is an inspiration. Next, she is working on reading."), "review", /patronising/));
t("peers", has(c("Ava is behind her peers. Next, she is working on reading."), "fix", /Comparison/));
t("typical peers", has(c("Ava reads less than typical peers. Next, she is working on reading."), "fix", /Comparison/));
t("below grade level note", has(c("Ava reads below grade level. Next, she is working on reading."), "note", /level or grade box/));
t("sweet", has(c("Ava is a sweet girl. Next, she is working on reading."), "review", /any student/));
t("family", has(c("Since the divorce Ava reads more. Next, she is working on reading."), "fix", /Family/));
t("placeholder", has(c("[Name] reads. Next, more."), "fix", /Placeholder/));
t("no next", has(c("Ava reads short books."), "review", /No next step/));
t("no help note", has(c("Ava reads. Next, she is working on longer words."), "note", /what's helping/));
t("help ok", !has(c("Ava reads. Practice in a small group is helping. Next, she is working on longer words."), "note", /what's helping/));
t("two !", has(c("Great! Well done! Next, she is working on reading."), "review", /exclamation/));
t("mixed pronouns", has(c("She reads and his work is neat. Next, more."), "review", /Both/));
t("name missing", has(k.check("Ben reads. Next, more.", { name: "Ava" }), "review", /isn't in the comment/));
t("curly", has(c("Ava’s reading. Next, more."), "note", /Curly/) && k.plain("Ava’s — ok") === "Ava's, ok");
t("over limit", has(k.check("Ava reads books. Next, more.", { limit: 5 }), "fix", /over your limit/));
t("long sentence", has(c(new Array(28).join("reading ") + ". Next, more."), "note", /over 25/));
t("empty", has(c("  "), "fix", /Nothing/));
t("period in message", /this term/.test(k.check("Ava is a sweet girl.", { style: "uk" }).map(function (i) { return i.msg; }).join()));
console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
