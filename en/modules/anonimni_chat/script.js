
const CONFIG = {
  validPhone: "0643185729",
  revealDelayMs: 1300,
  cameraDelayMs: 12000
};

const state = {
  started: false,
  evidence: JSON.parse(localStorage.getItem("kaldrmaEvidenceEN") || "{}"),
  camerasSent: localStorage.getItem("kaldrmaCamerasSentEN") === "1"
};

const $ = s => document.querySelector(s);
const gate = $("#gate");
const chatScreen = $("#chatScreen");
const messages = $("#messages");
const phone = $("#phone");
const gateError = $("#gateError");
const statusEl = $("#status");
const input = $("#messageInput");
const composer = $("#chatForm");
const connectionPanel = $("#connectionPanel");
const progressBar = $("#progressBar");
const connectionText = $("#connectionText");

let onboardingStage = 0;
let onboardingComplete = false;

function normalize(str){
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/đ/g,"dj")
    .replace(/[^a-z0-9\s]/g," ")
    .replace(/\s+/g," ").trim();
}
function now(){
  return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
}
function scrollBottom(){ messages.scrollTop = messages.scrollHeight; }

function addMessage(text, who="bot"){
  const row = document.createElement("div");
  row.className = `message-row ${who}`;
  row.innerHTML = `<div class="bubble">${escapeHtml(text)}<span class="time">${now()}</span></div>`;
  messages.appendChild(row);
  scrollBottom();
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}
function showTyping(){
  const row = document.createElement("div");
  row.className = "message-row bot";
  row.id = "typing";
  row.innerHTML = `<div class="bubble typing"><i></i><i></i><i></i></div>`;
  messages.appendChild(row); scrollBottom();
}
function hideTyping(){ $("#typing")?.remove(); }

async function bot(text, delay=CONFIG.revealDelayMs){
  statusEl.textContent = "typing…";
  showTyping();
  await sleep(delay);
  hideTyping();
  addMessage(text,"bot");
  statusEl.textContent = "encrypted connection";
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function addAttachment({title, file, type="file", meta="EVIDENCE", image=false}){
  const row = document.createElement("div");
  row.className = "message-row bot";
  const preview = image ? `<img src="${file}" alt="${title}" data-view="${file}">` : "";
  row.innerHTML = `
    <div class="attachment">
      ${preview}
      <div class="file-body">
        <div class="evidence-tag">${meta}</div>
        <div class="file-title">${title}</div>
        <div class="file-meta">${image ? "image" : type.toUpperCase()} • confidential attachment</div>
      </div>
      <div class="file-actions">
        ${image ? `<button data-view="${file}">Open</button>` : ""}
        <a href="${file}" download>Save</a>
      </div>
    </div>`;
  messages.appendChild(row);
  scrollBottom();
}

function persistEvidence(key){
  state.evidence[key] = true;
  localStorage.setItem("kaldrmaEvidenceEN", JSON.stringify(state.evidence));
  maybeSendCameras();
}

async function intro(){
  chatScreen.classList.add("connecting");
  connectionPanel.classList.remove("hidden");
  composer.classList.add("hidden");
  messages.innerHTML = "";

  connectionText.textContent = "Verifying channel...";
  progressBar.style.width = "18%";
  await sleep(900);

  connectionText.textContent = "Verifying the contact's identity...";
  progressBar.style.width = "46%";
  await sleep(1100);

  connectionText.textContent = "Establishing an encrypted connection...";
  progressBar.style.width = "73%";
  await sleep(1200);

  connectionText.textContent = "Waiting for the other party...";
  progressBar.style.width = "100%";
  await sleep(4500);

  connectionPanel.classList.add("hidden");
  chatScreen.classList.remove("connecting");
  await bot("Who's this?", 700);
  composer.classList.remove("hidden");
  input.focus();
  onboardingStage = 1;
}

function keywordMatch(t, words){ return words.some(w => t.includes(normalize(w))); }


async function handleOnboarding(raw){
  const t = normalize(raw);

  const mentionsSource = keywordMatch(t,[
  "restaurant","business card","pocket","wallet","belongings","victim","milan balovic","balovic","bale","baleta","od baleta","od bale",
  "od milana","milanov","milanove stvari",

  "kaldrma","kaldrme","iz kaldrme","u kaldrmi","kod kaldrme",
  "restoran","restorana","iz restorana","u restoranu","kod restorana",

  "kart","vizit",

  "njegove stvari","stvari zrtve","kod zrtve",
  "u dzepu","iz dzepa","dzep",
  "u novcaniku","iz novcanika","novcanik",
  "licne stvari","predmeti zrtve"
]);

  if(onboardingStage === 1){
  if(mentionsSource){
  await bot("…", 1500);
  await bot("Impossible.", 1300);
  await bot("Nobody was supposed to find that number.", 1300);
  await bot("So he really is dead…", 1800);
  await bot("I hope you've read all the case documents carefully.", 1500);
  await bot("And that you've already noticed some things don't add up.", 1500);
  await bot("If you have… ask me what you want to know.", 1400);

  onboardingStage = 99;
  onboardingComplete = true;
  return true;
}

    if(keywordMatch(t,["ko si","who are you","your name","ko je ovo","ime","kako se zoves"])){
      await bot("First tell me how you got this number.", 1200);
      onboardingStage = 2;
      return true;
    }

    if(keywordMatch(t,["treba mi pomoc","pomoc","mozes li da pomognes"])){
      await bot("I want to know where you got my number first.", 1200);
      onboardingStage = 2;
      return true;
    }

    if(keywordMatch(t,["cao","zdravo","pozdrav","halo","hej","ima li koga"])){
      await bot("Do we know each other?", 1100);
      onboardingStage = 2;
      return true;
    }

    await bot("Where did you get this number?", 1100);
    onboardingStage = 2;
    return true;
  }

  if(onboardingStage === 2){
if(mentionsSource){
  await bot("…", 1500);
  await bot("Impossible.", 1300);
  await bot("Nobody was supposed to find that number.", 1300);
  await bot("So he really is dead…", 1800);
  await bot("I hope you've read all the case documents carefully.", 1500);
  await bot("And that you've already noticed some things don't add up.", 1500);
  await bot("If you have… ask me what you want to know.", 1400);

  onboardingStage = 99;
  onboardingComplete = true;
  return true;
}
    await bot("Be more specific.\n\nWhere exactly did you find it?", 1200);
    return true;
  }

  return false;
}

async function handleMessage(raw){
  if(!onboardingComplete){
    const handled = await handleOnboarding(raw);
    if(handled) return;
  }

  const t = normalize(raw);

  if(keywordMatch(t,["obdukcija","autopsy","cause of death","pathologist","ballistics","body","obdukcioni","autopsija","uzrok smrti","patolog","telo","caure","metak","balistika","milan balovic","bale"])){
    if(state.evidence.autopsy) return bot("I already sent you the original. Compare it with the one in your case file.");
    await bot("I was waiting for you to ask.");
    await bot("The document you received isn't the original.");
    await bot("Someone replaced it before it reached the case file.");
    await bot("Don't ask how I know. Just keep it safe.");
    addAttachment({title:"GENUINE AUTOPSY REPORT",file:"assets/pravi_obdukcioni_izvestaj.png",image:true,meta:"ORIGINAL"});
    await bot("Compare it with what you already have.\n\nI hope you spot the difference.", 1400);
    persistEvidence("autopsy"); return;
  }

  if(keywordMatch(t,["prepiska","communications","messages","decryption","decrypt","encrypted","encryption","cipher","lieutenant","chat","poruke","sifra","kodirano","desifrovano","enkripcija","aca slina","slina","porucnik","cet"])){
    if(state.evidence.chat) return bot("You already have the decrypted version. Pay attention to the restaurant and what they say they left behind.");
    await bot("I've seen those messages.");
    await bot("They kept them encrypted on purpose.");
    await bot("They didn't expect anyone to have the original key.");
    await bot("Here's the decrypted copy.");
   addAttachment({title:"DECRYPTED MESSAGES",file:"assets/desifrovana_prepiska.txt",type:"txt",meta:"DECRYPTED"});
await bot("Keep looking beyond those messages.\n\nOnce you've read them, take another look at the case documents.", 1400);
persistEvidence("chat"); return;
  }

  if(keywordMatch(t,["milan stojanovic","restaurant owner","owner","vlasnik","gazda","vlasnik restorana","stojanovic"])){
    if(state.evidence.milan) return bot("I already sent Milan's interview. Pay attention to the group of men and the official.");
    await bot("The restaurant owner didn't tell the police everything.");
    await bot("He was afraid for his restaurant and his family.");
    await bot("This interview never made it into the case file.");
   addAttachment({title:"INTERVIEW WITH MILAN STOJANOVIĆ",file:"assets/razgovor_milan_stojanovic.docx",type:"docx",meta:"UNOFFICIAL INTERVIEW"});
await bot("Read his statement carefully.", 1400);
persistEvidence("milan"); return;
  }

  if(keywordMatch(t,["danijel","waiter","whiskey","wine","staff","danijel ilic","konobar","posluzio","viski","vino","osoblje"])){
    if(state.evidence.danijel) return bot("I already sent you Danijel's interview record. His statement is incomplete.");
    await bot("The waiter…");
    await bot("I don't think he's lying.");
    await bot("But he definitely left something out.");
    addAttachment({title:"INTERVIEW RECORD — DANIJEL ILIĆ",file:"assets/zapisnik_danijel_ilic.docx",type:"docx",meta:"OFFICIAL RECORD"});
await bot("Don't take his statement at face value.\n\nHe isn't someone you can trust.", 1400);
persistEvidence("danijel"); return;
  }

  if(keywordMatch(t,["ko si","tvoje ime","kako se zoves"])){
    return bot("I used to work for them.\n\nNow I'm trying to put something right.");
  }
  if(keywordMatch(t,["ko je ubica","who killed","killer","murderer","ubica","ko ga je ubio"])){
    return bot("If I wanted to tell you, I wouldn't have sent the evidence.\n\nPut the pieces together yourself.");
  }
  if(keywordMatch(t,["crv","worm","ko je crv"])){
    return bot("Don't.\n\nNot yet.\n\nIt isn't time.");
  }
  if(keywordMatch(t,["zasto mi pomazes","why are you helping","why help","zasto pomazes","zbog cega pomazes"])){
    return bot("Because Bale deserved the truth.");
  }
  if(keywordMatch(t,["da li si bio tamo","were you there","jesi li bio tamo","bio si tamo"])){
    return bot("Yes.\n\nThat's all I'm going to say.");
  }
  if(keywordMatch(t,["hvala","thanks","thank you","zahvaljujem"])){
    return bot("Don't thank me yet.\n\nYou've barely scratched the surface.");
  }
  if(keywordMatch(t,["zbogom","goodbye","see you","cao","vidimo se"])){
    return bot("If I survive…\n\nWe'll talk again.");
  }
  if(keywordMatch(t,["kamera","camera","footage","surveillance","snimak","video nadzor","nadzor"])){
    return bot("I have nothing to send you. Yet.");
  }

const fallbacks = [
  "I can't answer that.\n\nAsk me about the documents and evidence you have.",
  "I can only talk about the case.\n\nLook through your documents and ask about anything that doesn't make sense.",
  "Stick to the documents.\n\nIf you've spotted an inconsistency, ask me about it directly.",
  "I can't help with that question.\n\nAsk me about the statements, messages, autopsy or other evidence in the case."
];

return bot(fallbacks[Math.floor(Math.random()*fallbacks.length)]);
}

function maybeSendCameras(){
  const all = ["autopsy","chat","milan","danijel"].every(k => state.evidence[k]);
  if(all && !state.camerasSent){
    state.camerasSent = true;
    localStorage.setItem("kaldrmaCamerasSentEN","1");
    setTimeout(sendCameras, CONFIG.cameraDelayMs);
  }
}

async function sendCameras(){
  await bot("Don't type anything.",900);
  await bot("I've just got into the restaurant's old server.",1300);
  await bot("I don't have much time.",1000);
  await bot("I've got something that'll open your eyes.",1300);

  addAttachment({
    title:"CAM 03 — 24.04.2026. 00:43:15",
    file:"assets/kamera_1.png",
    image:true,
    meta:"SURVEILLANCE FOOTAGE"
  });

  await sleep(1200);

  addAttachment({
    title:"CAM 04 — 24.04.2026. 01:17:32",
    file:"assets/kamera_2.png",
    image:true,
    meta:"SURVEILLANCE FOOTAGE"
  });

  await sleep(1200);

  addAttachment({
    title:"CAM 01 — 24.04.2026. 01:47:23",
    file:"assets/kamera_3.png",
    image:true,
    meta:"SURVEILLANCE FOOTAGE"
  });

  await bot(
    "Look at them carefully.\n\nYou'll see the whole case differently after this.\n\nDon't contact me again.",
    1200
  );

  // Kontakt prekida vezu
  await sleep(1800);

  statusEl.textContent = "offline";
  composer.classList.add("hidden");
}

$("#enterBtn").addEventListener("click", async ()=>{
  const clean = phone.value.replace(/\D/g,"");
  if(clean !== CONFIG.validPhone){
    gateError.textContent = "Contact not found.";
    return;
  }
  gate.classList.add("hidden");
  chatScreen.classList.remove("hidden");
  state.started = true;
  if(messages.children.length===0) intro();
  maybeSendCameras();
});
phone.addEventListener("keydown",e=>{ if(e.key==="Enter") $("#enterBtn").click(); });

$("#chatForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const text = input.value.trim();
  if(!text) return;
  addMessage(text,"user");
  input.value="";
  await handleMessage(text);
});

$("#resetBtn").addEventListener("click",()=>{
  if(confirm("Reset all progress and clear the conversation?")){
    localStorage.removeItem("kaldrmaEvidenceEN");
    localStorage.removeItem("kaldrmaCamerasSentEN");
    location.reload();
  }
});

document.addEventListener("click",e=>{
  const src = e.target.dataset?.view;
  if(src){
    $("#viewerImage").src = src;
    $("#viewer").classList.remove("hidden");
  }
});
$("#closeViewer").addEventListener("click",()=>$("#viewer").classList.add("hidden"));
$("#viewer").addEventListener("click",e=>{ if(e.target.id==="viewer") $("#viewer").classList.add("hidden"); });
