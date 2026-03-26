import { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserPlus, Search, ChevronRight, ShieldCheck, Users, UserCog } from 'lucide-react';
import type { Perfil } from '@/types';

interface UsuarioItem {
  id: number;
  nome: string;
  matricula: string;
  email?: string;
  perfil: Perfil;
  microarea?: string;
  ativo: boolean;
  ultimoAcesso?: string;
}

const MOCK: UsuarioItem[] = [
  {
    id: 1,
    nome: 'Ana Silva',
    matricula: '12345-6',
    email: 'ana.silva@saude.gov.br',
    perfil: 'acs',
    microarea: 'Microárea 3 — Vila Nova',
    ativo: true,
    ultimoAcesso: '2026-03-25',
  },
  {
    id: 2,
    nome: 'Carlos Mendes',
    matricula: '78901-2',
    email: 'carlos.mendes@saude.gov.br',
    perfil: 'acs',
    microarea: 'Microárea 1',
    ativo: true,
    ultimoAcesso: '2026-03-24',
  },
  {
    id: 3,
    nome: 'Maria Coordenadora',
    matricula: '00001-1',
    email: 'maria.coord@saude.gov.br',
    perfil: 'coordenador',
    ativo: true,
    ultimoAcesso: '2026-03-26',
  },
  {
    id: 4,
    nome: 'João Gestor',
    matricula: '00002-2',
    perfil: 'gestor',
    ativo: false,
    ultimoAcesso: '2026-02-10',
  },
];

const PERFIL_LABEL: Record<Perfil, string> = {
  acs: 'ACS',
  coordenador: 'Coordenador',
  gestor: 'Gestor',
};

const PERFIL_ICON: Record<Perfil, typeof Users> = {
  acs: Users,
  coordenador: UserCog,
  gestor: ShieldCheck,
};

const PERFIL_COLOR: Record<Perfil, string> = {
  acs: '#0066CC',
  coordenador: '#7C3AED',
  gestor: '#059669',
};

export function Usuarios() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<Perfil | 'todos'>('todos');

  const filtrados = MOCK.filter((u) => {
    const matchBusca =
      !busca ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.matricula.includes(busca);
    const matchPerfil = filtroPerfil === 'todos' || u.perfil === filtroPerfil;
    return matchBusca && matchPerfil;
  });

  return (
    <div className="h-full flex flex-col overflow-y-auto pb-6">
      {/* Header */}
      <div className="bg-white border-b border-[#DBEAFE] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#0B1220]">Usuários</h2>
            <p className="text-xs text-[#64748B] mt-0.5">{MOCK.length} cadastrados</p>
          </div>
          <button
            onClick={() => navigate('/novo-usuario')}
            className="flex items-center gap-2 bg-[#0066CC] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0052A3] transition-colors"
          >
            <UserPlus size={16} />
            Novo usuário
          </button>
        </div>

        {/* Busca */}
        <div className="mt-3 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Buscar por nome ou matrícula…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#DBEAFE] bg-[#F6F9FF] text-sm text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/20"
          />
        </div>

        {/* Filtros de perfil */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
          {(['todos', 'acs', 'coordenador', 'gestor'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setFiltroPerfil(p)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filtroPerfil === p
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-white border border-[#DBEAFE] text-[#64748B] hover:border-[#0066CC] hover:text-[#0066CC]'
              }`}
            >
              {p === 'todos' ? 'Todos' : PERFIL_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 px-6 py-4 space-y-3">
        {filtrados.length === 0 && (
          <div className="text-center py-12 text-[#64748B] text-sm">
            Nenhum usuário encontrado.
          </div>
        )}
        {filtrados.map((u) => {
          const Icon = PERFIL_ICON[u.perfil];
          const cor = PERFIL_COLOR[u.perfil];
          const iniciais = u.nome
            .split(' ')
            .slice(0, 2)
            .map((n) => n[0])
            .join('')
            .toUpperCase();

          return (
            <div
              key={u.id}
              className="bg-white rounded-xl border border-[#DBEAFE] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
              style={{ boxShadow: '0 2px 8px rgba(16,25,40,0.04)' }}
              onClick={() => navigate(`/usuario/${u.id}`)}
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 text-white"
                style={{ backgroundColor: cor }}
              >
                {iniciais}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#0B1220] text-sm truncate">{u.nome}</p>
                  {!u.ativo && (
                    <span className="text-[10px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full flex-shrink-0">
                      Inativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">Mat. {u.matricula}</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Icon size={12} style={{ color: cor }} />
                  <span className="text-xs font-medium" style={{ color: cor }}>
                    {PERFIL_LABEL[u.perfil]}
                  </span>
                  {u.microarea && (
                    <>
                      <span className="text-[#DBEAFE]">•</span>
                      <span className="text-xs text-[#64748B] truncate">{u.microarea}</span>
                    </>
                  )}
                </div>
              </div>

              <ChevronRight size={18} className="text-[#64748B] flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
