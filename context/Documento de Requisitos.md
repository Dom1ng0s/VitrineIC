## **Descrição da solução**

O VitrineIC será uma plataforma web na qual estudantes do Instituto de Computação poderão publicar seus projetos, apresentar suas habilidades e construir um portfólio público. Interessados e empresas poderão visualizar esses projetos e enviar pedidos de desenvolvimento de software.

Os pedidos serão analisados por uma equipe de curadoria, responsável por verificar a clareza, a viabilidade e o escopo da demanda. Após a aprovação, a curadoria apresentará a oportunidade aos estudantes com perfil adequado. Os estudantes poderão aceitar ou recusar a participação.

## **Tipos de usuários**

| Usuário                 | Responsabilidades                                                           |
| ----------------------- | --------------------------------------------------------------------------- |
| **Visitante**           | Visualizar projetos e perfis públicos dos estudantes.                       |
| **Estudante**           | Criar perfil, cadastrar habilidades, publicar projetos e receber propostas. |
| **Solicitante/Empresa** | Visualizar projetos e cadastrar pedidos de software.                        |
| **Curador**             | Analisar pedidos e apresentá-los aos estudantes adequados.                  |
| **Administrador**       | Gerenciar usuários, projetos, pedidos e permissões.                         |

## **Requisitos funcionais**

### **Perfis e projetos**

- **RF01:** O sistema deve permitir o cadastro de estudantes.
- **RF02:** O estudante deve poder cadastrar suas habilidades e áreas de interesse.
- **RF03:** O estudante deve poder publicar projetos desenvolvidos por ele.
- **RF04:** Cada projeto deve conter título, descrição, tecnologias utilizadas e autoria.
- **RF05:** O estudante deve poder adicionar imagens e links do projeto.
- **RF06:** Visitantes e empresas devem poder visualizar os projetos publicados.
- **RF07:** O sistema deve permitir a busca de projetos por tecnologia ou área.
- **RF08:** O estudante deve poder editar ou remover seus projetos.

###

###

###

### **Pedidos de software**

- **RF09:** O sistema deve permitir que empresas e interessados cadastrem pedidos de software.
- **RF10:** O pedido deve conter descrição do problema, solução esperada, prazo e dados do solicitante.
- **RF11:** O solicitante deve poder acompanhar a situação do pedido.
- **RF12:** O solicitante deve poder corrigir o pedido quando a curadoria solicitar alterações.

### **Curadoria**

- **RF13:** Todo pedido deve ser enviado para análise da curadoria.
- **RF14:** O curador deve poder aprovar, recusar ou solicitar ajustes no pedido.
- **RF15:** O curador deve poder consultar estudantes por habilidades, projetos e disponibilidade.
- **RF16:** O curador deve poder apresentar uma demanda a um ou mais estudantes.
- **RF17:** O estudante deve poder aceitar ou recusar a proposta.
- **RF18:** Após o aceite, o sistema deve permitir a conexão entre o estudante e o solicitante.
- **RF19:** O sistema deve registrar o histórico das decisões da curadoria.

## **Fluxo principal da solução**

1. O estudante cria seu perfil.
2. O estudante publica seus projetos.
3. Visitantes e empresas visualizam a vitrine.
4. Uma empresa ou interessado envia um pedido de software.
5. A curadoria analisa a demanda.
6. Se necessário, solicita ajustes ao solicitante.
7. A curadoria identifica estudantes compatíveis.
8. A demanda é apresentada aos estudantes.
9. Um estudante aceita ou recusa o projeto.
10. Se houver aceite, a curadoria realiza a conexão com o solicitante.
11. Ao final, o projeto poderá ser publicado na vitrine, mediante autorização.

## **Regras de negócio**

- **RN01:** Apenas estudantes cadastrados poderão publicar projetos.
- **RN02:** Todo projeto publicado deverá identificar seus autores.
- **RN03:** Projetos confidenciais não poderão ser publicados sem autorização.
- **RN04:** Nenhum pedido será levado aos estudantes antes da análise da curadoria.
- **RN05:** A curadoria poderá recusar pedidos inviáveis, ilegais ou fora da proposta da plataforma.
- **RN06:** O estudante poderá aceitar ou recusar uma demanda livremente.
- **RN07:** A aprovação da demanda não garante que um estudante aceitará desenvolvê-la.
- **RN08:** Os dados de contato somente serão compartilhados após a aprovação da curadoria e o aceite do estudante.
- **RN09:** Projetos feitos a partir de pedidos somente poderão entrar na vitrine com autorização dos envolvidos.
- **RN10:** Inicialmente, a seleção dos estudantes será realizada manualmente pela curadoria.
