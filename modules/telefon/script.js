
const apps = [
  ["phone","📞","Telefon"],["messages","💬","Poruke"],["whatsapp","🟢","WhatsApp"],["signal","🔐","Signal"],
  ["gallery","🖼️","Galerija"],["notes","📝","Beleške"],["contacts","👥","Kontakti"],["files","📁","Datoteke"],
  ["chrome","🌐","Chrome"],["gmail","✉️","Gmail"],["camera","📷","Kamera"],["settings","⚙️","Podešavanja"]
];

const state={unlocked:false,history:[],discovered:new Set()};

const data={
 phone:[
  ["Nepoznat broj","+381 64 771 09 26","3 propuštena","21:47","missed"],
  ["Nebojša Janković","+381 63 210 844","odlazni · 2 min","20:16",""],
  ["Viktor Radovanović","+381 65 442 180","dolazni · 18 sek","19:42",""],
  ["Aca Slina","+381 62 909 144","propušten","18:05","missed"],
  ["Poručnik","Skriven broj","dolazni · 43 sek","23.04.",""]
 ],
 messages:[
  ["Milan — knjigovođa","Poslao sam ti izvod. Proveri stavku 48.","20:31"],
  ["Nepoznat broj","Nemoj večeras da ideš sam.","19:58"],
  ["Viktor R.","Sastanak se pomera. Kaldrma, 22:00.","17:14"],
  ["Aca","Javi se kad završiš.","16:02"]
 ],
 whatsapp:[
  {name:"Nebojša Janković",last:"Gde si? Nemoj da praviš problem.",time:"21:49",msgs:[
    ["them","Bale, gde si?","21:44"],["them","Nemoj da praviš problem.","21:45"],["me","Imam kopije svega.","21:46"],["them","Ne znaš s kim se igraš.","21:47"],["them","Gde si?","21:49"]
  ]},
  {name:"Viktor Radovanović",last:"Ništa ne šalji porukom.",time:"20:08",msgs:[
    ["them","Sastanak u Kaldrmi ostaje.","18:22"],["me","Nebojša dolazi?","18:24"],["them","Ništa ne šalji porukom.","20:08"]
  ]},
  {name:"Aca Slina",last:"Kasniš.",time:"18:43",msgs:[
    ["them","Kasniš.","18:43"],["me","Ne dolazim sam.","18:44"],["them","Kako hoćeš.","18:45"]
  ]}
 ],
 signal:[
  {name:"M",last:"Ako ti se ne javim do 22:30, otvori USB.",time:"21:12",msgs:[
    ["me","USB je spreman.","20:56"],["them","Šifra?","20:57"],["me","Ona koju smo dogovorili. KT25626.","20:58"],
    ["me","Ako ti se ne javim do 22:30, otvori USB.","21:12"],["them","A drugi kontejner?","21:13"],["me","MOST26.","21:14"]
  ]},
  {name:"P.",last:"Ne veruj čoveku sa značkom.",time:"20:41",msgs:[
    ["them","Ne veruj čoveku sa značkom.","20:41"],["them","Poručnik radi za njih.","20:41"],["me","Koji poručnik?","20:42"],["them","Ne mogu ovde.","20:43"]
  ]}
 ],
 contacts:[
  ["Nebojša Janković","+381 63 210 844","Balkan Construct Invest"],
  ["Viktor Radovanović","+381 65 442 180","Ministar finansija"],
  ["Aleksandar Ilić — Aca","+381 62 909 144","Obezbeđenje"],
  ["M.","Signal kontakt","Bez prezimena"],
  ["Poručnik","Skriven broj","Ne unositi pravo ime"]
 ],
 notes:[
  ["VAŽNO","MOST26\n\nNe veruj nikome.\nAko nestanem, USB i sveska moraju ostati zajedno.\nPoručnik zna za gradilište."],
  ["Sastanak","Kaldrma — 22:00\nViktor + Nebojša\nNe nositi originalna dokumenta."],
  ["Uplate","48 — BCI / konsultantske usluge\n73 — izvođač bez ugovora\n91 — gotovina"]
 ],
 files:[
  ["📄","isplate_april.xlsx","Izmenjeno danas · 84 KB"],
  ["📄","ugovor_aneks_4.pdf","Dokumenti · 1.2 MB"],
  ["🎙️","REC_20260423_2318.m4a","Snimci · 03:12"],
  ["🔒","EVIDENCE.enc","Zaštićeno · 16.8 MB"],
  ["🖼️","IMG_20260424_184422.jpg","Slike · 2.4 MB"]
 ],
 history:[
  "kako prijaviti korupciju anonimno",
  "šifrovanje usb diska windows",
  "balkan construct invest vlasnička struktura",
  "šta znači tender po hitnom postupku",
  "brisanje metapodataka sa fotografije"
 ]
};

const $=s=>document.querySelector(s);
const appGrid=$("#appGrid"), lock=$("#lockScreen"), home=$("#homeScreen"), appView=$("#appView"), content=$("#appContent");

apps.slice(0,12).forEach(([id,ico,label])=>{
 const b=document.createElement("button"); b.className="app-button"; b.dataset.app=id; b.innerHTML=`${ico}<span>${label}</span>`; appGrid.appendChild(b);
});
document.querySelectorAll("[data-app]").forEach(b=>b.addEventListener("click",()=>openApp(b.dataset.app)));


const CORRECT_PIN = "240426";
let enteredPin = "";
function updatePinDots(){document.querySelectorAll("#pinDots span").forEach((dot,i)=>dot.classList.toggle("filled",i<enteredPin.length));}
function unlockPhone(){lock.classList.remove("active");home.classList.add("active");state.unlocked=true;enteredPin="";updatePinDots();toast("Telefon otključan");}
document.querySelectorAll("#pinPad [data-digit]").forEach(btn=>btn.addEventListener("click",()=>{if(enteredPin.length>=6)return;enteredPin+=btn.dataset.digit;$("#pinError").textContent="";updatePinDots();if(enteredPin.length===6){setTimeout(()=>{if(enteredPin===CORRECT_PIN){unlockPhone()}else{$("#pinError").textContent="Pogrešan PIN";document.querySelector(".pin-dots").classList.add("shake");setTimeout(()=>document.querySelector(".pin-dots").classList.remove("shake"),300);enteredPin="";updatePinDots()}},180)}}));
$("#pinDelete").addEventListener("click",()=>{enteredPin=enteredPin.slice(0,-1);$("#pinError").textContent="";updatePinDots();});

$("#homeBtn").onclick=goHome;$("#navHome").onclick=goHome;$("#backBtn").onclick=goBack;$("#navBack").onclick=goBack;
$("#navRecent").onclick=()=>toast("Nema nedavno otvorenih aplikacija");

function goHome(){appView.classList.remove("active");lock.classList.remove("active");home.classList.add("active")}
function goBack(){if(state.history.length){const f=state.history.pop();f()}else goHome()}
function setApp(title,subtitle,html){home.classList.remove("active");lock.classList.remove("active");appView.classList.add("active");$("#appTitle").textContent=title;$("#appSubtitle").textContent=subtitle||"";content.innerHTML=html;content.scrollTop=0}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
function row(a,b,c,ico="•"){return `<div class="row"><div class="avatar">${ico}</div><div class="row-main"><b>${a}</b><small>${b}</small></div><div class="row-time">${c||""}</div></div>`}

function openApp(id){
 state.history=[];
 if(id==="phone")renderPhone();
 if(id==="messages")renderMessages();
 if(id==="whatsapp")renderChats("WhatsApp",data.whatsapp);
 if(id==="signal")renderChats("Signal",data.signal,true);
 if(id==="gallery")renderGallery();
 if(id==="notes")renderNotes();
 if(id==="contacts")renderContacts();
 if(id==="files")renderFiles();
 if(id==="chrome")renderChrome();
 if(id==="gmail")renderGmail();
 if(id==="camera")renderCamera();
 if(id==="settings")renderSettings();
}

function renderPhone(){
 setApp("Telefon","Nedavni pozivi",`<div class="section-title">Danas</div><div class="list">${data.phone.map(x=>row(x[0],`${x[1]} · ${x[2]}`,x[3],x[4]==="missed"?"!":"☎")).join("")}</div>`);
}
function renderMessages(){
 setApp("Poruke","4 razgovora",`<div class="list">${data.messages.map(x=>row(x[0],x[1],x[2],"💬")).join("")}</div>`);
}
function renderChats(title,items,secure=false){
 setApp(title,secure?"Šifrovane poruke":"Razgovori",`<div class="list">${items.map((x,i)=>`<div class="chat-row" data-i="${i}">${row(x.name,x.last,x.time,secure?"🔐":"●")}</div>`).join("")}</div>`);
 document.querySelectorAll(".chat-row").forEach(el=>el.onclick=()=>openChat(title,items,+el.dataset.i,secure));
}
function openChat(title,items,i,secure){
 const x=items[i];
 state.history.push(()=>renderChats(title,items,secure));
 setApp(x.name,secure?"Signal · end-to-end enkripcija":"poslednja aktivnost",`<div class="chat">${x.msgs.map(m=>`<div class="bubble ${m[0]}">${m[1]}<time>${m[2]}</time></div>`).join("")}</div>`);
 if(secure && i===0 && !state.discovered.has("codes")){state.discovered.add("codes");toast("Pronađene šifre za USB arhivu")}
}
function renderGallery(){
 const pics=[["🏗️","Gradilište"],["🍽️","Kaldrma"],["📄","Ugovor"],["🚘","Parking"],["👤","Nepoznato lice"],["🔢","Registracija"],["🏢","BCI"],["🧾","Uplata"],["🌉","Most"]];
 setApp("Galerija","9 fotografija",`<div class="gallery">${pics.map((p,i)=>`<div class="photo" data-i="${i}">${p[0]}<small>${p[1]}</small></div>`).join("")}</div>`);
 document.querySelectorAll(".photo").forEach(p=>p.onclick=()=>toast("Fotografija označena kao dokaz"));
}
function renderNotes(){
 setApp("Beleške",`${data.notes.length} beleške`,data.notes.map(n=>`<article class="note-card"><h3>${n[0]}</h3><p>${n[1]}</p></article>`).join(""));
}
function renderContacts(){
 setApp("Kontakti","5 kontakata",`<div class="list">${data.contacts.map((x,i)=>`<div class="contact-row" data-i="${i}">${row(x[0],x[2],"","👤")}</div>`).join("")}</div>`);
 document.querySelectorAll(".contact-row").forEach(el=>el.onclick=()=>openContact(+el.dataset.i));
}
function openContact(i){
 const x=data.contacts[i];state.history.push(renderContacts);
 setApp(x[0],x[2],`<div class="contact"><div class="avatar">👤</div><h2>${x[0]}</h2><p>${x[1]}</p><div class="contact-actions"><button>📞 Poziv</button><button>💬 Poruka</button><button>🔍 Detalji</button></div></div>`);
}
function renderFiles(){
 setApp("Datoteke","Interna memorija",`<div class="section-title">Nedavno</div>${data.files.map(x=>`<div class="file"><div class="ico">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join("")}`);
}
function renderChrome(){
 setApp("Chrome","Istorija pretrage",`<div class="search-card"><input placeholder="Pretraži ili unesi adresu">${data.history.map(x=>`<div class="history-item">${x}<small>google.com · 24.04.2026.</small></div>`).join("")}</div>`);
}
function renderGmail(){
 setApp("Gmail","Primljeno",`<div class="list">${[
  ["office@balkanconstruct.rs","Izmena ugovora — hitno","Aneks mora biti potpisan pre sastanka.","20:03"],
  ["v.radovanovic@gov.rs","Bez naslova","Ne prosleđuj dalje.","18:12"],
  ["noreply@cloudsafe.eu","Security alert","New sign-in from Windows device.","17:50"]
 ].map(x=>row(x[0],`${x[1]} · ${x[2]}`,x[3],"✉")).join("")}</div>`);
}
function renderCamera(){
 setApp("Kamera","",`<div class="camera-ui"><div class="camera-frame">🏗️</div><button class="shutter" id="shutter"></button></div>`);
 $("#shutter").onclick=()=>toast("Fotografija sačuvana u Galeriji");
}
function renderSettings(){
 setApp("Podešavanja","O uređaju",`<div class="list">${[
 ["Naziv uređaja","Galaxy A52 — Bale"],["Broj modela","SM-A525F"],["Android verzija","13"],["Poslednja sinhronizacija","24.04.2026. u 21:51"],["Zaključavanje ekrana","PIN uklonjen forenzičkim postupkom"]
 ].map(x=>row(x[0],x[1],"","⚙")).join("")}</div>`);
}
