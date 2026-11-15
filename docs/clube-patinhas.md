# Clube Patinhas

Programa de pontos do minigame. A pessoa joga, junta Patinhas e troca por vantagens na assinatura. O desenho protege o caixa: o que custa dinheiro só vale para assinante, tem teto por mês e vence.

As regras que valem de verdade ficam em `supabase/migrations/0003_patinhas.sql`. Os números mostrados no site estão em `src/data/patinhas.ts`; se mudar um, mude o outro.

## Como ganhar

| Ação | Patinhas | Limite |
| --- | --- | --- |
| Banho completo no minigame | 60 | 1 por dia |
| 7 dias seguidos de banho | +100 | a cada sequência completa |
| Criar um pet | 50 | até 3 pets |
| Primeira assinatura | 200 | 1 vez |

Teto do minigame (banho + sequência): **900 Patinhas por mês**. Quem usa "Fazer essa etapa por mim" não ganha nada naquele banho.

## Como trocar (só para assinatura ativa)

| Vantagem | Custo | Custo para a empresa | Valor por 100 Patinhas |
| --- | --- | --- | --- |
| Adesivos extras do pet na próxima box | 700 | ~R$ 3 | R$ 0,43 |
| R$ 5 de desconto na próxima mensalidade | 1.000 | R$ 5 | R$ 0,50 |
| Doação de R$ 5 para uma ONG que apoiamos | 1.000 | R$ 5 | R$ 0,50 |
| R$ 10 de desconto na próxima mensalidade | 2.000 | R$ 10 | R$ 0,50 |
| Frete grátis na próxima box | 3.000 | ~R$ 20 | R$ 0,67 |

Por mês, cada pessoa troca no máximo: 1 vantagem entre desconto e frete, 1 mimo e 1 doação. O maior desconto (R$ 10) é 10% do plano mais barato (Mini, R$ 99,90).

## Proteções

- **Teto de ganho** (900/mês e 1 banho por dia): o custo máximo por assinante é conhecido.
- **Só assinante troca.** Quem ainda não assinou junta Patinhas e vê o saldo, o que ajuda a converter e não custa nada.
- **Vencimento:** as Patinhas vencem após 180 dias sem ganhar nem trocar. Isso limita o passivo.
- **Regras no banco:** o site não consegue se dar Patinhas. Só as funções do banco gravam, com bloqueio contra clique duplo.
- **Sem valor em dinheiro:** não são transferíveis nem trocáveis por dinheiro (Termos de uso, seção 11).

## A conta

Premissas, a confirmar quando os orçamentos de fornecedores fecharem (pendência da Etapa 4):

- margem de contribuição por box, depois dos itens, da embalagem e da taxa de pagamento, de 30% a 40% do preço: cerca de **R$ 30 a R$ 40** no Mini e **R$ 45 a R$ 60** no Luxe;
- cancelamento (churn) mensal de 8%, o que dá uns 12 meses de vida média por assinante.

**Pior caso.** A pessoa bate o teto de 900 Patinhas todo mês e sempre escolhe a troca mais cara para a empresa (frete grátis). Custo: 900 ÷ 3.000 × R$ 20 = **R$ 6,00 por mês**, ou 6% da mensalidade do Mini e 4% da do Luxe. Isso é de 15% a 20% da margem, e só acontece com quem joga todo dia o mês inteiro.

**Caso típico.** Suponha 25% dos assinantes batendo o teto, 50% jogando de vez em quando (cerca de 300 por mês) e 25% sem jogar. A média fica em ~375 Patinhas por mês, ou **R$ 1,90 por assinante por mês** a R$ 0,50 por 100. Com o vencimento e com quem nunca troca, o custo real tende a ficar perto de **R$ 1,30**, uns 1,3% da mensalidade.

**Quanto precisa render.** Para cada 100 assinantes o programa custa uns R$ 190 por mês. Segurar 1 assinante a mais por mês vale cerca de R$ 35 × 12 = R$ 420 de margem ao longo da vida. O programa se paga se reduzir o churn em apenas **0,45 ponto percentual** (de 8% para 7,55%).

Os bônus de uma vez só são pequenos: criar pet vale R$ 0,25 e a primeira assinatura R$ 1,00 (a R$ 0,50 por 100).

## O que acompanhar

- Patinhas emitidas e resgatadas por mês (e a diferença, que é o vencimento).
- Custo médio de resgate por assinante ativo.
- Churn de quem joga contra o de quem não joga.
- Quantos jogadores sem assinatura viram assinantes.

## Em aberto

- Quem marca um resgate como `aplicado` (hoje fica `disponivel` até a cobrança ou o envio usar). Precisa do sistema de cobrança.
- Orçamento mensal total para doações a ONGs (hoje o limite é 1 por pessoa por mês).
- Se o cancelamento da assinatura deve cancelar também os resgates ainda não usados (os Termos já dizem que sim).
- Ganhos que dependem de recursos que o site ainda não tem, como indicar amigos e avaliar a box.
