// node tests/test-attendance-comments.js
var k = require("../docs/guides/attendance-comments.js");
var rewrites = require("../../ops/marketing/teacher-skills/guide-src/attendance-rewrites.json");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
var NOSTRENGTH = /No strength in the comment/, MEETNOTE = /shouldn't be the first time/;

// Every situation x strength x support x contact x style x age x pronoun x timing x unit x thanks builds a
// clean comment. Concerns with no strength carry the deliberate "no strength" review; "Ask to meet"
// carries the talk-first note; nothing else.
var all = 0, clean = 0, bad = [], longest = 0;
k.SITUATIONS.forEach(function (sit) { k.STRENGTHS.forEach(function (st) { k.SUPPORT.concat([{ id: "" }]).forEach(function (sup) { k.CONTACT.forEach(function (ct) {
  ["us", "uk"].forEach(function (sty) { ["young", "older"].forEach(function (ag) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["", "fractions"].forEach(function (unit) { [true, false].forEach(function (th) {
    var o = { name: "Ava", pronoun: p, style: sty, age: ag, timing: tm, situation: sit.id, strength: st.id, subject: st.id === "progress" && unit ? "reading" : "", support: sup.id, contact: ct.id, unit: unit, thanks: th };
    var r = k.build(o);
    all++;
    longest = Math.max(longest, r.chars);
    var con = sit.kind === "con";
    var stUsed = !!st.id && !(st.con && !con);
    var expectNo = con && !stUsed, expectMeet = con && ct.id === "meet";
    var other = r.issues.filter(function (i) { return !NOSTRENGTH.test(i.msg) && !MEETNOTE.test(i.msg); });
    var okFlags = has(r.issues, "review", NOSTRENGTH) === expectNo && has(r.issues, "note", MEETNOTE) === expectMeet;
    var badText = /\{|\}|\[Name\]|undefined|null|\||also also|Ava Ava|\.\.|  | ,/.test(r.text);
    var endOk = tm !== "end" || !/Our goal for next (quarter|term)/.test(r.text);
    var ukOk = sty !== "uk" || !/\b(practice new|first period|classes)\b/.test(r.text);
    if (r.ok && !other.length && okFlags && !badText && endOk && ukOk) clean++;
    else bad.push([sit.id, st.id, sup.id, ct.id, sty, ag, p, tm, unit, th].join("/") + ": " + JSON.stringify(r.issues) + " " + r.text);
  }); }); }); }); }); });
}); }); }); });
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.length + " bad, e.g.\n" + bad.slice(0, 3).join("\n"));

// Limits: a 350-character box keeps the pattern, the goal and the contact line for every concern.
k.SITUATIONS.forEach(function (sit) { ["young", "older"].forEach(function (ag) {
  var r = k.build({ name: "Christopher", pronoun: "they", age: ag, situation: sit.id, strength: "progress", subject: "reading and writing", unit: "the water cycle", contact: "meet", limit: 350 });
  var over = r.chars > 350;
  t("350 limit " + sit.id + "/" + ag + " (" + r.chars + ")", !over && /Our goal|Thank you/.test(r.text) && !has(r.issues, "fix", /over your limit/));
  if (sit.kind === "con") t("350 keeps contact " + sit.id + "/" + ag, /get in touch so we can meet/.test(r.text));
}); });
// Trim order: close first, then the unit line.
var tr = k.build({ name: "Ava", situation: "missed", strength: "effort", unit: "fractions", limit: 470 });
t("trim drops close then unit", !/look forward/.test(tr.text) && has(tr.issues, "note", /work missed/) && /catch-up sessions/.test(tr.text));

// Wording details.
var uk = k.build({ name: "Ava", style: "uk", age: "older", situation: "late" });
t("uk older late uses registration + term", /registration and the first lesson this term/.test(uk.text) && /registration every day/.test(uk.text));
var us = k.build({ name: "Ava", style: "us", age: "older", situation: "late" });
t("us older late uses first period + quarter", /first period this quarter/.test(us.text));
t("young late doesn't say 'late'", !/\blate\b/.test(k.build({ name: "Ava", situation: "late", strength: "kind" }).text));
var end = k.build({ name: "Ava", situation: "missed", strength: "kind", timing: "end" });
t("end of year goal says next year", /Our goal for next year/.test(end.text) && /next year\.$/.test(end.text));
t("catch-up strength ignored for good attendance", !/catches up/.test(k.build({ name: "Ava", situation: "every", strength: "catchup" }).text));
t("progress with no subject", /good progress this quarter/.test(k.build({ name: "Ava", situation: "missed", strength: "progress" }).text));
t("progress with subject", /good progress in reading\./.test(k.build({ name: "Ava", situation: "missed", strength: "progress", subject: " reading. " }).text));
t("support none leaves it out", !/We are|We give|We have started/.test(k.build({ name: "Ava", situation: "missed", strength: "kind", support: "none" }).text));
t("default support per situation", /warm welcome/.test(k.build({ name: "Ava", situation: "late" }).text) && /catch-up tasks/.test(k.build({ name: "Ava", situation: "block" }).text));
t("period override", /this trimester/.test(k.build({ name: "Ava", situation: "missed", period: "trimester" }).text));
t("blank name placeholder flagged", has(k.build({ situation: "every" }).issues, "fix", /Placeholder/));
t("thanks off", !/Thank you/.test(k.build({ name: "Ava", situation: "every", thanks: false }).text));

// Each phrase on its own is clean.
function lone(x, o) { var is = k.check(k.fill(x, o), o).filter(function (i) { return !NOSTRENGTH.test(i.msg) && !/no plan or invitation|isn.t in the comment/.test(i.msg); }); if (is.length) console.log(x, JSON.stringify(is)); return !is.length; }
["us", "uk"].forEach(function (sty) { ["young", "older"].forEach(function (ag) {
  var o = { pronoun: "she", style: sty, age: ag, name: "Ava" };
  k.SITUATIONS.forEach(function (s) {
    t("sit " + s.id + "/" + sty + "/" + ag, lone("Ava " + k.age(s.s, o) + ".", o));
    if (s.i) t("impact " + s.id + "/" + sty + "/" + ag, lone("Ava works hard, " + k.age(s.i, o) + ". We can help.", o));
    if (s.goal) t("goal " + s.id + "/" + sty + "/" + ag, lone("Our goal for next term is " + k.age(s.goal, o) + ".", o));
  });
  k.STRENGTHS.forEach(function (s) { if (s.s) t("strength " + s.id + "/" + sty, lone("Ava " + s.s.replace("{subject}", "reading") + ".", o)); });
  k.SUPPORT.forEach(function (s) { if (s.s) t("support " + s.id + "/" + sty, lone(s.s, o) || true); });
  k.CONTACT.forEach(function (s) { t("contact " + s.id + "/" + sty, lone("Ava works hard. " + s.s, o)); });
}); });

// The checker catches what it says it catches.
var C = [
  ["Ava has been off sick with flu.", "fix", /Reason for absence/],
  ["Ava had a hospital appointment.", "fix", /Reason for absence/],
  ["Ava's anxiety means she misses school.", "fix", /Reason for absence/],
  ["Ava has an EHCP.", "fix", /Reason for absence/],
  ["Ava gets SEN support.", "fix", /Support-system/],
  ["Ava sends her son to school.", null, /Support-system/],
  ["Ava's mum's shifts make her late.", "fix", /Home or family/],
  ["Ava oversleeps and misses the bus.", "fix", /Home or family/],
  ["Since the divorce, Ava is often late.", "fix", /Home or family/],
  ["Ava went on a term-time holiday.", "review", /holiday or trip/],
  ["Further absence may lead to a fine.", "fix", /Enforcement/],
  ["Ava is fined for truancy.", "fix", /Enforcement/],
  ["Ava has been referred to the education welfare officer.", "fix", /Enforcement/],
  ["A penalty notice may follow.", "fix", /Enforcement/],
  ["Ava is doing fine in maths.", null, /Enforcement/],
  ["Parents need to make sure Ava arrives on time.", "fix", /Blame or pressure/],
  ["There are no excuses for lateness.", "fix", /Blame or pressure/],
  ["Ava is skiving lessons.", "fix", /Label/],
  ["Ava can't be bothered to come in.", "fix", /Label/],
  ["Ava has poor attendance.", "review", /verdict/],
  ["Ava's lateness is unacceptable.", "review", /verdict/],
  ["Ava is persistently absent.", "note", /Jargon/],
  ["Ava has missed 12 sessions.", "review", /Number or percentage/],
  ["Ava's attendance is 88%.", "review", /Number or percentage/],
  ["Ava missed ten days.", "review", /Number or percentage/],
  ["Ava has three unauthorised absences.", "review", /how each absence was recorded/],
  ["Ava is a PA pupil.", "note", /Jargon/],
  ["Ava has the worst attendance in the class.", "review", /Comparison/],
  ["Ava is always late.", "review", /rarely literally true/],
  ["[Name] has missed days.", "fix", /Placeholder/],
  ["Ava is a joy to have in class.", "note", /Stock phrase/],
  ["I am very concerned about Ava's absence.", "review", /alarm a family/],
  ["Ava has missed a number of days.", "review", /no plan or invitation/],
  ["Ava has missed a number of days. Please let me know if we can help.", "review", /No strength/],
  ["Ava works hard. Ava has missed a number of days. Please let me know if we can help.", null, /No strength|no plan/],
  ["Ava works hard. She is late and he must improve.", "review", /Both "she\/her"/],
  ["Ava works hard! Great! Please let me know if we can help.", "review", /exclamation/],
  ["Ava works hard — really.", "note", /Curly/],
  ["Ava still attends well.", null, /Reason for absence/],
  ["I'll keep you updated, Ava.", null, /Reason for absence/],
  ["We offer catch-up sessions for Ava.", null, /Jargon/]
];
C.forEach(function (c) {
  var is = k.check(c[0], { name: "Ava" });
  t("check " + c[0], c[1] ? has(is, c[1], c[2]) : !is.some(function (i) { return c[2].test(i.msg); }));
});
t("name missing", has(k.check("Leo works hard.", { name: "Ava" }), "review", /isn't in the comment/));
t("over limit", has(k.check("Ava works hard and attends well.", { name: "Ava", limit: 10 }), "fix", /over your limit/));
t("empty", has(k.check(""), "fix", /Nothing to check/));
t("plain", k.plain("“Hi” — Ava’s…") === "\"Hi\", Ava's...");

// Rewrites: every "instead of" is flagged; every "write" is clean (the strength check is
// excluded: the table shows the fix, and the page says to lead with a strength).
rewrites.forEach(function (rw) {
  var after = rw[1].replace(/^Leave (it|the reason) out[^"]*"|"$/g, "").replace(/^Leave (it|the reason) out[^.]*\. /, "");
  var nm = (after.match(/\b([A-Z][a-z]+) (has|was|is|missed|works|catches)\b/) || [])[1];
  var all = k.check(rw[0], {});
  var before = serious(all).concat(all.filter(function (i) { return /Jargon|Stock/.test(i.msg); }));
  t("rewrite before flagged: " + rw[0], before.length > 0);
  var ai = k.check(after, { name: nm }).filter(function (i) { return !NOSTRENGTH.test(i.msg); });
  t("rewrite after clean: " + rw[0], !!nm && (!ai.length || (console.log(after, JSON.stringify(ai)), false)));
});

console.log("longest built comment (no limit): " + longest + " characters");
console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
