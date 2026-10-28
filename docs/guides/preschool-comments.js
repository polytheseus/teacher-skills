// Preschool / Pre-K / nursery progress report comment builder and checker,
// plus a UK "progress check at age 2" summary mode. Pick a level for the
// areas you want to mention (strength, on track, next step), add one moment
// you noticed, and it writes a comment in the strength, next step, home tip
// pattern. The checker flags labels ("naughty", "clingy"), verdicts,
// comparisons with other children, diagnosis and family details, jargon
// parents won't know, leftover placeholders, mixed pronouns and characters
// that break report systems. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // s = strength (3rd person verb phrase), g = on track, f = next step (noun
  // phrase), sch = how the setting works on it, home = one home activity
  // (base verb). us = Head Start ELOF central domain, uk = EYFS area.
  var AREAS = [
    { id: "curious", group: "learn", label: "Curiosity and trying new things", us: "Approaches to Learning", uk: "How they learn (characteristics of effective teaching and learning)",
      s: ["asks lots of questions and loves finding out how things work", "tries new activities with enthusiasm and keeps going when something is tricky"],
      g: ["is starting to try new activities with a grown-up nearby", "explores the classroom and is choosing new areas to play in"],
      f: "trying a new activity, even when it feels a little tricky", sch: "by inviting {them} to join a friend at a new activity each day",
      home: "try something new together, like a different playground or a simple recipe, and talk about how it went" },
    { id: "focus", group: "learn", label: "Attention and sticking with a task", us: "Approaches to Learning", uk: "How they learn (characteristics of effective teaching and learning)",
      s: ["concentrates on puzzles and building for a long time", "sticks with a task until it is finished and is proud of the result"],
      g: ["is focusing for longer at play and at story time", "finishes short activities with a little encouragement"],
      f: "staying with one activity for a few minutes before moving on", sch: "with short, fun tasks and lots of encouragement",
      home: "do a puzzle or build something together and finish it before starting the next thing" },
    { id: "friends", group: "social", label: "Playing with others", us: "Social and Emotional Development", uk: "Personal, social and emotional development",
      s: ["plays happily with friends, takes turns and shares ideas for games", "invites others to play and is kind when a friend is upset"],
      g: ["plays alongside other children and is starting to join their games", "is learning to share toys and wait for a turn"],
      f: "taking turns and sharing in play", sch: "with turn-taking games and lots of practice",
      home: "play simple games that need turn-taking, like rolling a ball back and forth" },
    { id: "feelings", group: "social", label: "Feelings and calming down", us: "Social and Emotional Development", uk: "Personal, social and emotional development",
      s: ["names {their} feelings and asks a grown-up for help when upset", "calms down quickly after small upsets and comforts friends who are sad"],
      g: ["is learning to name {their} feelings, such as happy, sad and angry", "is getting better at calming down with a cuddle, a deep breath or a quiet moment"],
      f: "naming {their} feelings and using a calm-down strategy when upset", sch: "with our feelings pictures and cosy corner",
      home: "talk about how characters feel in stories (\"how do you think the bear feels?\")" },
    { id: "settling", group: "social", label: "Settling in and saying goodbye", us: "Social and Emotional Development", uk: "Personal, social and emotional development",
      s: ["says goodbye happily at drop-off and settles straight into play", "comes in confidently each morning and knows our routine"],
      g: ["is settling in well and finds goodbyes easier each week", "settles quickly after drop-off with a {favourite} activity"],
      f: "settling quickly after saying goodbye in the morning", sch: "with a familiar welcome activity and a friendly face at the door",
      home: "keep goodbyes short and cheerful, and tell {name} who will pick {them} up" },
    { id: "selfcare", group: "social", label: "Independence and self-care", us: "Social and Emotional Development", uk: "Personal, social and emotional development",
      s: ["puts on {their} own coat, washes {their} hands and tidies up without reminders", "loves helping and manages {their} own things at snack and tidy-up time"],
      g: ["is becoming more independent with coats, handwashing and tidying up", "is learning our routines and needs fewer reminders each week"],
      f: "doing more things independently, like putting on {their} coat and washing {their} hands", sch: "with picture routines and plenty of time to try",
      home: "give {name} small jobs, like carrying {their} plate or finding {their} shoes" },
    { id: "talking", group: "language", label: "Talking and new words", us: "Language and Literacy", uk: "Communication and language",
      s: ["talks in full sentences and loves telling us about {their} day", "uses lots of new words and asks interesting questions"],
      g: ["is talking more in class each week and joins in with songs", "is using new words from our stories and topics"],
      f: "using longer sentences to share {their} ideas", sch: "in small-group chats and at snack time",
      home: "talk together about what you see on walks and add a new word or two" },
    { id: "listening", group: "language", label: "Listening and following directions", us: "Language and Literacy", uk: "Communication and language",
      s: ["listens carefully at story time and follows two-step directions", "remembers instructions and helps friends follow them too"],
      g: ["is learning to listen at group time and follows one-step directions", "listens well in small groups and is building up to larger ones"],
      f: "listening at group time and following two-step directions", sch: "with listening games like Simon Says",
      home: "give two-step jobs (\"get your shoes, then find your coat\")" },
    { id: "books", group: "language", label: "Stories and books", us: "Language and Literacy", uk: "Literacy",
      s: ["loves books and retells {favourite} stories in {their} own words", "joins in with repeated lines in stories and talks about the pictures"],
      g: ["enjoys listening to stories and is starting to talk about the pictures", "is learning to sit for a whole story and enjoys choosing books"],
      f: "talking about stories: who was in them and what happened", sch: "after our story time each day",
      home: "read together every day and ask \"what do you think happens next?\"" },
    { id: "letters", group: "language", label: "Name and letters", us: "Language and Literacy", uk: "Literacy",
      s: ["recognises {their} own name and knows many letters", "spots the letters from {their} name everywhere and can name several others"],
      g: ["recognises {their} name on {their} {peg} and is learning its first letter", "is noticing letters around the room and asking about them"],
      f: "recognising the letters in {their} name", sch: "with name games and letter puzzles",
      home: "point out the letters of {their} name on signs and packets" },
    { id: "rhymes", group: "language", label: "Rhymes, songs and sounds", us: "Language and Literacy", uk: "Literacy",
      s: ["joins in with songs and rhymes and can spot words that rhyme", "claps the beats in words and hears the first sound in {their} name"],
      g: ["joins in with familiar songs and rhymes", "is starting to notice words that sound the same"],
      f: "joining in with rhymes and hearing words that sound the same", sch: "with songs, rhymes and silly sound games",
      home: "sing nursery rhymes together and leave out the last word for {name} to fill in" },
    { id: "drawing", group: "language", label: "Drawing and early writing", us: "Language and Literacy", uk: "Literacy",
      s: ["draws detailed pictures and tells us all about them", "is starting to write some of the letters in {their} name"],
      g: ["enjoys drawing and making marks with crayons, chalk and paint", "draws circles and lines and talks about what {their} pictures show"],
      f: "holding a crayon comfortably and making marks on purpose", sch: "at our drawing table every day",
      home: "draw together with chalk, crayons or a stick in the sand" },
    { id: "counting", group: "math", label: "Counting", us: "Cognition (math)", uk: "Mathematics",
      s: ["counts to 10 and beyond, touching each object once", "knows how many are in a small group without counting and loves number songs"],
      g: ["counts to 5 and joins in with number songs", "is learning to count objects one at a time"],
      f: "counting a small group of objects, touching each one once", sch: "with counting songs and real objects",
      home: "count stairs, toys or snacks together and ask \"how many?\"" },
    { id: "shapes", group: "math", label: "Shapes, sizes and sorting", us: "Cognition (math)", uk: "Mathematics",
      s: ["names circles, squares and triangles and spots them around the room", "sorts objects by {colour}, size and shape and explains how"],
      g: ["is learning the names of common shapes", "sorts objects by {colour} and is starting to compare big and small"],
      f: "sorting objects and using words like bigger, smaller, longer and shorter", sch: "with building, sorting and matching games",
      home: "sort the laundry or the shopping together by size or {colour}" },
    { id: "explore", group: "explore", label: "Exploring and asking why", us: "Cognition (science)", uk: "Understanding the world",
      s: ["is fascinated by nature and asks great questions about how things work", "makes predictions and tests them in water and sand play"],
      g: ["enjoys exploring our science table and noticing changes", "is curious about bugs, plants and the weather"],
      f: "noticing and describing what happens when things change", sch: "with simple experiments like melting ice and growing seeds",
      home: "go on a nature walk and talk about what you find" },
    { id: "moving", group: "physical", label: "Running, climbing and balance", us: "Perceptual, Motor, and Physical Development", uk: "Physical development",
      s: ["runs, jumps and climbs with confidence and good balance", "pedals a tricycle, catches a big ball and moves safely around others"],
      g: ["is growing in confidence on the climbing frame", "is learning to jump with two feet and to catch a big ball"],
      f: "balancing and climbing with confidence", sch: "with daily outdoor play and movement games",
      home: "visit the playground and try hopping, jumping and balancing games" },
    { id: "hands", group: "physical", label: "Hand skills (scissors, crayons, puzzles)", us: "Perceptual, Motor, and Physical Development", uk: "Physical development",
      s: ["uses scissors carefully and holds crayons with good control", "completes puzzles and builds tall towers with steady hands"],
      g: ["is building strong hands through play-dough, puzzles and building", "is learning to use scissors with help"],
      f: "using scissors and holding a crayon comfortably", sch: "with play-dough, threading and cutting activities",
      home: "try play-dough, threading pasta onto string or tearing paper for collages" }
  ];
  // UK progress check at age 2: the three prime areas (EYFS 2.6). f = the
  // child may need some extra support; how = what the setting will do.
  var TWO = [
    { id: "t-play", area: "psed", label: "Playing with others",
      s: "enjoys playing alongside other children and is starting to share toys", g: "plays happily near other children and watches what they do",
      f: "playing alongside other children and taking short turns", how: "small play times with one or two friends and an adult to help with turns",
      home: "play simple turn-taking games, like rolling a ball back and forth" },
    { id: "t-feel", area: "psed", label: "Feelings and settling",
      s: "settles well, goes to familiar adults for comfort and is growing in confidence", g: "is learning to cope with small upsets with a cuddle from a familiar adult",
      f: "settling and feeling secure after saying goodbye", how: "{their} key person greeting {them} each morning and staying close during the day",
      home: "keep goodbyes short and cheerful, and bring a {favourite} toy from home if it helps" },
    { id: "t-self", area: "psed", label: "Doing things for themselves",
      s: "uses a spoon and cup, helps to put on {their} shoes and loves to do things independently", g: "is starting to use a spoon and to help with {their} coat and shoes",
      f: "doing small things independently, like using a spoon or taking off {their} shoes", how: "time and encouragement to try at snack and home time",
      home: "give {name} time to try small jobs, like taking off socks or carrying a cup" },
    { id: "t-talk", area: "cl", label: "Talking",
      s: "uses lots of words and puts two or three together, like \"more juice please\"", g: "uses a growing number of single words and some two-word phrases",
      f: "using more words and putting two words together", how: "naming things during play, repeating what {name} says with one more word, and songs and books every day",
      home: "talk about what you're doing as you do it, and repeat {name}'s words back with one more (\"car\", \"red car\")" },
    { id: "t-understand", area: "cl", label: "Understanding",
      s: "understands simple questions and follows instructions like \"get your coat\"", g: "understands familiar words and simple instructions when we point or show",
      f: "understanding simple instructions in everyday routines", how: "short, clear instructions with pictures and gestures",
      home: "give one simple instruction at a time with a gesture (\"shoes on\" while pointing)" },
    { id: "t-move", area: "pd", label: "Moving",
      s: "walks, runs and climbs confidently and is learning to kick a ball", g: "walks steadily and enjoys climbing and pushing wheeled toys",
      f: "climbing, running and balancing with growing confidence", how: "plenty of outdoor play and movement games each day",
      home: "visit the park and try climbing, rolling and chasing games" },
    { id: "t-hands", area: "pd", label: "Using hands",
      s: "holds crayons, builds towers of several bricks and turns the pages of books", g: "enjoys making marks with crayons and is starting to build with bricks",
      f: "using hands and fingers in play, like stacking bricks and making marks", how: "play-dough, posting games and mark-making",
      home: "try play-dough, stacking cups or posting toys into a box" }
  ];
  var PRIME = { psed: "Personal, social and emotional development", cl: "Communication and language", pd: "Physical development" };
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(asks|loves|tries|keeps|is|explores|concentrates|sticks|finishes|plays|takes|shares|invites|names|calms|comforts|says|settles|comes|knows|finds|puts|washes|tidies|manages|talks|uses|joins|listens|follows|remembers|helps|enjoys|retells|recognises|recognizes|spots|claps|hears|draws|counts|sorts|explains|makes|tests|runs|jumps|climbs|pedals|catches|moves|holds|completes|builds|has)$/;
  var GROUP = { learn: "", social: "", language: "", math: "In {math}", explore: "", physical: "" };
  var OPENINGS = {
    settled: ["{name} has settled happily into {class} and comes in ready to play each day.", "{name} has made a lovely start in {class} and is growing in confidence every week."],
    confident: ["{name} has grown in confidence this {period} and is keen to try new things.", "It has been great to see {name} become more confident this {period}."],
    curious: ["{name} is a curious little learner who asks great questions.", "{name} brings real curiosity to {class} and loves finding out how things work."],
    kind: ["{name} is a kind and caring member of our class.", "{name} looks out for friends and is a thoughtful playmate."],
    none: [""]
  };
  var OPENINGS_END = {
    settled: ["{name} has had a wonderful year in {class} and has grown so much.", "{name} has made great progress this year and comes in ready to play every day."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home. I'm looking forward to the rest of the year with {name}.", "Thank you for all you do at home; I'm looking forward to seeing {name}'s progress next {period}."],
    end: ["{name} is ready for {next}, and I have loved having {them} in our class this year.", "Thank you for your support this year. {name} is ready for {next}."]
  };
  var PRON = { she: { their: "her", them: "her" }, he: { their: "his", them: "him" }, they: { their: "their", them: "them" } };
  var WORDS = {
    us: { math: "math", class: "pre-K", next: "kindergarten", peg: "cubby", colour: "color", favourite: "favorite", practise: "practice", practising: "practicing", recognises: "recognizes", recognising: "recognizing" },
    uk: { math: "maths", class: "nursery", next: "Reception", peg: "peg", colour: "colour", favourite: "favourite", practise: "practise", practising: "practising", recognises: "recognises", recognising: "recognising" }
  };

  function plural(vp) {
    return vp.replace(/(^|, and |, | and )(\w+)/g, function (m, sep, w) {
      if (sep && !VERBS.test(w)) return m;
      if (w === "is") w = "are"; else if (w === "has") w = "have";
      else if (/ies$/.test(w)) w = w.slice(0, -3) + "y";
      else if (/(ch|sh|x|ss|zz)es$/.test(w)) w = w.slice(0, -2);
      else if (/[^s]s$/.test(w)) w = w.slice(0, -1);
      return sep + w;
    });
  }
  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function fill(t, o) {
    var w = WORDS[o.style === "us" ? "us" : "uk"], p = PRON[o.pronoun] || PRON.they;
    return t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "period") return o.period || (o.style === "us" ? "quarter" : "term");
      if (k in w) return w[k];
      return m;
    }).replace(/\b(recognises|recognising)\b/g, function (m) { return w[m]; });
  }

  // opts: { name, pronoun, style: us|uk|two, timing: early|end, period,
  //         opening, moment, limit, levels: { areaId: "s"|"g"|"f" } }
  function build(o) {
    o = o || {};
    if (o.style === "two") return buildTwo(o);
    var levels = o.levels || {}, seed = hash(String(o.name || "") + (o.moment || ""));
    var strong = [], growing = [], focus = [];
    AREAS.forEach(function (a) {
      if (levels[a.id] === "s") strong.push(a); else if (levels[a.id] === "g") growing.push(a); else if (levels[a.id] === "f") focus.push(a);
    });
    var issues = [], total = strong.length + growing.length + focus.length;
    if (!total) return { ok: false, msg: "Pick a level for at least one area." };
    if (total > 5) issues.push({ level: "review", msg: "That's " + total + " areas. Most preschool comments read best with two or three; keep the rest for the checklist or a chat at pick-up." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the child does well, even a small thing; add a moment you noticed if nothing fits." });
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
    var onTrack = 0;
    AREAS.forEach(function (a, i) {
      if (levels[a.id] === "s") parts.push(sentence(a, pick(a.s, seed + i)));
      else if (levels[a.id] === "g") parts.push(sentence(a, pick(a.g, seed + i), (o.timing !== "end" && !onTrack++) ? ", which is just right for this point in the year" : ""));
    });
    var home = null;
    if (focus.length) {
      parts.push(o.timing === "end" ? "A good next step for the summer is " + focus[0].f + "." : "Our next step is " + focus[0].f + ", which we're {practising} " + focus[0].sch + ".");
      if (focus[1]) parts.push("We're also working on " + focus[1].f + ".");
      home = focus[0];
    } else if (growing.length) {
      parts.push((o.timing === "end" ? "Next year, {name} will keep working on " : "Next, we'll keep working on ") + growing[0].f + ".");
      home = growing[0];
    } else if (o.timing === "end") {
      parts.push("Over the summer, {name} can keep building on this by sharing books, songs and lots of play together.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a confident child's comment usually names one thing to aim for next." });
    }
    if (home) { parts.push("At home, you could " + home.home + "."); idxFew = parts.length; parts.push("A few minutes a few times a week is plenty."); }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return fill(p, o); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxFew >= 0) parts[idxFew] = ""; },
      function () { parts[idxClose] = o.timing === "end" ? "{name} is ready for {next}." : "Thank you for your support at home."; },
      function () { if (idxOpen >= 0 && (moment || strong.length)) parts[idxOpen] = ""; }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  // Progress check at age 2: a short written summary under the three prime
  // area headings, then what's going well, where extra support might help
  // and what the setting will do, a home idea and the sharing note.
  function buildTwo(o) {
    var levels = o.levels || {}, issues = [];
    var picked = TWO.filter(function (a) { return levels[a.id]; });
    if (!picked.length) return { ok: false, msg: "Pick a level for at least one area." };
    var lines = ["Progress check at age 2: {name}"];
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) lines.push("", "I loved seeing {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    ["psed", "cl", "pd"].forEach(function (k) {
      var inArea = picked.filter(function (a) { return a.area === k; });
      if (!inArea.length) { issues.push({ level: "review", msg: PRIME[k] + " has nothing picked. The check must cover all three prime areas." }); return; }
      var sents = inArea.map(function (a, i) {
        var subj = i === 0 ? "{name}" : (o.pronoun === "she" ? "She" : o.pronoun === "he" ? "He" : "They");
        var vp = levels[a.id] === "s" ? a.s : levels[a.id] === "g" ? a.g : "is working on " + a.f;
        if (i > 0 && o.pronoun === "they") vp = plural(vp);
        return subj + " " + vp + ".";
      });
      lines.push("", PRIME[k] + ": " + sents.join(" "));
    });
    var well = picked.filter(function (a) { return levels[a.id] === "s"; });
    var help = picked.filter(function (a) { return levels[a.id] === "f"; });
    var next = help.length ? help : picked.filter(function (a) { return levels[a.id] === "g"; });
    if (well.length) lines.push("", "Going well: " + well.map(function (a) { return a.label.toLowerCase(); }).join("; ") + ".");
    if (help.length) {
      lines.push("", "Where we'd like to give some extra support: " + help.map(function (a) { return a.f; }).join("; ") + ".");
      lines.push("How we'll help: " + help.map(function (a) { return a.how; }).join("; ") + ". We'll look at how it's going together in " + (o.review || "six weeks") + ".");
      if (o.senco) lines.push("With your agreement, we'll also ask our SENCO for ideas.");
    } else if (next.length) {
      lines.push("", "Next steps: " + next.map(function (a) { return a.f; }).join("; ") + ". How we'll help: " + next.map(function (a) { return a.how; }).join("; ") + ".");
    } else {
      lines.push("", "Next steps: we'll keep building on all of this with lots of play, talk and outdoor time.");
    }
    var homeFrom = (help[0] || next[0] || picked[0]);
    lines.push("", "At home, you could " + homeFrom.home + ".");
    lines.push("", "We'd love to hear what you see at home too, so we'll talk this summary through together. You might like to share it with your health visitor at the two-year health and development review.");
    var text = lines.map(function (l) { return fill(l, o); }).join("\n");
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var DIAG = /\b(adhd|autis\w*|asd|on the spectrum|dyslexi\w*|dyspraxi\w*|sensory processing|speech delay|language delay|developmental delay|delayed|speech therapy|speech therapist|iep|ifsp|504( plan)?|ehcp|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*)\b/i;
  var CHECKS = [
    [/\b(lazy|naughty|bad|rude|stubborn|defiant|disruptive|immature|babyish|clingy|whiny|whingey|hyper(active)?|wild|aggressive|bossy|a biter|a handful|a problem|terrible twos)\b/i, "fix", "Label: \"$1\". Describe what the child does and what helps instead (e.g. \"is learning to wait for a turn\" or \"finds goodbyes easier each week\")."],
    [/\b(behind|below (age|the expected) level|not meeting|failing|fails|weak|poor|slow learner|slow)\b/i, "review", "\"$1\" reads as a verdict on a three- or four-year-old. Say what the child can do now and what comes next."],
    [/\b(can'?t|cannot|unable to|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning to\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to parents."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true of a young child and is hard to hear. Say \"often\", \"sometimes\" or describe a specific moment."],
    [/\b(than (most|many|the other|other|some) (children|kids|students|classmates|of the class)|compared (to|with) (the class|the others|other children|classmates|(his|her|their) (friends|classmates|peers))|the rest of the (class|group)|most of the (class|group)|(youngest|oldest|smallest|best|worst) in the (class|group|room))\b/i, "fix", "Comparison with other children: \"$1\". Report on this child's own progress."],
    [/\b(divorc\w*|custody|(parents|mom|mum|dad) (are |have |has )?(separated|split up)|separation|single (mom|mum|dad|parent)|at (mom|mum|dad)'?s house|new baby|social worker|foster\w*|free (school )?(lunch|meals)|funded hours|30 hours|medication|meds)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report; talk about it in person if it matters."],
    [/\b(phonological|phonemic|cvc|graphemes?|phonemes?|cardinality|subitiz\w*|subitis\w*|self-regulation|gross motor|fine motor|elof|domain|sub-?domain|benchmark|ages and stages|asq(-3)?|teaching strategies gold|elgs?|early learning goals?|development matters|characteristics of effective (teaching and )?learning)\b/i, "review", "Jargon: \"$1\". Most parents won't know it; say what the child does (\"climbs the frame and catches a big ball\")."],
    [/\b(a joy to have in (class|the classroom|the room)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|tapestry|embark\w*|testament|truly|shines?|shining star|little ray of sunshine|superstar)\b/i, "note", "Stock phrase: \"$1\". Parents see it on every report (and it reads as AI-written). A specific moment says more."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student|child)\}|<name>|\bXX+\b|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/(\b(we|i) (are|am) (worried|concerned)|concerning|red flag|alarming)\b/i, "review", "\"$1\" on a written report can alarm a family. If you're worried, talk to them in person first and keep the written words to what you're working on."],
    [/\b(should (really )?be (able to|doing|talking|counting|using) .{0,20}by now|by now|at (his|her|their) age)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."]
  ];

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    var two = o.style === "two";
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (!m) return;
      issues.push({ level: c[1], msg: c[2].replace("$1", m[1] || m[0]) });
    });
    var d = t.match(DIAG) || t.match(/\b(SEND?)\b/);
    if (d) {
      if (two && /delay|therap|evaluat|assess|tested|special needs/i.test(d[1])) issues.push({ level: "review", msg: "\"" + d[1] + "\": the progress check must highlight any area where you're concerned about a possible delay and say what support you'll put in place, but it shouldn't name or suggest a diagnosis. Describe what you see and what you'll do, and talk it through with the parents (and your SENCO) before it's written down." });
      else issues.push({ level: "fix", msg: "Diagnosis or support-plan language: \"" + d[1] + "\". Never suggest or mention a diagnosis on a report; raise concerns with the family in person and follow your setting's process." });
    }
    var limit = Number(o.limit) || 0;
    if (limit && !two && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second area or the opening sentence." });
    if (!/\b(next|working on|work on|focus|goal|keep (practi[cs]ing|building|working)|aim|learning to|is learning|will keep|support)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one thing the child is working on next, so parents know where to help." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific activity is the part parents act on most." });
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another child's, check the pronouns." });
    if (o.name) {
      var nm = String(o.name).trim();
      if (nm && t.indexOf(nm) < 0) issues.push({ level: "review", msg: "The child's name (\"" + nm + "\") isn't in the comment. Was it written for someone else?" });
      if (/\s/.test(nm)) issues.push({ level: "note", msg: "Use the first name only, the way you'd talk to the family." });
    }
    var q = t.match(/[—–‘’“”…]/g);
    if (q) issues.push({ level: "note", msg: "Curly quotes, dashes or … (" + q.length + "). Some report systems show these as ? or boxes. \"Plain text\" below swaps them for straight ones." });
    if (two) {
      ["Personal, social and emotional", "Communication and language", "Physical development"].forEach(function (p) {
        if (t.indexOf(p) < 0) issues.push({ level: "review", msg: "No \"" + p + "\" section. The written summary must cover all three prime areas." });
      });
    }
    var sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 32; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 32 words. Shorter sentences are easier for families reading in a second language." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { AREAS: AREAS, TWO: TWO, PRIME: PRIME, plural: plural, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("pc-skills");
    if (!grid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function two() { return val("pc-style") === "two"; }
    function drawGrid() {
      var html = "", list = two() ? TWO : AREAS;
      var names = two() ? ["Progressing well", "Developing", "Some extra support"] : ["Strength", "On track", "Next step"];
      list.forEach(function (a) {
        html += "<label>" + esc(a.label) + (two() ? " <small>(" + esc(PRIME[a.area]) + ")</small>" : "") + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">" + names[0] + "</option><option value=\"g\">" + names[1] + "</option><option value=\"f\">" + names[2] + "</option></select></label>";
      });
      grid.innerHTML = html;
      Array.prototype.forEach.call(document.querySelectorAll(".pc-two"), function (e) { e.hidden = !two(); });
      Array.prototype.forEach.call(document.querySelectorAll(".pc-report"), function (e) { e.hidden = two(); });
    }
    drawGrid();
    document.getElementById("pc-style").addEventListener("change", function () { drawGrid(); out.innerHTML = ""; });
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      var senco = document.getElementById("pc-senco");
      return { name: val("pc-name").trim(), pronoun: val("pc-pronoun"), style: val("pc-style"), timing: val("pc-timing"), period: val("pc-period"), opening: val("pc-opening"), moment: val("pc-moment"), limit: two() ? 0 : val("pc-limit"), review: val("pc-review"), senco: senco && senco.checked, levels: levels };
    }
    var out = document.getElementById("pc-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"pc-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the text, then press Check again.</p>" +
        "<textarea id=\"pc-text\" rows=\"" + (two() ? 14 : 7) + "\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"pc-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"pc-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"pc-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("pc-text");
      ta.addEventListener("input", function () { document.getElementById("pc-count").textContent = ta.value.length; });
      document.getElementById("pc-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("pc-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("pc-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("pc-count").textContent = ta.value.length; });
    }
    document.getElementById("pc-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("pc-check").addEventListener("click", function () {
      var v = val("pc-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("pc-sample").addEventListener("click", function () {
      document.getElementById("pc-name").value = two() ? "Theo" : "Rosa";
      document.getElementById("pc-pronoun").value = two() ? "he" : "she";
      document.getElementById("pc-moment").value = two() ? "push the doll's pram all the way round the garden" : "count all the ducks in our pond book";
      var pre = two() ? { "t-play": "g", "t-feel": "s", "t-talk": "f", "t-understand": "g", "t-move": "s" } : { friends: "s", counting: "g", listening: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("pc-run").click();
    });
    document.getElementById("pc-next").addEventListener("click", function () {
      ["pc-name", "pc-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("pc-name").focus();
    });
  });
})();
