import { useEffect, useMemo, useState } from 'react';
import { Search, ChevronRight, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { RiskBadge } from '../components/RiskBadge';
import {
  pacientesService,
  calcularIdade,
  riscoToUI,
  type PacienteListagem,
} from '@/services/pacientesService';

type FiltroId = 'todos' | 'alto' | 'cronicos' | 'gestantes' | 'sem-visita';

export function Pacientes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FiltroId>('todos');
  const [pacientes, setPacientes] = useState<PacienteListagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const filters: { id: FiltroId; label: string }[] = [
    { id: 'todos',       label: 'Todos' },
    { id: 'alto',        label: 'Alto risco' },
    { id: 'cronicos',    label: 'Crônicos' },
    { id: 'gestantes',   label: 'Gestantes' },
    { id: 'sem-visita',  label: 'Sem visita recente' },
  ];

  // Debounce da busca
  const [debouncedBusca, setDebouncedBusca] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedBusca(searchTerm.trim()), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoading(true);
      setErro(null);
      try {
        const { data } = await pacientesService.listar({
          busca: debouncedBusca || undefined,
          nivel_risco: activeFilter === 'alto' ? 'alto' : undefined,
        });
        if (!cancelado) setPacientes(data);
      } catch (err: any) {
        if (!cancelado) {
          setErro(err?.response?.data?.message ?? 'Erro ao carregar pacientes.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [debouncedBusca, activeFilter]);

  const listaFiltrada = useMemo(() => {
    if (activeFilter === 'sem-visita') {
      const limite = new Date();
      limite.setDate(limite.getDate() - 30);
      return pacientes.filter((p) => {
        if (!p.data_ultima_visita) return true;
        return new Date(p.data_ultima_visita) < limite;
      });
    }
    return pacientes;
  }, [pacientes, activeFilter]);

  const getInitialsColor = (risco: 'urgent' | 'warning' | 'low') => {
    switch (risco) {
      case 'urgent':  return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'low':     return '#10B981';
      default:        return '#0066CC';
    }
  };

  const iniciais = (nome: string) =>
    nome.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const formatUltimaVisita = (iso?: string) => {
    if (!iso) return 'sem registro';
    const dias = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
    if (dias === 0) return 'hoje';
    if (dias === 1) return 'ontem';
    return `há ${dias} dias`;
  };

  return (
    <div className="min-h-screen bg-[#F6F9FF]">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-4 lg:px-8 py-4 lg:py-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-bold text-[#0B1220] mb-4 text-lg lg:text-xl">Meus Pacientes</h2>

          {/* Search */}
          <div className="relative max-w-2xl">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Nome, CPF ou CNS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 lg:py-3 rounded-lg border border-[#DBEAFE] bg-white text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-[#DBEAFE] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="px-4 py-1.5 lg:py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0"
                style={{
                  backgroundColor: activeFilter === filter.id ? '#0066CC' : '#F6F9FF',
                  color: activeFilter === filter.id ? '#FFFFFF' : '#64748B',
                  border: activeFilter === filter.id ? 'none' : '1px solid #DBEAFE',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-[#64748B]">
            <Loader2 size={24} className="animate-spin mr-2" />
            Carregando pacientes...
          </div>
        )}

        {!loading && erro && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
            {erro}
          </div>
        )}

        {!loading && !erro && listaFiltrada.length === 0 && (
          <div className="text-center py-20 text-[#64748B]">
            Nenhum paciente encontrado.
          </div>
        )}

        {!loading && !erro && listaFiltrada.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {listaFiltrada.map((paciente) => {
              const risco = riscoToUI(paciente.nivel_risco);
              const idade = calcularIdade(paciente.data_nascimento);
              const endereco = [paciente.logradouro, paciente.numero].filter(Boolean).join(', ');
              const hasAlert = risco === 'urgent';

              return (
                <button
                  key={paciente.id}
                  onClick={() => navigate(`/paciente/${paciente.id}`)}
                  className="w-full bg-white rounded-xl p-4 lg:p-5 border border-[#DBEAFE] hover:border-[#0066CC] hover:shadow-lg transition-all text-left"
                  style={{ boxShadow: '0 6px 18px rgba(16,25,40,0.04)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                      style={{ backgroundColor: getInitialsColor(risco) }}
                    >
                      {iniciais(paciente.nome)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-[#0B1220]">{paciente.nome}</h3>
                        {hasAlert && (
                          <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-[#64748B] mb-2">
                        {idade} anos • {paciente.sexo === 'm' ? 'M' : 'F'}
                      </p>

                      <p className="text-sm text-[#64748B] mb-3 truncate">
                        {endereco || 'Endereço não informado'}
                      </p>

                      <div className="flex items-center justify-between">
                        <RiskBadge level={risco} />
                        <span className="text-xs text-[#64748B]">
                          Última visita: {formatUltimaVisita(paciente.data_ultima_visita)}
                        </span>
                      </div>
                    </div>

                    <ChevronRight size={20} className="text-[#64748B] flex-shrink-0 mt-2" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/novo-paciente')}
        className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 w-14 h-14 lg:w-16 lg:h-16 bg-[#0066CC] rounded-full shadow-lg flex items-center justify-center text-white hover:bg-[#0052A3] hover:scale-110 transition-all z-50"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}
