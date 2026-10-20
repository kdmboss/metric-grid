# HEARTH UI pass 2 · review

Completed October 20, 2026. The UI is ready for local review. This pass has not been pushed or deployed.
Model values, frozen files and model calculations are unchanged; the locked JavaScript
modules and existing tests were formatted without changing their outcomes or expectations.

## Changes

- Compare maps are 580 px tall on desktop and fill the full content row. Zone details sit below them.
- The district fits symmetrically with 16 screen pixels of minimum padding; preserving its shape can
  leave additional space on the other axis.
- Selected zones have a 6 px white halo, a 3.5 px ink outline, and a centroid chip on both maps.
  Other uncut tracts dim to 55%; clicking blank map space or pressing Escape clears selection.
- Wheel/trackpad zoom stays anchored at the pointer. Two-pointer pinch and shared map cameras work.
- Map labels remain 12 screen pixels with 500 weight and a 3 px paper halo.
- Arrow icons share a 16 px SVG box and the vertical center of their links/buttons. Disclosure and
  select arrows have consistent right-side alignment. The screenshot check measures SVG centerlines.
- The hyphen spacing problem came from global Inter tabular numerals. Only numeric values now use them.
- One footer line points to the full Methods explanation. The resident result disclaimer remains as
  required by the existing resident layer; CSV/JSON export provenance stays intact.
- `Workspace.jsx` is now a short composition of dedicated components. Derived results use
  `useScenario`; map controls use a reducer. Shortlist, navigation, gestures and mobile sheet state
  have their own hooks. Shared tabs use one arrow-key handler.
- One `web/app.css` imports variable-only `tokens.css`; the three old stylesheets were removed.
  `npm run lint` checks stale class selectors against source names and rejects `!important`.
- Prettier uses a 100-column target. Every web line is at most 120 columns except the required
  district-scaling sentence: the unchanged audit matches that exact sentence in source, so that
  one literal stays on one line with a documented lint exception.
- Existing local home-screen icons and manifest remain; safe-area padding and the Safari sheet
  were verified with WebKit at 390 × 844. The two-finger test uses synthetic pointer events;
  an actual physical iPhone pinch was not tested.

## Copy removed

Each entry below is the exact JSX block removed from the previous implementation → removed.
Dynamic expressions are shown as source so none of the numbers are mistaken for typed outcomes.

```jsx
<p className="small-note">
            Load is a modeled district estimate. Selection frequencies are indicative, not a uniform
            sample.
          </p>
```

→ Removed.

```jsx
<p className="small-note">For outreach and resilience investigation.</p>
```

→ Removed.

```jsx
<div className="local-storage-note">
        Notes stay in this browser. Export a copy to share or keep a backup. Nothing is sent to a
        server.
      </div>
```

→ Removed.

```jsx
<p className="planning-limitations">{LIMITATION}</p>
```

→ Removed.

```jsx
<p className="panel-note">
                  Qualifies at SVI ≥ {data.config.priority_list.svi_min} or electric-heat share ≥{' '}
                  {fmt(data.config.priority_list.electric_heat_min * 100)}%. Not a finding about
                  specific households or a switching recommendation.
                </p>
```

→ Removed.

```jsx
<p className="small-note">
                        Status describes the census tract, not this building’s actual power supply.
                      </p>
```

→ Removed.

```jsx
<p className="small-note">
                    Both plans cut within {fmt(record.band_lo_mw, 1)}–{fmt(record.band_hi_mw, 1)}{' '}
                    MW. Map views and selections are synchronized. County filtering changes the map,
                    not district-wide plan totals.
                  </p>
```

→ Removed.

```jsx
<div className="why-strip">
                <article>
                  <span>Prepare</span>
                  <h3>Start the right conversations.</h3>
                  <p>
                    Identify areas to investigate for warming centers, outreach calls, and backup
                    power.
                  </p>
                </article>
                <article>
                  <span>Understand exposure</span>
                  <h3>Make the trade-offs visible.</h3>
                  <p>
                    Compare electric-heat homes and communities with higher social vulnerability.
                  </p>
                </article>
                <article>
                  <span>Compare costs</span>
                  <h3>
                    {comparisonDirection(record.baseline.h_econ, record.weighted.h_econ) === 'unchanged' ? 'Unchanged modeled cost.' : `${fmt(Math.abs(costChange))}% ${comparisonDirection(record.baseline.h_econ, record.weighted.h_econ)} modeled cost.`}
                  </h3>
                  <p>
                    Interruption cost vs. the typical plan · 2013 dollars ·{' '}
                    {data.config.harm.h_hours} hour. An estimate, not realized savings.
                  </p>
                </article>
              </div>
```

→ Removed.

```jsx
<p className="small-note">
                  The plan set is reproducible, not a uniform sample of all possible plans. Lower
                  modeled harm does not mean fewer total homes cut.
                </p>
```

→ Removed.

```jsx
<p className="workspace-disclaimer">
          Modeled planning scenario · not Duke Energy’s method · not an operational switching tool.
          Zones are census tracts, not utility boundaries.{' '}
          <button className="text-button" onClick={() => showEvidence('methods')}>
            Methods & sources ↗
          </button>
        </p>
```

→ Removed.

```jsx
<p className="small-note">
        Category counts cover the whole district; county filtering only dims the map. Protected
        zones remain hatched in this view.{' '}
        {changes.removedMeanSvi != null && changes.addedMeanSvi != null ? <>
            Average SVI of zones kept on instead: {fmt(changes.removedMeanSvi, 2)}; cut instead:{' '}
            {fmt(changes.addedMeanSvi, 2)}. These are equal-weight tract averages, not counts of
            people protected.
          </> : 'Missing SVI stays missing; no vulnerability improvement is inferred where the comparison is unavailable.'}
      </p>
```

→ Removed.

```jsx
<p className="small-note">
        Estimated MW are modeled district-scale allocations. Electric-heat share is summed
        electric-heating households divided by summed ACS heating-fuel occupied households. Whole
        tracts may extend outside the district. The summary selector does not filter the maps or
        change either plan.
      </p>
```

→ Removed.

```jsx
<p id="county-data-limits" className="small-note">
        Files are read locally for this browser session and are not sent to a server. Imported
        information does not change the optimization, modeled loads, or protected zones. Use
        resource information without personal or household details.
      </p>
```

→ Removed.

```jsx
<p className="small-note">
            County-supplied · {shown.length} of {rows.length} records · statuses below describe the
            current modeled tract selections, not verified resource power or availability.
          </p>
```

→ Removed.

## Copy rewritten

| Before | After |
|---|---|
| Modeled scenario (hero pill) | Modeled |
| Selected census tract | Selected area |
| Zone {id} · {county} | Zone {id} — {county without “County”} |
| Tract {GEOID} in the zone header | Tract {GEOID} inside the score disclosure |
| Two small status rows | Bold plan names with Cut / Kept on / Protected pills |
| Load-only selection frequency · {count} / {n} | Cut in MW-only plans · {count} of {n} |
| Contains protected facilities; excluded from both plans. Facility coverage may be incomplete. | Has a hospital, nursing home, or water-treatment site, so neither plan cuts it. |
| SVI is missing… (conditional zero-household explanation) | No vulnerability data for this tract. |
| Households whose main heating fuel is electricity. These are modeled census tract selections, not household outage predictions. The main number is the {objective} result. | Homes heated mainly by electricity; the main number shows the {objective} result. |
| Households weighted by CDC Social Vulnerability Index and electric-heat share. This is a modeled score, not a count of specific people protected. | A score that weights households by CDC social vulnerability and electric-heat share. |
| Vulnerable zones most often cut when only megawatts count. Ranked from the current plan set; these frequencies are indicative. | These zones have high social vulnerability or electric-heat use and appear most often in the megawatts-only plans. |
| A shortlist for the next conversation. | Your planning shortlist. |
| Start with a place, not a conclusion. | Choose an area to investigate. |
| Collect places to investigate for outreach, warming centers, and backup power. Add your own notes; this app does not calculate the benefit of an intervention. | Save areas and notes for outreach, warming centers, and backup-power discussions. |
| Notes stay in this browser… (persistent helper) | Removed from Prepare; storage behavior described once in Methods. |
| Browser storage is unavailable. Your shortlist works for this session; export a copy before leaving. | Browser storage is unavailable; export your shortlist before leaving. (Only on actual failure.) |
| Capacity and availability are county-supplied information… This panel does not assess whether a location is suitable or accessible. | Removed from the upload card; Methods asks users to confirm resource availability with the source. |
| N ↑ (on each map) | Removed |
| NC-08 · census tract zones · drag to pan | Drag to move · scroll or +/− to zoom (one hint, fades after interaction) |
| Hidden zone-count text | {n} zones cut (visible in each map header) |
| Full LIMITATION paragraph in the print sheet | Planning scenarios use public census tracts; confirm local conditions before choosing sites. |
| Public data. Explicit assumptions. Modeled consequences. (footer) | HEARTH is a planning simulator built on public data. It is not Duke Energy’s plan. · Methods & sources |
| A public-data planning simulator. / This is not Duke’s method… | What this can and can’t tell you, followed by the paragraph below. |
| They are not a uniform sample. | Some valid plans are more likely to be generated than others. |
| The approximate temperature is KCLT at the reference hour, not a district-wide temperature at the exact start time. | The temperature comes from KCLT at the reference hour. |

The protected-facility note deliberately names hospitals, nursing homes and water treatment;
“shelter” was not added because it is not in the model’s protected set.

### New Methods paragraph

HEARTH compares possible cuts using public census-tract data and results computed by the Python
model. It cannot predict a home’s power supply or guide utility switching. District load is
estimated; whole tracts can extend beyond the district. The shortlist helps planners choose places
to investigate for outreach, warming centers, and backup power; it does not measure the benefit of
those steps. Plan frequencies describe the generated comparison set, which does not cover every
possible plan. The vulnerability score does not count specific families or seniors protected.
County imports add local context and stay in the browser session; shortlist notes stay in browser
storage. Facility data can be incomplete; confirm county resource availability with the source.

## Screenshots

All desktop viewports are 1440 × 900; WebKit phone viewports are 390 × 844 with device scale 3.
Some supporting captures include the full page so the entire section is reviewable.

- [01-chromium-default-full](figures/ui-pass2/01-chromium-default-full.png)
- [01-chromium-default](figures/ui-pass2/01-chromium-default.png)
- [01-webkit-iphone-default](figures/ui-pass2/01-webkit-iphone-default.png)
- [02-chromium-selected](figures/ui-pass2/02-chromium-selected.png)
- [02-webkit-iphone-map](figures/ui-pass2/02-webkit-iphone-map.png)
- [03-chromium-union](figures/ui-pass2/03-chromium-union.png)
- [04-chromium-prepare](figures/ui-pass2/04-chromium-prepare.png)
- [05-chromium-methods](figures/ui-pass2/05-chromium-methods.png)
- [06-webkit-iphone-bottom-sheet](figures/ui-pass2/06-webkit-iphone-bottom-sheet.png)

## Validation

28 web tests passed; lint and build passed; all Chrome/WebKit checks passed. The 21 Python audit tests passed with the expected missing-SVI data warning. Final command output is saved in `docs/UI_PASS2_CHECKS.txt`.
The browser script checks Chrome at 320/375/390/414/768/1440 px and WebKit at
320/375/390/414 px, all primary desktop modes, shared selection, blank-space/Escape clearing,
wheel zoom, protected rendering, centered arrow icons, actual Safari tract taps, visible bottom
sheet bounds, synthetic two-pointer pinch, and one-map mobile switching. No external runtime
requests or browser exceptions were observed.

No model files or frozen inputs/results changed. Existing expected test outcomes were retained.
