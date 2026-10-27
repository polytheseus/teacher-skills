// Quiz checker for Kahoot (and any multiple-choice quiz): paste questions from
// ChatGPT, Gemini or Claude (or rows from a spreadsheet), and it checks them
// against Kahoot's spreadsheet-import limits (question 95 characters, answers
// 60, 2-4 answers, at least one correct, time 5/10/20/30/60/120), flags the
// usual AI quiz faults (correct answer mostly in one position, longest option
// is the answer, "all of the above", unflagged NOT questions, duplicates), can
// spread the correct answers across positions, and outputs rows to paste into
// Kahoot's template, a CSV, a student copy and an answer key. Runs in the
// browser and in node (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  var LIMIT_Q = 95, LIMIT_A = 60, TIMES = [5, 10, 20, 30, 60, 120];
  var LETTERS = "ABCD";
  var QSTART = /^\s*(?:\*\*)?(?:q(?:uestion)?\s*)?(\d{1,3})\s*[.):\-]\s*(?:\*\*)?\s*(.*)$/i;
  var QLABEL = /^\s*(?:\*\*)?q(?:uestion)?\s*(?:\d{1,3})?\s*[:.)]\s*(?:\*\*)?\s*(.+)$/i;
  var OPTION = /^\s*(\*{1,2})?\s*(?:[-•]\s*)?(?:\(?([a-dA-D])[\).:]|([1-4])\))\s+(.*)$/;
  var BULLET = /^\s*[-•]\s+(.*)$/;
  var ANSWER = /^\s*(?:\*\*)?(?:correct(?: answers?)?|answers?|key)\s*(?:\(s\))?\s*[:=\-]\s*(?:\*\*)?\s*(.+)$/i;
  var TIME = /^\s*(?:\*\*)?(?:time(?: limit)?|timer|seconds)\s*(?:\(s(?:ec(?:onds)?)?\))?\s*[:=\-]\s*(?:\*\*)?\s*(\d+)/i;
  var CORRECT_MARK = /\s*(?:\((?:correct|answer|✓)\)|\[(?:correct|x|✓)\]|✓|✔|\*{1,2}|←\s*correct)\s*$/i;
  var HEADER = /^(question|questions|#|no\.?)$/i;
  var QHEAD = /^\s*(?:\*\*)?q(?:uestion)?\s*\d{1,3}\s*[:.)]?\s*(?:\*\*)?\s*$/i;
  var RULE = /^\s*([-*_])\1{2,}\s*$/;

  function clean(s) { return String(s || "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim(); }

  function letterIndex(tok, n) {
    tok = String(tok).trim().replace(/[\s.)*]+$/, "").replace(/^\(|\*+/g, "");
    if (/^[a-d]$/i.test(tok)) return LETTERS.indexOf(tok.toUpperCase());
    if (/^[1-4]$/.test(tok)) return Number(tok) - 1;
    return -1;
  }

  // "B", "B) Paris", "1,3", "A and C", "Paris" (matched against the options)
  function parseCorrect(text, answers) {
    var t = clean(text).replace(/\(([a-d1-4])\)/gi, "$1"), out = [];
    var lead = t.match(/^(?:option\s+)?([a-d1-4])(?:\s*[).:]|\s*$|\s*(?:,|and|&|\/)\s*)/i);
    if (lead) {
      t.split(/\s*(?:,|and|&|\/|\s)\s*/i).forEach(function (tok) {
        if (/^[a-d1-4][).:]?$/i.test(tok)) { var i = letterIndex(tok, answers.length); if (i >= 0 && out.indexOf(i) < 0) out.push(i); }
      });
      if (out.length && !/^[a-d1-4](\s*(,|and|&|\/)\s*[a-d1-4])*\s*$/i.test(t)) out = out.slice(0, 1); // "B) Paris" → just B
      if (out.length) return out;
    }
    var low = t.toLowerCase().replace(/[.\s]+$/, "");
    answers.forEach(function (a, i) { if (a.text.toLowerCase().replace(/[.\s]+$/, "") === low) out.push(i); });
    return out;
  }

  function cells(line) {
    var parts = line.indexOf("\t") >= 0 ? line.split("\t") : line.split("|");
    if (line.indexOf("\t") < 0 && /^\s*\|/.test(line)) parts = parts.slice(1, /\|\s*$/.test(line) ? -1 : undefined);
    return parts.map(function (c) { return c.trim(); });
  }

  // Spreadsheet rows: [#] | Question | A1 | A2 | A3 | A4 | Time | Correct
  function parseTable(lines) {
    var qs = [];
    lines.forEach(function (line, i) {
      if (!line.trim() || /^\s*\|?\s*:?-{3,}/.test(line)) return;
      var c = cells(line);
      if (/^\d{1,3}$/.test(c[0]) && c.length >= 5) c = c.slice(1);
      if (HEADER.test(c[0] || "") || /^question\b/i.test(c[0] || "")) return;
      var answers = c.slice(1, 5).filter(function (a) { return a !== ""; }).map(function (a) { return { text: clean(a) }; });
      var q = { line: i + 1, text: clean(c[0]), answers: answers, time: c[5] ? Number(c[5]) : null, correct: [] };
      if (c[6]) String(c[6]).split(/[,;\s]+/).forEach(function (tok) {
        var k = letterIndex(tok, answers.length); if (k >= 0 && q.correct.indexOf(k) < 0) q.correct.push(k);
      });
      q.rawCorrect = c[6] || "";
      qs.push(q);
    });
    return qs;
  }

  function parse(text) {
    var lines = String(text || "").replace(/\r/g, "").split("\n");
    var tabbed = lines.filter(function (l) { return l.indexOf("\t") >= 0 || /^\s*\|.*\|.*\|/.test(l); }).length;
    if (tabbed && tabbed >= lines.filter(function (l) { return l.trim(); }).length / 2) return parseTable(lines);
    var qs = [], cur = null;
    function start(t, i, numbered) {
      if (cur && !cur.answers.length && (!cur.text || !cur.numbered)) qs.pop(); // an empty heading or the AI's intro line
      cur = { line: i + 1, text: clean(t), answers: [], time: null, correct: [], rawCorrect: "", numbered: !!numbered }; qs.push(cur); }
    lines.forEach(function (line, i) {
      line = line.replace(/^\s*#{1,6}\s+/, "");
      if (!line.trim() || RULE.test(line)) return;
      var m;
      if (QHEAD.test(line)) { start("", i, true); return; }
      if ((m = line.match(TIME)) && cur) { cur.time = Number(m[1]); return; }
      if ((m = line.match(ANSWER)) && cur && cur.answers.length) { cur.rawCorrect = clean(m[1]); return; }
      if ((m = line.match(OPTION)) && cur && cur.text) {
        var body = m[4], marked = !!m[1];
        if (CORRECT_MARK.test(body)) { marked = true; body = body.replace(CORRECT_MARK, ""); }
        cur.answers.push({ text: clean(body), marked: marked });
        return;
      }
      if ((m = line.match(BULLET)) && cur && cur.text && cur.answers.length < 6 && !QSTART.test(m[1])) {
        var b = m[1], mk = false;
        if (CORRECT_MARK.test(b)) { mk = true; b = b.replace(CORRECT_MARK, ""); }
        cur.answers.push({ text: clean(b), marked: mk });
        return;
      }
      if ((m = line.match(QSTART))) { start(m[2], i, true); return; }
      if ((m = line.match(QLABEL))) { start(m[1], i, true); return; }
      if (cur && !cur.answers.length) { cur.text = clean(cur.text + " " + line); return; }
      start(line, i); // an unnumbered question after a finished one
    });
    qs.forEach(function (q) {
      if (!q.text && q.answers.length === 0) return;
      q.answers.forEach(function (a, i) { if (a.marked && q.correct.indexOf(i) < 0) q.correct.push(i); });
      if (q.rawCorrect) {
        var fromKey = parseCorrect(q.rawCorrect, q.answers);
        if (fromKey.length) {
          if (q.correct.length && fromKey.join() !== q.correct.slice().sort().join()) q.conflict = true;
          q.correct = fromKey;
        }
      }
      q.answers = q.answers.map(function (a) { return { text: a.text }; });
      delete q.numbered;
    });
    var any = qs.some(function (q) { return q.answers.length; });
    // Drop the AI's closing line ("Let me know if you'd like more!"), keep real questions missing options.
    return qs.filter(function (q) { return q.answers.length || (q.text && (!any || /\?/.test(q.text))); });
  }

  function len(s) { return Array.from(String(s)).length; }
  function norm(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }

  function checkQuestion(q, n) {
    var issues = [];
    function add(level, msg) { issues.push({ level: level, msg: msg }); }
    if (!q.text) add("fix", "No question text.");
    else if (len(q.text) > LIMIT_Q) add("fix", "Question is " + len(q.text) + " characters; Kahoot's import limit is " + LIMIT_Q + ". Cut " + (len(q.text) - LIMIT_Q) + ".");
    if (q.answers.length < 2) add("fix", "Needs at least 2 answers (it has " + q.answers.length + ").");
    if (q.answers.length > 4) add("fix", "Kahoot's template takes 4 answers; this has " + q.answers.length + ". Drop the weakest wrong ones.");
    q.answers.forEach(function (a, i) {
      if (!a.text) add("fix", "Answer " + (i + 1) + " is empty.");
      else if (len(a.text) > LIMIT_A) add("fix", "Answer " + (LETTERS[i] || i + 1) + " is " + len(a.text) + " characters; the limit is " + LIMIT_A + ".");
    });
    if (!q.correct.length) add("fix", q.rawCorrect ? "Couldn't match the answer \"" + q.rawCorrect + "\" to an option. Use the letter (B) or mark the option with *." : "No correct answer marked. Add \"Answer: B\" under the options, or put * after the right one.");
    q.correct.forEach(function (c) { if (c >= q.answers.length) add("fix", "The answer points to option " + (LETTERS[c] || c + 1) + ", which doesn't exist."); });
    if (q.conflict) add("fix", "The marked option and the \"Answer:\" line disagree. Check which is right.");
    if (q.correct.length > 1) add("review", "More than one correct answer. Kahoot accepts it, but say \"Choose all that are correct\" in the question.");
    if (q.correct.length && q.correct.length === q.answers.length && q.answers.length > 1) add("fix", "Every option is marked correct.");
    if (q.time !== null && q.time !== undefined && !isNaN(q.time) && TIMES.indexOf(q.time) < 0) add("review", "Time limit " + q.time + " s isn't one Kahoot imports (5, 10, 20, 30, 60, 120). It would become 20 s.");
    var seen = {};
    q.answers.forEach(function (a, i) {
      var k = norm(a.text);
      if (k && seen[k] !== undefined) add("fix", "Answers " + LETTERS[seen[k]] + " and " + LETTERS[i] + " are the same.");
      else seen[k] = i;
    });
    if (q.answers.some(function (a) { return /\b(all|none|both|neither) of (the )?(above|these)\b/i.test(a.text); }))
      add("review", "\"All / none of the above\" doesn't work when Kahoot shuffles or colours answers, and it's a guessing cue. Write a real option.");
    if (/\b(not|except|least|never)\b/.test(q.text) && !/\b(NOT|EXCEPT|LEAST|NEVER)\b/.test(q.text))
      add("review", "Negative question: put the word in capitals (NOT, EXCEPT) so students don't miss it at speed.");
    if (q.correct.length === 1 && q.answers.length >= 3) {
      var lens = q.answers.map(function (a) { return len(a.text); }), c = q.correct[0];
      var others = lens.filter(function (_, i) { return i !== c; }), maxOther = Math.max.apply(null, others);
      if (lens[c] >= 20 && lens[c] > maxOther * 1.5) add("review", "The correct answer is much longer than the others, which gives it away. Trim it or lengthen the wrong ones.");
    }
    var allText = len(q.text) + q.answers.reduce(function (s, a) { return s + len(a.text); }, 0);
    if (q.time && q.time <= 10 && allText > 140) add("review", "A lot to read in " + q.time + " s. Try 20 or 30.");
    if (/\b(which of the following|which of these)\b/i.test(q.text) && len(q.text) > 80) add("note", "\"Which of the following\" costs 25 characters; \"Which…\" usually works.");
    return issues;
  }

  function checkQuiz(qs) {
    var issues = [];
    var single = qs.filter(function (q) { return q.correct.length === 1 && q.answers.length >= 3; });
    if (single.length >= 4) {
      var counts = [0, 0, 0, 0];
      single.forEach(function (q) { if (q.correct[0] < 4) counts[q.correct[0]]++; });
      var top = Math.max.apply(null, counts), at = counts.indexOf(top);
      var opts = single.reduce(function (s, q) { return s + q.answers.length; }, 0) / single.length;
      if (top / single.length > Math.max(0.5, 1.6 / opts)) issues.push({ level: "review", msg: top + " of " + single.length + " answers are " + LETTERS[at] + ". AI tools do this a lot; students spot it. Press Spread the answers." });
      else issues.push({ level: "note", msg: "Answer positions: " + counts.map(function (n, i) { return LETTERS[i] + " " + n; }).join(", ") + "." });
    }
    var seen = {};
    qs.forEach(function (q, i) {
      var k = norm(q.text);
      if (k && seen[k] !== undefined) issues.push({ level: "fix", msg: "Questions " + (seen[k] + 1) + " and " + (i + 1) + " are the same." });
      else if (k) seen[k] = i;
    });
    if (qs.length > 100) issues.push({ level: "review", msg: qs.length + " questions. Split long quizzes: import several sheets into one kahoot, or make two." });
    return issues;
  }

  // Options that read in an order (numbers, True/False, Yes/No) aren't moved.
  function ordered(q) {
    var t = q.answers.map(function (a) { return a.text.toLowerCase(); });
    if (t.join("|") === "true|false" || t.join("|") === "yes|no") return true;
    var nums = t.map(function (s) { return /^[-−]?[\d.,]+\s*%?[a-z°]*$/i.test(s.trim()) ? parseFloat(s.replace(/[,−]/g, function (c) { return c === "−" ? "-" : ""; })) : NaN; });
    if (nums.every(function (x) { return !isNaN(x); })) {
      var up = nums.every(function (x, i) { return !i || x >= nums[i - 1]; }), down = nums.every(function (x, i) { return !i || x <= nums[i - 1]; });
      return up || down;
    }
    return false;
  }

  // Move each single correct answer so positions come out as even as possible.
  function spread(qs, seed) {
    var s = (seed || 7) >>> 0;
    function rnd() { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }
    var counts = [0, 0, 0, 0], moved = 0, kept = 0;
    var out = qs.map(function (q) {
      var c = { line: q.line, text: q.text, time: q.time, rawCorrect: q.rawCorrect, answers: q.answers.map(function (a) { return { text: a.text }; }), correct: q.correct.slice() };
      if (c.correct.length !== 1 || c.answers.length < 2 || c.answers.length > 4 || c.correct[0] >= c.answers.length) return c;
      if (ordered(c)) { kept++; counts[c.correct[0]]++; return c; }
      var n = c.answers.length, best = [];
      for (var i = 0; i < n; i++) { if (!best.length || counts[i] < counts[best[0]]) best = [i]; else if (counts[i] === counts[best[0]]) best.push(i); }
      var target = best[Math.floor(rnd() * best.length)], from = c.correct[0];
      if (target !== from) { var tmp = c.answers[target]; c.answers[target] = c.answers[from]; c.answers[from] = tmp; c.correct = [target]; moved++; }
      counts[target]++;
      return c;
    });
    return { questions: out, moved: moved, kept: kept };
  }

  function timeOf(q, dflt) { var t = q.time; return TIMES.indexOf(t) >= 0 ? t : (TIMES.indexOf(dflt) >= 0 ? dflt : 20); }

  function kahootRows(qs, dflt) {
    return qs.map(function (q) {
      var a = q.answers.map(function (x) { return x.text; }); while (a.length < 4) a.push("");
      return [q.text].concat(a.slice(0, 4), [String(timeOf(q, dflt)), q.correct.map(function (c) { return c + 1; }).join(",")]);
    });
  }

  function tsv(rows) { return rows.map(function (r) { return r.map(function (c) { return String(c).replace(/[\t\n]/g, " "); }).join("\t"); }).join("\n"); }

  function csvCell(c) {
    c = String(c);
    if (/^[=+\-@\t\r]/.test(c) && !/^-?\d+([.,]\d+)?$/.test(c)) c = "'" + c; // spreadsheet formula guard
    return /[",\n]/.test(c) ? "\"" + c.replace(/"/g, "\"\"") + "\"" : c;
  }

  function csv(rows) {
    return [["Question", "Answer 1", "Answer 2", "Answer 3", "Answer 4", "Time limit (sec)", "Correct answer(s)"]].concat(rows)
      .map(function (r) { return r.map(csvCell).join(","); }).join("\n");
  }

  function studentCopy(qs, title) {
    var out = [title || "Quiz", "Name: ______________________", ""];
    qs.forEach(function (q, i) {
      out.push((i + 1) + ". " + q.text);
      q.answers.forEach(function (a, j) { out.push("   " + LETTERS[j] + ") " + a.text); });
      out.push("");
    });
    return out.join("\n").trim();
  }

  function answerKey(qs, title) {
    var out = [(title || "Quiz") + ": answer key", ""];
    qs.forEach(function (q, i) {
      out.push((i + 1) + ". " + (q.correct.length ? q.correct.map(function (c) { return LETTERS[c] + (q.answers[c] ? " (" + q.answers[c].text + ")" : ""); }).join(" and ") : "?"));
    });
    return out.join("\n");
  }

  function build(text, opts) {
    opts = opts || {};
    var qs = parse(text);
    if (!qs.length) return { ok: false, msg: "Paste at least one question with its answers first." };
    var spreadInfo = null;
    if (opts.spread) { spreadInfo = spread(qs, opts.seed); qs = spreadInfo.questions; }
    var items = qs.map(function (q, i) { return { q: q, issues: checkQuestion(q, i) }; });
    var quiz = checkQuiz(qs);
    var rows = kahootRows(qs, opts.time);
    var all = items.reduce(function (a, it) { return a.concat(it.issues); }, quiz.slice());
    var fix = all.filter(function (x) { return x.level === "fix"; }).length;
    var flags = all.filter(function (x) { return x.level !== "note"; }).length;
    return { ok: true, questions: qs, items: items, quiz: quiz, rows: rows, tsv: tsv(rows), csv: csv(rows),
      student: studentCopy(qs, opts.title), key: answerKey(qs, opts.title), fix: fix, flags: flags, spread: spreadInfo };
  }

  var api = { parse: parse, parseCorrect: parseCorrect, checkQuestion: checkQuestion, checkQuiz: checkQuiz, ordered: ordered, spread: spread,
    kahootRows: kahootRows, tsv: tsv, csv: csv, csvCell: csvCell, studentCopy: studentCopy, answerKey: answerKey, build: build, LIMIT_Q: LIMIT_Q, LIMIT_A: LIMIT_A };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  var SAMPLE = "1. Which of the following is the process plants use to make their own food using sunlight?\n" +
    "A) Respiration\nB) Photosynthesis\nC) Digestion\nD) Germination\nAnswer: B\n\n" +
    "2. What gas do plants take in for photosynthesis?\nA) Oxygen\nB) Carbon dioxide\nC) Nitrogen\nD) Hydrogen\nAnswer: B\n\n" +
    "3. Which of these is not needed for photosynthesis?\nA) Light\nB) Water\nC) Soil\nD) Carbon dioxide\nAnswer: C\n\n" +
    "4. Why are leaves usually broad and flat?\nA) To stop water escaping\nB) To give a large surface area to absorb as much light as possible\nC) To look attractive\nD) To store food\nAnswer: B\n\n" +
    "5. What is the word equation for photosynthesis?\nA) Glucose + oxygen → carbon dioxide + water\nB) Carbon dioxide + water → glucose + oxygen\nC) Oxygen + water → glucose\nD) All of the above\nAnswer: B\nTime: 15";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

  document.addEventListener("DOMContentLoaded", function () {
    var ta = document.getElementById("kq-input"), out = document.getElementById("kq-output");
    if (!ta || !out) return;
    var spreadOn = false;
    function val(id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; }
    function tags(list) {
      return list.map(function (x) { return "<li><span class=\"kq-tag kq-" + x.level + "\">" + x.level + "</span> " + esc(x.msg) + "</li>"; }).join("");
    }
    function dl(name, text, type) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob(["﻿" + text.replace(/\n/g, "\r\n")], { type: type + ";charset=utf-8" }));
      a.download = name; document.body.appendChild(a); a.click(); a.remove();
    }
    function copyBtn(id, text) {
      document.getElementById(id).addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(text); this.textContent = "Copied"; });
    }
    function run() {
      var res = build(ta.value, { spread: spreadOn, time: Number(val("kq-time")) || 20, title: val("kq-title") });
      if (!res.ok) { out.innerHTML = "<p class=\"kq-tag kq-fix\">" + esc(res.msg) + "</p>"; return; }
      var html = "<p><strong>" + res.questions.length + " question" + (res.questions.length === 1 ? "" : "s") + ", " + res.flags + " thing" + (res.flags === 1 ? "" : "s") + " to check" + (res.fix ? " (" + res.fix + " to fix before importing)" : "") + ".</strong>";
      if (res.spread) html += " Spread: " + res.spread.moved + " answer" + (res.spread.moved === 1 ? "" : "s") + " moved" + (res.spread.kept ? ", " + res.spread.kept + " left in order (numbers, True/False)" : "") + ".";
      html += "</p>";
      if (res.quiz.length) html += "<div class=\"kq-card\"><h3>Whole quiz</h3><ul class=\"kq-issues\">" + tags(res.quiz) + "</ul></div>";
      res.items.forEach(function (it, i) {
        var q = it.q;
        html += "<div class=\"kq-card\"><h3>" + (i + 1) + ". " + esc(q.text || "(no question)") + " <span class=\"small\">" + Array.from(q.text).length + "/" + LIMIT_Q + "</span></h3><ol type=\"A\" class=\"kq-opts\">" +
          q.answers.map(function (a, j) { return "<li" + (q.correct.indexOf(j) >= 0 ? " class=\"kq-right\"" : "") + ">" + esc(a.text) + " <span class=\"small\">" + Array.from(a.text).length + "/" + LIMIT_A + "</span></li>"; }).join("") +
          "</ol>" + (it.issues.length ? "<ul class=\"kq-issues\">" + tags(it.issues) + "</ul>" : "<p class=\"kq-tag kq-ok\">OK</p>") + "</div>";
      });
      html += "<div class=\"kq-card\"><h3>For Kahoot</h3><p class=\"small\">Copy the rows, open Kahoot's own template, click the first empty Question cell and paste. Columns: question, answers 1-4, time, correct answer number.</p>" +
        "<button type=\"button\" id=\"kq-copy\">Copy rows for Kahoot</button> <button type=\"button\" class=\"ghost\" id=\"kq-csv\">Download CSV</button>" +
        "<pre class=\"kq-pre\">" + esc(res.tsv) + "</pre></div>" +
        "<div class=\"kq-card\"><h3>Paper copy and answer key</h3><button type=\"button\" class=\"ghost\" id=\"kq-copys\">Copy student version</button> <button type=\"button\" class=\"ghost\" id=\"kq-copyk\">Copy answer key</button> <button type=\"button\" class=\"ghost\" id=\"kq-print\">Print both</button>" +
        "<div class=\"kq-print\"><pre class=\"kq-pre\">" + esc(res.student) + "</pre><pre class=\"kq-pre kq-key\">" + esc(res.key) + "</pre></div></div>";
      out.innerHTML = html;
      copyBtn("kq-copy", res.tsv); copyBtn("kq-copys", res.student); copyBtn("kq-copyk", res.key);
      document.getElementById("kq-csv").addEventListener("click", function () { dl("kahoot-quiz.csv", res.csv, "text/csv"); });
      document.getElementById("kq-print").addEventListener("click", function () { window.print(); });
    }
    document.getElementById("kq-run").addEventListener("click", function () { spreadOn = false; run(); });
    document.getElementById("kq-spread").addEventListener("click", function () { spreadOn = true; run(); });
    document.getElementById("kq-sample").addEventListener("click", function () { ta.value = SAMPLE; spreadOn = false; run(); });
  });
})();
