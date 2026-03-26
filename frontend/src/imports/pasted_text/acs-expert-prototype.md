## CONTEXTO DO PRODUTO

Crie o protótipo completo do **ACS-Expert**, um aplicativo móvel para **Agentes Comunitários de Saúde (ACS)** do Sistema Único de Saúde (SUS) brasileiro. O ACS realiza visitas domiciliares em territórios vulneráveis, muitas vezes sem internet, e precisa de uma ferramenta simples, rápida e confiável para triagem de pacientes, gestão de visitas e acompanhamento de encaminhamentos.

O protótipo deve cobrir o fluxo completo de uso do ACS no campo, desde o login até o registro de uma triagem com histórico longitudinal do paciente.

---

## IDENTIDADE VISUAL

**Paleta de cores:**
- Primária: `#0066CC` (azul SUS)
- Sucesso / Baixo risco: `#10B981` (verde)
- Atenção / Risco médio: `#F59E0B` (âmbar)
- Perigo / Alto risco: `#EF4444` (vermelho)
- Fundo: `#F6F9FF` (azul muito claro)
- Superfície card: `#FFFFFF`
- Texto principal: `#0B1220`
- Texto secundário / muted: `#64748B`
- Borda leve: `#DBEAFE`

**Tipografia:** Inter (Google Fonts) — weights 400, 600, 700

**Estilo geral:**
- Clean, minimalista, profissional — saúde pública
- Cards com `border-radius: 12px`, sombras sutis (`box-shadow: 0 6px 18px rgba(16,25,40,0.04)`)
- Bordas coloridas à esquerda nos cards de resultado (color-coded por risco)
- Badges arredondados (pill) para classificação de risco
- Ícones outline style (Lucide ou similar)
- Mobile-first: telas de 390px de largura (iPhone 14 Pro)
- Também gerar versão tablet/desktop para a tela de Painel de Gestão

---

## TELAS A CRIAR (fluxo completo)

---

### TELA 1 — Splash / Login

**Elementos:**
- Logo ACS-Expert centralizado (ícone de cérebro com cruz médica + nome)
- Tagline: "Assistente inteligente para triagem domiciliar"
- Campo: Nome / Matrícula do ACS
- Campo: Senha (com toggle show/hide)
- Botão primário: "Entrar"
- Link: "Esqueci minha senha"
- Badge discreto no rodapé: "Modo offline disponível"
- Fundo com gradiente suave do azul primário para branco

---

### TELA 2 — Home / Dashboard do ACS

**Header:**
- Avatar circular com iniciais do ACS à esquerda
- Saudação: "Bom dia, [Nome]" em bold
- Microárea: "Microárea 3 — Vila Nova" em texto secundário
- Ícone de sino (notificações) com badge numérico à direita

**Card de resumo do dia (destaque azul):**
- Título: "Agenda de hoje"
- 3 métricas inline: "8 visitas planejadas", "3 realizadas", "2 urgentes"
- Botão: "Ver agenda completa"

**Seção "Alertas"** (lista vertical, max 3 itens visíveis):
- Cada alerta é um card pequeno com borda esquerda colorida
- Exemplos:
  - [VERMELHO] "Maria Silva — Alto risco, sem visita há 12 dias"
  - [ÂMBAR] "João Pereira — Encaminhamento pendente há 5 dias"
  - [ÂMBAR] "Família Souza — 3 membros em risco moderado"
- Link: "Ver todos os alertas (7)"

**Ações rápidas** (grid 2x2 de cards):
- "Nova Triagem" (ícone stethoscope)
- "Buscar Paciente" (ícone search)
- "Minha Agenda" (ícone calendar)
- "Encaminhamentos" (ícone clipboard-check)

**Bottom Navigation Bar** (5 itens):
- Home (ativo)
- Agenda
- Pacientes
- Encaminhamentos
- Perfil

---

### TELA 3 — Lista de Pacientes / Busca

**Header:**
- Título "Meus Pacientes"
- Campo de busca com ícone (placeholder: "Nome, CPF ou CNS...")

**Filtros em chips horizontais scrolláveis:**
- Todos | Alto risco | Crônicos | Gestantes | Sem visita recente

**Lista de pacientes** (cards verticais):
Cada card contém:
- Avatar circular com iniciais (cor baseada no risco)
- Nome completo em bold
- Idade e sexo em texto secundário
- Endereço resumido (rua + número)
- Badge de risco (ALTO / MÉDIO / BAIXO) com cor correspondente
- Ícone de alerta se houver pendência
- Última visita: "há 3 dias" em texto muted
- Seta de navegação à direita

**FAB (Floating Action Button):**
- Botão "+" azul no canto inferior direito
- Label: "Novo Paciente"

---

### TELA 4 — Cadastro de Novo Paciente

**Header com back button:** "Novo Paciente"

**Formulário em seções com separadores:**

Seção "Identificação":
- Nome completo (obrigatório)
- CPF (com máscara)
- CNS — Cartão Nacional de Saúde (opcional)
- Data de nascimento (date picker)
- Sexo (toggle: Masculino / Feminino)

Seção "Localização":
- Endereço (rua + número)
- Complemento
- Microárea (select com opções pré-definidas)
- Referência de localização (campo livre)

Seção "Vínculo Familiar":
- Domicílio (busca ou criação: "Casa dos Souza")
- Responsável pelo domicílio (toggle sim/não)
- Membros do domicílio vinculados (chips com nomes)

Seção "Contexto Social" (checkboxes):
- Idoso que mora sozinho
- Família em situação de vulnerabilidade
- Dificuldade de locomoção
- Beneficiário de programa social

**Rodapé fixo:**
- Botão fantasma: "Cancelar"
- Botão primário: "Salvar Paciente"

---

### TELA 5 — Perfil do Paciente (Histórico Longitudinal)

**Header:**
- Back button
- Nome do paciente em bold
- Badge de risco atual (ex: ALTO RISCO — vermelho)

**Card de dados rápidos (horizontal scroll ou grid):**
- Idade: 67 anos | Sexo: F | Microárea: 3
- Domicílio: Casa própria | Mora sozinha: Sim

**Comorbidades registradas** (chips coloridos):
- Hipertensa | Diabética | Cardiopatia

**Seção "Histórico de Triagens"** (linha do tempo vertical):
Cada entrada da timeline:
- Data da triagem (ex: "15 mar 2026")
- Score de risco com badge colorido (ex: "Alto — 78%")
- Principais sintomas (máx 3 chips)
- Ação recomendada (ex: "Encaminhar à UBS")
- Ícone de status: encaminhamento realizado (verde) / pendente (âmbar) / não compareceu (vermelho)
- Botão "Ver detalhe" em link

**Seção "Encaminhamentos":**
- Lista de encaminhamentos com status
- Cada item: data, tipo (médico/enfermagem/vacinação/exame), status

**Rodapé fixo:**
- Botão primário: "Nova Triagem"
- Botão secundário: "Registrar Visita"

---

### TELA 6 — Triagem (Fluxo Guiado) — Passo 1/3: Dados e Fatores de Risco

**Header:**
- Back button
- Título: "Nova Triagem"
- Nome do paciente: "Maria Silva, 67 anos" em subtítulo
- Progress bar em 3 etapas: [●●○○] "Dados — Sintomas — Resultado"

**Seção "Fatores de Risco / Comorbidades":**
Grid de chips selecionáveis (toggle on/off):
- Fumante | Hipertenso(a) | Diabético(a) | Obeso(a) | Asmático(a) | Gestante | Cardiopata | DPOC | Imunossuprimido(a)

Quando selecionado: chip fica com fundo azul + checkmark

**Seção "Contexto da Visita":**
- Data/hora da visita (auto-preenchida)
- Tipo de visita: Rotina / Busca ativa / Retorno / Urgência (radio buttons estilizados)
- Observação livre (campo de texto expandível)

**Rodapé fixo:**
- Botão primário: "Próximo: Sintomas"

---

### TELA 7 — Triagem — Passo 2/3: Sintomas

**Header:**
- Back button
- Progress: [●●●○] "Sintomas"
- Nome do paciente em subtítulo

**Campo de busca de sintoma** (proeminente, no topo):
- Ícone de lupa
- Placeholder: "Buscar sintoma..."

**Lista de grupos de sintomas em acordeão:**
Grupos (colapsados por padrão, expandem ao toque):
- Sintomas Gerais
- Saúde Mental
- Neurológico e Cabeça
- Cardiovascular
- Respiratório
- Digestivo e Abdominal
- Urinário e Renal
- Pele e Cabelos
- (demais grupos)

Cada grupo expandido mostra os sintomas como chips/botões toggle em grid 2 colunas.

**Sintoma selecionado** mostra:
- Chip destacado (azul)
- Abaixo: slider de intensidade (0 a 10) com label "Intensidade"
- Botão "[+] Detalhes" que expande sub-opções (qualificadores), ex: "Tosse: seca / com catarro / com sangue"

**Sintomas selecionados — resumo fixo no topo da seção:**
Chips menores mostrando os sintomas já marcados (com X para remover)

**Rodapé fixo:**
- Contador: "4 sintomas selecionados"
- Botão primário: "Avaliar"

---

### TELA 8 — Triagem — Passo 3/3: Resultado da Triagem

**Header:**
- "Resultado da Triagem"
- Nome + data/hora em subtítulo

**Card de Prioridade (destaque — ocupa 1/3 superior da tela):**

Variante ALTO RISCO (vermelho):
- Badge grande: "URGENTE"
- Título: "ALTA PRIORIDADE"
- Descrição: "Encaminhar imediatamente. Sintomas e perfil indicam risco elevado."
- Ícone de alerta

Variante MÉDIO RISCO (âmbar):
- Badge: "ATENÇÃO"
- Título: "PRIORIDADE MÉDIA"
- Descrição: "Monitorar e considerar encaminhamento conforme evolução."

Variante BAIXO RISCO (verde):
- Badge: "INFO"
- Título: "BAIXA PRIORIDADE"
- Descrição: "Orientação domiciliar / acompanhamento de rotina."

**Seção "Condições mais prováveis":**
Lista de cards de doenças (top 5):
Cada card:
- Nome da doença em bold
- Barra de progresso colorida com % de compatibilidade
- Badge de nível (Alta / Média / Baixa)
- Descrição breve em 1 linha

**Seção "Ação Recomendada":**
Card destacado com borda esquerda azul:
- Ícone + texto da ação: "Encaminhar para consulta médica na UBS"
- Botão inline: "Registrar Encaminhamento"

**Seção "Orientações ao Paciente":**
Lista de bullet points com orientações (ex: "Monitorar pressão diariamente", "Retornar se piorar")

**Rodapé fixo (2 botões):**
- Botão fantasma: "Exportar / Compartilhar"
- Botão primário: "Salvar Triagem"

---

### TELA 9 — Registrar Encaminhamento (Bottom Sheet / Modal)

Aparecer como bottom sheet deslizante sobre a tela de resultado.

**Conteúdo:**
- Título: "Registrar Encaminhamento"
- Tipo de encaminhamento (chips selecionáveis): Consulta Médica | Enfermagem | Vacinação | Exame | Urgência
- Motivo (campo texto pré-preenchido com condição detectada)
- Unidade de destino (select: UBS Central, UBS Bairro...)
- Data sugerida (date picker)
- Toggle: "Notificar ACS em caso de ausência do paciente"

**Botões:**
- "Cancelar" (link)
- "Confirmar Encaminhamento" (botão primário)

---

### TELA 10 — Agenda de Visitas (Lista Priorizada)

**Header:**
- Título: "Agenda do Dia"
- Data atual
- Toggle: "Lista" / "Mapa" (mapa aparece como placeholder com pin points)

**Métricas do dia (3 chips horizontais):**
- 8 Total | 3 Realizadas | 2 Urgentes

**Lista de visitas ordenada por prioridade:**
Cada item da lista:
- Número de ordem (1, 2, 3...)
- Badge de prioridade colorido (URGENTE / ATENÇÃO / ROTINA)
- Nome do paciente em bold
- Endereço resumido
- Distância estimada (ex: "350m")
- Razão da prioridade em texto muted (ex: "Sem visita há 14 dias — Alto risco")
- Status: [ ] Pendente / [✓] Realizada / [→] Em andamento
- Swipe actions: "Iniciar" (azul) e "Adiar" (âmbar)

**FAB:** "Otimizar Rota" com ícone de mapa

---

### TELA 11 — Encaminhamentos (Acompanhamento)

**Header:** "Encaminhamentos"

**Filtros em tabs horizontais:**
- Todos | Pendentes | Realizados | Ausência

**Lista de encaminhamentos:**
Cada card:
- Nome do paciente
- Tipo do encaminhamento (chip: Consulta / Vacinação / Exame)
- Data do encaminhamento
- Status com ícone:
  - [Relógio âmbar] Pendente — "há 3 dias"
  - [Check verde] Realizado — "em 14/03"
  - [X vermelho] Paciente não compareceu
- Botão contextual:
  - Se pendente: "Registrar Retorno"
  - Se ausência: "Agendar Nova Visita"

---

### TELA 12 — Notificações / Alertas

**Header:** "Alertas"

**Lista agrupada por urgência:**

Grupo "Urgente — Hoje":
- Cards com borda vermelha
- Ex: "Carlos Melo — Encaminhamento sem retorno há 7 dias"
- Botão inline: "Agendar visita"

Grupo "Atenção":
- Cards âmbar
- Ex: "Família Rocha — 2 crônicos sem visita há 30 dias"

Grupo "Informativos":
- Cards azuis
- Ex: "Campanha de vacinação: 4 pacientes elegíveis na sua microárea"

---

## COMPONENTES DO DESIGN SYSTEM

Criar como componentes reutilizáveis no Figma:

1. **Badge de Risco** — 3 variantes: Urgente (red), Atenção (amber), Info (blue), Baixo (green)
2. **Card de Paciente** — com avatar, nome, risco, última visita
3. **Card de Resultado de Doença** — nome, barra de progresso, badge, descrição
4. **Card de Encaminhamento** — com status dinâmico
5. **Card de Alerta** — com borda esquerda colorida
6. **Bottom Navigation Bar** — 5 itens com estado ativo
7. **Progress Steps** — indicador de etapa da triagem (3 passos)
8. **Chip Toggle** — para seleção de sintomas e filtros (estado off/on)
9. **Slider de Intensidade** — range 0–10 com gradiente verde→vermelho
10. **Accordion Group** — grupo de sintomas expansível
11. **Priority Card** — card de prioridade com 3 variantes de cor
12. **FAB (Floating Action Button)** — botão de ação flutuante
13. **Bottom Sheet** — modal deslizante de baixo para cima
14. **Empty State** — tela vazia com ilustração e CTA
15. **Offline Banner** — banner fixo no topo "Modo offline — dados serão sincronizados"

---

## FLUXOS DE PROTOTIPAGEM (conexões entre telas)

1. Login → Home (Dashboard)
2. Home → Lista de Pacientes
3. Lista de Pacientes → Perfil do Paciente
4. Perfil do Paciente → Triagem Passo 1
5. Triagem Passo 1 → Triagem Passo 2 (Sintomas)
6. Triagem Passo 2 → Triagem Passo 3 (Resultado)
7. Resultado → Bottom Sheet Encaminhamento
8. Bottom Sheet → Confirmação → Perfil do Paciente (atualizado)
9. Home → Agenda de Visitas
10. Agenda → Perfil do Paciente (ao tocar no item)
11. Home → Encaminhamentos
12. Home → Notificações (ícone sino)
13. FAB "+" → Cadastro de Novo Paciente
14. Cadastro → Triagem Passo 1 (direto)

---

## ESTADOS E VARIAÇÕES A INCLUIR

- **Estado offline:** Banner amarelo no topo "Sem conexão — trabalhando offline"
- **Estado de carregamento:** Skeleton screens nos cards
- **Estado vazio:** Para lista sem pacientes, sem encaminhamentos
- **Estado de sucesso:** Tela de confirmação após salvar triagem (checkmark animado + resumo)
- **Estado de erro:** Toast de erro inline (ex: "CPF já cadastrado")

---

## ORIENTAÇÕES ADICIONAIS PARA O FIGMA MAKE

- Gerar para mobile (390x844px — iPhone 14 Pro) como tela principal
- Usar Auto Layout em todos os componentes
- Criar frame "Fluxo Completo" mostrando todas as telas conectadas horizontalmente
- Todas as fontes em Inter
- Ícones: usar Lucide Icons ou Heroicons (outline)
- Não usar ilustrações complexas — preferir ícones e dados mockados realistas
- Dados mockados em português brasileiro com nomes e endereços brasileiros
- O app deve parecer uma solução governamental profissional, não um produto de startup