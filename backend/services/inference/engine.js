// ============================================================
// ACS-Expert — Motor de Inferência (Node.js)
//
// Porta fiel da função `evaluateDiseases` do app.js original.
// Fórmula de score:
//
//   finalScore = symptomScore
//              + intensityBonus
//              + demographicWeight
//              + riskFactorBonus (cap +20)
//              + qualifierScore  (cap ±15)
//              + extra
//
//   clamp [0, 100]
//   label: >=65 "Alta", >=35 "Média", senão "Baixa"
//
// Entrada (payload):
//   {
//     faixa_etaria: '0-18' | '19-23' | ... | '59+',
//     sexo:         'm' | 'f' | 'o',
//     sintomas:     { [symptomId]: { intensity: number 0-10 } },
//     riskFactors:  [ 'fumante', 'hipertenso', ... ],
//     qualifiers:   { [symptomId]: { [qualifierId]: boolean } }
//   }
//
// Saída:
//   { computed: [...doenças com score, ordenadas desc],
//     logs:     [...breakdown por doença] }
// ============================================================

const DISEASES          = require('./diseases.json');
const RISK_WEIGHTS      = require('./risk_weights.json');
const RISK_FACTOR_BONUS = require('./risk_factor_bonus.json');

function round(n) {
  return Math.round((n + Number.EPSILON) * 10) / 10;
}

function clamp(value, min, max) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}

// ============================================================
// Qualificadores — reproduz EXATAMENTE as regras do app.js
// ============================================================
function computeQualifierScore(matchedSymptoms, qualifiers, diseaseId) {
  let score = 0;

  for (const symptomId of matchedSymptoms) {
    const q = qualifiers && qualifiers[symptomId];
    if (!q) continue;

    switch (symptomId) {
      case 'tosse':
        if (q.seca) {
          if (['covid19', 'gripe', 'resfriado', 'asma', 'faringite'].includes(diseaseId)) score += 3;
          if (['pneumonia', 'bronquite', 'dpoc', 'tuberculose'].includes(diseaseId))      score -= 5;
        }
        if (q.catarro) {
          if (['pneumonia', 'bronquite', 'dpoc', 'tuberculose', 'sinusite'].includes(diseaseId)) score += 5;
          if (['asma', 'resfriado'].includes(diseaseId))                                          score -= 3;
        }
        if (q.sangue) {
          if (['tuberculose', 'pneumonia'].includes(diseaseId))                     score += 10;
          if (['resfriado', 'gripe', 'asma', 'faringite'].includes(diseaseId))      score -= 10;
        }
        break;

      case 'dor_abdominal':
        if (q.epigastrica) {
          if (['gastrite', 'ulcera', 'pancreatite', 'infarto'].includes(diseaseId))    score += 7;
          if (['apendicite', 'colecistite', 'infeccao_urinaria'].includes(diseaseId))  score -= 5;
        }
        if (q.qid) {
          if (diseaseId === 'apendicite')                                      score += 15;
          if (['gastrite', 'ulcera', 'pancreatite'].includes(diseaseId))       score -= 8;
        }
        if (q.colica) {
          if (['gastroenterite', 'colecistite'].includes(diseaseId))           score += 5;
          if (['apendicite', 'ulcera'].includes(diseaseId))                    score -= 5;
        }
        if (q.difusa) {
          if (['gastroenterite'].includes(diseaseId))                          score += 3;
          if (['apendicite', 'colecistite', 'gastrite'].includes(diseaseId))   score -= 3;
        }
        break;

      case 'dor_peito':
        if (q.aperto) {
          if (['infarto', 'angina', 'doenca_coronariana'].includes(diseaseId)) score += 10;
          if (['pneumonia', 'ansiedade'].includes(diseaseId))                  score -= 5;
        }
        if (q.irradia) {
          if (['infarto', 'angina'].includes(diseaseId))                       score += 10;
          if (['pneumonia', 'ansiedade', 'gastrite'].includes(diseaseId))      score -= 8;
        }
        if (q.piora_resp) {
          if (['pneumonia'].includes(diseaseId))                               score += 8;
          if (['infarto', 'angina'].includes(diseaseId))                       score -= 15;
        }
        break;

      case 'febre':
        if (q.alta) {
          if (['dengue', 'malaria', 'pneumonia', 'pielonefrite', 'meningite', 'sepsis', 'amigdalite', 'otite'].includes(diseaseId)) score += 8;
          if (['resfriado', 'gastrite', 'ansiedade'].includes(diseaseId))                                                           score -= 5;
        } else if (q.baixa) {
          if (['dengue', 'pneumonia', 'pielonefrite', 'meningite', 'sepsis'].includes(diseaseId)) score -= 5;
        }
        break;

      case 'cefaleia':
        if (q.intensa_subita) {
          if (['meningite', 'acidente_vascular', 'hipertensao_crise'].includes(diseaseId)) score += 10;
          if (['resfriado', 'sinusite'].includes(diseaseId))                               score -= 5;
        }
        if (q.pulsatil) {
          if (['hipertensao', 'enxaqueca'].includes(diseaseId))                            score += 3;
        }
        if (q.nausea_vomito) {
          if (['meningite', 'acidente_vascular', 'hipertensao_crise', 'enxaqueca'].includes(diseaseId)) score += 5;
          if (['resfriado', 'sinusite'].includes(diseaseId))                                            score -= 3;
        }
        if (q.com_aura && diseaseId === 'enxaqueca') score += 15;
        break;

      case 'dispneia':
        if (q.repouso) {
          if (['pneumonia', 'covid19', 'dpoc', 'asma', 'sepsis', 'infarto', 'angina', 'panico'].includes(diseaseId)) score += 10;
        }
        if (q.esforco) {
          if (['anemia', 'dpoc', 'asma', 'doenca_coronariana'].includes(diseaseId))  score += 5;
        }
        if (q.chiado) {
          if (['asma', 'bronquite', 'dpoc'].includes(diseaseId))                     score += 10;
          if (['pneumonia', 'infarto'].includes(diseaseId))                          score -= 5;
        }
        break;

      case 'manchas_pele':
        if (q.coceira) {
          if (['dermatite', 'varicela', 'urticaria'].includes(diseaseId))            score += 8;
          if (['dengue', 'sarampo', 'rubéola'].includes(diseaseId))                  score -= 3;
        }
        if (q.rash) {
          if (['dengue', 'zika', 'chikungunya', 'sarampo', 'rubéola', 'varicela'].includes(diseaseId)) score += 5;
          if (['herpes'].includes(diseaseId))                                                          score -= 5;
        }
        if (q.petequias) {
          if (['dengue', 'meningite', 'sepsis'].includes(diseaseId))                 score += 15;
          if (['zika', 'rubéola', 'varicela', 'dermatite'].includes(diseaseId))      score -= 10;
        }
        if (q.rash_malar        && diseaseId === 'lupus')       score += 15;
        if (q.placas_prateadas  && diseaseId === 'psoriase')    score += 15;
        if (q.vergoes_elevados  && diseaseId === 'urticaria')   score += 15;
        if (q.nodulos_dolorosos && diseaseId === 'acne_grave')  score += 15;
        break;

      case 'vomito':
        if (q.sangue_vom) {
          if (['ulcera', 'gastrite'].includes(diseaseId))                            score += 15;
          if (['gastroenterite', 'infeccao_urinaria', 'apendicite'].includes(diseaseId)) score -= 10;
        }
        if (q.jato) {
          if (['gastroenterite', 'pancreatite', 'meningite', 'acidente_vascular'].includes(diseaseId)) score += 5;
        }
        if (q.pos_comer) {
          if (['gastrite', 'ulcera', 'colecistite'].includes(diseaseId))             score += 5;
        }
        break;

      case 'ansiedade_sintoma':
        if (q.foco_especifico     && diseaseId === 'fobia_especifica') score += 15;
        if (q.ataques_subitos     && diseaseId === 'panico')           score += 15;
        if (q.preocupacao_cronica && diseaseId === 'tag')              score += 15;
        break;

      case 'dor_articular':
        if (q.monoarticular_dedao      && diseaseId === 'gota')                 score += 15;
        if (q.simetrica_pequenas_art   && diseaseId === 'artrite_reumatoide')   score += 15;
        break;

      case 'dor_flanco':
        if ((q.irradia_virilha || q.colica_intensa) && diseaseId === 'calculo_renal') score += 15;
        break;

      case 'edema':
        if (q.pernas_rosto      && ['insuficiencia_renal', 'lupus'].includes(diseaseId)) score += 10;
        if (q.localizado_trauma && ['insuficiencia_renal', 'lupus'].includes(diseaseId)) score -= 10;
        break;

      case 'rigidez_matinal':
        if (q.longa_duracao && diseaseId === 'artrite_reumatoide') score += 15;
        if (q.curta_duracao && diseaseId === 'artrose')            score += 10;
        break;

      case 'tontura':
        if (q.rotatoria     && diseaseId === 'labirintite')                                     score += 15;
        if (q.pre_desmaio   && ['anemia', 'hipotensao', 'panico'].includes(diseaseId))          score += 5;
        if (q.desequilibrio && ['labirintite', 'parkinson', 'acidente_vascular'].includes(diseaseId)) score += 5;
        break;

      case 'prurido':
        if (q.generalizado_renal && diseaseId === 'insuficiencia_renal') score += 15;
        if (q.localizado_placas  && diseaseId === 'psoriase')            score += 10;
        break;

      case 'tremor_repouso':
        if (q.piora_repouso && diseaseId === 'parkinson') score += 15;
        break;

      case 'sangramento_uterino_anormal':
        if ((q.menstruacao_longa || q.fluxo_intenso) && diseaseId === 'mioma_uterino') score += 10;
        break;

      case 'sudorese':
        if (q.noturno && ['tuberculose', 'labirintite'].includes(diseaseId))     score += 5;
        if (q.frio    && ['infarto', 'panico', 'sepsis'].includes(diseaseId))    score += 5;
        break;

      default:
        // Sintomas sem regras de qualificador: sem efeito
        break;
    }
  }

  return score;
}

// ============================================================
// Avaliação principal
// ============================================================
function evaluate(payload = {}) {
  const {
    faixa_etaria,
    sexo,
    sintomas    = {},
    riskFactors = [],
    qualifiers  = {},
  } = payload;

  const logs     = [];
  const computed = [];

  for (const d of DISEASES) {
    const required        = d.sintomas;
    const matchedSymptoms = required.filter((s) => sintomas[s] !== undefined);
    const matched         = matchedSymptoms.length;

    // Trava: se não marcou nenhum sintoma da doença, ignora
    if (matched === 0) continue;

    const total = Math.max(required.length, 1);

    // ── Score de sintomas (até 60 pts) ──────────────────────
    const symptomScore = (matched / total) * 60;

    // ── Bônus de intensidade (até 30 * painWeight) ──────────
    const matchedIntensities = matchedSymptoms.map((id) => sintomas[id].intensity);
    const maxIntensity       = matchedIntensities.length > 0 ? Math.max(...matchedIntensities) : 0;
    const intensityNorm      = (maxIntensity || 0) / 10;
    const intensityBonus     = intensityNorm * 30 * (d.painWeight || 0);

    // ── Peso demográfico (RISK_WEIGHTS[disease][sexo][faixa]) ─
    let demographicWeight = 0;
    const dw = RISK_WEIGHTS[d.id];
    if (dw && sexo && dw[sexo]) {
      const ageW = dw[sexo];
      if (ageW && ageW[faixa_etaria] !== undefined) {
        demographicWeight = ageW[faixa_etaria];
      }
    }

    // ── Bônus de fatores de risco (cap +20) ─────────────────
    let riskFactorBonus = 0;
    for (const riskId of riskFactors) {
      const factor = RISK_FACTOR_BONUS[riskId];
      if (factor && factor[d.id]) riskFactorBonus += factor[d.id];
    }
    if (riskFactorBonus > 20) riskFactorBonus = 20;

    // ── Score de qualificadores (cap ±15) ───────────────────
    let qualifierScore = computeQualifierScore(matchedSymptoms, qualifiers, d.id);
    qualifierScore = clamp(qualifierScore, -15, 15);

    // ── Extra por cobertura (+2 se ≥ metade dos sintomas) ───
    const extra = matched >= Math.ceil(total / 2) ? 2 : 0;

    // ── Score final ─────────────────────────────────────────
    let finalScore = symptomScore + intensityBonus + demographicWeight + riskFactorBonus + qualifierScore + extra;
    finalScore = clamp(finalScore, 0, 100);

    let label = 'Baixa';
    if (finalScore >= 65)      label = 'Alta';
    else if (finalScore >= 35) label = 'Média';

    logs.push({
      id:               d.id,
      nome:             d.nome,
      matched,
      total,
      symptomScore:     round(symptomScore),
      intensityBonus:   round(intensityBonus),
      demographicWeight,
      riskFactorBonus,
      qualifierScore,
      extra,
      finalScore:       round(finalScore),
      label,
      sintomas:         required,
      painWeight:       d.painWeight,
    });

    computed.push(Object.assign({}, d, {
      score: round(finalScore),
      label,
    }));
  }

  computed.sort((a, b) => b.score - a.score);
  return { logs, computed };
}

module.exports = {
  evaluate,
  // expostos para testes / inspeção
  _round:                  round,
  _computeQualifierScore:  computeQualifierScore,
};
