
const CONFIG = {
  validPhone: "0643185729",
  revealDelayMs: 1300,
  cameraDelayMs: 12000
};

const state = {
  started: false,
  evidence: JSON.parse(localStorage.getItem("kaldrmaEvidence") || "{}"),
  camerasSent: localStorage.getItem("kaldrmaCamerasSent") === "1"
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
  return new Date().toLocaleTimeString("sr-RS",{hour:"2-digit",minute:"2-digit"});
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
  statusEl.textContent = "kuca…";
  showTyping();
  await sleep(delay);
  hideTyping();
  addMessage(text,"bot");
  statusEl.textContent = "šifrovana veza";
}
function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function addAttachment({title, file, type="file", meta="DOKAZ", image=false}){
  const row = document.createElement("div");
  row.className = "message-row bot";
  const preview = image ? `<img src="${file}" alt="${title}" data-view="${file}">` : "";
  row.innerHTML = `
    <div class="attachment">
      ${preview}
      <div class="file-body">
        <div class="evidence-tag">${meta}</div>
        <div class="file-title">${title}</div>
        <div class="file-meta">${image ? "slika" : type.toUpperCase()} • poverljiv prilog</div>
      </div>
      <div class="file-actions">
        ${image ? `<button data-view="${file}">Otvori</button>` : ""}
        <a href="${file}" download>Sačuvaj</a>
      </div>
    </div>`;
  messages.appendChild(row);
  scrollBottom();
}

function persistEvidence(key){
  state.evidence[key] = true;
  localStorage.setItem("kaldrmaEvidence", JSON.stringify(state.evidence));
  maybeSendCameras();
}

async function intro(){
  chatScreen.classList.add("connecting");
  connectionPanel.classList.remove("hidden");
  composer.classList.add("hidden");
  messages.innerHTML = "";

  connectionText.textContent = "Provera kanala...";
  progressBar.style.width = "18%";
  await sleep(900);

  connectionText.textContent = "Provera identiteta kontakta...";
  progressBar.style.width = "46%";
  await sleep(1100);

  connectionText.textContent = "Uspostavljanje šifrovane veze...";
  progressBar.style.width = "73%";
  await sleep(1200);

  connectionText.textContent = "Čekanje druge strane...";
  progressBar.style.width = "100%";
  await sleep(4500);

  connectionPanel.classList.add("hidden");
  chatScreen.classList.remove("connecting");
  await bot("Ko je ovo?", 700);
  composer.classList.remove("hidden");
  input.focus();
  onboardingStage = 1;
}

function keywordMatch(t, words){ return words.some(w => t.includes(normalize(w))); }


async function handleOnboarding(raw){
  const t = normalize(raw);

  const mentionsSource = keywordMatch(t,[
  "milan balovic","balovic","bale","baleta","od baleta","od bale",
  "od milana","milanov","milanove stvari",

  "kaldrma","kaldrme","iz kaldrme","u kaldrmi","kod kaldrme",
  "restoran","restorana","iz restorana","u restoranu","kod restorana",

  "kartica","kartice","sa kartice","na kartici",
  "vizit karta","vizitkarta","vizitke","sa vizitke",

  "njegove stvari","stvari zrtve","kod zrtve",
  "u dzepu","iz dzepa","dzep",
  "u novcaniku","iz novcanika","novcanik",
  "licne stvari","predmeti zrtve"
]);

  if(onboardingStage === 1){
    if(mentionsSource){
      await bot("…", 1500);
      await bot("Nemoguće.", 1300);
      await bot("Taj broj nije trebalo niko da pronađe.", 1300);
      await bot("Znači ipak je mrtav…", 1800);
      await bot("Dobro.\n\nPitaj šta želiš da znaš.", 1400);
      onboardingStage = 99;
      onboardingComplete = true;
      return true;
    }

    if(keywordMatch(t,["ko si","ko je ovo","ime","kako se zoves"])){
      await bot("Prvo mi reci kako si došao do ovog broja.", 1200);
      onboardingStage = 2;
      return true;
    }

    if(keywordMatch(t,["treba mi pomoc","pomoc","mozes li da pomognes"])){
      await bot("Prvo želim da znam odakle ti moj broj.", 1200);
      onboardingStage = 2;
      return true;
    }

    if(keywordMatch(t,["cao","zdravo","pozdrav","halo","hej","ima li koga"])){
      await bot("Poznajemo li se?", 1100);
      onboardingStage = 2;
      return true;
    }

    await bot("Odakle ti ovaj broj?", 1100);
    onboardingStage = 2;
    return true;
  }

  if(onboardingStage === 2){
    if(mentionsSource){
      await bot("…", 1500);
      await bot("Nemoguće.", 1300);
      await bot("Taj broj nije trebalo niko da pronađe.", 1300);
      await bot("Znači ipak je mrtav…", 1800);
      await bot("Dobro.\n\nPitaj šta želiš da znaš.", 1400);
      onboardingStage = 99;
      onboardingComplete = true;
      return true;
    }

    await bot("Budi precizniji.\n\nGde si tačno našao broj?", 1200);
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

  if(keywordMatch(t,["obdukcija","obdukcioni","autopsija","uzrok smrti","patolog","telo","caure","metak","balistika","milan balovic","bale"])){
    if(state.evidence.autopsy) return bot("Već sam ti poslao original. Uporedi ga sa dokumentom koji si dobio u predmetu.");
    await bot("Čekao sam da to pitaš.");
    await bot("Dokument koji si dobio nije original.");
    await bot("Neko ga je zamenio pre nego što je stigao u predmet.");
    await bot("Ne pitaj kako znam. Samo ga sačuvaj.");
    addAttachment({title:"PRAVI OBDUKCIONI IZVEŠTAJ",file:"assets/pravi_obdukcioni_izvestaj.png",image:true,meta:"ORIGINAL"});
    await bot("Uporedi ga sa onim što već imaš.\n\nAko primetiš razliku, pitaj me za nju.", 1400);
    persistEvidence("autopsy"); return;
  }

  if(keywordMatch(t,["prepiska","poruke","sifra","kodirano","desifrovano","enkripcija","aca slina","slina","porucnik","cet"])){
    if(state.evidence.chat) return bot("Dešifrovana verzija je već kod tebe. Obrati pažnju na restoran i ono što kažu da su ostavili iza sebe.");
    await bot("Video sam tu prepisku.");
    await bot("Namerno je ostavljena šifrovana.");
    await bot("Oni nisu računali da će neko imati originalni ključ.");
    await bot("Evo dešifrovane verzije.");
   addAttachment({title:"DEŠIFROVANA PREPISKA",file:"assets/desifrovana_prepiska.txt",type:"txt",meta:"DEŠIFROVANO"});
await bot("Nemoj da se zaustaviš na samoj prepisci.\n\nU njoj ima još stvari o kojima treba da me pitaš.", 1400);
persistEvidence("chat"); return;
  }

  if(keywordMatch(t,["milan stojanovic","vlasnik","gazda","vlasnik restorana","stojanovic"])){
    if(state.evidence.milan) return bot("Razgovor sa Milanom ti je već poslat. Obrati pažnju na grupu ljudi i službeno lice.");
    await bot("Vlasnik restorana nije rekao sve policiji.");
    await bot("Plašio se za restoran i porodicu.");
    await bot("Ovo je razgovor koji nikada nije završio u predmetu.");
   addAttachment({title:"RAZGOVOR SA MILANOM STOJANOVIĆEM",file:"assets/razgovor_milan_stojanovic.docx",type:"docx",meta:"NEZVANIČNI RAZGOVOR"});
await bot("Pročitaj njegovu izjavu pažljivo.\n\nNeke stvari u njoj traže dodatna pitanja.", 1400);
persistEvidence("milan"); return;
  }

  if(keywordMatch(t,["danijel","danijel ilic","konobar","posluzio","viski","vino","osoblje"])){
    if(state.evidence.danijel) return bot("Zapisnik sa Danijelom ti je već poslat. Njegova izjava nije potpuna.");
    await bot("Konobar…");
    await bot("Ne mislim da laže.");
    await bot("Ali sigurno nije rekao baš sve.");
    addAttachment({title:"ZAPISNIK — DANIJEL ILIĆ",file:"assets/zapisnik_danijel_ilic.docx",type:"docx",meta:"SLUŽBENI ZAPISNIK"});
await bot("Nemoj njegovu izjavu da uzmeš zdravo za gotovo.\n\nPitaj me o detaljima koji ti deluju čudno.", 1400);
persistEvidence("danijel"); return;
  }

  if(keywordMatch(t,["ko si","tvoje ime","kako se zoves"])){
    return bot("Nekada sam radio za njih.\n\nSada pokušavam da ispravim jednu grešku.");
  }
  if(keywordMatch(t,["ko je ubica","ubica","ko ga je ubio"])){
    return bot("Da sam želeo da ti kažem, ne bih ti slao dokaze.\n\nPoveži ih sam.");
  }
  if(keywordMatch(t,["crv","ko je crv"])){
    return bot("Nemoj.\n\nJoš ne.\n\nNije vreme.");
  }
  if(keywordMatch(t,["zasto mi pomazes","zasto pomazes","zbog cega pomazes"])){
    return bot("Zato što je Bale zaslužio istinu.");
  }
  if(keywordMatch(t,["da li si bio tamo","jesi li bio tamo","bio si tamo"])){
    return bot("Jesam.\n\nI to je sve što ću reći.");
  }
  if(keywordMatch(t,["hvala","zahvaljujem"])){
    return bot("Nemoj još da mi zahvaljuješ.\n\nTek si zagrebao površinu.");
  }
  if(keywordMatch(t,["zbogom","cao","vidimo se"])){
    return bot("Ako preživim…\n\nČućemo se ponovo.");
  }
  if(keywordMatch(t,["kamera","snimak","video nadzor","nadzor"])){
    return bot("Nemam ništa što mogu da ti pošaljem. Još.");
  }

  const fallbacks = [
    "Budi precizniji.",
    "Ne mogu o tome preko ovog kanala.",
    "Postavi pravo pitanje.",
    "Traži ono što nedostaje u predmetu.",
    "Ne veruj svemu što piše u zvaničnim dokumentima."
  ];
  return bot(fallbacks[Math.floor(Math.random()*fallbacks.length)]);
}

function maybeSendCameras(){
  const all = ["autopsy","chat","milan","danijel"].every(k => state.evidence[k]);
  if(all && !state.camerasSent){
    state.camerasSent = true;
    localStorage.setItem("kaldrmaCamerasSent","1");
    setTimeout(sendCameras, CONFIG.cameraDelayMs);
  }
}

async function sendCameras(){
  await bot("Nemoj ništa da pišeš.",900);
  await bot("Upravo sam uspeo da pristupim starom serveru restorana.",1300);
  await bot("Nemam mnogo vremena.",1000);
  await bot("Imam nešto za tebe što će ti otvoriti oči.",1300);
  addAttachment({title:"CAM 03 — 24.04.2026. 00:43:15",file:"assets/kamera_1.png",image:true,meta:"VIDEO-NADZOR"});
  await sleep(1200);
  addAttachment({title:"CAM 04 — 24.04.2026. 01:17:32",file:"assets/kamera_2.png",image:true,meta:"VIDEO-NADZOR"});
  await sleep(1200);
  addAttachment({title:"CAM 01 — 24.04.2026. 01:47:23",file:"assets/kamera_3.png",image:true,meta:"VIDEO-NADZOR"});
  await bot("Pogledaj ih pažljivo.\n\nPosle ovoga ćeš drugačije gledati na ceo slučaj.",1200);
}

$("#enterBtn").addEventListener("click", async ()=>{
  const clean = phone.value.replace(/\D/g,"");
  if(clean !== CONFIG.validPhone){
    gateError.textContent = "Kontakt nije pronađen.";
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
  if(confirm("Resetovati sav napredak i obrisati razgovor?")){
    localStorage.removeItem("kaldrmaEvidence");
    localStorage.removeItem("kaldrmaCamerasSent");
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
