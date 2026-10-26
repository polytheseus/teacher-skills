// Rubric checker: paste a rubric (Markdown table, rows copied from Google
// Docs / Sheets / Word, or CSV) and it flags the usual problems. Runs in the
// browser and in node (module.exports) for tests. Nothing pasted is sent anywhere.
(function () {
  // Judgment words: a marker can't see "good" on the page.
  var JUDGMENT = ["excellent", "outstanding", "exceptional", "superb", "good", "great", "strong", "weak", "poor",
    "adequate", "satisfactory", "unsatisfactory", "acceptable", "competent", "proficiently", "effective", "effectively",
    "ineffective", "appropriate", "appropriately", "inappropriate", "insightful", "sophisticated", "creative",
    "creatively", "thoughtful", "impressive", "fantastic", "amazing", "neat", "neatly", "messy", "sloppy", "nice",
    "basic", "limited", "solid", "skilful", "skillful", "skilfully", "skillfully", "well"];
  // Amount and frequency words: fine next to a count or example, vague on their own.
  var AMOUNT = ["some", "most", "many", "few", "several", "various", "little", "much", "all", "mostly", "partially",
    "partly", "fully", "sometimes", "often", "always", "never", "rarely", "occasionally", "occasional", "frequently",
    "frequent", "consistently", "inconsistently", "usually", "generally", "mainly", "minimal", "minimally", "somewhat",
    "very", "highly", "extremely", "really", "quite", "largely", "slightly", "almost", "mostly", "sufficient",
    "insufficient", "sufficiently", "considerable", "extensive", "extensively", "thorough", "thoroughly", "clear",
    "clearly", "unclear", "accurate", "accurately", "mostly", "any", "no", "not", "lacks", "lacking", "does", "doesn't",
    "do", "is", "are", "with", "without", "and", "or", "of", "the", "a", "an", "to", "in", "on", "for", "that", "their",
    "his", "her", "its", "it", "uses", "use", "using", "shows", "show", "showing", "demonstrates", "demonstrate",
    "includes", "include", "including", "student", "students", "work", "errors", "error", "mistakes", "few", "minor",
    "major", "but", "yet", "may", "can", "be", "has", "have", "some", "level", "understanding", "attempt", "attempts",
    "attempted", "lots", "lot", "plenty", "less", "more", "fewer", "least", "range", "variety"].concat(JUDGMENT);
  var AMOUNT_ONLY = ["some", "most", "many", "few", "several", "various", "little", "sometimes", "often", "rarely",
    "occasionally", "frequently", "consistently", "minimal", "somewhat", "mostly", "partially", "sufficient"];
  var NOT_LEARNING = /\b(neat(ness)?|presentation|handwriting|length|word count|colou?rs?|fonts?|decorat\w*|effort|participation|on time|deadline|behaviou?r|attitude|title page|cover page)\b/i;
  var NEGATIVE_START = /^\s*(no\b|not\b|does not|doesn't|did not|didn't|fails? to|lacks?\b|missing\b|absent\b|never\b|unable to|incomplete\b|none\b)/i;
  var ANCHOR = /\d|\b(e\.g\.|such as|for example|including|at least|one|two|three|four|five|each|every)\b|:/i;

  function splitRow(line, mode) {
    if (mode === "md") {
      var s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
      return s.split("|").map(function (c) { return c.trim(); });
    }
    if (mode === "tab") return line.split("\t").map(function (c) { return c.trim(); });
    // CSV with quotes.
    var out = [], cur = "", q = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (q) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') q = false;
        else cur += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { out.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    out.push(cur.trim());
    return out;
  }

  function parse(text) {
    var lines = text.replace(/\r/g, "").split("\n").filter(function (l) { return l.trim(); });
    if (!lines.length) return null;
    var mode = lines.some(function (l) { return /^\s*\|/.test(l); }) ? "md" : lines.some(function (l) { return l.indexOf("\t") >= 0; }) ? "tab" : "csv";
    var rows = lines
      .filter(function (l) { return !(mode === "md" && /^\s*\|?\s*:?-{2,}/.test(l)); })
      .map(function (l) { return splitRow(l, mode); });
    if (rows.length < 2) return { mode: mode, levels: [], criteria: [] };
    var header = rows[0], width = header.length;
    var levels = header.slice(1).map(function (h, i) { return h || "Level " + (i + 1); });
    var criteria = rows.slice(1).map(function (r) {
      var cells = [];
      for (var i = 1; i < width; i++) cells.push(r[i] || "");
      return { name: r[0] || "", cells: cells };
    });
    return { mode: mode, levels: levels, criteria: criteria };
  }

  function words(s) { return (s.toLowerCase().match(/[a-z']+/g) || []); }
  function contentSet(s) {
    var set = {};
    words(s).forEach(function (w) { if (AMOUNT.indexOf(w) < 0 && w.length > 2) set[w.replace(/(ies|es|s)$/, "")] = 1; });
    return Object.keys(set);
  }
  function overlap(a, b) {
    if (!a.length || !b.length) return a.length === b.length ? 1 : 0;
    var inter = a.filter(function (w) { return b.indexOf(w) >= 0; }).length;
    return inter / (a.length + b.length - inter);
  }
  // Which end is the lowest level? Labels like "4 Exemplary | 3 | 2 | 1 Beginning" run high to low.
  function lowestIndex(levels) {
    var L = levels.length, HIGH = /exemplary|exceed|excellent|advanced|mastery|distinction|outstanding|expert|beyond|greater depth/i,
      LOW = /beginning|emerging|novice|below|not yet|working towards|insufficient|incomplete|poor|unsatisfactory/i;
    var nums = levels.map(function (l) { var m = l.match(/\d+(\.\d+)?/); return m ? parseFloat(m[0]) : null; });
    if (nums[0] !== null && nums[L - 1] !== null && nums[0] !== nums[L - 1]) return nums[0] > nums[L - 1] ? L - 1 : 0;
    if (HIGH.test(levels[0] || "") || LOW.test(levels[L - 1] || "")) return L - 1;
    if (LOW.test(levels[0] || "") || HIGH.test(levels[L - 1] || "")) return 0;
    return null;
  }

  function check(text) {
    var r = parse(text), issues = [];
    if (!r || !r.criteria.length || r.levels.length < 1) {
      return { ok: false, error: "Couldn't find a table. Paste the header row (criteria, then level names) and one row per criterion, as a Markdown table, rows copied from a document or spreadsheet, or CSV.", issues: [] };
    }
    var L = r.levels.length;
    var low = lowestIndex(r.levels);
    function add(level, where, msg, fix) { issues.push({ level: level, where: where, msg: msg, fix: fix || "" }); }

    if (r.criteria.length < 3) add("review", "Whole rubric", r.criteria.length + " criterion" + (r.criteria.length === 1 ? "" : "s") + ". Fewer than 3 usually means one row is doing the work of several, which makes feedback vague.", "Split the main skill into 3–6 things a marker can see separately.");
    if (r.criteria.length > 6) add("review", "Whole rubric", r.criteria.length + " criteria. More than 6 slows marking and spreads feedback thin.", "Merge or drop rows that don't trace to the learning objective, or move them to a checklist.");
    if (L < 2) add("fix", "Whole rubric", "Only one level column was found.", "Check the header row: criteria first, then one column per level. For a single-point rubric, add columns for \"Not yet\" and \"Beyond\" comments.");
    if (L > 6) add("review", "Whole rubric", L + " levels. Markers struggle to tell more than 4–5 apart consistently.", "Try 4 levels.");
    if (L % 2 === 1 && L >= 3) add("note", "Whole rubric", L + " levels gives a middle level that becomes the default \"safe\" mark.", "Consider 4 levels (no neutral middle) unless your school's bands are fixed.");

    r.criteria.forEach(function (c, ci) {
      var name = c.name || "Row " + (ci + 1);
      if (!c.name) add("fix", "Row " + (ci + 1), "The criterion has no name.", "Name what's being assessed, e.g. \"Use of evidence\".");
      if (/\s(and|&)\s|\//.test(c.name) && c.name.split(/\s(?:and|&)\s|\//).length >= 2) add("review", name, "Two things in one criterion? A piece can be strong on one and weak on the other, and then no level fits.", "Split it into two rows, or keep it only if they're really one skill.");
      if (NOT_LEARNING.test(c.name)) add("review", name, "This marks something other than the learning objective (presentation, length, effort or behaviour).", "Give it a small weight, or move it to a checklist, unless it IS the objective.");

      var sets = c.cells.map(contentSet);
      c.cells.forEach(function (cell, li) {
        var where = name + " → " + r.levels[li];
        if (!cell.trim()) { add("fix", where, "Empty cell.", "Write what work at this level looks like."); return; }
        var w = words(cell);
        var judged = w.filter(function (x, i) { return JUDGMENT.indexOf(x) >= 0 && w.indexOf(x) === i; });
        if (judged.length && !ANCHOR.test(cell)) add("fix", where, "Judgment word" + (judged.length > 1 ? "s" : "") + " with nothing a marker can see: \"" + judged.join("\", \"") + "\".", "Say what makes it " + judged[0] + ": what's on the page, e.g. \"explains how each quotation supports the claim\".");
        var amounts = w.filter(function (x, i) { return AMOUNT_ONLY.indexOf(x) >= 0 && w.indexOf(x) === i && !(x === "most" && w[i - 1] === "the"); });
        var flagged = judged.length && !ANCHOR.test(cell);
        if (amounts.length && !ANCHOR.test(cell) && !flagged) { flagged = true; add("review", where, "Amount word" + (amounts.length > 1 ? "s" : "") + " without a count or example: \"" + amounts.join("\", \"") + "\". Two markers will read \"" + amounts[0] + "\" differently.", "Use a count where the count matters (\"at least two\") or describe what changes."); }
        if (w.length < 4 && !flagged) add("review", where, "Very short (" + w.length + " word" + (w.length === 1 ? "" : "s") + "). A label isn't a descriptor.", "Describe what the work does at this level.");
        if ((low === null ? li === 0 || li === L - 1 : li === low) && NEGATIVE_START.test(cell)) add("note", where, "The lowest level only says what's missing.", "Say what the work does show, then what's not there yet: \"Gives an opinion but doesn't yet support it with evidence\".");
      });
      for (var li = 0; li + 1 < c.cells.length; li++) {
        if (!c.cells[li].trim() || !c.cells[li + 1].trim()) continue;
        var o = overlap(sets[li], sets[li + 1]);
        if (o >= 0.7) add("fix", name + " → " + r.levels[li] + " / " + r.levels[li + 1], "These two levels say the same thing apart from how much or how well (" + Math.round(o * 100) + "% the same words once amount and quality words are taken out).", "Change what the student does between levels, e.g. Developing \"includes evidence\" → Proficient \"explains how the evidence supports the claim\".");
      }
    });
    var order = { fix: 0, review: 1, note: 2 };
    issues.sort(function (a, b) { return order[a.level] - order[b.level]; });
    return { ok: true, mode: r.mode, levels: r.levels, criteria: r.criteria.map(function (c) { return c.name; }), issues: issues, lowest: low };
  }

  function fixPrompt(text, res) {
    var lines = ["Rewrite this marking rubric so two teachers would give the same level to the same piece of work.",
      "Rules: keep my criteria and level labels unless they are the problem; every descriptor describes what is on the page (observable);",
      "levels differ by what the student does, not only by adverbs like \"some/most/all\"; no bare judgment words (good, excellent, effective);",
      "lowest level says what the work does show before what's missing; 3–6 criteria; write the target level first.",
      "Then give a student-friendly \"I can...\" version of the target level.", ""];
    if (res && res.issues && res.issues.length) {
      lines.push("A checker flagged these problems:");
      res.issues.filter(function (i) { return i.level !== "note"; }).slice(0, 12).forEach(function (i) { lines.push("- " + i.where + ": " + i.msg); });
      lines.push("");
    }
    lines.push("Task and age group: [DESCRIBE THE TASK, e.g. Year 8 / Grade 7 persuasive essay]");
    lines.push("Learning objective or standard: [PASTE IT]", "", "My rubric:", text.trim());
    return lines.join("\n");
  }

  if (typeof module !== "undefined") { module.exports = { check: check, parse: parse, fixPrompt: fixPrompt }; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  var SAMPLE = "Criteria\tExcellent (4)\tGood (3)\tFair (2)\tPoor (1)\n" +
    "Ideas and argument\tExcellent, insightful argument\tGood argument\tSome argument\tPoor argument\n" +
    "Use of evidence\tUses lots of relevant evidence\tUses some relevant evidence\tUses little relevant evidence\tNo evidence\n" +
    "Organization and grammar\tVery well organized with no errors\tWell organized with few errors\tSomewhat organized with some errors\tNot organized, many errors\n" +
    "Neatness\tVery neat\tNeat\tSomewhat messy\tMessy";

  document.addEventListener("DOMContentLoaded", function () {
    var ta = document.getElementById("rb-input"), out = document.getElementById("rb-output");
    if (!ta) return;
    function run() {
      var text = ta.value;
      if (!text.trim()) { out.innerHTML = "<p class=\"small\">Paste a rubric above and press Check.</p>"; return; }
      var res = check(text);
      if (!res.ok) { out.innerHTML = "<p><strong>" + esc(res.error) + "</strong></p>"; return; }
      var n = { fix: 0, review: 0, note: 0 };
      res.issues.forEach(function (i) { n[i.level]++; });
      var label = { fix: "Fix", review: "Review", note: "Note" };
      var list = res.issues.map(function (i) {
        return "<li><span class=\"rb-tag rb-" + i.level + "\">" + label[i.level] + "</span> <strong>" + esc(i.where) + ".</strong> " + esc(i.msg) + (i.fix ? " <em>Try:</em> " + esc(i.fix) : "") + "</li>";
      }).join("");
      var summary = "Read " + res.criteria.length + " criteria × " + res.levels.length + " levels (" + res.levels.map(esc).join(", ") + "). ";
      out.innerHTML = "<p>" + summary + "<strong>" + n.fix + " to fix, " + n.review + " to review, " + n.note + " notes.</strong>" +
        (n.fix + n.review === 0 ? " Nothing flagged. A word check can't tell whether the criteria match your objective, so still do the calibration test above." : "") + "</p>" +
        (list ? "<ol class=\"rb-list\">" + list + "</ol>" : "") +
        "<p><strong>Prompt to fix it</strong> (paste into ChatGPT, Gemini or Claude, then fill in the task and objective):</p>" +
        "<textarea id=\"rb-prompt\" readonly>" + esc(fixPrompt(text, res)) + "</textarea>" +
        "<button type=\"button\" id=\"rb-copy\">Copy prompt</button>";
      document.getElementById("rb-copy").addEventListener("click", function () {
        var p = document.getElementById("rb-prompt");
        p.select();
        if (navigator.clipboard) navigator.clipboard.writeText(p.value); else document.execCommand("copy");
        this.textContent = "Copied";
      });
    }
    document.getElementById("rb-run").addEventListener("click", run);
    document.getElementById("rb-sample").addEventListener("click", function () { ta.value = SAMPLE; run(); });
  });
})();
