// Science and social studies (UK: history and geography) report card comment
// builder and checker. Pick the subject, a grade band and a level for the
// strands you want to mention (strength, on track, next step), add one moment
// you noticed, and it writes a comment in the strength, next step, home tip
// pattern. The checker flags labels, fixed-ability lines ("not a science
// person"), comparisons, diagnosis and family details, a student's political
// or religious views, safety incidents, jargon families won't know (CER,
// NGSS codes, "variables", "substantive knowledge"), "always"/"never",
// placeholders, mixed pronouns, US/UK spelling and missing next steps or home
// tips. Runs in the browser and in node (module.exports) for tests. Nothing
// typed is sent or stored.
(function () {
  // Bands: k2 = grades K-2 (UK Years 1-3), 35 = grades 3-5 (Years 4-6),
  // 68 = grades 6-8 (Years 7-9). Any field can be a value or { band: value }.
  // s = strengths and g = on track (3rd person verb phrases), f = next step
  // (noun phrase), sch = how school works on it, home = one home activity.
  // Text is written in UK spelling; fill() converts it for US wording.
  var BANDS = { k2: "Grades K–2", "35": "Grades 3–5", "68": "Grades 6–8" };
  var BANDS_UK = { k2: "Years 1–3", "35": "Years 4–6", "68": "Years 7–9" };
  var SUBJECTS = { sci: "Science", ss: "Social studies" };
  var SUBJECTS_UK = { sci: "Science", ss: "History and geography" };
  var ALL = ["k2", "35", "68"];
  var AREAS = [
    // Science
    { id: "observe", subj: "sci", bands: ALL, label: "Observing and asking questions",
      s: { k2: ["notices small details when observing and describes them clearly", "asks thoughtful questions about the world around {them}"],
           "35": ["makes careful observations and asks questions that can be tested", "notices patterns and asks good questions about why they happen"],
           "68": ["asks precise questions that can be investigated and explains why they matter", "makes careful, detailed observations and uses them to raise new questions"] },
      g: { k2: ["is learning to look closely and describe what {they_see}", "asks questions about what {they_see} and is beginning to say what might happen"],
           "35": ["makes observations and is learning to turn {their} questions into ones we can test", "notices changes and is getting better at describing them in detail"],
           "68": ["asks good questions and is learning to make them precise enough to test", "makes observations and is getting more detailed in what {they_record}"] },
      f: { k2: "looking closely and saying what {they_notice}, using {their} senses", "35": "turning a question into one we can test", "68": "writing precise questions that an investigation can answer" },
      sch: { k2: "with magnifying glasses and nature walks", "35": "with question walls and short investigations", "68": "with investigation planning sheets" },
      home: { k2: "go on a short nature walk and ask {name} what {they_notice}", "35": "ask \"I wonder why...?\" together about something you see, such as ice melting or bread going mouldy", "68": "watch a short science video together and ask {name} what question {they_would} want to test next" } },
    { id: "investigate", subj: "sci", bands: ALL, label: { k2: "Simple tests and investigations", "35": "Planning fair tests", "68": "Planning investigations" },
      s: { k2: ["carries out simple tests carefully and says what happened", "follows the steps of a simple test and suggests what to try next"],
           "35": ["plans fair tests, changing one thing and keeping everything else the same", "sets up investigations carefully and explains why each step matters"],
           "68": ["plans investigations independently, choosing what to change, measure and keep the same", "designs clear, careful investigations and explains how they make the results reliable"] },
      g: { k2: ["joins in with simple tests and is beginning to predict what will happen", "carries out simple tests with help and talks about what happened"],
           "35": ["understands what makes a test fair and is learning to plan one on {their} own", "follows investigation steps carefully and is beginning to plan {their} own"],
           "68": ["plans investigations with some support and is learning to control the things that stay the same", "follows a method carefully and is learning to plan {their} own"] },
      f: { k2: "making a prediction before a test and checking it afterwards", "35": "planning a fair test, changing just one thing at a time", "68": "planning an investigation on {their} own, including what to keep the same" },
      sch: { k2: "with hands-on activities and \"what do you think will happen?\" questions", "35": "with planning boards and practical lessons", "68": "with planning templates and practical lessons" },
      home: { k2: "try a simple test together, such as which toy cars roll furthest down a ramp", "35": "try a kitchen test together, such as which paper towel soaks up the most water, changing only the brand", "68": "plan a small test at home together, such as which drink cools fastest, and talk about how to make it fair" } },
    { id: "measure", subj: "sci", bands: ALL, label: "Measuring and recording results",
      s: { k2: ["records what {they_see} carefully in pictures, tally marks and simple tables", "measures carefully with simple equipment and records results neatly"],
           "35": ["takes accurate measurements and records results clearly in tables", "records results carefully and chooses a sensible way to present them"],
           "68": ["takes accurate, repeated measurements and records them clearly with units", "records data carefully and spots results that don't fit the pattern"] },
      g: { k2: ["records results in pictures and is beginning to use simple tables", "is learning to use simple equipment such as rulers and timers"],
           "35": ["measures carefully and is learning to record results in a table with units", "takes measurements and is getting more accurate with scales and units"],
           "68": ["records data accurately and is learning when to repeat measurements", "takes careful measurements and is getting more consistent about units"] },
      f: { k2: "recording what {they_see} in a simple table", "35": "recording results in a clear table, with units", "68": "repeating measurements and spotting results that don't fit" },
      sch: { k2: "with picture tables and class charts", "35": "with ready-made tables we fill in together", "68": "with results tables and practical lessons" },
      home: { k2: "measure a plant or a shadow each day for a week and keep a simple chart", "35": "measure something that changes, such as a plant or the temperature, each day for a week and record it in a table", "68": "time something a few times, such as how long ice takes to melt, and talk about why the results differ" } },
    { id: "explain", subj: "sci", bands: ALL, label: { k2: "Explaining what happened", "35": "Drawing conclusions", "68": "Explaining with evidence" },
      s: { k2: ["explains what happened in a test and why {they_think} it happened", "uses what {they_see} to answer questions about the world around {them}"],
           "35": ["draws sensible conclusions from results and explains them clearly", "uses results to answer the question and suggests what to test next"],
           "68": ["writes clear conclusions that use data as evidence and explain the science behind them", "explains results using evidence and scientific ideas, and spots the limits of the data"] },
      g: { k2: ["says what happened in a test and is beginning to say why", "is learning to use what {they_see} to answer simple questions"],
           "35": ["says what the results show and is learning to explain why", "draws simple conclusions and is beginning to link them to the question"],
           "68": ["states what the data shows and is learning to explain it using scientific ideas", "writes conclusions and is learning to back each claim with evidence"] },
      f: { k2: "saying what happened and why {they_think} it happened", "35": "using results to explain the answer, not just saying what happened", "68": "backing up each conclusion with evidence from the data" },
      sch: { k2: "with talk partners and sentence starters", "35": "with \"I found that... because...\" sentence starters", "68": "with a three-part conclusion frame: what I found, my evidence, the science behind it" },
      home: { k2: "ask \"why do you think that happened?\" when something changes, such as a puddle drying up", "35": "ask \"how do you know?\" when {name} tells you a science fact", "68": "ask {name} to explain a news story about science and what the evidence was" } },
    { id: "models", subj: "sci", bands: ["35", "68"], label: "Diagrams and models",
      s: ["draws clear, labelled diagrams and uses them to explain ideas", "uses models and diagrams to explain how things work"],
      g: ["draws labelled diagrams and is learning to use them to explain ideas", "is getting more confident using models to explain how things work"],
      f: "using labelled diagrams to explain how something works", sch: "with diagram templates and modelling activities",
      home: { "35": "ask {name} to draw and label something you're both looking at, such as a plant or a bike", "68": "ask {name} to sketch a diagram explaining something at home, such as how a fridge keeps food cold" } },
    { id: "vocab", subj: "sci", bands: ALL, label: "Science vocabulary",
      s: { k2: ["uses new science words correctly, such as \"melt\", \"habitat\" and \"material\"", "remembers the science words we learn and uses them in conversation"],
           "35": ["uses scientific vocabulary accurately in speaking and writing", "learns new science words quickly and uses them correctly"],
           "68": ["uses precise scientific vocabulary in explanations and written work", "explains scientific terms clearly in {their} own words"] },
      g: { k2: ["is learning new science words and is beginning to use them", "uses some science words and is building {their} vocabulary each topic"],
           "35": ["uses key science words and is learning to use them precisely in writing", "is building {their} science vocabulary and uses it more often in explanations"],
           "68": ["uses key terms and is learning to use them precisely in longer answers", "knows most key terms and is building confidence explaining them"] },
      f: { k2: "using new science words when talking about what {they_see}", "35": "using science words accurately in written explanations", "68": "using precise scientific terms in longer written answers" },
      sch: { k2: "with word mats and picture cards", "35": "with topic word mats", "68": "with key-term glossaries for each unit" },
      home: { k2: "ask {name} to teach you a new science word from this week", "35": "ask {name} to teach you three science words from our topic and what they mean", "68": "ask {name} to explain a key term from this unit in {their} own words" } },
    { id: "knowledge", subj: "sci", bands: ALL, label: "Understanding of our topics",
      s: ["has a secure understanding of our topics and remembers key ideas well", "explains the main ideas from our topics clearly and links them together"],
      g: ["understands the main ideas from our topics and is building on them", "remembers key facts from our topics and is getting better at explaining them"],
      f: "remembering key ideas from earlier topics and linking them to new ones", sch: "with short quizzes and topic recaps",
      home: "ask {name} to tell you three things {they_learned} in science this week" },
    { id: "practical", subj: "sci", bands: ALL, label: "Practical work and safety",
      s: ["handles equipment carefully and follows safety instructions closely", "works sensibly and safely in practical lessons and helps others do the same"],
      g: ["follows safety instructions and is becoming more confident with equipment", "works carefully in practical lessons and is learning to use new equipment"],
      f: "following each step of a practical method carefully", sch: "with step-by-step method cards",
      home: "follow a recipe together, step by step, and talk about why the order matters" },
    { id: "writeup", subj: "sci", bands: ["35", "68"], label: "Writing up investigations",
      s: ["writes up investigations clearly, with a method, results and conclusion", "writes clear, well-organised accounts of investigations"],
      g: ["writes up investigations and is learning to include each section", "is getting better at writing a clear method that someone else could follow"],
      f: "writing a method clear enough for someone else to follow", sch: "with writing frames and model examples",
      home: "ask {name} to explain how to do an everyday task step by step, as if writing instructions" },
    // Social studies (UK: history and geography)
    { id: "ssknow", subj: "ss", bands: ALL, label: "Understanding of our topics",
      s: { k2: ["remembers what we have learned about people and places and talks about it with interest", "shares what {they_know} about our topics confidently"],
           "35": ["has a secure understanding of our topics and remembers key facts and ideas", "explains the main ideas from our topics clearly and links them together"],
           "68": ["has a detailed understanding of the periods and places we have studied", "links ideas across topics and explains how they connect"] },
      g: { k2: ["remembers key facts about our topics and is beginning to talk about them", "is learning about our topics and enjoys sharing what {they_know}"],
           "35": ["understands the main ideas from our topics and is building on them", "remembers key facts and is getting better at explaining them"],
           "68": ["understands the main ideas from each unit and is building more detail", "remembers key facts and is learning to link them across units"] },
      f: { k2: "talking about what {they_know} about our topics in full sentences", "35": "remembering key facts and ideas from earlier topics", "68": "linking what we learn across units" },
      sch: { k2: "with picture prompts and class discussions", "35": "with knowledge organisers and short quizzes", "68": "with knowledge organisers and retrieval quizzes" },
      home: { k2: "ask {name} to tell you about one thing {they_learned} this week", "35": "ask {name} to teach you three facts from our topic", "68": "ask {name} to explain one thing {they_learned} this week and why it matters" } },
    { id: "time", subj: "ss", bands: ALL, label: { k2: "Past and present", "35": "Timelines and change over time", "68": "Chronology and change over time" },
      s: { k2: ["talks about how life was different in the past and gives clear examples", "orders events in time and uses words such as \"before\", \"after\" and \"long ago\""],
           "35": ["places events confidently on a timeline and explains how things changed", "understands how events connect over time and explains changes clearly"],
           "68": ["has a secure sense of chronology and explains change and continuity clearly", "explains how and why things changed over time, using precise dates and periods"] },
      g: { k2: ["is learning to talk about how things were different in the past", "orders familiar events and is beginning to use words about time"],
           "35": ["orders events on a timeline and is learning to explain what changed", "is building a clear sense of when events happened"],
           "68": ["places events in order and is learning to explain change and continuity", "is building a clear sense of the periods we have studied"] },
      f: { k2: "talking about how life was different in the past", "35": "placing events on a timeline and explaining what changed", "68": "explaining what changed, what stayed the same and why" },
      sch: { k2: "with old photographs and objects", "35": "with class timelines", "68": "with timelines and comparison tables" },
      home: { k2: "look at old family photos together and talk about what has changed", "35": "make a simple timeline of your family's or your town's history together", "68": "talk with {name} about how something has changed in your lifetime, such as phones or shops" } },
    { id: "maps", subj: "ss", bands: ALL, label: { k2: "Maps and places", "35": "Maps and places", "68": "Maps, places and environments" },
      s: { k2: ["uses simple maps confidently and describes where places are", "talks about places near and far and how they are different"],
           "35": ["reads maps accurately, using compass directions, keys and grid references", "locates countries and places confidently on a map or globe"],
           "68": ["reads and interprets maps confidently, including scale and different types of map", "explains how people and places affect each other, using clear examples"] },
      g: { k2: ["is learning to use simple maps and to describe where things are", "talks about our local area and is learning about places further away"],
           "35": ["uses maps and is learning to use compass directions and keys", "locates some countries and places and is building {their} map knowledge"],
           "68": ["reads maps and is building confidence with scale and grid references", "describes places and is learning to explain how people and environments affect each other"] },
      f: { k2: "using simple maps and direction words such as \"near\" and \"far\"", "35": "using compass directions, keys and grid references on a map", "68": "explaining how people and places affect each other" },
      sch: { k2: "with maps of our school and local area", "35": "with map work and atlases", "68": "with maps, photographs and case studies" },
      home: { k2: "draw a simple map of your home or your walk to school together", "35": "use a map or map app together to plan a short trip and talk about the directions", "68": "look at a news story about a place in the world and find it on a map together" } },
    { id: "sources", subj: "ss", bands: ALL, label: { k2: "Pictures, objects and sources", "35": "Using sources", "68": "Using sources and evidence" },
      s: { k2: ["looks closely at old pictures and objects and says what they tell us", "asks good questions about photographs and objects from the past"],
           "35": ["finds useful information in sources and explains what they show", "compares sources and notices when they disagree"],
           "68": ["analyses sources carefully, asking who made them and why", "uses evidence from sources to support {their} points and judges how reliable they are"] },
      g: { k2: ["is learning to look closely at pictures and objects and say what they show", "is beginning to ask questions about old photographs and objects"],
           "35": ["finds information in sources and is learning to explain what they show", "uses sources and is beginning to compare them"],
           "68": ["uses sources to find information and is learning to ask who made them and why", "uses evidence and is learning to judge how reliable a source is"] },
      f: { k2: "saying what a picture or object tells us about the past", "35": "comparing two sources and explaining how they differ", "68": "asking who made a source, when and why, before using it as evidence" },
      sch: { k2: "with \"look, think, wonder\" questions", "35": "with source question cards", "68": "with source analysis frames" },
      home: { k2: "look at an old object or photo together and ask {name} what it tells you", "35": "compare two news reports or websites about the same event and talk about what's different", "68": "when you see a claim online, ask {name} who made it and why they might have made it" } },
    { id: "inquiry", subj: "ss", bands: ALL, label: { k2: "Asking questions", "35": "Asking questions and research", "68": "Inquiry and research" },
      s: { k2: ["asks interesting questions about people and places", "is curious about the world and asks thoughtful questions"],
           "35": ["asks thoughtful questions and finds answers using books and websites", "researches topics independently and picks out the most useful information"],
           "68": ["plans research carefully and chooses reliable sources", "asks strong questions and follows them up with careful research"] },
      g: { k2: ["asks questions about our topics and is learning to find answers", "is curious and is beginning to ask questions about the past and other places"],
           "35": ["asks questions and is learning to find answers in books and on websites", "researches with support and is learning to pick out the most useful information"],
           "68": ["carries out research and is learning to choose reliable sources", "asks good questions and is learning to plan research to answer them"] },
      f: { k2: "asking \"why\" and \"how\" questions about our topics", "35": "finding the most useful information when researching", "68": "choosing reliable sources and noting where information came from" },
      sch: { k2: "with question boards", "35": "with research frames and guided library time", "68": "with research planners and source checklists" },
      home: { k2: "visit the library together and find a book about a place or time {they_are} curious about", "35": "help {name} research one question about our topic using a library book or a website", "68": "ask {name} how {they_know} a website is trustworthy when doing homework" } },
    { id: "cause", subj: "ss", bands: ["35", "68"], label: "Explaining causes and consequences",
      s: ["explains why events happened and what they led to, with clear reasons", "explains causes and effects clearly and links them together"],
      g: ["is learning to explain why events happened and what they led to", "gives reasons for events and is learning to link causes and effects"],
      f: "explaining why something happened and what it led to", sch: "with cause-and-effect organisers",
      home: { "35": "ask \"why do you think that happened?\" about a story in the news or a family event", "68": "talk about a news story together and ask {name} what caused it and what might happen next" } },
    { id: "views", subj: "ss", bands: ["35", "68"], label: "Different points of view",
      s: ["explains how different people might see the same event and why", "listens to different points of view and responds respectfully, using evidence"],
      g: ["is learning to explain how different people might see the same event", "listens to different points of view and is learning to respond with evidence"],
      f: "explaining how people at the time might have seen events differently", sch: "with role play and structured discussions",
      home: "talk about a news story together and ask {name} how different people involved might feel about it" },
    { id: "civics", subj: "ss", bands: ALL, label: { k2: "Community and rules", "35": "Community and citizenship", "68": "Government and citizenship" },
      s: { k2: ["understands why we have rules and explains how people help in our community", "talks thoughtfully about the jobs people do in our community"],
           "35": ["explains how communities work and how people can make a difference", "understands how rules and laws are made and explains why they matter"],
           "68": ["explains how government works and how citizens can take part", "explains rights and responsibilities clearly, using examples"] },
      g: { k2: ["is learning about the people who help in our community and why we have rules", "talks about our class rules and is learning why they matter"],
           "35": ["is learning how communities and local government work", "understands some rights and responsibilities and is learning to explain them"],
           "68": ["is learning how government works and how decisions are made", "understands key rights and responsibilities and is building on them"] },
      f: { k2: "explaining why we have rules and who helps us in our community", "35": "explaining how communities make decisions", "68": "explaining how decisions are made and how citizens can have a say" },
      sch: { k2: "with role play and class jobs", "35": "with class votes and community projects", "68": "with case studies and debates" },
      home: { k2: "talk about the people who help in your community, such as librarians, nurses and bus drivers", "35": "talk about a local decision together, such as a new park or road, and who decided it", "68": "talk with {name} about a local issue and how people can have a say in it" } },
    { id: "ssdiscuss", subj: "ss", bands: ALL, label: "Discussion and presenting",
      s: ["shares ideas confidently in class discussions and listens well to others", "presents {their} work clearly and answers questions about it"],
      g: ["joins in with class discussions and is building confidence sharing ideas", "presents {their} work and is learning to speak to a group with confidence"],
      f: "sharing ideas in class discussions and building on what others say", sch: "with talk partners and sentence starters",
      home: "ask {name} at dinner what {they_think} about something from our topic, and why" },
    { id: "sswriting", subj: "ss", bands: ["35", "68"], label: { "35": "Writing about our topics", "68": "Extended writing" },
      s: { "35": ["writes clear, well-organised pieces about our topics, using topic words", "writes detailed explanations about our topics in {their} own words"],
           "68": ["writes well-structured answers that make a clear argument backed by evidence", "writes clear, organised extended answers using key terms and evidence"] },
      g: { "35": ["writes about our topics and is learning to organise ideas into paragraphs", "is getting better at explaining ideas in {their} own words"],
           "68": ["writes extended answers and is learning to structure an argument", "makes good points and is learning to back each one with evidence"] },
      f: { "35": "organising {their} writing into clear paragraphs", "68": "structuring longer answers: a point, evidence and an explanation" },
      sch: { "35": "with writing frames and model paragraphs", "68": "with paragraph frames and model answers" },
      home: { "35": "ask {name} to tell you about our topic before writing, so the ideas are clear first", "68": "ask {name} to talk through the plan for a longer answer before writing it" } }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(notices|asks|makes|is|carries|follows|plans|sets|designs|understands|joins|records|measures|takes|explains|uses|says|draws|writes|states|remembers|learns|knows|has|handles|works|talks|orders|places|reads|locates|describes|looks|finds|compares|analyses|researches|listens|presents|shares|gives|spots|chooses|enjoys|links)$/;
  var OPENINGS = {
    enthusiastic: ["{name} brings real enthusiasm to {subject} lessons and is keen to share ideas.", "{name} enjoys {subject} and is keen to find out more."],
    hardworking: ["{name} works hard in {subject} and puts real effort into every task.", "{name} has a steady, hard-working approach to {subject}."],
    curious: ["{name} is curious about the world and asks great questions in {subject}.", "{name} likes to know why things happen, not just what happens."],
    careful: ["{name} is a careful, thoughtful {subject} student who takes pride in {their} work.", "{name} approaches {subject} carefully and takes pride in {their} work."],
    growing: ["{name} has grown in confidence in {subject} this {period}.", "It has been great to see {name} become more confident in {subject} this {period}."],
    none: [""]
  };
  var OPENINGS_END = {
    growing: ["{name} has grown in confidence in {subject} this year.", "It has been great to see {name} become more confident in {subject} this year."],
    hardworking: ["{name} has worked hard in {subject} all year and made steady progress.", "{name} has made strong progress in {subject} this year through steady effort."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home.", "Please get in touch if you have any questions about {name}'s progress in {subject}."],
    end: ["Thank you for your support this year.", "I have enjoyed teaching {name} this year."]
  };
  // Pronoun forms; the they_ keys are short verb phrases that change with "they".
  var PRON = {
    she: { their: "her", them: "her", they_see: "she sees", they_notice: "she notices", they_record: "she records", they_would: "she would", they_think: "she thinks", they_learned: "she learned", they_know: "she knows", they_are: "she is" },
    he: { their: "his", them: "him", they_see: "he sees", they_notice: "he notices", they_record: "he records", they_would: "he would", they_think: "he thinks", they_learned: "he learned", they_know: "he knows", they_are: "he is" },
    they: { their: "their", them: "them", they_see: "they see", they_notice: "they notice", they_record: "they record", they_would: "they would", they_think: "they think", they_learned: "they learned", they_know: "they know", they_are: "they are" }
  };
  var US = { practise: "practice", practised: "practiced", practising: "practicing", analyses: "analyzes", labelled: "labeled", mouldy: "moldy", modelling: "modeling", colour: "color", colours: "colors" };
  var US_RE = /\b(practised|practising|practise|analyses|labelled|mouldy|modelling|colours|colour)\b/g;

  function bt(v, band) { return v && typeof v === "object" && !Array.isArray(v) ? v[band] : v; }
  function plural(vp) {
    return vp.replace(/(^|, and |, | and )([a-z]+)/g, function (m, sep, w) {
      if (!VERBS.test(w)) return m;
      if (w === "is") w = "are";
      else if (w === "has") w = "have";
      else if (w === "analyses") w = "analyse";
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
  function areasFor(band, subj) { return AREAS.filter(function (a) { return a.bands.indexOf(band) >= 0 && (!subj || a.subj === subj); }); }
  function subjName(o) { return o.subject === "ss" ? (o.style === "uk" ? "history and geography" : "social studies") : "science"; }

  function fill(t, o) {
    var uk = o.style === "uk", p = PRON[o.pronoun] || PRON.they;
    t = t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (p[k]) return p[k];
      if (k === "period") return o.period || (uk ? "term" : "quarter");
      if (k === "subject") return subjName(o);
      return m;
    });
    if (!uk) t = t.replace(US_RE, function (m) { return US[m]; }).replace(/\b([Oo])rganis/g, "$1rganiz");
    return t;
  }

  // opts: { name, pronoun, style: us|uk, subject: sci|ss, band: k2|35|68,
  //         timing: early|end, period, opening, moment, limit,
  //         levels: { areaId: "s"|"g"|"f" } }
  function build(o) {
    o = o || {};
    var band = BANDS[o.band] ? o.band : "35", subj = SUBJECTS[o.subject] ? o.subject : "sci";
    o = Object.assign({}, o, { subject: subj });
    var levels = o.levels || {}, seed = hash(String(o.name || "") + (o.moment || ""));
    var list = areasFor(band, subj), strong = [], growing = [], focus = [];
    list.forEach(function (a) {
      if (levels[a.id] === "s") strong.push(a); else if (levels[a.id] === "g") growing.push(a); else if (levels[a.id] === "f") focus.push(a);
    });
    var issues = [], total = strong.length + growing.length + focus.length;
    if (!total) return { ok: false, msg: "Pick a level for at least one strand." };
    if (total > 4) issues.push({ level: "review", msg: "That's " + total + " strands. A {subject} comment reads best with two or three; the grade boxes cover the rest." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the student does well in {subject}, even a small thing, or add a moment you noticed." });
    var parts = [];
    var open = (o.timing === "end" && OPENINGS_END[o.opening || "hardworking"]) || OPENINGS[o.opening] || OPENINGS.hardworking;
    var idxOpen = -1, idxFew = -1;
    if (o.opening !== "none") { idxOpen = parts.length; parts.push(pick(open, seed)); }
    var moment = String(o.moment || "").trim().replace(/[.!]+$/, "");
    if (moment) parts.push("I was impressed when {name} " + moment.charAt(0).toLowerCase() + moment.slice(1) + ".");
    // Subjects alternate between the name and a pronoun so the name isn't on
    // every sentence; "they" takes a plural verb (asks -> ask, is -> are).
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
      parts.push(subj === "sci" ? "Over the summer, a trip to a park, beach or museum would keep building on this year's work." : "Over the summer, a visit to a museum, a historic place or somewhere new on the map would keep building on this year's work.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a strong student's comment usually names one thing to aim for next, such as explaining with evidence or planning their own investigation." });
    }
    if (home) {
      parts.push((o.timing === "end" ? "Over the summer, you could " : "At home, you could ") + bt(home.home, band) + ".");
      idxFew = parts.length; parts.push("A few minutes now and then makes a real difference.");
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

  var SUBJ_RE = "(science|history|geography|social studies|maps|dates)";
  var CHECKS = [
    [/\b(lazy|sloppy|unmotivated|disruptive|hopeless|clueless|slow learner|a slow worker)\b/i, "fix", "Label: \"$1\". Describe what the student does and what helps (e.g. \"often stops before a task is finished; short steps with a check-in are helping\")."],
    [/\b(careless|messy|untidy|disorganised|disorganized|scatterbrained|daydreams?|daydreamer)\b/i, "review", "\"$1\" is a verdict. Say what happens and the fix: \"sometimes misses steps in a method; a checklist card is helping\"."],
    [new RegExp("\\b((bad|terrible|rubbish|useless|weak|poor|no good|hopeless) (at|in|with) " + SUBJ_RE + "|not (a|really a) (science|history|geography) (person|kid|student|fan)|not (very )?(scientific|sciencey)|not a natural (scientist|historian|geographer)|no (interest|head) (in|for) " + SUBJ_RE + "|" + SUBJ_RE + " (is|are) not (his|her|their) (thing|strength|strong suit)|not (his|her|their) (strong suit|strongest subject|thing))\\b", "i"), "fix", "\"$1\" tells the family (and the student) that ability or interest is fixed. Name the skill they're working on and what helps."],
    [/\b(weak|poor|slow)\b/i, "review", "\"$1\" reads as a verdict. Say what the student can do now and what comes next."],
    [/\b(bored|boring|uninterested|disinterested|doesn'?t (care|like|enjoy)|hates?)\b/i, "review", "\"$1\" is a guess at a feeling. Describe what you see (\"is quieter in discussions\") and what's helping (\"choosing a question to research\")."],
    [/\b(dangerous(ly)?|reckless|unsafe|misused|messed about|messing about|fooling around|horseplay|banned from (practicals?|labs?))\b/i, "review", "\"$1\": a safety incident belongs in a conversation with the family and your school's records, not the report comment. The comment can name the next step: \"following each step of a practical method carefully\"."],
    [/\b(political (views|beliefs|opinions|leanings)|religious (views|beliefs|opinions)|(his|her|their|family'?s?) (religion|politics|faith)|republicans|democrats|(labour|tory|conservative|republican|democratic|reform( uk)?|liberal democrat|green|snp) (party )?(voters?|supporters?|views)|tories|maga|woke|left-wing|right-wing|leftist)\b/i, "fix", "Personal views: \"$1\". Keep a student's (or family's) political or religious views out of the report. Comment on the skill instead: \"supports a point of view with evidence and listens respectfully to others\"."],
    [/\b(copies|copied|copying|cheat\w*|plagiari\w*|chatgpt wrote|used ai)\b/i, "review", "\"$1\": academic honesty concerns usually belong in a conversation with the family first, not the written comment. Follow your school's policy."],
    [/\b(can'?t|cannot|unable to|doesn'?t know|does not know|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to families."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true and is hard to hear. Say \"often\" or \"sometimes\", or describe a specific moment."],
    [/\b(bottom (set|group|table)|lowest (set|group|table)|lower (set|group)|top (set|group|table)|(set|group) [1-6]\b|than (most|many|the other|other|some) (children|kids|students|pupils|classmates|of the class)|compared (to|with) (the class|the others|other (children|students|pupils)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(best|worst|weakest|strongest) in the class|top of the class)\b/i, "fix", "Comparison or set: \"$1\". Report this student's own progress; sets and groups change and families read them as labels."],
    [/\b(below (grade|age|the expected) level|below (the )?expected standard|not meeting (the )?standards?|failing|fails|is failing|(is|are|falling|fallen|fell|gets|got|left) behind|behind (in|with|on))\b/i, "review", "\"$1\": if it's true, say it once with the support in place and what comes next, and make sure the family has heard it from you first. The struggling-students guide has the pattern."],
    [/\b(dyslexi\w*|dyscalculi\w*|dyspraxi\w*|adhd|autis\w*|asd|processing (disorder|delay)|learning (disability|difficulty|difficulties)|iep|504( plan)?|ehcp|sen(d)?|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*|medication|meds)\b/i, "fix", "Diagnosis, medication or support-plan language: \"$1\". Unless your school's policy says otherwise, raise it with the family in person and keep it out of the general comment."],
    [/\b((like|just like) (his|her|their) (mom|mum|dad|father|mother|parents|brother|sister)|divorc\w*|custody|separated|split up|single (mom|mum|dad|parent)|social worker|foster\w*|free (school )?(lunch|meals)|immigra\w*|refugee|asylum|undocumented)\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b(cer\b|claim,? evidence,? (and )?reasoning|ngss|\bsep\b|science and engineering practices?|crosscutting concepts?|disciplinary core ideas?|\bdci\b|\d-(ps|ls|ess|ets)\d|ms-(ps|ls|ess|ets)\d|(in)?dependent (and (in)?dependent )?variables?|control(led)? variables?|hypothes[ie]s|c3 framework|inquiry arc|compelling questions?|supporting questions?|substantive (knowledge|concepts?)|disciplinary (knowledge|concepts?)|working scientifically|historical significance|historiograph\w*|chronological understanding|six-figure grid|four-figure grid|ks[1-4]|greater depth|\b(wts|exs|gds)\b)\b/i, "review", "Jargon: \"$1\". Many families won't know it; say what the student does (\"backs up each conclusion with evidence from the results\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shines?|shining star|superstar|budding (scientist|historian|geographer)|little (scientist|professor)|natural scientist|walking encyclopa?edia)\b/i, "note", "Stock phrase: \"$1\". Families see it on every report (and it reads as AI-written). A specific skill or moment says more."],
    [/(\[(name|student|child|first name|pronoun|topic|unit)[^\]]*\]|\{(name|student|topic)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(should (really )?(be able to|know|have learned|have learnt) .{0,30}by now|by now)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."]
  ];
  var US_SPELL = /\b(labeled|modeling|organiz\w+|analyz\w+|moldy|colors?|practic(ing|ed))\b/i;
  var UK_SPELL = /\b(labelled|modelling|organis\w+|analys(e|es|ing|ed)|mouldy|colours?|practis\w+)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: c[2].replace("$1", m[1] || m[0]) });
    });
    var needs = (t.match(/\bneeds to\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\" appears " + needs + " times. Pick the one that matters most and say how school is helping." });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop a strand or the opening sentence." });
    if (!/\b(next|working on|work on|focus|goal|keep (practi[cs]ing|building|working)|aim|learning to|is learning|will keep|moving on)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one thing the student is working on next, so the family knows where to help." });
    if (!/\b(at home|home|together|over the (summer|holidays?|break)|you could|family)\b/i.test(t)) issues.push({ level: "note", msg: "No home tip. One small, specific activity is the part families act on most." });
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
    if (o.style === "us" && (sp = t.match(UK_SPELL))) issues.push({ level: "review", msg: "\"" + sp[0] + "\" is UK spelling in a US report. Families notice." });
    if (o.style === "uk" && /\bsocial studies\b/i.test(t)) issues.push({ level: "note", msg: "\"Social studies\" in a UK report: most UK schools report history and geography (or \"topic\") instead." });
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

  var api = { AREAS: AREAS, BANDS: BANDS, BANDS_UK: BANDS_UK, SUBJECTS: SUBJECTS, SUBJECTS_UK: SUBJECTS_UK, areasFor: areasFor, bt: bt, plural: plural, build: build, check: check, plain: plain, fill: fill, area: area };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("ss-skills");
    if (!grid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function draw() {
      var keep = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) keep[s.getAttribute("data-area")] = s.value; });
      var band = val("ss-band") || "35", subj = val("ss-subject") || "sci", o = { style: val("ss-style") }, html = "";
      areasFor(band, subj).forEach(function (a) {
        html += "<label>" + esc(fill(bt(a.label, band), o)) + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">Strength</option><option value=\"g\">On track</option><option value=\"f\">Next step</option></select></label>";
      });
      grid.innerHTML = html;
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (keep[s.getAttribute("data-area")]) s.value = keep[s.getAttribute("data-area")]; });
      var uk = o.style === "uk", bs = document.getElementById("ss-band"), ss = document.getElementById("ss-subject");
      Array.prototype.forEach.call(bs.options, function (op) { op.textContent = (uk ? BANDS_UK : BANDS)[op.value]; });
      Array.prototype.forEach.call(ss.options, function (op) { op.textContent = (uk ? SUBJECTS_UK : SUBJECTS)[op.value]; });
    }
    draw();
    ["ss-band", "ss-style", "ss-subject"].forEach(function (id) { document.getElementById(id).addEventListener("change", draw); });
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      return { name: val("ss-name").trim(), pronoun: val("ss-pronoun"), style: val("ss-style"), subject: val("ss-subject"), band: val("ss-band"), timing: val("ss-timing"), period: val("ss-period"), opening: val("ss-opening"), moment: val("ss-moment"), limit: val("ss-limit"), levels: levels };
    }
    var out = document.getElementById("ss-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"ss-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"ss-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"ss-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"ss-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"ss-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("ss-text");
      ta.addEventListener("input", function () { document.getElementById("ss-count").textContent = ta.value.length; });
      document.getElementById("ss-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("ss-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("ss-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("ss-count").textContent = ta.value.length; });
    }
    document.getElementById("ss-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("ss-check").addEventListener("click", function () {
      var v = val("ss-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("ss-sample").addEventListener("click", function () {
      document.getElementById("ss-name").value = "Leo";
      document.getElementById("ss-pronoun").value = "he";
      document.getElementById("ss-subject").value = "sci";
      document.getElementById("ss-band").value = "35";
      draw();
      document.getElementById("ss-opening").value = "curious";
      document.getElementById("ss-moment").value = "suggested testing the paper towels with the same amount of water each time";
      var pre = { investigate: "s", measure: "g", explain: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("ss-run").click();
    });
    document.getElementById("ss-next").addEventListener("click", function () {
      ["ss-name", "ss-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("ss-name").focus();
    });
  });
})();
