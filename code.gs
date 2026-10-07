/*******************************************************
 * SIPERAWAN TRANTIB — Backend Google Apps Script
 * Satpol PP Kabupaten Badung
 * Backend otomatis: Spreadsheet aktif menjadi sumber data.
 *******************************************************/
var SHEET_NAME='TRANTIB';
var FOLDER_NAME='FOTO_TRANTIB';
var HEAD=['id','tanggal','jam','zona','lat','lng','jenis','sumber','dampak','berulang','deskripsi','status','foto','petugas','updatedAt'];
var TYPES={
 'Tertib Jalan dan Keselamatan Pejalan Kaki':1,
 'Tertib Jalur Hijau, Taman dan Tempat Umum':1,
 'Tertib Sungai, Saluran Air dan Kawasan Pesisir':1,
 'Tertib Lingkungan':1,
 'Tertib Bangunan':1,
 'Tertib Usaha Pariwisata':1,
 'Tertib Sosial':1,
 'Tertib Kependudukan':1
};
var ALIAS={
 'PKL':'Tertib Jalan dan Keselamatan Pejalan Kaki','Reklame':'Tertib Jalur Hijau, Taman dan Tempat Umum','Bangunan':'Tertib Bangunan','Kerumunan':'Tertib Sosial','Fasilitas Umum':'Tertib Jalur Hijau, Taman dan Tempat Umum','Miras/Karaoke':'Tertib Usaha Pariwisata','Kebisingan':'Tertib Lingkungan','Lainnya':'Tertib Sosial'
};

function doGet(){
  return HtmlService.createTemplateFromFile('index').evaluate()
    .setTitle('SIPERAWAN TRANTIB — Satpol PP Kabupaten Badung')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function setup(){
  var sh=sheet_();
  sh.getRange(1,1,1,HEAD.length).setValues([HEAD]).setFontWeight('bold').setBackground('#f0b429').setFontColor('#1a1204');
  sh.setFrozenRows(1);sh.autoResizeColumns(1,HEAD.length);
  normalizeSheet_();
  return {ok:true,sheet:SHEET_NAME,count:rows_().length};
}
function sheet_(){var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss.getSheetByName(SHEET_NAME);if(!sh)sh=ss.insertSheet(SHEET_NAME);if(sh.getLastRow()===0)sh.appendRow(HEAD);else sh.getRange(1,1,1,HEAD.length).setValues([HEAD]);return sh;}
function folder_(){var it=DriveApp.getFoldersByName(FOLDER_NAME);return it.hasNext()?it.next():DriveApp.createFolder(FOLDER_NAME);}
function dateStr_(v){if(v instanceof Date)return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd');return String(v||'').slice(0,10);}
function timeStr_(v){if(v instanceof Date)return Utilities.formatDate(v,Session.getScriptTimeZone(),'HH:mm');return String(v||'00:00').slice(0,5);}
function normalizeType_(v){var x=String(v||'').trim();return TYPES[x]?x:(ALIAS[x]||'Tertib Sosial');}
function rows_(){var sh=sheet_(),last=sh.getLastRow();if(last<2)return [];var v=sh.getRange(2,1,last-1,HEAD.length).getValues();return v.filter(function(r){return r[0]!==''&&r[0]!==null;}).map(function(r){var o={};HEAD.forEach(function(k,i){o[k]=r[i];});o.tanggal=dateStr_(o.tanggal);o.jam=timeStr_(o.jam);o.lat=Number(o.lat)||0;o.lng=Number(o.lng)||0;o.jenis=normalizeType_(o.jenis);o.dampak=Math.max(1,Math.min(3,Number(o.dampak)||1));o.berulang=o.berulang===true||/^(true|ya|1)$/i.test(String(o.berulang));o.status=['Laporan Masuk','Terverifikasi','Dalam Proses','Selesai','Pemantauan'].indexOf(String(o.status))>=0?String(o.status):'Laporan Masuk';return o;});}
function normalizeSheet_(){var sh=sheet_(),data=rows_();if(!data.length)return 0;var out=data.map(rowOf_);sh.getRange(2,1,out.length,HEAD.length).setValues(out);return out.length;}
function apiGet(action){
  setup();
  if(action==='ping')return {ok:true,time:new Date().toISOString(),sheet:SHEET_NAME};
  var data=rows_();return {ok:true,count:data.length,incidents:data};
}
function save_(i){
  i=i||{};i.id=String(i.id||('TRT-'+new Date().getTime()));i.tanggal=dateStr_(i.tanggal);i.jam=timeStr_(i.jam);i.jenis=normalizeType_(i.jenis);i.dampak=Math.max(1,Math.min(3,Number(i.dampak)||1));i.berulang=i.berulang===true||/^(true|ya|1)$/i.test(String(i.berulang));i.status=['Laporan Masuk','Terverifikasi','Dalam Proses','Selesai','Pemantauan'].indexOf(String(i.status))>=0?String(i.status):'Laporan Masuk';
  if(i.foto&&String(i.foto).indexOf('data:')===0){try{var m=String(i.foto).match(/^data:(image\/\w+);base64,(.+)$/);if(m){var file=folder_().createFile(Utilities.newBlob(Utilities.base64Decode(m[2]),m[1],i.id+'.jpg'));file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);i.foto='https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w800';}}catch(e){i.foto='';}}
  var sh=sheet_(),all=rows_(),idx=-1;for(var k=0;k<all.length;k++)if(String(all[k].id)===i.id){idx=k;break;}
  if(idx>=0)sh.getRange(idx+2,1,1,HEAD.length).setValues([rowOf_(i)]);else sh.appendRow(rowOf_(i));
  return {ok:true,foto:i.foto||''};
}
function apiPost(b){
  setup();b=b||{};
  if(b.action==='save')return save_(b.incident);
  if(b.action==='delete'){var sh=sheet_(),all=rows_();for(var k=0;k<all.length;k++)if(String(all[k].id)===String(b.id)){sh.deleteRow(k+2);break;}return {ok:true};}
  if(b.action==='bulk'){var sh2=sheet_();sh2.clearContents();sh2.getRange(1,1,1,HEAD.length).setValues([HEAD]);var a=b.incidents||[];if(a.length){var out=a.map(rowOf_);sh2.getRange(2,1,out.length,HEAD.length).setValues(out);}return {ok:true,count:a.length};}
  if(b.action==='seed'){return seedSheet_();}
  return {ok:false,error:'aksi tidak dikenal'};
}
function rowOf_(i){return HEAD.map(function(k){var v=i[k];if(k==='tanggal')return dateStr_(v);if(k==='jam')return timeStr_(v);if(k==='jenis')return normalizeType_(v);return v===undefined||v===null?'':v;});}
function seedSheet_(){
  var sh=sheet_();var all=rows_();if(all.length)return {ok:true,count:all.length,created:false};
  var zones=[['Kuta',-8.7135,115.1793],['Legian',-8.6889,115.1673],['Seminyak',-8.6726,115.1580],['Canggu',-8.6478,115.1385],['Dalung',-8.6610,115.1468],['Jimbaran',-8.7877,115.1683],['Benoa',-8.8208,115.2060],['Tanjung Benoa',-8.7677,115.2298],['Mengwi',-8.5876,115.2056],['Sempidi',-8.6006,115.1895],['Abiansemal',-8.5530,115.2050],['Petang',-8.4460,115.1790]];
  var types=Object.keys(TYPES),src=['Hasil Patroli','Pengaduan Masyarakat','Laporan Petugas','Hasil Penertiban','Kegiatan Pengawasan'],out=[],now=new Date(),id=1001;
  for(var d=0;d<90;d++){var dt=new Date(now);dt.setHours(0,0,0,0);dt.setDate(dt.getDate()-d);for(var j=0;j<3+(d%9===0?2:0);j++){var z=zones[(d*3+j*5)%zones.length],t=types[(d+j)%types.length],hh=7+((d*3+j*2)%15),mm=(j*17+d)%60;out.push(['TRT-'+(id++),Utilities.formatDate(dt,Session.getScriptTimeZone(),'yyyy-MM-dd'),('0'+hh).slice(-2)+':'+('0'+mm).slice(-2),z[0],z[1]+((j%3)-1)*.002,z[2]+((j%4)-1)*.002,t,src[(d+j)%src.length],1+((d+j)%3),j%4===0,'Data sampling untuk pengujian SIPERAWAN TRANTIB.',d<7?'Dalam Proses':d<21?'Pemantauan':'Selesai','', 'Petugas Sampling',new Date().toISOString()]);}}
  sh.getRange(2,1,out.length,HEAD.length).setValues(out);return {ok:true,count:out.length,created:true};
}
function tambahDataSampling(){return seedSheet_();}
function include(filename){return HtmlService.createHtmlOutputFromFile(filename).getContent();}
