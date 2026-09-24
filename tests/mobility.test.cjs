const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../src/mobility.js');
function fixture(split='PUSH',name='Lateral Raise',count=1){
 const ex={name,sets:[...Array.from({length:count},(_,i)=>({done:true,doneAt:100000-(count-1-i)*100000,reps:10,kg:10})),{done:false,reps:10,kg:10}]};
 return {log:{split,exercises:[ex]},nextExercise:ex,restEnd:190000,restTotal:90,now:125000};
}
test('mobility is only for actual PPL split; cardio and abs never get a card',()=>{
 for(const split of ['CARDIO','ABS','CORE','REST',''])assert.equal(M.plan(fixture(split)),null);
 for(const name of ['Ab Crunch','Cable Crunches','Hanging Leg Raise','Plank','Cycling','Cardio','Pallof Press'])assert.equal(M.plan(fixture('PUSH',name)),null);
 assert.equal(M.plan({...fixture(),battle:true}),null);
});
test('rotates a stable split-specific pool and offsets later workouts',()=>{
 for(const [split,name] of [['PUSH','Lateral Raise'],['PULL','Bicep Curl'],['LEGS','Leg Extension']]){
  const ids=M.pools[split].map((_,i)=>M.plan(fixture(split,name,i+1)).id);
  assert.deepEqual(ids,M.pools[split]);
  assert.equal(M.plan(fixture(split,name,ids.length+1)).id,ids[0]);
  assert.equal(M.plan({...fixture(split,name),offset:1}).id,ids[1]);
 }
});
test('heavy lifts, short rests, low reps, unknown and mixed exercises recover only',()=>{
 for(const name of ['Bench Press','Deadlift','Squat','Barbell Row','Custom Lift'])assert.equal(M.plan(fixture('PUSH',name)).kind,'recovery');
 assert.equal(M.plan({...fixture(),restTotal:45,restEnd:145000}).kind,'recovery');
 const f=fixture();f.log.exercises[0].sets[0].reps=3;assert.equal(M.plan(f).kind,'recovery');
 const mixed=fixture();mixed.log.mixedWorkout=true;assert.equal(M.plan(mixed).kind,'recovery');
 assert.equal(M.plan(fixture('PUSH','Leg Extension')).kind,'recovery');
 assert.equal(M.plan(fixture('LEGS','Bicep Curl')).kind,'recovery');
});
test('checks both last completed and upcoming exercise, not just the routine name',()=>{
 const f=fixture();f.nextExercise={name:'Squat',sets:[{reps:10}]};assert.equal(M.plan(f).kind,'recovery');
 f.nextExercise={name:'Ab Crunch'};assert.equal(M.plan(f),null);
 f.nextExercise=null;assert.equal(M.plan(f).kind,'recovery');
});
test('preserves recovery time at both ends, never extends or shortens rest',()=>{
 const f=fixture(),original=JSON.stringify(f),p=M.plan(f);
 assert.equal(M.phase(p,110000),'settle');assert.equal(M.phase(p,125000),'ready');
 assert.equal(M.phase(p,135000,125000),'moving');assert.equal(M.phase(p,145000,125000),'done');
 assert.equal(M.phase(p,160000),'prepare');assert.equal(M.phase(p,175000,160000),'prepare');
 assert.equal(M.phase(p,135000,null,true),'recovery');assert.equal(JSON.stringify(f),original);
});
test('expired, manual or ambiguous legacy timers do not invent prompts',()=>{
 assert.equal(M.plan({...fixture(),now:190000}),null);
 assert.equal(M.plan({...fixture(),restEnd:200000}),null);
 const f=fixture();delete f.log.exercises[0].sets[0].doneAt;assert.equal(M.plan(f),null);
});
test('workout opt-out survives serialisation and never changes performance data',()=>{
 const f=fixture();f.log.restMobilityOff=true;
 const restored=JSON.parse(JSON.stringify(f));assert.equal(M.plan(restored).kind,'recovery');assert.deepEqual(restored,f);
});
test('recovered timer and renamed display keep the same actual-split movement',()=>{
 const f=fixture();f.log.workoutName='My custom day';const p=M.plan(f);
 assert.deepEqual(M.plan(JSON.parse(JSON.stringify(f))),p);assert.equal(p.id,'hip-flexor');
});
test('all fifteen movements have local pose artwork, descriptive alt text and short cues',()=>{
  const A=require('../src/mobility-art.js');assert.equal(Object.keys(M.movements).length,15);
  assert.equal(new Set(Object.values(M.pools).flat()).size,15);
  for(const id of Object.keys(M.movements)){
  const html=A.render(id);assert.match(html,/<img class="ma-guide"/);assert.match(html,/alt="[^"]{15,}"/);assert.match(html,/width="960" height="720"/);assert.doesNotMatch(html,/<svg|<script|https:\/\//);assert.ok(M.shortCues[id].length<100);
  assert.ok(require('node:fs').statSync(require('node:path').join(__dirname,'..',A.assets[id])).size>10000);
  }
  assert.equal(A.render('not-a-movement'),'');
});
test('browsing preserves rest timing and defers stretches outside the actual split pool',()=>{
 const p=M.plan(fixture()),original=JSON.stringify(p);
 for(const id of Object.keys(M.movements)){
  const chosen=M.choose(p,id);
  assert.equal(chosen.waitUntil,p.waitUntil);assert.equal(chosen.finishBy,p.finishBy);assert.equal(chosen.seconds,20);
  assert.equal(chosen.kind,p.pool.includes(id)?'movement':'deferred');
  assert.equal(M.phase(chosen,125000),p.pool.includes(id)?'ready':'deferred');
 }
 assert.equal(JSON.stringify(p),original);assert.equal(M.choose(p,'unknown'),p);
 const another=M.choose(p,p.pool[1]);assert.equal(M.phase(another,145000,125000),'done');
});
test('real rest summary separates timer and next set without an SVG ring',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),source=fs.readFileSync(require.resolve('../src/app.js'),'utf8');
 const context={import_jsx_runtime:{jsx:(type,props)=>({type,...props}),jsxs:(type,props)=>({type,...props})}};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf('  function RestSummary('),source.indexOf('  function MobilityRest(')),context);
 const tree=context.RestSummary({restEnd:190000,restTotal:90,now:125000,nextValue:'10 kg × 12',nextName:'Cable Fly'});
 const json=JSON.stringify(tree);assert.match(json,/1:05/);assert.match(json,/10 kg × 12/);assert.match(json,/NEXT SET/);assert.match(json,/ws-rest-columns/);assert.doesNotMatch(json,/svg|circle|ring/);
 assert.match(JSON.stringify(context.RestSummary({restEnd:1,restTotal:90,now:2})),/0:00/);
});
test('actual workout component renders rest, mobility, recovery and next-set states',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),source=fs.readFileSync(require.resolve('../src/app.js'),'utf8');
 const element=(type,props)=>({type,...props});
 const c={__toESM:x=>x,require_jsx_runtime:()=>({jsx:element,jsxs:element,Fragment:'fragment'}),window:{storage:{get:async()=>null,set:async()=>{}}},WorkoutCore:require('../src/workout-core.js'),WorkoutStorage:require('../src/storage.js'),RestMobility:M,MobilityArt:require('../src/mobility-art.js'),import_react41:{useState:x=>[x,()=>{}],useEffect:()=>{},useRef:x=>({current:x})}};
 vm.createContext(c);vm.runInContext(source.slice(0,source.indexOf('  var BBBoundary')),c);
 vm.runInContext(source.slice(source.indexOf('  function RestSummary('),source.indexOf('  var BB_CIRC')),c);
 function resolve(node){if(Array.isArray(node))return node.map(resolve);if(!node||typeof node!=='object')return node;if(typeof node.type==='function')return resolve(node.type(node));return {...node,children:resolve(node.children)};}
 const f=fixture(),props={log:f.log,now:f.now,restEnd:f.restEnd,restTotal:f.restTotal,splitName:'PUSH',unit:'kg',recentNames:[],onSkipRest:()=>{},onClose:()=>{},onRenameWorkout:()=>{},onMobilityOff:()=>{}};
 const rest=JSON.stringify(resolve(c.WorkoutSession(props)));assert.match(rest,/REST REMAINING/);assert.match(rest,/10 kg × 10/);assert.match(rest,/Half-kneeling hip flexor/);assert.match(rest,/Start 20s/);assert.doesNotMatch(rest,/ws-ringwrap/);
 const work=JSON.stringify(resolve(c.WorkoutSession({...props,now:200000,restEnd:null})));assert.match(work,/REPS/);assert.doesNotMatch(work,/OPTIONAL MOBILITY|REST REMAINING/);
 const heavy=fixture('PUSH','Bench Press');const recovery=JSON.stringify(resolve(c.WorkoutSession({...props,log:heavy.log})));assert.match(recovery,/Recovery first/);assert.doesNotMatch(recovery,/Start 20s/);
 const cardio=fixture('CARDIO','Cycling');assert.doesNotMatch(JSON.stringify(resolve(c.WorkoutSession({...props,log:cardio.log}))),/OPTIONAL MOBILITY/);
});
