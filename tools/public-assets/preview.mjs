import { createPreview } from './preview.cjs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
export { createPreview };
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await createPreview();
  server.listen(4336,'127.0.0.1',()=>console.log('Local prototype preview: http://127.0.0.1:4336/'));
  server.on('error',error=>{console.error(error.message);process.exitCode=1;});
}
