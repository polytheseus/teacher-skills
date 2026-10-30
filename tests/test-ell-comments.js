// node tests/test-ell-comments.js
var k = require("../docs/guides/ell-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/ell-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }

// Every stage x strong x focus x style x pronoun x timing x interp builds a clean comment.
var all = 0, clean = 0, bad = [];
k.STAGES.forEach(function (st, si) { k.DOMAINS.forEach(function (d1, i) { k.DOMAINS.forEach(function (d2, j) {
  ["us", "uk"].forEach(function (sty) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["no", "yes"].forEach(function (ip) {
    var n = si * 16 + i * 4 + j;
    var s1 = k.STRENGTHS[n % k.STRENGTHS.length].id, s2 = k.STRENGTHS[(n + 3) % k.STRENGTHS.length].id;
    var c = k.CONTENT[n % k.CONTENT.length].id, h = k.HOME[n % k.HOME.length].id;
    var sup = n % 3 ? [k.SUPPORTS[n % 8].id, k.SUPPORTS[(n + 2) % 8].id] : [];
    var r = k.build({ name: "Ava", pronoun: p, style: sty, timing: tm, stage: st.id, strong: d1.id, focus: d2.id, strengths: [s1, s2], content: c, supports: sup, home: h, interp: ip });
    all++;
    var s = serious(r.issues);
    var notes = r.issues.filter(function (x) { return x.level === "note" && !/No supports ticked/.test(x.msg); });
    if (r.ok && !s.length && !notes.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text) && !/also a go|has also a/.test(r.text)) clean++;
    else bad.push([st.id, d1.id, d2.id, sty, p, tm, ip].join("/") + ": " + JSON.stringify(r.issues) + " " + r.text);
  }); }); }); });
}); }); });
t("all " + all + " built comments pass the checker with no notes", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Each phrase on its own is clean of fix/review checks (except structure ones).
var STRUCT = /No (support|next step)|Nothing the student can do/;
k.STRENGTHS.forEach(function (s) { t("strength " + s.id, !serious(k.check(k.fill("Ava " + s.s + ".", { pronoun: "she" }))).filter(function (i) { return !STRUCT.test(i.msg); }).length); });
k.CONTENT.forEach(function (c) { if (c.s) t("content " + c.id, !serious(k.check(k.fill("Ava " + c.s + ".", { pronoun: "he", style: "uk" }))).filter(function (i) { return !STRUCT.test(i.msg); }).length); });
Object.keys(k.ENGLISH).forEach(function (st) { Object.keys(k.ENGLISH[st]).forEach(function (d) {
  ["s", "g"].forEach(function (f) { var x = k.fill("Ava " + (f === "g" ? "is working on " : "") + k.ENGLISH[st][d][f] + ".", { pronoun: "they" }); t("english " + st + "/" + d + "/" + f, !serious(k.check(x)).filter(function (i) { return !STRUCT.test(i.msg); }).length); });
}); });

// Build details
var r = k.build({ name: "Mateo", pronoun: "he", stage: "early", strong: "speaking", focus: "writing", strengths: ["brave", "friends"], content: "math", improved: "Now asks for help in English when he's stuck.", supports: ["visuals", "frames", "buddy"], home: "homelang", interp: "yes" });
t("ok", r.ok && r.chars === r.text.length);
t("strength first", /^Mateo has a go at speaking English/.test(r.text));
t("has also", /Mateo has also made good friends and joins in at recess\./.test(r.text));
t("improved lowercased", /Since the start of the quarter, Mateo now asks for help in English when he's stuck\./.test(r.text));
t("content", /Mateo shows a good understanding of math/.test(r.text));
t("english now", /In English, Mateo speaks in short phrases and simple sentences/.test(r.text));
t("next", /Next, Mateo is working on writing two or three linked sentences\./.test(r.text));
t("supports list", /supported with pictures, sentence starters and a buddy who speaks the same home language\./.test(r.text));
t("home why", /A strong home language helps children learn English\./.test(r.text));
t("interpreter", /arrange an interpreter/.test(r.text));
t("no issues", r.issues.length === 0);
t("brave second", /Ava also has a go at speaking/.test(k.build({ name: "Ava", stage: "new", strengths: ["kind", "brave"] }).text));
t("is also", /Ava is also a kind classmate/.test(k.build({ name: "Ava", stage: "new", strengths: ["brave", "kind"] }).text));
var u = k.build({ name: "Ava", pronoun: "they", style: "uk", stage: "expanding", strong: "writing", focus: "reading", strengths: ["friends"], content: "math", supports: ["group"], timing: "end" });
t("uk words", /maths/.test(u.text) && /break time/.test(u.text) && /organised paragraphs/.test(u.text) && /small-group EAL sessions/.test(u.text) && /this year/.test(u.text));
t("uk they", /explain their answers/.test(u.text));
t("us words", /organized/.test(k.build({ stage: "expanding", strong: "writing", strengths: ["kind"], supports: ["group"] }).text) && /English language \(ELD\) sessions/.test(k.build({ stage: "expanding", strengths: ["kind"], supports: ["group"] }).text));
t("uk class texts", /reads class texts/.test(k.build({ style: "uk", stage: "developing", strong: "reading", strengths: ["kind"] }).text));
t("us grade-level", /reads grade-level texts/.test(k.build({ stage: "developing", strong: "reading", strengths: ["kind"] }).text));
t("no stage", k.build({ strengths: ["kind"] }).ok === false);
t("defaults", /follows simple instructions, especially when/.test(k.build({ stage: "new", strengths: ["kind"] }).text) && /working on writing short sentences/.test(k.build({ stage: "new", strengths: ["kind"] }).text));
t("default supports note", has(k.build({ name: "Ava", stage: "developing", strengths: ["kind"] }).issues, "note", /No supports ticked.*sentence starters and a word bank/));
t("no strength review", has(k.build({ name: "Ava", stage: "early" }).issues, "review", /No strength/));
t("improved counts", !has(k.build({ name: "Ava", stage: "early", improved: "reads short books" }).issues, "review", /No strength/));
t("4 supports trimmed", has(k.build({ name: "Ava", stage: "early", strengths: ["kind"], supports: ["visuals", "frames", "words", "buddy"] }).issues, "note", /first three/));
t("placeholder name", /\[Name\]/.test(k.build({ stage: "early", strengths: ["kind"] }).text));
var big = { name: "Mateo", pronoun: "he", stage: "early", strengths: ["brave", "friends"], content: "math", improved: "now asks for help in English", supports: ["visuals", "frames", "buddy"], home: "homelang", interp: "yes" };
var full = k.build(big).chars;
var lim = k.build(Object.assign({}, big, { limit: full - 50 }));
t("limit trims why first", lim.chars <= full - 50 && !/A strong home language helps/.test(lim.text) && /has also made good friends/.test(lim.text));
var lim2 = k.build(Object.assign({}, big, { limit: 450 }));
t("limit trims more", lim2.chars <= 450 || has(lim2.issues, "fix", /over your limit/));
t("content dropped note", has(k.build(Object.assign({}, big, { limit: 300 })).issues, "note", /other-subjects line/));
t("limit over reports fix", has(k.build(Object.assign({}, big, { limit: 200 })).issues, "fix", /over your limit/));
t("seed stable", k.build(big).text === k.build(big).text);

// Checker
function iss(text) { return k.check(text, { name: "Ava" }); }
t("limited English", has(iss("Ava has limited English."), "fix", /Deficit wording: "limited English"/));
t("language barrier", has(iss("There is a language barrier."), "fix", /language barrier/));
t("no English", has(iss("Ava has no English."), "fix", /no English/));
t("poor English", has(iss("Ava's English is poor."), "fix", /English is poor/));
t("can't speak English", has(iss("Ava can't speak English."), "fix", /can't speak English/));
t("doesn't understand English", has(iss("Ava doesn't understand English."), "fix", /doesn't understand English/));
t("non-native", has(iss("As a non-native speaker, Ava finds it hard."), "fix", /non-native/));
t("an ESL student", has(iss("Ava is an ESL student."), "review", /programme/));
t("ESL kids", has(iss("Ava is with the ESL kids."), "review", /programme/));
t("EAL group ok", !has(iss("Ava works in our EAL group."), "review", /programme/));
t("refugee", has(iss("Ava is a refugee."), "fix", /Immigration/));
t("visa", has(iss("Ava's visa is pending."), "fix", /Immigration/));
t("came from", has(iss("Ava came from Syria last year."), "review", /where the family is from/));
t("their country", has(iss("In her country Ava went to school."), "review", /where the family is from/));
t("parents english", has(iss("Ava's parents don't speak English."), "fix", /Family language/));
t("mum speaks little", has(iss("Ava's mum speaks little English."), "fix", /Family language/));
t("speak English at home", has(iss("Please speak English at home."), "review", /home language/));
t("only English at home", has(iss("Use only English at home."), "review", /home language/));
t("stop speaking", has(iss("Ava should stop speaking Arabic in class."), "review", /home language/));
t("accent", has(iss("Ava has a strong accent."), "review", /accent/));
t("because of English", has(iss("Ava's math grade is low because of her English."), "review", /mixes language/));
t("native speakers", has(iss("Ava is behind native speakers."), "fix", /Comparison/));
t("rest of class", has(iss("Ava is catching up with the rest of the class."), "fix", /Comparison/));
t("learning disability", has(iss("Ava may have a learning disability."), "fix", /isn't a learning difficulty/));
t("speech delay", has(iss("Ava has a speech delay."), "fix", /Diagnosis/));
t("SEN", has(iss("Ava is on the SEN register."), "fix", /Support-plan/));
t("lazy", has(iss("Ava is lazy."), "fix", /Label/));
t("shy", has(iss("Ava is very shy."), "review", /quiet stage/));
t("won't speak", has(iss("Ava won't speak in class."), "review", /quiet stage/));
t("silent", has(iss("Ava is silent in lessons."), "review", /quiet stage/));
t("can't", has(iss("Ava can't write a sentence."), "review", /puts the gap first/));
t("behind", has(iss("Ava is behind in reading."), "review", /test was in English/));
t("always", has(iss("Ava always tries."), "review", /rarely literally/));
t("idiom leaps", has(iss("Ava is making leaps and bounds."), "review", /Idiom: "leaps and bounds"/));
t("idiom on track", has(iss("Ava is on track."), "review", /Idiom/));
t("idiom piece of cake", has(iss("Math is a piece of cake for Ava."), "review", /Idiom/));
t("idiom shell", has(iss("Ava is coming out of her shell."), "review", /Idiom/));
t("idiom keep it up", has(iss("Keep it up, Ava!"), "review", /Idiom/));
t("WIDA level", has(iss("Ava is at WIDA level 2.1."), "note", /Test level/));
t("level 3", has(iss("Ava is level 3 in speaking."), "note", /Test level/));
t("ELPAC", has(iss("Ava's ELPAC level is 3."), "note", /Test level/));
t("scale score", has(iss("Ava's scale score rose."), "note", /Test level/));
t("jargon decoding", has(iss("Ava is decoding CVC words."), "note", /jargon: "decoding"/));
t("jargon scaffold", has(iss("With scaffolds, Ava writes."), "note", /jargon/));
t("jargon silent period", has(iss("Ava is in the silent period."), "note", /jargon/));
t("jargon L1", has(iss("Ava uses her L1 to plan."), "note", /jargon: "L1"/));
t("family detail", has(iss("Ava gets free lunch."), "fix", /Family or private/));
t("placeholder", has(iss("[Name] reads well."), "fix", /Placeholder/));
t("home language placeholder", has(iss("Ava reads in [home language]."), "fix", /Placeholder/));
t("stock", has(iss("Ava is a joy to have in class."), "note", /Stock/));
t("alarm", has(iss("I am very concerned about Ava."), "review", /alarm/));
t("no support", has(iss("Ava reads short books. Next, Ava is working on longer ones."), "review", /No support/));
t("no next", has(iss("Ava reads short books with pictures."), "review", /No next step/));
t("no can-do", has(iss("Ava is in our group. Next, Ava is working on letters."), "review", /Nothing the student can do/));
t("no home", has(iss("Ava reads short books."), "note", /No home tip/));
t("no contact", has(iss("Ava reads short books."), "note", /No invitation/));
t("contact interpreter", !has(iss("We can arrange an interpreter."), "note", /No invitation/));
t("exclaim", has(iss("Great! Well done!"), "review", /exclamation/));
t("pronouns", has(iss("Ava did her work and he finished it."), "review", /pronouns/));
t("name missing", has(k.check("Leo reads well.", { name: "Ava" }), "review", /isn't in the comment/));
t("curly", has(iss("Ava’s reading"), "note", /Curly/));
t("plain", k.plain("Ava’s “work” — done…") === "Ava's \"work\", done...");
t("long sentence", has(iss("Ava " + new Array(25).join("reads ") + "."), "note", /over 22 words/));
t("over limit", has(k.check("Ava reads.", { limit: 5 }), "fix", /over your limit/));
t("empty", has(k.check(""), "fix", /Nothing/));

// Every rewrite: "before" is flagged, "after" is clean of fix/review checks.
rewrites.forEach(function (rw, i) {
  t("before flagged " + i, k.check(rw[0]).some(function (x) { return x.level === "fix" || (x.level === "review" && !STRUCT.test(x.msg)) || (x.level === "note" && /Test level|jargon|Idiom/.test(x.msg)); }));
  var after = rw[1].replace(/^(Leave it out|Leave where the family is from out|Don't write it)\.[^"]*"?/, "").replace(/"$/, "");
  if (!after.trim()) return;
  var s = k.check(after).filter(function (x) { return (x.level === "fix" || x.level === "review") && !STRUCT.test(x.msg); });
  t("after clean " + i, !s.length);
  if (s.length) console.log("  after " + i + ": " + JSON.stringify(s));
});

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
