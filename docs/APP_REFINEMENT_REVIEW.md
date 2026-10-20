# App hierarchy refinement

The previous screen placed introduction, results, controls and town search above the maps. The new desktop layout places scenario controls and place search alongside the live result strip and comparison maps. The household trade-off uses the existing warm surface and remains equally prominent. Prepare and Evidence omit unrelated comparison controls. Explore explains what selecting a tract lets the user do.

Preview: http://127.0.0.1:5175/ . Screenshots: `figures/app-refinement/`.

This is a visual and interaction refinement, not proof of user appeal. The strongest next validation is an observed task with a county planner: compare two settings, identify an area to investigate, and add it to the shortlist without guidance. Check whether the planner can explain both the vulnerability outcome and the total-household trade-off. No claim is made that any planner has completed this evaluation.

Validation: 30 web tests, source lint and production build; Chrome desktop and WebKit phone/standalone emulation checks, plus page overflow checks at 320/375/414/768px. Screenshots and checks are generated in this review directory. Physical iOS installation remains unverified. Production remains unchanged.
