# Kodex Soluções — site e Vitrine de Experiências

Site estático em HTML, CSS e JavaScript. Abra `index.html` no navegador. Os arquivos usam caminhos relativos e scripts clássicos para abertura local e GitHub Pages. Não é necessário instalar dependências.

## Esta revisão

- O botão mostra o **tema atual**: “Tema: claro” ou “Tema: escuro”. Clique para alternar. Fundos, textos, cards, menus e estados acompanham o tema em todas as páginas; a capa e o rodapé também mudam. A preferência é salva quando o armazenamento está disponível e enviada às prévias da vitrine.
- Vitrine com sete modelos, busca, categorias, grade/lista, comparação e prévia desktop/celular. Cada card é identificado individualmente, inclusive modelos da mesma categoria.
- FAQ atualizado com as seis respostas fornecidas pelo usuário. Política de segurança e sigilo ao final, com link no rodapé.

## Modelos

| Modelo | Arquivo | O que testar |
|---|---|---|
| Landing page | `modelos/landing.html` | Capa fotográfica, espaço para logo, textos, cor do botão, estilos, presets e formulário simulado |
| Site empresarial | `modelos/institucional.html` | Logo, capa, nome e título, cores da marca, seções, moldura de celular e navegação para a história |
| História da empresa | `modelos/historia.html` | Trajetória, missão, visão e valores ilustrativos; navegação para a página empresarial |
| Site pessoal | `modelos/pessoal.html` | Perfil com avatar, sobre mim, serviços, três imagens ilustrativas, filtros e ampliação da galeria |
| Mini-CRM | `modelos/crm.html` | Cadastro, edição, etapas, quadro/tabela, busca, filtros, ordenação, indicadores e CSV |
| Recrutamento e seleção | `modelos/recrutamento.html` | Candidatos, vagas, avaliação, mudança de etapa, busca, filtro de vaga e CSV |
| Estoque | `modelos/estoque.html` | Produtos, SKU único, saldos, estoque mínimo, entradas/saídas, histórico e CSV |
| Dashboard | `modelos/dashboard.html` | Períodos, gráficos, tabelas alternativas, simulador e CSV |

Os modelos representam negócios fictícios. História, missão, visão, valores, candidatos, produtos e resultados não são alegações sobre a Kodex ou seus clientes. O modelo pessoal usa o avatar fornecido como perfil ilustrativo; a foto real de cada profissional pode substituir esse elemento no projeto contratado.

Cada demonstração tem restauração e contato de WhatsApp identificando o modelo. Os sistemas salvam dados **somente no navegador**, com fallback em memória. Não existe backend, sincronização entre dispositivos nem envio de candidatos ou leads. Use dados fictícios. A política de sigilo descreve o compromisso comercial da Kodex e não transforma estas demos em sistemas de produção.

O CSV respeita os filtros ativos e neutraliza possíveis fórmulas. O estoque rejeita saldo negativo, quantidades fracionárias e SKUs duplicados. A avaliação de candidatos aceita valores inteiros de 0 a 100.

## Configuração e publicação

WhatsApp e Instagram oficiais estão preenchidos em `js/main.js`, objeto `window.CONFIG`. A única configuração pendente é `[URL_DO_SITE]`: preencha `siteUrl` após definir o endereço público.

Para GitHub Pages, envie o **conteúdo** do ZIP para a raiz do repositório, preservando `index.html`, `.nojekyll`, `css`, `js`, `modelos` e `assets`. Configure Pages para a branch e pasta em que colocou esses arquivos. Nenhuma publicação externa foi realizada nesta entrega.

Google Fonts e Chart.js são os únicos recursos externos. Se Chart.js estiver indisponível, os indicadores, o simulador e as tabelas alternativas permanecem disponíveis. As fotografias dos modelos estão no próprio pacote. Prompts e origem estão em `assets/IMAGENS.md`.

## Verificações e limites

131 verificações de sintaxe, lógica e referências passaram (55 anteriores, 19 do catálogo/tema e 57 desta revisão). Há conferência estrutural das nove páginas: tags, IDs, links, imagens, metadados e labels.

O cálculo dos tokens de texto, texto secundário, links e estados passou com contraste mínimo de 4,5:1 sobre as superfícies verificadas nos dois temas. Também foram conferidas as cores dos botões e os piores casos das camadas sobre fotografias. Isso não equivale a uma auditoria de acessibilidade de toda a interface renderizada.

A execução anterior do navegador automatizado foi recusada. Por isso, a inspeção visual, os gestos reais no celular, a ausência de overflow, os downloads no navegador e o GitHub Pages publicado continuam pendentes de conferência. Os relatórios de lógica não os declaram aprovados.
