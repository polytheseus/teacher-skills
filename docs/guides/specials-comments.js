// Report card comment builder for art, music and PE (the "specials"), grades
// K-8 / Years 1-9. Pick the subject, one or two areas with the level the student
// is working at, a participation strength, the next step and a home tip, and it
// writes a short comment that names a real skill, gives one next step and fits
// the small comment boxes specials teachers get. The checker flags fixed-ability
// labels ("not sporty", "tone deaf", "can't draw"), talent praise, body and weight
// comments, gender stereotypes, medical or support-plan details, fitness-test
// scores, comparisons with classmates, labels, sitting-out complaints without a
// plan, teacher jargon, stock phrases, placeholders, mixed pronouns and characters
// that break report systems. Runs in the browser and in node (module.exports)
// for tests. Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name as its subject, so "they" never needs verb
  // agreement. {a|b} = UK|US wording.
  var SUBJECTS = [
    { id: "art", label: "{Art and design|Art}", lessons: "{art and design|art} lessons", gear: "the art materials and helps tidy up", share: "shares {their} artwork with the class" },
    { id: "music", label: "Music", lessons: "music lessons", gear: "the instruments", share: "performs for the class" },
    { id: "pe", label: "PE", lessons: "PE lessons", gear: "the equipment and helps set up and put it away", share: "demonstrates skills for the class" }
  ];
  var LEVELS = [
    { id: "strong", label: "Working above expectations" },
    { id: "secure", label: "Meeting expectations" },
    { id: "developing", label: "Still developing" }
  ];
  // s = what the student does now (after the name), g = next step (after "working on").
  var AREAS = {
    art: [
      { id: "making", label: "Drawing, painting and making", strong: { s: "uses drawing, painting and making techniques with real control and chooses materials to suit {their} ideas", g: "trying new techniques to take {their} work further" },
        secure: { s: "uses a range of materials and techniques with growing control and care", g: "adding more detail and texture to finished pieces" },
        developing: { s: "is learning to use art tools and materials with more control", g: "taking time over each step so finished pieces show more care" } },
      { id: "ideas", label: "Ideas and creativity", strong: { s: "comes up with original ideas and develops them through sketches and trials before starting a final piece", g: "explaining the choices behind {their} ideas" },
        secure: { s: "comes up with {their} own ideas and plans {their} work before starting", g: "sketching more than one idea before choosing the best" },
        developing: { s: "is starting to come up with {their} own ideas, especially when we look at examples together", g: "sketching a few quick ideas before starting a piece" } },
      { id: "looking", label: "Looking at art and artists", strong: { s: "talks about artworks thoughtfully, noticing how artists use {colour|color}, line and shape", g: "using ideas from artists in {their} own work" },
        secure: { s: "describes artworks using art words such as line, shape and {colour|color}", g: "giving reasons for {their} opinions about artworks" },
        developing: { s: "joins in when we look at artworks together and is starting to describe what is in them", g: "using art words such as line, shape and {colour|color} to describe artworks" } },
      { id: "reviewing", label: "Reviewing and improving work", strong: { s: "reviews {their} own artwork honestly and makes thoughtful changes to improve it", g: "giving helpful feedback to classmates on their artwork" },
        secure: { s: "talks about what went well in {their} artwork and what could be better", g: "making one planned change to improve a piece after feedback" },
        developing: { s: "is learning to look back at {their} artwork and say what went well", g: "choosing one thing to improve after looking at {their} work" } }
    ],
    music: [
      { id: "singing", label: "Singing", strong: { s: "sings in tune with a clear voice and holds a part confidently in songs with more than one part", g: "singing with more expression, changing the volume to suit the song" },
        secure: { s: "sings in tune with the class and remembers the words and melody of our songs", g: "singing with more confidence when performing in a small group" },
        developing: { s: "joins in with singing and is learning the words and tunes of our class songs", g: "matching the pitch of the notes when singing" } },
      { id: "playing", label: "Beat, rhythm and instruments", strong: { s: "keeps a steady beat and plays rhythms accurately on instruments, including from written notes", g: "keeping {their} own part going while others play different parts" },
        secure: { s: "keeps a steady beat and copies rhythms accurately on percussion instruments", g: "reading and playing simple rhythms from written notes" },
        developing: { s: "is learning to keep a steady beat when clapping and playing instruments", g: "keeping the beat steady through a whole song" } },
      { id: "creating", label: "Creating and composing", strong: { s: "creates {their} own musical ideas and puts them together into short pieces with a clear structure", g: "writing down {their} compositions so others can play them" },
        secure: { s: "makes up short rhythms and tunes and shares them with the class", g: "repeating and changing musical ideas to build a longer piece" },
        developing: { s: "is starting to make up short rhythm patterns", g: "trying out different sounds on instruments to make up a pattern" } },
      { id: "listening", label: "Listening and responding", strong: { s: "listens closely to music and describes it using musical words such as tempo, dynamics and pitch", g: "comparing different pieces and styles of music" },
        secure: { s: "listens carefully and describes music as fast or slow, loud or quiet, high or low", g: "using musical words such as tempo and dynamics to describe music" },
        developing: { s: "enjoys listening to music and is starting to notice when it is loud or quiet, fast or slow", g: "listening to a whole piece and describing one thing heard in it" } }
    ],
    pe: [
      { id: "skills", label: "Movement skills", strong: { s: "runs, jumps, throws and catches with control and accuracy, and uses these skills well in new activities", g: "keeping {their} technique consistent at speed and in games" },
        secure: { s: "throws, catches, runs and jumps with good control", g: "using these skills accurately while on the move" },
        developing: { s: "is building confidence in running, jumping, throwing and catching", g: "throwing and catching with more control" } },
      { id: "games", label: "Games and tactics", strong: { s: "reads the game well, finds space and makes smart choices about when to pass, move or shoot", g: "{organising|organizing} {their} team in small-sided games" },
        secure: { s: "understands the rules of our games and moves into space to help {their} team", g: "making quick decisions about when to pass and when to move" },
        developing: { s: "is learning the rules of our games and joins in with team play", g: "moving into space to receive the ball" } },
      { id: "fitness", label: "Fitness and health", strong: { s: "works hard in fitness activities and can explain how exercise helps the body", g: "setting {their} own fitness goals and tracking {their} progress" },
        secure: { s: "keeps going in fitness activities and knows why we warm up", g: "building stamina to keep going for longer in running activities" },
        developing: { s: "takes part in warm-ups and fitness activities and is learning how they help the body", g: "keeping going a little longer each time in running activities" } },
      { id: "teamwork", label: "Teamwork and fair play", strong: { s: "is an encouraging teammate who plays fairly, follows the rules and helps others improve", g: "taking on leadership roles such as team captain or referee" },
        secure: { s: "works well with teammates, takes turns and plays by the rules", g: "accepting the result calmly, whether {their} team wins or loses" },
        developing: { s: "is learning to take turns and share equipment with teammates", g: "playing by the rules and accepting decisions in games" } }
    ]
  };
  var STRENGTHS = [
    { id: "enthusiasm", label: "Enthusiastic", s: "brings real enthusiasm to {lessons}" },
    { id: "effort", label: "Works hard", s: "works hard in every lesson, especially when learning something new" },
    { id: "listens", label: "Listens and gets started", s: "listens carefully to instructions and gets started quickly" },
    { id: "kind", label: "Kind and encouraging", s: "is kind and encouraging to classmates" },
    { id: "care", label: "Takes care of {gear}", s: "takes good care of {gear}" },
    { id: "safe", label: "Follows safety rules", s: "follows our safety rules carefully" },
    { id: "persists", label: "Keeps trying", s: "keeps trying when something is difficult" },
    { id: "confident", label: "Confident sharing work", s: "{share} with confidence" },
    { id: "feedback", label: "Uses feedback", s: "listens to feedback and uses it to improve" }
  ];
  // Optional second next step, about habits. subj = which subjects it suits.
  var HABITS = [
    { id: "", label: "(none)", s: "", subj: "art music pe" },
    { id: "kit", label: "Bringing {PE kit|gym clothes and sneakers}", s: "bringing {PE kit|gym clothes and sneakers} to every lesson", subj: "pe" },
    { id: "listening", label: "Listening while others speak or perform", s: "listening while others are speaking or performing", subj: "art music pe" },
    { id: "tidy", label: "Helping to tidy up", s: "helping to tidy up materials at the end of the lesson", subj: "art" },
    { id: "practice", label: "Practising at home", s: "{practising|practicing} {their} instrument for a few minutes most days", subj: "music" },
    { id: "turns", label: "Waiting for a turn", s: "waiting patiently for {their} turn", subj: "art music pe" },
    { id: "focus", label: "Staying focused all lesson", s: "staying focused for the whole lesson", subj: "art music pe" },
    { id: "start", label: "Starting straight after instructions", s: "starting tasks straight after the instructions", subj: "art music pe" },
    { id: "result", label: "Handling winning and losing", s: "staying calm and positive whether {their} team wins or loses", subj: "pe" }
  ];
  var HOME = {
    art: [
      { id: "", label: "(none)", s: "" },
      { id: "sketch", label: "Keep a sketchbook", s: "At home, keep a sketchbook and draw together, even for a few minutes.", why: "Drawing often builds confidence and control." },
      { id: "look", label: "Look at art together", s: "At home, look at picture books, art books or a local gallery together and talk about what you like." },
      { id: "make", label: "A box of making materials", s: "At home, keep a box of card, tubes and boxes so {name} can make things." }
    ],
    music: [
      { id: "", label: "(none)", s: "" },
      { id: "sing", label: "Sing and clap the beat", s: "At home, sing along to favourite songs together and clap the beat.", why: "Singing for fun builds pitch and rhythm." },
      { id: "listen", label: "Listen to different music", s: "At home, listen to different kinds of music together and talk about how each one sounds." },
      { id: "teach", label: "Ask to be taught a song", s: "At home, ask {name} to teach you a song or rhythm from our lessons." }
    ],
    pe: [
      { id: "", label: "(none)", s: "" },
      { id: "active", label: "Be active together", s: "At home, find ways to be active together, such as walking, cycling or a trip to the park.", why: "{UK guidelines suggest children are active for an average of at least 60 minutes a day across the week.|The CDC recommends 60 minutes or more of activity each day for children and teens.}" },
      { id: "catch", label: "Throw and catch together", s: "At home, {practise|practice} throwing and catching together, with a ball or a pair of rolled-up socks." },
      { id: "club", label: "Try a club", s: "If {name} would like to try a new sport, a local or after-school club is a good next step." }
    ]
  };
  var CLOSES = {
    early: ["I'm looking forward to seeing {name}'s progress next {period}.", "Well done on a good start to the year, {name}."],
    end: ["I have enjoyed teaching {name} this year.", "Well done on a good year, {name}."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = { us: { period: "quarter" }, uk: { period: "term" } };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  function fill(t, o) {
    var uk = o.style === "uk", w = WORDS[uk ? "uk" : "us"], subj = find(SUBJECTS, o.subject) || SUBJECTS[0];
    var once = String(t).replace(/\{(lessons|gear|share)\}/g, function (m, k) { return subj[k]; });
    return once.replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return uk ? a : b; })
      .replace(/\{(\w+)\}/g, function (m, k) {
        if (k === "name") return o.name || "[Name]";
        if (k === "their") return PRON[o.pronoun] || PRON.they;
        if (k === "period") return o.period || w.period;
        if (k in w) return w[k];
        return m;
      });
  }
  function also(s) {
    if (/^is /.test(s)) return s.replace(/^is /, "is also ");
    if (/^(enjoys|joins) /.test(s)) return "also " + s;
    return "also " + s;
  }
  function areasFor(subject) { return AREAS[subject] || []; }
  function homesFor(subject) { return HOME[subject] || []; }
  function habitsFor(subject) { return HABITS.filter(function (h) { return h.subj.indexOf(subject) >= 0; }); }

  // opts: { name, pronoun, style: us|uk, timing: early|end, period, subject,
  //         unit: "text", area, level, area2, level2, focus: area id,
  //         strengths: [id], habit: id, home: id, limit }
  function build(o) {
    o = o || {};
    var subject = find(SUBJECTS, o.subject) ? o.subject : "";
    if (!subject) return { ok: false, msg: "Pick the subject." };
    var areas = areasFor(subject);
    var a1 = find(areas, o.area) || areas[0];
    var l1 = find(LEVELS, o.level) ? o.level : "secure";
    var a2 = o.area2 && o.area2 !== a1.id ? find(areas, o.area2) : null;
    var l2 = find(LEVELS, o.level2) ? o.level2 : l1;
    // The next step comes from the chosen area at the level the student is at there.
    var fa = find(areas, o.focus) || (a2 && LEVELS.map(function (x) { return x.id; }).indexOf(l2) > LEVELS.map(function (x) { return x.id; }).indexOf(l1) ? a2 : a1);
    var fl = fa === a1 ? l1 : fa === a2 ? l2 : l1;
    var strengths = (o.strengths || []).map(function (id) { return find(STRENGTHS, id); }).filter(Boolean);
    var habit = find(habitsFor(subject), o.habit || "");
    var home = find(homesFor(subject), o.home || "");
    var unit = String(o.unit || "").trim().replace(/[.!,;:]+$/, "").replace(/^(in |during )?(our |the )?(work on |unit on )?/i, "");
    var issues = [], seed = hash(String(o.name || "") + subject + a1.id + l1);
    if (!strengths.length) issues.push({ level: "review", msg: "No participation strength picked. In " + fill(find(SUBJECTS, subject).label, o) + ", effort, care and how the student treats others matter to families as much as the skill; tick one that's true." });
    if (strengths.length > 2) { issues.push({ level: "note", msg: "Used the first two strengths; a short comment reads better with one or two." }); strengths = strengths.slice(0, 2); }
    var parts = [], idxS2 = -1, idxA2 = -1, idxHabit = -1, idxHome = -1, idxWhy = -1;
    if (strengths[0]) parts.push("{name} " + strengths[0].s + ".");
    if (strengths[1]) { idxS2 = parts.length; parts.push("{name} " + also(strengths[1].s) + "."); }
    parts.push((unit ? "In our work on " + unit + ", " : "") + "{name} " + a1[l1].s + ".");
    if (a2) { idxA2 = parts.length; parts.push("{name} " + also(a2[l2].s) + "."); }
    parts.push("Next, {name} is working on " + fa[fl].g + ".");
    if (habit && habit.s) { idxHabit = parts.length; parts.push("{name} is also working on " + habit.s + "."); }
    if (home && home.s) { idxHome = parts.length; parts.push(home.s); if (home.why) { idxWhy = parts.length; parts.push(home.why); } }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { if (idxWhy >= 0) parts[idxWhy] = ""; },
      function () { parts[idxClose] = ""; },
      function () { if (idxS2 >= 0) parts[idxS2] = ""; },
      function () { if (idxHome >= 0) { parts[idxHome] = ""; issues.push({ level: "note", msg: "Dropped the home tip to fit your limit." }); } },
      function () { if (idxHabit >= 0) { parts[idxHabit] = ""; issues.push({ level: "note", msg: "Dropped the habit next step to fit your limit." }); } },
      function () { if (idxA2 >= 0) { parts[idxA2] = ""; issues.push({ level: "note", msg: "Dropped the second area to fit your limit." }); } }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(not (very |naturally |really )?(artistic|musical|sporty|athletic|creative|co-?ordinated)|no (artistic |musical |sporting |natural )?(talent|rhythm|sense of rhythm|ear for music)|tone[- ]deaf|two left feet|(can'?t|cannot) (draw|sing|dance|catch|throw|kick|run|swim|hold a tune)|(un|poorly )co-?ordinated|clumsy)\b/i, "fix", "Fixed-ability label: \"$1\". It tells the family the skill can't be learned. Describe what the student does now and the next step (\"is learning to keep a steady beat\")."],
    [/\b(natural(ly)? (talent(ed)?|athlete|artist|musician|ability|gift(ed)?)|(gifted|talented|born) (artist|athlete|musician|singer|dancer|sportsman|sportswoman)|gifted|talented|a natural)\b/i, "review", "Talent praise: \"$1\". It suggests the skill is a gift rather than practice, and it's vague. Name what the student does (\"chooses {colours|colors} to show mood\", \"holds a part in a round\")."],
    [/\b(overweight|obes\w*|fat|chubby|skinny|weight|BMI|body mass)\b/i, "fix", "Body or weight comment: \"$1\". Keep body size, weight and BMI out of reports. Comment on effort, skills and how the student keeps going."],
    [/\b(out of shape|unfit|out of breath|not fit)\b/i, "review", "\"$1\" reads as a comment on the child's body. Describe effort and the student's own progress (\"keeps going a little longer each time\")."],
    [/\b(for a (girl|boy)|like a (girl|boy)|girly|tomboy|(boys|girls)'? (sports?|games?|instruments?)|unladylike|man up|manly)\b/i, "fix", "Gender stereotype: \"$1\". Describe the skill without reference to gender."],
    [/\b(asthma\w*|inhalers?|adhd|autis\w*|on the spectrum|dyspraxi\w*|hypermobil\w*|injur\w*|medical\w*|medicat\w*|diagnos\w*|special needs|special education|iep|504( plan)?|ehcp|disabilit\w*|wheelchair|physio\w*|occupational therap\w*|epilep\w*|diabet\w*|sensory processing|ear defenders)\b/i, "fix", "Medical or support-plan detail: \"$1\". Keep it out of the written report; talk to the family and your SEN/special education colleagues instead."],
    [/\b(SEN|SEND|DCD)\b/, "fix", "Support-plan language: \"$1\". Keep it out of the written report unless your school's policy says otherwise."],
    [/\b(FitnessGram|PACER|beep test|bleep test|Healthy Fitness Zone|HFZ|Needs Improvement Zone|sit[- ]and[- ]reach|push-?up test|curl-?up test|mile time|level \d+(\.\d+)? (on|in) the)\b/i, "review", "Fitness test result: \"$1\". Fitness scores are personal, and many schools share them separately. If you mention fitness, describe effort and the student's own progress."],
    [/\b(best (in|of) (the|my|our) (class|group|year|grade|team)|(fastest|slowest|strongest|weakest|worst|lowest|top) (in|of) (the|my|our) (class|group|year|grade|team)|than (most|many|the other|other|the rest of) (children|kids|students|classmates|pupils|the class|girls|boys)|the rest of the class|picked last|compared (to|with) (the class|the others|others|(his|her|their) (classmates|peers)))\b/i, "review", "Comparison: \"$1\". Report on this student's own skills and progress; other families read reports too."],
    [/\b(lazy|unmotivated|careless|naughty|rude|stubborn|defiant|disruptive|immature|sloppy|uncooperative|messy|bad sport|sore loser|show-?off|hyper|hyperactive|weak student|slow learner)\b/i, "fix", "Label: \"$1\". Describe what the student does and what's helping instead."],
    [/\b(sits? out|sat out|sitting out|refuses to (change|participate|take part|join in|sing|dance|play)|won'?t (change|participate|take part|join in|sing|dance|play)|(no|without (his|her|their)) (PE )?kit|forgets? (his|her|their) (PE )?(kit|gym clothes|sneakers|trainers|uniform))\b/i, "review", "\"$1\": say how often and what would help (\"is working on bringing PE kit to every lesson\"). If the student sits out for health or family reasons, leave it out of the report."],
    [/\b(can'?t|cannot|unable to|refuses to|doesn'?t (even )?(try|listen)|does not listen)\b/i, "review", "\"$1\" puts the gap first. Try \"is learning to\", \"is starting to\" or describe what happens now."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or give an example."],
    [/(\[(name|student|child|first name|pronoun|unit|project)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(locomotor|non-locomotor|manipulative skills|object control|fundamental movement skills|FMS|kinesthetic|kinaesthetic|propriocept\w*|ostinato|timbre|solf[eè]ge|pentatonic|Orff|Kod[aá]ly|Dalcroze|rondo form|ABA form|anchor standards?|NCAS|SHAPE America|grade-level outcomes?|GLOs?|elements of art|principles of design|formal elements|chiaroscuro|tessellat\w*|programmes? of study|attainment target)\b/i, "note", "Teacher jargon: \"$1\". Families won't know it. Say what the student does (\"runs, hops and skips\", \"keeps a repeating rhythm going\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shining star|superstar|budding (artist|musician|athlete|star)|little (Picasso|Mozart|Beethoven)|future (Olympian|star|pop star)|Olympian)\b/i, "note", "Stock phrase: \"$1\". It reads as generic (and as AI-written). Name a real skill instead."],
    [/\b(alarming|red flag|deeply concerned|very concerned|extremely concerned|seriously worried)\b/i, "review", "\"$1\" on a written report can alarm a family. Say what you've seen and what you're doing; save the worry for a conversation."]
  ];
  var SKILL = /\b(draw\w*|paint\w*|colou?r\w*|shapes?|lines?|sketch\w*|clay|print\w*|collage|sculpt\w*|design\w*|artwork\w*|artists?|materials|techniques?|textures?|sing\w*|songs?|beat|rhythms?|instruments?|tunes?|melod\w*|pitch|compos\w*|perform\w*|notes|tempo|dynamics|music|throw\w*|catch\w*|run\w*|jump\w*|kick\w*|balanc\w*|games?|team\w*|skills?|space|pass\w*|stamina|fitness|warm-?ups?|dance\w*|danc\w*|gymnastics|swim\w*|rules)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: fill(c[2].replace("$1", m[1] || m[0]), o) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the second strength, the home tip or the closing line." });
    var needs = (t.match(/\b(needs to|must|has to|should)\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. Turn one into \"next, X is working on\"." });
    if (!SKILL.test(t)) issues.push({ level: "review", msg: "No subject skill named. \"Enjoys music\" could be about any student; name one thing this student does in the subject (\"keeps a steady beat on the drum\")." });
    if (!/\b(next|working on|work on|focus|goal|aim|learning to|is learning|starting to|try|practi[sc]e)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one specific thing the student is working on next." });
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
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 30; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 30 words. Split it so it's easy to read aloud." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { SUBJECTS: SUBJECTS, LEVELS: LEVELS, AREAS: AREAS, STRENGTHS: STRENGTHS, HABITS: HABITS, HOME: HOME, build: build, check: check, plain: plain, fill: fill, habitsFor: habitsFor };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(items) {
    return items.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sGrid = document.getElementById("sp-strengths");
    if (!sGrid) return;
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    function options(sel, items, o, none) {
      var keep = sel.value;
      sel.innerHTML = (none ? "<option value=\"\">" + none + "</option>" : "") + items.map(function (x) { return "<option value=\"" + x.id + "\">" + esc(fill(x.label, o)) + "</option>"; }).join("");
      if (keep && sel.querySelector("option[value=\"" + keep + "\"]")) sel.value = keep;
    }
    function checked(grid) { return Array.prototype.filter.call(grid.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); }
    function render() {
      var o = { style: val("sp-style"), subject: val("sp-subject") || "art" }, ck = checked(sGrid);
      options(el("sp-subject"), SUBJECTS, o);
      o.subject = val("sp-subject");
      sGrid.innerHTML = STRENGTHS.map(function (s) { return "<label class=\"sc-box\"><input type=\"checkbox\" value=\"" + s.id + "\"> " + esc(fill(s.label, o)) + "</label>"; }).join("");
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = ck.indexOf(i.value) >= 0; });
      options(el("sp-area"), areasFor(o.subject), o);
      options(el("sp-area2"), areasFor(o.subject), o, "(none)");
      options(el("sp-focus"), areasFor(o.subject), o, "(the area with the lower level)");
      options(el("sp-habit"), habitsFor(o.subject), o);
      options(el("sp-home"), homesFor(o.subject), o);
      ["sp-level", "sp-level2"].forEach(function (id) { options(el(id), LEVELS, o); if (!el(id).value) el(id).value = "secure"; });
    }
    el("sp-subject").innerHTML = "<option value=\"art\"></option>";
    render();
    el("sp-level").value = "secure"; el("sp-level2").value = "secure";
    function opts() {
      return { name: val("sp-name").trim(), pronoun: val("sp-pronoun"), style: val("sp-style"), timing: val("sp-timing"), period: val("sp-period"),
        subject: val("sp-subject"), unit: val("sp-unit"), area: val("sp-area"), level: val("sp-level"), area2: val("sp-area2"), level2: val("sp-level2"),
        focus: val("sp-focus"), strengths: checked(sGrid), habit: val("sp-habit"), home: val("sp-home"), limit: val("sp-limit") };
    }
    el("sp-subject").addEventListener("change", function () { el("sp-unit").value = ""; render(); });
    el("sp-style").addEventListener("change", function () { render(); el("sp-period").value = this.value === "uk" ? "term" : "quarter"; });
    var out = el("sp-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"sp-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"sp-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"sp-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"sp-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"sp-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = el("sp-text");
      ta.addEventListener("input", function () { el("sp-count").textContent = ta.value.length; });
      el("sp-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      el("sp-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      el("sp-plain").addEventListener("click", function () { ta.value = plain(ta.value); el("sp-count").textContent = ta.value.length; });
    }
    el("sp-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    el("sp-check").addEventListener("click", function () {
      var v = val("sp-paste");
      show(v, check(v, opts()), v.length);
    });
    el("sp-sample").addEventListener("click", function () {
      el("sp-subject").value = "music"; render();
      el("sp-name").value = "Leo";
      el("sp-pronoun").value = "he";
      el("sp-unit").value = "rhythm and percussion";
      el("sp-area").value = "playing"; el("sp-level").value = "strong";
      el("sp-area2").value = "singing"; el("sp-level2").value = "developing";
      el("sp-focus").value = "";
      el("sp-habit").value = "listening";
      el("sp-home").value = "sing";
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = i.value === "enthusiasm"; });
      el("sp-run").click();
    });
    el("sp-next").addEventListener("click", function () {
      el("sp-name").value = "";
      Array.prototype.forEach.call(sGrid.querySelectorAll("input"), function (i) { i.checked = false; });
      out.innerHTML = ""; el("sp-name").focus();
    });
  });
})();
