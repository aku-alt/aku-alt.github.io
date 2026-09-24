const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../src/workout-core.js');
const set=(kg=50,reps=8,done=false)=>({kg,reps,done});
const ex=(name='Barbell Bench Press',kg=50)=>({name,sets:[set(kg),set(kg),set(kg)]});
const fresh=()=>C.migrate({logs:{},completions:{},plans:{PUSH:[ex()],PULL:[ex('Pull Up',0)],LEGS:[ex('Squat',80)]},rotationQueue:['LEGS','PUSH','PULL']});
const date='2026-09-24',now=1758708000000;
const start=(data=fresh(),split='PUSH',day=date,time=now)=>C.prepare(data,day,split,'replace',time);
function complete(data,day=date){data=C.copy(data);data.logs[day].exercises[0].sets.forEach(s=>s.done=true);return C.finish(data,day,now+600000);}

test('loading and swapping unstarted plans creates no completed sets or gym credit',()=>{
 let data=start();data=C.prepare(data,date,'LEGS');
 assert.equal(data.logs[date].exercises.length,1);assert.equal(data.logs[date].split,'LEGS');
 assert.equal(C.doneSets(data.logs[date].exercises[0]).length,0);assert.deepEqual(data.completions,{});
 assert.throws(()=>C.finish(data,date),/at least one/);
});
test('finishing an off-schedule workout leaves the pending suggestion intact',()=>{
 const data=complete(start());assert.equal(data.logs[date].split,'PUSH');assert.equal(data.completions[date].gym,true);
 assert.deepEqual(data.rotationQueue,['LEGS','PULL']);assert.deepEqual(C.finish(data,date),data);
});
test('rename updates routine by default and preserves stable identity and old history',()=>{
 let data=complete(start(fresh(),'PUSH','2026-09-20',now-4*86400000),'2026-09-20');data=start(data);
 const original=C.copy(data),oldId=data.logs[date].exercises[0].exerciseId;
 data=C.editExercise(data,date,0,'Bench Press (barbell)');
 assert.equal(data.plans.PUSH[0].name,'Bench Press (barbell)');assert.equal(data.logs[date].exercises[0].exerciseId,oldId);
 assert.equal(data.logs['2026-09-20'].exercises[0].name,'Barbell Bench Press');assert.deepEqual(original.logs['2026-09-20'],data.logs['2026-09-20']);
 assert.equal(C.history(data.logs[date].exercises[0],data.logs,{sessionId:data.logs[date].sessionId})[0].sets.length,3);
 data.logs[date].exercises[0].sets.forEach(s=>{s.kg=55;s.done=true;});data=C.finish(data,date,now+600000);
 assert.equal(data.plans.PUSH[0].sets[0].kg,55);
});
test('session-only rename leaves routine label alone',()=>{
 const data=C.editExercise(start(),date,0,'Today only',{kind:'rename',future:false});assert.equal(data.plans.PUSH[0].name,'Barbell Bench Press');
});
test('replacement preserves completed original work and never inherits unrelated weight',()=>{
 let data=start();data.logs[date].exercises[0].sets[0].done=true;
 data=C.editExercise(data,date,0,'Dumbbell Bench Press',{kind:'replace',future:true});
 assert.equal(data.logs[date].exercises.length,2);assert.equal(data.logs[date].exercises[0].sets.length,1);assert.equal(data.logs[date].exercises[0].name,'Barbell Bench Press');
 assert.notEqual(data.logs[date].exercises[1].exerciseId,data.logs[date].exercises[0].exerciseId);assert.equal(data.logs[date].exercises[1].sets[0].kg,0);
 assert.equal(data.plans.PUSH[0].name,'Dumbbell Bench Press');assert.equal(C.doneSets(data.logs[date].exercises[1]).length,0);
});
test('temporary replacement cannot overwrite future original loads on finish',()=>{
 let data=C.editExercise(start(),date,0,'Machine Chest Press',{kind:'replace',future:false});
 data.logs[date].exercises[0].sets.forEach(s=>{s.kg=100;s.done=true;});data=C.finish(data,date);
 assert.equal(data.plans.PUSH[0].name,'Barbell Bench Press');assert.equal(data.plans.PUSH[0].sets[0].kg,50);
});
test('rename cannot collide with another known exercise identity',()=>assert.throws(()=>C.editExercise(start(),date,0,'Squat'),/Replace/));
test('comparison uses latest actual split, not calendar rotation or newer Legs',()=>{
 let data=complete(start(fresh(),'PUSH','2026-09-20',now-4*86400000),'2026-09-20');
 data=complete(start(data,'LEGS','2026-09-22',now-2*86400000),'2026-09-22');
 data=start(data);data.logs[date].exercises[0].sets.forEach(s=>{s.done=true;s.kg=55;});
 const result=C.comparison(data,date);assert.equal(result.split,'PUSH');assert.equal(result.comparisonDate,'2026-09-20');assert.equal(result.lastVol,1200);assert.equal(result.compareVol,1320);
});
test('composition changes compare only common exercises',()=>{
 let data=complete(start(fresh(),'PUSH','2026-09-20',now-4*86400000),'2026-09-20');data=start(data);
 data.logs[date].exercises[0].sets[0].done=true;data.logs[date].exercises.push({...ex('Dips',20),sets:[set(20,10,true)]});
 const c=C.comparison(data,date);assert.equal(c.compositionChanged,true);assert.equal(c.compareVol,400);assert.equal(c.vol,600);assert.equal(c.matchedLifts,1);
});
test('second same-day session archives first; history and stats retain both',()=>{
 let data=complete(start());const first=C.copy(data.logs[date]);data=start(data,'PUSH',date,now+700000);
 assert.equal(data.logs[date].sessions.length,1);assert.equal(data.logs[date].sessions[0].sessionId,first.sessionId);
 assert.notEqual(data.logs[date].sessionId,first.sessionId);assert.equal(C.history(data.logs[date].exercises[0],data.logs,{date,sessionId:data.logs[date].sessionId,beforeAt:now+700000})[0].sets.length,3);
 data.logs[date].exercises[0].sets[0].done=true;assert.equal(C.comparison(data,date).comparisonDate,date);
 assert.equal(C.flattenedLogs(data.logs)[date].exercises.flatMap(C.doneSets).length,4);
});
test('reloading same active routine preserves unfinished sets without duplicate completed work',()=>{
 let data=start();data.logs[date].exercises[0].sets[0].done=true;data=C.prepare(data,date,'PUSH');
 assert.equal(data.logs[date].exercises.length,1);assert.equal(data.logs[date].exercises[0].sets.length,3);assert.equal(C.doneSets(data.logs[date].exercises[0]).length,1);
});
test('switch with completed work retains it; add retains planned work',()=>{
 let data=start();data.logs[date].exercises[0].sets[0].done=true;
 const replacement=C.prepare(data,date,'LEGS','replace');assert.equal(replacement.logs[date].exercises[0].sets.length,1);assert.equal(replacement.logs[date].mixedWorkout,true);
 const added=C.prepare(data,date,'LEGS','add');assert.equal(added.logs[date].exercises[0].sets.length,3);assert.equal(added.logs[date].mixedWorkout,true);
});
test('legacy migration is idempotent, keeps uncertain records and reward credit separate',()=>{
 const raw={logs:{[date]:{exercises:[{name:'Legacy',sets:[{kg:40,reps:8},set(40,8,true),set(40,8,false)]}]}},completions:{},plans:{}};
 const data=C.migrate(raw);assert.equal(data.migrationWarnings.length,1);assert.equal(C.doneSets(data.logs[date].exercises[0]).length,1);assert.equal(data.legacyRewardSetCredit,2);
 assert.equal(data.logs[date].exercises[0].sets[0].done,undefined);assert.deepEqual(C.migrate(data),data);assert.equal(raw.logs[date].exercises[0].sets[0].completionReview,undefined);
 const next=C.prepare(data,date,'PUSH');assert.equal(next.logs[date].sessions[0].exercises[0].sets.length,3);
});
test('equipment identities remain separate',()=>assert.equal(C.sameExercise(ex('Dumbbell Bench Press'),ex('Barbell Bench Press')),false));
test('bodyweight zero load counts as work, assistance progresses downward',()=>{
 const sessions=[{sets:[set(0,10,true),set(0,10,true),set(0,10,true)]}];
 assert.equal(C.progression({sets:3,repHigh:10,loadType:'bodyweight'},sessions).state,'advance');
 const assisted=C.progression({sets:3,repHigh:10,loadType:'assisted'},[{sets:[set(25,10,true),set(25,10,true),set(25,10,true)]}]);assert.equal(assisted.kg,22.5);
});
test('progression ignores planned sets and does not cherry-pick best working sets',()=>{
 assert.equal(C.progression({sets:3,kg:50},[{sets:[set(),set(),set()]}]).state,'new');
 assert.equal(C.progression({sets:3,repHigh:10},[{sets:[set(50,6,true),set(50,10,true),set(50,10,true),set(50,10,true)]}]).state,'hold');
});
test('malformed and newer backups are rejected before mutation',()=>{
 assert.throws(()=>C.migrate({logs:[],completions:{}}));assert.throws(()=>C.migrate({...fresh(),sessionSchema:3}));
 assert.throws(()=>C.migrate(JSON.parse('{"logs":{},"completions":{},"__proto__":{}}')));
 const data=fresh();data.logs[date]={exercises:[{name:'x',sets:[set(-1)]}]};assert.throws(()=>C.migrate(data));
});
test('assistance is not misreported as lifted volume or mixed with external-load history',()=>{
 const assisted={name:'Pull Up',loadType:'assisted',sets:[set(25,8,true)]};assert.equal(C.volume([assisted]),0);
 const logs={'2026-09-20':{sessionId:'a',exercises:[assisted]}};
 assert.equal(C.history({name:'Pull Up',loadType:'bodyweight'},logs).length,0);
 assert.equal(C.history(assisted,logs).length,1);
});
