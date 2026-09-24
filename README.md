# Streak workout app

Personal, local-first workout tracker. The static deployment entry point is `streak.html`.

## Reliability improvements

The deployment entry point remains `streak.html`; GitHub Pages builds from `main`.

- In-session workout/exercise renames optionally update future routines (enabled by default).
- Rename and replace are separate: replacement never relabels already completed work.
- Session comparison follows the actual routine identity, not the calendar suggestion.
- Only explicitly completed sets count toward new performance statistics.
- Choosing another routine leaves the skipped suggestion pending. There is a separate skip action.
- Starting a second session archives the first session on that date.
- Bodyweight zero loads, assistance progression, previous-set cues and optional progression guidance.
- Undo for set completion, exercise removal/replacement, routine changes and clearing a day.
- Visible save status, rest-timer recovery, corruption handling and stale-tab protection.

## Build and preview

Node 22 or newer; no installation step or new runtime dependencies are required.

```sh
npm run verify
python3 -m http.server 8781 --bind 127.0.0.1
```

Open `http://127.0.0.1:8781/streak.html`. This origin has separate browser storage from the live app. Phone records do not automatically sync here.

Edit `src/app.js`, `src/workout-core.js` and `src/storage.js`, then run `npm run build`. `src/shell-start.txt` and `src/shell-end.txt` retain the existing bundled libraries and mounting code. Do not rerun the one-time extraction script after making edits; it would replace the editable sources with the current generated HTML.

## Tests and preview data

`npm test` runs regression checks covering core workout rules, statistics, migrations, recovery, competing writers and optional rest mobility. The build syntax-checks the complete browser script.

## Optional rest mobility

Fifteen illustrated guides cover hips, thighs, calves, upper back, shoulders, wrists and neck. Push/Pull recommend the lower-body pool; Legs recommends the upper-body pool. All fifteen can be browsed with arrows or a swipe; stretches outside the current pool are marked for after the workout and cannot start during that rest. Selection is deterministic: completed strength-set count plus the number of earlier completed sessions of the same actual split, modulo the pool size. It is not random or AI-generated. Skipped/ineligible breaks can advance past an item because the sequence follows completed sets, not confirmed mobility completion.

Only ordinary PPL sessions qualify. Cardio/abs and boss flows are excluded. Rest periods under 90 seconds, named demanding lifts, sets of five reps or fewer, unknown exercises and mixed routines use recovery-only guidance. The first 20 seconds are reserved for settling, movement is optional for 20 seconds, and the final 20 seconds are reserved for preparation. These are conservative product defaults, not clinically established thresholds. No loading, progression, rest duration, XP or statistics are changed by doing or skipping mobility. The workout-level off switch is saved. Browsing preserves the rest deadline and cannot restart a completed mobility interval. The mobility interval itself is transient and resets after a page reload; the rest deadline is recovered independently.

Guides use locally hosted, AI-generated static human illustrations in the app's charcoal-and-gold style. They are pose references, not clinically validated motion demonstrations or a prescribed range to copy. Assets are in `assets/mobility-library-v2/`; adjacent guides preload without contacting a remote image service. Each card includes form guidance and its source under “Form & source.” This feature supports comfortable mobility habits, not a proven lifespan or injury-prevention benefit; injury-specific advice is outside its scope. Deeper holds belong after lifting. Reduced-motion settings disable the subtle card transition.

The rest screen separates the countdown and next-set load/reps into two clear columns above the carousel, with a thin linear progress bar and no timer ring. `node scripts/build-rest-smoke-preview.mjs` builds `rest-smoke-preview.html` using the actual workout component and synthetic in-memory data; it never mounts the storage-owning controller. The generated preview is not a deployment artifact.

To validate a private export without copying it into this repository:

```sh
node scripts/check-private-backup.cjs /absolute/private/path/backup.json
```

`tests/demo-backup.json` is synthetic. It has prior Push and Legs sessions with Legs next in the queue. Use Stats → Backup → Restore from backup to import it only into an isolated test origin. `node scripts/make-demo.cjs` recreates it; it never reads personal data.

Browser checks performed: restore synthetic export; choose Push instead of Legs; rename workout and exercise; confirm routine changes after reload; show last actual Push set; complete and undo a set; restore rest timer after reload; finish and verify comparison date; start a second same-day session; log zero-weight bodyweight work; replace an exercise during rest; inspect phone layout at 390 × 844. No runtime errors were observed during these checks.

The final 15-guide integration and separate rest/next-set columns have automated regression coverage. A final visual browser pass was unavailable because the host Mac was locked. The owner's physical phone is not remotely tested; refresh there without clearing site data and keep a fresh export after further workouts. Full automated browser coverage of every pre-existing boss/cardio/health animation is not in this suite. No promise of zero regressions is implied.

## Data safety and rollback

The original app key, `ws:workout-streak:v1`, is not overwritten. Updated records use `ws:workout-streak:v2`. First migration keeps a separate original-v1 snapshot; subsequent saves retain a last-good recovery copy. Import/reset save additional recovery snapshots. Stats → Backup → Export pre-restore backup exposes a retained pre-import/pre-reset copy. Corrupt startup data stops loading and offers explicit local recovery; it does not silently start an empty log.

Older sets without completion flags remain unchanged and are flagged for review. They are excluded from confirmed performance; prior set XP is credited separately. Historic dates, photos, routines, rewards and other fields are not rewritten by seed functions. Weekly gym rewards remain once per day, even when multiple sessions are recorded.

Cross-tab writes use the Web Locks API when available plus a stale-value check. Older browsers without Web Locks have best-effort conflict detection; use one tab at a time. Browser storage is not cloud backup. Keep downloadable exports outside the repository and outside browser storage.

Before release, preserve the original source commit and exported phone JSON. For code rollback, redeploy the original commit through the normal release process; the old app will read its untouched v1 records. Export v2 data first if any new sessions have been recorded: rolling code back alone will not carry those new sessions into v1. Never clear site data or import a new-format export into an older app without checking compatibility.

Private backups belong outside this public repository. The private-backup verification script prints only aggregate validation and a checksum, not workout or health details.
