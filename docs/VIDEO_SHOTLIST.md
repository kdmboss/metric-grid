# Video shot list

Target length: 3 minutes or less (confirm the current Congressional App Challenge video rules before recording). Record the browser at **1440 x 900**; the page is taller than the window, so scroll slowly between states. Start the current React app with `npm run dev` at port 5173, or use the review preview. The original Streamlit interface is retained for reproducibility.

Say it plainly: this is a **modeled planning scenario**, not Duke's method, not a prediction, not an operational tool. Never say the plan "protects" people or "picks who loses power".

## Current React workspace recording flow

Start on the primary Vercel app with Compare selected (no query is required). Record the people-first results and equally prominent amber total-household trade-off; show each plan’s actual MW and the shared band. In the default Elliott scenario, the modeled vulnerability-aware plan has 3,412 fewer electric-heat homes than the typical load-only plan; it cuts 2,543 MORE households overall. Read both from the live comparison and make the trade-off clear. Keep the two maps visible while changing the priority and trying the county cap.

Use Compare → Two plans and What changed?, then Evidence → County summary and Plan range. Explain the grey/amber/light/dark categories, protected hatching, and the live swap description. If its SVI direction reverses, say so. A mean tract SVI is not a count of specific people protected. In County summary, show Union’s share of each plan’s own cut and both household counts. Click a zone and demonstrate the synchronized outline and zoom control.

Briefly open Explore for zone lookup and the priority list. Open Evidence → Forecast for the extreme-cold forecast miss, then Evidence → Methods & sources for the assumptions. Evidence → Robustness holds sensitivity results. Leave Prepare out of the video; its local shortlist and exports remain available in the app.

Say the implementation accurately: **“Python for the data and optimization model, React and JavaScript for the interface.”** The web app replays precomputed Python optimization results and calculates displayed summaries locally; it does not run a live optimizer or monitor the grid.

The required purpose sentence is: “HEARTH helps emergency planners and community stakeholders compare how load-only and vulnerability-aware outage scenarios could distribute risk across North Carolina's 8th District.” Disclose Claude, Claude Code, Perplexity and OpenAI Codex. Use the on-screen results rather than memorizing figures. Only include real owner-written personal experiences or approved quotes.

Suggested timing: historical opener and purpose 0:00–0:25; Compare views 0:25–1:35; controls and Explore 1:35–1:55; Evidence 1:55–2:20; code/test 2:20–2:50; limits, tools and close 2:50–3:00.

## Technical evidence to include in the current recording

This checklist is a presentation guide, not a claim about an official judging rubric. Use the current React interface and HEARTH name throughout.

1. **Visual scannability:** show the paired maps and each plan’s actual MW, then What changed? and its live category counts. Show Plan range briefly to explain that the comparison includes the load-only distribution, not just one favorable baseline. Keep the total-household trade-off in view or say it explicitly.
2. **What-if controls:** change Elliott to a supported shortage preset, move the priority slider, then toggle the county cap. Pause for the updated geography and outcomes. Say: “These controls compare precomputed Python optimization results; the interface updates the maps and summaries locally.” Do not demonstrate or claim an arbitrary 50 MW target, continuous MW solving, or a live Python request from the browser; these are not implemented.
3. **Data integration:** within the existing code/test segment, show `clean_svi` in `src/metric_grid/ingest/svi.py`, then `join_attributes` in `src/metric_grid/ingest/district.py`. Say: “I match the public datasets using eleven-digit tract identifiers, preserve leading zeroes, and reject duplicate keys so joins cannot silently multiply rows. Missing vulnerability values stay missing.” Point to the `zfill(11)`, chained GEOID merges, duplicate-key checks and tract-count guard in the real source.
4. **Optimization and verification:** show `_build_problem` and `solve_one` in `src/metric_grid/model/optimizer.py`, then run the targeted optimizer test below. This test actually invokes the Python solver; it is separate from the web app’s precomputed playback. Explain the shared band and protected exclusions, rather than scrolling through many lines of code.

Budget the code/test segment at about 25 seconds: a short GEOID/join shot, a short constraint/objective shot, and the test output. Rehearse and pre-open the files. If time is tight, put the longer data-pipeline explanation in the source walkthrough in README rather than adding runtime to the video.

Optional data-cleaning proof for a reviewer (not required to run on camera):

```bash
.venv/bin/python -m pytest tests/test_phase1.py -k 'svi_missing_sentinel or join_rejects_duplicate' -v
```

## Current React shot reference (use the focused tabs)

| # | Time | App state | What is on screen | Say (in your own words) |
|---|---|---|---|---|
| 1 | 0:00-0:25 | Compare → Two plans | Headline “Same power cut. Different people in the dark.”; briefly show Check your area and its disclaimer; then the people-first results, amber household trade-off, shared band, actual MW and paired maps | The place lookup shows aggregate census tract scenarios, not any home's likely outage. Elliott is the historical reference; these are modeled alternatives, not a reconstruction of Duke's choices. |
| 2 | 0:25-0:55 | Compare → What changed? | Difference map, live category counts, protected hatching; click a zone | Counts come from the current pair of plans. The map shows census-tract zones that change between objectives; it does not identify specific families. |
| 3 | 0:55-1:15 | Evidence → County summary | Union county summary; each plan's MW share and electric-heat homes | The cap can limit concentration. It does not make a plan fair or validate a real-world cut. |
| 4 | 1:15-1:35 | Evidence → Plan range | Distribution of 200 load-only plans and the typical plan | This compares against many equally valid load-only results instead of one convenient baseline. Say the total-household trade-off. |
| 5 | 1:35-1:55 | Controls, then Explore | Change a supported shortage preset, move the priority slider, toggle the county cap; show maps, totals and “Vulnerable zones most often cut when only megawatts count” priority list; open zone lookup (zone 69 is open) | Supported settings replay precomputed Python results and recalculate display summaries locally. This helps planners compare assumptions before an event; it does not select operational actions. |
| 6 | 1:55-2:05 | Evidence → Robustness | Sensitivity results; 17 of 20 settings beat the typical plan on human harm | Say that I tried 20 settings, and note the exceptions and trade-offs shown on screen. |
| 7 | 2:05-2:20 | Evidence → Forecast, then Methods & sources | Extreme-cold forecast miss, historical EIA-930 source, scaling note and methods | Grid inputs are historical and frozen. Public housing, SVI and jobs data join by tract GEOID; GeoPandas/Shapely select tract geometry and spatially join public facilities. |
| 8 | 2:20-2:50 | Code editor and terminal | `join_attributes`, `flag_protected`, `_build_problem`, `solve_one`; targeted optimizer test | Show the GEOID and facility-to-tract joins, then the shared MW band and protected-zone hard exclusion. Python solves during precomputation; React/JavaScript presents those results. |
| 9 | 2:50-3:00 | Compare → Two plans | Return to the comparison and winter preparedness links | Close with the purpose, audience and limits. Name Python, React/JavaScript, Claude, Claude Code, Perplexity and OpenAI Codex in the required disclosure. |

## Code to show on screen (src/metric_grid/model/optimizer.py)

First, lines 72-79 (8 lines): the model every plan shares.

```python
prob = pulp.LpProblem("shed", pulp.LpMinimize)
x = {i: pulp.LpVariable(f"x_{i}", cat="Binary") for i in ids}
for i in ids:
    if protected[i]:
        prob += x[i] == 0  # hard exclusion (PuLP ignores upBound on Binary variables, so state it as a constraint)
load = pulp.lpSum(L[i] * x[i] for i in ids)
prob += load >= lo
prob += load <= hi
```

Then scroll to line 89 (1 line): the objective, the only thing that differs between plans.

```python
prob += pulp.lpSum(objective[i] * x[i] for i in ids)
```

For the vulnerability-aware plan `objective[i]` is the harm score `H_i(alpha)`; the load-only plans use each zone's load `L_i` with a small random preference per zone (`model/loadonly.py`), which is how the 200 equivalent plans are generated. All are solved inside the same band `lo`..`hi`.

## The one test to run on camera

```bash
.venv/bin/python -m pytest tests/test_harm_optimizer.py -k real_both_plans_in_same_band -v
```

Five PASSED lines (one per alpha). Do not run the whole suite on camera. Rehearse the targeted test and avoid promising a fixed execution time.

## Before recording

- `make test` and `npm test` are green; `npm run dev` opens the React workspace; no other tab shows a different data version.
- Current React screenshots in `docs/figures/ui_*.png` match the review build; refresh browser checks with `node scripts/cleanup-smoke.cjs` using the configured Playwright runtime and Chrome.
- Check every number you say against the screen, not memory. The numbers above come from the frozen model output.

## Warm-theme recording notes (2026-10-19)

Record the light review build. Start on Compare with the three KPI cards and both actual MW values. Open More options for the county cap and Filters for zone search. At Business cost only, say “Business-cost optimized”; the human-impact score has zero weight and increases must be reported honestly. On a phone, use the plan toggle and tap a tract for the detail sheet. County summary and Plan range now live in Evidence. Keep Prepare and its county upload workflow out of this short video.
