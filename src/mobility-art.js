// Original AI-created static pose guides, hosted with the app.
var MobilityArt=(()=>{
  const library=typeof MobilityLibrary!=='undefined'?MobilityLibrary:require('./mobility-library.js');
  const assets=Object.fromEntries(Object.keys(library).map(id=>[id,'assets/mobility-library-v2/'+id+'.jpg']));
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(id){
    if(!assets[id])return '';
    return '<img class="ma-guide" src="'+assets[id]+'" alt="'+escape(library[id].alt)+'" width="960" height="720" decoding="async">';
  }
  return {render,assets};
})();
if(typeof module!=='undefined' && module.exports)module.exports=MobilityArt;
