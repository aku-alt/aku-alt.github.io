const {test}=require('node:test');const assert=require('node:assert/strict');
global.WorkoutCore=require('../src/workout-core.js');const {create}=require('../src/storage.js');
const raw=()=>({logs:{},completions:{},plans:{}});
const memory=()=>({persistent:true,map:new Map(),async get(k){return this.map.has(k)?{value:this.map.get(k)}:null;},async set(k,v){this.map.set(k,v);}});
test('legacy data is snapshotted, not overwritten; saves are serialized',async()=>{
 const store=memory(),original=JSON.stringify(raw());store.map.set('workout-streak:v1',original);const s=create(store);
 assert.deepEqual(await s.load(),raw());await Promise.all([s.save({...raw(),value:1}),s.save({...raw(),value:2})]);
 assert.equal(store.map.get('workout-streak:v1'),original);assert.equal(store.map.get('workout-streak:original-v1'),original);
 assert.equal(JSON.parse(store.map.get('workout-streak:v2')).value,2);assert.equal(JSON.parse(store.map.get('workout-streak:recovery-v2')).value,1);
});
test('corrupt data is never replaced on load; explicit recovery preserves raw copy',async()=>{
 const store=memory();store.map.set('workout-streak:v2','{broken');store.map.set('workout-streak:recovery-v2',JSON.stringify(raw()));const s=create(store);
 await assert.rejects(s.load());assert.equal(store.map.get('workout-streak:v2'),'{broken');const recovered=await s.recover();assert.equal(recovered.sessionSchema,2);
 assert.ok([...store.map.entries()].some(([k,v])=>k.startsWith('workout-streak:unreadable:')&&v==='{broken'));
});
test('unavailable storage blocks saves visibly',async()=>{
 const store=memory();store.persistent=false;const s=create(store);await s.load();await assert.rejects(s.save(raw()),/unavailable/);assert.equal(store.map.size,0);
});
test('a stale tab cannot overwrite another tab',async()=>{
 const store=memory(),a=create(store),b=create(store);await a.load();await b.load();await a.save(raw());await assert.rejects(b.save({...raw(),new:true}),/Another tab/);assert.equal(JSON.parse(store.map.get('workout-streak:v2')).new,undefined);
});
test('quota failures leave active data intact and allow retry',async()=>{
 const store=memory(),s=create(store);await s.load();await s.save(raw());const original=store.map.get('workout-streak:v2'),write=store.set;
 store.set=async()=>{throw Error('Quota exceeded');};await assert.rejects(s.save({...raw(),new:true}),/Quota/);assert.equal(store.map.get('workout-streak:v2'),original);
 store.set=write;await s.save({...raw(),new:true});assert.equal(JSON.parse(store.map.get('workout-streak:v2')).new,true);
});
test('cross-tab lock serializes simultaneous saves, so a stale writer is rejected',async()=>{
 const store=memory();let lock=Promise.resolve();store.withLock=fn=>{const work=lock.then(fn);lock=work.catch(()=>{});return work;};
 const a=create(store),b=create(store);await a.load();await b.load();const outcomes=await Promise.allSettled([a.save({...raw(),writer:'a'}),b.save({...raw(),writer:'b'})]);
 assert.deepEqual(outcomes.map(x=>x.status),['fulfilled','rejected']);assert.equal(JSON.parse(store.map.get('workout-streak:v2')).writer,'a');
});
