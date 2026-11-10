// Report card comment builder for the first report of the year (first quarter,
// first term, first trimester). Say how the student has settled, pick one or two
// things that have gone well so far, add a real moment, and choose one goal for
// next time, and it writes a comment about what this student does now and what
// comes next. The checker flags copied end-of-year wording ("a great year",
// "next grade"), "too early to tell", "settle down", below-grade-level and
// retention lines, labels and "can't"/"won't", stock praise, comparisons,
// diagnoses and family details, missing next steps, placeholders, mixed
// pronouns and characters that break report systems. Runs in the browser and in
// node (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name (or "I" / "we") as its subject, so "they"
  // only needs verb agreement where vary() swaps the name out. {a|b} = UK|US.
  var SETTLE = [
    { id: "quick", label: "Settled in quickly", v: "{name} has settled quickly into our class and already knows our routines well." },
    { id: "steady", label: "Settling in steadily", v: "{name} has settled in steadily this {period} and is growing more confident each week." },
    { id: "new", label: "New to the school", v: "{name} is new to our school this year and has settled in well, learning new routines and getting to know classmates." },
    { id: "grade", label: "Adjusting to a new grade", v: "{name} is adjusting well to the new routines and expectations of a new {year group|grade}." },
    { id: "routines", label: "Still learning routines", v: "{name} is still learning some of our routines and is more comfortable with them each week." },
    { id: "quiet", label: "Quiet at first", v: "{name} was quiet in our first weeks and is starting to share more, especially in small groups." }
  ];
  var STRENGTHS = [
    { id: "routines", label: "Follows routines", v: ["follows our classroom routines and is ready to learn quickly each morning", "knows where everything goes and starts the day without reminders"] },
    { id: "listening", label: "Listens and gets started", v: ["listens carefully to instructions and gets started straight away", "listens well in lessons and asks when something isn't clear"] },
    { id: "reading", label: "Reading", v: ["reads every day in our reading time and can retell what happened in a story", "is building good reading habits and chooses books with care"] },
    { id: "writing", label: "Writing", v: ["is willing to have a go at writing and adds more detail each week", "writes about {their} own ideas and experiences with real enthusiasm"] },
    { id: "math", label: "{Maths|Math}", v: ["is confident with the number work we have covered so far and explains {their} thinking", "has picked up our first {maths|math} unit well and checks {their} answers"] },
    { id: "topic", label: "{Science and topic work|Science and social studies}", v: ["brings questions and ideas to our {science and topic work|science and social studies}", "remembers what we learned in earlier lessons and connects it to new topics"] },
    { id: "joins", label: "Joins in discussions", v: ["joins in class discussions and shares ideas with the group", "is willing to answer questions even when unsure, which helps {their} learning"] },
    { id: "independent", label: "Works independently", v: ["works on {their} own for a little longer each week", "{organises|organizes} {their} own materials and keeps track of {their} work"] },
    { id: "effort", label: "Takes care, keeps trying", v: ["takes care over {their} work and finishes tasks", "keeps trying when a task is new or hard"] },
    { id: "kind", label: "Kind to classmates", v: ["is kind to classmates and includes others in games and group work", "works well with a partner and takes turns fairly"] },
    { id: "homework", label: "Homework and reading at home", v: ["brings {their} homework back on time and done with care", "reads at home regularly, and it shows in {their} reading in class"] },
    { id: "curious", label: "Curious about new topics", v: ["asks thoughtful questions and is curious about each new topic", "brings things from home to share that connect to what we are learning"] }
  ];
  // goal = gerund phrase after "will work on", sch = what the teacher will do
  // (after "I'll "), home = base verb after "you could".
  var GOALS = [
    { id: "start", label: "Getting started on tasks", goal: "getting started on tasks more quickly after instructions", sch: "give {name} a short checklist for the start of each task", home: "{practise|practice} a simple morning routine with a picture or word checklist" },
    { id: "focus", label: "Focus during independent work", goal: "staying focused for longer stretches of independent work", sch: "break longer tasks into smaller steps with a check-in after each one", home: "set a timer for short bursts of homework or reading, with a break in between" },
    { id: "fluency", label: "Reading aloud smoothly", goal: "reading aloud more smoothly, with fewer stops to sound out words", sch: "listen to {name} read each week and {practise|practice} tricky words", home: "read together for ten minutes most evenings, taking turns with the pages" },
    { id: "comprehension", label: "Understanding what they read", goal: "explaining why characters act as they do, as well as what happens in a story", sch: "ask more \"why\" questions in our reading groups", home: "ask {name} why a character did something in a story you read together" },
    { id: "detail", label: "More detail in writing", goal: "adding more detail to {their} writing", sch: "give a short checklist with one kind of detail to add each time", home: "encourage {name} to write a list, card or note for a real reason" },
    { id: "handwriting", label: "Handwriting and spacing", goal: "forming letters neatly and leaving spaces between words", sch: "build in short handwriting {practice|practice} each week", home: "write shopping lists or cards together" },
    { id: "facts", label: "Number facts", goal: "recalling number facts more quickly", sch: "add a few minutes of facts {practice|practice} to each {maths|math} lesson", home: "play a quick number facts game in the car or at dinner" },
    { id: "explain", label: "Explaining {maths|math} thinking", goal: "explaining the steps behind {their} answers", sch: "ask for one sentence on how each answer was found", home: "ask {name} to show you how a homework problem was solved" },
    { id: "share", label: "Sharing ideas in class", goal: "sharing ideas in class discussions more often", sch: "give notice of a question so {name} can think of an answer first", home: "ask {name} to tell you one thing learned at school each day" },
    { id: "turns", label: "Waiting for a turn to speak", goal: "waiting for a turn to speak in group discussions", sch: "use talk partners so everyone gets a turn", home: "take turns at dinner, with each person sharing one thing from the day" },
    { id: "organised", label: "Keeping track of things", goal: "keeping track of {their} own materials and homework", sch: "set up a simple end-of-day checklist", home: "pack the school bag together the night before" },
    { id: "help", label: "Asking for help early", goal: "asking for help as soon as something isn't clear", sch: "check in with {name} early in each task", home: "talk about a time you asked for help and how it went" },
    { id: "partners", label: "Working with different classmates", goal: "working with a wider range of classmates", sch: "mix partners and groups so {name} works with different people", home: "ask about a classmate {name} worked with that day" },
    { id: "feelings", label: "Staying calm when work is hard", goal: "staying calm and trying again when a task feels hard", sch: "teach a few calm-down steps that {name} can use in class", home: "name feelings together and talk about what helps" },
    { id: "checking", label: "Checking work before handing in", goal: "checking {their} work before handing it in", sch: "give a short checklist to use before handing work in", home: "ask {name} to find one thing to fix in finished homework" }
  ];
  var CLOSES = [
    "I'm looking forward to the rest of the year with {name}.",
    "Thank you for your support in these first weeks of the year."
  ];
  // Stand-alone short comments for tight character limits and quick comment boxes.
  var SHORT = [
    "{name} has settled quickly into our class and knows our routines well.",
    "{name} has settled in well and is growing more confident each week.",
    "{name} has made a positive start, joining in and trying {their} best.",
    "{name} is new to our school and is making friends and learning routines.",
    "{name} comes in ready to learn and starts the day without reminders.",
    "{name} listens carefully to instructions and gets started straight away.",
    "{name} asks for help when something isn't clear.",
    "{name} is building good reading habits and chooses books with care.",
    "{name} can retell the main events of a story in order.",
    "{name} reads aloud with growing confidence.",
    "{name} is willing to have a go at writing and adds more detail each week.",
    "{name} writes about {their} own ideas with enthusiasm.",
    "{name} is confident with the number work we have covered so far.",
    "{name} explains {their} {maths|math} thinking clearly.",
    "{name} has made a strong start in {maths|math} and checks {their} answers.",
    "{name} brings good questions to our {science and topic|science and social studies} lessons.",
    "{name} joins in class discussions and shares ideas.",
    "{name} is willing to answer even when unsure, which helps {their} learning.",
    "{name} works on {their} own for a little longer each week.",
    "{name} takes care over {their} work and finishes tasks.",
    "{name} keeps trying when a task is new or hard.",
    "{name} is kind to classmates and includes others.",
    "{name} works well with a partner and takes turns fairly.",
    "{name} brings homework back on time and done with care.",
    "{name} is curious about each new topic and asks good questions.",
    "{name} is still learning our routines and is more settled each week.",
    "{name} was quiet at first and is starting to share more in small groups.",
    "{name} is adjusting well to the new expectations of this {year group|grade}.",
    "{name} has made good progress since the start of the {period}.",
    "{name} is getting more independent with each week.",
    "Next {period}, {name} will work on getting started more quickly.",
    "Next {period}, {name} will work on focusing for longer stretches.",
    "Next {period}, {name} will work on reading aloud more smoothly.",
    "Next {period}, {name} will work on adding detail to {their} writing.",
    "Next {period}, {name} will work on forming letters neatly.",
    "Next {period}, {name} will work on recalling number facts quickly.",
    "Next {period}, {name} will work on explaining {their} answers.",
    "Next {period}, {name} will work on sharing ideas more often.",
    "Next {period}, {name} will work on waiting for a turn to speak.",
    "Next {period}, {name} will work on keeping track of {their} things.",
    "Next {period}, {name} will work on asking for help early.",
    "Next {period}, {name} will work on staying calm when work is hard.",
    "Next {period}, {name} will work on checking work before handing it in.",
    "Next {period}, {name} will work with a wider range of classmates.",
    "Reading together for ten minutes a day at home would help {name}.",
    "Playing quick number games at home would help {name} learn {their} facts.",
    "A checklist for packing the school bag would help {name} stay organized.",
    "I'm looking forward to the rest of the year with {name}.",
    "Thank you for your support in these first weeks of the year.",
    "{name} has made a good start, and I look forward to the next {period}."
  ];
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = {
    us: { period: "quarter", practise: "practice", practising: "practicing", Practising: "Practicing", organized: "organized" },
    uk: { period: "term", practise: "practise", practising: "practising", Practising: "Practising", organized: "organised" }
  };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function fill(t, o) {
    var uk = o.style === "uk", w = WORDS[uk ? "uk" : "us"];
    return String(t).replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return uk ? a : b; })
      .replace(/\{(\w+)\}/g, function (m, k) {
        if (k === "name") return o.name || "[Name]";
        if (k === "their") return PRON[o.pronoun] || PRON.they;
        if (k === "period") return o.period || w.period;
        if (k in w) return w[k];
        return m;
      })
      .replace(/\b(practise|practising|Practising|organized)\b/g, function (m) { return w[m]; });
  }

  // The name opens at most two sentences running: a part that starts with the
  // name (after any "Next quarter, ") takes the pronoun when the part before
  // already names the student. "they" takes plural verbs (has -> have, and
  // any listed verb after "and", "but" or a comma in the same sentence).
  var SUBJ = { she: "she", he: "he", they: "they" };
  var PLURAL = { is: "are", has: "have", was: "were", does: "do", goes: "go", "isn't": "aren't", "hasn't": "haven't", "wasn't": "weren't", "doesn't": "don't" };
  var VERBS = /^(is|has|was|does|goes|isn't|hasn't|adds|asks|brings|checks|chooses|connects|explains|finishes|follows|includes|joins|keeps|knows|listens|organises|organizes|reads|remembers|shares|starts|takes|works|writes)$/;
  function pl(v) { return PLURAL[v] || (/(ch|sh|ss|x|zz)es$/.test(v) ? v.slice(0, -2) : /[^aeiou]ies$/.test(v) ? v.slice(0, -3) + "y" : /[^su]s$/.test(v) ? v.slice(0, -1) : v); }
  function vary(list, o) {
    var nm = String(o.name || "").trim(), prev = false;
    if (!nm || !SUBJ[o.pronoun]) return list;
    var lead = new RegExp("^([^,.]*, )?" + nm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + " ((?:(?:also|still|now|often|usually|sometimes|always) )*)([a-z']+)\\b(?!')");
    return list.map(function (p) {
      var m = prev && p.match(lead);
      if (m && (VERBS.test(m[3]) || /^(can|will|would|could|may|might|should|must)$/.test(m[3]))) {
        var v = m[3], rest = p.slice(m[0].length), cut = rest.search(/[.;:!?]/);
        if (o.pronoun === "they") {
          v = pl(v);
          if (cut < 0) cut = rest.length;
          rest = rest.slice(0, cut).replace(/((?:,? and|,? but|,? or|,) (?:also |often |usually |sometimes |still |now )?)([a-z']+)\b/g, function (x, sep, w) { return VERBS.test(w) ? sep + pl(w) : x; }) + rest.slice(cut);
        }
        p = (m[1] || "") + SUBJ[o.pronoun] + " " + m[2] + v + rest;
      }
      prev = p.indexOf(nm) >= 0;
      return p;
    });
  }

  // opts: { name, pronoun, style: us|uk, period, settle: id, strengths: [id],
  //         moment: "text", goal: id, support: "text", home: yes|no, limit }
  function build(o) {
    o = o || {};
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    var settle = find(SETTLE, o.settle);
    if (!strengths.length && !settle) return { ok: false, msg: "Pick how the student has settled in, or at least one thing that has gone well so far." };
    var issues = [], seed = hash(String(o.name || "") + (o.settle || "") + strengths.map(function (s) { return s.id; }).join() + (o.goal || ""));
    if (strengths.length > 2) { issues.push({ level: "review", msg: strengths.length + " strengths is a lot for one comment. One or two, each with a detail, say more than a list." }); strengths = strengths.slice(0, 2); }
    var goal = find(GOALS, o.goal);
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    var parts = [], idxSettle = -1, idxS2 = -1;
    if (settle) { idxSettle = parts.length; parts.push(settle.v); }
    if (strengths[0]) parts.push("{name} " + pick(strengths[0].v, seed) + ".");
    if (strengths[1]) {
      var line = pick(strengths[1].v, seed + 1);
      idxS2 = parts.length;
      parts.push("{name} " + (/^is /.test(line) ? line.replace(/^is /, "is also ") : "also " + line) + ".");
    }
    if (moment) parts.push("One highlight from our first {period}: {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    var idxSch = -1, idxHome = -1;
    if (goal) {
      parts.push("Next {period}, {name} will work on " + goal.goal + ".");
      var support = String(o.support || "").trim().replace(/[.!]+$/, "");
      idxSch = parts.length;
      parts.push("To help with this, I'll " + (support ? support.charAt(0).toLowerCase() + support.slice(1) : goal.sch) + ".");
      if (o.home !== "no") { idxHome = parts.length; parts.push("At home, you could " + goal.home + "."); }
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES, seed));
    function join() { return cap(vary(parts.filter(Boolean).map(function (p) { return fill(p, o); }), o).map(cap).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { parts[idxClose] = ""; },
      function () { if (idxHome >= 0) parts[idxHome] = ""; },
      function () { if (idxSch >= 0) parts[idxSch] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { if (idxSettle >= 0 && strengths.length) parts[idxSettle] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    var found = check(text, o);
    if (!goal && !found.some(function (i) { return /No next step/.test(i.msg); })) issues.push({ level: "review", msg: "No goal picked. The first report is the best time to set one: choose one thing to work on next time." });
    return { ok: true, text: text, chars: text.length, issues: issues.concat(found) };
  }

  var CHECKS = [
    [/\b((had|has had) an? (great|good|wonderful|fantastic|excellent|amazing|successful|super|brilliant|lovely) year|this (school )?year has been|next (school )?year|(in |for )?(the )?next (grade|year group|class)|(in|for) (grade|year) \d+ next|middle school next|over the summer|summer (break|holiday|holidays|reading|vacation)|end of (the |this )?(school )?year|over the (past |course of the )?year|throughout the year|all year( long)?|this past year|(will|i'?ll) miss (him|her|them|you))\b/i, "review", "\"$1\" reads like an end-of-year comment. On the first report, write about these first weeks and what comes next {period}."],
    [/\b((too )?early (in the year )?to (tell|say|judge|know|comment)|(hard|difficult) to (tell|say|judge) (yet|so far)|(don'?t|do not) know (him|her|them|[A-Z][a-z]+) (well )?yet|not enough (evidence|information|time) (yet )?to)\b/i, "review", "\"$1\": families read the first report closely and this tells them nothing. Say one thing you have seen so far, however small."],
    [/\b((needs to|need to|must|should) (settle down|calm down|behave|sit still|stop talking|be quiet|listen)|settle down)\b/i, "review", "\"$1\" reads as a telling-off. Name the habit and the goal instead (\"waiting for a turn to speak in group discussions\")."],
    [/\b(retain\w*|retention|held back|hold (him|her|them) back|repeat (the|this) (grade|year)|stay back a (grade|year))\b/i, "fix", "\"$1\": raise retention in a meeting with the family first, never for the first time in a report comment. Check your school's policy."],
    [/\b(lazy|naughty|disruptive|trouble ?maker|defiant|rude|disrespectful|immature|attention[- ]seek\w*|spoiled|class clown|doesn'?t care|does not care|unmotivated|careless)\b/i, "review", "\"$1\" labels the child. Describe what happens and the goal (\"getting started on tasks more quickly after instructions\")."],
    [/\b(can'?t|cannot|won'?t|refuses?( to)?|is unable to|is incapable of|never (listens|finishes|sits|tries|does)|fails to)\b/i, "review", "\"$1\" is a hard line for a family to read in the first report. Say what the student can do now and what comes next (\"is learning to...\", \"next quarter, will work on...\")."],
    [/\b(than (most|many|the other|other|some|the rest of) (children|kids|students|classmates|pupils|of the class|the class)|ahead of (the|her|his|their) (class|others|rest|classmates|peers)|(ahead of|behind) (the )?other (children|kids|students|pupils)|behind (the|her|his|their) (class|classmates|peers|others)|compared (to|with) (the class|the others|other (children|students)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|(best|top|strongest|weakest|lowest) (student|pupil|reader|writer)?\s*(in|of) (the|my|our) (class|group|year|grade)|(the )?(top|bottom) (student|pupil)|(best|top) in (the )?class)\b/i, "fix", "Comparison with other students: \"$1\". Report on this student's own work; another family may read it too."],
    [/\b(adhd|autis\w*|on the spectrum|dyslexi\w*|iep|504( plan)?|ehcp|special needs|special education|sped|diagnos\w*|medicat\w*|meds|evaluat(ed|ion) for)\b/i, "fix", "Diagnosis or support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report card."],
    [/\b(SEND|SEN)\b/, "fix", "Support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|single (mom|mum|dad|parent)|new baby|bereave\w*|social worker|foster\w*|free (school )?(lunch|meals)|(moved|moving) house|home life|at home is (hard|difficult))\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(a (joy|pleasure|delight) to (have|teach)( in (my |our |the )?(class|classroom))?|a (joy|pleasure|delight) (in class|in the classroom)|keep up the (good|great|excellent|fantastic) work|model (student|pupil)|(excellent|great|good|fantastic|wonderful) (student|pupil|learner)|superstar|shining star|always a pleasure)\b/i, "review", "\"$1\" could be about any student in any class. Say one thing only this student did in these first weeks."]
  ];
  var NOTES = [
    [/\b((below|under) (grade|year|age)[- ]level|not (yet )?(meeting|at) (grade|year)[- ]level|working towards|behind in|falling behind|is behind|at risk)\b/i, "\"$1\": in the first {period}, many standards are end-of-year goals, so \"not yet\" is often normal. If it's a real concern, say what the student can do now and the next step, and talk to the family before they read it."],
    [/\b((good|great|positive|strong|nice) start)\b/i, "\"$1\" is true of most of the class. Say what made it good (\"knows our routines and starts each morning without reminders\")."],
    [/\b(well[- ]behaved|no trouble|good as gold|no problems?|never any trouble|quiet and (polite|good))\b/i, "\"$1\" praises what the student doesn't do. Say what they do."],
    [/\b(journey|thrive[sd]?|thriving|blossom\w*|embark\w*|testament|truly|delightful|amazing|awesome|absolute(ly)?|incredible|incredibly)\b/i, "Stock phrase: \"$1\". Plain, specific words read as more sincere (and less like AI)."],
    [/\b(always|never)\b/i, "\"$1\" is rarely literally true; \"often\" or a specific example is stronger."],
    [/\b(works? hard|hard worker|tries hard|good effort|great effort)\b/i, "\"$1\" on its own is vague. Say what the hard work looks like (\"keeps trying when a task is new or hard\")."]
  ];

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    var wd = (o.style === "uk") ? WORDS.uk : WORDS.us, per = o.period || wd.period;
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: c[2].replace("$1", (m[1] || m[0]).trim()).replace("{period}", per) });
    });
    NOTES.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: "note", msg: c[1].replace("$1", (m[1] || m[0]).trim()).replace("{period}", per) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second strength or the closing line." });
    if (!/\b(next|will work on|working on|work on|goal|aim\b|target|to help with this|is learning to|learning to|focus on|at home, you could)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. The first report is the best time to set one goal, while there's most of the year left to reach it." });
    if (!/\b(read\w*|writ\w*|math\w*|scien\w*|histor\w*|geograph\w*|social studies|topic\w*|art|music|spelling|handwriting|letters|number\w*|phonics|sounds|discussion\w*|project\w*|problem\w*|routine\w*|instruction\w*|task\w*|lesson\w*|checklist\w*|group\w*|partner\w*|homework|question\w*|stor(y|ies)|book\w*|classmates|friends)\b/i.test(t)) issues.push({ level: "note", msg: "No subject, task or habit named. One concrete detail (a book, a routine, a kind of problem) is what makes a comment feel written for this student." });
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
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 32; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 32 words. Shorter sentences are easier for families reading in a second language." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { SETTLE: SETTLE, STRENGTHS: STRENGTHS, GOALS: GOALS, SHORT: SHORT, CLOSES: CLOSES, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var tGrid = document.getElementById("fq-settle"), sGrid = document.getElementById("fq-strengths"), gGrid = document.getElementById("fq-goals");
    if (!tGrid || !sGrid || !gGrid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function boxes() {
      var o = { style: val("fq-style") };
      tGrid.innerHTML = SETTLE.map(function (s) { return "<label class=\"sc-box\"><input type=\"radio\" name=\"fq-set\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("") +
        "<label class=\"sc-box\"><input type=\"radio\" name=\"fq-set\" value=\"\"> Leave this out</label>";
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      gGrid.innerHTML = GOALS.map(function (s) { return "<label class=\"sc-box\"><input type=\"radio\" name=\"fq-goal\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
    }
    boxes();
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function opts() {
      return { name: val("fq-name").trim(), pronoun: val("fq-pronoun"), style: val("fq-style"), period: val("fq-period"),
        settle: checked(tGrid)[0] || "", strengths: checked(sGrid), moment: val("fq-moment"), goal: checked(gGrid)[0] || "", support: val("fq-support"), home: val("fq-home"), limit: val("fq-limit") };
    }
    document.getElementById("fq-style").addEventListener("change", function () {
      var keep = { t: checked(tGrid), s: checked(sGrid), g: checked(gGrid) };
      boxes();
      [[tGrid, keep.t], [sGrid, keep.s], [gGrid, keep.g]].forEach(function (x) { Array.prototype.forEach.call(x[0].querySelectorAll("input"), function (i) { i.checked = x[1].indexOf(i.value) >= 0 && i.value !== ""; }); });
      document.getElementById("fq-period").value = this.value === "uk" ? "term" : "quarter";
    });
    var out = document.getElementById("fq-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"fq-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"fq-text\" rows=\"8\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"fq-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"fq-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"fq-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("fq-text");
      ta.addEventListener("input", function () { document.getElementById("fq-count").textContent = ta.value.length; });
      document.getElementById("fq-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("fq-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("fq-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("fq-count").textContent = ta.value.length; });
    }
    document.getElementById("fq-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("fq-check").addEventListener("click", function () {
      var v = val("fq-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("fq-sample").addEventListener("click", function () {
      document.getElementById("fq-name").value = "Jayden";
      document.getElementById("fq-pronoun").value = "he";
      document.getElementById("fq-moment").value = "brought in a bird's nest he found and explained how it was built";
      var pre = { steady: 1, curious: 1, listening: 1, share: 1 };
      [tGrid, sGrid, gGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = !!pre[i.value]; }); });
      document.getElementById("fq-run").click();
    });
    document.getElementById("fq-next").addEventListener("click", function () {
      ["fq-name", "fq-moment", "fq-support"].forEach(function (id) { document.getElementById(id).value = ""; });
      [tGrid, sGrid, gGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = false; }); });
      out.innerHTML = ""; document.getElementById("fq-name").focus();
    });
  });
})();
