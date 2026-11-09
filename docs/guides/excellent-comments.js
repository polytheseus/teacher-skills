// Report card comment builder for an excellent or high-achieving student
// (grades 1-8 / Years 2-9). Pick one or two strengths, add a real moment, and
// choose the next challenge, and it writes a comment that says what the student
// actually does and what comes next. The checker flags stock praise ("a pleasure
// to have in class", "keep up the good work"), fixed-ability labels ("gifted",
// "bright"), comparisons with classmates, "nothing to improve", the student as
// unpaid classroom helper, missing next steps, placeholders, mixed pronouns and
// characters that break report systems. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name (or "I" / "we") as its subject, so "they"
  // only needs verb agreement where vary() swaps the name out. {a|b} = UK|US.
  var STRENGTHS = [
    { id: "reading", label: "Reading", v: ["reads widely and can explain why an author made a particular choice", "backs up {their} ideas about a text with evidence from the page"] },
    { id: "writing", label: "Writing", v: ["writes with a clear voice and chooses words on purpose", "revises {their} writing carefully, and each draft is stronger than the last"] },
    { id: "math", label: "{Maths|Math}", v: ["explains {their} reasoning clearly and can often solve a problem in more than one way", "spots patterns and uses them to solve new kinds of problems"] },
    { id: "science", label: "Science", v: ["plans fair tests and draws conclusions from the evidence", "asks questions that can be tested and records results carefully"] },
    { id: "humanities", label: "{History and geography|Social studies}", v: ["connects events to their causes and uses sources to support an argument", "compares different viewpoints and explains why people saw events differently"] },
    { id: "discussion", label: "Class discussions", v: ["listens closely in discussions and builds on what others say", "asks the questions that move our class discussions forward"] },
    { id: "speaking", label: "Speaking and presenting", v: ["speaks clearly to the class and {organises|organizes} ideas so they are easy to follow", "presents with confidence and answers questions thoughtfully"] },
    { id: "independent", label: "Works independently", v: ["starts tasks without prompting and manages {their} time well", "plans longer projects in stages and meets deadlines"] },
    { id: "persist", label: "Sticks with hard problems", v: ["sticks with a hard problem and tries a new approach when the first one doesn't work", "treats mistakes as useful information and corrects them carefully"] },
    { id: "accuracy", label: "Careful, accurate work", v: ["takes care over accuracy and checks {their} work before handing it in", "presents work so clearly that {their} thinking is easy to follow"] },
    { id: "creative", label: "Original ideas", v: ["brings original ideas to {their} projects and follows them through", "takes creative risks and is willing to try an unusual approach"] },
    { id: "curious", label: "Curious beyond the lesson", v: ["asks thoughtful questions and looks things up to learn more", "follows up lessons with {their} own reading and brings new ideas to class"] },
    { id: "leads", label: "Leads group work well", v: ["leads group work by making sure every voice is heard", "shares jobs fairly in group work and keeps the group on track"] },
    { id: "kind", label: "Kind and respectful", v: ["notices when a classmate needs help and offers it kindly", "sets a respectful tone in our classroom and treats everyone fairly"] }
  ];
  // ready = what comes next (base verb after "is ready to"), sch = what the
  // teacher will do (after "I'll "), home = base verb after "you could".
  var STRETCH = [
    { id: "readdeep", label: "Reading: harder texts, compare authors", ready: "read more challenging texts and compare how different authors handle the same idea", sch: "offer book choices a step up and ask for evidence in written responses", home: "ask {name} to recommend a book and explain what the author did well" },
    { id: "writeforms", label: "Writing: new forms, more risks", ready: "try new forms of writing and experiment with structure and voice", sch: "set writing tasks with a wider choice of form and audience", home: "read an article or review together and talk about how it was put together" },
    { id: "mathwhy", label: "{Maths|Math}: multi-step, explain why", ready: "tackle multi-step problems and explain why a method works as well as how to use it", sch: "add problems with more than one route and ask for written explanations", home: "ask {name} to explain a tricky problem as if teaching it to you" },
    { id: "mathmake", label: "{Maths|Math}: test and create problems", ready: "create {their} own problems and test whether a method works in every case", sch: "set open problems that have no single answer", home: "look for {maths|math} in everyday life, such as comparing prices or planning a journey" },
    { id: "investigate", label: "Science: own investigation", ready: "design an investigation from a question of {their} own", sch: "make time for a small independent investigation", home: "try a simple kitchen experiment and predict what will happen first" },
    { id: "research", label: "Research a question of their own", ready: "take on a longer research project on a question of {their} own choosing", sch: "work with {name} to narrow the question and find reliable sources", home: "visit the library together and follow up one thing {name} wants to know more about" },
    { id: "depth", label: "Go deeper, not faster", ready: "go deeper when work is finished early, adding reasoning, detail or a second solution", sch: "have an extension task ready that asks for depth as well as speed", home: "ask \"how do you know?\" and \"is there another way?\" about something {name} has finished" },
    { id: "feedback", label: "Use feedback on strong work", ready: "use feedback to make strong work even better", sch: "give one specific target on each longer piece of work", home: "ask {name} which piece of work is strongest and what would make it better" },
    { id: "risk", label: "Try things that might not work", ready: "take on challenges where success isn't guaranteed and see a first attempt as a starting point", sch: "set some tasks that are meant to take more than one try", home: "talk about something you found hard and how you kept going" },
    { id: "voice", label: "Share ideas more often", ready: "share {their} ideas more often in whole-class discussions", sch: "give advance notice of some questions and invite {name} to go first", home: "ask {name} what {their} opinion is on something in the news or a book" },
    { id: "listen", label: "Draw others into discussions", ready: "draw classmates into discussions by asking questions as well as giving answers", sch: "use roles in discussions so that everyone has a turn to lead", home: "take turns {round|around} the table, with each person asking the next a question" },
    { id: "lead", label: "Lead a project", ready: "lead a group project, including sharing out the jobs and the credit", sch: "offer a chance to lead a small team on our next project", home: "let {name} plan and run something at home, such as a meal or a family outing" },
    { id: "plan", label: "Plan and set own deadlines", ready: "plan longer projects independently and set {their} own deadlines", sch: "step back on the next project and check in at the halfway point", home: "use a calendar together to break one big job into smaller steps" },
    { id: "explain", label: "Explain thinking in more detail", ready: "write down the reasoning behind {their} answers as well as the answers themselves", sch: "ask for a short explanation alongside the answer", home: "ask {name} to talk you through how a piece of homework was done" }
  ];
  var CLOSES = {
    early: ["{name} should feel proud of this {period}'s work.", "I'm looking forward to seeing what {name} does next {period}."],
    end: ["{name} should feel proud of this year's work.", "I have enjoyed teaching {name} this year and look forward to hearing what comes next."]
  };
  // Stand-alone short comments for tight character limits and quick comment boxes.
  var SHORT = [
    "{name} explains {their} thinking clearly and listens well to others.",
    "{name} reads widely and talks thoughtfully about books.",
    "{name} writes with real care and revises each draft.",
    "{name} solves problems in more than one way and explains each one.",
    "{name} backs up every answer with clear reasoning.",
    "{name} asks excellent questions that help the whole class think.",
    "{name} plans {their} work well and meets every deadline.",
    "{name} checks {their} work carefully and fixes {their} own mistakes.",
    "{name} sticks with hard problems and tries new approaches.",
    "{name} starts work promptly and stays focused to the end.",
    "{name} brings original ideas and follows them through.",
    "{name} takes creative risks and learns from each attempt.",
    "{name} leads group work fairly and listens to every voice.",
    "{name} is kind to classmates and respectful to everyone.",
    "{name} uses feedback well and each piece of work improves.",
    "{name} learns new ideas quickly and applies them with care.",
    "{name} uses evidence well in written and spoken work.",
    "{name} speaks clearly and confidently in front of the class.",
    "{name} follows {their} curiosity well beyond the lesson.",
    "{name} shows strong understanding across every subject this {period}.",
    "{name} has made excellent progress in reading this {period}.",
    "{name} has made excellent progress in writing this {period}.",
    "{name} has made excellent progress in {maths|math} this {period}.",
    "{name} has mastered this {period}'s {maths|math} and explains it well.",
    "{name} applies {maths|math} skills confidently to new problems.",
    "{name} writes clear, well-{organised|organized} paragraphs with strong detail.",
    "{name} reads fluently and understands complex texts.",
    "{name} draws sensible conclusions from science investigations.",
    "{name} connects new learning to earlier lessons.",
    "{name} contributes thoughtful ideas to every class discussion.",
    "{name} works well alone and as part of a team.",
    "{name} takes responsibility for {their} own learning.",
    "{name} sets high standards and works steadily to meet them.",
    "{name} prepares thoroughly and comes to class ready to learn.",
    "{name} keeps going calmly when work gets difficult.",
    "{name} takes pride in {their} work and it shows.",
    "{name} helps set a positive, focused tone in our class.",
    "{name} shares ideas generously and credits others.",
    "{name} is ready for more challenging texts next {period}.",
    "{name} is ready for multi-step problems next {period}.",
    "{name} is ready to lead a group project next {period}.",
    "{name} is ready to design {their} own investigation next {period}.",
    "{name} is ready to take on a longer research project.",
    "{name} is ready to try harder problems with more than one route.",
    "{name} is ready to explain {their} reasoning in more detail.",
    "{name} is ready to experiment with new forms of writing.",
    "{name} is ready to share ideas more often in discussions.",
    "{name} is ready to go deeper when work is finished early.",
    "{name} has had an outstanding {period}: focused, thoughtful and curious.",
    "{name} has had an excellent {period} and is ready for greater depth."
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
  var VERBS = /^(is|has|was|does|goes|isn't|hasn't|applies|asks|backs|brings|builds|checks|chooses|compares|connects|contributes|corrects|creates|draws|explains|follows|helps|keeps|leads|learns|listens|looks|makes|manages|meets|notices|offers|organises|organizes|plans|prepares|presents|reads|records|revises|sets|shares|shows|solves|speaks|spots|starts|stays|sticks|takes|tries|treats|uses|wants|works|writes)$/;
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
  //         moment: "text", stretch: id, support: "text", home: yes|no, limit }
  function build(o) {
    o = o || {};
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    if (!strengths.length) return { ok: false, msg: "Pick at least one thing this student really does well." };
    var issues = [], seed = hash(String(o.name || "") + strengths.map(function (s) { return s.id; }).join() + (o.stretch || ""));
    if (strengths.length > 2) { issues.push({ level: "review", msg: strengths.length + " strengths is a lot for one comment. One or two, each with a detail, say more than a list." }); strengths = strengths.slice(0, 2); }
    var st = find(STRETCH, o.stretch), end = o.timing === "end";
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    var parts = ["{name} " + pick(strengths[0].v, seed) + "."], idxS2 = -1;
    if (strengths[1]) {
      var line = pick(strengths[1].v, seed + 1);
      idxS2 = parts.length;
      parts.push("{name} " + (/^is /.test(line) ? line.replace(/^is /, "is also ") : "also " + line) + ".");
    }
    if (moment) parts.push("One highlight this " + (end ? "year" : "{period}") + ": {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    var idxNext = -1, idxSch = -1, idxHome = -1;
    if (st) {
      idxNext = parts.length;
      parts.push((end ? "Next year, " : "Next {period}, ") + "{name} is ready to " + st.ready + ".");
      var support = String(o.support || "").trim().replace(/[.!]+$/, "");
      if (support) { idxSch = parts.length; parts.push("To help with this, I'll " + support.charAt(0).toLowerCase() + support.slice(1) + "."); }
      else if (!end) { idxSch = parts.length; parts.push("To help with this, I'll " + st.sch + "."); }
      if (o.home !== "no") { idxHome = parts.length; parts.push("At home, you could " + st.home + "."); }
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[end ? "end" : "early"], seed));
    function join() { return cap(vary(parts.filter(Boolean).map(function (p) { return fill(p, o); }), o).map(cap).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { parts[idxClose] = ""; },
      function () { if (idxHome >= 0) parts[idxHome] = ""; },
      function () { if (idxSch >= 0) parts[idxSch] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    var found = check(text, o);
    if (!st && !found.some(function (i) { return /No next step/.test(i.msg); })) issues.push({ level: "review", msg: "No next step picked. High achievers and their families look for this first: choose one challenge for next time." });
    return { ok: true, text: text, chars: text.length, issues: issues.concat(found) };
  }

  var CHECKS = [
    [/\b(than (most|many|the other|other|some|the rest of) (children|kids|students|classmates|pupils|of the class|the class)|ahead of (the|her|his|their) (class|others|rest|classmates|peers)|compared (to|with) (the class|the others|other (children|students)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|(best|top|strongest|brightest|highest) (student|pupil|reader|writer|mathematician|learner)?\s*(in|of) (the|my|our) (class|group|year|grade)|(the )?top (student|pupil)|(best|top) in (the )?class|(best|smartest|brightest) (student|pupil|kid|child))\b/i, "fix", "Comparison with other students: \"$1\". Report on this student's own work; another family may read it too."],
    [/\b(adhd|autis\w*|on the spectrum|dyslexi\w*|iep|gifted iep|504( plan)?|ehcp|special needs|special education|sped|diagnos\w*|medicat\w*|meds)\b/i, "fix", "Diagnosis or support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report card."],
    [/\b(SEND|SEN)\b/, "fix", "Support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|single (mom|mum|dad|parent)|new baby|bereave\w*|social worker|foster\w*|free (school )?(lunch|meals))\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(gifted|genius|prodigy|brilliant|(very |so |extremely |really )?bright(?! (idea|future|spot|start))|(very |so |extremely |really )?smart|(very |so )?clever|(very |so |naturally )?talented|naturally able|a natural\b|natural talent|born (leader|mathematician|writer|reader))\b/i, "review", "\"$1\" praises what the student is, not what they did. Name what they do (\"explains reasoning clearly\", \"sticks with hard problems\"), which also holds up on the day something is hard. If your school uses \"gifted\" as a program name, follow its rule."],
    [/\b(a (joy|pleasure|delight) to (have|teach)( in (my |our |the )?(class|classroom))?|a (joy|pleasure|delight) (in class|in the classroom)|keep up the (good|great|excellent|fantastic) work|model (student|pupil)|role model|(excellent|great|good|fantastic|wonderful|outstanding) (student|pupil|learner)|superstar|shining star|star pupil|excels? (in|at) (everything|all( areas| subjects)?)|is excelling|continues? to excel|continues? to shine|always a pleasure)\b/i, "review", "\"$1\" could be about any student in any class. Say one thing only this student did this {period}."],
    [/\b(nothing to improve|no areas? (for|of) improvement|(can'?t|cannot) (be )?improve\w*|(can'?t|cannot) think of anything|needs no improvement|no next steps?|does everything (right|perfectly)|perfect in every|perfect (student|pupil|child)|flawless|never makes mistakes|is perfect\b)/i, "review", "\"$1\" leaves nothing to work on. Strong students and their families want the next challenge, and \"perfect\" is a hard thing to live up to."],
    [/\b((great|huge|real|enormous|so much|tremendous) potential|has potential|will go far|future (leader|doctor|scientist|president)|(destined|sure|bound) (for|to) (great|succeed|be)|the sky'?s the limit|could do (so much )?better|capable of (much |so much )?more)\b/i, "review", "\"$1\" talks about the future instead of the work. Name what the student does now and the next step."],
    [/\b(is bored|gets bored|seems bored|bored in class|not challenged|isn'?t challenged|under[- ]?challenged|needs to be challenged more)\b/i, "review", "\"$1\" guesses at a feeling or reads as a criticism of the classroom. Say what you're adding (\"an extension task that asks for depth\")."],
    [/\b(helps? (other|the other|weaker|struggling|slower|less able) (students|children|kids|classmates|pupils)[^.]*finish|helps? (the )?(weaker|struggling|slower|less able)|teach(es)? the (others|class)|my (little )?(helper|assistant)|(class|classroom|teacher'?s) (helper|assistant|pet)|finishes first|first to finish|(weaker|slower|less able) (students|children|classmates|pupils))\b/i, "review", "\"$1\" makes the student sound like a spare assistant, and calls classmates weaker in writing. Helping can be a real strength; describe how kindly or clearly they explain, and give them their own next challenge too."]
  ];
  var NOTES = [
    [/\b(straight a'?s|all a'?s|100\s?%|perfect (score|grades|marks)|(good|high|great|excellent|top) (grades|marks|scores)|a\+ student)\b/i, "\"$1\": the grade is already on the report. Use the comment to say what produced it."],
    [/\b(well[- ]behaved|no trouble|good as gold|no problems?|never any trouble|quiet and (polite|good))\b/i, "\"$1\" praises what the student doesn't do. Say what they do."],
    [/\b(journey|thrive[sd]?|thriving|blossom\w*|embark\w*|testament|truly|delightful|amazing|awesome|absolute(ly)?|incredible|incredibly)\b/i, "Stock phrase: \"$1\". Plain, specific words read as more sincere (and less like AI)."],
    [/\b(always|never)\b/i, "\"$1\" is rarely literally true; \"often\" or a specific example is stronger."],
    [/\b(works? hard|hard worker|tries hard|good effort|great effort)\b/i, "\"$1\" on its own is vague. Say what the hard work looks like (\"plans longer projects in stages\")."]
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
    if (!/\b(next|ready to|working on|work on|challenge|goal|aim\b|target|to help with this|step up|go deeper|greater depth|extension)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. High achievers and their families look for this first: name one specific challenge for next time." });
    if (!/\b(read\w*|writ\w*|math\w*|scien\w*|histor\w*|geograph\w*|social studies|art|music|spelling|grammar|discussion\w*|project\w*|problem\w*|evidence|reasoning|investigation\w*|experiment\w*|presentation\w*|research|essay\w*|poem\w*|stor(y|ies)|book\w*|draft\w*|group|team|question\w*|feedback|deadline\w*)\b/i.test(t)) issues.push({ level: "note", msg: "No subject, task or skill named. One concrete detail (a project, a book, a kind of problem) is what makes a comment feel written for this student." });
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

  var api = { STRENGTHS: STRENGTHS, STRETCH: STRETCH, SHORT: SHORT, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("ec-strengths"), nGrid = document.getElementById("ec-stretch");
    if (!sGrid || !nGrid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function boxes() {
      var o = { style: val("ec-style") };
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      nGrid.innerHTML = STRETCH.map(function (s) { return "<label class=\"sc-box\"><input type=\"radio\" name=\"ec-next\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
    }
    boxes();
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function opts() {
      return { name: val("ec-name").trim(), pronoun: val("ec-pronoun"), style: val("ec-style"), timing: val("ec-timing"), period: val("ec-period"),
        strengths: checked(sGrid), moment: val("ec-moment"), stretch: checked(nGrid)[0] || "", support: val("ec-support"), home: val("ec-home"), limit: val("ec-limit") };
    }
    document.getElementById("ec-style").addEventListener("change", function () {
      var keep = { s: checked(sGrid), n: checked(nGrid) };
      boxes();
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = keep.s.indexOf(i.value) >= 0; });
      Array.prototype.forEach.call(nGrid.querySelectorAll("input"), function (i) { i.checked = keep.n.indexOf(i.value) >= 0; });
      document.getElementById("ec-period").value = this.value === "uk" ? "term" : "quarter";
    });
    var out = document.getElementById("ec-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"ec-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"ec-text\" rows=\"8\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"ec-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"ec-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"ec-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("ec-text");
      ta.addEventListener("input", function () { document.getElementById("ec-count").textContent = ta.value.length; });
      document.getElementById("ec-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("ec-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("ec-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("ec-count").textContent = ta.value.length; });
    }
    document.getElementById("ec-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("ec-check").addEventListener("click", function () {
      var v = val("ec-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("ec-sample").addEventListener("click", function () {
      document.getElementById("ec-name").value = "Maya";
      document.getElementById("ec-pronoun").value = "she";
      document.getElementById("ec-moment").value = "built a model of a food web and explained what happens when one link goes";
      var pre = { science: 1, curious: 1, investigate: 1 };
      [sGrid, nGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = !!pre[i.value]; }); });
      document.getElementById("ec-run").click();
    });
    document.getElementById("ec-next").addEventListener("click", function () {
      ["ec-name", "ec-moment", "ec-support"].forEach(function (id) { document.getElementById(id).value = ""; });
      [sGrid, nGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = false; }); });
      out.innerHTML = ""; document.getElementById("ec-name").focus();
    });
  });
})();
