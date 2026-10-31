// node tests/test-sel-comments.js
var k = require("../docs/guides/sel-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/sel-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every skill x level x second skill x level x style x age x pronoun x timing x home builds a clean comment.
// Comments where both skills are developing (or one developing skill alone) carry the deliberate
// "lead with a strength" review and nothing else.
var all = 0, clean = 0, bad = [];
var DEV = /only covers a skill that is still developing|Both skills are still developing/;
k.SKILLS.forEach(function (s1) { k.LEVELS.forEach(function (l1) { [""].concat(k.SKILLS.map(function (s) { return s.id; })).forEach(function (s2) { k.LEVELS.forEach(function (l2) {
  ["us", "uk"].forEach(function (sty) { ["young", "older"].forEach(function (ag) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { [false, true].forEach(function (home) {
    var r = k.build({ name: "Ava", pronoun: p, style: sty, age: ag, timing: tm, skill: s1.id, level: l1.id, skill2: s2, level2: l2.id, home: home });
    all++;
    var other = r.issues.filter(function (i) { return !DEV.test(i.msg); });
    var devOnly = (!s2 || s2 === s1.id) ? l1.id === "developing" : (l1.id === "developing" && l2.id === "developing");
    var devFlag = r.issues.some(function (i) { return DEV.test(i.msg); });
    if (r.ok && !other.length && devFlag === devOnly && !/\{|\}|\[Name\]|undefined|\||also also|is also also|Ava Ava/.test(r.text)) clean++;
    else bad.push([s1.id, l1.id, s2, l2.id, sty, ag, p, tm, home].join("/") + ": " + JSON.stringify(r.issues) + " " + r.text);
  }); }); }); }); });
}); }); }); });
t("all " + all + " built comments pass the checker with no notes", clean === all);
if (bad.length) console.log(bad.length + " bad, e.g.\n" + bad.slice(0, 3).join("\n"));

// Each phrase on its own is clean (apart from the structure checks).
var STRUCT = /No (social or emotional skill named|next step)/;
function lone(x, o) { var is = k.check(k.fill(x, o)).filter(function (i) { return !STRUCT.test(i.msg); }); if (is.length) console.log(x, JSON.stringify(is)); return !is.length; }
["us", "uk"].forEach(function (sty) { ["young", "older"].forEach(function (ag) {
  var o = { pronoun: "she", style: sty, age: ag, name: "Ava" };
  k.SKILLS.forEach(function (s) {
    k.LEVELS.forEach(function (l) {
      t("skill " + s.id + "/" + l.id + "/s/" + sty + "/" + ag, lone("Ava " + k.age(s[l.id].s, o) + ".", o));
      t("skill " + s.id + "/" + l.id + "/g/" + sty + "/" + ag, lone("Next, Ava is working on " + k.age(s[l.id].g, o) + ".", o));
    });
    t("sch " + s.id + "/" + sty + "/" + ag, lone("We are practising this at school " + k.age(s.sch, o) + ".", o));
    t("home " + s.id + "/" + sty + "/" + ag, lone("Ava is kind. At home, you could " + k.age(s.home, o) + ".", o));
  });
}); });

// Data shape
t("home tips start with a verb", k.SKILLS.every(function (s) { return ["young", "older"].every(function (ag) { return /^(name|share|talk|ask|play|help|pause|take|give|cook,|practise|practice) /.test(k.fill(k.age(s.home, { age: ag }), { name: "Ava" })); }); }));
t("16 skills", k.SKILLS.length === 16);
t("every area has 3+ skills", k.AREAS.every(function (a) { return k.SKILLS.filter(function (s) { return s.area === a.id; }).length >= 3; }));
t("every skill has an area", k.SKILLS.every(function (s) { return k.AREAS.some(function (a) { return a.id === s.area; }); }));

// Build details
var r = k.build({ name: "Mateo", pronoun: "he", skill: "empathy", level: "strong", skill2: "calm", level2: "developing", home: true });
t("ok", r.ok && r.chars === r.text.length && r.issues.length === 0);
t("strength first", /^Mateo notices how others are feeling and responds with real kindness\./.test(r.text));
t("second skill also", /Mateo is also learning ways to calm down when upset, such as taking deep breaths or using the calm corner\./.test(r.text));
t("next from weaker skill", /Next, Mateo is working on using one calming strategy, such as slow breaths, at the first sign of feeling upset\./.test(r.text));
t("school line US", /We are practicing this at school with a calm-down plan that Mateo helped to choose\./.test(r.text));
t("home tip US", /At home, you could practice one calming strategy together/.test(r.text));
t("early close", /next quarter\.$/.test(r.text));
var sw = k.build({ name: "Mateo", pronoun: "he", skill: "calm", level: "developing", skill2: "empathy", level2: "strong" });
t("stronger skill moves first", /^Mateo notices how others/.test(sw.text) && /Next, Mateo is working on using one calming strategy/.test(sw.text));
var older = k.build({ name: "Ava", pronoun: "she", age: "older", skill: "teamwork", level: "secure", skill2: "calm", level2: "developing" });
t("older wording", /short break/.test(older.text) && !/calm corner/.test(older.text));
var uk = k.build({ name: "Ava", pronoun: "she", style: "uk", skill: "teamwork", level: "secure", skill2: "friends", level2: "developing", home: true });
t("UK practising + playtime + term", /We are practising this at school with structured games at playtime\./.test(uk.text) && /At home, you could practise ways to join a game/.test(uk.text) && /(next term|Ava next term)\.$/.test(uk.text));
t("UK recognise", /recognise/.test(k.build({ name: "Ava", style: "uk", skill: "teamwork", level: "strong", skill2: "strengths", level2: "developing" }).text));
t("US recognize", /recognize/.test(k.build({ name: "Ava", skill: "teamwork", level: "strong", skill2: "strengths", level2: "developing" }).text));
var both = k.build({ name: "Ava", skill: "teamwork", level: "strong", skill2: "empathy", level2: "strong" });
t("both strong: next step from second skill, no school line", /Next, Ava is working on checking in on classmates/.test(both.text) && !/We are practi/.test(both.text));
var focus = k.build({ name: "Ava", skill: "teamwork", level: "strong", skill2: "empathy", level2: "secure", focus: "teamwork" });
t("focus override", /Next, Ava is working on taking on different roles in a group/.test(focus.text));
t("school off", !/We are practi/.test(k.build({ name: "Ava", skill: "calm", level: "secure", school: false }).text));
t("end close", /enjoyed teaching Ava this year|Best wishes to Ava for next year/.test(k.build({ name: "Ava", skill: "teamwork", level: "strong", timing: "end" }).text));
t("period", /next semester/.test(k.build({ name: "Bo", skill: "teamwork", level: "strong", period: "semester" }).text) || /working with Bo next semester/.test(k.build({ name: "Bo", skill: "teamwork", level: "strong", period: "semester" }).text));
t("they pronoun", /their/.test(k.build({ name: "Sam", pronoun: "they", skill: "goals", level: "strong" }).text));
t("no name placeholder", /^\[Name\]/.test(k.build({ skill: "goals", level: "strong" }).text));
t("single developing skill flagged", has(k.build({ name: "Ava", skill: "calm", level: "developing" }).issues, "review", /only covers a skill that is still developing/));
t("two developing flagged", has(k.build({ name: "Ava", skill: "calm", level: "developing", skill2: "control", level2: "developing" }).issues, "review", /Both skills are still developing/));
t("same skill twice ignored", !/also/.test(k.build({ name: "Ava", skill: "calm", level: "strong", skill2: "calm", level2: "strong" }).text));

// Limits
var long = { name: "Alexandra", pronoun: "she", skill: "communication", level: "strong", skill2: "conflict", level2: "developing", home: true };
var full = k.build(long);
t("full is long", full.chars > 400);
[400, 300, 250].forEach(function (lim) {
  var x = k.build(Object.assign({}, long, { limit: lim }));
  t("fits " + lim + " (" + x.chars + ")", x.chars <= lim && !has(x.issues, "fix", /over your limit/));
  t("keeps next step at " + lim, /Next, Alexandra is working on/.test(x.text));
});
var tiny = k.build(Object.assign({}, long, { limit: 200 }));
t("dropping skill 2 switches next step", /Next, Alexandra is working on helping a group reach a decision/.test(tiny.text) && has(tiny.issues, "note", /Dropped the second skill/));
t("over-limit flagged when it can't fit", has(k.build(Object.assign({}, long, { limit: 60 })).issues, "fix", /over your limit of 60/));
var maxLen = 0;
k.SKILLS.forEach(function (a) { k.SKILLS.forEach(function (b) { ["young", "older"].forEach(function (ag) {
  var x = k.build({ name: "Alexandra", pronoun: "they", age: ag, skill: a.id, level: "strong", skill2: b.id, level2: "developing", home: true });
  maxLen = Math.max(maxLen, x.chars);
  var y = k.build({ name: "Alexandra", pronoun: "they", age: ag, skill: a.id, level: "strong", skill2: b.id, level2: "developing", home: true, limit: 500 });
  if (y.chars > 500) t("fits 500 " + a.id + "/" + b.id, false);
  var z = k.build({ name: "Alexandra", pronoun: "they", age: ag, skill: a.id, level: "strong", skill2: b.id, level2: "developing", limit: 350 });
  if (z.chars > 350) t("fits 350 " + a.id + "/" + b.id + " (" + z.chars + ")", false);
}); }); });
t("longest full comment under 750 (" + maxLen + ")", maxLen < 750);

// Checker
function c(text, o) { return k.check(text, o || { name: "Leo" }); }
t("ADHD", has(c("Leo's ADHD makes it hard to wait."), "fix", /Diagnosis/));
t("anxiety", has(c("Leo's anxiety shows before tests."), "fix", /Diagnosis/));
t("trauma", has(c("Leo has had some trauma."), "fix", /Diagnosis/));
t("counselor", has(c("Leo sees the school counselor weekly."), "fix", /Diagnosis/));
t("behavior plan", has(c("Leo is on a behavior plan."), "fix", /Diagnosis/));
t("anger issues", has(c("Leo has anger issues."), "fix", /Diagnosis/));
t("ODD case-sensitive", has(c("Leo has ODD."), "fix", /Support-system/) && !has(c("Leo found the odd word tricky."), "fix", /Support-system/));
t("add not flagged", !c("Leo can add up scores in games.").some(function (i) { return /Diagnosis|Support/.test(i.msg); }));
t("SEN", has(c("Leo is on the SEN register."), "fix", /Support-system/));
t("send home not flagged", !c("Leo helps send home the class newsletter.").some(function (i) { return /Support/.test(i.msg); }));
t("divorce", has(c("Since the divorce Leo is upset."), "fix", /Home or family/));
t("new baby", has(c("Leo has a new baby at home."), "fix", /Home or family/));
t("hits", has(c("Leo hits other children."), "fix", /Incident/));
t("fights", has(c("Leo got into fights at recess."), "fix", /Incident/));
t("sent to office", has(c("Leo was sent to the office twice."), "fix", /Incident/));
t("lost recess", has(c("Leo lost recess for talking."), "fix", /Incident/));
t("a bit not flagged", !c("Leo is a bit quicker to calm down now.").some(function (i) { return /Incident/.test(i.msg); }));
t("no friends", has(c("Leo has no friends."), "fix", /painful/));
t("loner", has(c("Leo is a loner."), "fix", /painful/));
t("bullied", has(c("Leo is bullied at lunch."), "fix", /painful/));
t("bossy", has(c("Leo is bossy."), "fix", /Label/));
t("aggressive", has(c("Leo is aggressive."), "fix", /Label/));
t("meltdowns", has(c("Leo has meltdowns."), "fix", /Label/));
t("too sensitive", has(c("Leo is too sensitive."), "fix", /Label/));
t("attention seeking", has(c("Leo is attention-seeking."), "fix", /Label/));
t("shy is review", has(c("Leo is shy."), "review", /stick as a label/));
t("comparison", has(c("Leo is kinder than most of the class."), "review", /Comparison/));
t("socially immature", has(c("Leo is socially immature."), "fix", /judgement/));
t("young for age", has(c("Leo is young for his age."), "fix", /judgement/));
t("control himself", has(c("Leo needs to control himself."), "review", /vague/));
t("can't", has(c("Leo can't wait his turn."), "review", /puts the gap first/));
t("won't share", has(c("Leo won't share."), "review", /puts the gap first/));
t("never", has(c("Leo never listens."), "review", /rarely literally true/));
t("placeholder", has(c("[Name] shares well."), "fix", /Placeholder/));
t("jargon self-regulation", has(c("Leo is working on self-regulation."), "note", /Jargon/));
t("jargon zones", has(c("Leo stays in the green zone."), "note", /Jargon/));
t("jargon SEL", has(c("Leo is meeting SEL standards."), "note", /Jargon/));
t("stock", has(c("Leo is a ray of sunshine."), "note", /Stock/));
t("model citizen", has(c("Leo is a model citizen."), "note", /Stock/));
t("alarm", has(c("Leo's behavior is alarming."), "review", /alarm a family/));
t("no skill", has(c("Leo is a lovely boy. Next, Leo is working on reading."), "review", /No social or emotional skill/));
t("no next step", has(c("Leo shares well with friends."), "review", /No next step/));
t("needs to x3", has(c("Leo needs to share. Leo must listen. Leo should wait."), "review", /3 times/));
t("exclamations", has(c("Leo shares! Leo listens! Next, Leo is working on waiting."), "review", /exclamation/));
t("mixed pronouns", has(c("Leo shares with her friends and he listens. Next, Leo is working on waiting."), "review", /Both/));
t("you + name", has(c("Leo, you share well. Leo is working on waiting.", { name: "Leo" }), "note", /mixes "you"/));
t("home tip you OK", !has(c("Leo shares well. Next, Leo is working on waiting. At home, you could play board games.", { name: "Leo" }), "note", /mixes "you"/));
t("quoted you OK", !has(c("Leo is working on asking \"are you OK?\" when a friend is upset.", { name: "Leo" }), "note", /mixes "you"/));
t("missing name", has(c("Ava shares well. Next, Ava is working on waiting.", { name: "Leo" }), "review", /isn't in the comment/));
t("curly", has(c("Leo’s sharing is great. Next, Leo is working on waiting."), "note", /Curly/));
t("plain", k.plain("Leo’s “kind” — yes…") === "Leo's \"kind\", yes...");
t("long sentence", has(c("Leo " + Array(32).join("shares ") + "well. Next, Leo is working on waiting."), "note", /over 30 words/));
t("over limit", has(k.check("Leo shares. Next, Leo is working on waiting.", { name: "Leo", limit: 10 }), "fix", /over your limit/));
t("empty", has(k.check(""), "fix", /Nothing to check/));

// Rewrites: every "instead of" is flagged; every "write" is clean.
rewrites.forEach(function (rw) {
  var name = rw[0].match(/^(Since the divorce, )?([A-Z][a-z]+)/)[2];
  var before = serious(k.check(rw[0], { name: name })).concat(k.check(rw[0], { name: name }).filter(function (i) { return /Jargon|Stock/.test(i.msg); }));
  t("rewrite before flagged: " + rw[0], before.length > 0);
  var after = rw[1].replace(/^Leave it out\. /, "").replace(/^"|"$/g, "");
  var ai = k.check(after, { name: name });
  t("rewrite after clean: " + rw[0], !ai.length || (console.log(after, JSON.stringify(ai)), false));
});

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
