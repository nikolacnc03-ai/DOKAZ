
const apps = [
  ["phone","📞","Phone"],["messages","💬","Messages"],["whatsapp","🟢","WhatsApp"],["signal","🔐","Signal"],
  ["gallery","🖼️","Gallery"],["notes","📝","Notes"],["contacts","👥","Contacts"],["files","📁","Files"],
  ["chrome","🌐","Chrome"],["gmail","✉️","Gmail"],["camera","📷","Camera"],["settings","⚙️","Settings"]
];

const state={unlocked:false,history:[],discovered:new Set()};

const data={
 phone:[
  ["Unknown number","+381 64 771 09 26","3 missed calls","21:47","missed"],
  ["Nebojša Janković","+381 63 210 844","outgoing · 2 min","20:16",""],
  ["Viktor Radovanović","+381 65 442 180","incoming · 18 sec","19:42",""],
  ["Aca Slina","+381 62 909 144","missed call","18:05","missed"],
  ["Lieutenant","Private number","incoming · 43 sec","23.04.",""]
 ],
 messages:[
  ["Milan — accountant","I sent you the statement. Check item 48.","20:31"],
  ["Unknown number","Don't go alone tonight.","19:58"],
  ["Viktor R.","The meeting has been moved. Kaldrma, 22:00.","17:14"],
  ["Aca","Call me when you're done.","16:02"]
 ],
 whatsapp:[
  {name:"Nebojša Janković",last:"Where are you? Don't make trouble.",time:"21:49",msgs:[
    ["them","Bale, where are you?","21:44"],["them","Don't make trouble.","21:45"],["me","I have copies of everything.","21:46"],["them","You don't know who you're dealing with.","21:47"],["them","Where are you?","21:49"]
  ]},
  {name:"Viktor Radovanović",last:"Don't send anything by text.",time:"20:08",msgs:[
    ["them","The meeting at Kaldrma is still on.","18:22"],["me","Is Nebojša coming?","18:24"],["them","Don't send anything by text.","20:08"]
  ]},
  {name:"Aca Slina",last:"You're late.",time:"18:43",msgs:[
    ["them","You're late.","18:43"],["me","I'm not coming alone.","18:44"],["them","Suit yourself.","18:45"]
  ]}
 ],
 signal:[
  {name:"M",last:"If you don't hear from me by 22:30, open the USB drive.",time:"21:12",msgs:[
    ["me","The USB drive is ready.","20:56"],["them","Password?","20:57"],["me","The one we agreed on. BALE0422.","20:58"],
    ["me","If you don't hear from me by 22:30, open the USB drive.","21:12"],["them","What about the second container?","21:13"],["me","I left a clue in the notebook. Don't text it.","21:14"]
  ]},
  {name:"P.",last:"Don't trust the man with the badge.",time:"20:41",msgs:[
    ["them","Don't trust the man with the badge.","20:41"],["them","The Lieutenant works for them.","20:41"],["me","Which lieutenant?","20:42"],["them","I can't say here.","20:43"]
  ]}
 ],
 contacts:[
  ["Nebojša Janković","+381 63 210 844","Balkan Construct Invest"],
  ["Viktor Radovanović","+381 65 442 180","Finance Minister"],
  ["Aleksandar Ilić — Aca","+381 62 909 144","Security"],
  ["M.","Signal contact","No surname"],
  ["Lieutenant","Private number","Do not enter real name"]
 ],
 notes:[
  ["IMPORTANT","Trust no one.\nIf I disappear, keep the USB drive and notebook together.\nI left the key to the second container in the notebook.\nThe Lieutenant knows about the construction site."],
  ["Meeting","Kaldrma — 22:00\nViktor + Nebojša\nDo not bring the original documents."],
  ["Payments","48 — BCI / consulting services\n73 — contractor without a contract\n91 — cash"]
 ],
 files:[
  ["📄","isplate_april.xlsx","Modified today · 84 KB"],
  ["📄","ugovor_aneks_4.pdf","Documents · 1.2 MB"],
  ["🎙️","REC_20260423_2318.m4a","Recordings · 03:12"],
  ["🔒","EVIDENCE.enc","Protected · 16.8 MB"],
  ["🖼️","IMG_20260424_184422.jpg","Images · 2.4 MB"]
 ],
 history:[
  "how to report corruption anonymously",
  "how to encrypt a USB drive on Windows",
  "balkan construct invest ownership structure",
  "what is an emergency procurement procedure",
  "how to remove metadata from a photo"
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
function unlockPhone(){lock.classList.remove("active");home.classList.add("active");state.unlocked=true;enteredPin="";updatePinDots();toast("Phone unlocked");}
document.querySelectorAll("#pinPad [data-digit]").forEach(btn=>btn.addEventListener("click",()=>{if(enteredPin.length>=6)return;enteredPin+=btn.dataset.digit;$("#pinError").textContent="";updatePinDots();if(enteredPin.length===6){setTimeout(()=>{if(enteredPin===CORRECT_PIN){unlockPhone()}else{$("#pinError").textContent="Incorrect PIN";document.querySelector(".pin-dots").classList.add("shake");setTimeout(()=>document.querySelector(".pin-dots").classList.remove("shake"),300);enteredPin="";updatePinDots()}},180)}}));
$("#pinDelete").addEventListener("click",()=>{enteredPin=enteredPin.slice(0,-1);$("#pinError").textContent="";updatePinDots();});

$("#homeBtn").onclick=goHome;$("#navHome").onclick=goHome;$("#backBtn").onclick=goBack;$("#navBack").onclick=goBack;
$("#navRecent").onclick=()=>toast("No recently opened apps");

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
 setApp("Phone","Recent calls",`<div class="section-title">Today</div><div class="list">${data.phone.map(x=>row(x[0],`${x[1]} · ${x[2]}`,x[3],x[4]==="missed"?"!":"☎")).join("")}</div>`);
}
function renderMessages(){
 setApp("Messages","4 conversations",`<div class="list">${data.messages.map(x=>row(x[0],x[1],x[2],"💬")).join("")}</div>`);
}
function renderChats(title,items,secure=false){
 setApp(title,secure?"Encrypted messages":"Conversations",`<div class="list">${items.map((x,i)=>`<div class="chat-row" data-i="${i}">${row(x.name,x.last,x.time,secure?"🔐":"●")}</div>`).join("")}</div>`);
 document.querySelectorAll(".chat-row").forEach(el=>el.onclick=()=>openChat(title,items,+el.dataset.i,secure));
}
function openChat(title,items,i,secure){
 const x=items[i];
 state.history.push(()=>renderChats(title,items,secure));
 setApp(x.name,secure?"Signal · end-to-end encryption":"last active",`<div class="chat">${x.msgs.map(m=>`<div class="bubble ${m[0]}">${m[1]}<time>${m[2]}</time></div>`).join("")}</div>`);
 if(secure && i===0 && !state.discovered.has("codes")){state.discovered.add("codes");toast("USB archive passwords found")}
}
function renderGallery(){
 const pics=[["🏗️","Construction site"],["🍽️","Kaldrma"],["📄","Contract"],["🚘","Parking"],["👤","Unknown person"],["🔢","Licence plate"],["🏢","BCI"],["🧾","Payment"],["🌉","Bridge"]];
 setApp("Gallery","9 photos",`<div class="gallery">${pics.map((p,i)=>`<div class="photo" data-i="${i}">${p[0]}<small>${p[1]}</small></div>`).join("")}</div>`);
 document.querySelectorAll(".photo").forEach(p=>p.onclick=()=>toast("Photograph marked as evidence"));
}
function renderNotes(){
 setApp("Notes",`${data.notes.length} notes`,data.notes.map(n=>`<article class="note-card"><h3>${n[0]}</h3><p>${n[1]}</p></article>`).join(""));
}
function renderContacts(){
 setApp("Contacts","5 contacts",`<div class="list">${data.contacts.map((x,i)=>`<div class="contact-row" data-i="${i}">${row(x[0],x[2],"","👤")}</div>`).join("")}</div>`);
 document.querySelectorAll(".contact-row").forEach(el=>el.onclick=()=>openContact(+el.dataset.i));
}
function openContact(i){
 const x=data.contacts[i];state.history.push(renderContacts);
 setApp(x[0],x[2],`<div class="contact"><div class="avatar">👤</div><h2>${x[0]}</h2><p>${x[1]}</p><div class="contact-actions"><button>📞 Call</button><button>💬 Message</button><button>🔍 Details</button></div></div>`);
}
function renderFiles(){
 setApp("Files","Internal storage",`<div class="section-title">Recent</div>${data.files.map(x=>`<div class="file"><div class="ico">${x[0]}</div><div><b>${x[1]}</b><small>${x[2]}</small></div></div>`).join("")}`);
}
function renderChrome(){
 setApp("Chrome","Search history",`<div class="search-card"><input placeholder="Search or enter an address">${data.history.map(x=>`<div class="history-item">${x}<small>google.com · 24.04.2026.</small></div>`).join("")}</div>`);
}
function renderGmail(){
 setApp("Gmail","Inbox",`<div class="list">${[
  ["office@balkanconstruct.rs","Contract amendment — urgent","The amendment must be signed before the meeting.","20:03"],
  ["v.radovanovic@gov.rs","No subject","Do not forward.","18:12"],
  ["noreply@cloudsafe.eu","Security alert","New sign-in from Windows device.","17:50"]
 ].map(x=>row(x[0],`${x[1]} · ${x[2]}`,x[3],"✉")).join("")}</div>`);
}
function renderCamera(){
 setApp("Camera","",`<div class="camera-ui"><div class="camera-frame">🏗️</div><button class="shutter" id="shutter"></button></div>`);
 $("#shutter").onclick=()=>toast("Photo saved to Gallery");
}
function renderSettings(){
 setApp("Settings","About phone",`<div class="list">${[
 ["Device name","Galaxy A52 — Bale"],["Model number","SM-A525F"],["Android version","13"],["Last sync","24 April 2026 at 21:51"],["Screen lock","PIN removed during forensic examination"]
 ].map(x=>row(x[0],x[1],"","⚙")).join("")}</div>`);
}
