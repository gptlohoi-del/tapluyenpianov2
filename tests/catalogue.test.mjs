import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
test('source songs contain both old and new versions; packaged JSZip offline',()=>{
 const files=fs.readdirSync(path.join(root,'songs'));
 assert(files.includes('viet tiep cau chuyen hoa binh.mxl'));
 assert(files.includes('viet-tiep-cau-chuyen-hoa-binh-ban-moi.mxl'));
 assert(fs.statSync(path.join(root,'web/vendor/jszip.min.js')).size>20000);
});
