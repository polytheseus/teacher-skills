// Report card comment builder for a student who is struggling (grades 1-8 /
// Years 2-9). Pick one or two strengths, the area that's hard right now, how
// serious it is and what school is already doing, and it writes an honest,
// kind comment: strength first, the concern in observable words, the support
// in place, one home tip and an invitation to talk. The checker flags labels
// ("lazy", "unmotivated", "chatty"), verdicts and "potential" lines, demands
// piled up with "needs to", comparisons, diagnosis or support-plan words,
// family details, placeholders, mixed pronouns and characters that break
// report systems. Runs in the browser and in node (module.exports) for tests.
// Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name (or "we" / "I") as its subject, so "they"
  // never needs verb agreement. {a|b} = UK|US wording.
  var STRENGTHS = [
    { id: "kind", label: "Kind to classmates", s: "is a kind classmate who notices when others need help" },
    { id: "tries", label: "Keeps trying when it's hard", s: "keeps trying when work is difficult, which is one of the most useful habits a learner can have" },
    { id: "asks", label: "Asks for help", s: "is getting better at asking for help when something doesn't make sense" },
    { id: "ideas", label: "Great ideas in discussions", s: "brings thoughtful ideas to our class discussions" },
    { id: "creative", label: "Creative", s: "has a creative imagination that shows in {their} stories, drawings and projects" },
    { id: "helpful", label: "Helpful in class", s: "is quick to help, whether that's handing out books or showing a new student around" },
    { id: "listens", label: "Good listener", s: "listens carefully to others and responds respectfully" },
    { id: "curious", label: "Curious, asks questions", s: "asks great questions and is curious about how things work" },
    { id: "practical", label: "Hands-on learner", s: "comes alive in hands-on work, such as experiments, building and practical tasks" },
    { id: "pe", label: "Enthusiastic in PE", s: "brings real energy and enthusiasm to PE" },
    { id: "oral", label: "Explains ideas well out loud", s: "explains {their} thinking clearly when talking it through" },
    { id: "friend", label: "Good friend, works well in a team", s: "works well in a team and is a loyal friend" },
    { id: "positive", label: "Positive attitude", s: "comes into class with a positive attitude and a smile" },
    { id: "improved", label: "Has improved (say how below)", s: "" }
  ];
  // c = the concern in observable words (verb phrase after the name),
  // goal = next step (noun phrase), sch = what school is doing, home = a home
  // tip (base verb after "you could"), big = extra line for "needs extra support",
  // drill = add "a few minutes most days" after the home tip.
  var AREAS = [
    { id: "reading", drill: true, label: "Reading: fluency and decoding",
      c: ["is still building {their} reading fluency and finds longer texts hard to read independently", "is working hard at reading but still finds longer words tricky to read accurately"],
      goal: "reading aloud more smoothly and breaking longer words into parts", sch: "in a small reading group several times a week",
      home: "read together for ten minutes most days, taking turns page by page", big: "{name} is reading below the level we'd expect at this point in the year, so this support is a priority." },
    { id: "comprehension", drill: true, label: "Reading: understanding what they read",
      c: ["reads the words accurately but finds it hard to explain what a text was about", "is still learning to pick out the main idea and the important details in a text"],
      goal: "stopping to check understanding and retelling the main idea in a sentence or two", sch: "with short retell questions in guided reading",
      home: "ask {name} to tell you what happened in each chapter in a sentence or two", big: "Understanding what {name} reads is affecting work in other subjects too, so this is our main focus." },
    { id: "writing", drill: true, label: "Writing",
      c: ["has good ideas but finds it hard to get them down on paper in full sentences", "is finding longer pieces of writing difficult and often stops after a few lines"],
      goal: "planning ideas before writing and writing in complete sentences", sch: "with planning frames and sentence starters",
      home: "let {name} say a sentence out loud before writing it, for cards, lists or a diary", big: "Writing is the area where {name} needs the most support right now." },
    { id: "spelling", label: "Spelling and handwriting",
      c: ["is still learning many common spellings, which can make {their} writing hard to read", "is working on letter formation and spacing, and handwriting can slow {their} writing down"],
      goal: "learning a few key spellings each week and forming letters clearly", sch: "with short daily spelling and handwriting practice",
      home: "practise this week's spellings for five minutes a day, writing each word and checking it", big: "" },
    { id: "facts", label: "{Maths|Math}: number facts",
      c: ["is still building quick recall of {maths|math} facts, which slows down work on longer problems", "knows some {maths|math} facts but often counts on fingers for the rest"],
      goal: "learning {their} number facts by heart", sch: "with short daily fact practice and games",
      home: "practise a few facts for five minutes a day, with a game, flashcards or an app the school recommends", big: "" },
    { id: "problems", drill: true, label: "{Maths|Math}: problem solving",
      c: ["finds word problems tricky and isn't yet sure which operation to use", "can follow a method with help but finds it hard to solve problems independently"],
      goal: "reading a problem twice and drawing a picture or model before solving it", sch: "with worked examples in a small group",
      home: "ask {name} to explain how a homework question was solved, step by step", big: "{name} is not yet working at the level we'd expect in {maths|math}, so this support is a priority." },
    { id: "focus", label: "Focus and attention",
      c: ["finds it hard to stay focused during longer independent tasks and sometimes misses instructions", "is easily distracted during independent work, so tasks are often left unfinished"],
      goal: "staying on task for 15 minutes at a time", sch: "by breaking tasks into short chunks with a quick check-in after each one",
      home: "use a timer for homework: 15 minutes of work, a short break, then 15 more", big: "" },
    { id: "talking", label: "Talking or calling out in class",
      c: ["often chats with classmates during lessons, which means instructions are sometimes missed", "is enthusiastic to share ideas, but often calls out rather than waiting for a turn"],
      goal: "choosing the right times to talk and share ideas", sch: "with a quiet signal we agreed together and plenty of chances to talk with a partner",
      home: "talk about when chatting is great and when it's time to listen", big: "" },
    { id: "work", label: "Missing or unfinished work",
      c: ["has several assignments missing this {period}, and this is affecting {their} grades", "often leaves classwork unfinished or doesn't hand in homework on time"],
      goal: "handing in every assignment on time", sch: "with a weekly checklist of what's due, which we go through together on Mondays",
      home: "check the planner or class page together each evening and agree a regular homework time", big: "The missing work is now the main thing holding {their} grades back, so catching up on it is the first priority." },
    { id: "organisation", label: "{Organisation|Organization}",
      c: ["often arrives without the materials needed and finds it hard to keep track of papers", "finds it hard to keep {their} work and belongings {organised|organized}, so things are often lost"],
      goal: "keeping a tidy folder and packing {their} bag the night before", sch: "with a simple folder system and an end-of-day checklist",
      home: "pack the school bag together the night before", big: "" },
    { id: "confidence", label: "Confidence",
      c: ["often doubts {their} own ability and is reluctant to share answers or try harder problems", "is quiet in class and rarely joins in with discussions, even when sure of the answer"],
      goal: "having a go at challenging work and sharing ideas in class", sch: "with chances to share with a partner first and praise for effort and good strategies",
      home: "praise effort and strategies (\"you kept going\") as well as results", big: "" },
    { id: "selfcontrol", label: "Managing frustration and {behaviour}",
      c: ["sometimes finds it hard to manage {their} reactions when frustrated, especially in games and group work", "sometimes finds it hard to stay calm when things don't go to plan, particularly at {break time|recess} and lunch"],
      goal: "using a calm-down strategy and words to solve problems", sch: "with a plan we made together and regular check-ins",
      home: "talk through what helps {name} calm down, and notice it out loud when it happens", big: "" },
    { id: "effort", label: "Effort and motivation",
      c: ["isn't yet putting full effort into independent work, and the finished work doesn't yet show what I know is possible", "often rushes work to finish quickly, which leads to avoidable mistakes"],
      goal: "taking pride in finished work and checking it before handing it in", sch: "with clear success criteria and a quick check before work is handed in",
      home: "ask {name} to show you one piece of work each week and talk about what went well", big: "" },
    { id: "groups", label: "Working with others",
      c: ["is still learning to work well in a group and to accept other people's ideas", "prefers to work alone and finds it hard to share tasks in group projects"],
      goal: "taking turns, listening and sharing jobs in group work", sch: "with group roles and practice at disagreeing kindly",
      home: "play board games together, which are great practice at taking turns and losing well", big: "" },
    { id: "attendance", label: "Attendance or lateness",
      c: ["has missed a number of school days this {period}, and catching up on missed lessons is making new work harder", "often arrives late, which means missing the start of our morning lessons"],
      goal: "catching up on the lessons missed", sch: "with missed work shared on our class page and short catch-up sessions",
      homeFull: "If anything is making mornings or school difficult, please let me know so we can help.", big: "" }
  ];
  var CONTACT = {
    mild: "Please get in touch if you have any questions.",
    big: "I'd like to meet with you to talk about how we can support {name} together; please get in touch to arrange a time.",
    met: "Thank you for talking this through with me; I'll keep you updated on how the plan is going."
  };
  var CLOSES = {
    early: ["With steady practice, I'm confident {name} will keep making progress next {period}.", "{name} has the qualities to do well, and I'm looking forward to seeing the progress next {period}."],
    end: ["With a little practice over the summer, {name} will be ready for a strong start next year.", "I have enjoyed teaching {name} this year, and I know the progress made will carry into next year."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = {
    us: { period: "quarter", practise: "practice", practising: "practicing", behaviour: "behavior" },
    uk: { period: "term", practise: "practise", practising: "practising", behaviour: "behaviour" }
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
      .replace(/\b(practise|practising)\b/g, function (m) { return w[m]; });
  }

  // opts: { name, pronoun, style: us|uk, timing: early|end, period,
  //         strengths: [id], improved: "text", areas: [id] (1-2),
  //         level: mild|big, told: no|yes (family already told), support: "text", limit }
  function build(o) {
    o = o || {};
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    var areas = (o.areas || []).map(function (id) { return find(AREAS, id); }).filter(Boolean);
    if (!areas.length) return { ok: false, msg: "Pick the area that's hardest for this student right now." };
    var issues = [], seed = hash(String(o.name || "") + areas.map(function (a) { return a.id; }).join());
    var improved = String(o.improved || "").trim().replace(/[.!]+$/, "");
    if (areas.length > 2) { issues.push({ level: "review", msg: areas.length + " areas of concern is a lot for one comment. Pick the one or two that matter most and raise the rest in a conversation." }); areas = areas.slice(0, 2); }
    var real = strengths.filter(function (s) { return s.s; });
    if (!real.length && !improved) issues.push({ level: "review", msg: "No strength picked. Start with something true and specific the student does well; families of a struggling student read the first line closely." });
    if (o.level === "big" && o.told === "no") issues.push({ level: "review", msg: "You've marked this as a serious concern the family hasn't heard yet. Call or meet them before the report goes home, so the report isn't the first time they hear it." });
    var parts = [], idxS2 = -1, idxHomeTail = -1;
    if (real[0]) parts.push("{name} " + real[0].s + ".");
    if (real[1]) { idxS2 = parts.length; parts.push("{name} " + (/^is /.test(real[1].s) ? real[1].s.replace(/^is /, "is also ") : "also " + real[1].s) + "."); }
    if (improved) parts.push("I've seen real progress this " + (o.timing === "end" ? "year" : "{period}") + ": {name} " + improved.charAt(0).toLowerCase() + improved.slice(1) + ".");
    var a = areas[0];
    var concern = pick(a.c, seed);
    parts.push((o.timing === "end" ? "This year, {name} " : "Right now, {name} ") + concern + ".");
    var idxBig = -1;
    if (o.level === "big" && a.big) { idxBig = parts.length; parts.push(a.big); }
    var support = String(o.support || "").trim().replace(/[.!]+$/, "");
    if (support) parts.push("To help, we're working on " + a.goal + ", " + support.charAt(0).toLowerCase() + support.slice(1) + ".");
    else parts.push("To help, we're working on " + a.goal + (/^(with|by) /.test(a.sch) ? ", " : " ") + a.sch + ".");
    var idxA2 = -1;
    if (areas[1]) { idxA2 = parts.length; parts.push("{name} is also working on " + areas[1].goal + "."); }
    parts.push(a.homeFull || "At home, you could " + a.home + ".");
    if (a.drill) { idxHomeTail = parts.length; parts.push("A few minutes most days helps more than one long session."); }
    parts.push(o.told === "yes" ? CONTACT.met : CONTACT[o.level === "big" ? "big" : "mild"]);
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxHomeTail >= 0) parts[idxHomeTail] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { parts[idxClose] = ""; },
      function () { if (idxA2 >= 0) { parts[idxA2] = ""; issues.push({ level: "note", msg: "Dropped the second area to fit your limit; raise it in a conversation or next report." }); } },
      function () { if (idxBig >= 0) parts[idxBig] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(lazy|unmotivated|careless|chatty|naughty|rude|stubborn|defiant|disruptive|immature|attention[- ]seeking|troublemaker|class clown|a nuisance|a handful|a problem (child|student|in class)|bad attitude|an attitude|sloppy|scatterbrained|disrespectful|apathetic|uncooperative|hyper(active)?|aggressive|weak student|slow learner)\b/i, "fix", "Label: \"$1\". Describe what the student does and what's helping instead (e.g. \"often chats during lessons, so instructions are missed\")."],
    [/\b(doesn'?t care|does not care|couldn'?t care less|can'?t be bothered|has given up|gives up easily|no interest)\b/i, "review", "\"$1\" guesses at what the student feels. Describe what you see (\"stops after a few lines\") and what you're doing about it."],
    [/\b((not )?(working|performing|living up) (to|up to) (his|her|their|full) (full )?potential|potential|if (he|she|they) (just |only )?(applied|tried|put in|focused|worked)|could do (so much )?better|capable of (much |so much )?more)\b/i, "review", "\"$1\" tells the family something is wrong without saying what to do. Name the specific habit to change and how you're helping."],
    [/\b(failing|fails|is failing|below (grade|age|the expected) level|not meeting (the )?(standards?|expectations)|behind)\b/i, "note", "\"$1\": if it's true and your school wants it stated, say it plainly once, alongside the support in place. Make sure the family has heard it from you before the report."],
    [/\b(can'?t|cannot|unable to|won'?t|refuses to|doesn'?t (even )?(try|listen)|does not listen)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning to\", \"finds it hard to\" or describe what happens."],
    [/\b(talks too much|too chatty|(very |so |quite )?disorgani[sz]ed|poor (attendance|behaviou?r|handwriting|effort|work|reader|speller|concentration|attitude)|messy|untidy)\b/i, "review", "\"$1\" is a verdict, not a description. Say what happens (\"often arrives without the materials needed\") and what's helping."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or describe a specific example."],
    [/\b(than (most|many|the other|other|some|the rest of) (children|kids|students|classmates|of the class|the class)|compared (to|with) (the class|the others|other (children|students)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(lowest|weakest|worst|bottom) (in|of) the (class|group|year)|bottom (group|set))\b/i, "fix", "Comparison with other students: \"$1\". Report on this student's own progress."],
    [/\b(adhd|autis\w*|asd|on the spectrum|dyslexi\w*|dyscalculi\w*|dyspraxi\w*|sensory processing|learning (disability|difficulty|difficulties)|iep|504( plan)?|ehcp|special needs|special education|sped|needs (to be )?(tested|assessed|evaluated)|diagnos\w*|medicat\w*|meds)\b/i, "fix", "Diagnosis, medication or support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report card and discuss it with the family in person or in the plan's own meetings."],
    [/\b(SEND|SEN)\b/, "fix", "Support-plan language: \"$1\". Unless your school's policy says otherwise, keep it out of the report and discuss it with the family directly."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|separation|single (mom|mum|dad|parent)|at (mom|mum|dad)'?s house|new baby|bereave\w*|social worker|foster\w*|free (school )?(lunch|meals))\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b(counsel(l)?or|therapy|therapist|mental health)\b/i, "review", "\"$1\" is private support information. Check your school's policy before putting it in a report families may share."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shining star|superstar)\b/i, "note", "Stock phrase: \"$1\". Parents of a struggling student notice when the praise is generic (and it reads as AI-written). Name a real strength."],
    [/\b(alarming|red flag|deeply concerned|very concerned|extremely concerned|seriously worried)\b/i, "review", "\"$1\" on a written report can alarm a family. Say what you've seen and what you're doing; save the worry for a conversation."]
  ];

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: c[2].replace("$1", m[1] || m[0]) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second strength or the closing line." });
    var needs = (t.match(/\b(needs to|must|has to|should)\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. A list of demands is hard to act on; turn one into \"our next step is\" and say how you're helping." });
    if (!/\b(we'?re|we are|we have|we've|I'm|I am|I have|I've|to help|support|small group|check-in|plan|helping)\b/i.test(t)) issues.push({ level: "review", msg: "No support mentioned. Say what school is doing about it, so the family knows it isn't all on them or the student." });
    if (!/\b(next|working on|work on|focus|goal|aim|learning to|is learning|keep (practi[cs]ing|working|building))\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one specific thing the student is working on next." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific activity is the part parents act on most." });
    if (!/\b(get in touch|contact|call|email|meet|talk (to|with)|questions|let me know|reach out)\b/i.test(t)) issues.push({ level: "note", msg: "No invitation to talk. For a student who is finding things hard, one line asking the family to get in touch helps." });
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

  var api = { STRENGTHS: STRENGTHS, AREAS: AREAS, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("sc-strengths"), aGrid = document.getElementById("sc-areas");
    if (!sGrid || !aGrid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function boxes() {
      var o = { style: val("sc-style") };
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      aGrid.innerHTML = AREAS.map(function (a) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + a.id + "\"> " + esc(fill(a.label, o)) + "</label>"; }).join("");
    }
    boxes();
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function opts() {
      return { name: val("sc-name").trim(), pronoun: val("sc-pronoun"), style: val("sc-style"), timing: val("sc-timing"), period: val("sc-period"),
        strengths: checked(sGrid), improved: val("sc-improved"), areas: checked(aGrid), level: val("sc-level"), told: val("sc-told"), support: val("sc-support"), limit: val("sc-limit") };
    }
    document.getElementById("sc-style").addEventListener("change", function () {
      var keep = { s: checked(sGrid), a: checked(aGrid) };
      boxes();
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = keep.s.indexOf(i.value) >= 0; });
      Array.prototype.forEach.call(aGrid.querySelectorAll("input"), function (i) { i.checked = keep.a.indexOf(i.value) >= 0; });
      var p = document.getElementById("sc-period"); p.value = this.value === "uk" ? "term" : "quarter";
    });
    var out = document.getElementById("sc-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"sc-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"sc-text\" rows=\"8\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"sc-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"sc-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"sc-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("sc-text");
      ta.addEventListener("input", function () { document.getElementById("sc-count").textContent = ta.value.length; });
      document.getElementById("sc-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("sc-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("sc-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("sc-count").textContent = ta.value.length; });
    }
    document.getElementById("sc-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("sc-check").addEventListener("click", function () {
      var v = val("sc-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("sc-sample").addEventListener("click", function () {
      document.getElementById("sc-name").value = "Jordan";
      document.getElementById("sc-pronoun").value = "he";
      document.getElementById("sc-improved").value = "now reads chapter books with a partner";
      document.getElementById("sc-level").value = "big";
      document.getElementById("sc-told").value = "yes";
      var pre = { tries: 1, oral: 1, comprehension: 1 };
      [sGrid, aGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = !!pre[i.value]; }); });
      document.getElementById("sc-run").click();
    });
    document.getElementById("sc-next").addEventListener("click", function () {
      ["sc-name", "sc-improved", "sc-support"].forEach(function (id) { document.getElementById(id).value = ""; });
      [sGrid, aGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = false; }); });
      out.innerHTML = ""; document.getElementById("sc-name").focus();
    });
  });
})();
