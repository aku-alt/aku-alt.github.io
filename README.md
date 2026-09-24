# Streak workout app

Personal, local-first workout tracker. The static deployment entry point is `streak.html`.

## Reliability preview

The working branch is `codex/workout-reliability`. These changes are **not deployed**.

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

`npm test` runs 27 regression checks covering core workout rules, the real app's statistics functions, migrations, recovery, quota errors and competing writers. The build also syntax-checks the complete browser script.

To validate a private export without copying it into this repository:

```sh
node scripts/check-private-backup.cjs /absolute/private/path/backup.json
```

`tests/demo-backup.json` is synthetic. It has prior Push and Legs sessions with Legs next in the queue. Use Stats → Backup → Restore from backup to import it only into an isolated test origin. `node scripts/make-demo.cjs` recreates it; it never reads personal data.

Browser checks performed: restore synthetic export; choose Push instead of Legs; rename workout and exercise; confirm routine changes after reload; show last actual Push set; complete and undo a set; restore rest timer after reload; finish and verify comparison date; start a second same-day session; log zero-weight bodyweight work; replace an exercise during rest; inspect phone layout at 390 × 844. No runtime errors were observed during these checks.

Still required before release: owner preview approval, a final phone-browser smoke test, and an up-to-date phone export if further workouts have been logged. Full automated browser coverage of every pre-existing boss/cardio/health animation is not in this suite. No promise of zero regressions is implied.

## Data safety and rollback

The original app key, `ws:workout-streak:v1`, is not overwritten. Updated records use `ws:workout-streak:v2`. First migration keeps a separate original-v1 snapshot; subsequent saves retain a last-good recovery copy. Import/reset save additional recovery snapshots. Stats → Backup → Export pre-restore backup exposes a retained pre-import/pre-reset copy. Corrupt startup data stops loading and offers explicit local recovery; it does not silently start an empty log.

Older sets without completion flags remain unchanged and are flagged for review. They are excluded from confirmed performance; prior set XP is credited separately. Historic dates, photos, routines, rewards and other fields are not rewritten by seed functions. Weekly gym rewards remain once per day, even when multiple sessions are recorded.

Cross-tab writes use the Web Locks API when available plus a stale-value check. Older browsers without Web Locks have best-effort conflict detection; use one tab at a time. Browser storage is not cloud backup. Keep downloadable exports outside the repository and outside browser storage.

Before release, preserve the original source commit and exported phone JSON. For code rollback, redeploy the original commit through the normal release process; the old app will read its untouched v1 records. Export v2 data first if any new sessions have been recorded: rolling code back alone will not carry those new sessions into v1. Never clear site data or import a new-format export into an older app without checking compatibility.

Private backups belong outside this public repository. The private-backup verification script prints only aggregate validation and a checksum, not workout or health details.
