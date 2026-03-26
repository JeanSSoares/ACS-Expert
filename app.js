// Adicionar IDs que faltam (usados nas doenças mas não listados acima)
const symptomIdSet = new Set(SYMPTOMS.map(s=>s.id));
function ensureSymptomExists(id, group = 'Outros'){ // Adicionado group default
  if(!symptomIdSet.has(id)){
    const label = id.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    SYMPTOMS.push({id:id, label:label, group: group}); // Cria label básico
    symptomIdSet.add(id);
  }
}
// Certificar que todos os IDs usados em DISEASES existem em SYMPTOMS
DISEASES.forEach(d => d.sintomas.forEach(s => ensureSymptomExists(s)));

const conversationEl = document.getElementById('conversation');
const symptomsEl = document.getElementById('symptoms');
const resultsEl = document.getElementById('results');
const engineLogEl = document.getElementById('engineLog');
const rawDataEl = document.getElementById('rawData');
const rulesListEl = document.getElementById('rulesList');
const lastSummaryEl = document.getElementById('lastSummary');
const priorityLabelEl = document.getElementById('priorityLabel');
const priorityDescEl = document.getElementById('priorityDesc');
const priorityBadgeEl = document.getElementById('priorityBadge');

let selectedSymptoms = {};
let lastTriagem = null;

// --- ATUALIZADO (EVOLUÇÃO 4 - UI - Acordeão - CORRIGIDO) ---
function renderSymptoms(){
  symptomsEl.innerHTML = '';
  // Limpa a área

  // 1. Agrupar Sintomas
  const groupedSymptoms = SYMPTOMS.reduce((acc, symptom) => {
    const group = symptom.group || 'Outros';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(symptom);
    return acc;
  }, {});
const groupOrder = [
    'Sintomas Gerais',
    'Saúde Mental',
    'Neurológico e Cabeça',
    'Visão e Olhos',
    'Ouvido, Nariz e Garganta (Otorrino)',
    'Cardiovascular',
    'Respiratório',
    'Digestivo e Abdominal',
    'Urinário e Renal',
    'Genital e Reprodutivo',
    'Músculos e Articulações',
    'Pele e Cabelos'
  ];
  groupOrder.forEach(groupName => {
    if (!groupedSymptoms[groupName]) return;

    const header = document.createElement('div');
    header.className = 'symptom-group-header collapsed';
    header.textContent = groupName;
    symptomsEl.appendChild(header);

    const panel = document.createElement('div');
    panel.className = 'symptom-group-panel collapsed';
    symptomsEl.appendChild(panel);

    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      panel.classList.toggle('collapsed');
    });

    const currentSex = document.getElementById('sexo').value; 

    groupedSymptoms[groupName].forEach(s => {
      // ==== NOVA LÓGICA DE FILTRO ====
      // Se o sintoma tem um filtro de sexo E ele é diferente do sexo atual, pule este sintoma.
      if (s.sexFilter && s.sexFilter !== currentSex) {
        return; 
      }
      // ===============================

      const wrapper = document.createElement('div');
      wrapper.className = 'symptom-wrapper';
    
      wrapper.dataset.symptomId = s.id;

      const labelEl = document.createElement('div');
      labelEl.className = 'symptom';
      const labelText = document.createElement('span');
      labelText.textContent = s.label;
      labelEl.appendChild(labelText);

      const sliderEl = document.createElement('div');
      sliderEl.className = 'symptom-slider';
      sliderEl.style.display = 'none';
      // Recriando o HTML do slider aqui para garantir
      sliderEl.innerHTML = `
        <div class="slider-wrap">
          <div class="slider" style="flex:1">
            <input type="range" min="0" max="10" value="5" data-symptom-id="${s.id}" />
          </div>
          <div style="width:72px; text-align:center">
            <div style="font-weight:700">5</div>
            <div class="small muted">Intensidade</div>
          </div>
        </div>`;
      wrapper.appendChild(labelEl);
      wrapper.appendChild(sliderEl);

      const sliderInput = sliderEl.querySelector('input[type=range]');
      const valueEl = sliderEl.querySelector('div[style*="font-weight:700"]');

      const qualifiers = SYMPTOM_QUALIFIERS[s.id];
      let popupEl = null;
      let toggleBtn = null; // Definir toggleBtn aqui

      if (qualifiers) {
        toggleBtn = document.createElement('span');
        // Atribuir aqui
        toggleBtn.className = 'qualifier-toggle';
        toggleBtn.textContent = '[+]';
        labelEl.appendChild(toggleBtn);

        popupEl = document.createElement('div');
        popupEl.className = 'qualifier-popup';
        popupEl.dataset.popupFor = s.id;

        // *** CORREÇÃO DO TEXTO ESTRANHO ***
       const sexoAtual = document.getElementById('sexo').value; // Pega o sexo selecionado
        
        qualifiers.forEach(q => {
          // SE o qualificador tem uma flag 'sex' E ela é DIFERENTE do sexoAtual, PULE este qualificador.
          if (q.sex && q.sex !== sexoAtual) {
            return; 
          }

          // Se passou no filtro, renderiza o qualificador
          popupEl.innerHTML += `
            <label>
              <input type="checkbox" id="chk_${s.id}_${q.id}" data-qualifier-id="${q.id}" data-parent-symptom="${s.id}"> ${q.label}
            </label>`;
        });
        // *** FIM CORREÇÃO ***


      wrapper.appendChild(popupEl);
      toggleBtn.addEventListener('click', (event) => {
          event.stopPropagation();
          const isVisible = popupEl.style.display === 'block';

          // Primeiro, reseta o z-index de TODOS os wrappers para o padrão
          document.querySelectorAll('.symptom-wrapper').forEach(wp => {
              wp.style.zIndex = '1'; // Ou 'auto'
          });

          
          if (isVisible) {
              // Se estava visível, apenas esconde e reseta z-index local
              popupEl.style.display = 'none';
              toggleBtn.textContent = '[+]';
              wrapper.style.zIndex = '1'; // Ou 'auto'
          } else {
            
            // Se estava escondido:
              // 1. Esconde QUALQUER outro popup que possa estar aberto
              document.querySelectorAll('.qualifier-popup').forEach(otherPopup => {
                  if (otherPopup !== popupEl) {
                      otherPopup.style.display = 'none';
          
                      // Encontra o botão [+] correspondente e reseta o texto
                      const otherWrapper = otherPopup.closest('.symptom-wrapper');
                      const otherToggle = otherWrapper ? otherWrapper.querySelector('.qualifier-toggle') : null;
                      if (otherToggle) {
                          otherToggle.textContent = '[+]';
                      }
                  }
              });
              // 2. Mostra ESTE popup
              popupEl.style.display = 'block';
              toggleBtn.textContent = '[-]';

              // 3. Aumenta o z-index APENAS deste wrapper
              wrapper.style.zIndex = '100';
              // Valor alto para o wrapper ativo
          }
      });
      } // Fim do if (qualifiers)

    // Adiciona position:relative ao wrapper se ainda não tiver (garante contexto)
    if (!wrapper.style.position) {
         wrapper.style.position = 'relative';
         wrapper.style.zIndex = '1'; // Z-index inicial baixo
    }

      sliderInput.addEventListener('input', ()=>{
          const v = Number(sliderInput.value);
          if (selectedSymptoms[s.id]) {
             selectedSymptoms[s.id].intensity = v;
          }
          valueEl.textContent = v;
      });
      // *** CORREÇÃO DO CLIQUE NO SINTOMA ***
      labelEl.addEventListener('click', (event)=>{
          // Verifica se o clique foi no botão [+] ou em algo dentro dele
          const clickedToggle = toggleBtn && (event.target === toggleBtn || toggleBtn.contains(event.target));

          if (!clickedToggle) { // Só executa se não clicou no [+]
              const isActive = labelEl.classList.toggle('active');
       
              if(isActive){
                  sliderEl.style.display = 'block';
                  const v = Number(sliderInput.value);
                  selectedSymptoms[s.id] = { intensity: v };
                  valueEl.textContent = v;
         
                  if (popupEl) {
                      popupEl.querySelectorAll('input[type="checkbox"]').forEach(chk => { chk.checked = true; });
                  }
              } else {
                  sliderEl.style.display = 'none';
       
                  delete selectedSymptoms[s.id];
                  if (popupEl) {
                      popupEl.style.display = 'none';
                      if(toggleBtn) {toggleBtn.textContent = '[+]';} // Reseta o botão [+]
                      popupEl.querySelectorAll('input[type="checkbox"]').forEach(chk => { chk.checked = false; });
                  }
              }
          }
      });
      // *** FIM CORREÇÃO ***

      panel.appendChild(wrapper);
    });
  });
}
// --- FIM ATUALIZAÇÃO ---

// render rules list (diseases)
function renderRulesList(){
  rulesListEl.innerHTML = '';
  DISEASES.forEach(d=>{
    const div = document.createElement('div');
    div.className = 'rule-row';
    const left = document.createElement('div');
    left.innerHTML = `<strong>${d.nome}</strong><div class="small muted">${d.descricao}</div>`;
    const right = document.createElement('div');
    right.innerHTML = `<span class="badge ${getSeverityBadgeClass(estimateSeverityFromDisease(d))}">${estimateSeverityFromDisease(d).toUpperCase()}</span>`;
    div.appendChild(left);
    div.appendChild(right);
    div.addEventListener('click', ()=> {
      alert(`${d.nome}\n\nSintomas-chave: ${d.sintomas.join(', ')}\n\nPeso dor: ${d.painWeight}\n\nDescrição: ${d.descricao}`);
    });
    rulesListEl.appendChild(div);
  });
}
function estimateSeverityFromDisease(d){
  if(d.painWeight>=0.85) return 'danger';
  const critical = ['infarto','apse','sepsis','meningite','pneumonia','apendicite'];
  if( /infarto|sepsis|meningite|pneumonia|apendicite/i.test(d.id) ) return 'danger';
  if(d.painWeight>=0.6) return 'warning';
  return 'info';
}
function getSeverityBadgeClass(s){ return s==='danger'?'danger':s==='warning'?'warning':'info'; }
function setConversationBot(text){
  const m = document.createElement('div'); m.className='msg bot';
  m.innerHTML = `<div class="bubble">${text}</div>`;
  conversationEl.appendChild(m);
  conversationEl.scrollTop = conversationEl.scrollHeight;
}
function setConversationUser(text){
  const m = document.createElement('div'); m.className='msg user';
  m.innerHTML = `<div class="bubble" style="background:#eef6ff;color:var(--primary)">${text}</div>`;
  conversationEl.appendChild(m);
  conversationEl.scrollTop = conversationEl.scrollHeight;
}
// initial prompt
setConversationBot('Olá! Preencha a demografia, fatores de risco, sintomas (+detalhes) e ajuste a intensidade. Clique em "Avaliar triagem".');
// ==== Motor de inferência ====
// --- ATUALIZADO COM LÓGICA DE QUALIFICADORES REFINADA ---
// ==== Motor de inferência ====
// --- ATUALIZADO (Completo e Sincronizado com data.js) ---
function evaluateDiseases(data){
  const logs = [];
  const computed = [];

  DISEASES.forEach(d => {
    const required = d.sintomas;
    // Filtra quais sintomas da doença o paciente marcou
    const matchedSymptoms = required.filter(s => data.sintomas[s] !== undefined);
    const matched = matchedSymptoms.length;

    // === TRAVA DE SEGURANÇA ===
    // Se não marcou nenhum sintoma da doença, ignora.
    if (matched === 0) return; 

    const total = Math.max(required.length,1);

    const symptomScore = (matched / total) * 60;

    const matchedIntensities = matchedSymptoms.map(id => data.sintomas[id].intensity);
    const maxIntensity = matchedIntensities.length > 0 ? Math.max(...matchedIntensities) : 0;
    const intensityNorm = (maxIntensity || 0) / 10;
    const intensityBonus = intensityNorm * 30 * (d.painWeight || 0);

    let demographicWeight = 0;
    const diseaseWeights = RISK_WEIGHTS[d.id];
    if (diseaseWeights) {
      let genderKey = data.sexo; // Usa o novo campo 'sexo'
      if (genderKey && diseaseWeights[genderKey]) {
         // Se existir regra para o sexo, usa. Se não, fallback para 'o' (segurança)
         const ageWeights = diseaseWeights[genderKey];
         if (ageWeights && ageWeights[data.faixa_etaria] !== undefined) {
            demographicWeight = ageWeights[data.faixa_etaria];
         }
      }
    }

    let riskFactorBonus = 0;
    if (data.riskFactors && data.riskFactors.length > 0) {
      data.riskFactors.forEach(riskId => {
        const factorData = RISK_FACTOR_BONUS[riskId];
        if (factorData && factorData[d.id]) {
          riskFactorBonus += factorData[d.id];
        }
      });
    }
    if (riskFactorBonus > 20) { riskFactorBonus = 20;
    }

    // --- LÓGICA DOS QUALIFICADORES ---
    let qualifierScore = 0;
    matchedSymptoms.forEach(symptomId => {
      const qualifiersData = data.qualifiers ? data.qualifiers[symptomId] : null;
      if (qualifiersData) { 

        // Tosse
        if (symptomId === 'tosse') {
          if (qualifiersData['seca'] === true) {
             if (['covid19', 'gripe', 'resfriado', 'asma', 'faringite'].includes(d.id)) qualifierScore += 3;
             if (['pneumonia', 'bronquite', 'dpoc', 'tuberculose'].includes(d.id)) qualifierScore -= 5;
          }
          if (qualifiersData['catarro'] === true) {
             if (['pneumonia', 'bronquite', 'dpoc', 'tuberculose', 'sinusite'].includes(d.id)) qualifierScore += 5;
             if (['asma', 'resfriado'].includes(d.id)) qualifierScore -= 3;
          }
          if (qualifiersData['sangue'] === true) {
             if (['tuberculose', 'pneumonia'].includes(d.id)) qualifierScore += 10;
             if (['resfriado', 'gripe', 'asma', 'faringite'].includes(d.id)) qualifierScore -= 10;
          }
        }

        // Dor Abdominal
        else if (symptomId === 'dor_abdominal') {
          if (qualifiersData['epigastrica'] === true) {
            if (['gastrite', 'ulcera', 'pancreatite', 'infarto'].includes(d.id)) qualifierScore += 7;
            if (['apendicite', 'colecistite', 'infeccao_urinaria'].includes(d.id)) qualifierScore -= 5;
          }
          if (qualifiersData['qid'] === true) {
            if (d.id === 'apendicite') qualifierScore += 15;
            if (['gastrite', 'ulcera', 'pancreatite'].includes(d.id)) qualifierScore -= 8;
          }
           if (qualifiersData['colica'] === true) {
            if (['gastroenterite', 'colecistite'].includes(d.id)) qualifierScore += 5;
            if (['apendicite', 'ulcera'].includes(d.id)) qualifierScore -= 5;
          }
          if (qualifiersData['difusa'] === true) {
             if (['gastroenterite'].includes(d.id)) qualifierScore += 3;
             if (['apendicite', 'colecistite', 'gastrite'].includes(d.id)) qualifierScore -= 3; 
          }
        }

        // Dor no Peito
        else if (symptomId === 'dor_peito') {
           if (qualifiersData['aperto'] === true) {
            if (['infarto', 'angina', 'doenca_coronariana'].includes(d.id)) qualifierScore += 10;
            if (['pneumonia', 'ansiedade'].includes(d.id)) qualifierScore -= 5;
          }
          if (qualifiersData['irradia'] === true) {
            if (['infarto', 'angina'].includes(d.id)) qualifierScore += 10;
            if (['pneumonia', 'ansiedade', 'gastrite'].includes(d.id)) qualifierScore -= 8;
          }
          if (qualifiersData['piora_resp'] === true) {
            if (['pneumonia'].includes(d.id)) qualifierScore += 8;
            if (['infarto', 'angina'].includes(d.id)) qualifierScore -= 15; 
          }
        }

        // Febre
        else if (symptomId === 'febre') {
           if (qualifiersData['alta'] === true) {
            if (['dengue', 'malaria', 'pneumonia', 'pielonefrite', 'meningite', 'sepsis', 'amigdalite', 'otite'].includes(d.id)) qualifierScore += 8;
            if (['resfriado', 'gastrite', 'ansiedade'].includes(d.id)) qualifierScore -= 5;
           } else if (qualifiersData['baixa'] === true) {
              if (['dengue', 'pneumonia', 'pielonefrite', 'meningite', 'sepsis'].includes(d.id)) qualifierScore -= 5;
           }
        }

        // Cefaleia
        else if (symptomId === 'cefaleia') {
          if (qualifiersData['intensa_subita'] === true) {
             if (['meningite', 'acidente_vascular', 'hipertensao_crise'].includes(d.id)) qualifierScore += 10;
             if (['resfriado', 'sinusite'].includes(d.id)) qualifierScore -= 5;
          }
          if (qualifiersData['pulsatil'] === true) {
             if (['hipertensao', 'enxaqueca'].includes(d.id)) qualifierScore += 3;
          }
          if (qualifiersData['nausea_vomito'] === true) {
             if (['meningite', 'acidente_vascular', 'hipertensao_crise', 'enxaqueca'].includes(d.id)) qualifierScore += 5;
             if (['resfriado', 'sinusite'].includes(d.id)) qualifierScore -= 3;
          }
          if (qualifiersData['com_aura'] === true && d.id === 'enxaqueca') qualifierScore += 15;
        }

        // Dispneia
        else if (symptomId === 'dispneia') {
           if (qualifiersData['repouso'] === true) {
             if (['pneumonia', 'covid19', 'dpoc', 'asma', 'sepsis', 'infarto', 'angina', 'panico'].includes(d.id)) qualifierScore += 10;
           }
           if (qualifiersData['esforco'] === true) {
               if (['anemia', 'dpoc', 'asma', 'doenca_coronariana'].includes(d.id)) qualifierScore += 5;
           }
           if (qualifiersData['chiado'] === true) {
              if (['asma', 'bronquite', 'dpoc'].includes(d.id)) qualifierScore += 10;
              if (['pneumonia', 'infarto'].includes(d.id)) qualifierScore -= 5;
           }
        }

        // Manchas na Pele
        else if (symptomId === 'manchas_pele') {
          if (qualifiersData['coceira'] === true) {
             if (['dermatite', 'varicela', 'urticaria'].includes(d.id)) qualifierScore += 8; 
             if (['dengue', 'sarampo', 'rubéola'].includes(d.id)) qualifierScore -= 3; 
          }
          if (qualifiersData['rash'] === true) {
             if (['dengue', 'zika', 'chikungunya', 'sarampo', 'rubéola', 'varicela'].includes(d.id)) qualifierScore += 5;
             if (['herpes'].includes(d.id)) qualifierScore -= 5; 
          }
          if (qualifiersData['petequias'] === true) {
             if (['dengue', 'meningite', 'sepsis'].includes(d.id)) qualifierScore += 15;
             if (['zika', 'rubéola', 'varicela', 'dermatite'].includes(d.id)) qualifierScore -= 10;
          }
           // Novos Qualificadores
           if (qualifiersData['rash_malar'] === true && d.id === 'lupus') qualifierScore += 15;
           if (qualifiersData['placas_prateadas'] === true && d.id === 'psoriase') qualifierScore += 15;
           if (qualifiersData['vergoes_elevados'] === true && d.id === 'urticaria') qualifierScore += 15;
           if (qualifiersData['nodulos_dolorosos'] === true && d.id === 'acne_grave') qualifierScore += 15;
        }

        // Vômito
        else if (symptomId === 'vomito') {
          if (qualifiersData['sangue_vom'] === true) {
             if (['ulcera', 'gastrite'].includes(d.id)) qualifierScore += 15;
             if (['gastroenterite', 'infeccao_urinaria', 'apendicite'].includes(d.id)) qualifierScore -= 10;
          }
          if (qualifiersData['jato'] === true) {
             if (['gastroenterite', 'pancreatite', 'meningite', 'acidente_vascular'].includes(d.id)) qualifierScore += 5;
          }
           if (qualifiersData['pos_comer'] === true) {
             if (['gastrite', 'ulcera', 'colecistite'].includes(d.id)) qualifierScore += 5;
           }
        }

        // Ansiedade Sintoma
        else if (symptomId === 'ansiedade_sintoma') {
            if (qualifiersData['foco_especifico'] === true && d.id === 'fobia_especifica') qualifierScore += 15;
            if (qualifiersData['ataques_subitos'] === true && d.id === 'panico') qualifierScore += 15;
            if (qualifiersData['preocupacao_cronica'] === true && d.id === 'tag') qualifierScore += 15;
        }
        
        // Dor Articular
        else if (symptomId === 'dor_articular') {
            if (qualifiersData['monoarticular_dedao'] === true && d.id === 'gota') qualifierScore += 15;
            if (qualifiersData['simetrica_pequenas_art'] === true && d.id === 'artrite_reumatoide') qualifierScore += 15;
        }
        
        // Dor Flanco
        else if (symptomId === 'dor_flanco') {
           if ((qualifiersData['irradia_virilha'] === true || qualifiersData['colica_intensa'] === true) && d.id === 'calculo_renal') qualifierScore += 15;
        }

        // Edema (Inchaço)
        else if (symptomId === 'edema') {
           if (qualifiersData['pernas_rosto'] === true && (['insuficiencia_renal', 'lupus'].includes(d.id))) qualifierScore += 10;
           if (qualifiersData['localizado_trauma'] === true && (['insuficiencia_renal', 'lupus'].includes(d.id))) qualifierScore -= 10;
        }

        // Rigidez Matinal
        else if (symptomId === 'rigidez_matinal') {
            if (qualifiersData['longa_duracao'] === true && d.id === 'artrite_reumatoide') qualifierScore += 15;
            if (qualifiersData['curta_duracao'] === true && d.id === 'artrose') qualifierScore += 10;
        }

        // Tontura
        else if (symptomId === 'tontura') {
            if (qualifiersData['rotatoria'] === true && d.id === 'labirintite') qualifierScore += 15;
            if (qualifiersData['pre_desmaio'] === true && (['anemia', 'hipotensao', 'panico'].includes(d.id))) qualifierScore += 5;
            if (qualifiersData['desequilibrio'] === true && (['labirintite', 'parkinson', 'acidente_vascular'].includes(d.id))) qualifierScore += 5;
        }
        
        // Prurido
        else if (symptomId === 'prurido') {
             if (qualifiersData['generalizado_renal'] === true && d.id === 'insuficiencia_renal') qualifierScore += 15;
             if (qualifiersData['localizado_placas'] === true && d.id === 'psoriase') qualifierScore += 10;
        }
        
        // Tremor
        else if (symptomId === 'tremor_repouso') {
            if (qualifiersData['piora_repouso'] === true && d.id === 'parkinson') qualifierScore += 15;
        }
        
        // Sangramento Uterino
        else if (symptomId === 'sangramento_uterino_anormal') {
             if ((qualifiersData['menstruacao_longa'] === true || qualifiersData['fluxo_intenso'] === true) && d.id === 'mioma_uterino') qualifierScore += 10;
        }
        
        // Sudorese (Novo)
        else if (symptomId === 'sudorese') {
            if (qualifiersData['noturno'] === true && (['tuberculose', 'labirintite'].includes(d.id))) qualifierScore += 5;
            if (qualifiersData['frio'] === true && (['infarto', 'panico', 'sepsis'].includes(d.id))) qualifierScore += 5;
        }

      } // Fim if(qualifiersData)
    });
    // Fim forEach matchedSymptoms

    if (qualifierScore > 15) qualifierScore = 15;
    if (qualifierScore < -15) qualifierScore = -15;

    const extra = (matched >= Math.ceil(total/2)) ? 2 : 0;

    let finalScore = symptomScore + intensityBonus + demographicWeight + riskFactorBonus + qualifierScore + extra;
    if(finalScore > 100) finalScore = 100;
    if(finalScore < 0) finalScore = 0;

    let label = 'Baixa';
    if(finalScore >= 65) label = 'Alta';
    else if(finalScore >= 35) label = 'Média';
    const log = {
      id: d.id, nome: d.nome, matched, total,
      symptomScore: round(symptomScore), intensityBonus: round(intensityBonus),
      demographicWeight: demographicWeight, riskFactorBonus: riskFactorBonus,
      qualifierScore: qualifierScore, extra, finalScore: round(finalScore), label,
      sintomas: required, painWeight: d.painWeight
    };
    logs.push(log);
    computed.push(Object.assign({}, d, {score:round(finalScore), label}));
  });

  computed.sort((a,b)=>b.score - a.score);
  return {logs, computed};
}

function round(n){ return Math.round((n + Number.EPSILON) * 10) / 10; }

function btnNextClickHandler() {
  const faixaEtariaEl = document.getElementById('faixa_etaria');
  const faixaEtariaStr = faixaEtariaEl.value; 
  const faixaEtariaLabel = faixaEtariaEl.options[faixaEtariaEl.selectedIndex].text;
  
  const sexo = document.getElementById('sexo').value; 
  
  // Coleta sintomas
  const sintomas = selectedSymptoms;
  
  // Coleta fatores de risco
  const riskFactors = [];
  document.querySelectorAll('.risk-factor-item input:checked').forEach(chk => {
      riskFactors.push(chk.id.replace('chk_', ''));
  });
  
  // Coleta qualificadores
  const qualifiers = {};
  Object.keys(selectedSymptoms).forEach(symptomId => { 
    const symptomQualifiers = SYMPTOM_QUALIFIERS[symptomId];
    if (symptomQualifiers) { 
      qualifiers[symptomId] = {}; 
      symptomQualifiers.forEach(q => {
        const chkId = `chk_${symptomId}_${q.id}`;
        const checkboxEl = document.getElementById(chkId);
        if (checkboxEl) { 
           qualifiers[symptomId][q.id] = checkboxEl.checked; 
        }
      });
    }
  });

  const data = {
    faixa_etaria: faixaEtariaStr,
    sexo: sexo, 
    sintomas: sintomas, 
    riskFactors: riskFactors,
    qualifiers: qualifiers 
  };

  const sintomasTxt = Object.keys(sintomas).length > 0
    ? Object.keys(sintomas).map(k => `${SYMPTOMS.find(s=>s.id===k).label} (int: ${sintomas[k].intensity})`).join(', ')
    : 'nenhum';
  
  setConversationUser(`Sexo: ${sexo === 'f' ? 'Feminino' : 'Masculino'} — Faixa: ${faixaEtariaLabel} — Riscos: ${riskFactors.join(', ') || 'nenhum'} — Sintomas: ${sintomasTxt}`);

  const {logs, computed} = evaluateDiseases(data);

  // update logs
  rawDataEl.textContent = JSON.stringify(data, null, 2);
  engineLogEl.innerHTML = '';
  
  logs.forEach(l=>{
    const div = document.createElement('div');
    div.style.padding='8px';
    div.style.borderBottom='1px dashed #eef5ff';
    div.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div><strong>${l.nome}</strong> <span class="small muted">(${l.id})</span></div>
      <div style="text-align:right;"><span style="font-weight:700">${l.finalScore}%</span> — <span class="muted small">${l.label}</span></div>
    </div>
    <div class="small muted" style="margin-top:6px">Sintomas correspondentes: ${l.matched}/${l.total}</div>
    <div class="small muted">Detalhes: sint=${l.symptomScore}pts, intens=${l.intensityBonus}pts, demo=${l.demographicWeight}pts, risco=${l.riskFactorBonus}pts, quali=${l.qualifierScore}pts, extra=${l.extra}pts</div>
    `;
    engineLogEl.appendChild(div);
  });

  // Renderiza Resultados
  resultsEl.innerHTML = '';
  const threshold = 0;
  const toShow = computed.filter((c,i)=> (c.score > threshold) || i<5 ).slice(0,20);

  // SE NÃO TIVER RESULTADOS
  if(toShow.length===0 || toShow[0].score <= threshold){
    setConversationBot('Nenhuma doença atingiu probabilidade significativa com os dados fornecidos.');
    resultsEl.innerHTML = `<div class="muted">Nenhuma correspondência forte.</div>`;
    lastSummaryEl.textContent = 'Sem encaminhamentos';
    setPriorityCard([], data);
    lastTriagem = {data, logs, computed, timestamp: new Date().toISOString()};
    return;
  }

  // SE TIVER RESULTADOS
  const topDisease = toShow[0];
  setConversationBot(`A doença mais provável é <strong>${topDisease.nome}</strong> com <strong>${topDisease.score}%</strong>. Veja a lista abaixo.`);
  
  toShow.forEach(d=>{
    const cls = d.score >= 65 ? 'danger' : d.score >= 35 ? 'warning' : 'info';
    const card = document.createElement('div');
    card.className = 'dcard ' + cls;
    card.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${d.nome} <span class="small muted">(${d.id})</span></div>
        <div class="small muted" style="margin-top:6px">${d.descricao || ''}</div>
      </div>
      <div style="width:160px;text-align:right">
        <div style="font-weight:800">${d.score}%</div>
        <div class="small muted">${d.label}</div>
        <div style="height:8px"></div>
        <div class="percent-bar"><div class="percent-fill" style="width:${d.score}%;background:${progressColor(d.score)}"></div></div>
      </div>
    `;
    resultsEl.appendChild(card);
  });
  
  lastSummaryEl.textContent = `${toShow.length} doenças listadas — maior: ${toShow[0].nome} (${toShow[0].score}%)`;
  setPriorityCard(toShow, data);
  lastTriagem = {data, logs, computed, timestamp: new Date().toISOString()};

  // === SCROLL UNIVERSAL (Tenta rolar TUDO para baixo) ===
  setTimeout(() => {
     // 1. Pega a altura total da página
     const totalHeight = document.body.scrollHeight;
     
     // 2. Tenta rolar a Janela
     window.scrollTo({ top: totalHeight, behavior: 'smooth' });
     
     // 3. Tenta rolar o HTML (Firefox/IE às vezes usa isso)
     document.documentElement.scrollTop = totalHeight;
     
     // 4. Tenta rolar o Body (Safari antigo/Chrome às vezes usa isso)
     document.body.scrollTop = totalHeight;
     
     // 5. Garante com scrollIntoView no último elemento
     const lastCard = resultsEl.lastElementChild;
     if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'end' });

  }, 300);
}
document.getElementById('btnNext').addEventListener('click', btnNextClickHandler);

function setPriorityCard(list, data){
  const allIntensities = Object.values(data.sintomas).map(s => s.intensity); // Corrigido para pegar a intensidade de dentro do objeto
  const maxUserIntensity = allIntensities.length > 0 ? Math.max(...allIntensities) : 0;
  
  let pr = 'Baixa';
  
  // Encontra a doença de maior pontuação
  const topScore = list.length > 0 ? list[0].score : 0;

  if(topScore >= 75 && maxUserIntensity >= 7) {
      pr = 'Alta';
  } else if (list.some(d => d.id === 'infarto' && d.score >= 50)) { // Regra específica de exemplo
      pr = 'Alta';
  } else if(topScore >= 60 || maxUserIntensity >= 8) {
      pr = 'Média';
  } else if (topScore < 30) {
     pr = 'Muito Baixa';
  }

  if(pr==='Alta'){
    priorityLabelEl.textContent = 'ALTA PRIORIDADE';
    priorityDescEl.textContent = 'Encaminhar imediatamente. Sintomas e demografia indicam risco elevado.';
    priorityBadgeEl.textContent = 'URGENTE'; priorityBadgeEl.className='badge danger';
    document.getElementById('priorityCard').className='dcard danger';
  } else if(pr==='Média'){
    priorityLabelEl.textContent = 'PRIORIDADE MÉDIA';
    priorityDescEl.textContent = 'Monitorar e considerar encaminhamento conforme evolução.';
    priorityBadgeEl.textContent = 'ATENÇÃO'; priorityBadgeEl.className='badge warning';
    document.getElementById('priorityCard').className='dcard warning';
  } else { 
    priorityLabelEl.textContent = 'BAIXA PRIORIDADE';
    if(pr === 'Muito Baixa') {
        priorityDescEl.textContent = 'Sintomas leves. Orientação domiciliar.';
    } else {
        priorityDescEl.textContent = 'Orientação domiciliar / acompanhamento.';
    }
    priorityBadgeEl.textContent = 'INFO';
    priorityBadgeEl.className='badge info';
    document.getElementById('priorityCard').className='dcard info';
  }
}


// helper: color gradient for percent
function progressColor(p){
  if(p>=65) return 'linear-gradient(90deg,#ff6b6b,#ef4444)';
  if(p>=35) return 'linear-gradient(90deg,#f59e0b,#ffb84d)';
  return 'linear-gradient(90deg,#10B981,#3ddc8b)';
}
document.getElementById('exportBtn').addEventListener('click', ()=>{
  if(!lastTriagem){ alert('Nenhuma triagem para exportar.'); return; }
  const blob = new Blob([JSON.stringify(lastTriagem, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `triagem_${new Date().toISOString().replace(/[:\.]/g,'-')}.json`;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
function btnResetClickHandler() {
  // Reseta demografia
  document.getElementById('faixa_etaria').value = '29-33';
  document.getElementById('sexo').value = 'f';
  // Limpa objeto de sintomas selecionados
  selectedSymptoms = {};
  // Limpa os fatores de risco
  document.querySelectorAll('.risk-factor-item input[type="checkbox"]').forEach(cb => cb.checked = false);
  // Fecha todos os popups de qualificadores abertos e reseta botões [+]
  document.querySelectorAll('.qualifier-popup').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.qualifier-toggle').forEach(t => t.textContent = '[+]');

  // Re-renderiza a lista de sintomas para limpar visualmente (sliders, ativos, qualificadores)
  renderSymptoms();
  // Limpa a conversa e adiciona mensagem inicial
  conversationEl.innerHTML = '';
  setConversationBot('Triagem reiniciada. Preencha os dados e clique em "Avaliar triagem".');

  // Limpa os resultados e logs
  resultsEl.innerHTML = '';
  engineLogEl.innerHTML = '';
  rawDataEl.textContent = '{}';

  // Reseta o card de prioridade
  priorityLabelEl.textContent = 'Sem dados';
  priorityDescEl.textContent = 'Realize uma triagem para ver o resultado';
  priorityBadgeEl.textContent = '—';
  priorityBadgeEl.className = 'badge info';
  document.getElementById('priorityCard').className = 'dcard info';
  // Reset class

  // Limpa o resumo da última triagem
  lastSummaryEl.textContent = 'nenhuma';
  lastTriagem = null;
}
document.getElementById('btnReset').addEventListener('click', btnResetClickHandler);
// --- CORREÇÃO: Tab Switcher ---
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=> {
    document.querySelectorAll('.qualifier-popup').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.qualifier-toggle').forEach(t => t.textContent = '[+]');
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    const target = t.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(tc=>tc.classList.remove('active'));
    document.getElementById(target).classList.add('active');
  });
});
// ==== NOVA ADIÇÃO (PASSO 2) ====
// Força a re-renderização dos sintomas ao trocar o sexo,
// para garantir que os qualificadores corretos apareçam.
document.getElementById('sexo').addEventListener('change', () => {
    selectedSymptoms = {}; // Limpa a seleção atual para evitar bugs
    renderSymptoms();
});
// ==== FIM DA NOVA ADIÇÃO ====

SYMPTOMS.sort((a, b) => a.label.localeCompare(b.label));

// initial renders
renderSymptoms();
renderRulesList();
