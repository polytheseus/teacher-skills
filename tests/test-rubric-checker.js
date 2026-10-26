// node tests/test-rubric-checker.js
var rc = require("../docs/guides/rubric-checker.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(res, level, re, where) { return res.issues.some(function (i) { return i.level === level && re.test(i.msg) && (!where || where.test(i.where)); }); }

// Parsing
var md = "| Criteria | Beginning | Developing | Proficient | Exemplary |\n|---|---|---|---|---|\n| Use of evidence | a | b | c | d |";
var p = rc.parse(md);
t("md mode", p.mode === "md");
t("md levels", p.levels.length === 4 && p.levels[3] === "Exemplary");
t("md separator skipped", p.criteria.length === 1 && p.criteria[0].name === "Use of evidence");
var csv = 'Criteria,Level 1,Level 2\n"Evidence, quotes","Says ""hi"", then",b';
p = rc.parse(csv);
t("csv mode", p.mode === "csv");
t("csv quoted comma", p.criteria[0].name === "Evidence, quotes");
t("csv escaped quote", p.criteria[0].cells[0] === 'Says "hi", then');
p = rc.parse("Criteria\tA\tB\nX\t1\t");
t("tab mode", p.mode === "tab" && p.criteria[0].cells[1] === "");
t("no table", rc.check("just some words").ok === false);
t("empty", rc.check("   ").ok === false);

// The vague sample rubric
var vague = "Criteria\tExcellent (4)\tGood (3)\tFair (2)\tPoor (1)\n" +
  "Ideas and argument\tExcellent, insightful argument\tGood argument\tSome argument\tPoor argument\n" +
  "Use of evidence\tUses lots of relevant evidence\tUses some relevant evidence\tUses little relevant evidence\tNo evidence\n" +
  "Organization and grammar\tVery well organized with no errors\tWell organized with few errors\tSomewhat organized with some errors\tNot organized, many errors\n" +
  "Neatness\tVery neat\tNeat\tSomewhat messy\tMessy";
var r = rc.check(vague);
t("vague ok", r.ok && r.criteria.length === 4 && r.levels.length === 4);
t("judgment words flagged", has(r, "fix", /Judgment word/, /Ideas and argument → Good/));
t("adverb-only levels flagged (argument)", has(r, "fix", /same thing/, /Ideas and argument/));
t("adverb-only levels flagged (evidence)", has(r, "fix", /same thing/, /Use of evidence → Excellent \(4\) \/ Good \(3\)/));
t("two-in-one criterion", has(r, "review", /Two things/, /Organization and grammar/));
t("neatness not learning", has(r, "review", /something other than the learning/, /Neatness/));
t("short cells", has(r, "review", /Very short/, /Use of evidence → Poor/));
t("lowest level detected as last (4..1)", r.lowest === 3);
t("negative lowest", has(r, "note", /only says what's missing/, /Use of evidence → Poor/));
t("no negative note on top level", !has(r, "note", /only says what's missing/, /Excellent/));
t("fixes sorted first", r.issues[0].level === "fix");

// The skill's own good example: should have no fixes
var good = "| Criterion | Beginning | Developing | Proficient | Exemplary |\n|---|---|---|---|---|\n" +
  "| Use of evidence | Gives opinions without supporting evidence, or evidence is unrelated to the claim. | Includes evidence that relates to the claim, but doesn't explain how it supports it. | Supports each main point with relevant evidence and explains in their own words how it supports the claim. | Selects the most convincing evidence, explains it, and addresses a piece of evidence that could support the other side. |\n" +
  "| Claim | States an opinion on the topic but it changes during the essay. | States a claim in the introduction and keeps to it. | States a precise claim in the introduction that the body paragraphs each support. | States a precise claim and acknowledges a counterclaim, explaining why the claim still holds. |\n" +
  "| Organisation | Ideas appear in the order they occurred to the writer, without paragraphs. | Uses paragraphs, but a paragraph covers more than one point. | Each paragraph makes one point, opens with a topic sentence and links back to the claim. | Paragraphs build on each other, with transitions that show how each point strengthens the argument. |";
r = rc.check(good);
t("good ok", r.ok && r.criteria.length === 3);
t("good: no fixes", r.issues.filter(function (i) { return i.level === "fix"; }).length === 0);
t("good: no adverb flag", !has(r, "fix", /same thing/));
t("good: lowest is first", r.lowest === 0);
t("good: no negative note (positive framing)", !has(r, "note", /only says what's missing/));

// Counts and levels
r = rc.check("C\tA\tB\tC\nOne\tx y z w\tq r s t\tm n o p");
t("fewer than 3 criteria", has(r, "review", /Fewer than 3/));
t("odd levels note", has(r, "note", /middle level/));
t("unknown order → null", r.lowest === null);
var many = "C\tL1\tL2\n" + [1, 2, 3, 4, 5, 6, 7].map(function (i) { return "Crit" + i + "\tdoes thing number one here\twrites an extra paragraph about it"; }).join("\n");
t("more than 6 criteria", has(rc.check(many), "review", /More than 6/));
r = rc.check("Criteria\tL1\tL2\nEvidence\t\tGives two quotations and explains each");
t("empty cell", has(r, "fix", /Empty cell/));
t("one level only", has(rc.check("C\tOnly\nA\tsomething long enough here\nB\tsomething long enough here\nC\tsomething long enough here"), "fix", /one level column/));
t("amount word without anchor", has(rc.check("C\t1\t2\nEvidence\tUses some quotations from the text\tExplains how each quotation supports the claim"), "review", /Amount word/));
t("amount word with count ok", !has(rc.check("C\t1\t2\nEvidence\tUses at least two quotations, some explained\tExplains how each quotation supports the claim"), "review", /Amount word/));
t("anchored judgment ok", !has(rc.check("C\t1\t2\nEvidence\tGood evidence: at least two quotations\tExplains how each quotation supports the claim"), "fix", /Judgment/));

t("superlative most not flagged", !has(rc.check("C\t1\t2\nEvidence\tSelects the most convincing evidence and explains it\tExplains how each quotation supports the claim"), "review", /Amount word/));

// Fix prompt
var fp = rc.fixPrompt(vague, rc.check(vague));
t("prompt has rubric", fp.indexOf("Neatness\tVery neat") >= 0);
t("prompt lists problems", /A checker flagged/.test(fp));
t("prompt asks for task", /\[DESCRIBE THE TASK/.test(fp));

console.log(pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
