const suspects = [
  { id:'aleksandar', name:'Aleksandar Ilić', role:'Aca Slina', img:'assets/img/suspects/aleksandar_ilic.jpg' },
  { id:'nebojsa', name:'Nebojša Janković', role:'Knez', img:'assets/img/suspects/nebojsa_jankovic.jpg' },
  { id:'nenad', name:'Nenad Lazić', role:'Poručnik', img:'assets/img/suspects/nenad_lazic.jpg' },
  { id:'danijel', name:'Danijel Ilić', role:'Konobar', img:'assets/img/suspects/danijel_ilic.jpg' },
  { id:'milan', name:'Milan Stojanović', role:'Vlasnik restorana', img:'assets/img/suspects/milan_stojanovic.jpg' },
  { id:'iva', name:'Iva Mitrović', role:'Povezano lice', img:'assets/img/suspects/iva_mitrovic.jpg' }
];

const categories = [
  { id:'dokumenti', title:'Dokumenti', required:1, icon:'📁' },
  { id:'izjave', title:'Izjave i saslušanja', required:4, icon:'🗣️' },
  { id:'telekom', title:'Telekomunikacije', required:1, icon:'📱' },
  { id:'video', title:'Video nadzor', required:3, icon:'🎥' },
  { id:'foto', title:'Fotografije', required:1, icon:'📷' },
  { id:'forenzika', title:'Forenzika / DNK', required:1, icon:'🧬' },
  { id:'dosijei', title:'Operativni dosijei', required:1, icon:'🗂️' }
];

const state = {
  step: 0,
  confirmed: [false,false,false,false,false],
  selectedSuspect: null,
  files: Object.fromEntries(categories.map(c => [c.id, []])),
  categoryStatus: Object.fromEntries(categories.map(c => [c.id, 'empty']))
};

// Svaki poznati dokaz sme da pripada samo jednoj kategoriji.
// Ovo ne otkriva igraču skriveno rešenje, samo sprečava pogrešno razvrstavanje fajlova.
const evidenceRules = [
  { category:'dokumenti', patterns:[/uvi[dđ]jaj/i, /sluzbena|službena/i, /bele[sš]ka/i, /zapisnik.*uvi/i] },
  { category:'izjave', patterns:[/izjava/i, /saslu[sš]anje/i, /razgovor.*svedok/i, /danijel.*ili/i, /milan.*stojanovi/i] },
  { category:'telekom', patterns:[/prepiska/i, /poru[cč]nik/i, /listing/i, /poziv/i, /poruka/i, /telefon/i, /slina.*porucnik/i] },
  { category:'video', patterns:[/kamera/i, /cam/i, /video/i, /nadzor/i] },
  { category:'foto', patterns:[/fotograf/i, /slika/i, /pronadjen|pronađen/i, /telo/i, /mesto.*dogadj|mesto.*događ/i] },
  { category:'forenzika', patterns:[/obdukc/i, /dnk/i, /forenz/i, /balistik/i, /gsr/i, /ve[sš]ta[cč]enje/i] },
  { category:'dosijei', patterns:[/dosije/i, /sba/i, /aleksandar.*ili/i, /aco.*slina/i] }
];

function detectCategory(fileName){
  const normalized = fileName.toLowerCase();
  for(const rule of evidenceRules){
    if(rule.patterns.some(pattern => pattern.test(normalized))) return rule.category;
  }
  return null;
}

function fileAlreadyAdded(fileName){
  const target = fileName.toLowerCase();
  for(const cat of categories){
    if(state.files[cat.id].some(f => f.name.toLowerCase() === target)) return cat.id;
  }
  return null;
}

const screens = [...document.querySelectorAll('.screen')];
const stepButtons = [...document.querySelectorAll('.step')];
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
const confirmBtn = document.getElementById('confirmBtn');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');

function toast(text){
  const t = document.getElementById('toast');
  t.textContent = text; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2200);
}

function renderSuspects(){
  const grid = document.getElementById('suspectGrid');
  grid.innerHTML = suspects.map(s => `
    <article class="suspect-card ${state.selectedSuspect===s.id?'selected':''}" data-id="${s.id}">
      <div class="checkmark">✓</div>
      <img src="${s.img}" alt="${s.name}">
      <div class="suspect-role">${s.role}</div>
      <h4>${s.name}</h4>
      <p>Osumnjičeno lice u predmetu restorana „Kaldrma”.</p>
    </article>
  `).join('');
  grid.querySelectorAll('.suspect-card').forEach(card => card.addEventListener('click', () => {
    state.selectedSuspect = card.dataset.id;
    state.confirmed[1] = false;
    renderSuspects(); updateUI(); toast('Osumnjičeno lice je označeno. Kliknite Potvrdi.');
  }));
}

function renderEvidence(){
  const grid = document.getElementById('evidenceGrid');
  grid.innerHTML = categories.map(cat => {
    const count = state.files[cat.id].length;
    const complete = count >= cat.required;
    const wrong = state.categoryStatus[cat.id] === 'wrong';
    return `
      <article class="evidence-card ${complete?'complete':''} ${wrong?'wrong':''}" data-cat="${cat.id}">
        <div class="ev-head">
          <div class="ev-title">${cat.icon} ${cat.title}</div>
          <div class="counter">${Math.min(count, cat.required)}/${cat.required}</div>
        </div>
        <label class="drop">
          <input type="file" multiple data-cat="${cat.id}">
          <b>+ Dodaj fajl</b><br><small>PDF, DOCX, JPG, PNG, MP4 ili TXT</small>
        </label>
        ${wrong ? '<div class="category-warning">Pogrešan dokaz za ovu kategoriju.</div>' : ''}
        <div class="file-list">
          ${state.files[cat.id].map((file, i) => `
            <div class="file-item"><span>📎 ${file.name}</span><button class="remove-file" data-cat="${cat.id}" data-index="${i}">Ukloni</button></div>
          `).join('')}
        </div>
      </article>
    `;
  }).join('');
  grid.querySelectorAll('input[type=file]').forEach(input => input.addEventListener('change', e => {
    const cat = e.target.dataset.cat;
    const files = Array.from(e.target.files);
    let added = 0;
    let rejected = 0;

    for(const file of files){
      const existingCat = fileAlreadyAdded(file.name);
      const detectedCat = detectCategory(file.name);

      if(existingCat && existingCat !== cat){
        rejected++;
        state.categoryStatus[cat] = 'wrong';
        continue;
      }

      if(detectedCat && detectedCat !== cat){
        rejected++;
        state.categoryStatus[cat] = 'wrong';
        continue;
      }

      if(!state.files[cat].some(f => f.name.toLowerCase() === file.name.toLowerCase())){
        state.files[cat].push(file);
        added++;
      }
    }

    if(added > 0){
      state.categoryStatus[cat] = state.files[cat].length >= categories.find(c => c.id === cat).required ? 'complete' : 'partial';
      toast(added === 1 ? 'Fajl je dodat.' : 'Fajlovi su dodati.');
    }
    if(rejected > 0){
      toast('Dokaz ne pripada izabranoj kategoriji ili je već dodat.');
    }

    state.confirmed[2] = false;
    e.target.value = '';
    renderEvidence(); updateUI();
  }));
  grid.querySelectorAll('.remove-file').forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    state.files[cat].splice(Number(btn.dataset.index), 1);
    state.categoryStatus[cat] = state.files[cat].length ? 'partial' : 'empty';
    state.confirmed[2] = false;
    renderEvidence(); updateUI(); toast('Fajl je uklonjen.');
  }));
}

function validateStep(step){
  if(step === 0) return document.getElementById('caseNumber').value.trim().length >= 3 || 'Unesite broj predmeta.';
  if(step === 1) return !!state.selectedSuspect || 'Izaberite osumnjičeno lice.';
  if(step === 2){
    const missing = categories.filter(c => state.files[c.id].length < c.required);
    return missing.length === 0 || 'Nisu popunjene sve kategorije dokaza.';
  }
  if(step === 3) return document.getElementById('motive').value.trim().length >= 8 || 'Unesite motiv izvršenja krivičnog dela.';
  return true;
}

function confirmStep(){
  const valid = validateStep(state.step);
  if(valid === true){
    state.confirmed[state.step] = true;
    toast('Korak uspešno potvrđen.');
  } else {
    toast(valid);
  }
  updateUI();
}

function setStep(n){
  if(n < 0 || n >= screens.length) return;
  state.step = n;
  screens.forEach((s,i)=>s.classList.toggle('active', i===n));
  updateUI();
}

function updateUI(){
  stepButtons.forEach((b,i)=>{
    b.classList.toggle('active', i===state.step);
    b.classList.toggle('confirmed', !!state.confirmed[i]);
  });
  progressBar.style.width = `${((state.step+1)/screens.length)*100}%`;
  backBtn.disabled = state.step === 0;
  confirmBtn.style.display = state.step === 4 ? 'none' : '';
  nextBtn.style.display = state.step === 4 ? 'none' : '';
  nextBtn.disabled = !state.confirmed[state.step];
  if(state.step === 4){ statusText.textContent = 'Predmet je spreman za sudsku proveru.'; }
  else if(state.confirmed[state.step]){ statusText.textContent = 'Korak je potvrđen. Možete nastaviti dalje.'; }
  else { statusText.textContent = 'Popunite podatke i kliknite Potvrdi.'; }
}

function normalizeText(value){
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj');
}

function allPreviousStepsConfirmed(){
  return state.confirmed[0] && state.confirmed[1] && state.confirmed[2] && state.confirmed[3];
}

function submitIndictment(){
  const suspectOk = state.selectedSuspect === 'aleksandar';
  const motive = normalizeText(document.getElementById('motive').value);

const motiveKeywords = [
  'gradjevinsko zemljiste',
  'gradjevinskog zemljista',
  'gradjevinskom zemljistu',
  'gradjevinska parcela',
  'gradjevinske parcele',
  'gradjevinskoj parceli',
  'zemljiste za izgradnju',
  'plac za izgradnju',
  'plac',
  'placevi',
  'placa',
  'placu',
  'imanje',
  'imanja',
  'imanju',
  'gradiliste',
  'gradilista',
  'gradilistu',
  'gradjevina',
  'gradjevine',
  'gradjevini',
  'zemljiste',
  'zemljista',
  'zemljistu',
  'parcela',
  'parcele',
  'parceli',
  'nekretnina',
  'nekretnine',
  'nekretnini'
];
 const motiveOk = motiveKeywords.some(keyword => motive.includes(keyword));
  const evidenceOk = categories.every(c => state.files[c.id].length >= c.required);
  const noWrongCategory = categories.every(c => state.categoryStatus[c.id] !== 'wrong');
  const stepsOk = allPreviousStepsConfirmed();
  const text = document.getElementById('verdictText');

  text.classList.add('checking');
  text.innerHTML = `
    <b>Sudija Ljiljana Marković vrši službenu proveru.</b><br>
    Proveravaju se formalna potpunost predmeta, izbor osumnjičenog lica, raspored priloženih dokaza i obrazloženje motiva.
  `;

  setTimeout(()=>{
    text.classList.remove('checking');

    if(stepsOk && suspectOk && motiveOk && evidenceOk && noWrongCategory){
      text.innerHTML = `
        <b>OPTUŽNICA SE PRIHVATA.</b><br>
        Sud nalazi da je optužni predlog formalno potpun, da su priloženi dokazi pravilno razvrstani i da je obrazloženje u skladu sa činjeničnim stanjem sadržanim u predmetu.
      `;
      toast('Optužnica prihvaćena.');
      state.confirmed[4] = true;
      const submitBtn = document.getElementById('submitIndictment');
      submitBtn.textContent = 'Nastavi na izricanje presude';
      submitBtn.onclick = openEpilogue;
      return;
    }

    let explanation = 'Sud nalazi da optužni predlog ne ispunjava uslove za potvrđivanje.';

    if(!stepsOk){
      explanation = 'Nisu potvrđeni svi prethodni koraci postupka.';
    } else if(!evidenceOk || !noWrongCategory){
      explanation = 'Dostavljena dokumentacija nije potpuna ili pojedini prilozi nisu pravilno razvrstani u dokazne kategorije.';
    } else if(!suspectOk || !motiveOk){
      explanation = 'Dostavljena dokumentacija je formalno potpuna, ali izabrano lice ili navedeni motiv nisu u dovoljnoj meri usklađeni sa činjeničnim stanjem i dokazima u predmetu.';
    }

    text.innerHTML = `
      <b>OPTUŽNICA SE NE PRIHVATA.</b><br>
      ${explanation}<br><br>
      Predmet se vraća javnom tužiocu na dopunu i ponovnu proveru.
    `;
    toast('Optužnica nije validna.');
  }, 1800);
}

stepButtons.forEach(btn => btn.addEventListener('click', () => setStep(Number(btn.dataset.step))));
backBtn.addEventListener('click', () => setStep(state.step-1));
nextBtn.addEventListener('click', () => setStep(state.step+1));
confirmBtn.addEventListener('click', confirmStep);
document.getElementById('submitIndictment').addEventListener('click', submitIndictment);
document.getElementById('caseNumber').addEventListener('input', () => { state.confirmed[0]=false; updateUI(); });
document.getElementById('motive').addEventListener('input', () => { state.confirmed[3]=false; updateUI(); });
renderSuspects(); renderEvidence(); updateUI();


function addChatMessage(who, text, cls){
  const thread = document.getElementById('chatThread');
  const div = document.createElement('div');
  div.className = `message ${cls}`;
  div.innerHTML = `<b>${who}</b><p>${text}</p>`;
  thread.appendChild(div);
  thread.scrollTop = thread.scrollHeight;
}

function setEpilogueAction(label, handler){
  const wrap = document.getElementById('epilogueActions');
  wrap.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'primary';
  btn.textContent = label;
  btn.addEventListener('click', handler);
  wrap.appendChild(btn);
}

function openEpilogue(){
  const overlay = document.getElementById('epilogueOverlay');
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  document.getElementById('chatThread').innerHTML = '<div class="message milica"><b>Milica</b><p>Nikola… da li je gotovo?</p></div>';
  setEpilogueAction('Presuda je doneta.', epilogueStepTwo);
}

function epilogueStepTwo(){
  addChatMessage('Nikola', 'Presuda je doneta. Dokazi su prihvaćeni.', 'nikola');
  setEpilogueAction('Nastavi', () => {
    addChatMessage('Milica', 'Mesecima sam ćutala da ne ugrozimo istragu. Ako je sud završio svoj deo, više nema razloga da krijemo istinu.', 'milica');
    setEpilogueAction('Objavi sve.', epiloguePublish);
  });
}

function epiloguePublish(){
  addChatMessage('Nikola', 'Objavi sve.', 'nikola');
  setEpilogueAction('Otvori objavu', () => {
    addChatMessage('Milica', 'Objavljujem večeras. Šta god da se sada desi, dokazi više ne mogu da nestanu. Hvala ti, Nikola.', 'milica');
    setTimeout(() => { window.location.href = 'blog/index.html?epilog=1'; }, 1800);
  });
}

document.getElementById('closeEpilogue').addEventListener('click', () => {
  document.getElementById('epilogueOverlay').classList.remove('open');
  document.body.classList.remove('modal-open');
});
