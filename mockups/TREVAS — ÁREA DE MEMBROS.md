# TREVAS — ÁREA DE MEMBROS

## Briefing completo de desenvolvimento

Quero construir uma área de membros própria para o produto **Trevas**, substituindo a experiência de consumo de conteúdo atualmente feita pela Hotmart.

A Hotmart continuará sendo utilizada para venda, checkout, processamento de pagamentos e origem de dados de compra, mas a experiência de acesso e consumo do conteúdo acontecerá integralmente nesta nova plataforma.

O sistema deverá possuir duas grandes interfaces:

1. **Área do aluno**
2. **Painel administrativo**

A aplicação deve ser responsiva, funcionando especialmente bem em desktop e mobile.

Antes de alterar ou criar código, analise a estrutura atual do projeto, tecnologias existentes, autenticação, banco de dados, storage, sistema de rotas e componentes reutilizáveis. Preserve a arquitetura existente sempre que ela for adequada.

A regra fundamental do projeto é:

> Nenhuma operação editorial cotidiana deve exigir alteração de código.

Depois de pronto, o administrador deve conseguir cadastrar aulas, modificar conteúdo, trocar vídeo, alterar PDFs, criar casos, organizar biblioteca, conceder acesso, publicar avisos e executar as operações normais da plataforma exclusivamente através do painel administrativo.

---

# 1. ESTRUTURA PRINCIPAL DA ÁREA DO ALUNO

A navegação principal da plataforma será composta por:

- Início
- Curso
- Laboratório
- Arquivo
- Consulte as Trevas
- Biblioteca

No desktop, utilizar menu lateral.

No mobile, utilizar navegação inferior com os itens principais e uma área "Mais" quando necessário para itens que não couberem na navegação principal.

A identidade visual deverá seguir o sistema Trevas já definido no projeto:

- fundo preto/chumbo;
- tipografia clara/creme;
- detalhes dourados;
- vermelho escuro para elementos ativos e ações;
- títulos editoriais;
- aparência sofisticada, sóbria e investigativa;
- evitar visual genérico de plataforma de cursos.

---

# 2. LOGIN E USUÁRIOS

O usuário deverá possuir conta própria dentro da plataforma.

Cada usuário deverá possuir pelo menos:

- ID interno;
- nome;
- e-mail;
- data de criação;
- status;
- origem do acesso;
- cursos/produtos aos quais possui acesso;
- data inicial do acesso;
- eventual data final do acesso;
- progresso;
- informações necessárias para integração com Hotmart.

O usuário deverá conseguir:

- realizar login;
- recuperar senha;
- acessar somente conteúdos aos quais tenha permissão;
- continuar seu progresso de onde parou.

---

# 3. CONTROLE DE ACESSO

O controle de acesso ao Trevas deverá ser independente da consulta direta à Hotmart a cada carregamento.

Criar uma estrutura própria de permissões/entitlements.

Exemplo conceitual:

Usuário  
→ Produto  
→ Direito de acesso  
→ Origem  
→ Status  
→ Data inicial  
→ Data final

Possíveis origens de acesso:

- HOTMART
- MANUAL
- CORTESIA
- EQUIPE
- TESTE

A aplicação deve consultar sua própria base para decidir se o usuário pode ou não acessar determinado conteúdo.

A Hotmart deverá alimentar e atualizar essa base.

---

# 4. INTEGRAÇÃO COM HOTMART

A Hotmart será responsável pela origem comercial do acesso.

Implementar integração através da API e Webhooks da Hotmart.

Eventos relevantes da Hotmart deverão atualizar o direito de acesso correspondente dentro da plataforma.

O sistema deverá ser preparado para processar situações como:

- compra aprovada;
- alteração do status da compra;
- cancelamento;
- reembolso;
- chargeback;
- perda de direito de acesso;
- outros estados fornecidos pela integração que afetem o acesso.

Não consultar a Hotmart toda vez que o aluno abrir uma aula.

O fluxo será:

Hotmart  
→ Webhook  
→ Backend da plataforma  
→ atualização do entitlement  
→ aluno ganha ou perde acesso

Guardar os eventos recebidos para auditoria e diagnóstico.

Também deverá existir uma rotina de reconciliação utilizando a API da Hotmart para verificar inconsistências e corrigir situações em que um webhook eventualmente não tenha sido recebido/processado corretamente.

As credenciais da Hotmart nunca devem ficar expostas no frontend.

---

# 5. ACESSO MANUAL

O administrador deverá conseguir pesquisar qualquer usuário e alterar manualmente seu direito de acesso.

Permitir:

- conceder acesso;
- remover acesso;
- definir acesso permanente;
- definir acesso até determinada data;
- indicar origem do acesso;
- inserir observação interna;
- registrar motivo da alteração.

Toda alteração manual deverá gerar registro de auditoria.

---

# 6. PAPÉIS E PERMISSÕES

Implementar papéis de usuário administrativos.

Papéis previstos:

- Aluno
- Administrador
- Editor
- Suporte
- Professor

Administrador:
acesso completo.

Editor:
gerenciamento editorial de conteúdo.

Suporte:
consulta de usuários e gerenciamento de acesso, sem poderes administrativos gerais.

Professor:
permissões relacionadas ao conteúdo conforme estrutura administrativa.

Aluno:
acesso somente à experiência de membros e ao conteúdo liberado.

As permissões devem ser controladas no backend, não somente escondidas visualmente no frontend.

---

# 7. TELA INÍCIO

A página inicial do aluno deve funcionar como uma mesa de trabalho.

Elementos:

## Continue de onde parou

Mostrar:

- aula atual;
- imagem/thumbnail;
- módulo;
- título;
- percentual concluído;
- botão "Continuar aula".

O botão deve levar o aluno à aula e, quando possível, ao ponto do vídeo em que ele parou.

## Próximo passo

Mostrar a próxima atividade recomendada dentro da sequência do curso.

## Adicionado recentemente ao Arquivo

Mostrar alguns conteúdos recentes do Arquivo Trevas.

## Atividade recente

Mostrar ações recentes relevantes do próprio aluno.

## Progresso

Exibir resumo visual do percurso.

Não transformar esta tela em catálogo.

Seu objetivo é responder:

- Onde eu estava?
- O que devo fazer agora?
- O que aconteceu recentemente?

---

# 8. CURSO

Criar uma estrutura hierárquica:

Curso  
→ Módulos  
→ Aulas / Laboratórios / Materiais associados

O administrador deve poder cadastrar múltiplos módulos.

Cada módulo poderá possuir:

- número;
- título;
- descrição;
- ordem;
- status;
- regras de liberação;
- conteúdo interno.

A visualização do aluno deve mostrar:

- módulos concluídos;
- módulo atual;
- módulos futuros;
- percentual geral do curso.

O administrador deverá poder reordenar módulos.

---

# 9. AULAS

Cada aula deverá possuir pelo menos:

- ID;
- título;
- subtítulo quando necessário;
- descrição;
- módulo;
- número/ordem;
- thumbnail;
- Vimeo ID ou URL;
- duração;
- tags/conceitos;
- materiais;
- transcrição;
- casos relacionados;
- status;
- data de publicação;
- configuração de liberação;
- aula anterior;
- próxima aula.

Status editoriais:

- rascunho;
- publicado;
- despublicado;
- publicação agendada.

A publicação não deve ocorrer automaticamente durante edição.

Fluxo:

Editar  
→ Salvar rascunho  
→ Visualizar  
→ Publicar

---

# 10. PLAYER DE VÍDEO

Os vídeos serão hospedados no Vimeo.

A plataforma deverá utilizar Vimeo embed.

O administrador deverá simplesmente inserir o Vimeo ID ou URL correspondente.

Configurar o player de forma integrada ao layout Trevas.

O vídeo deverá respeitar as configurações de privacidade permitidas pelo Vimeo.

Usar restrição por domínio quando disponível/configurada.

O usuário não deverá precisar sair da plataforma para assistir.

Guardar progresso do vídeo.

Informações mínimas:

- vídeo iniciado;
- último timestamp;
- percentual assistido;
- conclusão.

Ao retornar à aula, oferecer continuidade a partir do ponto salvo.

---

# 11. PÁGINA DA AULA

A tela deverá conter:

- módulo;
- título;
- tags/conceitos;
- descrição;
- player Vimeo;
- casos apresentados;
- materiais;
- transcrição;
- navegação anterior/próxima.

No mobile, reorganizar verticalmente.

A experiência deve priorizar leitura e vídeo, evitando excesso de elementos simultâneos.

---

# 12. TRANCRIÇÃO INTERATIVA

Cada aula poderá possuir uma transcrição.

A transcrição deverá ser pesquisável.

Quando houver timestamps associados, clicar em um trecho deverá mover o player do vídeo para aquele momento.

Permitir:

"Pesquisar nesta aula"

Resultados deverão indicar o trecho relevante.

---

# 13. MATERIAIS DA AULA

Uma aula poderá possuir múltiplos materiais.

Exemplos:

- PDF;
- documento;
- imagem;
- link;
- arquivo complementar.

Cada material deverá possuir:

- título;
- tipo;
- arquivo ou URL;
- descrição opcional;
- ordem;
- visibilidade.

---

# 14. STORAGE / GERENCIAMENTO DE ARQUIVOS

Criar no Admin uma biblioteca de mídia.

Não depender da abertura manual do Storage para gerenciar arquivos.

O administrador deverá conseguir:

- fazer upload;
- arrastar e soltar arquivos;
- visualizar arquivos;
- pesquisar;
- organizar por coleções/pastas lógicas;
- adicionar tags;
- visualizar tamanho;
- visualizar tipo;
- visualizar data de upload;
- visualizar quem enviou;
- visualizar onde o arquivo é utilizado.

Antes de apagar um arquivo utilizado pelo sistema, apresentar aviso indicando em quais conteúdos ele está sendo utilizado.

Exemplo:

"Este arquivo está sendo utilizado em 4 aulas."

Evitar URLs públicas permanentes para arquivos que devam ser privados.

Usar mecanismo de acesso controlado/URL temporária quando adequado à infraestrutura utilizada.

---

# 15. CMS / ADMINISTRADOR DE CONTEÚDO

O Admin deverá permitir gerenciamento completo do conteúdo sem código.

Menu sugerido:

## Visão Geral

## Conteúdo
- Cursos
- Aulas
- Laboratórios
- Casos
- Biblioteca
- Arquivos

## Pessoas
- Alunos
- Acessos
- Turmas/Grupos

## Comunicação
- Avisos
- E-mails
- Modelos
- Histórico

## Integrações
- Hotmart
- Vimeo
- E-mail
- Storage

## Sistema
- Webhooks
- Logs
- Auditoria
- Erros

## Configurações

---

# 16. EDITOR DE CURSOS E AULAS

O administrador deverá conseguir:

- criar curso;
- editar curso;
- criar módulo;
- editar módulo;
- duplicar módulo quando necessário;
- reordenar módulos;
- criar aula;
- editar aula;
- duplicar aula;
- reordenar aulas;
- publicar;
- despublicar;
- programar publicação;
- adicionar Vimeo;
- adicionar thumbnail;
- adicionar descrição;
- adicionar tags;
- adicionar transcrição;
- anexar materiais;
- associar casos;
- visualizar como aluno antes da publicação.

Sempre registrar alterações relevantes.

---

# 17. HISTÓRICO DE VERSÕES

Conteúdos editoriais importantes devem possuir histórico de alterações.

Registrar:

- usuário que alterou;
- data/hora;
- conteúdo/registro alterado.

A interface deverá permitir saber que determinada aula foi alterada por determinado administrador/editor em determinada data.

---

# 18. LABORATÓRIO TREVAS

Criar uma área própria chamada Laboratório.

O administrador deverá conseguir cadastrar exercícios.

Cada laboratório poderá possuir:

- título;
- descrição;
- conteúdo/caso analisado;
- imagem;
- texto;
- fonte;
- perguntas;
- análise/resposta oficial;
- tags;
- relações com aulas;
- status.

Experiência do aluno:

Exibir o caso.

Depois apresentar perguntas como:

- Qual parece ser o enquadramento principal?
- Que informação está sendo privilegiada?
- O que está ausente?
- Outras perguntas cadastradas pelo administrador.

O aluno escreve suas respostas.

Em seguida pode selecionar:

"Ver análise"

Então a plataforma revela a análise cadastrada.

Guardar que o aluno realizou o laboratório.

Guardar respostas quando aplicável.

---

# 19. ARQUIVO TREVAS

Criar uma base navegável de casos.

Cada caso deverá possuir:

- ID;
- título;
- descrição;
- thumbnail/imagem;
- texto;
- fonte;
- data;
- tipo;
- tags;
- técnicas;
- análise;
- conteúdos relacionados;
- aulas relacionadas;
- status.

Permitir busca.

Permitir filtros.

Filtros poderão utilizar as tags e categorias cadastradas.

Exemplos de categorias existentes no conceito do produto:

- Jornalismo
- Publicidade
- Política
- Cinema
- Redes sociais

Exemplos de técnicas:

- Enquadramento
- Omissão
- Repetição
- Associação
- Emoção

Não limitar o sistema a valores hardcoded se essas categorias já forem tratadas como dados cadastráveis.

A visualização deve funcionar em cards no desktop e lista otimizada no mobile.

---

# 20. FAVORITOS / MEU ARQUIVO

O aluno poderá salvar conteúdos.

Permitir salvar:

- aulas;
- casos;
- itens da biblioteca;
- análises quando aplicável.

Criar uma área pessoal de itens salvos.

Exemplo:

Meu Arquivo

- casos salvos;
- aulas salvas;
- livros salvos;
- análises salvas.

---

# 21. ANOTAÇÕES PRIVADAS

O aluno poderá fazer anotações durante as aulas.

Cada anotação deverá estar relacionada a:

- usuário;
- aula;
- conteúdo da nota;
- data;
- timestamp do vídeo quando aplicável.

Exemplo:

34:22 — interessante a diferença entre seleção e omissão.

Ao clicar em uma anotação com timestamp, abrir a aula naquele ponto do vídeo.

As anotações são privadas do aluno.

---

# 22. BIBLIOTECA

Criar uma biblioteca de referências.

Tipos previstos:

- livros;
- artigos;
- filmes;
- documentários;
- discursos;
- bibliografia.

Cada item poderá possuir:

- título;
- autor;
- imagem/capa;
- descrição;
- tipo;
- tags;
- referências;
- conteúdo relacionado;
- aulas relacionadas;
- casos relacionados;
- status.

Permitir pesquisa.

Permitir filtros por categoria.

---

# 23. CONSULTE AS TREVAS

Criar área chamada:

"Consulte as Trevas"

A interface deverá permitir ao aluno enviar:

- texto;
- imagem.

A IA deverá realizar análise de acordo com a metodologia do Trevas.

Estrutura de resposta prevista:

- Enquadramento;
- Escolhas linguísticas;
- Omissões;
- Recursos emocionais;
- Técnicas identificadas.

Após a análise, apresentar conteúdos relacionados da própria plataforma.

Exemplo:

- Aula relacionada;
- Caso relacionado;
- Laboratório relacionado.

O objetivo da IA não é substituir o curso.

Ela deve direcionar o aluno novamente para o conteúdo Trevas.

Toda integração com modelos de IA deverá acontecer pelo backend.

Chaves de API nunca deverão ficar expostas no frontend.

## Cota de análises

Cada aluno terá inicialmente direito a **5 análises por semana**.

Regras da cota:

- contabilizar somente análises concluídas com sucesso;
- renovar a cota semanalmente em dia e horário definidos pelo sistema;
- não acumular análises não utilizadas para a semana seguinte;
- mostrar ao aluno quantas análises ainda estão disponíveis;
- aplicar limites configuráveis de tamanho para textos e imagens;
- registrar consumo, quantidade de tokens e custo estimado por usuário;
- aplicar rate limiting para evitar abuso ou chamadas automatizadas.

O limite semanal deverá ser configurável pelo painel administrativo, sem alteração de código. O valor padrão inicial será de 5 análises por aluno por semana.

---

# 24. BUSCA UNIVERSAL

Criar busca global da plataforma.

A busca deverá conseguir encontrar resultados em:

- aulas;
- títulos;
- descrições;
- transcrições;
- casos;
- biblioteca;
- técnicas/tags.

Quando um resultado vier da transcrição de uma aula e possuir timestamp, mostrar:

Aula  
→ trecho  
→ tempo

Exemplo:

Enquadramento  
Aula 04  
32:18

Ao selecionar, abrir a aula naquele ponto.

---

# 25. PROGRESSO DO ALUNO

Guardar progresso individual.

Dados previstos:

- curso;
- módulo;
- aula;
- aula iniciada;
- aula concluída;
- último timestamp do vídeo;
- laboratório realizado;
- materiais acessados;
- casos salvos;
- percentual geral.

Tela do aluno poderá mostrar:

- percentual do curso;
- aulas concluídas;
- laboratórios realizados;
- casos analisados;
- casos salvos;
- tempo estudado;
- técnicas mais estudadas.

Esses dados devem ser derivados de informações reais registradas pela plataforma.

---

# 26. SOCIAL DRM

Implementar mecanismo de Social DRM.

Durante o consumo de conteúdo protegido, exibir periodicamente marca d'água dinâmica identificando o usuário.

Informações possíveis:

- nome;
- e-mail parcialmente mascarado;
- identificador interno.

Exemplo:

Humberto Rezende  
hum***@gmail.com  
8F23

A marca poderá alterar discretamente sua posição para dificultar remoção trivial.

Não deve prejudicar excessivamente a experiência de consumo.

Para PDFs protegidos, permitir versão identificável por usuário quando esse fluxo fizer parte do material disponibilizado.

A finalidade é desencorajar compartilhamento e permitir identificação de vazamentos.

---

# 27. CENTRAL DE COMUNICAÇÃO

O administrador deverá possuir uma única área chamada Comunicação.

Uma comunicação poderá ser enviada por:

- aviso interno;
- e-mail;
- ambos.

O administrador cria a mensagem uma vez e escolhe os canais.

Cada comunicação deverá possuir:

- título;
- conteúdo;
- público;
- canal;
- status;
- data de criação;
- data agendada;
- data de envio.

Possíveis públicos:

- todos;
- determinado curso;
- determinado módulo;
- alunos ativos;
- alunos que não começaram;
- alunos sem acesso recente conforme regra configurada.

Permitir:

- rascunho;
- agendamento;
- envio;
- histórico.

Quando o provedor de e-mail disponibilizar informações, registrar status de entrega e abertura.

---

# 28. AVISOS INTERNOS

Os avisos enviados internamente deverão aparecer na plataforma.

Criar central de avisos/notificações.

O aluno deverá conseguir visualizar:

- avisos novos;
- avisos anteriores;
- data;
- conteúdo.

Registrar quando aplicável:

- entregue;
- visualizado.

---

# 29. E-MAIL

A plataforma deverá possuir integração com provedor de e-mail.

O sistema administrativo deverá permitir:

- criar mensagem;
- selecionar público;
- enviar;
- agendar;
- utilizar modelos;
- consultar histórico.

Credenciais do provedor devem ficar somente no backend.

---

# 30. VISÃO GERAL ADMINISTRATIVA

Criar dashboard administrativo.

Mostrar informações operacionais relevantes já previstas no sistema, como:

- usuários ativos;
- últimas compras sincronizadas;
- eventos recentes da Hotmart;
- webhooks recebidos;
- webhooks com erro;
- e-mails enviados;
- e-mails com falha;
- uploads recentes;
- erros do sistema;
- quantidade de alunos por curso;
- consumo/progresso do curso.

Não transformar esta tela em sistema de BI complexo.

O objetivo é permitir diagnóstico rápido da operação.

---

# 31. WEBHOOKS

Criar tela administrativa de Webhooks.

Guardar:

- provedor;
- tipo do evento;
- identificador;
- payload necessário;
- data/hora;
- status;
- resultado;
- erro quando houver;
- quantidade de tentativas.

Permitir visualizar eventos que falharam.

Permitir reprocessar manualmente um evento quando apropriado.

Evitar processamento duplicado.

Implementar idempotência sempre que possível utilizando IDs dos eventos externos.

---

# 32. LOGS E AUDITORIA

Criar logs administrativos.

Registrar operações relevantes como:

- login administrativo;
- criação de conteúdo;
- alteração;
- publicação;
- exclusão;
- concessão de acesso;
- remoção de acesso;
- processamento de webhook;
- alterações de configuração.

Auditoria deverá registrar:

- usuário responsável;
- ação;
- entidade;
- ID;
- data/hora.

---

# 33. ERROS DO SISTEMA

Criar área administrativa para visualizar erros relevantes da aplicação.

Não mostrar stack traces ou informações sensíveis ao aluno.

Os detalhes técnicos devem ficar restritos ao ambiente administrativo/logs.

---

# 34. SEGURANÇA

Princípios obrigatórios:

- segredos somente no backend;
- nunca incluir API keys no frontend;
- proteger rotas administrativas;
- verificar autorização também no backend;
- validar uploads;
- validar inputs;
- proteger endpoints;
- aplicar rate limiting onde necessário;
- impedir acesso direto a conteúdos privados sem autorização;
- utilizar HTTPS;
- controlar sessão;
- proteger integrações;
- verificar assinatura/autenticidade de webhooks quando o provedor oferecer esse recurso.

---

# 35. STORAGE E SEGURANÇA DE ARQUIVOS

Arquivos privados não devem depender exclusivamente de URLs públicas obscuras.

A autorização deverá ser verificada antes de liberar material protegido.

O Storage deve respeitar:

Usuário  
→ entitlement  
→ conteúdo  
→ arquivo

Somente usuário autorizado recebe acesso.

---

# 36. BACKUP E AMBIENTES

Separar claramente:

- desenvolvimento;
- staging quando existente;
- produção.

Evitar testes com dados reais de produção.

Manter estratégia de backup para o banco de dados conforme infraestrutura adotada.

---

# 37. RESPONSIVIDADE

Toda a plataforma deverá ser projetada mobile-first ou, no mínimo, com responsividade tratada como requisito de primeira classe.

Não simplesmente reduzir telas desktop.

No mobile:

- navegação inferior;
- cards em uma coluna;
- player ocupando largura útil;
- filtros horizontalmente roláveis quando necessário;
- formulário do laboratório em sequência vertical;
- biblioteca em lista;
- arquivo em lista;
- IA em fluxo vertical;
- botões com áreas adequadas para toque;
- textos legíveis sem zoom.

---

# 38. EXPERIÊNCIA MOBILE — INÍCIO

Estrutura:

Header Trevas

Bem-vindo de volta.

Continue de onde parou

[thumbnail]  
Título  
Progresso  
Continuar aula

Próximo passo

Atividade recente

Bottom navigation.

---

# 39. EXPERIÊNCIA MOBILE — CURSO

Header

Curso

Resumo de progresso

Lista vertical:

01 Introdução às Trevas ✓  
02 Percepções e realidades ✓  
03 Enquadramento →  
04 Linguagem 🔒  
05 Associações 🔒  
...

Bottom navigation.

---

# 40. EXPERIÊNCIA MOBILE — AULA

Header

Voltar para curso

Módulo

Título

Tags

Player Vimeo

Resumo

Tabs:

- Sobre
- Materiais

Anterior / Próxima aula.

---

# 41. EXPERIÊNCIA MOBILE — LABORATÓRIO

Header

Caso em análise

Imagem/texto do caso

Pergunta 1

Campo

Pergunta 2

Campo

Pergunta 3

Campo

...

Ver análise

Bottom navigation.

---

# 42. EXPERIÊNCIA MOBILE — ARQUIVO

Header

Arquivo Trevas

Busca

Filtros horizontais

Ordenação

Lista vertical de casos

Cada caso:

Ícone/imagem  
Título  
Descrição curta  
Tags  
→

Bottom navigation.

---

# 43. EXPERIÊNCIA MOBILE — CONSULTE

Header

Consulte as Trevas

Tabs:

Texto | Imagem

Campo de entrada

Analisar

Resultado da análise

Accordions:

- Enquadramento
- Omissões
- Recursos emocionais
- demais categorias definidas

Conteúdos relacionados.

---

# 44. EXPERIÊNCIA MOBILE — BIBLIOTECA

Header

Biblioteca Trevas

Busca

Filtros/categorias horizontais

Lista de conteúdos.

Cada item:

Capa  
Título  
Autor  
Tipo  
Tags  
Salvar

Bottom navigation.

---

# 45. MODELO DE DADOS

Criar estrutura coerente para pelo menos as entidades abaixo.

Não é obrigatório utilizar exatamente estes nomes, mas as responsabilidades devem existir.

## User

## Role

## Product / Course

## Entitlement

## Module

## Lesson

## LessonProgress

## Material

## MediaAsset

## Transcript

## TranscriptSegment

## Laboratory

## LaboratoryQuestion

## LaboratorySubmission

## Case

## LibraryItem

## Favorite

## Note

## Announcement / Communication

## EmailDelivery / CommunicationDelivery

## WebhookEvent

## AuditLog

## SystemError

Organizar relacionamentos evitando duplicação desnecessária de informações.

---

# 46. SLUGS E IDs

Usar IDs internos estáveis.

URLs públicas poderão utilizar slug legível.

Não utilizar título como chave primária.

Exemplo:

/curso/fundamentos  
/aula/aquilo-que-voce-ve  
/arquivo/caso-023

---

# 47. EXCLUSÃO DE CONTEÚDO

Evitar exclusão definitiva acidental de entidades importantes.

Quando adequado, utilizar status ou soft delete.

Antes de remover conteúdo relacionado a outras entidades, informar dependências.

Exemplo:

"Esta aula está relacionada a 6 casos e possui progresso de 237 alunos."

Não quebrar relacionamentos silenciosamente.

---

# 48. PERFORMANCE

Evitar carregar toda a base de dados no frontend.

Usar paginação ou carregamento progressivo em:

- alunos;
- arquivo;
- biblioteca;
- logs;
- webhooks;
- comunicações;
- mídia.

O player não deve impedir o restante da interface de carregar.

O dashboard deve evitar consultas redundantes.

---

# 49. ESTADOS DE INTERFACE

Toda ação assíncrona deverá possuir estados apropriados:

- carregando;
- concluído;
- erro;
- vazio.

Exemplos:

Nenhum caso encontrado.

Nenhum aviso disponível.

Nenhum material nesta aula.

Falha ao carregar vídeo.

Não deixar áreas vazias sem explicação.

---

# 50. FORMULÁRIOS ADMINISTRATIVOS

Todo formulário importante deve possuir:

- validação;
- feedback de erro;
- confirmação visual de salvamento;
- prevenção de perda acidental de alterações;
- rascunho quando previsto.

Não depender apenas de alert() do navegador.

---

# 51. PADRÃO VISUAL

Reutilizar componentes.

Criar sistema visual consistente para:

- botões;
- cards;
- inputs;
- selects;
- modais;
- tabelas;
- tags;
- estados;
- tabs;
- accordions;
- navegação;
- alertas;
- tooltips;
- loaders.

Para ícones, utilizar preferencialmente uma biblioteca consistente como Lucide, mantendo o mesmo estilo em toda a plataforma.

Evitar misturar várias famílias de ícones sem necessidade.

---

# 52. OBJETIVO DE ARQUITETURA

Separar claramente:

Frontend  
→ interface

Backend  
→ regras de negócio

Banco  
→ persistência

Storage  
→ arquivos

Hotmart  
→ origem comercial e atualização de entitlement

Vimeo  
→ vídeos

E-mail  
→ comunicação externa

IA  
→ Consulte as Trevas

Nunca colocar regras críticas exclusivamente no frontend.

---

# 53. ORDEM DE IMPLEMENTAÇÃO

Executar o desenvolvimento em etapas, sem comprometer a arquitetura das funcionalidades seguintes.

## ETAPA 1 — FUNDAÇÃO

- banco;
- autenticação;
- usuários;
- papéis;
- permissões;
- entitlement;
- estrutura básica de frontend;
- estrutura administrativa.

## ETAPA 2 — CONTEÚDO

- cursos;
- módulos;
- aulas;
- Vimeo;
- materiais;
- Storage;
- CMS;
- publicação;
- progresso.

## ETAPA 3 — ACESSO

- integração Hotmart;
- Webhooks;
- reconciliação;
- acesso manual;
- logs de acesso.

## ETAPA 4 — EXPERIÊNCIA PRINCIPAL

- Início;
- Curso;
- Aula;
- responsividade;
- mobile;
- progresso;
- transcrição.

## ETAPA 5 — CONTEÚDO EXPANDIDO

- Laboratório;
- Arquivo;
- Biblioteca;
- favoritos;
- anotações;
- busca.

## ETAPA 6 — COMUNICAÇÃO

- avisos internos;
- e-mail;
- públicos;
- agendamento;
- histórico.

## ETAPA 7 — PROTEÇÃO

- Social DRM;
- proteção de arquivos;
- permissões;
- auditoria.

## ETAPA 8 — CONSULTE AS TREVAS

- input texto;
- input imagem;
- backend de IA;
- análise;
- resultados;
- relacionamento com conteúdos Trevas.

## ETAPA 9 — OPERAÇÃO

- dashboard administrativo;
- logs;
- webhooks;
- erros;
- auditoria;
- refinamentos operacionais.

---

# 54. CRITÉRIO FUNDAMENTAL DE PRONTO

O sistema só deve ser considerado operacional quando for possível executar sem alteração de código o seguinte fluxo:

1. Administrador cria um curso.
2. Cria módulos.
3. Cria aula.
4. Insere Vimeo.
5. Faz upload de material.
6. Publica.
7. Aluno compra via Hotmart.
8. Hotmart informa a plataforma.
9. Plataforma concede acesso.
10. Aluno entra.
11. Assiste aula.
12. Progresso é salvo.
13. Sai.
14. Retorna.
15. Continua de onde parou.
16. Realiza laboratório.
17. Consulta caso no Arquivo.
18. Salva conteúdo.
19. Faz anotação.
20. Pesquisa conteúdo.
21. Consulta Biblioteca.
22. Recebe aviso interno.
23. Recebe comunicação por e-mail.
24. Administrador consegue consultar todo o fluxo operacional.
25. Administrador consegue conceder ou retirar acesso manualmente.
26. Reembolso/cancelamento recebido da Hotmart atualiza o acesso.
27. Erros de integração podem ser identificados através do Admin.

---

# 55. REGRAS PARA O DESENVOLVIMENTO COM CODEX

Antes de implementar qualquer etapa:

1. examine o repositório existente;
2. identifique stack, banco, autenticação, Storage e arquitetura;
3. reutilize componentes e infraestrutura existente quando adequados;
4. não substitua tecnologias funcionais sem necessidade;
5. não crie funcionalidades que não estejam descritas neste documento;
6. não simplifique regras de segurança;
7. não coloque chaves no frontend;
8. mantenha migrações de banco controladas;
9. documente variáveis de ambiente necessárias;
10. mantenha tipos/interfaces coerentes;
11. execute lint/build/testes disponíveis após mudanças;
12. preserve responsividade;
13. não faça alterações destrutivas no banco sem migração;
14. implemente cada módulo de maneira utilizável antes de avançar;
15. mantenha a experiência visual coerente com os mockups Trevas existentes no projeto.

Quando houver uma decisão técnica que possa ser inferida pela arquitetura existente, examine o código e escolha a solução compatível.

Quando existir infraestrutura já implementada, integre-se a ela em vez de criar uma segunda solução paralela.

O resultado deve ser uma plataforma administrável, modular, segura e preparada para ser utilizada como a área oficial de membros do Trevas.

---

# 56. PRINCÍPIOS SOLID E PADRÃO DE ARQUITETURA

Todo código novo ou alterado deverá seguir os princípios SOLID de maneira pragmática, compatível com a stack e com a arquitetura existente.

## Responsabilidade única — SRP

Cada módulo, classe, serviço, componente ou função deverá possuir uma responsabilidade principal clara.

Separar, quando aplicável:

- apresentação e componentes de interface;
- casos de uso e regras de negócio;
- autenticação e autorização;
- acesso e persistência de dados;
- integrações externas;
- validação;
- armazenamento de arquivos;
- telemetria, logs e auditoria.

Componentes visuais não devem executar diretamente regras críticas de negócio nem concentrar integrações com Firebase, Hotmart, Vimeo, e-mail ou modelos de IA.

## Aberto para extensão, fechado para modificação — OCP

Projetar pontos de extensão para comportamentos que possuam variações previsíveis, como:

- origens de entitlement;
- provedores de e-mail;
- tipos de conteúdo e materiais;
- canais de comunicação;
- integrações externas;
- mecanismos de análise por IA.

Adicionar uma nova implementação não deverá exigir alterações espalhadas por módulos sem relação direta com a funcionalidade.

## Substituição de Liskov — LSP

Implementações que cumpram o mesmo contrato deverão ser substituíveis sem alterar o comportamento esperado do sistema.

Adaptadores reais, ambientes de teste e implementações simuladas deverão respeitar os mesmos contratos, validações e resultados definidos pela aplicação.

## Segregação de interfaces — ISP

Preferir contratos pequenos e específicos para cada consumidor.

Evitar interfaces genéricas que obriguem módulos a depender de operações que não utilizam. Separar, por exemplo, leitura, escrita, publicação, upload, autorização e envio de comunicações quando essas responsabilidades forem independentes.

## Inversão de dependência — DIP

Regras de negócio e casos de uso não deverão depender diretamente dos SDKs ou detalhes concretos de Firebase, Hotmart, Vimeo, provedores de e-mail ou modelos de IA.

Essas dependências deverão ser acessadas através de contratos internos e adaptadores de infraestrutura, permitindo testes, manutenção e substituição controlada de provedores.

Fluxo arquitetural esperado:

Interface / Rotas  
→ Casos de uso  
→ Domínio e regras de negócio  
→ Contratos  
→ Adaptadores de infraestrutura

As dependências devem apontar para as regras centrais da aplicação, e não no sentido contrário.

## Aplicação prática

O uso de SOLID não deverá resultar em abstrações sem necessidade, arquivos excessivamente fragmentados ou complexidade artificial.

Criar abstrações quando elas:

- protegem uma regra de negócio;
- isolam uma integração externa;
- possibilitam testes relevantes;
- eliminam acoplamento concreto;
- representam variações reais ou previstas no produto;
- melhoram manutenção e evolução do sistema.

Toda nova funcionalidade deverá preservar limites claros entre área do aluno, painel administrativo, domínio, aplicação e infraestrutura. Alterações deverão ser acompanhadas por testes proporcionais ao risco e revisadas também quanto à coesão, acoplamento e respeito aos contratos internos.
