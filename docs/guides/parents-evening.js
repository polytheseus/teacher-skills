// Parents' evening notes builder: one line per student (initials, strength,
// next step, home help, optional note), and it turns them into a timed slot
// list, a 5-part script per student and a follow-up message, flagging vague
// targets, full names and sensitive details. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  var HEADER = /^(student|students|pupil|pupils|initials|name|child)$/i;
  // Targets a child can't act on. Each has a better pattern to suggest.
  var VAGUE = [
    [/\btry(ing)? harder\b/i, "\"try harder\": say what to do, e.g. \"plan each answer in 3 bullet points before writing\""],
    [/\bwork(ing)? harder\b/i, "\"work harder\": name the task and the habit, e.g. \"finish the last two questions of each homework\""],
    [/\bmore effort\b/i, "\"more effort\": name what the effort looks like, e.g. \"redraft one paragraph after feedback\""],
    [/\b(focus|concentrate)( more| better)?\b/i, "\"focus / concentrate\": describe the behaviour, e.g. \"start the starter task within 2 minutes\""],
    [/\bpay(ing)? (more )?attention\b/i, "\"pay attention\": describe the behaviour, e.g. \"note down the 3 key words from each explanation\""],
    [/\b(be )?more confident\b/i, "\"more confident\": give a small step, e.g. \"answer one question in each lesson\""],
    [/\b(participate|contribute|join in|speak up)( more)?\b/i, "\"participate more\": give a countable step, e.g. \"share one idea in each group task\""],
    [/\brevise( more)?\b(?! (using|with|by))/i, "\"revise more\": say how, e.g. \"15 minutes of self-quizzing on the knowledge organiser, 3 times a week\""],
    [/\b(keep (it )?up|keep up the good work|carry on)\b/i, "\"keep it up\": give a stretch step, e.g. \"try the challenge question first\""],
    [/\bpush (him|her|them)sel(f|ves)\b/i, "\"push themselves\": name the stretch, e.g. \"attempt the 6-mark question every time\""],
    [/\blisten( more| better)?\b/i, "\"listen more\": describe it, e.g. \"repeat the instructions back before starting\""],
    [/\b(improve|get better at)\b(?!.{0,40}\b(by|using|with)\b)/i, "\"improve ...\": say what better looks like and how, e.g. \"use a capital letter and full stop in every sentence\""],
    [/\bbe (more )?organi[sz]ed\b/i, "\"be organised\": name the habit, e.g. \"pack the bag from the timetable the night before\""],
    [/\b(behave|behaviour|behavior)( better)?\b/i, "\"behave better\": name the behaviour and the expectation, e.g. \"stay in seat during independent work\""]
  ];
  // Praise with nothing a parent can picture.
  var GENERIC = ["lovely", "nice", "good", "great", "polite", "kind", "pleasant", "hard-working", "hardworking", "helpful",
    "a pleasure", "pleasure to teach", "delight", "well-behaved", "well behaved", "sweet", "friendly", "fine", "ok", "okay",
    "doing well", "works hard", "tries hard", "excellent", "brilliant", "amazing", "fantastic", "super", "star"];
  // Details that belong in a private conversation or with the SENCO/DSL, not in an AI chat or a printed sheet left on a desk.
  var SENSITIVE = /\b(autis\w*|asd|adhd|dyslexi\w*|dyspraxi\w*|dyscalculi\w*|ehcp|iep|504( plan)?|senco|camhs|diagnos\w*|medication|medicine|anxiety|depress\w*|self[- ]harm\w*|eating disorder|safeguarding|dsl|social services|social worker|child protection|cp plan|looked[- ]after|foster\w*|custody|divorc\w*|separat(ed|ion)|free school meals|fsm|pupil premium|immigration|asylum|refugee|bereave\w*|died|abuse\w*|neglect\w*|police|exclu(ded|sion)|suspen(ded|sion))\b/i;
  var WPM = 130; // comfortable speaking pace, words per minute

  function cells(line) {
    var parts = line.indexOf("\t") >= 0 ? line.split("\t") : line.split("|");
    if (line.indexOf("\t") < 0 && /^\s*\|/.test(line)) parts = parts.slice(1, /\|\s*$/.test(line) ? -1 : undefined);
    return parts.map(function (c) { return c.trim(); });
  }

  function parse(text) {
    var rows = [];
    String(text || "").split(/\r?\n/).forEach(function (line, i) {
      if (!line.trim()) return;
      if (/^\s*\|?\s*:?-{3,}/.test(line)) return; // Markdown separator row
      var c = cells(line);
      if (!rows.length && HEADER.test(c[0] || "")) return;
      rows.push({ line: i + 1, who: c[0] || "", strength: c[1] || "", target: c[2] || "", home: c[3] || "", note: c.slice(4).join(" ").trim() });
    });
    return rows;
  }

  function words(s) { return (String(s).match(/[A-Za-z0-9'’-]+/g) || []).length; }

  function looksLikeFullName(who) {
    var w = String(who).trim().split(/\s+/);
    return w.length >= 2 && w.every(function (x) { return /^[A-Z][a-z'’-]{1,}$/.test(x); });
  }

  function isGeneric(s) {
    var t = String(s).toLowerCase().replace(/[.!,]/g, " ").replace(/\s+/g, " ").trim();
    if (!t) return false;
    if (/\d/.test(t) || /\b(when|because|e\.?g|for example|in (her|his|their)|last week|this term|this half[- ]term)\b/.test(t)) return false;
    var hits = GENERIC.filter(function (g) { return (" " + t + " ").indexOf(" " + g + " ") >= 0; }).length;
    return hits > 0 && words(t) <= 7;
  }

  function checkRow(r, minutes) {
    var issues = [];
    function add(level, msg) { issues.push({ level: level, msg: msg }); }
    if (!r.who) add("fix", "No initials in the first column.");
    else if (looksLikeFullName(r.who)) add("privacy", "\"" + r.who + "\" looks like a full name. Use initials if you'll paste this into an AI tool or print it.");
    if (!r.strength) add("fix", "No strength. Open with one specific thing this student does well.");
    else if (isGeneric(r.strength)) add("review", "The strength is general praise. Add one example a parent can picture (a piece of work, a lesson, a number).");
    if (!r.target) add("fix", "No next step. Parents leave asking \"so what should they work on?\"");
    else VAGUE.forEach(function (v) { if (v[0].test(r.target)) add("review", "Vague target " + v[1] + "."); });
    if (r.target && /[;]|\band also\b/i.test(r.target)) add("review", "More than one target. Pick the one that would make the biggest difference; parents remember one.");
    if (!r.home) add("review", "No home step. Give parents one thing they can do (a question to ask, a 10-minute routine).");
    var all = [r.who, r.strength, r.target, r.home, r.note].join(" ");
    var m = all.match(SENSITIVE) || all.match(/\bSEND?\b/);
    if (m) add("privacy", "Mentions \"" + m[0] + "\". Keep this off anything you paste into an AI tool or leave on a desk; raise it in person, and check with your SENCO or safeguarding lead (DSL) first if it's theirs to discuss.");
    var talk = words(r.strength) + words(r.target) + words(r.home) + 45; // + opening, check-in and close
    var secs = Math.round(talk / WPM * 60);
    if (minutes && secs > minutes * 60 * 0.5) add("review", "Your part takes about " + Math.round(secs / 6) / 10 + " min of a " + minutes + "-min slot. Trim it so parents have time to talk.");
    return { issues: issues, talkSeconds: secs };
  }

  function sentence(s) {
    s = String(s).trim();
    if (!s) return "";
    s = s.charAt(0).toLowerCase() + s.slice(1);
    return /[.!?]$/.test(s) ? s.slice(0, -1) : s;
  }

  function script(r, opts) {
    opts = opts || {};
    var n = r.who || "[Student]";
    var lines = [];
    lines.push("1. Welcome (20 sec): \"Thanks for coming. I teach " + n + " " + (opts.subject ? opts.subject + " " : "") + "and I've really enjoyed having them in the class.\"");
    lines.push("2. Strength (40 sec): \"One thing " + n + " does really well is " + (sentence(r.strength) || "[specific strength, with an example]") + ".\" Show the piece of work if you have it.");
    lines.push("3. Where they are (1 min): \"At the moment " + n + " is [working at / grade / reading level], based on [assessment or work].\"");
    lines.push("4. Next step (1 min): \"The thing that would make the biggest difference is to " + (sentence(r.target) || "[one specific next step]") + ".\"");
    lines.push("5. Home (30 sec): \"At home, you could " + (sentence(r.home) || "[one small thing parents can do]") + ".\"");
    lines.push("Then, their turn (rest of the slot): \"How does " + n + " feel about the subject at home? Is there anything you'd like to ask?\"");
    if (r.note) lines.push("Note for me: " + r.note);
    return lines.join("\n");
  }

  function followUp(r, opts) {
    opts = opts || {};
    var n = r.who || "[Student]";
    var t = "Dear [Parent name],\n\nThank you for coming to " + (opts.us ? "the conference" : "parents' evening") + " to talk about " + n + ". A quick summary of what we agreed:\n\n" +
      "- Going well: " + (sentence(r.strength) || "[strength]") + ".\n" +
      "- Next step: " + (sentence(r.target) || "[target]") + ".\n" +
      "- At home: " + (sentence(r.home) || "[home step]") + ".\n\n" +
      "I'll check in on the next step by [date]. Please get in touch through [school channel] if you have any questions before then.\n\nBest wishes,\n[Your name]";
    return t;
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // start "16:00", minutes per slot, count, optional break after every N slots of B minutes.
  function schedule(start, minutes, count, breakEvery, breakMins) {
    var m = /^(\d{1,2})[:.](\d{2})$/.exec(String(start || "").trim());
    if (!m || !(minutes > 0) || !(count > 0)) return [];
    var t = parseInt(m[1], 10) * 60 + parseInt(m[2], 10), out = [];
    for (var i = 0; i < count; i++) {
      out.push(pad(Math.floor(t / 60) % 24) + ":" + pad(t % 60));
      t += minutes;
      if (breakEvery > 0 && breakMins > 0 && (i + 1) % breakEvery === 0 && i + 1 < count) t += breakMins;
    }
    return out;
  }

  function build(text, opts) {
    opts = opts || {};
    var rows = parse(text);
    if (!rows.length) return { ok: false, msg: "Add at least one line: initials | strength | next step | home step." };
    var times = schedule(opts.start, opts.minutes, rows.length, opts.breakEvery, opts.breakMins);
    return {
      ok: true,
      students: rows.map(function (r, i) {
        var c = checkRow(r, opts.minutes);
        return { row: r, time: times[i] || "", issues: c.issues, talkSeconds: c.talkSeconds, script: script(r, opts), followUp: followUp(r, opts) };
      })
    };
  }

  var api = { parse: parse, checkRow: checkRow, script: script, followUp: followUp, schedule: schedule, build: build, looksLikeFullName: looksLikeFullName, isGeneric: isGeneric };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  var SAMPLE = "Initials | Strength | Next step | Home step | Note\n" +
    "AB | explains her method out loud in group work, e.g. the fractions task last week | show every step of working on 2-mark questions | ask her to teach you one question from her homework each week |\n" +
    "CD | lovely and polite | try harder | |\n" +
    "Ella Morris | her persuasive letter used three pieces of evidence | improve her writing | read together for 10 minutes, 4 nights a week | has ADHD, check with SENCO\n" +
    "FG | 9/10 on the last two vocab quizzes | answer one question in each lesson | ask what question he answered today |";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

  document.addEventListener("DOMContentLoaded", function () {
    var ta = document.getElementById("pe-input"), out = document.getElementById("pe-output");
    if (!ta || !out) return;
    function val(id) { var el = document.getElementById(id); return el ? el.value : ""; }
    function run() {
      var opts = { start: val("pe-start"), minutes: parseInt(val("pe-mins"), 10) || 0, breakEvery: parseInt(val("pe-every"), 10) || 0,
        breakMins: parseInt(val("pe-break"), 10) || 0, subject: val("pe-subject").trim(), us: val("pe-style") === "us" };
      var res = build(ta.value, opts);
      if (!res.ok) { out.innerHTML = "<p class=\"pe-tag pe-fix\">" + esc(res.msg) + "</p>"; return; }
      var flags = 0, all = [];
      var html = res.students.map(function (s, i) {
        flags += s.issues.length;
        all.push((s.time ? s.time + "  " : "") + s.row.who + "\n" + s.script + "\n\nFollow-up message:\n" + s.followUp);
        var iss = s.issues.map(function (x) { return "<li><span class=\"pe-tag pe-" + x.level + "\">" + x.level + "</span> " + esc(x.msg) + "</li>"; }).join("");
        return "<div class=\"pe-card\"><h3>" + (s.time ? esc(s.time) + " · " : "") + esc(s.row.who || "(no initials)") + "</h3>" +
          (iss ? "<ul class=\"pe-issues\">" + iss + "</ul>" : "<p class=\"pe-tag pe-note\">Looks good</p>") +
          "<pre>" + esc(s.script) + "</pre>" +
          "<details><summary>Follow-up message</summary><pre>" + esc(s.followUp) + "</pre></details></div>";
      }).join("");
      out.innerHTML = "<p><strong>" + res.students.length + " student" + (res.students.length === 1 ? "" : "s") + ", " + flags + " thing" + (flags === 1 ? "" : "s") + " to check.</strong> " +
        "<button type=\"button\" id=\"pe-print\">Print notes</button> <button type=\"button\" class=\"ghost\" id=\"pe-copy\">Copy all as text</button></p>" + html;
      document.getElementById("pe-print").addEventListener("click", function () { window.print(); });
      document.getElementById("pe-copy").addEventListener("click", function () {
        var txt = all.join("\n\n----------\n\n");
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        this.textContent = "Copied";
      });
    }
    document.getElementById("pe-run").addEventListener("click", run);
    document.getElementById("pe-sample").addEventListener("click", function () { ta.value = SAMPLE; run(); });
  });
})();
