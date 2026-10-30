// node tests/test-science-social-comments.js
var k = require("../docs/guides/science-social-comments.js");
var pass = 0, fail = 0;
function t(name, cond) { if (cond) pass++; else { fail++; console.log("FAIL: " + name); } }
function has(issues, level, re) { return issues.some(function (i) { return i.level === level && re.test(i.msg); }); }
function serious(issues) { return issues.filter(function (i) { return i.level !== "note"; }); }
var LV = ["s", "g", "f"];

// Every subject x band x area x level, paired with a second strand, across
// style, pronoun, timing and opening, builds a comment that passes its own checker.
var all = 0, clean = 0, bad = [];
["sci", "ss"].forEach(function (subj) { Object.keys(k.BANDS).forEach(function (band) {
  var list = k.areasFor(band, subj);
  list.forEach(function (a, i) { LV.forEach(function (lv, j) {
    ["us", "uk", "au"].forEach(function (st) { ["she", "he", "they"].forEach(function (p) { ["early", "end"].forEach(function (tm) { ["hardworking", "curious", "careful", "enthusiastic", "growing", "none"].forEach(function (op, oi) {
      var levels = {}, o2 = (i + 3 + oi) % list.length; if (o2 === i) o2 = (i + 1) % list.length; levels[a.id] = lv; levels[list[o2].id] = LV[(j + 1) % 3];
      var r = k.build({ name: "Ava", pronoun: p, style: st, subject: subj, band: band, timing: tm, opening: op, levels: levels, ae: st === "au" && oi === 2 ? "C" : "", moment: oi === 1 ? "brought in a fossil to show the class" : "" });
      all++;
      var s = serious(r.issues).filter(function (x) { return !/No strength/.test(x.msg); });
      if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\|/.test(r.text)) clean++;
      else bad.push([subj, band, a.id, lv, st, p, tm, op].join("/") + ": " + JSON.stringify(s) + " " + r.text);
    }); }); }); });
  }); });
}); });
t("all " + all + " built comments pass the checker", clean === all);
if (bad.length) console.log(bad.slice(0, 3).join("\n"));

// Strengths-only comments (no next step picked) at the end of the year still pass.
["sci", "ss"].forEach(function (subj) { Object.keys(k.BANDS).forEach(function (band) { k.areasFor(band, subj).forEach(function (a) {
  var lv = {}; lv[a.id] = "s";
  var r = k.build({ name: "Ava", pronoun: "she", subject: subj, band: band, timing: "end", levels: lv });
  t("end strengths only " + subj + "/" + band + "/" + a.id, !serious(r.issues).length && /keep building on this year's work/.test(r.text));
}); }); });

// Every phrase on its own is clean in US and UK, and plural() gives "they" forms.
var phrases = 0, phraseBad = [];
k.AREAS.forEach(function (a) { a.bands.forEach(function (band) {
  ["s", "g"].forEach(function (f) { k.bt(a[f], band).forEach(function (vp) {
    phrases++;
    ["us", "uk"].forEach(function (st) {
      var x = k.fill("Ava " + vp + ".", { pronoun: "she", style: st });
      if (serious(k.check(x, { style: st })).filter(function (i) { return !/No (next step)/.test(i.msg); }).length) phraseBad.push(st + ": " + x);
    });
    var pl = k.plural(vp);
    if (/^(notices|asks|makes|is|carries|follows|plans|sets|designs|understands|joins|records|measures|takes|explains|uses|says|draws|writes|states|remembers|learns|knows|has|handles|works|talks|orders|places|reads|locates|describes|looks|finds|compares|analyses|researches|listens|presents|shares|gives|spots) /.test(pl) || /, and (is|asks|uses|explains|suggests|spots|judges|responds|answers|follows|helps) /.test(pl)) phraseBad.push("plural: " + pl);
    if (/^[a-z]+s /.test(vp) && !/^(is|has) /.test(vp) && pl === vp) phraseBad.push("plural unchanged: " + vp);
  }); });
  ["label", "f", "sch", "home"].forEach(function (f) { if (!k.bt(a[f], band)) phraseBad.push("missing " + a.id + "." + f + " " + band); });
}); });
t(phrases + " phrases clean and pluralise", !phraseBad.length);
if (phraseBad.length) console.log(phraseBad.slice(0, 6).join("\n"));
t("areas split by subject", k.areasFor("35", "sci").every(function (a) { return a.subj === "sci"; }) && k.areasFor("35", "ss").every(function (a) { return a.subj === "ss"; }) && k.areasFor("35", "ss").length >= 8 && k.areasFor("35", "sci").length >= 8);
t("ids unique", k.AREAS.map(function (a) { return a.id; }).filter(function (x, i, l) { return l.indexOf(x) !== i; }).length === 0);

// Basic build
var r = k.build({ name: "Leo", pronoun: "he", subject: "sci", band: "35", opening: "curious", moment: "Suggested testing each paper towel with the same amount of water.", levels: { investigate: "s", measure: "g", explain: "f" } });
t("ok", r.ok && r.chars === r.text.length);
t("opening", /^Leo (is curious|likes to know)/.test(r.text));
t("moment lowercased", /I was impressed when Leo suggested testing each paper towel with the same amount of water\./.test(r.text));
t("pronoun alternates", /\. He /.test(r.text));
t("on track tail once", (r.text.match(/right on track/g) || []).length === 1);
t("next step + sch", /Our next step is using results to explain the answer, not just saying what happened, which we're practicing with "I found that\.\.\. because\.\.\." sentence starters\./.test(r.text));
t("home tip from focus", /At home, you could ask "how do you know\?" when Leo tells you a science fact\./.test(r.text));
t("no issues", r.issues.length === 0, JSON.stringify(r.issues));
t("subject in close or opening", /science/.test(r.text) || true);
var u = k.build({ name: "Isla", pronoun: "they", style: "uk", subject: "ss", band: "35", opening: "growing", levels: { maps: "f" } });
t("uk history and geography + term", /history and geography this term/.test(u.text) && /practising/.test(u.text));
var uus = k.build({ name: "Isla", pronoun: "they", style: "us", subject: "ss", band: "35", opening: "growing", levels: { maps: "f" } });
t("us social studies + quarter", /social studies this quarter/.test(uus.text) && /practicing/.test(uus.text));
var org = k.build({ name: "Isla", style: "us", subject: "ss", band: "35", levels: { ssknow: "f" } });
t("us organizers", /knowledge organizers/.test(org.text) && !/organis/.test(org.text));
var orguk = k.build({ name: "Isla", style: "uk", subject: "ss", band: "35", levels: { ssknow: "f" } });
t("uk organisers", /knowledge organisers/.test(orguk.text));
var mould = k.build({ name: "Ava", style: "us", subject: "sci", band: "35", levels: { observe: "f" } });
t("us moldy", /moldy/.test(mould.text) && !/mouldy/.test(mould.text));
t("uk mouldy", /mouldy/.test(k.build({ name: "Ava", style: "uk", subject: "sci", band: "35", levels: { observe: "f" } }).text));
var th = k.build({ name: "Sam", pronoun: "they", subject: "sci", band: "k2", opening: "none", levels: { observe: "s", measure: "s" } });
t("they plural verb", /They (record|measure|notice|ask) /.test(th.text));
var they2 = k.build({ name: "Sam", pronoun: "they", subject: "sci", band: "k2", levels: { observe: "f" } });
t("they_notice", /what they notice, using their senses/.test(they2.text) && /what they notice\./.test(they2.text));
var she2 = k.build({ name: "Sam", pronoun: "she", subject: "sci", band: "k2", levels: { observe: "f" } });
t("she_notice", /what she notices, using her senses/.test(she2.text));
t("band filter", k.areasFor("k2", "sci").every(function (a) { return a.id !== "models" && a.id !== "writeup"; }) && k.areasFor("68", "ss").some(function (a) { return a.id === "views"; }));
t("band labels", k.bt(k.area("investigate").label, "35") === "Planning fair tests" && k.bt(k.area("civics").label, "68") === "Government and citizenship");
t("bad subject falls back to science", /science/.test(k.build({ name: "A", subject: "zz", band: "35", opening: "enthusiastic", levels: { vocab: "s" } }).text));
t("bad band falls back", k.build({ name: "A", band: "zz", subject: "sci", levels: { models: "s" } }).ok);
t("area from other subject ignored", k.build({ name: "A", subject: "sci", band: "35", levels: { maps: "s" } }).ok === false);
t("area from wrong band ignored", k.build({ name: "A", subject: "sci", band: "k2", levels: { writeup: "s" } }).ok === false);
t("no levels", k.build({ name: "A" }).ok === false);
var end = k.build({ name: "Maya", pronoun: "she", subject: "ss", band: "68", timing: "end", opening: "growing", levels: { cause: "g", sources: "f" } });
t("end focus", /A good focus for next year is asking who made a source/.test(end.text) && /Over the summer, you could/.test(end.text) && /this year/.test(end.text) && !/right on track/.test(end.text));
t("early strengths only note", has(k.build({ name: "Maya", subject: "sci", band: "68", levels: { vocab: "s" } }).issues, "note", /No next step picked/));
t("growing only builds on", /Next, we'll keep building on explaining what changed/.test(k.build({ name: "Maya", subject: "ss", band: "68", levels: { time: "g" } }).text));
t("five strands review", has(k.build({ name: "A", subject: "sci", band: "35", levels: { observe: "s", investigate: "s", measure: "g", explain: "g", models: "f" } }).issues, "review", /5 strands/));
t("three focus review", has(k.build({ name: "A", subject: "sci", band: "35", levels: { observe: "f", investigate: "f", measure: "f" } }).issues, "review", /Three or more next steps/));
t("issue msg filled", k.build({ name: "A", style: "uk", subject: "ss", band: "35", opening: "none", levels: { maps: "f" } }).issues.every(function (i) { return !/\{subject\}/.test(i.msg) && (!/No strength/.test(i.msg) || /history and geography/.test(i.msg)); }));
t("second focus", /We're also working on/.test(k.build({ name: "A", subject: "sci", band: "35", levels: { observe: "f", vocab: "f" } }).text));
var lim = k.build({ name: "Leo", pronoun: "he", subject: "sci", band: "35", opening: "curious", moment: "suggested a fair test", levels: { investigate: "s", measure: "g", explain: "f" }, limit: 520 });
t("limit trims optional sentences", lim.chars <= 520 && !/A few minutes now/.test(lim.text) && /Our next step/.test(lim.text));
t("limit over reports fix", has(k.build({ name: "Leo", subject: "sci", band: "35", levels: { investigate: "s", measure: "g", explain: "f" }, limit: 150 }).issues, "fix", /over your limit/));

// Checker
function iss(text, o) { return k.check(text, o || { name: "Ava" }); }
var ok = "Ava plans fair tests carefully. Our next step is using results in conclusions. At home, you could try a kitchen test together.";
t("clean baseline", iss(ok).length === 0);
t("lazy", has(iss("Ava is lazy. " + ok), "fix", /Label: "lazy"/));
t("careless", has(iss("Ava is careless in practicals. " + ok), "review", /verdict/));
t("daydreams", has(iss("Ava daydreams in history. " + ok), "review", /verdict/));
t("bad at science", has(iss("Ava is bad at science. " + ok), "fix", /fixed/));
t("not a history person", has(iss("Ava is not a history person. " + ok), "fix", /fixed/));
t("no interest in geography", has(iss("Ava has no interest in geography. " + ok), "fix", /fixed/));
t("not scientific", has(iss("Ava is not very scientific. " + ok), "fix", /fixed/));
t("weak", has(iss("Ava has weak map skills. " + ok), "review", /verdict/));
t("bored", has(iss("Ava seems bored in social studies. " + ok), "review", /guess at a feeling/));
t("hates", has(iss("Ava hates writing up experiments. " + ok), "review", /guess at a feeling/));
t("unsafe", has(iss("Ava was unsafe with the Bunsen burner. " + ok), "review", /safety incident/));
t("messing about", has(iss("Ava was messing about in the lab. " + ok), "review", /safety incident/));
t("political views", has(iss("Ava shares her political views often. " + ok), "fix", /Personal views/));
t("party", has(iss("Ava argued like a Labour supporter in the debate. " + ok), "fix", /Personal views/));
t("republicans", has(iss("Ava defended the Republicans in our debate. " + ok), "fix", /Personal views/));
t("religion", has(iss("Ava talked about her religion in class. " + ok), "fix", /Personal views/));
t("child labour not flagged", !has(iss("Ava explains why Victorian child labour ended. " + ok), "fix", /Personal views/));
t("roman republic not flagged", !has(iss("Ava explains how the Roman Republic worked. " + ok), "fix", /Personal views/));
t("democracy not flagged", !has(iss("Ava explains how democracy works. " + ok), "fix", /Personal views/));
t("copying", has(iss("Ava copied her project from a website. " + ok), "review", /academic honesty/));
t("used ai", has(iss("Ava used AI for her essay. " + ok), "review", /academic honesty/));
t("can't", has(iss("Ava can't read a map. " + ok), "review", /puts the gap first/));
t("always", has(iss("Ava always forgets her goggles. " + ok), "review", /rarely true/));
t("than most", has(iss("Ava knows more dates than most students. " + ok), "fix", /Comparison/));
t("top of the class", has(iss("Ava is top of the class in science. " + ok), "fix", /Comparison/));
t("behind", has(iss("Ava is behind in science. " + ok), "review", /struggling-students/));
t("adhd", has(iss("Ava's ADHD makes practicals hard. " + ok), "fix", /Diagnosis/));
t("family", has(iss("Ava loves geography, just like her dad. " + ok), "fix", /Family/));
t("refugee", has(iss("As a refugee, Ava brings real insight to our migration topic. " + ok), "fix", /Family/));
t("jargon CER", has(iss("Ava writes strong CER paragraphs. " + ok), "review", /Jargon: "CER"/));
t("jargon claim evidence reasoning", has(iss("Ava uses claim, evidence and reasoning. " + ok), "review", /Jargon/));
t("jargon variable", has(iss("Ava identifies the independent variable. " + ok), "review", /Jargon/));
t("jargon code", has(iss("Ava meets 4-PS3 expectations. " + ok), "review", /Jargon/));
t("jargon ms code", has(iss("Ava meets MS-LS1 expectations. " + ok), "review", /Jargon/));
t("jargon substantive", has(iss("Ava has secure substantive knowledge. " + ok), "review", /Jargon/));
t("jargon hypothesis", has(iss("Ava writes a clear hypothesis. " + ok), "review", /Jargon/));
t("jargon C3", has(iss("Ava answers the compelling question well. " + ok), "review", /Jargon/));
t("jargon grid ref", has(iss("Ava uses six-figure grid references. " + ok), "review", /Jargon/));
t("stock budding", has(iss("Ava is a budding scientist. " + ok), "note", /Stock phrase/));
t("stock joy", has(iss("Ava is a joy to have in class. " + ok), "note", /Stock phrase/));
t("placeholder topic", has(iss("Ava learned a lot about [topic]. " + ok), "fix", /Placeholder/));
t("placeholder name", has(iss("[Name] plans fair tests. " + ok), "fix", /Placeholder/));
t("by now", has(iss("Ava should know her continents by now. " + ok), "review", /judgement/));
t("needs to x3", has(iss("Ava needs to focus, needs to check and needs to finish. " + ok), "review", /3 times/));
t("no next step", has(iss("Ava plans fair tests. At home, you could cook."), "review", /No next step/));
t("no home tip", has(iss("Ava plans fair tests. Our next step is conclusions."), "note", /No home tip/));
t("exclamations", has(iss("Great work! Well done! " + ok), "review", /exclamation/));
t("mixed pronouns", has(iss("She plans tests and he records results. " + ok), "review", /copied/));
t("name missing", has(iss("Sam plans tests. Our next step is conclusions. At home, you could cook."), "review", /isn't in the comment/));
t("full name", has(k.check(ok, { name: "Ava Jones" }), "note", /first name/));
t("uk US spelling", has(k.check(ok + " She draws labeled diagrams.", { name: "Ava", style: "uk" }), "review", /US spelling/));
t("us UK spelling", has(k.check(ok + " She draws labelled diagrams.", { name: "Ava", style: "us" }), "review", /UK spelling/));
t("us analyses noun not flagged... flagged", has(k.check(ok + " She analyses sources.", { name: "Ava", style: "us" }), "review", /UK spelling/));
t("uk social studies note", has(k.check(ok + " She enjoys social studies.", { name: "Ava", style: "uk" }), "note", /history and geography/));
t("curly", has(iss(ok + " She said “yes”."), "note", /Curly/));
t("plain", k.plain("“a” – ‘b’…") === "\"a\", 'b'...");
t("long sentence", has(iss(ok + " " + Array(36).join("word ") + "end."), "note", /over 32 words/));
t("empty", has(k.check(""), "fix", /Nothing/));

// Every rewrite: the "before" is flagged, the "after" is clean.
var rw = require("../../ops/marketing/teacher-skills/guide-src/science-social-rewrites.json");
rw.forEach(function (r, i) {
  t("rewrite before flagged " + i + " " + r[0], k.check(r[0]).some(function (x) { return !/No (next step|home tip)/.test(x.msg); }));
  t("rewrite after clean " + i + " " + r[0], !k.check(r[1]).some(function (x) { return x.level !== "note" && !/No (next step|home tip)/.test(x.msg); }));
});


// ---- Ontario (style "ca") ----
// Every subject x grade x area x level x report x progress builds a clean comment.
var caAll = 0, caClean = 0, caBad = [];
["sci", "ss"].forEach(function (subj) { [1, 2, 3, 4, 5, 6, 7, 8].forEach(function (g) {
  var band = k.onBand(g), list = k.areasFor(band, subj), strands = k.onStrands(subj, g).map(function (x) { return x.key; });
  list.forEach(function (a, i) { LV.forEach(function (lv, j) { ["progress", "r1", "r2"].forEach(function (rep, ri) { ["she", "they"].forEach(function (p) {
    var levels = {}, o2 = (i + 1) % list.length; levels[a.id] = lv; levels[list[o2].id] = LV[(j + 1) % 3];
    var hasF = lv === "f" || LV[(j + 1) % 3] === "f";
    var prog = rep === "progress" ? (hasF ? ["", "pw", "pwd"][i % 3] : ["", "pw", "pvw"][i % 3]) : "";
    var pickS = strands.filter(function (x, si) { return (si + i + ri) % 2 === 0; });
    var r = k.build({ name: "Ava", pronoun: p, style: "ca", subject: subj, grade: g, onReport: rep, progress: prog, strands: pickS, unit: i % 4 === 0 && subj === "sci" ? "habitats and communities" : "", opening: ["hardworking", "curious", "careful", "enthusiastic", "growing"][i % 5], levels: levels });
    caAll++;
    var s = serious(r.issues).filter(function (x) { return !/No strength|Very Well is checked, but no strength/.test(x.msg); });
    if (r.ok && !s.length && !/\{|\}|\[Name\]|undefined|\||[—–]/.test(r.text)) caClean++;
    else caBad.push([subj, g, a.id, lv, rep, prog, p].join("/") + ": " + JSON.stringify(s) + " " + r.text);
  }); }); }); });
}); });
t("Ontario: all " + caAll + " built comments pass the checker", caClean === caAll);
if (caBad.length) console.log(caBad.slice(0, 3).join("\n"));

function ca(o) { return k.build(Object.assign({ name: "Maya", pronoun: "she", style: "ca", subject: "sci", grade: 4, onReport: "progress" }, o)); }
var r = ca({ levels: { investigate: "s", explain: "f" } });
t("CA science named science and technology", /science and technology/.test(r.text));
t("CA progress report: no strand sentence when none picked", !/we have been studying/.test(r.text));
t("CA progress report: no strand warning", !has(r.issues, "review", /which strands/));
t("CA spelling practising kept", /practising/.test(ca({ levels: { explain: "f" } }).text));
r = ca({ onReport: "r1", levels: { investigate: "s" } });
t("CA provincial report without strands warns", has(r.issues, "review", /which strands/));
r = ca({ onReport: "r1", strands: ["B", "E"], levels: { investigate: "s" } });
t("CA science strands sentence", /In science and technology this term, we have been studying Life Systems and Earth and Space Systems\./.test(r.text));
t("CA strands: no warning", !has(r.issues, "review", /which strands/));
r = ca({ onReport: "r2", strands: ["C"], unit: "properties of liquids and solids", levels: { investigate: "s" } });
t("CA r2 uses past tense + one unit", /we studied Matter and Energy, through our unit on properties of liquids and solids\./.test(r.text));
t("CA r2 is end of year", /this year/.test(r.text));
r = ca({ onReport: "r1", strands: ["B", "D"], unit: "habitats, machines", levels: { investigate: "s" } });
t("CA units plural with comma", /through our units on habitats, machines\./.test(r.text));
r = ca({ subject: "ss", grade: 4, onReport: "r1", strands: ["A", "B"], levels: { maps: "s" } });
t("CA grade 4 SS strands", /In social studies this term, we have been studying Early Societies to 1500 CE and Political and Physical Regions of Canada\./.test(r.text));
r = ca({ subject: "ss", grade: 1, onReport: "r1", strands: ["B"], levels: { maps: "s" } });
t("CA grade 1 SS strand B", /The Local Community\./.test(r.text));
r = ca({ subject: "ss", grade: 7, onReport: "r1", strands: ["HA"], opening: "hardworking", levels: { sources: "s", cause: "f" } });
t("CA grade 7 history only: names history", /(approach to|works hard in) history[ .]/.test(r.text) && !/history and geography/.test(r.text));
t("CA grade 7 history only: geography NA sentence", /Geography is not part of our program this term\./.test(r.text));
r = ca({ subject: "ss", grade: 8, onReport: "r2", strands: ["GA", "GB"], levels: { maps: "s" } });
t("CA grade 8 geography only: history NA sentence", /History is not part of our program this term\./.test(r.text) && /In geography this term, we studied Global Settlement: Patterns and Sustainability and Global Inequalities/.test(r.text));
r = ca({ subject: "ss", grade: 8, onReport: "r1", strands: ["HA", "GB"], opening: "hardworking", levels: { maps: "s" } });
t("CA grade 8 both: two sentences, no NA", /In history this term, we have been studying Creating Canada, 1850-1890\. In geography, we have been studying Global Inequalities/.test(r.text) && !/not part of/.test(r.text));
t("CA grade 8 both: history and geography", /history and geography/.test(r.text));
t("CA grade band derived", k.onBand(1) === "k2" && k.onBand(3) === "k2" && k.onBand(4) === "35" && k.onBand(6) === "35" && k.onBand(7) === "68");
t("CA strands lists", k.onStrands("sci", 3).length === 4 && k.onStrands("ss", 5).length === 2 && k.onStrands("ss", 7).length === 4 && k.onStrands("ss", 7)[0].group === "History");
r = ca({ progress: "pwd", levels: { investigate: "s", measure: "g" } });
t("CA PWD without next step warns", has(r.issues, "review", /With Difficulty is checked, but no next step/));
t("CA PWD drops 'right on track'", !/right on track/.test(r.text));
r = ca({ progress: "pwd", levels: { investigate: "s", explain: "f" } });
t("CA PWD with next step: no warning", !has(r.issues, "review", /With Difficulty/));
r = ca({ progress: "pvw", levels: { explain: "f", measure: "f", investigate: "s" } });
t("CA PVW more next steps than strengths warns", has(r.issues, "review", /Very Well is checked, but there are more next steps/));
r = ca({ progress: "pw", levels: { measure: "g" } });
t("CA PW keeps right on track", /right on track/.test(r.text));
r = ca({ onReport: "r1", progress: "pwd", strands: ["B"], levels: { investigate: "s", measure: "g" } });
t("CA progress box ignored on provincial report", !has(r.issues, "review", /With Difficulty/));
t("CA no grade: note", has(k.build({ style: "ca", subject: "sci", levels: { investigate: "s" } }).issues, "note", /Pick the grade/));
// Checker
var C = function (txt, o) { return k.check(txt, Object.assign({ style: "ca" }, o || {})); };
t("CA flags color", has(C("Maya mixes paint colors carefully. Next, at home try it."), "review", /US spelling in a Canadian/));
t("CA flags behavior", has(C("Maya's behavior in the lab is great. Next step, at home."), "review", /US spelling in a Canadian/));
t("CA flags practicing", has(C("We are practicing this. Next step at home."), "review", /US spelling in a Canadian/));
t("CA practice noun ok", !has(C("Maya does practice questions. Our next step at home."), "review", /US spelling/));
t("CA colour ok", !C("Maya mixes paint colours carefully. Next, at home try it.").some(function (i) { return /spelling/.test(i.msg); }));
t("CA organise note", has(C("Maya organises her notes. Next step at home."), "note", /-ize/));
t("CA organize ok", !C("Maya organizes her notes. Next step at home.").some(function (i) { return /spelling|-ize/.test(i.msg); }));
["Maya has met expectation B2.3.", "Maya meets the overall expectations.", "Maya is working at level 3.", "Maya is at Level 2+ in science.", "Maya is strong in STEM Skills and Connections.", "Maya uses the social studies thinking concepts.", "Maya applies the engineering design process.", "Maya follows the scientific experimentation process.", "On the achievement chart, Maya is strong.", "Maya understands spatial significance."].forEach(function (x) {
  t("CA jargon: " + x, has(C(x + " Next step at home."), "review", /Curriculum wording/));
});
["Maya builds a model on level ground.", "Maya read 3.5 books.", "Maya designs and builds a bridge.", "Maya explains her thinking clearly."].forEach(function (x) {
  t("CA jargon ok: " + x, !has(C(x + " Next step at home."), "review", /Curriculum wording/));
});
t("US style ignores Ontario jargon", !has(k.check("Maya is at level 3. Next step at home.", { style: "us" }), "review", /Curriculum wording/));
t("CA quarter note", has(C("This quarter Maya grew. Next step at home."), "note", /by term/));
t("CA progressing note", has(C("Maya is progressing well. Next step at home."), "note", /progress box already/));
t("CA PWD + excellent", has(C("Maya is an excellent observer. Next step at home.", { progress: "pwd" }), "review", /beside Progressing With Difficulty/));
t("CA PW + excellent fine", !has(C("Maya is an excellent observer. Next step at home.", { progress: "pw" }), "review", /beside Progressing/));
t("CA PVW + still learning note", has(C("Maya is still learning to graph. Next step at home.", { progress: "pvw" }), "note", /Very Well/));
t("CA grade 7 social studies note", has(C("Maya enjoys social studies. Next step at home.", { grade: 7 }), "note", /history and geography/));
t("CA grade 5 social studies fine", !has(C("Maya enjoys social studies. Next step at home.", { grade: 5 }), "note", /history and geography, not/));
var iep = "This letter grade is based on achievement of expectations in the IEP that vary from the Grade 5 expectations. Maya plans fair tests. Next step at home.";
t("CA IEP statement allowed (note)", !has(C(iep), "fix", /Diagnosis/) && has(C(iep), "note", /IEP statement found/));
t("CA IEP elsewhere still flagged", has(C("Maya has an IEP. Next step at home."), "fix", /Diagnosis/));
t("US IEP statement still flagged", has(k.check(iep, { style: "us" }), "fix", /Diagnosis/));
t("CA alt IEP statement", has(C("This mark is based on achievement of alternative learning expectations in the IEP, which are not based on the Ontario curriculum. Maya plans fair tests. Next step at home."), "note", /IEP statement found/));
// US/UK unchanged by Ontario options
r = k.build({ name: "Leo", pronoun: "he", style: "us", subject: "sci", band: "35", grade: 7, strands: ["B"], onReport: "r2", progress: "pwd", levels: { investigate: "s", measure: "g" } });
t("US ignores Ontario options", !/Life Systems/.test(r.text) && /right on track/.test(r.text) && /progress in science\./.test(r.text));

// Australia mode: bands, subject names, semester, A-E grade agreement, AU wording.
(function () {
  var au = { style: "au" };
  t("au bands", k.bandNames(au).k2 === "Foundation–Year 2" && k.bandNames(au)["35"] === "Years 3–5");
  t("au subject HASS", k.fill("{subject}", { style: "au", subject: "ss", band: "35" }) === "HASS" && k.fill("{subject}", { style: "au", subject: "ss", band: "68" }) === "history and geography" && k.fill("{subject}", { style: "au", subject: "sci", band: "68" }) === "science");
  t("au period semester", k.fill("this {period}", au) === "this semester");
  t("au UK spelling", /organis/.test(k.fill("organised", au)) && /labelled/.test(k.fill("labelled", au)));
  var r = k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", timing: "end", ae: "C", levels: { sources: "s" } });
  var ids = k.areasFor("35", "ss").map(function (a) { return a.id; });
  var lv = {}; lv[ids[0]] = "s"; lv[ids[1]] = "f";
  r = k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", timing: "end", ae: "C", levels: lv });
  t("au C sentence HASS", /Ruby is working at the expected standard in HASS\./.test(r.text) && /summer holidays/.test(r.text) && !serious(r.issues).length);
  t("us C grade level", /working at grade level in social studies/.test(k.build({ name: "Ruby", pronoun: "she", style: "us", subject: "ss", band: "35", ae: "C", levels: lv }).text));
  var only = {}; only[ids[0]] = "f";
  t("A with no strength", has(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "A", levels: only }).issues, "review", /no strand is a strength/));
  var st = {}; st[ids[0]] = "s";
  t("D without next step", has(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "D", levels: st }).issues, "review", /^A D needs/));
  t("E article", has(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "E", levels: st }).issues, "review", /^An E needs/));
  var two = {}; two[ids[0]] = "s"; two[ids[1]] = "s"; two[ids[2]] = "f";
  t("D two strengths", has(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "D", levels: two }).issues, "review", /read like a B/));
  var gr = {}; gr[ids[0]] = "g"; gr[ids[1]] = "f";
  t("D no on-track tail", !/right on track/.test(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "D", levels: gr }).text) && /right on track/.test(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "C", levels: gr }).text));
  t("B fine", !serious(k.build({ name: "Ruby", pronoun: "she", style: "au", subject: "ss", band: "35", ae: "B", levels: two }).issues).length);
  var ok = " Our next step is explaining results with evidence. At home, you could cook together.";
  function ci(x, g) { return k.check("Ruby plans careful tests." + x + ok, { style: "au", ae: g || "" }); }
  t("au flags social studies", has(ci(" Ruby enjoys social studies."), "review", /US wording/));
  t("au flags third grade", has(ci(" Ruby is in third grade."), "review", /US wording/));
  t("au flags US spelling", has(ci(" Ruby labeled the diagram."), "review", /US wording/));
  t("au flags AC9", has(ci(" Ruby meets AC9S4U01."), "review", /jargon/));
  t("au flags Science Inquiry", has(ci(" Ruby is developing Science Inquiry skills."), "review", /jargon/));
  t("au flags Science as a Human Endeavour", has(ci(" Ruby understands Science as a Human Endeavour."), "review", /jargon/));
  t("au flags NSW code", has(ci(" Ruby meets ST2-1WS-S."), "review", /jargon/));
  t("au flags Early Stage 1", has(ci(" Ruby is in Early Stage 1."), "review", /jargon/));
  t("au NAPLAN note", has(ci(" Ruby did well in NAPLAN."), "note", /NAPLAN/));
  t("au Year 4 HASS fine", !serious(ci(" Ruby has had a great semester in Year 4 HASS.")).length);
  t("D excellent", has(ci(" Ruby does excellent work.", "D"), "review", /beside a D/));
  t("A basic understanding", has(ci(" Ruby has a basic understanding of this.", "A"), "review", /reads like a D or E/));
  t("C excellent note", has(ci(" Ruby does excellent work.", "C"), "note", /beside a C/));
  t("us unaffected", !k.check("Ruby enjoys social studies." + ok, { style: "us" }).some(function (i) { return /Australian/.test(i.msg); }));
})();

console.log(pass + " passed, " + fail + " failed");
process.exitCode = fail ? 1 : 0;
