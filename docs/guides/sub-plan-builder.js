// Sub plan / cover work builder: the class details a substitute needs plus one
// line per lesson (time, class, task, materials, what to collect), turned into
// a printable plan that someone who has never met the class can run cold. It
// flags tasks that need the teacher's logins, tech with no paper fallback, new
// content, vague tasks, nothing to collect, missing contacts and routines,
// full names and sensitive details. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  var HEADER = /^(time|times|period|when|block)$/i;
  // The substitute can't use these: the teacher's own accounts.
  var LOGIN = /\b(my|teacher'?s?) (log ?in|login|account|password|laptop|computer|pc|drive|email|google drive|onedrive)\b|\bpassword\b|\blog ?in(to)? (as|with) me\b/i;
  // Tech that fails on cover days (no login, broken projector, wifi down).
  var TECH = /\b(google classroom|classroom|canvas|seesaw|schoology|teams|class ?dojo|slides|slideshow|powerpoint|ppt|video|youtube|projector|smart ?board|promethean|board ?works|interactive whiteboard|ipads?|chromebooks?|laptops|computers|online|kahoot|quizizz|blooket|ixl|i-ready|iready|sparx|hegarty|seneca|website|link)\b/i;
  var FALLBACK = /\b(fallback|back-?up|if (the )?(tech|projector|wifi|internet|video|board|link|computers?|chromebooks?|ipads?) (doesn'?t|does not|won'?t|fails?|is down|isn'?t working)|paper cop(y|ies)|printed|plan b|instead)\b/i;
  var NEWCONTENT = /\b(introduce|introducing|new topic|new unit|new concept|teach (them|the class|the new|how)|explain how to|first lesson on|start the new)\b/i;
  var VAGUE = /^(continue( with)?( their| the)? work|carry on|finish (off )?(their |the )?work|catch[- ]up|free time|work from (the )?book|textbook work|silent reading|reading|worksheet|work|revision|review)\.?$/i;
  var VAGUE_IN = /\b(continue with (their|the) work|carry on (with|from) (last lesson|where they left off)|finish off (their|the) work|whatever (they|you) (want|like)|see (my )?desk|in my folder somewhere)\b/i;
  var PAGES = /\b(p{1,2}\.? ?\d+|pages? \d+|q(uestions?)? ?\d+|questions? \d+|chapter \d+|ex(ercise)? ?\d+|section \d+|tasks? \d+|\d+ (questions|problems|minutes|words|sentences))\b/i;
  // Details that belong in the school's secure system, not on a sheet left on the desk.
  var SENSITIVE = /\b(autis\w*|asd|adhd|dyslexi\w*|dyspraxi\w*|dyscalculi\w*|ehcp|iep|504( plan)?|camhs|diagnos\w*|anxiety|depress\w*|self[- ]harm\w*|eating disorder|safeguarding|social services|social worker|child protection|cp plan|cps|looked[- ]after|foster\w*|custody|divorc\w*|separat(ed|ion)|free school meals|fsm|free lunch|pupil premium|immigration|asylum|refugee|bereave\w*|abuse\w*|neglect\w*|police|restraining order|parole)\b/i;
  // Operational medical needs a substitute may need, if school policy allows.
  var MEDICAL = /\b(allerg\w*|anaphyla\w*|epi-?pens?|auto-?injector|inhaler|asthma\w*|diabet\w*|insulin|blood sugar|seizures?|epilep\w*|medical card|medication|medicine|nurse)\b/i;

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
      rows.push({ line: i + 1, time: c[0] || "", what: c[1] || "", task: c[2] || "", materials: c[3] || "", collect: c.slice(4).join(" ").trim() });
    });
    return rows;
  }

  // "8:30", "8.30", "08:30am", "1:15 pm", "13:15" -> minutes after midnight (or null).
  function toMinutes(s) {
    var m = String(s).trim().toLowerCase().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?$/);
    if (!m) return null;
    var h = parseInt(m[1], 10), min = m[2] ? parseInt(m[2], 10) : 0;
    if (min > 59 || h > 23) return null;
    if (!m[2] && !m[3]) return null; // a bare "3" is a period number, not a time
    if (m[3] && m[3][0] === "p" && h < 12) h += 12;
    if (m[3] && m[3][0] === "a" && h === 12) h = 0;
    return h * 60 + min;
  }

  // "8:30-9:20", "8:30 to 9:20", "Period 2 (9:20-10:10)" -> minutes, or null.
  function duration(time) {
    var m = String(time).match(/(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm)?)/i);
    if (!m) return null;
    var a = toMinutes(m[1]), b = toMinutes(m[2]);
    if (a === null || b === null) return null;
    if (b < a && b + 720 > a && b < 720) b += 720; // "11:30-1:00" without am/pm
    return b > a ? b - a : null;
  }

  function words(s) { return (String(s).match(/[A-Za-z0-9'’-]+/g) || []).length; }

  function fullNames(s) {
    // Two capitalised words in a row that aren't obvious non-names.
    var skip = /^(Room|Period|Year|Grade|Mrs?|Ms|Miss|Mr|Dr|The|Google|Smart|Main|Front|Office|Reading|Maths?|Science|English|History|Art|Music|Spanish|French|PE|Monday|Tuesday|Wednesday|Thursday|Friday|Morning|Lunch|Library|Block|Unit|Chapter|Page|Book|Ext)$/;
    var out = [], re = /\b([A-Z][a-z'’-]{1,})\s+([A-Z][a-z'’-]{1,})\b/g, m;
    while ((m = re.exec(String(s)))) if (!skip.test(m[1]) && !skip.test(m[2])) out.push(m[0]);
    return out;
  }

  function privacy(fields, add) {
    var text = fields.join(" "), m = text.match(SENSITIVE);
    if (m) add("privacy", "Mentions \"" + m[0] + "\". Keep diagnoses, plans like IEPs, EHCPs or 504s, and family or safeguarding details in your school's secure system, not on a sheet left on the desk or in an AI chat. Write only what to do, e.g. \"J.T. may leave for a movement break: allowed\".");
    var n = [].concat.apply([], fields.map(fullNames));
    if (n.length) add("privacy", "\"" + n[0] + "\" looks like a full name. Initials are enough for a sub plan, and safer if you paste it into an AI tool.");
  }

  function checkRow(r, earlyFinishers) {
    var issues = [];
    function add(level, msg) { issues.push({ level: level, msg: msg }); }
    var all = [r.what, r.task, r.materials, r.collect].join(" ");
    if (!r.time) add("fix", "No time. A substitute needs to know when each block starts and ends.");
    if (!r.task) add("fix", "No task. Say exactly what students do.");
    else {
      if (VAGUE.test(r.task.trim()) || VAGUE_IN.test(r.task)) add("review", "The task is vague. Name the pages, questions or activity and how long it takes, e.g. \"Read pp. 42-45, answer Q1-6 in full sentences\".");
      else if (words(r.task) < 5 && !PAGES.test(all)) add("review", "Short task with no pages, questions or amount. Could someone who doesn't know the class run it from this line alone?");
      if (NEWCONTENT.test(r.task)) add("review", "This looks like new content. Substitutes and cover supervisors usually aren't subject specialists; practice or review of what the class already knows works better.");
    }
    if (LOGIN.test(all)) add("fix", "Needs your own login, account or laptop. The substitute won't have it: give a paper version, or a link students open with their own accounts.");
    else if (TECH.test(all) && !FALLBACK.test(all)) add("review", "Relies on tech (\"" + all.match(TECH)[0] + "\") with no fallback. Add what to do if it doesn't work, e.g. \"if the video won't play, read the printed transcript\".");
    if (r.task && !r.materials && !/\b(no materials|nothing needed|none)\b/i.test(all)) add("review", "No materials location. Say where things are, e.g. \"worksheets in the blue tray on my desk\".");
    if (r.task && !r.collect && !/\b(collect|hand in|turn in|stack|tray|basket|bin|in (their|the) books?|notebooks?|exercise books?)\b/i.test(r.task)) add("review", "Nothing to collect. Name what students hand in or where work goes, so you can see what was done.");
    var d = duration(r.time);
    if (d && d >= 40 && !earlyFinishers && !/\b(extension|early finish\w*|if (they|students) finish|when (they|students) finish|fast finish\w*)\b/i.test(all)) add("review", d + "-minute block with no early-finisher task. Early finishers cause most problems on cover days.");
    privacy([r.what, r.task, r.materials, r.collect], add);
    return issues;
  }

  function checkInfo(info) {
    var issues = [];
    function add(level, msg) { issues.push({ level: level, msg: msg }); }
    if (!info.help) add("fix", "No help contact. Say who to call or send for if something goes wrong (office extension, on-call, the teacher next door).");
    if (!info.arrival) add("review", "No arrival routine. How do students come in, and where do they sit?");
    if (!info.dismissal) add("review", "No end-of-day or end-of-lesson routine. Dismissal is when things go wrong.");
    if (!info.seating) add("review", "No seating plan location. A seating plan is the substitute's best behaviour tool.");
    if (!info.early) add("review", "No early-finisher task. Add one that works for any lesson (e.g. silent reading book, a puzzle sheet in the tray).");
    if (!info.attendance) add("review", "No attendance instructions. Say how to take the register or attendance without your login (paper list, office).");
    privacy([info.helpers, info.arrival, info.dismissal, info.bathroom, info.tech, info.notes, info.class].map(function (x) { return x || ""; }), add);
    if (MEDICAL.test(info.notes || "") || MEDICAL.test(info.helpers || "")) add("note", "Medical needs: include what the substitute must do (e.g. where an inhaler is kept, who to call), with initials only, if your school's policy allows. Many schools keep this on a separate sheet in the sub folder.");
    return issues;
  }

  function line(label, v) { return v ? label + ": " + v : ""; }

  function build(info, scheduleText) {
    info = info || {};
    var rows = parse(scheduleText);
    if (!rows.length) return { ok: false, msg: "Add at least one lesson line: time | class | task | materials | collect." };
    var uk = info.style === "uk";
    var early = (info.early || "").trim();
    var lessons = rows.map(function (r) { return { row: r, issues: checkRow(r, early) }; });
    var general = checkInfo(info);
    var title = (uk ? "COVER WORK" : "SUB PLAN") + (info.date ? " · " + info.date : " · Emergency plan: can be used any day");
    var who = [info.teacher, info.class, info.room ? "Room " + info.room.replace(/^room\s*/i, "") : ""].filter(Boolean).join(" · ");
    var out = [title];
    if (who) out.push(who);
    out.push("");
    out.push(uk ? "Thank you for covering my lessons. Everything you need is below; the class has met all of this work before." :
      "Thank you for subbing for me! Everything you need is below; the class has seen all of this work before.");
    out.push("");
    [line(uk ? "IF YOU NEED HELP" : "IF YOU NEED HELP", info.help), line(uk ? "REGISTER" : "ATTENDANCE", info.attendance),
      line("SEATING PLAN", info.seating), line(uk ? "ON ARRIVAL" : "ARRIVAL", info.arrival), line(uk ? "TOILETS" : "BATHROOM", info.bathroom),
      line("TECH", info.tech), line(uk ? "HELPFUL STUDENTS" : "HELPFUL STUDENTS", info.helpers), line("EARLY FINISHERS", early),
      line("GOOD TO KNOW", info.notes)].forEach(function (l) { if (l) out.push(l); });
    out.push("");
    out.push(uk ? "LESSONS" : "SCHEDULE");
    lessons.forEach(function (l) {
      var r = l.row;
      out.push("");
      out.push([r.time, r.what].filter(Boolean).join("  ") || "(no time)");
      if (r.task) out.push("   Do: " + r.task);
      if (r.materials) out.push("   Materials: " + r.materials);
      if (r.collect) out.push("   Collect: " + r.collect);
    });
    out.push("");
    if (info.dismissal) out.push((uk ? "END OF LESSON / DAY: " : "END OF DAY: ") + info.dismissal);
    out.push(uk ? "PLEASE LEAVE ME A NOTE: who was absent, who worked well, any problems, and anything not finished." :
      "PLEASE LEAVE ME A NOTE: who was absent, who was helpful, any problems, and anything you didn't get to.");
    var count = general.length + lessons.reduce(function (n, l) { return n + l.issues.length; }, 0);
    return { ok: true, general: general, lessons: lessons, text: out.join("\n"), flags: count };
  }

  var api = { parse: parse, toMinutes: toMinutes, duration: duration, fullNames: fullNames, checkRow: checkRow, checkInfo: checkInfo, build: build };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  var SAMPLE_INFO = { teacher: "Ms Rivera", class: "Grade 4", room: "12", style: "us",
    help: "Office ext. 200, or Mr Okafor next door in Room 13", attendance: "Paper class list on the clipboard by the door; send it to the office by 8:45",
    seating: "Red folder on my desk, first page", arrival: "Students unpack, put folders in the basket, and start the morning work on their desks",
    bathroom: "One at a time with the hall pass by the door; not in the first or last 10 minutes", tech: "",
    helpers: "A.K. and R.M. know where everything is", early: "Silent reading book, or the puzzle sheets in the green tray",
    dismissal: "Car riders at 3:05 to the gym, walkers at 3:10 with the duty teacher", notes: "" };
  var SAMPLE = "Time | Class | Task | Materials | Collect\n" +
    "8:30-8:50 | Morning work | Spiral review sheet, then share answers with a partner | Copies on desks before school | basket\n" +
    "8:50-9:50 | Reading | Read \"The Stray\" (pp. 42-47) together, then answer Q1-6 in full sentences | Readers on the shelf, question sheets in the blue tray |\n" +
    "9:50-10:50 | Math | Continue with their work | | \n" +
    "11:00-11:45 | Science | Watch the YouTube video on food chains, then draw a pond food chain with 5 living things | Video link in my Google Drive |\n" +
    "1:00-1:40 | Writing | Introduce persuasive writing | |";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }

  document.addEventListener("DOMContentLoaded", function () {
    var ta = document.getElementById("sp-input"), out = document.getElementById("sp-output");
    if (!ta || !out) return;
    var FIELDS = ["teacher", "class", "room", "date", "style", "help", "attendance", "seating", "arrival", "bathroom", "tech", "helpers", "early", "dismissal", "notes"];
    function el(k) { return document.getElementById("sp-" + k); }
    function info() { var o = {}; FIELDS.forEach(function (k) { var e = el(k); o[k] = e ? e.value.trim() : ""; }); return o; }
    function tags(list) {
      return list.map(function (x) { return "<li><span class=\"sp-tag sp-" + x.level + "\">" + x.level + "</span> " + esc(x.msg) + "</li>"; }).join("");
    }
    function run() {
      var res = build(info(), ta.value);
      if (!res.ok) { out.innerHTML = "<p class=\"sp-tag sp-fix\">" + esc(res.msg) + "</p>"; return; }
      var checks = "";
      if (res.general.length) checks += "<div class=\"sp-card\"><h3>Class details</h3><ul class=\"sp-issues\">" + tags(res.general) + "</ul></div>";
      res.lessons.forEach(function (l) {
        if (l.issues.length) checks += "<div class=\"sp-card\"><h3>" + esc([l.row.time, l.row.what].filter(Boolean).join(" · ") || "Line " + l.row.line) + "</h3><ul class=\"sp-issues\">" + tags(l.issues) + "</ul></div>";
      });
      out.innerHTML = "<p><strong>" + res.lessons.length + " lesson" + (res.lessons.length === 1 ? "" : "s") + ", " + res.flags + " thing" + (res.flags === 1 ? "" : "s") + " to check.</strong> " +
        "<button type=\"button\" id=\"sp-print\">Print plan</button> <button type=\"button\" class=\"ghost\" id=\"sp-copy\">Copy text</button> <button type=\"button\" class=\"ghost\" id=\"sp-dl\">Download .txt</button></p>" +
        (checks || "<p class=\"sp-tag sp-note\">Looks good</p>") +
        "<div class=\"sp-plan\"><pre id=\"sp-text\">" + esc(res.text) + "</pre></div>";
      document.getElementById("sp-print").addEventListener("click", function () { window.print(); });
      document.getElementById("sp-copy").addEventListener("click", function () {
        if (navigator.clipboard) navigator.clipboard.writeText(res.text);
        this.textContent = "Copied";
      });
      document.getElementById("sp-dl").addEventListener("click", function () {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([res.text.replace(/\n/g, "\r\n")], { type: "text/plain;charset=utf-8" }));
        a.download = (info().style === "uk" ? "cover-work" : "sub-plan") + ".txt";
        document.body.appendChild(a); a.click(); a.remove();
      });
    }
    document.getElementById("sp-run").addEventListener("click", run);
    document.getElementById("sp-sample").addEventListener("click", function () {
      FIELDS.forEach(function (k) { var e = el(k); if (e && k in SAMPLE_INFO) e.value = SAMPLE_INFO[k]; });
      ta.value = SAMPLE; run();
    });
  });
})();
