# Trip Companion Hub

Quero planejar um MVP chamado “WTT Companion — Painel do Guia”, conectado ao projeto Supabase WTT que selecionei ao criar este projeto.

IMPORTANTE:

Não implemente nada ainda. Primeiro inspecione o projeto Supabase conectado, entenda o schema atual e apresente um plano técnico completo para minha aprovação.

CONTEXTO DO PRODUTO

A WTT trabalha com viagens internacionais em grupo acompanhadas por guias.

O principal problema que queremos resolver é:

- Informações importantes ficam misturadas nas conversas do WhatsApp.

- Passageiros repetem perguntas sobre horários e pontos de encontro.

- O guia precisa conferir manualmente quem leu os avisos.

- O guia precisa descobrir quem já está no ponto de encontro.

- Mudanças de última hora podem não ser vistas por todos.

- A organização depende muito do método individual de cada guia.

O sistema não deve substituir o WhatsApp nem o guia.

Ele deve funcionar como uma central operacional para que o guia organize o dia, publique avisos e acompanhe as respostas dos passageiros.

FLUXO PRINCIPAL

1. A agência cadastra previamente uma viagem e suas saídas.

2. A agência cadastra os passageiros de cada saída.

3. A agência cadastra o roteiro diário.

4. Durante a viagem, o guia abre a programação do dia seguinte.

5. O guia revisa horário, local de encontro, atividade e orientações.

6. O guia publica um aviso.

7. Futuramente, o sistema enviará uma mensagem individual pelo WhatsApp oficial da empresa para cada passageiro.

8. O passageiro poderá responder:

   - Li e entendi.

   - Estou a caminho.

   - Já estou no ponto.

   - Preciso de ajuda.

9. O painel do guia mostrará quem respondeu e quem ainda está sem resposta.

10. O guia poderá enviar um lembrete apenas para quem ainda não confirmou.

ESCOPO DO PRIMEIRO MVP

O primeiro MVP deve ter somente:

- Autenticação.

- Perfil administrador da agência.

- Perfil guia.

- Cadastro de viagens.

- Cadastro de saídas.

- Cadastro de guias.

- Cadastro e importação de passageiros.

- Roteiro por dia.

- Atividades e pontos de encontro.

- Criação e publicação de avisos.

- Pré-visualização da mensagem que será enviada.

- Status dos passageiros.

- Controle de presença.

- Histórico de avisos.

- Registro básico das ações realizadas.

NÃO IMPLEMENTAR NESTA PRIMEIRA FASE

- Integração real com a API do WhatsApp.

- Inteligência artificial.

- Pagamentos.

- Aplicativo nativo para iPhone ou Android.

- Venda de viagens.

- Reserva de passagens ou hotéis.

- Rastreamento contínuo de localização.

- Álbum de fotos.

- Armazenamento de passaporte.

- Informações médicas detalhadas.

- White-label para outras agências.

INTEGRAÇÃO FUTURA COM WHATSAPP

Na primeira fase, crie somente a estrutura do sistema e uma simulação do envio.

O sistema deve ter uma camada de serviço preparada para, futuramente, conectar a WhatsApp Business Platform oficial.

Não utilize Z-API, Evolution API ou outras soluções não oficiais.

Não coloque nenhuma chave de API no frontend.

BANCO DE DADOS

Antes de sugerir alterações:

1. Inspecione o schema atual do Supabase conectado.

2. Informe quais tabelas já existem.

3. Não exclua tabelas, colunas ou dados existentes.

4. Não renomeie nada sem minha autorização.

5. Caso o banco esteja vazio, proponha o schema necessário.

6. Caso já existam tabelas, explique como reaproveitá-las.

7. Apresente todas as migrations antes da implementação.

Considere, inicialmente, entidades semelhantes a:

- organizations

- profiles

- trips

- departures

- departure_guides

- passengers

- departure_passengers

- itinerary_days

- itinerary_items

- meeting_points

- announcements

- announcement_recipients

- passenger_responses

- checkin_sessions

- checkin_responses

- audit_logs

Não trate esses nomes como definitivos. Analise e proponha a melhor modelagem.

PERFIS E PERMISSÕES

Administrador da agência:

- Gerencia viagens.

- Gerencia saídas.

- Gerencia guias.

- Gerencia passageiros.

- Gerencia roteiros.

- Visualiza todos os avisos e controles de presença.

Guia:

- Visualiza somente as saídas para as quais foi designado.

- Revisa o roteiro.

- Publica avisos.

- Abre controles de presença.

- Visualiza respostas dos passageiros.

- Envia lembretes.

- Não pode acessar configurações administrativas da agência.

Passageiro:

- Não terá login no primeiro MVP.

- Será identificado pela saída e pelo número de telefone.

- No futuro responderá diretamente pelo WhatsApp.

SEGURANÇA

Planeje Row Level Security no Supabase.

A segurança não pode depender apenas de botões escondidos na interface.

Considere:

- organization_id para separar dados da empresa.

- departure_id para separar cada saída.

- Administradores acessam dados da própria organização.

- Guias acessam apenas suas saídas.

- Nenhum segredo ou service role deve ficar no frontend.

- Ações críticas devem passar pelo backend ou Edge Functions.

- Criar políticas RLS para SELECT, INSERT, UPDATE e DELETE.

- Criar registros de auditoria para ações importantes.

EXPERIÊNCIA E DESIGN

O sistema deve ser:

- Em português do Brasil.

- Mobile-first para o guia.

- Responsivo para celular, tablet e computador.

- Simples de usar durante uma viagem.

- Moderno, profissional e relacionado a turismo.

- Visualmente limpo, sem excesso de informações.

- Rápido para operações realizadas com apenas uma mão.

Direção visual:

- Azul-marinho.

- Branco.

- Cinza claro.

- Detalhes em vermelho ou bordô.

- Cartões com bordas suaves.

- Ícones minimalistas.

- Tipografia moderna e muito legível.

- Aparência de central operacional de viagens, não de rede social.

TELAS PRINCIPAIS

Considere inicialmente:

1. Login.

2. Dashboard.

3. Viagens.

4. Saídas.

5. Passageiros.

6. Roteiro.

7. Programação de hoje.

8. Criar aviso.

9. Pré-visualizar aviso.

10. Controle de presença.

11. Histórico de avisos.

12. Configurações básicas.

TELA PRINCIPAL DO GUIA

A tela inicial do guia deve destacar:

- Viagem atual.

- Cidade atual.

- Data.

- Próxima atividade.

- Próximo horário de encontro.

- Local do encontro.

- Quantidade de passageiros.

- Último aviso publicado.

- Passageiros que ainda não confirmaram.

- Botão “Revisar programação”.

- Botão “Publicar aviso”.

- Botão “Abrir controle de presença”.

CONTROLE DE PRESENÇA

O painel deve apresentar:

- Total de passageiros.

- Já estão no ponto.

- Estão a caminho.

- Precisam de ajuda.

- Ainda não responderam.

- Horário da última resposta.

- Lista nominal dos passageiros.

- Botão para lembrar somente quem não respondeu.

- Botão para encerrar o encontro.

RESULTADO QUE ESPERO DESTE PLANEJAMENTO

Antes de construir, apresente:

1. Resumo do entendimento do produto.

2. Problema principal que será resolvido.

3. Arquitetura proposta.

4. Análise do schema atual do Supabase.

5. Modelo de dados sugerido.

6. Relacionamento entre as tabelas.

7. Perfis e permissões.

8. Políticas RLS necessárias.

9. Rotas e telas.

10. Componentes principais.

11. Fluxos do administrador.

12. Fluxos do guia.

13. Estratégia para a futura integração com WhatsApp.

14. Divisão do desenvolvimento em pequenas fases.

15. Critérios de conclusão de cada fase.

16. Riscos técnicos.

17. Perguntas que precisam ser respondidas antes da implementação.

Não construa o projeto inteiro em uma única etapa.

Divida o desenvolvimento em partes pequenas, verificáveis e testáveis.

Faça todas as perguntas necessárias antes de criar o plano final.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/703f5438-7fca-4085-a1f1-c0516def201e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
