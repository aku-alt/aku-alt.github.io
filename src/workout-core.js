// Pure, dependency-free workout rules. Shared by the browser and regression tests.
var WorkoutCore = (() => {
  const copy = value => JSON.parse(JSON.stringify(value));
  const key = name => String(name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const idFor = name => 'exercise:' + encodeURIComponent(key(name));
  const loadType = ex => ex.loadType || (/chin.?up|pull.?up|push.?up|dip\b/i.test(ex.name)?'bodyweight':'external');
  const volume = exs => exs.filter(e=>loadType(e)!=='assisted').flatMap(doneSets).reduce((n,s)=>n+s.kg*s.reps,0);
  const uid = () => 'session:' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  const doneSets = ex => (ex?.sets || []).filter(s => s.done === true && Number.isFinite(s.kg) && s.kg >= 0 && Number.isFinite(s.reps) && s.reps > 0);
  const allSessions = logs => Object.entries(logs || {}).flatMap(([date, day]) => [
    ...(day.sessions || []).map(s => ({ ...s, date })), { ...day, date, sessions: undefined }
  ]).sort((a,b) => a.date.localeCompare(b.date) || (a.startedAt || 0) - (b.startedAt || 0));
  const flattenedLogs = logs => Object.fromEntries(Object.entries(logs || {}).map(([date, day]) => [date, {
    ...day, sessions: undefined, exercises: [...(day.sessions || []).flatMap(s => s.exercises || []), ...(day.exercises || [])]
  }]));
  const sameExercise = (a,b) => (a.exerciseId || idFor(a.name)) === (b.exerciseId || idFor(b.name));
  function history(ex, logs, { date, sessionId, beforeAt } = {}) {
    return allSessions(logs).reverse().filter(s => s.sessionId !== sessionId && (!date || s.date <= date) &&
      (!beforeAt || s.date < date || (s.startedAt || 0) < beforeAt)).flatMap(s => {
      const sets = (s.exercises || []).filter(e => sameExercise(e,ex) && loadType(e)===loadType(ex)).flatMap(doneSets);
      return sets.length ? [{ date:s.date, sessionId:s.sessionId, sets }] : [];
    });
  }
  function validate(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Backup data is not an object.');
    if (raw.sessionSchema > 2) throw Error('This backup needs a newer app version.');
    const safeObject = value => {if(!value || typeof value!=='object')return;for(const [k,v] of Object.entries(value)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Unsafe backup property.');safeObject(v);}};
    safeObject(raw);
    for (const field of ['logs','completions']) if (!raw[field] || typeof raw[field] !== 'object' || Array.isArray(raw[field])) throw Error('Missing or invalid ' + field + '.');
    const checkEx = ex => {
      if (!ex || typeof ex.name !== 'string' || !Array.isArray(ex.sets)) throw Error('Invalid exercise record.');
      for (const s of ex.sets) if (!s || !Number.isFinite(s.kg) || s.kg < 0 || !Number.isFinite(s.reps) || s.reps < 0 || (s.done != null && typeof s.done !== 'boolean')) throw Error('Invalid set record.');
    };
    for (const [date,day] of Object.entries(raw.logs)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !day || !Array.isArray(day.exercises)) throw Error('Invalid workout date or log.');
      if(day.sessions != null && !Array.isArray(day.sessions))throw Error('Invalid session archive.');
      for (const session of [day,...(day.sessions || [])]) {if(!session || !Array.isArray(session.exercises))throw Error('Invalid session.');session.exercises.forEach(checkEx);}
    }
    for (const plan of Object.values(raw.plans || {})) { if (!Array.isArray(plan)) throw Error('Invalid routine.'); plan.forEach(checkEx); }
    return raw;
  }
  function migrate(raw) {
    validate(raw);
    const next = copy(raw);
    next.sessionSchema = 2;
    if(raw.sessionSchema!==2) {
      next.legacyRewardSetsByDate=Object.fromEntries(Object.entries(raw.logs).map(([date,day])=>[date,(day.exercises||[]).reduce((n,ex)=>n+Math.max(0,(ex.skipped?ex.sets.filter(s=>s.done):ex.sets).length-doneSets(ex).length),0)]));
      next.legacyRewardSetCredit=Object.values(next.legacyRewardSetsByDate).reduce((n,v)=>n+v,0);
    }
    next.exerciseAliases ||= {};
    next.migrationWarnings ||= [];
    for (const [split,plan] of Object.entries(next.plans || {})) plan.forEach((ex,i) => {
      ex.exerciseId ||= idFor(ex.name);
      ex.planEntryId ||= 'plan:' + split + ':' + i;
      ex.loadType ||= /chin.?up|pull.?up|push.?up|dip\b/i.test(ex.name) ? 'bodyweight' : 'external';
    });
    for (const [date,day] of Object.entries(next.logs)) {
      for (const [index,s] of [day,...(day.sessions || [])].entries()) {
        s.sessionId ||= 'legacy:' + date + ':' + index;
        s.status ||= s.durationMin ? 'completed' : s.startedAt ? 'active' : 'legacy';
        for (const [ei,ex] of (s.exercises || []).entries()) {
          ex.exerciseId ||= idFor(ex.name);
          const matches = (next.plans?.[s.split] || []).filter(p => sameExercise(p,ex));
          if (matches.length === 1) ex.planEntryId ||= matches[0].planEntryId;
          // Undefined completion is ambiguous: retain every original field, never infer done.
          const unknown = ex.sets.some(set => set.done == null && !set.completionReview);
          if (unknown && !s.schemaVersion) {
            ex.sets.forEach(set => { if (set.done == null) set.completionReview = 'unknown'; });
            const issue = date + ':' + index + ':' + ei;
            if (!next.migrationWarnings.some(w => w.id === issue)) next.migrationWarnings.push({ id:issue,date,message:'Some older sets have no completion flag. Preserved for review; excluded from new performance statistics.' });
          }
        }
      }
    }
    if (!next.rotationQueue?.length) {
      const split = ['PUSH','PULL','LEGS'];
      const n = (Object.values(next.completions).filter(c => c.gym).length + (next.splitShift || 0)) % 3;
      next.rotationQueue = [...split.slice(n),...split.slice(0,n)];
    }
    return next;
  }
  function prepare(raw,date,split,mode='replace',now=Date.now()) {
    const next=copy(raw), old=next.logs[date] || {exercises:[]};
    const archived=[...(old.sessions || [])];
    let day=old;
    if (old.durationMin || old.status === 'completed' || (!old.schemaVersion && (old.exercises||[]).some(e=>e.sets.some(s=>s.completionReview==='unknown')))) {
      if ((old.exercises || []).length) {
        const archivedDay=copy(old); delete archivedDay.sessions; delete archivedDay.cardioMin; delete archivedDay.cardioKm;
        archived.push(archivedDay);
      }
      day={exercises:[],sessions:archived,cardioMin:old.cardioMin,cardioKm:old.cardioKm};
    }
    const previousDone=(day.exercises || []).filter(e=>doneSets(e).length).map(e=>({...e,sets:doneSets(e)}));
    if ((previousDone.length || mode==='add' && day.exercises?.length) && day.split && day.split!==split) {
      day.mixedWorkout=true;
    }
    const incoming=(next.plans?.[split] || []).map(p=>({...copy(p),sets:p.sets.map(s=>({kg:s.kg,reps:s.reps,done:false}))}));
    const base=mode==='add' || day.split===split ? day.exercises || [] : previousDone;
    // Preserve completed work; do not combine unrelated unstarted routines.
    day.exercises=[...base,...incoming.filter(e=>!base.some(b=>b.planEntryId && b.planEntryId===e.planEntryId))];
    day.sessionId ||= uid(); day.schemaVersion=2;
    day.split=split; day.workoutName=next.planNames?.[split] || split;
    day.startedAt ||= now; day.durationMin=null; day.status='active';
    day.exercises.forEach(e=>delete e.ss);
    day.exercises.forEach((e,i)=>{if(e.ssNext&&day.exercises[i+1]){e.ss='pair:'+i;day.exercises[i+1].ss=e.ss;}});
    next.logs[date]=day;
    return next;
  }
  function editExercise(raw,date,index,name,{kind='rename',future=true}={}) {
    const next=copy(raw),day=next.logs[date],ex=day?.exercises[index];
    name=String(name||'').trim(); if(!ex||!name) return next;
    const oldId=ex.exerciseId || idFor(ex.name);
    const plan=next.plans?.[day.split];
    const p=plan?.find(p=>p.planEntryId && p.planEntryId===ex.planEntryId) || plan?.find(p=>sameExercise(p,ex));
    if(kind==='rename') {
      const existing=Object.values(next.plans||{}).flat().find(p=>key(p.name)===key(name)&&!sameExercise(p,ex));
      if(existing)throw Error('That name belongs to another exercise. Choose Replace instead.');
      ex.exerciseId=oldId; ex.name=name;
      next.exerciseAliases ||= {}; next.exerciseAliases[key(name)]=oldId;
      if(future&&p) p.name=name;
    } else {
      const known=Object.values(next.plans||{}).flat().find(p=>key(p.name)===key(name));
      const replacementId=known?.exerciseId || next.exerciseAliases?.[key(name)] || idFor(name);
      const prior=history({name,exerciseId:replacementId},next.logs,{date,sessionId:day.sessionId,beforeAt:day.startedAt})[0];
      const loadType=known?.loadType || (/chin.?up|pull.?up|push.?up|dip\b/i.test(name)?'bodyweight':'external');
      const replacement={...ex,name,exerciseId:replacementId,loadType,persistFuture:future,skipped:false,sets:(prior?.sets || known?.sets || []).map(s=>({kg:s.kg,reps:s.reps,done:false}))};
      if(!replacement.sets.length) replacement.sets=[{kg:0,reps:8,done:false},{kg:0,reps:8,done:false},{kg:0,reps:8,done:false}];
      const completed=doneSets(ex);
      if(completed.length) {
        day.exercises[index]={...ex,sets:completed,skipped:true,planEntryId:undefined};
        day.exercises.splice(index+1,0,replacement);
      } else day.exercises[index]=replacement;
      if(future&&p) {p.name=name;p.exerciseId=replacementId;p.sets=replacement.sets.map(({kg,reps})=>({kg,reps}));p.loadType=loadType;}
    }
    return next;
  }
  function comparison(raw,date) {
    const current=raw.logs[date]; if(!current) return null;
    const currentEx=(current.exercises || []).filter(e=>doneSets(e).length);
    const sets=currentEx.flatMap(doneSets);
    const previous=allSessions(raw.logs).reverse().find(s=>s.sessionId!==current.sessionId && s.split===current.split &&
      (s.durationMin || s.status==='completed') && (s.date<date || (s.date===date && (s.startedAt||0)<(current.startedAt||0))) && (s.exercises||[]).some(e=>doneSets(e).length));
    const previousEx=(previous?.exercises || []).filter(e=>doneSets(e).length);
    const matched=currentEx.filter(e=>loadType(e)!=='assisted' && previousEx.some(p=>sameExercise(e,p)&&loadType(e)===loadType(p)));
    const matchedIds=new Set(matched.map(e=>e.exerciseId||idFor(e.name)));
    const compositionChanged=!!previous && (matched.length!==currentEx.length || matchedIds.size!==new Set(previousEx.map(e=>e.exerciseId||idFor(e.name))).size);
    return {split:current.workoutName || raw.planNames?.[current.split] || current.split || 'Workout',lifts:currentEx.length,sets:sets.length,
      vol:Math.round(volume(currentEx)),lastVol:previous&&matched.length?Math.round(volume(previousEx.filter(e=>matchedIds.has(e.exerciseId||idFor(e.name))))):null,
      compareVol:Math.round(volume(matched)),comparisonDate:previous?.date,compositionChanged,matchedLifts:matched.length,
      comparedSets:matched.flatMap(doneSets).length,previousSets:previousEx.filter(e=>matchedIds.has(e.exerciseId||idFor(e.name))).flatMap(doneSets).length};
  }
  function finish(raw,date,now=Date.now()) {
    const next=copy(raw),day=next.logs[date];
    if(!day?.startedAt || day.status==='completed') return next;
    if(!(day.exercises||[]).some(e=>doneSets(e).length)) throw Error('Log at least one completed set before finishing.');
    day.status='completed';day.durationMin=Math.max(1,Math.round((now-day.startedAt)/60000));day.finishedAt=now;
    for(const ex of day.exercises||[]) {
      if(ex.skipped || ex.persistFuture===false)continue;
      const p=next.plans?.[day.split]?.find(p=>p.planEntryId===ex.planEntryId && sameExercise(p,ex));
      if(!p?.sets.length || p.sets.some((target,i)=>!ex.sets[i]?.done || ex.sets[i].reps<target.reps))continue;
      p.sets.forEach((s,i)=>{s.kg=ex.sets[i].kg;});p.lastHit=date;
    }
    next.completions[date]={...(next.completions[date]||{}),gym:true};
    const queue=next.rotationQueue || ['PUSH','PULL','LEGS'];
    next.rotationQueue=queue.filter(s=>s!==day.split);if(!next.rotationQueue.length) next.rotationQueue=['PUSH','PULL','LEGS'];
    return next;
  }
  function progression(ex, sessions, inc=2.5) {
    const target={sets:ex.sets||3,low:ex.repLow??ex.reps??8,high:ex.repHigh??ex.reps??8};
    inc=Number.isFinite(inc)&&inc>0?inc:2.5;
    const evaluate = session => {
      const done=doneSets(session).filter(s=>s.rest==null && s.reps<=100);
      if(!done.length) return null;
      const w=ex.loadType==='assisted'?Math.min(...done.map(s=>s.kg)):Math.max(...done.map(s=>s.kg));
      const work=done.filter(s=>Math.abs(s.kg-w)<1e-6).slice(0,target.sets);
      return {w,count:work.length,minReps:Math.min(...work.map(s=>s.reps))};
    };
    const hist=sessions.map(evaluate).filter(Boolean),last=hist[0];
    if(!last) return {state:'new',kg:ex.kg,inc,target,msg:'Log completed sets to start tracking.'};
    if(last.count<target.sets) return {state:'hold',kg:last.w,inc,target,msg:`Finish all ${target.sets} working sets to gauge progress.`};
    if(last.minReps>=target.high) return {state:'advance',kg:ex.loadType==='assisted'?Math.max(0,last.w-inc):last.w+inc,inc,target,msg:ex.loadType==='assisted'?`All target reps completed. Consider ${inc} kg less assistance.`:`All ${target.sets} target sets completed. Consider adding ${inc} kg; you can keep the current weight.`};
    if(ex.loadType==='assisted') return {state:'hold',kg:last.w,inc,target,msg:'Keep the same assistance and work toward your target reps.'};
    const fails=hist.findIndex(s=>s.w<last.w||s.count<target.sets||s.minReps>=target.low);
    const failCount=fails<0?hist.length:fails;
    if(last.minReps<target.low&&failCount>=3&&last.w>0) return {state:'deload',kg:Math.max(0,Math.round(last.w*.9/inc)*inc),inc,target,msg:'Below the target range in three comparable sessions. Consider reducing the weight; this is optional.'};
    return {state:'hold',kg:last.w,inc,target,msg:`Keep the weight; aim for ${target.high} reps on each working set.`};
  }
  return {copy,key,idFor,uid,loadType,volume,doneSets,allSessions,flattenedLogs,sameExercise,history,validate,migrate,prepare,editExercise,comparison,finish,progression};
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WorkoutCore;
