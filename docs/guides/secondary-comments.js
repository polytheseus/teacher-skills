// Report card comment builder for middle and high school subject teachers
// (grades 6-12, UK Years 7-13). Pick one or two areas (knowledge, problem
// solving, written work, discussion, assessments, practical work, independent
// study) with the level the student is working at, a learning strength, a habit
// next step, and, if needed, a concern (missing work, at risk of not passing,
// gaps after missed lessons, effort) with where to get help. It writes a short
// comment that works for any subject and fits the comment box. The checker flags
// fixed-ability labels ("not a math person"), predictions ("will fail"), grade
// percentages, discipline records, home and personal circumstances, medical or
// support-plan details, comparisons, labels, vague "potential" lines, teacher
// jargon, stock phrases, placeholders, mixed pronouns and characters that break
// report systems. Runs in the browser and in node (module.exports) for tests.
// Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name as its subject, so "they" never needs verb
  // agreement. {a|b} = UK|US wording.
  var LEVELS = [
    { id: "strong", label: "{Above target|Above expectations}" },
    { id: "secure", label: "{On target|Meeting expectations}" },
    { id: "developing", label: "{Below target|Not yet meeting expectations}" }
  ];
  // s = what the student does now (after the name), g = next step (after "working on").
  var AREAS = [
    { id: "knowledge", label: "Knowledge and understanding",
      strong: { s: "has a detailed grasp of the key ideas in {course} and uses them confidently in unfamiliar questions", g: "explaining how the key ideas connect across different units" },
      secure: { s: "understands the key ideas we have covered and uses them accurately in class work", g: "reviewing earlier units regularly so that the knowledge sticks" },
      developing: { s: "is building {their} understanding of the key ideas we have covered and is more confident when working through examples step by step", g: "reviewing class notes after each lesson and asking about anything that is unclear" } },
    { id: "applying", label: "Problem solving and applying skills",
      strong: { s: "applies {their} skills to unfamiliar problems and explains {their} reasoning clearly", g: "tackling the most challenging extension problems" },
      secure: { s: "applies {their} skills accurately to familiar problems and shows each step of {their} working", g: "using the same skills on less familiar problems" },
      developing: { s: "is learning to apply new skills to problems, and does this well when following a worked example", g: "trying each problem independently before checking a worked example" } },
    { id: "writing", label: "Written work and explanations",
      strong: { s: "writes clear, well-{organised|organized} answers that support each point with precise evidence", g: "developing {their} analysis further by explaining why each piece of evidence matters" },
      secure: { s: "writes {organised|organized} answers that make clear points with some supporting evidence", g: "adding a specific piece of evidence or an example to support each point" },
      developing: { s: "is learning to {organise|organize} written answers so that each one makes a clear point", g: "planning each answer before writing and backing up every point with one piece of evidence" } },
    { id: "discussion", label: "Class discussion",
      strong: { s: "contributes thoughtful ideas to class discussion and builds on what others say", g: "asking questions that take the discussion further" },
      secure: { s: "contributes to class discussion and answers questions clearly when asked", g: "volunteering ideas more often in whole-class discussion" },
      developing: { s: "is becoming more comfortable sharing ideas in pairs and small groups", g: "sharing at least one idea in each lesson's discussion" } },
    { id: "assessments", label: "Tests and assessments",
      strong: { s: "prepares thoroughly for assessments and does consistently well on them", g: "using the feedback from each assessment to set {their} own targets" },
      secure: { s: "prepares for assessments and shows a sound understanding of the material in them", g: "preparing with practice questions and past {papers|tests}, not only by rereading notes" },
      developing: { s: "is learning effective ways to prepare for assessments", g: "{practising|practicing} with short quizzes and practice questions in the week before each assessment" } },
    { id: "practical", label: "Labs, projects and practical work",
      strong: { s: "plans and carries out practical work and projects carefully and reflects thoughtfully on the results", g: "evaluating {their} methods and suggesting how to improve them" },
      secure: { s: "completes practical work and projects carefully, following instructions accurately", g: "explaining what {their} results show and why" },
      developing: { s: "is building confidence in practical work and projects, especially when following clear step-by-step instructions", g: "planning each stage of a project before starting" } },
    { id: "independent", label: "Independent study and {organisation|organization}",
      strong: { s: "manages {their} time well, keeps {organised|organized} notes and often goes beyond the work that is set", g: "taking on wider reading or extension work in areas of interest" },
      secure: { s: "keeps {organised|organized} notes and completes most work on time", g: "using a planner to spread work on longer assignments over several days" },
      developing: { s: "is learning to keep track of assignments and deadlines", g: "writing every assignment and deadline in a planner and checking it each day" } }
  ];
  var STRENGTHS = [
    { id: "effort", label: "Works hard", s: "works hard in lessons and keeps going when the work gets difficult" },
    { id: "prepared", label: "Arrives ready to learn", s: "arrives ready to learn, with the right materials" },
    { id: "questions", label: "Asks good questions", s: "asks thoughtful questions when something is unclear" },
    { id: "help", label: "Seeks help when needed", s: "seeks help when needed and makes good use of it" },
    { id: "feedback", label: "Acts on feedback", s: "acts on feedback to improve {their} work" },
    { id: "respect", label: "Respectful and supportive", s: "is respectful and supportive of classmates" },
    { id: "group", label: "Strong in group work", s: "works well in group tasks and shares the workload fairly" },
    { id: "curious", label: "Curious about the subject", s: "shows real curiosity about {course}" },
    { id: "homework", label: "Careful, on-time homework", s: "completes {homework|homework} carefully and on time" }
  ];
  var HABITS = [
    { id: "", label: "(none)", s: "" },
    { id: "deadlines", label: "Handing work in on time", s: "handing in every assignment by its deadline" },
    { id: "focus", label: "Staying focused all lesson", s: "staying focused for the whole lesson" },
    { id: "phone", label: "Phone away in lessons", s: "keeping {their} phone put away during lessons" },
    { id: "notes", label: "Taking full notes", s: "taking full notes in every lesson" },
    { id: "ask", label: "Asking for help early", s: "asking for help as soon as something is unclear" },
    { id: "review", label: "Reviewing notes after lessons", s: "reviewing {their} notes for ten minutes after each lesson" },
    { id: "start", label: "Starting promptly", s: "starting work promptly at the beginning of each lesson" },
    { id: "read", label: "Reading questions carefully", s: "reading each question carefully before answering" }
  ];
  // Optional concern, written as what's happening plus what will help.
  var CONCERNS = [
    { id: "", label: "(none)", s: "" },
    { id: "missing", label: "Missing work", s: "{name} has some missing work this {period}, and handing it in{deadline} will give a fuller picture of what {name} can do." },
    { id: "atrisk", label: "{Working below target|At risk of not passing}", s: "{{name} is currently working below {their} target grade, and there is still time to close the gap.|{name} is currently at risk of not passing {course}, and there is still time to turn this around.}" },
    { id: "gaps", label: "Gaps after missed lessons", s: "Missed lessons have left some gaps in {name}'s notes, so catching up on that work{deadline} is the priority." },
    { id: "effort", label: "Effort is holding back progress", s: "{name} is capable of more than {their} current work shows, and more consistent effort in lessons would make a real difference." }
  ];
  var CLOSES = {
    early: ["I look forward to seeing {name}'s progress next {period}.", "I look forward to working with {name} next {period}."],
    end: ["I have enjoyed teaching {name} this year.", "Best wishes to {name} for next year."],
    concern: ["Please get in touch if you would like to talk about how we can support {name}."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = { us: { period: "quarter", course: "this class" }, uk: { period: "term", course: "this subject" } };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function clean(x) { return String(x || "").trim().replace(/[.!,;:]+$/, ""); }

  function fill(t, o) {
    o = o || {};
    var uk = o.style === "uk", w = WORDS[uk ? "uk" : "us"];
    var course = clean(o.course), deadline = clean(o.deadline).replace(/^by /i, "");
    var once = String(t).replace(/\{course\}/g, course || w.course).replace(/\{deadline\}/g, deadline ? " by " + deadline : "");
    // Tokens first, so {a|b} choices can contain {name} and {their}.
    once = once.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their") return PRON[o.pronoun] || PRON.they;
      if (k === "period") return o.period || w.period;
      if (k in w) return w[k];
      return m;
    });
    return once.replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return uk ? a : b; });
  }
  function also(s) {
    if (/^is /.test(s)) return s.replace(/^is /, "is also ");
    if (/^has /.test(s)) return s.replace(/^has /, "also has ");
    return "also " + s;
  }

  // opts: { name, pronoun, style: us|uk, timing: early|end, period, course, unit,
  //         area, level, area2, level2, focus: area id, strengths: [id], habit: id,
  //         concern: id, deadline, help: "text", limit }
  function build(o) {
    o = o || {};
    var a1 = find(AREAS, o.area) || AREAS[0];
    var l1 = find(LEVELS, o.level) ? o.level : "secure";
    var a2 = o.area2 && o.area2 !== a1.id ? find(AREAS, o.area2) : null;
    var l2 = find(LEVELS, o.level2) ? o.level2 : l1;
    var order = LEVELS.map(function (x) { return x.id; });
    // The next step comes from the chosen area at the level the student is at there.
    var fa = find(AREAS, o.focus) || (a2 && order.indexOf(l2) > order.indexOf(l1) ? a2 : a1);
    var fl = fa === a1 ? l1 : fa === a2 ? l2 : l1;
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    var habit = find(HABITS, o.habit || "");
    var concern = find(CONCERNS, o.concern || "");
    var help = clean(o.help).replace(/^(come to|attend|join|at) /i, "");
    var unit = clean(o.unit).replace(/^(in |during )?((our |the )(work on |unit on )|our )?/i, "");
    var issues = [], seed = hash(String(o.name || "") + a1.id + l1);
    if (!strengths.length) issues.push({ level: "review", msg: "No learning strength picked. Families and students read the first line most closely; tick one that's true for this student." });
    if (strengths.length > 2) { issues.push({ level: "note", msg: "Used the first two strengths; a short comment reads better with one or two." }); strengths = strengths.slice(0, 2); }
    if (concern && concern.s && !strengths.length) issues.push({ level: "review", msg: "A concern with no strength reads as all bad news. Tick one strength that's true, even a small one." });
    var parts = [], idxS2 = -1, idxA2 = -1, idxHabit = -1, idxHelp = -1, idxNext;
    if (strengths[0]) parts.push("{name} " + strengths[0].s + ".");
    if (strengths[1]) { idxS2 = parts.length; parts.push("{name} " + also(strengths[1].s) + "."); }
    parts.push((unit ? "In our work on " + unit + ", " : "") + "{name} " + a1[l1].s + ".");
    if (a2) { idxA2 = parts.length; parts.push("{name} " + also(a2[l2].s) + "."); }
    if (concern && concern.s) parts.push(concern.s);
    idxNext = parts.length;
    parts.push("Next, {name} is working on " + fa[fl].g + ".");
    if (habit && habit.s) { idxHabit = parts.length; parts.push("{name} is also working on " + habit.s + "."); }
    if (help) { idxHelp = parts.length; parts.push("{name} is welcome at " + help + "."); }
    var idxClose = parts.length;
    parts.push(concern && concern.s ? CLOSES.concern[0] : pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (!(concern && concern.s)) parts[idxClose] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { if (idxHabit >= 0) { parts[idxHabit] = ""; issues.push({ level: "note", msg: "Dropped the habit next step to fit your limit." }); } },
      function () { if (concern && concern.s) { parts[idxClose] = ""; issues.push({ level: "note", msg: "Dropped the \"please get in touch\" line to fit your limit. Make sure the family knows how to reach you." }); } },
      function () { if (idxA2 >= 0) { parts[idxA2] = ""; if (fa === a2) parts[idxNext] = "Next, {name} is working on " + a1[l1].g + "."; issues.push({ level: "note", msg: "Dropped the second area to fit your limit." }); } },
      function () { if (idxHelp >= 0) { parts[idxHelp] = ""; issues.push({ level: "note", msg: "Dropped the extra-help line to fit your limit." }); } }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(not (a|really a) (math|maths|science|numbers|language|languages|writing|reading|history|art|academic) person|not (very |naturally |really )?(academic|bright|clever|smart|intelligent|gifted)|no (aptitude|head|brain) for|(isn'?t|is not|wasn'?t) cut out for|(weak|bad|hopeless|terrible|poor) at (math|maths|science|english|writing|reading|languages|history|exams|tests))\b/i, "fix", "Fixed-ability label: \"$1\". It tells the student the subject can't be learned. Describe what they do now and the next step (\"is learning to apply new skills when following a worked example\")."],
    [/\b(will (definitely |probably |certainly )?(fail|not pass|get an? [A-F9]|get a grade|achieve an? [A-F9])|(is going|are going) to fail|won'?t pass|guaranteed (an?|to)|(won'?t|will not|never) get into (college|university|uni|sixth form)|college[- ]bound|university material|predicted (to fail|an? U))\b/i, "review", "Prediction: \"$1\". Report on where the student is now and what will help; a prediction in writing can discourage the student or become a complaint. Use your school's predicted-grade system if there is one."],
    [/(\b\d{1,3}(\.\d+)?\s?%|\b(grade|average|score) (of|is|was) \d{1,3}\b|\bGPA\b)/i, "note", "Grade or percentage (\"$1\"). The grade is already on the report; use the comment for what's behind it and the next step."],
    [/\b(detentions?|suspen(ded|sion)|(behaviou?r )?referrals?|write-?ups?|exclu(ded|sion)|demerits?|behaviou?r points|sent out|removed from (class|the lesson)|on report(?! cards?))\b/i, "review", "Discipline record: \"$1\". Keep incidents in your school's behaviour system and talk to the family directly; the report comment is for learning and next steps."],
    [/\b(divorce\w*|separat(ed|ion) parents|home life|family (problems|issues|situation)|problems at home|(boy|girl)friend|pregnan\w*|court|police|foster\w*|in care|social (worker|services)|counsell?or|bereave\w*|grief|money (problems|worries)|works? (a|two) jobs?|part-time job)\b/i, "fix", "Personal or home circumstances: \"$1\". Keep these out of the written report; talk to the family, and to your pastoral or counseling team if needed."],
    [/\b(adhd|autis\w*|on the spectrum|dyslexi\w*|dyscalcul\w*|dyspraxi\w*|anxiety|anxious disorder|depress\w*|mental health|self-harm\w*|eating disorder|medical\w*|medicat\w*|diagnos\w*|special needs|special education|iep|504( plan)?|ehcp|disabilit\w*|accommodations?|access arrangements|extra time (in|for|on) (exams|tests|assessments))\b/i, "fix", "Medical or support-plan detail: \"$1\". Keep it out of the written report unless your school's policy says otherwise; talk to the family and your special education or SEN colleagues instead."],
    [/\b(SEN|SEND|SENCO)\b/, "fix", "Support-plan language: \"$1\". Keep it out of the written report unless your school's policy says otherwise."],
    [/\b(best (in|of) (the|my|our) (class|group|year|grade|set)|(top|bottom|worst|lowest|highest|weakest|strongest) (student|pupil|mark|grade|score)s? in (the|my|our) (class|group|year|grade|set)|(top|bottom) of (the|my|our) (class|group|year|set)|than (most|many|the other|other|the rest of (the|his|her|their)) (students|classmates|pupils|class|peers)|the rest of the class|compared (to|with) (the class|the others|others|(his|her|their) (classmates|peers))|bottom set)\b/i, "review", "Comparison: \"$1\". Report on this student's own work and progress; other families read reports too."],
    [/\b(lazy|unmotivated|apathetic|careless|naughty|rude|disrespectful|stubborn|defiant|disruptive|immature|sloppy|uncooperative|entitled|troublemaker|slacker|class clown|chatterbox|attitude problem|bad attitude|poor attitude|attention[- ]seek\w*|weak student|slow learner)\b/i, "fix", "Label: \"$1\". Describe what the student does and what would help instead."],
    [/\b((addicted|glued) to (his|her|their) phone)\b/i, "review", "\"$1\" is a label. Name the next step instead: \"is working on keeping their phone put away during lessons\"."],
    [/\b(could do better|capable of (much )?better|reach (his|her|their) (full )?potential|full potential|not working to (his|her|their) potential|if only (he|she|they)|if (he|she|they) (applied|applies|tried)|needs to (try|work) harder|must try harder|could try harder)\b/i, "review", "\"$1\" is vague: the student can't act on it. Say what would make the difference (\"reviewing notes after each lesson\", \"planning each answer before writing\")."],
    [/\b(can'?t|cannot|unable to|refuses to|doesn'?t (even )?(try|listen|care)|does not (listen|care))\b/i, "review", "\"$1\" puts the gap first. Try \"is learning to\", \"is starting to\" or describe what happens now."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or give an example."],
    [/(\[(name|student|child|first name|pronoun|unit|course|subject|date|deadline)[^\]]*\]|\{(name|student|course)\}|<name>|\bXX+\b|student'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(DOK|depth of knowledge|CCSS|NGSS|AO\d|assessment objectives?|MTSS|RTI|tier [23]|PLCs?|formative|summative|scaffold\w*|metacogniti\w*|learning intentions?|success criteria|WAGOLL|flight ?path|progress 8|attainment 8|criterion [A-D]|proficiency scale|standards-based|mastery level|learning targets?)\b/i, "note", "Teacher jargon: \"$1\". Families and students won't know it. Say what the student does (\"explains each step of a solution\", \"backs up each point with evidence\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|pleasure to have in class|delightful|great kid|bright (student|pupil|young (man|woman|lady))|an asset to (the|our|my) class|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|tapestry|delve\w*|showcases?|shining star|superstar|exemplary)\b/i, "note", "Stock phrase: \"$1\". It reads as generic (and as AI-written). Name a real skill or habit instead."],
    [/\b(alarming|red flag|deeply concerned|very concerned|extremely concerned|seriously worried|disappointing|disappointed)\b/i, "review", "\"$1\" on a written report can alarm a family or shut a teenager down. Say what you've seen and what will help; save the worry for a conversation."]
  ];
  var SKILL = /\b(ideas?|concepts?|understand\w*|knowledge|problems?|skills?|reasoning|solutions?|answers?|evidence|analys\w*|explain\w*|writ\w*|essays?|paragraphs?|argument\w*|sources?|discussion|questions?|assessments?|tests?|exams?|quizz?\w*|papers|practical|labs?|experiments?|projects?|results|methods?|notes|reading|vocabulary|equations?|calculat\w*|data|graphs?|translat\w*|speaking|listening|design\w*|research\w*|revis\w*|units?|topics?|assignments?|coursework)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: fill(c[2].replace("$1", m[1] || m[0]), o) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second strength, the habit line or the closing line." });
    var needs = (t.match(/\b(needs to|must|has to|should)\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. Turn one into \"next, X is working on\"." });
    if (!SKILL.test(t)) issues.push({ level: "review", msg: "No learning named. \"A pleasure to teach\" could be about any student; name one thing this student does in your subject (\"backs up each point with evidence\")." });
    if (!/\b(next|working on|work on|focus|goal|aim|target|learning to|is learning|starting to|try|practi[sc]e|catch(ing)? up|hand(ing)? in)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one specific thing the student is working on next." });
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another student's, check the pronouns." });
    if (/\b(you|your)\b/i.test(t) && o.name && t.indexOf(String(o.name).trim()) >= 0 && !/\b(if you would like|get in touch|please contact|contact me)\b/i.test(t)) issues.push({ level: "note", msg: "The comment mixes \"you\" with the student's name. Write either to the student (\"you\") or about them (their name), not both." });
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

  var api = { LEVELS: LEVELS, AREAS: AREAS, STRENGTHS: STRENGTHS, HABITS: HABITS, CONCERNS: CONCERNS, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(items) {
    return items.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("hs-strengths");
    if (!sGrid) return;
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    function options(sel, items, o, none) {
      var keep = sel.value;
      sel.innerHTML = (none ? "<option value=\"\">" + none + "</option>" : "") + items.map(function (x) { return "<option value=\"" + x.id + "\">" + esc(fill(x.label, o)) + "</option>"; }).join("");
      if (keep && sel.querySelector("option[value=\"" + keep + "\"]")) sel.value = keep;
    }
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function render() {
      var o = { style: val("hs-style") }, ck = checked(sGrid);
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = ck.indexOf(i.value) >= 0; });
      options(el("hs-area"), AREAS, o);
      options(el("hs-area2"), AREAS, o, "(none)");
      options(el("hs-focus"), AREAS, o, "(the area with the lower level)");
      options(el("hs-habit"), HABITS, o);
      options(el("hs-concern"), CONCERNS, o);
      ["hs-level", "hs-level2"].forEach(function (id) { options(el(id), LEVELS, o); if (!el(id).value) el(id).value = "secure"; });
    }
    render();
    el("hs-level").value = "secure"; el("hs-level2").value = "secure";
    function opts() {
      return { name: val("hs-name").trim(), pronoun: val("hs-pronoun"), style: val("hs-style"), timing: val("hs-timing"), period: val("hs-period"),
        course: val("hs-course"), unit: val("hs-unit"), area: val("hs-area"), level: val("hs-level"), area2: val("hs-area2"), level2: val("hs-level2"),
        focus: val("hs-focus"), strengths: checked(sGrid), habit: val("hs-habit"), concern: val("hs-concern"), deadline: val("hs-deadline"), help: val("hs-help"), limit: val("hs-limit") };
    }
    el("hs-style").addEventListener("change", function () { render(); el("hs-period").value = this.value === "uk" ? "term" : "quarter"; });
    var out = el("hs-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"hs-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"hs-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"hs-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"hs-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"hs-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = el("hs-text");
      ta.addEventListener("input", function () { el("hs-count").textContent = ta.value.length; });
      el("hs-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      el("hs-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      el("hs-plain").addEventListener("click", function () { ta.value = plain(ta.value); el("hs-count").textContent = ta.value.length; });
    }
    el("hs-run").addEventListener("click", function () {
      var r = build(opts());
      show(r.text, r.issues, r.chars);
    });
    el("hs-check").addEventListener("click", function () {
      var v = val("hs-paste");
      show(v, check(v, opts()), v.length);
    });
    el("hs-sample").addEventListener("click", function () {
      el("hs-name").value = "Jordan";
      el("hs-pronoun").value = "he";
      el("hs-course").value = "Biology";
      el("hs-unit").value = "cells and microscopy";
      el("hs-area").value = "practical"; el("hs-level").value = "strong";
      el("hs-area2").value = "writing"; el("hs-level2").value = "developing";
      el("hs-focus").value = "";
      el("hs-habit").value = "";
      el("hs-concern").value = "missing";
      el("hs-deadline").value = "November 20";
      el("hs-help").value = "Tuesday after-school help in room 114";
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = i.value === "curious"; });
      el("hs-run").click();
    });
    el("hs-next").addEventListener("click", function () {
      el("hs-name").value = "";
      el("hs-concern").value = ""; el("hs-deadline").value = ""; el("hs-help").value = "";
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = false; });
      out.innerHTML = ""; el("hs-name").focus();
    });
  });
})();
