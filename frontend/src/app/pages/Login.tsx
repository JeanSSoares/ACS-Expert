import { useState } from 'react';
import { Eye, EyeOff, Wifi, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Logo } from '@/app/components/brand/Logo';

export function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [matricula, setMatricula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !password) {
      setErro('Informe a matrícula e a senha.');
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      await login({ matricula, senha: password });
    } catch (err: any) {
      const data = err?.response?.data;
      const msg = data?.message ?? 'Erro ao fazer login. Tente novamente.';
      const detalhe = data?.error ? ` (${data.error})` : '';
      setErro(msg + detalhe);
      // eslint-disable-next-line no-console
      console.error('[LOGIN] Falha:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-acs-azul p-12 items-center justify-center">
        <div className="max-w-md text-white">
          <div className="mb-6">
            <Logo variant="full" size={64} color="#FFFFFF" accent="#E76F4A" muted="rgba(255,255,255,0.7)" />
          </div>
          <p className="text-xl text-white/90 mb-8 font-display">
            Cuidado <em>que anda junto.</em>
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
      <div className="flex-1 flex flex-col bg-acs-paper">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
          {/* Logo - Mobile only */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="mb-4">
              <Logo variant="full" size={48} />
            </div>
            <p className="text-sm text-acs-ink-3 text-center font-display">
              Cuidado <em>que anda junto.</em>
            </p>
          </div>

          {/* Welcome text - Desktop */}
          <div className="hidden lg:block mb-8 text-center">
            <h2 className="text-3xl font-bold text-acs-ink mb-2 font-display">Bem-vindo de volta</h2>
            <p className="text-acs-ink-3">Faca login para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full max-w-md space-y-4 mt-8">
            {erro && (
              <div className="flex items-center gap-2 bg-acs-vermelho-100 rounded-xl px-4 py-3 text-acs-vermelho text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {erro}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Matricula"
                value={matricula}
                onChange={(e) => { setMatricula(e.target.value); setErro(null); }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-acs-line text-acs-ink placeholder:text-acs-ink-4 focus:outline-none focus:ring-2 focus:ring-acs-azul"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErro(null); }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-acs-line text-acs-ink placeholder:text-acs-ink-4 focus:outline-none focus:ring-2 focus:ring-acs-azul pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-acs-ink-3"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-acs-azul text-white font-semibold hover:bg-acs-azul-900 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <button
              type="button"
              className="w-full text-sm text-acs-ink-3 hover:text-acs-azul transition-colors"
            >
              Esqueci minha senha
            </button>
          </form>
        </div>

        {/* Footer badge */}
        <div className="pb-8 flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-acs-paper-2">
            <Wifi size={16} className="text-acs-ink-3" />
            <span className="text-sm text-acs-ink-3">Modo offline disponivel</span>
          </div>
        </div>
      </div>
    </div>
  );
}