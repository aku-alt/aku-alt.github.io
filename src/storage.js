var WorkoutStorage = (() => {
  function create(storage) {
    const key='workout-streak:v2',legacy='workout-streak:v1';
    let expected=null,queue=Promise.resolve(),blocked=false;
    async function read(k) {const r=await storage.get(k);return r?.value ?? null;}
    async function load() {
      const current=await read(key);expected=current;
      if(current!==null) return JSON.parse(current);
      const previous=await read(legacy);if(previous===null)return null;
      const parsed=JSON.parse(previous);WorkoutCore.validate(parsed);
      if(storage.persistent===false)throw Error('Persistent storage is unavailable. No data has been changed.');
      await storage.set('workout-streak:original-v1',previous);
      return parsed;
    }
    function save(data) {
      const value=JSON.stringify(data);
      const commit=async()=>{
        if(blocked)throw Error('A different tab changed this data. Export your current session before reloading.');
        if(storage.persistent===false)throw Error('Browser storage is unavailable. Export before closing this page.');
        const actual=await read(key);
        if(actual!==expected){blocked=true;throw Error('Another tab changed your workouts. Export this session, then reload.');}
        if(expected!==null)await storage.set('workout-streak:recovery-v2',expected);
        await storage.set(key,value);expected=value;
      };
      const operation=queue.then(()=>storage.withLock?storage.withLock(commit):commit());
      queue=operation.catch(()=>{});return operation;
    }
    async function recover() {
      if(storage.persistent===false)throw Error('Persistent storage is unavailable.');
      for(const candidate of ['workout-streak:recovery-v2','workout-streak:original-v1',legacy]) {
        const value=await read(candidate);if(!value)continue;
        let parsed;try{parsed=JSON.parse(value);WorkoutCore.validate(parsed);}catch{continue;}
        const current=await read(key);
        if(current!==expected)throw Error('Storage changed in another tab. Reload before recovering.');
        if(current!==null)await storage.set('workout-streak:unreadable:'+Date.now(),current);
        const restored=WorkoutCore.migrate(parsed);await save(restored);return restored;
      }
      throw Error('No valid local recovery copy was found. Keep your exported backup and contact support before resetting anything.');
    }
    return {load,save,recover};
  }
  return {create};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WorkoutStorage;
