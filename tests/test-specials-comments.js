// node tests/test-specials-comments.js
var k = require("../docs/guides/specials-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/specials-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every subject x area x level x second area x level x style x pronoun x timing builds a clean comment.
var all = 0, clean = 0, bad = [];
k.SUBJECTS.forEach(function (sub) {
  var areas = k.AREAS[sub.id], habits = k.habitsFor(sub.id), homes = k.HOME[sub.id];
  areas.forEach(function (a1, i) { k.LEVELS.forEach(function (l1) { [""].concat(areas.map(function (a) { return a.id; })).forEach(function (a2, j) { k.LEVELS.forEach(function (l2) {
    ["us", "uk"].forEach(function (sty) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) {
      var n = i * 7 + j * 3 + all;
      var s1 = k.STRENGTHS[n % k.STRENGTHS.length].id, s2 = k.STRENGTHS[(n + 4) % k.STRENGTHS.length].id;
      var r = k.build({ name: "Ava", pronoun: p, style: sty, timing: tm, subject: sub.id, unit: n % 2 ? "our printmaking unit" : "", area: a1.id, level: l1.id, area2: a2, level2: l2.id,
        strengths: [s1, s2], habit: habits[n % habits.length].id, home: homes[n % homes.length].id });
      all++;
      if (r.ok && !r.issues.length && !/\{|\}|\[Name\]|undefined|\||also also|is also also/.test(r.text)) clean++;
      else bad.push([sub.id, a1.id, l1.id, a2, l2.id, sty, p, tm].join("/") + ": " + JSON.stringify(r.issues) + " " + r.text);
    }); }); });
  }); }); }); });
});
t("all " + all + " built comments pass the checker with no notes", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Each phrase on its own is clean (apart from the structure checks).
var STRUCT = /No (subject skill|next step)/;
function lone(x, o) { return !k.check(k.fill(x, o)).filter(function (i) { return !STRUCT.test(i.msg); }).length; }
k.SUBJECTS.forEach(function (sub) {
  k.STRENGTHS.forEach(function (s) { t("strength " + sub.id + "/" + s.id, lone("Ava " + s.s + ".", { pronoun: "she", subject: sub.id })); });
  k.AREAS[sub.id].forEach(function (a) { k.LEVELS.forEach(function (l) {
    t("area " + sub.id + "/" + a.id + "/" + l.id + "/s", lone("Ava " + a[l.id].s + ".", { pronoun: "he", subject: sub.id, style: "uk" }));
    t("area " + sub.id + "/" + a.id + "/" + l.id + "/g", lone("Next, Ava is working on " + a[l.id].g + ".", { pronoun: "they", subject: sub.id }));
  }); });
  k.HOME[sub.id].forEach(function (h) { if (h.s) ["us", "uk"].forEach(function (sty) { t("home " + sub.id + "/" + h.id + "/" + sty, lone(h.s + " " + (h.why || ""), { name: "Ava", subject: sub.id, style: sty })); }); });
});
k.HABITS.forEach(function (h) { if (h.s) t("habit " + h.id, lone("Ava is also working on " + h.s + ".", { subject: "pe" })); });

// Build details
var r = k.build({ name: "Leo", pronoun: "he", subject: "music", unit: "rhythm and percussion", area: "playing", level: "strong", area2: "singing", level2: "developing", strengths: ["enthusiasm"], habit: "listening", home: "sing" });
t("ok", r.ok && r.chars === r.text.length && r.issues.length === 0);
t("strength first", /^Leo brings real enthusiasm to music lessons\./.test(r.text));
t("unit", /In our work on rhythm and percussion, Leo keeps a steady beat/.test(r.text));
t("area2 also", /Leo also joins in with singing/.test(r.text));
t("next from lower level", /Next, Leo is working on matching the pitch of the notes when singing\./.test(r.text));
t("habit", /Leo is also working on listening while others are speaking or performing\./.test(r.text));
t("home + why", /clap the beat\. Singing for fun builds pitch and rhythm\./.test(r.text));
var f = k.build({ name: "Leo", subject: "music", area: "playing", level: "strong", area2: "singing", level2: "developing", focus: "playing", strengths: ["kind"] });
t("explicit focus", /working on keeping his own part going|working on keeping their own part going/.test(f.text));
t("focus default area1 when area2 higher", /working on adding more detail/.test(k.build({ subject: "art", area: "making", level: "secure", area2: "ideas", level2: "strong", strengths: ["kind"] }).text));
t("is also", /Ava is also kind and encouraging/.test(k.build({ name: "Ava", subject: "art", strengths: ["effort", "kind"] }).text));
t("also works", /Ava also works hard/.test(k.build({ name: "Ava", subject: "art", strengths: ["kind", "effort"] }).text));
t("unit cleaned", /In our work on clay animals, /.test(k.build({ subject: "art", unit: "Our clay animals.", strengths: ["kind"] }).text));
t("unit cleaned 2", /In our work on clay animals, /.test(k.build({ subject: "art", unit: "in our work on clay animals", strengths: ["kind"] }).text));
var uk = k.build({ name: "Maya", pronoun: "she", style: "uk", subject: "pe", area: "games", level: "strong", strengths: ["care"], habit: "kit", home: "active", timing: "end" });
t("uk pe", /organising her team/.test(uk.text) && /bringing PE kit/.test(uk.text) && /UK guidelines suggest children are active for an average of at least 60 minutes a day across the week\./.test(uk.text));
var us = k.build({ name: "Maya", pronoun: "she", subject: "pe", area: "games", level: "strong", strengths: ["care"], habit: "kit", home: "active" });
t("us pe", /organizing her team/.test(us.text) && /gym clothes and sneakers/.test(us.text) && /The CDC recommends 60 minutes or more of activity each day/.test(us.text));
t("uk art label", k.fill(k.SUBJECTS[0].label, { style: "uk" }) === "Art and design" && /art and design lessons/.test(k.build({ style: "uk", subject: "art", strengths: ["enthusiasm"] }).text));
t("us colour", /color/.test(k.build({ subject: "art", area: "looking", level: "secure", strengths: ["kind"] }).text) && /colour/.test(k.build({ style: "uk", subject: "art", area: "looking", level: "secure", strengths: ["kind"] }).text));
t("gear per subject", /takes good care of the instruments/.test(k.build({ subject: "music", strengths: ["care"] }).text) && /art materials and helps tidy up/.test(k.build({ subject: "art", strengths: ["care"] }).text));
t("share per subject", /performs for the class with confidence/.test(k.build({ subject: "music", strengths: ["confident"] }).text) && /shares their artwork with the class with confidence/.test(k.build({ subject: "art", strengths: ["confident"] }).text));
t("no subject", k.build({ strengths: ["kind"] }).ok === false);
t("defaults", /uses a range of materials/.test(k.build({ subject: "art", strengths: ["kind"] }).text));
t("habit not for subject ignored", !/PE kit|gym clothes/.test(k.build({ subject: "art", habit: "kit", strengths: ["kind"] }).text));
t("no strength review", has(k.build({ name: "Ava", subject: "pe" }).issues, "review", /No participation strength/));
t("3 strengths trimmed", has(k.build({ subject: "pe", strengths: ["kind", "effort", "safe"] }).issues, "note", /first two/));
t("placeholder name", /\[Name\]/.test(k.build({ subject: "pe", strengths: ["kind"] }).text));
t("period", /next semester/.test(k.build({ name: "Zed", subject: "pe", strengths: ["kind"], period: "semester" }).text) || /good start/.test(k.build({ name: "Zed", subject: "pe", strengths: ["kind"], period: "semester" }).text));
var big = { name: "Leo", pronoun: "he", subject: "music", unit: "rhythm and percussion", area: "playing", level: "strong", area2: "singing", level2: "developing", strengths: ["enthusiasm", "kind"], habit: "listening", home: "sing" };
var full = k.build(big).chars;
var lim = k.build(Object.assign({}, big, { limit: full - 40 }));
t("limit trims why first", lim.chars <= full - 40 && !/Singing for fun/.test(lim.text) && /clap the beat/.test(lim.text));
var l300 = k.build(Object.assign({}, big, { limit: 300 }));
t("limit 300 fits", l300.chars <= 300 && /Next, Leo is working on/.test(l300.text) && has(l300.issues, "note", /Dropped/));
t("limit over reports fix", has(k.build(Object.assign({}, big, { limit: 120 })).issues, "fix", /over your limit/));
t("seed stable", k.build(big).text === k.build(big).text);
k.SUBJECTS.forEach(function (s) { [600, 400].forEach(function (L) {
  var m = k.build({ name: "Alexandria", subject: s.id, area: k.AREAS[s.id][0].id, level: "strong", area2: k.AREAS[s.id][1].id, strengths: ["confident", "care"], habit: k.habitsFor(s.id)[1].id, home: k.HOME[s.id][1].id, unit: "our long unit name here", limit: L });
  t("longest " + s.id + " fits " + L, m.chars <= L && !has(m.issues, "fix", /over your limit/) && /Next, Alexandria is working on/.test(m.text));
}); });

// Checker
function iss(text, o) { return k.check(text, Object.assign({ name: "Ava" }, o || {})); }
t("not sporty", has(iss("Ava is not very sporty."), "fix", /Fixed-ability/));
t("tone deaf", has(iss("Ava is tone deaf."), "fix", /Fixed-ability/));
t("can't draw", has(iss("Ava can't draw."), "fix", /Fixed-ability/));
t("no rhythm", has(iss("Ava has no rhythm."), "fix", /Fixed-ability/));
t("two left feet", has(iss("Ava has two left feet."), "fix", /Fixed-ability/));
t("clumsy", has(iss("Ava is clumsy in games."), "fix", /Fixed-ability/));
t("uncoordinated", has(iss("Ava is uncoordinated."), "fix", /Fixed-ability/));
t("talented", has(iss("Ava is very talented."), "review", /Talent praise/));
t("natural athlete", has(iss("Ava is a natural athlete."), "review", /Talent praise/));
t("talent msg uk", has(iss("Ava is gifted.", { style: "uk" }), "review", /colours/) && has(iss("Ava is gifted."), "review", /colors/));
t("overweight", has(iss("Ava is overweight."), "fix", /Body or weight/));
t("weight", has(iss("Ava should lose weight."), "fix", /Body or weight/));
t("BMI", has(iss("Ava's BMI is high."), "fix", /Body or weight/));
t("out of shape", has(iss("Ava is out of shape."), "review", /body/));
t("unfit", has(iss("Ava is unfit."), "review", /body/));
t("for a girl", has(iss("Ava throws well for a girl."), "fix", /Gender/));
t("like a girl", has(iss("Ava throws like a girl."), "fix", /Gender/));
t("boys sports", has(iss("Ava likes boys' sports."), "fix", /Gender/));
t("asthma", has(iss("Ava's asthma stops her running."), "fix", /Medical/));
t("injury", has(iss("Ava missed games due to an injury."), "fix", /Medical/));
t("IEP", has(iss("Ava's IEP goals are in PE."), "fix", /Medical or support-plan/));
t("SEN", has(iss("Ava is on the SEN register."), "fix", /Support-plan/));
t("send ok", !has(iss("Please send Ava's kit on Mondays."), "fix", /Support-plan/));
t("FitnessGram", has(iss("Ava is in the Healthy Fitness Zone on FitnessGram."), "review", /Fitness test/));
t("PACER", has(iss("Ava ran 30 laps on the PACER."), "review", /Fitness test/));
t("beep test", has(iss("Ava reached level 6 on the beep test."), "review", /Fitness test/));
t("best in class", has(iss("Ava is the best in the class at football."), "review", /Comparison/));
t("fastest", has(iss("Ava is the fastest in the class."), "review", /Comparison/));
t("than other", has(iss("Ava sings better than most students."), "review", /Comparison/));
t("picked last", has(iss("Ava is often picked last."), "review", /Comparison/));
t("lazy", has(iss("Ava is lazy in PE."), "fix", /Label/));
t("messy", has(iss("Ava is messy with paint."), "fix", /Label/));
t("sore loser", has(iss("Ava is a sore loser."), "fix", /Label/));
t("slow music ok", !has(iss("Ava describes music as fast or slow."), "fix", /Label/));
t("sits out", has(iss("Ava often sits out of PE."), "review", /how often/));
t("no kit", has(iss("Ava comes with no kit."), "review", /how often/));
t("forgets kit", has(iss("Ava forgets her kit."), "review", /how often/));
t("refuses to sing", has(iss("Ava refuses to sing."), "review", /how often/));
t("can't", has(iss("Ava cannot catch yet."), "review", /gap first/));
t("always", has(iss("Ava always tries."), "review", /rarely literally/));
t("placeholder", has(iss("[Name] sings well."), "fix", /Placeholder/));
t("placeholder unit", has(iss("In [unit], Ava sings well."), "fix", /Placeholder/));
t("jargon locomotor", has(iss("Ava's locomotor skills are good."), "note", /jargon: "locomotor"/));
t("jargon ostinato", has(iss("Ava keeps an ostinato going."), "note", /jargon/));
t("jargon elements of art", has(iss("Ava uses the elements of art."), "note", /jargon/));
t("jargon Kodaly", has(iss("Ava reads Kodály rhythms."), "note", /jargon/));
t("stock", has(iss("Ava is a joy to have in class."), "note", /Stock phrase/));
t("little Picasso", has(iss("Ava is our little Picasso."), "note", /Stock phrase/));
t("future Olympian", has(iss("Ava is a future Olympian."), "note", /Stock phrase/));
t("alarming", has(iss("Ava's progress is alarming."), "review", /alarm/));
t("no skill", has(iss("Ava enjoys lessons. Next, Ava is working on focus."), "review", /No subject skill/));
t("skill ok", !has(iss("Ava keeps a steady beat. Next, more."), "review", /No subject skill/));
t("no next step", has(iss("Ava sings in tune."), "review", /No next step/));
t("needs x3", has(iss("Ava needs to listen, must try and should sing."), "review", /3 times/));
t("exclamations", has(iss("Great singing! Well done!"), "review", /exclamation/));
t("pronouns", has(iss("Ava sings well and he tries. Her drawing is good."), "review", /she\/her/));
t("name missing", has(iss("Sam sings well."), "review", /isn't in the comment/));
t("curly", has(iss("Ava’s drawing — lovely."), "note", /Curly/));
t("long sentence", has(iss("Ava " + Array(32).join("sings ") + "well."), "note", /over 30 words/));
t("limit", has(k.check("Ava sings well.", { limit: 5 }), "fix", /over your limit/));
t("empty", has(k.check(""), "fix", /Nothing/));
t("plain", k.plain("Ava’s “art” — great…") === "Ava's \"art\", great...");

// The guide's rewrites: every "before" is flagged, every "after" is clean.
rewrites.forEach(function (rw, i) {
  t("rewrite " + i + " before flagged", serious(k.check(rw[0])).length > 0 || k.check(rw[0]).length > 0);
  var after = rw[1].replace(/^Leave it out\.\s*/, "").replace(/^"|"$/g, "");
  t("rewrite " + i + " after clean", !serious(k.check(after)).length || (console.log(after, JSON.stringify(k.check(after))), false));
});

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
