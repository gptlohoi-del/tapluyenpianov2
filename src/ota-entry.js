/* Bundled by esbuild. Fallback (web/native-ota.bundle.js) works offline on PC. */
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
const updateText=document.getElementById('updateStatus');
const toast=text=>{if(updateText) updateText.textContent=text;};
let localVersion=null;
async function getLocalVersion(){
  if(localVersion)return localVersion;
  const response=await fetch('./build-info.json');
  localVersion=await response.json();return localVersion;
}
async function check(explicit=false){
  const base=window.PIANO_OTA_BASE;
  if(!Capacitor.isNativePlatform())return 'PWA: phiên bản mới được tải khi tải lại trang / mở lại ứng dụng.';
  if(!base)return 'Chưa có URL GitHub Pages: hãy tạo APK bằng GitHub Actions.';
  const local=await getLocalVersion();
  const response=await fetch(base+'ota/latest.json?at='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Không tải được latest.json (HTTP '+response.status+').');
  const manifest=await response.json();
  if(!manifest.url||!/^https:\/\//.test(manifest.url)||!/^([a-f\d]{64})$/i.test(manifest.sha256||''))throw new Error('Thông tin OTA không hợp lệ.');
  if(manifest.revision===local.revision||manifest.createdEpoch<=local.createdEpoch)
    return 'Đang dùng nội dung mới nhất.';
  toast('Đang kiểm tra gói cập nhật...');
  // Verify checksum of whole bundle before asking native plugin to install.
  const data=await fetch(manifest.url,{cache:'no-store'});
  if(!data.ok)throw new Error('Không tải được ZIP OTA.');
  const buffer=await data.arrayBuffer();
  const digest=await crypto.subtle.digest('SHA-256',buffer);
  const actual=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  if(actual.toLowerCase()!==manifest.sha256.toLowerCase())throw new Error('SHA256 không khớp. Hủy cập nhật.');
  toast('Đang tải nội dung OTA...');
  const bundle=await CapacitorUpdater.download({version:manifest.version,url:manifest.url});
  await CapacitorUpdater.next({id:bundle.id});
  toast('Đã tải nội dung mới. Mở lại ứng dụng sau khi đóng để thử bản mới.');
  return 'Đã tải nội dung mới; sẽ kích hoạt khi ứng dụng khởi động lại theo cơ chế của trình cập nhật.';
}
window.PianoOTA={check};
(async()=>{
  if(!Capacitor.isNativePlatform())return;
  try{await CapacitorUpdater.notifyAppReady();}catch(e){console.warn('OTA notifyAppReady',e);}
  try{const msg=await check();toast(msg);}catch(e){toast('OTA: '+e.message);console.warn('OTA check failed:',e);}
})();
