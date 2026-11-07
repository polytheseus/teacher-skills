// First grade / Grade 1 / Year 1 report comment builder and checker. Pick a level
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
    { id: "phonics", group: "reading", label: "Sounding out words",
      s: ["sounds out new words confidently, including words with sh, ch and th", "uses letter sounds to read unfamiliar words and corrects {their} own mistakes"],
      g: ["is getting quicker at sounding out short words like \"ship\" and \"jump\"", "is learning to sound out short words and needs less help each week"],
      f: "sounding out short words one sound at a time", sch: "in a short phonics lesson every day",
      home: "write a few short words on sticky notes and have {name} sound them out" },
    { id: "vowels", group: "reading", label: "Silent e and vowel pairs",
      s: ["reads words with a silent e, like \"make\" and \"bike\", and vowel pairs, like \"rain\" and \"boat\"", "uses the silent e and vowel pairs to work out long words in {their} reading"],
      g: ["is starting to spot the silent e in words like \"make\" and \"bike\"", "is learning that two vowels together, as in \"rain\" and \"boat\", often make one sound"],
      f: "reading words with a silent e, like \"make\" and \"bike\"", sch: "with word sorts and short phonics books",
      home: "hunt for silent-e words in a {favourite} book" },
    { id: "sight", group: "reading", label: "Sight words",
      s: ["reads our sight words quickly and spots them in any book", "reads tricky words like \"said\" and \"was\" without stopping to sound them out"],
      g: ["reads many of our sight words and is learning a few more each week", "knows common words like \"the\" and \"was\" and is adding new ones"],
      f: "reading sight words like \"said\", \"was\" and \"they\" quickly", sch: "with word games and by spotting the words in books",
      home: "look for this week's sight words when you read together" },
    { id: "fluency", group: "reading", label: "Reading aloud smoothly",
      s: ["reads aloud smoothly and with expression, often giving characters different voices", "goes back and rereads a sentence when it doesn't sound right"],
      g: ["is moving from word-by-word reading to smoother phrases", "reads familiar books more smoothly each time"],
      f: "reading familiar books aloud more smoothly", sch: "by rereading {favourite} books with a partner",
      home: "have {name} read the same short book to you, a pet or a toy two or three times" },
    { id: "comprehension", group: "reading", label: "Understanding and retelling",
      s: ["retells stories with the key details and explains the lesson they teach", "asks and answers questions about what we read and finds the answers in the text"],
      g: ["can retell the main events of a story and is adding more details", "is learning to find the main idea in a short information book"],
      f: "retelling a story in order with the important details", sch: "after our read-alouds and partner reading",
      home: "ask what happened first, next and last in a book you've read together" },
    { id: "sentences", group: "writing", label: "Writing sentences and stories",
      s: ["writes stories with a beginning, middle and end, using words like \"first\" and \"then\"", "writes several connected sentences on a topic and adds interesting details"],
      g: ["writes complete sentences and is learning to add a second or third on the same idea", "shares ideas confidently in writing and is learning to put events in order"],
      f: "writing two or three sentences on one idea", sch: "in our daily writing time",
      home: "write something real together, like a note, a card or a list" },
    { id: "spelling", group: "writing", label: "Spelling and punctuation",
      s: ["starts sentences with a capital letter, ends them with punctuation and spells common words correctly", "uses letter sounds to spell new words and gets most common words right"],
      g: ["uses capital letters and {stops} more often in {their} writing", "spells many common words correctly and makes sensible attempts at new ones"],
      f: "starting each sentence with a capital letter and ending it with {stop}", sch: "when we check our writing together",
      home: "have {name} check a note or shopping list for capitals and spelling" },
    { id: "handwriting", group: "writing", label: "Handwriting",
      s: ["forms letters neatly and leaves clear spaces between words", "prints all capital and lowercase letters carefully"],
      g: ["is forming letters more neatly and remembering spaces between words", "is getting more consistent at keeping letters on the line"],
      f: "forming letters neatly and leaving spaces between words", sch: "with short handwriting practice",
      home: "write birthday cards, labels or a note to a relative, taking time over the letters" },
    { id: "facts", group: "math", label: "Adding and subtracting",
      s: ["adds and subtracts within 20 using strategies like making ten and counting on", "knows addition and subtraction facts to 10 quickly and explains {their} thinking"],
      g: ["adds and subtracts within 10 and is building speed", "uses counters, fingers and drawings to add and subtract and is starting to count on"],
      f: "adding and subtracting within 10 by counting on", sch: "with number games and counters",
      home: "play a quick card game: turn over two number cards and add them" },
    { id: "wordproblems", group: "math", label: "Word problems",
      s: ["solves word problems and shows {their} thinking with pictures and number sentences", "works out whether a word problem needs adding or subtracting and explains why"],
      g: ["solves simple word problems with drawings and counters", "is learning to work out whether to add or subtract in a word problem"],
      f: "drawing a picture to solve a word problem", sch: "with word problems about real things in our classroom",
      home: "make up word problems at snack time (\"you have 8 grapes and eat 3\")" },
    { id: "tens", group: "math", label: "Tens and ones",
      s: ["explains that 34 means 3 tens and 4 ones, and compares two-digit numbers", "finds 10 more or 10 less than a number without counting"],
      g: ["is learning to group objects into tens and ones", "can show teen numbers as a ten and some ones"],
      f: "seeing two-digit numbers as tens and ones", sch: "with base-ten blocks and bundles of ten",
      home: "bundle dried pasta, straws or coins into groups of ten and count them" },
    { id: "counting", group: "math", label: "Counting and numbers",
      s: ["counts confidently past 100 and can start from any number", "reads and writes numbers to 100 and beyond"],
      g: ["counts past 50 and is learning to keep going from any number", "reads and writes two-digit numbers and is working on larger ones"],
      f: "counting on from any number, not just from 1", sch: "with hundreds charts and counting games",
      home: "count together from a number other than 1, like 47, on a walk or in the car" },
    { id: "time", group: "math", label: "Time, measuring and graphs",
      s: ["tells {thetime} to the hour and half hour on clocks with hands and digital clocks", "measures and compares lengths and reads simple graphs"],
      g: ["tells {thetime} to the hour and is learning the half hour", "is learning to measure by lining up small objects with no gaps"],
      f: "telling {thetime} to the hour and half hour", sch: "with our class clock and daily schedule",
      home: "point out a clock at bedtime or dinner and ask what time it is" },
    { id: "shapes", group: "math", label: "Shapes and equal parts",
      s: ["describes shapes by their sides and corners and builds new shapes from them", "splits circles and rectangles into halves and {fourths} and explains that more parts means smaller parts"],
      g: ["names common shapes and is learning what makes a shape a triangle or a rectangle", "can split a shape into two equal parts and is working on four"],
      f: "splitting shapes into two and four equal parts", sch: "with paper folding and sharing activities",
      home: "cut a sandwich or toast into halves and {fourths} together" },
    { id: "listening", group: "social", label: "Listening and following directions",
      s: ["listens carefully and follows directions with several steps", "joins class discussions and builds on what classmates say"],
      g: ["is learning to wait for {their} turn to speak and to listen to others", "follows one or two directions at a time and needs fewer reminders each week"],
      f: "listening to directions and following them with fewer reminders", sch: "with clear routines, visual cues and practice",
      home: "give two-step or three-step jobs and ask {name} to say them back" },
    { id: "independence", group: "social", label: "Working independently",
      s: ["starts work promptly and stays focused until it is finished", "takes care of {their} materials and checks {their} work before handing it in"],
      g: ["is building stamina and can work alone for longer each week", "is learning to ask for help when stuck and then try again"],
      f: "starting work promptly and staying with a task until it is finished", sch: "with short goals and a visual checklist",
      home: "set a timer for a short job and notice out loud when {name} finishes it" },
    { id: "friends", group: "social", label: "Friendships and kindness",
      s: ["is kind to classmates, includes others and sorts out small disagreements with words", "works well with a partner and takes turns fairly"],
      g: ["is making friends and learning to work with a partner", "is learning to sort out small disagreements with words"],
      f: "using kind words to sort out small disagreements", sch: "with class meetings and by {practising} what to say",
      home: "play board games together and talk about winning and losing kindly" },
    { id: "confidence", group: "social", label: "Confidence and persistence",
      s: ["keeps trying when something is hard and bounces back quickly from mistakes", "talks about {their} feelings calmly and asks for help when needed"],
      g: ["is learning that mistakes help us learn and is more willing to try hard things", "is learning to calm down and ask for help when frustrated"],
      f: "keeping going when work feels hard and asking for help", sch: "with calm-down strategies and by talking about mistakes as part of learning",
      home: "share a time you made a mistake and what you did next" }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(sounds|uses|corrects|needs|spots|rereads|shows|reads|goes|is|retells|explains|asks|answers|finds|writes|adds|shares|starts|ends|spells|gets|makes|forms|leaves|prints|subtracts|knows|solves|works|compares|counts|tells|measures|describes|builds|splits|names|listens|follows|joins|stays|takes|checks|can|includes|sorts|keeps|bounces|talks)$/;
  var GROUP = { reading: "In reading", writing: "In writing", math: "In {math}", social: "" };
  var OPENINGS = {
    settled: ["{name} has settled happily into {class} and comes in ready to learn each day.", "{name} has made a lovely start to {class} and is growing in confidence every week."],
    confident: ["{name} has grown in confidence this {period} and is keen to try new things.", "It has been great to see {name} become more confident this {period}."],
    curious: ["{name} is a curious learner who asks great questions.", "{name} brings real curiosity to {class} and loves finding out how things work."],
    kind: ["{name} is a kind and caring member of our class.", "{name} looks out for classmates and is a thoughtful friend."],
    none: [""]
  };
  var OPENINGS_END = {
    settled: ["{name} has had a wonderful year in {class} and has grown so much since {since}.", "{name} has made great progress this year and comes in ready to learn every day."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home. I'm looking forward to the rest of the year with {name}.", "Thank you for all you do at home; I'm looking forward to seeing {name}'s progress next {period}."],
    end: ["{name} is ready for {next}, and I have loved being {their} teacher this year.", "Thank you for your support this year. {name} is ready for {next}."]
  };
  var PRON = { she: { their: "her", them: "her" }, he: { their: "his", them: "him" }, they: { their: "their", them: "them" } };
  var WORDS = {
    us: { math: "math", class: "first grade", next: "second grade", stop: "a period", stops: "periods", fourths: "fourths", thetime: "time", practise: "practice", practised: "practiced", practising: "practicing", favourite: "favorite" },
    ca: { math: "math", class: "Grade 1", next: "Grade 2", stop: "a period", stops: "periods", fourths: "fourths", thetime: "time", practise: "practise", practised: "practised", practising: "practising", favourite: "favourite" },
    uk: { math: "maths", class: "Year 1", next: "Year 2", stop: "a full stop", stops: "full stops", fourths: "quarters", thetime: "the time", practise: "practise", practised: "practised", practising: "practising", favourite: "favourite" }
  };
  var PERIOD = { us: "quarter", ca: "term", uk: "term", au: "semester" };
  // Australia uses UK spelling and "Year 1"; its school year runs late January
  // to December, so "since September" becomes "the first day of the year".
  function isAU(o) { return o.style === "au"; }
  function words(o) {
    var w = WORDS[isAU(o) ? "uk" : o.style] || WORDS.us, r = {};
    for (var k in w) r[k] = w[k];
    r.since = isAU(o) ? "the start of the year" : "September";
    return r;
  }

  function plural(vp) {
    return vp.replace(/(^|, and |, | and )(\S+)/g, function (m, sep, w) {
      if (sep && !VERBS.test(w)) return m;
      if (w === "is") w = "are"; else if (w === "has") w = "have";
      else if (/(ch|sh|x|ss|zz)es$/.test(w)) w = w.slice(0, -2);
      else if (w === "goes") w = "go";
      else if (w !== "can" && /[^s]s$/.test(w)) w = w.slice(0, -1);
      return sep + w;
    });
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function area(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i]; return null; }

  function fill(t, o) {
    var w = words(o), p = PRON[o.pronoun] || PRON.they;
    return t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "period") return o.period || PERIOD[o.style] || "quarter";
      if (k in w) return w[k];
      return m;
    }).replace(/\b(practised|practising)\b/g, function (m) { return w[m]; });
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
    if (strong.length + growing.length + focus.length > 5) issues.push({ level: "review", msg: "That's " + (strong.length + growing.length + focus.length) + " skills. Most first grade comments read best with two or three; keep the rest for the grade boxes or a conversation." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the child does well, even if it's a small thing; add a moment you noticed if nothing fits." });
    var parts = [];
    var open = (o.timing === "end" && OPENINGS_END[o.opening || "settled"]) || OPENINGS[o.opening] || OPENINGS.settled;
    var idxOpen = -1, idxFew = -1;
    if (o.opening !== "none") { idxOpen = parts.length; parts.push(pick(open, seed)); }
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) parts.push("I loved seeing " + ((idxOpen >= 0 && /\{name\}/.test(parts[idxOpen]) && { she: "her", he: "him", they: "them" }[o.pronoun]) || "{name}") + " " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    // Subjects alternate between the name and a pronoun so the name isn't on
    // every sentence; "they" takes a plural verb (names -> name, is -> are).
    var lastGroup = null, n = /\{name\}/.test(parts[parts.length - 1] || "") ? 1 : 0;
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
      parts.push((o.timing === "end" ? "Next year, " + ((/\{name\}/.test(parts[parts.length - 1]) && SUBJ[o.pronoun]) || "{name}") + " will keep working on " : "Next, we'll keep working on ") + growing[0].f.replace(/^learning /, "") + ".");
      home = growing[0];
    } else if (o.timing === "end") {
      parts.push("Over the summer, " + ((/\{name\}/.test(parts[parts.length - 1]) && SUBJ[o.pronoun]) || "{name}") + " can keep building on this by reading together and counting the things you see.");
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
      function () { if (idxOpen >= 0 && (moment || strong.length)) dropOpen = true; }
    ];
    // Dropping the opening rebuilds as "No opening" with the first two trims
    // already made, so the moment line and first strand name the student
    // instead of starting on a pronoun.
    var dropOpen = false;
    for (var tj = 0; tj < (o._trimmed || 0); tj++) { trims[tj](); text = join(); }
    for (var ti = o._trimmed || 0; limit && text.length > limit && ti < trims.length && !dropOpen; ti++) { trims[ti](); text = join(); }
    if (dropOpen) return build(Object.assign({}, o, { opening: "none", _trimmed: 2 }));
    // A strengths-only comment already gets the gentler "No next step picked" note.
    var res = check(text, o).filter(function (i) { return focus.length || growing.length || !/^No next step\./.test(i.msg); });
    return { ok: true, text: text, chars: text.length, issues: issues.concat(res) };
  }

  var CHECKS = [
    [/\b(lazy|naughty|bad|rude|stubborn|defiant|disruptive|disrupts?|sloppy|careless|immature|babyish|clingy|whiny|hyper(active)?|wild|aggressive|a handful|a problem)\b/i, "fix", "Label: \"$1\". Describe what the child does and what helps instead (e.g. \"is learning to keep hands to self at carpet time\")."],
    [/\b(behind|below (grade|age|the expected) level|not meeting (the )?standards?|failing|fails|is failing|weak|poor|slow learner|slow)\b/i, "review", "\"$1\" reads as a verdict on a six-year-old. Say what the child can do now, what comes next and what help is in place. If a child really is well below your school's expectations, talk to the family first, so the report isn't how they find out."],
    [/\b(can'?t|cannot|unable to|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning to\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to parents."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true of a six-year-old and is hard to hear. Say \"often\", \"sometimes\" or describe a specific moment."],
    [/\b(than (most|many|the other|other|some) (children|kids|students|classmates|of the class)|compared (to|with) (the class|the others|other children|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(youngest|oldest|smallest|best|worst) in the class|top of the class)\b/i, "fix", "Comparison with other children: \"$1\". Report on this child's own progress."],
    [/\b(adhd|autis\w*|asd|on the spectrum|dyslexi\w*|dyspraxi\w*|sensory processing|speech delay|language delay|developmental delay|delayed|speech therapy|speech therapist|ot referral|iep|504( plan)?|ehcp|sen(d)?|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*)\b/i, "fix", "Diagnosis or support-plan language: \"$1\". Never suggest or mention a diagnosis on a report; raise concerns with parents in person and follow your school's referral process."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|separation|single (mom|mum|dad|parent)|at (mom|mum|dad)'?s house|new baby|social worker|foster\w*|free (school )?(lunch|meals)|medication|meds)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b(phonemic|phonological|cvc|ccvc|onset|rime|graphemes?|phonemes?|gpcs?|digraphs?|segment(ing|s)?|blend(ing|s)? (sounds|words)|cardinality|subitiz\w*|subitis\w*|decodable|decoding|1\.(oa|nbt|md|g)\.\w+|(rf|ri|rl|w|sl|l)\.1\.\w+|cvce|vowel teams?|inflectional|fluency|wcpm|cwpm|dibels|i-?ready|lexile|fountas|f&p|dra\d*|guided reading level|level [a-z]\b|running records?|ccss|benchmark|achievement standards?|ac9\w*|acara)\b/i, "review", "Jargon: \"$1\". Most parents won't know it; say what the child does (\"sounds out short words like ship and jump\", or \"reads simple books with a repeating pattern\")."],
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
    if (o.style === "uk" && (m = t.match(/\b(failed|fail|passed|pass) (the |her |his |their )?(phonics|screening)/i))) issues.push({ level: "review", msg: "\"" + m[0] + "\" turns the phonics screening check into a verdict. The check has an expected standard, not a pass mark to fail; say what the child can read now and what you're doing next." });
    if ((isAU(o) || o.style === "uk") && (m = t.match(/\b(first grade|second grade|grade (one|two|1|2)|first graders?|math)\b/i))) issues.push({ level: "review", msg: "\"" + m[1] + "\" is North American wording. Families here expect \"Year 1\", \"Year 2\" and \"maths\"." });
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
      document.getElementById("kc-moment").value = "read a whole page to the class in a dinosaur voice";
      var pre = { phonics: "s", fluency: "g", sentences: "f" };
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
