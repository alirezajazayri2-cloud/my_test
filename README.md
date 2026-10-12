# HEDA — Persian WAI career explorer

Open **index.html** directly in a browser. No server, install, build, API, or network connection is needed. The two pages use vanilla HTML, CSS, and JavaScript. Fonts use a local Vazirmatn installation when available, followed by Segoe UI, Tahoma, and Arial; there are no external font requests.

- `index.html`: 253 original multiple-choice questions, keyboard-accessible answers, progress, saved responses, review, and reset. The review button lists incomplete questions with a shortcut to the first unanswered question.
- `results.html`: recalculated WAI profile, five exploratory career suggestions, all 15 dimensions, printable/PDF layout, and a UTF-8 text report download.
- `styles.css`: responsive RTL styling, CSS compass illustration, and print styles.
- `data.js`: offline question bank extracted from the supplied HTML and question metadata.
- `scoring.js`: scoring and editable career mapping.
- `app.js`: page interaction, validation, local storage, and export.

## Sources and interpretation

Question wording and options come from `سوالات.html`, matched by ID to `wai_questions.json`. All 253 metadata records have matching text. The lowercase `l3` in the HTML is matched to `I3`; its missing metadata record has been restored, completing I1–I14.

Two invalid metadata option counts are corrected in the web data using the original options: I2 has 3 options, not 6; T16 has 2, not 50. These corrections affect the unanswered-question denominator. See `data-audit.json`. The extractor `build_data.py` regenerates `data.js` from `source-blocks.json` and the supplied JSON using Python's standard library.

Scores follow `wai_engine.py`: A+ starts at the supplied constant and subtracts the capacity of unanswered questions (1/2 points, doubled for weighted questions), with a minimum of 1. B sums 0/1/2 for الف/ب/ج. Answer weights are **not** applied to B, matching the supplied engine. Scores are rounded upward to a tenth. Source color rules, including their gaps, are retained in the calculation; the UI displays numerical scores rather than assigning psychological meaning to those colors. Unanswered dimensions have no score rather than a misleading zero.

The files contain no career mapping or validated occupational norms. The 18-career mapping in `scoring.js` is an explicitly exploratory editorial addition. For each career it computes the weighted mean of its dimension scores, clamped to 0–9 for ranking only. Raw scores remain visible without clipping. Ties use a stable catalog order. The labels for B and C both follow the provided Word document's description of connection with inanimate objects; their source codes distinguish them.

The source contains **no V (visual) questions**. The profile displays this dimension as unavailable, and careers requiring V are excluded rather than receiving invented visual scores. Results require at least 80% completion (203 answers) and one answer in each of the 14 available dimensions. This is an application completeness rule, not a psychometric standard. No medical, diagnostic, or success-probability claims are made. The nine ASK and ten free-response items outside the supplied scoring JSON are not included.

## Privacy and persistence

Answers remain in the browser's local storage. Invalid saved options are discarded. If storage is unavailable, answers stay in memory and are transferred between the two pages in a URL fragment. Direct `file:` use also carries a fragment to handle browsers with per-file storage. Fragments are not sent to a server, but can remain in browser history; avoid sharing these URLs. When storage is available, the results page clears its incoming fragment. Reset removes the app's current answers after confirmation.

Use **چاپ / ذخیره PDF** on the results page to print or choose Save as PDF in the browser dialog. **دانلود گزارش** downloads a readable Persian text report with the scoring explanation.

## Browser validation

Verified in headless Chrome with direct `file:` URLs: answering and persistence, section review links, completion gating, exactly five career cards, Persian text download, print button and PDF rendering, reset followed by reload, and a questionnaire/results/edit round trip with local storage disabled. Imported answer fragments are cleared after successful persistence or updated when storage is unavailable, so reset cannot restore stale imported answers. Responsive layouts were checked at 320, 390, 768, and 1440 pixels. JavaScript scoring also matches all 30 supplied reference fixtures in `validation/scoring-fixtures.json`.

The `validation` directory includes desktop/mobile captures and a sample print PDF. These are example results, not personal assessment data.

## Update — October 10, 2026

Added questionnaire completion guidance and a visible explanation of exploratory career suggestions. Results self-navigation now carries answers in offline/storage-unavailable sessions; clearing an answer restores keyboard focus. Text exports distinguish missing source questions from unanswered questions. Rechecked JavaScript syntax, both pages’ local dependencies, full/empty scoring, and all 30 reference fixtures. A fresh visual browser run could not be completed because Chrome failed to initialize its GPU process in this environment; the earlier browser validation above is historical.
