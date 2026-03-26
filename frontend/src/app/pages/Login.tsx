import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Eye, EyeOff, Wifi } from 'lucide-react';
// logo placeholder — substitua por um arquivo SVG/PNG em src/assets/logo.svg

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0066CC] to-[#0052A3] p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="mb-6">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-4xl">A</div>
          </div>
          <h1 className="text-4xl font-bold mb-4">ACS-Expert</h1>
          <p className="text-xl text-white/90 mb-8">
            Assistente inteligente para triagem domiciliar
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold">Triagem baseada em evidências</p>
                <p className="text-sm text-white/80">Protocolos atualizados do Ministério da Saúde</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold">Gestão inteligente de visitas</p>
                <p className="text-sm text-white/80">Otimização de rotas e priorização automática</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                <span className="text-sm">✓</span>
              </div>
              <div>
                <p className="font-semibold">Funciona offline</p>
                <p className="text-sm text-white/80">Continue trabalhando sem conexão</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex flex-col" style={{
        background: 'linear-gradient(180deg, #0066CC 0%, #FFFFFF 100%)'
      }}>
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          {/* Logo - Mobile only */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="mb-4">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl">A</div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ACS-Expert</h1>
            <p className="text-sm text-white/90 text-center">
              Assistente inteligente para triagem domiciliar
            </p>
          </div>

          {/* Welcome text - Desktop */}
          <div className="hidden lg:block mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo de volta</h2>
            <p className="text-white/90">Faça login para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 mt-8">
            <div>
              <input
                type="text"
                placeholder="Nome / Matrícula do ACS"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/95 backdrop-blur border border-white/50 text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/95 backdrop-blur border border-white/50 text-[#0B1220] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-white/50 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-[#0066CC] font-semibold hover:bg-white/90 transition-colors shadow-lg"
            >
              Entrar
            </button>

            <button
              type="button"
              className="w-full text-sm text-white/90 hover:text-white transition-colors"
            >
              Esqueci minha senha
            </button>
          </form>
        </div>

        {/* Footer badge */}
        <div className="pb-8 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Wifi size={16} className="text-white" />
            <span className="text-sm text-white">Modo offline disponível</span>
          </div>
        </div>
      </div>
    </div>
  );
}