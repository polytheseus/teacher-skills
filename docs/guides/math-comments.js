// Math (maths) report card comment builder and checker. Pick a grade band and
// a level for the strands you want to mention (strength, on track, next step),
// add one moment you noticed, and it writes a comment in the strength, next
// step, home tip pattern. The checker flags labels ("careless", "lazy", "bad
// at math", "not a math person"), comparisons and sets, diagnosis and family
// details, teacher jargon families won't know, "always"/"never", placeholders,
// mixed pronouns, curly quotes and missing next steps or home tips. Runs in
// the browser and in node (module.exports) for tests. Nothing typed is sent
// or stored.
(function () {
  // Bands: k2 = grades K-2 (UK Years 1-3), 35 = grades 3-5 (Years 4-6),
  // 68 = grades 6-8 (Years 7-9). Any field can be a value or { band: value }.
  // s = strengths and g = on track (3rd person verb phrases), f = next step
  // (noun phrase), sch = how school works on it, home = one home activity.
  // Text is written in UK spelling; fill() converts it for US wording.
  var BANDS = { k2: "Grades K–2", "35": "Grades 3–5", "68": "Grades 6–8" };
  var BANDS_UK = { k2: "Years 1–3", "35": "Years 4–6", "68": "Years 7–9" };
  // Australia: Foundation is the year before Year 1, so Year N lines up with
  // US grade N. Style "au" uses UK spelling, "maths" and semesters.
  var BANDS_AU = { k2: "Foundation–Year 2", "35": "Years 3–5", "68": "Years 6–8" };
  var AREAS = [
    { id: "facts", bands: ["k2", "35", "68"], label: { k2: "Addition and subtraction facts", "35": "Times tables", "68": "Mental {math} and fluency" },
      s: { k2: ["knows {their} addition and subtraction facts to 10 by heart and uses them to solve bigger problems", "recalls facts to 20 quickly and explains strategies such as making ten"],
           "35": ["knows {their} times tables by heart and uses them confidently in division", "recalls multiplication facts quickly, which frees {them} up for harder problems"],
           "68": ["works fluently with all four operations, including mental calculations", "recalls facts quickly and estimates answers before calculating"] },
      g: { k2: ["knows many addition facts to 10 and counts on for the rest", "is building quick recall of {their} facts to 10 and is getting faster each week"],
           "35": ["knows the 2, 5 and 10 times tables and is learning the 3s and 4s", "is building quick recall of {their} times tables and uses known facts to work out new ones"],
           "68": ["is accurate with written methods and is getting quicker with mental calculations", "uses known facts well and is building speed with mental calculation"] },
      f: { k2: "learning {their} addition and subtraction facts to 10 by heart", "35": "learning {their} times tables by heart, starting with the 3s, 4s and 8s", "68": "quick, accurate mental calculation, so harder problems don't get stuck on the arithmetic" },
      sch: { k2: "with short daily fact games", "35": "with short daily practice and games", "68": "with short starter activities at the beginning of lessons" },
      home: { k2: "play quick-fire fact games in the car or while cooking (\"what's 4 and 6?\")", "35": "practise one times table for five minutes, out loud or with a game", "68": "ask {name} to estimate totals when shopping or splitting a bill" } },
    { id: "place", bands: ["k2", "35"], label: "Place value and number sense",
      s: { k2: ["understands tens and ones and explains what each digit in a number is worth", "compares and orders numbers to 100 confidently"],
           "35": ["understands place value to a million and rounds numbers accurately", "reads, compares and rounds large numbers with confidence"] },
      g: { k2: ["is beginning to understand tens and ones using blocks and number lines", "reads and writes numbers to 100 and is learning what each digit means"],
           "35": ["reads and writes large numbers and is getting more confident with rounding", "understands place value to thousands and is working with larger numbers"] },
      f: { k2: "understanding tens and ones (that 34 is 3 tens and 4 ones)", "35": "rounding numbers and knowing what each digit is worth in larger numbers" },
      sch: { k2: "with blocks and number lines", "35": "with place value charts and number lines" },
      home: { k2: "count coins or group small objects into tens together", "35": "look at prices or distances together and round them to the nearest ten or hundred" } },
    { id: "addsub", bands: ["k2", "35"], label: "Adding and subtracting",
      s: { k2: ["adds and subtracts two-digit numbers accurately and explains how", "chooses smart strategies for adding and subtracting, such as counting on from the bigger number"],
           "35": ["adds and subtracts large numbers accurately using written methods", "checks {their} adding and subtracting by estimating first"] },
      g: { k2: ["adds and subtracts within 20 and is beginning to work with bigger numbers", "solves adding problems confidently and is getting more secure with subtracting"],
           "35": ["adds and subtracts larger numbers and is becoming more accurate with written methods", "uses written methods for adding and is getting more secure with subtracting"] },
      f: { k2: "subtracting with two-digit numbers", "35": "subtracting larger numbers accurately, especially across zeros" },
      sch: { k2: "using number lines and blocks", "35": "with worked examples and estimating first" },
      home: "make up quick shopping problems together, adding two prices or working out change" },
    { id: "multdiv", bands: ["35"], label: "Multiplying and dividing",
      s: ["multiplies and divides larger numbers accurately and explains each step", "uses multiplication and division confidently to solve problems"],
      g: ["multiplies two-digit numbers and is starting to divide with remainders", "understands what multiplication and division mean and is getting quicker with written methods"],
      f: "dividing larger numbers and deciding what to do with a remainder", sch: "with arrays, drawings and step-by-step examples",
      home: "share out snacks or coins evenly and talk about what's left over" },
    { id: "fractions", bands: ["35", "68"], label: { "35": "Fractions", "68": "Fractions, decimals and percentages" },
      s: { "35": ["compares, adds and subtracts fractions confidently and explains {their} reasoning with drawings", "understands equivalent fractions and places fractions on a number line"],
           "68": ["moves easily between fractions, decimals and percentages and uses them to solve problems", "calculates percentages accurately, including discounts and increases"] },
      g: { "35": ["understands what a fraction means and is learning to compare fractions", "finds equivalent fractions with pictures and is moving on to adding fractions"],
           "68": ["converts between fractions, decimals and percentages and is getting more confident using them in problems", "calculates simple percentages and is moving on to percentage increase and decrease"] },
      f: { "35": "comparing fractions and finding equivalent fractions", "68": "working out percentages of amounts and percentage change" },
      sch: { "35": "with fraction strips, drawings and number lines", "68": "with real-life problems such as discounts and tips" },
      home: { "35": "use fractions when cooking or sharing food (\"is a third bigger or smaller than a quarter?\")", "68": "work out sale discounts together when shopping (\"what's 20% off?\")" } },
    { id: "ratio", bands: ["68"], label: "Ratio and proportion",
      s: ["solves ratio and rate problems confidently using tables and diagrams", "spots proportional relationships quickly and explains them clearly"],
      g: ["understands what a ratio means and is getting more confident scaling recipes and rates", "solves simple ratio problems and is starting on unit rates"],
      f: "solving ratio and rate problems, such as best-buy comparisons", sch: "with tables and bar diagrams",
      home: "compare prices per item when shopping together and decide which pack is the better buy" },
    { id: "negative", bands: ["68"], label: "Negative numbers",
      s: ["works confidently with negative numbers in all four operations", "uses negative numbers accurately in real contexts such as temperature and money"],
      g: ["orders and adds negative numbers and is learning to subtract and multiply them", "understands negative numbers on a number line and is building confidence with the rules"],
      f: "calculating with negative numbers", sch: "using number lines and real examples such as temperature",
      home: "look at weather forecasts together and work out how much the temperature changes" },
    { id: "algebra", bands: ["68"], label: "Expressions and equations",
      s: ["solves equations confidently and explains each step", "writes and simplifies expressions accurately and uses algebra to solve problems"],
      g: ["solves one-step equations and is moving on to two-step equations", "understands that a letter can stand for a number and is learning to simplify expressions"],
      f: "solving two-step equations and checking the answer", sch: "with worked examples and balance diagrams",
      home: "try \"think of a number\" puzzles together and work backwards to find the start" },
    { id: "measure", bands: ["k2", "35"], label: "Measurement, time and money",
      s: { k2: ["tells the time to the half hour and knows the value of each coin", "measures length accurately with a ruler and compares measurements"],
           "35": ["converts between units and solves time and money problems accurately", "reads scales carefully and works out the area and perimeter of shapes"] },
      g: { k2: ["is learning to tell the time to the hour and half hour", "measures objects and is learning to use a ruler correctly"],
           "35": ["measures accurately and is learning to convert between units", "finds the perimeter of shapes and is moving on to area"] },
      f: { k2: "telling the time on a clock with hands", "35": "converting between units and working out how much time has passed" },
      sch: { k2: "with toy clocks and our daily routines", "35": "with real measuring tasks and timelines" },
      home: { k2: "ask {name} to read the time on a clock with hands at a few points in the day", "35": "involve {name} in measuring for cooking or working out how long a journey will take" } },
    { id: "geometry", bands: ["k2", "35", "68"], label: "Shapes and geometry",
      s: { k2: ["names and describes 2D and 3D shapes by their sides, corners and faces", "spots shapes everywhere and sorts them by their properties"],
           "35": ["sorts shapes by their angles and sides and measures angles accurately", "uses a protractor accurately and understands angle facts"],
           "68": ["calculates area, volume and angles accurately and explains which formula to use", "solves geometry problems confidently, including angles in triangles and on parallel lines"] },
      g: { k2: ["names common shapes and is learning to describe their sides and corners", "is beginning to name 3D shapes such as cubes and cylinders"],
           "35": ["names and sorts shapes and is learning to measure angles", "recognises lines of symmetry and is moving on to angles"],
           "68": ["finds the area of triangles and rectangles and is moving on to more complex shapes", "uses angle facts and is building confidence with longer geometry problems"] },
      f: { k2: "describing shapes by their sides and corners", "35": "measuring and drawing angles accurately", "68": "choosing the right formula for area and volume and showing each step" },
      sch: { k2: "with building and sorting activities", "35": "with protractors and hands-on activities", "68": "with worked examples and practical measuring" },
      home: { k2: "go on a shape hunt around the house or at the park", "35": "look for right angles and smaller or bigger angles around the house", "68": "estimate and then measure the area of a room together" } },
    { id: "data", bands: ["k2", "35", "68"], label: "Graphs and data",
      s: { k2: ["makes and reads tally charts and bar graphs and answers questions about them", "collects information in a class survey and shows it clearly in a chart"],
           "35": ["draws accurate graphs and explains what the data shows", "reads line graphs and tables accurately and explains what they show"],
           "68": ["calculates the mean, median and range accurately and explains what they show about the data", "draws and interprets graphs carefully, including spotting misleading ones"] },
      g: { k2: ["reads simple bar graphs and is learning to make {their} own", "is learning to collect information with tally marks"],
           "35": ["reads bar graphs and tables and is learning to draw {their} own with a sensible scale", "is getting more confident reading information from tables and charts"],
           "68": ["finds the mean, median and range and is learning when to use each", "reads charts accurately and is building confidence explaining what data shows"] },
      f: { k2: "reading information from tally charts and simple graphs", "35": "drawing graphs with a sensible scale and reading values accurately", "68": "choosing the right average and explaining what a graph shows" },
      sch: { k2: "with class surveys", "35": "with class data projects", "68": "with real data sets" },
      home: { k2: "make a tally chart together, such as the colours of cars that go past", "35": "look at a chart in the news or a weather app and talk about what it shows", "68": "look at sports statistics or a chart in the news and talk about what it shows" } },
    { id: "problems", bands: ["k2", "35", "68"], label: "Word problems",
      s: ["reads word problems carefully, picks the right operation and explains the answer", "solves problems with more than one step by breaking them into smaller parts"],
      g: ["solves one-step word problems and is learning to tackle problems with more than one step", "is getting better at working out which operation a problem needs"],
      f: { k2: "reading a problem carefully and drawing a picture before solving it", "35": "reading a problem carefully and drawing a picture or model before solving it", "68": "breaking longer problems into smaller steps and showing each one" },
      sch: "with a step-by-step routine we use for every problem",
      home: "talk through everyday problems together, such as how many packs to buy for a party" },
    { id: "reasoning", bands: ["k2", "35", "68"], label: "Explaining thinking",
      s: ["explains {their} thinking clearly, out loud and in writing", "shows each step clearly so that others can follow the method"],
      g: ["is starting to explain {their} methods out loud and is learning to write them down", "shows some steps in {their} work and is learning to include each one"],
      f: "explaining {their} thinking in words, pictures or numbers, not just the answer", sch: "with sentence starters and talk partners",
      home: "ask \"how did you work that out?\" when {name} does homework" },
    { id: "checking", bands: ["k2", "35", "68"], label: "Checking work",
      s: ["checks answers carefully and catches {their} own mistakes", "works accurately and estimates first to check that answers make sense"],
      g: ["is becoming more careful and is starting to check answers before handing work in", "catches some of {their} own mistakes and is building a habit of checking"],
      f: "slowing down and checking each answer before handing work in", sch: "with a short checklist at the end of each task",
      home: "ask {name} to check one answer in each homework task by estimating" },
    { id: "confidence", bands: ["k2", "35", "68"], label: "Confidence and persistence",
      s: ["tackles challenging problems with confidence and keeps going when a problem is tricky", "enjoys a challenge and is willing to try different strategies"],
      g: ["is growing in confidence and is more willing to try harder problems", "is learning to keep going when a problem is tricky and asks for help when needed"],
      f: "having a go at challenging problems and trying a second strategy before asking for help", sch: "with problems that build up in small steps and praise for good strategies",
      home: "praise effort and strategies (\"you tried two ways\") as well as right answers" },
    { id: "homework", bands: ["35", "68"], label: "Homework and practice",
      s: ["completes {their} homework carefully and on time", "hands in careful, thorough homework and uses it to practise new skills"],
      g: ["hands in most homework on time and is building a regular routine", "completes homework and is learning to ask for help when a task is unclear"],
      f: "handing in homework on time each week", sch: "with a weekly checklist and reminders on the class page",
      home: "agree a regular time and place for homework and check the planner together" }
  ];
  // Verbs that agree with the subject, so "they" can take the plural form.
  var VERBS = /^(knows|recalls|works|uses|is|counts|understands|compares|reads|rounds|adds|subtracts|chooses|checks|solves|multiplies|divides|moves|calculates|converts|finds|spots|writes|simplifies|tells|measures|names|sorts|recognises|describes|makes|collects|draws|picks|explains|shows|catches|tackles|keeps|enjoys|asks|completes|hands|places|estimates|orders|interprets|answers|understands|spots|uses|works)$/;
  var OPENINGS = {
    enthusiastic: ["{name} brings real enthusiasm to {math} lessons and is keen to answer questions.", "{name} enjoys {math} and is keen to have a go at new problems."],
    hardworking: ["{name} works hard in {math} and puts real effort into every task.", "{name} has a steady, hard-working approach to {math}."],
    careful: ["{name} is a careful, thoughtful {math} student who takes pride in accurate work.", "{name} approaches {math} carefully and takes pride in getting it right."],
    curious: ["{name} is curious about how numbers work and asks great questions in {math}.", "{name} likes to know why a method works, not just how to use it."],
    growing: ["{name} has grown in confidence in {math} this {period}.", "It has been great to see {name} become more confident in {math} this {period}."],
    none: [""]
  };
  var OPENINGS_END = {
    growing: ["{name} has grown in confidence in {math} this year.", "It has been great to see {name} become more confident in {math} this year."],
    hardworking: ["{name} has worked hard in {math} all year and made steady progress.", "{name} has made strong progress in {math} this year through steady effort."]
  };
  var CLOSES = {
    early: ["Thank you for your support at home.", "Please get in touch if you have any questions about {name}'s progress in {math}."],
    end: ["Thank you for your support this year.", "I have enjoyed teaching {name} this year."]
  };
  var PRON = { she: { their: "her", them: "her" }, he: { their: "his", them: "him" }, they: { their: "their", them: "them" } };
  var US = { practise: "practice", practised: "practiced", practising: "practicing", recognise: "recognize", recognises: "recognizes", recognising: "recognizing", colours: "colors", colour: "color" };

  function bt(v, band) { return v && typeof v === "object" && !Array.isArray(v) ? v[band] : v; }
  function plural(vp) {
    return vp.replace(/(^|, and |, | and )([a-z]+)/g, function (m, sep, w) {
      if (!VERBS.test(w)) return m;
      if (w === "is") w = "are";
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

  function isAU(o) { return o.style === "au"; }
  function an(g) { return (/^[AE]/.test(g) ? "an " : "a ") + g; }
  function bandNames(o) { return isAU(o) ? BANDS_AU : o.style === "uk" ? BANDS_UK : BANDS; }
  function fill(t, o) {
    var uk = o.style === "uk" || isAU(o), p = PRON[o.pronoun] || PRON.they;
    t = t.replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "name") return o.name || "[Name]";
      if (k === "their" || k === "them") return p[k];
      if (k === "period") return o.period || (isAU(o) ? "semester" : uk ? "term" : "quarter");
      if (k === "math") return uk ? "maths" : "math";
      return m;
    });
    if (!uk) t = t.replace(/\b(practised|practising|practise|recognises|recognising|recognise|colours|colour)\b/g, function (m) { return US[m]; });
    return t;
  }

  // opts: { name, pronoun, style: us|uk|au, band: k2|35|68, timing: early|end,
  //         period, opening, moment, limit, grade: ""|A-E,
  //         levels: { areaId: "s"|"g"|"f" } }
  function build(o) {
    o = o || {};
    var band = BANDS[o.band] ? o.band : "35";
    var levels = o.levels || {}, seed = hash(String(o.name || "") + (o.moment || ""));
    var list = areasFor(band), strong = [], growing = [], focus = [];
    list.forEach(function (a) {
      if (levels[a.id] === "s") strong.push(a); else if (levels[a.id] === "g") growing.push(a); else if (levels[a.id] === "f") focus.push(a);
    });
    var issues = [], total = strong.length + growing.length + focus.length;
    if (!total) return { ok: false, msg: "Pick a level for at least one strand." };
    if (total > 4) issues.push({ level: "review", msg: "That's " + total + " strands. A {math} comment reads best with two or three; the grade boxes cover the rest." });
    if (focus.length > 2) issues.push({ level: "review", msg: "Three or more next steps is a lot for a family to act on. Pick the one or two that matter most." });
    if (!strong.length && !o.moment) issues.push({ level: o.opening === "none" ? "review" : "note", msg: "No strength picked. Start with something the student does well in {math}, even a small thing, or add a moment you noticed." });
    // A-E grade beside the comment (Australian reports must have one; the
    // comment has to agree with it, so an A doesn't read like a D).
    var grade = /^[A-E]$/.test(o.grade || "") ? o.grade : "";
    if ((grade === "A" || grade === "B") && !strong.length) issues.push({ level: "review", msg: "The grade is " + grade + " but no strand is a strength. Families read the comment against the grade: lead with what the student does well." });
    if ((grade === "A" || grade === "B") && focus.length > strong.length + growing.length) issues.push({ level: "review", msg: "More next steps than strengths beside " + an(grade) + ". Keep one next step and say what's strong." });
    if ((grade === "D" || grade === "E") && !focus.length) issues.push({ level: "review", msg: cap(an(grade)) + " needs one clear next step and the support in place, so the family isn't surprised by the grade." });
    if ((grade === "D" || grade === "E") && strong.length > 1 && focus.length < 2 && !growing.length) issues.push({ level: "review", msg: "Two strengths and one next step can read like a B. Beside a " + grade + ", say plainly that this is the area to work on." });
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
    if (grade === "C") parts.push(sentence(o.style === "uk" || isAU(o) ? "is working at the expected standard in {math}" : "is working at grade level in {math}"));
    // Strengths first, then on-track strands, each in AREAS order.
    list.forEach(function (a, i) { if (levels[a.id] === "s") parts.push(sentence(pick(bt(a.s, band), seed + i))); });
    list.forEach(function (a, i) {
      if (levels[a.id] === "g") parts.push(sentence(pick(bt(a.g, band), seed + i), (o.timing !== "end" && grade !== "D" && grade !== "E" && !onTrack++) ? ", which is right on track for this point in the year" : ""));
    });
    var home = null;
    if (focus.length) {
      var f0 = bt(focus[0].f, band);
      parts.push(o.timing === "end" ? "A good focus for next year is " + f0 + "." : "Our next step is " + f0 + ", which we're practising " + bt(focus[0].sch, band) + ".");
      if (focus[1]) parts.push((o.timing === "end" ? "It would also help to keep working on " : "We're also working on ") + bt(focus[1].f, band) + ".");
      home = focus[0];
    } else if (growing.length) {
      parts.push((o.timing === "end" ? "Next year, {name} will keep building on " : "Next, we'll keep building on ") + bt(growing[0].f, band).replace(/^learning /, "") + ".");
      home = growing[0];
    } else if (o.timing === "end") {
      parts.push("Over the summer, a few minutes of {math} games or puzzles now and then will keep these skills fresh.");
    } else {
      issues.push({ level: "note", msg: "No next step picked. Even a strong student's comment usually names one thing to aim for next, such as explaining their thinking or tackling harder problems." });
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

  var CHECKS = [
    [/\b(lazy|sloppy|unmotivated|disruptive|hopeless|clueless|slow learner|a slow worker)\b/i, "fix", "Label: \"$1\". Describe what the student does and what helps (e.g. \"often stops before a task is finished; short steps with a check-in are helping\")."],
    [/\b(careless( mistakes| errors)?|messy|untidy)\b/i, "review", "\"$1\" is a verdict. Say what happens and the fix: \"often rushes, which leads to avoidable mistakes; our next step is checking each answer\"."],
    [/\b(gives up( easily)?|gave up|quits)\b/i, "review", "\"$1\" sounds like a character verdict. Say when it happens and the strategy that helps: \"sometimes stops when a problem looks hard; a 'try two ways first' routine is helping\"."],
    [/\b((bad|terrible|rubbish|useless|weak|poor|no good) (at|in|with) (maths?|numbers|times tables|fractions|algebra)|not (a|really a) (maths?|numbers) (person|kid|student)|no head for (numbers|figures|maths?)|not (very )?mathematical|(maths?|numbers) (is|are) not (his|her|their) (thing|strength|strong suit)|not (his|her|their) (strong suit|strongest subject))\b/i, "fix", "\"$1\" tells the family (and the student) that ability is fixed. Name the skill they're working on and what helps."],
    [/\b(weak|poor|slow)\b/i, "review", "\"$1\" reads as a verdict. Say what the student can do now and what comes next."],
    [/\b((maths?|numbers?) anxiety|anxious|anxiety|panics?|phobia)\b/i, "review", "\"$1\" is a guess at a feeling and can sound like a diagnosis. Describe what you see (\"hesitates to start new problems\") and what's helping (\"starting with an example we do together\")."],
    [/\b((uses|counts on|relies on) (his|her|their) fingers|finger[- ]counting)\b/i, "note", "\"$1\" sounds like a criticism, but counting on fingers is a normal stage. Say what comes next: \"is learning more facts by heart, so counting is needed less often\"."],
    [/\b(relies on (a|the|his|her|their) calculator|can'?t do it without a calculator)\b/i, "review", "\"$1\" puts the gap first. Say the next step: \"is building mental calculation, so the calculator is a check rather than the first step\"."],
    [/\b(copies|copied|copying|cheat\w*|plagiari\w*)\b/i, "review", "\"$1\": academic honesty concerns usually belong in a conversation with the family first, not the written comment. Follow your school's policy."],
    [/\b(can'?t|cannot|unable to|doesn'?t know|does not know|won'?t|refuses to|doesn'?t (even )?try)\b/i, "review", "\"$1\" puts the gap first. Try \"is still learning\" or \"is working on\"."],
    [/\b(struggles?|struggling)\b/i, "note", "\"$1\" is often fine, but \"is still learning to\" or \"is working on\" sounds more hopeful to families."],
    [/\b(always|never)\b/i, "review", "\"$1\" is rarely true and is hard to hear. Say \"often\" or \"sometimes\", or describe a specific moment."],
    [/\b(bottom (set|group|table)|lowest (set|group|table)|lower (set|group)|top (set|group|table)|(set|group) [1-6]\b|than (most|many|the other|other|some) (children|kids|students|pupils|classmates|of the class)|compared (to|with) (the class|the others|other (children|students|pupils)|classmates|(his|her|their) (friends|classmates|peers))|the rest of the class|most of the class|(best|worst|weakest|strongest) in the class|top of the class)\b/i, "fix", "Comparison or set: \"$1\". Report this student's own progress; sets and groups change and families read them as labels."],
    [/\b(below (grade|age|the expected) level|below (the )?expected standard|not meeting (the )?standards?|failing|fails|is failing|behind)\b/i, "review", "\"$1\": if it's true, say it once with the support in place and what comes next, and make sure the family has heard it from you first. The struggling-students guide has the pattern."],
    [/\b(dyscalculi\w*|adhd|autis\w*|asd|dyslexi\w*|dyspraxi\w*|processing (disorder|delay)|learning (disability|difficulty|difficulties)|iep|504( plan)?|ehcp|sen(d)?|special needs|needs (to be )?(tested|assessed|evaluated)|evaluation|diagnos\w*|medication|meds)\b/i, "fix", "Diagnosis, medication or support-plan language: \"$1\". Unless your school's policy says otherwise, raise it with the family in person and keep it out of the general comment."],
    [/\b((like|just like) (his|her|their) (mom|mum|dad|father|mother|parents|brother|sister)|(mom|mum|dad|parents?) (was|were|is|are) (bad|no good|not good|terrible) at (maths?|numbers)|divorc\w*|custody|separated|split up|single (mom|mum|dad|parent)|social worker|foster\w*|free (school )?(lunch|meals))\b/i, "fix", "Family or private detail: \"$1\". Keep it out of the written report."],
    [/\b(subitis\w*|subitiz\w*|decompos\w*|commutative|associative|distributive property|partitioning|regroup\w*|bridging (through )?ten|standard algorithm|algorithms?|fact fluency|procedural fluency|computational fluency|conceptual understanding|manipulatives|concrete,? pictorial,? (and )?abstract|cpa approach|number sense|\d\.(oa|nbt|nf|md|g|rp|ns|ee|sp)\.\w+|ccss|teks|greater depth|\b(wts|exs|gds)\b|mtc|ks[1-4])\b/i, "review", "Jargon: \"$1\". Many families won't know it; say what the student does (\"splits 47 into 40 and 7 to add it\")."],
    [/\b(a joy to have in (class|the classroom)|a pleasure to (have|teach)|delightful|journey|thrives?|thriving|blossom\w*|embark\w*|testament|truly|shines?|shining star|superstar|math whiz|maths whizz?|whizz?)\b/i, "note", "Stock phrase: \"$1\". Families see it on every report (and it reads as AI-written). A specific skill or moment says more."],
    [/(\[(name|student|child|first name|pronoun)[^\]]*\]|\{(name|student)\}|<name>|\bXX+\b|student'?s name|child'?s name)/i, "fix", "Placeholder left in: \"$1\"."],
    [/\b(should (really )?(be able to|know|have learned|have learnt) .{0,30}by now|by now)\b/i, "review", "\"$1\" sounds like a judgement. Say what the next step is instead."]
  ];

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
    if (o.style === "uk" && /\bmath\b/.test(t)) issues.push({ level: "review", msg: "\"math\" in a UK report: UK families expect \"maths\"." });
    var au;
    if (isAU(o) && (au = t.match(/\b(math|(first|second|third|fourth|fifth|sixth|seventh|eighth) grade|kindergartners?|kindergarteners?|this quarter|marking period|practicing|practiced|recognizes?|recognizing|colors?)\b/i))) issues.push({ level: "review", msg: "\"" + au[1] + "\" is US wording. Australian families expect \"maths\", \"Year 3\", semester or term, and Australian spelling (practise, recognise, colour)." });
    if (isAU(o) && (au = t.match(/\b(AC9\w*|MA[0-9e]-\w+|achievement standards?|content descriptions?|proficiency strands?|early stage 1|stage [1-3]\b|elaborations?)\b/i))) issues.push({ level: "review", msg: "Curriculum jargon: \"" + au[1] + "\". Families won't know it; say what the student does (\"uses arrays to solve multiplication problems\")." });
    if (isAU(o) && (au = t.match(/\b(NAPLAN)\b/))) issues.push({ level: "note", msg: "NAPLAN results go home separately. Keep the comment about this semester's classwork." });
    var grade = /^[A-E]$/.test(o.grade || "") ? o.grade : "", gm;
    if ((grade === "D" || grade === "E") && (gm = t.match(/\b(excellent|outstanding|exceptional|excels?|superb|brilliant|impressive|above (the )?expected standard|above grade level|exceed\w*)\b/i))) issues.push({ level: "review", msg: "\"" + gm[1] + "\" beside " + an(grade) + " sends mixed messages. Keep the praise specific (\"solved the two-step problem on her own\") and name the next step." });
    if ((grade === "A" || grade === "B") && (gm = t.match(/\b(working towards|below (the )?expected standard|below grade level|basic understanding|elementary understanding|limited understanding|with (a lot of|significant|considerable) support)\b/i))) issues.push({ level: "review", msg: "\"" + gm[1] + "\" reads like a D or E, but the grade is " + grade + ". Check the comment and the grade agree." });
    if (grade === "C" && (gm = t.match(/\b(excellent|outstanding|exceptional|excels?|above (the )?expected standard|above grade level)\b/i))) issues.push({ level: "note", msg: "\"" + gm[1] + "\" can read like an A beside a C. A C means working at the expected standard; say so plainly." });
    if ((!o.style || o.style === "us") && /\bmaths\b/.test(t)) issues.push({ level: "review", msg: "\"maths\" in a US report: US families expect \"math\"." });
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

  var api = { AREAS: AREAS, BANDS: BANDS, BANDS_UK: BANDS_UK, BANDS_AU: BANDS_AU, bandNames: bandNames, areasFor: areasFor, bt: bt, plural: plural, build: build, check: check, plain: plain, fill: fill, area: area };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; return; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  var LABEL = { fix: "Fix", review: "Check", note: "Tip" };
  function tags(list) {
    return list.map(function (i) { return "<li><span class=\"kc-tag kc-" + i.level + "\">" + LABEL[i.level] + "</span> " + esc(i.msg) + "</li>"; }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("mc-skills");
    if (!grid) return;
    function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }
    function draw() {
      var keep = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) keep[s.getAttribute("data-area")] = s.value; });
      var band = val("mc-band") || "35", o = { style: val("mc-style") }, html = "";
      areasFor(band).forEach(function (a) {
        html += "<label>" + esc(fill(bt(a.label, band), o)) + " <select data-area=\"" + a.id + "\"><option value=\"\">Not this time</option><option value=\"s\">Strength</option><option value=\"g\">On track</option><option value=\"f\">Next step</option></select></label>";
      });
      grid.innerHTML = html;
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (keep[s.getAttribute("data-area")]) s.value = keep[s.getAttribute("data-area")]; });
      var bs = document.getElementById("mc-band"), names = bandNames(o);
      Array.prototype.forEach.call(bs.options, function (op) { op.textContent = names[op.value]; });
    }
    draw();
    document.getElementById("mc-band").addEventListener("change", draw);
    document.getElementById("mc-style").addEventListener("change", function () {
      var per = document.getElementById("mc-period"), st = val("mc-style");
      if (per) per.value = st === "au" ? "semester" : st === "uk" ? "term" : "quarter";
      draw();
    });
    function opts() {
      var levels = {};
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { if (s.value) levels[s.getAttribute("data-area")] = s.value; });
      return { name: val("mc-name").trim(), pronoun: val("mc-pronoun"), style: val("mc-style"), grade: val("mc-grade"), band: val("mc-band"), timing: val("mc-timing"), period: val("mc-period"), opening: val("mc-opening"), moment: val("mc-moment"), limit: val("mc-limit"), levels: levels };
    }
    var out = document.getElementById("mc-output");
    function show(text, issues, n) {
      out.innerHTML = "<p><strong><span id=\"mc-count\">" + n + "</span> characters, " + issues.length + " thing" + (issues.length === 1 ? "" : "s") + " to check.</strong> You can edit the comment, then press Check again.</p>" +
        "<textarea id=\"mc-text\" rows=\"7\">" + esc(text) + "</textarea>" +
        "<p><button type=\"button\" id=\"mc-recheck\">Check again</button> <button type=\"button\" class=\"ghost\" id=\"mc-copy\">Copy</button> <button type=\"button\" class=\"ghost\" id=\"mc-plain\">Plain text</button></p>" +
        (issues.length ? "<ul class=\"kc-issues\">" + tags(issues) + "</ul>" : "<p class=\"kc-tag kc-ok\">Looks good</p>");
      var ta = document.getElementById("mc-text");
      ta.addEventListener("input", function () { document.getElementById("mc-count").textContent = ta.value.length; });
      document.getElementById("mc-recheck").addEventListener("click", function () { var v = ta.value; show(v, check(v, opts()), v.length); });
      document.getElementById("mc-copy").addEventListener("click", function () { if (navigator.clipboard) navigator.clipboard.writeText(ta.value); this.textContent = "Copied"; });
      document.getElementById("mc-plain").addEventListener("click", function () { ta.value = plain(ta.value); document.getElementById("mc-count").textContent = ta.value.length; });
    }
    document.getElementById("mc-run").addEventListener("click", function () {
      var r = build(opts());
      if (!r.ok) { out.innerHTML = "<p class=\"kc-tag kc-fix\">" + esc(r.msg) + "</p>"; return; }
      show(r.text, r.issues, r.chars);
    });
    document.getElementById("mc-check").addEventListener("click", function () {
      var v = val("mc-paste");
      show(v, check(v, opts()), v.length);
    });
    document.getElementById("mc-sample").addEventListener("click", function () {
      document.getElementById("mc-name").value = "Leo";
      document.getElementById("mc-pronoun").value = "he";
      document.getElementById("mc-band").value = "35";
      draw();
      document.getElementById("mc-opening").value = "curious";
      document.getElementById("mc-moment").value = "showed the class two different ways to work out 25 x 12";
      var pre = { facts: "s", reasoning: "g", fractions: "f" };
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = pre[s.getAttribute("data-area")] || ""; });
      document.getElementById("mc-run").click();
    });
    document.getElementById("mc-next").addEventListener("click", function () {
      ["mc-name", "mc-moment"].forEach(function (id) { document.getElementById(id).value = ""; });
      Array.prototype.forEach.call(grid.querySelectorAll("select"), function (s) { s.value = ""; });
      out.innerHTML = ""; document.getElementById("mc-name").focus();
    });
  });
})();
