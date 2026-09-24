// Optional movement prompts, never training prescriptions or longevity scores.
var RestMobility = (() => {
  const library=typeof MobilityLibrary!=='undefined'?MobilityLibrary:require('./mobility-library.js');
  const movements=Object.fromEntries(Object.entries(library).map(([id,item])=>[id,{...item,dose:item.bilateral?'20 seconds, gently':'10 seconds each side'}]));
  const shortCues=Object.fromEntries(Object.entries(movements).map(([id,item])=>[id,item.cue]));
  const lower=['hip-flexor','figure-four','adductor','hamstring','quad','calf-wall','soleus-wall'];
  const pools={PUSH:lower,PULL:['calf-wall','soleus-wall','hip-flexor','figure-four','adductor','hamstring','quad'],LEGS:['open-book','lat-reach','doorway-chest','cross-body','triceps','cat-cow','wrist-flexor','neck-side']};
  const excluded = /\b(abs?|abdominals?|core|planks?|crunch(?:es)?|sit.?ups?|leg raises?|knee raises?|russian twist|wood.?chop|pallof|dead.?bug|mountain climber|cardio|running|treadmill|cycling|bike|rowing|elliptical|stair|burpees?|jump rope)\b/i;
  const demanding = /deadlift|\brdl\b|squat|leg press|lunge|split squat|bench press|overhead press|shoulder press|military press|barbell row|bent.?over row|clean|snatch|good morning|farmer|carry|shrug/i;
  const familiar = /press|fly|flies|raise|extension|pushdown|curl|pull.?up|chin.?up|pulldown|pull.down|row\b|dip\b|hamstring|calf/i;
  function latest(log) {
    let found = null;
    for(const exercise of log?.exercises || []) for(const set of exercise.sets || []) {
      if(set.done === true && Number.isFinite(set.doneAt) && (!found || set.doneAt > found.set.doneAt)) found={exercise,set};
    }
    return found;
  }
  function plan({log,nextExercise,restEnd,restTotal,now,offset=0,battle=false}) {
    const split=String(log?.split || '').toUpperCase();
    const last=latest(log);
    // A restored or manually started timer must not guess its completed-set context.
    if(!pools[split] || battle || !last || !(restEnd > now) || !Number.isFinite(restTotal))return null;
    const start=restEnd-restTotal*1000;
    if(Math.abs(start-last.set.doneAt)>5000)return null;
    if(excluded.test(last.exercise.name) || excluded.test(nextExercise?.name || ''))return null;
    const recover=reason=>({kind:'recovery',reason});
    if(log.restMobilityOff)return recover('Mobility is off for this workout. Let your breathing settle.');
    if(restTotal<90)return recover('Short break: use this time to recover and prepare for your next set.');
    if(!nextExercise)return recover('Choose your next exercise first. Keep this break for recovery.');
    const names=[last.exercise.name,nextExercise.name];
    if(names.some(n=>demanding.test(n)) || last.set.reps<=5 || nextExercise.sets?.find(s=>!s.done)?.reps<=5)
      return recover('Demanding lift ahead or just completed. Keep this break for recovery.');
    if(names.some(n=>!familiar.test(n)))return recover('Unrecognised exercise: keep this break for recovery.');
    if(names.some(n=>(/leg |hamstring|calf|hip /i.test(n))!==(split==='LEGS')))
      return recover('Exercise and routine differ: keep this break for recovery.');
    if(log.mixedWorkout)return recover('Mixed workout: keep this break for recovery.');
    const count=(log.exercises || []).filter(e=>!excluded.test(e.name)).reduce((n,e)=>n+(e.sets || []).filter(s=>s.done===true).length,0);
    const pool=pools[split], id=pool[((Math.max(1,count)-1+Math.max(0,offset))%pool.length)];
    return {kind:'movement',id,...movements[id],shortCue:shortCues[id],pool:[...pool],seconds:20,waitUntil:start+20000,finishBy:restEnd-20000};
  }
  function choose(plan,id){
    if(!plan || plan.kind!=='movement' || !movements[id])return plan;
    return {...plan,id,...movements[id],shortCue:shortCues[id],kind:plan.pool.includes(id)?'movement':'deferred'};
  }
  function phase(plan,now,startedAt=null,dismissed=false) {
    if(!plan)return 'hidden';
    if(plan.kind==='recovery' || dismissed)return 'recovery';
    if(plan.kind==='deferred')return 'deferred';
    if(now>=plan.finishBy)return 'prepare';
    if(startedAt!==null && now>=startedAt+plan.seconds*1000)return 'done';
    if(startedAt!==null)return 'moving';
    if(now<plan.waitUntil)return 'settle';
    if(now+plan.seconds*1000>plan.finishBy)return 'prepare';
    return 'ready';
  }
  return {movements,shortCues,pools,plan,choose,phase,latest};
})();
if(typeof module!=='undefined' && module.exports)module.exports=RestMobility;
