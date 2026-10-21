# HEARTH contributor guidance

Read README.md for setup, docs/SPEC.md for the model specification and amendments,
and docs/ASSUMPTIONS.md and docs/DATA_SOURCES.md for scientific limitations and provenance.

- The primary interface is React/Vite; the Capacitor iOS wrapper is on ios-shell.
  Python produces frozen results; Streamlit is retained as a legacy interface.
- Preserve model inputs, formulas and frozen results during interface work.
- All displayed outcomes come from results. Keep both actual MW values, the shared
  target band, household trade-offs and 2013-dollar cost units clear.
- There is no single load-only baseline: show the typical plan and the comparison
  with the reproducible set of 200 equivalent plans; sampling is not uniform.
- Geography is census tract zones, not utility boundaries. Protected zones are
  hard exclusions; public facility coverage may be incomplete.
- Use modeled/estimated labels. Do not claim live optimization, household outage
  prediction, utility control or counts of specific people protected by a weighted score.
- Keep runtime data local. Never commit secrets or raw API credentials.
- Publish only approved, attributed quotes. Owners write their own personal stories.
- Run npm test, npm run lint and npm run build for web changes. Run relevant Python
  checks for documentation or pipeline changes. Document native verification limits.
- Update CHANGELOG.md and docs/AI_DISCLOSURE.md honestly. Owners complete their
  own contribution statements. Production releases require owner authorization.
