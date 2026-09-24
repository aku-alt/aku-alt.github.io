import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
const read = p => readFileSync(p, 'utf8');
const html = read('src/shell-start.txt') + read('src/workout-core.js') + '\n' + read('src/storage.js') + '\n' + read('src/mobility-library.js') + '\n' + read('src/mobility.js') + '\n' + read('src/mobility-art.js') + '\n' + read('src/app.js') + read('src/shell-end.txt');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
new vm.Script(script); // Fail the build on any syntax error.
writeFileSync('streak.html', html);
console.log('Built and syntax-checked streak.html');
