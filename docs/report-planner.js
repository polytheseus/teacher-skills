// Report card writing planner: class size, comments per child, minutes per
// comment, the days you can work and the deadline, turned into a day-by-day
// plan ("Mon 9 Nov: children 1-6, about 45 min") that leaves proofreading days
// before the deadline. It says plainly when the plan doesn't fit and what would
// make it fit. Copy the plan or download it as calendar events (.ics). Runs in
// the browser and in node (module.exports) for tests. Nothing typed is sent or
// stored.
(function () {
  var DAY = 86400000;
  var WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
    if (!m) return null;
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
    var d = new Date(t);
    return d.getUTCMonth() === +m[2] - 1 ? t : null;
  }
  function iso(t) { return new Date(t).toISOString().slice(0, 10); }
  function label(t) { var d = new Date(t); return WD[d.getUTCDay()] + " " + d.getUTCDate() + " " + MON[d.getUTCMonth()]; }
  function mins(n) {
    n = Math.round(n);
    if (n < 60) return n + " min";
    var h = Math.floor(n / 60), m = n % 60;
    return h + " h" + (m ? " " + m + " min" : "");
  }
  function num(v, def) { var n = parseFloat(v); return isFinite(n) ? n : def; }

  // o: students, perStudent, minutes (per comment), proof (minutes per child to
  // read through), start, due (YYYY-MM-DD), days (weekday numbers 0-6),
  // dailyMax (minutes a day you can give it), buffer (working days kept for
  // proofreading before the deadline), word ("children" or "students"),
  // mode ("even" or "early").
  function plan(o) {
    var issues = [];
    var students = Math.floor(num(o.students, 0));
    var per = Math.max(1, Math.floor(num(o.perStudent, 1)));
    var each = num(o.minutes, 0);
    var proof = Math.max(0, num(o.proof, 0));
    var dailyMax = num(o.dailyMax, 0);
    var buffer = Math.max(0, Math.floor(num(o.buffer, 0)));
    var days = (o.days || []).map(Number).filter(function (d) { return d >= 0 && d <= 6; });
    var start = parseDate(o.start), due = parseDate(o.due);
    var word = o.word || "children";

    if (students < 1) issues.push("Enter how many " + word + " you're writing for.");
    if (students > 400) issues.push("That's more than 400 " + word + ": check the number.");
    if (each <= 0) issues.push("Enter the minutes one comment takes you (time yourself on two or three).");
    if (dailyMax <= 0) issues.push("Enter how many minutes a day you can give it.");
    if (!days.length) issues.push("Tick at least one day of the week you can work on comments.");
    if (start === null) issues.push("Enter the day you'll start.");
    if (due === null) issues.push("Enter the deadline (the day comments are due in).");
    if (start !== null && due !== null && due <= start) issues.push("The deadline must be after the start day.");
    if (issues.length) return { ok: false, issues: issues };

    var perChild = per * each;            // writing minutes for one child
    var comments = students * per;
    var writeTotal = students * perChild;
    var proofTotal = students * proof;

    // Working days from start up to the day before the deadline.
    var work = [];
    for (var t = start; t < due; t += DAY) if (days.indexOf(new Date(t).getUTCDay()) >= 0) work.push(t);
    if (!work.length) return { ok: false, issues: ["None of the ticked weekdays fall between the start day and the deadline."] };

    var keep = Math.min(buffer, work.length - 1);
    if (keep < buffer) issues.push("Only " + work.length + " working day" + (work.length === 1 ? "" : "s") + " before the deadline, so fewer proofreading days than you asked for.");
    var writeDays = work.slice(0, work.length - keep);
    var proofDays = work.slice(work.length - keep);
    var cap = Math.floor(dailyMax / perChild);   // children per day that fit
    if (cap < 1) {
      return { ok: false, issues: ["One child's comments take " + mins(perChild) + ", more than the " + mins(dailyMax) + " a day you have. Give it more time a day, or write one subject at a time across days."] };
    }

    // Spread children evenly, earlier days taking any extra one.
    var n = writeDays.length;
    var need = Math.ceil(students / n);
    var fits = need <= cap;
    // "even" spreads the class over every writing day (short days); "early"
    // fills each day up to the time you have and finishes as soon as it can.
    var early = o.mode === "early" && fits;
    var useDays = early ? Math.ceil(students / cap) : n;
    var rows = [], from = 1;
    var base = Math.floor(students / useDays), extra = students % useDays;
    for (var i = 0; i < useDays && from <= students; i++) {
      var k = early ? Math.min(cap, students - from + 1) : base + (i < extra ? 1 : 0);
      if (!k) continue;
      rows.push({ date: iso(writeDays[i]), label: label(writeDays[i]), kind: "write", from: from, to: from + k - 1, count: k, minutes: k * perChild });
      from += k;
    }
    // Proofreading: the whole class, spread over the kept days (or the last writing day).
    if (proofTotal > 0) {
      if (proofDays.length) {
        var pb = Math.floor(students / proofDays.length), pe = students % proofDays.length, pf = 1;
        proofDays.forEach(function (d, j) {
          var c = pb + (j < pe ? 1 : 0);
          if (!c) return;
          rows.push({ date: iso(d), label: label(d), kind: "proof", from: pf, to: pf + c - 1, count: c, minutes: c * proof });
          pf += c;
        });
      } else {
        issues.push("No day is left for proofreading: read them through on the last writing day, or move the start earlier.");
      }
    } else if (proofDays.length) {
      proofDays.forEach(function (d) { rows.push({ date: iso(d), label: label(d), kind: "proof", from: 1, to: students, count: students, minutes: 0 }); });
    }

    var res = {
      ok: true, fits: fits, issues: issues, rows: rows, word: word,
      comments: comments, writeMinutes: writeTotal, proofMinutes: proofTotal,
      totalMinutes: writeTotal + proofTotal, writeDays: early ? useDays : n, proofDays: proofDays.length,
      perDay: need, cap: cap, perChild: perChild
    };
    if (!fits) {
      res.neededDaily = need * perChild;
      res.neededDays = Math.ceil(students / cap);
      var one = word === "children" ? "child" : "student";
      res.advice = "At " + mins(dailyMax) + " a day you can write for " + cap + " " + (cap === 1 ? one : word) + " a day, but you need " + need + " a day to finish in " + n + " writing day" + (n === 1 ? "" : "s") + ". Either give it about " + mins(need * perChild) + " a day, or start earlier: you need " + res.neededDays + " writing days.";
    }
    res.text = toText(res);
    return res;
  }

  function range(r, word) {
    return (r.from === r.to ? (word === "children" ? "child " : "student ") + r.from : word + " " + r.from + "–" + r.to);
  }

  function toText(res) {
    var out = ["Report comments plan: " + res.comments + " comment" + (res.comments === 1 ? "" : "s") + ", about " + mins(res.totalMinutes) + " in all", ""];
    res.rows.forEach(function (r) {
      if (r.kind === "write") out.push(r.label + ": write for " + range(r, res.word) + " (about " + mins(r.minutes) + ")");
      else out.push(r.label + ": proofread " + (r.minutes ? range(r, res.word) + " (about " + mins(r.minutes) + ")" : "and fix") + ", then check names and pronouns");
    });
    if (!res.fits) out.push("", "This doesn't fit yet. " + res.advice);
    return out.join("\n");
  }

  function ics(res) {
    var stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Polytheseus//Report comments planner//EN", "CALSCALE:GREGORIAN"];
    res.rows.forEach(function (r, i) {
      var d = r.date.replace(/-/g, "");
      var next = iso(parseDate(r.date) + DAY).replace(/-/g, "");
      var what = r.kind === "write" ? "Report comments: " + range(r, res.word) : "Proofread report comments" + (r.minutes ? ": " + range(r, res.word) : "");
      lines.push("BEGIN:VEVENT", "UID:report-plan-" + d + "-" + i + "@polytheseus.com", "DTSTAMP:" + stamp,
        "DTSTART;VALUE=DATE:" + d, "DTEND;VALUE=DATE:" + next,
        "SUMMARY:" + what.replace(/[,;]/g, "\\$&"),
        "DESCRIPTION:" + ("About " + mins(r.minutes || 0)).replace(/[,;]/g, "\\$&"), "END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n") + "\r\n";
  }

  var api = { plan: plan, ics: ics, parseDate: parseDate, mins: mins };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("rp");
    if (!root) return;
    function el(id) { return document.getElementById("rp-" + id); }
    function today() { var d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()); }
    if (!el("start").value) el("start").value = iso(today());
    if (!el("due").value) el("due").value = iso(today() + 21 * DAY);
    var out = el("out");
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var res = null;
    function run() {
      var days = [];
      root.querySelectorAll("input[name=rp-day]:checked").forEach(function (c) { days.push(+c.value); });
      res = plan({
        students: el("students").value, perStudent: el("per").value, minutes: el("minutes").value,
        proof: el("proof").value, dailyMax: el("daily").value, buffer: el("buffer").value,
        start: el("start").value, due: el("due").value, days: days,
        word: el("word").value, mode: el("mode").value
      });
      if (!res.ok) { out.innerHTML = '<p class="rp-bad">' + res.issues.map(esc).join("<br>") + "</p>"; return; }
      var h = '<p class="rp-sum"><strong>' + res.comments + " comment" + (res.comments === 1 ? "" : "s") + "</strong>, about <strong>" + esc(mins(res.writeMinutes)) + "</strong> of writing" +
        (res.proofMinutes ? " and " + esc(mins(res.proofMinutes)) + " of proofreading" : "") + ", over " + res.writeDays + " writing day" + (res.writeDays === 1 ? "" : "s") +
        (res.proofDays ? " and " + res.proofDays + " proofreading day" + (res.proofDays === 1 ? "" : "s") : "") + ".</p>";
      if (!res.fits) h += '<p class="rp-bad"><strong>This doesn\'t fit yet.</strong> ' + esc(res.advice) + "</p>";
      res.issues.forEach(function (i) { h += '<p class="small">' + esc(i) + "</p>"; });
      h += '<table class="rp-table"><tr><th>Day</th><th>Do</th><th>Time</th></tr>';
      res.rows.forEach(function (r) {
        h += "<tr" + (r.kind === "proof" ? ' class="rp-proof"' : "") + "><td>" + esc(r.label) + "</td><td>" +
          (r.kind === "write" ? "Write: " + esc(range(r, res.word)) : "Proofread" + (r.minutes ? ": " + esc(range(r, res.word)) : " and fix")) +
          "</td><td>" + (r.minutes ? esc(mins(r.minutes)) : "") + "</td></tr>";
      });
      h += "</table>";
      h += '<p><button type="button" class="btn" id="rp-copy">Copy the plan</button> <button type="button" class="btn ghost" id="rp-ics">Add to my calendar (.ics)</button></p>';
      out.innerHTML = h;
      el("copy").addEventListener("click", function () {
        var b = this;
        navigator.clipboard.writeText(res.text).then(function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy the plan"; }, 1500); });
      });
      el("ics").addEventListener("click", function () {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([ics(res)], { type: "text/calendar;charset=utf-8" }));
        a.download = "report-comments-plan.ics";
        document.body.appendChild(a); a.click(); a.remove();
      });
    }
    root.addEventListener("input", run);
    root.addEventListener("change", run);
    run();
  });
})();
