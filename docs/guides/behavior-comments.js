// Behavior and work habits report card comment builder and checker.
// Pick a grade band and a level for the habits you want to mention (strength,
// on track, next step), add one moment you noticed, and it writes a comment in
// the strength, next step, home tip pattern. The checker flags labels
// ("disruptive", "lazy", "defiant"), verdicts ("bad attitude", "poor
// behavior"), incidents and sanctions (detentions, clip charts, office
// referrals), diagnosis and support-plan words, guesses at feelings, "won't"
// and "refuses", comparisons, family details, jargon (executive function,
// PBIS, off-task), stock phrases ("good as gold", "a pleasure to have"),
// "always" / "never", placeholders, mixed pronouns, spelling for the wrong
// country, curly quotes and missing next steps or home tips. Runs in the
// browser and in node (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Bands: k2 = grades K-2 (UK Years 1-3), 35 = grades 3-5 (Years 4-6),
  // 68 = grades 6-8 (Years 7-9). Any field can be a value or { band: value }.
  // group: w = work habits, s = behavior and getting on with others.
  // ls = the Ontario learning skill it reports under (Growing Success, 2010).
  // s = strengths and g = on track (3rd person verb phrases), f = next step
  // (noun phrase), sch = how school works on it, home = one home activity.
  // Text is written in UK spelling; fill() converts it for US and Canada.
  var BANDS = { k2: "Grades K–2", "35": "Grades 3–5", "68": "Grades 6–8" };
  var BANDS_UK = { k2: "Years 1–3", "35": "Years 4–6", "68": "Years 7–9" };
  var BANDS_CA = { k2: "Grades 1–2", "35": "Grades 3–5", "68": "Grades 6–8" };
  // Australia: Foundation is the year before Year 1, so Year N lines up with
  // US grade N. Style "au" keeps UK spelling and reports by semester.
  var BANDS_AU = { k2: "Foundation–Year 2", "35": "Years 3–5", "68": "Years 6–8" };
  var GROUPS = { w: "Work habits", s: "Behaviour and getting on with others" };
  var LS = { r: "Responsibility", o: "Organisation", iw: "Independent work", c: "Collaboration", i: "Initiative", sr: "Self-regulation" };
  var AREAS = [
    { id: "listening", group: "w", ls: "iw", bands: ["k2", "35", "68"], label: "Listening and following directions",
      s: { k2: ["listens carefully and follows directions the first time", "listens closely to instructions and gets started straight away"],
           "35": ["listens carefully and follows directions the first time", "listens closely to instructions and gets started straight away"],
           "68": ["follows multi-step instructions accurately and checks the task sheet before asking", "listens closely to instructions and gets started straight away"] },
      g: ["follows most directions and is learning to listen to the whole instruction before starting", "listens well in small groups and is learning to do the same in whole-class lessons"],
      f: "listening to the whole instruction before starting a task", sch: { k2: "by repeating instructions back to a partner", "35": "by repeating instructions back to a partner", "68": "by checking the steps on the board before starting" },
      home: { k2: "give {name} two-step jobs at home, such as \"shoes away, then wash your hands\", and praise finishing both", "35": "give {name} two- or three-step jobs at home and praise finishing all of them", "68": "ask {name} to talk you through the steps of a homework task before starting" } },
    { id: "focus", group: "w", ls: "iw", bands: ["k2", "35", "68"], label: "Staying on task",
      s: ["stays focused on {their} work and uses class time well", "settles to work quickly and keeps going until the task is finished"],
      g: ["uses most class time well and is learning to get back to work after a distraction", "settles to work quickly and is building the stamina to keep going for longer"],
      f: "staying focused for the whole of independent work time", sch: "with short goals and a quick check-in partway through",
      home: "set a timer for short bursts of homework or reading, with a quick break in between" },
    { id: "independence", group: "w", ls: "iw", bands: ["k2", "35", "68"], label: "Working independently",
      s: ["works independently and tries things on {their} own before asking for help", "tackles new tasks on {their} own with confidence"],
      g: ["works independently on familiar tasks and is learning to try new ones before asking for help", "is becoming more independent and is learning to use the help available in the classroom"],
      f: "trying a task on {their} own first, then asking for help with a specific question", sch: "with a short list of things to try when stuck",
      home: "before helping with homework, ask {name} \"what have you tried so far?\"" },
    { id: "organisation", group: "w", ls: "o", bands: ["k2", "35", "68"], label: "Organisation",
      s: { k2: ["keeps {their} things tidy and knows where everything belongs", "gets ready for each activity quickly and keeps {their} things tidy"],
           "35": ["keeps {their} materials organised and plans {their} time well", "keeps track of what is due and has everything ready for each lesson"],
           "68": ["plans longer tasks carefully and keeps track of deadlines", "keeps {their} materials organised and manages {their} time well across subjects"] },
      g: { k2: ["is learning to keep {their} things tidy and ready for the next activity", "gets ready for most activities quickly and is learning to put things back where they belong"],
           "35": ["is learning to keep {their} materials organised and to plan {their} time", "keeps track of most tasks and is learning to plan longer pieces of work"],
           "68": ["keeps track of most deadlines and is learning to plan longer projects in stages", "is learning to use a planner to manage work across subjects"] },
      f: { k2: "keeping {their} things tidy and ready for the next activity", "35": "keeping {their} desk and folders organised", "68": "using a planner to keep track of homework and deadlines" },
      sch: { k2: "with picture checklists", "35": "with a quick tidy-up routine at the end of each day", "68": "with a weekly planner check" },
      home: { k2: "let {name} pack {their} own school bag the night before, with a picture checklist", "35": "help {name} pack {their} bag the night before, using a short checklist", "68": "look at {name}'s planner together once a week and talk about what's coming up" } },
    { id: "deadlines", group: "w", ls: "r", bands: ["35", "68"], label: "Completing work on time",
      s: ["completes and hands in work on time, including homework", "takes responsibility for {their} work and meets deadlines"],
      g: ["hands in most work on time and is learning to keep track of deadlines", "completes class work and is building a routine for homework"],
      f: "handing in homework and assignments on time", sch: { "35": "with a homework checklist", "68": "with reminders on the class page and a weekly planner check" },
      home: "agree a regular time and place for homework, and check it's packed the night before" },
    { id: "effort", group: "w", ls: "sr", bands: ["k2", "35", "68"], label: "Effort and perseverance",
      s: ["keeps trying when work is hard and learns from mistakes", "puts real effort into every task and sees challenging work through"],
      g: ["puts good effort into most tasks and is learning to keep going when work is hard", "is building resilience and is learning to see mistakes as part of learning"],
      f: "sticking with a task when it gets hard, using a strategy before asking for help", sch: "with a list of \"what to try when I'm stuck\" ideas",
      home: "praise the effort, not just the result: \"you kept going even when it was tricky\"" },
    { id: "participation", group: "w", ls: "i", bands: ["k2", "35", "68"], label: "Taking part in lessons",
      s: ["takes an active part in lessons and shares thoughtful ideas", "asks great questions and is keen to try new things"],
      g: ["joins in discussions and is growing in confidence when sharing ideas", "takes part in lessons and is starting to share ideas with the whole class"],
      f: "sharing {their} ideas in class discussions", sch: "with talk partners first, then the whole class",
      home: "ask {name} to teach you one thing from school each week" },
    { id: "care", group: "w", ls: "r", bands: ["k2", "35", "68"], label: "Taking care with work",
      s: ["takes pride in {their} work and checks it carefully", "presents {their} work carefully and fixes {their} own mistakes"],
      g: ["takes care with most work and is learning to check it before handing it in", "is learning to slow down and check {their} work on longer tasks"],
      f: "checking {their} work before handing it in", sch: "with a short checklist for each task",
      home: "ask {name} to show you a favourite piece of work and talk about how it was made" },
    { id: "goals", group: "w", ls: "sr", bands: ["35", "68"], label: "Setting goals and asking for help",
      s: ["sets {their} own goals and checks {their} progress towards them", "knows when to ask for help and asks clear questions"],
      g: ["is learning to set a goal for {their} work and to check how it's going", "asks for help when stuck and is learning to say exactly what the problem is"],
      f: "setting a small goal each week and checking progress", sch: "with weekly goal-setting in class",
      home: "ask {name} what {their} goal is this week and how it's going" },
    { id: "kindness", group: "s", ls: "c", bands: ["k2", "35", "68"], label: "Kindness and respect",
      s: ["is kind and respectful to everyone in the class", "notices when others need help and offers it without being asked"],
      g: { k2: ["is friendly with classmates and is learning to include others in games", "uses kind words most of the time and is learning to use them when frustrated too"],
           "35": ["is friendly with classmates and is learning to include others in games and group work", "speaks respectfully to others and is learning to keep it up when frustrated"],
           "68": ["is respectful to classmates and is learning to include others in group work", "speaks respectfully to others and is learning to keep a calm tone when frustrated"] },
      f: "using kind words and including others", sch: "through our class agreements and regular class meetings",
      home: "talk about a time someone was kind at school, and how it felt" },
    { id: "teamwork", group: "s", ls: "c", bands: ["k2", "35", "68"], label: "Working with others",
      s: ["works well in a group, listening to others and sharing the work fairly", "is a thoughtful partner who helps the group reach a decision"],
      g: ["works well with a partner and is learning to share roles in a bigger group", "contributes to group work and is learning to listen to ideas that differ from {their} own"],
      f: "taking turns and sharing the work fairly in a group", sch: "with clear group roles",
      home: "play board games or cook together, taking turns and sharing the jobs" },
    { id: "feelings", group: "s", ls: "sr", bands: ["k2", "35", "68"], label: "Managing feelings",
      s: ["manages {their} feelings well and calms down quickly after a setback", "stays calm when things don't go to plan and talks through problems"],
      g: ["is learning to name {their} feelings and to use a calming strategy when upset", "is getting better at calming down after a disappointment and talks to an adult when needed"],
      f: "using a calming strategy, such as taking a few deep breaths, before reacting", sch: { k2: "with a calm-down corner and a feelings chart", "35": "with a calm-down space and a short reset routine", "68": "with time to reset and a quiet chat afterwards" },
      home: "name feelings together (\"you seem frustrated\") and practise one calming strategy when things are calm" },
    { id: "routines", group: "s", ls: "r", bands: ["k2", "35", "68"], label: "Following class routines",
      s: { k2: ["follows class routines without reminders", "moves between activities calmly and quickly"],
           "35": ["follows class routines and expectations without reminders", "moves between activities calmly and quickly"],
           "68": ["follows school expectations and arrives at lessons ready to learn", "manages {their} own behaviour well across lessons and around school"] },
      g: { k2: ["follows most routines and is learning to manage changes between activities", "follows class expectations and needs fewer reminders each week"],
           "35": ["follows most routines and is learning to settle quickly after breaks", "follows class expectations and needs fewer reminders each week"],
           "68": ["follows most expectations and is learning to arrive at lessons ready to start", "follows school expectations and needs fewer reminders each week"] },
      f: { k2: "moving between activities calmly", "35": "following class expectations without reminders", "68": "arriving at lessons on time and ready to start" },
      sch: { k2: "with a visual timetable and countdowns", "35": "with clear routines and quiet reminders", "68": "with a quick start-of-lesson routine" },
      home: { k2: "give a five-minute warning before changing activities, such as before bath time", "35": "keep a regular morning and bedtime routine on school nights", "68": "keep a regular morning and bedtime routine on school nights" } },
    { id: "turns", group: "s", ls: "sr", bands: ["k2", "35", "68"], label: "Speaking at the right time",
      s: ["waits {their} turn to speak and listens while others talk", "contributes at the right moments and listens respectfully to others"],
      g: ["puts {their} hand up to share ideas and is learning to wait while others are speaking", "is learning to hold on to an idea until it's {their} turn to speak"],
      f: "waiting for {their} turn to speak in class discussions", sch: "with talk partners and a signal for when it's time to share",
      home: "practise taking turns to talk at mealtimes, letting each person finish" },
    { id: "disagreements", group: "s", ls: "c", bands: ["k2", "35", "68"], label: "Sorting out disagreements",
      s: ["sorts out disagreements calmly and fairly", "listens to both sides and helps friends find a fair solution"],
      g: ["is learning to sort out small disagreements with words and to ask an adult when needed", "resolves most disagreements calmly and is learning to see the other person's point of view"],
      f: "using words to sort out disagreements and asking an adult when needed", sch: "with a simple problem-solving routine",
      home: "when siblings or friends disagree, ask {name} \"what could we do so it's fair for both?\"" },
    { id: "leading", group: "s", ls: "i", bands: ["k2", "35", "68"], label: "Helping and leading",
      s: ["takes on classroom jobs willingly and sets a great example", "shows leadership by helping others and suggesting ideas"],
      g: ["enjoys classroom jobs and is learning to take the lead in small groups", "helps others when asked and is starting to offer without being asked"],
      f: "taking the lead in a small group", sch: "with classroom jobs and group roles",
      home: "give {name} a regular family job, such as setting the table, and thank {them} for it" }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(listens|follows|gets|settles|stays|uses|is|works|tries|tackles|keeps|plans|completes|hands|takes|puts|asks|joins|presents|fixes|notices|offers|speaks|manages|moves|waits|contributes|sorts|shows|enjoys|helps|sets|knows|has|learns|sees|checks|calms|talks|needs|meets|resolves|arrives)$/;
  var OPENINGS = {
    kind: ["{name} is a kind, thoughtful member of our class.", "{name} brings kindness and a positive attitude to our class every day."],
    hardworking: ["{name} works hard and approaches each day with a positive attitude.", "{name} has a steady, hard-working approach to school."],
    helpful: ["{name} is a helpful member of our class who is quick to lend a hand.", "{name} is quick to help classmates and adults alike."],
    enthusiastic: ["{name} comes to school ready to learn and brings real enthusiasm to lessons.", "{name} is enthusiastic about learning and keen to take part."],
    calm: ["{name} is a calm, settled member of our class.", "{name} has settled well and is a steady presence in our class."],
    growing: ["{name} has grown in confidence and independence this {period}.", "It has been great to see {name} become more independent this {period}."],
    none: [""]
  };
  var OPENINGS_END = {
    growing: ["{name} has grown in confidence and independence this year.", "It has been great to see {name} become more independent this year."],
    hardworking: ["{name} has worked hard all year and built strong learning habits.", "{name} has made real progress with {their} learning habits this year."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home.", "Please get in touch if you'd like to talk about how {name} is getting on."],
    end: ["Thank you for your support this year.", "I have enjoyed teaching {name} this year."]
  };
  var PRON = { she: { their: "her", them: "her" }, he: { their: "his", them: "him" }, they: { their: "their", them: "them" } };
  // US: -ize and -or. Canada (Ontario): -ize, but behaviour, favourite and practise stay.
  var US = { practise: "practice", practised: "practiced", practising: "practicing", behaviour: "behavior", behaviours: "behaviors", Behaviour: "Behavior",
    organise: "organize", organised: "organized", organising: "organizing", organisation: "organization", Organisation: "Organization",
    recognise: "recognize", recognises: "recognizes", favourite: "favorite", colour: "color", apologise: "apologize", realise: "realize", prioritise: "prioritize" };
  var CA = { organise: "organize", organised: "organized", organising: "organizing", organisation: "organization", Organisation: "Organization",
    recognise: "recognize", recognises: "recognizes", apologise: "apologize", realise: "realize", prioritise: "prioritize" };
  function mapRe(m) { return new RegExp("(^|[^\\w-])(" + Object.keys(m).sort(function (a, b) { return b.length - a.length; }).join("|") + ")(?![\\w-])", "g"); }
  var US_RE = mapRe(US), CA_RE = mapRe(CA);

  function bt(v, band) { return v && typeof v === "object" && !Array.isArray(v) ? v[band] : v; }
  function plural(vp) {
    return vp.replace(/(^|, and |, | and )([a-z]+)/g, function (m, sep, w) {
      if (!VERBS.test(w)) return m;
      if (w === "is") w = "are";
      else if (w === "has") w = "have";
      else if (/(ch|sh|x|ss|zz)es$/.test(w)) w = w.slice(0, -2);
      else if (/ies$/.test(w)) w = w.slice(0, -3) + "y";
      else if (/[^s]s$/.test(w)) w = w.slice(0, -1);
      return sep + w;
    });
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function area(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i]; return null; }
  function areasFor(band) { return AREAS.filter(function (a) { return a.bands.indexOf(band) >= 0; }); }

  function fill(t, o) {
    var st = o.style, p = PRON[o.pronoun] || PRON.they;
    t = t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "period") return o.period || (st === "au" ? "semester" : st === "uk" || st === "ca" ? "term" : "quarter");
      return m;
    });
    if (st === "ca") t = t.replace(CA_RE, function (m, pre, w) { return pre + CA[w]; });
    else if (st !== "uk" && st !== "au") t = t.replace(US_RE, function (m, pre, w) { return pre + US[w]; });
    // Australia: the end-of-year report goes home before the summer holidays.
    if (st === "au") t = t.replace(/\bOver the summer\b/g, "Over the summer holidays");
    return t;
  }
  function bandNames(o) { return o.style === "au" ? BANDS_AU : o.style === "uk" ? BANDS_UK : o.style === "ca" ? BANDS_CA : BANDS; }

  // opts: { name, pronoun, style: us|uk|ca|au, band: k2|35|68, timing: early|end,
  //         period, opening, moment, limit, levels: { areaId: "s"|"g"|"f" } }
  function build(o) {
    o = o || {};
    var band = BANDS[o.band] ? o.band : "35";
    var levels = o.levels || {}, seed = hash(String(o.name || "") + (o.moment || ""));
    var list = areasFor(band), strong = [], growing = [], focus = [];
    list.forEach(function (a) {
      if (levels[a.id] === "s") strong.push(a); else if (levels[a.id] === "g") growing.push(a); else if (levels[a.id] === "f") focus.push(a);
    });
    var issues = [], total = strong.length + growing.length + focus.length;
    if (!total) return { ok: false, msg: "Pick a level for at least one habit." };
    if (total > 4) issues.push({ level: "review", msg: "That's " + total + " habits. A comment reads best with two or three; the ratings or tick boxes cover the rest." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family (and a child) to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the student does well, even a small thing, or add a moment you noticed. It matters most when the next step is about behaviour." });
    var parts = [];
    var open = (o.timing === "end" && OPENINGS_END[o.opening || "hardworking"]) || OPENINGS[o.opening] || OPENINGS.hardworking;
    var idxOpen = -1, idxFew = -1;
    if (o.opening !== "none") { idxOpen = parts.length; parts.push(pick(open, seed)); }
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) parts.push("I was impressed when {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    var n = 0, SUBJ = { she: "she", he: "he", they: "they" };
    function sentence(vp, tail) {
      var pron = SUBJ[o.pronoun] && n % 2 === 1;
      n++;
      if (pron && o.pronoun === "they") vp = plural(vp);
      return cap((pron ? SUBJ[o.pronoun] : "{name}") + " " + vp + (tail || "") + ".");
    }
    var onTrack = 0;
    list.forEach(function (a, i) { if (levels[a.id] === "s") parts.push(sentence(pick(bt(a.s, band), seed + i))); });
    list.forEach(function (a, i) {
      if (levels[a.id] === "g") parts.push(sentence(pick(bt(a.g, band), seed + i), (o.timing !== "end" && !onTrack++) ? ", which is right on track for this point in the year" : ""));
    });
    var home = null;
    if (focus.length) {
      var f0 = bt(focus[0].f, band);
      parts.push(o.timing === "end" ? "A good focus for next year is " + f0 + "." : "Our next step is " + f0 + ", which we're practising " + bt(focus[0].sch, band) + ".");
      if (focus[1]) parts.push((o.timing === "end" ? "It would also help to keep working on " : "We're also working on ") + bt(focus[1].f, band) + ".");
      home = focus[0];
    } else if (growing.length) {
      parts.push((o.timing === "end" ? "Next year, {name} will keep building on " : "Next, we'll keep building on ") + bt(growing[0].f, band) + ".");
      home = growing[0];
    } else if (o.timing === "end") {
      parts.push("Over the summer, a regular routine and a family job or two will keep these habits going.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a strong student's comment usually names one thing to aim for next, such as taking the lead in a group or setting {their} own goals." });
    }
    if (home) {
      parts.push((o.timing === "end" ? "Over the summer, you could " : "At home, you could ") + bt(home.home, band) + ".");
      idxFew = parts.length; parts.push(o.timing === "end" ? "Small, regular routines make a real difference." : "Working on it together at home and at school makes a real difference.");
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return fill(p, o); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxFew >= 0) parts[idxFew] = ""; },
      function () { parts[idxClose] = ""; },
      function () { if (idxOpen >= 0 && (moment || strong.length)) parts[idxOpen] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    issues = issues.map(function (i) { return { level: i.level, msg: fill(i.msg, o) }; });
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(lazy|naughty|disruptive|defiant|rude|disrespectful|insolent|trouble ?maker|bully|bullies|bullying|aggressive|violent|manipulative|spoilt|spoiled|brat|wild|feral|out of control|unmotivated|immature|sneaky|liar|lying|lies to|sloppy|(bad|naughty|problem|difficult) (kid|child|boy|girl|student|pupil)|a handful|mean (to|kid|girl|boy))\b/i, "fix", "Label: \"$1\". Describe what happens and what helps (e.g. \"sometimes calls out during discussions; a signal for when it's time to share is helping\")."],
    [/\b(class clown|attention[- ]seek\w*|hyper(active)?|bossy|chatterbox|motormouth|social butterfly|chatty|talkative|talks too much)\b/i, "review", "\"$1\" is a label families remember. Say when it happens and the next step (\"is learning to wait until it's time to share ideas\")."],
    [/\b((bad|poor|terrible|unacceptable|appalling|challenging|negative|disruptive|inappropriate) (behaviou?rs?|attitude|conduct|choices|manners)|attitude problem|behaviou?r (is|has been) (bad|poor|a problem|an issue|a concern|unacceptable)|behaviou?r problems?|behaviou?r issues?)\b/i, "review", "\"$1\" is a verdict, and families can't act on it. Say what happens, when, and what's in place (\"finds it hard to wait for a turn in group games; we're practising with a timer\")."],
    [/\b(detentions?|suspen(ded|sion)|exclu(ded|sions?)|expelled|sent to the (office|principal|head\w*)|office referrals?|referrals?|write[- ]?ups?|written up|time[- ]?outs?|(lost|lose|loses|missed|misses) (recess|playtime|break|golden time)|isolation|clip chart|behaviou?r charts?|colou?r charts?|(red|yellow|orange|amber) (card|zone|light)|on (red|amber)|moved (his|her|their) clip|incidents?|punish\w*|consequences?|sanctions?|reflection room|in-school suspension)\b/i, "review", "\"$1\": incidents and sanctions belong in a conversation with the family and your school's records, not the report. Say what the student is learning to do instead."],
    [/\b(adhd|autis\w*|asd|oppositional|sensory processing|spd|anxiety disorder|depress\w*|trauma\w*|medication|medicated|meds|iep|504( plan)?|ehcp|special needs|behaviou?r (support |intervention )?plan|bip|fba|needs (to be )?(tested|assessed|evaluated|diagnosed)|diagnos\w*|therap\w*|psycholog\w*|counsel+(or|ing))\b/i, "fix", "Diagnosis, medication, therapy or support-plan language: \"$1\". Unless your school's policy says otherwise, raise it with the family in person and keep it out of the general comment."],
    [/\b(SENCO|SEND|SEN|ODD)\b/, "fix", "Support-plan language: \"$1\". Raise it with the family in person and keep it out of the general comment."],
    [/\b(doesn'?t care|does not care|couldn'?t care less|hates school|hates \w+|dislikes school|angry (child|boy|girl|kid)|anger (issues|problems)|temper|tantrums?|meltdowns?|melts down|lashes out|explosive|anxious|anxiety|panics?|sulks?|sulking|moody)\b/i, "review", "\"$1\" is a guess at a feeling or reads as a label. Describe what you see (\"finds it hard to settle after lunch\") and what's helping (\"a quiet job when we come in is helping\")."],
    [/\b(can'?t sit still|cannot sit still|won'?t|refuses( to)?|refused( to)?|doesn'?t listen|does not listen|can'?t|cannot|unable to|doesn'?t (even )?try|does not try)\b/i, "review", "\"$1\" puts the problem first. Try \"is learning to\" or \"is working on\", and say what helps."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is learning to\" or \"is working on\" sounds more hopeful to families."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true and is hard to hear, especially about how a child behaves. Say \"often\" or \"sometimes\", or describe a specific moment."],
    [/\b(than (most|many|the other|other|some|all the other) (of the )?(children|kids|students|pupils|classmates|boys|girls)|compared (to|with) (the class|the others|other (children|students|pupils)|classmates|(his|her|their) (friends|classmates|peers|brother|sister|siblings?))|the rest of the class|most of the class|(best|worst)[- ]behaved|(best|worst) in the class|top of the class|like (his|her|their) (brother|sister|siblings?)|(his|her|their) (brother|sister) (was|is) )/i, "fix", "Comparison: \"$1\". Report this student's own progress; comparisons with classmates or siblings stick."],
    [/\b((like|just like) (his|her|their) (mom|mum|dad|father|mother|parents)|divorc\w*|custody|separated|split up|single (mom|mum|dad|parent)|social (worker|services)|foster\w*|free (school )?(lunch|meals)|things at home|home life|at home (is|are|has been) (difficult|hard|chaotic|unsettled|tough)|goes to bed (too )?late|too much screen time|tired all the time)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report; talk to the family if it matters."],
    [/\b(good as gold|quiet as a mouse|well[- ]behaved|no trouble|never any trouble|a pleasure to (have|teach)|a joy to (have|teach)|delightful|a delight|model student|angel|little ray of sunshine|ray of sunshine|journey|thrives?|thriving|blossom\w*|testament|truly|shines?|superstar|sweetheart)\b/i, "note", "Stock phrase: \"$1\". Families see it on every report (and it reads as AI-written). A specific habit or moment says more."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(should (really )?(be able to|know|have learned|have learnt) .{0,30}by now|by now|at (his|her|their) age|old enough to|in (grade|year) \d+ (he|she|they) should)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."],
    [/\b(sel|social[- ]emotional learning|executive function\w*|dysregulat\w*|co-?regulat\w*|zones of regulation|pbis|restorative (conversation|practice|justice)s?|tier [123]|mtss|rti|on[- ]task behaviou?rs?|off[- ]task|task avoidan\w*|work avoidan\w*|sensory (breaks?|seeking|needs)|antecedents?|replacement behaviou?rs?|lswh|learning skills and work habits)\b/i, "review", "Jargon: \"$1\". Many families won't know it; say what the student does (\"gets started on work straight away\", \"uses a calm-down space when upset\")."]
  ];
  var US_SPELL = /\b(behavior\w*|favorite|colors?|organiz\w+|recogniz\w+|apologiz\w+|practic(ing|ed))\b/i;
  var UK_SPELL = /\b(behaviours?|favourite|colours?|organis\w+|recognis\w+|apologis\w+|practis\w+)\b/i;
  var CA_US = /\b(behavior\w*|favorite|colors?|practic(ing|ed))\b/i;
  var CA_UK = /\b(organis\w+|recognis\w+|apologis\w+)\b/i;
  // Australia: US school words, and the curriculum or program names behind
  // behaviour reporting (Personal and Social Capability, PBL) that families won't know.
  var AU_US = /\b((first|second|third|fourth|fifth|sixth|seventh|eighth) grade|kindergartners?|kindergarteners?|this quarter|marking period|middle school|report card|summer vacation|mom)\b/i;
  var AU_JARGON = /\b(personal and social capability|general capabilit(y|ies)|learning continuum|VC2?[A-Z]{2,5}\d\w*|AC9\w*|positive behaviou?r for learning|PBL|SWPBS|PBS|achievement standards?|content descriptions?|early stage 1|stage [1-3])(?![\w-])/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m && o.style === "ca" && /^(self[- ]regulation|learning skills and work habits)$/i.test(m[1])) return;
      if (m) issues.push({ level: c[1], msg: c[2].replace("$1", m[1] || m[0]) });
    });
    var needs = (t.match(/\bneeds to\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\" appears " + needs + " times. Pick the one that matters most and say how school is helping." });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop a habit or the opening sentence." });
    if (!/\b(next|working on|work on|focus|goal|keep (practi[cs]ing|building|working)|aim|learning to|is learning|will keep|moving on)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one thing the student is working on next, so the family knows where to help." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family|mealtimes?|bedtime)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific routine is the part families act on most." });
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another student's, check the pronouns." });
    if (o.name) {
      var nm = String(o.name).trim();
      if (nm && t.indexOf(nm) < 0) issues.push({ level: "review", msg: "The student's name (\"" + nm + "\") isn't in the comment. Was it written for someone else?" });
      if (/\s/.test(nm)) issues.push({ level: "note", msg: "Use the first name only in the comment, the way you'd talk to the family." });
    }
    var sp;
    if (o.style === "uk" && (sp = t.match(US_SPELL))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is US spelling in a UK report. Families notice." });
    if (o.style === "au" && (sp = t.match(US_SPELL) || t.match(AU_US))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is US wording. Australian families expect Year 3 (not third grade), term or semester, and Australian spelling (behaviour, organised, practising)." });
    if (o.style === "au" && (sp = t.match(AU_JARGON))) issues.push({ level: "review", msg: "Jargon: \"" + sp[1] + "\". Families won't know it; say what the student does (\"waits for a turn and listens to others' ideas\")." });
    if (o.style === "us" && (sp = t.match(UK_SPELL))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is UK spelling in a US report. Families notice." });
    if (o.style === "ca" && (sp = t.match(CA_US) || t.match(CA_UK))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" isn't the usual Canadian spelling (behaviour, favourite, organize, recognize)." });
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

  var api = { AREAS: AREAS, BANDS: BANDS, BANDS_UK: BANDS_UK, BANDS_CA: BANDS_CA, BANDS_AU: BANDS_AU, bandNames: bandNames, GROUPS: GROUPS, LS: LS, areasFor: areasFor, bt: bt, plural: plural, build: build, check: check, plain: plain, fill: fill, area: area };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("bh-skills");
    if (!grid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    // Ontario (style "ca") groups the habits under the six learning skills.
    function draw() {
      var keep = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) keep[s.getAttribute("data-area")] = s.value; });
      var band = val("bh-band") || "35", o = { style: val("bh-style") }, html = "";
      var groups = o.style === "ca" ? LS : GROUPS, key = o.style === "ca" ? "ls" : "group";
      Object.keys(groups).forEach(function (g) {
        var inner = "";
        areasFor(band).forEach(function (a) {
          if (a[key] !== g) return;
          inner += "<label>" + esc(fill(bt(a.label, band), o)) + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">Strength</option><option value=\"g\">On track</option><option value=\"f\">Next step</option></select></label>";
        });
        if (inner) html += "<fieldset><legend>" + esc(fill(groups[g], o)) + "</legend><div class=\"grid\">" + inner + "</div></fieldset>";
      });
      grid.innerHTML = html;
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (keep[s.getAttribute("data-area")]) s.value = keep[s.getAttribute("data-area")]; });
      var bs = document.getElementById("bh-band"), names = bandNames(o);
      Array.prototype.forEach.call(bs.options, function (op) { op.textContent = names[op.value]; });
    }
    draw();
    document.getElementById("bh-band").addEventListener("change", draw);
    document.getElementById("bh-style").addEventListener("change", function () {
      var per = document.getElementById("bh-period"), st = val("bh-style");
      if (per && per.tagName === "SELECT") per.value = st === "au" ? "semester" : st === "uk" || st === "ca" ? "term" : "quarter";
      draw();
    });
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      return { name: val("bh-name").trim(), pronoun: val("bh-pronoun"), style: val("bh-style"), band: val("bh-band"), timing: val("bh-timing"), period: val("bh-period"), opening: val("bh-opening"), moment: val("bh-moment"), limit: val("bh-limit"), levels: levels };
    }
    var out = document.getElementById("bh-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"bh-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"bh-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"bh-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"bh-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"bh-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("bh-text");
      ta.addEventListener("input", function () { document.getElementById("bh-count").textContent = ta.value.length; });
      document.getElementById("bh-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("bh-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("bh-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("bh-count").textContent = ta.value.length; });
    }
    document.getElementById("bh-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("bh-check").addEventListener("click", function () {
      var v = val("bh-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("bh-sample").addEventListener("click", function () {
      document.getElementById("bh-name").value = "Leo";
      document.getElementById("bh-pronoun").value = "he";
      document.getElementById("bh-band").value = "35";
      draw();
      document.getElementById("bh-opening").value = "helpful";
      document.getElementById("bh-moment").value = "noticed a new classmate on his own at recess and invited him to join the game";
      var pre = { kindness: "s", deadlines: "g", turns: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("bh-run").click();
    });
    document.getElementById("bh-next").addEventListener("click", function () {
      ["bh-name", "bh-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("bh-name").focus();
    });
  });
})();
