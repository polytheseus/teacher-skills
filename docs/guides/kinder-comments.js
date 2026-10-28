// Kindergarten / Reception report comment builder and checker. Pick a level
// for the skills you want to mention (strength, on track, next step), add one
// moment you noticed, and it writes a comment in the strength, next step,
// home tip pattern. The checker flags labels ("lazy", "immature", "behind"),
// comparisons with other children, diagnosis and family details, jargon
// parents won't know, leftover placeholders, mixed pronouns, characters that
// break report systems and missing next steps. Runs in the browser and in
// node (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // s = strength (3rd person verb phrase), g = on track, f = next step (noun
  // phrase), sch = how school works on it, home = one home activity (base verb).
  var AREAS = [
    { id: "letters", group: "reading", label: "Letter names",
      s: ["knows the names of all 26 letters, capital and lowercase", "names every letter of the alphabet quickly, in and out of order"],
      g: ["knows most capital letters and is learning the lowercase ones", "can name the letters in {their} own name and many more"],
      f: "learning the names of the letters, starting with the ones in {their} name", sch: "with daily letter games",
      home: "point out letters on signs, food boxes and books and ask {name} to name them" },
    { id: "sounds", group: "reading", label: "Letter sounds",
      s: ["knows the sound for every letter and uses them to sound out new words", "matches letters to their sounds quickly and confidently"],
      g: ["knows the sounds for many letters and is adding new ones each week", "is learning letter sounds and remembers the ones we have practised"],
      f: "matching each letter to its sound", sch: "with a short phonics lesson every day",
      home: "play I Spy with sounds (\"I spy something that starts with /m/\")" },
    { id: "rhyme", group: "reading", label: "Rhyming and hearing sounds in words",
      s: ["hears rhymes easily and loves making up silly rhyming words", "can clap the syllables in long words and hear the first sound in a word"],
      g: ["is starting to hear words that rhyme and enjoys rhyming songs", "can clap the syllables in {their} name and is learning to hear first sounds"],
      f: "hearing the sounds inside words, like the rhyme in cat and hat", sch: "with songs, rhymes and listening games",
      home: "read rhyming books and pause so {name} can say the rhyming word" },
    { id: "sight", group: "reading", label: "Sight words",
      s: ["reads all of our sight words so far and spots them in books", "has learned {their} sight words quickly and uses them in writing"],
      g: ["reads several of our sight words and is learning a few more each week", "recognises some sight words, such as \"the\" and \"is\", in books"],
      f: "learning our sight words (short words like \"the\", \"is\" and \"you\")", sch: "with word games and spotting the words in books",
      home: "look for this week's sight words when you read together" },
    { id: "books", group: "reading", label: "Enjoying books and print",
      s: ["loves books, retells stories in order and points to the words while reading along", "holds books the right way, follows the words left to right and talks about the pictures"],
      g: ["enjoys listening to stories and is learning to retell what happened", "is learning that we read from left to right and that words are separated by spaces"],
      f: "retelling a story: what happened at the beginning, middle and end", sch: "after our class read-alouds",
      home: "read together for ten minutes and ask what happened first" },
    { id: "writing", group: "writing", label: "Writing",
      s: ["writes {their} name and labels {their} drawings using the sounds in each word", "writes simple sentences and is starting to leave spaces between words"],
      g: ["writes {their} first name and is beginning to add letters to {their} drawings", "draws detailed pictures and is learning to write a word or two about them"],
      f: "writing {their} name and adding a word or label to {their} drawings", sch: "in our daily writing time",
      home: "let {name} write shopping lists, cards or labels, however the spelling comes out" },
    { id: "motor", group: "writing", label: "Pencil grip and cutting",
      s: ["holds a pencil with a good grip and cuts carefully along lines", "has strong fine motor skills and forms many letters neatly"],
      g: ["is developing a steadier pencil grip and getting more confident with scissors", "is building the hand strength for writing through play-dough, beads and puzzles"],
      f: "a comfortable pencil grip and cutting along a line", sch: "with play-dough, threading and cutting activities",
      home: "try play-dough, Lego, peg games or cutting old magazines" },
    { id: "counting", group: "math", label: "Counting",
      s: ["counts to 100 by ones and tens with confidence", "counts well past 20 and can count on from any number"],
      g: ["counts to 20 and is working towards higher numbers", "counts objects carefully, touching each one while counting"],
      f: "counting objects one at a time, touching each one once", sch: "with counting games and real objects",
      home: "count stairs, toys or snacks together and ask \"how many?\"" },
    { id: "numbers", group: "math", label: "Recognising and writing numbers",
      s: ["recognises and writes numbers to 20", "reads numbers to 20 and matches each one to the right number of objects"],
      g: ["recognises numbers to 10 and is learning to write them", "is learning to read the numbers 11 to 20"],
      f: "recognising and writing numbers to 10", sch: "in small-group {math} games",
      home: "spot numbers on doors, buses and clocks when you are out" },
    { id: "adding", group: "math", label: "Adding and taking away",
      s: ["adds and takes away within 10 using objects and fingers, and explains how", "solves simple story problems and shows {their} thinking with drawings"],
      g: ["is beginning to add small groups of objects together", "can show \"one more\" and \"one less\" with objects"],
      f: "putting groups together and taking some away with real objects", sch: "with counters and story problems",
      home: "make little story problems with snacks (\"you have 3 grapes and I give you 2 more\")" },
    { id: "shapes", group: "math", label: "Shapes and patterns",
      s: ["names circles, squares, triangles and rectangles and finds them all around the room", "makes and continues patterns and describes shapes by their sides and corners"],
      g: ["names the common shapes and is learning to describe them", "is starting to copy and continue simple patterns"],
      f: "naming shapes and continuing simple patterns", sch: "with building, sorting and pattern games",
      home: "go on a shape hunt around the house or make patterns with spoons and forks" },
    { id: "speaking", group: "social", label: "Speaking and listening",
      s: ["speaks clearly in full sentences and asks thoughtful questions", "listens carefully at group time and shares ideas with the class"],
      g: ["is growing in confidence when speaking in a group", "is learning to listen and wait for {their} turn to talk at group time"],
      f: "sharing {their} ideas at group time in a full sentence", sch: "with turn-taking games and talk partners",
      home: "ask about {their} day with open questions (\"what made you laugh today?\")" },
    { id: "friends", group: "social", label: "Friendships and sharing",
      s: ["is kind to everyone, includes others in games and shares readily", "plays well with others, takes turns and helps classmates"],
      g: ["is making friends and learning to share and take turns", "plays happily alongside others and is starting to join in group games"],
      f: "taking turns and sharing in play", sch: "with turn-taking games and practising kind words",
      home: "play simple board games that need turn-taking" },
    { id: "feelings", group: "social", label: "Managing feelings",
      s: ["manages {their} feelings well and uses words to explain what is wrong", "bounces back quickly from small upsets and helps others when they are sad"],
      g: ["is learning to name {their} feelings and to ask for help when upset", "is getting better at calming down with a deep breath or a quiet moment"],
      f: "naming {their} feelings and using a calm-down strategy when upset", sch: "with our feelings chart and calm corner",
      home: "talk about feelings in stories (\"how do you think the bear feels?\")" },
    { id: "routines", group: "social", label: "Routines and independence",
      s: ["follows our class routines independently and loves to help", "manages {their} belongings and gets ready for each activity without reminders"],
      g: ["is learning our routines and needs fewer reminders each week", "is becoming more independent with coats, lunch and tidying up"],
      f: "following two-step directions and tidying up independently", sch: "with picture schedules and lots of practice",
      home: "give two-step jobs (\"put your shoes away, then wash your hands\")" }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(knows|uses|matches|is|remembers|loves|enjoys|spots|retells|points|follows|talks|labels|writes|draws|forms|cuts|holds|counts|reads|adds|takes|explains|solves|shows|finds|makes|continues|describes|asks|listens|shares|plays|helps|includes|manages|bounces|gets|needs|hears|names|has|recognises|recognizes)$/;
  var GROUP = { reading: "In reading", writing: "In writing", math: "In {math}", social: "" };
  var OPENINGS = {
    settled: ["{name} has settled happily into {class} and comes in ready to learn each day.", "{name} has made a lovely start to {class} and is growing in confidence every week."],
    confident: ["{name} has grown in confidence this {period} and is keen to try new things.", "It has been great to see {name} become more confident this {period}."],
    curious: ["{name} is a curious learner who asks great questions.", "{name} brings real curiosity to {class} and loves finding out how things work."],
    kind: ["{name} is a kind and caring member of our class.", "{name} looks out for classmates and is a thoughtful friend."],
    none: [""]
  };
  var OPENINGS_END = {
    settled: ["{name} has had a wonderful year in {class} and has grown so much since September.", "{name} has made great progress this year and comes in ready to learn every day."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home. I'm looking forward to the rest of the year with {name}.", "Thank you for all you do at home; I'm looking forward to seeing {name}'s progress next {period}."],
    end: ["{name} is ready for {next}, and I have loved being {their} teacher this year.", "Thank you for your support this year. {name} is ready for {next}."]
  };
  var PRON = { she: { their: "her", them: "her" }, he: { their: "his", them: "him" }, they: { their: "their", them: "them" } };
  var WORDS = {
    us: { math: "math", class: "kindergarten", next: "first grade", practise: "practice", practised: "practiced", practising: "practicing", recognises: "recognizes", recognising: "recognizing", recognise: "recognize", favourite: "favorite" },
    uk: { math: "maths", class: "Reception", next: "Year 1", practise: "practise", practised: "practised", practising: "practising", recognises: "recognises", recognising: "recognising", recognise: "recognise", favourite: "favourite" }
  };

  function plural(vp) {
    return vp.replace(/(^|, and |, | and )(\S+)/g, function (m, sep, w) {
      if (sep && !VERBS.test(w)) return m;
      if (w === "is") w = "are"; else if (w === "has") w = "have";
      else if (/(ch|sh|x|ss|zz)es$/.test(w)) w = w.slice(0, -2);
      else if (/[^s]s$/.test(w)) w = w.slice(0, -1);
      return sep + w;
    });
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function area(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i]; return null; }

  function fill(t, o) {
    var w = WORDS[o.style === "uk" ? "uk" : "us"], p = PRON[o.pronoun] || PRON.they;
    return t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "period") return o.period || (o.style === "uk" ? "term" : "quarter");
      if (k in w) return w[k];
      return m;
    }).replace(/\b(practised|recognises|recognising|recognise|practising)\b/g, function (m) { return w[m]; });
  }

  // opts: { name, pronoun, style: us|uk, timing: early|end, period, opening,
  //         moment, limit, levels: { areaId: "s"|"g"|"f" } }
  function build(o) {
    o = o || {};
    var levels = o.levels || {}, seed = hash(String(o.name || "") + (o.moment || ""));
    var strong = [], growing = [], focus = [];
    AREAS.forEach(function (a) {
      if (levels[a.id] === "s") strong.push(a); else if (levels[a.id] === "g") growing.push(a); else if (levels[a.id] === "f") focus.push(a);
    });
    var issues = [];
    if (!strong.length && !growing.length && !focus.length) return { ok: false, msg: "Pick a level for at least one skill." };
    if (strong.length + growing.length + focus.length > 5) issues.push({ level: "review", msg: "That's " + (strong.length + growing.length + focus.length) + " skills. Most kindergarten comments read best with two or three; keep the rest for the grade boxes or a conversation." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the child does well, even if it's a small thing; add a moment you noticed if nothing fits." });
    var parts = [];
    var open = (o.timing === "end" && OPENINGS_END[o.opening || "settled"]) || OPENINGS[o.opening] || OPENINGS.settled;
    var idxOpen = -1, idxFew = -1;
    if (o.opening !== "none") { idxOpen = parts.length; parts.push(pick(open, seed)); }
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) parts.push("I loved seeing {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    // Subjects alternate between the name and a pronoun so the name isn't on
    // every sentence; "they" takes a plural verb (names -> name, is -> are).
    var lastGroup = null, n = 0;
    var SUBJ = { she: "she", he: "he", they: "they" };
    function sentence(a, vp, tail) {
      var g = GROUP[a.group], lead = g && g !== lastGroup ? g + ", " : "";
      lastGroup = g;
      var pron = SUBJ[o.pronoun] && n % 2 === 1;
      n++;
      var subj = pron ? SUBJ[o.pronoun] : "{name}";
      if (pron && o.pronoun === "they") vp = plural(vp);
      return cap(lead + subj + " " + vp + (tail || "") + ".");
    }
    // Strengths and on-track skills in AREAS order, so each subject is together.
    var onTrack = 0;
    AREAS.forEach(function (a, i) {
      if (levels[a.id] === "s") parts.push(sentence(a, pick(a.s, seed + i)));
      else if (levels[a.id] === "g") parts.push(sentence(a, pick(a.g, seed + i), (o.timing !== "end" && !onTrack++) ? ", which is right on track for this point in the year" : ""));
    });
    var home = null;
    if (focus.length) {
      parts.push(o.timing === "end" ? "A good next step for the summer is " + focus[0].f + "." : "Our next step is " + focus[0].f + ", which we're {practising} " + focus[0].sch + ".");
      if (focus[1]) parts.push("We're also working on " + focus[1].f + ".");
      home = focus[0];
    } else if (growing.length) {
      parts.push((o.timing === "end" ? "Next year, {name} will keep working on " : "Next, we'll keep working on ") + growing[0].f.replace(/^learning /, "") + ".");
      home = growing[0];
    } else if (o.timing === "end") {
      parts.push("Over the summer, {name} can keep building on this by reading together and counting the things you see.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a strong student's comment usually names one thing to aim for next." });
    }
    if (home) { parts.push("At home, you could " + home.home + "."); idxFew = parts.length; parts.push("A few minutes a few times a week is plenty."); }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return fill(p, o); }).join(" ").replace(/\s+/g, " ").trim()); }
    // Over the character limit: drop the optional sentences first.
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxFew >= 0) parts[idxFew] = ""; },
      function () { parts[idxClose] = o.timing === "end" ? "{name} is ready for {next}." : "Thank you for your support at home."; },
      function () { if (idxOpen >= 0 && (moment || strong.length)) parts[idxOpen] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    var res = check(text, o);
    return { ok: true, text: text, chars: text.length, issues: issues.concat(res) };
  }

  var CHECKS = [
    [/\b(lazy|naughty|bad|rude|stubborn|defiant|disruptive|immature|babyish|clingy|whiny|hyper(active)?|wild|aggressive|a handful|a problem)\b/i, "fix", "Label: \"$1\". Describe what the child does and what helps instead (e.g. \"is learning to keep hands to self at carpet time\")."],
    [/\b(behind|below (grade|age|the expected) level|not meeting (the )?standards?|failing|fails|is failing|weak|poor|slow learner|slow)\b/i, "review", "\"$1\" reads as a verdict on a five-year-old. Kindergarten standards describe the end of the year, so early on say what the child can do now and what comes next."],
    [/\b(can'?t|cannot|unable to|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning to\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to parents."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true of a five-year-old and is hard to hear. Say \"often\", \"sometimes\" or describe a specific moment."],
    [/\b(than (most|many|the other|other|some) (children|kids|students|classmates|of the class)|compared (to|with) (the class|the others|other children|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(youngest|oldest|smallest|best|worst) in the class|top of the class)\b/i, "fix", "Comparison with other children: \"$1\". Report on this child's own progress."],
    [/\b(adhd|autis\w*|asd|on the spectrum|dyslexi\w*|dyspraxi\w*|sensory processing|speech delay|language delay|developmental delay|delayed|speech therapy|speech therapist|ot referral|iep|504( plan)?|ehcp|sen(d)?|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*)\b/i, "fix", "Diagnosis or support-plan language: \"$1\". Never suggest or mention a diagnosis on a report; raise concerns with parents in person and follow your school's referral process."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|separation|single (mom|mum|dad|parent)|at (mom|mum|dad)'?s house|new baby|social worker|foster\w*|free (school )?(lunch|meals)|medication|meds)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b(phonemic|phonological|cvc|ccvc|onset|rime|graphemes?|phonemes?|gpcs?|digraphs?|segment(ing|s)?|blend(ing|s)? (sounds|words)|cardinality|subitiz\w*|subitis\w*|decodable|decoding|k\.(cc|oa|g|md|nbt)\.\w+|rf\.k\.\w+|ccss|elgs?|early learning goals?|benchmark)\b/i, "review", "Jargon: \"$1\". Most parents won't know it; say what the child does (\"sounds out short words like cat and sun\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|tapestry|embark\w*|testament|truly|shines?|shining star|little ray of sunshine|superstar)\b/i, "note", "Stock phrase: \"$1\". Parents see it on every report (and it reads as AI-written). A specific moment says more."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/(\b(we|i) (are|am) (worried|concerned)|concerning|red flag|alarming)\b/i, "review", "\"$1\" on a written report can alarm a family. If you're worried, talk to them in person first and keep the report to what you're working on."],
    [/\b(should (really )?be (able to|doing|reading|writing|counting) .{0,20}by now|by now)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."]
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
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second skill or the opening sentence." });
    if (!/\b(next|working on|work on|focus|goal|keep (practi[cs]ing|building|working)|aim|learning to|is learning|will keep)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one thing the child is working on next, so parents know where to help." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific activity is the part parents act on most." });
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another child's, check the pronouns." });
    if (o.name) {
      var nm = String(o.name).trim();
      if (nm && t.indexOf(nm) < 0) issues.push({ level: "review", msg: "The child's name (\"" + nm + "\") isn't in the comment. Was it written for someone else?" });
      if (/\s/.test(nm)) issues.push({ level: "note", msg: "Use the first name only in the comment, the way you'd talk to the family." });
    }
    var m = t.match(/[—–‘’“”…]/g);
    if (m) issues.push({ level: "note", msg: "Curly quotes, dashes or … (" + m.length + "). Some report systems show these as ? or boxes. \"Plain text\" below swaps them for straight ones." });
    if (o.style === "uk" && o.timing !== "end" && /\b(expected|emerging|exceeding|good level of development|gld)\b/i.test(t)) issues.push({ level: "review", msg: "\"Expected\", \"emerging\" and GLD are the end-of-Reception EYFS profile judgements. In autumn and spring, describe progress instead." });
    var sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 32; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 32 words. Shorter sentences are easier for families reading in a second language." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { AREAS: AREAS, plural: plural, build: build, check: check, plain: plain, fill: fill, area: area };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("kc-skills");
    if (!grid) return;
    var html = "";
    AREAS.forEach(function (a) {
      html += "<label>" + esc(a.label) + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">Strength</option><option value=\"g\">On track</option><option value=\"f\">Next step</option></select></label>";
    });
    grid.innerHTML = html;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      return { name: val("kc-name").trim(), pronoun: val("kc-pronoun"), style: val("kc-style"), timing: val("kc-timing"), period: val("kc-period"), opening: val("kc-opening"), moment: val("kc-moment"), limit: val("kc-limit"), levels: levels };
    }
    var out = document.getElementById("kc-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"kc-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"kc-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"kc-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"kc-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"kc-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("kc-text");
      ta.addEventListener("input", function () { document.getElementById("kc-count").textContent = ta.value.length; });
      document.getElementById("kc-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("kc-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("kc-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("kc-count").textContent = ta.value.length; });
    }
    document.getElementById("kc-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("kc-check").addEventListener("click", function () {
      var v = val("kc-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("kc-sample").addEventListener("click", function () {
      document.getElementById("kc-name").value = "Maya";
      document.getElementById("kc-pronoun").value = "she";
      document.getElementById("kc-moment").value = "count every block in the 20-block tower she built";
      var pre = { letters: "s", sight: "g", writing: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("kc-run").click();
    });
    document.getElementById("kc-next").addEventListener("click", function () {
      ["kc-name", "kc-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("kc-name").focus();
    });
  });
})();
