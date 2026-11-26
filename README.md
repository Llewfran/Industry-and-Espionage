# Industry & Espionage

A steampunk social-deduction and negotiation game for up to 10 Industrialists and a Chairman, set in the city of Brasshaven.

## The apps

| Piece | Device | Status |
|---|---|---|
| **Year Clock** (`app/index.html`) | iPad in the Negotiation Chamber | Rev 2.3 (see [CHANGELOG](CHANGELOG.md)) |
| **Joining** (`join/`) | Players' phones | Rev 0.3 · live |
| Chairman's control centre | Chairman's phone | Planned |
| Industrialist handhelds | Players' phones | Planned |

### Joining (phones)

1. The Chairman seals the Year Clock. Its locked screen shows tonight's QR code (tap it to fill the screen).
2. Each Industrialist scans that QR with their phone's **camera app**: the gates open with a fanfare.
3. They then scan the QR on the back of their **Order Pass** with the camera app. The Iron Gate screen asks the clock for that seat; once accepted, the phone flies over the Port to their Warehouse. The seat lights up on the iPad.
4. One phone holds one Pass, and a Pass belongs to one phone. The Chairman can release a seat in Chairman's controls → *Join screen · seats*.

Test codes for the Passes: `join/passes.html` (print, cut out, stick on the back of each Pass). Opening `join/` with no code runs the demo.

Messages travel through the public relay ntfy.sh (as in Prosperitas Arcana), sealed with AES-GCM using a key that exists only in tonight's QR code. Add `?relay=local` to test the clock and the phone pages in two tabs of one browser with no network.

### Year Clock

A single web page that runs the rhythm of the Decade on the Chamber's iPad:

- **Order of Access**: Year One runs in number order; from Year Two a new random order is drawn each year.
- **Call timer**: adjustable length (default 3:00). At 30 seconds a bell sounds and the next Warehouse number flashes on screen.
- **End of year**: the clock stops and waits. Only the Chairman's 4-digit PIN opens the next year. A phone remote will replace the PIN later.
- **Herald's cues**: each locked screen shows which proclamation the Herald reads before that year opens (Welcome, Honour of the Pin, Warning, Year Five, Silent Procession, Year Ten, Great Reveal).
- **Chairman's controls** (gear button, PIN): pause, +30 seconds, next Call, restart Call, change Call length, end the year, start a new Decade.
- Keeps the screen awake where the browser allows, and survives a reload.

**Run it on the iPad:** enable GitHub Pages for this repository (Settings → Pages → Deploy from branch → `main`, folder `/root`). Open `https://llewfran.github.io/Industry-and-Espionage/` in Safari (it goes straight to the Year Clock), then Share → **Add to Home Screen** so it opens full screen. Tap any button once so the iPad allows sound, and turn off the side switch's silent mode.

**Updates:** every change gets a revision number, listed in [CHANGELOG.md](CHANGELOG.md). The clock shows its Rev in the bottom-left corner; if the iPad has an older copy cached, the setup screen offers to reload the newer revision.
