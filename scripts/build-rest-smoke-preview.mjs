// Synthetic in-memory fixture; never mounts the storage-owning app controller.
import {readFileSync,writeFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const fixture=`
function RestSmokePreview(){
 const [start]=import_react41.useState(Date.now()-25000);
 const [now,setNow]=import_react41.useState(Date.now());
 const [restEnd,setRestEnd]=import_react41.useState(start+90000);
 const [log,setLog]=import_react41.useState({split:'PUSH',workoutName:'Push',exercises:[{name:'Cable Fly',sets:[{done:true,doneAt:start,kg:10,reps:12},{done:false,kg:10,reps:12},{done:false,kg:10,reps:12}]}]});
 import_react41.useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),200);return()=>clearInterval(id);},[]);
 return import_jsx_runtime.jsxs(import_jsx_runtime.Fragment,{children:[import_jsx_runtime.jsx(Style,{}),import_jsx_runtime.jsx(WorkoutSession,{log,now,restEnd,restTotal:90,readyAt:null,splitName:'Push',unit:'kg',onLog:()=>{},onSkipRest:()=>setRestEnd(null),onFinish:()=>{},onClose:()=>{},onRename:()=>{},onRenameWorkout:()=>{},onAdd:()=>{},recentNames:[],onMobilityOff:()=>setLog({...log,restMobilityOff:true})})]});
}
`;
const source=['src/workout-core.js','src/storage.js','src/mobility-library.js','src/mobility.js','src/mobility-art.js','src/app.js'].map(read).join('\n');
writeFileSync('rest-smoke-preview.html',read('src/shell-start.txt')+source+fixture+read('src/shell-end.txt').replace('createElement(WorkoutStreak)','createElement(RestSmokePreview)'));
console.log('Built isolated actual-component rest preview. No history is read or written.');
