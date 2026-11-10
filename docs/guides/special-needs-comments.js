// Report card comment builder for a student with special educational needs or
// a disability (grades K-8 / Years 1-9). Pick something going well, the skill
// the student is working on, what's helping and whether to add a home idea, and
// it writes a comment that describes what the student does now and the next
// step, without labels. The checker flags diagnosis and support-plan language,
// deficit and medical wording ("low functioning", "suffers from", "can't"),
// comparisons with classmates, backhanded praise ("despite his disability"),
// service details, missing next steps, placeholders, mixed pronouns and
// characters that break report systems. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name (or "I" / a support) as its subject, so "they"
  // only needs verb agreement where vary() swaps the name out. {a|b} = UK|US.
  var STRENGTHS = [
    { id: "effort", label: "Keeps trying", v: ["keeps trying when work is hard and is proud of each step forward", "comes to school ready to learn and works steadily through each task"] },
    { id: "kind", label: "Kind to others", v: ["is a kind friend who notices when others need help", "greets classmates warmly and is a friendly part of our class"] },
    { id: "stories", label: "Enjoys stories and books", v: ["loves listening to stories and joins in with familiar lines", "has grown in confidence as a reader this {period}"] },
    { id: "math", label: "Hands-on {maths|math}", v: ["enjoys hands-on {maths|math} and uses objects to work out problems", "counts carefully and checks {their} answers"] },
    { id: "creative", label: "Art and building", v: ["brings real imagination to art and building activities", "shows great care and detail in {their} drawings"] },
    { id: "routines", label: "Follows routines", v: ["follows our classroom routines well and knows what comes next", "settles quickly at the start of the day and gets ready to learn"] },
    { id: "communicates", label: "Communicates needs", v: ["communicates {their} needs clearly, using words, signs or pictures", "asks good questions when something is new"] },
    { id: "curious", label: "Curious and interested", v: ["is curious about how things work and loves to explore", "loves sharing facts about {their} {favourite|favorite} topics with the class"] },
    { id: "music", label: "Music and PE", v: ["joins in with real enthusiasm in music and PE", "keeps a steady beat in music and enjoys learning new songs"] },
    { id: "helpful", label: "Helpful in class", v: ["takes good care of {their} things and helps keep our classroom tidy", "notices what needs doing and offers to help"] },
    { id: "humor", label: "Sense of {humour|humor}", v: ["has a great sense of {humour|humor} that brightens our class", "brings energy and good {humour|humor} to our class discussions"] },
    { id: "uses", label: "Uses what helps", v: ["uses the tools that help {their} learning without needing a reminder", "tells an adult when {their} body needs a break, which is a real skill"] }
  ];
  // now = what the student is working on (after "is working on"), help = a
  // whole sentence on what's helping, next = base verb after "the goal is for
  // {name} to", home = base verb after "you could".
  var FOCUS = [
    { id: "decoding", label: "Reading: sounding out words", now: "reading longer words by breaking them into parts", help: "Daily practice in a small group, with books matched to {their} reading, is helping.", next: "read new words in a story with fewer stops to sound them out", home: "read together for ten minutes a day and let {name} choose the book" },
    { id: "comprehension", label: "Reading: understanding the story", now: "retelling what happened in a story in the right order", help: "Talking about the pictures before reading is helping.", next: "explain why a character did something, using a clue from the story", home: "ask {name} what happened in a story you read together, then ask why" },
    { id: "writing", label: "Writing: getting ideas down", now: "getting ideas onto paper and writing a few sentences in a row", help: "Saying the sentence out loud before writing it is helping.", next: "write a short paragraph with a beginning, a middle and an end", home: "let {name} tell you a story and write one sentence of it down together" },
    { id: "spelling", label: "Spelling and phonics", now: "spelling words with common patterns, such as -ing and -ed", help: "A short daily practice with the week's pattern is helping.", next: "use these patterns in {their} own writing as well as in spelling practice", home: "play a quick game of spotting this week's spelling pattern on signs and packets" },
    { id: "handwriting", label: "Handwriting", now: "forming letters the right size and keeping them on the line", help: "A pencil grip and paper with clear lines are helping.", next: "write a whole sentence with letters that sit on the line", home: "try activities that build hand strength, such as playdough, drawing or using tongs" },
    { id: "facts", label: "{Maths|Math}: number facts", now: "adding and subtracting within 20", help: "Using counters and a number line is helping.", next: "recall more addition facts quickly", home: "play quick number games with dice or playing cards" },
    { id: "problems", label: "{Maths|Math}: word problems", now: "understanding what a word problem is asking", help: "Drawing the problem before solving it is helping.", next: "choose the right operation for a one-step word problem independently", home: "turn everyday moments into small problems, such as sharing snacks or counting change" },
    { id: "focus", label: "Staying with a task", now: "staying with a task for longer before taking a break", help: "A visual timer and short planned breaks are helping.", next: "work for ten minutes at a time before a planned break", home: "use a timer for homework or chores, with a short break when it rings" },
    { id: "organised", label: "Getting {organised|organized}", now: "following a checklist to get ready for each lesson", help: "A picture checklist on {their} desk is helping.", next: "use the checklist with fewer reminders", home: "use a simple checklist for the morning routine" },
    { id: "speaking", label: "Sharing ideas aloud", now: "sharing ideas in a small group, using a sentence starter", help: "Time to think before answering, and talking to a partner first, are helping.", next: "share an idea with the whole class", home: "give {name} time to answer, and ask about the best part of the day" },
    { id: "askhelp", label: "Asking for help", now: "asking for help when {their} work gets tricky", help: "A help card on {their} desk is helping.", next: "try one step independently first, then ask for help", home: "praise {name} for asking when something is hard" },
    { id: "calm", label: "Managing big feelings", now: "using a calming strategy, such as slow breaths, when upset", help: "A calm corner and a plan {name} helped to choose are helping.", next: "use a calming strategy at the first sign of feeling upset", home: "practise the same calming strategy together when things are calm" },
    { id: "changes", label: "Changes in routine", now: "moving from one activity to the next", help: "A visual schedule and a warning before each change are helping.", next: "move between activities with one reminder", home: "talk through the next day's plan the evening before" },
    { id: "turns", label: "Taking turns and sharing", now: "taking turns and sharing in group activities", help: "Practising in a small group with clear roles is helping.", next: "join in with a new group at {break time|recess}", home: "play turn-taking games, such as board games, together" },
    { id: "independent", label: "Starting work independently", now: "starting tasks independently after the instructions", help: "Breaking instructions into steps, with the first step done together, is helping.", next: "start a task using a written or picture list of steps", home: "give {name} small jobs to finish without help" }
  ];
  var CLOSES = {
    early: ["{name} should feel proud of this {period}'s progress.", "I'm looking forward to seeing {name} build on this next {period}."],
    end: ["{name} should feel proud of this year's progress.", "I have enjoyed teaching {name} this year."]
  };
  // Stand-alone short comments for tight character limits and quick comment boxes.
  var SHORT = [
    "{name} keeps trying when work is hard and is proud of each step.",
    "{name} comes to school ready to learn every day.",
    "{name} is a kind friend who notices when others need help.",
    "{name} has grown in confidence as a reader this {period}.",
    "{name} enjoys stories and joins in with {their} {favourite|favorite} parts.",
    "{name} uses objects well to work out {maths|math} problems.",
    "{name} brings real imagination to art and building.",
    "{name} follows our classroom routines and knows what comes next.",
    "{name} communicates {their} needs clearly with words, signs or pictures.",
    "{name} asks for help when stuck, which is a real skill.",
    "{name} uses a calming strategy when upset, with a reminder.",
    "{name} moves between activities more calmly with a visual schedule.",
    "{name} takes turns well in small group games.",
    "{name} starts tasks independently when the steps are broken down.",
    "{name} is reading longer words by breaking them into parts.",
    "{name} can retell the main events of a story in order.",
    "{name} is writing a few sentences in a row with a sentence starter.",
    "{name} is spelling more words with this {period}'s patterns.",
    "{name} is forming letters more neatly and on the line.",
    "{name} is adding and subtracting within 20 with counters.",
    "{name} is learning to draw a word problem before solving it.",
    "{name} stays with a task for longer before taking a break.",
    "{name} uses {their} checklist to get ready for each lesson.",
    "{name} shares ideas in a small group with a sentence starter.",
    "{name} has made steady progress in reading this {period}.",
    "{name} has made steady progress in writing this {period}.",
    "{name} has made steady progress in {maths|math} this {period}.",
    "{name} has grown in independence this {period}.",
    "{name} has made real gains in confidence this {period}.",
    "{name} has worked hard on {their} goals and it shows.",
    "{name} is proud of {their} progress, and so am I.",
    "{name} joins in with real enthusiasm in music and PE.",
    "{name} is curious about how things work and loves to explore.",
    "{name} has a great sense of {humour|humor} that brightens our class.",
    "Next, {name} is working on reading with fewer stops.",
    "Next, {name} is working on writing a short paragraph.",
    "Next, {name} is working on recalling addition facts quickly.",
    "Next, {name} is working on asking for help after one try.",
    "Next, {name} is working on sharing an idea with the whole class.",
    "Next, {name} is working on starting tasks from a list of steps."
  ];
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = {
    us: { period: "quarter", practise: "practice", practising: "practicing", Practising: "Practicing" },
    uk: { period: "term", practise: "practise", practising: "practising", Practising: "Practising" }
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
      .replace(/\b(practise|practising|Practising)\b/g, function (m) { return w[m]; });
  }

  // The name opens at most two sentences running: a part that starts with the
  // name (after any "Next quarter, ") takes the pronoun when the part before
  // already names the student. "they" takes plural verbs (has -> have, and
  // any listed verb after "and", "but" or a comma in the same sentence).
  var SUBJ = { she: "she", he: "he", they: "they" };
  var PLURAL = { is: "are", has: "have", was: "were", does: "do", goes: "go", "isn't": "aren't", "hasn't": "haven't", "wasn't": "weren't", "doesn't": "don't" };
  var VERBS = /^(is|has|was|does|goes|isn't|hasn't|asks|brings|checks|comes|communicates|counts|enjoys|follows|forms|greets|helps|joins|keeps|knows|loves|moves|notices|offers|reads|settles|shares|shows|spells|starts|stays|takes|tells|tries|uses|works|writes)$/;
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


  // opts: { name, pronoun, style: us|uk, timing: early|end, period, strengths: [id],
  //         progress: "text", focus: id, support: "text", home: yes|no, limit }
  function build(o) {
    o = o || {};
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    if (!strengths.length) return { ok: false, msg: "Pick at least one thing that is going well for this student." };
    var issues = [], seed = hash(String(o.name || "") + strengths.map(function (s) { return s.id; }).join() + (o.focus || ""));
    if (strengths.length > 2) { issues.push({ level: "review", msg: strengths.length + " strengths is a lot for one comment. One or two, each with a detail, say more than a list." }); strengths = strengths.slice(0, 2); }
    var fc = find(FOCUS, o.focus), end = o.timing === "end";
    var progress = String(o.progress || "").trim().replace(/[.!]+$/, "");
    var parts = ["{name} " + pick(strengths[0].v, seed) + "."], idxS2 = -1;
    if (strengths[1]) {
      var line = pick(strengths[1].v, seed + 1);
      idxS2 = parts.length;
      parts.push("{name} " + (/^is /.test(line) ? line.replace(/^is /, "is also ") : "also " + line) + ".");
    }
    if (progress) parts.push("Since the start of the " + (end ? "year" : "{period}") + ", {name} " + progress.charAt(0).toLowerCase() + progress.slice(1) + ".");
    var idxHelp = -1, idxHome = -1;
    if (fc) {
      parts.push("{name} is working on " + fc.now + ".");
      var support = String(o.support || "").trim().replace(/[.!]+$/, "");
      idxHelp = parts.length;
      parts.push(support ? cap(support) + (/ and |, /.test(support) ? " are" : " is") + " helping." : fc.help);
      parts.push((end ? "Next year, " : "Next {period}, ") + "the goal is for {name} to " + fc.next + ".");
      if (o.home !== "no") { idxHome = parts.length; parts.push("At home, you could " + fc.home + "."); }
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[end ? "end" : "early"], seed));
    function join() { return cap(vary(parts.filter(Boolean).map(function (p) { return fill(p, o); }), o).map(cap).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { parts[idxClose] = ""; },
      function () { if (idxHome >= 0) parts[idxHome] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { if (idxHelp >= 0) parts[idxHelp] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    var found = check(text, o);
    if (!fc && !found.some(function (i) { return /No next step/.test(i.msg); })) issues.push({ level: "review", msg: "No skill to work on picked. Families look for what comes next: choose one." });
    return { ok: true, text: text, chars: text.length, issues: issues.concat(found) };
  }

  var POLICY = "Unless your school's policy says otherwise, keep it out of the report card. Describe what the student does and what helps; plan goals go in the IEP progress report.";
  var CHECKS = [
    [/\b(adhd|autis\w*|asperger\w*|on the spectrum|dyslexi\w*|dyspraxi\w*|dyscalculi\w*|dysgraphi\w*|down'?s syndrome|cerebral palsy|epilep\w*|tourette\w*|global (developmental )?delay|developmental delay|learning disabilit\w*|learning difficult\w*|intellectual disabilit\w*|disabilit\w*|disabled|disorder|diagnos\w*|medicat\w*|meds|special needs|special education|special ed|sped)\b/i, "fix", "Diagnosis or label: \"$1\". " + POLICY],
    [/\b(ADD|ASD|ODD|OCD|SPD|SLD|EBD|SEMH|SEND|SEN|LD|SpLD|MLD|PMLD)\b/, "fix", "Diagnosis or support-need code: \"$1\". " + POLICY],
    [/\b(IEP|504( plan)?|EHCP|EHC plan|IEP goals?|behaviou?r plan|BIP|IHP)\b/i, "review", "Support plan named: \"$1\". Many schools keep plans out of the report card and report on plan goals in the plan's own progress report. Check your school's policy."],
    [/\b(speech (and language )?therap\w*|occupational therap\w*|physical therap\w*|physiotherap\w*|therapist|counsel(l)?(ing|or)|psycholog\w*|paraprofessional|para\b|1:1 aide|one-to-one aide|aide|TA support|resource room|pull[- ]out|SENCO|SENDCo)\b/i, "review", "Service or staffing detail: \"$1\". Many schools leave services out of the report card. Describe the support in plain words (\"practice in a small group\") or check your policy."],
    [/\b(than (most|many|the other|other|some|the rest of) (children|kids|students|classmates|pupils|of the class|the class)|(typical|typically developing|regular|normal|other) (peers|children|kids|students|classmates|pupils)|(behind|ahead of) (the|her|his|their) (class|others|rest|classmates|peers)|compared (to|with) (the class|the others|other (children|students)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|(lowest|weakest|slowest) (student|pupil|reader|in the class))\b/i, "fix", "Comparison with other students: \"$1\". Report on this student's own progress; another family may read it too."],
    [/\b((high|low)[- ]functioning|low[- ]ability|low (kid|student|child|pupil|achiever|IQ)|slow learner|(is|very|a bit|quite|so) (slow|low)\b|retard\w*|handicap\w*|mentally|suffers? (from|with)|afflicted|stricken|victim of|(confined to|bound to) a wheelchair|wheelchair[- ]bound|in (his|her|their) own world|lazy|unmotivated|attention[- ]seeking|naughty|defiant|meltdowns?|tantrums?|outbursts?|(a )?(special needs|SEN|sped|IEP) (student|kid|child|pupil))\b/i, "fix", "\"$1\" labels the child or reads as a medical or deficit description. Say what the student does now and what helps."],
    [/\b(can'?t|cannot|unable to|is not able to|isn'?t able to|won'?t|refuses?( to)?|doesn'?t (even )?try|does not (even )?try|will not)\b/i, "review", "\"$1\" says what the student doesn't do. Say what they can do now and the next step (\"is working on …\", \"can … with a reminder\")."],
    [/\b(despite (his|her|their|the) (disabilit\w*|challenges|difficulties|needs|diagnosis|condition|struggles)|considering (his|her|their) (disabilit\w*|challenges|difficulties|needs|diagnosis)|for (a|someone|a child|a student) (with|like) (him|her|them|his|her|their)|(an )?inspiration|inspiring|so brave|brave little)\b/i, "review", "\"$1\" makes the comment about the need, not the learning, and can read as patronising. Say what the student did."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|single (mom|mum|dad|parent)|new baby|bereave\w*|social worker|foster\w*|free (school )?(lunch|meals)|home life|at home things)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(a (joy|pleasure|delight) to (have|teach)( in (my |our |the )?(class|classroom))?|keep up the (good|great|excellent|fantastic) work|(such )?a (sweet|lovely|little) (boy|girl|angel|one)|little angel|ray of sunshine|always smiling)\b/i, "review", "\"$1\" could be about any student and says nothing about learning. Say one thing this student did this {period}."]
  ];
  var NOTES = [
    [/\b(below grade level|below (the )?expected (level|standard)|not (at|meeting) grade level|working towards|far behind|behind in)\b/i, "\"$1\": if your report has a level or grade box, that already says it. Use the comment for what the student can do now and the next step."],
    [/\b(journey|thrive[sd]?|thriving|blossom\w*|embark\w*|testament|truly|delightful|amazing|awesome|absolute(ly)?|incredible|incredibly)\b/i, "Stock phrase: \"$1\". Plain, specific words read as more sincere (and less like AI)."],
    [/\b(always|never)\b/i, "\"$1\" is rarely literally true; \"often\" or a specific example is stronger."],
    [/\b(works? hard|hard worker|tries hard|good effort|great effort)\b/i, "\"$1\" on its own is vague. Say what the effort looks like (\"keeps trying when a word is tricky\")."]
  ];

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    var wd = (o.style === "uk") ? WORDS.uk : WORDS.us;
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: c[2].replace("$1", (m[1] || m[0]).trim()).replace("{period}", o.period || wd.period) });
    });
    NOTES.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: "note", msg: c[1].replace("$1", (m[1] || m[0]).trim()) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second strength or the closing line." });
    if (!/\b(next|working on|working toward|work on|the goal|goal is|ready to|learning to|is practi[cs]ing|target|aim\b)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one specific skill the student is working on next, so the family knows what comes next." });
    if (!/\b(help\w*|support\w*|small group|practi[cs]e\w*|timer|checklist|schedule|reminder|partner|sentence starter|counters|number line|visual|break|calm corner|plan\b|grip|steps|tools?)\b/i.test(t)) issues.push({ level: "note", msg: "Nothing on what's helping. One line on what works in class (\"a visual timer and short breaks are helping\") tells the family what to try too." });
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
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 25; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 25 words. Short sentences are easier to read and to translate." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { STRENGTHS: STRENGTHS, FOCUS: FOCUS, SHORT: SHORT, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("sn-strengths"), nGrid = document.getElementById("sn-focus-grid");
    if (!sGrid || !nGrid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function boxes() {
      var o = { style: val("sn-style") };
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      nGrid.innerHTML = FOCUS.map(function (s) { return "<label class=\"sc-box\"><input type=\"radio\" name=\"sn-focus\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
    }
    boxes();
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function opts() {
      return { name: val("sn-name").trim(), pronoun: val("sn-pronoun"), style: val("sn-style"), timing: val("sn-timing"), period: val("sn-period"),
        strengths: checked(sGrid), progress: val("sn-progress"), focus: checked(nGrid)[0] || "", support: val("sn-support"), home: val("sn-home"), limit: val("sn-limit") };
    }
    document.getElementById("sn-style").addEventListener("change", function () {
      var keep = { s: checked(sGrid), n: checked(nGrid) };
      boxes();
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = keep.s.indexOf(i.value) >= 0; });
      Array.prototype.forEach.call(nGrid.querySelectorAll("input"), function (i) { i.checked = keep.n.indexOf(i.value) >= 0; });
      document.getElementById("sn-period").value = this.value === "uk" ? "term" : "quarter";
    });
    var out = document.getElementById("sn-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"sn-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"sn-text\" rows=\"8\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"sn-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"sn-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"sn-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("sn-text");
      ta.addEventListener("input", function () { document.getElementById("sn-count").textContent = ta.value.length; });
      document.getElementById("sn-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("sn-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("sn-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("sn-count").textContent = ta.value.length; });
    }
    document.getElementById("sn-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("sn-check").addEventListener("click", function () {
      var v = val("sn-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("sn-sample").addEventListener("click", function () {
      document.getElementById("sn-name").value = "Leo";
      document.getElementById("sn-pronoun").value = "he";
      document.getElementById("sn-progress").value = "has learned all of the letter sounds";
      var pre = { effort: 1, kind: 1, decoding: 1 };
      [sGrid, nGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = !!pre[i.value]; }); });
      document.getElementById("sn-run").click();
    });
    document.getElementById("sn-next").addEventListener("click", function () {
      ["sn-name", "sn-progress", "sn-support"].forEach(function (id) { document.getElementById(id).value = ""; });
      [sGrid, nGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = false; }); });
      out.innerHTML = ""; document.getElementById("sn-name").focus();
    });
  });
})();
