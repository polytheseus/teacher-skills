// node tests/test-report-planner.js
var p = require("../docs/report-planner.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
var WEEK = [1, 2, 3, 4, 5];
function base(x) { var o = { students: 25, perStudent: 1, minutes: 8, proof: 2, dailyMax: 60, buffer: 1, start: "2026-11-02", due: "2026-11-16", days: WEEK, word: "children" }; for (var k in x) o[k] = x[k]; return o; }

// Mon 2 Nov to Fri 13 Nov = 10 weekdays before Mon 16 Nov; 1 kept for proofreading.
var r = p.plan(base({}));
t("ok", r.ok && r.fits);
t("9 writing days, 1 proof day", r.writeDays === 9 && r.proofDays === 1);
var w = r.rows.filter(function (x) { return x.kind === "write"; });
t("every child once, in order", w[0].from === 1 && w[w.length - 1].to === 25 && w.reduce(function (s, x) { return s + x.count; }, 0) === 25);
t("contiguous ranges", w.every(function (x, i) { return i === 0 || x.from === w[i - 1].to + 1; }));
t("even spread (2 or 3 a day)", w.every(function (x) { return x.count === 2 || x.count === 3; }));
t("no weekend days", r.rows.every(function (x) { var d = new Date(x.date + "T00:00:00Z").getUTCDay(); return d > 0 && d < 6; }));
t("proof day is Fri 13 Nov", r.rows[r.rows.length - 1].kind === "proof" && r.rows[r.rows.length - 1].label === "Fri 13 Nov");
t("totals", r.writeMinutes === 200 && r.proofMinutes === 50 && r.totalMinutes === 250 && r.comments === 25);
t("text names days", /Mon 2 Nov: write for children 1–3 \(about 24 min\)/.test(r.text) && /Fri 13 Nov: proofread children 1–25 \(about 50 min\)/.test(r.text));
t("deadline day itself not used", r.rows.every(function (x) { return x.date < "2026-11-16"; }));

// Doesn't fit: 30 children x 3 subjects x 10 min = 30 min each, 30 min/day, 3 writing days.
var f = p.plan(base({ students: 30, perStudent: 3, minutes: 10, dailyMax: 30, start: "2026-11-09", due: "2026-11-13" }));
t("not fit flagged", f.ok && !f.fits && f.cap === 1 && f.perDay === 10);
t("advice: singular child", /write for 1 child a day/.test(f.advice) && /you need 30 writing days/.test(f.advice) && /about 5 h a day/.test(f.advice));
t("text says doesn't fit", /This doesn't fit yet/.test(f.text));

// One child takes longer than the day.
var big = p.plan(base({ perStudent: 6, minutes: 15, dailyMax: 60 }));
t("child longer than a day", !big.ok && /more than the 1 h a day/.test(big.issues[0]));

// Weekend-only work, students wording.
var we = p.plan(base({ days: [0, 6], word: "students", students: 120, minutes: 4, dailyMax: 240, buffer: 1 }));
t("weekend plan", we.ok && we.rows.every(function (x) { var d = new Date(x.date + "T00:00:00Z").getUTCDay(); return d === 0 || d === 6; }));
t("students wording", /students 1–/.test(we.text) && !/children/.test(we.text));

// Buffer bigger than days available.
var b = p.plan(base({ start: "2026-11-12", due: "2026-11-14", buffer: 3, students: 4 }));
t("buffer clipped with note", b.ok && b.proofDays === 1 && /fewer proofreading days/.test(b.issues.join(" ")));
// Single working day: no proof day, note given.
var one = p.plan(base({ start: "2026-11-13", due: "2026-11-14", buffer: 1, students: 4 }));
t("single day: note about proofreading", one.ok && one.proofDays === 0 && /No day is left for proofreading/.test(one.issues.join(" ")));
// Zero proof minutes still shows proof day without minutes.
var z = p.plan(base({ proof: 0 }));
t("proof 0 keeps day", z.rows[z.rows.length - 1].kind === "proof" && z.rows[z.rows.length - 1].minutes === 0 && /proofread and fix/.test(z.text));
// More days than children.
var few = p.plan(base({ students: 3 }));
t("few children: 3 rows", few.rows.filter(function (x) { return x.kind === "write"; }).length === 3);
t("single child label", /write for child 1 /.test(few.text));

// Validation.
t("no students", !p.plan(base({ students: 0 })).ok);
t("bad date", !p.plan(base({ start: "2026-02-30" })).ok);
t("due before start", !p.plan(base({ due: "2026-11-01" })).ok);
t("no days", !p.plan(base({ days: [] })).ok);
t("no matching weekday", !p.plan(base({ start: "2026-11-14", due: "2026-11-16", days: [3] })).ok);
t("no minutes", !p.plan(base({ minutes: "" })).ok);

// DST change (UK clocks go back 25 Oct 2026, US 1 Nov): dates still step by one day.
var d = p.plan(base({ start: "2026-10-22", due: "2026-11-06", days: [0, 1, 2, 3, 4, 5, 6], students: 15 }));
var dates = d.rows.map(function (x) { return x.date; });
t("no duplicate or skipped dates over DST", new Set(dates).size === dates.length && dates.indexOf("2026-10-25") >= 0 && dates.indexOf("2026-11-01") >= 0);

// Early mode: fill each day to the cap (60 min / 8 = 7 children), finish in 4 days.
var e = p.plan(base({ mode: "early" }));
var ew = e.rows.filter(function (x) { return x.kind === "write"; });
t("early: 4 writing days of 7,7,7,4", e.ok && e.fits && ew.map(function (x) { return x.count; }).join() === "7,7,7,4" && e.writeDays === 4);
t("early: starts Mon 2 Nov, proof day still Fri 13 Nov", ew[0].label === "Mon 2 Nov" && e.rows[e.rows.length - 1].label === "Fri 13 Nov");
t("early: each day within daily time", ew.every(function (x) { return x.minutes <= 60; }));
t("early when not fitting behaves like even", (function () { var x = p.plan(base({ mode: "early", students: 30, perStudent: 3, minutes: 10, dailyMax: 30, start: "2026-11-09", due: "2026-11-13" })); return x.ok && !x.fits && x.rows.filter(function (r) { return r.kind === "write"; }).length === 3; })());

// ICS.
var ics = p.ics(r);
t("ics events", (ics.match(/BEGIN:VEVENT/g) || []).length === r.rows.length && /DTSTART;VALUE=DATE:20261102\r\nDTEND;VALUE=DATE:20261103/.test(ics));
t("ics CRLF + escaped commas", /\r\n$/.test(ics) && !/[^\r]\n/.test(ics));
t("mins", p.mins(45) === "45 min" && p.mins(60) === "1 h" && p.mins(250) === "4 h 10 min");

console.log(pass + "/" + (pass + fail) + " passed");
process.exit(fail ? 1 : 0);
