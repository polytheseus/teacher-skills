// Report card comment builder for English language learners (ELL / ESL / EAL),
// grades 1-8 / Years 2-9. Pick the student's stage of English, the area that's
// strongest and the one to work on next, a strength, what they show in other
// subjects, the support in class and a home tip, and it writes a comment that
// says what the student CAN do in English now, keeps subject knowledge separate
// from language, and is short and plain enough to translate. The checker flags
// deficit wording ("limited English", "language barrier"), programme labels,
// immigration or family details, advice to stop using the home language,
// comparisons with native speakers, diagnosis words, test-score jargon, idioms
// that don't translate, placeholders, mixed pronouns and characters that break
// report systems. Runs in the browser and in node (module.exports) for tests.
// Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name as its subject, so "they" never needs verb
  // agreement. {a|b} = UK|US wording.
  var STAGES = [
    { id: "new", label: "New to English", us: " (about WIDA level 1)" },
    { id: "early", label: "Early stages", us: " (about level 2)" },
    { id: "developing", label: "Developing", us: " (about level 3)" },
    { id: "expanding", label: "Expanding", us: " (about level 4)" },
    { id: "nearly", label: "Nearly fluent", us: " (level 5 or above)" }
  ];
  var DOMAINS = [
    { id: "listening", label: "Listening" }, { id: "speaking", label: "Speaking" },
    { id: "reading", label: "Reading" }, { id: "writing", label: "Writing" }
  ];
  // s = what the student does now (after the name), g = next step (after "working on").
  var ENGLISH = {
    "new": {
      listening: { s: "follows simple instructions, especially when they come with gestures and pictures", g: "following two-step instructions in class" },
      speaking: { s: "is starting to use single words and short phrases to ask for help and join in", g: "using short sentences to ask for help and answer questions" },
      reading: { s: "is learning letter sounds and {recognises|recognizes} some familiar words with picture support", g: "building a bank of everyday words to read" },
      writing: { s: "copies words, labels pictures and is starting to write simple words without help", g: "writing short sentences with a sentence starter" }
    },
    early: {
      listening: { s: "understands short instructions and familiar classroom talk", g: "understanding the key words in each new topic" },
      speaking: { s: "speaks in short phrases and simple sentences about familiar topics", g: "speaking in full sentences in class discussions" },
      reading: { s: "reads short, simple texts with pictures and familiar words", g: "reading simple texts and answering questions about them" },
      writing: { s: "writes simple sentences using sentence starters and word banks", g: "writing two or three linked sentences" }
    },
    developing: {
      listening: { s: "follows most class talk on familiar topics and picks out key information", g: "picking out the key details in longer explanations" },
      speaking: { s: "takes part in class discussions in longer sentences, sometimes pausing to find the right word", g: "explaining ideas with reasons, using words like because and so" },
      reading: { s: "reads {class|grade-level} texts with support and understands the main idea", g: "learning the new words in {class|grade-level} texts" },
      writing: { s: "writes short paragraphs with support, using some new topic words", g: "planning and writing a short paragraph without help" }
    },
    expanding: {
      listening: { s: "understands most class discussions, including on new topics", g: "asking questions to check understanding in longer discussions" },
      speaking: { s: "explains ideas and reasons in class discussions with growing confidence", g: "using subject words when explaining ideas" },
      reading: { s: "reads {class|grade-level} texts with some help for new words", g: "finding evidence in a text to explain {their} answers" },
      writing: { s: "writes {organised|organized} paragraphs and is starting to use linking words such as because, however and so", g: "using a wider range of linking words and sentence openings" }
    },
    nearly: {
      listening: { s: "understands class discussions and follows detailed explanations", g: "noticing how speakers back up their points" },
      speaking: { s: "explains, describes and gives opinions clearly in discussions", g: "giving reasons and examples in longer answers" },
      reading: { s: "reads {class|grade-level} texts independently and works out new words from the context", g: "reading more challenging texts" },
      writing: { s: "writes well-{organised|organized} pieces of writing", g: "choosing precise words and checking {their} own writing" }
    }
  };
  var STRENGTHS = [
    { id: "brave", label: "Has a go at speaking English", s: "has a go at speaking English, even when unsure, which takes real courage" },
    { id: "settled", label: "Settled well into class", s: "has settled well into our class routines" },
    { id: "friends", label: "Made friends, joins in", s: "has made good friends and joins in at {break time|recess}" },
    { id: "kind", label: "Kind to classmates", s: "is a kind classmate who notices when others need help" },
    { id: "hard", label: "Works hard", s: "works hard in every lesson and takes pride in {their} work" },
    { id: "curious", label: "Asks when something is new", s: "asks questions when something is new, which helps {their} learning" },
    { id: "watches", label: "Watches and listens closely", s: "listens carefully and watches closely to understand what's happening" },
    { id: "shares", label: "Shares their home language", s: "has taught our class words and greetings in {their} home language" },
    { id: "helpful", label: "Helpful in class", s: "is quick to help in class, whether that's handing out books or tidying up" },
    { id: "positive", label: "Positive attitude", s: "comes into class with a positive attitude and a smile" }
  ];
  // What the student shows outside English (the content), so the comment keeps
  // subject knowledge separate from language.
  var CONTENT = [
    { id: "", label: "(none)", s: "" },
    { id: "math", label: "Strong in {maths|math}", s: "shows a good understanding of {maths|math}, especially when problems use numbers, pictures and models" },
    { id: "science", label: "Understands science", s: "understands our science topics well and shows it in diagrams, models and practical work" },
    { id: "art", label: "Art and design", s: "expresses ideas confidently in art and design" },
    { id: "pe", label: "PE and games", s: "joins in fully in PE and games, which is also a great way to build everyday English" },
    { id: "music", label: "Music", s: "brings real enthusiasm to music and picks up songs quickly" },
    { id: "literate", label: "Reads and writes in home language", s: "reads and writes in {their} home language, which is a real strength to build on" },
    { id: "shows", label: "Shows understanding in other ways", s: "shows understanding in many ways, including drawings, models and talking with a partner" }
  ];
  var SUPPORTS = [
    { id: "visuals", label: "Pictures and visuals", s: "pictures" },
    { id: "frames", label: "Sentence starters", s: "sentence starters" },
    { id: "words", label: "Word bank for each topic", s: "a word bank for each topic" },
    { id: "preteach", label: "Key words taught before a topic", s: "new topic words taught before each lesson" },
    { id: "partner", label: "Partner talk before writing", s: "partner talk before writing" },
    { id: "buddy", label: "Buddy who shares their language", s: "a buddy who speaks the same home language" },
    { id: "group", label: "Small-group {EAL|English (ELD)} sessions", s: "small-group {EAL|English language (ELD)} sessions" },
    { id: "dictionary", label: "Bilingual dictionary", s: "a bilingual dictionary" }
  ];
  var DEFAULT_SUPPORTS = { "new": ["visuals", "words"], early: ["visuals", "frames"], developing: ["frames", "words"], expanding: ["preteach", "partner"], nearly: ["preteach"] };
  var HOME = [
    { id: "homelang", label: "Keep using the home language", s: "At home, keep reading, talking and telling stories together in your home language.", why: "A strong home language helps children learn English." },
    { id: "talk", label: "Talk about the school day", s: "At home, ask {name} to tell you about the school day, in any language.", why: "Talking about learning helps it stick." },
    { id: "library", label: "Library books in both languages", s: "At home, borrow library books in English and in your home language, and talk about the pictures together.", why: "" },
    { id: "listen", label: "Stories and audiobooks in English", s: "At home, listen to stories or audiobooks in English together for a few minutes a day.", why: "Hearing English for fun builds vocabulary." },
    { id: "teach", label: "Teach you new English words", s: "At home, ask {name} to teach you three new English words from school each week.", why: "" }
  ];
  var CONTACT = {
    plain: "Please get in touch if you have any questions.",
    interp: "If it would help, we can arrange an interpreter for a meeting; please get in touch."
  };
  var CLOSES = {
    early: ["{name} is making steady progress, and I'm looking forward to the next {period}.", "{name} has made a great start, and I'm looking forward to seeing the progress next {period}."],
    end: ["{name} has made real progress in English this year and is ready for the next step.", "I have enjoyed teaching {name} this year, and I know the progress made will carry into next year."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = {
    us: { period: "quarter" },
    uk: { period: "term" }
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
      });
  }
  function list(items) { return items.length < 2 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1]; }

  // opts: { name, pronoun, style: us|uk, timing: early|end, period, stage,
  //         strong: domain id, focus: domain id, strengths: [id], content: id,
  //         improved: "text", supports: [id], home: id, interp: yes|no, limit }
  function build(o) {
    o = o || {};
    var stage = find(STAGES, o.stage) ? o.stage : "";
    if (!stage) return { ok: false, msg: "Pick the student's stage of English." };
    var strong = ENGLISH[stage][o.strong] ? o.strong : (stage === "new" ? "listening" : "speaking");
    var focus = ENGLISH[stage][o.focus] ? o.focus : "writing";
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    var content = find(CONTENT, o.content || "");
    var supports = (o.supports || []).map(function (id) { return find(SUPPORTS, id); }).filter(Boolean);
    var home = find(HOME, o.home) || HOME[0];
    var issues = [], seed = hash(String(o.name || "") + stage + strong + focus);
    var improved = String(o.improved || "").trim().replace(/[.!]+$/, "");
    if (!strengths.length && !improved) issues.push({ level: "review", msg: "No strength picked. Start with something true and specific; for a student new to English, settling in, making friends and having a go all count." });
    if (supports.length > 3) { issues.push({ level: "note", msg: "Used the first three supports; families only need the main ones." }); supports = supports.slice(0, 3); }
    if (!supports.length) { supports = DEFAULT_SUPPORTS[stage].map(function (id) { return find(SUPPORTS, id); }); issues.push({ level: "note", msg: "No supports ticked, so it used typical ones for this stage (" + list(supports.map(function (s) { return fill(s.s, o); })) + "). Tick the ones you really use." }); }
    var parts = [], idxS2 = -1, idxWhy = -1, idxContent = -1;
    if (strengths[0]) parts.push("{name} " + strengths[0].s + ".");
    if (strengths[1]) { idxS2 = parts.length; parts.push("{name} " + (/^is /.test(strengths[1].s) ? strengths[1].s.replace(/^is /, "is also ") : /^has (?!a go)/.test(strengths[1].s) ? strengths[1].s.replace(/^has /, "has also ") : "also " + strengths[1].s) + "."); }
    if (improved) parts.push("Since the start of the " + (o.timing === "end" ? "year" : "{period}") + ", {name} " + improved.charAt(0).toLowerCase() + improved.slice(1) + ".");
    if (content && content.s) { idxContent = parts.length; parts.push("{name} " + content.s + "."); }
    parts.push("In English, {name} " + ENGLISH[stage][strong].s + ".");
    parts.push("Next, {name} is working on " + ENGLISH[stage][focus].g + ".");
    parts.push("In class, {name} is supported with " + list(supports.map(function (s) { return s.s; })) + ".");
    parts.push(home.s);
    if (home.why) { idxWhy = parts.length; parts.push(home.why); }
    parts.push(o.interp === "yes" ? CONTACT.interp : CONTACT.plain);
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxWhy >= 0) parts[idxWhy] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { parts[idxClose] = ""; },
      function () { if (idxContent >= 0) { parts[idxContent] = ""; issues.push({ level: "note", msg: "Dropped the other-subjects line to fit your limit; it's worth keeping if you can, so the family knows English isn't the whole picture." }); } }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var IDIOMS = "piece of cake|on the ball|hit the books|hit the ground running|flying colou?rs|go(es|ing)? the extra mile|in a nutshell|rising star|bright spark|head in the clouds|tip of the iceberg|sky'?s the limit|ups and downs|touch base|learning curve|out of (his|her|their) shell|on the same page|get(ting)? the hang of|gets the hang of|keep (it|this) up|a whiz|whizz|top notch|second to none|bear with|by leaps and bounds|leaps and bounds|turned a corner|turn(ed|ing)? over a new leaf|full of beans|a breeze|on track|up to speed|pull(ing)? (his|her|their) socks up|make strides|making strides|ticks all the boxes|ticking all the boxes";
  var CHECKS = [
    [/\b(language barrier|limited English|lack of English|lacks English|(no|little|very little|basic|broken|poor|bad|weak|low) English|English is (poor|weak|bad|limited|low|very basic|not good)|non[- ]English[- ]speak\w*|non[- ]native|knows no English)\b/i, "fix", "Deficit wording: \"$1\". Say what the student can do in English now (\"speaks in short phrases about familiar topics\") and the next step."],
    [/\b((can'?t|cannot|doesn'?t|does not|unable to|won'?t) (speak|understand|read|write|follow) (any )?English)\b/i, "fix", "\"$1\" says what's missing. Describe what the student does now and what comes next."],
    [/\b((an|the|our) (ESL|ELL|EAL|LEP|EL) (kid|student|child|pupil|learner)s?|(an|the) (ESL|ELL|EAL|LEP)\b|ESL kids?)/, "review", "\"$1\" describes the child by a programme. Write about what they can do; name the programme only for the support (\"in our EAL group\")."],
    [/\b(undocumented|illegal(ly)?|immigrants?|immigration|refugees?|asylum|visas?|migrants?|deport\w*|fled|war[- ]torn|green card|citizenship|residency)\b/i, "fix", "Immigration or legal-status detail: \"$1\". Keep it out of the report; it's private and reports get forwarded and kept."],
    [/\b(came (here )?from|moved here from|arrived (here )?from|(his|her|their) (home )?country|back home in|newcomer from)\b/i, "review", "\"$1\": where the family is from isn't needed in a report comment. Write about the learning since the student joined your class."],
    [/\b((parents?|mom|mum|dad|mother|father|family|guardians?) (doesn'?t|don'?t|does not|do not|can'?t|cannot) (speak|read|understand|write) (any |much )?English|(parents?|mom|mum|dad|mother|father|family) (speaks?|speak) (little|no) English|no English (is )?spoken at home)\b/i, "fix", "Family language detail: \"$1\". Leave it out; offer an interpreter or a translated copy instead, if your school does that."],
    [/\b(speak(ing)? (more |only )?English at home|(only|more) English at home|English[- ]only at home|stop (speaking|using) \w+( \w+)?|use less \w+ at home|less (\w+ )?(home|first|native) language)\b/i, "review", "\"$1\": WIDA's score report guide notes that a strong foundation in the home language is a good predictor of English development. Encourage reading and talking in the home language instead."],
    [/\b(accent)\b/i, "review", "\"$1\": an accent isn't something to fix on a report. Comment on being understood and on vocabulary instead, if needed."],
    [/\b((because of|due to) (his|her|their|a lack of|limited|low) (English|language( skills)?))\b/i, "review", "\"$1\" mixes language with subject knowledge. Say what the student understands in the subject, and separately what's next in English."],
    [/\b(native (English )?speakers?|than (most|many|the other|other|the rest of) (children|kids|students|classmates|pupils|the class)|the rest of the class|most of the class|other (ELLs|ESL students|EAL pupils|EAL children)|compared (to|with) (the class|the others|(his|her|their) (classmates|peers|friends))|(lowest|weakest|bottom) (in|of) the (class|group|year)|bottom (group|set))\b/i, "fix", "Comparison: \"$1\". Report on this student's own progress in English."],
    [/\b(adhd|autis\w*|on the spectrum|dyslexi\w*|dyscalculi\w*|dyspraxi\w*|learning (disability|difficulty|difficulties)|speech (delay|therapy|therapist)|language (delay|disorder)|iep|504( plan)?|ehcp|special needs|special education|sped|needs (to be )?(tested|assessed|evaluated)|diagnos\w*|medicat\w*)\b/i, "fix", "Diagnosis or support-plan language: \"$1\". Learning a new language isn't a learning difficulty; if you have a concern, raise it with your EL and SEN/special education colleagues and the family, not in the report."],
    [/\b(SEND|SEN|SLP)\b/, "fix", "Support-plan language: \"$1\". Keep it out of the report unless your school's policy says otherwise."],
    [/\b(lazy|unmotivated|careless|naughty|rude|stubborn|defiant|disruptive|immature|sloppy|uncooperative|weak student|slow learner|slow)\b/i, "fix", "Label: \"$1\". Describe what the student does and what's helping instead."],
    [/\b(won'?t (speak|talk|answer)|refuses to (speak|talk|answer)|(very |extremely |too )?shy|doesn'?t (speak|talk) (in class|at all)|does not (speak|talk)|silent|mute)\b/i, "review", "\"$1\": a quiet stage is common and normal when learning a new language. Describe what the student does (\"follows routines and answers with gestures and single words\")."],
    [/\b(can'?t|cannot|unable to|refuses to|doesn'?t (even )?(try|listen)|does not listen)\b/i, "review", "\"$1\" puts the gap first. Try \"is starting to\", \"is learning to\" or describe what happens now."],
    [/\b(failing|is failing|below (grade|age|the expected) level|behind)\b/i, "review", "\"$1\": if a grade is low because the test was in English, say what the student does understand and how they show it. Make sure the family has heard it from you, with an interpreter if needed."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or give an example."],
    [new RegExp("\\b(" + IDIOMS + ")\\b", "i"), "review", "Idiom: \"$1\". Families reading in a second language, or through a translation app, may not understand it. Use plain words."],
    [/\b((WIDA|ACCESS|ELPAC|TELPAS|NYSESLAT|ELPA21|NYSITELL|LAS Links)\b[^.]*?\d(\.\d)?|level [1-6](\.\d)?\b|scale score|composite score|proficiency level \d)/i, "note", "Test level: \"$1\". A number means little to most families. Describe what the student can do; if your school reports the level, it usually has its own box for it."],
    [/\b(phonemic|phonological|decod\w*|morpholog\w*|scaffold\w*|BICS|CALP|silent period|receptive (language|skills)|productive (language|skills)|academic discourse|key language uses?|ELD standards?|language domains?|proficiency level descriptors?|tier [123] vocabulary)\b/i, "note", "Teacher jargon: \"$1\". Families won't know it and it translates badly. Say what the student does."],
    [/\b(L1|L2)\b/, "note", "Teacher jargon: \"$1\". Say \"home language\" or \"English\"."],
    [/\b(divorc\w*|custody|separated|single (mom|mum|dad|parent)|bereave\w*|social worker|foster\w*|free (school )?(lunch|meals)|trauma\w*)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/(\[(name|student|child|first name|pronoun|home language|language)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shining star|superstar)\b/i, "note", "Stock phrase: \"$1\". It reads as generic (and as AI-written), and it translates badly. Name a real strength."],
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
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. Turn one into \"next, X is working on\" and say how you're helping." });
    if (!/\b(supported|support|to help|we'?re|we are|we have|we've|I'm|I am|small[- ]group|buddy|word bank|sentence starters?|visuals|helping)\b/i.test(t)) issues.push({ level: "review", msg: "No support mentioned. Say what helps in class (pictures, sentence starters, a word bank), so the family knows the school is on it." });
    if (!/\b(next|working on|work on|focus|goal|aim|learning to|is learning|starting to)\b/i.test(t)) issues.push({ level: "review", msg: "No next step in English. Name one specific thing the student is working on next." });
    if (!/\b(can|now|understands|follows|reads|writes|speaks|explains|uses|joins|takes part|recogni[sz]es|copies|labels|is starting to|answers|has a go)\b/i.test(t)) issues.push({ level: "review", msg: "Nothing the student can do in English yet. Start from what they do now, however small (\"follows class routines\", \"uses single words to ask for help\")." });
    if (!/\b(at home|home language|home|together|family)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. Reading and talking together in the home language is one of the most useful things families can do." });
    if (!/\b(get in touch|contact|call|email|meet|talk (to|with)|questions|let me know|reach out|interpreter)\b/i.test(t)) issues.push({ level: "note", msg: "No invitation to talk. If your school can arrange an interpreter, offer it here." });
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
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 22; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 22 words. Short sentences are easier to read in a second language and come out better in translation apps." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { STAGES: STAGES, DOMAINS: DOMAINS, ENGLISH: ENGLISH, STRENGTHS: STRENGTHS, CONTENT: CONTENT, SUPPORTS: SUPPORTS, HOME: HOME, build: build, check: check, plain: plain, fill: fill };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(items) {
    return items.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("el-strengths"), pGrid = document.getElementById("el-supports");
    if (!sGrid || !pGrid) return;
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    function options(sel, items, o, suffix) {
      var keep = sel.value;
      sel.innerHTML = items.map(function (x) { return "<option value=\"" + x.id + "\">" + esc(fill(x.label, o) + (suffix ? suffix(x) : "")) + "</option>"; }).join("");
      if (keep) sel.value = keep;
    }
    function render() {
      var o = { style: val("el-style") }, ck = { s: checked(sGrid), p: checked(pGrid) };
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      pGrid.innerHTML = SUPPORTS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = ck.s.indexOf(i.value) >= 0; });
      Array.prototype.forEach.call(pGrid.querySelectorAll("input"), function (i) { i.checked = ck.p.indexOf(i.value) >= 0; });
      options(el("el-stage"), STAGES, o, function (x) { return o.style === "uk" ? "" : x.us; });
      options(el("el-content"), CONTENT, o);
      options(el("el-home"), HOME, o);
    }
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    if (!el("el-stage").value) el("el-stage").innerHTML = "<option value=\"developing\"></option>";
    render();
    el("el-stage").value = el("el-stage").value || "developing";
    function opts() {
      return { name: val("el-name").trim(), pronoun: val("el-pronoun"), style: val("el-style"), timing: val("el-timing"), period: val("el-period"),
        stage: val("el-stage"), strong: val("el-strong"), focus: val("el-focus"), strengths: checked(sGrid), content: val("el-content"),
        improved: val("el-improved"), supports: checked(pGrid), home: val("el-home"), interp: val("el-interp"), limit: val("el-limit") };
    }
    el("el-style").addEventListener("change", function () { render(); el("el-period").value = this.value === "uk" ? "term" : "quarter"; });
    var out = el("el-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"el-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"el-text\" rows=\"8\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"el-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"el-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"el-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = el("el-text");
      ta.addEventListener("input", function () { el("el-count").textContent = ta.value.length; });
      el("el-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      el("el-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      el("el-plain").addEventListener("click", function () { ta.value = plain(ta.value); el("el-count").textContent = ta.value.length; });
    }
    el("el-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    el("el-check").addEventListener("click", function () {
      var v = val("el-paste");
      show(v, check(v, opts()), v.length);
    });
    el("el-sample").addEventListener("click", function () {
      el("el-name").value = "Mateo";
      el("el-pronoun").value = "he";
      el("el-stage").value = "early";
      el("el-strong").value = "speaking";
      el("el-focus").value = "writing";
      el("el-content").value = "math";
      el("el-home").value = "homelang";
      el("el-interp").value = "yes";
      el("el-improved").value = "has started asking for help in English when he's stuck";
      var pre = { brave: 1, friends: 1, visuals: 1, frames: 1, buddy: 1 };
      [sGrid, pGrid].forEach(function (g) { Array.prototype.forEach.call(g.querySelectorAll("input"), function (i) { i.checked = !!pre[i.value]; }); });
      el("el-run").click();
    });
    el("el-next").addEventListener("click", function () {
      ["el-name", "el-improved"].forEach(function (id) { el(id).value = ""; });
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = false; });
      out.innerHTML = ""; el("el-name").focus();
    });
  });
})();
