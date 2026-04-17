import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, Loader2, AlertCircle, MapPin, ClipboardList, FileText, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { RiskBadge } from '../components/RiskBadge';
import {
  pacientesService,
  calcularIdade,
  riscoToUI,
  type PacienteDetalhe,
} from '@/services/pacientesService';
import type { Comorbidade } from '@/types';

const COMORBIDADE_LABEL: Record<Comorbidade, string> = {
  fumante:          'Fumante',
  hipertenso:       'Hipertenso(a)',
  diabetico:        'Diabético(a)',
  obeso:            'Obeso(a)',
  asmatico:         'Asmático(a)',
  gestante:         'Gestante',
  cardiopata:       'Cardiopata',
  dpoc:             'DPOC',
  imunossuprimido:  'Imunossuprimido(a)',
};

function formatarCPF(cpf?: string) {
  if (!cpf) return '—';
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatarCNS(cns?: string) {
  if (!cns) return '—';
  const d = cns.replace(/\D/g, '');
  if (d.length !== 15) return cns;
  return `${d.slice(0, 3)} ${d.slice(3, 7)} ${d.slice(7, 11)} ${d.slice(11)}`;
}

// Estruturas de placeholder para quando os endpoints ainda não existem
type TriagemTimeline = {
  id: number;
  data: string;
  risco: 'urgent' | 'warning' | 'low';
  score: number;
  sintomas: string[];
  acao: string;
  status: 'realizado' | 'pendente';
};

type EncaminhamentoItem = {
  id: number;
  data: string;
  tipo: string;
  status: 'realizado' | 'pendente' | 'ausencia' | 'cancelado';
};

export function PerfilPaciente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [paciente, setPaciente] = useState<PacienteDetalhe | null>(null);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState<string | null>(null);

  // Placeholders enquanto não existem os endpoints
  const [triagens]        = useState<TriagemTimeline[]>([]);
  const [encaminhamentos] = useState<EncaminhamentoItem[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelado = false;
    setLoading(true);
    setErro(null);
    pacientesService.buscarPorId(Number(id))
      .then(({ data }) => { if (!cancelado) setPaciente(data); })
      .catch((err) => {
        if (!cancelado) setErro(err?.response?.data?.message ?? 'Erro ao carregar paciente.');
      })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center gap-2 text-acs-ink-3">
        <Loader2 size={20} className="animate-spin" />
        Carregando paciente...
      </div>
    );
  }

  if (erro || !paciente) {
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-acs-ink mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="flex items-start gap-3 bg-acs-vermelho-100 border border-[#FECACA] rounded-xl p-4">
          <AlertCircle size={18} className="text-acs-vermelho flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#B91C1C]">{erro ?? 'Paciente não encontrado.'}</p>
        </div>
      </div>
    );
  }

  const risco    = riscoToUI(paciente.nivel_risco);
  const idade    = calcularIdade(paciente.data_nascimento);
  const endereco = [paciente.logradouro, paciente.numero].filter(Boolean).join(', ');
  const riscoLabel =
    paciente.nivel_risco === 'alto'     ? 'ALTO RISCO'     :
    paciente.nivel_risco === 'moderado' ? 'RISCO MODERADO' :
                                          'BAIXO RISCO';

  const bandeirasSociais = [
    paciente.idoso_mora_sozinho     && 'Idoso mora sozinho',
    paciente.vulnerabilidade_social && 'Vulnerabilidade social',
    paciente.dificuldade_locomocao  && 'Dificuldade de locomoção',
    paciente.beneficio_social       && 'Beneficiário de programa social',
  ].filter(Boolean) as string[];

  const irParaEditar = () => {
    navigate(`/paciente/${paciente.id}/editar`);
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-28">
      {/* Header */}
      <div className="bg-white border-b border-acs-line px-6 py-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button onClick={() => navigate(-1)} aria-label="Voltar">
              <ArrowLeft size={24} className="text-acs-ink" />
            </button>
            <h2 className="font-display font-bold text-acs-ink truncate">{paciente.nome}</h2>
          </div>
          <button
            onClick={irParaEditar}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-acs-azul text-acs-azul text-sm font-medium hover:bg-[#F0F9FF] transition-colors"
          >
            <Pencil size={16} /> Editar
          </button>
        </div>
        <RiskBadge level={risco} label={riscoLabel} />
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Dados resumidos */}
        <div className="bg-white rounded-xl p-4 border border-acs-line" style={{ boxShadow: '0 1px 2px rgba(10,20,40,.06)' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-acs-ink-3">Idade</p>
              <p className="font-semibold text-acs-ink">{idade} anos</p>
            </div>
            <div>
              <p className="text-xs text-acs-ink-3">Sexo</p>
              <p className="font-semibold text-acs-ink">
                {paciente.sexo === 'm' ? 'Masculino' : 'Feminino'}
              </p>
            </div>
            <div>
              <p className="text-xs text-acs-ink-3">CPF</p>
              <p className="font-semibold text-acs-ink">{formatarCPF(paciente.cpf)}</p>
            </div>
            <div>
              <p className="text-xs text-acs-ink-3">CNS</p>
              <p className="font-semibold text-acs-ink">{formatarCNS(paciente.cns)}</p>
            </div>
            <div>
              <p className="text-xs text-acs-ink-3">Microárea</p>
              <p className="font-semibold text-acs-ink">{paciente.microarea_nome ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-acs-ink-3">ACS responsável</p>
              <p className="font-semibold text-acs-ink">{paciente.acs_nome ?? 'Não atribuído'}</p>
            </div>
          </div>
        </div>

        {/* Endereço */}
        {(endereco || paciente.bairro || paciente.cep || paciente.nome_referencia) && (
          <div>
            <h3 className="font-display font-semibold text-acs-ink mb-3">Endereço</h3>
            <div className="bg-white rounded-xl p-4 border border-acs-line" style={{ boxShadow: '0 1px 2px rgba(10,20,40,.06)' }}>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-acs-ink-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-acs-ink space-y-0.5">
                  <p>{endereco || '—'}</p>
                  {paciente.complemento && <p className="text-acs-ink-3">{paciente.complemento}</p>}
                  {(paciente.bairro || paciente.cep) && (
                    <p className="text-acs-ink-3">
                      {[paciente.bairro, paciente.cep].filter(Boolean).join(' — ')}
                    </p>
                  )}
                  {paciente.nome_referencia && (
                    <p className="text-xs text-acs-ink-3 mt-1 italic">
                      Ref.: {paciente.nome_referencia}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contexto social */}
        {bandeirasSociais.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-acs-ink mb-3">Contexto social</h3>
            <div className="flex flex-wrap gap-2">
              {bandeirasSociais.map((b) => (
                <span
                  key={b}
                  className="px-3 py-1.5 bg-acs-amar-100 text-[#92400E] rounded-full text-sm font-medium border border-acs-amar"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comorbidades */}
        <div>
          <h3 className="font-display font-semibold text-acs-ink mb-3">Comorbidades</h3>
          {paciente.comorbidades && paciente.comorbidades.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {paciente.comorbidades.map((c) => (
                <span
                  key={c}
                  className="px-3 py-1.5 bg-[#E0E7FF] text-[#3730A3] rounded-full text-sm font-medium border border-[#6366F1]"
                >
                  {COMORBIDADE_LABEL[c] ?? c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-acs-ink-3">Nenhuma comorbidade registrada.</p>
          )}
        </div>

        {/* Histórico de Triagens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-acs-ink">Histórico de Triagens</h3>
            {triagens.length > 0 && (
              <span className="text-xs text-acs-ink-3">{triagens.length} registro(s)</span>
            )}
          </div>

          {triagens.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-dashed border-acs-line text-center">
              <ClipboardList size={28} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-acs-ink-3 mb-1">Nenhuma triagem registrada</p>
              <p className="text-xs text-[#94A3B8] mb-4">
                As triagens realizadas com este paciente aparecerão aqui.
              </p>
              <button
                onClick={() => navigate(`/triagem/${paciente.id}/passo1`)}
                className="text-sm text-acs-azul font-medium hover:underline"
              >
                Iniciar primeira triagem →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {triagens.map((triagem, index) => (
                <div key={triagem.id} className="relative">
                  {index < triagens.length - 1 && (
                    <div className="absolute left-3 top-10 bottom-0 w-0.5 bg-acs-line" />
                  )}
                  <div className="flex gap-4">
                    <div className="relative z-10">
                      <div
                        className="w-6 h-6 rounded-full border-4 border-white"
                        style={{
                          backgroundColor:
                            triagem.risco === 'urgent'  ? 'var(--acs-vermelho)' :
                            triagem.risco === 'warning' ? 'var(--acs-amar)' : 'var(--acs-verde)',
                        }}
                      />
                    </div>
                    <div className="flex-1 bg-white rounded-xl p-4 border border-acs-line" style={{ boxShadow: '0 1px 2px rgba(10,20,40,.06)' }}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-acs-ink">{triagem.data}</p>
                        <RiskBadge level={triagem.risco} label={`${triagem.score}%`} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {triagem.sintomas.slice(0, 3).map((s) => (
                          <span key={s} className="px-2 py-1 bg-background text-acs-ink-3 rounded text-xs">{s}</span>
                        ))}
                      </div>
                      <p className="text-sm text-acs-ink mb-3">
                        <span className="font-medium">Ação:</span> {triagem.acao}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${triagem.status === 'realizado' ? 'text-acs-verde' : 'text-acs-amar'}`}>
                          {triagem.status === 'realizado' ? '✓ Realizado' : '⏱ Pendente'}
                        </span>
                        <button className="text-xs text-acs-azul font-medium">Ver detalhe</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Encaminhamentos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-acs-ink">Encaminhamentos</h3>
            {encaminhamentos.length > 0 && (
              <span className="text-xs text-acs-ink-3">{encaminhamentos.length} registro(s)</span>
            )}
          </div>

          {encaminhamentos.length === 0 ? (
            <div className="bg-white rounded-xl p-6 border border-dashed border-acs-line text-center">
              <FileText size={28} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-acs-ink-3 mb-1">Nenhum encaminhamento registrado</p>
              <p className="text-xs text-[#94A3B8]">
                Encaminhamentos para UBS, consultas ou exames aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {encaminhamentos.map((enc) => (
                <button
                  key={enc.id}
                  className="w-full bg-white rounded-xl p-3 border border-acs-line flex items-center justify-between hover:border-acs-azul transition-colors text-left"
                  style={{ boxShadow: '0 1px 2px rgba(10,20,40,.06)' }}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-acs-ink text-sm">{enc.tipo}</p>
                    <p className="text-xs text-acs-ink-3">{enc.data}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      enc.status === 'realizado'
                        ? 'bg-acs-verde-100 text-[#065F46]'
                        : enc.status === 'pendente'
                          ? 'bg-acs-amar-100 text-[#92400E]'
                          : 'bg-acs-vermelho-100 text-[#991B1B]'
                    }`}>
                      {enc.status.charAt(0).toUpperCase() + enc.status.slice(1)}
                    </span>
                    <ChevronRight size={16} className="text-acs-ink-3" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer fixo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-acs-line p-4 max-w-[800px] mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/triagem/${paciente.id}/passo1`)}
            className="flex-1 py-3 bg-acs-azul text-white rounded-xl font-semibold hover:bg-acs-azul-900 transition-colors"
          >
            Nova Triagem
          </button>
          <button className="flex-1 py-3 bg-white text-acs-azul rounded-xl font-semibold border-2 border-acs-azul hover:bg-background transition-colors">
            Registrar Visita
          </button>
        </div>
      </div>
    </div>
  );
}
