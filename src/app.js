  // workoutstreak.tsx
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  if (typeof window !== "undefined" && !window.storage) {
    let ls = null;
    try {
      ls = window.localStorage;
      const t = "ws:__probe";
      ls.setItem(t, "1");
      ls.removeItem(t);
    } catch (e) {
      ls = null;
    }
    const mem = {};
    const read = (k2) => ls ? ls.getItem("ws:" + k2) : Object.prototype.hasOwnProperty.call(mem, k2) ? mem[k2] : null;
    window.storage = {
      persistent: !!ls,
      withLock: typeof navigator!=='undefined'&&navigator.locks ? fn=>navigator.locks.request('workout-streak-save-v2',fn) : undefined,
      async get(key) {
        const value = read(key);
        if (value == null) return null;
        return { key, value, shared: false };
      },
      async set(key, value) {
        const v = String(value);
        if (ls) ls.setItem("ws:" + key, v);
        else mem[key] = v;
        return { key, value: v, shared: false };
      },
      async delete(key) {
        if (ls) ls.removeItem("ws:" + key);
        else delete mem[key];
        return { key, deleted: true, shared: false };
      },
      async list(prefix2) {
        const keys2 = [];
        if (ls) {
          for (let i = 0; i < ls.length; i++) {
            const k2 = ls.key(i);
            if (k2 && k2.startsWith("ws:")) keys2.push(k2.slice(3));
          }
        } else keys2.push(...Object.keys(mem));
        return { keys: prefix2 ? keys2.filter((k2) => k2.startsWith(prefix2)) : keys2 };
      }
    };
  }
  var KEY = "workout-streak:v2";
  var safeStore = WorkoutStorage.create(window.storage);
  var QUOTA_PHASES = [
    { until: "2026-09-13", gym: 3, cardio: 1 },
    // rebuild phase: first ~2 months back
    { until: "9999-12-31", gym: 4, cardio: 1 }
    // full program from 14 Sep
  ];
  var quotaFor = (ws) => QUOTA_PHASES.find((ph) => ws <= ph.until);
  var PHOTO_EVERY_DAYS = 14;
  var PHOTO_XP = 10;
  var WALK_TIERS = [
    { km: 20, xp: 15, name: "TWENTY KM" },
    { km: 15, xp: 10, name: "FIFTEEN KM" },
    { km: 10, xp: 5, name: "TEN KM" }
  ];
  var walkTierFor = (km) => WALK_TIERS.find((t) => km >= t.km) || null;
  var SLIP_XP = 15;
  var NIC_STEPS = [
    { days: 28, limit: 7 },
    { days: 28, limit: 5 },
    { days: 28, limit: 3 },
    { days: 28, limit: 2 },
    { days: 28, limit: 1 }
  ];
  var nicLimitAt = (startDs, ds) => {
    let d = daysBetween(startDs, ds);
    for (const s2 of NIC_STEPS) {
      if (d < s2.days) return s2.limit;
      d -= s2.days;
    }
    return 0;
  };
  var alcLimitAt = (startDs, ds) => daysBetween(startDs, ds) < ALC_PLAN.taperDays ? ALC_PLAN.limit : ALC_PLAN.after;
  var NIC_GRACE_DAYS = 28;
  var STRETCH_XP = 5;
  var countableSets = WorkoutCore.doneSets;
  var TRIAL_XP = 15;
  var GATE_XP = 20;
  var artBG = (f, pos) => ({
    backgroundImage: `url(${f}), url(${f.replace(/\.jpg\b/, ".jpeg")})`,
    ...pos ? { backgroundPosition: pos } : {}
  });
  var TRIAL_COOLDOWN_DAYS = 14;
  var TRUEFORM_XP = 10;
  var TRUEFORM_BASE = 0.25;
  var TRUEFORM_STEP = 0.1;
  var TRUEFORM_CAP = 0.8;
  var BB_THEMES = ["forge", "arcade", "souls"];
  var P2_REST = 45;
  // Legacy boss labels omit "barbell"; dumbbells keep a separate identity.
  var stripLift = (s2) => WorkoutCore.key(s2).replace(/^db /, 'dumbbell ').replace(/^barbell (bench press|deadlift)$/, '$1');
  var APP_VERSION = "v2026.09.24-reliability-preview";
  var STRETCH_MINUTES = 15;
  var ABS_XP = 5;
  var ABS_CIRCUIT = [
    { name: "Crunches", type: "rep", base: 10, step: 2, cap: 40 },
    { name: "Plank", type: "hold", base: 20, step: 5, cap: 75 },
    { name: "Leg Raises", type: "rep", base: 8, step: 1, cap: 25 },
    { name: "Bicycles", type: "rep", base: 10, step: 2, cap: 35, per: "each side" },
    { name: "Russian Twists", type: "rep", base: 16, step: 2, cap: 50 },
    { name: "Reverse Crunches", type: "rep", base: 8, step: 1, cap: 25 },
    { name: "Side Plank", type: "hold", base: 15, step: 3, cap: 45, per: "each side" },
    { name: "Flutter Kicks", type: "rep", base: 20, step: 4, cap: 60 },
    { name: "Finisher Plank", type: "hold", base: 25, step: 5, cap: 90 }
  ];
  var ABS_REST_S = 15;
  var absTarget = (m, steps) => Math.min(m.cap, m.base + m.step * Math.max(0, steps || 0));
  var ABS_EVOLVED = {
    "Crunches": { name: "V-Ups", type: "rep", base: 8, step: 1, cap: 25 },
    "Plank": { name: "Long-Lever Plank", type: "hold", base: 20, step: 5, cap: 60 },
    "Leg Raises": { name: "Leg Raise + Hip Lift", type: "rep", base: 8, step: 1, cap: 20 },
    "Bicycles": { name: "Windshield Wipers", type: "rep", base: 6, step: 1, cap: 16, per: "each side" },
    "Russian Twists": { name: "Feet-Up Russian Twists", type: "rep", base: 12, step: 2, cap: 40 },
    "Reverse Crunches": { name: "Jackknife Sit-Ups", type: "rep", base: 8, step: 1, cap: 22 },
    "Side Plank": { name: "Side Plank + Leg Raise", type: "hold", base: 12, step: 3, cap: 40, per: "each side" },
    "Flutter Kicks": { name: "Hollow-Body Flutter", type: "rep", base: 15, step: 3, cap: 40 },
    "Finisher Plank": { name: "Hollow Hold", type: "hold", base: 20, step: 5, cap: 75 }
  };
  var absNotches = (m) => Math.max(1, Math.ceil((m.cap - m.base) / m.step));
  var REST_OPTS = [45, 60, 90, 120, 180];
  var REST_EX_OPTS = [90, 120, 150, 180, 240];
  var SIDE_DAY_XP = 2;
  var ALC_PLAN = { limit: 2, after: 1, taperDays: 7, bankCap: 3 };
  var TARGET_XP = 50;
  var CHECKIN_EVERY_DAYS = 7;
  var CK_FREQ_Q = "In the past 7 days, on how many days did you have a burning feeling behind your breastbone (heartburn)?";
  var CK_FREQ_OPTS = ["0 days", "1 day", "2\u20133 days", "4\u20137 days"];
  var CK_SEV_Q = "At its worst, how severe was it?";
  var CK_SEV_OPTS = [
    { s: 1, label: "Mild", desc: "noticeable, easily tolerated" },
    { s: 2, label: "Moderate", desc: "interfered with daily activities" },
    { s: 3, label: "Severe", desc: "prevented daily activities" }
  ];
  var CK_MOOD_Q = "And on average, how has your mood been this past week?";
  var CK_MOOD_OPTS = ["Very low", "Low", "Neutral", "Good", "Very good"];
  var CK_MOOD_COLORS = ["#E0654F", "#FF8A3C", "#FFD666", "#9BC46B", "#58B368"];
  var ckMood = (v) => v && typeof v === "object" && v.m != null ? v.m : null;
  var CHECKIN_COLORS = ["#58B368", "#9BC46B", "#FFD666", "#FF8A3C", "#E0654F"];
  var CK_FREQ_COLORS = ["#58B368", "#9BC46B", "#FF8A3C", "#E0654F"];
  var CK_SEV_COLORS = ["#FFD666", "#FF8A3C", "#E0654F"];
  var ckComp = (v) => v == null ? null : typeof v === "number" ? Math.round(v * 1.5 * 10) / 10 : v.legacy != null ? Math.round(v.legacy * 1.5 * 10) / 10 : (v.f || 0) + (v.s || 0);
  var ckColor = (v) => CHECKIN_COLORS[Math.max(0, Math.min(4, Math.round(ckComp(v) / 1.5)))];
  var ckLabel = (v) => typeof v === "number" ? `score ${v}/4 (old scale)` : v.legacy != null ? `score ${v.legacy}/4 (old scale)` : `${CK_FREQ_OPTS[v.f]}${v.f > 0 && v.s > 0 ? " \xB7 " + (CK_SEV_OPTS.find((o) => o.s === v.s) || {}).label : ""}${v.m != null ? " \xB7 mood: " + CK_MOOD_OPTS[v.m] : ""}`;
  var XP_FOR = { gym: 10, cardio: 15 };
  var XP_EXTRA = { gym: 5, cardio: 8 };
  var XP_PER_SET = 1;
  var WEEK_BONUS_XP = 25;
  var PS5_PER_SESSION = 30;
  var PS5_PER_EXTRA = 15;
  var PS5_WEEK_BONUS = 30;
  var MAX_SHIELDS = 3;
  var LEVELS = [
    { xp: 0, title: "Rookie" },
    { xp: 100, title: "Regular" },
    { xp: 250, title: "Committed" },
    { xp: 450, title: "Grinder" },
    { xp: 700, title: "Machine" },
    { xp: 1e3, title: "Beast" },
    { xp: 1350, title: "Colossus" },
    { xp: 1700, title: "Titan" },
    { xp: 2100, title: "Iron Legend" },
    { xp: 2600, title: "Myth" },
    { xp: 3e3, title: "Deathless" },
    { xp: 3500, title: "Dragonslayer" }
  ];
  var cardioOnWeight = (on, off) => 1 + 2 * (on / Math.max(1, on + off));
  var cardioEffortSec = (cf) => cf.mode !== "steady" ? cf.wu + cf.r * cf.on * cardioOnWeight(cf.on, cf.off) : cf.wu + cf.min * 60;
  var cardioBonusFor = (effortSec) => Math.max(0, Math.min(15, Math.round((effortSec / 60 - 15) / 3)));
  var SEASON = {
    name: "Christmas Challenge",
    prize: "PS5 Pro",
    targetXp: 3200,
    // rebalanced for the tapered program (was 3400)
    start: "2026-07-13",
    end: "2026-12-25"
    // deadline — points reset after this
  };
  var S = (kg, reps, n) => Array.from({ length: n }, () => ({ kg, reps }));
  var TEMPLATES = {
    PUSH: [
      { name: "Incline Dumbbell Bench Press", sets: [...S(28, 8, 3), ...S(18, 8, 3)] },
      { name: "Barbell Bench Press", sets: S(50, 10, 3) },
      { name: "Dumbbell Press", sets: S(16, 8, 3) },
      { name: "Low Cable One-Arm Lateral Raise", sets: S(5, 10, 3) },
      { name: "Cable Fly", sets: S(7.5, 10, 3) },
      { name: "Standing Low Cable Triceps Extension", sets: S(7.5, 12, 3) }
    ],
    PULL: [
      { name: "Chin-Up", sets: [{ kg: 5, reps: 8 }, { kg: 5, reps: 7 }, { kg: 5, reps: 5 }] },
      { name: "Deadlift", sets: S(110, 8, 3) },
      { name: "One-Arm Lat Pull-Down", sets: S(20, 15, 3) },
      { name: "Seated Cable Row", sets: S(57.5, 10, 3) },
      { name: "Lat Pull-Down", sets: S(55, 8, 3) },
      { name: "Alternating Incline Dumbbell Curl", sets: S(10, 10, 3) },
      { name: "Dumbbell Shrug", sets: S(20, 10, 3) }
    ],
    LEGS: [
      { name: "Leg Press", sets: S(210, 8, 3) },
      { name: "Seated Leg Curl", sets: S(72, 15, 3) },
      { name: "Hip Thrust", sets: S(10, 12, 3) },
      { name: "Dumbbell Bulgarian Split Squat", sets: S(14, 12, 3) },
      { name: "Lying Leg Curl", sets: S(50, 12, 3) },
      { name: "Pohkeet istuen (seated calf raise)", sets: S(118, 12, 3) }
    ]
  };
  var SPLIT = ["PUSH", "PULL", "LEGS"];
  var defaultPlans = () => Object.fromEntries(
    Object.keys(TEMPLATES).map((k2) => [
      k2,
      TEMPLATES[k2].map((e) => ({
        name: e.name,
        rest: 90,
        sets: e.sets.map((s2) => ({ kg: s2.kg, reps: s2.reps }))
      }))
    ])
  );
  var defaultPlanNames = () => Object.fromEntries(Object.keys(TEMPLATES).map((k2) => [k2, k2]));
  var KGLB = 2.2046226;
  var kgTrim = (n) => (Math.round(n * 10) / 10).toString().replace(/\.0$/, "");
  var toBlocks = (sets) => {
    const blocks = [];
    for (const s2 of sets || []) {
      const last2 = blocks[blocks.length - 1];
      if (last2 && last2.kg === s2.kg && last2.reps === s2.reps) last2.count += 1;
      else blocks.push({ kg: s2.kg, reps: s2.reps, count: 1 });
    }
    return blocks;
  };
  var fromBlocks = (blocks) => blocks.flatMap((b) => Array.from({ length: Math.max(1, b.count) }, () => ({ kg: b.kg, reps: b.reps })));
  var toUnit = (kg, unit2) => unit2 === "lb" ? Math.round((kg || 0) * KGLB * 2) / 2 : kg || 0;
  var fromUnit = (v, unit2) => unit2 === "lb" ? v / KGLB : v;
  var uLbl = (unit2) => unit2 === "lb" ? "lb" : "kg";
  var wShow = (kg, unit2) => kgTrim(toUnit(kg, unit2));
  var progRound1 = (n) => Math.round(n * 10) / 10;
  var progSnap = (kg, step) => Math.max(step, Math.round(kg / step) * step);
  function defaultInc(name, kg) {
    const n = (name || "").toLowerCase();
    if (/cable|lateral|fly|triceps|curl|raise|rear delt|face pull/.test(n)) return 2.5;
    if (/dumbbell|\bdb\b/.test(n)) return 2;
    if (/deadlift|squat|leg press|hip thrust/.test(n) && kg >= 80) return 5;
    if (kg >= 70) return 5;
    return 2.5;
  }
  function evalSession(session, target) {
    const done = (session.sets || []).filter(
      (s2) => s2.done && s2.kg > 0 && s2.reps > 0 && s2.reps <= 100 && s2.rest == null
    );
    if (!done.length) return null;
    const w = Math.max(...done.map((s2) => s2.kg));
    const repsAtW = done.filter((s2) => Math.abs(s2.kg - w) < 1e-6).map((s2) => s2.reps).sort((a2, b) => b - a2);
    const count = repsAtW.length;
    const work = repsAtW.slice(0, target.sets);
    const minReps = work.length ? Math.min(...work) : 0;
    return { w, count, minReps };
  }
  function progressionFor(ex, history) {
    const target = {
      sets: ex.sets || 3,
      low: ex.repLow ?? ex.reps ?? 8,
      high: ex.repHigh ?? ex.reps ?? 8
    };
    const inc = ex.inc || defaultInc(ex.name, ex.kg || 0);
    const hist = (history || []).filter(Boolean);
    if (!hist.length) return { state: "new", kg: ex.kg, inc, target, msg: "Log a session to start tracking." };
    const last2 = evalSession(hist[0], target);
    if (!last2) return { state: "new", kg: ex.kg, inc, target, msg: "Log a full set to start tracking." };
    if (last2.count < target.sets)
      return { state: "hold", kg: last2.w, inc, target, msg: `Finish all ${target.sets} sets to gauge progress.` };
    if (last2.minReps >= target.high) {
      const nextKg = progSnap(last2.w + inc, inc);
      return {
        state: "advance",
        kg: nextKg,
        inc,
        from: last2.w,
        target,
        msg: `Add ${progRound1(nextKg - last2.w)} \u2014 you hit ${target.high}+ on all sets.`
      };
    }
    if (last2.minReps >= target.low)
      return {
        state: "hold",
        kg: last2.w,
        inc,
        target,
        msg: `Same weight \u2014 beat ${last2.minReps} rep${last2.minReps === 1 ? "" : "s"} to move up.`
      };
    let fails = 0;
    for (const s2 of hist) {
      const ev = evalSession(s2, target);
      if (!ev || ev.count < target.sets) break;
      if (ev.w < last2.w - 1e-6) break;
      if (ev.minReps >= target.low) break;
      fails++;
    }
    if (fails >= 3) {
      let cleared = null;
      for (const s2 of hist) {
        const ev = evalSession(s2, target);
        if (ev && ev.count >= target.sets && ev.minReps >= target.high) {
          cleared = ev.w;
          break;
        }
      }
      const drop10 = progSnap(last2.w * 0.9, inc);
      const nextKg = cleared != null && cleared < last2.w ? cleared : drop10;
      return { state: "deload", kg: nextKg, fails, inc, target, msg: `Stalled ${fails}\xD7 \u2014 deload to ${progRound1(nextKg)}.` };
    }
    return { state: "hold", kg: last2.w, inc, target, msg: `Hold \u2014 clear ${target.sets}\xD7${target.low} before adding weight.` };
  }
  function historyFor(name, logs, beforeDate, limit = 8) {
    const key = (name || "").trim().toLowerCase();
    const out = [];
    for (const d of Object.keys(logs || {}).sort().reverse()) {
      if (beforeDate && d >= beforeDate) continue;
      const day = logs[d];
      if (!day) continue;
      const ex = (day.exercises || []).find((e) => (e.name || "").trim().toLowerCase() === key);
      if (!ex || ex.skipped) continue;
      if ((ex.sets || []).some((s2) => s2.rest != null)) continue;
      if (!(ex.sets || []).some((s2) => s2.done)) continue;
      out.push({ date: d, sets: ex.sets });
      if (out.length >= limit) break;
    }
    return out;
  }
  var fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
  var parse = (s2) => {
    const [y2, m, d] = s2.split("-").map(Number);
    return new Date(y2, m - 1, d);
  };
  var addDays = (d, n) => {
    const c2 = new Date(d);
    c2.setDate(c2.getDate() + n);
    return c2;
  };
  var startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7));
  var weekOf = (ds) => fmt(startOfWeek(parse(ds)));
  var niceDate = (s2) => parse(s2).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  var fmtMin = (m) => {
    const neg = m < 0;
    const a2 = Math.abs(m);
    const h = Math.floor(a2 / 60);
    const r2 = a2 % 60;
    const s2 = h ? r2 ? `${h} h ${r2} min` : `${h} h` : `${r2} min`;
    return (neg ? "\u2212" : "") + s2;
  };
  var fmtElapsed = (ms) => {
    const t = Math.max(0, Math.floor(ms / 1e3));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  };
  var _actx = null;
  function _ctx() {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if (_actx.state === "suspended") _actx.resume();
    return _actx;
  }
  function _tone(freq, at, dur, gain = 0.12, type = "sine") {
    try {
      const c2 = _ctx();
      const o = c2.createOscillator();
      const g = c2.createGain();
      o.type = type;
      o.frequency.value = freq;
      const t = c2.currentTime + at;
      g.gain.setValueAtTime(1e-4, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
      g.gain.exponentialRampToValueAtTime(1e-4, t + dur);
      o.connect(g);
      g.connect(c2.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    } catch (e) {
    }
  }
  function beepAndBuzz() {
    _tone(880, 0, 0.16, 0.16);
    _tone(880, 0.22, 0.16, 0.16);
    try {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    } catch (e) {
    }
  }
  function tickSound() {
    _tone(1320, 0, 0.05, 0.06, "square");
  }
  function fanfare(boss = false) {
    const seq = boss ? [523, 659, 784, 1046] : [659, 880];
    seq.forEach((f, i) => _tone(f, i * 0.14, boss ? 0.34 : 0.22, 0.12, "triangle"));
    try {
      if (navigator.vibrate) navigator.vibrate(boss ? [80, 60, 80, 60, 220] : [120]);
    } catch (e) {
    }
  }
  var emptyData = () => ({
    completions: {},
    // "YYYY-MM-DD": { gym?: true, cardio?: true }
    shields: 0,
    shieldsUsed: 0,
    shieldedWeeks: {},
    // weekStart: sessions covered
    milestones: {},
    // { "wk4": true, "wk8": true }
    logs: {},
    // "YYYY-MM-DD": { exercises, cardioMin, cardioKm, startedAt, durationMin }
    prEvents: 0,
    spentMin: 0,
    // PS5 minutes spent
    seeds: {},
    restLen: 90,
    // preferred rest timer seconds (fallback when an exercise has no rest set)
    plans: defaultPlans(),
    // editable PUSH/PULL/LEGS routine (the Workouts tab)
    planNames: defaultPlanNames(),
    // display names for the workouts (renameable)
    unit: "kg",
    // weight unit for the Workouts tab / number pad
    photoDates: [],
    // days a progress photo was taken (thumbs stored separately)
    sideBets: {
      nicotineStart: null,
      // taper start date
      nicotineUse: {},
      // "YYYY-MM-DD": count
      alcoholStart: null,
      alcoholUse: {}
      // "YYYY-MM-DD": drinks
    },
    targets: [
      { id: "t1", name: "Deadlift", kg: 150, reps: 2 },
      { id: "t2", name: "Bench Press", kg: 115, reps: 1 }
    ],
    treadmill: {},
    // "YYYY-MM-DD": km walked at the work treadmill
    checkins: {},
    // "YYYY-MM-DD": { f, s, m, note } heartburn + mood
    recapSeen: null,
    // week-start of the last recap the user dismissed
    stretch: {},
    // "YYYY-MM-DD": routine name — one guided stretch per day
    abs: {},
    // "YYYY-MM-DD": one guided core circuit per day
    absLevel: 1,
    // Core Circuit badge — counts completed sessions
    absLv: {},
    // per-move growth steps — each completion grows the 3 furthest behind
    absEvo: {},
    // per-slot evolution flags — true once the form-II evolution is earned
    trialDays: {},
    // "YYYY-MM-DD": target id — boss trials survived
    trueForms: {},
    // "YYYY-MM-DD": target id — second forms felled
    battleTheme: "forge",
    // battle skin: forge | arcade | souls
    activeFight: null,
    // { kind: "boss"|"gate"|"trial", tid, day, gateKg? }
    createdAt: fmt(/* @__PURE__ */ new Date())
  });
  function buildDailySeries(data, todayStr, n) {
    const sb = data.sideBets || {};
    const out = [];
    for (let i = n - 1; i >= 0; i--) {
      const d = addDays(parse(todayStr), -i);
      const ds = fmt(d);
      out.push({
        label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        nic: (sb.nicotineUse || {})[ds] || 0,
        alc: (sb.alcoholUse || {})[ds] || 0,
        hb: ckComp((data.checkins || {})[ds]),
        mood: ckMood((data.checkins || {})[ds]) != null ? Math.round(ckMood((data.checkins || {})[ds]) * 1.5 * 10) / 10 : null,
        km: Math.round(((data.treadmill || {})[ds] || 0) * 10) / 10
      });
    }
    return out;
  }
  function buildMonthlySeries(data, todayStr) {
    const sb = data.sideBets || {};
    const today = parse(todayStr);
    const out = [];
    for (let i = 11; i >= 0; i--) {
      const mDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const y2 = mDate.getFullYear();
      const mo = mDate.getMonth();
      const isCurrent = mo === today.getMonth() && y2 === today.getFullYear();
      const daysIn = isCurrent ? today.getDate() : new Date(y2, mo + 1, 0).getDate();
      let nic = 0;
      let alc = 0;
      let km = 0;
      let hbSum = 0;
      let hbN = 0;
      let mSum = 0;
      let mN = 0;
      for (let d = 1; d <= daysIn; d++) {
        const ds = fmt(new Date(y2, mo, d));
        nic += (sb.nicotineUse || {})[ds] || 0;
        alc += (sb.alcoholUse || {})[ds] || 0;
        km += (data.treadmill || {})[ds] || 0;
        const hb = ckComp((data.checkins || {})[ds]);
        if (hb != null) {
          hbSum += hb;
          hbN += 1;
        }
        const md = ckMood((data.checkins || {})[ds]);
        if (md != null) {
          mSum += md;
          mN += 1;
        }
      }
      out.push({
        label: mDate.toLocaleDateString("en-GB", { month: "short" }),
        nic: Math.round(nic / daysIn * 10) / 10,
        alc: Math.round(alc / daysIn * 10) / 10,
        km: Math.round(km / daysIn * 10) / 10,
        hb: hbN ? Math.round(hbSum / hbN * 10) / 10 : null,
        mood: mN ? Math.round(mSum / mN * 1.5 * 10) / 10 : null
      });
    }
    return out;
  }
  var WALK_MILESTONES = [
    { km: 4, label: "the Golden Gate Bridge, there and back" },
    { km: 10, label: "a 10K race" },
    { km: 21, label: "a half marathon" },
    { km: 42, label: "a full marathon" },
    { km: 82, label: "the Panama Canal" },
    { km: 135, label: "Hadrian's Wall, coast to coast" },
    { km: 180, label: "Helsinki \u2192 Tampere" },
    { km: 346, label: "the River Thames, source to sea" },
    { km: 446, label: "the Grand Canyon, end to end" },
    { km: 610, label: "Helsinki \u2192 Oulu" },
    { km: 780, label: "the Camino de Santiago" },
    { km: 1157, label: "Finland, top to bottom" },
    { km: 8850, label: "the Great Wall of China" }
  ];
  var daysBetween = (a2, b) => Math.round((parse(b) - parse(a2)) / 864e5);
  function habitStats(startDs, useMap, todayStr, limitAt, graceDays, bankCap = 0) {
    const out = {
      active: !!startDs,
      todayCount: 0,
      todayLimit: 0,
      taperLeft: 0,
      // days until the next step-down
      streak: 0,
      best: 0,
      cleanDays: 0,
      slips: 0,
      // post-grace days over the (banked) limit
      bank: 0
    };
    if (!startDs) return out;
    const limitFor = (ds) => limitAt(startDs, ds);
    out.todayCount = useMap[todayStr] || 0;
    const curLimit = limitFor(todayStr);
    out.taperLeft = (() => {
      for (let i = 1; i <= 366; i++) {
        if (limitFor(fmt(addDays(parse(todayStr), i))) < curLimit) return i;
      }
      return 0;
    })();
    let run = 0;
    let bank = 0;
    let d = parse(startDs);
    const yest = addDays(parse(todayStr), -1);
    while (d <= yest) {
      const ds = fmt(d);
      const base = limitFor(ds);
      const use = useMap[ds] || 0;
      if (use <= base) {
        bank = Math.min(bankCap, bank + (base - use));
        out.cleanDays += 1;
        run += 1;
        if (run > out.best) out.best = run;
      } else if (use - base <= bank) {
        bank -= use - base;
        out.cleanDays += 1;
        run += 1;
        if (run > out.best) out.best = run;
      } else {
        bank = 0;
        run = 0;
        if (daysBetween(startDs, ds) >= graceDays) out.slips += 1;
      }
      d = addDays(d, 1);
    }
    out.bank = bank;
    out.todayLimit = curLimit + bank;
    if (out.todayCount > out.todayLimit && daysBetween(startDs, todayStr) >= graceDays)
      out.slips += 1;
    out.streak = out.todayCount > out.todayLimit ? 0 : run;
    return out;
  }
  function sideStats(data, todayStr) {
    data = { ...data, logs: WorkoutCore.flattenedLogs(data.logs) };
    const sb = data.sideBets || {};
    const ended = data.sideBetsEnded && data.sideBetsEnded < todayStr ? data.sideBetsEnded : todayStr;
    const out = {
      nic: {
        ...habitStats(
          sb.nicotineStart,
          sb.nicotineUse || {},
          ended,
          nicLimitAt,
          NIC_GRACE_DAYS
        ),
        active: !!sb.nicotineStart && !data.sideBetsEnded
      },
      alc: {
        ...habitStats(
          sb.alcoholStart,
          sb.alcoholUse || {},
          ended,
          alcLimitAt,
          ALC_PLAN.taperDays,
          ALC_PLAN.bankCap
        ),
        active: !!sb.alcoholStart && !data.sideBetsEnded
      },
      targets: [],
      targetsAchieved: 0
    };
    for (const t of data.targets || []) {
      let achievedDate = null;
      for (const date2 of Object.keys(data.logs || {}).sort()) {
        for (const ex of data.logs[date2].exercises || []) {
          if (ex.name.trim().toLowerCase() !== t.name.trim().toLowerCase()) continue;
          if (countableSets(ex).some((s2) => s2.kg >= t.kg && s2.reps >= t.reps)) {
            achievedDate = date2;
            break;
          }
        }
        if (achievedDate) break;
      }
      out.targets.push({ ...t, achievedDate });
      if (achievedDate) out.targetsAchieved += 1;
    }
    return out;
  }
  function downscalePhoto(file, maxDim = 480, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  function migrate(d) {
    const m = { ...emptyData(), ...d };
    m.completions = { ...d.completions || {} };
    for (const ds of Object.keys(m.completions)) {
      const v = m.completions[ds];
      if (v === true) {
        m.completions[ds] = parse(ds).getDay() === 6 ? { cardio: true } : { gym: true };
      }
    }
    if (d.bonus) {
      for (const ds of Object.keys(d.bonus)) {
        const cur = m.completions[ds] || {};
        m.completions[ds] = d.bonus[ds] === "cardio" ? { ...cur, cardio: true } : { ...cur, gym: true };
      }
    }
    delete m.bonus;
    delete m.shielded;
    if (!m.shieldedWeeks) m.shieldedWeeks = {};
    if (!m.bossBenchAdded) {
      if (Array.isArray(m.targets) && !m.targets.some((t) => t.id === "t2")) {
        m.targets = [...m.targets, { id: "t2", name: "Bench Press", kg: 115, reps: 1 }];
      }
      m.bossBenchAdded = true;
    }
    const sb = d.sideBets || {};
    m.sideBets = {
      nicotineStart: sb.nicotineStart || null,
      nicotineUse: sb.nicotineUse || {},
      alcoholStart: sb.alcoholStart || null,
      alcoholUse: sb.alcoholUse || (Array.isArray(sb.alcoholDays) ? Object.fromEntries(sb.alcoholDays.map((ds) => [ds, 1])) : {})
    };
    m.seeds = { ...m.seeds || {} };
    m.trialDays = { ...m.trialDays || {} };
    if (!m.trueForms) m.trueForms = {};
    if (!BB_THEMES.includes(m.battleTheme)) m.battleTheme = "forge";
    if (!m.seeds["rest-ex-90"]) {
      m.restExLen = 90;
      m.seeds["rest-ex-90"] = true;
    }
    if (!m.seeds["nightmare-2026-07-18"]) {
      m.trialDays["2026-07-18"] = "t2";
      m.seeds["nightmare-2026-07-18"] = true;
    }
    if (!m.seeds["backlog-2026-07-18"]) {
      const c2 = m.completions["2026-07-18"] || {};
      m.completions["2026-07-18"] = { ...c2, gym: true, cardio: true };
      const g = Object.keys(m.completions).filter((d2) => m.completions[d2].gym).length;
      m.splitShift = ((2 - g) % 3 + 3) % 3;
      m.seeds["backlog-2026-07-18"] = true;
    }
    if (m.splitShift == null) m.splitShift = 0;
    if (!m.plans || typeof m.plans !== "object") m.plans = defaultPlans();
    if (!m.planNames || typeof m.planNames !== "object") m.planNames = defaultPlanNames();
    for (const k2 of Object.keys(defaultPlanNames())) if (!m.planNames[k2]) m.planNames[k2] = k2;
    if (m.unit !== "kg" && m.unit !== "lb") m.unit = "kg";
    if (!(m.absLevel >= 1)) m.absLevel = 1;
    if (!m.sideBetsEnded) m.sideBetsEnded = "2026-07-27";
    if (!m.absLv || typeof m.absLv !== "object") m.absLv = {};
    if (!m.absEvo || typeof m.absEvo !== "object") m.absEvo = {};
    for (const k2 of Object.keys(m.plans || {})) {
      for (const ex of m.plans[k2] || []) {
        const blocks = toBlocks(ex.sets || []);
        const top = blocks[0] || { kg: 0, reps: 8 };
        if (ex.repHigh == null) ex.repHigh = top.reps;
        if (ex.inc == null) ex.inc = defaultInc(ex.name, top.kg);
      }
    }
    return m;
  }
  var SEED_DAY = "2026-07-14";
  function applySeed(d) {
    const flag = "push-" + SEED_DAY;
    if (d.seeds && d.seeds[flag]) return d;
    const next = {
      ...d,
      completions: { ...d.completions },
      logs: { ...d.logs },
      seeds: { ...d.seeds || {} }
    };
    const day = { exercises: [], ...next.logs[SEED_DAY] || {} };
    day.exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
    for (const t of TEMPLATES.PUSH) {
      if (!day.exercises.some((e) => e.name.toLowerCase() === t.name.toLowerCase()))
        day.exercises.push({ name: t.name, sets: t.sets.map((s2) => ({ ...s2 })) });
    }
    next.logs[SEED_DAY] = day;
    next.completions[SEED_DAY] = { ...next.completions[SEED_DAY] || {}, gym: true };
    next.seeds[flag] = true;
    if (!REST_OPTS.includes(next.restLen)) next.restLen = 90;
    if (!REST_EX_OPTS.includes(next.restExLen)) next.restExLen = 150;
    return next;
  }
  var S3 = (kg, reps, n) => Array.from({ length: n }, () => ({ kg, reps, done: true }));
  var REAL_SESSIONS = {
    "2026-07-14": {
      durationMin: 50,
      exercises: [
        { name: "Incline Dumbbell Bench Press", sets: [...S3(28, 8, 3), ...S3(18, 8, 3)] },
        { name: "Barbell Bench Press", sets: S3(50, 10, 3) },
        { name: "Dumbbell Press", sets: S3(16, 8, 3) },
        { name: "Low Cable One-Arm Lateral Raise", sets: S3(5, 10, 3) },
        { name: "Cable Fly", sets: S3(7.5, 10, 3) },
        { name: "Standing Low Cable Triceps Extension", sets: S3(7.5, 12, 3) }
      ]
    },
    "2026-07-15": {
      durationMin: 27,
      exercises: [
        { name: "Chin-Up", sets: [{ kg: 0, reps: 4, done: true }, { kg: 0, reps: 3, done: true }, { kg: 0, reps: 3, done: true }] },
        { name: "Barbell Romanian Deadlift", sets: [{ kg: 80, reps: 1, done: true }, { kg: 110, reps: 8, done: true }, { kg: 110, reps: 8, done: true }] },
        { name: "Lat Pull-Down", sets: [{ kg: 50, reps: 8, done: true }, { kg: 50, reps: 6, done: true }, { kg: 50, reps: 6, done: true }] },
        { name: "One Arm Dumbbell Row", sets: S3(12.5, 8, 3) },
        { name: "Alternating Incline Dumbbell Curl", sets: [{ kg: 7.5, reps: 10, done: true }, { kg: 10, reps: 8, done: true }, { kg: 7.5, reps: 6, done: true }] },
        { name: "Dumbbell Shrug", sets: S3(12.5, 10, 3) }
      ]
    }
  };
  function applyRealSessions(d) {
    const flag = "real-sessions-v2";
    if (d.seeds && d.seeds[flag]) return d;
    const next = {
      ...d,
      logs: { ...d.logs },
      completions: { ...d.completions },
      seeds: { ...d.seeds || {}, [flag]: true }
    };
    for (const [ds, log2] of Object.entries(REAL_SESSIONS)) {
      next.logs[ds] = JSON.parse(JSON.stringify(log2));
      next.completions[ds] = { ...next.completions[ds] || {}, gym: true };
    }
    return next;
  }
  function applyUnseed(d) {
    const flag = "unseed3-" + SEED_DAY;
    if (d.seeds && d.seeds[flag]) return d;
    const next = {
      ...d,
      completions: { ...d.completions },
      logs: { ...d.logs },
      seeds: { ...d.seeds || {}, [flag]: true }
    };
    delete next.logs[SEED_DAY];
    delete next.completions[SEED_DAY];
    return next;
  }
  function weekRecords(data, todayStr) {
    const comps = data.completions || {};
    const dates = Object.keys(comps).sort();
    if (dates.length === 0) return [];
    const curW = startOfWeek(parse(todayStr));
    let w = startOfWeek(parse(dates[0]));
    if (w > curW) return [];
    const recs = [];
    while (w <= curW) {
      const ws = fmt(w);
      const gymDates = [];
      const cardioDates = [];
      for (let i = 0; i < 7; i++) {
        const ds = fmt(addDays(w, i));
        const c2 = comps[ds];
        if (c2 && c2.gym) gymDates.push(ds);
        if (c2 && c2.cardio) cardioDates.push(ds);
      }
      const q = quotaFor(ws);
      const shortfall = Math.max(0, q.gym - gymDates.length) + Math.max(0, q.cardio - cardioDates.length);
      const shieldUsed = (data.shieldedWeeks || {})[ws] || 0;
      recs.push({
        ws,
        qg: q.gym,
        qc: q.cardio,
        gymDates,
        cardioDates,
        gym: gymDates.length,
        cardio: cardioDates.length,
        shortfall,
        shieldUsed,
        perfect: shortfall === 0,
        met: shortfall === 0 || shieldUsed >= shortfall,
        isCurrent: ws === fmt(curW)
      });
      w = addDays(w, 7);
    }
    return recs;
  }
  function reconcile(data, todayStr) {
    const next = {
      ...data,
      shieldedWeeks: { ...data.shieldedWeeks || {} },
      milestones: { ...data.milestones || {} }
    };
    let run = 0;
    for (const r2 of weekRecords(next, todayStr)) {
      if (r2.isCurrent) {
        if (r2.met) run += 1;
        break;
      }
      let eff = r2.met || !!next.shieldedWeeks[r2.ws];
      if (!eff && r2.shortfall === 1 && next.shields > 0 && run > 0) {
        next.shieldedWeeks[r2.ws] = 1;
        next.shields -= 1;
        next.shieldsUsed += 1;
        eff = true;
      }
      run = eff ? run + 1 : 0;
    }
    for (const k2 of Object.keys(next.milestones)) {
      if (!k2.startsWith("wk")) continue;
      const m = parseInt(k2.slice(2), 10);
      if (!isNaN(m) && m > run) delete next.milestones[k2];
    }
    return next;
  }
  function prMapFrom(logs) {
    const map3 = {};
    for (const date2 of Object.keys(logs).sort()) {
      for (const ex of logs[date2].exercises || []) {
        const k2 = ex.exerciseId || WorkoutCore.idFor(ex.name);
        for (const s2 of countableSets(ex)) {
          if (!map3[k2] || (WorkoutCore.loadType(ex)==='assisted' ? s2.kg < map3[k2].kg : s2.kg > map3[k2].kg))
            map3[k2] = { name: ex.name.trim()+(WorkoutCore.loadType(ex)==='assisted'?' (assistance)':''), kg: s2.kg, reps: s2.reps, date: date2 };
        }
      }
    }
    return map3;
  }
  function computeStats(data, todayStr) {
    const completedSessions = WorkoutCore.allSessions(data.logs).filter(s => (s.durationMin || s.status === 'completed') && (s.exercises || []).some(e=>countableSets(e).length)).length;
    data = { ...data, logs: WorkoutCore.flattenedLogs(data.logs) };
    const prMap = prMapFrom(data.logs);
    let totalSets = 0;
    for (const date2 of Object.keys(data.logs)) {
      for (const ex of data.logs[date2].exercises || []) totalSets += countableSets(ex).length;
    }
    const distinctExercises = Object.keys(prMap).length;
    const photoCount = (data.photoDates || []).length;
    const side = sideStats(data, todayStr);
    const recs = weekRecords(data, todayStr);
    let weekStreak = 0;
    let bestWeekStreak = 0;
    let walkTierXp = 0;
    for (const km of Object.values(data.treadmill || {})) {
      const wt = walkTierFor(km);
      if (wt) walkTierXp += wt.xp;
    }
    const stretchDays = Object.keys(data.stretch || {}).length;
    const absDays = Object.keys(data.abs || {}).length;
    const trialCount = Object.keys(data.trialDays || {}).length;
    const trueFormCount = Object.keys(data.trueForms || {}).length;
    const gatesBroken = (data.targets || []).filter((t) => t.gateBroken).length;
    let xp = totalSets * XP_PER_SET + photoCount * PHOTO_XP + walkTierXp + Object.values(data.cardioBonus || {}).reduce((a2, b) => a2 + b, 0) + stretchDays * STRETCH_XP + absDays * ABS_XP + trialCount * TRIAL_XP + trueFormCount * TRUEFORM_XP + Object.values(data.collectorLog || {}).reduce((a2, b) => a2 + b, 0) + gatesBroken * GATE_XP + (side.nic.cleanDays + side.alc.cleanDays) * SIDE_DAY_XP + side.targetsAchieved * TARGET_XP - (side.nic.slips + side.alc.slips) * SLIP_XP;
    let gymCount = 0;
    let cardioCount = 0;
    let extras = 0;
    let perfectWeeks = 0;
    let perfectRun = 0;
    let bestPerfectRun = 0;
    for (const r2 of recs) {
      gymCount += r2.gym;
      cardioCount += r2.cardio;
      const qg = Math.min(r2.gym, r2.qg);
      const qc = Math.min(r2.cardio, r2.qc);
      const eg = r2.gym - qg;
      const ec = r2.cardio - qc;
      extras += eg + ec;
      xp += qg * XP_FOR.gym + eg * XP_EXTRA.gym + qc * XP_FOR.cardio + ec * XP_EXTRA.cardio;
      if (r2.perfect) {
        xp += WEEK_BONUS_XP;
        perfectWeeks += 1;
        perfectRun += 1;
        if (perfectRun > bestPerfectRun) bestPerfectRun = perfectRun;
      } else if (!r2.isCurrent) {
        perfectRun = 0;
      }
      if (r2.met) {
        weekStreak += 1;
        if (weekStreak > bestWeekStreak) bestWeekStreak = weekStreak;
      } else if (!r2.isCurrent) {
        weekStreak = 0;
      }
    }
    return {
      weekStreak,
      bestWeekStreak,
      xp: Math.max(0, xp + (data.legacyRewardSetCredit || 0) * XP_PER_SET),
      totalSessions: gymCount + cardioCount,
      recordedStrengthSessions: completedSessions,
      gymCount,
      cardioCount,
      extras,
      perfectWeeks,
      bestPerfectRun,
      weekHistory: recs,
      totalSets,
      distinctExercises,
      prMap,
      photoCount,
      side
    };
  }
  function xpInWindow(data, fromStr, toStr) {
    data = { ...data, logs: WorkoutCore.flattenedLogs(data.logs) };
    let sets = 0;
    for (const date2 of Object.keys(data.logs)) {
      if (date2 >= fromStr && date2 <= toStr) {
        for (const ex of data.logs[date2].exercises || []) sets += countableSets(ex).length;
      }
    }
    let xp = (sets + Object.entries(data.legacyRewardSetsByDate||{}).filter(([d])=>d>=fromStr&&d<=toStr).reduce((n,[,v])=>n+v,0)) * XP_PER_SET;
    for (const d of data.photoDates || []) {
      if (d >= fromStr && d <= toStr) xp += PHOTO_XP;
    }
    for (const [d, km] of Object.entries(data.treadmill || {})) {
      if (d >= fromStr && d <= toStr) {
        const wt = walkTierFor(km);
        if (wt) xp += wt.xp;
      }
    }
    for (const [d, b] of Object.entries(data.cardioBonus || {})) {
      if (d >= fromStr && d <= toStr) xp += b;
    }
    for (const d of Object.keys(data.stretch || {})) {
      if (d >= fromStr && d <= toStr) xp += STRETCH_XP;
    }
    for (const d of Object.keys(data.abs || {})) {
      if (d >= fromStr && d <= toStr) xp += ABS_XP;
    }
    for (const d of Object.keys(data.trialDays || {})) {
      if (d >= fromStr && d <= toStr) xp += TRIAL_XP;
    }
    for (const [d, v] of Object.entries(data.collectorLog || {})) {
      if (d >= fromStr && d <= toStr) xp += v;
    }
    for (const t of data.targets || []) {
      if (t.gateBroken && t.gateBroken >= fromStr && t.gateBroken <= toStr) xp += GATE_XP;
    }
    const sb = data.sideBets || {};
    const habitWindowXp = (startDs, useMap, limitAt, graceDays, bankCap = 0) => {
      if (!startDs) return 0;
      let n = 0;
      let slips = 0;
      let bank = 0;
      let d = parse(startDs);
      const end = parse(data.sideBetsEnded && data.sideBetsEnded < toStr ? data.sideBetsEnded : toStr);
      while (d < end) {
        const ds = fmt(d);
        const base = limitAt(startDs, ds);
        const use = useMap[ds] || 0;
        let within;
        if (use <= base) {
          bank = Math.min(bankCap, bank + (base - use));
          within = true;
        } else if (use - base <= bank) {
          bank -= use - base;
          within = true;
        } else {
          bank = 0;
          within = false;
        }
        if (ds >= fromStr) {
          if (within) n += 1;
          else if (daysBetween(startDs, ds) >= graceDays) slips += 1;
        }
        d = addDays(d, 1);
      }
      return n * SIDE_DAY_XP - slips * SLIP_XP;
    };
    xp += habitWindowXp(sb.nicotineStart, sb.nicotineUse || {}, nicLimitAt, NIC_GRACE_DAYS);
    xp += habitWindowXp(sb.alcoholStart, sb.alcoholUse || {}, alcLimitAt, ALC_PLAN.taperDays, ALC_PLAN.bankCap);
    for (const t of sideStats(data, toStr).targets) {
      if (t.achievedDate && t.achievedDate >= fromStr && t.achievedDate <= toStr)
        xp += TARGET_XP;
    }
    for (const r2 of weekRecords(data, toStr)) {
      r2.gymDates.forEach((d, i) => {
        if (d >= fromStr && d <= toStr)
          xp += i < r2.qg ? XP_FOR.gym : XP_EXTRA.gym;
      });
      r2.cardioDates.forEach((d, i) => {
        if (d >= fromStr && d <= toStr)
          xp += i < r2.qc ? XP_FOR.cardio : XP_EXTRA.cardio;
      });
      const weekEnd = fmt(addDays(parse(r2.ws), 6));
      if (r2.perfect && r2.ws >= fromStr && weekEnd <= toStr) xp += WEEK_BONUS_XP;
    }
    return Math.max(0, xp);
  }
  function CelebCard({ b }) {
    const { msg, xpBefore = 0, amount = 0 } = typeof b === "string" ? { msg: b } : b;
    const title = msg.replace(/\s*\+\d+\s*XP.*$/i, "").trim();
    const after = xpBefore + amount;
    const lvB = levelFor(xpBefore);
    const lvA = levelFor(after);
    const cross = amount > 0 && lvA.cur !== lvB.cur;
    const [fill, setFill] = (0, import_react41.useState)(xpBefore);
    const [ph2, setPh2] = (0, import_react41.useState)(false);
    (0, import_react41.useEffect)(() => {
      setFill(xpBefore);
      setPh2(false);
      const h1 = setTimeout(() => setFill(cross ? lvA.cur.xp : after), 900);
      const h2 = cross ? setTimeout(() => {
        setPh2(true);
        setFill(after);
      }, 3400) : null;
      return () => {
        clearTimeout(h1);
        h2 && clearTimeout(h2);
      };
    }, [b]);
    const lvShown = ph2 ? lvA : lvB;
    const span = lvShown.next ? lvShown.next.xp - lvShown.cur.xp : 1;
    const into = Math.max(0, Math.min(span, fill - lvShown.cur.xp));
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `celeb-card ${ph2 ? "lvup" : ""}`, children: [
      ph2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cc-slam", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cc-lvup", children: "LEVEL UP" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cc-lvname", children: lvA.cur.title.toUpperCase() })
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cc-title", children: title }),
      amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cc-xp", children: [
        "+",
        amount,
        " XP"
      ] }),
      amount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar-top", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: ph2 ? { color: "var(--ember)" } : null, children: lvShown.cur.title.toUpperCase() }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
            Math.round(into),
            " / ",
            span
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cf-bar-track", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.min(100, into / span * 100)}%`, transition: ph2 ? "width 1s cubic-bezier(.25,.6,.3,1)" : void 0 } }) }),
        lvShown.next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar-next", children: [
          lvShown.next.xp - Math.round(fill),
          " XP TO ",
          lvShown.next.title.toUpperCase()
        ] })
      ] })
    ] });
  }
  var BOSS_IMG = "";
  function BossFace({ img, emoji, size = 26, className = "" }) {
    const [ok, setOk] = (0, import_react41.useState)(true);
    return ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "img",
      {
        src: BOSS_IMG + img,
        alt: "",
        className,
        style: { width: size, height: size, objectFit: "contain", verticalAlign: "middle", display: "inline-block" },
        onError: () => setOk(false)
      }
    ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className, children: emoji });
  }
  function levelFor(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i += 1;
    const cur = LEVELS[i];
    const next = LEVELS[i + 1] || null;
    const pct = next ? Math.min(100, Math.round((xp - cur.xp) / (next.xp - cur.xp) * 100)) : 100;
    return { index: i + 1, cur, title: cur.title, next, pct };
  }
  function StepInput({ label, value, onChange, steps }) {
    const bump = (d) => {
      const cur = parseFloat(String(value).replace(",", ".")) || 0;
      const next = Math.max(0, Math.round((cur + d) * 4) / 4);
      onChange(String(next));
    };
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "field", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "field-label", children: label }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "stepper", children: [
        steps.map((s2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "step-btn", onClick: () => bump(-s2), children: [
          "\u2212",
          s2
        ] }, `-${s2}`)),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "input",
          {
            className: "inp step-inp",
            type: "text",
            inputMode: "decimal",
            value,
            onChange: (e) => onChange(e.target.value)
          }
        ),
        [...steps].reverse().map((s2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "step-btn", onClick: () => bump(s2), children: [
          "+",
          s2
        ] }, `+${s2}`))
      ] })
    ] });
  }
  function useCountUp(target, dur = 900) {
    const [val, setVal] = (0, import_react41.useState)(target);
    const fromRef = (0, import_react41.useRef)(target);
    const rafRef = (0, import_react41.useRef)(0);
    (0, import_react41.useEffect)(() => {
      const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const from = fromRef.current;
      const to = target;
      if (reduce || from === to) {
        setVal(to);
        fromRef.current = to;
        return;
      }
      const t02 = performance.now();
      cancelAnimationFrame(rafRef.current);
      const tick = (now) => {
        const p = Math.min(1, (now - t02) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        setVal(from + (to - from) * e);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else fromRef.current = to;
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }, [target, dur]);
    (0, import_react41.useEffect)(() => () => cancelAnimationFrame(rafRef.current), []);
    return val;
  }
  var BBBoundary = class extends import_react41.default.Component {
    constructor(p) {
      super(p);
      this.state = { err: null };
    }
    static getDerivedStateFromError(err) {
      return { err };
    }
    render() {
      if (this.state.err)
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { style: {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          background: "#5c1a12",
          color: "#ffd9d0",
          font: "12px ui-monospace,monospace",
          padding: "10px 12px",
          whiteSpace: "pre-wrap"
        }, children: [
          "\u26A0 overlay crashed: ",
          String(this.state.err && this.state.err.message)
        ] });
      return this.props.children;
    }
  };
  function WorkoutSession({
    log: log2,
    now,
    restEnd,
    restTotal,
    readyAt,
    splitName,
    unit: unit2,
    onLog,
    onSkipRest,
    onFinish,
    onClose,
    onRename,
    onRenameWorkout,
    onAdd,
    lastFor,
    recentNames,
    progFor
  }) {
    const exs = log2.exercises || [];
    const openExs = exs.map((e, i) => ({ e, i, left: e.skipped ? 0 : e.sets.filter((s2) => !s2.done).length })).filter((x2) => x2.left > 0);
    const doneSets = exs.reduce((a2, e) => a2 + e.sets.filter((s2) => s2.done).length, 0);
    const totalSets = exs.reduce((a2, e) => a2 + (e.skipped ? e.sets.filter((s2) => s2.done).length : e.sets.length), 0);
    const allDone = openExs.length === 0;
    const [scene, setScene] = (0, import_react41.useState)(doneSets === 0 ? "overview" : "work");
    const [curExI, setCurExI] = (0, import_react41.useState)(openExs.length ? openExs[0].i : 0);
    const [pendingChoose, setPendingChoose] = (0, import_react41.useState)(false);
    const [selNext, setSelNext] = (0, import_react41.useState)(null);
    const [startAt, setStartAt] = (0, import_react41.useState)(null);
    const [edit, setEdit] = (0, import_react41.useState)(null);
    const [ssFlash, setSsFlash] = (0, import_react41.useState)(false);
    const [editor, setEditor] = (0, import_react41.useState)(null);
    const [edVal, setEdVal] = (0, import_react41.useState)("");
    const [edKind,setEdKind]=(0,import_react41.useState)('rename');
    const [edFuture,setEdFuture]=(0,import_react41.useState)(true);
    const resting = !!(restEnd && now < restEnd);
    const ringPct = resting ? Math.max(0, Math.min(1, (restEnd - now) / 1e3 / Math.max(1, restTotal))) : 0;
    const armed = !resting && !!readyAt;
    const curEx = exs[curExI] && !exs[curExI].skipped ? exs[curExI] : null;
    const si = curEx ? curEx.sets.findIndex((s2) => !s2.done) : -1;
    const cur = si >= 0 && curEx ? curEx.sets[si] : null;
    const editKey = `${curExI}:${si}`;
    const prog = curEx && progFor ? progFor(curEx.name) : null;
    const baseKg = cur ? cur.kg : 0; // Suggestions never silently change the load.
    const dispV = edit && edit.key === editKey ? edit.v : toUnit(baseKg, unit2);
    const repsV = edit && edit.key === editKey ? edit.reps : cur ? cur.reps : 0;
    const bump = (dv, dr) => setEdit({
      key: editKey,
      v: Math.max(0, Math.round((dispV + dv) * 2) / 2),
      reps: Math.max(1, repsV + dr)
    });
    const stepBig = unit2 === "lb" ? [10, 5, 2.5] : [5, 2.5, 1];
    (0, import_react41.useEffect)(() => {
      if (scene !== "work") return;
      if (allDone) return;
      if (!curEx) {
        setCurExI(openExs[0].i);setPendingChoose(false);setEdit(null);
      } else if (si < 0) {
        if (resting) setPendingChoose(true);
        else setCurExI(openExs[0].i);
      }
    }, [scene, allDone, curExI, si, resting, openExs.length]);
    (0, import_react41.useEffect)(() => {
      if (!resting && pendingChoose) {
        const tgt = selNext != null ? selNext : openExs.length ? openExs[0].i : null;
        if (tgt != null) goNext(tgt);
        else setPendingChoose(false);
      }
    }, [resting]);
    const ssPartnerIdx = (idx) => {
      const e = exs[idx];
      if (!e || !e.ss) return -1;
      return exs.findIndex((x2, k2) => k2 !== idx && x2.ss === e.ss && !x2.skipped);
    };
    const logIt = () => {
      if (!cur) return;
      const wasLastOfEx = curEx.sets.filter((s2) => !s2.done).length === 1;
      const pIdx = ssPartnerIdx(curExI);
      onLog(curExI, si, fromUnit(dispV, unit2), repsV);
      setEdit(null);
      if (pIdx >= 0) {
        const p = exs[pIdx];
        const myDone = curEx.sets.filter((s2) => s2.done).length + 1;
        const pDone = p.sets.filter((s2) => s2.done).length;
        const pUndone = p.sets.length - pDone;
        if (pUndone > 0 && pDone < myDone) {
          setCurExI(pIdx);
          setSsFlash(true);
          return;
        }
        if (pUndone > 0) {
          setCurExI(pIdx);
          setSsFlash(false);
          return;
        }
      }
      setSsFlash(false);
      if (wasLastOfEx) {
        setPendingChoose(true);
        setSelNext(null);
      }
    };
    const pickable = openExs.filter((x2) => x2.i !== curExI || x2.left > 0);
    const goNext = (i) => {
      setCurExI(i);
      setPendingChoose(false);
      setSelNext(null);
      setSsFlash(false);
    };
    const dots = curEx ? curEx.sets.map((s2, k2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `ws-dot ${s2.done ? "on" : ""}` }, k2)) : null;
    const CIRC = 2 * Math.PI * 54;
    if (editor) {
      const isRename = editor.mode === "rename";
      const isWorkout=editor.mode==='workout';
      const chips = (recentNames || []).filter((n) => !curEx || n.toLowerCase() !== curEx.name.toLowerCase()).slice(0, 6);
      const commit = () => {
        const v = edVal.trim();
        if (!v) return;
        if(isWorkout){onRenameWorkout(v,edFuture);}
        else if (isRename) {
          if(onRename(curExI, v,{kind:edKind,future:edFuture})===false)return;
        } else {
          onAdd(v,edFuture);
          setCurExI(exs.length);
          setPendingChoose(false);
          setSelNext(null);
          onSkipRest();
        }
        setEditor(null);
      };
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-x", onClick: onClose, "aria-label": "Minimize session", children: "\u2715" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-screen ws-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-ed", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { children: isWorkout?'RENAME WORKOUT':isRename ? "EDIT EXERCISE" : "ADD EXERCISE" }),
          isRename && import_jsx_runtime.jsxs('label',{className:'safe-field',children:['Change type',import_jsx_runtime.jsxs('select',{value:edKind,onChange:e=>setEdKind(e.target.value),children:[import_jsx_runtime.jsx('option',{value:'rename',children:'Rename — same exercise'}),import_jsx_runtime.jsx('option',{value:'replace',children:'Replace — different exercise'})]})]}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              className: "ws-edin",
              value: edVal,
              placeholder: "e.g. Lateral Raise",
              autoComplete: "off",
              onChange: (e) => setEdVal(e.target.value)
            }
          ),
          !isWorkout && chips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-edchips", children: chips.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => {setEdVal(n);setEdKind('replace');}, children: n }, n)) }),
          import_jsx_runtime.jsxs('label',{className:'safe-field',children:[import_jsx_runtime.jsx('input',{type:'checkbox',checked:edFuture,onChange:e=>setEdFuture(e.target.checked)}),'Use this change in future workouts']}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-edbtns", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-ghost", onClick: () => setEditor(null), children: isRename ? "CANCEL" : "BACK" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-cta", onClick: commit, children: isRename || isWorkout ? "SAVE" : "ADD & GO" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-ednote", children: isWorkout?'The workout keeps its identity, so comparisons remain correct.':isRename ? "Rename preserves this exercise’s history. Replace keeps completed sets under the original exercise and creates a separate replacement." : "Known lifts use your last completed sets. For a new exercise, enter an appropriate starting weight." })
        ] }) })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-x", onClick: onClose, "aria-label": "Minimize session", children: "\u2715" }),
      import_jsx_runtime.jsx('button',{className:'ws-rename-workout',onClick:()=>{setEdVal(splitName);setEditor({mode:'workout'});},children:'Rename workout'}),
      scene === "overview" && (() => {
        const rows = exs.map((e, idx) => ({ e, idx })).filter((o) => !o.e.skipped);
        const startIdx = startAt != null ? startAt : rows[0] ? rows[0].idx : 0;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-screen ws-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-eyebrow", children: "TODAY" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-day", children: [
            splitName,
            " DAY"
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-chtitle", children: "MACHINE BUSY? TAP A LIFT TO START THERE" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-list", children: rows.map(({ e, idx }, k2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: `ws-row pick ${startIdx === idx ? "sel" : ""}`,
              style: { animationDelay: `${0.08 + k2 * 0.08}s` },
              onClick: () => setStartAt(idx),
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ws-ex", children: [
                  e.ss ? "\u26D3 " : "",
                  e.name
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ws-plan", children: [
                  e.sets.length,
                  " \xD7 ",
                  e.sets[0] ? `${wShow(e.sets[0].kg, unit2)} ${uLbl(unit2)} \xD7 ${e.sets[0].reps}` : ""
                ] })
              ]
            },
            idx
          )) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-foot", style: { marginTop: 26 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-cta", onClick: () => {
            setCurExI(startIdx);
            setScene("work");
          }, children: "START WORKOUT" }) })
        ] });
      })(),
      scene === "work" && allDone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-screen ws-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-day", style: { fontSize: 34 }, children: "ALL SETS DONE" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-plan", style: { marginTop: 8 }, children: [
          doneSets,
          " sets in the book"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-foot", style: { marginTop: 30 }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-cta", onClick: onFinish, children: "FINISH SESSION" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-ghost", onClick: () => {
            setEdVal("");
            setEditor({ mode: "add" });
          }, children: "\uFF0B ONE MORE EXERCISE" })
        ] })
      ] }),
      scene === "work" && !allDone && curEx && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-screen", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-head", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-eyebrow", children: [
            splitName,
            " DAY \xB7 SET ",
            doneSets,
            " / ",
            totalSets
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: "ws-name ws-name-edit",
              onClick: () => {
                setEdVal(curEx.name);
                setEditor({ mode: "rename" });
              },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: curEx.name }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ws-pen", children: "\u270E" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-dots", children: dots }),
          lastFor && (()=>{const last=lastFor(curEx);const prior=last?.sets[si];return prior?import_jsx_runtime.jsx('div',{className:'ws-last-set',children:`Last completed: ${wShow(prior.kg,unit2)} ${uLbl(unit2)} × ${prior.reps} · ${niceDate(last.date)}`}):null;})()
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-main", children: resting && pendingChoose ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-ringwrap sm", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 120 120", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "ws-rbg", cx: "60", cy: "60", r: "54" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "circle",
                {
                  className: "ws-rfg",
                  cx: "60",
                  cy: "60",
                  r: "54",
                  strokeDasharray: CIRC,
                  strokeDashoffset: CIRC * (1 - ringPct)
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-rin", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ws-restword", children: "REST" }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-chtitle", children: "MACHINE BOOKED? PICK WHAT'S NEXT" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-list", children: [
            pickable.map((x2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: `ws-row pick ${(selNext == null ? pickable[0].i : selNext) === x2.i ? "sel" : ""}`,
                onClick: () => setSelNext(x2.i),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ws-ex", children: [
                    x2.e.ss ? "\u26D3 " : "",
                    x2.e.name
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ws-plan", children: [
                    x2.left,
                    " left \xB7 ",
                    wShow(x2.e.sets.find((s2) => !s2.done).kg, unit2),
                    " \xD7 ",
                    x2.e.sets.find((s2) => !s2.done).reps
                  ] })
                ]
              },
              x2.i
            )),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "ws-row ws-addrow",
                onClick: () => {
                  setEdVal("");
                  setEditor({ mode: "add" });
                },
                children: "\uFF0B ADD EXERCISE"
              }
            )
          ] })
        ] }) : resting && cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-resteyebrow", children: "R E S T" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-ringwrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 120 120", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "ws-rbg", cx: "60", cy: "60", r: "54" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "circle",
                {
                  className: "ws-rfg",
                  cx: "60",
                  cy: "60",
                  r: "54",
                  strokeDasharray: CIRC,
                  strokeDashoffset: CIRC * (1 - ringPct)
                }
              )
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-rin", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "NEXT" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: wShow(cur.kg, unit2) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                uLbl(unit2),
                " \xD7 ",
                cur.reps
              ] })
            ] })
          ] })
        ] }) : cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-stepblock", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-stepval", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: dispV % 1 ? dispV.toFixed(1) : dispV }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: uLbl(unit2).toUpperCase() })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-chips", children: [-stepBig[0], -stepBig[1], -stepBig[2], stepBig[2], stepBig[1], stepBig[0]].map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { onClick: () => bump(d, 0), children: [
              d > 0 ? "+" : "\u2212",
              Math.abs(d)
            ] }, i)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-stepblock", style: { marginTop: 24 }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-stepval reps", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: repsV }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "REPS" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-chips", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => bump(0, -1), children: "\u22121" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => bump(0, 1), children: "+1" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-planline", children: [
            "SET ",
            curEx.sets.filter((s2) => s2.done).length + 1,
            " OF ",
            curEx.sets.length,
            " \xB7 PLAN ",
            wShow(cur.kg, unit2),
            " \xD7 ",
            cur.reps
          ] }),
          curEx.ss && (() => {
            const pI = ssPartnerIdx(curExI);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `ws-ssline ${ssFlash ? "hot" : ""}`, children: ssFlash ? "\u26D3 SWITCH \u2014 NO REST, STRAIGHT OVER" : pI >= 0 ? `\u26D3 superset \xB7 with ${exs[pI].name}` : null }, ssFlash ? "sw" : "ln");
          })(),
          prog && si === 0 && prog.state !== "new" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `ws-prog ${prog.state}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ws-prog-ic", children: prog.state === "advance" ? "\u25B2" : prog.state === "deload" ? "\u26A0" : "\u2192" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ws-prog-msg", children: prog.msg })
          ] })
        ] }) : null }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-foot", children: resting && pendingChoose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: "ws-ghost",
            onClick: () => {
              goNext(selNext == null ? pickable[0].i : selNext);
              onSkipRest();
            },
            children: "SKIP REST \u2014 GO NOW"
          }
        ) : resting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-ghost", onClick: onSkipRest, children: "SKIP REST" }) : cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `ws-cta ${armed ? "pulse" : ""}`, onClick: logIt, children: "LOG SET" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-finish", onClick: onFinish, children: "Finish session \u2713" })
        ] }) : null })
      ] })
    ] });
  }
  var BB_CIRC = 2 * Math.PI * 54;
  var bbForm2 = (isDL) => isDL ? {
    name: "THE WYRM",
    sub: "wakes beneath the barrow",
    emoji: "\u{1F409}",
    c: "#9BE15D",
    d: "#3f7a1e",
    rest: "THE COILS TIGHTEN",
    strike: "IT LUNGES \u2014 STRIKE",
    taunts: ["\u201CNO ESCAPE. ONLY THROUGH.\u201D", "\u201CThe barrow was the cradle. I am the grave.\u201D"]
  } : {
    name: "THE DRAGON",
    sub: "lands on your chest",
    emoji: "\u{1F432}",
    c: "#FF6B4A",
    d: "#8a2413",
    rest: "WINGS BEAT CLOSER",
    strike: "IT DESCENDS \u2014 STRIKE",
    taunts: ["\u201CPRESS THE BEAST OFF YOUR CHEST.\u201D", "\u201CThe sky has weight. Feel it.\u201D"]
  };
  var bbLines = (isDL) => isDL ? {
    rest: "THE GRAVE STIRS",
    strike: "IT RISES \u2014 STRIKE",
    boss: ["\u201CThe barrow trembles.\u201D", "\u201CChalk. Breathe. Wake it.\u201D", "\u201CDrag it into the light.\u201D"]
  } : {
    rest: "THE SHADE THICKENS",
    strike: "IT PRESSES \u2014 STRIKE",
    boss: ["\u201CAn iron sky above your chest.\u201D", "\u201CChalk your hands. Almost time.\u201D", "\u201CPress the sky off you.\u201D"]
  };
  function BossBattle({
    theme,
    onTheme,
    fight,
    target,
    ex,
    exIndex,
    gateInfo,
    trialInfo,
    now,
    restEnd,
    restTotal,
    readyAt,
    onStrike,
    onSkipRest,
    onFlee,
    outro,
    onOutroDone,
    xpNow,
    unit: unit2
  }) {
    const bossT = target || outro && outro.target || null;
    const isDL = bossT ? stripLift(bossT.name).includes("deadlift") : true;
    const form2 = bbForm2(isDL);
    const lines = bbLines(isDL);
    const kind = outro ? outro.kind : fight ? fight.kind : "gate";
    const phase = outro ? outro.trueForm ? 2 : 1 : fight && fight.phase === 2 ? 2 : 1;
    const sets = ex ? ex.sets : [];
    const total = sets.length;
    const p1Total = phase === 2 && !outro ? total - 2 : total;
    const done = sets.filter((s2) => s2.done).length;
    const si = sets.findIndex((s2) => !s2.done);
    const cur = si >= 0 ? sets[si] : null;
    const hp = (() => {
      if (outro) return 0;
      if (phase === 2) {
        const d2 = Math.max(0, done - p1Total);
        return [35, 14, 0][Math.min(2, d2)];
      }
      if (total > 0 && done >= total) return 0;
      return Math.max(3, Math.round(Math.pow(1 - done / Math.max(1, total), 1.9) * 100));
    })();
    const resting = !!(!outro && restEnd && now < restEnd && si >= 0);
    const left = resting ? Math.max(0, (restEnd - now) / 1e3) : 0;
    const ringPct = resting ? Math.max(0, Math.min(1, left / Math.max(1, restTotal))) : 0;
    const armed = !outro && !resting && si >= 0 && !!readyAt;
    const feed = armed && now - readyAt > 4e4 ? Math.min(6, 1 + Math.floor((now - readyAt - 4e4) / 15e3)) : 0;
    const hpShow = hp > 0 ? Math.min(99, hp + feed) : 0;
    const ident = phase === 2 ? { name: form2.name, sub: form2.sub, emoji: form2.emoji, img: null } : kind === "trial" ? { name: trialInfo ? trialInfo.name : "THE DEN", sub: "five by five \u2014 no escape", emoji: isDL ? "\u{1F525}" : "\u{1F631}", img: null } : kind === "boss" ? { name: isDL ? "THE WYRM" : "THE SKY-DRAGON", sub: bossT ? `${wShow(bossT.kg, unit2)} ${uLbl(unit2)} \xD7 ${bossT.reps}` : "", emoji: isDL ? "\u{1F409}" : "\u{1F432}", img: null } : { name: gateInfo ? gateInfo.name : "", sub: gateInfo ? gateInfo.sub : "", emoji: gateInfo ? gateInfo.emoji : "\u2694\uFE0F", img: gateInfo ? gateInfo.img : null };
    const [scene, setScene] = (0, import_react41.useState)(() => done === 0 && !outro && phase === 1 ? "intro" : "battle");
    const [introHp, setIntroHp] = (0, import_react41.useState)(0);
    const [reviveHp, setReviveHp] = (0, import_react41.useState)(0);
    const [quakes, setQuakes] = (0, import_react41.useState)(0);
    const [fx, setFx] = (0, import_react41.useState)(0);
    const [lastDmg, setLastDmg] = (0, import_react41.useState)(0);
    const [xpStage, setXpStage] = (0, import_react41.useState)(0);
    const prevPhase = (0, import_react41.useRef)(phase);
    const prevDone = (0, import_react41.useRef)(done);
    const prevHp = (0, import_react41.useRef)(hp);
    const sawOutro = (0, import_react41.useRef)(false);
    (0, import_react41.useEffect)(() => {
      if (scene === "intro") {
        setIntroHp(0);
        const a2 = setTimeout(() => setIntroHp(100), 250);
        const b = setTimeout(() => setScene("battle"), 2600);
        return () => {
          clearTimeout(a2);
          clearTimeout(b);
        };
      }
    }, [scene]);
    (0, import_react41.useEffect)(() => {
      if (done > prevDone.current) {
        setLastDmg(Math.max(1, prevHp.current - hp));
        setFx((x2) => x2 + 1);
      }
      prevDone.current = done;
      prevHp.current = hp;
    }, [done, hp]);
    (0, import_react41.useEffect)(() => {
      if (fx === 0) return;
      const t = setTimeout(() => setFx(0), 500);
      return () => clearTimeout(t);
    }, [fx]);
    (0, import_react41.useEffect)(() => {
      if (phase === 2 && prevPhase.current === 1 && !outro) {
        setScene("death");
        const t12 = setTimeout(() => setScene("black"), 1550);
        const t2 = setTimeout(() => {
          setScene("revive");
          setReviveHp(0);
          setQuakes((q) => q + 1);
        }, 2950);
        const t3 = setTimeout(() => setReviveHp(35), 3700);
        const t4 = setTimeout(() => setQuakes((q) => q + 1), 4150);
        const t5 = setTimeout(() => setScene("battle"), 6200);
        prevPhase.current = 2;
        return () => [t12, t2, t3, t4, t5].forEach(clearTimeout);
      }
      prevPhase.current = phase;
    }, [phase, outro]);
    (0, import_react41.useEffect)(() => {
      if (outro && !sawOutro.current) {
        sawOutro.current = true;
        setScene("death");
        const t12 = setTimeout(() => setScene("black"), 1550);
        const t2 = setTimeout(() => setScene("slain"), 2500);
        return () => {
          clearTimeout(t12);
          clearTimeout(t2);
        };
      }
      if (!outro) sawOutro.current = false;
    }, [outro]);
    (0, import_react41.useEffect)(() => {
      if (scene !== "xp") {
        setXpStage(0);
        return;
      }
      const ts = [setTimeout(() => setXpStage(1), 500), setTimeout(() => setXpStage(2), 1900)];
      return () => ts.forEach(clearTimeout);
    }, [scene]);
    if (!bossT) return null;
    const sc = outro && (scene === "intro" || scene === "battle") ? "death" : scene;
    const actTheme = sc === "slain" || sc === "xp" ? "souls" : sc === "revive" || phase === 2 && (sc === "battle" || sc === "black") || outro && outro.trueForm && sc === "death" ? "souls" : "forge";
    const themeCls = `bb-${actTheme}`;
    const souls = actTheme === "souls";
    const arcade = actTheme === "arcade";
    const hpBar = (pct) => arcade ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-cells", children: Array.from({ length: 20 }, (_, ci) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "i",
      {
        className: ci < Math.round(pct / 5) ? "on" : "",
        style: { "--c": phase === 2 ? form2.c : pct > 50 ? "#58B368" : pct > 25 ? "#FFD666" : "#E0654F" }
      },
      ci
    )) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `bb-hpshell ${fx ? "flash" : ""}`, children: [
      souls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-hpchip", style: { width: `${pct}%` } }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-hpfill", style: { width: `${pct}%` } })
    ] });
    const taunt = phase === 2 ? form2.taunts[done % form2.taunts.length] : kind === "gate" && gateInfo ? gateInfo.taunts[done % gateInfo.taunts.length] : kind === "trial" ? done ? trialInfo ? trialInfo.cry : "ONLY THROUGH." : "Strike while the iron is hot." : lines.boss[done % lines.boss.length];
    const menace = resting ? `${phase === 2 ? form2.rest : lines.rest}\u2026` : feed > 0 ? "TOO SLOW \u2014 IT FEEDS" : armed ? phase === 2 ? form2.strike : lines.strike : taunt;
    const rows = outro ? outro.rows : [];
    const gained = rows.reduce((a2, r2) => a2 + r2[1], 0);
    const xpBefore = Math.max(0, xpNow - gained);
    const lvB = levelFor(xpBefore);
    const lvA = levelFor(xpNow);
    const crossed = lvB.title !== lvA.title;
    const arenaImg = actTheme === "arcade" ? null : phase === 2 ? isDL ? "bb-trueform-dl.jpg" : "bb-trueform-bp.jpg" : kind === "gate" ? isDL ? "bb-warden.jpg" : "bb-shade.jpg" : kind === "trial" ? isDL ? "bb-den.jpg" : "bb-nightmare.jpg" : isDL ? "bb-wyrm.jpg" : "bb-dragon.jpg";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: `bb ${themeCls} ${phase === 2 ? "bb-p2" : ""}`,
        style: { "--bbc": form2.c, "--bbd": form2.d },
        children: [
          arenaImg && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-arena", style: artBG(arenaImg) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-arenascrim" })
          ] }),
          souls && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-letter t" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-letter b" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-vig" })
          ] }),
          arcade && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-scan" }),
          sc === "black" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-black" }),
          (sc === "intro" || sc === "battle") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "bb-flee", onClick: onFlee, "aria-label": "Flee the fight", children: "\u2715" }) }),
          sc === "intro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-screen bb-center bb-fade", children: [
            ident.img && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-face big", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossFace, { img: ident.img, emoji: "", size: 84 }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-name", children: ident.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-subt", children: ident.sub }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-introbar", children: hpBar(introHp) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-menace", children: taunt })
          ] }),
          sc === "battle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-screen bb-hud", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-plate", children: [
              ident.img && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-medal", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossFace, { img: ident.img, emoji: "", size: 25 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-pcol", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-pname", children: ident.name }),
                hpBar(hpShow)
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-main", children: [
              resting && cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-eyebrow", children: "R E S T" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-ring", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { viewBox: "0 0 120 120", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "bb-rbg", cx: "60", cy: "60", r: "54" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "circle",
                      {
                        className: "bb-rfg",
                        cx: "60",
                        cy: "60",
                        r: "54",
                        strokeDasharray: BB_CIRC,
                        strokeDashoffset: BB_CIRC * (1 - ringPct)
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-rin", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "NEXT" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: wShow(cur.kg, unit2) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                      uLbl(unit2),
                      " \xD7 ",
                      cur.reps
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-menace", children: menace })
              ] }) : cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-lifttag", children: [
                  ex ? ex.name : "",
                  phase === 2 ? ` \xB7 BURNOUT ${Math.max(1, done - p1Total + 1)} OF 2` : ""
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-demand", children: [
                  wShow(cur.kg, unit2),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                    " ",
                    uLbl(unit2),
                    " \xD7 ",
                    cur.reps
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-menace", children: menace })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-menace", children: taunt }),
              fx > 0 && arcade && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "bb-dmgnum", children: [
                "-",
                lastDmg
              ] }),
              fx > 0 && souls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-slashfx" }),
              fx > 0 && !arcade && !souls && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bb-embers", children: Array.from({ length: 10 }, (_, k2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { "--dx": `${k2 * 47 % 140 - 70}px`, "--dy": `${-30 - k2 * 31 % 110}px` } }, k2)) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `bb-foot ${fx && !arcade && !souls ? "bb-shake" : ""}`, children: resting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "bb-ghost", onClick: onSkipRest, children: "SKIP REST" }) : cur ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `bb-cta ${armed ? "pulse" : ""}`, onClick: () => onStrike(exIndex, si), children: "SET DONE \u2014 STRIKE" }) : null })
          ] }),
          sc === "death" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-sunder", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-sgap" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-half t", style: arenaImg ? artBG(arenaImg) : null }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-half b", style: arenaImg ? artBG(arenaImg) : null }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-seam" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-slashline" })
          ] }),
          sc === "revive" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-screen bb-center bb-quaker", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-formname", children: form2.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-subt", children: form2.sub }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-introbar", children: hpBar(reviveHp) })
          ] }, quakes),
          sc === "slain" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-screen bb-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "bb-ringout" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-slainT", children: "SLAIN" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-slainsub", children: kind === "trial" ? "THE DEN IS YOURS" : isDL ? "THE BARROW LIES QUIET" : "THE SKY IS YOURS" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "bb-cta bb-goldbtn", style: { marginTop: 44 }, onClick: () => setScene("xp"), children: "CLAIM THE SPOILS" })
          ] }),
          sc === "xp" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-screen bb-center bb-fade", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-ledger", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-ledtitle", children: "SPOILS OF WAR" }),
              rows.map(([label, amt], ri) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-xprow", style: { animationDelay: `${0.25 + ri * 0.3}s` }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  amt,
                  " XP"
                ] })
              ] }, label)),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-ledtotal", children: [
                "+",
                gained,
                " XP"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-lvl", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-lvllabs", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: xpStage >= 2 && crossed ? lvA.title : lvB.title }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: xpStage >= 2 && crossed ? lvA.next ? `NEXT AT ${lvA.next.xp}` : "MAX" : lvB.next ? `${lvB.next.title} AT ${lvB.next.xp}` : "MAX" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-lvlbar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "i",
                  {
                    className: `bb-lvlfill ${xpStage >= 2 && crossed ? "grow" : ""}`,
                    style: { width: `${xpStage === 0 ? lvB.pct : xpStage === 1 ? crossed ? 100 : lvA.pct : lvA.pct}%` }
                  },
                  xpStage >= 2 && crossed ? "b2" : "b1"
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-lvlxp", children: [
                  xpNow,
                  " XP"
                ] }),
                crossed && xpStage >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-lvlup", children: [
                  "LEVEL UP \u2014 ",
                  lvA.title
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "bb-cta bb-goldbtn", style: { marginTop: 24 }, onClick: onOutroDone, children: "RETURN TO THE WAR" })
          ] })
        ]
      }
    );
  }
  var HYDRA_HEADS = [
    ["AIR SQUATS", 60],
    ["PUSH-UPS", 40],
    ["SIT-UPS", 50],
    ["JUMPING JACKS", 80],
    ["BURPEES", 25]
  ];
  var JBASE = [
    ["AIR SQUATS", 50, 60],
    ["PUSH-UPS", 35, 75],
    ["SIT-UPS", 40, 75],
    ["LUNGES", 40, 90],
    ["BURPEES", 22, 90],
    ["MOUNTAIN CLIMBERS", 60, 60],
    ["JUMPING JACKS", 80, 75],
    ["HIGH KNEES", 70, 60],
    ["SQUAT JUMPS", 25, 75],
    ["CRUNCHES", 50, 60],
    ["GLUTE BRIDGES", 45, 75],
    ["TRICEP DIPS", 25, 75],
    ["RUSSIAN TWISTS", 50, 60]
  ];
  var JTABLES = [
    { key: "penny", name: "PENNY TABLE", ante: 4, pots: [8, 16, 32], mult: 0.75, sub: "13-card deck \xB7 pot doubles 8\u219216\u219232" },
    { key: "silver", name: "SILVER TABLE", ante: 8, pots: [16, 32, 64], mult: 1, sub: "cruel scale \xB7 pot doubles 16\u219232\u219264" },
    { key: "gold", name: "GOLD TABLE", ante: 12, pots: [24, 48, 96], mult: 1.3, sub: "savage scale \xB7 pot doubles 24\u219248\u219296" }
  ];
  var JESTER_DARES = [
    "You walked my whole lantern road just to freeze at the door? Come in, iron-hauler \u2014 let's see if your nerve is worth half your back.",
    "The lanterns don't light for just anyone, friend \u2014 tonight, they lit for you. Don't be rude. Step inside.",
    "Three cards, one night, your luck against mine. You've hauled the iron... now lift the flap and see what it bought you.",
    "Ah \u2014 the strong one. Muscle's cheap; anyone can push. Nerve is the rare coin. Come in and spend some.",
    "Midnight takes my tent and everything in it. Step in now, or spend all year wondering what you'd have won."
  ];
  var SKIMLINES = [
    "THE HOUSE DRINKS FIRST.",
    "A SLIVER FOR THE CANDLES.",
    "EVERY WAGER FEEDS THE TENT.",
    "MY FEE. MY LITTLE JOY.",
    "THE MOON DOES NOT SHINE FOR FREE.",
    "GREED PAYS ADMISSION TWICE.",
    "A COIN FOR THE MASKS.",
    "THE SPIRAL MUST TURN.",
    "COURAGE IS TAXED HERE.",
    "I KEEP WHAT THE BRAVE FORGET.",
    "THE FELT IS ALWAYS HUNGRY.",
    "A TITHE FOR THE TUNE.",
    "EVEN LUCK PAYS RENT.",
    "THE LANTERNS EAT GOLD.",
    "YOUR NERVE, MY DIVIDEND.",
    "THE CARDS SHUFFLE FOR A PRICE.",
    "A PINCH FOR THE PUPPETS.",
    "ALL POTS LEAK TOWARD ME.",
    "THE CARNIVAL SLEEPS ON SILVER.",
    "ANOTHER TURN, ANOTHER TOLL.",
    "I SHARPEN THE DECK WITH YOUR COIN.",
    "THE BELLS RING ON YOUR GOLD.",
    "DEEPER IN, DEARER STILL.",
    "MY SMILE IS NOT CHARITY.",
    "WHAT DOUBLES, FIRST DIMINISHES."
  ];
  var jScaledDeck = (mult, banks) => {
    const esc = Math.pow(1.06, Math.min(banks || 0, 8));
    return JBASE.map((c2) => [`${Math.max(5, Math.round(c2[1] * mult * esc / 5) * 5)} ${c2[0]}`, c2[2]]);
  };
  function JesterGame({ mode, legend, xp, banks, onEnter, onAnte, onResolve, onClose }) {
    const [phase, setPhase] = (0, import_react41.useState)(mode === "card" ? "greet" : "road");
    const [beat, setBeat] = (0, import_react41.useState)(0);
    const [T, setT] = (0, import_react41.useState)(null);
    const [pot, setPot] = (0, import_react41.useState)(0);
    const [skims, setSkims] = (0, import_react41.useState)(0);
    const [theftMsg, setTheftMsg] = (0, import_react41.useState)(false);
    const [hand, setHand] = (0, import_react41.useState)([]);
    const [done, setDone] = (0, import_react41.useState)({});
    const [cleared, setCleared] = (0, import_react41.useState)(0);
    const [cur, setCur] = (0, import_react41.useState)(-1);
    const [pending, setPending] = (0, import_react41.useState)(null);
    const [live, setLive] = (0, import_react41.useState)(false);
    const [left, setLeft] = (0, import_react41.useState)(0);
    const [urgent, setUrgent] = (0, import_react41.useState)(false);
    const [pk, setPk] = (0, import_react41.useState)("PICK A CARD, ANY CARD");
    const [dare] = (0, import_react41.useState)(() => JESTER_DARES[Math.floor(Math.random() * JESTER_DARES.length)]);
    const [verdict, setVerdict] = (0, import_react41.useState)(null);
    const [shakeCls, setShakeCls] = (0, import_react41.useState)("");
    const [tickK, setTickK] = (0, import_react41.useState)(0);
    const timers = (0, import_react41.useRef)([]);
    const fxRef = (0, import_react41.useRef)(null);
    const dRef = (0, import_react41.useRef)(null);
    const laughRef = (0, import_react41.useRef)({ on: false, hop: 0, stum: 0, acc: 0, lastQ: -1 });
    const stolenRef = (0, import_react41.useRef)(false);
    const wholeRef = (0, import_react41.useRef)(0);
    const potRef = (0, import_react41.useRef)(0);
    const clearedRef = (0, import_react41.useRef)(0);
    const leftRef = (0, import_react41.useRef)(0);
    const later = (f, ms) => {
      const t = setTimeout(f, ms);
      timers.current.push(t);
      return t;
    };
    const every3 = (f, ms) => {
      const t = setInterval(f, ms);
      timers.current.push(t);
      return t;
    };
    const sweep = () => {
      timers.current.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      timers.current = [];
    };
    (0, import_react41.useEffect)(() => () => sweep(), []);
    const buzz = (p) => {
      try {
        if (navigator.vibrate) navigator.vibrate(p);
      } catch (e) {
      }
    };
    const jolt = () => {
      setShakeCls("");
      requestAnimationFrame(() => setShakeCls("jj-sk"));
      later(() => setShakeCls(""), 700);
      buzz([30, 25, 30]);
    };
    const clockOf = (s2) => `${Math.floor(s2 / 60)}:${String(Math.max(0, s2) % 60).padStart(2, "0")}`;
    const fx = (cls, txt, ms) => {
      const host = fxRef.current;
      if (!host) return;
      const d = document.createElement("div");
      d.className = cls;
      d.textContent = txt;
      host.appendChild(d);
      later(() => d.remove(), ms);
    };
    const speakLine = () => {
      const L = laughRef.current;
      let i;
      do {
        i = Math.floor(Math.random() * SKIMLINES.length);
      } while (i === L.lastQ);
      L.lastQ = i;
      fx("jj-quote", `\u201C${SKIMLINES[i]}\u201D`, 4800);
    };
    (0, import_react41.useEffect)(() => {
      if (phase === "road") {
        later(() => setBeat(1), 1200);
        later(() => setBeat(2), 3e3);
        later(() => {
          setBeat(3);
          jolt();
        }, 4800);
        later(() => setBeat(4), 6e3);
      }
      if (phase === "greet") {
        later(() => {
          setBeat(11);
          jolt();
        }, 1600);
        later(() => setBeat(12), 2800);
        later(() => setPhase("wager"), 6300);
      }
    }, [phase]);
    const maxAnte = () => Math.min(legend >= 6 ? 12 : legend >= 3 ? 8 : 4, Math.floor(xp / 4) * 4);
    const enterTent = () => {
      buzz([20, 50, 20]);
      onEnter();
      later(() => setPhase("greet"), 750);
      setBeat(10);
    };
    const pickTable = (t) => {
      onAnte(t.ante);
      buzz(15);
      setT(t);
      potRef.current = t.pots[0];
      setPot(t.pots[0]);
      const deck = jScaledDeck(t.mult, banks);
      const idx = deck.map((_, k2) => k2).sort(() => Math.random() - 0.5).slice(0, 3);
      setHand(idx.map((i) => deck[i]));
      setPhase("table");
    };
    const flip = (i) => {
      if (live || pending || done[i]) return;
      setCur(i);
      setPending(hand[i]);
      buzz(15);
    };
    const startCard = () => {
      if (!pending) return;
      const h = pending;
      setPending(null);
      setLive(true);
      stolenRef.current = false;
      const secs = h[1];
      leftRef.current = secs;
      setLeft(secs);
      wholeRef.current = secs;
      setUrgent(false);
      later(stealNow, Math.round(secs * 1e3 * (0.35 + Math.random() * 0.35)));
      every3(() => {
        leftRef.current -= 0.25;
        const l = leftRef.current;
        if (clearedRef.current === 2 && l <= 15 && l > 0) startLaugh();
        const urg = l <= Math.max(6, secs / 3 / 3);
        if (urg && l > 0) setUrgent(true);
        const s2 = Math.max(0, Math.ceil(l));
        if (s2 !== wholeRef.current) {
          wholeRef.current = s2;
          setTickK((k2) => k2 + 1);
          if (s2 <= 5) buzz(12);
        }
        setLeft(l);
        if (l <= 0) {
          sweep();
          stopLaugh();
          bust();
        }
      }, 250);
    };
    const stealNow = () => {
      if (stolenRef.current) return;
      stolenRef.current = true;
      const pct = 0.15 + Math.random() * 0.15;
      const s2 = Math.max(1, Math.round(potRef.current * pct));
      setTheftMsg(true);
      buzz([10, 60, 10]);
      later(() => {
        potRef.current = Math.max(1, potRef.current - s2);
        setPot(potRef.current);
        setSkims((v) => v + s2);
        jolt();
        fx("jj-robflash", "", 700);
        fx("jj-drop", `\u2212${s2}`, 1500);
      }, 750);
      later(() => setTheftMsg(false), 4600);
    };
    const startLaugh = () => {
      const L = laughRef.current;
      if (L.on) return;
      L.on = true;
      L.hop = 0;
      L.stum = 0;
      L.acc = 0;
      fx("jj-quote", "CATCH YOUR WINNINGS.", 4800);
      const b = dRef.current;
      if (!b) return;
      b.classList.add("jj-flee");
      hop(b);
      every3(() => {
        if (!L.on) return;
        L.acc += 170;
        const cadence = leftRef.current <= 6 ? 350 : 500;
        if (L.acc < cadence) return;
        L.acc = 0;
        if (L.stum > 0) {
          L.stum--;
          if (L.stum === 0) b.classList.remove("jj-stumble");
          return;
        }
        if (Math.random() < 0.15) {
          L.stum = 2;
          b.classList.add("jj-stumble");
          return;
        }
        hop(b);
      }, 170);
    };
    const hop = (b) => {
      const L = laughRef.current;
      L.hop++;
      const g = Math.min(1.5, 1 + Math.max(0, L.hop - 8) * 0.06);
      b.style.setProperty("--g", g);
      b.style.setProperty("--r", (Math.random() * 8 - 4).toFixed(1) + "deg");
      b.style.left = Math.round(8 + Math.random() * (window.innerWidth - 170 * g - 16)) + "px";
      b.style.top = Math.round(window.innerHeight * (0.22 + Math.random() * 0.5)) + "px";
      b.classList.remove("jj-hopping");
      void b.offsetWidth;
      b.classList.add("jj-hopping");
      buzz(8);
    };
    const stopLaugh = () => {
      laughRef.current.on = false;
      const b = dRef.current;
      if (b) {
        b.classList.remove("jj-flee", "jj-stumble", "jj-hopping");
        b.style.left = "";
        b.style.top = "";
        b.style.removeProperty("--g");
        b.style.removeProperty("--r");
      }
    };
    const beat_ = () => {
      sweep();
      stopLaugh();
      setLive(false);
      setUrgent(false);
      const c2 = clearedRef.current + 1;
      clearedRef.current = c2;
      setCleared(c2);
      if (c2 > 1) {
        potRef.current *= 2;
        setPot(potRef.current);
      }
      setDone((d) => ({ ...d, [cur]: true }));
      jolt();
      if (stolenRef.current) speakLine();
      if (c2 === 3) {
        later(() => setVerdict("bank"), 600);
        return;
      }
      setPk(`ANOTHER? \u2014 DOUBLE TO ${potRef.current * 2}`);
    };
    const fold = () => {
      sweep();
      stopLaugh();
      setLive(false);
      setUrgent(false);
      bust();
    };
    const bust = () => {
      setLive(false);
      setVerdict("bust");
    };
    const settle = (kind) => {
      if (kind === "bust") onResolve(0, false);
      else onResolve(potRef.current, kind === "bank");
      onClose();
    };
    const cap = maxAnte();
    const A = T ? T.ante : 0;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `jj ${shakeCls}`, children: [
      (phase === "greet" || phase === "wager" || phase === "table" || verdict) && beat >= 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `jj-bg ${beat === 10 ? "" : "jj-pop"}`, style: artBG("bb-jester.jpg") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "jj-scrim" }),
      urgent && live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "jj-urgveil" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-fx", ref: fxRef }),
      phase === "road" && !verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-scene jj-cine", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "jj-cine-scene", style: artBG("road-jester.jpg", "center") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `jj-cine-card ${beat === 10 ? "jj-entering" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-cine-inner", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "jj-cine-cardart", style: artBG("card-jester.jpg", "center 40%") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "jj-cine-cardscrim" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-cine-quote", children: ("\u201C" + dare + "\u201D").split(" ").map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react41.default.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "jj-qw", style: { animationDelay: `${(5.2 + i * 0.075).toFixed(3)}s` }, children: w }),
            " "
          ] }, i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-cine-foot", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "jj-cine-enter", onClick: enterTent, children: "ENTER THE TENT" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "jj-cine-not", onClick: onClose, children: "not today" })
          ] })
        ] }) })
      ] }),
      phase === "greet" && !verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-scene", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-name", children: "THE JESTER" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-roadw", style: { top: "auto", bottom: "8vh" }, children: [
          beat >= 11 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-w jj-big", children: "CHOOSE YOUR TABLE" }),
          beat >= 12 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-w jj-gold", children: "THE STAKES SET THE PAIN" })
        ] })
      ] }),
      phase === "wager" && !verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-scene", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-name", style: { opacity: 0.85 }, children: "THE JESTER" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-wager", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-wtitle", children: "HIGHER STAKES \xB7 HARDER CARDS \xB7 FATTER POT" }),
          JTABLES.map((t, i) => {
            const lockd = t.ante > cap;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: `jj-tbl ${t.key === "gold" ? "jj-tgold" : ""} ${lockd ? "jj-locked" : ""}`,
                onClick: lockd ? void 0 : () => pickTable(t),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-tn", children: t.name }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-tsub", children: t.sub }),
                  lockd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-tlock", children: t.ante === 12 ? "LEGEND 6+" : xp < t.ante * 4 ? "BANKROLL LOW" : "LEGEND 3+" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-tante", children: [
                    "ANTE ",
                    t.ante
                  ] })
                ]
              },
              t.key
            );
          })
        ] })
      ] }),
      phase === "table" && !verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-scene", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-name", style: { opacity: 0.85 }, children: "THE JESTER" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-pot", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-pv", children: [
            "POT ",
            pot
          ] }),
          theftMsg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-skims", children: "SOMETHING MOVED NEAR THE POT" }),
          !theftMsg && skims > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-skims jj-skimtally", children: [
            "HIS THEFTS \u2212",
            skims
          ] })
        ] }),
        !live && !pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-pick", children: pk }),
        !live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-cards", children: hand.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
          "div",
          {
            className: `jj-pc ${pending && cur === i || done[i] ? "jj-flip" : ""} ${done[i] ? "jj-cleared" : ""} ${pending && cur !== i && !done[i] ? "jj-dimc" : ""}`,
            onClick: () => flip(i),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-face jj-back", children: "?" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-face jj-front", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-fr", children: done[i] ? "CLEARED" : h[0] }),
                !done[i] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-ft", children: [
                  "IN ",
                  clockOf(h[1])
                ] })
              ] })
            ]
          },
          i
        )) }),
        live && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-chal", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-cname", children: hand[cur][0] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `jj-cclock ${urgent ? "jj-red" : ""}`, children: clockOf(Math.ceil(left)) }, tickK),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-chint", children: "TAP DONE WHEN THE WORK IS DONE" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-foot", children: [
          pending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "jj-plq jj-gold", onClick: startCard, children: "START \u2014 THE CLOCK RUNS" }),
          live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "jj-plq jj-gold", ref: dRef, onClick: beat_, children: "DONE \u2014 CARD CLEARED" }),
          live && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "jj-plq jj-red", onClick: fold, children: "FOLD \u2014 THE POT BURNS" }),
          !live && !pending && cleared > 0 && cleared < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "jj-plq jj-gold", onClick: () => setVerdict("walk"), children: [
            "TAKE THE POT +",
            pot
          ] })
        ] })
      ] }),
      verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-vscene", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `jj-vT jj-v-${verdict}`, children: verdict === "walk" ? "YOU WALK" : verdict === "bank" ? "BANK BROKEN" : "BUST" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { flex: 1, minHeight: "4vh" } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `jj-ledger ${verdict === "bust" ? "jj-lred" : ""}`, children: verdict === "bust" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".25s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE POT" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "BURNS" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".5s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE ANTE" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              "GONE \xB7 \u2212",
              A,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".75s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SESSION" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              "\u2212",
              A,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-ltot", children: [
            "\u2212",
            A,
            " XP"
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".25s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE POT" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              "+",
              pot,
              " XP"
            ] })
          ] }),
          skims > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".45s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HIS THEFTS" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              "\u2212",
              skims,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".65s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE ANTE" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              "\u2212",
              A,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: ".85s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SESSION" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
              pot - A >= 0 ? "+" : "",
              pot - A,
              " XP"
            ] })
          ] }),
          verdict === "bank" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-lrow", style: { animationDelay: "1s" }, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NEXT DECK" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "MEANER" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "jj-ltot", children: [
            "+",
            pot,
            " XP"
          ] })
        ] }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jj-vline", children: verdict === "walk" ? "\u201CTAKE IT AND GO.\u201D" : verdict === "bank" ? "\u201CTHE HOUSE REMEMBERS.\u201D" : "\u201CTHE HOUSE THANKS YOU.\u201D" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { height: 24 } }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "button",
          {
            className: `jj-plq ${verdict === "bust" ? "jj-red" : "jj-gold"}`,
            style: { maxWidth: 340 },
            onClick: () => settle(verdict),
            children: verdict === "walk" ? "TAKE IT AND GO" : verdict === "bank" ? "CLAIM THE TABLE" : "LEAVE THE TENT"
          }
        )
      ] })
    ] });
  }
  function HydraEncounter({ ordeal, onResolve, onClose }) {
    const [sc, setSc] = (0, import_react41.useState)("intro");
    const [stamped, setStamped] = (0, import_react41.useState)(0);
    const [armed, setArmed] = (0, import_react41.useState)(false);
    const [shakeCls, setShakeCls] = (0, import_react41.useState)("");
    const shakeT = (0, import_react41.useRef)(null);
    const [left, setLeft] = (0, import_react41.useState)(ordeal.time);
    const [urgent, setUrgent] = (0, import_react41.useState)(false);
    const [dead, setDead] = (0, import_react41.useState)([]);
    const [verdict, setVerdict] = (0, import_react41.useState)(null);
    const committed = (0, import_react41.useRef)(false);
    const wholeRef = (0, import_react41.useRef)(Math.ceil(ordeal.time));
    const [tickK, setTickK] = (0, import_react41.useState)(0);
    const buzz = (p) => {
      try {
        if (navigator.vibrate) navigator.vibrate(p);
      } catch (e) {
      }
    };
    const jolt = (big) => {
      clearTimeout(shakeT.current);
      setShakeCls("");
      requestAnimationFrame(() => setShakeCls(big ? "cl-sk" : "cl-sk2"));
      shakeT.current = setTimeout(() => setShakeCls(""), 700);
      buzz(big ? [40, 30, 40] : 20);
    };
    const clockOf = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    (0, import_react41.useEffect)(() => {
      if (sc !== "intro") return;
      const T = [];
      const at = (ms, f) => T.push(setTimeout(f, ms));
      at(2e3, () => {
        setStamped(1);
        jolt(true);
      });
      for (let k2 = 0; k2 < 5; k2++)
        at(3400 + k2 * 950, () => {
          setStamped(2 + k2);
          if (k2 === 4) jolt(false);
        });
      at(8800, () => setStamped(7));
      at(10400, () => {
        setStamped(8);
        jolt(false);
      });
      at(12200, () => {
        setStamped(9);
        buzz(15);
      });
      at(13400, () => {
        setStamped(10);
        buzz(15);
      });
      at(14600, () => {
        setStamped(11);
        setArmed(true);
        jolt(false);
      });
      at(16400, () => setSc("fight"));
      return () => T.forEach(clearTimeout);
    }, [sc]);
    (0, import_react41.useEffect)(() => {
      if (sc !== "fight") return;
      const iv = setInterval(() => setLeft((l) => l - 0.25), 250);
      return () => clearInterval(iv);
    }, [sc]);
    const URG = 60;
    (0, import_react41.useEffect)(() => {
      if (sc !== "fight") return;
      if (left <= URG && left > 0 && !urgent) {
        setUrgent(true);
        jolt(false);
      }
      const s2 = Math.max(0, Math.ceil(left));
      if (s2 !== wholeRef.current) {
        wholeRef.current = s2;
        if (urgent) {
          setTickK((k2) => k2 + 1);
          if (s2 <= 10) buzz(12);
        }
      }
      if (left <= 0 && !committed.current) {
        committed.current = true;
        const n = dead.length, sv = 5 - n;
        const v = { slain: false, severed: n, delta: n * 4 - sv * 3 };
        setVerdict(v);
        setSc("verdict");
        onResolve(v);
      }
    }, [left, sc, urgent, dead]);
    const sever = (i) => {
      if (committed.current || dead.includes(i)) return;
      const nd = [...dead, i];
      setDead(nd);
      jolt(nd.length === 5);
      if (nd.length === 5) {
        committed.current = true;
        const s2 = Math.max(0, Math.ceil(left));
        const mins = Math.min(10, Math.floor(s2 / 60));
        const v = { slain: true, severed: 5, delta: 40 + mins, mins, spare: clockOf(s2) };
        setTimeout(() => {
          setVerdict(v);
          setSc("verdict");
          onResolve(v);
        }, 650);
      }
    };
    const clockStr = clockOf(Math.max(0, Math.ceil(left)));
    const REMAIN = ["FIVE", "FOUR", "THREE", "TWO", "ONE"];
    const w = (n, cls, txt, rot) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `cl-w ${cls} ${stamped >= n ? "on" : ""}`, style: { "--rot": rot }, children: txt });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl hy ${urgent ? "cl-urgent" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-bg hy-bg", style: artBG("bb-hydra.jpg") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-scrim" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-inner ${shakeCls}`, children: [
        sc !== "verdict" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-name hy-name", children: "THE HYDRA" }),
        sc === "intro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-dmw", children: [
          w(1, "hy-five", "FIVE HEADS", "-1.4deg"),
          ordeal.heads.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "div",
            {
              className: `cl-w hy-head ${stamped >= 2 + i ? "on" : ""}`,
              style: { "--rot": `${(i % 2 ? 1 : -1) * (0.7 + i * 0.25)}deg` },
              children: [
                "HEAD ",
                h.n,
                " \xB7 ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  h.reps,
                  " ",
                  h.ex
                ] })
              ]
            },
            i
          )),
          w(7, "hy-clkline", `IN ${clockOf(ordeal.time)}`, ".8deg"),
          w(8, "cl-warn2", "SEVER THEM ALL \u2014 OR BE BITTEN", "-.9deg"),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-tsnrow ${armed ? "armed" : ""}`, children: [
            w(9, "cl-tsn", "TIME", "-1.3deg"),
            w(10, "cl-tsn", "STARTS", "1deg"),
            w(11, "cl-tsn", "NOW", "-.8deg")
          ] })
        ] }),
        sc === "fight" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-veil" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `hy-clock ${urgent ? "tick" : ""}`, children: clockStr }, tickK),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hy-heads", children: ordeal.heads.map((h, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `hy-hd ${dead.includes(i) ? "dead" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "hy-ht", children: [
              "HEAD ",
              h.n,
              " \xB7 ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                h.reps,
                " ",
                h.ex
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "hy-sever", onClick: () => sever(i), children: "SEVER" })
          ] }, i)) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hy-remain", children: dead.length === 5 ? "" : `${REMAIN[dead.length]} HEAD${5 - dead.length > 1 ? "S" : ""} REMAIN` })
        ] }),
        sc === "verdict" && verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-vscene", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `cl-vT ${verdict.slain ? "hy-slainT" : "took"}`, children: verdict.slain ? "THE HYDRA IS SLAIN" : "BITTEN" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-ledger hy-ledger ${verdict.slain ? "" : "red"}`, children: [
            verdict.slain ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".25s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HEADS SEVERED" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "5 / 5" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".5s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TIME TO SPARE" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: verdict.spare })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".75s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BOUNTY" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "5 \xD7 +4 XP" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: "1s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CLEAN KILL" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+20 XP",
                  verdict.mins ? ` \xB7 SWIFT +${verdict.mins}` : ""
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: "1.25s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE GYM DAY" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "COUNTED" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: "1.5s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NEXT SUMMONING" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "IT GROWS BACK MEANER" })
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".25s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "HEADS SEVERED" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  verdict.severed,
                  " / 5"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".5s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BOUNTY KEPT" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  verdict.severed,
                  " \xD7 +4 XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".75s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SURVIVORS BITE" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  5 - verdict.severed,
                  " \xD7 \u22123 XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: "1s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE HEADS" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "ALL REGROW" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-ltot", children: [
              verdict.delta >= 0 ? `+${verdict.delta}` : verdict.delta,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-vline", children: verdict.slain ? "\u201CCUT ONE NECK, AND THE BODY LEARNS.\u201D" : "\u201CYOU COUNTED FIVE. IT COUNTED YOU.\u201D" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `cl-tapper cl-leave ${verdict.slain ? "hy-leave" : ""}`, onClick: onClose, children: verdict.slain ? "CLAIM THE CARCASS" : "CRAWL AWAY" })
        ] })
      ] })
    ] });
  }
  var COLLECTOR_EX = [
    ["AIR SQUATS", 1],
    ["PUSH-UPS", 0.7],
    ["SIT-UPS", 0.85],
    ["JUMPING JACKS", 1.6],
    ["BURPEES", 0.45]
  ];
  function CollectorEncounter({ debt, onResolve, onClose }) {
    const [sc, setSc] = (0, import_react41.useState)("intro");
    const [stamped, setStamped] = (0, import_react41.useState)(0);
    const [armed, setArmed] = (0, import_react41.useState)(false);
    const [slam, setSlam] = (0, import_react41.useState)(false);
    const [shakeCls, setShakeCls] = (0, import_react41.useState)("");
    const shakeT = (0, import_react41.useRef)(null);
    const [left, setLeft] = (0, import_react41.useState)(debt.time);
    const [urgent, setUrgent] = (0, import_react41.useState)(false);
    const [verdict, setVerdict] = (0, import_react41.useState)(null);
    const committed = (0, import_react41.useRef)(false);
    const wholeRef = (0, import_react41.useRef)(Math.ceil(debt.time));
    const [tickK, setTickK] = (0, import_react41.useState)(0);
    const buzz = (p) => {
      try {
        if (navigator.vibrate) navigator.vibrate(p);
      } catch (e) {
      }
    };
    const jolt = (big) => {
      clearTimeout(shakeT.current);
      setShakeCls("");
      requestAnimationFrame(() => setShakeCls(big ? "cl-sk" : "cl-sk2"));
      shakeT.current = setTimeout(() => setShakeCls(""), 700);
      buzz(big ? [40, 30, 40] : 20);
    };
    (0, import_react41.useEffect)(() => {
      if (sc !== "intro") return;
      const T = [];
      const at = (ms, f) => T.push(setTimeout(f, ms));
      at(2e3, () => {
        setStamped(1);
        jolt(false);
      });
      at(3800, () => {
        setStamped(2);
        setSlam(true);
        jolt(true);
      });
      at(5400, () => setStamped(3));
      at(7e3, () => setStamped(4));
      at(8600, () => {
        setStamped(5);
        jolt(false);
      });
      at(10400, () => {
        setStamped(6);
        buzz(15);
      });
      at(11600, () => {
        setStamped(7);
        buzz(15);
      });
      at(12800, () => {
        setStamped(8);
        setArmed(true);
        jolt(false);
      });
      at(14600, () => setSc("count"));
      return () => T.forEach(clearTimeout);
    }, [sc]);
    (0, import_react41.useEffect)(() => {
      if (sc !== "count") return;
      const iv = setInterval(() => setLeft((l) => l - 0.25), 250);
      return () => clearInterval(iv);
    }, [sc]);
    const URG = debt.time > 90 ? 60 : Math.round(debt.time / 3);
    (0, import_react41.useEffect)(() => {
      if (sc !== "count") return;
      if (left <= URG && left > 0 && !urgent) {
        setUrgent(true);
        jolt(false);
      }
      const s2 = Math.max(0, Math.ceil(left));
      if (s2 !== wholeRef.current) {
        wholeRef.current = s2;
        if (urgent) {
          setTickK((k2) => k2 + 1);
          if (s2 <= 10) buzz(12);
        }
      }
      if (left <= 0 && !committed.current) {
        committed.current = true;
        const v = { paid: false, delta: -10 };
        setVerdict(v);
        setSc("verdict");
        onResolve(v);
      }
    }, [left, sc, urgent]);
    const settle = () => {
      if (committed.current) return;
      committed.current = true;
      const s2 = Math.max(0, Math.ceil(left));
      const bonus = Math.min(6, Math.floor(s2 / 30));
      const spare = `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`;
      const v = { paid: true, delta: 12 + bonus, bonus, spare };
      setVerdict(v);
      setSc("verdict");
      onResolve(v);
    };
    const clockStr = (() => {
      const s2 = Math.max(0, Math.ceil(left));
      return `${Math.floor(s2 / 60)}:${String(s2 % 60).padStart(2, "0")}`;
    })();
    const w = (n, cls, txt, style) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `cl-w ${cls} ${stamped >= n ? "on" : ""}`, style, children: txt });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl ${urgent ? "cl-urgent" : ""} ${slam ? "cl-slamfx" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-bg", style: artBG("bb-collector.jpg") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-scrim" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-inner ${shakeCls}`, children: [
        sc !== "verdict" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-name", children: "THE COLLECTOR" }),
        sc === "intro" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-dmw", children: [
          w(1, "cl-dem", "DEMANDS", { "--rot": "-1.6deg" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-numrel", children: [
            slam && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-rim" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-gsh" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-w cl-num ${stamped >= 2 ? "on" : ""}`, style: { "--rot": "1.2deg" }, children: [
              debt.reps,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: debt.ex })
            ] })
          ] }),
          w(3, "cl-clk", `IN ${Math.floor(debt.time / 60)}:${String(debt.time % 60).padStart(2, "0")}`, { "--rot": ".8deg" }),
          w(4, "cl-warn", "FAIL \u2014 HE TAKES 10 XP", { "--rot": "-.8deg" }),
          w(5, "cl-warn2", "THERE IS NO ESCAPE", { "--rot": ".9deg" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-tsnrow ${armed ? "armed" : ""}`, children: [
            w(6, "cl-tsn", "TIME", { "--rot": "-1.4deg" }),
            w(7, "cl-tsn", "STARTS", { "--rot": "1.1deg" }),
            w(8, "cl-tsn", "NOW", { "--rot": "-.9deg" })
          ] })
        ] }),
        sc === "count" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "cl-veil" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-ctb", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-ctlabel", children: [
              debt.reps,
              " ",
              debt.ex
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `cl-tclock ${urgent ? "tick" : ""}`, children: clockStr }, tickK),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-tbar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.max(0, left) / debt.time * 100}%` } }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-dbtn", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "cl-tapper", onClick: settle, children: "DONE \u2014 DEBT SETTLED" }) })
        ] }),
        sc === "verdict" && verdict && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-vscene", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `cl-vT ${verdict.paid ? "paid" : "took"}`, children: verdict.paid ? "PAID IN FULL" : "COLLECTED" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cl-ledger ${verdict.paid ? "" : "red"}`, children: [
            verdict.paid ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".25s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE DEBT" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "SETTLED" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".5s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "TIME TO SPARE" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: verdict.spare })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".75s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "INTEREST" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+12 XP",
                  verdict.bonus ? ` \xB7 EARLY +${verdict.bonus}` : ""
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: "1s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "NEXT DEBT" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "IT GROWS" })
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".25s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE CLOCK RAN OUT" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "UNPAID" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".5s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SEIZED" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "\u221210 XP" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-lrow", style: { animationDelay: ".75s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "THE DEBT" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "STANDS" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cl-ltot", children: [
              verdict.delta > 0 ? `+${verdict.delta}` : verdict.delta,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cl-vline", children: verdict.paid ? "\u201CA RARE PLEASURE. I'LL RETURN FOR MORE.\u201D" : "\u201CTHE BODY ALWAYS PAYS. ONE WAY OR ANOTHER.\u201D" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "cl-tapper cl-leave", onClick: onClose, children: verdict.paid ? "LEAVE THE LEDGER" : "LIMP HOME" })
        ] })
      ] })
    ] });
  }
  function WorkoutStreak() {
    const todayStr = fmt(/* @__PURE__ */ new Date());
    const [data, setData] = (0, import_react41.useState)(null);
    const [saveError, setSaveError] = (0, import_react41.useState)(false);
    const [loadError, setLoadError] = (0, import_react41.useState)('');
    const [saveState, setSaveState] = (0, import_react41.useState)('Loading…');
    const [saveMessage, setSaveMessage] = (0, import_react41.useState)('');
    const [switchRequest, setSwitchRequest] = (0, import_react41.useState)(null);
    const [undoLabel, setUndoLabel] = (0, import_react41.useState)('');
    const undoRef = (0, import_react41.useRef)(null);
    const saveRevision = (0, import_react41.useRef)(0);
    const [timerReady, setTimerReady] = (0, import_react41.useState)(false);
    const rememberUndo = (label) => {undoRef.current=WorkoutCore.copy(data);setUndoLabel(label);};
    const undoLast = () => {
      if(!undoRef.current)return;
      const restored=undoRef.current;undoRef.current=null;setUndoLabel('');
      setData(restored);setRestEnd(null);setReadyAt(null);setManualSel(null);persist(restored);flash('Action undone');
    };
    const [toast, setToast] = (0, import_react41.useState)(null);
    const [banner, setBanner] = (0, import_react41.useState)(null);
    const statsRef = (0, import_react41.useRef)({ xp: 0 });
    const [confirmReset, setConfirmReset] = (0, import_react41.useState)(false);
    const [selDay, setSelDay] = (0, import_react41.useState)(todayStr);
    const [collectorEnc, setCollectorEnc] = (0, import_react41.useState)(null);
    const [hydraEnc, setHydraEnc] = (0, import_react41.useState)(null);
    const [jesterEnc, setJesterEnc] = (0, import_react41.useState)(null);
    const [exName, setExName] = (0, import_react41.useState)("");
    const [kg, setKg] = (0, import_react41.useState)("");
    const [reps, setReps] = (0, import_react41.useState)("");
    const [cMin, setCMin] = (0, import_react41.useState)("");
    const [cKm, setCKm] = (0, import_react41.useState)("");
    const [renaming, setRenaming] = (0, import_react41.useState)(null);
    const [renameVal, setRenameVal] = (0, import_react41.useState)("");
    const [restEnd, setRestEnd] = (0, import_react41.useState)(null);
    const [restTotal, setRestTotal] = (0, import_react41.useState)(90);
    const [readyAt, setReadyAt] = (0, import_react41.useState)(null);
    const [now, setNow] = (0, import_react41.useState)(Date.now());
    const [photoThumbs, setPhotoThumbs] = (0, import_react41.useState)({});
    const [startCardio, setStartCardio] = (0, import_react41.useState)(false);
    const [cardioFlow, setCardioFlow] = (0, import_react41.useState)(null);
    const [cfTick, setCfTick] = (0, import_react41.useState)(0);
    const [cfFill, setCfFill] = (0, import_react41.useState)(null);
    (0, import_react41.useEffect)(() => {
      if (!cardioFlow || cardioFlow.step !== "run") return;
      const i = setInterval(() => setCfTick((x2) => x2 + 1), 500);
      return () => clearInterval(i);
    }, [cardioFlow && cardioFlow.step]);
    const [expandedDay, setExpandedDay] = (0, import_react41.useState)(null);
    const fightOutcomeRef = (0, import_react41.useRef)(null);
    (0, import_react41.useEffect)(() => {
      consumeFightOutcome();
    }, [data]);
    const [manualSel, setManualSel] = (0, import_react41.useState)(null);
    const [resetArm, setResetArm] = (0, import_react41.useState)(false);
    const [addOpen, setAddOpen] = (0, import_react41.useState)(false);
    const [doneCard, setDoneCard] = (0, import_react41.useState)(null);
    const [bbOutro, setBbOutro] = (0, import_react41.useState)(null);
    const [wsOpen, setWsOpen] = (0, import_react41.useState)(true);
    const wsLiveRef = (0, import_react41.useRef)(false);
    (0, import_react41.useEffect)(() => {
      const lg = data && data.logs ? data.logs[selDay] || {} : {};
      const live = !!(lg.startedAt && !lg.durationMin);
      if (live && !wsLiveRef.current) setWsOpen(true);
      wsLiveRef.current = live;
    }, [data, selDay]);
    const [stretching, setStretching] = (0, import_react41.useState)(null);
    const [absTimer, setAbsTimer] = (0, import_react41.useState)(null);
    const [drag, setDrag] = (0, import_react41.useState)(null);
    const dragRef = (0, import_react41.useRef)(null);
    const [prSplit, setPrSplit] = (0, import_react41.useState)("PUSH");
    const [trendView, setTrendView] = (0, import_react41.useState)("week");
    const [ckFreq, setCkFreq] = (0, import_react41.useState)(null);
    const [ckPend, setCkPend] = (0, import_react41.useState)(null);
    const [ckOpen, setCkOpen] = (0, import_react41.useState)(false);
    const [ckNoteFor, setCkNoteFor] = (0, import_react41.useState)(null);
    const [ckNote, setCkNote] = (0, import_react41.useState)("");
    const [ckSel, setCkSel] = (0, import_react41.useState)(null);
    const [tab, setTab] = (0, import_react41.useState)("today");
    const [wkSplit, setWkSplit] = (0, import_react41.useState)("PUSH");
    const [wkPad, setWkPad] = (0, import_react41.useState)(null);
    const [wkPairSel, setWkPairSel] = (0, import_react41.useState)(null);
    const [absFails, setAbsFails] = (0, import_react41.useState)({});
    const [wkPadStr, setWkPadStr] = (0, import_react41.useState)("");
    const [wkPadFresh, setWkPadFresh] = (0, import_react41.useState)(false);
    const [wkEdit, setWkEdit] = (0, import_react41.useState)(null);
    const [denVisit, setDenVisit] = (0, import_react41.useState)(0);
    (0, import_react41.useEffect)(() => {
      if (tab === "bosses") setDenVisit((v) => v + 1);
    }, [tab]);
    const [bkMode, setBkMode] = (0, import_react41.useState)(null);
    const [bkText, setBkText] = (0, import_react41.useState)("");
    const [backupBusy,setBackupBusy]=(0,import_react41.useState)(false);
    const [beltRolling, setBeltRolling] = (0, import_react41.useState)(false);
    const beltTimer = (0, import_react41.useRef)(0);
    const photoInputRef = (0, import_react41.useRef)(null);
    (0, import_react41.useEffect)(() => {
      if (!data) return;
      (async () => {
        for (const ds of data.photoDates || []) {
          if (photoThumbs[ds]) continue;
          try {
            const res = await window.storage.get(`photo:${ds}`);
            if (res && res.value)
              setPhotoThumbs((t) => ({ ...t, [ds]: res.value }));
          } catch (e) {
          }
        }
      })();
    }, [data]);
    const dayLogForTimer = data && selDay ? data.logs[selDay] : null;
    const sessionLive = !!(dayLogForTimer && dayLogForTimer.startedAt && !dayLogForTimer.durationMin);
    (0, import_react41.useEffect)(() => {
      if (!restEnd && !sessionLive && !stretching && !absTimer) return;
      const id = setInterval(() => setNow(Date.now()), 500);
      return () => clearInterval(id);
    }, [restEnd, sessionLive, stretching, absTimer]);
    (0, import_react41.useEffect)(() => {
      if (restEnd && now >= restEnd) {
        beepAndBuzz();
        setReadyAt(Date.now());
        setRestEnd(null);
        setToast("Rest over \u2014 next set \u{1F3CB}\uFE0F");
        setTimeout(() => setToast(null), 1800);
      }
    }, [now, restEnd]);
    (0, import_react41.useEffect)(() => {
      if (!stretching || now < stretching.end) return;
      beepAndBuzz();
      if (stretching.phase === "ready") {
        setStretching({ idx: 0, phase: "go", end: Date.now() + 45e3 });
      } else if (stretching.phase === "go") {
        if (stretching.idx + 1 < STRETCH_MINUTES) {
          setStretching({ idx: stretching.idx, phase: "change", end: Date.now() + 3e3 });
        } else {
          finishStretch();
        }
      } else {
        setStretching({ idx: stretching.idx + 1, phase: "go", end: Date.now() + 45e3 });
      }
    }, [now, stretching]);
    (0, import_react41.useEffect)(() => {
      if (!absTimer || absTimer.end == null || now < absTimer.end) return;
      beepAndBuzz();
      if (absTimer.phase === "ready") absGoMove(0);
      else if (absTimer.phase === "move") {
        const f = absForm(ABS_CIRCUIT[absTimer.i]);
        if (f && f.type === "hold" && f.per && (absTimer.side || 1) < 2)
          setAbsTimer({ phase: "flip", i: absTimer.i, end: Date.now() + 5e3 });
        else absAfterMove(absTimer.i);
      } else if (absTimer.phase === "flip")
        setAbsTimer({ phase: "move", i: absTimer.i, side: 2, end: Date.now() + absTargetOf(ABS_CIRCUIT[absTimer.i]) * 1e3 });
      else if (absTimer.phase === "rest") absGoMove(absTimer.i + 1);
    }, [now, absTimer]);
    (0, import_react41.useEffect)(() => {
      setManualSel(null);
      setRenaming(null);
      setStartCardio(false);
      setAddOpen(false);
    }, [selDay]);
    (0, import_react41.useEffect)(() => {
      (async () => {
        try {
          const loaded = await safeStore.load();
          const ready = WorkoutCore.migrate(loaded || emptyData());
          setData(ready);
          await persist(ready);
          try {
          const timer = await window.storage.get('workout-streak:timer:v2');
          if(timer?.value) {
            const t=JSON.parse(timer.value),day=ready.logs[todayStr];
            if(t.day===todayStr && t.sessionId===day?.sessionId && day?.status==='active') {
              setRestTotal(t.restTotal || 90);
              setRestEnd(t.restEnd>Date.now()?t.restEnd:null);
              setReadyAt(t.restEnd&&t.restEnd<=Date.now()?Date.now():t.readyAt||null);
            }
          }
          } catch {setSaveMessage('The saved rest timer could not be restored. Your workouts are intact.');}
          setTimerReady(true);
        } catch (e) {
          setLoadError(e.message || 'Your saved data could not be read. Nothing has been replaced.');
        }
      })();
    }, []);
    (0, import_react41.useEffect)(() => {
      if(!timerReady || !data)return;
      window.storage.set('workout-streak:timer:v2',JSON.stringify({day:selDay,sessionId:data.logs[selDay]?.sessionId,restEnd,restTotal,readyAt})).catch(()=>{setSaveMessage('The rest timer could not be saved.');});
    }, [timerReady,restEnd,restTotal,readyAt,selDay,data?.logs[selDay]?.sessionId]);
    const persist = async (next, keepUndo=false) => {
      if(!keepUndo){undoRef.current=null;setUndoLabel('');}
      const revision=++saveRevision.current;
      setSaveState('Saving…');
      try {
        await safeStore.save(next);
        if(revision===saveRevision.current){setSaveError(false);setSaveState('Saved on this device');setSaveMessage('');}
      } catch (e) {
        setSaveError(true);setSaveState('Not saved');setSaveMessage(e.message || 'Export a backup before closing this page.');
      }
    };
    const flash = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 1700);
    };
    const [confetti, setConfetti] = (0, import_react41.useState)(null);
    const [bossCard, setBossCard] = (0, import_react41.useState)(null);
    const [tauntPeek, setTauntPeek] = (0, import_react41.useState)({});
    const burstConfetti = (n, goldHeavy = false) => {
      const colors = goldHeavy ? ["#FFD666", "#FF8A3C", "#FFD666", "#F2F0EA", "#FFD666"] : ["#FF8A3C", "#FFD666", "#74B3FF", "#58B368", "#F2F0EA"];
      const parts = Array.from({ length: n }, (_, i) => ({
        id: i,
        x: 4 + Math.random() * 92,
        delay: Math.random() * (goldHeavy ? 0.7 : 0.35),
        dur: 1.1 + Math.random() * (goldHeavy ? 1.4 : 0.9),
        size: 5 + Math.random() * 6,
        rot: Math.floor(Math.random() * 360),
        drift: -40 + Math.random() * 80,
        color: colors[i % colors.length],
        round: Math.random() < 0.35
      }));
      setConfetti(parts);
      setTimeout(() => setConfetti(null), goldHeavy ? 3400 : 2400);
    };
    const celebrate = (msg, tier = "big") => {
      const amount = parseInt((msg.match(/\+(\d+)\s*XP/i) || [])[1] || 0, 10);
      const xpBefore = statsRef.current.xp || 0;
      const cross = amount > 0 && levelFor(xpBefore + amount).cur !== levelFor(xpBefore).cur;
      setBanner({ msg, xpBefore, amount });
      setTimeout(() => setBanner(null), amount > 0 ? cross ? 7200 : 5200 : 3200);
      if (tier === "small") return;
      fanfare(false);
      burstConfetti(cross ? 80 : 44, cross);
    };
    const celebrateBoss = (t) => {
      setBossCard({ name: t.name, line: `${wDisp(t.kg)} ${UL} \xD7 ${t.reps}` });
      fanfare(true);
      burstConfetti(90, true);
    };
    const clone = (prev) => ({
      ...prev,
      completions: { ...prev.completions },
      shieldedWeeks: { ...prev.shieldedWeeks || {} },
      milestones: { ...prev.milestones },
      logs: { ...prev.logs }
    });
    const markOn = (next, ds, kind) => {
      const cur = next.completions[ds] || {};
      if (cur[kind]) return { already: true, awarded: null };
      next.completions[ds] = { ...cur, [kind]: true };
      const s2 = computeStats(next, todayStr);
      let awarded = null;
      for (let m = 4; m <= s2.weekStreak; m += 4) {
        if (!next.milestones["wk" + m]) {
          next.milestones["wk" + m] = true;
          next.shields = Math.min(MAX_SHIELDS, next.shields + 1);
          awarded = m;
        }
      }
      return { already: false, awarded };
    };
    const toggleMark = (0, import_react41.useCallback)(
      (ds, kind) => {
        setData((prev) => {
          if (!prev) return prev;
          const next = clone(prev);
          const cur = { ...next.completions[ds] || {} };
          if (cur[kind]) {
            delete cur[kind];
            if (cur.gym || cur.cardio) next.completions[ds] = cur;
            else delete next.completions[ds];
            flash(kind === "gym" ? "Gym unmarked" : "Cardio unmarked");
            persist(next);
            return next;
          }
          const prevStats = computeStats(prev, todayStr);
          const { awarded } = markOn(next, ds, kind);
          const s2 = computeStats(next, todayStr);
          const rec = s2.weekHistory.find((r2) => r2.ws === weekOf(ds));
          const isExtra = rec && (kind === "gym" ? rec.gym > rec.qg : rec.cardio > rec.qc);
          if (awarded) celebrate(`${awarded}-week streak \u2014 shield earned \u{1F6E1}\uFE0F`);
          else if (s2.perfectWeeks > prevStats.perfectWeeks)
            celebrate(`Week complete \u2014 +${WEEK_BONUS_XP} XP bonus \u{1F389}`);
          else
            flash(
              `+${isExtra ? XP_EXTRA[kind] : XP_FOR[kind]} XP \xB7 +${isExtra ? PS5_PER_EXTRA : PS5_PER_SESSION} min PS5`
            );
          persist(next);
          return next;
        });
      },
      [todayStr]
    );
    const addSet = () => {
      const name = exName.trim();
      const w = parseFloat(String(kg).replace(",", "."));
      const r2 = parseInt(String(reps).replace(",", "."), 10);
      if (!name) return flash("Name the exercise first");
      if (!(w >= 0) || !(r2 > 0)) return flash("Enter weight (0 for bodyweight) and reps");
      setData((prev) => {
        const next = clone(prev);
        const prevMax = prMapFrom(WorkoutCore.flattenedLogs(prev.logs))[prev.exerciseAliases?.[WorkoutCore.key(name)] || WorkoutCore.idFor(name)];
        const day = { exercises: [], ...next.logs[selDay] || {} };
        day.sessionId ||= WorkoutCore.uid();day.schemaVersion=2;day.status ||= 'active';
        day.exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        if (!day.startedAt && !day.durationMin) day.startedAt = Date.now();
        let ex = day.exercises.find((e) => e.name.toLowerCase() === name.toLowerCase());
        if (!ex) {
          ex = { name, exerciseId:next.exerciseAliases?.[WorkoutCore.key(name)]||WorkoutCore.idFor(name), sets: [] };
          day.exercises.push(ex);
        }
        ex.sets.push({ kg: w, reps: r2, done: true });
        next.logs[selDay] = day;
        const prevTargetsHit = sideStats(prev, todayStr).targetsAchieved;
        const { awarded } = markOn(next, selDay, "gym");
        const nowSide = sideStats(next, todayStr);
        const newlyHit = nowSide.targetsAchieved > prevTargetsHit ? nowSide.targets.find((t) => t.achievedDate === selDay) : null;
        const isPR = !prevMax || w > prevMax.kg;
        if (isPR && prevMax) next.prEvents = (next.prEvents || 0) + 1;
        if (awarded) celebrate(`${awarded}-week streak \u2014 shield earned \u{1F6E1}\uFE0F`);
        else if (newlyHit)
          celebrateBoss(newlyHit);
        else if (isPR && prevMax) celebrate(`New PR \u2014 ${name} ${wDisp(w)} ${UL} \u{1F3C6}`, "small");
        else flash(`Set logged \xB7 +${XP_PER_SET} XP`);
        persist(next);
        return next;
      });
      setReps("");
      if (data && data.restLen) {
        setRestEnd(Date.now() + data.restLen * 1e3);
        setNow(Date.now());
      }
    };
    const removeExercise = (dateStr, idx) => {
      rememberUndo('Remove exercise');
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[dateStr];
        if (!day) return prev;
        const exercises = day.exercises.filter((_, i) => i !== idx);
        next.logs[dateStr] = { ...day, exercises };
        persist(next,true);
        return next;
      });
      setManualSel(null);
    };
    const beginRename = (exIdx, name) => {
      setRenaming({ ex: exIdx });
      setRenameVal(name);
    };
    const cancelRename = () => {
      setRenaming(null);
      setRenameVal("");
    };
    const saveRename = () => {
      const name = renameVal.trim();
      if (!name) return flash("Name can't be empty");
      wsRename(renaming.ex,name,{kind:'rename',future:true});
      flash("Renamed \u2713");
      cancelRename();
    };
    const wsHistFor = (name) => {
      const ex={name,exerciseId:data.exerciseAliases?.[WorkoutCore.key(name)] || WorkoutCore.idFor(name)};
      return WorkoutCore.history(ex,data.logs,{date:selDay,sessionId:data.logs[selDay]?.sessionId,beforeAt:data.logs[selDay]?.startedAt})[0]?.sets || null;
    };
    const wsRename = (i, name, options={kind:'rename',future:true}) => {
      const clean = (name || "").trim();
      if (!clean) return;
      rememberUndo(options.kind==='replace'?'Replace exercise':'Rename exercise');
      let next;try{next=WorkoutCore.editExercise(data,selDay,i,clean,options);}catch(e){flash(e.message);return false;}
      setData(next);persist(next,true);
      flash(options.future?'Updated here and in your routine':'Updated this session only');
    };
    const wsRenameWorkout = (name,future=true) => {
      rememberUndo('Rename workout');
      setData(prev=>{const next=WorkoutCore.copy(prev),day=next.logs[selDay];if(!day)return prev;day.workoutName=name;if(future&&day.split)next.planNames={...next.planNames,[day.split]:name};persist(next,true);return next;});
      flash(future?'Workout and routine renamed':'Session renamed');
    };
    const wsAdd = (name, future=true) => {
      const clean = (name || "").trim();
      if (!clean) return;
      const hist = wsHistFor(clean);
      const sets = (hist || [{ kg: 0, reps: 8 }, { kg: 0, reps: 8 }, { kg: 0, reps: 8 }]).map(
        (s2) => ({ kg: s2.kg, reps: s2.reps,done:false })
      );
      rememberUndo('Add exercise');
      setData((prev) => {
        const next = clone(prev);
        const day = { exercises: [], ...next.logs[selDay] || {} };
        const entry={name:clean,exerciseId:prev.exerciseAliases?.[WorkoutCore.key(clean)]||WorkoutCore.idFor(clean),planEntryId:WorkoutCore.uid(),sets,rest:90};
        day.exercises = [...day.exercises.map((e) => ({ ...e, sets: [...e.sets] })), entry];
        if(future&&day.split)next.plans={...next.plans,[day.split]:[...(next.plans[day.split]||[]),{...entry,sets:sets.map(({kg,reps})=>({kg,reps}))}]};
        next.logs[selDay] = day;
        persist(next,true);
        return next;
      });
    };
    const summonHydra = () => {
      const hy = data.hydra || {};
      const slain = hy.slain || 0;
      const gymDays = Object.keys(data.completions || {}).filter((d) => data.completions[d].gym).length;
      const legend = Object.keys(data.trialDays || {}).length + Object.keys(data.trueForms || {}).length + (data.targets || []).filter((tt) => tt.gateBroken).length + Math.min(6, Math.floor(gymDays / 6));
      const mult = (1 + 0.04 * Math.max(0, legend - 3)) * Math.pow(1.06, slain);
      const heads = HYDRA_HEADS.map((h, i) => ({
        n: ["I", "II", "III", "IV", "V"][i],
        reps: Math.max(10, Math.round(h[1] * mult / 5) * 5),
        ex: h[0]
      }));
      const time2 = 1200 + 30 * slain;
      setData((prev) => {
        const next = clone(prev);
        next.hydra = { ...next.hydra || {}, last: selDay };
        persist(next);
        return next;
      });
      setHydraEnc({ heads, time: time2 });
    };
    function BossReflow() {
      (0, import_react41.useEffect)(() => {
        const kick = () => {
          const els = document.querySelectorAll(".sg, .sg-card");
          els.forEach((el) => {
            void el.getBoundingClientRect().width;
          });
        };
        kick();
        const r2 = requestAnimationFrame(kick);
        const t = setTimeout(kick, 120);
        return () => {
          cancelAnimationFrame(r2);
          clearTimeout(t);
        };
      }, []);
      return null;
    }
    function BossDeck({ children }) {
      const ref = (0, import_react41.useRef)(null);
      const [n, setN] = (0, import_react41.useState)(0);
      const [active, setActive] = (0, import_react41.useState)(0);
      (0, import_react41.useEffect)(() => {
        const el = ref.current;
        if (!el) return;
        const meta = { count: 1, stride: el.clientWidth };
        const measure = () => {
          const cards = el.querySelectorAll(".pc");
          meta.count = Math.max(1, Math.round(cards.length / 2));
          meta.stride = cards.length > 1 ? Math.abs(cards[1].offsetLeft - cards[0].offsetLeft) : el.clientWidth;
          setN(meta.count);
        };
        measure();
        const r2 = requestAnimationFrame(measure);
        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const half = el.scrollWidth / 2;
            if (half > 4 && el.scrollLeft >= half) el.scrollLeft -= half;
            if (meta.stride > 0) setActive((Math.round(el.scrollLeft / meta.stride) % meta.count + meta.count) % meta.count);
            ticking = false;
          });
        };
        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
          cancelAnimationFrame(r2);
          el.removeEventListener("scroll", onScroll);
        };
      }, []);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-deck", ref, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "contents" }, children }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { display: "contents" }, children })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-dots", children: Array.from({ length: n }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: i === active ? "on" : "" }, i)) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-swipe", children: "\u2039 swipe the deck \u203A" })
      ] });
    }
    function PlayCard({ art, artPos, tint, eyebrow, ebColor, status, statusCls, name, big, epithet, taunt, onTaunt, plaque, onRemove, children }) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `pc ${tint || ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pc-art", style: art ? artBG(art, artPos) : null }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pc-scrim" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "pc-frame" }),
        plaque && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pc-plaque", children: plaque }),
        onRemove && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "pc-x", onClick: onRemove, "aria-label": "Remove", children: "\u2715" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-top", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pc-eyebrow", style: ebColor ? { color: ebColor } : null, children: eyebrow }),
          status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `pc-status ${statusCls || ""}`, children: status })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-body", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `pc-name ${big ? "pc-big" : ""}`, children: name }),
          epithet && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pc-ep", children: epithet }),
          taunt && (onTaunt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "pc-taunt", onClick: onTaunt, children: [
            taunt,
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "\xB7 tap" })
          ] }, taunt) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pc-taunt", children: taunt })),
          children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pc-foot", children })
        ] })
      ] });
    }
    const jesterCtx = () => {
      const gymDays = Object.keys(data.completions || {}).filter((d) => data.completions[d].gym).length;
      const legend = Object.keys(data.trialDays || {}).length + Object.keys(data.trueForms || {}).length + (data.targets || []).filter((tt) => tt.gateBroken).length + Math.min(6, Math.floor(gymDays / 6));
      return { legend, xp: Math.max(0, xpInWindow(data, SEASON.start, todayStr)), banks: (data.jester || {}).banks || 0 };
    };
    const jesterSpend = () => {
      setData((prev) => {
        const next = clone(prev);
        next.jester = { ...next.jester || {}, stands: null };
        persist(next);
        return next;
      });
    };
    const jesterAnte = (ante) => {
      setData((prev) => {
        const next = clone(prev);
        next.collectorLog = {
          ...next.collectorLog || {},
          [selDay]: ((next.collectorLog || {})[selDay] || 0) - ante
        };
        persist(next);
        return next;
      });
    };
    const jesterResolve = (potWon, bank) => {
      setData((prev) => {
        const next = clone(prev);
        if (potWon > 0) {
          next.collectorLog = {
            ...next.collectorLog || {},
            [selDay]: ((next.collectorLog || {})[selDay] || 0) + potWon
          };
        }
        if (bank) {
          next.jester = { ...next.jester || {}, banks: ((next.jester || {}).banks || 0) + 1 };
        }
        persist(next);
        return next;
      });
    };
    const resolveHydra = (res) => {
      setData((prev) => {
        const next = clone(prev);
        next.collectorLog = {
          ...next.collectorLog || {},
          [selDay]: ((next.collectorLog || {})[selDay] || 0) + res.delta
        };
        if (res.slain) {
          next.hydra = { ...next.hydra || {}, slain: ((next.hydra || {}).slain || 0) + 1 };
          const c2 = next.completions[selDay] || {};
          next.completions[selDay] = { ...c2, gym: true };
        }
        persist(next);
        return next;
      });
    };
    const resolveCollector = (res) => {
      setData((prev) => {
        const next = clone(prev);
        next.collectorLog = {
          ...next.collectorLog || {},
          [selDay]: ((next.collectorLog || {})[selDay] || 0) + res.delta
        };
        if (res.paid)
          next.collector = { ...next.collector || {}, paid: ((next.collector || {}).paid || 0) + 1 };
        persist(next);
        return next;
      });
    };
    const launchWorkout = (t) => {
      loadTemplate(t);
    };
    const startSession = () => {
      setData((prev) => {
        const next = clone(prev);
        next.logs[selDay] = {
          exercises: [],
          ...next.logs[selDay] || {},
          sessionId: next.logs[selDay]?.sessionId || WorkoutCore.uid(),
          schemaVersion: 2,
          status: 'active',
          startedAt: next.logs[selDay]?.startedAt || Date.now(),
          durationMin: null
        };
        persist(next);
        return next;
      });
      flash("Clock running \u23F1");
      try {
        ["road-jester.jpg", "road-jester.jpeg", "card-jester.jpg", "bb-jester.jpg"].forEach((f) => {
          const im = new Image();
          im.src = f;
        });
      } catch (e) {
      }
    };
    const finishSession = () => {
      const currentDay=data.logs[selDay];
      if(!currentDay || currentDay.status==='completed' || currentDay.durationMin)return;
      if(!(currentDay.exercises||[]).some(e=>countableSets(e).length))return flash('Complete at least one set before finishing.');
      let ambushDebt = null;
      let tentPitch = false;
      if (data.logs[selDay] && data.logs[selDay].startedAt && !data.logs[selDay].durationMin) {
        const col = data.collector || {};
        const cool = col.last ? daysBetween(col.last, selDay) : 999;
        if (!(data.trialDays || {})[selDay] && !data.activeFight && cool >= 5 && Math.random() < 0.12) {
          const gymDays = Object.keys(data.completions || {}).filter((d) => data.completions[d].gym).length;
          const legend = Object.keys(data.trialDays || {}).length + Object.keys(data.trueForms || {}).length + (data.targets || []).filter((tt) => tt.gateBroken).length + Math.min(6, Math.floor(gymDays / 6));
          const paid = col.paid || 0;
          const pick = COLLECTOR_EX[(col.visits || 0) % COLLECTOR_EX.length];
          const reps2 = Math.max(10, Math.round((40 + 6 * legend + 4 * paid) * pick[1] / 5) * 5);
          const time2 = 180 + 10 * paid;
          ambushDebt = { ex: pick[0], reps: reps2, time: time2 };
        }
        if (!ambushDebt) {
          const jj = data.jester || {};
          const jGap = jj.last ? daysBetween(jj.last, selDay) : 99;
          if (!(data.trialDays || {})[selDay] && !data.activeFight && jGap >= 4 && Math.random() < 0.12) {
            tentPitch = true;
          }
        }
      }
      const summary={...WorkoutCore.comparison(data,selDay),dur:Math.max(1,Math.round((Date.now()-currentDay.startedAt)/60000)),extra:curRec.gym>=curRec.qg,rewardMinutes:data.completions[selDay]?.gym?0:curRec.gym>=curRec.qg?PS5_PER_EXTRA:PS5_PER_SESSION};
      setData((prev) => {
        const day = prev.logs[selDay];
        if (!day || !day.startedAt) return prev;
        const next = WorkoutCore.finish(prev,selDay);
        if(!prev.completions[selDay]?.gym) {
          next.completions[selDay]={...next.completions[selDay],gym:false};
          const {awarded}=markOn(next,selDay,'gym');
          if(awarded)celebrate(`${awarded}-week streak — shield earned`);
        }
        if (tentPitch) {
          next.jester = { ...next.jester || {}, last: selDay, stands: selDay };
        }
        if (ambushDebt) {
          const col = next.collector || {};
          next.collector = { ...col, last: selDay, visits: (col.visits || 0) + 1 };
        }
        persist(next);
        return next;
      });
      setRestEnd(null);
      if (summary && !tentPitch) setDoneCard(summary);
      if (ambushDebt) setCollectorEnc(ambushDebt);
      else if (tentPitch) setJesterEnc({ mode: "road" });
    };
    const startRestEx = (sec) => {
      setRestEnd(Date.now() + sec * 1e3);
      setNow(Date.now());
      if (data && data.restExLen !== sec) {
        setData((prev) => {
          const next = clone(prev);
          next.restExLen = sec;
          persist(next);
          return next;
        });
      }
    };
    const startRest = (sec) => {
      setRestEnd(Date.now() + sec * 1e3);
      setNow(Date.now());
      if (data && data.restLen !== sec) {
        setData((prev) => {
          const next = clone(prev);
          next.restLen = sec;
          persist(next);
          return next;
        });
      }
    };
    const saveCardio = () => {
      const m = parseFloat(String(cMin).replace(",", "."));
      const k2 = parseFloat(String(cKm).replace(",", "."));
      if (!(m > 0) && !(k2 > 0)) return flash("Enter minutes or distance");
      setData((prev) => {
        const next = clone(prev);
        next.logs[selDay] = {
          exercises: [],
          ...next.logs[selDay] || {},
          cardioMin: m > 0 ? m : null,
          cardioKm: k2 > 0 ? k2 : null
        };
        const { awarded } = markOn(next, selDay, "cardio");
        if (awarded) celebrate(`${awarded}-week streak \u2014 shield earned \u{1F6E1}\uFE0F`);
        else flash("Cardio logged \u2713");
        persist(next);
        return next;
      });
      setCMin("");
      setCKm("");
    };
    const loadTemplate = (tname, mode=null) => {
      if (!selDay) return;
      const current=data.logs[selDay];
      if(!mode && current?.startedAt && !current.durationMin && current.exercises.some(e=>countableSets(e).length)){
        setSwitchRequest(tname);return;
      }
      rememberUndo('Change routine');
      setData((prev) => {
        const next=WorkoutCore.prepare(prev,selDay,tname,mode||'replace');
        persist(next,true);
        return next;
      });
      setSwitchRequest(null);setRestEnd(null);setReadyAt(null);setWsOpen(true);setNow(Date.now());
      setExpandedDay(selDay);
    };
    const ssSetTotal = (ex, n) => {
      if (!ex || n < 1) return;
      if (ex.sets.length > n) ex.sets = ex.sets.slice(0, n);
      else while (ex.sets.length < n) ex.sets.push({ ...ex.sets[ex.sets.length - 1] });
    };
    const ssSyncPartner = (arr, ei) => {
      const ex = arr[ei];
      if (!ex) return;
      if (ex.ssNext && arr[ei + 1]) ssSetTotal(arr[ei + 1], ex.sets.length);
      else if (ei > 0 && arr[ei - 1] && arr[ei - 1].ssNext) ssSetTotal(arr[ei - 1], ex.sets.length);
    };
    const planLinkNext = (split, ei) => planUpdate(split, (arr) => {
      if (!arr[ei] || !arr[ei + 1]) return;
      arr[ei].ssNext = true;
      ssSetTotal(arr[ei + 1], arr[ei].sets.length);
    });
    const planUnlink = (split, ei) => planUpdate(split, (arr) => {
      if (arr[ei]) arr[ei].ssNext = false;
    });
    const planPairWith = (split, ei, j) => {
      planUpdate(split, (arr) => {
        if (!arr[ei] || !arr[j] || ei === j) return;
        if (j > 0 && arr[j - 1].ssNext) arr[j - 1].ssNext = false;
        const [moved] = arr.splice(j, 1);
        moved.ssNext = false;
        const base = j < ei ? ei - 1 : ei;
        arr.splice(base + 1, 0, moved);
        arr[base].ssNext = true;
        ssSetTotal(arr[base + 1], arr[base].sets.length);
      });
      setWkPairSel(null);
    };
    const planUpdate = (split, fn, keepUndo=false) => setData((prev) => {
      const next = clone(prev);
      next.plans = { ...next.plans || {} };
      next.plans[split] = (next.plans[split] || []).map((e) => ({ ...e, sets: e.sets.map((s2) => ({ ...s2 })) }));
      fn(next.plans[split]);
      persist(next,keepUndo);
      return next;
    });
    const planBlockPatch = (split, ei, bi, patch) => planUpdate(split, (arr) => {
      const ex = arr[ei];
      if (!ex) return;
      const blocks = toBlocks(ex.sets);
      if (!blocks[bi]) return;
      blocks[bi] = { ...blocks[bi], ...patch };
      ex.sets = fromBlocks(blocks);
      if (patch.count != null) ssSyncPartner(arr, ei);
    });
    const planAddBlock = (split, ei) => planUpdate(split, (arr) => {
      const ex = arr[ei];
      if (!ex) return;
      const blocks = toBlocks(ex.sets);
      const last2 = blocks[blocks.length - 1] || { kg: 20, reps: 10, count: 3 };
      blocks.push({ kg: Math.max(0, last2.kg - 10), reps: last2.reps, count: last2.count });
      ex.sets = fromBlocks(blocks);
      ssSyncPartner(arr, ei);
    });
    const planRmBlock = (split, ei, bi) => planUpdate(split, (arr) => {
      const ex = arr[ei];
      if (!ex) return;
      const blocks = toBlocks(ex.sets);
      if (blocks.length <= 1) return;
      blocks.splice(bi, 1);
      ex.sets = fromBlocks(blocks);
      ssSyncPartner(arr, ei);
    });
    const planSetRest = (split, ei, sec) => planUpdate(split, (arr) => {
      if (arr[ei]) arr[ei].rest = sec;
    });
    const planSetHigh = (split, ei, v) => planUpdate(split, (arr) => {
      const ex = arr[ei];
      if (!ex) return;
      const low = (toBlocks(ex.sets)[0] || { reps: 8 }).reps;
      ex.repHigh = Math.max(low, Math.min(100, v));
    });
    const planSetInc = (split, ei, v) => planUpdate(split, (arr) => {
      if (arr[ei]) arr[ei].inc = v;
    });
    const planAddEx = (split) => planUpdate(split, (arr) => {
      arr.push({ name: "New exercise", exerciseId:WorkoutCore.uid(),planEntryId:WorkoutCore.uid(),loadType:'external',rest: 90, repHigh: 10, inc: 2.5, sets: fromBlocks([{ kg: 0, reps: 10, count: 3 }]) });
    });
    const planDelEx = (split, ei) => {rememberUndo('Delete routine exercise');planUpdate(split, (arr) => {
      if (ei > 0 && arr[ei - 1] && arr[ei - 1].ssNext) arr[ei - 1].ssNext = false;
      arr.splice(ei, 1);
    },true);};
    const planRenameEx = (split, ei, name) => {
      const v = (name || "").trim();
      if (v) planUpdate(split, (arr) => {
        if (arr[ei]) arr[ei].name = v;
      });
      setWkEdit(null);
    };
    const planRenameSplit = (key, name) => {
      const v = (name || "").trim();
      setData((prev) => {
        const next = clone(prev);
        next.planNames = { ...next.planNames || {}, [key]: v || (next.planNames || {})[key] || key };
        persist(next);
        return next;
      });
      setWkEdit(null);
    };
    const setUnit = (u) => setData((prev) => {
      const next = clone(prev);
      next.unit = u;
      persist(next);
      return next;
    });
    const wDisp = (kg2) => data.unit === "lb" ? kgTrim(Math.round(kg2 * KGLB * 2) / 2) : kgTrim(kg2);
    const UL = uLbl(data && data.unit);
    const ULU = UL.toUpperCase();
    const wConv = (kg2) => data.unit === "lb" ? Math.round(kg2 * KGLB * 2) / 2 : kg2;
    const openPad = (split, ei, bi) => {
      const blocks = toBlocks((((data.plans || {})[split] || [])[ei] || {}).sets || []);
      const kg2 = (blocks[bi] || {}).kg || 0;
      const shown = data.unit === "lb" ? Math.round(kg2 * KGLB * 2) / 2 : kg2;
      setWkPad({ split, ei, bi });
      setWkPadStr(kgTrim(shown).replace(".", ","));
      setWkPadFresh(true);
    };
    const padKey = (k2) => {
      if (k2 === "bk") {
        setWkPadFresh(false);
        setWkPadStr((s3) => s3.slice(0, -1));
        return;
      }
      let s2 = wkPadFresh ? "" : wkPadStr;
      if (k2 === ",") s2 = s2.includes(",") ? s2 : (s2 || "0") + ",";
      else s2 = (s2 === "0" ? k2 : s2 + k2).slice(0, 6);
      setWkPadStr(s2);
      setWkPadFresh(false);
    };
    const padUnit = (u) => {
      if (u === data.unit) return;
      const cur = parseFloat((wkPadStr || "0").replace(",", ".")) || 0;
      const conv = u === "lb" ? cur * KGLB : cur / KGLB;
      setUnit(u);
      setWkPadStr((Math.round(conv * 2) / 2).toString().replace(".", ","));
      setWkPadFresh(true);
    };
    const applyPad = () => {
      if (!wkPad) return;
      const v = parseFloat((wkPadStr || "0").replace(",", ".")) || 0;
      const kg2 = data.unit === "lb" ? v / KGLB : v;
      planBlockPatch(wkPad.split, wkPad.ei, wkPad.bi, { kg: Math.round(kg2 * 10) / 10 });
      setWkPad(null);
      flash("Weight set");
    };
    const handlePhoto = async (e) => {
      const file = e.target.files && e.target.files[0];
      e.target.value = "";
      if (!file) return;
      try {
        const dataUrl = await downscalePhoto(file);
        await window.storage.set(`photo:${todayStr}`, dataUrl);
        setPhotoThumbs((t) => ({ ...t, [todayStr]: dataUrl }));
        setData((prev) => {
          const next = clone(prev);
          next.photoDates = [
            ...(prev.photoDates || []).filter((d) => d !== todayStr),
            todayStr
          ];
          persist(next);
          return next;
        });
        flash(`Progress logged \u{1F4F8} +${PHOTO_XP} XP`);
      } catch (err) {
        flash("Couldn't save the photo \u2014 try again");
      }
    };
    const deletePhoto = async (ds) => {
      try {
        await window.storage.delete(`photo:${ds}`);
      } catch (e) {
      }
      setPhotoThumbs((t) => {
        const c2 = { ...t };
        delete c2[ds];
        return c2;
      });
      setData((prev) => {
        const next = clone(prev);
        next.photoDates = (prev.photoDates || []).filter((d) => d !== ds);
        persist(next);
        return next;
      });
      flash("Photo removed");
    };
    const startNicotine = () => {
      setData((prev) => {
        const next = clone(prev);
        next.sideBets = { ...prev.sideBets || {}, nicotineStart: todayStr, nicotineUse: {} };
        persist(next);
        return next;
      });
      flash(`Taper started \u2014 ${NIC_STEPS[0].limit} pouches/day this month, stepping down to 0`);
    };
    const startAlcohol = () => {
      setData((prev) => {
        const next = clone(prev);
        next.sideBets = {
          ...prev.sideBets || {},
          alcoholStart: todayStr,
          alcoholUse: (prev.sideBets || {}).alcoholUse || {}
        };
        persist(next);
        return next;
      });
      flash(`Taper started \u2014 max ${ALC_PLAN.limit} drinks/day, then ${ALC_PLAN.after}`);
    };
    const logHabit = (useKey, startKey, limitAt, delta, ds = todayStr) => {
      const sb = data && data.sideBets || {};
      const startDs = sb[startKey];
      const cur = Math.max(0, ((sb[useKey] || {})[ds] || 0) + delta);
      const lim = (startDs ? limitAt(startDs, ds) : limitAt(ds, ds)) + (useKey === "alcoholUse" ? stats.side.alc.bank : 0);
      setData((prev) => {
        const psb = prev.sideBets || {};
        const use = { ...psb[useKey] || {} };
        const val = Math.max(0, (use[ds] || 0) + delta);
        if (val === 0) delete use[ds];
        else use[ds] = val;
        const next = clone(prev);
        next.sideBets = { ...psb, [useKey]: use };
        persist(next);
        return next;
      });
      const label = ds === todayStr ? "today" : niceDate(ds);
      if (delta < 0) flash("Undone \u21A9");
      else if (cur > lim) flash(`Over the limit for ${label} \u2014 streak pauses there`);
      else flash(`${cur}/${lim} ${label}`);
    };
    const logNic = (delta, ds) => logHabit("nicotineUse", "nicotineStart", nicLimitAt, delta, ds);
    const logAlc = (delta, ds) => logHabit("alcoholUse", "alcoholStart", alcLimitAt, delta, ds);
    const removeTarget = (id) => {
      setData((prev) => {
        const next = clone(prev);
        next.targets = (prev.targets || []).filter((t) => t.id !== id);
        persist(next);
        return next;
      });
    };
    const walkChange = (v, mode) => {
      const tm = data && data.treadmill || {};
      const cur = tm[todayStr] || 0;
      const newToday = Math.max(0, mode === "set" ? v : cur + v);
      const prevTotal = Object.values(tm).reduce((a2, b) => a2 + b, 0);
      const newTotal = prevTotal - cur + newToday;
      if (newTotal !== prevTotal) {
        setBeltRolling(true);
        clearTimeout(beltTimer.current);
        beltTimer.current = setTimeout(() => setBeltRolling(false), 1600);
      }
      setData((prev) => {
        const next = clone(prev);
        const ptm = { ...prev.treadmill || {} };
        if (newToday === 0) delete ptm[todayStr];
        else ptm[todayStr] = Math.round(newToday * 100) / 100;
        next.treadmill = ptm;
        persist(next);
        return next;
      });
      const crossed = newTotal > prevTotal ? WALK_MILESTONES.find((m) => prevTotal < m.km && newTotal >= m.km) : null;
      if (crossed) celebrate(`\u{1F6B6} You've now covered ${crossed.label}!`);
      else {
        const before = walkTierFor(cur);
        const after = walkTierFor(newToday);
        if (after && after !== before) {
          celebrate(`${after.name}. +${after.xp} XP`);
          if (after.km >= 20) setTimeout(() => burstConfetti(46, true), 400);
        } else {
          flash(
            `Today ${Math.round(newToday * 10) / 10} km \xB7 total ${Math.round(newTotal * 10) / 10} km`
          );
        }
      }
    };
    const clearWalkToday = () => {
      walkChange(0, "set");
    };
    const saveCheckin = (f, s2, m) => {
      setData((prev) => {
        const next = clone(prev);
        const existing = (prev.checkins || {})[todayStr];
        const note = existing && typeof existing === "object" && existing.note ? existing.note : void 0;
        next.checkins = {
          ...prev.checkins || {},
          [todayStr]: { f, s: s2, m, ...note ? { note } : {} }
        };
        persist(next);
        return next;
      });
      setCkFreq(null);
      setCkPend(null);
      setCkOpen(false);
      setCkNoteFor(todayStr);
      setCkSel(null);
      flash("Check-in saved \u2713");
    };
    const moveExercise = (from, to) => {
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[from]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        const [moved] = exercises.splice(from, 1);
        exercises.splice(to, 0, moved);
        next.logs[selDay] = { ...day, exercises };
        persist(next);
        return next;
      });
      setManualSel(null);
    };
    const startStretch = () => {
      setStretching({ idx: -1, phase: "ready", end: Date.now() + 5e3 });
      setNow(Date.now());
    };
    const stretchStep = () => {
      setStretching((st) => {
        if (!st) return st;
        if (st.idx + 1 >= STRETCH_MINUTES) {
          finishStretch();
          return null;
        }
        return { idx: st.idx + 1, phase: "go", end: Date.now() + 45e3 };
      });
    };
    const finishStretch = () => {
      setStretching(null);
      setData((prev) => {
        const next = clone(prev);
        next.stretch = { ...prev.stretch || {}, [todayStr]: "15 min" };
        persist(next);
        return next;
      });
      celebrate(`Stretched 15 min \u2713 +${STRETCH_XP} XP \u{1F9D8}`, "small");
    };
    const absSteps = (m) => data.absLv && data.absLv[m.name] != null ? data.absLv[m.name] : Math.max(0, (data.absLevel || 1) - 1);
    const absEvolved = (slotName) => !!(data.absEvo || {})[slotName];
    const absForm = (m) => m && absEvolved(m.name) && ABS_EVOLVED[m.name] ? ABS_EVOLVED[m.name] : m;
    const absTargetOf = (m) => absTarget(absForm(m), absSteps(m));
    const startAbs = () => {
      setAbsFails({});
      setAbsTimer({ phase: "ready", i: -1, end: Date.now() + 5e3 });
      setNow(Date.now());
    };
    const absGoMove = (idx) => {
      const m = ABS_CIRCUIT[idx];
      if (!m) {
        finishAbs();
        return;
      }
      if (absForm(m).type === "hold") {
        setAbsTimer({ phase: "move", i: idx, side: 1, end: Date.now() + absTargetOf(m) * 1e3 });
      } else {
        setAbsTimer({ phase: "move", i: idx });
      }
      setNow(Date.now());
    };
    const absAfterMove = (idx) => {
      if (idx + 1 >= ABS_CIRCUIT.length) {
        const m = ABS_CIRCUIT[idx];
        if (m && absForm(m).type === "hold" && !(absFails || {})[idx]) {
          setAbsTimer({ phase: "settle", i: idx });
          setNow(Date.now());
          return;
        }
        finishAbs();
        return;
      }
      setAbsTimer({ phase: "rest", i: idx, end: Date.now() + ABS_REST_S * 1e3 });
      setNow(Date.now());
    };
    const absNext = () => {
      if (!absTimer) return;
      if (absTimer.phase === "ready") absGoMove(0);
      else if (absTimer.phase === "move") {
        const f = absForm(ABS_CIRCUIT[absTimer.i]);
        if (f && f.type === "hold" && f.per && (absTimer.side || 1) < 2)
          setAbsTimer({ phase: "flip", i: absTimer.i, end: Date.now() + 5e3 });
        else absAfterMove(absTimer.i);
      } else if (absTimer.phase === "flip")
        setAbsTimer({ phase: "move", i: absTimer.i, side: 2, end: Date.now() + absTargetOf(ABS_CIRCUIT[absTimer.i]) * 1e3 });
      else if (absTimer.phase === "rest") absGoMove(absTimer.i + 1);
      else if (absTimer.phase === "settle") finishAbs();
    };
    const absFail = () => {
      if (!absTimer || absTimer.i == null || absTimer.i < 0) return;
      setAbsFails((f) => ({ ...f, [absTimer.i]: true }));
      flash("Logged \u2014 next one \u2717");
      absAfterMove(absTimer.i);
    };
    const finishAbs = (failsOverride) => {
      const fromLevel = data.absLevel || 1;
      const fails = failsOverride || absFails || {};
      const evo0 = { ...data.absEvo || {} };
      const before = {};
      ABS_CIRCUIT.forEach((m) => {
        before[m.name] = absSteps(m);
      });
      const lv = {};
      const evo = { ...evo0 };
      const devolved = /* @__PURE__ */ new Set();
      const evolvedNow = /* @__PURE__ */ new Set();
      ABS_CIRCUIT.forEach((m, k2) => {
        let s2 = before[m.name];
        if (fails[k2]) {
          if (evo0[m.name] && s2 <= 0) {
            evo[m.name] = false;
            s2 = absNotches(m);
            devolved.add(k2);
          } else s2 = Math.max(0, s2 - 1);
        }
        lv[m.name] = s2;
      });
      ABS_CIRCUIT.forEach((m, k2) => {
        if (fails[k2] || evo[m.name] || !ABS_EVOLVED[m.name]) return;
        if (absTarget(m, lv[m.name]) >= m.cap) {
          evo[m.name] = true;
          lv[m.name] = 0;
          evolvedNow.add(k2);
        }
      });
      const formOf = (m) => evo[m.name] && ABS_EVOLVED[m.name] ? ABS_EVOLVED[m.name] : m;
      const progressOf = (m) => {
        const f = formOf(m);
        return (evo[m.name] ? 1 : 0) + Math.min(1, lv[m.name] / absNotches(f));
      };
      const eligible = ABS_CIRCUIT.map((m, k2) => ({ m, k: k2 })).filter(({ m, k: k2 }) => !fails[k2] && !evolvedNow.has(k2) && absTarget(formOf(m), lv[m.name] + 1) > absTarget(formOf(m), lv[m.name])).sort((a2, b) => progressOf(a2.m) - progressOf(b.m) || a2.k - b.k).slice(0, 3);
      eligible.forEach(({ m }) => {
        lv[m.name] = lv[m.name] + 1;
      });
      const grew = new Set(eligible.map(({ k: k2 }) => k2));
      const changes = ABS_CIRCUIT.map((m, k2) => {
        const wasF = evo0[m.name] && ABS_EVOLVED[m.name] ? ABS_EVOLVED[m.name] : m;
        const nowF = formOf(m);
        return {
          name: nowF.name,
          oldName: wasF.name,
          hold: nowF.type === "hold",
          oldHold: wasF.type === "hold",
          kind: evolvedNow.has(k2) ? "evolve" : devolved.has(k2) ? "devolve" : fails[k2] ? "down" : grew.has(k2) ? "up" : absTarget(nowF, lv[m.name] + 1) <= absTarget(nowF, lv[m.name]) ? "max" : "hold",
          from: absTarget(wasF, before[m.name]),
          to: absTarget(nowF, lv[m.name])
        };
      });
      const nf = Object.keys(fails).length;
      setData((prev) => {
        const next = clone(prev);
        next.absLv = { ...prev.absLv || {}, ...lv };
        next.absEvo = { ...prev.absEvo || {}, ...evo };
        next.absLevel = (prev.absLevel || 1) + 1;
        next.abs = { ...prev.abs || {}, [todayStr]: `core L${prev.absLevel || 1}${nf ? ` \xB7 ${nf}\u2717` : ""}` };
        persist(next);
        return next;
      });
      setAbsTimer({ phase: "done", fromLevel, changes, nf });
      celebrate(`Core circuit done \u2713 +${ABS_XP} XP`, "small");
      setNow(Date.now());
    };
    const skipExercise = (i) => {
      const exNow = ((data.logs[selDay] || {}).exercises || [])[i];
      const nowSkipped = !(exNow && exNow.skipped);
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[i]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        exercises[i] = { ...exercises[i], skipped: nowSkipped };
        next.logs[selDay] = { ...day, exercises };
        persist(next);
        return next;
      });
      setManualSel(null);
      flash(nowSkipped ? "Skipped \u2014 greyed out for today \u21B7" : "Back in the plan \u21B6");
    };
    const beginDrag = (i) => {
      dragRef.current = { from: i, hover: i };
      setDrag(dragRef.current);
    };
    const onDragMove = (x2, y2) => {
      if (!dragRef.current) return;
      const el = document.elementFromPoint(x2, y2);
      const row = el && el.closest ? el.closest("[data-exidx]") : null;
      if (row) {
        const idx = parseInt(row.getAttribute("data-exidx"), 10);
        if (!isNaN(idx) && dragRef.current.hover !== idx) {
          dragRef.current = { ...dragRef.current, hover: idx };
          setDrag(dragRef.current);
        }
      }
    };
    const endDrag = () => {
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (d && d.hover != null && d.hover !== d.from) {
        moveExercise(d.from, d.hover);
        flash("Order updated \u2195");
      }
    };
    const startBossFight = (t) => {
      if (!selDay) return;
      const isDL = stripLift(t.name).includes("deadlift");
      const floorKg = isDL ? 60 : 20;
      const r25 = (x2) => Math.max(floorKg, Math.round(x2 / 2.5) * 2.5);
      const W = t.kg;
      const ramp = [
        { kg: r25(W * 0.4), reps: 5, rest: 60 },
        { kg: r25(W * 0.5), reps: 5, rest: 90 },
        { kg: r25(W * 0.65), reps: 3, rest: 120 },
        { kg: r25(W * 0.75), reps: 2, rest: 150 },
        { kg: r25(W * 0.85), reps: 1, rest: 180 },
        { kg: r25(W * 0.92), reps: 1, rest: 240 }
        // checkpoint — if it grinds, retreat costs nothing
      ];
      setData((prev) => {
        const next = clone(prev);
        const day = { exercises: [], ...next.logs[selDay] || {} };
        const kept = (day.exercises || []).filter((e) => e.sets.some((s2) => s2.done)).map((e) => ({ ...e, sets: [...e.sets] }));
        day.exercises = [
          ...kept,
          { name: t.name, sets: [...ramp.map((s2) => ({ ...s2 })), { kg: t.kg, reps: t.reps }] }
        ];
        day.startedAt = day.startedAt || Date.now();
        delete day.durationMin;
        next.logs[selDay] = day;
        markOn(next, selDay, "gym");
        next.activeFight = { kind: "boss", tid: t.id, day: selDay };
        persist(next);
        return next;
      });
      setTab("today");
      setExpandedDay(selDay);
      setManualSel(null);
      flash("\u2694\uFE0F BOSS FIGHT \u2014 ramp loaded, last set is the kill");
    };
    const startGateFight = (t) => {
      if (!selDay) return;
      const isDL = stripLift(t.name).includes("deadlift");
      const floorKg = isDL ? 60 : 20;
      const r25 = (x2) => Math.max(floorKg, Math.round(x2 / 2.5) * 2.5);
      const gateKg = r25(t.kg * 0.93);
      const ramp = [
        { kg: r25(gateKg * 0.43), reps: 5, rest: 60 },
        { kg: r25(gateKg * 0.61), reps: 3, rest: 120 },
        { kg: r25(gateKg * 0.75), reps: 2, rest: 150 },
        { kg: r25(gateKg * 0.88), reps: 1, rest: 180 }
      ];
      setData((prev) => {
        const next = clone(prev);
        const day = { exercises: [], ...next.logs[selDay] || {} };
        const kept = (day.exercises || []).filter((e) => e.sets.some((s2) => s2.done)).map((e) => ({ ...e, sets: [...e.sets] }));
        day.exercises = [...kept, { name: t.name, sets: [...ramp, { kg: gateKg, reps: 1 }] }];
        day.startedAt = day.startedAt || Date.now();
        delete day.durationMin;
        next.logs[selDay] = day;
        markOn(next, selDay, "gym");
        next.activeFight = { kind: "gate", tid: t.id, day: selDay, gateKg };
        persist(next);
        return next;
      });
      setTab("today");
      setExpandedDay(selDay);
      setManualSel(null);
      flash("\u{1F479} GATEKEEPER \u2014 break the gate, last set is the blow");
    };
    const fightTheme = (t) => stripLift(t.name).includes("deadlift") ? {
      cls: "dl",
      bossF: ["The barrow trembles.", "The wyrm coils beneath the floor.", "Chalk. Breathe. Wake it."],
      bossReady: "Go. Drag it into the light.",
      trialF: ["The den breathes heat.", "The iron remembers every rep.", "Almost white-hot."],
      trialHot: "WHITE HOT"
    } : {
      cls: "bp",
      bossF: ["The dragon circles overhead.", "An iron sky above your chest.", "Chalk your hands. Almost time."],
      bossReady: "Go. Press the sky off you.",
      trialF: ["The beast settles on your chest.", "It grows heavier while you rest.", "Almost time to press it off."],
      trialHot: "PRESS IT OFF"
    };
    const gateInfoFor = (t) => stripLift(t.name).includes("deadlift") ? {
      emoji: "\u{1F480}",
      img: "grave-warden.png",
      name: "THE GRAVE WARDEN",
      title: "THE GRAVE WARDEN BARS THE BARROW",
      sub: "wakes the wyrm",
      taunts: [
        "\u201CThe dead lift easier than you.\u201D",
        "\u201CSix feet of iron between us.\u201D",
        "\u201CRest. The grave is patient.\u201D",
        "\u201CThe wyrm sleeps on your PS5 Pro. It's part of the hoard now.\u201D",
        "\u201CThat iron is beyond your muscles. Go play m\xF6ketti, you weak pussy bitch.\u201D",
        "\u201CI've buried stronger men than you. Recently.\u201D",
        "\u201COne hundred and fifty. The barrow door doesn't haggle.\u201D",
        "\u201CYour grip will quit before your pride. I've seen the order.\u201D",
        "\u201CDecember comes for everyone. The bar comes only for you.\u201D",
        "\u201CYou knock like a courier. Knock like a dragonslayer.\u201D"
      ],
      comeOn: "\u201CDig, then.\u201D"
    } : {
      emoji: "\u{1F311}",
      img: "shade.png",
      name: "THE SHADE",
      title: "THE SHADE SITS ON YOUR CHEST",
      sub: "casts it off",
      taunts: [
        "\u201CYou'll wake when I allow it.\u201D",
        "\u201CHeavier than your excuses.\u201D",
        "\u201CPress, little dreamer.\u201D",
        "\u201CChristmas comes. The console doesn't. Not for you.\u201D",
        "\u201CYou couldn't press a duvet off your chest, little dreamer. Stay down.\u201D",
        "\u201CYour alarm rings. I press snooze.\u201D",
        "\u201COne hundred and fifteen. Lighter than the sky. Heavier than you.\u201D",
        "\u201CI've watched you rack ninety and call it a day. So has the dragon.\u201D",
        "\u201CDream of lockout, dreamer. It's the closest you've come.\u201D",
        "\u201CThe bench remembers every bail. So do I.\u201D"
      ],
      comeOn: "\u201CThen press.\u201D"
    };
    const trialInfoFor = (t) => {
      const isDL = stripLift(t.name).includes("deadlift");
      const den = isDL ? { name: "THE WYRM'S DEN", cry: "NO ESCAPE. ONLY THROUGH." } : { name: "THE NIGHTMARE", cry: "PRESS THE BEAST OFF YOUR CHEST." };
      const days = Object.keys(data.trialDays || {}).filter((d) => data.trialDays[d] === t.id).sort();
      const last2 = days[days.length - 1];
      const since = last2 ? daysBetween(last2, todayStr) : 999;
      return { ...den, count: days.length, avail: since >= TRIAL_COOLDOWN_DAYS, reopenIn: TRIAL_COOLDOWN_DAYS - since };
    };
    const startTrial = (t) => {
      if (!selDay) return;
      const isDL = stripLift(t.name).includes("deadlift");
      const floorKg = isDL ? 60 : 20;
      const r25 = (x2) => Math.max(floorKg, Math.round(x2 / 2.5) * 2.5);
      const est = Math.max(bossReadiness(t).cur, t.kg * 0.6);
      const lastTrialDay = Object.keys(data.trialDays || {}).filter((d) => data.trialDays[d] === t.id).sort().pop();
      let lastW = 0;
      if (lastTrialDay) {
        for (const ex of (data.logs[lastTrialDay] || {}).exercises || []) {
          if (stripLift(ex.name) !== stripLift(t.name)) continue;
          for (const s2 of countableSets(ex)) if (s2.kg > lastW) lastW = s2.kg;
        }
      }
      const w = Math.min(Math.max(r25(est * 0.72), lastW + 2.5), r25(est * 0.85));
      const main = { name: t.name, sets: Array.from({ length: 5 }, () => ({ kg: w, reps: 5, rest: 90 })) };
      const acc = isDL ? [
        { name: "Romanian Deadlift", sets: Array.from({ length: 3 }, () => ({ kg: r25(est * 0.55), reps: 8 })) },
        { name: "Barbell Row", sets: Array.from({ length: 3 }, () => ({ kg: Math.max(20, Math.round(est * 0.45 / 2.5) * 2.5), reps: 8 })) }
      ] : [
        { name: "Close-Grip Bench Press", sets: Array.from({ length: 3 }, () => ({ kg: Math.max(20, Math.round(est * 0.55 / 2.5) * 2.5), reps: 8 })) },
        { name: "Push-Up", sets: [{ kg: 0, reps: 15 }] }
      ];
      setData((prev) => {
        const next = clone(prev);
        const day = { exercises: [], ...next.logs[selDay] || {} };
        const kept = (day.exercises || []).filter((e) => e.sets.some((s2) => s2.done)).map((e) => ({ ...e, sets: [...e.sets] }));
        day.exercises = [...kept, main, ...acc];
        day.startedAt = day.startedAt || Date.now();
        delete day.durationMin;
        next.logs[selDay] = day;
        markOn(next, selDay, "gym");
        next.activeFight = { kind: "trial", tid: t.id, day: selDay };
        persist(next);
        return next;
      });
      setTab("today");
      setExpandedDay(selDay);
      setManualSel(null);
      flash("\u2692\uFE0F TRIAL \u2014 25 reps. The forge keeps time.");
    };
    const clearDay = () => {
      if (!selDay) return;
      if (!resetArm) {
        setResetArm(true);
        setTimeout(() => setResetArm(false), 3e3);
        return;
      }
      setResetArm(false);
      rememberUndo('Clear day');
      setData((prev) => {
        const next = clone(prev);
        delete next.logs[selDay];
        delete next.completions[selDay];
        persist(next,true);
        return next;
      });
      setExpandedDay(null);
      setManualSel(null);
      flash("Day cleared \u2014 fresh start");
    };
    const dismissRecap = (ws) => {
      setData((prev) => {
        const next = clone(prev);
        next.recapSeen = ws;
        persist(next);
        return next;
      });
    };
    const saveNote = () => {
      const note = ckNote.trim();
      setData((prev) => {
        const next = clone(prev);
        const cur = (prev.checkins || {})[ckNoteFor];
        const base = cur == null ? { f: 0, s: 0 } : typeof cur === "number" ? { legacy: cur } : { ...cur };
        if (note) base.note = note;
        else delete base.note;
        next.checkins = { ...prev.checkins || {}, [ckNoteFor]: base };
        persist(next);
        return next;
      });
      setCkNoteFor(null);
      setCkNote("");
      flash(note ? "Note saved \u{1F4DD}" : "Note removed");
    };
    const exportBackup = async () => {
      try {
        const photos = {};
        for (const ds of data.photoDates || []) {
          const r2 = await window.storage.get(`photo:${ds}`);
          if (!r2?.value)throw Error('A saved photo is unavailable; the export would be incomplete.');
          photos[ds] = r2.value;
        }
        const payload = JSON.stringify({
          app: "workout-streak",
          version: 2,
          exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
          data,
          photos
        });
        setBkText(payload);
        setBkMode("export");
        setTab('stats');setWsOpen(false);
        try {
          await navigator.clipboard.writeText(payload);
          flash("Backup copied to clipboard \u{1F4BE}");
        } catch (e) {
          flash("Backup ready \u2014 copy or download below");
        }
      } catch (e) {
        setSaveMessage('Backup failed: '+e.message);
      }
    };
    const downloadBackup = () => {
      try {
        const blob = new Blob([bkText], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a2 = document.createElement("a");
        a2.href = url;
        a2.download = `workout-streak-backup-${todayStr}.json`;
        document.body.appendChild(a2);
        a2.click();
        a2.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2e3);
      } catch (e) {
        flash("Download blocked here \u2014 use Copy instead");
      }
    };
    const restoreBackup = async () => {
      setBackupBusy(true);
      const previousPhotos={};let photoWritesStarted=false;
      try {
        const parsed = JSON.parse(bkText);
        if (!parsed || parsed.app !== "workout-streak" || !parsed.data)
          return flash("That doesn't look like a workout-streak backup");
        const ready = WorkoutCore.migrate(parsed.data);
        const ph=parsed.photos||{};
        if(typeof ph!=='object'||Array.isArray(ph))throw Error('Invalid photos.');
        for(const ds of ready.photoDates||[])if(typeof ph[ds]!=='string'||!ph[ds].startsWith('data:image/'))throw Error('A photo listed in the backup is missing or invalid.');
        const oldPhotos={};
        for(const ds of new Set([...(data.photoDates||[]),...Object.keys(ph)])) {
          if(!/^\d{4}-\d{2}-\d{2}$/.test(ds))throw Error('Invalid photo date.');
          const photo=await window.storage.get(`photo:${ds}`);previousPhotos[ds]=photo?.value??null;
          if((data.photoDates||[]).includes(ds)){if(!photo?.value)throw Error('The current photos could not be backed up.');oldPhotos[ds]=photo.value;}
        }
        // Recovery copy is retained before replacing active data. No legacy seeds are reapplied.
        await window.storage.set('workout-streak:before-import',JSON.stringify({app:'workout-streak',version:2,data,photos:oldPhotos}));
        photoWritesStarted=true;
        for (const ds of Object.keys(ph)) {
          await window.storage.set(`photo:${ds}`,ph[ds]);
        }
        await safeStore.save(ready);
        setData(ready);
        setPhotoThumbs(ph);
        setBkMode(null);
        setBkText("");
        setSaveState('Saved on this device');setSaveError(false);setSaveMessage('');setRestEnd(null);setReadyAt(null);
        flash("Backup restored \u2713");
      } catch (e) {
        if(photoWritesStarted)for(const [ds,value] of Object.entries(previousPhotos)){try{if(value!==null)await window.storage.set(`photo:${ds}`,value);}catch{}}
        setSaveMessage('Restore failed: '+e.message);
      } finally {setBackupBusy(false);}
    };
    const exportRecoveryBackup=async()=>{
      try{for(const key of ['workout-streak:before-import','workout-streak:before-reset','workout-streak:original-v1']){const r=await window.storage.get(key);if(!r?.value)continue;const p=JSON.parse(r.value);if(!p.data&&p.photoDates?.length)continue;setBkText(JSON.stringify(p.data?p:{app:'workout-streak',version:1,data:p,photos:{}}));setBkMode('export');return;}flash('No pre-restore backup is stored on this device.');}catch(e){setSaveMessage(e.message);}
    };
    const spend = (min3) => {
      setData((prev) => {
        const next = clone(prev);
        next.spentMin = (prev.spentMin || 0) + min3;
        persist(next);
        return next;
      });
      flash(min3 > 0 ? "Enjoy the game \u{1F3AE}" : "Refunded \u21A9");
    };
    const resetAll = async () => {
      try {
        const photos={};for(const ds of data.photoDates||[]){const r=await window.storage.get(`photo:${ds}`);if(!r?.value)throw Error('A photo could not be backed up.');photos[ds]=r.value;}
        await window.storage.set('workout-streak:before-reset',JSON.stringify({app:'workout-streak',version:2,data,photos}));
        const fresh=WorkoutCore.migrate(emptyData());await safeStore.save(fresh);setData(fresh);setConfirmReset(false);setRestEnd(null);setReadyAt(null);
      } catch (e) {flash('Reset cancelled: backup could not be saved.');}
    };
    const walkMapPre = data && data.treadmill || {};
    const walkTotalPre = Math.round(Object.values(walkMapPre).reduce((a2, b) => a2 + b, 0) * 10) / 10;
    const walkTodayPre = Math.round((walkMapPre[todayStr] || 0) * 10) / 10;
    const walkTotalAnim = useCountUp(walkTotalPre);
    const walkTodayAnim = useCountUp(walkTodayPre);
    const memoStats=(0,import_react41.useMemo)(()=>data?computeStats(data,todayStr):null,[data,todayStr]);
    const ps5BalancePre = data ? (() => {
      const s2 = memoStats;
      const earned = (s2.totalSessions - s2.extras) * PS5_PER_SESSION + s2.extras * PS5_PER_EXTRA + s2.perfectWeeks * PS5_WEEK_BONUS;
      return earned - (data.spentMin || 0);
    })() : 0;
    const ps5Anim = useCountUp(ps5BalancePre);
    if (!data)
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "app", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Style, {}),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "loading", role:loadError?'alert':'status',children: loadError?`Your data has not been replaced. ${loadError} Keep your exported backup safe.`:"Loading your log\u2026" }),
        loadError&&import_jsx_runtime.jsx('button',{className:'chip',onClick:async()=>{try{const restored=await safeStore.recover();setData(restored);setLoadError('');setSaveState('Recovered and saved');setTimerReady(true);}catch(e){setLoadError(e.message);}},children:'Recover last valid local copy'})
      ] });
    const stats = memoStats;
    statsRef.current = stats;
    const lvl = levelFor(stats.xp);
    const earnedMin = (stats.totalSessions - stats.extras) * PS5_PER_SESSION + stats.extras * PS5_PER_EXTRA + stats.perfectWeeks * PS5_WEEK_BONUS;
    const ps5Balance = earnedMin - (data.spentMin || 0);
    const seasonActive = todayStr <= SEASON.end;
    const seasonXp = xpInWindow(data, SEASON.start, seasonActive ? todayStr : SEASON.end);
    const daysLeft = Math.max(
      0,
      Math.round((parse(SEASON.end) - parse(todayStr)) / 864e5)
    );
    const paceNeeded = Math.max(
      0,
      Math.ceil((SEASON.targetXp - seasonXp) / Math.max(1, daysLeft / 7))
    );
    const seasonWon = seasonXp >= SEASON.targetXp;
    const weekStart = startOfWeek(/* @__PURE__ */ new Date());
    const cells = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(weekStart, i);
      const ds = fmt(d);
      const comp = data.completions[ds] || {};
      const past = parse(ds) < parse(todayStr);
      const isToday = ds === todayStr;
      let status = "past";
      if (comp.gym && comp.cardio) status = "both";
      else if (comp.gym) status = "gymdone";
      else if (comp.cardio) status = "cardiodone";
      else if (isToday) status = "today";
      else if (!past) status = "future";
      return { ds, d, status, tappable: past || isToday, isToday };
    });
    const curRec = stats.weekHistory.find((r2) => r2.ws === fmt(weekStart)) || { gym: 0, cardio: 0 };
    const nextSplit = data.rotationQueue?.[0] || 'PUSH';
    const displayLogs = WorkoutCore.flattenedLogs(data.logs);
    const dayComp = data.completions[selDay] || {};
    const selLog = selDay && data.logs[selDay] || { exercises: [] };
    const fight = data.activeFight && data.activeFight.day === selDay ? data.activeFight : null;
    const fightTarget = fight ? (data.targets || []).find((t) => t.id === fight.tid) : null;
    const fightEx = fight && fightTarget && selLog ? (selLog.exercises || []).find((e) => stripLift(e.name) === stripLift(fightTarget.name)) : null;
    const liveSession = !!(selLog.startedAt && !selLog.durationMin);
    const currentSet = (() => {
      if (!liveSession) return null;
      const exs = selLog.exercises || [];
      for (let i = 0; i < exs.length; i++) {
        if (exs[i].skipped) continue;
        for (let j = 0; j < exs[i].sets.length; j++)
          if (!exs[i].sets[j].done) return { ex: i, set: j, name: exs[i].name, n: j + 1 };
      }
      return null;
    })();
    const restLeft = restEnd ? Math.max(0, Math.ceil((restEnd - now) / 1e3)) : 0;
    const panelSel = manualSel && selLog.exercises[manualSel.ex] && selLog.exercises[manualSel.ex].sets[manualSel.set] ? manualSel : liveSession && currentSet ? { ex: currentSet.ex, set: currentSet.set } : null;
    const wsLog = (i, j, kg2, reps2) => {
      rememberUndo('Complete set');
      const newKg = Math.max(0, Math.round(kg2 * 10) / 10);
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[i] || !day.exercises[i].sets[j]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        const prevKg = exercises[i].sets[j].kg;
        exercises[i].sets[j] = {
          ...exercises[i].sets[j],
          kg: newKg,
          reps: Math.max(1, Math.round(reps2))
        };
        for (let k2 = j + 1; k2 < exercises[i].sets.length; k2++) {
          const s2 = exercises[i].sets[k2];
          if (!s2.done && s2.kg === prevKg) exercises[i].sets[k2] = { ...s2, kg: newKg };
        }
        next.logs[selDay] = { ...day, exercises };
        persist(next,true);
        return next;
      });
      markSetDone(i, j, false);
    };
    function consumeFightOutcome() {
      const fo = fightOutcomeRef.current;
      if (!fo) return false;
      fightOutcomeRef.current = null;
      const { slain, gateT, trialT, trueFormWoke, trueFormKilled, resolvedBoss } = fo;
      if (trueFormWoke) {
        setRestEnd(null);
        setReadyAt(null);
        setNow(Date.now());
        return true;
      }
      if (slain || gateT || trialT || trueFormKilled) {
        const rows = [];
        if (gateT) rows.push(["GATE BROKEN", GATE_XP]);
        if (trialT) rows.push(["TRIAL SURVIVED", TRIAL_XP]);
        if (slain || resolvedBoss) rows.push(["BOSS SLAIN", TARGET_XP]);
        if (trueFormKilled) rows.push(["TRUE FORM FELLED", TRUEFORM_XP]);
        const t = slain || resolvedBoss || gateT || trialT;
        setBbOutro({
          target: t,
          kind: slain || resolvedBoss ? "boss" : gateT ? "gate" : "trial",
          trueForm: trueFormKilled,
          rows
        });
        if (slain || resolvedBoss) {
          fanfare(true);
          burstConfetti(90, true);
        } else if (gateT)
          celebrate(
            `\u2691 GATE BROKEN \u2014 ${gateT.name}! +${GATE_XP}${trueFormKilled ? ` +${TRUEFORM_XP}` : ""} XP`
          );
        else if (trialT) celebrate(`\u2692\uFE0F TRIAL SURVIVED \u2014 the den is cleared! +${TRIAL_XP} XP`);
        setRestEnd(null);
        setReadyAt(null);
        setNow(Date.now());
        return true;
      }
      return false;
    }
    const markSetDone = (i, j, remember=true) => {
      if(remember)rememberUndo('Complete set');
      const exSets = ((data.logs[selDay] || {}).exercises || [])[i]?.sets || [];
      const lastOfExercise = !exSets.some((s2, idx) => idx !== j && !s2.done);
      setData((prev) => {
        let slain = null;
        let gateT = null;
        let trialT = null;
        let trueFormWoke = false;
        let trueFormKilled = false;
        let resolvedBoss = null;
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[i]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        exercises[i].sets[j] = { ...exercises[i].sets[j], done: true };
        if (exercises[i].skipped) exercises[i] = { ...exercises[i], skipped: false };
        const doneSet = exercises[i].sets[j];
        const nm = stripLift(exercises[i].name);
        next.targets = (next.targets || []).map((t) => {
          if (!t.achievedDate && stripLift(t.name) === nm && doneSet.kg >= t.kg && doneSet.reps >= t.reps) {
            slain = { ...t, achievedDate: selDay };
            return slain;
          }
          return t;
        });
        const af = next.activeFight;
        const ft = af && af.day === selDay ? (next.targets || []).find((x2) => x2.id === af.tid) : null;
        if (ft && stripLift(exercises[i].name) === stripLift(ft.name)) {
          const allDone = exercises[i].sets.every((s2) => s2.done);
          const conquered = Object.keys(next.trueForms || {}).length + Object.keys(next.trialDays || {}).length;
          const odds = Math.min(TRUEFORM_CAP, TRUEFORM_BASE + TRUEFORM_STEP * conquered);
          const wakeTrueForm = () => {
            const isDL = stripLift(ft.name).includes("deadlift");
            const floorKg = isDL ? 60 : 20;
            const r25 = (x2) => Math.max(floorKg, Math.round(x2 / 2.5) * 2.5);
            let workKg = 0;
            for (const d of Object.keys(next.logs)) {
              for (const e of next.logs[d].exercises || []) {
                if (stripLift(e.name) !== stripLift(ft.name)) continue;
                for (const s2 of countableSets(e)) if (s2.reps >= 6 && s2.kg > workKg) workKg = s2.kg;
              }
            }
            const w = r25((workKg || ft.kg * 0.55) * 0.65);
            const reps2 = isDL ? [10, 8] : [12, 10];
            exercises[i] = {
              ...exercises[i],
              sets: [...exercises[i].sets, ...reps2.map((r2) => ({ kg: w, reps: r2, rest: P2_REST }))]
            };
            next.activeFight = { ...af, phase: 2, revivedAt: Date.now() };
            trueFormWoke = true;
          };
          if (af.phase === 2) {
            if (allDone) {
              next.trueForms = { ...next.trueForms || {}, [selDay]: ft.id };
              trueFormKilled = true;
              if (af.kind === "trial") {
                next.trialDays = { ...next.trialDays || {}, [selDay]: ft.id };
                trialT = ft;
              }
              if (af.kind === "gate" && !ft.gateBroken) {
                next.targets = next.targets.map(
                  (x2) => x2.id === ft.id ? { ...x2, gateBroken: selDay } : x2
                );
                gateT = { ...ft, gateBroken: selDay };
              }
              if (af.kind === "boss") resolvedBoss = ft;
              next.activeFight = null;
            }
          } else if (af.kind === "gate") {
            if (!ft.gateBroken && doneSet.kg >= (af.gateKg || Infinity) && doneSet.reps >= 1) {
              if (Math.random() < odds) wakeTrueForm();
              else {
                next.targets = next.targets.map(
                  (x2) => x2.id === ft.id ? { ...x2, gateBroken: selDay } : x2
                );
                gateT = { ...ft, gateBroken: selDay };
                next.activeFight = null;
              }
            }
          } else if (af.kind === "trial") {
            if (allDone) {
              if (Math.random() < odds) wakeTrueForm();
              else {
                next.trialDays = { ...next.trialDays || {}, [selDay]: ft.id };
                trialT = ft;
                next.activeFight = null;
              }
            }
          } else if (af.kind === "boss") {
            if (slain) next.activeFight = null;
          }
        }
        next.logs[selDay] = { ...day, exercises };
        fightOutcomeRef.current = slain || gateT || trialT || trueFormWoke || trueFormKilled || resolvedBoss ? { slain, gateT, trialT, trueFormWoke, trueFormKilled, resolvedBoss } : null;
        persist(next,true);
        return next;
      });
      setManualSel(null);
      if (consumeFightOutcome()) return;
      const plannedRest = (exSets[j] || {}).rest;
      const exObj = ((data.logs[selDay] || {}).exercises || [])[i];
      const exRest = exObj && REST_OPTS.includes(exObj.rest) ? exObj.rest : null;
      const base = exRest || (REST_OPTS.includes(data.restLen) ? data.restLen : 90);
      const exBase = REST_EX_OPTS.includes(data.restExLen) ? data.restExLen : 150;
      if (exObj && exObj.ss && !plannedRest) {
        const exsAll = (data.logs[selDay] || {}).exercises || [];
        const pIdx = exsAll.findIndex((e, k2) => k2 !== i && e.ss === exObj.ss && !e.skipped);
        if (pIdx >= 0) {
          const p = exsAll[pIdx];
          const myDone = exObj.sets.filter((s2) => s2.done).length + 1;
          const pDone = p.sets.filter((s2) => s2.done).length;
          const pUndone = p.sets.length - pDone;
          if (pUndone > 0 && pDone < myDone) {
            tickSound();
            setRestEnd(null);
            setReadyAt(Date.now());
            setNow(Date.now());
            return;
          }
          if (pUndone > 0 || !lastOfExercise) {
            const leader = exsAll[Math.min(i, pIdx)];
            const lRest = leader && REST_OPTS.includes(leader.rest) ? leader.rest : base;
            tickSound();
            setRestTotal(lRest);
            setReadyAt(null);
            setRestEnd(Date.now() + lRest * 1e3);
            setNow(Date.now());
            return;
          }
        }
      }
      tickSound();
      const dur = plannedRest || (lastOfExercise ? exBase : base);
      setRestTotal(dur);
      setReadyAt(null);
      setRestEnd(Date.now() + dur * 1e3);
      setNow(Date.now());
      if (lastOfExercise && !plannedRest) flash("Exercise done \u2014 longer break \u{1F4AA}");
    };
    const adjustSetAt = (t, dk, dr) => {
      if (!t) return;
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[t.ex]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        const s2 = exercises[t.ex].sets[t.set];
        exercises[t.ex].sets[t.set] = {
          ...s2,
          kg: Math.max(0, Math.round((s2.kg + dk) * 10) / 10),
          reps: Math.max(1, s2.reps + dr)
        };
        next.logs[selDay] = { ...day, exercises };
        persist(next);
        return next;
      });
    };
    const deleteSetAt = (t) => {
      if (!t) return;
      rememberUndo('Delete set');
      setData((prev) => {
        const next = clone(prev);
        const day = next.logs[selDay];
        if (!day || !day.exercises[t.ex]) return prev;
        const exercises = day.exercises.map((e) => ({ ...e, sets: [...e.sets] }));
        exercises[t.ex].sets.splice(t.set, 1);
        if (exercises[t.ex].sets.length === 0) exercises.splice(t.ex, 1);
        next.logs[selDay] = { ...day, exercises };
        persist(next,true);
        return next;
      });
      setManualSel(null);
      flash("Set removed");
    };
    const suggested = nextSplit;
    const recentNames = [];
    for (const date2 of Object.keys(data.logs).sort().reverse()) {
      for (const ex of data.logs[date2].exercises || []) {
        if (!recentNames.some((n) => n.toLowerCase() === ex.name.toLowerCase()))
          recentNames.push(ex.name);
      }
      if (recentNames.length >= 6) break;
    }
    const dayStarted = selLog.exercises.length > 0 || dayComp.gym || dayComp.cardio || selLog.cardioMin || selLog.cardioKm;
    const lastPhoto = (data.photoDates || []).slice().sort().pop() || null;
    const sincePhoto = lastPhoto ? Math.round((parse(todayStr) - parse(lastPhoto)) / 864e5) : null;
    const photoDue = !lastPhoto || sincePhoto >= PHOTO_EVERY_DAYS;
    const photoList = (data.photoDates || []).slice().sort().reverse();
    const walkMap = data.treadmill || {};
    const walkTotal = Math.round(Object.values(walkMap).reduce((a2, b) => a2 + b, 0) * 10) / 10;
    const walkToday = Math.round((walkMap[todayStr] || 0) * 10) / 10;
    const walkPassed = [...WALK_MILESTONES].reverse().find((m) => walkTotal >= m.km) || null;
    const walkNext = WALK_MILESTONES.find((m) => walkTotal < m.km) || null;
    const walkPrevKm = walkPassed ? walkPassed.km : 0;
    const walkPct = walkNext ? Math.min(100, (walkTotal - walkPrevKm) / (walkNext.km - walkPrevKm) * 100) : 100;
    const ckDates = Object.keys(data.checkins || {}).sort();
    const lastCk = ckDates[ckDates.length - 1] || null;
    const ckDue = !lastCk || daysBetween(lastCk, todayStr) >= CHECKIN_EVERY_DAYS;
    const photoNag = !!lastPhoto && sincePhoto >= PHOTO_EVERY_DAYS;
    const ckNag = !!lastCk && daysBetween(lastCk, todayStr) >= CHECKIN_EVERY_DAYS;
    const ckHistory = ckDates.slice(-8);
    const trendSeries = trendView === "year" ? buildMonthlySeries(data, todayStr) : buildDailySeries(data, todayStr, trendView === "month" ? 30 : 7);
    const volSeries = (() => {
      const out = [];
      const curW = startOfWeek(/* @__PURE__ */ new Date());
      for (let i = 7; i >= 0; i--) {
        const w = addDays(curW, -7 * i);
        let vol = 0;
        for (let j = 0; j < 7; j++) {
          const ds = fmt(addDays(w, j));
          vol += WorkoutCore.volume((displayLogs[ds] || {}).exercises || []);
        }
        out.push({
          label: w.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
          vol: Math.round(vol)
        });
      }
      return out;
    })();
    const resolveExercise = name => Object.values(data.plans||{}).flat().find(e=>WorkoutCore.key(e.name)===WorkoutCore.key(name)) || (selLog.exercises||[]).find(e=>WorkoutCore.key(e.name)===WorkoutCore.key(name)) || {name,exerciseId:data.exerciseAliases?.[WorkoutCore.key(name)]||WorkoutCore.idFor(name)};
    const lastTimeFor = (ex) => WorkoutCore.history(typeof ex==='string'?resolveExercise(ex):ex,data.logs,{date:selDay,sessionId:selLog.sessionId,beforeAt:selLog.startedAt})[0] || null;
    const computeProg = (name, splitKey, beforeDate) => {
      const planArr = (data.plans || {})[splitKey] || [];
      const p = planArr.find((x2) => (x2.name || "").toLowerCase() === (name || "").toLowerCase());
      const blocks = toBlocks(p ? p.sets : []);
      const top = blocks[0] || { kg: 0, reps: 8, count: 3 };
      const ex = {
        name,
        exerciseId:p?.exerciseId || resolveExercise(name).exerciseId,
        loadType:p?.loadType || 'external',
        sets: top.count || (p ? p.sets.length : 3),
        repLow: top.reps,
        repHigh: Math.max(top.reps, p && p.repHigh != null ? p.repHigh : top.reps),
        kg: top.kg,
        inc: p && p.inc
      };
      return WorkoutCore.progression(ex, WorkoutCore.history(ex,data.logs,beforeDate?{date:beforeDate,sessionId:selLog.sessionId,beforeAt:selLog.startedAt}:{}).slice(0,8),ex.inc||defaultInc(name,top.kg));
    };
    const EPLEY = (kg2, reps2) => kg2 * (1 + Math.min(reps2, 12) / 30);
    const bossReadiness = (t) => {
      const req = EPLEY(t.kg, t.reps);
      const needle = stripLift(t.name);
      let cur = 0;
      let bestSet = null;
      for (const d of Object.keys(displayLogs)) {
        for (const ex of displayLogs[d].exercises || []) {
          if (stripLift(ex.name) !== needle) continue;
          for (const s2 of countableSets(ex)) {
            const e = EPLEY(s2.kg, s2.reps);
            if (e > cur) {
              cur = e;
              bestSet = `${wDisp(s2.kg)}\xD7${s2.reps}`;
            }
          }
        }
      }
      const pct = req > 0 ? Math.min(100, Math.round(cur / req * 100)) : 0;
      const tier = pct >= 100 ? { label: "SEND IT", cls: "ready" } : pct >= 92 ? { label: "AT THE GATES", cls: "close" } : pct >= 75 ? { label: "FORGING", cls: "building" } : { label: "TRAINING ARC", cls: "grinding" };
      return { req, cur, bestSet, pct, verdict: tier.label, vcls: tier.cls };
    };
    const progressFor = (name) => {
      const resolved=resolveExercise(name),assisted=WorkoutCore.loadType(resolved)==='assisted';
      const hist=WorkoutCore.history(resolved,data.logs).reverse().map(s=>({d:s.date,kg:(assisted?Math.min:Math.max)(...s.sets.map(s=>s.kg))}));
      if (!hist.length) return null;
      const first = hist[0];
      const last2 = hist[hist.length - 1];
      const dk = Math.round((last2.kg - first.kg) * 10) / 10;
      const pct = first.kg > 0 ? Math.round(dk / first.kg * 100) : 0;
      return { first, last: last2, dk, pct, assisted, improvement:assisted?-dk:dk, sessions: hist.length };
    };
    const prevWeekRec = stats.weekHistory.length > 1 ? stats.weekHistory[stats.weekHistory.length - 2] : null;
    const showRecap = !!prevWeekRec && data.recapSeen !== prevWeekRec.ws;
    let recap = null;
    if (showRecap) {
      const rws = prevWeekRec.ws;
      const rwe = fmt(addDays(parse(rws), 6));
      let rWalk = 0;
      for (const [d, km] of Object.entries(data.treadmill || {})) {
        if (d >= rws && d <= rwe) rWalk += km;
      }
      const betDays = (startDs, useMap, limitAt, bankCap = 0) => {
        if (!startDs || startDs > rwe) return null;
        let ok = 0;
        let n = 0;
        let bank = 0;
        let d = parse(startDs);
        const end = parse(rwe);
        while (d <= end) {
          const ds = fmt(d);
          const base = limitAt(startDs, ds);
          const use = (useMap || {})[ds] || 0;
          let within;
          if (use <= base) {
            bank = Math.min(bankCap, bank + (base - use));
            within = true;
          } else if (use - base <= bank) {
            bank -= use - base;
            within = true;
          } else {
            bank = 0;
            within = false;
          }
          if (ds >= rws) {
            n += 1;
            if (within) ok += 1;
          }
          d = addDays(d, 1);
        }
        return n ? `${ok}/${n}` : null;
      };
      const sbR = data.sideBets || {};
      const totalSeasonDays = daysBetween(SEASON.start, SEASON.end);
      const expected = Math.round(
        SEASON.targetXp * Math.min(totalSeasonDays, Math.max(0, daysBetween(SEASON.start, todayStr))) / totalSeasonDays
      );
      recap = {
        rws,
        rwe,
        xp: xpInWindow(data, rws, rwe),
        walk: Math.round(rWalk * 10) / 10,
        nic: betDays(sbR.nicotineStart, sbR.nicotineUse, nicLimitAt),
        alc: betDays(sbR.alcoholStart, sbR.alcoholUse, alcLimitAt, ALC_PLAN.bankCap),
        onPace: seasonXp >= expected
      };
    }
    let effect = null;
    if (ckDates.length >= 4) {
      const sbU = data.sideBets || {};
      const grp = (pred) => {
        const xs = ckDates.filter(pred).map((ds) => ckComp(data.checkins[ds]));
        return xs.length ? Math.round(xs.reduce((a2, b) => a2 + b, 0) / xs.length * 10) / 10 : null;
      };
      const grpM = (pred) => {
        const xs = ckDates.filter((ds) => pred(ds) && ckMood(data.checkins[ds]) != null).map((ds) => ckMood(data.checkins[ds]));
        return xs.length ? Math.round(xs.reduce((a2, b) => a2 + b, 0) / xs.length * 10) / 10 : null;
      };
      effect = {
        alcOn: grp((ds) => ((sbU.alcoholUse || {})[ds] || 0) > 0),
        alcOff: grp((ds) => ((sbU.alcoholUse || {})[ds] || 0) === 0),
        nicOn: grp((ds) => ((sbU.nicotineUse || {})[ds] || 0) > 0),
        nicOff: grp((ds) => ((sbU.nicotineUse || {})[ds] || 0) === 0),
        mAlcOn: grpM((ds) => ((sbU.alcoholUse || {})[ds] || 0) > 0),
        mAlcOff: grpM((ds) => ((sbU.alcoholUse || {})[ds] || 0) === 0),
        small: ckDates.length < 8
      };
    }
    const prs = Object.values(stats.prMap).sort((a2, b) => b.kg - a2.kg).slice(0, 6);
    const pastWeeks = stats.weekHistory.filter((r2) => !r2.isCurrent).slice(-6).reverse();
    const monthDay = (s2) => parse(s2).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "app", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Style, {}),
      import_jsx_runtime.jsxs('div',{className:'safe-status',role:'status',children:[import_jsx_runtime.jsx('span',{className:saveError?'err':'',children:saveState}),undoLabel&&import_jsx_runtime.jsx('button',{onClick:undoLast,children:'Undo '+undoLabel.toLowerCase()})]}),
      saveMessage&&import_jsx_runtime.jsxs('div',{className:'safe-warning',role:'alert',children:[saveMessage,import_jsx_runtime.jsx('button',{onClick:exportBackup,children:'Export backup'})]}),
      backupBusy&&import_jsx_runtime.jsx('div',{className:'safe-dialog-bg',role:'status',children:import_jsx_runtime.jsx('section',{className:'safe-dialog',children:'Restoring backup safely… Please keep this page open.'})}),
      switchRequest&&import_jsx_runtime.jsx('div',{className:'safe-dialog-bg',children:import_jsx_runtime.jsxs('section',{className:'safe-dialog',role:'dialog','aria-modal':true,'aria-label':'Change workout',children:[import_jsx_runtime.jsx('h2',{children:'Change this workout?'}),import_jsx_runtime.jsx('p',{children:'Your completed sets will stay in the log. Choose what to do with the remaining exercises.'}),import_jsx_runtime.jsx('button',{onClick:()=>loadTemplate(switchRequest,'replace'),children:'Replace remaining exercises'}),import_jsx_runtime.jsx('button',{onClick:()=>loadTemplate(switchRequest,'add'),children:'Add exercises to this session'}),import_jsx_runtime.jsx('button',{onClick:()=>setSwitchRequest(null),children:'Cancel'})]})}),
      banner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CelebCard, { b: banner }),
      confetti && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "confetti", "aria-hidden": "true", children: confetti.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "i",
        {
          style: {
            left: c2.x + "vw",
            width: c2.size,
            height: c2.round ? c2.size : c2.size * 1.6,
            background: c2.color,
            borderRadius: c2.round ? "50%" : 2,
            animationDelay: c2.delay + "s",
            animationDuration: c2.dur + "s",
            "--rot": c2.rot + "deg",
            "--drift": c2.drift + "px"
          }
        },
        c2.id
      )) }),
      toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "toast", children: toast }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `tab-pane ${liveSession && expandedDay === selDay && tab === "today" ? "sesh-focus" : ""}`, children: [
        tab === "today" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "lvl", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lvl-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lvl-title", children: [
                "LV ",
                lvl.index,
                " \xB7 ",
                lvl.title
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "lvl-xp", children: [
                stats.xp,
                " XP",
                lvl.next ? ` / ${lvl.next.xp}` : ""
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bar-fill", style: { width: `${lvl.pct}%` } }) }),
            lvl.next && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "lvl-next", children: [
              lvl.next.xp - stats.xp,
              " XP to ",
              lvl.next.title
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "hero", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hero-main", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "streak-num", children: stats.weekStreak }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "hero-right", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "streak-label", children: "week streak" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sh-label", children: data.shields > 0 ? `${data.shields} shield${data.shields > 1 ? "s" : ""} \u2014 saves a short week` : "shield every 4-week streak" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "shields", children: Array.from({ length: MAX_SHIELDS }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: i < data.shields ? "sh on" : "sh", children: "\u{1F6E1}\uFE0F" }, i)) })
          ] }) }),
          !fight && (data.targets || []).filter((t) => !t.achievedDate).map((t) => {
            const r2 = bossReadiness(t);
            if (r2.pct < 100) return null;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card sendit", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "si-ic", children: "\u2694\uFE0F" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "si-txt", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "si-t", children: "FINAL BOSS AWAITS" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "si-s", children: [
                  t.name,
                  " ",
                  wDisp(t.kg),
                  " ",
                  UL,
                  " \xD7 ",
                  t.reps,
                  " \u2014 readiness ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                    r2.pct,
                    "%"
                  ] }),
                  ". Send it."
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip si-go", onClick: () => startBossFight(t), children: "GO" })
            ] }, "si" + t.id);
          }),
          !fight && (data.targets || []).filter((t) => !t.achievedDate && !t.gateBroken).map((t) => {
            const r2 = bossReadiness(t);
            if (r2.pct < 92 || r2.pct >= 100) return null;
            const gateKg = Math.max(20, Math.round(t.kg * 0.93 / 2.5) * 2.5);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card gk-card", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "gk-demon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossFace, { img: gateInfoFor(t).img, emoji: gateInfoFor(t).emoji, size: 54 }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gk-eyebrow", children: [
                t.name.toUpperCase(),
                " \xB7 AT THE GATES \xB7 ",
                r2.pct,
                "%"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gk-title", children: gateInfoFor(t).title }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "gk-sub", children: [
                "One heavy ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t.name }),
                " single at ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { className: "gk-kg", children: [
                  wShow(gateKg, data.unit),
                  " ",
                  UL
                ] }),
                " ",
                gateInfoFor(t).sub,
                " \u2014 and the road to the dragon opens."
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "chip gk-go", onClick: () => startGateFight(t), children: [
                "\u2691 FIGHT ",
                gateInfoFor(t).name
              ] })
            ] }, t.id);
          }),
          !fight && (() => {
            const open = (data.targets || []).filter((t) => !t.achievedDate).map((t) => ({ t, tr: trialInfoFor(t), r: bossReadiness(t) })).filter((x2) => x2.tr.avail && x2.r.pct < 100);
            if (!open.length) return null;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card quest", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "q-txt", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "q-name", children: [
                open.length > 1 ? "THE DENS CALL" : "A DEN CALLS",
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "q-sub", children: "~30 MIN" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "q-btns", children: open.map(({ t, tr }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip tr-go", onClick: () => startTrial(t), children: tr.name.replace("THE ", "") }, t.id)) })
            ] });
          })(),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "section",
            {
              className: `card ${curRec.gym >= curRec.qg && curRec.cardio >= curRec.qc ? "week-done" : ""}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
                    "This week",
                    curRec.gym >= curRec.qg && curRec.cardio >= curRec.qc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-done-tag", children: "\u2726 complete" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "goal-chips", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `goal ${curRec.gym >= curRec.qg ? "hit" : ""}`, children: [
                      "\u{1F3CB}\uFE0F ",
                      curRec.gym,
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("i", { children: [
                        "/",
                        curRec.qg
                      ] })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `goal cardio ${curRec.cardio >= curRec.qc ? "hit" : ""}`, children: [
                      "\u{1F3C3} ",
                      curRec.cardio,
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("i", { children: [
                        "/",
                        curRec.qc
                      ] })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "barbell", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bb-bar" }),
                  cells.map((c2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bb-slot", children: [
                    (() => {
                      const st = !!(data.stretch || {})[c2.ds];
                      const ab = !!(data.abs || {})[c2.ds];
                      const n = (st ? 1 : 0) + (ab ? 1 : 0);
                      if (!n) return null;
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "i",
                        {
                          className: "charge-ring",
                          style: {
                            background: n === 2 ? "conic-gradient(#A78BFA 0deg 180deg, #58B368 180deg 360deg)" : st ? "#58B368" : "#A78BFA"
                          }
                        }
                      );
                    })(),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "button",
                      {
                        className: `plate ${c2.status} ${selDay === c2.ds ? "sel" : ""}`,
                        disabled: !c2.tappable,
                        onClick: () => c2.tappable && setSelDay(c2.ds),
                        "aria-label": `Open log for ${c2.ds}`,
                        children: c2.status === "both" || c2.status === "gymdone" || c2.status === "cardiodone" ? "\u2713" : ""
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `dow ${c2.isToday ? "now" : ""}`, children: ["M", "T", "W", "T", "F", "S", "S"][(c2.d.getDay() + 6) % 7] })
                  ] }, c2.ds))
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "legend", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot gym" }),
                    " Gym"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot cardio" }),
                    " Cardio"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot gold" }),
                    " Both"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot ring-st" }),
                    " Stretch"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot ring-ab" }),
                    " Abs"
                  ] })
                ] })
              ]
            }
          ),
          (stats.side.nic.active || stats.side.alc.active) && (() => {
            const sb = data.sideBets || {};
            const ds = selDay || todayStr;
            const past = ds !== todayStr;
            const tag = past ? niceDate(ds).toUpperCase() : null;
            const nicN = (sb.nicotineUse || {})[ds] || 0;
            const nicL = sb.nicotineStart ? nicLimitAt(sb.nicotineStart, ds) : stats.side.nic.todayLimit;
            const alcN = (sb.alcoholUse || {})[ds] || 0;
            const alcL = (sb.alcoholStart ? alcLimitAt(sb.alcoholStart, ds) : stats.side.alc.todayLimit) + stats.side.alc.bank;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "quick-log", children: [
              stats.side.nic.active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  className: `ql ${nicN > nicL ? "over" : ""}`,
                  onClick: () => logNic(1, ds),
                  children: [
                    "Pouches ",
                    nicN,
                    "/",
                    nicL,
                    tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ql-day", children: tag }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ql-plus", children: "+1" })
                  ]
                }
              ),
              stats.side.alc.active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  className: `ql ${alcN > alcL ? "over" : ""}`,
                  onClick: () => logAlc(1, ds),
                  children: [
                    "Alcohol ",
                    alcN,
                    "/",
                    alcL,
                    tag && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ql-day", children: tag }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ql-plus", children: "+1" })
                  ]
                }
              )
            ] });
          })(),
          showRecap && recap && (() => {
            const weekTon = (startDs) => {
              let v = 0;
              const st = parse(startDs);
              for (let j = 0; j < 7; j++) {
                const ds = fmt(addDays(st, j));
                for (const ex of (data.logs[ds] || {}).exercises || [])
                  for (const s2 of countableSets(ex)) v += s2.kg * s2.reps;
              }
              return Math.round(v);
            };
            const ton = weekTon(recap.rws);
            const tonPrev = weekTon(fmt(addDays(parse(recap.rws), -7)));
            const dPct = tonPrev > 0 ? Math.round((ton - tonPrev) / tonPrev * 100) : null;
            const tonU = wConv(ton);
            const tonStr = data.unit === "lb" ? tonU >= 1e3 ? `${(tonU / 1e3).toFixed(1)}K LB` : `${Math.round(tonU)} LB` : ton >= 1e3 ? `${(ton / 1e3).toFixed(1)} TONNES` : `${ton} KG`;
            let stN = 0, abN = 0;
            {
              const st0 = parse(recap.rws);
              for (let j = 0; j < 7; j++) {
                const ds = fmt(addDays(st0, j));
                if ((data.stretch || {})[ds]) stN += 1;
                if ((data.abs || {})[ds]) abN += 1;
              }
            }
            const dayBefore = fmt(addDays(parse(recap.rws), -1));
            const topIn = (nameLc, from, to) => {
              let best = 0;
              for (const d of Object.keys(displayLogs)) {
                if (d < from || d > to) continue;
                const ex = (displayLogs[d].exercises || []).find((e) => e.name.toLowerCase() === nameLc);
                if (!ex || (ex.sets || []).some((s2) => s2.rest != null)) continue;
                for (const s2 of ex.sets) if (s2.done && s2.reps > 0 && s2.reps <= 100 && s2.kg > best) best = s2.kg;
              }
              return best;
            };
            const liftNames = {};
            {
              const st0 = parse(recap.rws);
              for (let j = 0; j < 7; j++) {
                const ds = fmt(addDays(st0, j));
                for (const ex of (displayLogs[ds] || {}).exercises || []) {
                  if (ex.skipped || (ex.sets || []).some((s2) => s2.rest != null)) continue;
                  if ((ex.sets || []).some((s2) => s2.done)) liftNames[ex.name.toLowerCase()] = ex.name;
                }
              }
            }
            let forged = [];
            for (const lc of Object.keys(liftNames)) {
              const wk = topIn(lc, recap.rws, recap.rwe);
              const prev = topIn(lc, "0000-01-01", dayBefore);
              if (prev > 0 && wk > prev) forged.push({ name: liftNames[lc], from: prev, to: wk });
            }
            forged.sort((a2, b) => b.to - b.from - (a2.to - a2.from));
            const forgedExtra = Math.max(0, forged.length - 4);
            forged = forged.slice(0, 4);
            let coreClimb = null;
            {
              const ls = [];
              const st0 = parse(recap.rws);
              for (let j = 0; j < 7; j++) {
                const mmm = /core L(\d+)/.exec((data.abs || {})[fmt(addDays(st0, j))] || "");
                if (mmm) ls.push(parseInt(mmm[1], 10));
              }
              if (ls.length) coreClimb = { from: Math.min(...ls), to: Math.max(...ls) + 1, runs: ls.length };
            }
            const readyAsOf = (t, cutoff) => {
              const req = EPLEY(t.kg, t.reps);
              const needle = stripLift(t.name);
              let cur = 0;
              for (const d of Object.keys(displayLogs)) {
                if (d > cutoff) continue;
                for (const ex of displayLogs[d].exercises || []) {
                  if (stripLift(ex.name) !== needle) continue;
                  for (const s2 of countableSets(ex)) {
                    const e22 = EPLEY(s2.kg, s2.reps);
                    if (e22 > cur) cur = e22;
                  }
                }
              }
              return req > 0 ? Math.min(100, Math.round(cur / req * 100)) : 0;
            };
            const disp = [];
            for (const [d] of Object.entries(data.trialDays || {}))
              if (d >= recap.rws && d <= recap.rwe) disp.push(["\u2692\uFE0F", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                "A den was entered \u2014 and survived. ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  TRIAL_XP,
                  " XP"
                ] })
              ] })]);
            for (const t of stats.side.targets) {
              if (t.gateBroken && t.gateBroken >= recap.rws && t.gateBroken <= recap.rwe)
                disp.push(["\u2691", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  "A gate fell before you. ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                    "+",
                    GATE_XP,
                    " XP"
                  ] })
                ] })]);
              if (t.achievedDate && t.achievedDate >= recap.rws && t.achievedDate <= recap.rwe)
                disp.push(["\u{1F409}", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /deadlift/i.test(t.name) ? "The Wyrm" : "The Sky-Dragon",
                  " was ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "slain" }),
                  "."
                ] })]);
            }
            for (const [d] of Object.entries(data.trueForms || {}))
              if (d >= recap.rws && d <= recap.rwe) disp.push(["\u{1F311}", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                "A ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "true form" }),
                " woke \u2014 and was felled."
              ] })]);
            if ((data.jester || {}).last && data.jester.last >= recap.rws && data.jester.last <= recap.rwe)
              disp.push(["\u{1F0CF}", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: "The jester pitched his tent that week." })]);
            const stamp = prevWeekRec.perfect ? "PERFECT WEEK" : prevWeekRec.met ? "WEEK HELD" : "WEEK LOST";
            const stampEm = prevWeekRec.perfect ? "\u2726" : prevWeekRec.met ? "\u{1F6E1}\uFE0F" : "\u2716";
            const stampCol = prevWeekRec.perfect ? "var(--gold)" : prevWeekRec.met ? "#58B368" : "var(--red)";
            const streakline = prevWeekRec.met ? `${stats.weekStreak} week${stats.weekStreak === 1 ? "" : "s"} unbroken \xB7 ${data.shields || 0} shield${(data.shields || 0) === 1 ? "" : "s"}` : "the chain snapped \u2014 forge a new one";
            const Rule = ({ t, d }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-rule wr2-a", style: { animationDelay: `${d}s` }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
            ] });
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr-ov", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-kicker wr2-a", style: { animationDelay: ".05s" }, children: [
                "\u2694 WEEK OF ",
                monthDay(recap.rws).toUpperCase(),
                " \u2013 ",
                monthDay(recap.rwe).toUpperCase(),
                " \u2694"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-verdict wr2-a", style: { animationDelay: ".15s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-stamp", style: { color: stampCol, textShadow: `0 0 30px ${stampCol}55` }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "em", children: stampEm }),
                  " ",
                  stamp
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wr2-streak", style: { color: prevWeekRec.met ? "var(--gold)" : "var(--muted)" }, children: streakline })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, { t: "The tally", d: 0.3 }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-tiles wr2-a", style: { animationDelay: ".4s" }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Wars fought" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", style: { color: prevWeekRec.met ? "#58B368" : "var(--red)" }, children: [
                    prevWeekRec.gym,
                    "/",
                    prevWeekRec.qg,
                    " ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      "\xB7 ",
                      prevWeekRec.cardio,
                      "/",
                      prevWeekRec.qc
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "d mut", children: "gym \xB7 cardio" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Iron moved" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "v", style: { color: "var(--ember)" }, children: tonStr }),
                  dPct === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "d mut", children: "first blood" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `d ${dPct >= 0 ? "up" : "dn"}`, children: [
                    dPct >= 0 ? "\u25B2" : "\u25BC",
                    " ",
                    dPct > 0 ? "+" : "",
                    dPct,
                    "% vs last week"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-tile", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Plunder" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", style: { color: "var(--gold)" }, children: [
                    "+",
                    recap.xp,
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: " XP" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "d mut", children: [
                    "LV ",
                    lvl.index,
                    " \xB7 ",
                    lvl.title
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, { t: "Forged this week", d: 0.55 }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-forge", children: [
                forged.length === 0 && !coreClimb && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wr2-noforge wr2-a", style: { animationDelay: ".65s" }, children: "No blades sharpened \u2014 the iron waits." }),
                forged.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-frow wr2-a", style: { animationDelay: `${0.65 + i * 0.1}s` }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ic", children: "\u25B2" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "n", children: f.name }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "w", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "old", children: wShow(f.from, data.unit) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "arw", children: "\u2192" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "new", children: wShow(f.to, data.unit) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: ULU })
                  ] })
                ] }, f.name)),
                forgedExtra > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-more wr2-a", style: { animationDelay: "1s" }, children: [
                  "\u2026and ",
                  forgedExtra,
                  " more"
                ] }),
                coreClimb && coreClimb.to > coreClimb.from && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-frow core wr2-a", style: { animationDelay: `${0.65 + forged.length * 0.1}s` }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ic", children: "\u25C6" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "n", children: [
                    "The Core Circuit",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
                      coreClimb.runs,
                      " run",
                      coreClimb.runs === 1 ? "" : "s",
                      " survived"
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "w", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "old", children: [
                      "LV ",
                      coreClimb.from
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "arw", children: "\u2192" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "new", children: [
                      "LV ",
                      coreClimb.to
                    ] })
                  ] })
                ] })
              ] }),
              (stN > 0 || abN > 0 || recap.walk > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, { t: "Deeds", d: 0.95 }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-deeds wr2-a", style: { animationDelay: "1.05s" }, children: [
                  recap.walk > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wr2-deed", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { style: { color: "var(--steel)" }, children: [
                      recap.walk,
                      " KM"
                    ] }),
                    " the road"
                  ] }),
                  abN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wr2-deed", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { style: { color: "#A78BFA" }, children: [
                      abN,
                      "\xD7"
                    ] }),
                    " core"
                  ] }),
                  stN > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wr2-deed", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { style: { color: "#58B368" }, children: [
                      stN,
                      "\xD7"
                    ] }),
                    " stretch"
                  ] })
                ] })
              ] }),
              stats.side.targets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, { t: "The hunt", d: 1.15 }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wr2-hunt", children: stats.side.targets.slice(0, 2).map((t, i) => {
                  const isDL = /deadlift/i.test(t.name);
                  const col = isDL ? "var(--ember)" : "var(--steel)";
                  const pEnd = readyAsOf(t, recap.rwe);
                  const gained = pEnd - readyAsOf(t, dayBefore);
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wr2-boss wr2-a", style: { animationDelay: `${1.25 + i * 0.1}s` }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "face", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossFace, { img: isDL ? "wyrm.png" : "sky-dragon.png", emoji: isDL ? "\u{1F409}" : "\u{1F432}", size: 34 }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "body", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "top", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "nm", style: { color: col }, children: isDL ? "THE WYRM" : "THE SKY-DRAGON" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pcts", children: [
                          gained > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dlt", children: [
                            "\u25B2 +",
                            gained,
                            " that week"
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pct", style: { color: col }, children: [
                            pEnd,
                            "%"
                          ] })
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "track", style: { background: isDL ? "rgba(232,93,38,.16)" : "rgba(116,179,255,.14)" }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${pEnd}%`, background: `linear-gradient(90deg, ${isDL ? "#B4501E" : "#3d6ea8"}, ${col})`, boxShadow: `0 0 8px ${col}` } }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sub", children: [
                        t.name,
                        " ",
                        wDisp(t.kg),
                        " ",
                        UL,
                        " \xD7 ",
                        t.reps,
                        " \xB7 readiness"
                      ] })
                    ] })
                  ] }, t.id);
                }) })
              ] }),
              disp.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, { t: "Dispatches", d: 1.45 }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wr2-disp wr2-a", style: { animationDelay: "1.55s" }, children: disp.slice(0, 4).map(([em, node], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "em", children: em }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: node })
                ] }, i)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wr2-onward wr2-a", style: { animationDelay: "1.65s" }, onClick: () => dismissRecap(recap.rws), children: "ONWARD \u203A" })
            ] });
          })(),
          selDay && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: `card day-card ${!dayStarted ? "warfront" : ""} ${fight && fightTarget ? `ft-${fightTheme(fightTarget).cls} ft-${fight.kind}` : ""}`, children: !dayStarted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: niceDate(selDay) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: selDay === todayStr ? "today" : "nothing logged" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "start-wrap wb", children: [
              Array.from({ length: 7 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "wb-ember", style: { left: `${12 + i * 13}%`, "--dx": `${i % 3 * 8 - 8}px`, animationDuration: `${2.6 + i % 3}s`, animationDelay: `${i * 0.5}s`, background: i % 2 ? "var(--ember)" : "var(--gold)" } }, i)),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wb-name", children: [
                data.planNames?.[suggested] || suggested,
                " ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DAY" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wb-ex", children: (data.plans && data.plans[suggested] || TEMPLATES[suggested] || []).slice(0, 4).map((e) => (e.name || "").split(" ").slice(-2).join(" ").toLowerCase()).join(" \xB7 ") }),
              import_jsx_runtime.jsx('button',{className:'link',onClick:()=>{rememberUndo('Skip suggested workout');setData(prev=>{const next=WorkoutCore.copy(prev);next.rotationQueue=(next.rotationQueue||SPLIT).slice(1);if(!next.rotationQueue.length)next.rotationQueue=[...SPLIT];persist(next,true);return next;});},children:'Skip this suggestion'}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "start-big wb-start", onClick: () => launchWorkout(suggested), children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "wb-tri" }),
                " START"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "chips center wb-alts", children: [
                SPLIT.filter((t) => t !== suggested).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wb-alt", onClick: () => launchWorkout(t), children: t }, t)),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wb-alt", onClick: () => setCardioFlow({ step: "pick", mode: "int", wu: 180, on: 60, off: 60, r: 8, min: 30 }), children: "CARDIO" })
              ] }),
              startCardio && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "set-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    className: "inp",
                    type: "text",
                    inputMode: "decimal",
                    placeholder: "min",
                    value: cMin,
                    onChange: (e) => setCMin(e.target.value)
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "input",
                  {
                    className: "inp",
                    type: "text",
                    inputMode: "decimal",
                    placeholder: "km",
                    value: cKm,
                    onChange: (e) => setCKm(e.target.value)
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add", onClick: saveCardio, children: "Save" })
              ] })
            ] })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head wrap", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: niceDate(selDay) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pill-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    className: `done-pill ${dayComp.gym ? "on" : ""}`,
                    onClick: () => toggleMark(selDay, "gym"),
                    children: [
                      "\u{1F3CB}\uFE0F Gym",
                      dayComp.gym ? " \u2713" : ""
                    ]
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    className: `done-pill csteel ${dayComp.cardio ? "on" : ""}`,
                    onClick: () => toggleMark(selDay, "cardio"),
                    children: [
                      "\u{1F3C3} Cardio",
                      dayComp.cardio ? " \u2713" : ""
                    ]
                  }
                )
              ] })
            ] }),
            selLog.durationMin && import_jsx_runtime.jsxs('div',{className:'safe-session-list',children:[import_jsx_runtime.jsx('p',{children:`Completed ${selLog.workoutName || data.planNames?.[selLog.split] || selLog.split || 'workout'}. Next suggested: ${data.planNames?.[nextSplit]||nextSplit}. Start another session:`}),...SPLIT.map(t=>import_jsx_runtime.jsx('button',{className:'chip',onClick:()=>launchWorkout(t),children:data.planNames?.[t]||t},t))]}),
            (selLog.sessions||[]).length>0&&import_jsx_runtime.jsxs('details',{className:'safe-session-list',children:[import_jsx_runtime.jsx('summary',{children:`Earlier sessions today (${selLog.sessions.length})`}),...selLog.sessions.map(s=>import_jsx_runtime.jsxs('section',{children:[import_jsx_runtime.jsx('h3',{children:`${s.workoutName||s.split||'Workout'} · ${s.durationMin||0} min`}),...(s.exercises||[]).map((e,i)=>import_jsx_runtime.jsx('p',{children:`${e.name}: ${countableSets(e).map(s=>`${wDisp(s.kg)} ${UL} × ${s.reps}`).join(', ')||'No completed sets'}`},i))]},s.sessionId))]}),
            expandedDay !== selDay ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sum-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted sum-text", children: [
                selLog.exercises.length ? `${selLog.exercises.length} lifts \xB7 ${selLog.exercises.reduce(
                  (a2, e) => a2 + countableSets(e).length,
                  0
                )} sets` : null,
                selLog.durationMin ? `\u23F1 ${selLog.durationMin} min` : null,
                selLog.cardioMin || selLog.cardioKm ? `cardio${selLog.cardioMin ? ` ${selLog.cardioMin} min` : ""}${selLog.cardioKm ? ` ${selLog.cardioKm} km` : ""}` : null
              ].filter(Boolean).join(" \xB7 ") || "Marked done \u2014 nothing logged" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: () => setExpandedDay(selDay), children: "Open log \u25BE" })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sum-row", style: { marginBottom: 6 }, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", style: { fontSize: 11 }, children: "Session log" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link danger", onClick: clearDay, children: resetArm ? "sure? tap again" : "reset day" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: () => setExpandedDay(null), children: "Close log \u25B4" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "timer-row", children: selLog.durationMin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "timer-val", children: [
                "\u23F1 Session: ",
                selLog.durationMin,
                " min"
              ] }) : selLog.startedAt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "timer-val live", children: [
                  "\u23F1 ",
                  fmtElapsed(now - selLog.startedAt)
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: finishSession, children: "Finish session" })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "start-live", onClick: startSession, children: "\u25B6 START WORKOUT" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips", children: Object.keys(data.plans || TEMPLATES).sort((a2, b) => (a2 === suggested ? -1 : 0) - (b === suggested ? -1 : 0)).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  className: `chip tmpl ${t === suggested ? "assigned" : ""}`,
                  onClick: () => loadTemplate(t),
                  children: [
                    data.planNames && data.planNames[t] || t,
                    t === suggested ? " \xB7 next up" : ""
                  ]
                },
                t
              )) }),
              selLog.exercises.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ex-list", children: selLog.exercises.map((ex, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "div",
                {
                  "data-exidx": i,
                  className: `ex-row ${liveSession && currentSet && currentSet.ex === i ? "active-ex" : ""} ${ex.skipped ? "skipped" : ""} ${drag && drag.from === i ? "drag-src" : ""} ${drag && drag.hover === i && drag.from !== i ? "drag-over" : ""}`,
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "span",
                      {
                        className: "drag-h",
                        onPointerDown: (e) => {
                          e.preventDefault();
                          e.currentTarget.setPointerCapture(e.pointerId);
                          beginDrag(i);
                        },
                        onPointerMove: (e) => onDragMove(e.clientX, e.clientY),
                        onPointerUp: endDrag,
                        onPointerCancel: endDrag,
                        onContextMenu: (e) => e.preventDefault(),
                        "aria-label": `Reorder ${ex.name}`,
                        children: "\u2261"
                      }
                    ),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ex-main", children: [
                      renaming && renaming.ex === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rename-row", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                          "input",
                          {
                            className: "inp",
                            value: renameVal,
                            onChange: (e) => setRenameVal(e.target.value)
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add", onClick: saveRename, children: "\u2713" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "step-btn", onClick: cancelRename, children: "\u2715" })
                      ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "ex-name-btn", onClick: () => beginRename(i, ex.name), children: [
                        ex.name,
                        " ",
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pencil", children: "\u270E" })
                      ] }),
                      ex.skipped && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "skip-tag", children: "skipped today" }),
                      (() => {
                        const lt = lastTimeFor(ex);
                        return lt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "last-time", children: [
                          "last: ",
                          lt.sets.map((s2) => `${wDisp(s2.kg)}\xD7${s2.reps}`).join(", "),
                          " \xB7 ",
                          monthDay(lt.date)
                        ] }) : null;
                      })(),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "setpills", children: ex.sets.map((s2, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                        "button",
                        {
                          className: `setpill ${manualSel && manualSel.ex === i && manualSel.set === j ? "on" : ""} ${s2.done ? "done" : liveSession ? currentSet && currentSet.ex === i && currentSet.set === j ? "cur" : "future" : ""}`,
                          onClick: () => liveSession && !s2.done && !(manualSel && manualSel.ex === i && manualSel.set === j) ? markSetDone(i, j) : setManualSel(
                            manualSel && manualSel.ex === i && manualSel.set === j ? null : { ex: i, set: j }
                          ),
                          children: [
                            s2.done ? "\u2713 " : "",
                            wDisp(s2.kg),
                            "\xD7",
                            s2.reps
                          ]
                        },
                        j
                      )) }),
                      panelSel && panelSel.ex === i && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cur-adjust", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ca-row", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ca-lab", children: "kg" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, -2.5, 0), children: "\u22122.5" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, -1, 0), children: "\u22121" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ca-val", children: wDisp(ex.sets[panelSel.set].kg) }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, 1, 0), children: "+1" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, 2.5, 0), children: "+2.5" })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ca-row", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ca-lab", children: "reps" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, 0, -1), children: "\u22121" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ca-val", children: ex.sets[panelSel.set].reps }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca", onClick: () => adjustSetAt(panelSel, 0, 1), children: "+1" }),
                          !ex.sets[panelSel.set].done && liveSession ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add ca-done", onClick: () => markSetDone(i, panelSel.set), children: "\u2713 Done" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip ca-close", onClick: () => setManualSel(null), children: "close" })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ca-row", style: { justifyContent: "flex-end", gap: 16 }, children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => skipExercise(panelSel.ex), children: ex.skipped ? "unskip \u21B6" : "skip exercise \u21B7" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "link danger", onClick: () => deleteSetAt(panelSel), children: [
                            "delete set ",
                            panelSel.set + 1
                          ] })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "x", onClick: () => removeExercise(selDay, i), "aria-label": `Remove ${ex.name}`, children: "\u2715" })
                  ]
                },
                i
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rest-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rest-label", children: "Set rest" }),
                REST_OPTS.map((s2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    className: `chip ${data.restLen === s2 ? "on" : ""}`,
                    onClick: () => startRest(s2),
                    children: [
                      s2,
                      "s"
                    ]
                  },
                  s2
                ))
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rest-row", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rest-label", children: "Exercise" }),
                REST_EX_OPTS.map((s2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                  "button",
                  {
                    className: `chip ${data.restExLen === s2 ? "on" : ""}`,
                    onClick: () => startRestEx(s2),
                    children: [
                      s2,
                      "s"
                    ]
                  },
                  s2
                ))
              ] }),
              !addOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", style: { marginTop: 10 }, onClick: () => setAddOpen(true), children: "\uFF0B Add exercise or cardio" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sum-row", style: { marginTop: 10, marginBottom: 4 }, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", style: { fontSize: 11 }, children: "Add exercise / cardio" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setAddOpen(false), children: "hide \u25B4" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  recentNames.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips", children: recentNames.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: `chip ${exName === n ? "on" : ""}`, onClick: () => setExName(n), children: n }, n)) }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      className: "inp wide",
                      placeholder: "Exercise (e.g. Bench press)",
                      value: exName,
                      onChange: (e) => setExName(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepInput, { label: "Weight (kg)", value: kg, onChange: setKg, steps: [2.5, 1] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StepInput, { label: "Reps", value: reps, onChange: setReps, steps: [1] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add block", onClick: addSet, children: "Add set" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", children: "Logging a set marks the day as gym automatically. Tap a set to edit it, tap a name to rename it. Beat your best weight and it's a PR \u{1F3C6}" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "field-label", style: { marginTop: 16 }, children: "Cardio" }),
                (selLog.cardioMin || selLog.cardioKm) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ex-sets", style: { marginBottom: 8 }, children: [
                  "Logged: ",
                  selLog.cardioMin ? `${selLog.cardioMin} min` : "",
                  selLog.cardioMin && selLog.cardioKm ? " \xB7 " : "",
                  selLog.cardioKm ? `${selLog.cardioKm} km` : ""
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "set-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      className: "inp",
                      type: "text",
                      inputMode: "decimal",
                      placeholder: "min",
                      value: cMin,
                      onChange: (e) => setCMin(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      className: "inp",
                      type: "text",
                      inputMode: "decimal",
                      placeholder: "km",
                      value: cKm,
                      onChange: (e) => setCKm(e.target.value)
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add", onClick: saveCardio, children: "Save" })
                ] })
              ] })
            ] })
          ] }) }),
          (() => {
            const stretchDone = (data.stretch || {})[todayStr];
            const absDone = (data.abs || {})[todayStr];
            if (stretching) {
              const left = Math.max(0, Math.ceil((stretching.end - now) / 1e3));
              const getting = stretching.phase === "ready";
              const breathIn = Math.sin(now / 8e3 * Math.PI * 2 - Math.PI / 2) > 0;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "STRETCH" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getting ? "READY" : `${stretching.idx + 1} / ${STRETCH_MINUTES}` })
                ] }),
                (() => {
                  const chg = getting || stretching.phase === "change";
                  const seg = getting ? 5 : stretching.phase === "change" ? 3 : 45;
                  const pct = Math.min(1, Math.max(0, 1 - left / seg));
                  const urgent = !chg && left <= 5;
                  const col = chg ? "var(--gold)" : "var(--ember)";
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ringwrap", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "280", height: "280", style: { transform: "rotate(-90deg)" }, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "140", cy: "140", r: "122", fill: "none", stroke: "#2C313B", strokeWidth: "6" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                        "circle",
                        {
                          cx: "140",
                          cy: "140",
                          r: "122",
                          fill: "none",
                          stroke: col,
                          strokeWidth: "6",
                          strokeLinecap: "round",
                          strokeDasharray: 766.5,
                          strokeDashoffset: 766.5 * (1 - pct),
                          style: {
                            transition: "stroke-dashoffset .3s linear, stroke .3s",
                            filter: urgent ? "drop-shadow(0 0 10px #FF8A3C)" : chg ? "drop-shadow(0 0 10px rgba(255,214,102,.6))" : "drop-shadow(0 0 4px rgba(255,138,60,.35))"
                          }
                        }
                      )
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-center", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `sw-num ${urgent ? "urg" : ""} ${chg ? "chg" : ""}`, children: left }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `sw-lab ${chg ? "chg" : ""}`, children: chg ? "CHANGE" : "STRETCH" })
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ctl", children: [
                  !getting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip sw-next", onClick: stretchStep, children: "NEXT \u203A" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setStretching(null), children: "stop" })
                ] })
              ] });
            }
            if (absTimer) {
              const phase = absTimer.phase;
              const lvl2 = data.absLevel || 1;
              const m = absTimer.i >= 0 ? ABS_CIRCUIT[absTimer.i] : null;
              const f = m ? absForm(m) : null;
              const tierTag = m && absEvolved(m.name) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "abs-tier", children: "II" }) : null;
              if (phase === "done") {
                const from = absTimer.fromLevel || 1;
                const evoC = (absTimer.changes || []).filter((c2) => c2.kind === "evolve");
                const listC = (absTimer.changes || []).filter((c2) => c2.kind !== "evolve");
                const spellOut = (word, baseD, gap, anim) => [...word].map((ch, i) => ch === " " ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: ".35em" } }, i) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: anim, style: { "--d": `${(baseD + i * gap).toFixed(2)}s` }, children: ch }, i));
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CORE" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "COMPLETE" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-done", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-tick", children: "DONE \u2713" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-xp", children: [
                      "+",
                      ABS_XP,
                      " XP \xB7 circuit survived",
                      absTimer.nf ? ` \xB7 ${absTimer.nf} missed` : ""
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-lvup", children: "The circuit adapts" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-lvsub", children: [
                      "Level ",
                      from,
                      " \u2192 ",
                      from + 1,
                      " \xB7 ",
                      evoC.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                        "the mastered ",
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { color: "var(--gold)" }, children: "evolve" })
                      ] }) : "three grow, the rest hold"
                    ] }),
                    evoC.map((c2) => {
                      const preO = c2.oldHold ? "" : "\xD7", uO = c2.oldHold ? "s" : "";
                      const pre = c2.hold ? "" : "\xD7", u = c2.hold ? "s" : "";
                      const oldN = c2.oldName.toUpperCase(), newN = c2.name.toUpperCase();
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "evo", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-flare" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-shock" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-stamp", children: "\u2014 EVOLVED \u2014" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-kicker", children: "FORM MASTERED" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "evo-plaque", children: [
                          oldN,
                          " \xB7 ",
                          preO,
                          c2.from,
                          uO,
                          " \xB7 AT THE SUMMIT"
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-old", style: { fontSize: Math.max(19, Math.min(34, Math.floor(470 / oldN.length))) }, children: spellOut(oldN, 2.15, 0.05, "eb") }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "evo-oldnum", children: [
                          preO,
                          c2.from,
                          uO,
                          " \u2014 as far as this form goes"
                        ] }),
                        Array.from({ length: 14 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "evo-spark", style: { "--x": `${18 + i * 67 % 64}%`, "--sway": `${(i % 2 ? 1 : -1) * (6 + i * 13 % 14)}px`, "--d": `${(2.15 + i % 7 * 0.09).toFixed(2)}s` } }, i)),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "evo-new", style: { fontSize: Math.max(22, Math.min(42, Math.floor(560 / newN.length))) }, children: spellOut(newN, 3.3, 0.07, "es") }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "evo-newsub", children: [
                          "begin at ",
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                            pre,
                            c2.to,
                            u
                          ] }),
                          " \u2014 the climb starts over, steeper"
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "evo-pips", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "evo-pip done", children: "I" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "evo-pip lit", children: "II" })
                        ] })
                      ] }, c2.oldName);
                    }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-scaleList", children: listC.map((c2, k2) => {
                      const pre = c2.hold ? "" : "\xD7", u = c2.hold ? "s" : "";
                      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-srow", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "n", children: c2.name }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "prog", children: [
                          c2.kind === "up" || c2.kind === "down" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "old", children: [
                              pre,
                              c2.from,
                              u
                            ] }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "arw", children: "\u2192" }),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `new ${c2.hold ? "hold" : ""} ${c2.kind === "down" ? "dn" : ""}`, children: [
                              pre,
                              c2.to,
                              u
                            ] })
                          ] }) : c2.kind === "devolve" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "new dn", children: [
                            "back to ",
                            pre,
                            c2.to,
                            u
                          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `new ${c2.hold ? "hold" : ""}`, children: [
                            pre,
                            c2.to,
                            u
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `delta ${c2.kind === "max" ? "cap" : c2.kind === "hold" ? "keep" : c2.kind === "down" || c2.kind === "devolve" ? "down" : ""}`, children: c2.kind === "up" ? `\u25B2 +${c2.to - c2.from}${u}` : c2.kind === "down" ? "\u25BC eased" : c2.kind === "devolve" ? "\u25BC the ladder" : c2.kind === "max" ? "max" : "holds" })
                        ] })
                      ] }, k2);
                    }) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sw-ctl", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip sw-next", onClick: () => setAbsTimer(null), children: "CLAIM \u203A" }) })
                ] });
              }
              if (phase === "settle") {
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CORE" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "LAST HOLD" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-rep", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-mvname", children: [
                      f ? f.name : "Finisher",
                      tierTag
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-mvper", children: "the circuit is done \u2014 did you hold it all?" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ctl abs-ctl-col", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "abs-done-btn", onClick: () => finishAbs(), children: "HELD IT \u2713 \u2014 CLAIM" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "abs-fail", onClick: () => {
                      const f2 = { ...absFails, [absTimer.i]: true };
                      setAbsFails(f2);
                      finishAbs(f2);
                    }, children: "\u2717 dropped early" })
                  ] })
                ] });
              }
              if (phase === "move" && f && f.type === "rep") {
                return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CORE" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                      absTimer.i + 1,
                      " / ",
                      ABS_CIRCUIT.length
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-rep", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-mvname", children: [
                      f.name,
                      tierTag
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-mvper", children: f.per || "\xA0" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-repbig", children: [
                      absTargetOf(m),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "REPS" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "abs-selfp", children: "go at your own pace" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ctl abs-ctl-col", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "abs-done-btn", onClick: absNext, children: "DONE \u2713" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "abs-fail", onClick: absFail, children: "\u2717 couldn't finish" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setAbsTimer(null), children: "stop" })
                  ] })
                ] });
              }
              const igniting = phase === "ready", holding = phase === "move", flipping = phase === "flip";
              const left = Math.max(0, Math.ceil((absTimer.end - now) / 1e3));
              const seg = igniting || flipping ? 5 : holding ? absTargetOf(m) : ABS_REST_S;
              const pct = Math.min(1, Math.max(0, 1 - left / seg));
              const urgent = holding && left <= 5;
              const col = igniting || holding ? "var(--ember)" : "var(--steel)";
              const nextM = phase === "rest" ? ABS_CIRCUIT[absTimer.i + 1] : null;
              const shown = igniting ? "READY" : `${phase === "rest" ? absTimer.i + 2 : absTimer.i + 1} / ${ABS_CIRCUIT.length}`;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `sweep-ov ${holding && left <= 10 ? left <= 3 ? "sh3" : left <= 6 ? "sh2" : "sh1" : ""}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CORE" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: shown })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ringwrap", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: "280", height: "280", style: { transform: "rotate(-90deg)" }, children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: "140", cy: "140", r: "122", fill: "none", stroke: "#2C313B", strokeWidth: "6" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                      "circle",
                      {
                        cx: "140",
                        cy: "140",
                        r: "122",
                        fill: "none",
                        stroke: col,
                        strokeWidth: "6",
                        strokeLinecap: "round",
                        strokeDasharray: 766.5,
                        strokeDashoffset: 766.5 * (1 - pct),
                        style: {
                          transition: "stroke-dashoffset .3s linear, stroke .4s",
                          opacity: igniting ? 0.45 : 1,
                          filter: urgent ? "drop-shadow(0 0 10px #FF8A3C)" : "none"
                        }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-center", children: [
                    holding && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "abs-ringname", children: [
                      f.name,
                      f.per ? ` \xB7 side ${absTimer.side || 1} of 2` : ""
                    ] }),
                    flipping && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "abs-ringname", children: [
                      f.name,
                      " \xB7 other side"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `sw-num ${urgent ? "urg" : ""}`, children: left }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-lab", children: igniting ? "GET READY" : holding ? "HOLD" : flipping ? "SWITCH SIDES" : "REST" })
                  ] })
                ] }, `${phase}-${absTimer.side || 0}-${absTimer.i}`),
                nextM && (() => {
                  const nf2 = absForm(nextM);
                  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "abs-nextup", children: [
                    "next: ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                      nf2.name,
                      " ",
                      nf2.type === "hold" ? `${absTargetOf(nextM)}s` : `\xD7 ${absTargetOf(nextM)}`
                    ] })
                  ] });
                })(),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ctl", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip sw-next", onClick: absNext, children: holding ? "SKIP \u203A" : "GO \u203A" }),
                  holding && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip abs-failchip", onClick: absFail, children: "\u2717 dropped" }),
                  phase === "rest" && f && f.type === "hold" && !absFails[absTimer.i] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "button",
                    {
                      className: "chip abs-failchip",
                      onClick: () => {
                        setAbsFails((f2) => ({ ...f2, [absTimer.i]: true }));
                        flash("Noted \u2014 eased next time \u2717");
                      },
                      children: "\u2717 didn't finish that hold"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setAbsTimer(null), children: "stop" })
                ] })
              ] });
            }
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mini-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card mini ${stretchDone ? "md-st" : ""}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mini-title", children: [
                  "STRETCH ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mini-min", children: "11 MIN" })
                ] }),
                stretchDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mini-done st", children: [
                  "\u2713 DONE +",
                  STRETCH_XP,
                  " XP"
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip mini-go", onClick: startStretch, children: "\u25B6 START" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card mini ${absDone ? "md-ab" : ""}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "mini-title", children: [
                  "ABS ",
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mini-min", children: [
                    "CORE \xB7 LV ",
                    data.absLevel || 1
                  ] })
                ] }),
                absDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "mini-done ab", children: [
                  "\u2713 DONE +",
                  ABS_XP,
                  " XP"
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip mini-go abs", onClick: startAbs, children: "\u25B6 START" })
              ] })
            ] });
          })(),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card tread-card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-head", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Work treadmill" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "walk-hero", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "walk-main", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "walk-big", children: walkTodayAnim.toFixed(1) }, walkTotal),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "walk-unit", children: "km today" })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "walk-today", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "today-num", children: [
                walkTotalAnim.toFixed(1),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "u", children: [
                  " km total",
                  walkPassed ? ` \xB7 past ${walkPassed.label}` : ""
                ] })
              ] }) })
            ] }),
            walkNext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "belt", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "div",
                {
                  className: `belt-fill${beltRolling ? " rolling" : ""}`,
                  style: { width: `${walkPct}%` }
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "belt-note", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                  "next: ",
                  walkNext.label
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                  Math.max(0, Math.round((walkNext.km - walkTotalAnim) * 10) / 10),
                  " km to go"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "walk-chips", children: [
              [5, 7].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc", onClick: () => walkChange(v, "set"), children: v }, v)),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc epic", onClick: () => walkChange(10, "set"), children: "10" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc mythic", onClick: () => walkChange(15, "set"), children: "15" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc legendary", onClick: () => walkChange(20, "set"), children: "20" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc", onClick: () => walkChange(1, "delta"), children: "+1" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip wc", onClick: () => walkChange(-1, "delta"), children: "\u22121" })
            ] })
          ] })
        ] }),
        tab === "health" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card ${ckDue ? "photo-due" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1FA7A} Weekly check-in" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: "past 7 days" })
            ] }),
            ckDue || ckOpen ? ckPend ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ck-q", children: CK_MOOD_Q }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips", children: CK_MOOD_OPTS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: "chip",
                  style: { borderColor: CK_MOOD_COLORS[i], color: CK_MOOD_COLORS[i] },
                  onClick: () => saveCheckin(ckPend.f, ckPend.s, i),
                  children: l
                },
                l
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => {
                setCkPend(null);
                setCkFreq(null);
              }, children: "\u2190 back" })
            ] }) : ckFreq == null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ck-q", children: CK_FREQ_Q }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips", children: CK_FREQ_OPTS.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: "chip",
                  style: { borderColor: CK_FREQ_COLORS[i], color: CK_FREQ_COLORS[i] },
                  onClick: () => i === 0 ? setCkPend({ f: 0, s: 0 }) : setCkFreq(i),
                  children: l
                },
                l
              )) })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ck-q", children: CK_SEV_Q }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips ck-stack", children: CK_SEV_OPTS.map((o, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                "button",
                {
                  className: "chip ck-sev",
                  style: { borderColor: CK_SEV_COLORS[i], color: CK_SEV_COLORS[i] },
                  onClick: () => {
                    setCkPend({ f: ckFreq, s: o.s });
                    setCkFreq(null);
                  },
                  children: [
                    o.label,
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ck-desc", children: o.desc })
                  ]
                },
                o.s
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setCkFreq(null), children: "\u2190 back" })
            ] }) : (() => {
              const c2 = data.checkins[lastCk] || {};
              const days = CHECKIN_EVERY_DAYS - daysBetween(lastCk, todayStr);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ck-done", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ck-badge", children: "\u2713 Checked in" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", style: { fontSize: 11 }, children: [
                    "next in ",
                    days,
                    " d"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", style: { marginLeft: "auto" }, onClick: () => setCkOpen(true), children: "redo" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ck-latest", children: [
                  c2.f === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ck-pill", style: { borderColor: "#58B368", color: "#58B368" }, children: "no heartburn \u{1F389}" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ck-pill", style: { borderColor: CK_FREQ_COLORS[c2.f], color: CK_FREQ_COLORS[c2.f] }, children: CK_FREQ_OPTS[c2.f] }),
                    (() => {
                      const si = CK_SEV_OPTS.findIndex((o) => o.s === c2.s);
                      return si >= 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ck-pill", style: { borderColor: CK_SEV_COLORS[si], color: CK_SEV_COLORS[si] }, children: CK_SEV_OPTS[si].label }) : null;
                    })()
                  ] }),
                  c2.m != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "ck-pill", style: { borderColor: CK_MOOD_COLORS[c2.m], color: CK_MOOD_COLORS[c2.m] }, children: [
                    "mood: ",
                    CK_MOOD_OPTS[c2.m]
                  ] })
                ] })
              ] });
            })(),
            ckNoteFor && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ck-note", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ck-q", style: { fontSize: 12, marginTop: 10 }, children: "Anything that might explain it? (optional)" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  className: "inp ck-ta",
                  placeholder: "e.g. late heavy meal, coffee, alcohol, stress, lying down after eating\u2026",
                  value: ckNote,
                  onChange: (e) => setCkNote(e.target.value)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "edit-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => {
                  setCkNoteFor(null);
                  setCkNote("");
                }, children: "Skip" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add", style: { padding: "8px 16px" }, onClick: saveNote, children: "Save note" })
              ] })
            ] }),
            ckHistory.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ck-strip", children: ckHistory.map((ds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                className: `ck-item ${ckSel === ds ? "sel" : ""}`,
                onClick: () => setCkSel(ckSel === ds ? null : ds),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "i",
                    {
                      className: `ck-dot ${data.checkins[ds] && data.checkins[ds].note ? "noted" : ""}`,
                      style: { background: ckColor(data.checkins[ds]) }
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: monthDay(ds) })
                ]
              },
              ds
            )) }),
            ckSel && data.checkins[ckSel] != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ck-detail", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: monthDay(ckSel) }),
              ": ",
              ckLabel(data.checkins[ckSel]),
              data.checkins[ckSel].note ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                " \u2014 \u201C",
                data.checkins[ckSel].note,
                "\u201D"
              ] }) : null,
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: "link",
                  onClick: () => {
                    setCkNoteFor(ckSel);
                    setCkNote(data.checkins[ckSel] && data.checkins[ckSel].note || "");
                  },
                  children: data.checkins[ckSel].note ? "edit note" : "add note"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F4C8} Trends" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pill-row", children: ["week", "month", "year"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: `chip ${trendView === v ? "on" : ""}`,
                  onClick: () => setTrendView(v),
                  children: v
                },
                v
              )) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", height: 150 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, { data: trendSeries, margin: { top: 5, right: 0, left: -22, bottom: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: "walkFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: "#74B3FF", stopOpacity: 0.34 }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: "#74B3FF", stopOpacity: 0.02 })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: "nicFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: "#FF8A3C", stopOpacity: 1 }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: "#B4501E", stopOpacity: 0.85 })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", { id: "alcFill", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", stopColor: "#FFD666", stopOpacity: 1 }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", stopColor: "#B8922E", stopOpacity: 0.85 })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { yAxisId: "km", hide: true, domain: [0, (max4) => Math.max(6, max4 * 1.3)] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Area,
                {
                  yAxisId: "km",
                  dataKey: "km",
                  name: "Walk km",
                  stroke: "#74B3FF",
                  strokeWidth: 1.5,
                  fill: "url(#walkFill)",
                  type: "monotone",
                  dot: false,
                  activeDot: { r: 3 }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                XAxis,
                {
                  dataKey: "label",
                  tick: { fill: "#8B909B", fontSize: 9 },
                  interval: trendView === "month" ? 4 : trendView === "week" ? 0 : 1,
                  axisLine: false,
                  tickLine: false
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                YAxis,
                {
                  yAxisId: "doses",
                  tick: { fill: "#8B909B", fontSize: 9 },
                  axisLine: false,
                  tickLine: false
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                YAxis,
                {
                  yAxisId: "hb",
                  orientation: "right",
                  domain: [0, 6],
                  ticks: [0, 2, 4, 6],
                  tick: { fill: "#E0654F", fontSize: 9 },
                  axisLine: false,
                  tickLine: false
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Tooltip,
                {
                  contentStyle: {
                    background: "#1E222A",
                    border: "1px solid #2C313B",
                    borderRadius: 8,
                    fontSize: 12
                  },
                  labelStyle: { color: "#F2F0EA" }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, { yAxisId: "doses", dataKey: "nic", name: "Pouches", fill: "url(#nicFill)", radius: [4, 4, 0, 0], maxBarSize: 14 }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, { yAxisId: "doses", dataKey: "alc", name: "Alcohol", fill: "url(#alcFill)", radius: [4, 4, 0, 0], maxBarSize: 14 }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Line,
                {
                  yAxisId: "hb",
                  dataKey: "hb",
                  name: "Heartburn",
                  stroke: "#E0654F",
                  strokeWidth: 2.5,
                  dot: { r: 3, fill: "#E0654F" },
                  connectNulls: true,
                  type: "monotone"
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Line,
                {
                  yAxisId: "hb",
                  dataKey: "mood",
                  name: "Mood",
                  stroke: "#58B368",
                  strokeWidth: 2,
                  strokeDasharray: "5 3",
                  dot: { r: 2, fill: "#58B368" },
                  connectNulls: true,
                  type: "monotone"
                }
              )
            ] }) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "trend-legend", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot gym" }),
                " Pouches"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot cardio" }),
                " Alcohol"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot", style: { background: "#E0654F" } }),
                " Heartburn (0\u20136)"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "dot", style: { background: "#58B368" } }),
                " Mood"
              ] }),
              trendView === "year" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: "bars = avg doses/day" })
            ] }),
            effect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "effect-line", children: [
              effect.alcOn != null && effect.alcOff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "Heartburn avg \u2014 drinking days ",
                effect.alcOn,
                " \xB7 dry days ",
                effect.alcOff
              ] }),
              effect.nicOn != null && effect.nicOff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "Heartburn avg \u2014 pouch days ",
                effect.nicOn,
                " \xB7 clean days ",
                effect.nicOff
              ] }),
              effect.mAlcOn != null && effect.mAlcOff != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "Mood avg (0\u20134) \u2014 drinking days ",
                effect.mAlcOn,
                " \xB7 dry days ",
                effect.mAlcOff
              ] }),
              effect.small && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "muted", children: "small sample \u2014 keep checking in" })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "effect-line muted", children: "Answer a few weekly check-ins to unlock the heartburn comparison." })
          ] }),
          !data.sideBetsEnded && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F3B2} Side bets" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                "+",
                SIDE_DAY_XP,
                " XP per day within limit"
              ] })
            ] }),
            stats.side.nic.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "side-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `side-num ${stats.side.nic.todayCount > stats.side.nic.todayLimit ? "over" : ""}`, children: [
                  "Pouches ",
                  stats.side.nic.todayCount,
                  "/",
                  stats.side.nic.todayLimit,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "side-unit", children: " today" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "muted", children: [
                  stats.side.nic.taperLeft > 0 && stats.side.nic.todayLimit > 0 ? `next cut in ${stats.side.nic.taperLeft} d` : "full stop",
                  " \xB7 streak ",
                  stats.side.nic.streak,
                  " d \xB7 best ",
                  stats.side.nic.best
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "count-btns", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip big-chip", onClick: () => logNic(1), children: "+1" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => logNic(-1), children: "undo" })
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "side-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                "Pouches \u2014 ",
                NIC_STEPS.map((s2) => s2.limit).join(" \u2192 "),
                " \u2192 0, one step per month"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: startNicotine, children: "Start the taper" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hr" }),
            stats.side.alc.active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "side-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `side-num ${stats.side.alc.todayCount > stats.side.alc.todayLimit ? "over" : ""}`, children: [
                  "Alcohol ",
                  stats.side.alc.todayCount,
                  "/",
                  stats.side.alc.todayLimit,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "side-unit", children: " today" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "muted", children: [
                  stats.side.alc.taperLeft > 0 ? `drops to ${ALC_PLAN.after}/day in ${stats.side.alc.taperLeft} d` : `max ${ALC_PLAN.after}/day`,
                  " \xB7 banked ",
                  stats.side.alc.bank,
                  " \xB7 streak ",
                  stats.side.alc.streak,
                  " d"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "count-btns", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip big-chip", onClick: () => logAlc(1), children: "+1" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => logAlc(-1), children: "undo" })
              ] })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "side-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                "Alcohol \u2014 max ",
                ALC_PLAN.limit,
                "/day, then ",
                ALC_PLAN.after,
                "; unused days bank (max ",
                ALC_PLAN.bankCap,
                ")"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: startAlcohol, children: "Start the taper" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card ${photoDue ? "photo-due" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F4F8} Progress photos" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                "every ",
                PHOTO_EVERY_DAYS,
                " days"
              ] })
            ] }),
            photoDue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                className: "add block",
                onClick: () => photoInputRef.current && photoInputRef.current.click(),
                children: [
                  "\u{1F4F8} Photo day \u2014 take your shot (+",
                  PHOTO_XP,
                  " XP)"
                ]
              }
            ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo-next", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                "Next photo in ",
                PHOTO_EVERY_DAYS - sincePhoto,
                " day",
                PHOTO_EVERY_DAYS - sincePhoto === 1 ? "" : "s"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: "link",
                  onClick: () => photoInputRef.current && photoInputRef.current.click(),
                  children: "add one anyway"
                }
              )
            ] }),
            photoList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo-strip", children: photoList.map((ds) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "photo-item", children: [
              photoThumbs[ds] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: photoThumbs[ds], alt: `Progress ${ds}` }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo-ph" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "photo-x", onClick: () => deletePhoto(ds), "aria-label": `Delete photo from ${ds}`, children: "\u2715" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "photo-date", children: monthDay(ds) })
            ] }, ds)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                ref: photoInputRef,
                type: "file",
                accept: "image/*",
                style: { display: "none" },
                onChange: handlePhoto
              }
            )
          ] })
        ] }),
        tab === "bosses" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-tab", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "boss-h1", children: "Bosses" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-hsub", children: "Your hand \u2014 swipe to face them." })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "boss-count", children: [
              1 + stats.side.targets.length * 4 + 1 + ((data.jester || {}).stands === todayStr ? 1 : 0),
              " in play"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BossDeck, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossReflow, {}),
            (() => {
              const cq = [
                "You forged a body. Now bring me its center.",
                "I keep the last gate \u2014 and open it only for those who can stand at it.",
                "Every road through the iron ends at my throne. Few arrive."
              ];
              const ci = (tauntPeek.ck || 0) % cq.length;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                PlayCard,
                {
                  art: "core-king-card.jpg",
                  artPos: "64% center",
                  tint: "t-coreking",
                  eyebrow: "Core \xB7 Final Boss",
                  ebColor: "var(--gold)",
                  status: "Sealed",
                  statusCls: "st-sealed",
                  name: "THE CORE KING",
                  big: true,
                  epithet: "the weight at the center of you",
                  plaque: "A crown awaits",
                  taunt: `\u201C${cq[ci]}\u201D`,
                  onTaunt: () => setTauntPeek((p) => ({ ...p, ck: (p.ck || 0) + 1 })),
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pc-chip", children: "The gate holds" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pc-chip", children: "His hour is not yet" })
                  ]
                }
              );
            })(),
            stats.side.targets.map((t) => {
              const hit = !!t.achievedDate;
              const r2 = bossReadiness(t);
              const gi = gateInfoFor(t);
              const tr = trialInfoFor(t);
              const isDL = /deadlift/i.test(t.name);
              const qi = (tauntPeek[t.id] || 0) % gi.taunts.length;
              const felled = Object.values(data.trueForms || {}).filter((id) => id === t.id).length;
              const bossNm = isDL ? "THE WYRM" : "THE SKY-DRAGON";
              const formNm = isDL ? "THE WYRM" : "THE DRAGON";
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react41.default.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  PlayCard,
                  {
                    art: `card-${isDL ? "warden" : "shade"}.jpg`,
                    artPos: isDL ? "76% 30%" : "80% 25%",
                    tint: isDL ? "t-warden" : "t-shade",
                    eyebrow: `${isDL ? "The Barrow" : "The Sky"} \xB7 Gatekeeper`,
                    ebColor: isDL ? "var(--ember)" : "#B48CFF",
                    status: t.gateBroken ? "Path clear" : "Gate stands",
                    statusCls: t.gateBroken ? "st-slain" : "st-ready",
                    name: gi.name,
                    epithet: isDL ? "bars the barrow door" : "sits on your sternum",
                    taunt: gi.taunts[qi],
                    onTaunt: () => setTauntPeek((prev) => ({ ...prev, [t.id]: qi + 1 })),
                    children: t.gateBroken ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pc-chip gold", children: [
                      "Gate broken \xB7 ",
                      monthDay(t.gateBroken)
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stats", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Break the gate" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                          wShow(isDL ? 140 : 107.5, data.unit),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: UL })
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Bounty" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                          "+",
                          GATE_XP,
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: "XP" })
                        ] })
                      ] })
                    ] })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  PlayCard,
                  {
                    art: `card-${isDL ? "den" : "nightmare"}.jpg`,
                    artPos: isDL ? "70% 60%" : "78% 18%",
                    tint: isDL ? "t-den" : "t-nightmare",
                    eyebrow: "Trial \xB7 every 2 weeks",
                    ebColor: isDL ? "var(--ember)" : "#B48CFF",
                    status: tr.avail ? "Open" : "Resting",
                    statusCls: tr.avail ? "st-open" : "st-rest",
                    name: tr.name,
                    epithet: tr.cry.toLowerCase(),
                    children: tr.avail ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "pc-enter", onClick: () => startTrial(t), children: "Enter \u203A" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stats", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Survived" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "v", children: tr.count })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Bounty" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                            "+",
                            TRIAL_XP,
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: "XP" })
                          ] })
                        ] })
                      ] })
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-rline", children: [
                      "The den rests \xB7 returns ",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "stronger" }),
                      " in ",
                      tr.reopenIn,
                      " d \xB7 survived ",
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: tr.count })
                    ] })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  PlayCard,
                  {
                    art: `card-${isDL ? "wyrm" : "dragon"}.jpg`,
                    artPos: isDL ? "82% 20%" : "84% 16%",
                    tint: isDL ? "t-wyrm" : "t-dragon",
                    eyebrow: `${isDL ? "The Barrow" : "The Sky"} \xB7 Final Boss`,
                    ebColor: "var(--gold)",
                    status: hit ? "Slain" : t.gateBroken ? "Ready" : "Sealed",
                    statusCls: hit ? "st-slain" : t.gateBroken ? "st-ready" : "st-sealed",
                    name: bossNm,
                    big: true,
                    epithet: isDL ? "coiled beneath the barrow" : "leaning on your chest",
                    plaque: `+${TARGET_XP} XP on the kill`,
                    onRemove: () => removeTarget(t.id),
                    children: hit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pc-chip gold", children: [
                      "Slain \xB7 ",
                      monthDay(t.achievedDate)
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pc-rbar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${r2.pct}%` } }) }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pc-rline", children: r2.cur > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                        "est. ",
                        wShow(r2.cur, data.unit),
                        " ",
                        UL,
                        " \xB7 needs ~",
                        wShow(r2.req, data.unit),
                        " ",
                        UL
                      ] }) : "log a lift for a baseline" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stats", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Demand" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                            wDisp(t.kg),
                            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("u", { children: [
                              "\xD7",
                              t.reps
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Ready" }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                            r2.pct,
                            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: "%" })
                          ] })
                        ] })
                      ] })
                    ] })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  PlayCard,
                  {
                    art: felled > 0 ? `card-trueform-${isDL ? "dl" : "bp"}.jpg` : null,
                    tint: felled > 0 ? isDL ? "t-tfdl" : "t-tfbp" : "t-locked",
                    eyebrow: felled > 0 ? "True form" : "Something else",
                    ebColor: felled > 0 ? isDL ? "#9BE15D" : "#FF6B4A" : "var(--muted)",
                    status: felled > 0 ? "Felled" : "Hidden",
                    statusCls: felled > 0 ? "st-slain" : "st-rest",
                    name: felled > 0 ? formNm : "? ? ?",
                    epithet: felled > 0 ? isDL ? "wakes beneath the barrow" : "lands on your chest" : isDL ? "sleeps beneath the barrow" : "stirs behind the storm",
                    children: felled > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pc-chip gold", children: [
                      "Felled: ",
                      felled
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pc-chip", children: "Revealed when it wakes" })
                  }
                )
              ] }, t.id);
            }),
            (() => {
              const hy = data.hydra || {};
              const cool = hy.last ? Math.max(0, 7 - daysBetween(hy.last, selDay)) : 0;
              const ready = cool <= 0;
              const slain = hy.slain || 0;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                PlayCard,
                {
                  art: "card-hydra.jpg",
                  artPos: "100% 40%",
                  tint: "t-hydra",
                  eyebrow: "Summoned ordeal \xB7 every 7 days",
                  ebColor: "var(--ember)",
                  status: ready ? "Open" : "Regrowing",
                  statusCls: ready ? "st-open" : "st-rest",
                  name: "THE HYDRA",
                  epithet: ready ? "five heads \xB7 one clock" : "growing back heads",
                  children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "pc-enter", onClick: summonHydra, children: "Summon \u203A" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stats", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Clean" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "v", children: [
                          "+40",
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: "XP" })
                        ] })
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-stat", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "l", children: "Slain" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "v", children: slain })
                      ] })
                    ] })
                  ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pc-rline", children: [
                    "Growing back heads \xB7 returns in ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                      cool,
                      " d"
                    ] }),
                    " \xB7 slain ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: slain })
                  ] })
                }
              );
            })(),
            (() => {
              const jj = data.jester || {};
              if (jj.stands !== todayStr) return null;
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
                PlayCard,
                {
                  art: "card-jester.jpg",
                  artPos: "center 40%",
                  tint: "t-jester",
                  eyebrow: "The tent stands \xB7 tonight only",
                  ebColor: "var(--gold)",
                  status: "Open",
                  statusCls: "st-open",
                  name: "THE JESTER",
                  epithet: "three cards \xB7 gone at midnight",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "pc-enter", onClick: () => {
                      jesterSpend();
                      setJesterEnc({ mode: "card" });
                    }, children: "Enter the tent \u203A" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "pc-chip", children: [
                      "Banks broken: ",
                      jj.banks || 0
                    ] })
                  ]
                }
              );
            })()
          ] })
        ] }),
        tab === "workouts" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "wk-screen", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: "wk-h1", children: "Workouts" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-sub", children: "Your routine \u2014 loads on start, updates on finish." }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-seg", children: Object.keys(data.plans || {}).map(
            (k2) => wkEdit && wkEdit.type === "split" && wkEdit.key === k2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                className: "wk-seg-in",
                autoFocus: true,
                defaultValue: (data.planNames || {})[k2] || k2,
                onKeyDown: (e) => {
                  if (e.key === "Enter") planRenameSplit(k2, e.currentTarget.value);
                },
                onBlur: (e) => planRenameSplit(k2, e.currentTarget.value)
              },
              k2
            ) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: `wk-seg-b ${wkSplit === k2 ? "on" : ""}`,
                onClick: () => {
                  setWkSplit(k2);
                  setWkEdit(null);
                },
                children: (data.planNames || {})[k2] || k2
              },
              k2
            )
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-rename-row", children: !(wkEdit && wkEdit.type === "split") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "wk-rename", onClick: () => setWkEdit({ type: "split", key: wkSplit }), children: [
            "\u270E rename \u201C",
            (data.planNames || {})[wkSplit] || wkSplit,
            "\u201D"
          ] }) }),
          ((data.plans || {})[wkSplit] || []).map((ex, ei) => {
            const planArr = (data.plans || {})[wkSplit] || [];
            const blocks = toBlocks(ex.sets);
            const rest = REST_OPTS.includes(ex.rest) ? ex.rest : 90;
            const low = (blocks[0] || {}).reps || 0;
            const high = Math.max(low, ex.repHigh != null ? ex.repHigh : low);
            const inc = ex.inc != null ? ex.inc : defaultInc(ex.name, (blocks[0] || {}).kg || 0);
            const pg = computeProg(ex.name, wkSplit, null);
            const inPair = (k2) => !!(planArr[k2] && planArr[k2].ssNext) || !!(k2 > 0 && planArr[k2 - 1] && planArr[k2 - 1].ssNext);
            const isSecond = ei > 0 && planArr[ei - 1] && planArr[ei - 1].ssNext;
            const chip = pg.state === "advance" ? { ic: "\u25B2", l: "Advance" } : pg.state === "deload" ? { ic: "\u26A0", l: "Deload" } : pg.state === "new" ? { ic: "\u2022", l: "New" } : { ic: "\u2192", l: "Hold" };
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_react41.default.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `wk-card ${ex.ssNext ? "ss-a" : ""} ${isSecond ? "ss-b" : ""}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cardtop", children: [
                  wkEdit && wkEdit.type === "ex" && wkEdit.ei === ei ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "input",
                    {
                      className: "wk-nameinput",
                      autoFocus: true,
                      defaultValue: ex.name,
                      onKeyDown: (e) => {
                        if (e.key === "Enter") planRenameEx(wkSplit, ei, e.currentTarget.value);
                      },
                      onBlur: (e) => planRenameEx(wkSplit, ei, e.currentTarget.value)
                    }
                  ) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wk-exname", onClick: () => setWkEdit({ type: "ex", ei }), children: [
                    ex.name,
                    " ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-pen", children: "\u270E" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `wk-chip ${pg.state}`, children: [
                    chip.ic,
                    " ",
                    chip.l
                  ] }),
                  !inPair(ei) && planArr.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-pairbtn", onClick: () => setWkPairSel({ split: wkSplit, ei }), "aria-label": "Superset with\u2026", children: "\u26D3" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-del", onClick: () => planDelEx(wkSplit, ei), "aria-label": "Remove", children: "\u2715" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-proghint", children: pg.msg }),
                import_jsx_runtime.jsxs('label',{className:'wk-load-type',children:['Load type ',import_jsx_runtime.jsx('select',{'aria-label':'Load type for '+ex.name,value:ex.loadType||'external',onChange:e=>planUpdate(wkSplit,arr=>{arr[ei].loadType=e.target.value;}),children:[['external','External weight'],['bodyweight','Bodyweight / added weight'],['assisted','Assistance (less is harder)']].map(([value,label])=>import_jsx_runtime.jsx('option',{value,children:label},value))})]}),
                blocks.map((b, bi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-blk", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-tag", children: blocks.length > 1 ? bi === 0 ? "Top" : "Drop" : "" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-grp", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "SETS" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cluster", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planBlockPatch(wkSplit, ei, bi, { count: Math.max(1, b.count - 1) }), children: "\u2212" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-num", children: b.count }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planBlockPatch(wkSplit, ei, bi, { count: b.count + 1 }), children: "\uFF0B" })
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-grp", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "REPS" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cluster", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planBlockPatch(wkSplit, ei, bi, { reps: Math.max(1, b.reps - 1) }), children: "\u2212" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-num", children: b.reps }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planBlockPatch(wkSplit, ei, bi, { reps: b.reps + 1 }), children: "\uFF0B" })
                    ] })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "wk-wchip", onClick: () => openPad(wkSplit, ei, bi), children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wk-wval", children: [
                      wDisp(b.kg),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: data.unit })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-wedit", children: "\u270E tap to edit" })
                  ] }),
                  blocks.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rmblk", onClick: () => planRmBlock(wkSplit, ei, bi), "aria-label": "Remove block", children: "\u2715" })
                ] }, bi)),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-addb", onClick: () => planAddBlock(wkSplit, ei), children: "\uFF0B add drop set" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cfg", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cfg-grp", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "ADVANCE AT" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cluster", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planSetHigh(wkSplit, ei, high - 1), children: "\u2212" }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-num", children: high }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-rnd", onClick: () => planSetHigh(wkSplit, ei, high + 1), children: "\uFF0B" })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-cfg-note", children: high > low ? `range ${low}\u2013${high}` : "all sets" })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-cfg-grp", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "STEP" }),
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-incs", children: [1, 2, 2.5, 5].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: Math.abs(inc - v) < 1e-6 ? "on" : "", onClick: () => planSetInc(wkSplit, ei, v), children: [
                      "+",
                      kgTrim(v)
                    ] }, v)) })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-rest", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "lab", children: "Rest" }),
                  [45, 60, 90, 120].map((s2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: rest === s2 ? "on" : "", onClick: () => planSetRest(wkSplit, ei, s2), children: [
                    s2,
                    "s"
                  ] }, s2))
                ] })
              ] }),
              ei < planArr.length - 1 && (ex.ssNext ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-sslink on", onClick: () => planUnlink(wkSplit, ei), children: "\u26D3 SUPERSET \u2014 tap to unlink" }) : !inPair(ei) && !inPair(ei + 1) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-sslink", onClick: () => planLinkNext(wkSplit, ei), children: "\u26D3 link with next" }) : null)
            ] }, ei);
          }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-addex", onClick: () => planAddEx(wkSplit), children: "\uFF0B Add exercise" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-note", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Weight \u25B2" }),
            " tap a weight to enter an exact number or switch KG/LB. Completed target sets carry your working weight into the routine. Progression suggestions are optional; no increase is applied automatically."
          ] })
        ] }),
        tab === "stats" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F525} Days of iron" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", style: { fontSize: 10, letterSpacing: ".08em" }, children: [
                Object.keys(data.completions || {}).filter((d) => d >= SEASON.start && d <= SEASON.end).length + Object.keys(data.stretchDays || data.stretch || {}).filter((d) => d >= SEASON.start && d <= SEASON.end).length,
                " FIRES LIT"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "doi-grid", children: (() => {
              const cells2 = [];
              const start = parse(SEASON.start);
              const total = daysBetween(SEASON.start, SEASON.end) + 1;
              for (let i = 0; i < total; i++) {
                const d = new Date(start);
                d.setDate(d.getDate() + i);
                const ds = fmt(d);
                const c2 = (data.completions || {})[ds] || {};
                const deed = c2.gym && c2.cardio ? "both" : c2.gym ? "gym" : c2.cardio ? "cardio" : (data.stretch || {})[ds] ? "stretch" : (data.abs || {})[ds] ? "abs" : null;
                const future = ds > todayStr;
                cells2.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: `doi ${deed || ""} ${future ? "fut" : ""} ${ds === todayStr ? "now" : ""}`, title: ds }, ds));
              }
              return cells2;
            })() }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "doi-legend", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi gym" }),
                " gym"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi cardio" }),
                " cardio"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi both" }),
                " both"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi stretch" }),
                " stretch"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi abs" }),
                " abs"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "doi" }),
                " ash"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F3D7}\uFE0F Weekly volume" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: "total kg lifted" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { style: { width: "100%", height: 150 }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, { data: volSeries, margin: { top: 5, right: 0, left: -14, bottom: 0 }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, { dataKey: "label", tick: { fill: "#8B909B", fontSize: 9 }, axisLine: false, tickLine: false }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fill: "#8B909B", fontSize: 9 }, axisLine: false, tickLine: false }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                Tooltip,
                {
                  contentStyle: { background: "#1E222A", border: "1px solid #2C313B", borderRadius: 8, fontSize: 12 },
                  labelStyle: { color: "#F2F0EA" }
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, { dataKey: "vol", name: "kg", fill: "#FF8A3C", radius: [3, 3, 0, 0] })
            ] }) }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F3C6} Progress" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "chips", style: { marginBottom: 0 }, children: Object.keys(data.plans || TEMPLATES).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: `chip ${prSplit === t ? "on" : ""}`,
                  onClick: () => setPrSplit(t),
                  children: data.planNames && data.planNames[t] || t
                },
                t
              )) })
            ] }),
            (data.plans && data.plans[prSplit] || TEMPLATES[prSplit] || []).map((t) => {
              const pg = progressFor(t.name);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pr-name", children: t.name }),
                pg ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pr-kg", children: pg.sessions > 1 ? `${wDisp(pg.first.kg)} \u2192 ${wDisp(pg.last.kg)} ${UL}` : `${wDisp(pg.last.kg)} ${UL}` }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "span",
                    {
                      className: `pr-delta ${pg.improvement > 0 ? "up" : pg.improvement < 0 ? "downd" : ""}`,
                      children: pg.sessions > 1 ? `${pg.dk > 0 ? "+" : ""}${pg.dk} ${pg.assisted?'assistance':'· '+(pg.pct>0?'+':'')+pg.pct+'%'}` : pg.assisted?'assistance baseline':"baseline"
                    }
                  )
                ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", style: { fontSize: 11 }, children: "not logged yet" })
              ] }, t.name);
            })
          ] }),
          pastWeeks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-head", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Past weeks" }) }),
            pastWeeks.map((r2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "wk-label", children: monthDay(r2.ws) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "wk-dots", children: [
                Array.from({ length: curRec.qg }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: i < r2.gym ? "dot gym" : "dot rest" }, `g${i}`)),
                Array.from({ length: curRec.qc }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: i < r2.cardio ? "dot cardio" : "dot rest" }, `c${i}`))
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: `wk-score ${r2.perfect ? "perfect" : ""}`, children: [
                r2.gym,
                "+",
                r2.cardio,
                r2.perfect ? " \u2726" : r2.met ? " \u{1F6E1}\uFE0F" : ""
              ] })
            ] }, r2.ws))
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F4BE} Backup" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: "everything incl. photos" })
            ] }),
            (data.migrationWarnings||[]).length>0&&import_jsx_runtime.jsxs('details',{className:'legacy-notice',children:[import_jsx_runtime.jsx('summary',{children:'Older records preserved — completion status needs review'}),import_jsx_runtime.jsx('p',{children:'Some older sets have no completed/not-completed marker. They remain in your log and exports, but do not count as confirmed performance. Previous set-reward credit is retained separately; no completion flags were guessed.'}),import_jsx_runtime.jsx('p',{children:[...new Set(data.migrationWarnings.map(w=>w.date))].join(', ')})]}),
            bkMode === null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "pill-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: exportBackup, children: "Export backup" }),
              import_jsx_runtime.jsx('button',{className:'chip',onClick:exportRecoveryBackup,children:'Export pre-restore backup'}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: () => {
                setBkText("");
                setBkMode("import");
              }, children: "Restore from backup" })
            ] }),
            bkMode === "export" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", style: { margin: "0 0 8px" }, children: "Save this somewhere safe \u2014 Notes, email to yourself, or download the file." }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  className: "inp ck-ta",
                  readOnly: true,
                  value: bkText,
                  onFocus: (e) => e.target.select()
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "edit-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => {
                  setBkMode(null);
                  setBkText("");
                }, children: "Close" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip", onClick: downloadBackup, children: "Download .json" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    className: "add",
                    style: { padding: "8px 16px" },
                    onClick: async () => {
                      try {
                        await navigator.clipboard.writeText(bkText);
                        flash("Copied \u{1F4BE}");
                      } catch (e) {
                        flash("Tap the text box to select, then copy");
                      }
                    },
                    children: "Copy"
                  }
                )
              ] })
            ] }),
            bkMode === "import" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "hint", style: { margin: "0 0 8px" }, children: "Choose or paste a backup. Restore replaces this device’s data after saving a recovery copy. Nothing changes until you press Restore." }),
              import_jsx_runtime.jsx('input',{type:'file',accept:'.json,application/json','aria-label':'Choose workout backup',onChange:async e=>{const file=e.target.files?.[0];if(!file)return;try{const text=await file.text();const p=JSON.parse(text);WorkoutCore.validate(p.data);setBkText(text);flash(`${Object.keys(p.data.logs).length} logged days ready to restore`);}catch(error){flash('Invalid backup: '+error.message);}}}),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "textarea",
                {
                  className: "inp ck-ta",
                  placeholder: "Paste backup JSON here\u2026",
                  value: bkText,
                  onChange: (e) => setBkText(e.target.value)
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "edit-actions", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => {
                  setBkMode(null);
                  setBkText("");
                }, children: "Cancel" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add", style: { padding: "8px 16px" }, onClick: restoreBackup, children: "Restore \u2014 replaces data" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ver", children: [
            "Streak ",
            APP_VERSION
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", { className: "foot", children: [
            saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "err", children: "Couldn't save \u2014 check your connection and log again." }),
            confirmReset ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "Erase all progress?",
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link danger", onClick: resetAll, children: "Yes, reset" }),
              " ",
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setConfirmReset(false), children: "Keep it" })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setConfirmReset(true), children: "Reset all data" })
          ] })
        ] }),
        tab === "prizes" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-head", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F3AE} PS5 bank" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps5-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `ps5-balance ${ps5Balance < 0 ? "debt" : ""}`, children: fmtMin(Math.round(ps5Anim)) }, ps5Balance),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ps5-status", children: ps5Balance < 0 ? "in debt \u2014 earn it back" : "ready to play" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ps5-btns", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "spend", onClick: () => spend(30), children: "Spend 30 min" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "spend", onClick: () => spend(60), children: "Spend 1 h" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => spend(-30), children: "Refund 30 min" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card ${seasonWon ? "won" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
                "\u{1F384} ",
                SEASON.name
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: SEASON.prize })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "bar big", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "bar-fill grand",
                style: { width: `${Math.min(100, seasonXp / SEASON.targetXp * 100)}%` }
              }
            ) }),
            seasonWon ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "prize-msg gold-text", children: [
              SEASON.targetXp,
              " XP hit \u2014 the ",
              SEASON.prize,
              " is earned \u{1F381}"
            ] }) : seasonActive ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "prize-msg muted", children: [
              seasonXp,
              " / ",
              SEASON.targetXp,
              " XP \xB7 ",
              daysLeft,
              " days to Christmas \xB7 keep ~",
              paceNeeded,
              " XP/week to make it"
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "prize-msg muted", children: [
              "Season over at ",
              seasonXp,
              " / ",
              SEASON.targetXp,
              " XP. Points have reset \u2014 ask Claude to set up the next challenge."
            ] })
          ] }),
          !seasonActive && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: `card ${seasonWon ? "won" : ""}`, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-title", children: seasonWon ? "\u{1F381} PS5 Pro \u2014 EARNED" : "Season closed" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "muted", style: { marginTop: 4 }, children: seasonWon ? "Target hit before Christmas. Go get the console \u2014 you built this." : "The habits you built still count. Ask Claude to set up the next season." }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-grid", children: [
              [stats.totalSessions, "sessions"],
              [`${stats.bestWeekStreak} wk`, "best streak"],
              [stats.totalSets, "sets"],
              [`${walkTotal} km`, "walked"],
              [`${stats.side.nic.best} d`, "best clean run"],
              [stats.photoCount, "photos"]
            ].map(([n, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-tile", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-num", children: n }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-lab", children: l })
            ] }, l)) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u{1F3C6} The ladder" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
                stats.xp,
                " XP total"
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ladder", children: [...LEVELS].reverse().map((l) => {
              const i = LEVELS.indexOf(l);
              const reached = stats.xp >= l.xp;
              const current = reached && (i === LEVELS.length - 1 || stats.xp < LEVELS[i + 1].xp);
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `rung ${reached ? "reached" : ""} ${current ? "current" : ""}`, children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "rung-dot" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rung-title", children: l.title }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "rung-xp", children: [
                  l.xp,
                  current ? ` \xB7 you (${stats.xp})` : " XP"
                ] })
              ] }, l.title);
            }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "card", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "card-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "\u2B50 Ways to earn" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "muted", children: "the economy" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "earn-list", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F3CB}\uFE0F Gym session ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  XP_FOR.gym,
                  " XP"
                ] }),
                " \xB7 \u{1F3C3} cardio ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  XP_FOR.cardio,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u2795 Extra sessions beyond quota ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  XP_EXTRA.gym,
                  "/",
                  XP_EXTRA.cardio,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F4CB} Every set logged ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  XP_PER_SET,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u2726 Perfect week (no shields) ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  WEEK_BONUS_XP,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F4F8} Progress photo ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+10 XP" }),
                " \xB7 \u{1F3B2} clean bet day ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+2 XP" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F409} Final Boss slain ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+50 XP" }),
                " \xB7 \u{1F6B6} 10/15/20 km day ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "+5/10/15 XP" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F9D8} 15-min stretch ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  STRETCH_XP,
                  " XP"
                ] }),
                " per day"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u{1F525} 10-min abs ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  ABS_XP,
                  " XP"
                ] }),
                " per day"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "\u2692\uFE0F Boss trial ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  TRIAL_XP,
                  " XP"
                ] }),
                " \xB7 \u2691 Gate broken ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
                  "+",
                  GATE_XP,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
                "Post-taper slip day (pouches or alcohol over limit) ",
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { style: { color: "var(--red)" }, children: [
                  "\u2212",
                  SLIP_XP,
                  " XP"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "muted", style: { marginTop: 4 }, children: [
                "PS5 time: ",
                PS5_PER_SESSION,
                " min/session \xB7 ",
                PS5_PER_EXTRA,
                " extra \xB7 ",
                PS5_WEEK_BONUS,
                " perfect week"
              ] })
            ] })
          ] })
        ] })
      ] }, tab),
      bossCard && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-overlay kill", onClick: () => setBossCard(null), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "k-flash" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "k-slash one" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "k-slash two" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "k-ring" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "k-quake", children: [
          (() => {
            const kdl = /deadlift/i.test(bossCard.name);
            return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "k-dragon", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: kdl ? "kf-wyrm" : "kf-fall", children: "\u{1F409}" }),
                kdl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "kf-fissure" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "k-slain", children: kdl ? "DRAGGED UNDER" : "FALLEN" })
            ] });
          })(),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "k-after", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "boss-name", style: { marginTop: 10 }, children: bossCard.name.toUpperCase() }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "boss-line", children: [
              bossCard.line,
              " \xB7 +",
              TARGET_XP,
              " XP"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add block", style: { marginTop: 16 }, onClick: () => setBossCard(null), children: "GG \u{1F3C6}" })
          ] })
        ] })
      ] }),
      doneCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "done-overlay", onClick: () => setDoneCard(null), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "done-card", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-title", children: "\u{1F4AA} SESSION COMPLETE" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-grid", children: [
          [`${doneCard.dur} min`, "duration"],
          [doneCard.lifts, "lifts"],
          [doneCard.sets, "sets"],
          [`${Math.round(wConv(doneCard.vol)).toLocaleString()} ${UL}`, "volume"],
          [`+${doneCard.rewardMinutes} min`, "PS5 earned"],
          [fmtMin(ps5Balance), "PS5 bank"]
        ].map(([n, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "eg-tile", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-num", children: n }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "eg-lab", children: l })
        ] }, l)) }),
        doneCard.comparisonDate&&import_jsx_runtime.jsx('p',{className:'hint',children:`Previous ${doneCard.split}: ${niceDate(doneCard.comparisonDate)}${doneCard.compositionChanged?' · matching exercises only':''}`}),
        doneCard.lastVol>0&&doneCard.comparedSets!==doneCard.previousSets&&import_jsx_runtime.jsx('p',{className:'hint',children:`${doneCard.comparedSets} completed sets vs ${doneCard.previousSets} previously. This compares volume, not strength.`}),
        doneCard.lastVol > 0 && doneCard.compareVol > 0 && (() => {
          const diff = doneCard.compareVol - doneCard.lastVol;
          const pct = Math.round(diff / doneCard.lastVol * 1e3) / 10;
          const up = diff >= 0;
          const maxV = Math.max(doneCard.compareVol, doneCard.lastVol);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-cmp", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `ws-cmp-pct ${up ? "up" : "down"}`, children: [
              up ? "+" : "",
              pct,
              "% vs last ",
              doneCard.split
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-cmp-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "LAST" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-cmp-bar", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.round(doneCard.lastVol / maxV * 100)}%` } }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                Math.round(wConv(doneCard.lastVol)).toLocaleString(),
                " ",
                UL
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-cmp-row", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "TODAY" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ws-cmp-bar today", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.round(doneCard.compareVol / maxV * 100)}%` } }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                Math.round(wConv(doneCard.compareVol)).toLocaleString(),
                " ",
                UL
              ] })
            ] })
          ] });
        })(),
        doneCard.lastVol == null && doneCard.split && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ws-cmp-pct first", children: [
          "No comparable previous ",
          doneCard.split,
          " session with confirmed sets. This is your new baseline."
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "done-lines", children: [
          "\u2B50 ",
          xpInWindow(data, todayStr, todayStr),
          " XP earned today \xB7 season ",
          seasonXp,
          "/",
          SEASON.targetXp
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "add block", onClick: () => setDoneCard(null), children: "Nice \u{1F4AA}" })
      ] }) }),
      !fight && restLeft > 0 && tab === "today" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "rest-bar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "rest-bar-time", children: [
          "\u23F1 ",
          restLeft,
          "s"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "rest-bar-next", children: currentSet ? `next: ${currentSet.name} \u2014 set ${currentSet.n}` : "breathe" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setRestEnd(null), children: "skip" })
      ] }),
      cardioFlow && (() => {
        const cf = cardioFlow;
        const fmtd = (s3) => s3 >= 60 ? s3 % 60 ? `${Math.floor(s3 / 60)}'${s3 % 60}''` : `${s3 / 60}'` : `${s3}''`;
        if (cf.step === "pick") {
          const isInt = cf.mode === "int";
          const is44 = cf.mode === "n44";
          const effort2 = cardioEffortSec(cf);
          const onW = cardioOnWeight(cf.on, cf.off);
          const totalS = isInt || is44 ? cf.wu + cf.r * cf.on + (cf.r - 1) * cf.off : cf.wu + cf.min * 60;
          const xpTotal = XP_FOR.cardio + cardioBonusFor(effort2);
          const setF = (k2, v) => setCardioFlow({ ...cf, [k2]: v });
          const QRow = ({ label, opts, valKey, col, render }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-row", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cf-lab", children: label }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cf-chips", children: opts.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                className: "cf-chip",
                onClick: () => setF(valKey, o),
                style: cf[valKey] === o ? { background: col, color: "#10131a", borderColor: col } : null,
                children: render(o)
              },
              o
            )) })
          ] });
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov cf-pick", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CARDIO" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "BUILD YOUR SESSION" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-body", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cf-mode", children: [["steady", "STEADY", "#58B368"], ["int", "INTERVALS", "var(--ember)"], ["n44", "4\xD74", "var(--red)"]].map(([id, l, col]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  onClick: () => setCardioFlow({
                    ...cf,
                    mode: id,
                    // the Norwegian protocol is fixed: 4' hard / 3' easy
                    ...id === "n44" ? { on: 240, off: 180, r: 4 } : {},
                    ...id === "int" && cf.mode === "n44" ? { on: 60, off: 60, r: 8 } : {}
                  }),
                  style: cf.mode === id ? { background: col, color: "#10131a" } : null,
                  children: l
                },
                id
              )) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "WARM-UP", opts: [0, 120, 180, 300], valKey: "wu", col: "#58B368", render: (o) => o === 0 ? "\u2014" : fmtd(o) }),
              isInt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "ON", opts: [30, 45, 60, 90, 120], valKey: "on", col: "var(--ember)", render: fmtd }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "OFF", opts: [15, 30, 45, 60], valKey: "off", col: "var(--steel)", render: fmtd }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "ROUNDS", opts: [6, 8, 10, 12], valKey: "r", col: "var(--ember)", render: (o) => `\xD7${o}` })
              ] }),
              is44 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-row", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cf-lab", children: "PROTOCOL" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-n44", children: [
                    "4' HARD ",
                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "/" }),
                    " 3' EASY"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "ROUNDS", opts: [3, 4], valKey: "r", col: "var(--red)", render: (o) => `\xD7${o}` })
              ] }),
              !isInt && !is44 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QRow, { label: "TIME", opts: [20, 30, 45], valKey: "min", col: "#58B368", render: (o) => `${o}'` })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-foot", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-verdict", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  Math.round(totalS / 60),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: " MIN" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "gold", children: [
                  "+",
                  xpTotal,
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: " XP" })
                ] })
              ] }),
              isInt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-density", children: [
                "\u{1F525} ON pays \xD7",
                onW.toFixed(2).replace(/0$/, ""),
                " \u2014 shorter rests, richer spoils. Rest pays nothing."
              ] }),
              is44 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-density", children: [
                "\u{1F3D4} The Norwegian forge \u2014 four minutes at the edge, three to breathe. VO\u2082max is made here. Hard pays \xD7",
                onW.toFixed(2).replace(/0$/, ""),
                "."
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  className: "cf-start",
                  style: cf.mode === "steady" ? { background: "#58B368" } : is44 ? { background: "var(--red)" } : null,
                  onClick: () => setCardioFlow({ ...cf, step: "run", startMs: Date.now(), awarded: false }),
                  children: "\u25B6 START"
                }
              ),
              !dayComp.cardio && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link cf-just", onClick: () => {
                setCardioFlow(null);
                setStartCardio(true);
              }, children: "already did it \u2014 just log" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => setCardioFlow(null), children: "cancel" })
            ] })
          ] });
        }
        const plan = [];
        if (cf.wu > 0) plan.push({ k: "u", d: cf.wu });
        if (cf.mode === "steady") plan.push({ k: "g", d: cf.min * 60 });
        else for (let i = 0; i < cf.r; i++) {
          plan.push({ k: "w", d: cf.on });
          if (i < cf.r - 1) plan.push({ k: "s", d: cf.off });
        }
        const total = plan.reduce((a2, x2) => a2 + x2.d, 0);
        const tSec = (Date.now() - cf.startMs) / 1e3;
        const getting = tSec < 5;
        const el = Math.max(0, tSec - 5) + (cf.skipped || 0);
        const done = el >= total;
        const wWeight = cardioOnWeight(cf.on, cf.off);
        const effort = plan.reduce(
          (a2, x2) => a2 + x2.d * (x2.k === "w" ? wWeight : x2.k === "s" ? 0 : 1),
          0
        );
        const bonus = cardioBonusFor(effort);
        const earned = XP_FOR.cardio + bonus;
        if (done && !cf.awarded) {
          setTimeout(() => {
            setCardioFlow((c2) => c2 && !c2.awarded ? { ...c2, awarded: true, xpAt: stats.xp } : c2);
            setData((prev) => {
              const next = { ...prev, cardioBonus: { ...prev.cardioBonus || {} } };
              const res = markOn(next, todayStr, "cardio");
              if (!res.already && bonus > 0) next.cardioBonus[todayStr] = bonus;
              return next;
            });
            try {
              beepAndBuzz();
            } catch (e) {
            }
            setCfFill(null);
            setTimeout(() => setCfFill(true), 900);
          }, 0);
        }
        let acc = 0, si = 0, inS = 0;
        for (let i = 0; i < plan.length; i++) {
          if (el < acc + plan[i].d) {
            si = i;
            inS = el - acc;
            break;
          }
          acc += plan[i].d;
          si = i;
          inS = plan[i].d;
        }
        const s2 = plan[si];
        const KC = { u: "#58B368", g: "#58B368", w: cf.mode === "n44" ? "#E0654F" : "#FF8A3C", s: "#74B3FF" };
        const KL = cf.mode === "n44" ? { u: "WARM-UP", g: "STEADY", w: "HARD", s: "EASY" } : { u: "WARM-UP", g: "STEADY", w: "WORK", s: "REST" };
        const left = getting ? Math.ceil(5 - tSec) : Math.max(0, Math.ceil(s2.d - inS));
        const bigT = s2.d > 90;
        const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
        const roundNo = plan.slice(0, si + 1).filter((x2) => x2.k === "w").length;
        const R2 = 118, CC = 2 * Math.PI * R2;
        const xpAt = cf.xpAt != null ? cf.xpAt : stats.xp;
        const xpNow = cfFill ? xpAt + earned : xpAt;
        const lvCur = [...LEVELS].reverse().find((L) => xpNow >= L.xp) || LEVELS[0];
        const lvNext = LEVELS.find((L) => L.xp > xpNow);
        const lvAtStart = [...LEVELS].reverse().find((L) => xpAt >= L.xp) || LEVELS[0];
        const crossed = cfFill && lvCur !== lvAtStart;
        const span = lvNext ? lvNext.xp - lvCur.xp : 1;
        const into = xpNow - lvCur.xp;
        let segOff = 0;
        return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sweep-ov", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-name", children: "CARDIO" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: done ? "DONE" : getting ? "READY" : s2.k === "u" ? "WARMING UP" : cf.mode !== "steady" ? `ROUND ${roundNo} / ${cf.r}` : `${cf.min}' STEADY` })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "sw-ringwrap", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", { width: "280", height: "280", style: { transform: "rotate(-90deg)" }, children: plan.map((x2, i) => {
              const len = Math.max(2, x2.d / total * CC - 3), start = segOff;
              segOff += x2.d / total * CC;
              const past = !getting && el >= start / CC * total + x2.d;
              const cur = !getting && !done && i === si;
              const col = KC[x2.k];
              return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "circle",
                  {
                    cx: "140",
                    cy: "140",
                    r: R2,
                    fill: "none",
                    stroke: past || done ? col : "#3A4049",
                    strokeWidth: "6",
                    strokeDasharray: `${len} ${CC}`,
                    strokeDashoffset: -start,
                    strokeLinecap: "round",
                    style: { opacity: past || done ? 0.95 : 1, transition: "stroke .5s" }
                  }
                ),
                cur && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "circle",
                  {
                    cx: "140",
                    cy: "140",
                    r: R2,
                    fill: "none",
                    stroke: col,
                    strokeWidth: "6",
                    strokeDasharray: `${Math.max(0, inS / x2.d * len)} ${CC}`,
                    strokeDashoffset: -start,
                    strokeLinecap: "round",
                    style: { filter: `drop-shadow(0 0 7px ${col})` }
                  }
                )
              ] }, i);
            }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sw-center", children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: `cf-done ${crossed ? "lvup" : ""}`, children: [
              crossed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cf-lvup", children: "LEVEL UP" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cf-lvname", children: lvCur.title.toUpperCase() })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "cf-logged", children: "CARDIO DAY \u2713" }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "cf-xp", children: [
                "+",
                earned,
                " XP"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar-top", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: lvCur.title.toUpperCase() }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    into,
                    " / ",
                    span
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "cf-bar-track", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { style: { width: `${Math.min(100, into / span * 100)}%` } }) }),
                lvNext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "cf-bar-next", children: [
                  lvNext.xp - xpNow,
                  " XP TO ",
                  lvNext.title.toUpperCase()
                ] })
              ] })
            ] }) : getting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-num", children: left }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-lab", children: "GET READY" })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-num", style: bigT ? { fontSize: 56 } : null, children: bigT ? `${mm}:${ss}` : left }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sw-lab", style: { color: KC[s2.k] }, children: KL[s2.k] })
            ] }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "sw-ctl", children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "cf-done-btn", onClick: () => {
            setCardioFlow(null);
            setCfFill(null);
          }, children: "DONE" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
            !getting && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "chip sw-next", onClick: () => setCardioFlow({ ...cf, skipped: (cf.skipped || 0) + (s2.d - inS) }), children: "SKIP \u203A" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => {
              setCardioFlow(null);
              setCfFill(null);
            }, children: "stop" })
          ] }) })
        ] });
      })(),
      typeof document !== "undefined" && (0, import_react_dom.createPortal)(
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BBBoundary, { children: [
          collectorEnc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            CollectorEncounter,
            {
              debt: collectorEnc,
              onResolve: resolveCollector,
              onClose: () => setCollectorEnc(null)
            }
          ),
          hydraEnc && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            HydraEncounter,
            {
              ordeal: hydraEnc,
              onResolve: resolveHydra,
              onClose: () => setHydraEnc(null)
            }
          ),
          jesterEnc && (() => {
            const ctx = jesterCtx();
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              JesterGame,
              {
                mode: jesterEnc.mode,
                legend: ctx.legend,
                xp: ctx.xp,
                banks: ctx.banks,
                onEnter: jesterSpend,
                onAnte: jesterAnte,
                onResolve: jesterResolve,
                onClose: () => {
                  setJesterEnc(null);
                  setExpandedDay(null);
                  setTab("today");
                }
              }
            );
          })(),
          liveSession && wsOpen && tab === "today" && (selLog.exercises || []).some((e) => !e.skipped && e.sets.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            WorkoutSession,
            {
              log: selLog,
              now,
              restEnd,
              restTotal,
              readyAt,
              splitName: selLog.workoutName || data.planNames?.[selLog.split] || selLog.split || 'Workout',
              unit: data.unit,
              onLog: wsLog,
              onRename: wsRename,
              onRenameWorkout: wsRenameWorkout,
              lastFor: lastTimeFor,
              onAdd: wsAdd,
              recentNames,
              progFor: (name) => computeProg(name, selLog.split || suggested, selDay),
              onSkipRest: () => {
                setRestEnd(null);
                setReadyAt(Date.now());
                setNow(Date.now());
              },
              onFinish: finishSession,
              onClose: () => {
                setWsOpen(false);
                setExpandedDay(null);
                setTab("today");
              }
            }
          ),
          liveSession && !wsOpen && tab === "today" && !fight && !bbOutro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "ws-resume", onClick: () => setWsOpen(true), children: "\u23F1 SESSION" }),
          (bbOutro || fight && fightTarget && fightEx && liveSession) && (() => {
            const bbT = fightTarget || bbOutro && bbOutro.target || null;
            if (!bbT) return null;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              BossBattle,
              {
                unit: data.unit,
                theme: BB_THEMES.includes(data.battleTheme) ? data.battleTheme : "forge",
                onTheme: () => setData((prev) => {
                  const n = clone(prev);
                  const ci = BB_THEMES.indexOf(n.battleTheme);
                  n.battleTheme = BB_THEMES[(ci + 1) % BB_THEMES.length];
                  persist(n);
                  return n;
                }),
                fight,
                target: fightTarget,
                ex: fightEx,
                exIndex: fight && fightTarget ? (selLog.exercises || []).findIndex(
                  (e) => stripLift(e.name) === stripLift(fightTarget.name)
                ) : -1,
                gateInfo: gateInfoFor(bbT),
                trialInfo: trialInfoFor(bbT),
                now,
                restEnd,
                restTotal,
                readyAt,
                onStrike: (ei, sj) => markSetDone(ei, sj),
                onSkipRest: () => {
                  setRestEnd(null);
                  setReadyAt(Date.now());
                  setNow(Date.now());
                },
                onFlee: () => {
                  setData((prev) => {
                    const n = clone(prev);
                    const af = n.activeFight;
                    n.activeFight = null;
                    if (af && af.kind === "trial" && n.logs[af.day]) {
                      const day = { ...n.logs[af.day] };
                      const kept = (day.exercises || []).filter((e) => e.sets.some((s2) => s2.done)).map((e) => ({ ...e, sets: [...e.sets] }));
                      day.exercises = kept;
                      if (kept.length === 0) {
                        day.startedAt = null;
                        day.durationMin = null;
                      }
                      n.logs[af.day] = day;
                    }
                    persist(n);
                    return n;
                  });
                  setRestEnd(null);
                  setReadyAt(null);
                },
                outro: bbOutro,
                onOutroDone: () => setBbOutro(null),
                xpNow: stats.xp
              }
            );
          })()
        ] }),
        document.body
      ),
      wkPairSel && (() => {
        const arr = (data.plans || {})[wkPairSel.split] || [];
        const me = arr[wkPairSel.ei];
        const opts = arr.map((e, j) => ({ e, j })).filter(({ e, j }) => j !== wkPairSel.ei && !e.ssNext && !(j > 0 && arr[j - 1] && arr[j - 1].ssNext));
        return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-sheet-ov", onClick: () => setWkPairSel(null), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-sheet", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-sheet-hd", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "t", children: [
              "\u26D3 Superset \u201C",
              me ? me.name : "",
              "\u201D with\u2026"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "x", onClick: () => setWkPairSel(null), children: "\u2715" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-pairlist", children: opts.length ? opts.map(({ e, j }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: "wk-pairopt", onClick: () => planPairWith(wkPairSel.split, wkPairSel.ei, j), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: e.name }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              e.sets.length,
              " sets \xB7 moves next to it & syncs"
            ] })
          ] }, j)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-pairnone", children: "Everything else is already paired \u2014 unlink something first." }) })
        ] }) });
      })(),
      wkPad && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "wk-sheet-ov", onClick: () => setWkPad(null), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-sheet", onClick: (e) => e.stopPropagation(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-sheet-hd", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "t", children: (((data.plans || {})[wkPad.split] || [])[wkPad.ei] || {}).name || "Weight" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "x", onClick: () => setWkPad(null), children: "\u2715" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-padval", children: [
          wkPadStr === "" ? "0" : wkPadStr,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("u", { children: data.unit })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-padunit", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: data.unit === "kg" ? "on" : "", onClick: () => padUnit("kg"), children: "KG" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: data.unit === "lb" ? "on" : "", onClick: () => padUnit("lb"), children: "LB" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "wk-keys", children: [
          ["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => padKey(n), children: n }, n)),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "faint", onClick: () => padKey(","), children: "," }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => padKey("0"), children: "0" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "faint", onClick: () => padKey("bk"), children: "\u232B" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "wk-padset", onClick: applyPad, children: "Set weight" })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "tabbar", children: [
        ["today", "\u{1F525}", "Today", false],
        ["bosses", "\u{1F409}", "Bosses", false],
        ["workouts", "\u{1F3CB}\uFE0F", "Workouts", false],
        ["health", "\u{1FA7A}", "Health", photoNag || ckNag],
        ["stats", "\u{1F4CA}", "Stats", false],
        ["prizes", "\u{1F381}", "Prizes", false]
      ].map(([id, icon, label, dot]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { className: `tab ${tab === id ? "on" : ""}`, onClick: () => setTab(id), children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tab-icon", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: dot ? "tab-beat" : "", children: icon }) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "tab-label", children: label })
      ] }, id)) })
    ] });
  }
  function Style() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { children: `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700&family=Archivo+Black&family=Press+Start+2P&family=VT323&family=Cinzel:wght@500;700;900&family=Cinzel+Decorative:wght@700;900&family=Pirata+One&display=swap');

:root{
  --floor:#15171C; --card:#1E222A; --line:#2C313B;
  --chalk:#F2F0EA; --muted:#A8AEBB;
  --ember:#FF8A3C; --ember-deep:#E85D26;
  --steel:#74B3FF; --gold:#FFD666; --red:#E0654F;
}
*{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
body{margin:0;}
.safe-status{position:sticky;top:0;z-index:300;min-height:28px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 9px;border:1px solid var(--line);border-radius:8px;background:var(--card);font-size:11px;color:var(--muted);margin-bottom:8px;}
.safe-status button,.safe-warning button{font:inherit;color:var(--gold);background:none;border:0;padding:5px;cursor:pointer;}
.safe-warning{position:relative;z-index:301;margin:8px 0;padding:12px;border:1px solid var(--red);border-radius:8px;background:var(--card);font-size:13px;line-height:1.5;}
.safe-dialog-bg{position:fixed;inset:0;z-index:400;display:grid;place-items:center;padding:20px;background:#000b;}
.safe-dialog{width:100%;max-width:400px;border:1px solid var(--line);background:var(--card);padding:22px;border-radius:16px;line-height:1.5;}
.safe-dialog button{display:block;width:100%;margin:10px 0;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--floor);color:var(--chalk);font:inherit;cursor:pointer;}
.safe-dialog button:first-of-type{background:var(--ember);color:var(--floor);}
.safe-field{display:flex!important;align-items:center;gap:8px;margin:16px 0!important;font-size:13px!important;letter-spacing:0!important;}
.safe-field input{width:18px;height:18px;accent-color:var(--ember);}
.safe-field select{color:var(--chalk);background:var(--floor);border:1px solid var(--line);padding:8px;border-radius:8px;max-width:100%;}
.ws-rename-workout{position:absolute;top:50px;left:18px;z-index:8;font:inherit;font-size:12px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--muted);padding:8px;cursor:pointer;}
.ws-last-set{font-size:12px;color:var(--steel);margin:8px 0;line-height:1.5;}
.wk-load-type{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:12px;margin:10px 0;color:var(--muted);}
.wk-load-type select,.ws-edbox select{color:var(--chalk);background:var(--floor);border:1px solid var(--line);padding:8px;border-radius:8px;max-width:100%;}
.legacy-notice{font-size:12px;line-height:1.6;color:var(--muted);margin:14px 0;}
.legacy-notice summary{color:var(--gold);cursor:pointer;}
.ws-screen{padding-top:100px!important;}
.app{
  min-height:100vh; background:var(--floor); color:var(--chalk);
  font-family:'Archivo',system-ui,sans-serif;
  max-width:440px; margin:0 auto;
  padding:calc(env(safe-area-inset-top, 0px) + 4px) 14px calc(env(safe-area-inset-bottom, 0px) + 92px);
  animation:appIn .3s ease;
}
.tabbar{
  position:fixed; bottom:0; left:0; right:0; max-width:440px; margin:0 auto;
  display:flex; background:rgba(30,34,42,.97); border-top:1px solid var(--line);
  backdrop-filter:blur(8px); z-index:15; padding-bottom:env(safe-area-inset-bottom);
}
.ver{text-align:center; font-size:10px; color:var(--muted); opacity:.7; margin:2px 0 6px; letter-spacing:.06em;}
.tab{
  flex:1; background:none; border:none; padding:10px 4px 8px; cursor:pointer;
  display:flex; flex-direction:column; align-items:center; gap:2px; color:var(--muted);
  font-family:'Archivo';
}
.tab.on{color:var(--ember);}
.tab-icon{font-size:18px; position:relative;}
.tab-beat{display:inline-block; animation:lubdub 1.6s ease-in-out infinite;}
@keyframes lubdub{0%,28%,100%{transform:scale(1);}8%{transform:scale(1.28);}14%{transform:scale(1);}20%{transform:scale(1.18);}}
.tab-label{font-size:10px; font-weight:700; letter-spacing:.04em;}

/* ---------- Workouts tab (Glass) ---------- */
.wk-screen{position:relative; padding:4px 2px 20px;
  background:
    radial-gradient(120% 40% at 82% -4%, rgba(255,138,60,.13), transparent 60%),
    radial-gradient(90% 34% at 0% 3%, rgba(116,179,255,.07), transparent 55%);}
.wk-h1{font-family:'Anton'; font-weight:400; font-size:26px; letter-spacing:.06em; text-transform:uppercase; margin:2px 0 3px;}
.wk-sub{font-size:12.5px; color:var(--muted); margin:0 0 16px;}
.wk-seg{display:flex; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:4px; margin-bottom:8px;}
.wk-seg-b{flex:1; border:none; background:transparent; color:var(--muted); font-family:'Archivo'; font-weight:800; font-size:13px; letter-spacing:.04em; padding:11px 0; border-radius:11px; cursor:pointer;}
.wk-seg-b.on{background:linear-gradient(180deg,#ffcf7a,#ffb44d); color:#241606; box-shadow:0 6px 18px rgba(255,180,77,.28);}
.wk-seg-in{flex:1; min-width:0; border:1px solid var(--gold); background:rgba(255,214,102,.14); color:var(--gold); border-radius:11px; padding:10px 12px; font-family:'Archivo'; font-weight:800; font-size:13px; text-align:center; outline:none; text-transform:uppercase; letter-spacing:.04em;}
.wk-rename-row{display:flex; justify-content:flex-end; min-height:22px; margin-bottom:10px;}
.wk-rename{background:none; border:none; color:var(--muted); font-size:11px; font-weight:700; cursor:pointer; padding:4px 2px;}
.wk-rename:active{color:var(--gold);}
.wk-card{position:relative; border-radius:20px; padding:14px 14px 12px; margin-bottom:12px;
  background:linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.02));
  border:1px solid rgba(255,255,255,.08); box-shadow:0 12px 30px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.06);}
.wk-cardtop{display:flex; align-items:center; gap:10px;}
.wk-exname{flex:1; font-weight:700; font-size:15px; cursor:pointer;}
.wk-pen{color:var(--muted); font-size:11px;}
.wk-nameinput{flex:1; min-width:0; border:1px solid rgba(255,255,255,.22); background:rgba(255,255,255,.06); color:var(--chalk); border-radius:10px; padding:8px 10px; font-family:'Archivo'; font-weight:700; font-size:15px; outline:none;}
.wk-del{background:none; border:none; color:var(--muted); font-size:14px; cursor:pointer; padding:4px 5px;}
.wk-auto{font-size:9.5px; color:var(--steel); font-weight:700; letter-spacing:.02em; margin:5px 0 2px;}
/* progression state chip + hint */
.wk-chip{flex:0 0 auto; display:inline-flex; align-items:center; gap:4px; font-family:'Archivo'; font-weight:800; font-size:9.5px; letter-spacing:.04em; padding:4px 9px; border-radius:999px; border:1px solid; white-space:nowrap; text-transform:uppercase;}
.wk-chip.advance{color:#7CD08A; background:rgba(88,179,104,.12); border-color:rgba(88,179,104,.36);}
.wk-chip.hold{color:var(--steel); background:rgba(116,179,255,.1); border-color:rgba(116,179,255,.3);}
.wk-chip.deload{color:#FF9B5A; background:rgba(232,93,38,.13); border-color:rgba(232,93,38,.42);}
.wk-chip.new{color:var(--muted); background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.14);}
.wk-proghint{font-size:10.5px; color:var(--muted); font-weight:600; margin:6px 0 2px; line-height:1.4;}
/* per-lift progression config: advance-at reps + loadable step */
.wk-cfg{display:flex; gap:14px; align-items:flex-start; flex-wrap:wrap; padding:11px 0 2px; margin-top:6px; border-top:1px dashed rgba(255,255,255,.08);}
.wk-cfg-grp{display:flex; flex-direction:column; align-items:flex-start; gap:5px;}
.wk-cfg-grp > small{font-size:8.5px; color:var(--muted); font-weight:800; letter-spacing:.08em;}
.wk-cfg-note{font-size:9px; color:var(--muted); font-weight:700; letter-spacing:.02em;}
.wk-incs{display:flex; gap:5px;}
.wk-incs button{border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:var(--muted); border-radius:999px; padding:5px 10px; font-size:11px; font-weight:800; cursor:pointer; font-variant-numeric:tabular-nums; font-family:'Archivo';}
.wk-incs button.on{border-color:var(--gold); color:var(--gold); background:rgba(255,214,102,.12);}
.wk-blk{display:flex; align-items:center; gap:8px; padding:11px 0 9px;}
.wk-blk + .wk-blk{border-top:1px dashed rgba(255,255,255,.08);}
.wk-tag{font-size:8.5px; font-weight:800; letter-spacing:.07em; color:var(--muted); width:30px; text-transform:uppercase; flex:0 0 auto;}
.wk-grp{display:flex; flex-direction:column; align-items:center; gap:4px;}
.wk-grp small{font-size:8.5px; color:var(--muted); font-weight:800; letter-spacing:.08em;}
.wk-cluster{display:flex; align-items:center; gap:4px;}
.wk-rnd{width:30px; height:30px; border-radius:50%; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.05); color:var(--chalk); font-size:15px; font-weight:700; cursor:pointer;}
.wk-rnd:active{background:rgba(255,255,255,.12);}
.wk-num{min-width:20px; text-align:center; font-weight:800; font-size:15px; font-variant-numeric:tabular-nums;}
.wk-wchip{margin-left:auto; display:flex; flex-direction:column; align-items:flex-end; gap:3px; border:none; background:none; cursor:pointer; padding:0;}
.wk-wval{font-family:'Anton'; font-weight:400; font-size:24px; color:var(--gold); line-height:1; font-variant-numeric:tabular-nums;}
.wk-wval u{font-family:'Archivo'; font-size:11px; color:var(--muted); text-decoration:none; font-weight:600; margin-left:2px;}
.wk-wedit{font-size:8.5px; color:var(--muted); font-weight:700; letter-spacing:.05em;}
.wk-rmblk{background:none; border:none; color:var(--muted); font-size:12px; cursor:pointer; padding:6px 2px;}
.wk-addb{display:block; margin-top:4px; background:none; border:none; color:#bfe0ff; font-size:11.5px; font-weight:700; cursor:pointer; padding:2px;}
.wk-rest{display:flex; align-items:center; gap:6px; padding:11px 0 1px; margin-top:6px; border-top:1px dashed rgba(255,255,255,.08); flex-wrap:wrap;}
.wk-rest .lab{font-size:8.5px; font-weight:800; letter-spacing:.08em; color:var(--muted); text-transform:uppercase; margin-right:2px;}
.wk-rest button{border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:var(--muted); border-radius:999px; padding:6px 13px; font-size:12px; font-weight:700; cursor:pointer; font-variant-numeric:tabular-nums; font-family:'Archivo';}
.wk-rest button.on{border-color:var(--ember); color:var(--ember); background:rgba(255,138,60,.10);}
.wk-addex{width:100%; margin-top:4px; border:1px dashed rgba(255,255,255,.14); background:rgba(255,255,255,.02); color:var(--muted); border-radius:16px; padding:14px; font-weight:700; font-size:13px; cursor:pointer; font-family:'Archivo';}
.wk-note{margin-top:16px; background:rgba(116,179,255,.06); border:1px solid rgba(116,179,255,.2); border-radius:14px; padding:12px 13px; font-size:11.5px; line-height:1.5; color:var(--muted);}
.wk-note b{color:var(--steel);}
/* number pad sheet */
/* ---- supersets (Workouts tab + logger) ---- */
.wk-sslink{display:block; margin:4px auto; border:1px dashed rgba(116,179,255,.4); background:rgba(116,179,255,.05);
  color:var(--steel); border-radius:999px; padding:7px 15px; font-size:11px; font-weight:800; letter-spacing:.04em;
  cursor:pointer; font-family:'Archivo';}
.wk-sslink.on{border-style:solid; border-color:rgba(116,179,255,.55); background:rgba(116,179,255,.14);}
.wk-card.ss-a{border-color:rgba(116,179,255,.35); border-bottom-left-radius:6px; border-bottom-right-radius:6px; margin-bottom:0;}
.wk-card.ss-b{border-color:rgba(116,179,255,.35); border-top-left-radius:6px; border-top-right-radius:6px;}
.wk-card.ss-a, .wk-card.ss-b{border-left:3px solid rgba(116,179,255,.55);}
.wk-pairbtn{background:none; border:1px solid rgba(116,179,255,.35); color:var(--steel); width:26px; height:26px;
  border-radius:8px; font-size:12px; cursor:pointer; flex:0 0 auto; line-height:1;}
.wk-pairlist{display:flex; flex-direction:column; gap:8px; padding:8px 0 4px; max-height:50vh; overflow-y:auto;}
.wk-pairopt{display:flex; flex-direction:column; align-items:flex-start; gap:2px; text-align:left; border:1px solid rgba(255,255,255,.1);
  background:rgba(255,255,255,.04); color:var(--chalk); border-radius:12px; padding:12px 14px; cursor:pointer; font-family:'Archivo';}
.wk-pairopt b{font-size:14px; font-weight:700;}
.wk-pairopt span{font-size:10.5px; color:var(--muted); font-weight:600;}
.wk-pairnone{font-size:12px; color:var(--muted); padding:12px 4px;}
.ws-ssline{margin-top:10px; font-size:10.5px; font-weight:800; letter-spacing:.1em; color:var(--steel);
  text-transform:uppercase; border:1px solid rgba(116,179,255,.3); background:rgba(116,179,255,.07);
  border-radius:999px; padding:6px 13px; display:inline-block;}
.ws-ssline.hot{color:#a8d1ff; border-color:rgba(116,179,255,.7); background:rgba(116,179,255,.16);
  animation:ssHot .5s cubic-bezier(.2,1,.3,1) both, ssGlowP 1.6s ease-in-out .5s infinite;}
@keyframes ssHot{from{opacity:0; transform:translateY(8px) scale(.94);}to{opacity:1; transform:none;}}
@keyframes ssGlowP{0%,100%{box-shadow:0 0 0 rgba(116,179,255,0);}50%{box-shadow:0 0 16px rgba(116,179,255,.45);}}
.wk-sheet-ov{position:fixed; inset:0; z-index:50; background:rgba(8,9,12,.6); backdrop-filter:blur(3px); display:flex; align-items:flex-end; justify-content:center; animation:fovFade .2s ease;}
.wk-sheet{width:100%; max-width:440px; background:linear-gradient(180deg,#1b1f27,#141821); border:1px solid rgba(255,255,255,.09); border-bottom:none; border-radius:22px 22px 0 0; padding:16px 16px calc(16px + env(safe-area-inset-bottom)); box-shadow:0 -18px 50px rgba(0,0,0,.5);}
.wk-sheet-hd{display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;}
.wk-sheet-hd .t{font-size:11px; color:var(--muted); font-weight:700; letter-spacing:.03em; text-transform:uppercase;}
.wk-sheet-hd .x{background:none; border:none; color:var(--muted); font-size:16px; cursor:pointer;}
.wk-padval{text-align:center; font-family:'Anton'; font-weight:400; font-size:50px; color:var(--gold); line-height:1.15; font-variant-numeric:tabular-nums;}
.wk-padval u{font-family:'Archivo'; font-size:16px; color:var(--muted); text-decoration:none; font-weight:600; margin-left:4px;}
.wk-padunit{display:flex; gap:8px; justify-content:center; margin:10px 0 14px;}
.wk-padunit button{border:1px solid var(--line); background:var(--floor); color:var(--muted); border-radius:999px; padding:7px 22px; font-weight:800; font-size:13px; cursor:pointer; letter-spacing:.06em; font-family:'Archivo';}
.wk-padunit button.on{border-color:var(--gold); color:var(--gold); background:rgba(255,214,102,.12);}
.wk-keys{display:grid; grid-template-columns:repeat(3,1fr); gap:9px;}
.wk-keys button{border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:var(--chalk); border-radius:14px; padding:16px 0; font-size:22px; font-weight:700; cursor:pointer; font-variant-numeric:tabular-nums; font-family:'Archivo';}
.wk-keys button:active{background:rgba(255,255,255,.12);}
.wk-keys button.faint{color:var(--muted); font-size:18px;}
.wk-padset{width:100%; margin-top:11px; border:none; border-radius:14px; padding:15px; font-family:'Anton'; letter-spacing:.06em; font-size:16px; background:var(--ember); color:#1a1206; cursor:pointer;}
.wk-padset:active{transform:scale(.98);}
.quick-log{display:flex; gap:8px; margin-bottom:10px;}
.ql{
  flex:1; display:flex; align-items:center; justify-content:center; gap:8px;
  background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:12px; color:var(--chalk); font-weight:700; font-size:14px; cursor:pointer;
  font-family:'Archivo'; font-variant-numeric:tabular-nums;
}
.ql:active{transform:scale(.97);}
.ql.over{border-color:var(--red); color:var(--red);}
.ql-plus{border:1px solid var(--ember); color:var(--ember); border-radius:999px; padding:2px 10px; font-size:12px;}
.loading{color:var(--muted); text-align:center; padding-top:40vh;}

.banner{
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  background:var(--ember-deep); color:#fff; font-weight:700;
  padding:10px 18px; border-radius:999px; z-index:20; white-space:nowrap;
  box-shadow:0 6px 24px rgba(232,93,38,.45);
  animation:bannerPop .45s cubic-bezier(.2,1.4,.4,1);
}
@keyframes bannerPop{0%{transform:translate(-50%,-50%) scale(.7); opacity:0;}60%{transform:translate(-50%,-50%) scale(1.06); opacity:1;}100%{transform:translate(-50%,-50%) scale(1);}}
.toast{
  position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
  background:var(--card); border:1px solid var(--line); color:var(--ember);
  font-weight:700; padding:8px 16px; border-radius:999px; z-index:20; white-space:nowrap;
  animation:drop .3s ease;
}
@keyframes drop{from{opacity:0; transform:translateX(-50%) translateY(-8px);}to{opacity:1; transform:translateX(-50%) translateY(0);}}
.confetti{position:fixed; inset:0; pointer-events:none; z-index:19; overflow:hidden;}
.confetti i{
  position:absolute; top:-12px; display:block; opacity:0;
  animation-name:confetti-fall; animation-timing-function:cubic-bezier(.25,.4,.6,1);
  animation-fill-mode:forwards;
}
@keyframes confetti-fall{
  0%{opacity:1; transform:translateY(-2vh) translateX(0) rotate(0deg);}
  100%{opacity:0; transform:translateY(104vh) translateX(var(--drift)) rotate(var(--rot));}
}

.lvl{margin-bottom:6px;}
.lvl-row{display:flex; justify-content:space-between; align-items:baseline;}
.lvl-title{font-family:'Anton'; letter-spacing:.06em; font-size:15px; color:var(--gold);}
.lvl-xp{font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums;}
.bar{height:6px; background:var(--line); border-radius:3px; margin-top:6px; overflow:hidden;}
.bar-fill{height:100%; background:linear-gradient(90deg,var(--gold),var(--ember)); border-radius:3px; transition:width .5s ease;}
.lvl-next{font-size:11px; color:var(--muted); margin-top:4px;}
.lvl .bar{height:8px; border-radius:4px; overflow:visible; background:rgba(58,64,73,.6);}
.lvl .bar-fill{
  position:relative; border-radius:4px;
  background:linear-gradient(90deg,var(--ember-deep) 0%,var(--ember) 55%,#FFC98A 100%);
  box-shadow:0 0 14px rgba(255,138,60,.85), 0 0 36px rgba(255,138,60,.45);
}
.lvl .bar-fill::after{
  content:""; position:absolute; right:-5px; top:50%; width:14px; height:14px;
  margin-top:-7px; border-radius:50%;
  background:radial-gradient(circle, #FFF3DF 0%, #FFC98A 35%, rgba(255,138,60,.65) 60%, transparent 75%);
  animation:emberFlicker 1.1s ease-in-out infinite;
}
@keyframes emberFlicker{
  0%,100%{transform:scale(1); opacity:.95;}
  50%{transform:scale(1.35); opacity:.7;}
}
.bar.big{height:10px; border-radius:5px;}
.bar-fill.grand{background:linear-gradient(90deg,#3E7C4F,var(--gold));}
.prize-msg{font-size:12px; margin-top:8px;}
.gold-text{color:var(--gold); font-weight:700;}
.card.won{border-color:var(--gold); box-shadow:0 0 24px rgba(255,214,102,.15);}

.hero{padding:0 0 5px;}
.hero-main{display:flex; align-items:center; gap:12px;}
.flame{font-size:24px;}
.streak-num{
  font-family:'Anton'; font-size:42px; line-height:1; color:var(--ember);
  text-shadow:0 0 30px rgba(255,138,60,.35);
}
.hero-right{min-width:0;}
.streak-label{font-family:'Anton'; letter-spacing:.24em; font-size:12px; text-transform:uppercase;}
.hero-sub{font-size:11px; color:var(--muted); margin-top:3px;}
.hero-sub b{color:var(--chalk); font-weight:800; font-size:12px; font-variant-numeric:tabular-nums;}
.goal-chips{display:flex; gap:6px;}
.goal{
  border:1.5px solid var(--ember); color:var(--ember); border-radius:999px;
  padding:4px 11px; font-weight:800; font-size:14px; font-variant-numeric:tabular-nums;
  display:inline-flex; align-items:center; gap:3px;
}
.goal i{font-style:normal; opacity:.65; font-size:12px;}
.goal.cardio{border-color:var(--steel); color:var(--steel);}
.goal.hit{background:var(--ember); color:#1a1206;}
.goal.hit i{opacity:.7;}
.goal.cardio.hit{background:var(--steel); color:#0e1620;}
.week-done{border-color:var(--gold); box-shadow:0 0 26px rgba(255,214,102,.16);}
@keyframes weekGlow{0%,100%{box-shadow:0 0 22px rgba(255,214,102,.12);}50%{box-shadow:0 0 36px rgba(255,214,102,.3);}}
.wk-done-tag{
  font-family:'Archivo'; font-size:10px; font-weight:800; letter-spacing:.08em;
  color:#1a1206; background:var(--gold); border-radius:999px; padding:3px 9px;
  margin-left:8px; vertical-align:2px; text-transform:uppercase;
}
.shields{margin-left:auto; display:flex; align-items:center; gap:6px;}
.shields .sh{font-size:26px; opacity:.28; filter:grayscale(1);}
.shields .sh.on{opacity:1; filter:none; text-shadow:0 0 12px rgba(224,101,79,.5);}
.sh-label{display:block; font-size:10px; color:var(--muted); margin-top:2px;}
.sh{opacity:.22; font-size:13px;}
.sh.on{opacity:1;}
.sh-label{font-size:10px; color:var(--muted); margin-left:6px;}

.card{background:var(--card); border:1px solid var(--line); border-radius:14px; padding:9px 12px; margin-bottom:5px;}
.card-head{display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px;}
.card-head.wrap{flex-wrap:wrap;}
h2{font-family:'Anton'; font-size:14px; letter-spacing:.1em; text-transform:uppercase; margin:0; font-weight:400;}
.muted{color:var(--muted); font-size:12px;}

.week-card{padding:9px 12px 7px;}
.week-card .card-head{margin-bottom:4px;}
.barbell{position:relative; display:flex; justify-content:space-between; align-items:center; padding:0 2px;}
.bb-slot{position:relative;}
.charge-ring{
  position:absolute; left:50%; top:0; width:40px; height:40px; margin-left:-20px; margin-top:-3px;
  border-radius:50%; display:block; pointer-events:none; z-index:0;
  -webkit-mask:radial-gradient(circle, transparent 60%, #000 63%);
  mask:radial-gradient(circle, transparent 60%, #000 63%);
}
.dot.ring-st{background:#58B368;}
.dot.ring-ab{background:#A78BFA;}
.bb-bar{position:absolute; left:0; right:0; top:17px; transform:translateY(-50%); height:4px; background:var(--line); border-radius:2px; overflow:hidden;}
@keyframes weekPulse{0%{left:-28%;}70%,100%{left:100%;}}
.bb-slot{position:relative; display:flex; flex-direction:column; align-items:center; gap:5px; z-index:1;}
.plate{
  width:32px; height:32px; border-radius:50%; border:3px solid var(--line);
  background:var(--floor); color:var(--chalk); font-size:14px; font-weight:700;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  transition:transform .15s ease, background .2s, border-color .2s;
}
.plate:disabled{cursor:default;}
.plate:active:not(:disabled){transform:scale(.9);}
.plate.sel{outline:2px solid var(--chalk); outline-offset:3px;}
.plate.gymdone{background:var(--ember); border-color:var(--ember-deep); color:#1a1206; animation:clunk .35s cubic-bezier(.2,1.6,.4,1);}
.plate.cardiodone{background:var(--steel); border-color:#4a8fe0; color:#0d1520; animation:clunk .35s cubic-bezier(.2,1.6,.4,1);}
.plate.both{background:var(--gold); border-color:#d9ae3e; color:#1a1206; animation:clunk .35s cubic-bezier(.2,1.6,.4,1);}
.plate.today{border-color:var(--ember); animation:pulse 1.8s infinite;}
.plate.future{opacity:.4;}
@keyframes clunk{0%{transform:scale(1.35);}60%{transform:scale(.92);}100%{transform:scale(1);}}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,138,60,.45);}50%{box-shadow:0 0 0 7px rgba(255,138,60,0);}}
.dow{font-size:11px; color:var(--muted); font-weight:600;}
.dow.now{color:var(--ember);}
.legend{display:flex; justify-content:center; gap:10px; margin-top:2px; font-size:10px; color:var(--muted); flex-wrap:wrap;}
.bb-st{width:5px; height:5px; border-radius:50%; background:#58B368; margin-top:2px;}
.bb-st.off{background:transparent;}
.bb-marks{display:flex; gap:3px; height:5px; margin-top:2px; align-items:center; justify-content:center;}
.bb-mark{width:5px; height:5px; border-radius:50%;}
.bb-mark.stretch{background:#58B368;}
.bb-mark.abs{background:#A78BFA;}
.dot{display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:5px;}
.dot.gym{background:var(--ember);}
.dot.cardio{background:var(--steel);}
.dot.gold{background:var(--gold);}
.dot.rest{background:var(--line);}

.ql-day{display:block; font-family:'Anton'; font-size:9px; letter-spacing:.1em; color:var(--ember); margin-top:2px;}
.past-habits{display:flex; gap:14px; flex-wrap:wrap; margin:2px 0 8px; padding:8px 10px; background:var(--floor); border:1px solid var(--line); border-radius:10px; font-size:12px; align-items:center;}
.ph-item{display:flex; align-items:center; gap:7px;}
.ph-item b{font-family:'Anton'; font-size:10px; letter-spacing:.1em; color:var(--muted); font-weight:400;}
.ph-btn{width:26px; height:26px; border-radius:999px; border:1px solid var(--line); background:transparent; color:var(--chalk); font-size:14px;}
.pill-row{display:flex; gap:6px; flex-wrap:wrap;}
.done-pill{
  border:1px solid var(--line); background:var(--floor); color:var(--chalk);
  border-radius:999px; padding:7px 12px; font-weight:700; font-size:12px; cursor:pointer;
}
.done-pill.on{background:var(--ember); border-color:var(--ember-deep); color:#1a1206;}
.done-pill.csteel.on{background:var(--steel); border-color:#4a8fe0; color:#0d1520;}

.timer-row{display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px;}
.timer-val{font-size:13px; color:var(--muted); font-variant-numeric:tabular-nums;}
.timer-val.live{color:var(--chalk); font-weight:700;}
.rest-row{display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin:2px 0 10px;}
.rest-label{font-size:11px; color:var(--muted); font-weight:700; letter-spacing:.06em; text-transform:uppercase; margin-right:2px;}
.rest-count{font-family:'Anton'; font-size:24px; color:var(--ember); margin-left:4px; min-width:48px; text-align:center;}

.ex-list{margin-bottom:8px;}
.ex-row{display:flex; justify-content:space-between; align-items:flex-start; gap:8px; padding:6px 0; border-bottom:1px solid var(--line);}
.drag-h{
  touch-action:none; user-select:none; -webkit-user-select:none; -webkit-touch-callout:none;
  color:var(--muted); font-size:20px; line-height:1; padding:6px 10px 6px 2px; cursor:grab;
}
.ex-row.drag-src, .ex-row.drag-src *{-webkit-user-select:none; user-select:none;}
.stretch-row{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.stretch-title{font-family:'Anton'; font-size:14px; letter-spacing:.08em; text-transform:uppercase;}
.stretch-go{border-color:var(--ember); color:var(--ember); font-weight:800;}
.stretch-live{border-color:rgba(88,179,104,.6);}
.st-count{font-family:'Anton'; font-size:46px; line-height:1.1; color:#58B368; text-shadow:0 0 26px rgba(88,179,104,.3); font-variant-numeric:tabular-nums;}
.st-dots{display:flex; gap:4px; margin-top:10px;}
.st-dots i{flex:1; height:5px; border-radius:3px; background:var(--line);}
.st-dots i.past{background:#58B368;}
.st-dots i.now{background:var(--ember);}
.st-count.ending{color:var(--ember); text-shadow:0 0 26px rgba(255,138,60,.4);}
.st-change{
  font-size:14px; font-weight:800; color:var(--ember); letter-spacing:.05em;
  text-transform:uppercase; animation:pulse 0.9s infinite;
}
/* stretch + abs side-by-side tiles */
.mini-row{display:flex; gap:8px; margin-bottom:6px;}
.card.mini{display:flex; align-items:center; justify-content:space-between; gap:8px; padding:12px 13px;}
.card.mini .mini-title{font-family:'Anton'; font-size:17px; letter-spacing:.06em; color:var(--chalk); min-width:0; display:flex; align-items:center; gap:6px;}
.mini-min{font-size:11px; color:var(--muted); letter-spacing:.08em;}
.card.mini.md-st{border-color:rgba(88,179,104,.55); box-shadow:0 0 14px rgba(88,179,104,.12);}
.card.mini.md-ab{border-color:rgba(167,139,250,.55); box-shadow:0 0 14px rgba(167,139,250,.12);}
.mini-done{font-family:'Anton'; font-size:12px; letter-spacing:.03em; white-space:nowrap; border-radius:999px; padding:8px 12px; flex-shrink:0;}
.card.mini.md-st .mini-min, .card.mini.md-ab .mini-min{display:none;}
.mini-done.st{color:#58B368; border:1.5px solid rgba(88,179,104,.6); background:rgba(88,179,104,.08);}
.mini-done.ab{color:#A78BFA; border:1.5px solid rgba(167,139,250,.6); background:rgba(167,139,250,.08);}
.chip.mini-go{font-family:'Anton'; letter-spacing:.05em; white-space:nowrap;}
.card.mini{flex:1 1 0; min-width:0; display:flex; flex-direction:row; align-items:center; justify-content:space-between; gap:8px; padding:8px 11px; margin-bottom:0;}
.mini-head{display:flex; flex-direction:column; gap:1px; min-width:0;}
.mini-title{font-family:'Anton'; font-size:13px; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap;}
.mini-meta{font-size:10px; color:var(--muted); white-space:nowrap;}
.chip.mini-go{border-color:var(--ember); color:var(--ember); font-weight:800; text-align:center; padding:7px 12px; flex:0 0 auto;}
.chip.mini-go.abs{border-color:var(--steel); color:var(--steel);}
/* ===== the still point (stretch) ===== */
.stretch-live{border-color:rgba(88,179,104,.45); background:radial-gradient(ellipse at 50% 120%, rgba(88,179,104,.09), var(--card) 60%);}
.stretch-live.sp-ending{border-color:rgba(255,214,102,.55);}
.sp-beads{display:flex; gap:4px; justify-content:center; margin-top:2px;}
.sp-beads i{width:8px; height:8px; border-radius:50%; background:rgba(58,64,73,.8); border:1px solid var(--line); transition:all .4s ease;}
.sp-beads i.lit{background:#58B368; border-color:#58B368; box-shadow:0 0 8px rgba(88,179,104,.6);}
.sp-beads i.cur{border-color:#6FD4C3; animation:beadBreathe 8s ease-in-out infinite;}
@keyframes beadBreathe{0%,100%{transform:scale(1);}50%{transform:scale(1.5);}}
.sp-stage{height:180px; display:flex; align-items:center; justify-content:center; position:relative;}
.sp-halo{position:absolute; border-radius:50%; border:1px solid rgba(111,212,195,.16); animation:orbBreathe 8s ease-in-out infinite;}
.sp-halo.h1{width:186px; height:186px;}
.sp-halo.h2{width:154px; height:154px; animation-delay:.15s;}
.sp-orb{
  width:124px; height:124px; border-radius:50%;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  background:radial-gradient(circle at 38% 32%, rgba(111,212,195,.3), rgba(88,179,104,.08) 70%);
  border:1.5px solid rgba(111,212,195,.5);
  box-shadow:0 0 30px rgba(88,179,104,.3);
  animation:orbBreathe 8s ease-in-out infinite;
}
.sp-ending .sp-orb{background:radial-gradient(circle at 38% 32%, rgba(255,214,102,.32), rgba(255,214,102,.08) 70%); border-color:rgba(255,214,102,.6); box-shadow:0 0 30px rgba(255,214,102,.3);}
.sp-ending .sp-halo{border-color:rgba(255,214,102,.16);}
@keyframes orbBreathe{0%,100%{transform:scale(.88);}50%{transform:scale(1.1);}}
.sp-num{font-family:'Anton'; font-size:36px; color:var(--chalk); line-height:1; font-variant-numeric:tabular-nums;}
.sp-lab{font-size:8px; letter-spacing:.24em; color:var(--muted); margin-top:3px;}
.sp-flavor{text-align:center; font-size:12px; color:var(--muted); font-style:italic; min-height:16px;}
.sp-flavor.amber{color:var(--gold);}
/* ===== the core reactor (abs) ===== */
.abs-live{border-color:rgba(167,139,250,.4); background:radial-gradient(ellipse at 50% -30%, rgba(167,139,250,.1), var(--card) 60%);}
.abs-live.burn{border-color:rgba(217,107,201,.6);}
.abs-live.vent{border-color:rgba(116,179,255,.5);}
.rx-cells{display:flex; gap:3px; margin-top:2px;}
.rx-cells i{flex:1; height:9px; border-radius:2px; background:rgba(58,64,73,.7); border:1px solid var(--line);}
.rx-cells i.done{background:linear-gradient(180deg,#A78BFA,#6d4fc2); border-color:rgba(167,139,250,.7);}
.rx-cells i.cur{
  background:linear-gradient(180deg, rgba(217,107,201,calc(.3 + var(--h,0) * .7)), rgba(109,79,194,calc(.3 + var(--h,0) * .6)));
  border-color:rgba(167,139,250,.7);
  box-shadow:0 0 calc(4px + var(--h,0) * 10px) rgba(217,107,201,calc(var(--h,0) * .8));
}
.rx-stage{height:168px; display:flex; align-items:center; justify-content:center;}
.rx-core{
  width:138px; height:138px;
  clip-path:polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  background:radial-gradient(circle, rgba(217,107,201,calc(.12 + var(--h,0) * .55)), rgba(109,79,194,calc(.08 + var(--h,0) * .35)) 70%);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  transition:background .5s linear;
}
.abs-live.vent .rx-core{background:radial-gradient(circle, rgba(116,179,255,calc(.1 + var(--h,0) * .3)), rgba(30,60,110,.15) 70%);}
.rx-core.meltdown{animation:reactorShake .16s linear infinite;}
@keyframes reactorShake{0%{transform:translate(0,0);}25%{transform:translate(-2px,1px);}50%{transform:translate(2px,-1px);}75%{transform:translate(-1px,-1px);}100%{transform:translate(1px,1px);}}
.rx-num{font-family:'Anton'; font-size:46px; line-height:1; color:var(--chalk); font-variant-numeric:tabular-nums; text-shadow:0 0 18px rgba(217,107,201,.4);}
.abs-live.vent .rx-num{color:var(--steel); text-shadow:0 0 14px rgba(116,179,255,.4);}
.rx-core.meltdown .rx-num{color:#D96BC9;}
.rx-lab{font-size:8px; letter-spacing:.24em; color:var(--muted); margin-top:3px;}
.rx-flavor{text-align:center; font-size:12px; color:var(--muted); font-style:italic; min-height:16px;}
.abs-live.vent .rx-flavor{color:var(--steel);}
.rx-flavor.melt{color:#D96BC9; font-weight:800; font-style:normal;}
.ex-row.drag-src{opacity:.4;}
.ex-row.drag-over{border-top:2px solid var(--ember);}
.done-overlay{
  position:fixed; inset:0; background:rgba(10,11,14,.72); z-index:45;
  display:flex; align-items:center; justify-content:center; padding:24px;
}
.done-card{
  background:var(--card); border:1px solid var(--gold); border-radius:16px;
  padding:20px; width:100%; max-width:360px;
  box-shadow:0 0 60px rgba(255,214,102,.18);
}
.done-lines{margin:14px 0; font-size:13px; text-align:center; color:var(--chalk);}
.ex-main{flex:1; min-width:0;}
.ex-name{font-weight:700; font-size:14px;}
.ex-name-btn{background:none; border:none; color:var(--chalk); font-weight:700; font-size:14px; padding:0; text-align:left; cursor:pointer; font-family:'Archivo';}
.pencil{color:var(--muted); font-size:11px;}
.rename-row{display:flex; gap:6px; margin-bottom:4px;}
.rename-row .inp{flex:1; padding:9px 10px; font-size:16px;}
.rename-row .add{padding:0 14px;}
.rename-row .step-btn{min-width:40px; padding:0;}
.ex-sets{font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; margin-top:2px;}
.setpills{display:flex; flex-wrap:wrap; gap:5px; margin-top:6px;}
.setpill{
  border:1px solid var(--line); background:var(--floor); color:var(--muted);
  border-radius:7px; padding:4px 9px; font-size:12px; cursor:pointer;
  font-variant-numeric:tabular-nums;
}
.setpill.on{border-color:var(--ember); color:var(--ember);}
.edit-actions{display:flex; gap:12px; justify-content:flex-end; margin-top:8px;}
.x{background:none; border:none; color:var(--muted); font-size:14px; cursor:pointer; padding:6px;}

.chips{display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;}
.chip{
  border:1px solid var(--line); background:var(--floor); color:var(--muted);
  border-radius:999px; padding:6px 11px; font-size:12px; cursor:pointer;
}
.chip.on{border-color:var(--ember); color:var(--ember);}
.chip.tmpl{border-color:var(--gold); color:var(--gold); font-weight:700;}
.chip.tmpl.assigned{background:rgba(255,214,102,.12);}

.inp{
  background:var(--floor); border:1px solid var(--line); color:var(--chalk);
  border-radius:10px; padding:12px; font-size:16px; font-family:'Archivo'; width:100%;
}
.inp::placeholder{color:var(--muted);}
.inp.wide{margin-bottom:8px;}
.field{margin-bottom:10px;}
.field-label{font-size:11px; color:var(--muted); font-weight:700; letter-spacing:.06em; text-transform:uppercase; margin-bottom:5px;}
.stepper{display:flex; gap:5px; align-items:stretch;}
.step-btn{
  min-width:44px; border:1px solid var(--line); background:var(--floor); color:var(--chalk);
  border-radius:10px; font-weight:700; font-size:13px; cursor:pointer; padding:12px 2px;
  font-variant-numeric:tabular-nums;
}
.step-btn:active{background:var(--line); transform:scale(.96);}
.step-inp{flex:1; min-width:52px; text-align:center; font-weight:700; padding:12px 4px;}
.add{
  border:none; background:var(--ember); color:#1a1206; font-weight:700;
  border-radius:10px; padding:0 16px; cursor:pointer; font-size:14px; white-space:nowrap;
}
.add:active{transform:scale(.97);}
.add.block{width:100%; padding:13px; margin-top:2px;}
.set-row{display:flex; gap:8px;}
.set-row .inp{flex:1; min-width:0;}
.hint{font-size:11px; color:var(--muted); margin:10px 0 0;}

.ps5-row{display:flex; justify-content:space-between; align-items:center; gap:10px;}
.ps5-balance{font-family:'Anton'; font-size:34px; color:var(--steel); line-height:1; text-shadow:0 0 22px rgba(116,179,255,.28); animation:popIn .5s cubic-bezier(.2,1.6,.4,1);}
.ps5-balance.debt{color:var(--red); animation:popIn .5s cubic-bezier(.2,1.6,.4,1);}
@keyframes ps5Glow{0%,100%{text-shadow:0 0 18px rgba(116,179,255,.24);}50%{text-shadow:0 0 32px rgba(116,179,255,.48);}}
@keyframes ps5GlowDebt{0%,100%{text-shadow:0 0 16px rgba(224,101,79,.22);}50%{text-shadow:0 0 28px rgba(224,101,79,.44);}}
.ps5-btns{display:flex; flex-direction:column; gap:6px; align-items:flex-end;}
.spend{border:1px solid var(--steel); background:transparent; color:var(--steel); border-radius:999px; padding:7px 12px; font-weight:700; font-size:12px; cursor:pointer;}
.spend:active{transform:scale(.97);}
.ps5-meta{margin-top:10px; font-size:11px;}

.grid{display:grid; grid-template-columns:repeat(3,1fr); gap:8px;}
.badge{background:var(--floor); border:1px solid var(--line); border-radius:10px; padding:10px 6px; text-align:center; opacity:.38;}
.badge.on{opacity:1; border-color:rgba(255,214,102,.5);}
.b-icon{font-size:20px;}
.b-name{font-size:11px; font-weight:700; margin-top:4px;}
.b-desc{font-size:9.5px; color:var(--muted); margin-top:2px;}

.wk{display:flex; align-items:center; gap:10px; padding:7px 0; border-top:1px solid var(--line);}
.wk:first-of-type{border-top:none;}
.wk-label{font-size:12px; color:var(--muted); width:52px;}
.wk-dots{flex:1; display:flex; gap:5px;}
.wk-dots .dot{margin:0; width:9px; height:9px;}
.wk-score{font-size:12px; color:var(--muted); font-variant-numeric:tabular-nums; margin-left:auto;}
.wk-score.perfect{color:var(--gold);}
.pr-name{font-weight:700; font-size:13px; flex:1;}
.pr-kg{font-size:13px; color:var(--ember); font-variant-numeric:tabular-nums;}

.foot{text-align:center; margin-top:8px; font-size:12px; color:var(--muted);}

.start-wrap{margin-top:2px;}
.start-wrap.wb{position:relative; overflow:hidden; margin:0 -14px -12px; padding:2px 16px 12px; border-radius:0 0 16px 16px;}
.wb-alts{flex-wrap:nowrap; gap:8px; margin-top:8px;}
.wb-alts .chip.wb-alt{flex:1; padding:8px 0; text-align:center;}
.day-card.warfront{background:linear-gradient(160deg, #241812, var(--card) 55%); overflow:hidden;}
.wb-ember{position:absolute; bottom:0; width:3px; height:3px; border-radius:50%; opacity:0; animation-name:wbUp; animation-timing-function:linear; animation-iteration-count:infinite;}
@keyframes wbUp{0%{transform:translateY(0); opacity:0;}15%{opacity:.8;}100%{transform:translateY(-90px) translateX(var(--dx)); opacity:0;}}
.wb-name{font-family:'Anton'; font-size:40px; line-height:1; letter-spacing:.02em; color:var(--chalk); text-shadow:0 0 26px rgba(255,138,60,.35); position:relative;}
.wb-name span{color:var(--ember);}
.wb-ex{font-size:11px; color:var(--muted); margin:2px 0 9px; position:relative;}
.start-big.wb-start{width:100%; font-family:'Archivo Black'; font-size:17px; letter-spacing:.04em; border-radius:13px; padding:13px 0; border:none; background:linear-gradient(90deg, #B4501E, var(--ember)); color:#1a1206; box-shadow:0 6px 28px rgba(255,138,60,.45); display:flex; align-items:center; justify-content:center; position:relative;}
.wb-tri{display:inline-block; width:0; height:0; border-top:8px solid transparent; border-bottom:8px solid transparent; border-left:13px solid #1a1206; margin-right:10px;}
.chip.wb-alt{font-family:'Anton'; letter-spacing:.06em; border-color:var(--line); color:var(--muted); background:transparent; font-weight:400;}
.start-sub{font-size:10px; letter-spacing:.12em; color:var(--muted); margin-bottom:4px; text-transform:uppercase;}
.start-big{
  position:relative; overflow:hidden; isolation:isolate;
  width:100%; padding:12px; border:none; border-radius:12px;
  background:linear-gradient(135deg, var(--ember), var(--ember-deep));
  color:#1a1206; font-family:'Anton';
  font-size:17px; letter-spacing:.06em; text-transform:uppercase; cursor:pointer;
  margin-bottom:10px; box-shadow:0 4px 20px rgba(255,138,60,.25);
  animation:emberBreathe 2.6s ease-in-out infinite;
}
.start-big::before{
  content:""; position:absolute; top:0; bottom:0; left:-65%; width:45%;
  background:linear-gradient(100deg, transparent, rgba(255,236,214,.55), transparent);
  transform:skewX(-18deg); pointer-events:none; z-index:2;
  animation:startSheen 3.8s ease-in-out infinite;
}
.start-big:active{transform:scale(.98);}
@keyframes emberBreathe{
  0%,100%{box-shadow:0 4px 20px rgba(255,138,60,.25);}
  50%{box-shadow:0 6px 30px rgba(255,138,60,.55);}
}
@keyframes startSheen{
  0%{left:-65%;}
  55%,100%{left:135%;}
}
.chips.center{justify-content:center;}
.start-wrap .set-row{margin:4px 0 8px;}
.sum-row{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.sum-text{font-size:13px;}
.hr{border-top:1px solid var(--line); margin:12px 0;}
.side-row{display:flex; align-items:center; justify-content:space-between; gap:10px;}
.side-num{font-family:'Anton'; font-size:22px; color:var(--chalk);}
.side-num.over{color:var(--red);}
.side-unit{font-family:'Archivo'; font-size:12px; color:var(--muted); font-weight:400;}
.count-btns{display:flex; flex-direction:column; gap:4px; align-items:center;}
.chip.big-chip{padding:10px 20px; font-size:16px; font-weight:700; border-color:var(--ember); color:var(--ember);}
.walk-hero{display:flex; align-items:flex-end; justify-content:space-between; gap:12px;}
.walk-main{display:flex; align-items:baseline; gap:6px;}
.walk-big{
  font-family:'Anton'; font-size:20px; line-height:.9; color:var(--steel);
  font-variant-numeric:tabular-nums; text-shadow:0 0 24px rgba(116,179,255,.32);
  animation:popIn .5s cubic-bezier(.2,1.6,.4,1);
}
.walk-unit{font-family:'Anton'; font-size:18px; color:var(--muted);}
.walk-lab{font-size:10px; color:var(--muted); letter-spacing:.08em; text-transform:uppercase; margin-top:2px;}
.walk-today{text-align:right; flex:0 0 auto;}
.today-num{font-family:'Anton'; font-size:45px; color:var(--steel); line-height:1; font-variant-numeric:tabular-nums;}
.today-num .u{font-size:14px; color:var(--muted);}
.link.tiny{font-size:10px; padding:0; text-transform:none; letter-spacing:0;}
@keyframes steelBreathe{0%,100%{text-shadow:0 0 20px rgba(116,179,255,.26);}50%{text-shadow:0 0 32px rgba(116,179,255,.46);}}
@keyframes popIn{0%{transform:scale(.9);}60%{transform:scale(1.03);}100%{transform:scale(1);}}
@keyframes appIn{from{opacity:0;}to{opacity:1;}}
.tab-pane{animation:paneIn .18s ease;}
@keyframes paneIn{from{opacity:0; transform:translateY(5px);}to{opacity:1; transform:none;}}
.boss-overlay{
  position:fixed; inset:0; z-index:40; display:flex; align-items:center; justify-content:center;
  background:radial-gradient(ellipse at center, rgba(40,32,12,.92), rgba(10,11,14,.96));
  animation:appIn .35s ease; padding:28px;
}
.boss-inner{text-align:center; max-width:340px; width:100%;}
.boss-dragon{font-size:74px; animation:popIn .6s cubic-bezier(.2,1.6,.4,1);}
.boss-slain{
  font-family:'Anton'; font-size:34px; letter-spacing:.1em; color:var(--gold);
  text-shadow:0 0 34px rgba(255,214,102,.55); margin-top:8px;
  animation:popIn .6s cubic-bezier(.2,1.6,.4,1) .1s backwards;
}
.boss-name{font-family:'Anton'; font-size:26px; color:var(--chalk); margin-top:10px; letter-spacing:.06em;}
.boss-line{color:var(--muted); font-size:14px; margin-top:4px; font-variant-numeric:tabular-nums;}
.belt{height:8px; background:var(--floor); border:1px solid var(--line); border-radius:5px; margin-top:6px; overflow:hidden;}
.belt-fill{
  height:100%; border-radius:5px; position:relative; overflow:hidden;
  background:linear-gradient(90deg,#4a8fe0,var(--steel));
  transition:width 1s cubic-bezier(.2,.8,.2,1);
}
.belt-fill::after{
  content:""; position:absolute; inset:0;
  background:repeating-linear-gradient(115deg, rgba(255,255,255,.16) 0 7px, transparent 7px 18px);
  opacity:0; transition:opacity .35s ease;
}
.belt-fill.rolling::after{
  opacity:1;
  animation:beltScroll .8s linear infinite;
}
@keyframes beltScroll{from{background-position:0 0;}to{background-position:36px 0;}}
.belt-note{display:flex; justify-content:space-between; font-size:11px; margin-top:4px;}
.ck-done{display:flex; align-items:center; gap:10px;}
.ck-badge{font-size:13px; font-weight:800; color:#58B368; letter-spacing:.02em;}
.ck-latest{display:flex; flex-wrap:wrap; gap:6px; margin-top:9px;}
.ck-pill{border:1.5px solid var(--line); border-radius:999px; padding:4px 12px; font-size:12px; font-weight:700; background:var(--floor);}
.chips.ck-stack{flex-direction:column; align-items:stretch;}
.chip.ck-sev{display:flex; flex-direction:column; align-items:flex-start; gap:2px; padding:12px 14px; text-align:left; width:100%;}
.ck-q{font-size:13px; font-weight:600; margin-bottom:6px;}
.ck-strip{display:flex; gap:10px; margin-top:12px; flex-wrap:wrap;}
.ck-item{display:flex; flex-direction:column; align-items:center; gap:3px; font-size:9px; color:var(--muted); background:none; border:none; padding:2px; cursor:pointer; font-family:'Archivo';}
.ck-item.sel .ck-dot{outline:2px solid var(--chalk); outline-offset:2px;}
.ck-dot{width:14px; height:14px; border-radius:50%; display:block; position:relative;}
.ck-dot.noted::after{content:"\u{1F4DD}"; position:absolute; top:-7px; right:-8px; font-size:8px;}
.ck-sev{display:inline-flex; flex-direction:column; align-items:flex-start; gap:1px;}
.ck-desc{display:block; font-size:9px; opacity:.75;}
.ck-ta{min-height:64px; resize:vertical; font-size:14px; margin-top:2px;}
.ck-detail{font-size:12px; margin-top:10px; line-height:1.5;}
.last-time{font-size:10px; color:var(--muted); margin-top:2px; font-variant-numeric:tabular-nums;}
.recap{font-size:13px; line-height:1.9;}
.eg-title{font-family:'Anton'; font-size:20px; letter-spacing:.04em;}
.eg-grid{display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:12px;}
.eg-tile{background:var(--floor); border:1px solid var(--line); border-radius:10px; padding:10px 6px; text-align:center;}
.eg-num{font-family:'Anton'; font-size:18px; color:var(--gold);}
.eg-lab{font-size:9px; color:var(--muted); margin-top:2px;}
.ladder{position:relative; padding-left:4px;}
.ladder::before{content:""; position:absolute; left:9px; top:10px; bottom:10px; width:2px; background:var(--line); border-radius:2px;}
.rung{position:relative; display:flex; align-items:center; gap:11px; padding:5px 8px 5px 0; border-radius:10px; opacity:.42;}
.rung.reached{opacity:1;}
.rung.current{background:var(--floor); border:1px solid var(--ember); opacity:1; padding-left:0;}
.rung-dot{width:8px; height:8px; border-radius:50%; background:#3A4049; margin-left:2px; flex-shrink:0; z-index:1;}
.rung.reached .rung-dot{background:var(--gold); box-shadow:0 0 7px rgba(255,214,102,.55);}
.rung.current .rung-dot{background:var(--ember); box-shadow:0 0 9px rgba(255,138,60,.8);}
.rung-title{font-family:'Anton'; font-size:15px; letter-spacing:.05em; white-space:nowrap;}
.rung.reached .rung-title{color:var(--gold);}
.rung.current .rung-title{color:var(--ember);}
.rung-xp{font-family:'Anton'; font-size:11px; letter-spacing:.04em; color:var(--muted); margin-left:auto; font-variant-numeric:tabular-nums; white-space:nowrap;}
.rung.current .rung-xp{color:var(--ember);}
.earn-list{font-size:12px; line-height:1.7;}
.earn-list b{color:var(--gold); font-variant-numeric:tabular-nums;}
.chip.epic{border-color:var(--gold); color:var(--gold); font-weight:900; font-size:14px;}
.walk-chips{display:flex; gap:5px; margin-top:6px;}
.chip.wc{flex:1; padding:7px 0; text-align:center; font-variant-numeric:tabular-nums; white-space:nowrap;}
.chip.wc.mythic{border-color:var(--ember); color:var(--ember); box-shadow:0 0 10px rgba(255,138,60,.3);}
.chip.wc.legendary{border-color:var(--red); color:#f2a396; box-shadow:0 0 12px rgba(224,101,79,.4);}
.chip.epic:active{background:rgba(255,214,102,.15);}
.setpill.done{border-color:#58B368; color:#58B368; font-weight:700;}
.ex-row.skipped .ex-main{opacity:.4;}
.ex-row.skipped .ex-name-btn{text-decoration:line-through;}
.skip-tag{
  display:inline-block; font-size:9px; font-weight:800; letter-spacing:.06em; text-transform:uppercase;
  border:1px solid var(--muted); color:var(--muted); border-radius:999px; padding:1px 8px; margin-top:3px;
}
.setpill.cur{border-color:var(--ember); color:var(--ember); animation:pulse 1.8s infinite;}
.setpill.future{opacity:.45;}
.cur-adjust{
  background:var(--floor); border:1px solid rgba(255,138,60,.5); border-radius:12px;
  padding:12px; margin-top:8px; display:flex; flex-direction:column; gap:10px;
}
.ca-row{display:flex; align-items:center; gap:6px; flex-wrap:nowrap;}
.ca-lab{font-size:11px; color:var(--muted); width:26px; flex:0 0 auto; text-transform:uppercase; letter-spacing:.05em; font-weight:700;}
.ca-val{font-family:'Anton'; font-size:20px; flex:0 0 auto; min-width:34px; text-align:center; font-variant-numeric:tabular-nums;}
.chip.ca{flex:1 1 0; min-width:0; padding:11px 2px; font-size:13px; font-weight:700; text-align:center; color:var(--chalk); font-variant-numeric:tabular-nums;}
.ca-done{margin-left:auto; flex:0 0 auto; padding:12px 18px; font-size:16px; white-space:nowrap;}
.cur-adjust .link{font-size:14px; padding:4px 2px;}
.ex-row.active-ex{
  border-left:3px solid var(--ember); margin-left:-10px; padding-left:7px;
  background:linear-gradient(90deg, rgba(255,138,60,.06), transparent 60%);
  border-radius:4px;
}
.ex-row.active-ex .ex-name-btn{color:var(--ember);}
.ca-close{padding:6px 12px;}
.pr-delta{font-size:11px; color:var(--muted); min-width:76px; text-align:right; font-variant-numeric:tabular-nums;}
.pr-delta.up{color:#58B368; font-weight:700;}
.pr-delta.downd{color:var(--red);}
.tgt-lines{border-top:1px solid var(--line); margin-top:8px; padding-top:8px;}
.tgt-head{font-family:'Anton'; font-size:12px; letter-spacing:.12em; color:var(--gold); margin-bottom:4px; display:flex; justify-content:space-between; align-items:baseline;}
.tgt-head .muted{font-family:'Archivo'; font-size:10px; letter-spacing:0;}
.tgt-title{display:inline-block; text-shadow:0 0 10px rgba(255,214,102,.35);}
.tgt-line{display:flex; align-items:center; gap:8px; font-size:12px; padding:3px 0;}
.tgt-name{font-weight:700; color:var(--gold); white-space:nowrap;}
.tgt-bar{flex:1; height:5px; background:var(--line); border-radius:3px; overflow:hidden;}
.tgt-bar i{display:block; height:100%; position:relative; overflow:hidden; background:linear-gradient(90deg, var(--ember), var(--gold)); border-radius:3px;}
@keyframes bossCharge{0%{transform:translateX(-100%);}60%,100%{transform:translateX(220%);}}
.tgt-pct{font-variant-numeric:tabular-nums; color:var(--muted); min-width:64px; text-align:right;}
.tgt-hit{color:var(--gold); font-weight:800; margin-left:auto; text-shadow:0 0 10px rgba(255,214,102,.4);}
.tgt-block{padding:6px 0; border-bottom:1px solid rgba(58,64,73,.5);}
.tgt-block:last-child{border-bottom:none;}
.tgt-row1{display:flex; align-items:center; gap:8px;}
.tgt-verdict{
  margin-left:auto; font-size:10px; font-weight:900; letter-spacing:.1em;
  border-radius:999px; padding:2px 9px; border:1.5px solid;
}
.v-grinding{color:var(--muted); border-color:var(--muted);}
.v-building{color:var(--chalk); border-color:var(--chalk);}
.v-close{color:var(--ember); border-color:var(--ember); text-shadow:0 0 8px rgba(255,138,60,.4);}
.v-ready{color:#1a1206; background:var(--gold); border-color:var(--gold);}
.tgt-bar.big{display:block; position:relative; height:7px; margin-top:7px; background:var(--line); border-radius:4px; overflow:visible;}
.tgt-bar.big i{display:block; height:100%; background:linear-gradient(90deg, var(--ember), var(--gold)); border-radius:4px;}
.tgt-ready-mark{position:absolute; right:0; top:-2px; bottom:-2px; width:2px; background:var(--gold); border-radius:1px; opacity:.8;}
.tgt-sub{font-size:11px; color:var(--muted); margin-top:5px; font-variant-numeric:tabular-nums;}
.boss-card{
  position:relative; overflow:hidden;
  border-color:rgba(255,214,102,.5);
  background:linear-gradient(150deg, rgba(255,214,102,.08), var(--card) 45%);
}
.boss-card::after{
  content:"\u{1F409}"; position:absolute; right:-8px; bottom:-16px; font-size:92px;
  opacity:.07; pointer-events:none; transform:rotate(-8deg);
}
.boss-row{padding:10px 0; border-bottom:1px solid rgba(58,64,73,.5); position:relative; z-index:1;}
.boss-row:last-child{border-bottom:none; padding-bottom:2px;}
.boss-name{font-family:'Anton'; font-size:17px; letter-spacing:.05em; color:var(--chalk);}
.boss-goal{color:var(--gold); text-shadow:0 0 12px rgba(255,214,102,.35);}
.boss-target{
  font-family:'Anton'; font-size:54px; line-height:1; color:var(--gold);
  text-shadow:0 0 26px rgba(255,214,102,.45), 0 0 8px rgba(255,214,102,.3);
  margin:3px 0 2px; font-variant-numeric:tabular-nums;
}
.boss-target i{font-style:normal; font-size:22px; color:var(--muted); letter-spacing:.06em;}
.boss-bounty{font-family:'Anton'; font-size:13px; letter-spacing:.04em; color:var(--gold); border:1.5px solid var(--gold); border-radius:999px; padding:7px 13px; box-shadow:0 0 16px rgba(255,214,102,.3); background:rgba(255,214,102,.07); white-space:nowrap;}
.boss-enemy{font-family:'Anton'; font-size:23px; letter-spacing:.04em; margin:0 0 6px; white-space:nowrap;}
.boss-epithet{display:block; font-family:'Anton'; font-size:12px; letter-spacing:.12em; color:var(--muted); text-shadow:none; margin-top:1px; white-space:nowrap;}
.boss-enemy.e-dl{color:var(--ember); text-shadow:0 0 12px rgba(255,138,60,.35);}
.boss-enemy.e-bp{color:var(--steel); text-shadow:0 0 12px rgba(116,179,255,.35);}
.boss-track{
  display:block; position:relative; height:10px; margin-top:8px;
  background:var(--floor); border:1px solid var(--line); border-radius:6px; overflow:hidden;
}
.boss-fill{
  display:block; height:100%; width:100%; border-radius:6px;
  background:linear-gradient(90deg, var(--ember-deep), var(--ember), var(--gold));
  transform-origin:left; transform:scaleX(var(--p, 0));
  animation:bossGrow 1.1s cubic-bezier(.2,.8,.25,1);
  position:relative; overflow:hidden;
}
.boss-fill::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(100deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
  transform:translateX(-100%); animation:bossSheen 3s ease-in-out infinite;
}
@keyframes bossGrow{from{transform:scaleX(0);}}
@keyframes bossSheen{0%{transform:translateX(-100%);}55%,100%{transform:translateX(100%);}}
.chip.boss-go{margin-top:9px; border-color:var(--gold); color:var(--gold); font-weight:800; width:100%; text-align:center; padding:9px 0;}
/* ===== quest board on Today ===== */
.sendit{
  display:flex; align-items:center; gap:10px; padding:10px 13px;
  background:linear-gradient(135deg, rgba(255,214,102,.15), rgba(30,34,42,.92) 55%);
  border-color:rgba(255,214,102,.6); animation:siPulse 2.2s ease-in-out infinite;
}
@keyframes siPulse{0%,100%{box-shadow:0 0 12px rgba(255,214,102,.25);}50%{box-shadow:0 0 28px rgba(255,214,102,.55);}}
.si-ic{font-size:20px;}
.si-txt{flex:1; min-width:0;}
.si-t{font-family:'Anton'; font-size:14px; letter-spacing:.08em; color:var(--gold);}
.si-s{font-size:11px; color:var(--muted);}
.si-s b{color:var(--gold);}
.chip.si-go{border-color:var(--gold); color:#1a1206; background:var(--gold); font-family:'Anton'; font-weight:800; letter-spacing:.06em; padding:9px 16px;}
.quest{display:flex; align-items:center; gap:10px; padding:8px 13px; border-color:rgba(255,138,60,.5); background:rgba(255,138,60,.05);}
.q-txt{min-width:0;}
.q-name{display:flex; align-items:center; gap:6px; font-family:'Anton'; font-size:12px; letter-spacing:.06em; color:var(--ember); white-space:nowrap;}
.q-sub{font-family:'Anton'; font-size:10px; letter-spacing:.08em; color:var(--muted);}
.q-btns{display:flex; flex-direction:row; gap:6px; margin-left:auto; flex-wrap:nowrap; align-items:center;}
.q-btns .tr-go{padding:6px 10px; font-size:10.5px; white-space:nowrap;}
/* ===== gatekeeper reveal ===== */
.gk-card{
  position:relative; overflow:hidden;
  background:radial-gradient(ellipse at 85% 0%, rgba(224,101,79,.16), var(--card) 55%);
  border-color:rgba(224,101,79,.6);
  animation:gkMenace 2.4s ease-in-out infinite;
}
@keyframes gkMenace{0%,100%{box-shadow:0 0 14px rgba(224,101,79,.22);}50%{box-shadow:0 0 30px rgba(224,101,79,.5);}}
.gk-demon{position:absolute; right:2px; top:-4px; font-size:56px; animation:gkSway 3.4s ease-in-out infinite; transform-origin:bottom center;}
@keyframes gkSway{0%,100%{transform:rotate(-4deg);}50%{transform:rotate(3deg) scale(1.05);}}
.gk-eyebrow{font-family:'Anton'; font-size:11px; letter-spacing:.14em; color:var(--red);}
.gk-title{font-family:'Anton'; font-size:19px; letter-spacing:.05em; margin-top:3px; max-width:76%; text-shadow:0 0 16px rgba(224,101,79,.4);}
.gk-sub{font-size:11px; color:var(--muted); margin-top:4px; max-width:76%;}
.gk-sub .gk-kg{color:var(--red);}
.chip.gk-go{margin-top:10px; border-color:var(--red); color:var(--red); background:rgba(224,101,79,.1); font-weight:800; font-family:'Anton'; letter-spacing:.05em; padding:9px 16px;}
/* ===== trial row on boss card ===== */
.trial-row{margin-top:9px; border:1.5px solid rgba(255,138,60,.5); background:rgba(255,138,60,.06); border-radius:11px; padding:9px 11px;}
.tr-head{display:flex; align-items:baseline; gap:8px;}
.tr-name{font-family:'Anton'; font-size:13px; color:var(--ember); letter-spacing:.05em;}
.tr-meta{font-size:9px; color:var(--muted); letter-spacing:.06em; margin-left:auto;}
.tr-cry{font-family:'Anton'; font-size:12px; color:var(--chalk); letter-spacing:.05em; margin-top:3px;}
.tr-foot{display:flex; align-items:center; gap:8px; margin-top:7px;}
.chip.tr-go{border-color:var(--ember); color:var(--ember); font-family:'Anton'; font-weight:800; letter-spacing:.05em; padding:7px 16px;}
.gate-stamp{
  display:inline-block; margin-top:9px; font-size:11px; font-weight:800; color:var(--ember);
  border:1.5px solid rgba(255,138,60,.6); border-radius:999px; padding:3px 11px; background:rgba(255,138,60,.08);
}
.gate-stamp .gs-sub{color:var(--gold); font-weight:600; font-style:italic;}
.gk-quote{
  display:block; width:100%; text-align:left; background:transparent; border:none; cursor:pointer;
  font-size:17px; color:var(--muted); margin-top:6px; padding:0; line-height:1.5;
}
.gk-quote em{color:var(--red); font-style:italic;}
.gk-quote.barking{animation:gkBark .32s ease-out;}
.gk-quote.barking em{animation:gkSpeak .5s ease-out forwards;}
.gk-quote.barking .gk-skull{display:inline-block; animation:gkSnarl .45s ease-out;}
@keyframes gkBark{0%{transform:translate(0,0);}15%{transform:translate(-3px,1px);}30%{transform:translate(3px,-1px);}45%{transform:translate(-2px,0);}60%{transform:translate(1px,1px);}100%{transform:translate(0,0);}}
@keyframes gkSnarl{0%{transform:scale(1);}30%{transform:scale(1.35) rotate(-8deg);}60%{transform:scale(1.15) rotate(4deg);}100%{transform:scale(1);}}
@keyframes gkSpeak{0%{opacity:0; transform:translateX(-6px); color:#fff;}40%{opacity:1; color:#ffb3a0;}100%{transform:translateX(0); color:var(--red);}}
.gk-q-more{display:block; font-size:9px; letter-spacing:.08em; color:var(--muted); opacity:.7; margin-top:1px; text-transform:uppercase;}
/* ===== fight interlude ===== */
.fi{position:relative; overflow:hidden;}
.fi-atmo{position:absolute; inset:0; overflow:hidden; pointer-events:none;}
.fi-atmo .p{position:absolute; bottom:-6px; width:3px; height:3px; border-radius:50%; background:var(--ember); box-shadow:0 0 6px var(--ember); opacity:0; animation:atmoRise 4s linear infinite;}
@keyframes atmoRise{0%{transform:translate(0,0); opacity:0;}12%{opacity:.7;}100%{transform:translate(var(--dx,0), -320px); opacity:0;}}
.fi.t-bp.fi-boss .fi-atmo .p{bottom:auto; top:-50px; width:1.5px; height:28px; border-radius:0; background:linear-gradient(180deg, rgba(116,179,255,.5), transparent); box-shadow:none; animation:atmoRain 1.4s linear infinite;}
@keyframes atmoRain{0%{transform:translateY(0); opacity:.7;}100%{transform:translateY(340px); opacity:.5;}}
.fi-atmo .storm{position:absolute; inset:0; opacity:0; background:radial-gradient(ellipse at 50% -20%, rgba(116,179,255,.4), transparent 60%); animation:atmoStorm 4.5s linear infinite;}
.fi-atmo .storm.s2{background:radial-gradient(ellipse at 20% -10%, rgba(180,200,255,.35), transparent 55%); animation-duration:6.2s; animation-delay:2s;}
@keyframes atmoStorm{0%,91%,100%{opacity:0;}93%,95%{opacity:.5;}}
.fi-atmo .hcol{position:absolute; bottom:0; width:22px; height:110px; background:linear-gradient(180deg, transparent, rgba(255,138,60,.15)); filter:blur(6px); transform-origin:bottom; animation:atmoShim 2.6s ease-in-out infinite;}
@keyframes atmoShim{0%,100%{transform:scaleY(1); opacity:.15;}50%{transform:scaleY(1.35); opacity:.38;}}
.fi.t-bp .fi-atmo{filter:hue-rotate(215deg) saturate(.85);}
.fi.t-bp.fi-boss .fi-atmo{filter:none;}
.fi-boss{border-color:rgba(255,214,102,.5); background:radial-gradient(ellipse at 50% -40%, rgba(255,214,102,.09), var(--card) 60%);}
.fi-gate{position:relative;}
.fi.fi-gate{border-color:rgba(224,101,79,.5); background:radial-gradient(ellipse at 50% -40%, rgba(224,101,79,.12), var(--card) 60%); animation:gkMenace 2.6s ease-in-out infinite;}
.fi.fi-trial{border-color:rgba(255,138,60,.5); background:radial-gradient(ellipse at 50% 130%, rgba(255,138,60,.12), var(--card) 60%);}
.fi.fi-boss{animation:fiGold 2.6s ease-in-out infinite;}
@keyframes fiGold{0%,100%{box-shadow:0 0 14px rgba(255,214,102,.18);}50%{box-shadow:0 0 30px rgba(255,214,102,.4);}}
.fi-head{display:flex; justify-content:space-between; align-items:baseline; gap:8px;}
.fi-title{font-family:'Anton'; font-size:12px; letter-spacing:.1em; color:var(--chalk);}
.fi-count{font-size:10px; color:var(--muted); letter-spacing:.08em;}
.tread-card{padding:9px 13px 11px;}
.tread-card .card-head{margin-bottom:0;}
.tread-card .walk-hero{margin-top:0;}
.doi-grid{display:grid; grid-template-columns:repeat(24, 1fr); gap:3px; margin-top:4px;}
.doi{height:9px; border-radius:2px; background:rgba(58,64,73,.55); border:1px solid #23272E; display:block;}
.doi.fut{opacity:.28;}
.doi.now{border-color:var(--chalk);}
.doi.gym{background:var(--ember); border-color:var(--ember); box-shadow:0 0 5px rgba(255,138,60,.5); animation:doiK 2.4s ease-in-out infinite;}
.doi.cardio{background:var(--steel); border-color:var(--steel); box-shadow:0 0 5px rgba(116,179,255,.5); animation:doiK 2.8s ease-in-out infinite;}
.doi.both{background:var(--gold); border-color:var(--gold); box-shadow:0 0 6px rgba(255,214,102,.55); animation:doiK 2.2s ease-in-out infinite;}
.doi.stretch{background:#58B368; border-color:#58B368; box-shadow:0 0 5px rgba(88,179,104,.5); animation:doiK 3s ease-in-out infinite;}
.doi.abs{background:#A78BFA; border-color:#A78BFA; box-shadow:0 0 5px rgba(167,139,250,.5); animation:doiK 2.6s ease-in-out infinite;}
@keyframes doiK{0%,100%{opacity:.85;}50%{opacity:1; filter:brightness(1.25);}}
.doi-legend{display:flex; gap:9px; flex-wrap:wrap; margin-top:9px; font-size:9px; color:var(--muted);}
.doi-legend span{display:flex; align-items:center; gap:4px;}
.doi-legend .doi{width:8px; height:8px; animation:none;}
.hpwrap{position:relative; height:22px; margin-top:8px; border-radius:7px; background:rgba(58,64,73,.6); border:1px solid var(--line); overflow:hidden;}
.hpfill{position:absolute; inset:0; background:linear-gradient(90deg,#8e3527,var(--red) 60%,#f08a76); transition:width .5s cubic-bezier(.2,.8,.3,1);}
.hp-trial .hpfill{background:linear-gradient(90deg,#b4501e,var(--ember) 60%,#ffc08a);}
.hpchunk{position:absolute; top:0; bottom:0; background:#fff; animation:hpDrain .55s ease-out forwards;}
@keyframes hpDrain{0%{opacity:1; box-shadow:0 0 18px #fff;}100%{opacity:0; box-shadow:none;}}
.hpdmg{position:absolute; right:12%; top:-4px; font-family:'Anton'; font-size:14px; color:var(--gold); text-shadow:0 0 10px var(--ember); animation:hpDmg 1s ease-out forwards; pointer-events:none;}
@keyframes hpDmg{0%{transform:translateY(0) scale(.7); opacity:0;}15%{opacity:1; transform:translateY(-6px) scale(1.1);}100%{transform:translateY(-30px); opacity:0;}}
.hplab{position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-family:'Anton'; font-size:11px; letter-spacing:.14em; color:var(--chalk); text-shadow:0 1px 4px rgba(0,0,0,.85);}
.hpwrap.low{animation:hpLow 1s ease-in-out infinite;}
@keyframes hpLow{0%,100%{box-shadow:0 0 8px rgba(224,101,79,.4);}50%{box-shadow:0 0 20px rgba(224,101,79,.9);}}
.fi-hp{display:flex; gap:3px; margin-top:6px;}
.fi-hp i{flex:1; height:8px; border-radius:3px; background:linear-gradient(180deg, var(--red), #8e3527); border:1px solid rgba(224,101,79,.7);}
.fi-hp i.hit{background:repeating-linear-gradient(115deg, rgba(224,101,79,.25) 0 4px, rgba(224,101,79,.1) 4px 8px); border-color:rgba(224,101,79,.25);}
.fi-hp.forge i{background:rgba(58,64,73,.7); border-color:var(--line);}
.fi-hp.forge i.hit{background:linear-gradient(90deg, var(--ember), var(--gold)); border-color:rgba(255,138,60,.7);}
.fi-stage{position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:150px; margin-top:8px;}
.fi-stage.hb{animation:fiHb .9s ease-in-out infinite;}
@keyframes fiHb{0%,100%{transform:scale(1);}8%{transform:scale(1.02);}16%{transform:scale(1);}}
.fi-num{font-family:'Anton'; font-size:42px; line-height:1; font-variant-numeric:tabular-nums; color:var(--chalk);}
.fi-num.urg{color:var(--ember); text-shadow:0 0 22px rgba(255,138,60,.6);}
.fi-num.over{position:absolute; top:2px; left:0; right:0; text-align:center; z-index:4; text-shadow:0 2px 12px rgba(0,0,0,.85);}
.fi-lab{font-size:9px; letter-spacing:.2em; color:var(--muted); margin-top:3px;}
.fi-ringwrap{position:relative;}
.fi-ringcenter{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;}
/* gate portcullis */
.fi-gate{width:100%; height:150px; position:relative;}
.fi-demon{position:absolute; left:50%; bottom:26px; margin-left:-32px; font-size:64px; z-index:1; animation:gkSway 3s ease-in-out infinite; transform-origin:bottom center; filter:drop-shadow(0 0 10px rgba(224,101,79,.4));}
.fi-demon.rage{filter:drop-shadow(0 0 22px rgba(224,101,79,.9));}
.fi-bars{position:absolute; inset:0; display:flex; justify-content:center; gap:12px; z-index:2; pointer-events:none;}
.fi-bars i{width:8px; height:100%; border-radius:4px; background:linear-gradient(180deg,#3A4049,#23272E); border:1px solid var(--line);}
.fi-bars i.hot{background:linear-gradient(180deg, var(--ember), #B4501E); border-color:rgba(255,138,60,.8); animation:fiBarHeat 1.6s ease-in-out infinite;}
@keyframes fiBarHeat{0%,100%{box-shadow:0 0 7px rgba(255,138,60,.5);}50%{box-shadow:0 0 15px rgba(255,138,60,.9);}}
.fi-bars i.openL{animation:fiOpenL .7s cubic-bezier(.4,0,.6,1) forwards;}
.fi-bars i.openR{animation:fiOpenR .7s cubic-bezier(.4,0,.6,1) forwards;}
@keyframes fiOpenL{to{transform:translateX(-42px) rotate(-7deg); opacity:.25;}}
@keyframes fiOpenR{to{transform:translateX(42px) rotate(7deg); opacity:.25;}}
/* trial forge */
.fi-forge{display:flex; flex-direction:column; align-items:center;}
.fi-hot{font-family:'Anton'; font-size:19px; letter-spacing:.08em; color:#FFF3DF; text-shadow:0 0 22px rgba(255,236,214,.8); text-align:center;}
.fi-hot.cool{color:var(--red); font-size:15px; text-shadow:0 0 16px rgba(224,101,79,.7); animation:fiCool 1s ease-in-out infinite;}
@keyframes fiCool{0%,100%{opacity:1;}50%{opacity:.45;}}
.fi-ingot{
  width:170px; height:30px; border-radius:8px; margin-top:12px;
  background:linear-gradient(180deg,
    rgba(255,138,60,calc(.15 + var(--heat, 0) * .85)),
    rgba(180,80,30,calc(.2 + var(--heat, 0) * .7)));
  border:1px solid rgba(0,0,0,.5);
  box-shadow:0 0 calc(6px + var(--heat, 0) * 30px) rgba(255,180,90, calc(.2 + var(--heat, 0) * .6));
  transition:background .4s linear, box-shadow .4s linear;
}
.fi-anvil{width:106px; height:11px; margin-top:5px; border-radius:0 0 8px 8px; background:linear-gradient(180deg,#2C313B,#191c22); border:1px solid var(--line);}
/* strike buttons */
.fi-strike{
  margin-top:12px; border:none; border-radius:999px; padding:13px 34px; cursor:pointer;
  font-family:'Anton'; font-size:19px; letter-spacing:.08em; color:#1a1206;
  animation:fiStrikeIn .5s cubic-bezier(.2,1.5,.4,1);
}
@keyframes fiStrikeIn{0%{transform:scale(.5); opacity:0;}60%{transform:scale(1.12);}100%{transform:scale(1); opacity:1;}}
.fi-strike.s-boss{background:radial-gradient(circle at 35% 30%, #ffe9a8, var(--gold)); animation:fiStrikeIn .5s cubic-bezier(.2,1.5,.4,1), fiPulseG 1.4s ease-in-out .5s infinite;}
.fi-strike.s-gate{background:radial-gradient(circle at 35% 30%, #f0907d, var(--red)); color:#1a0d0a; animation:fiStrikeIn .5s cubic-bezier(.2,1.5,.4,1), fiPulseR 1.3s ease-in-out .5s infinite;}
.fi-strike.s-trial{background:radial-gradient(circle at 35% 30%, #fff7e6, var(--gold)); animation:fiStrikeIn .5s cubic-bezier(.2,1.5,.4,1), fiPulseG 1.3s ease-in-out .5s infinite;}
.fi-strike.s-trial.cooling{background:radial-gradient(circle at 35% 30%, #f0907d, var(--red)); color:#1a0d0a; animation:fiStrikeIn .5s cubic-bezier(.2,1.5,.4,1), fiPulseR 1.1s ease-in-out .5s infinite;}
@keyframes fiPulseG{0%,100%{box-shadow:0 0 16px rgba(255,214,102,.4);}50%{box-shadow:0 0 40px rgba(255,214,102,.85);}}
@keyframes fiPulseR{0%,100%{box-shadow:0 0 16px rgba(224,101,79,.45);}50%{box-shadow:0 0 40px rgba(224,101,79,.9);}}
.fi-flavor{text-align:center; font-size:12px; color:var(--muted); font-style:italic; min-height:16px; margin-top:8px;}
.fi-flavor.rdy{color:var(--gold);}
.day-card{padding:8px 12px 9px;}
.day-card.ft-dl{border-color:rgba(255,138,60,.45); background:linear-gradient(180deg, var(--card), #17130e 92%);}
.day-card.ft-bp{border-color:rgba(116,179,255,.4); background:linear-gradient(180deg, #101522, var(--card) 90%);}
.day-card.ft-gate{border-color:rgba(224,101,79,.5);}
.day-card .card-head{margin-bottom:0;}
.day-card .card-head h2{font-size:15px;}
.day-card .start-big{padding:8px; font-size:15px;}
.day-card .start-sub{margin-bottom:2px; font-size:9px;}
.day-card .alt-row, .day-card .pill-row{margin-top:6px; gap:6px;}
.day-card .alt-row .chip, .day-card .pill-row .chip{padding:5px 10px; font-size:11px;}
.day-card .start-wrap{margin-top:0;}
.wr-ov{position:fixed; inset:0; z-index:70; display:flex; flex-direction:column; padding:calc(env(safe-area-inset-top, 0px) + 40px) 20px calc(env(safe-area-inset-bottom, 0px) + 30px); overflow-y:auto; animation:fovFade .3s ease;
  background:radial-gradient(120% 42% at 50% 0%, rgba(232,93,38,.13), transparent 60%), linear-gradient(180deg, #14161c, #0A0B0E 60%);}
/* ---- war report v2 ---- */
@keyframes wr2rise{from{opacity:0; transform:translateY(14px);}to{opacity:1; transform:none;}}
.wr2-a{opacity:0; animation:wr2rise .5s cubic-bezier(.2,1,.3,1) both;}
.wr2-kicker{text-align:center; font-family:'Cinzel'; font-size:10px; letter-spacing:.3em; color:var(--muted); margin-bottom:14px;}
.wr2-verdict{text-align:center; margin-bottom:4px;}
.wr2-stamp{font-family:'Anton'; font-weight:400; font-size:37px; letter-spacing:.05em; line-height:1;}
.wr2-stamp .em{font-size:27px; vertical-align:5px;}
.wr2-streak{font-family:'Cinzel'; font-size:11px; letter-spacing:.16em; margin-top:9px; text-transform:uppercase;}
.wr2-rule{display:flex; align-items:center; gap:10px; margin:17px 0 12px;}
.wr2-rule i{flex:1; height:1px; background:linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent);}
.wr2-rule span{font-family:'Cinzel'; font-size:9.5px; letter-spacing:.26em; color:var(--muted); text-transform:uppercase; white-space:nowrap;}
.wr2-tiles{display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;}
.wr2-tile{background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:11px 8px 10px; text-align:center;}
.wr2-tile .l{font-size:8.5px; font-weight:800; letter-spacing:.09em; color:var(--muted); text-transform:uppercase; margin-bottom:6px;}
.wr2-tile .v{font-family:'Anton'; font-weight:400; font-size:20px; line-height:1;}
.wr2-tile .v small{font-size:11px; color:var(--muted); font-family:'Archivo'; font-weight:700;}
.wr2-tile .d{margin-top:6px; font-size:9.5px; font-weight:800; line-height:1.3;}
.wr2-tile .d.up{color:#58B368;} .wr2-tile .d.dn{color:var(--red);} .wr2-tile .d.mut{color:var(--muted); font-weight:600;}
.wr2-forge{display:flex; flex-direction:column; gap:8px;}
.wr2-frow{display:flex; align-items:center; gap:11px; background:rgba(88,179,104,.05); border:1px solid rgba(88,179,104,.22); border-radius:13px; padding:10px 13px;}
.wr2-frow .ic{flex:0 0 auto; width:25px; height:25px; border-radius:8px; display:flex; align-items:center; justify-content:center; background:rgba(88,179,104,.14); color:#58B368; font-size:12px; font-weight:800;}
.wr2-frow .n{flex:1; min-width:0; font-weight:700; font-size:13px; line-height:1.2;}
.wr2-frow .n small{display:block; font-size:9.5px; color:var(--muted); font-weight:600; margin-top:1px;}
.wr2-frow .w{font-family:'Anton'; font-weight:400; font-size:15px; display:flex; align-items:baseline; gap:5px; white-space:nowrap;}
.wr2-frow .w .old{color:var(--muted); font-size:12.5px;}
.wr2-frow .w .arw{color:var(--muted); font-size:10px; font-family:'Archivo';}
.wr2-frow .w .new{color:var(--gold);}
.wr2-frow .w u{text-decoration:none; font-family:'Archivo'; font-size:8.5px; color:var(--muted); font-weight:700;}
.wr2-frow.core{background:rgba(255,138,60,.05); border-color:rgba(255,138,60,.22);}
.wr2-frow.core .ic{background:rgba(255,138,60,.14); color:var(--ember);}
.wr2-frow.core .w .new{color:var(--ember);}
.wr2-noforge{font-family:'Cinzel'; font-style:italic; font-size:12px; color:var(--muted); text-align:center; padding:6px 0;}
.wr2-more{font-size:10.5px; color:var(--muted); font-weight:700; text-align:center;}
.wr2-deeds{display:flex; gap:7px; flex-wrap:wrap;}
.wr2-deed{display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(255,255,255,.11); background:rgba(255,255,255,.04); border-radius:999px; padding:7px 12px; font-size:11.5px; font-weight:700;}
.wr2-deed b{font-family:'Anton'; font-weight:400; letter-spacing:.02em;}
.wr2-hunt{display:flex; flex-direction:column; gap:11px;}
.wr2-boss{display:flex; gap:11px; align-items:center;}
.wr2-boss .face{flex:0 0 auto; display:flex;}
.wr2-boss .body{flex:1; min-width:0;}
.wr2-boss .top{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px;}
.wr2-boss .nm{font-family:'Cinzel'; font-weight:700; font-size:11.5px; letter-spacing:.1em;}
.wr2-boss .pcts{display:flex; align-items:baseline; gap:7px;}
.wr2-boss .pct{font-family:'Anton'; font-size:15px;}
.wr2-boss .dlt{font-size:9.5px; font-weight:800; color:#58B368;}
.wr2-boss .track{height:8px; border-radius:5px; overflow:hidden;}
.wr2-boss .track i{display:block; height:100%; border-radius:5px;}
.wr2-boss .sub{font-size:9px; color:var(--muted); font-weight:600; margin-top:4px; letter-spacing:.04em;}
.wr2-disp{display:flex; flex-direction:column; gap:7px;}
.wr2-disp .row{display:flex; align-items:center; gap:10px; font-size:12px; color:#d9d4c8; font-family:'Cinzel'; font-style:italic; line-height:1.4;}
.wr2-disp .row b{color:var(--gold); font-style:normal;}
.wr2-disp .row .em{font-size:14px; font-style:normal; flex:0 0 auto;}
.wr2-onward{display:block; width:100%; margin-top:22px; border:none; border-radius:15px; padding:16px; font-family:'Anton'; letter-spacing:.08em; font-size:16px; background:var(--ember-deep); color:#fff; cursor:pointer; box-shadow:0 10px 30px rgba(232,93,38,.4); flex-shrink:0;}
.wr-kicker{font-family:'Anton'; font-size:12px; letter-spacing:.26em; color:var(--muted);}
.wr-title{font-family:'Anton'; font-size:42px; line-height:1.05; margin:6px 0 18px; color:var(--chalk);}
.wr-title span{color:var(--ember);}
.wr-row{display:flex; justify-content:space-between; align-items:baseline; gap:10px; padding:11px 0; border-bottom:1px solid var(--line); opacity:0; animation:wrIn .4s both;}
@keyframes wrIn{0%{opacity:0; transform:translateX(-18px);}100%{opacity:1; transform:none;}}
.wr-k{font-family:'Anton'; font-size:12px; letter-spacing:.12em; color:var(--muted); flex-shrink:0;}
.wr-v{font-family:'Archivo Black'; font-size:16px; text-align:right;}
.wr-hunt-head{font-family:'Anton'; font-size:12px; letter-spacing:.2em; color:var(--gold); margin:16px 0 8px; opacity:0; animation:wrIn .4s .75s both;}
.wr-boss{display:flex; align-items:center; gap:12px; background:var(--floor); border:1px solid var(--line); border-radius:14px; padding:10px 12px; margin-bottom:8px; opacity:0; animation:wrIn .45s both;}
.wr-boss-face{flex-shrink:0; display:flex;}
.wr-boss-body{flex:1; min-width:0;}
.wr-boss-top{display:flex; justify-content:space-between; align-items:baseline;}
.wr-boss-name{font-family:'Anton'; font-size:14px; letter-spacing:.05em;}
.wr-boss-pct{font-family:'Archivo Black'; font-size:20px;}
.wr-boss-track{height:7px; border-radius:4px; background:rgba(58,64,73,.6); overflow:hidden; margin:5px 0 3px;}
.wr-boss-track i{display:block; height:100%; border-radius:4px; width:0; animation:wrBar 1.2s cubic-bezier(.25,.7,.3,1) both;}
@keyframes wrBar{0%{width:0;}100%{width:var(--w);}}
.wr-boss-sub{font-size:10px; color:var(--muted);}
.wr-stamp{font-family:'Archivo Black'; align-self:center; margin-top:24px; font-size:24px; border:3px solid; border-radius:10px; padding:8px 20px; transform:rotate(-7deg); animation:wrStamp .5s 1s both;}
@keyframes wrStamp{0%{transform:scale(2.4) rotate(-14deg); opacity:0;}60%{transform:scale(.95) rotate(-7deg); opacity:1;}100%{transform:scale(1) rotate(-7deg);}}
.wr-btn{font-family:'Archivo Black'; align-self:center; margin-top:auto; padding:12px 32px; margin-top:26px; font-size:13px; color:#1a1206; background:var(--ember); border:none; border-radius:999px;}
.sweep-ov{position:fixed; inset:0; z-index:60; background:#0A0B0E; display:flex; flex-direction:column; align-items:center; justify-content:space-between; padding:calc(env(safe-area-inset-top, 0px) + 54px) 20px calc(env(safe-area-inset-bottom, 0px) + 44px); animation:fovFade .3s ease;}
.cf-pick{justify-content:flex-start; gap:18px; overflow-y:auto;}
.cf-body{width:100%; max-width:380px;}
.cf-mode{display:flex; background:var(--floor,#15171C); border-radius:12px; padding:4px; gap:4px; margin-bottom:4px;}
.cf-mode button{flex:1; font-family:'Anton'; font-size:14px; letter-spacing:.06em; border:none; border-radius:9px; padding:12px 0; background:transparent; color:var(--muted);}
.cf-row{display:flex; align-items:center; gap:10px; padding:11px 0; border-bottom:1px solid var(--line);}
.cf-lab{font-family:'Anton'; font-size:11px; letter-spacing:.1em; color:var(--muted); width:64px;}
.cf-chips{display:flex; gap:4px; flex:1;}
.cf-chip{flex:1; font-family:'Archivo Black'; font-size:12px; border-radius:8px; padding:9px 0; background:transparent; border:none; color:var(--muted);}
.cf-foot{width:100%; max-width:380px; margin-top:auto; text-align:center; display:flex; flex-direction:column; gap:10px;}
.cf-verdict{display:flex; justify-content:center; align-items:baseline; gap:18px; font-family:'Archivo Black'; font-size:32px; color:var(--chalk);}
.cf-verdict i{font-style:normal; font-size:13px; color:var(--muted);}
.cf-verdict .gold{color:var(--gold);}
.cf-start{width:100%; font-family:'Archivo Black'; font-size:17px; border-radius:12px; padding:15px 0; border:none; background:linear-gradient(90deg,#B4501E,var(--ember)); color:#1a1206; box-shadow:0 0 24px rgba(255,138,60,.35);}
.cf-just{font-size:12px;}
.celeb-card{
  position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
  background:var(--card); border:2px solid var(--ember); border-radius:20px;
  padding:20px 30px 18px; text-align:center; z-index:40; min-width:250px;
  box-shadow:0 0 50px rgba(255,138,60,.45);
  animation:bannerPop .5s cubic-bezier(.2,1.3,.4,1);
  display:flex; flex-direction:column; align-items:center;
}
.celeb-card.lvup{animation:cfQuake .55s ease-out; box-shadow:0 0 70px rgba(255,138,60,.8);}
.cc-title{font-family:'Archivo Black'; font-size:26px; color:var(--ember); text-shadow:0 0 22px rgba(255,138,60,.7); max-width:78vw;}
.cc-xp{font-family:'Archivo Black'; font-size:19px; color:var(--chalk); margin-top:5px;}
.cc-slam{animation:ccSlam .6s cubic-bezier(.2,1.2,.3,1);}
.cc-lvup{font-family:'Archivo Black'; font-size:32px; color:var(--ember); text-shadow:0 0 30px rgba(255,138,60,.95);}
.cc-lvname{font-family:'Anton'; font-size:14px; letter-spacing:.2em; color:var(--chalk); margin-top:2px;}
@keyframes ccSlam{0%{transform:scale(2.4);opacity:0;filter:blur(3px);}55%{transform:scale(.94);opacity:1;filter:blur(0);}75%{transform:scale(1.08);}100%{transform:scale(1);}}
.cf-done{display:flex; flex-direction:column; align-items:center; animation:bannerPop .5s cubic-bezier(.2,1.3,.4,1);}
.cf-done.lvup{animation:cfQuake .55s ease-out;}
@keyframes cfQuake{0%,100%{transform:none;}20%{transform:translate(-4px,2px);}40%{transform:translate(4px,-2px);}60%{transform:translate(-3px,-2px);}80%{transform:translate(2px,2px);}}
.cf-logged{font-family:'Archivo Black'; font-size:22px; color:var(--ember); text-shadow:0 0 20px rgba(255,138,60,.6);}
.cf-lvup{font-family:'Archivo Black'; font-size:30px; color:var(--ember); text-shadow:0 0 30px rgba(255,138,60,.95);}
.cf-lvname{font-family:'Anton'; font-size:14px; letter-spacing:.2em; color:var(--chalk); margin-top:2px;}
.cf-xp{font-family:'Archivo Black'; font-size:19px; color:var(--ember); margin-top:6px;}
.cf-bar{width:168px; margin-top:10px; text-align:left;}
.cf-bar-top{display:flex; justify-content:space-between; font-size:9px; letter-spacing:.08em; color:var(--muted); margin-bottom:3px; font-family:'Anton';}
.cf-bar-track{height:7px; border-radius:4px; background:rgba(58,64,73,.6); overflow:hidden;}
.cf-bar-track i{display:block; height:100%; border-radius:4px; background:linear-gradient(90deg,#B4501E,var(--ember),#FFB36B); transition:width 2.6s cubic-bezier(.25,.6,.3,1); box-shadow:0 0 10px rgba(255,138,60,.7);}
.cf-bar-next{font-size:9.5px; color:var(--gold); margin-top:4px; text-align:right;}
.cf-done-btn{font-family:'Archivo Black'; font-size:13px; color:#1a1206; background:var(--ember); border:none; border-radius:999px; padding:11px 28px;}
.sw-head{width:100%; max-width:380px; display:flex; justify-content:space-between; font-size:11px; letter-spacing:.14em; color:var(--muted);}
.sw-name{font-family:'Anton'; color:var(--chalk);}
.sw-ringwrap{position:relative; width:280px; height:280px;}
.sw-center{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;}
.sw-num{font-family:'Archivo Black'; font-size:88px; line-height:1; color:var(--chalk); font-variant-numeric:tabular-nums;}
.sw-num.chg{color:var(--gold); text-shadow:0 0 26px rgba(255,214,102,.6);}
.sw-lab.chg{color:var(--gold); animation:chPulse .8s ease-in-out infinite;}
@keyframes chPulse{0%,100%{opacity:1;}50%{opacity:.55;}}
.sh1{animation:q1 .3s linear infinite;}
.sh2{animation:q2 .22s linear infinite;}
.sh3{animation:q3 .15s linear infinite;}
@keyframes q1{0%,100%{transform:translate(0,0);}25%{transform:translate(-1px,1px);}50%{transform:translate(1px,-1px);}75%{transform:translate(-1px,0);}}
@keyframes q2{0%,100%{transform:translate(0,0);}25%{transform:translate(-2px,2px);}50%{transform:translate(2px,-2px);}75%{transform:translate(-2px,-1px);}}
@keyframes q3{0%,100%{transform:translate(0,0);}20%{transform:translate(-4px,3px);}40%{transform:translate(4px,-3px);}60%{transform:translate(-3px,-2px);}80%{transform:translate(3px,2px);}}
.sw-num.urg{color:var(--ember); text-shadow:0 0 22px rgba(255,138,60,.5);}
.sw-lab{font-family:'Archivo Black'; font-size:14px; font-size:16px; letter-spacing:.3em; color:var(--chalk); margin-top:8px;}
.sw-ctl{display:flex; gap:16px; align-items:center;}
.chip.sw-next{border-color:var(--ember); color:var(--ember); font-family:'Anton'; letter-spacing:.06em; padding:10px 24px;}
/* ---- Core Circuit (abs) ---- */
.abs-rep{display:flex; flex-direction:column; align-items:center; text-align:center;}
.abs-mvname{font-family:'Anton'; font-weight:400; font-size:30px; letter-spacing:.03em; text-transform:uppercase; line-height:1.05;}
.abs-mvper{font-size:12px; color:var(--muted); font-weight:700; letter-spacing:.06em; text-transform:uppercase; margin-top:4px; min-height:14px;}
.abs-repbig{font-family:'Anton'; font-size:100px; line-height:.9; color:var(--gold); font-variant-numeric:tabular-nums; margin-top:18px;}
.abs-repbig small{display:block; font-size:14px; letter-spacing:.24em; font-weight:800; color:var(--muted); opacity:.7; margin-top:6px;}
.abs-selfp{font-size:11px; color:var(--muted); margin-top:14px; letter-spacing:.04em;}
.abs-ctl-col{flex-direction:column; gap:12px; width:100%; max-width:360px;}
.abs-done-btn{width:100%; border:none; border-radius:16px; padding:18px; font-family:'Anton'; letter-spacing:.06em; font-size:19px; background:var(--ember-deep); color:#fff; cursor:pointer; box-shadow:0 12px 30px rgba(232,93,38,.42);}
.abs-done-btn:active{transform:scale(.98);}
.abs-nextup{font-size:12px; color:var(--muted); letter-spacing:.03em;}
.abs-nextup b{color:var(--chalk);}
.abs-ringname{font-family:'Anton'; font-size:18px; letter-spacing:.03em; text-transform:uppercase; color:var(--chalk); margin-bottom:6px; text-align:center; padding:0 20px;}
.abs-done{display:flex; flex-direction:column; align-items:center; width:100%; max-width:380px; max-height:72vh; overflow-y:auto;}
.abs-tick{font-family:'Anton'; font-size:40px; color:var(--green); letter-spacing:.03em;}
.abs-xp{font-size:13px; color:var(--gold); font-weight:800; letter-spacing:.08em; margin-bottom:18px;}
.abs-lvup{font-family:'Anton'; letter-spacing:.12em; font-size:14px; color:var(--ember); text-transform:uppercase;}
.abs-lvsub{font-size:11.5px; color:var(--muted); margin-bottom:14px;}
.abs-scaleList{width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; overflow:hidden;}
.abs-srow{display:flex; align-items:center; justify-content:space-between; padding:9px 14px; font-size:13px;}
.abs-srow+.abs-srow{border-top:1px dashed rgba(255,255,255,.07);}
.abs-srow .n{font-weight:700;}
.abs-srow .prog{display:flex; align-items:center; gap:7px; font-family:'Anton'; font-variant-numeric:tabular-nums;}
.abs-srow .old{color:var(--muted); font-size:14px;}
.abs-srow .arw{color:var(--muted); font-size:11px; font-family:'Archivo';}
.abs-srow .new{color:var(--gold); font-size:17px;}
.abs-srow .new.hold{color:var(--steel);}
.abs-srow .delta{font-family:'Archivo'; font-size:10px; font-weight:800; color:#7CD08A; background:rgba(88,179,104,.12); border-radius:999px; padding:2px 6px;}
.abs-srow .delta.cap{color:var(--muted); background:rgba(255,255,255,.05);}
.abs-srow .delta.keep{color:var(--muted); background:rgba(255,255,255,.05);}
.abs-srow .delta.down{color:#ff9f8a; background:rgba(224,101,79,.14);}
.abs-srow .new.dn{color:#ff9f8a;}
/* ---- evolution reveal (DONE screen) ---- */
.abs-tier{display:inline-block; font-family:'Anton'; font-size:12px; color:var(--gold); border:1px solid rgba(255,214,102,.45); border-radius:6px; padding:1px 6px; margin-left:8px; vertical-align:middle; letter-spacing:.08em;}
.evo{position:relative; width:100%; border-radius:18px; padding:20px 14px 16px; text-align:center; overflow:hidden; margin-bottom:12px; flex-shrink:0;
  background:linear-gradient(180deg, rgba(255,138,60,.07), rgba(255,255,255,.02) 55%);
  border:1px solid rgba(255,138,60,.35);
  animation:evoCardIn .5s ease .9s backwards, evoTremble .12s linear 1.4s 10, evoCalm .8s ease 4.4s forwards;}
@keyframes evoCardIn{from{opacity:0; transform:translateY(14px) scale(.97);} to{opacity:1; transform:none;}}
@keyframes evoTremble{0%,100%{transform:translate(0,0) rotate(0);} 25%{transform:translate(1.4px,-1px) rotate(.35deg);} 75%{transform:translate(-1.4px,1px) rotate(-.35deg);}}
@keyframes evoCalm{to{border-color:rgba(255,214,102,.55); box-shadow:0 0 34px rgba(255,214,102,.10), inset 0 0 26px rgba(255,214,102,.05);}}
@keyframes evoIn{from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;}}
.evo-kicker{font-size:10px; letter-spacing:.22em; color:var(--muted); margin-bottom:9px; animation:evoIn .4s ease 1.05s backwards, evoOut .3s ease 2.75s forwards;}
.evo-plaque{display:inline-block; font-size:10px; font-weight:800; letter-spacing:.14em; color:var(--gold); border:1px solid rgba(255,214,102,.45); border-radius:999px; padding:3px 10px; margin-bottom:11px; animation:evoIn .4s ease 1.2s backwards, evoOut .3s ease 2.55s forwards;}
@keyframes evoOut{to{opacity:0; transform:translateY(-8px);}}
.evo-old{font-family:'Anton'; letter-spacing:.04em; color:var(--chalk); min-height:40px;}
.evo-old .eb{display:inline-block; animation:evoBurn .75s ease-in forwards; animation-delay:var(--d);}
@keyframes evoBurn{
  0%{color:var(--chalk); text-shadow:none; transform:none; opacity:1; filter:none;}
  35%{color:var(--ember); text-shadow:0 0 14px rgba(255,138,60,.9);}
  60%{color:#FFE9B8; text-shadow:0 0 22px rgba(255,214,102,1);}
  100%{transform:translateY(-30px) scale(1.2); opacity:0; filter:blur(7px);}}
.evo-oldnum{font-family:'Anton'; font-size:14px; color:var(--muted); margin-top:2px; animation:evoIn .4s ease 1.35s backwards, evoBurnNum .5s ease-in 2.6s forwards;}
@keyframes evoBurnNum{to{opacity:0; filter:blur(4px); transform:translateY(-12px);}}
.evo-spark{position:absolute; bottom:52%; width:3px; height:3px; border-radius:50%; background:var(--ember); left:var(--x); opacity:0; animation:evoSparkUp 1.1s ease-out forwards; animation-delay:var(--d);}
@keyframes evoSparkUp{0%{opacity:0; transform:translateY(0) scale(1);} 15%{opacity:1;} 100%{opacity:0; transform:translateY(-86px) translateX(var(--sway)) scale(.4);}}
.evo-flare{position:absolute; inset:-40%; background:radial-gradient(circle at 50% 46%, rgba(255,214,102,.85), rgba(255,138,60,.35) 30%, transparent 62%); opacity:0; pointer-events:none; animation:evoFlare .8s ease-out 2.95s;}
@keyframes evoFlare{0%{opacity:0; transform:scale(.25);} 22%{opacity:.95;} 100%{opacity:0; transform:scale(1.9);}}
.evo-shock{position:absolute; left:50%; top:46%; width:60px; height:60px; margin:-30px 0 0 -30px; border-radius:50%; border:2px solid rgba(255,214,102,.8); opacity:0; pointer-events:none; animation:evoShock .7s ease-out 3.0s;}
@keyframes evoShock{0%{opacity:.9; transform:scale(.3);} 100%{opacity:0; transform:scale(3.4);}}
.evo-stamp{position:absolute; left:0; right:0; top:12px; font-family:'Anton'; font-size:15px; letter-spacing:.34em; color:var(--gold); text-shadow:0 0 18px rgba(255,214,102,.55); opacity:0; animation:evoStamp .55s cubic-bezier(.2,1.6,.35,1) 3.05s forwards;}
@keyframes evoStamp{0%{opacity:0; transform:scale(2.6) rotate(-7deg);} 60%{opacity:1; transform:scale(.94) rotate(-2deg);} 100%{opacity:1; transform:scale(1) rotate(-2deg);}}
.evo-new{font-family:'Anton'; letter-spacing:.05em; color:var(--gold); margin-top:-36px; min-height:46px;}
.evo-new .es{display:inline-block; opacity:0; animation:evoSlam .5s cubic-bezier(.2,1.5,.4,1) forwards; animation-delay:var(--d); text-shadow:0 0 22px rgba(255,214,102,.35);}
@keyframes evoSlam{0%{opacity:0; transform:translateY(30px) scale(1.8);} 70%{opacity:1; transform:translateY(-3px) scale(.96);} 100%{opacity:1; transform:none;}}
.evo-newsub{font-size:12px; color:var(--chalk); font-weight:700; margin-top:5px; opacity:0; animation:evoIn .5s ease 3.85s forwards;}
.evo-newsub b{color:var(--gold); font-family:'Anton'; font-size:14px; letter-spacing:.04em;}
.evo-pips{display:flex; gap:12px; justify-content:center; margin-top:11px;}
.evo-pip{font-family:'Anton'; font-size:11px; letter-spacing:.1em; color:var(--muted); border:1px solid rgba(255,255,255,.16); border-radius:8px; padding:3px 11px; white-space:nowrap; opacity:0; animation:evoIn .4s ease 4.0s forwards;}
.evo-pip.done{color:#0A0B0E; background:var(--muted); border-color:var(--muted);}
.evo-pip.lit{color:#0A0B0E; background:var(--gold); border-color:var(--gold); animation:evoIn .4s ease 4.0s forwards, evoPipPop .45s cubic-bezier(.2,1.6,.4,1) 4.25s;}
@keyframes evoPipPop{0%{transform:scale(1);} 40%{transform:scale(1.35); box-shadow:0 0 18px rgba(255,214,102,.7);} 100%{transform:scale(1);}}
.abs-fail{width:100%; border:1px solid rgba(224,101,79,.4); background:rgba(224,101,79,.08); color:#ff9f8a;
  border-radius:14px; padding:13px; font-family:'Archivo'; font-weight:800; font-size:13px; letter-spacing:.03em; cursor:pointer;}
.abs-fail:active{background:rgba(224,101,79,.18);}
.abs-failchip{border-color:rgba(224,101,79,.5) !important; color:#ff9f8a !important;}
.focus-ov{position:fixed; inset:0; z-index:60; background:rgba(10,11,14,.95); display:flex; align-items:center; justify-content:center; padding:18px; animation:fovFade .3s ease;}
@keyframes fovFade{from{background:rgba(10,11,14,0); backdrop-filter:blur(0);}to{background:rgba(10,11,14,.95);}}
.focus-ov .card{animation:fovPop .45s cubic-bezier(.2,1.4,.35,1);}
@keyframes fovPop{0%{transform:translateY(30px) scale(.86); opacity:0;}60%{transform:translateY(-4px) scale(1.02); opacity:1;}100%{transform:none; opacity:1;}}
.focus-ov .card{width:100%; max-width:420px; margin:0; box-shadow:0 20px 60px rgba(0,0,0,.6);}


.tr-rest{margin-top:6px; display:flex; flex-direction:column; gap:4px;}
.tr-rest-line{font-style:italic; color:var(--ember); font-size:12.5px; opacity:.85;
  animation:bbRise .45s ease both;}

.cf-density{font-size:11px; color:var(--muted); margin:2px 0 8px; letter-spacing:.04em;}
.cf-density{text-align:center;}
.cf-n44{font-family:'Anton'; font-size:17px; letter-spacing:.08em; color:var(--red); padding:6px 0;}
.cf-n44 i{font-style:normal; color:var(--muted); padding:0 6px;}

/* ===== full-screen workout session (forge) ===== */
.ws{position:fixed; inset:0; z-index:35; overflow:hidden; color:var(--chalk);
  background:radial-gradient(120% 90% at 50% 108%, #2b1a0e 0%, #191410 40%, var(--floor) 75%);
  font-family:'Archivo',system-ui,sans-serif;}
.ws-screen{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  padding:calc(env(safe-area-inset-top,0px) + 18px) 20px calc(env(safe-area-inset-bottom,0px) + 22px);
  text-align:center;}
.ws-center{justify-content:center;}
.ws-x{position:absolute; top:calc(env(safe-area-inset-top,0px) + 50px); right:14px; z-index:8;
  background:none; border:1px solid rgba(255,255,255,.25); color:rgba(255,255,255,.6);
  border-radius:999px; width:32px; height:32px; font-size:14px;}
.ws-resume{position:fixed; bottom:calc(env(safe-area-inset-bottom,0px) + 92px); right:14px; z-index:16;
  background:var(--ember-deep); color:#fff; border:none; border-radius:999px; padding:10px 16px;
  font-weight:800; font-size:12px; letter-spacing:.1em; box-shadow:0 6px 20px rgba(232,93,38,.45);}
.ws-eyebrow{font-size:10px; letter-spacing:.26em; font-weight:800; color:var(--ember); text-align:left;}
.ws-center .ws-eyebrow{text-align:center; letter-spacing:.3em; font-size:12px;}
.ws-day{font-family:'Anton'; font-size:40px; margin-top:6px;}
.ws-head{width:100%; max-width:360px; padding:4px 0 14px; border-bottom:1px solid rgba(255,138,60,.14);}
.ws-name{font-size:22px; font-weight:800; text-align:left; margin-top:5px;}
.ws-name-edit{cursor:pointer; display:flex; align-items:baseline; gap:8px;}
.ws-name-edit:active{color:var(--ember);}
.ws-pen{font-size:13px; opacity:.45;}
.ws-addrow{border-style:dashed; justify-content:center; color:var(--muted); font-weight:800;
  letter-spacing:.14em; font-size:12px; cursor:pointer;}
.ws-addrow:active{border-color:var(--ember); color:var(--ember);}
.ws-ed{width:100%; max-width:360px; text-align:left; animation:bbRise .3s ease both;}
.ws-ed label{font-size:10px; letter-spacing:.26em; font-weight:800; color:var(--ember);}
.ws-edin{width:100%; margin-top:8px; padding:14px; font-size:17px; font-weight:700;
  background:var(--card); border:1px solid var(--ember); border-radius:12px; color:var(--chalk);
  font-family:'Archivo'; outline:none; box-sizing:border-box;}
.ws-edchips{display:flex; flex-wrap:wrap; gap:8px; margin-top:10px;}
.ws-edchips button{padding:9px 13px; border-radius:999px; background:var(--card);
  border:1px solid var(--line); color:var(--muted); font-size:12.5px; font-weight:700;
  font-family:'Archivo'; cursor:pointer;}
.ws-edchips button:active{border-color:var(--ember); color:var(--ember);}
.ws-edbtns{display:flex; gap:10px; margin-top:14px;}
.ws-edbtns .ws-cta{flex:1; padding:13px; width:auto;}
.ws-edbtns .ws-ghost{flex:1; padding:13px; width:auto;}
.ws-ednote{font-size:11px; color:var(--muted); margin-top:10px; line-height:1.6;}
.ws-dots{display:flex; gap:6px; margin-top:10px;}
.ws-dot{width:10px; height:10px; border-radius:50%; background:#2a2018; border:1px solid #3a2a1c;}
.ws-dot.on{background:var(--ember); border-color:var(--ember); box-shadow:0 0 8px rgba(255,138,60,.5);}
.ws-main{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;}
.ws-foot{width:100%; max-width:340px; display:flex; flex-direction:column; align-items:center;
  gap:10px; padding-bottom:6px;}
.ws-cta{border:none; border-radius:14px; padding:16px 22px; font-weight:800; font-size:16px;
  width:100%; letter-spacing:.06em; background:var(--ember-deep); color:#fff;
  box-shadow:0 8px 26px rgba(232,93,38,.4); font-family:'Archivo'; cursor:pointer;}
.ws-cta:active{transform:scale(.97);}
.ws-cta.pulse{animation:bbPulse 1s ease-in-out infinite;}
.ws-ghost{width:100%; padding:14px; background:transparent; border:1px solid var(--line);
  color:var(--muted); border-radius:14px; font-weight:800; letter-spacing:.16em; font-size:12px;
  font-family:'Archivo'; cursor:pointer;}
.ws-list{width:100%; max-width:360px; display:flex; flex-direction:column; gap:10px; margin-top:16px;}
.ws-row{display:flex; justify-content:space-between; align-items:center; padding:14px 16px;
  text-align:left; background:var(--card); border:1px solid var(--line); border-radius:14px;
  opacity:0; animation:bbRise .45s ease both;}
.ws-row.pick{cursor:pointer;}
.ws-row.sel{border-color:var(--ember); box-shadow:0 0 0 1px var(--ember) inset;}
.ws-row.sel .ws-ex{color:var(--ember);}
.ws-ex{font-weight:700; font-size:15px;}
.ws-plan{font-size:13px; color:var(--gold); font-variant-numeric:tabular-nums;}
.ws-stepblock{text-align:center; margin-top:6px;}
.ws-stepval b{font-family:'Anton'; font-size:58px; color:var(--gold); line-height:1;}
.ws-stepval.reps b{color:var(--chalk);}
.ws-stepval small{display:block; font-size:12px; letter-spacing:.2em; font-weight:800; opacity:.5; margin-top:6px;}
.ws-chips{display:flex; gap:7px; justify-content:center; margin-top:10px;}
.ws-chips button{min-width:50px; height:46px; font-weight:800; font-size:13px; border-radius:12px;
  background:var(--card); border:1px solid var(--line); color:var(--chalk); font-family:'Archivo'; cursor:pointer;}
.ws-chips button:active{border-color:var(--ember); color:var(--ember);}
.ws-planline{font-size:11px; letter-spacing:.2em; font-weight:700; opacity:.45; margin-top:16px;}
.ws-finish{background:none; border:none; color:var(--muted); font-size:12px; font-weight:700; letter-spacing:.04em; cursor:pointer; margin-top:12px; padding:6px; text-transform:uppercase;}
.ws-finish:active{color:var(--ember);}
.ws-hint{font-size:12px; font-weight:800; color:var(--ember); margin-top:12px; letter-spacing:.01em;
  animation:wsHintIn .45s ease both, wsHintGlow 2.6s ease-in-out .45s infinite;}
@keyframes wsHintIn{from{opacity:0; transform:translateY(6px);}to{opacity:1; transform:translateY(0);}}
@keyframes wsHintGlow{0%,100%{text-shadow:0 0 0 rgba(255,138,60,0);}50%{text-shadow:0 0 11px rgba(255,138,60,.6);}}
/* progression call \u2014 state-coloured pill under the plan line */
.ws-prog{display:inline-flex; align-items:center; gap:8px; margin-top:14px; padding:9px 14px;
  border-radius:999px; border:1px solid; max-width:330px; text-align:left;
  font-size:12.5px; font-weight:800; letter-spacing:.005em; line-height:1.25;
  animation:wsHintIn .5s cubic-bezier(.2,1,.3,1) both;}
.ws-prog .ws-prog-ic{flex:0 0 auto; font-size:13px; line-height:1;}
.ws-prog.advance{color:#7CD08A; border-color:rgba(88,179,104,.5); background:rgba(88,179,104,.12);
  animation:wsHintIn .5s cubic-bezier(.2,1,.3,1) both, wsProgGlow 2.8s ease-in-out .5s infinite;}
.ws-prog.deload{color:#FF9B5A; border-color:rgba(232,93,38,.55); background:rgba(232,93,38,.14);}
.ws-prog.hold{color:var(--steel); border-color:rgba(116,179,255,.42); background:rgba(116,179,255,.1);}
@keyframes wsProgGlow{0%,100%{box-shadow:0 0 0 rgba(88,179,104,0);}50%{box-shadow:0 0 15px rgba(88,179,104,.3);}}
.ws-resteyebrow{font-size:19px; letter-spacing:.5em; font-weight:800; opacity:.6; margin-bottom:30px;}
.ws-ringwrap{position:relative; width:190px; height:190px;}
.ws-ringwrap svg{width:190px; height:190px; transform:rotate(-90deg);}
.ws-ringwrap.sm{width:132px; height:132px; margin-bottom:4px;}
.ws-ringwrap.sm svg{width:132px; height:132px;}
.ws-rbg{fill:none; stroke-width:6; stroke:rgba(255,255,255,.07);}
.ws-rfg{fill:none; stroke-width:6; stroke:var(--ember); stroke-linecap:round;
  transition:stroke-dashoffset .3s linear;}
.ws-rin{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  justify-content:center; line-height:1.15;}
.ws-rin small{font-size:13px; letter-spacing:.34em; font-weight:800; opacity:.55; margin-bottom:6px;}
.ws-rin b{font-family:'Anton'; font-size:38px; color:var(--gold);}
.ws-rin span{font-size:18px; margin-top:5px; opacity:.9; font-weight:600;}
.ws-restword{font-size:13px; letter-spacing:.34em; font-weight:800; opacity:.6;}
.ws-chtitle{font-size:11px; letter-spacing:.3em; font-weight:800; opacity:.6; margin:16px 0 2px;}
/* done-card comparison */
.ws-cmp{margin:12px 0 4px; text-align:left;}
.ws-cmp-pct{font-family:'Anton'; font-size:22px; letter-spacing:.04em; text-align:center; margin-bottom:8px;}
.ws-cmp-pct.up{color:var(--gold);}
.ws-cmp-pct.down{color:var(--red);}
.ws-cmp-pct.first{font-size:13px; font-family:'Archivo'; font-weight:800; letter-spacing:.14em;
  color:var(--gold); margin:12px 0 4px;}
.ws-cmp-row{display:flex; align-items:center; gap:10px; margin-top:8px;}
.ws-cmp-row small{width:44px; font-size:10px; letter-spacing:.18em; font-weight:800; color:var(--muted);}
.ws-cmp-row span{width:70px; font-size:12px; color:var(--muted); text-align:right; font-variant-numeric:tabular-nums;}
.ws-cmp-bar{flex:1; height:12px; border-radius:4px; background:#0e0f12; border:1px solid var(--line); padding:2px;}
.ws-cmp-bar i{display:block; height:100%; border-radius:2px; background:#3a3f4a; transition:width .9s cubic-bezier(.2,.9,.3,1);}
.ws-cmp-bar.today i{background:linear-gradient(90deg,var(--ember-deep),var(--gold));
  box-shadow:0 0 8px rgba(255,138,60,.4);}

/* ===== full-screen boss battle ===== */
.bb{position:fixed; inset:0; z-index:40; overflow:hidden; color:var(--chalk);
  font-family:'Archivo',system-ui,sans-serif;}
.bb-arena{position:absolute; inset:0; z-index:0; background-size:cover;
  background-position:center top; background-repeat:no-repeat;}
.bb-arenascrim{position:absolute; inset:0; z-index:1; pointer-events:none; background:
  linear-gradient(180deg, rgba(8,6,5,.6) 0%, rgba(8,6,5,.2) 15%, transparent 30%),
  radial-gradient(80% 30% at 50% 76%, rgba(8,6,5,.6) 0%, transparent 100%),
  linear-gradient(0deg, rgba(8,6,5,.8) 0%, rgba(8,6,5,.35) 16%, transparent 34%);}
.bb-screen{position:absolute; inset:0; z-index:2; display:flex; flex-direction:column; align-items:center;
  padding:calc(env(safe-area-inset-top,0px) + 18px) 20px calc(env(safe-area-inset-bottom,0px) + 22px);
  text-align:center;}
.bb-center{justify-content:center;}
.bb-hud{justify-content:flex-start;}
.bb-fade{animation:bbFade .5s ease both;}
@keyframes bbFade{from{opacity:0;}to{opacity:1;}}
.bb-black{position:absolute; inset:0; background:#000; z-index:9; animation:bbFade .25s ease both;}
.bb-flee{position:absolute; top:calc(env(safe-area-inset-top,0px) + 12px); right:14px; z-index:8;
  background:none; border:1px solid rgba(255,255,255,.25); color:rgba(255,255,255,.6);
  border-radius:999px; width:32px; height:32px; font-size:14px;}
.bb-theme{position:absolute; top:calc(env(safe-area-inset-top,0px) + 14px); left:14px; z-index:8;
  background:none; border:1px solid rgba(255,255,255,.18); color:rgba(255,255,255,.45);
  border-radius:999px; padding:5px 12px; font-size:10px; font-weight:800; letter-spacing:.16em;
  text-transform:uppercase; font-family:'Archivo';}
.bb-face{line-height:1;}
.bb-face.big{font-size:84px; animation:bbLoom 3.2s ease-in-out infinite;}
.bb-face.huge{font-size:104px;}
@keyframes bbLoom{0%,100%{transform:translateY(0) scale(1);}50%{transform:translateY(-7px) scale(1.03);}}
.bb-subt{font-size:11px; letter-spacing:.28em; font-weight:700; text-transform:uppercase; margin-top:4px;}
.bb-introbar{width:100%; max-width:340px; margin-top:22px;}
.bb-menace{min-height:20px; margin-top:18px; font-size:13.5px; text-shadow:0 1px 10px rgba(0,0,0,.9);}
.bb-demand{text-shadow:0 2px 18px rgba(0,0,0,.85);}
.bb-lifttag{text-shadow:0 1px 8px rgba(0,0,0,.9);}
.bb-plate{width:100%; max-width:360px; display:flex; align-items:center; gap:12px; padding:6px 0 14px;}
.bb-medal{width:46px; height:46px; display:grid; place-items:center; font-size:25px; flex:none;}
.bb-pcol{flex:1; min-width:0;}
.bb-pname{font-family:'Cinzel'; font-size:11px; font-weight:700; letter-spacing:.32em;
  margin-bottom:7px; text-align:left;}
.bb-main{flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end;
  width:100%; position:relative; padding-bottom:7vh;}
.bb-foot{width:100%; max-width:340px; display:flex; flex-direction:column; align-items:center;
  gap:10px; padding-bottom:6px;}
.bb-hpshell{position:relative; width:100%; height:14px; border-radius:5px; background:#0e0f12;
  padding:2px; box-shadow:inset 0 2px 6px rgba(0,0,0,.7); overflow:hidden;}
.bb-hpshell::after{content:""; position:absolute; inset:2px; pointer-events:none; border-radius:3px;
  background:repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(0,0,0,.55) calc(10% - 1px) 10%);}
.bb-hpfill{display:block; height:100%; border-radius:3px; transition:width .8s cubic-bezier(.2,.9,.3,1);}
.bb-hpchip{position:absolute; inset:2px auto 2px 2px; border-radius:3px; transition:width 1.3s ease .45s;}
.bb-introbar .bb-hpshell{height:20px; padding:3px;}
.bb-eyebrow{font-family:'Cinzel'; font-size:11px; letter-spacing:.52em; font-weight:700; opacity:.8;
  margin-bottom:12px; text-shadow:0 1px 8px rgba(0,0,0,.9);}
.bb-ring{position:relative; width:190px; height:190px;}
.bb-ring svg{width:190px; height:190px; transform:rotate(-90deg);}
.bb-rbg{fill:none; stroke-width:6; stroke:rgba(255,255,255,.07);}
.bb-rfg{fill:none; stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset .3s linear;}
.bb-rin{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  justify-content:center; line-height:1.15;}
.bb-rin small{font-size:9px; letter-spacing:.32em; font-weight:800; opacity:.5; margin-bottom:5px;}
.bb-rin b{font-size:36px;}
.bb-rin span{font-size:13px; margin-top:3px; opacity:.85;}
.bb-lifttag{font-size:11px; letter-spacing:.3em; font-weight:800; text-transform:uppercase; opacity:.75;}
.bb-demand{line-height:1; margin-top:10px;}
.bb-cta{border-radius:2px; padding:17px 22px; font-size:14px; width:100%; max-width:340px;
  font-family:'Cinzel'; font-weight:900; letter-spacing:.3em; text-transform:uppercase;
  outline:1px solid rgba(0,0,0,.85); outline-offset:-4px; cursor:pointer;}
.bb-cta:active{filter:brightness(1.35);}
.bb-cta.pulse{animation:bbEmberBreath 2.2s ease-in-out infinite;}
@keyframes bbEmberBreath{0%,100%{box-shadow:0 0 12px rgba(255,138,60,.12);}
  50%{box-shadow:0 0 34px rgba(255,138,60,.5);}}
@keyframes bbPulse{0%,100%{transform:scale(1);}50%{transform:scale(1.04);}}
.bb-ghost{width:100%; max-width:340px; padding:14px; background:transparent; font-weight:800;
  letter-spacing:.16em; font-size:12px; font-family:'Archivo'; cursor:pointer;}
.bb-shake{animation:bbShakeX .35s linear;}
@keyframes bbShakeX{0%,100%{transform:none;}25%{transform:translate(-6px,2px);}50%{transform:translate(5px,-3px);}75%{transform:translate(-3px,1px);}}
.bb-quaker{animation:bbQuake 1.1s linear;}
@keyframes bbQuake{0%{transform:none;}6%{transform:translate(-16px,9px) rotate(-1.2deg);}
  12%{transform:translate(15px,-7px) rotate(1deg);}20%{transform:translate(-13px,-9px) rotate(-.8deg);}
  28%{transform:translate(12px,8px) rotate(.9deg);}38%{transform:translate(-10px,5px) rotate(-.6deg);}
  48%{transform:translate(9px,-6px) rotate(.5deg);}60%{transform:translate(-7px,3px);}
  72%{transform:translate(5px,-3px);}84%{transform:translate(-3px,2px);}100%{transform:none;}}
.bb-dead{font-size:88px; display:block; animation:bbFall .8s ease-in both;}
@keyframes bbFall{0%{transform:none; opacity:1; filter:none;}
  100%{transform:translateY(26px) rotate(12deg); opacity:.3; filter:grayscale(1) brightness(.55);}}
.bb-embers{position:absolute; inset:0; pointer-events:none;}
.bb-embers i{position:absolute; left:50%; top:34%; width:6px; height:6px; border-radius:50%;
  background:var(--gold); animation:bbPcl .7s ease-out forwards;}
.bb-embers i:nth-child(odd){background:var(--ember);}
@keyframes bbPcl{from{opacity:1; transform:translate(0,0) scale(1);}
  to{opacity:0; transform:translate(var(--dx),var(--dy)) scale(.3);}}
.bb-dmgnum{position:absolute; left:60%; top:22%; font-family:'Press Start 2P'; font-size:20px;
  color:#E0654F; pointer-events:none; animation:bbDmgUp .8s ease-out forwards;}
@keyframes bbDmgUp{0%{opacity:0; transform:translateY(6px) scale(.7);}
  15%{opacity:1; transform:translateY(0) scale(1.15);}100%{opacity:0; transform:translateY(-46px);}}
.bb-slashfx{position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(105deg, transparent 46%, rgba(255,255,255,.85) 50%, transparent 54%);
  animation:bbSlash .4s ease-out both;}
@keyframes bbSlash{from{opacity:0; transform:translateX(-40%);}30%{opacity:1;}to{opacity:0; transform:translateX(40%);}}
.bb-ringout{position:absolute; width:120px; height:120px; border:3px solid var(--ember);
  border-radius:50%; animation:bbRing .8s ease-out both; pointer-events:none;}
@keyframes bbRing{from{opacity:.9; transform:scale(.3);}to{opacity:0; transform:scale(3);}}
.bb-xpcard{width:100%; max-width:340px;}
.bb-xprow{display:flex; justify-content:space-between; padding:9px 0; opacity:0;
  animation:bbRise .4s ease both; font-size:14px; font-weight:600;}
@keyframes bbRise{from{opacity:0; transform:translateY(14px);}to{opacity:1; transform:none;}}
.bb-lvl{margin-top:16px; text-align:left;}
.bb-lvllabs{display:flex; justify-content:space-between; font-size:11px; font-weight:800;
  letter-spacing:.14em; margin-bottom:6px;}
.bb-lvlbar{height:14px; border-radius:999px; background:#0e0f12; border:1px solid var(--line); padding:2px;}
.bb-lvlfill{display:block; height:100%; border-radius:999px; transition:width 1.1s cubic-bezier(.2,.9,.3,1);
  transform-origin:left;}
.bb-lvlfill.grow{animation:bbGrow .9s ease both;}
@keyframes bbGrow{from{transform:scaleX(0);}to{transform:scaleX(1);}}
.bb-lvlxp{font-size:12px; color:var(--muted); margin-top:6px; font-variant-numeric:tabular-nums;}
.bb-lvlup{margin-top:10px; letter-spacing:.08em; animation:bbPop .6s cubic-bezier(.2,1.5,.4,1) both;}
@keyframes bbPop{from{opacity:0; transform:scale(.6);}to{opacity:1; transform:scale(1);}}

/* ---- SAGA CARDS (bosses tab) ---- */
.sg{margin-bottom:6px; width:100%;}
.sg-div{display:flex; align-items:center; gap:12px; margin:20px 2px 12px; text-align:center;}
.sg-div i{flex:1; height:1px; opacity:.55; background:linear-gradient(90deg, transparent, rgba(255,255,255,.28) 50%, transparent);}
.sg-dl .sg-div i{background:linear-gradient(90deg, transparent, var(--ember) 50%, transparent);}
.sg-bp .sg-div i{background:linear-gradient(90deg, transparent, var(--sky, #7EB3FF) 50%, transparent);}
.sg-hy .sg-div i{background:linear-gradient(90deg, transparent, var(--ok, #86C232) 50%, transparent);}

.sg-div b{font-family:'Cinzel'; font-size:11px; letter-spacing:.32em; font-weight:900; display:block;}
.sg-dl .sg-div b{color:var(--ember);}
.sg-bp .sg-div b{color:#7EB3FF;}
.sg-div small{font-family:'Cinzel'; font-size:9px; letter-spacing:.2em; color:var(--muted); font-weight:700;}
.sg-card{position:relative; display:block; width:100% !important; min-width:100%; box-sizing:border-box; border:1px solid rgba(201,167,90,.28); border-radius:3px; overflow:hidden;
  background:#15121a; outline:1px solid rgba(0,0,0,.85); outline-offset:-3px; margin-bottom:12px;}
.sg-card::before{content:""; display:block; width:100%;}
.sg-h1::before{padding-top:49.6%;}
.sg-h2::before{padding-top:65.3%;}
.sg-h3::before{padding-top:39.0%;}
.sg-art{position:absolute; inset:0; background-size:cover; background-position:center;}
.sca-warden{background:radial-gradient(90% 130% at 82% 40%, #2c2436 0%, #1a1520 50%, #100d14 100%);}
.sca-den{background:radial-gradient(100% 150% at 85% 100%, #4a220a 0%, #241208 40%, #140f0b 100%);}
.sca-wyrm{background:radial-gradient(60% 80% at 80% 30%, rgba(232,93,38,.4) 0%, transparent 60%),
  radial-gradient(110% 140% at 75% 60%, #3f1c08 0%, #1c1009 55%, #120d0a 100%);}
.sca-shade{background:radial-gradient(90% 130% at 82% 45%, #2c1d44 0%, #1b1428 50%, #120f18 100%);}
.sca-nightmare{background:radial-gradient(100% 150% at 85% 20%, #17263f 0%, #121a29 50%, #0e1118 100%);}
.sca-dragon{background:radial-gradient(55% 70% at 82% 25%, rgba(126,179,255,.32) 0%, transparent 60%),
  radial-gradient(110% 140% at 78% 55%, #1b2c4a 0%, #131c2e 55%, #0e1220 100%);}
.sca-tfdl{background:radial-gradient(80% 120% at 80% 50%, rgba(155,225,93,.16) 0%, #0a0f0a 60%);}
.sca-tfbp{background:radial-gradient(80% 120% at 80% 50%, rgba(255,107,74,.16) 0%, #120a08 60%);}
.sca-coreking{background:radial-gradient(60% 85% at 78% 32%, rgba(255,180,80,.36) 0%, transparent 62%),
  radial-gradient(110% 140% at 74% 60%, #3a2a0e 0%, #1c1408 55%, #120f0a 100%);}
.sg-ck .sg-card.sca-coreking .sg-name{color:var(--gold); text-shadow:0 0 22px rgba(255,180,80,.35), 0 2px 10px rgba(0,0,0,.9);}
.sg-ck .sg-quote{color:#f0c987;}
.sg-scrim{position:absolute; inset:0;
  background:linear-gradient(90deg, rgba(12,10,10,.94) 0%, rgba(12,10,10,.8) 42%, rgba(12,10,10,.18) 74%, rgba(12,10,10,.03) 100%);}
.sg-in{position:absolute; inset:0; z-index:2; padding:16px 16px 14px; min-height:0;
  display:flex; flex-direction:column; justify-content:center; text-align:left;}
.sg-rank{font-family:'Cinzel'; font-size:9px; letter-spacing:.3em; font-weight:700; color:var(--muted);}
.sg-gk{color:var(--ember);}
.sg-bp .sg-gk{color:#B48CFF;}
.sg-fin{color:var(--gold);}
.sg-name{font-family:'Cinzel Decorative'; font-weight:900; font-size:21px; letter-spacing:.06em;
  margin:5px 0 2px; color:var(--chalk); text-shadow:0 0 20px rgba(0,0,0,.5), 0 2px 10px rgba(0,0,0,.9);}
.sg-dl .sg-name{text-shadow:0 0 20px rgba(255,138,60,.25), 0 2px 10px rgba(0,0,0,.9);}
.sg-bp .sg-name{text-shadow:0 0 20px rgba(126,179,255,.25), 0 2px 10px rgba(0,0,0,.9);}
.sg-big{font-size:24px;}
.sg-bp .sg-card.sca-shade .sg-name{color:#B48CFF;}
.sg-bp .sg-card.sca-dragon .sg-name{color:#7EB3FF;}
.sg-dl .sg-card.sca-wyrm .sg-name{color:var(--ember);}
.sg-sub{font-family:'Cinzel'; font-size:9.5px; letter-spacing:.22em; color:var(--muted);
  font-weight:700; text-transform:uppercase;}
.sg-quote{display:block; background:none; border:none; padding:0; text-align:left; cursor:pointer;
  font-family:'Cinzel'; color:var(--red); font-size:12px; margin:9px 0 0; letter-spacing:.04em;}
.sg-bp .sg-quote{color:#B48CFF;}
.sg-quote span{font-size:9px; letter-spacing:.2em; color:var(--muted); opacity:.7;}
.sg-gate{display:flex; align-items:baseline; gap:8px; margin-top:10px; font-family:'Cinzel';}
.sg-gate span{font-size:8.5px; letter-spacing:.22em; font-weight:700; color:var(--muted);}
.sg-gate b{font-weight:900; font-size:22px; color:var(--gold);}
.sg-gate i{font-style:normal; font-size:11px; color:var(--muted);}
.sg-chips{display:flex; gap:7px; flex-wrap:wrap; margin-top:11px; align-items:center;}
.sg-chip{font-family:'Cinzel'; font-size:9px; letter-spacing:.1em; font-weight:700; padding:6px 11px;
  border-radius:2px; border:1px solid rgba(255,255,255,.14); color:var(--muted); background:rgba(0,0,0,.42);}
.sg-hot{border-color:var(--ember); color:var(--ember);}
.sg-bp .sg-hot{border-color:#B48CFF; color:#B48CFF;}
.sg-gold{border-color:rgba(201,167,90,.6); color:var(--gold);}
.sg-enter{border:1px solid var(--ember); color:var(--ember);
  background:linear-gradient(180deg,#221208,#0f0804); border-radius:2px; padding:10px 24px;
  font-family:'Cinzel'; font-weight:900; letter-spacing:.24em; font-size:11px; cursor:pointer;
  outline:1px solid rgba(0,0,0,.8); outline-offset:-3px; text-shadow:0 0 12px rgba(255,138,60,.4);
  animation:bbEmberBreath 2.4s ease-in-out infinite;}
.sg-enter:active{filter:brightness(1.35);}
.sg-whisper{font-family:'Cinzel'; color:var(--ember); font-size:11px; margin-top:9px; opacity:.9;
  letter-spacing:.04em; animation:bbFade .6s ease both;}
.sg-rest{font-family:'Cinzel'; font-size:9px; letter-spacing:.14em; color:var(--muted);
  font-weight:700; margin-top:5px;}
.sg-rest b{color:var(--chalk);}
.sg-plaque{position:absolute; top:10px; right:10px; z-index:3; border:1px solid rgba(201,167,90,.6);
  color:var(--gold); font-family:'Cinzel'; font-size:8.5px; letter-spacing:.14em; font-weight:700;
  border-radius:2px; padding:6px 10px; background:rgba(0,0,0,.55);}
.sg-x{position:absolute; top:8px; left:10px; z-index:3; background:none; border:none;
  color:rgba(255,255,255,.3); font-size:13px; cursor:pointer; padding:4px;}
.sg-demand{display:flex; align-items:baseline; gap:7px; margin-top:9px; font-family:'Cinzel';
  font-weight:900; font-size:44px; color:var(--gold); line-height:1;
  text-shadow:0 0 24px rgba(255,214,102,.3), 0 2px 12px rgba(0,0,0,.9);}
.sg-demand small{font-size:14px; color:var(--muted); font-weight:700;}
.sg-demand em{font-style:normal; font-size:26px;}
/* ===== boss cards as a swipeable playing-card deck ===== */
.boss-tab{display:flex; flex-direction:column; height:calc(100vh - 106px); min-height:520px;}
.boss-head{display:flex; align-items:flex-end; justify-content:space-between; gap:10px; padding:4px 4px 2px;}
.boss-h1{font-family:'Anton'; font-weight:400; font-size:27px; letter-spacing:.05em; text-transform:uppercase; margin:0;}
.boss-hsub{font-size:11.5px; color:var(--muted); margin-top:2px;}
.boss-count{font-family:'Cinzel'; font-size:10px; letter-spacing:.1em; color:var(--gold); border:1px solid rgba(255,214,102,.35); border-radius:999px; padding:5px 11px; text-transform:uppercase; white-space:nowrap; flex:0 0 auto;}
.boss-deck{display:flex; flex:1 1 auto; align-items:center; overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch; scroll-behavior:auto; padding:6px 0; scrollbar-width:none; margin:0 -16px; min-height:0;}
.boss-deck::-webkit-scrollbar{display:none;}
.boss-dots{display:flex; gap:7px; justify-content:center; align-items:center; padding:10px 0 4px;}
.boss-dots i{width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.16); transition:.3s;}
.boss-dots i.on{background:var(--ember); width:20px; border-radius:3px;}
.boss-swipe{text-align:center; font-family:'Cinzel'; font-size:10px; color:var(--muted); letter-spacing:.14em; text-transform:uppercase; padding-bottom:4px;}
.pc{position:relative; flex:0 0 82vw; width:82vw; max-width:352px; height:90%; max-height:620px; overflow:hidden;
  border-radius:18px; margin-left:14px; scroll-snap-align:center;
  border:1px solid rgba(255,200,110,.32);
  box-shadow:0 24px 58px rgba(0,0,0,.62), 0 0 44px rgba(232,93,38,.1);
  background:radial-gradient(110% 130% at 72% 40%, #241a12, #120d0a 60%, #0c0908);}
.pc:last-child{margin-right:14px;}
.pc-art{position:absolute; inset:0; background-size:cover; background-position:64% center;}
.pc-scrim{position:absolute; inset:0; background:linear-gradient(180deg, rgba(6,5,4,.5) 0%, transparent 22%, rgba(6,5,4,.13) 44%, rgba(6,5,4,.8) 64%, rgba(4,3,2,.97) 100%);}
.pc-frame{position:absolute; inset:8px; border:1px solid rgba(255,200,110,.26); border-radius:11px; pointer-events:none; z-index:4;}
.pc-plaque{position:absolute; top:12px; right:12px; z-index:5; border:1px solid rgba(255,200,110,.55); background:rgba(20,14,8,.62); color:#f2c987; font-family:'Cinzel'; font-size:8px; font-weight:700; letter-spacing:.12em; padding:5px 9px; border-radius:999px; text-transform:uppercase; backdrop-filter:blur(3px);}
.pc-x{position:absolute; top:11px; left:12px; z-index:5; background:rgba(10,8,6,.55); border:1px solid rgba(255,255,255,.14); color:var(--muted); width:24px; height:24px; border-radius:50%; font-size:12px; cursor:pointer; line-height:1;}
.pc-top{position:absolute; top:15px; left:16px; right:16px; z-index:3; display:flex; justify-content:space-between; align-items:flex-start; gap:8px;}
.pc-eyebrow{font-family:'Cinzel'; font-size:8.5px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); text-shadow:0 2px 10px rgba(0,0,0,.95); max-width:62%; line-height:1.3;}
.pc-status{font-family:'Archivo'; font-size:8px; font-weight:800; letter-spacing:.1em; text-transform:uppercase; border:1px solid; border-radius:999px; padding:4px 9px; backdrop-filter:blur(3px); white-space:nowrap; flex:0 0 auto;}
.pc-body{position:absolute; left:0; right:0; bottom:0; z-index:3; padding:16px 15px 15px;}
.pc-name{font-family:'Cinzel Decorative'; font-weight:900; font-size:21px; line-height:1; letter-spacing:.02em; color:#ffe6ad; text-shadow:0 0 22px rgba(255,180,80,.4), 0 3px 0 rgba(0,0,0,.55);}
.pc-name.pc-big{font-size:25px;}
.pc-ep{font-family:'Cinzel'; font-style:italic; font-size:11.5px; color:var(--warm); margin-top:7px;}
.pc-taunt{display:block; width:100%; text-align:left; background:none; border:none; border-left:2px solid rgba(255,180,80,.5); padding:1px 0 1px 10px; margin-top:11px; font-family:'Cinzel'; font-style:italic; font-size:11px; line-height:1.42; color:#e7d6c4; cursor:pointer;}
.pc-taunt span{color:var(--muted); font-style:normal; font-size:8.5px; letter-spacing:.08em;}
.pc-foot{margin-top:13px;}
.pc-stats{display:flex; gap:6px;}
.pc-stat{flex:1; border:1px solid rgba(255,200,110,.16); background:rgba(20,14,8,.5); border-radius:9px; padding:7px 6px; text-align:center; backdrop-filter:blur(3px);}
.pc-stat .l{font-size:7px; font-weight:800; letter-spacing:.06em; color:var(--muted); text-transform:uppercase; margin-bottom:3px;}
.pc-stat .v{font-family:'Anton'; font-weight:400; font-size:14px; color:var(--gold); line-height:1.05;}
.pc-stat .v u{font-family:'Archivo'; font-size:8.5px; color:var(--muted); text-decoration:none; margin-left:1px; font-weight:700;}
.pc-rbar{height:7px; border-radius:2px; background:rgba(0,0,0,.55); border:1px solid rgba(255,255,255,.1); overflow:hidden; margin-bottom:5px;}
.pc-rbar i{display:block; height:100%; background:linear-gradient(90deg,#7a1f12,#E85D26,#ffb44d);}
.pc-rline{font-family:'Cinzel'; font-size:8.5px; color:var(--muted); letter-spacing:.03em; line-height:1.4; margin-bottom:9px;}
.pc-rline b{color:var(--gold);}
.pc-enter{width:100%; border:1px solid var(--ember); background:rgba(255,138,60,.15); color:var(--ember); border-radius:11px; padding:11px; font-family:'Anton'; letter-spacing:.06em; font-size:14px; cursor:pointer; margin-bottom:8px;}
.pc-enter:active{filter:brightness(1.3);}
.pc-chip{font-family:'Archivo'; font-size:9px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); border:1px solid rgba(255,255,255,.14); border-radius:999px; padding:5px 10px; display:inline-block; margin:4px 5px 0 0; backdrop-filter:blur(2px);}
.pc-chip.gold{color:var(--gold); border-color:rgba(255,214,102,.42); background:rgba(255,214,102,.08);}
.st-sealed{color:#c9b48a; border-color:rgba(255,200,110,.4); background:rgba(30,20,8,.55);}
.st-ready{color:var(--ember); border-color:rgba(255,138,60,.5); background:rgba(255,138,60,.14);}
.st-open{color:var(--green); border-color:rgba(88,179,104,.5); background:rgba(88,179,104,.14);}
.st-slain{color:var(--gold); border-color:rgba(255,214,102,.5); background:rgba(255,214,102,.12);}
.st-rest{color:var(--muted); border-color:rgba(255,255,255,.18); background:rgba(255,255,255,.05);}
.pc.t-warden{background:radial-gradient(85% 120% at 70% 42%, #2c2436, #161120 60%, #0e0b14);}
.pc.t-shade{background:radial-gradient(85% 120% at 70% 42%, #2c1d44, #181228 60%, #100c18);}
.pc.t-den{background:radial-gradient(90% 130% at 66% 66%, #4a220a, #22140a 55%, #120d0a);}
.pc.t-nightmare{background:radial-gradient(90% 130% at 70% 24%, #17263f, #121a29 55%, #0e1118);}
.pc.t-wyrm{background:radial-gradient(60% 70% at 64% 32%, rgba(232,93,38,.4), transparent 60%), radial-gradient(120% 130% at 70% 60%, #3f1c08, #14100a);}
.pc.t-dragon{background:radial-gradient(60% 70% at 64% 30%, rgba(126,179,255,.34), transparent 60%), radial-gradient(120% 130% at 70% 60%, #1b2c4a, #0e1220);}
.pc.t-coreking{background:radial-gradient(60% 75% at 66% 34%, rgba(255,180,80,.4), transparent 60%), radial-gradient(120% 130% at 70% 60%, #3a2a0e, #120f0a);}
.pc.t-hydra{background:radial-gradient(80% 120% at 78% 42%, #123028, #0c1a16 55%, #0a1210);}
.pc.t-jester{background:radial-gradient(80% 120% at 60% 40%, #3a1c40, #1c1022 55%, #120b16);}
.pc.t-locked{background:radial-gradient(90% 120% at 60% 50%, #1a1720, #100e15);}
.pc.t-tfdl{background:radial-gradient(80% 120% at 70% 45%, rgba(155,225,93,.16), #0a0f0a 60%);}
.pc.t-tfbp{background:radial-gradient(80% 120% at 70% 45%, rgba(255,107,74,.16), #120a08 60%);}
.pc.t-wyrm .pc-name, .pc.t-coreking .pc-name{color:var(--gold);}
.pc.t-dragon .pc-name{color:#bfe0ff;}
.pc.t-locked .pc-name{color:var(--muted); font-family:'Anton'; letter-spacing:.18em; font-size:24px;}
.sg-ready{margin-top:9px; max-width:78%;}
.sg-rbar{height:8px; border-radius:2px; background:rgba(0,0,0,.6);
  border:1px solid rgba(255,255,255,.12); padding:1.5px;}
.sg-rbar i{display:block; height:100%; border-radius:1px;
  background:linear-gradient(90deg, var(--ember-deep), var(--gold)); transition:width .8s ease;}
.sg-rline{font-family:'Cinzel'; font-size:9.5px; color:var(--muted); margin-top:5px; letter-spacing:.06em;}
.sg-rline b{color:var(--gold);}
.sg-locked{border-style:dashed; border-color:rgba(155,225,93,.25); background:#0a0f0a;}
.sg-bp .sg-locked{border-color:rgba(255,107,74,.22); background:#100a08;}
.sg-locked .sg-scrim{background:linear-gradient(90deg, rgba(8,10,8,.9) 0%, rgba(8,10,8,.75) 60%, rgba(8,10,8,.5) 100%);}
.sg-mystrank{color:#4e6b52;}
.sg-bp .sg-mystrank{color:#6b524e;}
.sg-myst{letter-spacing:.34em; opacity:.8; color:#9BE15D;}
.sg-bp .sg-myst{color:#FF6B4A;}
.sg-mystsub{color:#4e6b52;}
.sg-bp .sg-mystsub{color:#6b524e;}
.sg-mystchip{border-color:rgba(155,225,93,.25); color:#6f8f75;}
.sg-bp .sg-mystchip{border-color:rgba(255,107,74,.25); color:#8f756f;}
@keyframes bbFade{from{opacity:0}to{opacity:.9}}

/* ---- READY GLOW (bosses tab) ---- */
.sg-ready{--glowc: 255,214,102; border-color:rgba(var(--glowc), .55) !important;
  animation:sgGlow 2.4s ease-in-out infinite;}
@keyframes sgGlow{0%,100%{box-shadow:0 0 10px rgba(var(--glowc), .12), 0 0 0 1px rgba(var(--glowc), .1) inset;}
  50%{box-shadow:0 0 26px rgba(var(--glowc), .4), 0 0 1px 1px rgba(var(--glowc), .25) inset;}}
.sca-hydra.sg-ready{--glowc: 134,194,50;}
.sca-jester.sg-ready{--glowc: 199,125,255;}
.sg-jname{color:#C77DFF !important; text-shadow:0 0 24px rgba(199,125,255,.5), 0 2px 12px rgba(0,0,0,.9) !important;}
.sg-jenter{border-color:rgba(199,125,255,.8) !important; color:#C77DFF !important;
  text-shadow:0 0 14px rgba(199,125,255,.5) !important;}
/* Root is OPAQUE from the first frame \u2014 no fade on the container. A stalled
   opacity animation on a slow phone left the screen underneath visible; the
   "fade to black" drama now comes from the scene opening out of black inside. */
.jj{position:fixed; inset:0; z-index:60; background:#0a0612; overflow:hidden;
  font-family:'Archivo',sans-serif; text-align:center;}
@keyframes jjWake{from{opacity:0;}to{opacity:1;}}
/* ---- cinematic jester intro (the road) ---- */
.jj-cine{z-index:2;}
.jj-cine-scene{position:absolute; inset:0; z-index:1; background-size:cover; background-position:center;
  opacity:0; animation:jjSceneOpen 2.7s cubic-bezier(.2,.7,.25,1) .55s both;
  will-change:transform,opacity; transform:translateZ(0); backface-visibility:hidden;}
.jj-cine-scene::after{content:""; position:absolute; inset:0; background:radial-gradient(120% 85% at 50% 45%, transparent 55%, rgba(6,4,12,.6) 100%);}
@keyframes jjSceneOpen{0%{opacity:0; transform:scale(1.14);}100%{opacity:1; transform:scale(1);}}
.jj-cine-card{position:absolute; inset:0; z-index:3; display:flex; align-items:center; justify-content:center;
  padding:22px; opacity:0; background:rgba(6,4,12,0); animation:jjCardIn 1.5s cubic-bezier(.2,.8,.25,1) 5s both;
  will-change:transform,opacity;}
@keyframes jjCardIn{0%{opacity:0; transform:scale(1.05) translateY(18px); background:rgba(6,4,12,0);}
  100%{opacity:1; transform:scale(1) translateY(0); background:rgba(6,4,12,.5);}}
.jj-cine-card.jj-entering{opacity:0; transform:scale(1.1); transition:opacity .7s ease, transform .7s ease; animation:none;}
.jj-cine-inner{position:relative; width:100%; max-width:360px; border-radius:20px; overflow:hidden;
  border:1px solid rgba(185,140,255,.5); box-shadow:0 0 60px rgba(138,92,255,.4); aspect-ratio:3/4.4;}
.jj-cine-cardart{position:absolute; inset:0; background-size:cover;}
.jj-cine-cardscrim{position:absolute; inset:0; background:linear-gradient(180deg,rgba(8,5,16,.82) 0%,rgba(8,5,16,.28) 26%,rgba(8,5,16,.12) 52%,rgba(8,5,16,.92) 100%);}
.jj-cine-quote{position:absolute; top:0; left:0; right:0; padding:30px 24px 0; text-align:center;
  font-family:'Cinzel',serif; font-style:italic; font-weight:600; font-size:16px; line-height:1.62;
  color:#efe7ff; letter-spacing:.015em; text-shadow:0 2px 22px #000; animation:jjHaunt 6s ease-in-out 6.8s infinite;}
@keyframes jjHaunt{0%,100%{text-shadow:0 2px 22px #000,0 0 3px rgba(184,140,255,.12);}
  42%{opacity:.965;} 50%{text-shadow:0 2px 22px #000,0 0 17px rgba(184,140,255,.5);} 74%{opacity:.94;}}
.jj-qw{display:inline-block; opacity:0; animation:jjQmat .85s cubic-bezier(.22,.61,.36,1) both;}
@keyframes jjQmat{from{opacity:0; transform:translateY(7px);}to{opacity:1; transform:translateY(0);}}
.jj-cine-foot{position:absolute; left:0; right:0; bottom:0; padding:0 18px 20px; display:flex;
  flex-direction:column; align-items:center; gap:6px; opacity:0; animation:jjFootIn .8s ease 6.9s both;}
@keyframes jjFootIn{from{opacity:0;}to{opacity:1;}}
.jj-cine-enter{width:100%; border:none; border-radius:12px; padding:16px 20px; font-family:'Anton';
  letter-spacing:.06em; font-size:15px; color:#1a1206; background:linear-gradient(180deg,#d9b6ff,#a874ff);
  box-shadow:0 8px 24px rgba(138,92,255,.4); cursor:pointer;}
.jj-cine-enter:active{transform:scale(.98);}
.jj-cine-not{background:none; border:none; color:#9a8fb5; font-family:'Archivo'; font-weight:700;
  font-size:12px; letter-spacing:.08em; text-transform:uppercase; padding:10px; cursor:pointer;}
.jj-cine-not:active{color:#efe7ff;}
.jj-bg{position:absolute; inset:0; z-index:0; background-size:cover; background-position:center top;
  background-color:#0a0612; will-change:opacity; transform:translateZ(0);}
.jj-bg.jj-pop{animation:jjPop 2.6s ease both;}
@keyframes jjPop{0%{opacity:0; transform:scale(1.14) translateZ(0);}100%{opacity:1; transform:scale(1) translateZ(0);}}
.jj-scrim{position:absolute; inset:0; z-index:1; pointer-events:none; background:
  linear-gradient(180deg, rgba(8,4,14,.6) 0%, rgba(8,4,14,.2) 16%, transparent 30%),
  linear-gradient(0deg, rgba(8,4,14,.9) 0%, rgba(8,4,14,.45) 22%, transparent 44%);}
.jj-scene{position:absolute; inset:0; z-index:2;}
.jj-fx{position:absolute; inset:0; z-index:5; pointer-events:none;}
.jj-name{position:absolute; top:calc(env(safe-area-inset-top,0px) + 3vh); left:0; right:0;
  font-family:'Cinzel Decorative'; font-weight:900; font-size:min(38px,9.6vw); white-space:nowrap;
  letter-spacing:.12em; color:#C77DFF;
  text-shadow:0 0 34px rgba(199,125,255,.55), 0 2px 22px rgba(0,0,0,.95);
  animation:jjFell 1.5s ease both;}
@keyframes jjFell{0%{opacity:0; letter-spacing:.5em; filter:blur(6px);}100%{opacity:1; letter-spacing:.12em; filter:blur(0);}}
.jj-roadw{position:absolute; top:calc(env(safe-area-inset-top,0px) + 8vh); left:16px; right:16px;
  display:flex; flex-direction:column; gap:12px; align-items:center;}
.jj-w{font-family:'Pirata One'; animation:jjStamp .16s cubic-bezier(.2,.8,.3,1.3) both;
  text-shadow:0 3px 14px rgba(0,0,0,.95);}
@keyframes jjStamp{0%{opacity:0; transform:scale(1.5);}60%{opacity:1; transform:scale(.96);}100%{opacity:1; transform:scale(1);}}
.jj-bone{font-size:22px; color:#E8E2D0;}
.jj-mut{font-size:20px; color:#A8AEBB;}
.jj-big{font-size:34px; letter-spacing:.1em; color:#C77DFF;
  text-shadow:0 0 30px rgba(199,125,255,.55), 0 3px 14px rgba(0,0,0,.95);}
.jj-gold{font-size:26px; letter-spacing:.18em; color:var(--gold);}
.jj-tent{position:absolute; top:31vh; left:6vw; right:6vw; aspect-ratio:1170/580;
  border-radius:10px; overflow:hidden; border:1px solid rgba(199,125,255,.65);
  outline:1px solid rgba(0,0,0,.85); outline-offset:-3px;
  opacity:0; transform:scale(.93); transition:opacity 1.3s ease, transform 1.3s ease;
  animation:jjTglow 2.6s ease-in-out infinite; cursor:pointer; z-index:3;}
.jj-tent.on{opacity:1; transform:scale(1);}
.jj-tent:active{filter:brightness(1.3);}
@keyframes jjTglow{0%,100%{box-shadow:0 0 14px rgba(199,125,255,.18);}50%{box-shadow:0 0 34px rgba(199,125,255,.5);}}
.jj-tentart{position:absolute; inset:0; background-size:cover;}
.jj-tentcap{position:absolute; left:0; right:0; bottom:0; padding:22px 10px 9px;
  background:linear-gradient(0deg, rgba(8,4,14,.9), transparent);
  font-family:'Cinzel'; font-weight:900; font-size:10px; letter-spacing:.3em;
  color:#C77DFF; text-shadow:0 0 12px rgba(199,125,255,.5);}
.jj-tent.jj-entering{transform:scale(1.12); opacity:0; transition:opacity .8s ease, transform .8s ease;}
.jj-r3{position:absolute; bottom:24vh; left:16px; right:16px;
  font-family:'Pirata One'; font-size:24px; color:#C77DFF;
  text-shadow:0 0 30px rgba(199,125,255,.55), 0 3px 14px rgba(0,0,0,.95);
  animation:jjStamp .16s cubic-bezier(.2,.8,.3,1.3) both;}
.jj-foot{position:fixed; bottom:max(26px, env(safe-area-inset-bottom)); left:16px; right:16px;
  display:flex; flex-direction:column; gap:10px; z-index:9; max-width:360px; margin:0 auto;}
.jj-plq{border-radius:2px; padding:19px; font-family:'Cinzel'; font-weight:900;
  letter-spacing:.22em; font-size:14px; border:1px solid rgba(199,125,255,.8); color:#C77DFF;
  background:linear-gradient(180deg,#160c26,#0a0514);
  text-shadow:0 0 16px rgba(199,125,255,.5); width:100%;
  outline:1px solid rgba(0,0,0,.85); outline-offset:-4px;
  box-shadow:inset 0 -10px 20px rgba(0,0,0,.7);}
.jj-plq:active{filter:brightness(1.5);}
.jj-plq.jj-gold{border-color:rgba(255,214,102,.8); color:var(--gold);
  text-shadow:0 0 16px rgba(255,214,102,.45);}
.jj-plq.jj-red{border-color:rgba(224,101,79,.8); color:var(--red);
  text-shadow:0 0 16px rgba(224,101,79,.45);}
.jj-plq.jj-dim{border-color:rgba(255,255,255,.25); color:#A8AEBB; text-shadow:none;}
.jj-wager{position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 5vh);
  left:16px; right:16px; z-index:3; display:flex; flex-direction:column; gap:10px;
  animation:jjVin .4s ease both;}
@keyframes jjVin{from{opacity:0;}to{opacity:1;}}
.jj-wtitle{font-family:'Cinzel'; font-size:10px; letter-spacing:.3em; color:#E8E2D0;
  font-weight:700; margin-bottom:6px;}
.jj-tbl{position:relative; border:1px solid rgba(199,125,255,.4); border-radius:6px; padding:13px 15px;
  background:linear-gradient(180deg, rgba(20,12,32,.86), rgba(9,5,16,.92)); text-align:left;
  outline:1px solid rgba(0,0,0,.7); outline-offset:-3px;}
.jj-tbl:active{filter:brightness(1.4);}
.jj-tbl.jj-locked{opacity:.4; filter:grayscale(.7);}
.jj-tn{font-family:'Pirata One'; font-size:23px; letter-spacing:.06em; color:#C77DFF;}
.jj-tgold .jj-tn{color:var(--gold);} .jj-tgold{border-color:rgba(255,214,102,.45);}
.jj-tsub{font-family:'Cinzel'; font-size:9.5px; letter-spacing:.1em; color:#A8AEBB;
  font-weight:700; margin-top:3px; line-height:1.5;}
.jj-tante{position:absolute; top:50%; right:13px; transform:translateY(-50%);
  font-family:'Pirata One'; font-size:30px; color:var(--red); letter-spacing:.04em;
  border:1px solid rgba(224,101,79,.75); border-radius:5px; padding:10px 16px;
  background:linear-gradient(180deg,#1d0d10,#0e0507);
  text-shadow:0 0 18px rgba(224,101,79,.5);
  outline:1px solid rgba(0,0,0,.8); outline-offset:-3px;
  box-shadow:inset 0 -8px 16px rgba(0,0,0,.6);}
.jj-tlock{position:absolute; top:50%; right:15px; transform:translateY(-50%);
  font-family:'Cinzel'; font-size:9px; letter-spacing:.14em; color:#A8AEBB; font-weight:700;}
.jj-pot{position:absolute; top:calc(env(safe-area-inset-top,0px) + 11vh); left:0; right:0; z-index:2;}
.jj-pv{font-family:'Pirata One'; font-size:64px; line-height:1; color:var(--gold);
  display:inline-block; animation:jjSway 3.2s ease-in-out infinite;
  text-shadow:0 0 34px rgba(255,214,102,.4), 0 4px 16px rgba(0,0,0,.95);}
@keyframes jjSway{0%,100%{transform:rotate(-1.4deg) scale(1);}50%{transform:rotate(1.4deg) scale(1.04);}}
.jj-skims{font-family:'Pirata One'; font-size:21px; color:var(--red); margin-top:2px;
  text-shadow:0 0 20px rgba(224,101,79,.55), 0 2px 10px rgba(0,0,0,.9);
  animation:jjSkPop .5s ease;}
.jj-skimtally{font-size:17px; opacity:.85; animation:none;}
@keyframes jjSkPop{0%{transform:scale(1.3);}100%{transform:scale(1);}}
.jj-pick{position:absolute; top:53vh; left:0; right:0; z-index:2;
  font-family:'Pirata One'; font-size:25px; color:#E8E2D0; letter-spacing:.08em;
  text-shadow:0 3px 14px rgba(0,0,0,.95); animation:jjFloat 2.6s ease-in-out infinite;}
@keyframes jjFloat{0%,100%{transform:translateY(0); opacity:.95;}50%{transform:translateY(-5px); opacity:.65;}}
.jj-cards{position:absolute; top:58vh; left:0; right:0; display:flex; gap:12px;
  justify-content:center; padding:0 16px; perspective:900px; z-index:2;}
.jj-pc{width:min(28vw,116px); aspect-ratio:2/3; position:relative;
  transform-style:preserve-3d; transition:transform .55s cubic-bezier(.3,.8,.3,1);}
.jj-pc:not(.jj-flip){animation:jjWig 2.4s ease-in-out infinite;}
.jj-pc:nth-child(2):not(.jj-flip){animation-delay:.45s; animation-duration:2.9s;}
.jj-pc:nth-child(3):not(.jj-flip){animation-delay:.85s; animation-duration:2.1s;}
@keyframes jjWig{0%,100%{transform:rotate(-1.4deg);}50%{transform:rotate(1.4deg);}}
.jj-pc.jj-flip{animation:none; transform:rotateY(180deg);}
.jj-pc.jj-dimc{animation:none; opacity:.3;}
.jj-face{position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden;
  border-radius:8px; border:1px solid rgba(199,125,255,.6);
  outline:1px solid rgba(0,0,0,.85); outline-offset:-3px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  box-shadow:0 8px 24px rgba(0,0,0,.6);}
.jj-back{background:repeating-linear-gradient(45deg, #1d1030 0 10px, #150a24 10px 20px);
  color:#C77DFF; font-family:'Pirata One'; font-size:44px;
  text-shadow:0 0 18px rgba(199,125,255,.6);}
.jj-front{transform:rotateY(180deg); background:linear-gradient(180deg, #17102a, #0c0718);
  padding:8px; gap:4px;}
.jj-fr{font-family:'Pirata One'; font-size:min(20px,4.8vw); color:var(--gold); line-height:1.15;}
.jj-ft{font-family:'Cinzel'; font-size:9px; letter-spacing:.14em; color:#A8AEBB; font-weight:700;}
.jj-pc.jj-cleared .jj-front{border-color:rgba(255,214,102,.7);}
.jj-chal{position:absolute; top:47vh; left:16px; right:16px; z-index:3; animation:jjVin .3s ease both;}
.jj-cname{font-family:'Pirata One'; font-size:34px; color:var(--gold);
  text-shadow:0 0 24px rgba(255,214,102,.4), 0 3px 14px rgba(0,0,0,.95);}
.jj-cclock{font-family:'Pirata One'; font-size:74px; line-height:1; color:#C77DFF; margin-top:6px;
  text-shadow:0 0 40px rgba(199,125,255,.5), 0 4px 18px rgba(0,0,0,.95);}
.jj-cclock.jj-red{color:var(--red); text-shadow:0 0 34px rgba(224,101,79,.6), 0 4px 18px rgba(0,0,0,.95);
  animation:jjTick .35s ease;}
@keyframes jjTick{0%{transform:scale(1.12);}100%{transform:scale(1);}}
.jj-chint{font-family:'Cinzel'; font-weight:700; font-size:10px; letter-spacing:.24em;
  color:#A8AEBB; margin-top:8px;}
.jj-urgveil{position:absolute; inset:0; z-index:1; pointer-events:none;
  background:radial-gradient(120% 100% at 50% 50%, transparent 42%, rgba(150,22,10,.6) 100%);
  animation:jjUrg 1s ease-in-out infinite;}
@keyframes jjUrg{0%,100%{opacity:.22;}50%{opacity:.85;}}
.jj.jj-sk{animation:jjShake .5s linear;}
@keyframes jjShake{0%{transform:none;}20%{transform:translate(-10px,6px) rotate(-.8deg);}
  45%{transform:translate(9px,-5px);}70%{transform:translate(-6px,3px);}100%{transform:none;}}
.jj-quote{position:absolute; top:47vh; left:16px; right:16px; text-align:center;
  font-family:'Pirata One'; font-size:min(22px,5.6vw); color:#C77DFF; letter-spacing:.06em;
  text-shadow:0 0 20px rgba(199,125,255,.5), 0 3px 12px rgba(0,0,0,.95);
  animation:jjQ 4.8s ease both;}
@keyframes jjQ{0%{opacity:0; transform:translateY(10px);}8%{opacity:1; transform:none;}
  86%{opacity:1;}100%{opacity:0; transform:translateY(-8px);}}
.jj-drop{position:absolute; top:12.5vh; left:0; right:0; text-align:center;
  font-family:'Pirata One'; font-size:30px; color:var(--red);
  text-shadow:0 0 20px rgba(224,101,79,.6), 0 2px 10px rgba(0,0,0,.9);
  animation:jjDrop 1.4s ease both;}
@keyframes jjDrop{0%{opacity:0; transform:translateY(6px);}20%{opacity:1;}100%{opacity:0; transform:translateY(-26px);}}
.jj-robflash{position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(90% 55% at 50% 14%, rgba(199,125,255,.5), transparent 70%);
  animation:jjRobF .55s ease both;}
@keyframes jjRobF{0%{opacity:0;}22%{opacity:1;}100%{opacity:0;}}
.jj-plq.jj-flee{position:fixed; width:170px; padding:13px 8px; font-size:11px; letter-spacing:.14em;
  z-index:14; will-change:left,top,transform;
  transition:left .24s cubic-bezier(.34,-.18,.42,1.25), top .24s cubic-bezier(.34,-.18,.42,1.25);
  transform:scale(var(--g,1)) rotate(var(--r,0deg));}
.jj-plq.jj-flee.jj-hopping{animation:jjHopA .42s cubic-bezier(.3,.6,.4,1);}
@keyframes jjHopA{0%{transform:scale(var(--g,1)) scaleY(.72) translateY(7px) rotate(var(--r,0deg));}
  45%{transform:scale(var(--g,1)) scaleY(1.1) translateY(-16px) rotate(var(--r,0deg));}
  100%{transform:scale(var(--g,1)) translateY(0) rotate(var(--r,0deg));}}
.jj-plq.jj-flee.jj-stumble{filter:brightness(1.6); box-shadow:0 0 24px rgba(255,214,102,.5);}
.jj-vscene{position:absolute; inset:0; z-index:4; display:flex; flex-direction:column;
  align-items:center; justify-content:flex-start;
  padding:calc(env(safe-area-inset-top,0px) + 5vh) 20px calc(env(safe-area-inset-bottom,0px) + 24px);
  animation:jjVin .5s ease both;}
.jj-vT{font-family:'Cinzel Decorative'; font-weight:900; font-size:min(64px,15vw); letter-spacing:.08em;
  line-height:1; animation:jjFell 1.6s ease both;}
.jj-v-walk{color:var(--gold); text-shadow:0 0 40px rgba(255,214,102,.5);}
.jj-v-bank{color:#C77DFF; text-shadow:0 0 40px rgba(199,125,255,.6);}
.jj-v-bust{color:var(--red); text-shadow:0 0 40px rgba(224,101,79,.45);}
.jj-ledger{width:100%; max-width:340px; border:1px solid rgba(199,125,255,.45); border-radius:3px;
  background:linear-gradient(180deg, rgba(20,12,32,.92), rgba(9,5,16,.96));
  padding:22px 20px;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.8), inset 0 0 40px rgba(0,0,0,.6);}
.jj-ledger.jj-lred{border-color:rgba(224,101,79,.45);
  background:linear-gradient(180deg, rgba(26,12,9,.92), rgba(12,6,4,.96));}
.jj-lrow{display:flex; justify-content:space-between; padding:10px 0; opacity:0;
  animation:jjRise .45s ease both; font-family:'Cinzel'; font-size:12px; letter-spacing:.1em;
  color:#E8E2D0; border-bottom:1px solid rgba(199,125,255,.16);}
.jj-lrow b{color:var(--gold);}
.jj-ledger.jj-lred .jj-lrow{border-color:rgba(224,101,79,.16);}
.jj-ledger.jj-lred .jj-lrow b{color:var(--red);}
@keyframes jjRise{from{opacity:0; transform:translateY(14px);}to{opacity:1; transform:none;}}
.jj-ltot{font-family:'Cinzel Decorative'; font-weight:900; font-size:34px; margin-top:14px;
  color:var(--gold); text-shadow:0 0 26px rgba(255,214,102,.35);}
.jj-ledger.jj-lred .jj-ltot{color:var(--red); text-shadow:0 0 26px rgba(224,101,79,.3);}
.jj-vline{font-family:'Cinzel'; font-size:10px; letter-spacing:.28em; color:rgba(232,226,208,.55);
  margin-top:14px;}


/* ---- THE HYDRA ---- */
.sca-hydra .sg-name{color:#86C232 !important;
  text-shadow:0 0 24px rgba(134,194,50,.45), 0 2px 12px rgba(0,0,0,.9);}
.sg-hyenter{border-color:rgba(134,194,50,.75) !important; color:#86C232 !important;
  text-shadow:0 0 12px rgba(134,194,50,.45) !important;}
.sg-hygrow{border-color:rgba(134,194,50,.4) !important; color:rgba(134,194,50,.75) !important;}
.hy-name{color:#86C232 !important;
  text-shadow:0 0 34px rgba(134,194,50,.5), 0 2px 22px rgba(0,0,0,.95) !important;}
.hy-bg{background-color:#0a0d08 !important;}
.cl-overlay.hy-bg::after{content:""; position:absolute; inset:0; z-index:1; pointer-events:none;
  background:linear-gradient(0deg, rgba(8,13,6,.92) 0%, rgba(8,13,6,.55) 26%, transparent 48%);}
.hy-five{font-size:40px; letter-spacing:.1em; color:#86C232;
  text-shadow:0 0 30px rgba(134,194,50,.5), 0 3px 14px rgba(0,0,0,.95);}
.hy-head{font-size:min(24px, 6.2vw); letter-spacing:.08em; margin-top:9px; white-space:nowrap;}
.hy-head b{color:var(--gold); font-weight:400;}
.hy-clkline{font-size:30px; letter-spacing:.16em; margin-top:14px; color:var(--gold);}
.hy-clock{position:absolute; top:calc(env(safe-area-inset-top,0px) + 9vh); left:0; right:0;
  font-family:'Pirata One'; font-size:84px; line-height:1; color:#86C232; text-align:center;
  text-shadow:0 0 40px rgba(134,194,50,.45), 0 4px 18px rgba(0,0,0,.95);}
.hy-clock.tick{animation:clTick .35s ease;}
.cl-urgent .hy-clock{color:var(--red);
  text-shadow:0 0 34px rgba(224,101,79,.6), 0 4px 18px rgba(0,0,0,.95);}
.hy-heads{position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 9vh); left:16px; right:16px;
  display:flex; flex-direction:column; gap:8px;}
.hy-hd{display:flex; align-items:center; justify-content:space-between; gap:10px;
  border:1px solid rgba(134,194,50,.42); border-radius:8px; padding:11px 13px;
  background:linear-gradient(180deg, rgba(12,20,8,.72), rgba(8,14,6,.82));
  outline:1px solid rgba(0,0,0,.6); outline-offset:-3px;
  -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px);}
.hy-ht{font-family:'Pirata One'; font-size:min(17px, 4.6vw); letter-spacing:.03em;
  color:#E8E2D0; text-align:left; white-space:nowrap;}
.hy-ht b{color:var(--gold); font-weight:400;}
.hy-sever{font-family:'Cinzel'; font-weight:900; font-size:11px; letter-spacing:.16em;
  color:#86C232; background:rgba(8,14,6,.6); border:1px solid rgba(134,194,50,.6); border-radius:5px;
  padding:9px 15px; cursor:pointer; text-shadow:0 0 10px rgba(134,194,50,.4); flex:0 0 auto;}
.hy-sever:active{filter:brightness(1.6);}
.hy-hd.dead{border-color:rgba(255,255,255,.12); position:relative; overflow:hidden;
  animation:hySlash .35s ease both;}
@keyframes hySlash{0%{transform:none;}30%{transform:translateX(-7px);}
  60%{transform:translateX(5px);}100%{transform:none;}}
.hy-hd.dead .hy-ht{color:rgba(232,226,208,.35); text-decoration:line-through;
  text-decoration-color:rgba(134,194,50,.7); text-decoration-thickness:2px;}
.hy-hd.dead .hy-ht b{color:rgba(255,214,102,.3);}
.hy-hd.dead .hy-sever{visibility:hidden;}
.hy-hd.dead::after{content:"SEVERED"; position:absolute; right:14px; top:50%;
  transform:translateY(-50%) rotate(-4deg); font-family:'Pirata One'; font-size:17px;
  color:#86C232; letter-spacing:.14em; text-shadow:0 0 14px rgba(134,194,50,.6);
  animation:clStamp .18s cubic-bezier(.2,.8,.3,1.3) both;}
.hy-remain{position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 4vh); left:0; right:0;
  font-family:'Cinzel'; font-size:10px; letter-spacing:.3em; color:rgba(134,194,50,.55);
  font-weight:900; text-align:center;}
.hy-slainT{color:#86C232 !important; text-shadow:0 0 40px rgba(134,194,50,.5) !important;}
.hy-ledger:not(.red){border-color:rgba(134,194,50,.45) !important;
  background:linear-gradient(180deg, rgba(14,22,8,.92), rgba(6,9,4,.96)) !important;}
.hy-ledger:not(.red) .cl-lrow{border-color:rgba(134,194,50,.16);}
.hy-ledger:not(.red) .cl-ltot{color:#86C232; text-shadow:0 0 26px rgba(134,194,50,.35);}
.hy-leave{border-color:rgba(134,194,50,.7) !important; color:#86C232 !important;
  text-shadow:0 0 16px rgba(134,194,50,.45) !important;}

/* ---- THE COLLECTOR ---- */
.cl{position:fixed; inset:0; z-index:46; overflow:hidden; background:#0d0c0a;
  color:var(--chalk); text-align:center;}
.cl-inner{position:absolute; inset:0; z-index:2;}
.cl-inner.cl-sk{animation:clSk .6s linear;}
.cl-inner.cl-sk2{animation:clSk2 .4s linear;}
@keyframes clSk{0%{transform:none;}12%{transform:translate(-14px,8px) rotate(-1deg);}
  24%{transform:translate(13px,-7px) rotate(.9deg);}38%{transform:translate(-10px,-6px);}
  52%{transform:translate(9px,6px);}68%{transform:translate(-6px,3px);}
  84%{transform:translate(4px,-2px);}100%{transform:none;}}
@keyframes clSk2{0%{transform:none;}30%{transform:translate(-7px,4px);}
  60%{transform:translate(6px,-3px);}100%{transform:none;}}
.cl-bg{position:absolute; inset:0; z-index:0; background-size:cover; background-position:center top;
  animation:clSurge 3.4s cubic-bezier(.2,.7,.3,1) both,
    clBreathe2 9s ease-in-out 3.4s infinite alternate;
  background-color:#171310;}
.cl-slamfx .cl-bg{animation:clPunch .38s cubic-bezier(.2,.8,.3,1) both,
  clBreathe2 9s ease-in-out .4s infinite alternate;}
.cl-urgent .cl-bg{animation:clBreatheFast2 2.4s ease-in-out infinite alternate;}
@keyframes clSurge{0%{transform:scale(1.22); filter:brightness(.04);}
  55%{filter:brightness(1.08);}100%{transform:scale(1); filter:brightness(1);}}
@keyframes clPunch{0%{transform:scale(1.075); filter:brightness(1.35);}
  100%{transform:scale(1); filter:brightness(1);}}
@keyframes clBreathe2{from{transform:scale(1);}to{transform:scale(1.035);}}
@keyframes clBreatheFast2{from{transform:scale(1.02); filter:brightness(.92);}
  to{transform:scale(1.06); filter:brightness(1.06);}}
.cl-scrim{position:absolute; inset:0; z-index:1; pointer-events:none; background:
  linear-gradient(180deg, rgba(8,6,4,.55) 0%, rgba(8,6,4,.15) 14%, transparent 28%),
  radial-gradient(88% 34% at 50% 68%, rgba(8,6,4,.62) 0%, transparent 100%),
  linear-gradient(0deg, rgba(8,6,4,.88) 0%, rgba(8,6,4,.45) 18%, transparent 38%);}
.cl-name{position:absolute; top:calc(env(safe-area-inset-top,0px) + 3vh); left:0; right:0;
  font-family:'Cinzel Decorative'; font-weight:900; font-size:min(34px, 8.4vw);
  white-space:nowrap; letter-spacing:.1em; color:#E8E2D0;
  text-shadow:0 0 30px rgba(201,167,90,.4), 0 2px 22px rgba(0,0,0,.95);
  animation:clFelled 1.5s ease both;}
@keyframes clFelled{0%{opacity:0; letter-spacing:.5em; filter:blur(6px);}
  100%{opacity:1; letter-spacing:.1em; filter:blur(0);}}
.cl-dmw{position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 4vh); left:0; right:0;
  display:flex; flex-direction:column; align-items:center;}
.cl-w{font-family:'Pirata One'; color:#E8E2D0; opacity:0;
  text-shadow:0 3px 14px rgba(0,0,0,.95);}
.cl-w.on{animation:clStamp .16s cubic-bezier(.2,.8,.3,1.3) both;}
@keyframes clStamp{0%{opacity:0; transform:scale(1.5) rotate(var(--rot,0deg));}
  60%{opacity:1; transform:scale(.96) rotate(0deg);}100%{opacity:1; transform:scale(1);}}
.cl-dem{font-size:32px; letter-spacing:.12em;}
.cl-numrel{position:relative;}
.cl-num{font-size:92px; line-height:1; color:var(--gold); margin-top:2px; white-space:nowrap;
  text-shadow:0 0 44px rgba(255,214,102,.4), 0 4px 18px rgba(0,0,0,.95);}
.cl-num.on{animation:clStamp .16s cubic-bezier(.2,.8,.3,1.3) both,
  clNumFlash .55s ease .12s both;}
@keyframes clNumFlash{0%{text-shadow:0 0 90px rgba(255,230,160,1), 0 0 40px rgba(255,214,102,1);}
  100%{text-shadow:0 0 44px rgba(255,214,102,.4), 0 4px 18px rgba(0,0,0,.95);}}
.cl-num small{display:block; font-size:min(30px, 7.6vw); letter-spacing:.14em;
  color:var(--gold); margin-top:4px;}
.cl-rim{position:absolute; left:50%; top:50%; width:160px; height:160px; margin:-80px 0 0 -80px;
  border-radius:50%; z-index:-1; pointer-events:none;
  background:radial-gradient(50% 50%, transparent 55%, rgba(255,190,110,.5) 74%, transparent 92%);
  animation:clRim .5s ease-out both;}
@keyframes clRim{0%{opacity:1; transform:scale(.6);}100%{opacity:0; transform:scale(2.6);}}
.cl-gsh{position:absolute; left:50%; bottom:-14px; width:120px; height:22px; margin-left:-60px;
  border-radius:50%; z-index:-1; pointer-events:none;
  background:radial-gradient(50% 50%, rgba(0,0,0,.85), transparent 70%);
  animation:clGsh .55s ease-out both;}
@keyframes clGsh{0%{opacity:.9; transform:scale(.3);}100%{opacity:0; transform:scale(2.4);}}
.cl-clk{font-size:26px; letter-spacing:.2em; margin-top:6px;}
.cl-warn{font-size:21px; letter-spacing:.14em; margin-top:12px;}
.cl-warn2{font-size:25px; letter-spacing:.24em; margin-top:10px; color:#C33B26;
  text-shadow:0 0 30px rgba(195,59,38,.6), 0 3px 12px rgba(0,0,0,.95);}
.cl-warn2.on{animation:clStamp .16s cubic-bezier(.2,.8,.3,1.3) both,
  clTorch 2.6s steps(1) .4s infinite;}
@keyframes clTorch{0%,100%{opacity:1;}7%{opacity:.75;}9%{opacity:1;}
  41%{opacity:.85;}43%{opacity:1;}72%{opacity:.7;}74%{opacity:1;}}
.cl-tsnrow{display:flex; gap:16px; justify-content:center; margin-top:14px;}
.cl-tsn{font-size:min(31px, 7.6vw); color:#FF6B4A; letter-spacing:.16em;
  text-shadow:0 0 28px rgba(255,107,74,.65), 0 3px 12px rgba(0,0,0,.95);}
.cl-tsnrow.armed .cl-tsn.on{opacity:1;
  animation:clStamp .16s cubic-bezier(.2,.8,.3,1.3) both,
    clThrob 1.15s ease-in-out .25s infinite;}
@keyframes clThrob{0%,100%{text-shadow:0 0 22px rgba(255,107,74,.45), 0 3px 12px rgba(0,0,0,.95);}
  50%{text-shadow:0 0 44px rgba(255,107,74,.95), 0 3px 12px rgba(0,0,0,.95);}}
.cl-veil{position:absolute; inset:0; pointer-events:none; opacity:0;
  background:radial-gradient(120% 100% at 50% 50%, transparent 42%, rgba(150,22,10,.6) 100%);}
.cl-urgent .cl-veil{animation:clUrg 1s ease-in-out infinite;}
@keyframes clUrg{0%,100%{opacity:.22;}50%{opacity:.85;}}
.cl-ctb{position:absolute; top:46vh; left:0; right:0; display:flex; flex-direction:column;
  align-items:center;}
.cl-ctlabel{font-family:'Pirata One'; font-size:30px; letter-spacing:.1em; color:var(--gold);
  text-shadow:0 3px 14px rgba(0,0,0,.95);}
.cl-tclock{font-family:'Pirata One'; font-size:96px; line-height:1; color:var(--gold); margin-top:4px;
  text-shadow:0 0 40px rgba(255,214,102,.4), 0 4px 18px rgba(0,0,0,.95);}
.cl-tclock.tick{animation:clTick .35s ease;}
@keyframes clTick{0%{transform:scale(1.14);}100%{transform:scale(1);}}
.cl-urgent .cl-tclock{color:var(--red);
  text-shadow:0 0 34px rgba(224,101,79,.6), 0 4px 18px rgba(0,0,0,.95);}
.cl-tbar{width:min(320px, 78vw); height:18px; margin-top:16px; border-radius:3px;
  border:1px solid rgba(201,167,90,.55); background:rgba(0,0,0,.6); padding:2.5px;
  position:relative; overflow:hidden;}
.cl-tbar::after{content:""; position:absolute; inset:2.5px; pointer-events:none; border-radius:2px;
  background:repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px),
    rgba(0,0,0,.55) calc(10% - 1px) 10%);}
.cl-tbar i{display:block; height:100%; border-radius:2px;
  background:linear-gradient(90deg, #E85D26, var(--gold));
  box-shadow:0 0 10px rgba(255,180,90,.35); transition:width .25s linear;}
.cl-urgent .cl-tbar{border-color:rgba(224,101,79,.6);}
.cl-urgent .cl-tbar i{background:linear-gradient(90deg, #7a1408, var(--red));}
.cl-dbtn{position:fixed; bottom:max(28px, env(safe-area-inset-bottom)); left:50%;
  transform:translateX(-50%); width:calc(100% - 40px); max-width:340px; z-index:9;}
.cl-tapper{border-radius:2px; padding:22px; font-family:'Cinzel'; font-weight:900;
  letter-spacing:.26em; font-size:15px; border:1px solid rgba(201,167,90,.85); color:#C9A75A;
  background:linear-gradient(180deg,#1e1708,#0d0a04); cursor:pointer;
  text-shadow:0 0 16px rgba(201,167,90,.45);
  outline:1px solid rgba(0,0,0,.85); outline-offset:-4px; width:100%;
  box-shadow:inset 0 -10px 20px rgba(0,0,0,.7);}
.cl-tapper:active{filter:brightness(1.5);}
.cl-vscene{position:absolute; inset:0; display:flex; flex-direction:column; align-items:center;
  justify-content:center; padding:20px; animation:clVin .5s ease both;}
@keyframes clVin{from{opacity:0;}to{opacity:1;}}
.cl-vT{font-family:'Cinzel Decorative'; font-weight:900; font-size:38px; letter-spacing:.12em;
  animation:clFelled 1.6s ease both;}
.cl-vT.paid{color:var(--gold); text-shadow:0 0 40px rgba(255,214,102,.45);}
.cl-vT.took{color:var(--red); text-shadow:0 0 40px rgba(224,101,79,.45);}
.cl-ledger{width:100%; max-width:340px; border:1px solid rgba(201,167,90,.45); border-radius:3px;
  background:linear-gradient(180deg, rgba(24,17,9,.92), rgba(11,8,4,.96));
  padding:22px 20px; margin-top:26px;
  box-shadow:inset 0 0 0 1px rgba(0,0,0,.8), inset 0 0 40px rgba(0,0,0,.6);}
.cl-ledger.red{border-color:rgba(224,101,79,.45);
  background:linear-gradient(180deg, rgba(26,12,9,.92), rgba(12,6,4,.96));}
.cl-lrow{display:flex; justify-content:space-between; padding:10px 0; opacity:0;
  animation:clRise .45s ease both; font-family:'Cinzel'; font-size:12px; letter-spacing:.1em;
  color:#E8E2D0; border-bottom:1px solid rgba(201,167,90,.16);}
.cl-lrow b{color:var(--gold);}
.cl-ledger.red .cl-lrow{border-color:rgba(224,101,79,.16);}
.cl-ledger.red .cl-lrow b{color:var(--red);}
@keyframes clRise{from{opacity:0; transform:translateY(14px);}to{opacity:1; transform:none;}}
.cl-ltot{font-family:'Cinzel Decorative'; font-weight:900; font-size:34px; margin-top:14px;
  color:var(--gold); text-shadow:0 0 26px rgba(255,214,102,.3);}
.cl-ledger.red .cl-ltot{color:var(--red); text-shadow:0 0 26px rgba(224,101,79,.3);}
.cl-vline{font-family:'Cinzel'; font-size:10px; letter-spacing:.3em; color:rgba(232,226,208,.55);
  margin-top:14px;}
.cl-leave{margin-top:24px; max-width:340px;}

/* ---- THE SUNDERING (death) ---- */
.bb-sunder{position:absolute; inset:0; z-index:4;}
.bb-sgap{position:absolute; inset:0; background:#050302;}
.bb-half{position:absolute; inset:0; background-size:cover; background-position:center top;
  background-color:#141010;}
.bb-half.t{clip-path:polygon(0 0, 100% 0, 100% 32%, 0 68%); animation:bbSplitT 1.5s ease-in .34s both;}
.bb-half.b{clip-path:polygon(0 68%, 100% 32%, 100% 100%, 0 100%); animation:bbSplitB 1.5s ease-in .34s both;}
@keyframes bbSplitT{0%{transform:none; filter:none;}
  100%{transform:translate(-34px,-46px) rotate(-1.6deg); filter:brightness(.15);}}
@keyframes bbSplitB{0%{transform:none; filter:none;}
  100%{transform:translate(34px,52px) rotate(1.4deg); filter:brightness(.15);}}
.bb-seam{position:absolute; inset:0; pointer-events:none; opacity:0;
  background:linear-gradient(115deg, transparent 46%, rgba(232,93,38,.5) 49.5%,
    rgba(255,180,90,.8) 50%, rgba(232,93,38,.5) 50.5%, transparent 54%);
  animation:bbSeam 1.5s ease .34s both;}
@keyframes bbSeam{0%{opacity:0;}25%{opacity:1;}100%{opacity:0;}}
.bb-slashline{position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(115deg, transparent 47.6%, rgba(255,240,220,.95) 49.4%, #fff 50%,
    rgba(255,240,220,.95) 50.6%, transparent 52.4%);
  animation:bbSlashLn .38s cubic-bezier(.7,0,.3,1) both;
  filter:drop-shadow(0 0 18px rgba(255,180,120,.9));}
@keyframes bbSlashLn{0%{opacity:0; transform:translate(-60%,-60%);}35%{opacity:1;}
  100%{opacity:0; transform:translate(55%,55%);}}

/* ---- GOTHIC ENDING ---- */
.bb-slainT{font-family:'Cinzel Decorative'; font-weight:900; font-size:50px; letter-spacing:.14em;
  color:var(--gold); animation:bbFelledIn 1.8s ease both;
  text-shadow:0 0 40px rgba(255,214,102,.45), 0 2px 24px rgba(0,0,0,.9);}
@keyframes bbFelledIn{0%{opacity:0; letter-spacing:.55em; filter:blur(7px);}
  100%{opacity:1; letter-spacing:.14em; filter:blur(0);}}
.bb-ledger{width:100%; max-width:340px; border:1px solid rgba(201,167,90,.45); border-radius:3px;
  background:linear-gradient(180deg, rgba(24,17,9,.92), rgba(11,8,4,.96));
  padding:26px 22px; box-shadow:inset 0 0 0 1px rgba(0,0,0,.8), inset 0 0 40px rgba(0,0,0,.6);}
.bb-ledtitle{font-family:'Cinzel Decorative'; font-weight:700; font-size:19px; letter-spacing:.2em;
  color:var(--gold);}
.bb-ledtotal{font-family:'Cinzel Decorative'; font-weight:900; font-size:40px; color:var(--gold);
  margin-top:16px; text-shadow:0 0 30px rgba(255,214,102,.35);}
.bb-goldbtn{border-color:rgba(201,167,90,.8) !important; color:var(--gold) !important;
  background:linear-gradient(180deg, #201709 0%, #0e0a04 100%) !important;
  text-shadow:0 0 16px rgba(255,214,102,.4) !important;
  box-shadow:0 0 22px rgba(201,167,90,.15), inset 0 1px 0 rgba(255,230,170,.12),
    inset 0 -8px 18px rgba(0,0,0,.7) !important;}

/* ---- FORGE ---- */
.bb-forge{background:radial-gradient(120% 90% at 50% 108%, #3a1d0c 0%, #1a1410 34%, var(--floor) 72%);}
.bb-forge.bb-p2{background:radial-gradient(120% 90% at 50% 108%, #16240e 0%, #101008 40%, #0c0f0c 75%);}
.bb-forge .bb-name{font-family:'Cinzel Decorative'; font-weight:900; font-size:27px;
  letter-spacing:.1em; margin-top:12px;
  text-shadow:0 2px 22px rgba(0,0,0,.95), 0 0 30px rgba(255,138,60,.25);}
.bb-forge .bb-subt{font-family:'Cinzel'; letter-spacing:.4em; color:var(--ember);}
.bb-forge.bb-p2 .bb-subt{color:var(--bbc);}
.bb-forge .bb-medal{background:#241a12; border:1px solid #3a2a1c; border-radius:12px;}
.bb-forge.bb-p2 .bb-medal{border-color:var(--bbd);}
.bb-forge .bb-plate{border-bottom:1px solid rgba(255,138,60,.14);}
.bb-forge .bb-hpfill{background:linear-gradient(90deg, var(--ember-deep), var(--ember) 55%, var(--gold));
  box-shadow:0 0 8px rgba(255,138,60,.4);}
.bb-forge.bb-p2 .bb-hpfill{background:linear-gradient(90deg, var(--bbd), var(--bbc)); box-shadow:0 0 8px var(--bbc);}
.bb-forge .bb-hpshell.flash .bb-hpfill{filter:brightness(2.2);}
.bb-forge .bb-rfg{stroke:var(--ember);}
.bb-forge.bb-p2 .bb-rfg{stroke:var(--bbc);}
.bb-forge .bb-rin b{font-family:'Cinzel'; font-weight:900; color:var(--gold);}
.bb-forge.bb-p2 .bb-rin b{color:var(--bbc);}
.bb-forge .bb-demand{font-family:'Cinzel'; font-weight:900; font-size:54px; color:var(--gold);
  letter-spacing:.02em;}
.bb-forge.bb-p2 .bb-demand{color:var(--bbc);}
.bb-forge .bb-demand small{font-size:22px; color:#E8E2D0; font-family:'Cinzel'; font-weight:700;
  letter-spacing:.1em;}
.bb-forge .bb-lifttag{font-family:'Cinzel'; font-weight:700; letter-spacing:.4em; color:var(--ember);}
.bb-forge.bb-p2 .bb-lifttag{color:var(--bbc);}
.bb-forge .bb-menace{font-family:'Cinzel'; font-size:12.5px; letter-spacing:.1em;
  color:rgba(232,226,208,.72);}
.bb-forge .bb-cta{background:linear-gradient(180deg, #221208 0%, #0f0804 100%);
  border:1px solid rgba(255,138,60,.75); color:var(--ember);
  text-shadow:0 0 16px rgba(255,138,60,.5);
  box-shadow:0 0 22px rgba(232,93,38,.18), inset 0 1px 0 rgba(255,190,120,.12),
    inset 0 -8px 18px rgba(0,0,0,.7);}
.bb-forge.bb-p2 .bb-cta{background:linear-gradient(180deg, #16200c 0%, #0a0f05 100%);
  border-color:var(--bbc); color:var(--bbc); text-shadow:0 0 14px var(--bbc);}
.bb-forge .bb-ghost{border:1px solid rgba(201,167,90,.35); color:#b3a88f; border-radius:2px;
  background:rgba(6,4,3,.55); font-family:'Cinzel'; font-weight:700; letter-spacing:.3em;
  text-transform:uppercase; font-size:11px;}
.bb-forge .bb-formname{font-family:'Anton'; font-size:44px; letter-spacing:.05em; color:var(--bbc);
  margin-top:8px; animation:bbSlam .6s cubic-bezier(.2,1.5,.4,1) both;}
.bb-forge .bb-slain{font-family:'Anton'; font-size:84px; color:var(--ember); letter-spacing:.04em;
  animation:bbSlam .55s cubic-bezier(.2,1.5,.4,1) both; text-shadow:0 0 40px rgba(232,93,38,.7);}
@keyframes bbSlam{0%{opacity:0; transform:scale(2.4);}70%{opacity:1; transform:scale(.96);}100%{transform:scale(1);}}
.bb-forge .bb-xpcard{background:rgba(30,34,42,.92); border:1px solid #3a2a1c; border-radius:18px; padding:26px 22px;}
.bb-forge .bb-xptitle{font-family:'Anton'; font-size:26px; letter-spacing:.05em; color:var(--gold);}
.bb-forge .bb-xprow{border-bottom:1px dashed var(--line);}
.bb-forge .bb-xprow b{color:var(--ember);}
.bb-forge .bb-xptotal{font-family:'Anton'; font-size:44px; color:var(--ember); margin:14px 0 4px;}
.bb-forge .bb-lvlfill{background:linear-gradient(90deg,var(--ember-deep),var(--gold));}
.bb-forge .bb-lvlup{font-family:'Anton'; font-size:20px; color:var(--gold);}

/* ---- ARCADE ---- */
.bb-arcade{background:#08100a; font-family:'VT323',monospace;}
.bb-arcade.bb-p2{background:#120808;}
.bb-scan{position:absolute; inset:0; pointer-events:none; z-index:7;
  background:repeating-linear-gradient(0deg, rgba(0,0,0,.28) 0 2px, transparent 2px 4px);}
.bb-arcade .bb-face.big{animation:bbBob 1s steps(2) infinite;}
@keyframes bbBob{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
.bb-arcade .bb-name{font-family:'Press Start 2P'; font-size:14px; color:#9BC46B; margin-top:16px;}
.bb-arcade.bb-p2 .bb-name{color:var(--bbc);}
.bb-arcade .bb-subt{font-family:'Press Start 2P'; font-size:8px; color:#4e6b52;}
.bb-cells{display:flex; gap:3px; width:100%; padding:4px; background:#04170b; border:2px solid #1e3a26;}
.bb-arcade.bb-p2 .bb-cells{background:#170404; border-color:#3a1e1e;}
.bb-cells i{flex:1; height:12px; background:#0c1f12; transition:background .12s steps(2);}
.bb-arcade.bb-p2 .bb-cells i{background:#1f0c0c;}
.bb-cells i.on{background:var(--c,#58B368); box-shadow:0 0 6px var(--c,#58B368);}
.bb-introbar .bb-cells i{height:18px;}
.bb-arcade .bb-plate{border-bottom:2px solid #1e3a26; padding-bottom:12px;}
.bb-arcade.bb-p2 .bb-plate{border-bottom-color:#3a1e1e;}
.bb-arcade .bb-medal{background:#04170b; border:2px solid #1e3a26; border-radius:0;}
.bb-arcade .bb-pname{font-family:'Press Start 2P'; font-size:8px; color:#9BC46B;}
.bb-arcade.bb-p2 .bb-pname{color:var(--bbc);}
.bb-arcade .bb-eyebrow{font-family:'Press Start 2P'; font-size:9px; color:#FFD666; opacity:.9;
  animation:bbBlink 1s steps(1) infinite;}
@keyframes bbBlink{50%{opacity:0;}}
.bb-arcade .bb-rbg{stroke:#1e3a26;}
.bb-arcade .bb-rfg{stroke:#58B368; stroke-linecap:butt; transition:stroke-dashoffset .5s steps(3);}
.bb-arcade.bb-p2 .bb-rfg{stroke:var(--bbc);}
.bb-arcade .bb-rin small{font-family:'Press Start 2P'; font-size:6px; color:#4e6b52; opacity:1;}
.bb-arcade .bb-rin b{font-family:'VT323'; font-size:44px; color:#9BC46B;}
.bb-arcade.bb-p2 .bb-rin b{color:var(--bbc);}
.bb-arcade .bb-rin span{font-family:'VT323'; font-size:20px; color:#7ea886;}
.bb-arcade .bb-lifttag{font-family:'Press Start 2P'; font-size:8px; color:#4e6b52;}
.bb-arcade .bb-demand{font-family:'VT323'; font-size:64px; color:#58B368; text-shadow:0 0 10px rgba(88,179,104,.6);}
.bb-arcade.bb-p2 .bb-demand{color:var(--bbc); text-shadow:0 0 10px var(--bbc);}
.bb-arcade .bb-demand small{font-size:28px; color:#9BC46B;}
.bb-arcade .bb-menace{font-family:'VT323'; font-size:19px; color:#7ea886;}
.bb-arcade .bb-cta{background:#122a18; border:2px solid #58B368; color:#58B368;
  font-family:'Press Start 2P'; font-size:11px; border-radius:0;}
.bb-arcade.bb-p2 .bb-cta{background:#2a1212; border-color:var(--bbc); color:var(--bbc);}
.bb-arcade .bb-cta:active{background:#58B368; color:#04170b;}
.bb-arcade .bb-ghost{border:2px solid #1e3a26; color:#4e6b52; font-family:'Press Start 2P';
  font-size:8px; border-radius:0;}
.bb-arcade .bb-dead{animation:bbDie .8s steps(4) both;}
@keyframes bbDie{0%{opacity:1; transform:none;}100%{opacity:0; transform:translateY(20px) scaleY(.2);}}
.bb-arcade .bb-formname{font-family:'Press Start 2P'; font-size:22px; color:var(--bbc);
  margin-top:12px; animation:bbBlink .6s steps(1) 3; text-shadow:0 0 16px var(--bbc);}
.bb-arcade .bb-slain{font-family:'Press Start 2P'; font-size:38px; color:#E0654F;
  animation:bbBlink .5s steps(1) infinite; text-shadow:0 0 18px rgba(224,101,79,.8);}
.bb-arcade .bb-ringout{display:none;}
.bb-arcade .bb-xpcard{border:2px solid #1e3a26; background:#04170b; padding:22px 18px;}
.bb-arcade .bb-xptitle{font-family:'Press Start 2P'; font-size:13px; color:#FFD666;}
.bb-arcade .bb-xprow{font-family:'VT323'; font-size:21px; color:#9BC46B; font-weight:400;}
.bb-arcade .bb-xprow b{color:#58B368;}
.bb-arcade .bb-xptotal{font-family:'Press Start 2P'; font-size:22px; color:#58B368; margin:14px 0 4px;}
.bb-arcade .bb-lvllabs{font-family:'Press Start 2P'; font-size:7px; color:#9BC46B;}
.bb-arcade .bb-lvlbar{border-radius:0; background:#0c1f12; border:2px solid #1e3a26; height:16px;}
.bb-arcade .bb-lvlfill{border-radius:0; background:#58B368; transition:width 1s steps(12);}
.bb-arcade .bb-lvlxp{font-family:'VT323'; font-size:17px; color:#7ea886;}
.bb-arcade .bb-lvlup{font-family:'Press Start 2P'; font-size:11px; color:#FFD666;}

/* ---- SOULS ---- */
.bb-souls{background:#0B0B0D;}
.bb-souls.bb-p2{background:#0d0f0b;}
.bb-letter{position:absolute; left:0; right:0; height:9%; background:#000; z-index:6;}
.bb-letter.t{top:0;} .bb-letter.b{bottom:0;}
.bb-vig{position:absolute; inset:0; pointer-events:none;
  background:radial-gradient(90% 70% at 50% 45%, transparent 40%, rgba(0,0,0,.75) 100%);}
.bb-souls .bb-screen{padding-top:12vh;}
.bb-souls .bb-face.big{opacity:.85; animation:bbBreathe 5s ease-in-out infinite;}
@keyframes bbBreathe{0%,100%{transform:scale(1); opacity:.8;}50%{transform:scale(1.04); opacity:1;}}
.bb-souls .bb-name{font-family:'Cinzel'; font-weight:700; font-size:22px; letter-spacing:.24em;
  color:#E8E2D0; margin-top:18px; text-transform:uppercase;}
.bb-souls .bb-subt{font-family:'Cinzel'; font-size:10px; letter-spacing:.4em; color:#C9A75A;}
.bb-souls .bb-medal{width:40px; height:40px; font-size:19px; border:1px solid rgba(201,167,90,.35);
  border-radius:50%; background:transparent;}
.bb-souls .bb-pname{font-family:'Cinzel'; font-size:10px; letter-spacing:.34em; color:#E8E2D0;}
.bb-souls .bb-hpshell{height:8px; border-radius:0; background:rgba(255,255,255,.06);
  border:1px solid rgba(201,167,90,.4); padding:1px; box-shadow:none;}
.bb-souls .bb-hpshell::after{display:none;}
.bb-souls .bb-hpfill{border-radius:0; background:linear-gradient(90deg,#6e1414,#a32222);
  transition:width .5s ease;}
.bb-souls.bb-p2 .bb-hpfill{background:linear-gradient(90deg,var(--bbd),var(--bbc));}
.bb-souls .bb-hpchip{border-radius:0; background:#C9A75A; opacity:.55; inset:1px auto 1px 1px;}
.bb-souls .bb-eyebrow{font-family:'Cinzel'; letter-spacing:.6em; color:#C9A75A; opacity:.9;}
.bb-souls .bb-rbg{stroke-width:4;}
.bb-souls .bb-rfg{stroke:#C9A75A; stroke-width:4;}
.bb-souls.bb-p2 .bb-rfg{stroke:var(--bbc);}
.bb-souls .bb-rin small{font-family:'Cinzel'; letter-spacing:.4em; color:rgba(232,226,208,.45); opacity:1;}
.bb-souls .bb-rin b{font-family:'Cinzel'; font-weight:500; font-size:34px; color:#C9A75A;}
.bb-souls.bb-p2 .bb-rin b{color:var(--bbc);}
.bb-souls .bb-rin span{font-family:'Cinzel'; font-size:13px; letter-spacing:.14em; color:#E8E2D0;}
.bb-souls .bb-lifttag{font-family:'Cinzel'; letter-spacing:.5em; font-size:10px; color:#C9A75A;}
.bb-souls .bb-demand{font-family:'Cinzel'; font-weight:500; font-size:52px; color:#C9A75A;}
.bb-souls.bb-p2 .bb-demand{color:var(--bbc);}
.bb-souls .bb-demand small{font-size:22px; color:#E8E2D0;}
.bb-souls .bb-menace{font-family:'Cinzel'; font-size:12px; letter-spacing:.14em; color:rgba(232,226,208,.55);}
.bb-souls .bb-cta{background:linear-gradient(180deg, #1a1108 0%, #0c0804 100%);
  border:1px solid #C9A75A; color:#C9A75A; text-shadow:0 0 14px rgba(201,167,90,.4);
  box-shadow:inset 0 -8px 18px rgba(0,0,0,.7);}
.bb-souls.bb-p2 .bb-cta{border-color:var(--bbc); color:var(--bbc); text-shadow:0 0 16px var(--bbc);
  background:linear-gradient(180deg, #140c08 0%, #0a0504 100%);}
.bb-souls .bb-cta:active{background:rgba(201,167,90,.14);}
.bb-souls .bb-ghost{border:1px solid rgba(201,167,90,.3); color:rgba(201,167,90,.65);
  border-radius:2px; font-family:'Cinzel'; letter-spacing:.34em;}
.bb-souls .bb-dead{animation:bbAsh 1.4s ease both;}
@keyframes bbAsh{0%{opacity:.85; filter:grayscale(1);}
  100%{opacity:0; transform:translateY(-14px); filter:grayscale(1) blur(8px);}}
.bb-souls .bb-formname{font-family:'Cinzel Decorative'; font-weight:900; font-size:34px;
  letter-spacing:.18em; color:var(--bbc); margin-top:12px; text-transform:uppercase;
  animation:bbFelled 1.4s ease both; text-shadow:0 0 30px var(--bbc);}
.bb-souls .bb-slain{font-family:'Cinzel'; font-weight:700; font-size:50px; letter-spacing:.3em;
  color:#C9A75A; animation:bbFelled 2s ease both; text-shadow:0 0 34px rgba(201,167,90,.5);}
@keyframes bbFelled{0%{opacity:0; letter-spacing:.7em; filter:blur(6px);}
  100%{opacity:1; letter-spacing:.3em; filter:blur(0);}}
.bb-slainsub{font-family:'Cinzel'; font-size:11px; letter-spacing:.4em; color:rgba(232,226,208,.55);
  margin-top:14px; animation:bbFade 1.4s ease .8s both;}
.bb-souls .bb-ringout{border-color:#C9A75A;}
.bb-souls .bb-xptitle{font-family:'Cinzel'; font-weight:700; font-size:16px; letter-spacing:.3em; color:#C9A75A;}
.bb-souls .bb-xprow{font-family:'Cinzel'; font-size:13px; letter-spacing:.12em; color:#E8E2D0;
  border-bottom:1px solid rgba(201,167,90,.2); font-weight:400;}
.bb-souls .bb-xprow b{color:#C9A75A;}
.bb-souls .bb-xptotal{font-family:'Cinzel'; font-weight:700; font-size:44px; color:#C9A75A; margin:16px 0 4px;}
.bb-souls .bb-lvllabs{font-family:'Cinzel'; letter-spacing:.24em; font-size:9px; color:#E8E2D0;}
.bb-souls .bb-lvlbar{border-radius:0; height:8px; background:rgba(255,255,255,.06);
  border:1px solid rgba(201,167,90,.4); padding:1px;}
.bb-souls .bb-lvlfill{border-radius:0; background:#C9A75A;}
.bb-souls .bb-lvlup{font-family:'Cinzel'; font-weight:700; letter-spacing:.3em; font-size:15px; color:#E8E2D0;}
.bb-forge .bb-formname, .bb-forge .bb-name{color:var(--chalk);}
.bb-forge .bb-formname{color:var(--bbc);}
@media (prefers-reduced-motion: reduce){
  .bb *, .bb{animation-duration:.01s !important; transition-duration:.01s !important;}
}

/* session focus: only the workout (and any fight) exists */
.sesh-focus > :not(.day-card):not(.fi):not(.ws):not(.bb):not(.ws-resume):not(.cl){display:none !important;}
.sesh-focus > .day-card{margin-top:0;}
.sesh-focus > .fi{margin-top:0;}
/* per-boss palettes: deadlift keeps the earth-ember; bench shifts to a cold night sky */
.ue,.sky{position:relative; width:100%; height:158px;}
.ue-top{position:absolute; top:0; left:0; right:0; text-align:center; z-index:5;}
.ue-surf{font-family:'Anton'; font-size:16px; letter-spacing:.1em; color:var(--ember); text-shadow:0 0 16px rgba(255,138,60,.7);}
.ue-wyrm{
  position:absolute; left:50%; bottom:4px; margin-left:-34px; font-size:62px; z-index:1;
  opacity:calc(.25 + var(--p,0) * .75);
  filter:drop-shadow(0 0 calc(4px + var(--p,0) * 20px) rgba(255,138,60,calc(.2 + var(--p,0) * .7)));
  transform:translateY(calc(14px - var(--p,0) * 14px));
  transition:opacity .4s, transform .4s, filter .4s;
}
.ue-strata{position:absolute; left:4px; right:4px; bottom:0; height:104px; z-index:2; display:flex; flex-direction:column; gap:3px; pointer-events:none;}
.ue-strata i{flex:1; border-radius:4px; background:linear-gradient(180deg,#3a3126,#241f18); border:1px solid rgba(0,0,0,.4);}
.ue-strata i.gone{animation:crumble .6s ease-in forwards;}
.ue-strata i.shiver{animation:pebble .4s ease-in-out infinite;}
@keyframes crumble{to{opacity:0; transform:translateY(12px) scaleY(.2);}}
@keyframes pebble{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
.ue-fissure{
  position:absolute; left:8%; right:8%; bottom:44px; height:5px; z-index:3; border-radius:3px;
  background:linear-gradient(90deg,transparent,var(--ember),var(--gold),var(--ember),transparent);
  box-shadow:0 0 24px var(--ember); transform-origin:center; animation:fissureIn .5s cubic-bezier(.2,.8,.3,1);
}
@keyframes fissureIn{from{transform:scaleX(0);}}
.sky-slab{
  position:absolute; left:2px; right:2px; top:0; height:58px; z-index:3; border-radius:10px;
  background:linear-gradient(180deg,#3a4252,#232a36 60%,#1a202b);
  border:1px solid #465062; border-bottom:2px solid var(--steel);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  transform:translateY(calc(var(--p,0) * 78px));
  transition:transform .35s cubic-bezier(.3,.7,.4,1);
  box-shadow:0 12px 22px rgba(0,0,0,.5), inset 0 -6px 14px rgba(116,179,255,.15);
}
.fi-num.sm{font-size:30px;}
.sky-halt{font-family:'Anton'; font-size:13px; letter-spacing:.12em; color:var(--steel); text-shadow:0 0 14px rgba(116,179,255,.7);}
.sky-bolt{
  position:absolute; width:2px; top:calc(var(--p,0) * 78px + 60px); bottom:34px; z-index:2;
  background:linear-gradient(180deg,var(--steel),transparent);
  filter:drop-shadow(0 0 6px rgba(116,179,255,.9)); opacity:0; animation:bolt 1.3s linear infinite;
}
.sky-bolt.b1{left:30%;} .sky-bolt.b2{left:66%; animation-delay:.6s;}
@keyframes bolt{0%,86%,100%{opacity:0;}89%,93%{opacity:1;}}
.sky-bench{position:absolute; left:18%; right:18%; bottom:26px; height:8px; border-radius:4px; background:linear-gradient(180deg,#2C313B,#191c22); border:1px solid var(--line); z-index:1;}
.sky-lifter{position:absolute; left:0; right:0; bottom:32px; text-align:center; font-size:18px; opacity:.8; z-index:1;}
.fi.t-dl.fi-boss{border-color:rgba(255,138,60,.5); background:linear-gradient(180deg,var(--card),#17130e 85%);}
.fi.t-bp.fi-boss{border-color:rgba(116,179,255,.45); background:linear-gradient(180deg,#101522,var(--card) 80%);}
.fi.t-bp .fi-ingot{filter:hue-rotate(230deg) saturate(.85);}
.fi.t-bp .fi-bars i.hot{filter:hue-rotate(215deg);}
.fi.t-bp .fi-demon{filter:hue-rotate(210deg) saturate(.7) brightness(.9);}
.fi.t-bp.fi-gate{border-color:rgba(139,149,250,.5); background:radial-gradient(ellipse at 50% -40%, rgba(120,120,220,.12), var(--card) 60%);}
.fi.t-bp .fi-strike.s-gate{background:radial-gradient(circle at 35% 30%, #b9b0f5, #7d6fd4); color:#12101f;}
.fi-next{display:flex; justify-content:center; align-items:baseline; gap:10px; margin-top:9px; padding:8px 12px; border-radius:10px; background:var(--floor); border:1px solid var(--line);}
.fi-nlab{font-size:10px; color:var(--muted); letter-spacing:.14em;}
.fi-nkg{font-family:'Anton'; font-size:21px; color:var(--ember); text-shadow:0 0 14px rgba(255,138,60,.4);}
.fi-nsub{font-size:11px; font-weight:800; color:var(--chalk);}
.fi-nlab{font-weight:800;}
/* ===== the brutal kill ===== */
.boss-overlay.kill{animation:kArena 3.5s ease-out forwards;}
@keyframes kArena{0%{background:rgba(10,11,14,.6);}12%{background:radial-gradient(ellipse at center, rgba(120,30,20,.4), rgba(10,11,14,.97));}100%{background:radial-gradient(ellipse at center, rgba(60,45,14,.35), rgba(10,11,14,.97));}}
.k-flash{position:absolute; inset:0; background:#FFF3DF; opacity:0; animation:kFlash 3.5s linear forwards; pointer-events:none;}
@keyframes kFlash{0%,21%{opacity:0;}23%{opacity:.9;}26%{opacity:0;}33%{opacity:.9;}37%,100%{opacity:0;}}
.k-slash{position:absolute; width:160%; height:4px; top:50%; left:-30%; opacity:0; pointer-events:none;}
.k-slash.one{background:linear-gradient(90deg,transparent,var(--chalk),var(--gold),transparent); box-shadow:0 0 24px var(--gold); animation:kSlash1 3.5s linear forwards;}
.k-slash.two{height:3px; background:linear-gradient(90deg,transparent,var(--red),var(--chalk),transparent); box-shadow:0 0 20px var(--red); animation:kSlash2 3.5s linear forwards;}
@keyframes kSlash1{0%,18%{transform:translate(-130%,-130%) rotate(45deg); opacity:0;}22%{opacity:1;}30%,100%{transform:translate(130%,130%) rotate(45deg); opacity:0;}}
@keyframes kSlash2{0%,30%{transform:translate(130%,-130%) rotate(-45deg); opacity:0;}34%{opacity:1;}42%,100%{transform:translate(-130%,130%) rotate(-45deg); opacity:0;}}
.k-ring{position:absolute; left:50%; top:50%; width:170px; height:170px; margin:-85px 0 0 -85px; border-radius:50%; border:3px solid var(--gold); opacity:0; animation:kRing 3.5s cubic-bezier(.2,.8,.3,1) forwards; pointer-events:none;}
@keyframes kRing{0%,40%{transform:scale(.2); opacity:0;}46%{opacity:.95;}78%{transform:scale(3.2); opacity:0;}100%{opacity:0;}}
.k-quake{text-align:center; animation:kQuake 3.5s linear forwards; position:relative; z-index:2; max-width:340px; width:100%;}
@keyframes kQuake{0%,42%{transform:none;}45%{transform:translate(-9px,5px);}49%{transform:translate(10px,-7px);}53%{transform:translate(-10px,-5px);}57%{transform:translate(8px,6px);}61%,100%{transform:none;}}
.k-dragon{position:relative; height:86px;}
.k-half{position:absolute; left:50%; margin-left:-42px; font-size:70px; width:84px; display:inline-block;}
.k-half.l{clip-path:polygon(0 0,58% 0,42% 100%,0 100%); animation:kShake 3.5s linear forwards, kSplitL 3.5s cubic-bezier(.4,0,.9,.4) forwards;}
.k-half.r{clip-path:polygon(58% 0,100% 0,100% 100%,42% 100%); animation:kShake 3.5s linear forwards, kSplitR 3.5s cubic-bezier(.4,0,.9,.4) forwards;}
@keyframes kShake{0%,18%{transform:none;}22%{transform:translate(-7px,3px) rotate(-4deg);}28%{transform:translate(8px,-4px) rotate(5deg);}34%{transform:translate(-6px,2px) rotate(-3deg);}38%,100%{transform:none;}}
@keyframes kSplitL{0%,40%{opacity:1;}100%{transform:translate(-70px,110px) rotate(-38deg); opacity:0;}}
@keyframes kSplitR{0%,40%{opacity:1;}100%{transform:translate(74px,120px) rotate(42deg); opacity:0;}}
.kf-wyrm{position:absolute; left:50%; margin-left:-42px; font-size:70px; animation:kShake 3.5s linear forwards, kfDrag 3.5s ease-in forwards; filter:drop-shadow(0 0 16px var(--ember));}
@keyframes kfDrag{0%,40%{transform:translateY(0) rotate(0); opacity:1;}62%{transform:translateY(70px) rotate(14deg);}80%,100%{transform:translateY(150px) rotate(24deg); opacity:0;}}
.kf-fissure{position:absolute; left:6%; right:6%; bottom:-4px; height:5px; border-radius:3px; background:linear-gradient(90deg,transparent,var(--ember),var(--gold),var(--ember),transparent); box-shadow:0 0 26px var(--ember); transform-origin:center; animation:kfFiss 3.5s ease forwards;}
@keyframes kfFiss{0%,36%{transform:scaleX(0); opacity:0;}44%{transform:scaleX(1); opacity:1;}100%{opacity:.4;}}
.kf-fall{position:absolute; left:50%; margin-left:-42px; font-size:70px; animation:kfFall 3.5s cubic-bezier(.4,0,.7,.4) forwards; filter:drop-shadow(0 0 14px var(--steel));}
@keyframes kfFall{0%,32%{transform:translateY(-160px) rotate(-20deg); opacity:0;}40%{opacity:.95;}58%{transform:translateY(56px) rotate(8deg);}66%{transform:translateY(46px) rotate(4deg);}80%,100%{transform:translateY(56px) rotate(6deg); opacity:.25;}}
.k-slain{font-family:'Anton'; font-size:50px; line-height:1; animation:kSlam 3.5s cubic-bezier(.2,1.4,.3,1) forwards, kBlood 3.5s ease forwards;}
@keyframes kSlam{0%,42%{transform:scale(4); opacity:0; letter-spacing:.6em;}50%{transform:scale(.92); opacity:1; letter-spacing:.08em;}56%{transform:scale(1.06);}62%,100%{transform:scale(1); opacity:1;}}
@keyframes kBlood{0%,50%{color:var(--red); text-shadow:0 0 40px rgba(224,101,79,.8);}100%{color:var(--gold); text-shadow:0 0 34px rgba(255,214,102,.55);}}
.k-after{opacity:0; animation:kAfter 3.5s ease forwards;}
@keyframes kAfter{0%,62%{opacity:0; transform:translateY(10px);}80%,100%{opacity:1; transform:none;}}
.v-close{animation:pulse 1.6s infinite;}
.v-ready{animation:pulse 1.1s infinite;}
@keyframes bossSlain{0%,100%{text-shadow:0 0 6px rgba(255,214,102,.25);}50%{text-shadow:0 0 16px rgba(255,214,102,.6);}}
.target-hero{
  background:var(--floor); border:1px solid rgba(255,214,102,.4); border-radius:12px;
  padding:12px 14px; margin-bottom:10px;
}
.target-hero.hit{
  border-color:var(--gold);
  background:linear-gradient(135deg, rgba(255,214,102,.14), var(--floor) 65%);
}
.th-top{display:flex; justify-content:space-between; align-items:center;}
.th-name{font-family:'Anton'; font-size:14px; letter-spacing:.1em; text-transform:uppercase;}
.th-goal{font-family:'Anton'; font-size:34px; color:var(--gold); line-height:1.1; margin-top:2px; text-shadow:0 0 24px rgba(255,214,102,.25);}
.th-unit{font-size:16px; color:var(--muted);}
.th-bar{height:6px; background:var(--line); border-radius:3px; margin-top:10px; overflow:hidden;}
.th-bar i{display:block; height:100%; background:linear-gradient(90deg, var(--ember), var(--gold)); border-radius:3px; transition:width .4s ease;}
.th-status{font-size:11px; color:var(--muted); margin-top:6px; font-variant-numeric:tabular-nums;}
.th-status.conquered{color:var(--gold); font-weight:800; letter-spacing:.08em; margin-top:8px;}
.ps5-status{color:var(--chalk); opacity:.85; font-size:13px; font-weight:600;}
.ps5-meta{font-size:13px !important; color:var(--chalk) !important; opacity:.75; margin-top:8px;}
.rest-bar{
  position:fixed; bottom:calc(62px + env(safe-area-inset-bottom)); left:12px; right:12px;
  max-width:416px; margin:0 auto; display:flex; align-items:center; gap:10px;
  background:rgba(21,23,28,.97); border:1px solid var(--ember); border-radius:12px;
  padding:12px 16px; z-index:14; backdrop-filter:blur(6px);
}
.rest-bar-time{font-family:'Anton'; font-size:38px; line-height:1; color:var(--ember); font-variant-numeric:tabular-nums; min-width:96px; text-shadow:0 0 24px rgba(255,138,60,.35);}
.rest-bar-next{font-size:15px; font-weight:700; color:var(--chalk); flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.start-live{
  width:100%; background:var(--ember); color:#1a1206; border:none; border-radius:12px;
  font-family:'Anton'; font-size:17px; letter-spacing:.08em; padding:13px; cursor:pointer;
  box-shadow:0 0 26px rgba(255,138,60,.28);
}
.start-live:active{transform:scale(.98);}
.trend-legend{display:flex; gap:12px; font-size:11px; color:var(--muted); margin-top:8px; flex-wrap:wrap;}
.effect-line{font-size:12px; color:var(--chalk); margin-top:10px; line-height:1.6;}
.target-form{display:flex; gap:6px; margin-top:10px;}
.target-form .inp{flex:2; min-width:0; padding:10px; font-size:14px;}
.target-form .inp.num{flex:1;}
.pr-kg.hit{color:var(--gold);}

.card.photo-due{border-color:var(--ember);}
.photo-next{display:flex; align-items:center; justify-content:space-between; gap:8px;}
.photo-strip{display:flex; gap:8px; overflow-x:auto; margin-top:12px; padding-bottom:4px;}
.photo-item{position:relative; flex:0 0 auto;}
.photo-item img{width:84px; height:112px; object-fit:cover; border-radius:8px; border:1px solid var(--line); display:block;}
.photo-ph{width:84px; height:112px; border-radius:8px; border:1px solid var(--line); background:var(--floor);}
.photo-x{position:absolute; top:3px; right:3px; background:rgba(0,0,0,.55); border:none; color:#fff; border-radius:6px; font-size:10px; padding:2px 6px; cursor:pointer;}
.photo-date{font-size:9px; color:var(--muted); text-align:center; margin-top:3px;}
.link{background:none; border:none; color:var(--muted); text-decoration:underline; cursor:pointer; font-size:12px; padding:4px;}
.link.danger{color:var(--red);}
.err{color:var(--red);}

@media (prefers-reduced-motion: reduce){
  *{animation:none !important; transition:none !important;}
}
    ` });
  }
