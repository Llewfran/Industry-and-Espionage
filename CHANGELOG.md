# Changelog

Every update to the apps gets a revision number. The Year Clock shows its revision on every screen (bottom left), on the setup card and in the Chairman's controls.

**To release an update:** raise `REV` and `REV_DATE` near the top of the script in `app/index.html`, update the `?rev=` number in the root `index.html`, and add an entry here. An iPad running an older revision will offer "Rev x.y is ready · reload" on its setup screen.

## Year Clock (iPad)

| Rev | Date | Changes |
|---|---|---|
| 1.6 | 26 Nov 2026 | Revision numbers on every screen; CHANGELOG; update notice on the setup screen; cache-busting link from the site root |
| 1.5 | 25 Nov 2026 | Steam gauge: 5-second steam whistle and steam when the Port opens; gauge plate reads "To the Gate" while settling |
| 1.4 | 25 Nov 2026 | Steam-gauge dial (needle, danger band, lamp, whistle steam at 30 s); "Dial" choice in setup and "Switch dial" in the Chairman's controls; brass ring kept |
| 1.3 | 25 Nov 2026 | Deep Iron Gate sound (clank and two low tolls), distinct from the warning chime; "Test the bells" plays both |
| 1.2 | 25 Nov 2026 | "In Port" wording; 30-second call to "Stand ready at the Iron Gate"; "The Port is open" gates with who exits and enters; front page that opens the clock |
| 1.1 | 25 Nov 2026 | Settling minute before the first Call of each year (adjustable 0–3:00) |
| 1.0 | 25 Nov 2026 | First Year Clock: random Order of Access (number order in Year One), adjustable Call timer, 30-second warning, PIN lock at the end of each year, Herald's cues, Chairman's controls |

The Rev 1.0–1.1 brass-ring version is kept on the `v1-brass-ring` branch.
