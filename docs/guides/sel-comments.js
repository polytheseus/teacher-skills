// Social-emotional learning (SEL) report card comment builder for grades K-8
// (UK Reception to Year 9). Pick one or two skills from the five CASEL areas
// (self-awareness, self-management, social awareness, relationship skills,
// responsible decision-making) with how consistently the student shows each,
// and it writes a short, strengths-first comment with one next step, how school
// is helping and an optional home tip. The checker flags diagnoses and
// mental-health guesses, home circumstances, incidents (hitting, fights,
// referrals), labels ("shy", "bossy", "aggressive"), hurtful friendship lines
// ("has no friends"), comparisons, SEL jargon (self-regulation, zones,
// competencies), stock phrases, "can't", "always", "never", placeholders,
// mixed pronouns and characters that break report systems. Runs in the browser
// and in node (module.exports) for tests. Nothing typed is sent or stored.
(function () {
  // Every sentence uses the name as its subject, so "they" never needs verb
  // agreement. {a|b} = UK|US wording. A phrase is a string or { y, o }:
  // y = K-2 (Reception-Year 2), o = grades 3-8 (Years 3-9).
  var LEVELS = [
    { id: "strong", label: "Consistently" },
    { id: "secure", label: "Usually" },
    { id: "developing", label: "Developing" }
  ];
  var AREAS = [
    { id: "self", label: "Self-awareness" },
    { id: "manage", label: "Self-management" },
    { id: "social", label: "Social awareness" },
    { id: "relate", label: "Relationship skills" },
    { id: "decide", label: "Responsible decision-making" }
  ];
  // s = what the student does now (after the name), g = next step (after
  // "working on"), sch = how school helps (after "We are practising this"),
  // home = home tip (after "At home, you could").
  var SKILLS = [
    { id: "feelings", area: "self", label: "Naming feelings",
      strong: { s: { y: "names {their} feelings and can say what caused them", o: "describes {their} feelings clearly and explains what caused them" }, g: "noticing how {their} feelings affect {their} choices" },
      secure: { s: { y: "names {their} feelings, especially with a moment to think first", o: "describes {their} feelings when given a moment to think" }, g: "explaining what caused a feeling as well as naming it" },
      developing: { s: { y: "is learning to name {their} feelings and does this well with a feelings chart", o: "is learning to put {their} feelings into words and does this well when talking one to one" }, g: { y: "using a feelings chart to show {their} feelings", o: "describing {their} feelings to an adult using a simple scale from calm to upset" } },
      sch: { y: "with a feelings chart at morning check-in", o: "with a quick feelings check-in at the start of the day" },
      home: { y: "name your own feelings out loud (\"I feel frustrated because the bus is late\") and ask {name} how a character in a story feels", o: "share one high and one low from your day at dinner and invite {name} to do the same" } },
    { id: "confidence", area: "self", label: "Confidence with new challenges",
      strong: { s: "approaches new challenges with confidence and treats mistakes as part of learning", g: "choosing challenge tasks that stretch {their} thinking" },
      secure: { s: "is willing to try new challenges and is becoming more comfortable with making mistakes", g: "having a go at a hard task before asking for help" },
      developing: { s: "is building confidence with new challenges and does best with encouragement to have a go", g: "trying the first step of a new task on {their} own" },
      sch: "by talking about mistakes as part of learning",
      home: "talk about a mistake you made and what you learned from it, and praise {name} for trying, not only for getting it right" },
    { id: "strengths", area: "self", label: "Knowing strengths and when to ask for help",
      strong: { s: "knows {their} own strengths and asks for help with a clear question when stuck", g: "setting a personal goal that builds on {their} strengths" },
      secure: { s: "is starting to describe {their} strengths and usually asks for help when stuck", g: "asking for help with a specific question" },
      developing: { s: "is learning to {recognise|recognize} {their} own strengths and when to ask for help", g: "telling an adult when stuck or in need of help" },
      sch: "by asking students what they are proud of each week",
      home: "ask {name} \"what are you proud of this week?\" and \"what was tricky?\"" },
    { id: "calm", area: "manage", label: "Managing strong feelings",
      strong: { s: "manages strong feelings calmly and uses calming strategies independently", g: "using {their} calming strategies in new situations, such as tests or competitive games" },
      secure: { s: "usually manages strong feelings well and uses a calming strategy with a reminder", g: "choosing a calming strategy without a reminder" },
      developing: { s: { y: "is learning ways to calm down when upset, such as taking deep breaths or using the calm corner", o: "is learning ways to calm down when upset, such as taking slow breaths or a short break" }, g: "using one calming strategy, such as slow breaths, at the first sign of feeling upset" },
      sch: "with a calm-down plan that {name} helped to choose",
      home: "{practise|practice} one calming strategy together when everyone is calm, such as five slow breaths, so it is easier to use when upset" },
    { id: "control", area: "manage", label: "Self-control and waiting",
      strong: { s: "thinks before acting and waits patiently for {their} turn", g: "staying patient in exciting moments such as games and {lining up|transitions}" },
      secure: { s: "usually thinks before acting and waits for {their} turn with an occasional reminder", g: "waiting for {their} turn without a reminder" },
      developing: { s: "is learning to stop and think before acting, and is more successful with a quiet reminder", g: "pausing to stop and think before acting" },
      sch: "with a quiet signal that reminds {name} to stop and think",
      home: "play turn-taking games such as board games or card games, and praise {name} for waiting" },
    { id: "goals", area: "manage", label: "Perseverance and goal setting",
      strong: { s: "sets {their} own goals and keeps going when tasks get hard", g: "setting longer-term goals and checking {their} own progress" },
      secure: { s: "keeps working on difficult tasks and is starting to set {their} own goals", g: "setting one small goal each week and checking it at the end of the week" },
      developing: { s: "is building the stamina to keep going when a task is hard and does best when it is broken into small steps", g: "keeping going for a few more minutes when a task gets hard" },
      sch: "by breaking longer tasks into small steps",
      home: "help {name} pick one small goal for the week, such as reading for ten minutes a day, and celebrate when it is done" },
    { id: "empathy", area: "social", label: "Empathy and kindness",
      strong: { s: "notices how others are feeling and responds with real kindness", g: "checking in on classmates who seem upset or left out" },
      secure: { s: "is kind to classmates and is starting to notice how others are feeling", g: "noticing how a classmate is feeling from their face and words" },
      developing: { s: "is learning to notice how others feel and responds kindly with a little help", g: "asking a classmate \"are you OK?\" when they look upset" },
      sch: "by talking about how characters in our stories feel",
      home: "pause when reading or watching TV together and ask {name} how a character might be feeling and why" },
    { id: "perspectives", area: "social", label: "Seeing other points of view",
      strong: { s: "listens respectfully to other points of view, even when disagreeing", g: "explaining a point of view that is different from {their} own" },
      secure: { s: "listens to other points of view and is learning that people can see things differently", g: "asking classmates \"what do you think?\" in discussions" },
      developing: { s: "is learning that others may see things differently and is {practising|practicing} listening to other views", g: "listening to a classmate's idea before sharing {their} own" },
      sch: "with partner talk, where each partner listens before replying",
      home: "take turns to explain each side when you disagree about something small, before deciding" },
    { id: "inclusion", area: "social", label: "Respect and including others",
      strong: { s: "treats everyone with respect and helps others feel included", g: "inviting classmates who are on their own to join in" },
      secure: { s: "treats classmates with respect and includes others in activities", g: "working and playing with a wider range of classmates" },
      developing: { s: "is learning to include others in games and activities", g: "inviting one new classmate to join in each week" },
      sch: "by mixing partners and groups often",
      home: "talk about a time someone included {name} and how it felt" },
    { id: "friends", area: "relate", label: "Making and keeping friends",
      strong: { s: "makes friends easily and is a supportive, caring friend", g: "getting to know classmates beyond {their} usual group" },
      secure: { s: "gets on well with classmates and is building good friendships", g: { y: "joining in with a new group at {playtime|recess}", o: "working with different classmates in group tasks" } },
      developing: { s: "is building friendships and is most comfortable with one friend or a small group", g: { y: "asking a classmate to play at {playtime|recess}", o: "inviting a classmate to work together on an activity" } },
      sch: { y: "with structured games at {playtime|recess}", o: "with small-group tasks and clubs" },
      home: { y: "{practise|practice} ways to join a game, such as \"can I play too?\", through role play", o: "ask who {name} spent time with today, not only about the work" } },
    { id: "communication", area: "relate", label: "Communicating and listening",
      strong: { s: "listens carefully to others and expresses {their} ideas and needs clearly and respectfully", g: "helping a group reach a decision by summing up what everyone has said" },
      secure: { s: "listens to others and usually expresses {their} needs clearly", g: "using \"I\" statements to share feelings, such as \"I feel upset when...\"" },
      developing: { s: "is learning to put {their} needs into words and does well with sentence starters such as \"I need...\"", g: "using words to ask for help or for a turn" },
      sch: "with sentence starters on the wall",
      home: "give {name} time to finish speaking before you reply, and ask one follow-up question" },
    { id: "teamwork", area: "relate", label: "Teamwork and cooperation",
      strong: { s: "works well in a team, shares ideas and encourages others", g: "taking on different roles in a group, including leading it" },
      secure: { s: "cooperates in group work and shares materials and ideas", g: "making sure everyone in the group has a turn to speak" },
      developing: { s: "is learning to share and take turns in group work and is more successful working with a partner", g: "sharing materials and taking turns in a small group" },
      sch: "with clear roles in group tasks",
      home: "cook, build or tidy something together and give {name} a clear job in the team" },
    { id: "conflict", area: "relate", label: "Sorting out disagreements",
      strong: { s: "sorts out disagreements calmly by listening and finding a fair solution", g: "helping classmates find fair solutions to disagreements" },
      secure: { s: "usually sorts out disagreements calmly and asks an adult for help when needed", g: "solving small disagreements with words before asking an adult" },
      developing: { s: "is learning to sort out disagreements with words, with help from an adult", g: "using a simple plan for disagreements: stop, share feelings, then listen" },
      sch: "with a simple stop, talk, listen plan for disagreements",
      home: "ask each person to say what happened when siblings or friends disagree, then agree one fair solution together" },
    { id: "choices", area: "decide", label: "Making safe, responsible choices",
      strong: { s: "makes thoughtful, safe choices and considers how they affect others", g: "explaining the reasons for {their} choices" },
      secure: { s: "usually makes safe choices and is learning to consider how they affect others", g: "thinking about how a choice will affect others before making it" },
      developing: { s: "is learning to think about what might happen before making a choice", g: "stopping to ask \"is this safe, and is this kind?\" before acting" },
      sch: "by talking through choices in everyday situations",
      home: "talk through everyday choices together: \"what could happen if...?\"" },
    { id: "responsibility", area: "decide", label: "Taking responsibility",
      strong: { s: "takes responsibility for {their} actions and learns from mistakes", g: "helping put things right when something goes wrong in a group" },
      secure: { s: "usually owns up to mistakes and is learning to put things right", g: "thinking about what to do differently next time" },
      developing: { s: "is learning to take responsibility for {their} actions and to talk through what happened", g: "saying what happened honestly and thinking of one way to put it right" },
      sch: "by talking through what happened and how to put it right",
      home: "ask \"what happened, and what could we do next time?\" when something goes wrong, rather than \"who started it?\"" },
    { id: "problems", area: "decide", label: "Solving everyday problems",
      strong: { s: "solves everyday problems independently by thinking of more than one solution", g: "weighing up the pros and cons of different solutions" },
      secure: { s: "solves everyday problems and asks for help when a problem is too big to solve alone", g: "thinking of two possible solutions before choosing one" },
      developing: { s: "is learning to solve small problems on {their} own before asking an adult", g: "trying one idea of {their} own before asking an adult for help" },
      sch: "by asking \"what could you try first?\" before helping",
      home: "ask \"what could you try?\" when {name} brings you a small problem, before offering a solution" }
  ];
  var CLOSES = {
    early: ["I look forward to seeing {name}'s progress next {period}.", "I look forward to working with {name} next {period}."],
    end: ["I have enjoyed {teaching|teaching} {name} this year.", "Best wishes to {name} for next year."]
  };
  var PRON = { she: "her", he: "his", they: "their" };
  var WORDS = { us: { period: "quarter" }, uk: { period: "term" } };

  function hash(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
  function pick(list, seed) { return list[seed % list.length]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function find(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function age(p, o) { return typeof p === "string" ? p : (o && o.age === "older" ? p.o : p.y); }

  function fill(t, o) {
    o = o || {};
    var uk = o.style === "uk", w = WORDS[uk ? "uk" : "us"];
    // Tokens first, so {a|b} choices can contain {name} and {their}.
    var once = String(t).replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their") return PRON[o.pronoun] || PRON.they;
      if (k === "period") return o.period || w.period;
      return m;
    });
    return once.replace(/\{([^{}|]*)\|([^{}]*)\}/g, function (m, a, b) { return uk ? a : b; });
  }
  function also(s) {
    if (/^is /.test(s)) return s.replace(/^is /, "is also ");
    if (/^usually /.test(s)) return s.replace(/^usually /, "also usually ");
    return "also " + s;
  }

  // opts: { name, pronoun, style: us|uk, age: young|older, timing: early|end,
  //         period, skill, level, skill2, level2, focus: skill id,
  //         school: bool, home: bool, limit }
  function build(o) {
    o = o || {};
    var s1 = find(SKILLS, o.skill) || SKILLS[0];
    var l1 = find(LEVELS, o.level) ? o.level : "secure";
    var s2 = o.skill2 && o.skill2 !== s1.id ? find(SKILLS, o.skill2) : null;
    var l2 = find(LEVELS, o.level2) ? o.level2 : l1;
    var order = LEVELS.map(function (x) { return x.id; });
    // Lead with the stronger skill; the next step comes from the weaker one.
    if (s2 && order.indexOf(l2) < order.indexOf(l1)) { var ts = s1, tl = l1; s1 = s2; l1 = l2; s2 = ts; l2 = tl; }
    var fs = find(SKILLS, o.focus);
    if (!fs || (fs !== s1 && fs !== s2)) fs = s2 && order.indexOf(l2) > order.indexOf(l1) ? s2 : (s2 && l1 === "strong" && l2 === "strong" ? s2 : s1);
    var fl = fs === s1 ? l1 : l2;
    var issues = [], seed = hash(String(o.name || "") + s1.id + l1);
    if (l1 === "developing" && !s2) issues.push({ level: "review", msg: "The comment only covers a skill that is still developing. Add a second skill the student does well so the family reads a strength first." });
    if (s2 && l1 === "developing" && l2 === "developing") issues.push({ level: "review", msg: "Both skills are still developing. If there's anything this student does well socially or emotionally, use it as one of the two so the comment starts with a strength." });
    var parts = [], idxS2 = -1, idxSch = -1, idxHome = -1, idxNext;
    parts.push("{name} " + age(s1[l1].s, o) + ".");
    if (s2) { idxS2 = parts.length; parts.push("{name} " + also(age(s2[l2].s, o)) + "."); }
    idxNext = parts.length;
    parts.push("Next, {name} is working on " + age(fs[fl].g, o) + ".");
    if (o.school !== false && fl !== "strong") { idxSch = parts.length; parts.push("We are {practising|practicing} this at school " + age(fs.sch, o) + "."); }
    if (o.home) { idxHome = parts.length; parts.push("At home, you could " + age(fs.home, o) + "."); }
    var idxClose = parts.length;
    parts.push(pick(CLOSES[o.timing === "end" ? "end" : "early"], seed));
    function join() { return cap(parts.filter(Boolean).map(function (p) { return cap(fill(p, o)); }).join(" ").replace(/\s+/g, " ").trim()); }
    var limit = Number(o.limit) || 0, text = join();
    var trims = [
      function () { parts[idxClose] = ""; },
      function () { if (idxSch >= 0) { parts[idxSch] = ""; issues.push({ level: "note", msg: "Dropped the \"practising this at school\" line to fit your limit." }); } },
      function () { if (idxHome >= 0) { parts[idxHome] = ""; issues.push({ level: "note", msg: "Dropped the home tip to fit your limit. You could send it in a note or share it at a conference instead." }); } },
      function () {
        if (idxS2 < 0) return;
        parts[idxS2] = "";
        if (fs === s2) parts[idxNext] = "Next, {name} is working on " + age(s1[l1].g, o) + ".";
        issues.push({ level: "note", msg: "Dropped the second skill to fit your limit." });
      }
    ];
    for (var ti = 0; limit && text.length > limit && ti < trims.length; ti++) { trims[ti](); text = join(); }
    return { ok: true, text: text, chars: text.length, issues: issues.concat(check(text, o)) };
  }

  var CHECKS = [
    [/\b(adhd|autis\w*|on the spectrum|asperger\w*|oppositional|sensory processing|anxiety|anxious disorder|depress\w*|bipolar|ocd|ptsd|trauma\w*|attachment (disorder|issues)|mental health|emotional(ly)? disturb\w*|ebd|sebd|semh|behaviou?r(al)? (disorder|problems|issues)|anger (issues|problems|management)|self-harm\w*|eating disorder|medicat\w*|meds|diagnos\w*|therap(y|ist)|counsell?(ing|or)|psycholog\w*|special needs|special education|iep|504( plan)?|ehcp|behaviou?r (intervention |support |improvement )?plan|disabilit\w*)\b/i, "fix", "Diagnosis, mental-health or support-plan language: \"$1\". Keep it out of the written report, and never guess at a condition. Describe what you see and the next step; talk to the family and your counselor, SEN or special education team directly."],
    [/\b(SEN|SEND|SENCO|PBIS|MTSS|RTI|ADD|ODD|SPD|BIP)\b/, "fix", "Support-system language: \"$1\". Families may not know it, and it can read as a label. Describe what the student does and what helps."],
    [/\b(divorc\w*|separat(ed|ion) parents|custody|home life|(family|home) (problems|issues|situation|circumstances)|problems at home|at home is|new baby|dad'?s (house|place)|mum'?s (house|place)|mom'?s (house|place)|foster\w*|in care|social (worker|services)|bereave\w*|grief|grieving|passed away|died|money (problems|worries)|moved house|housing)\b/i, "fix", "Home or family circumstances: \"$1\". Keep these out of the written report; talk to the family directly, and to your counselor or pastoral team if needed."],
    [/\b(hit(s|ting)?|kick(s|ed|ing)?|bites?|biting|punch\w*|push(es|ed|ing)? (other|classmates|children|kids|students|peers)|fights?|fighting|hurt(s)? (other|classmates|children|kids|students|peers)|threw|throws chairs|incidents?|referrals?|sent to the (office|principal|head)|detentions?|suspen(ded|sion)|exclu(ded|sion)|time-?outs?|lost (recess|playtime|golden time)|red card|on the red|clip (down|chart)|behaviou?r chart)\b/i, "fix", "Incident or sanction: \"$1\". Keep incidents in your school's behavior system and talk to the family directly; the report comment is for the skill and the next step (\"is learning to sort out disagreements with words\")."],
    [/\b(has no friends|no friends|doesn'?t have (any )?friends|does not have (any )?friends|friendless|unpopular|loner|left out by|nobody (wants|likes)|no one (wants|likes)|isolated|socially awkward|picked on|bullied|victim)\b/i, "fix", "\"$1\" is painful for a family to read and the student may read it too. Describe what helps: \"is building friendships and is most comfortable with one friend or a small group\". If you're worried about bullying or isolation, call the family."],
    [/\b(bully|bullies|bullying|bossy|aggressive|violent|mean|nasty|manipulative|sneaky|liar|lies|dishonest|attention[- ]seek\w*|dramatic|drama queen|cry ?baby|whiny|whin(es|ing)|clingy|needy|explosive|hot[- ]headed|short fuse|temper tantrums?|tantrums?|meltdowns?|outbursts?|overreact\w*|too sensitive|overly sensitive|hypersensitive|over-emotional|hyper(active)?|wild|immature|naughty|rude|disrespectful|defiant|stubborn|disruptive|uncooperative|selfish|lazy|unmotivated|antisocial|anti-social|chatterbox|class clown|troublemaker)\b/i, "fix", "Label: \"$1\". It describes the child, not the skill, and it sticks. Say what you see and what helps (\"is learning ways to calm down when upset, such as slow breaths\")."],
    [/\b(shy|very quiet|too quiet|quiet as a mouse|introverted|withdrawn|timid)\b/i, "review", "\"$1\" can stick as a label, and quiet isn't a problem in itself. Say what helps instead: \"is most comfortable sharing ideas with a partner\" or \"is building confidence with new challenges\"."],
    [/\b(best (in|of) (the|my|our) (class|group|year|grade)|than (most|many|the other|other|the rest of (the|his|her|their)) (students|classmates|pupils|children|kids|class|peers)|than (most|many|some) of (the|his|her|their|my|our) (students|classmates|pupils|children|kids|class|peers)|the rest of the class|compared (to|with) (the class|the others|others|(his|her|their) (classmates|peers))|unlike (his|her|their|the other|other) (classmates|peers|friends))\b/i, "review", "Comparison: \"$1\". Report on this student's own skills; other families read reports too."],
    [/\b(emotional(ly)? (immature|behind|young)|socially (immature|behind|young)|young for (his|her|their) age|not ready for (first|second|third|1st|2nd|3rd|year)|needs to grow up|act (his|her|their) age)\b/i, "fix", "\"$1\" reads as a judgement on the child and can worry a family about something you can't diagnose. Name the skill they're learning and the next step."],
    [/\b(could do better|needs to (try|behave|be) (harder|better|nicer|kinder)|must try harder|needs to learn to behave|needs to control (himself|herself|themselves|(his|her|their) (temper|emotions|anger)))\b/i, "review", "\"$1\" is vague or puts the gap first: the student can't act on it. Name one next step (\"using one calming strategy when starting to feel upset\")."],
    [/\b(can'?t|cannot|unable to|refuses to|doesn'?t (even )?(try|listen|care|share)|does not (listen|care|share)|won'?t (share|listen|stop))\b/i, "review", "\"$1\" puts the gap first. Try \"is learning to\", \"is starting to\" or describe what happens now."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely literally true and is hard to hear. Say \"often\", \"sometimes\" or give an example."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(sel|casel|competenc(y|ies)|self-regulat\w*|self regulat\w*|dysregulat\w*|co-regulat\w*|zones? of regulation|(blue|green|yellow|red) zone|executive function\w*|restorative (conversation|circle|practice)s?|check-in\/check-out|cico|tier [23]|social-emotional (standards?|benchmarks?)|interoception|emotional literacy|growth mindset)\b/i, "note", "Jargon: \"$1\". Families may not know it. Say what the student does (\"uses a calming strategy when upset\", \"names {their} feelings\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|pleasure to have in class|delightful|sweet (girl|boy|child|kid|soul)|ray of sunshine|heart of gold|big heart|kind soul|little angel|great kid|good citizen|model (student|pupil|citizen)|an asset to (the|our|my) class|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|tapestry|delve\w*|showcases?|shining star|superstar|exemplary)\b/i, "note", "Stock phrase: \"$1\". It reads as generic (and as AI-written). Name a real skill instead (\"checks in on classmates who seem upset\")."],
    [/\b(alarming|red flag|deeply concerned|very concerned|extremely concerned|seriously worried|worrying|disappointing|disappointed|unacceptable)\b/i, "review", "\"$1\" on a written report can alarm a family. Say what you've seen and what will help; save the worry for a phone call or meeting."]
  ];
  var SKILL = /\b(feel\w*|emotions?|calm\w*|upset|frustrat\w*|confiden\w*|challeng\w*|mistakes?|strengths?|help|turns?|wait\w*|patien\w*|think\w*|goals?|keeps? going|perseve\w*|kind\w*|empath\w*|notic\w*|point of view|views?|perspectives?|respect\w*|includ\w*|join\w*|friend\w*|classmates?|listen\w*|express\w*|words|needs|shar\w*|cooperat\w*|team\w*|group\w*|together|disagree\w*|solutions?|choices?|safe\w*|responsib\w*|owns? up|honest\w*|put things right|problems?)\b/i;

  function check(text, o) {
    o = o || {};
    var t = String(text || ""), issues = [];
    if (!t.trim()) return [{ level: "fix", msg: "Nothing to check." }];
    CHECKS.forEach(function (c) {
      var m = t.match(c[0]);
      if (m) issues.push({ level: c[1], msg: fill(c[2].replace("$1", m[1] || m[0]), o) });
    });
    var limit = Number(o.limit) || 0;
    if (limit && t.length > limit) issues.push({ level: "fix", msg: t.length + " characters, over your limit of " + limit + ". Drop the home tip, the school line or the second skill." });
    var needs = (t.match(/\b(needs to|must|has to|should)\b/gi) || []).length;
    if (needs >= 3) issues.push({ level: "review", msg: "\"Needs to\", \"must\" or \"should\" " + needs + " times. Turn one into \"next, X is working on\"." });
    if (!SKILL.test(t)) issues.push({ level: "review", msg: "No social or emotional skill named. Name one thing this student does (\"waits patiently for their turn\", \"sorts out disagreements calmly\")." });
    if (!/\b(next|working on|work on|focus|goal|aim|target|learning to|is learning|starting to|try|practi[sc]e|practi[sc]ing)\b/i.test(t)) issues.push({ level: "review", msg: "No next step. Name one specific thing the student is working on next." });
    var ex = (t.match(/!/g) || []).length;
    if (ex > 1) issues.push({ level: "review", msg: ex + " exclamation marks. One is plenty on a report." });
    var she = /\b(she|her|hers|herself)\b/i.test(t), he = /\b(he|him|his|himself)\b/i.test(t);
    if (she && he) issues.push({ level: "review", msg: "Both \"she/her\" and \"he/him\" appear. If this comment was copied from another student's, check the pronouns." });
    var noQuotes = t.replace(/"[^"]*"/g, "");
    if (/\b(you|your)\b/i.test(noQuotes) && o.name && t.indexOf(String(o.name).trim()) >= 0 && !/\b(at home,? you could|if you would like|get in touch|please contact|contact me)\b/i.test(t)) issues.push({ level: "note", msg: "The comment mixes \"you\" with the student's name. Write either to the student (\"you\") or about them (their name), not both." });
    if (o.name) {
      var nm = String(o.name).trim();
      if (nm && t.indexOf(nm) < 0) issues.push({ level: "review", msg: "The student's name (\"" + nm + "\") isn't in the comment. Was it written for someone else?" });
    }
    var m = t.match(/[—–‘’“”…]/g);
    if (m) issues.push({ level: "note", msg: "Curly quotes, dashes or … (" + m.length + "). Some report systems show these as ? or boxes. \"Plain text\" below swaps them for straight ones." });
    var sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    var long = sentences.filter(function (s) { return s.split(/\s+/).length > 30; });
    if (long.length) issues.push({ level: "note", msg: long.length + " sentence" + (long.length === 1 ? " is" : "s are") + " over 30 words. Split it so it's easy to read." });
    return issues;
  }

  function plain(t) {
    return String(t).replace(/[‘’]/g, "'").replace(/[“”]/g, "\"").replace(/\s*[—–]\s*/g, ", ").replace(/…/g, "...");
  }

  var api = { LEVELS: LEVELS, AREAS: AREAS, SKILLS: SKILLS, build: build, check: check, plain: plain, fill: fill, age: age };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(items) {
    return items.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var sel1 = document.getElementById("se-skill");
    if (!sel1) return;
    function el(id) { return document.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value : ""; }
    function skillOptions(sel, none) {
      sel.innerHTML = (none ? "<option value=\"\">" + none + "</option>" : "") + AREAS.map(function (a) {
        return "<optgroup label=\"" + esc(a.label) + "\">" + SKILLS.filter(function (s) { return s.area === a.id; }).map(function (s) { return "<option value=\"" + s.id + "\">" + esc(s.label) + "</option>"; }).join("") + "</optgroup>";
      }).join("");
    }
    skillOptions(sel1);
    skillOptions(el("se-skill2"), "(none)");
    skillOptions(el("se-focus"), "(the skill that is less secure)");
    ["se-level", "se-level2"].forEach(function (id) { el(id).innerHTML = LEVELS.map(function (l) { return "<option value=\"" + l.id + "\">" + l.label + "</option>"; }).join(""); });
    el("se-level").value = "strong"; el("se-level2").value = "developing";
    function opts() {
      return { name: val("se-name").trim(), pronoun: val("se-pronoun"), style: val("se-style"), age: val("se-age"), timing: val("se-timing"), period: val("se-period"),
        skill: val("se-skill"), level: val("se-level"), skill2: val("se-skill2"), level2: val("se-level2"), focus: val("se-focus"),
        school: el("se-school").checked, home: el("se-home").checked, limit: val("se-limit") };
    }
    el("se-style").addEventListener("change", function () { el("se-period").value = this.value === "uk" ? "term" : "quarter"; });
    var out = el("se-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"se-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"se-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"se-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"se-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"se-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = el("se-text");
      ta.addEventListener("input", function () { el("se-count").textContent = ta.value.length; });
      el("se-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      el("se-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      el("se-plain").addEventListener("click", function () { ta.value = plain(ta.value); el("se-count").textContent = ta.value.length; });
    }
    el("se-run").addEventListener("click", function () {
      var r = build(opts());
      show(r.text, r.issues, r.chars);
    });
    el("se-check").addEventListener("click", function () {
      var v = val("se-paste");
      show(v, check(v, opts()), v.length);
    });
    el("se-sample").addEventListener("click", function () {
      el("se-name").value = "Mateo";
      el("se-pronoun").value = "he";
      el("se-age").value = "young";
      el("se-skill").value = "empathy"; el("se-level").value = "strong";
      el("se-skill2").value = "calm"; el("se-level2").value = "developing";
      el("se-focus").value = "";
      el("se-school").checked = true; el("se-home").checked = true;
      el("se-run").click();
    });
    el("se-next").addEventListener("click", function () {
      el("se-name").value = "";
      out.innerHTML = ""; el("se-name").focus();
    });
  });
})();
