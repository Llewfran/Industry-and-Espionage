# Changelog

Every update to the apps gets a revision number. The Year Clock shows its revision on every screen (bottom left), on the setup card and in the Chairman's controls.

**To release an update:** raise `REV` and `REV_DATE` near the top of the script in `app/index.html`, update the `?rev=` number in the root `index.html`, and add an entry here. An iPad running an older revision will offer "Rev x.y is ready · reload" on its setup screen.

## Year Clock (iPad)

| Rev | Date | Changes |
|---|---|---|
| 2.2 | 26 Nov 2026 | Steam gauge: the mechanical step now also works during the settling minute; at the end of every Call (and of the settling minute) the needle ticks down to the last mark at zero, then sweeps back to the start while the whistle blows |
| 2.1 | 26 Nov 2026 | Steam gauge only: digital time window removed and the In Port number plate moved up into its place; no numbers on the marks except the timer setting (e.g. 3:00, or 1:00 while settling) at the start of the scale; "IRONREACH CLOCK" and *Time is of the Essence* set much larger below the hub (Brasshaven Works removed); mechanical needle step: a kick back, a jump past the new mark, and a settle |
| 2.0 | 26 Nov 2026 | New layout: Order of Access tokens staggered in a zigzag down the left (all 10 fit), clock right of centre and as large as the screen allows; at 30 s a large red panel over the left side reads "Stand ready at the Iron Gate" with the next number flashing; steam gauge needle steps every 5 s like an old station clock (10 s on Calls over 5 minutes), no shake, with a mark for every step; player number moved up inside the plate; "MINUTES" replaced by *Time is of the Essence* (Brasshaven Works kept). Applies to both dials |
| 1.6 | 26 Nov 2026 | Revision numbers on every screen; CHANGELOG; update notice on the setup screen; cache-busting link from the site root |
| 1.5 | 25 Nov 2026 | Steam gauge: 5-second steam whistle and steam when the Port opens; gauge plate reads "To the Gate" while settling |
| 1.4 | 25 Nov 2026 | Steam-gauge dial (needle, danger band, lamp, whistle steam at 30 s); "Dial" choice in setup and "Switch dial" in the Chairman's controls; brass ring kept |
| 1.3 | 25 Nov 2026 | Deep Iron Gate sound (clank and two low tolls), distinct from the warning chime; "Test the bells" plays both |
| 1.2 | 25 Nov 2026 | "In Port" wording; 30-second call to "Stand ready at the Iron Gate"; "The Port is open" gates with who exits and enters; front page that opens the clock |
| 1.1 | 25 Nov 2026 | Settling minute before the first Call of each year (adjustable 0–3:00) |
| 1.0 | 25 Nov 2026 | First Year Clock: random Order of Access (number order in Year One), adjustable Call timer, 30-second warning, PIN lock at the end of each year, Herald's cues, Chairman's controls |

The Rev 1.0–1.1 brass-ring version is kept on the `v1-brass-ring` branch.

## Joining prototype (phones)

| Rev | Date | Changes |
|---|---|---|
| 0.1 | 26 Nov 2026 | `join/`: standalone prototype of a player's arrival. Brass gates and fanfare ("Welcome to Brasshaven"), "Present your Order Pass" (number picker until the camera is added), then a 3D fly-over of the Port of Ironreach at dusk built from the folded warehouse art, ending above the player's own roof. No live link yet |
