# Changelog

Every update to the apps gets a revision number. The Year Clock shows its revision on every screen (bottom left), on the setup card and in the Chairman's controls.

**To release an update:** raise `REV` and `REV_DATE` near the top of the script in `app/index.html`, update the `?rev=` number in the root `index.html`, and add an entry here. An iPad running an older revision will offer "Rev x.y is ready · reload" on its setup screen.

## Year Clock (iPad)

| Rev | Date | Changes |
|---|---|---|
| 2.4 | 26 Nov 2026 | Secret numbers: the iPad never shows which Pass a phone holds, only how many Initiates have reported (plain brass studs); Year One's Order of Access is now drawn at random like every other year; players are called Initiates until Year One is over; Passes may be rescanned until the Chairman opens a year, which seals them; Chairman's controls → Join screen can unseal them; Herald's cue for Year One updated |
| 2.3 | 26 Nov 2026 | Live joining: sealing the clock creates tonight's game key; the locked screen shows a "Join" QR code with the seats (filled as phones claim their Order Pass) and a link light; tap the QR for a full-screen join screen; Chairman's controls → "Join screen · seats" lets the Chairman release a seat (tap twice); a soft clank when a phone joins; New Decade makes a new key |
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
| 0.5 | 26 Nov 2026 | Fix: a scan that opens in a tab already showing the Port page now reloads it and reads the new code (before, nothing happened) |
| 0.4 | 26 Nov 2026 | The number stays secret until the roof reveals it: Pass codes carry a hidden token (`#t=…`) instead of a number, and are wiped from the address bar; scanning a Pass goes straight through the Iron Gate into the fly-over, no button; "Initiate" wording; "Your first secret" after the reveal; rescanning allowed until the year opens (the latest phone to present a Pass takes it, and the other phone is told); "Tap for sound" when the camera opened the page; demo now at `join/#demo`; Pass sheet prints QR codes only, with the number on a trim-off tab |
| 0.3 | 26 Nov 2026 | Live joining: scanning the Port clock's QR stores tonight's game key and plays the gates and fanfare; the phone's own camera scans the Order Pass (`join/#p=N`), which opens the Iron Gate screen; the claim goes to the clock over the encrypted relay; accepted → the fly-over, refused → the reason (Pass held by another phone, not in play tonight, this phone already holds a Pass, clock not answering); "Scan it here" on browsers that can, "Type the number" fallback; demo mode kept when opened with no code; Order Pass QR test sheet (`join/passes.html`) |
| 0.2 | 26 Nov 2026 | The fly-over now crosses a lamp-lit games table: the game box and both books (Chairman's Story on the Herald's Codex) in 3D, a miniature industrial district with brick factories, smoking chimneys and gasholders, and a river with an iron bridge in front of the warehouses. Even camera pace. Sounds: high bells removed; fanfare, steam and deep tones kept; a brass "ta-da" when the warehouse is revealed |
| 0.1 | 26 Nov 2026 | `join/`: standalone prototype of a player's arrival. Brass gates and fanfare ("Welcome to Brasshaven"), "Present your Order Pass" (number picker until the camera is added), then a 3D fly-over of the Port of Ironreach at dusk built from the folded warehouse art, ending above the player's own roof. No live link yet |
