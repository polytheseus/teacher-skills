// Attendance and punctuality report card comment builder for grades K-12
// (UK Reception to Year 13). Pick the attendance situation (every day,
// regular, on time, improved, missed days, a block away, often late, parts of
// days, missed lessons), an optional strength to lead with, how school is
// helping and how to invite the family in, and it writes a short comment that
// states the pattern without blame, says what it means for learning and gives
// a shared goal. The checker flags reasons for absence and health details,
// home and family circumstances, term-time holidays, blame and pressure on
// parents, fines, truancy and other enforcement language, labels ("lazy",
// "skiving"), verdicts ("poor attendance", "unacceptable"), attendance jargon
// (persistent absence, unauthorised, sessions), numbers and percentages to
// check against the register, comparisons, stock phrases, "always" and
// "never", placeholders, mixed pronouns and characters that break report
// systems. Runs in the browser and in node (module.exports) for tests.
// Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name (or "We") as its subject, so "they" never
  // needs verb agreement. {a|b} = UK|US wording. A phrase is a string or
  // { y, o }: y = grades K-5 (Reception-Year 6), o = grades 6-12 (Years 7-13).
  // kind: pos = good attendance, up = improved, con = a concern.
  // s = the pattern (after the name), i = what it means for learning (joined
  // with a comma), goal = after "Our goal for {next} is ".
  var SITUATIONS = [
    { id: "every", kind: "pos", label: "In school every day",
      s: { y: "has been in school every day this {period} and arrives ready to learn", o: "has attended every day this {period} and arrives ready to learn" } },
    { id: "regular", kind: "pos", label: "Attends regularly",
      s: { y: "attends school regularly and is settled and ready to learn at the start of each day", o: "attends regularly and is on time and ready for {lessons|class}" } },
    { id: "ontime", kind: "pos", label: "On time every day",
      s: { y: "arrives on time every morning and settles quickly into the start of the day", o: "arrives on time for every {lesson|class} and settles quickly to work" } },
    { id: "improved", kind: "up", label: "Attendance has improved",
      s: "has been in school much more often this {period}", i: "and it is already making a difference to {their} learning",
      goal: "to keep this going" },
    { id: "ontimenow", kind: "up", label: "Punctuality has improved",
      s: "has been arriving on time much more often this {period}", i: "and the calmer start is helping {their} learning",
      goal: "to keep this going" },
    { id: "missed", kind: "con", label: "Has missed a number of days",
      s: "has missed a number of school days this {period}", i: "which means missing new teaching that later lessons build on",
      goal: "for {name} to be in school every day, and to catch up on anything missed", support: "catchup" },
    { id: "block", kind: "con", label: "Was away for a block of time",
      s: "was away from school for a block of time this {period}", i: "and is now catching up on the work covered while away",
      goal: "to help {name} catch up on the key ideas missed and settle back into the class routine", support: "tasks" },
    { id: "late", kind: "con", label: "Often arrives late",
      s: { y: "has often arrived after the start of the school day this {period}", o: "has often arrived late for {registration and the first lesson|first period} this {period}" },
      i: { y: "which means missing the start of our morning lessons, when new learning is introduced", o: "which means missing the start of lessons, when new work is explained" },
      goal: { y: "for {name} to arrive in time for the start of the day", o: "for {name} to arrive on time for {registration|first period} every day" }, support: "welcome" },
    { id: "partdays", kind: "con", label: "Leaves early or misses parts of days",
      s: "has missed parts of the school day this {period}", i: "which has meant missing parts of lessons and the chance to {practise|practice} new learning",
      goal: "for {name} to be in school for the whole day whenever possible", support: "catchup" },
    { id: "lessons", kind: "con", label: "Missing lessons during the day (secondary)",
      s: "has missed some {lessons|classes} during the school day this {period}", i: "which makes it harder to keep up with the course",
      goal: "for {name} to attend every {lesson|class}", support: "checkin" }
  ];
  // Optional strength to lead with (concerns) or add (good attendance).
  // con: true = only makes sense after a concern.
  var STRENGTHS = [
    { id: "", label: "(none)" },
    { id: "effort", label: "Works hard in lessons", s: "works hard in lessons and takes pride in {their} work" },
    { id: "catchup", label: "Catches up quickly", s: "catches up quickly on missed work", con: true },
    { id: "kind", label: "Kind and helpful", s: "is a kind and helpful member of our class" },
    { id: "joins", label: "Joins in with discussions", s: "joins in with enthusiasm in class discussions" },
    { id: "progress", label: "Good progress in a subject", s: "has made good progress in {subject}" },
    { id: "settled", label: "Settled into class routines", s: "has settled well into our class routines" }
  ];
  var SUPPORT = [
    { id: "catchup", label: "Missed work + catch-up sessions", s: "We are helping by sharing missed work and offering short catch-up sessions." },
    { id: "welcome", label: "Warm welcome + quick recap on arrival", s: "We give {name} a warm welcome and a quick recap on arrival, so the day gets off to a calm start." },
    { id: "checkin", label: "Weekly check-in", s: "We have started a short weekly check-in to help {name} catch up and plan ahead." },
    { id: "tasks", label: "Short catch-up tasks", s: "We are sending home short catch-up tasks covering the main ideas." },
    { id: "none", label: "(leave it out)", s: "" }
  ];
  var CONTACT = [
    { id: "mild", label: "Invite them to get in touch", s: "If anything is making mornings or school difficult, please let me know so we can help." },
    { id: "meet", label: "Ask to meet", s: "Please get in touch so we can meet and talk about how to support {name} together." },
    { id: "met", label: "We've already talked", s: "Thank you for talking this through with me; I'll keep you updated on how the plan is going." }
  ];
  var THANKS = "Thank you for your support at home.";
  var CLOSES = {
    early: ["I look forward to working with {name} next {period}."],
    end: ["Best wishes to {name} for next year.", "I wish {name} all the best for next year."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = { us: { period: "quarter" }, uk: { period: "term" } };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function age(p, o) { return typeof p === "string" ? p : (o && o.age === "older" ? p.o : p.y); }
  function clean(s) { return String(s || "").replace(/\s+/g, " ").replace(/^[\s,;:.]+|[\s,;:.!?]+$/g, ""); }

  function fill(t, o) {
    o = o || {};
    var uk = o.style === "uk", w = WORDS[uk ? "uk" : "us"];
    // Tokens first, so {a|b} choices can contain {name} and {their}.
    var once = String(t).replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their") return PRON[o.pronoun] || PRON.they;
      if (k === "period") return o.period || w.period;
      if (k === "subject") return clean(o.subject);
      if (k === "next") return o.timing === "end" ? "next year" : "next " + (o.period || w.period);
      return m;
    });
    return once.replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return uk ? a : b; });
  }
  function also(s) {
    if (/^is /.test(s)) return s.replace(/^is /, "is also ");
    if (/^has /.test(s)) return s.replace(/^has /, "has also ");
    return "also " + s;
  }

  // opts: { name, pronoun, style: us|uk, age: young|older, timing: early|end,
  //         period, situation, strength, subject, unit, support, contact,
  //         thanks: bool, limit }
  function build(o) {
    o = o || {};
    var sit = find(SITUATIONS, o.situation) || SITUATIONS[0];
    var st = find(STRENGTHS, o.strength);
    if (!st || !st.id || (st.con && sit.kind !== "con")) st = null;
    var stText = st ? (st.id === "progress" && !clean(o.subject) ? "has made good progress this {period}" : st.s) : "";
    var issues = [], seed = hash(String(o.name || "") + sit.id);
    var parts = [], idxSt = -1, idxUnit = -1, idxSup = -1, idxThanks = -1;
    if (sit.kind === "con") {
      if (st) { idxSt = parts.length; parts.push("{name} " + stText + "."); }
      parts.push("{name} " + age(sit.s, o) + ", " + age(sit.i, o) + ".");
      if (clean(o.unit)) { idxUnit = parts.length; parts.push("The time missed has included our work on " + clean(o.unit) + "."); }
      var sup = find(SUPPORT, o.support || sit.support) || find(SUPPORT, sit.support);
      if (sup.s) { idxSup = parts.length; parts.push(sup.s); }
      parts.push("Our goal for {next} is " + age(sit.goal, o) + ".");
      var ct = find(CONTACT, o.contact) || CONTACT[0];
      parts.push(ct.s);
      if (ct.id === "meet") issues.push({ level: "note", msg: "Call or meet the family before the report goes home if you can. A report card shouldn't be the first time they hear about an attendance concern." });
    } else {
      parts.push("{name} " + age(sit.s, o) + (sit.i ? ", " + age(sit.i, o) : "") + ".");
      if (st) { idxSt = parts.length; parts.push("{name} " + also(stText) + "."); }
      if (sit.goal) parts.push("Our goal for {next} is " + age(sit.goal, o) + ".");
      if (o.thanks !== false) { idxThanks = parts.length; parts.push(THANKS); }
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { parts[idxClose] = ""; },
      function () { if (idxUnit >= 0) { parts[idxUnit] = ""; issues.push({ level: "note", msg: "Dropped the line about the work missed to fit your limit." }); } },
      function () { if (idxThanks >= 0) { parts[idxThanks] = ""; issues.push({ level: "note", msg: "Dropped the thank-you line to fit your limit." }); } },
      function () { if (idxSup >= 0) { parts[idxSup] = ""; issues.push({ level: "note", msg: "Dropped the \"how we are helping\" line to fit your limit. Tell the family about it when you talk." }); } },
      function () { if (idxSt >= 0) { parts[idxSt] = ""; issues.push({ level: "note", msg: "Dropped the strength to fit your limit." }); } }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, kind: sit.kind, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(illness\w*|ill|sick\w*|poorly|unwell|hospital\w*|medical\w*|appointments?|doctors?|doctor's|dentist\w*|gp|surgery|flu|covid\w*|virus\w*|asthma|migraines?|headaches?|tummy aches?|stomach aches?|injur\w*|broken (arm|leg|wrist|ankle)|mental health|anxiety|anxious|school refus\w*|refuses to come|ebsa|emotionally based|depress\w*|adhd|autis\w*|medicat\w*|diagnos\w*|therap(y|ist)|counsell?(ing|or)|iep|504( plan)?|ehcp|special needs|special education|disabilit\w*)\b/i, "fix", "Reason for absence or health information: \"$1\". Keep reasons and health details out of the written report, even if the family has told you. State the pattern, what it means for learning and how you are helping."],
    [/\b(SEN|SEND|SENCO|SENDCo)\b/, "fix", "Support-system language: \"$1\". Keep it out of the attendance comment and talk to the family directly."],
    [/\b(family (reasons|problems|issues|situation|circumstances)|home (life|situation|circumstances|problems|issues)|problems at home|divorc\w*|separated|separation|custody|(mum|mom|dad|mother|father|parent)'?s (work|job|shifts?|house|place|car)|young carer|caring for|looks after (a |his |her |their )?(sibling|brother|sister|parent|mum|mom|dad)|younger (sibling|brother|sister)|new baby|overslept|oversleep\w*|sleeps? in|alarm clock|school run|missed the bus|traffic|car (broke|trouble)|housing|moved house|homeless\w*|bereave\w*|funeral|grief|grieving|passed away|died|money (problems|worries)|foster\w*|in care|social (worker|services))\b/i, "fix", "Home or family circumstances: \"$1\". Keep these out of the written report; talk to the family directly, and to your attendance or pastoral lead if needed."],
    [/\b((term[- ]time |family )?holidays?|vacations?|trips? (abroad|away|overseas)|went (abroad|away)|visiting (family|relatives))\b/i, "review", "\"$1\": if this is about absence for a holiday or trip, leave the reason out. The attendance record already shows how the absence was recorded."],
    [/\b(penalty notices?|fixed penalty|(a|the|£\s?\d+) fines?|fined|prosecut\w*|court|magistrates?|truan\w*|legal (action|proceedings|duty|responsibility)|it is the law|attendance (officer|order|contract|panel|letter)|education welfare|welfare officer|ewo|ews|parenting (contract|order)|notice to improve|child protection|safeguarding|referr(al|ed) to)\b/i, "fix", "Enforcement or legal language: \"$1\". A report comment isn't the place for warnings about fines, truancy or legal steps; your school's attendance letters and meetings are. Keep the comment to the pattern, the learning and the help on offer."],
    [/\b((parents?|carers?|you|the family) (need|needs|must|should|have to|has to) (to )?(make sure|ensure|get|bring)|your responsibility|parents'? responsibility|(get|bring) (him|her|them) (to school )?on time|no excuses?|excuses)\b/i, "fix", "Blame or pressure on the family: \"$1\". Families respond better to an offer of help (\"please let me know if anything is making mornings difficult\") than to instructions in a report."],
    [/\b(lazy|can'?t be bothered|cannot be bothered|doesn'?t bother|not bothered|doesn'?t care|does not care|unmotivated|skiv\w*|bunk\w* off|bunking|ditch\w*|cut(s|ting)? class(es)?|skip(s|ped|ping)? (school|class(es)?|lessons?)|play(s|ed|ing)? hook(e)?y)\b/i, "fix", "Label: \"$1\". It judges the student and gives no way forward. Say what happens (\"has missed some lessons during the school day\") and what will help."],
    [/\b((poor|bad|terrible|awful|appalling|shocking|low) (attendance|punctuality|timekeeping)|unacceptable|disappointing|disappointed|habitual(ly)?|chronically late|persistently late|constantly|late every day|every single day)\b/i, "review", "\"$1\" is a verdict, not a description. Say what happened (\"has missed a number of school days this term\") and what it means for learning."],
    [/\b(persistent(ly)? absen\w*|severe(ly)? absen\w*|chronic(ally)? absen\w*|absenteeism|(missed|missing) (\w+ )?sessions|sessions (missed|of absence)|attendance codes?|attendance (target|threshold)|below (the )?(target|expected)|expected attendance|national average)\b/i, "note", "Jargon: \"$1\". Families may not know it, and it can read as a label. Say what happened in plain words."],
    [/\b(PA|code [A-Z])\b/, "note", "Jargon: \"$1\". Families may not know it. Say what happened in plain words."],
    [/\b(unauthori[sz]ed|authori[sz]ed absences?|unexcused|excused)\b/i, "review", "\"$1\": how each absence was recorded is on the attendance record. Repeating it in the comment reads as a judgement and invites an argument about one day."],
    [/(\b\d+(\.\d+)?\s?(%|per ?cent)|\b\d+\s+(days?|half[- ]days?|sessions?|lates?|tardies|tardy|absences?|times)\b|\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty)\s+(days|half[- ]days|sessions|lates|tardies|absences|times)\b)/i, "review", "Number or percentage: \"$1\". The report usually prints the attendance record already (in England it must). If you keep it, check it against the register on the day the report goes out, because it changes daily."],
    [/\b((worst|lowest|poorest|best|highest) (attendance|punctuality)|than (most|many|other|the other|the rest of) (students|classmates|pupils|children|kids|class|peers)|(class|year group|grade|school) average|the rest of the class|compared (to|with))\b/i, "review", "Comparison: \"$1\". Report on this student's own attendance; other families read reports too."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or \"this {period}\"."],
    [/(\[(name|student|child|first name|pronoun|unit|subject)[^\]]*\]|\{(name|student|unit|subject)\}|<name>|\bXX+\b|student'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|pleasure to have in class|delightful|ray of sunshine|model (student|pupil|citizen)|an asset to (the|our|my) class|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|tapestry|delve\w*|showcases?|shining star|superstar|exemplary|commendable)\b/i, "note", "Stock phrase: \"$1\". It reads as generic (and as AI-written). Say what the student does."],
    [/\b(alarming|red flag|deeply concerned|very concerned|extremely concerned|seriously worried|worrying|serious concern)\b/i, "review", "\"$1\" on a written report can alarm a family. Say what has happened and what will help; save the worry for a phone call or meeting."]
  ];
  var CONCERN = /\b(missed|missing|miss(es)? (school|lessons?|class(es)?|days?)|absen\w*|away from school|late\b|lateness|tard\w*|left early|leaves early|leaving early)\b/i;
  var PLAN = /\b(we are|we have|we'?ll|we will|we give|catch[- ]?up|catching up|goal|plan|help\w*|support\w*|get in touch|let me know|contact|meet|talk)\b/i;
  var STRONG = /\b(works? hard|working hard|effort|kind\w*|helpful|enthusias\w*|progress\w*|settled|joins?|enjoy\w*|pride|proud|well|strong\w*|confident\w*|great|good|thoughtful|curious|creative|friendly|keen|careful|quickly|improv\w*|much more often)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: fill(c[2].replace("$1", m[1] || m[0]), o) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the close, the line about work missed or the \"how we are helping\" line." });
    var needs = (t.match(/\b(needs to|must|has to|should)\b/gi) || []).length;
    if (needs >= 2) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. Turn one into a shared goal: \"Our goal for next term is ...\"." });
    if (CONCERN.test(t)) {
      if (!PLAN.test(t)) issues.push({ level: "review", msg: "The comment names an attendance concern but no plan or invitation. Add how school is helping, a shared goal, or \"please let me know if anything is making mornings difficult\"." });
      if (!STRONG.test(t)) issues.push({ level: "review", msg: "No strength in the comment. Lead with one true positive (\"works hard in lessons\", \"catches up quickly on missed work\") so the family reads that first." });
    }
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another student's, check the pronouns." });
    if (o.name) {
      var nm = String(o.name).trim();
      if (nm && t.indexOf(nm) < 0) issues.push({ level: "review", msg: "The student's name (\"" + nm + "\") isn't in the comment. Was it written for someone else?" });
    }
    var m = t.match(/[—–‘’“”…]/g);
    if (m) issues.push({ level: "note", msg: "Curly quotes, dashes or … (" + m.length + "). Some report systems show these as ? or boxes. \"Plain text\" below swaps them for straight ones." });
    var sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 30; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 30 words. Split it so it's easy to read." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { SITUATIONS: SITUATIONS, STRENGTHS: STRENGTHS, SUPPORT: SUPPORT, CONTACT: CONTACT, build: build, check: check, plain: plain, fill: fill, age: age };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(items) {
    return items.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  function options(list) { return list.map(function (x) { return "<option value=\"" + x.id + "\">" + esc(x.label) + "</option>"; }).join(""); }
  document.addEventListener("DOMContentLoaded", function () {
    var selSit = document.getElementById("at-situation");
    if (!selSit) return;
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    var GROUPS = { pos: "Good attendance", up: "Improved", con: "A concern" };
    selSit.innerHTML = ["pos", "up", "con"].map(function (k) {
      return "<optgroup label=\"" + GROUPS[k] + "\">" + options(SITUATIONS.filter(function (s) { return s.kind === k; })) + "</optgroup>";
    }).join("");
    el("at-strength").innerHTML = options(STRENGTHS);
    el("at-support").innerHTML = "<option value=\"\">(best fit for the situation)</option>" + options(SUPPORT);
    el("at-contact").innerHTML = options(CONTACT);
    function sync() {
      var s = find(SITUATIONS, selSit.value), con = s && s.kind === "con";
      el("at-concern").hidden = !con;
      el("at-thanks-row").hidden = con;
      el("at-subject-row").hidden = val("at-strength") !== "progress";
    }
    selSit.addEventListener("change", sync);
    el("at-strength").addEventListener("change", sync);
    function opts() {
      return { name: val("at-name").trim(), pronoun: val("at-pronoun"), style: val("at-style"), age: val("at-age"), timing: val("at-timing"), period: val("at-period"),
        situation: val("at-situation"), strength: val("at-strength"), subject: val("at-subject"), unit: val("at-unit"), support: val("at-support"), contact: val("at-contact"),
        thanks: el("at-thanks").checked, limit: val("at-limit") };
    }
    el("at-style").addEventListener("change", function () { el("at-period").value = this.value === "uk" ? "term" : "quarter"; });
    var out = el("at-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"at-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"at-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"at-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"at-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"at-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = el("at-text");
      ta.addEventListener("input", function () { el("at-count").textContent = ta.value.length; });
      el("at-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      el("at-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      el("at-plain").addEventListener("click", function () { ta.value = plain(ta.value); el("at-count").textContent = ta.value.length; });
    }
    el("at-run").addEventListener("click", function () {
      var r = build(opts());
      show(r.text, r.issues, r.chars);
    });
    el("at-check").addEventListener("click", function () {
      var v = val("at-paste");
      show(v, check(v, opts()), v.length);
    });
    el("at-sample").addEventListener("click", function () {
      el("at-name").value = "Leo";
      el("at-pronoun").value = "he";
      el("at-age").value = "young";
      el("at-situation").value = "late";
      el("at-strength").value = "effort";
      el("at-unit").value = "";
      el("at-support").value = "";
      el("at-contact").value = "mild";
      sync();
      el("at-run").click();
    });
    el("at-next").addEventListener("click", function () {
      el("at-name").value = "";
      out.innerHTML = ""; el("at-name").focus();
    });
    sync();
  });
})();
