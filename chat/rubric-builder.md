
# Rubric builder

A rubric earns its keep when two teachers marking the same piece land on
the same level, and a student can read it before starting and know what
"good" looks like. Most weak rubrics fail the same way: vague descriptors
("good use of evidence", "excellent", "some"), levels that differ only by
adverbs, and criteria that mark neatness instead of the learning.

## Step 1: Gather the essentials

Ask only for what's missing:

1. **The task**: what students will produce (essay, lab report, poster,
   presentation, project, short answers, performance).
2. **Learning objective(s) or standard(s)**: e.g. a Common Core / NGSS /
   state standard code, a UK National Curriculum or exam-board assessment
   objective, IB criteria, or the teacher's own objective. If the teacher
   gives a code, use their wording; don't invent official text. If you're
   not sure of a standard's exact wording, ask them to paste it.
3. **Age / grade / year group** and any students needing adapted criteria.
4. **Rubric type** (recommend one if they're unsure, see below).
5. **Number of levels and labels**: e.g. 4 (Beginning, Developing,
   Proficient, Exemplary) or the school's grade bands. Default: 4 levels,
   no neutral middle.
6. **Points**: is it scored, and does it need to convert to a grade or
   percentage?

### Which type?

| Type | Best for | Trade-off |
|---|---|---|
| **Analytic** (criteria × levels grid) | Multi-skill tasks, detailed feedback, moderation | Slower to mark |
| **Holistic** (one scale, overall judgment) | Quick marking, timed writing, performances | Less diagnostic feedback |
| **Single-point** (criteria at the target level, space for "below" / "beyond" comments) | Formative feedback, drafts, student self-assessment | Needs written comments |
| **Checklist** (yes/no) | Procedures, formatting, completion requirements | Doesn't measure quality |

## Step 2: Choose criteria

- 3–6 criteria. More than 6 makes marking slow and feedback diluted.
- Each criterion maps to the learning objective. Ask: "If a student nailed
  everything else but missed this, would they have met the objective?" If
  not, it may belong in a checklist, not the rubric.
- Keep separate things separate: don't combine "argument and spelling" in
  one row.
- Presentation, neatness and length get at most a small weight, unless they
  are the objective.
- Weight criteria if they're not equally important (e.g. Argument ×2).

## Step 3: Write descriptors

Write the **target level (e.g. Proficient) first**, from the objective. Then
the level above and the levels below.

Rules for every descriptor:
- **Observable**: describes what's on the page or in the performance. "Uses
  at least two relevant quotations, each explained in the student's own
  words" beats "uses evidence well".
- **Parallel**: each level of a criterion addresses the same features, so
  a marker can see what changes between levels.
- **Qualitative steps, not just adverbs**: change *what the student does*,
  not "some → most → all" alone. Counts are fine when the count matters.
- **Positive framing** at lower levels where possible: what the work *does*
  show ("Identifies a relevant quotation but doesn't yet explain it"), not
  only what's missing.
- **No unexplained judgment words**: excellent, good, adequate, poor,
  insightful. If you use "insightful", say what makes it insightful.
- Language at the students' reading level for the student version.

### Example (Grade 7 / Year 8 argument writing, criterion "Use of evidence")

| Beginning | Developing | Proficient | Exemplary |
|---|---|---|---|
| Gives opinions without supporting evidence, or evidence is unrelated to the claim. | Includes evidence that relates to the claim, but doesn't explain how it supports it. | Supports each main point with relevant evidence and explains in their own words how it supports the claim. | Selects the most convincing evidence, explains it, and addresses a piece of evidence that could support the other side. |

## Step 4: Check it before handing over

Run this quality pass and fix problems:

- [ ] Every criterion traces to the objective/standard
- [ ] Descriptors are observable; no bare "good / excellent / some"
- [ ] Levels differ by what the student does, not only by adverbs
- [ ] No criterion double-counts another
- [ ] A typical "secure" piece would land at the target level, not the top
- [ ] The top level is reachable by a strong student of this age
- [ ] Points add up correctly; grade conversion stated if required
- [ ] Student version uses "I can…" statements a student of this age can read

Then do a **calibration test**: describe briefly what a piece of work at
each level would look like for the actual task. If two levels sound the
same, rewrite them.

## Output

1. **Teacher rubric**: a Markdown table (criteria rows × level columns),
   with points and weights.
2. **Student-friendly version**: "I can…" statements at the target level,
   or the full grid in simpler words, suitable for a self-assessment
   checklist.
3. **Scoring guide**: total points, grade conversion if asked, and how to
   handle borderline work ("if it meets most of Proficient and some of
   Exemplary, award Proficient high").
4. **Optional**: a feedback comment stem for each level, so marking
   comments are quick and consistent.

Offer to export as a table the teacher can paste into Google Docs, Word or
their LMS (Google Classroom, Canvas and Schoology all accept rubric criteria
entered as rows and levels).

## Fixing an existing rubric

If the teacher pastes a rubric, diagnose against the checklist above, list
the 3–5 most important problems, then give the rewritten version. Keep the
teacher's criteria and labels unless they're the problem.
