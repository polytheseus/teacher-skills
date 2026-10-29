// Reading and writing (ELA / English) report card comment builder and checker.
// Pick a grade band and a level for the strands you want to mention (strength,
// on track, next step), add one moment you noticed, and it writes a comment in
// the strength, next step, home tip pattern. The checker flags labels ("lazy",
// "reluctant reader", "poor speller", "not a reader"), reading-level codes
// families won't understand, comparisons and groups, diagnosis and family
// details, teacher jargon (digraph, decoding, fronted adverbials), "always" /
// "never", placeholders, mixed pronouns, US/UK spelling mix-ups, curly quotes
// and missing next steps or home tips. Runs in the browser and in node
// (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Bands: k2 = grades K-2 (UK Years 1-3), 35 = grades 3-5 (Years 4-6),
  // 68 = grades 6-8 (Years 7-9). Any field can be a value or { band: value }.
  // group: r = reading, w = writing, t = speaking and listening.
  // s = strengths and g = on track (3rd person verb phrases), f = next step
  // (noun phrase), sch = how school works on it, home = one home activity.
  // Text is written in UK spelling; fill() converts it for US wording.
  var BANDS = { k2: "Grades K–2", "35": "Grades 3–5", "68": "Grades 6–8" };
  var BANDS_UK = { k2: "Years 1–3", "35": "Years 4–6", "68": "Years 7–9" };
  var GROUPS = { r: "Reading", w: "Writing", t: "Speaking and listening" };
  var AREAS = [
    { id: "phonics", group: "r", bands: ["k2"], label: "Phonics and sounding out",
      s: ["knows all {their} letter sounds and blends them quickly to read new words", "sounds out unfamiliar words confidently, including words where two letters make one sound, such as sh and ee"],
      g: ["knows most letter sounds and is learning to blend them to read short words", "sounds out simple words and is learning the sounds that two letters make together, such as sh, ch and ee"],
      f: "sounding out longer words, using the letter patterns we've been learning", sch: "in short daily phonics lessons",
      home: "point to words on signs and packets and sound them out together" },
    { id: "sight", group: "r", bands: ["k2"], label: "{Sight}",
      s: ["reads all {their} {sight} straight away and spells many of them correctly", "recognises a wide range of {sight} instantly, which makes {their} reading smooth"],
      g: ["reads many {sight} instantly and is learning new ones each week", "recognises the {sight} we've practised and is starting to spell them"],
      f: "reading and spelling {sight} such as said, was and they", sch: "with quick games and flashcards",
      home: "play a quick game of spotting {sight} in a favourite book" },
    { id: "fluency", group: "r", bands: ["k2", "35", "68"], label: "Reading aloud",
      s: { k2: ["reads aloud smoothly and with expression, changing {their} voice for different characters", "reads familiar books fluently and corrects {their} own mistakes"],
           "35": ["reads aloud fluently and with expression, pausing at punctuation", "reads longer books smoothly and at a good pace, which helps {them} follow the story"],
           "68": ["reads aloud confidently and with expression, even with challenging texts", "reads complex texts smoothly and adjusts {their} pace to suit the text"] },
      g: { k2: ["reads simple books aloud and is becoming smoother each week", "reads familiar books with growing confidence and is starting to correct {their} own mistakes"],
           "35": ["reads aloud accurately and is working on adding expression", "reads at a steady pace and is learning to pause at punctuation"],
           "68": ["reads aloud clearly and is building confidence with longer, harder texts", "reads accurately and is working on pace and expression with more challenging texts"] },
      f: { k2: "reading smoothly rather than word by word", "35": "reading aloud with expression and pausing at {stops} and commas", "68": "reading challenging texts aloud with confidence and expression" },
      sch: { k2: "by rereading familiar books", "35": "with paired reading and rereading short passages", "68": "with paired reading and short performance readings" },
      home: { k2: "take turns reading pages of a favourite book aloud", "35": "listen to {name} read aloud for ten minutes and take turns reading pages", "68": "ask {name} to read a short article or recipe aloud now and then" } },
    { id: "comprehension", group: "r", bands: ["k2", "35", "68"], label: "Understanding what {they_read}",
      s: { k2: ["retells stories in order with lots of detail", "answers questions about a story and explains {their} answers using the pictures and words"],
           "35": ["summarises chapters clearly and picks out the main ideas", "answers questions about a text in detail and backs up {their} answers with examples from the book"],
           "68": ["summarises complex texts accurately and identifies the central idea", "understands challenging texts and explains how ideas develop across a chapter or article"] },
      g: { k2: ["retells the main events of a story and is learning to include more detail", "answers simple questions about a story and is learning to explain {their} answers"],
           "35": ["understands the main events in a story and is learning to summarise them in a few sentences", "answers questions about a text and is starting to back up answers with examples"],
           "68": ["identifies the main idea of a text and is learning to summarise it concisely", "follows the main argument of a text and is building confidence with more challenging reading"] },
      f: { k2: "retelling a story in order, with a beginning, middle and end", "35": "summarising a chapter in a few sentences", "68": "summarising a text in {their} own words and identifying the central idea" },
      sch: { k2: "with story maps and retelling games", "35": "with short summaries after each chapter", "68": "with short written summaries and discussion" },
      home: { k2: "ask {name} to tell you what happened in a story after you read it together", "35": "ask {name} to sum up a chapter in three sentences at bedtime", "68": "ask {name} to explain the main point of a news article or video you've both seen" } },
    { id: "inference", group: "r", bands: ["35", "68"], label: "Reading between the lines",
      s: { "35": ["reads between the lines, working out how characters feel and why", "makes thoughtful predictions and explains them with clues from the text"],
           "68": ["makes insightful inferences and supports them with well-chosen quotations", "reads between the lines and explains what the author is suggesting"] },
      g: { "35": ["makes sensible predictions and is learning to work out how characters feel", "is starting to read between the lines and find clues in the text"],
           "68": ["makes reasonable inferences and is learning to support them with quotations", "is starting to explain what a writer suggests, not only what happens"] },
      f: { "35": "working out how characters feel and why, using clues in the text", "68": "backing up an inference with a short quotation and an explanation" },
      sch: { "35": "through class discussion of our shared book", "68": "with sentence frames for explaining evidence" },
      home: { "35": "ask \"how do you think that character feels? What makes you think so?\" when reading or watching TV together", "68": "talk about a film or show together and ask why a character made a particular choice" } },
    { id: "vocab", group: "r", bands: ["k2", "35", "68"], label: "Vocabulary",
      s: { k2: ["uses interesting new words when speaking and writing", "asks about new words and remembers them"],
           "35": ["uses interesting new words in speaking and writing", "works out the meaning of new words from the words around them"],
           "68": ["uses precise, ambitious vocabulary in discussion and writing", "works out the meaning of unfamiliar words from context and word parts"] },
      g: ["is learning new words from {their} reading and is starting to use them in {their} writing", "asks about new words and is getting better at working out their meaning"],
      f: "working out the meaning of new words and using them in {their} own writing", sch: "by collecting new words from our class reading",
      home: "talk about interesting words you come across together and try using them in conversation" },
    { id: "habit", group: "r", bands: ["k2", "35", "68"], label: "Reading habits and choosing books",
      s: ["reads widely and chooses books across different genres", "is enthusiastic about books and shares recommendations with the class"],
      g: ["reads regularly and is trying books from new genres", "is building a regular reading habit and is starting to choose books with more confidence"],
      f: { k2: "reading a little every day and talking about the books we share", "35": "reading for twenty minutes a day and trying a wider range of books", "68": "reading for twenty minutes a day and trying a wider range of books" },
      sch: "with time for independent reading and book recommendations",
      home: { k2: "share a bedtime story every day and let {name} choose some of the books", "35": "visit the library together and let {name} choose books that interest {them}", "68": "visit the library together and let {name} choose books that interest {them}" } },
    { id: "nonfiction", group: "r", bands: ["35", "68"], label: "Non-fiction and research",
      s: { "35": ["finds information quickly using headings, contents pages and indexes", "reads non-fiction confidently and takes clear notes"],
           "68": ["researches topics independently and judges whether a source is reliable", "reads non-fiction critically and compares information from different sources"] },
      g: { "35": ["uses headings and pictures to find information and is learning to take notes", "reads non-fiction and is learning to pick out the key facts"],
           "68": ["finds relevant information and is learning to judge whether a source is reliable", "takes notes from non-fiction and is learning to put ideas in {their} own words"] },
      f: { "35": "finding key facts in non-fiction and taking short notes", "68": "checking whether a source is reliable and putting research in {their} own words" },
      sch: { "35": "with our topic research projects", "68": "with short research tasks in class" },
      home: { "35": "read a non-fiction book or website together about something {name} is interested in", "68": "look at a news story together and talk about how you'd check it's true" } },
    { id: "analysis", group: "r", bands: ["68"], label: "Analysing texts",
      s: ["analyses how writers use language and structure to create effects", "writes thoughtful responses about theme and character, using evidence from the text"],
      g: ["comments on the writer's choices and is learning to explain their effect", "identifies themes in a text and is learning to support {their} ideas with evidence"],
      f: "explaining how a writer's word choices create an effect on the reader", sch: "with close reading of short extracts and modelled paragraphs",
      home: "ask {name} what message a book, song or film is trying to get across, and why" },
    { id: "handwriting", group: "w", bands: ["k2", "35"], label: "Handwriting",
      s: { k2: ["forms {their} letters correctly and writes neatly on the line", "writes clearly with well-formed letters and spaces between words"],
           "35": ["writes neatly and clearly, and {their} handwriting is easy to read", "has clear, consistent handwriting and takes pride in presentation"] },
      g: { k2: ["forms most letters correctly and is learning to keep them on the line", "is becoming more consistent with letter sizes and spaces between words"],
           "35": ["writes legibly and is learning to keep letters a consistent size", "is developing a neater, more consistent handwriting style"] },
      f: { k2: "forming letters correctly, starting each one in the right place", "35": "keeping {their} handwriting neat and consistent in longer pieces" },
      sch: { k2: "with short daily handwriting practice", "35": "with short handwriting warm-ups" },
      home: { k2: "write shopping lists or cards together, so {name} can practise letters in a real task", "35": "ask {name} to write a list, card or note for the family now and then" } },
    { id: "spelling", group: "w", bands: ["k2", "35", "68"], label: "Spelling",
      s: { k2: ["spells many common words correctly and uses {their} sounds to spell new words", "uses phonics well to spell new words in a way that can be easily read"],
           "35": ["spells accurately, including longer and less common words", "applies spelling patterns and rules confidently in {their} writing"],
           "68": ["spells accurately, even with ambitious vocabulary", "spells accurately and checks unfamiliar words carefully"] },
      g: { k2: ["spells simple words by sounding them out and is learning common spelling patterns", "writes words that can be read by sounding them out and is learning to spell {sight}"],
           "35": ["spells most common words correctly and is learning new spelling patterns each week", "spells well in spelling tests and is starting to carry that into {their} writing"],
           "68": ["spells most words correctly and is learning to check tricky ones", "spells accurately in most writing and is working on a few commonly confused words"] },
      f: { k2: "spelling common words correctly, using the sounds we've learned", "35": "using the spelling patterns we learn each week in {their} everyday writing", "68": "checking spellings carefully when editing, especially commonly confused words" },
      sch: { k2: "with daily phonics and spelling games", "35": "with weekly spelling patterns and practice", "68": "with a personal spelling list" },
      home: { k2: "play spelling games such as I spy with sounds", "35": "practise this week's spelling words in a quick game, a few minutes at a time", "68": "help {name} keep a short list of tricky words to check when proofreading" } },
    { id: "sentences", group: "w", bands: ["k2", "35", "68"], label: "Sentences and punctuation",
      s: { k2: ["writes clear sentences with capital letters and {stops}", "writes in full sentences and uses joining words such as and, but and because"],
           "35": ["uses a wide range of punctuation accurately, including commas and apostrophes", "writes varied sentences that start in different ways, which makes {their} writing interesting to read"],
           "68": ["controls sentence structure confidently and uses a range of punctuation for effect", "varies sentence length and structure to suit {their} purpose"] },
      g: { k2: ["writes simple sentences and is learning to use capital letters and {stops} each time", "is starting to write more than one sentence and to use joining words such as because"],
           "35": ["uses capital letters and {stops} accurately and is learning to use commas", "writes in full sentences and is learning to vary how they start"],
           "68": ["punctuates accurately and is learning to vary sentence structure", "uses commas and apostrophes correctly and is moving on to semicolons and colons"] },
      f: { k2: "using a capital letter and a {stop} in every sentence", "35": "using commas and apostrophes accurately", "68": "varying sentence structure and using semicolons and colons accurately" },
      sch: { k2: "with daily sentence writing", "35": "with short daily grammar warm-ups", "68": "by studying model sentences from our class texts" },
      home: { k2: "ask {name} to write a sentence or two about the day, such as a caption for a photo", "35": "write a short note or message together and check the punctuation", "68": "encourage {name} to read {their} writing aloud to hear where the punctuation should go" } },
    { id: "organisation", group: "w", bands: ["k2", "35", "68"], label: "Planning and organising writing",
      s: { k2: ["writes stories with a clear beginning, middle and end", "plans {their} ideas before writing and puts events in order"],
           "35": ["organises writing into clear paragraphs with a strong opening and ending", "plans carefully and builds {their} ideas logically through a piece"],
           "68": ["structures essays clearly, with well-developed paragraphs and smooth transitions", "plans carefully and links ideas logically across a longer piece"] },
      g: { k2: ["puts events in order and is learning to add an ending to {their} stories", "is learning to plan {their} ideas with pictures before writing"],
           "35": ["plans before writing and is learning to group ideas into paragraphs", "writes with a clear beginning and is working on a strong ending"],
           "68": ["organises ideas into paragraphs and is learning to link them with transitions", "plans before writing and is building confidence with longer essays"] },
      f: { k2: "planning a story with a beginning, middle and end", "35": "organising writing into paragraphs, each with one main idea", "68": "linking paragraphs with clear transitions in longer essays" },
      sch: { k2: "with story maps and picture plans", "35": "with planning frames", "68": "with essay planning templates and model essays" },
      home: { k2: "make up stories together at bedtime, with a beginning, middle and end", "35": "ask {name} to tell you the plan for a story before writing it", "68": "ask {name} to talk you through the plan for an essay before starting to write" } },
    { id: "ideas", group: "w", bands: ["k2", "35", "68"], label: "Ideas and detail",
      s: { k2: ["writes imaginative stories full of interesting ideas", "adds describing words to bring {their} writing to life"],
           "35": ["writes imaginative stories with vivid description", "adds detail and description that bring {their} writing to life"],
           "68": ["writes with a strong, individual voice and engaging ideas", "develops ideas in depth with well-chosen detail"] },
      g: { k2: ["has lots of ideas and is learning to add more detail", "writes about {their} own experiences and is starting to add describing words"],
           "35": ["has good ideas and is learning to add more detail and description", "is starting to use describing words and is learning to show how characters feel"],
           "68": ["has thoughtful ideas and is learning to develop them in more depth", "writes clearly and is learning to add detail that keeps the reader interested"] },
      f: { k2: "adding describing words to make {their} writing more interesting", "35": "adding detail and description, showing rather than telling", "68": "developing ideas in depth, with detail that supports {their} point" },
      sch: "by looking at examples from books we read together",
      home: { k2: "talk about the pictures in books together and find describing words", "35": "ask {name} to describe something using all five senses", "68": "encourage {name} to keep a journal or write about a topic that interests {them}" } },
    { id: "editing", group: "w", bands: ["35", "68"], label: "Checking and improving writing",
      s: { "35": ["rereads {their} work and makes thoughtful improvements", "checks {their} writing carefully and corrects {their} own mistakes"],
           "68": ["revises drafts thoughtfully, improving both ideas and accuracy", "proofreads carefully and acts on feedback to improve each draft"] },
      g: { "35": ["is learning to reread {their} writing and fix mistakes", "makes some corrections and is building a habit of checking {their} work"],
           "68": ["proofreads for errors and is learning to revise ideas as well", "acts on feedback and is building a habit of revising drafts"] },
      f: { "35": "rereading {their} writing to check it makes sense and fixing mistakes", "68": "revising drafts to improve ideas and organisation, not only correcting errors" },
      sch: { "35": "with a simple editing checklist", "68": "with peer feedback and editing checklists" },
      home: { "35": "ask {name} to read a piece of writing aloud to you and find one thing to improve", "68": "ask {name} to read an essay aloud before handing it in and spot one improvement" } },
    { id: "opinion", group: "w", bands: ["35", "68"], label: { "35": "Opinion and persuasive writing", "68": "Argument writing" },
      s: { "35": ["states a clear opinion and backs it up with good reasons", "writes persuasive pieces that convince the reader with reasons and examples"],
           "68": ["builds strong arguments with clear claims and well-chosen evidence", "writes convincing arguments and answers the opposing view"] },
      g: { "35": ["states an opinion clearly and is learning to give more reasons", "gives reasons for {their} opinion and is learning to add examples"],
           "68": ["makes a clear claim and is learning to support it with evidence", "writes arguments with reasons and is learning to answer the opposing view"] },
      f: { "35": "backing up an opinion with reasons and examples", "68": "supporting claims with evidence and explaining how it proves the point" },
      sch: { "35": "with model texts and planning frames", "68": "with debates and model essays" },
      home: { "35": "have friendly debates at dinner (\"which is the best pet?\") and ask for three reasons", "68": "discuss a topic in the news together and ask {name} for reasons and evidence" } },
    { id: "speaking", group: "t", bands: ["k2", "35", "68"], label: "Speaking and listening",
      s: ["shares ideas clearly in class discussions and listens carefully to others", "speaks confidently in front of the class and builds on what others say"],
      g: ["contributes to discussions and is growing in confidence when speaking to the class", "listens well and is learning to build on what others say"],
      f: "sharing {their} ideas in class discussions and building on what others say", sch: "with talk partners and sentence starters",
      home: "talk at mealtimes about the best part of the day, and ask follow-up questions" }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(knows|blends|sounds|reads|recognises|retells|answers|explains|summarises|picks|backs|identifies|understands|follows|makes|supports|uses|works|asks|remembers|is|chooses|shares|finds|takes|researches|judges|compares|analyses|writes|comments|forms|has|spells|applies|checks|controls|varies|plans|puts|organises|builds|structures|links|adds|develops|rereads|corrects|revises|proofreads|acts|states|gives|speaks|contributes|listens|adjusts|punctuates|catches)$/;
  var OPENINGS = {
    enthusiastic: ["{name} brings real enthusiasm to reading and writing and loves sharing ideas.", "{name} enjoys books and writing and is keen to share ideas in class."],
    hardworking: ["{name} works hard in reading and writing and puts real effort into every task.", "{name} has a steady, hard-working approach to reading and writing."],
    careful: ["{name} is a careful, thoughtful reader and writer who takes pride in {their} work.", "{name} approaches reading and writing thoughtfully and takes pride in good work."],
    curious: ["{name} is a curious reader who asks thoughtful questions about the books we read.", "{name} brings great questions and ideas to our class reading."],
    creative: ["{name} has a lively imagination and brings creative ideas to {their} writing.", "{name} writes with imagination and enjoys trying out new ideas."],
    growing: ["{name} has grown in confidence in reading and writing this {period}.", "It has been great to see {name} become a more confident reader and writer this {period}."],
    none: [""]
  };
  var OPENINGS_END = {
    growing: ["{name} has grown in confidence in reading and writing this year.", "It has been great to see {name} become a more confident reader and writer this year."],
    hardworking: ["{name} has worked hard in reading and writing all year and made steady progress.", "{name} has made strong progress in reading and writing this year through steady effort."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home.", "Please get in touch if you have any questions about {name}'s reading and writing."],
    end: ["Thank you for your support this year.", "I have enjoyed teaching {name} this year."]
  };
  var PRON = { she: { their: "her", them: "her", they_read: "she reads" }, he: { their: "his", them: "him", they_read: "he reads" }, they: { their: "their", them: "them", they_read: "they read" } };
  var US = { practise: "practice", practised: "practiced", practising: "practicing", recognise: "recognize", recognises: "recognizes", recognising: "recognizing",
    summarise: "summarize", summarises: "summarizes", summarising: "summarizing", organise: "organize", organises: "organizes", organising: "organizing", organisation: "organization",
    analyses: "analyzes", analysing: "analyzing", Analysing: "Analyzing", favourite: "favorite", colour: "color", colours: "colors", modelled: "modeled",
    "non-fiction": "nonfiction", "Non-fiction": "Nonfiction" };
  var US_RE = new RegExp("(^|[^\\w-])(" + Object.keys(US).sort(function (a, b) { return b.length - a.length; }).join("|") + ")(?![\\w-])", "g");

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
    var uk = o.style === "uk", p = PRON[o.pronoun] || PRON.they;
    t = t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "they_read") return o.name ? p.they_read : "they read";
      if (k === "period") return o.period || (uk ? "term" : "quarter");
      if (k === "sight") return uk ? "tricky words" : "sight words";
      if (k === "Sight") return uk ? "Tricky words" : "Sight words";
      if (k === "stops") return uk ? "full stops" : "periods";
      if (k === "stop") return uk ? "full stop" : "period";
      return m;
    });
    if (!uk) t = t.replace(US_RE, function (m, pre, w) { return pre + US[w]; });
    return t;
  }

  // opts: { name, pronoun, style: us|uk, band: k2|35|68, timing: early|end,
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
    if (!total) return { ok: false, msg: "Pick a level for at least one skill." };
    if (total > 4) issues.push({ level: "review", msg: "That's " + total + " skills. A reading and writing comment reads best with two or three; the grade boxes cover the rest." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the student does well in reading or writing, even a small thing, or add a moment you noticed." });
    var parts = [];
    var open = (o.timing === "end" && OPENINGS_END[o.opening || "hardworking"]) || OPENINGS[o.opening] || OPENINGS.hardworking;
    var idxOpen = -1, idxFew = -1;
    if (o.opening !== "none") { idxOpen = parts.length; parts.push(pick(open, seed)); }
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) parts.push("I was impressed when {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    // Subjects alternate between the name and a pronoun so the name isn't on
    // every sentence; "they" takes a plural verb (knows -> know, is -> are).
    var n = 0, SUBJ = { she: "she", he: "he", they: "they" };
    function sentence(vp, tail) {
      var pron = SUBJ[o.pronoun] && n % 2 === 1;
      n++;
      if (pron && o.pronoun === "they") vp = plural(vp);
      return cap((pron ? SUBJ[o.pronoun] : "{name}") + " " + vp + (tail || "") + ".");
    }
    var onTrack = 0;
    // Strengths first, then on-track strands, each in AREAS order.
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
      parts.push("Over the summer, reading for pleasure a little each day, and writing the odd postcard or diary entry, will keep these skills fresh.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a strong student's comment usually names one thing to aim for next, such as trying a new genre or developing ideas in more depth." });
    }
    if (home) {
      parts.push((o.timing === "end" ? "Over the summer, you could " : "At home, you could ") + bt(home.home, band) + ".");
      idxFew = parts.length; parts.push("A few minutes a few times a week makes a real difference.");
    }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return fill(p, o); }).join(" ").replace(/\s+/g, " ").trim()); }
    // Over the character limit: drop the optional sentences first.
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

  var SUBJECTS = "(reading|writing|spelling|english|literacy|phonics|handwriting|grammar|punctuation|books)";
  var CHECKS = [
    [/\b(lazy|sloppy|unmotivated|disruptive|hopeless|clueless|slow learner|a slow worker|low[- ]ability)\b/i, "fix", "Label: \"$1\". Describe what the student does and what helps (e.g. \"often stops before a piece is finished; short writing goals with a check-in are helping\")."],
    [/\b(reluctant (reader|writer)|non-?reader|struggling (reader|writer))\b/i, "review", "\"$1\" is a label families remember. Say what the student reads or writes now and what's helping (\"is choosing short graphic novels and reading a little more each week\")."],
    [/\b(careless( mistakes| errors)?|messy|untidy|scruffy|illegible|scrawl\w*|chicken scratch)\b/i, "review", "\"$1\" is a verdict. Say what happens and the fix: \"sometimes rushes, so letters run together; our next step is keeping handwriting consistent in longer pieces\"."],
    [/\b(gives up( easily)?|gave up|quits)\b/i, "review", "\"$1\" sounds like a character verdict. Say when it happens and the strategy that helps: \"sometimes stops when a blank page feels big; a quick plan first is helping\"."],
    [new RegExp("\\b((bad|terrible|rubbish|useless|weak|poor|no good) (at|in|with) " + SUBJECTS + "|(poor|weak|bad|terrible|slow|low) (reader|writer|speller)s?|not (a|really a|much of a|a natural|naturally a) (reader|writer|book person|bookworm)|not (a )?natural(ly)? (reader|writer)|" + SUBJECTS + " (is|are) not (his|her|their) (thing|strength|strong suit)|not (his|her|their) (strong suit|strongest subject))\\b", "i"), "fix", "\"$1\" tells the family (and the student) that ability is fixed. Name the skill they're working on and what helps."],
    [/\b(weak|poor|slow)\b/i, "review", "\"$1\" reads as a verdict. Say what the student can do now and what comes next."],
    [new RegExp("\\b((hates|dislikes|doesn'?t like|does not like|doesn'?t enjoy|does not enjoy|has no interest in|isn'?t interested in) " + SUBJECTS + "|anxious|anxiety|panics?|phobia)\\b", "i"), "review", "\"$1\" is a guess at a feeling and can stick. Describe what you see (\"often chooses drawing over writing at free time\") and what's helping (\"short books about football are getting him reading\")."],
    [/\b(copies|copied|copying|cheat\w*|plagiari\w*)\b/i, "review", "\"$1\": academic honesty concerns usually belong in a conversation with the family first, not the written comment. Follow your school's policy."],
    [/\b(can'?t|cannot|unable to|doesn'?t know|does not know|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to families."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true and is hard to hear. Say \"often\" or \"sometimes\", or describe a specific moment."],
    [/\b((bottom|lowest|lower|top|highest|higher) (reading |phonics |spelling |guided reading |writing )?(set|group|table)|(set|group) [1-6]\b|than (most|many|the other|other|some) (children|kids|students|pupils|classmates|of the class)|compared (to|with) (the class|the others|other (children|students|pupils)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(best|worst|weakest|strongest) (reader|writer|speller)? ?in the class|top of the class)\b/i, "fix", "Comparison or group: \"$1\". Report this student's own progress; groups change and families read them as labels."],
    [/\b(below (grade|age|the expected) level|below (the )?expected standard|not meeting (the )?standards?|failing|fails|is failing|behind)\b/i, "review", "\"$1\": if it's true, say it once with the support in place and what comes next, and make sure the family has heard it from you first. The struggling-students guide has the pattern."],
    [/\b((guided )?reading level [a-z0-9]+|lexile|\d{3,4}L\b|dra ?\d+|book band|(reading|spelling) age( of)? \d+|accelerated reader|zpd|f ?& ?p|fountas|running records?|benchmark (level|assessment)|(phonics screening )?(check )?score of \d+)/i, "review", "Reading level or score: \"$1\". Families rarely know what it means. Say what kind of books the student reads comfortably and what's next (\"reads short chapter books on {their} own and is moving on to longer ones\"), or explain the scale."],
    [/\b[Ll]evel [A-Z]\b/, "review", "Reading level letter. Families rarely know what it means. Say what kind of books the student reads comfortably and what's next."],
    [/\b(dyslexi\w*|dysgraphi\w*|dyspraxi\w*|adhd|autis\w*|asd|processing (disorder|delay)|speech (therapy|and language)|salt|learning (disability|difficulty|difficulties)|iep|504( plan)?|ehcp|sen(d|co)?|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*|medication|meds)\b/i, "fix", "Diagnosis, medication or support-plan language: \"$1\". Unless your school's policy says otherwise, raise it with the family in person and keep it out of the general comment."],
    [/\b(ell|esl|eal|english language learner|english as an additional language|english as a second language)\b/i, "review", "\"$1\" is a school category, not something families need on the report. Describe the progress in English itself (\"is using new topic words confidently in discussion\")."],
    [/\b((like|just like) (his|her|their) (mom|mum|dad|father|mother|parents|brother|sister)|(mom|mum|dad|parents?) (was|were|is|are) (bad|no good|not good|terrible) at (reading|spelling|writing|english)|divorc\w*|custody|separated|split up|single (mom|mum|dad|parent)|social worker|foster\w*|free (school )?(lunch|meals))\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b((no|few) books (at|in the) home|(parents|family) (don'?t|do not|never) read|(doesn'?t|does not|isn'?t|is not|never) (read|reads|reading) at home|reading (record|log) (is )?(not|rarely|never) signed)\b/i, "review", "\"$1\" can read as blame. If home reading matters, give one specific, easy routine instead (\"ten minutes of reading together at bedtime\")."],
    [/\b(phonemes?|graphemes?|digraphs?|trigraphs?|split digraphs?|cvcc?|segment\w*|decod\w*|encod\w*|phonemic awareness|phonological awareness|orthographic\w*|morpholog\w*|fronted adverbials?|expanded noun phrases?|subordinate clauses?|relative clauses?|modal verbs?|(subordinating|coordinating) conjunctions?|spag|gps|(rl|ri|rf|w|sl|l)\.\d+\.\d+\w*|ccss|teks|greater depth|wts|exs|gds|ks[1-4]|common exception words|high[- ]frequency words|dibels|wcpm|cwpm|prosody|metacogniti\w*|schema)\b/i, "review", "Jargon: \"$1\". Many families won't know it; say what the student does (\"sounds out words like ship and chin\", \"starts sentences with words like 'Later that day,'\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shines?|shining star|superstar|bookworm|avid reader|voracious reader|budding (author|writer)|natural (writer|reader)|wordsmith)\b/i, "note", "Stock phrase: \"$1\". Families see it on every report (and it reads as AI-written). A specific skill or moment says more."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(should (really )?(be able to|know|have learned|have learnt) .{0,30}by now|by now)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."]
  ];
  var US_SPELL = /\b(favorite|color|colors|organiz\w+|summariz\w+|recogniz\w+|analyz\w+|practic(ing|ed))\b/i;
  var UK_SPELL = /\b(favourite|colours?|organis\w+|summaris\w+|recognis\w+|analysing|practis\w+|full stops?)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: fill(c[2].replace("$1", m[1] || m[0]), { pronoun: "they", style: o.style }) });
    });
    var needs = (t.match(/\bneeds to\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\" appears " + needs + " times. Pick the one that matters most and say how school is helping." });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop a strand or the opening sentence." });
    if (!/\b(next|working on|work on|focus|goal|keep (practi[cs]ing|building|working)|aim|learning to|is learning|will keep|moving on)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one thing the student is working on next, so the family knows where to help." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family|bedtime)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific activity is the part families act on most." });
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
    if (o.style === "uk" && (sp = t.match(US_SPELL))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is US wording in a UK report. On an English report, families notice." });
    if (o.style === "us" && (sp = t.match(UK_SPELL))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is UK wording in a US report. On an English report, families notice." });
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

  var api = { AREAS: AREAS, BANDS: BANDS, BANDS_UK: BANDS_UK, GROUPS: GROUPS, areasFor: areasFor, bt: bt, plural: plural, build: build, check: check, plain: plain, fill: fill, area: area };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("rw-skills");
    if (!grid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function draw() {
      var keep = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) keep[s.getAttribute("data-area")] = s.value; });
      var band = val("rw-band") || "35", o = { style: val("rw-style") }, html = "";
      Object.keys(GROUPS).forEach(function (g) {
        var inner = "";
        areasFor(band).forEach(function (a) {
          if (a.group !== g) return;
          inner += "<label>" + esc(fill(bt(a.label, band), o).replace(/\{they_read\}/, "they read")) + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">Strength</option><option value=\"g\">On track</option><option value=\"f\">Next step</option></select></label>";
        });
        if (inner) html += "<fieldset><legend>" + GROUPS[g] + "</legend><div class=\"grid\">" + inner + "</div></fieldset>";
      });
      grid.innerHTML = html;
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (keep[s.getAttribute("data-area")]) s.value = keep[s.getAttribute("data-area")]; });
      var bs = document.getElementById("rw-band"), names = o.style === "uk" ? BANDS_UK : BANDS;
      Array.prototype.forEach.call(bs.options, function (op) { op.textContent = names[op.value]; });
    }
    draw();
    document.getElementById("rw-band").addEventListener("change", draw);
    document.getElementById("rw-style").addEventListener("change", draw);
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      return { name: val("rw-name").trim(), pronoun: val("rw-pronoun"), style: val("rw-style"), band: val("rw-band"), timing: val("rw-timing"), period: val("rw-period"), opening: val("rw-opening"), moment: val("rw-moment"), limit: val("rw-limit"), levels: levels };
    }
    var out = document.getElementById("rw-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"rw-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"rw-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"rw-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"rw-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"rw-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("rw-text");
      ta.addEventListener("input", function () { document.getElementById("rw-count").textContent = ta.value.length; });
      document.getElementById("rw-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("rw-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("rw-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("rw-count").textContent = ta.value.length; });
    }
    document.getElementById("rw-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("rw-check").addEventListener("click", function () {
      var v = val("rw-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("rw-sample").addEventListener("click", function () {
      document.getElementById("rw-name").value = "Amara";
      document.getElementById("rw-pronoun").value = "she";
      document.getElementById("rw-band").value = "35";
      draw();
      document.getElementById("rw-opening").value = "curious";
      document.getElementById("rw-moment").value = "explained why the main character lied, using three clues from the chapter";
      var pre = { inference: "s", spelling: "g", organisation: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("rw-run").click();
    });
    document.getElementById("rw-next").addEventListener("click", function () {
      ["rw-name", "rw-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("rw-name").focus();
    });
  });
})();
