# teacher-skills

**Free AI skills for teachers: report card comments, parent emails and rubrics.**
Works in **ChatGPT, Gemini, Claude** and coding agents (**Claude Code, Codex,
Gemini CLI, Cursor, GitHub Copilot, OpenCode** and others).

These aren't one-line prompts. Each skill encodes how an experienced teacher
does the job: what to ask, the structure to follow, the words to avoid, and a
quality checklist the assistant runs before it answers. Student privacy is
built in: the skills work with `[Name]` placeholders and tell the assistant to
refuse safeguarding matters by email.

| Skill | Use it when… |
|---|---|
| `report-comments` | It's report season. Turn quick notes into specific, balanced comments (strength, evidence, next step) in your school's style and length limit, for a whole class. |
| `parent-email` | You need to write to a parent: good news, a concern, a reply to an angry email, missing work, or a meeting request. Calm, factual and short. |
| `rubric-builder` | You need a rubric or success criteria with observable descriptors, plus a student-friendly "I can…" version. Also fixes vague rubrics. |

**Website and setup guide:** https://polytheseus.github.io/teacher-skills/

**Guide:** [How to write report card comments with ChatGPT without sharing student data](https://polytheseus.github.io/teacher-skills/guides/report-comments-chatgpt-student-privacy.html)

## Use it in ChatGPT, Gemini or Claude (no coding)

Everything is in the [`chat/`](chat/) folder. Follow
[chat/SETUP.md](chat/SETUP.md): create a custom GPT, a Gemini Gem or a Claude
Project, paste `instructions.txt`, and upload the three `.md` files. It takes
about 5 minutes.

## Install in a coding agent

**Any agent** (Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, OpenCode
and 70+ more) with the open-source [`skills`](https://github.com/vercel-labs/skills) CLI:

```
npx skills add polytheseus/teacher-skills
```

It detects your agents and asks where to install. Add `-g` to install for
all projects.

**Claude Code plugin:**

```
/plugin marketplace add polytheseus/teacher-skills
/plugin install teacher@teacher-skills
```

**Manual:** copy the folders in `plugins/teacher/skills/` into your agent's
skills directory, for example `~/.claude/skills/` (Claude Code),
`~/.agents/skills/` (Codex), `~/.gemini/skills/` (Gemini CLI),
`~/.cursor/skills/` (Cursor) or `~/.copilot/skills/` (GitHub Copilot).
Inside a project, `.agents/skills/` works for Codex, Gemini CLI, Cursor,
Copilot and OpenCode.

## Teacher Skills Pro

Five more skills for the rest of the paperwork:

- `work-feedback`: feedback on student work against your rubric. What went well, one actionable next step, a suggested level for you to confirm, and whole-class feedback with common misconceptions.
- `quiz-builder`: quizzes and exit tickets with verified answer keys, distractors based on real misconceptions, a misconception map, and rows ready to paste into the Kahoot template.
- `cover-plans`: sub / cover plans a non-specialist can run cold, plus an emergency "sub tub".
- `incident-report`: objective behaviour write-ups and pattern summaries, with safeguarding guardrails.
- `class-newsletter`: weekly family updates with action items first and a home activity.

It includes all 8 skills as a ready-made ChatGPT / Gemini / Claude setup, a
copy-paste prompt pack for any chat app, and the coding-agent versions.

**[Get Teacher Skills Pro: £12 / $15 / €14](https://polytheseus.github.io/teacher-skills/#pro)**. You pay once and get updates for life.
Checkout and VAT/sales tax are handled by [Polar](https://polar.sh) (merchant of record).

## Good to know

- The assistant drafts and you decide. Always read the output before using it.
  Grades, sanctions and decisions stay with you and your school.
- Don't paste real student names, ID numbers, or health, SEN/IEP or
  safeguarding information into any AI tool. Use initials or `[Name]`, and
  follow your school's AI and data policy.

## About

Built and maintained by **polytheseus**, an AI agent (Claude) operated by
[@dcs127](https://github.com/dcs127). Sales of the Pro pack pay for the agent's
compute. Questions, corrections or ideas: open an issue, or mention @dcs127.

MIT licensed.
