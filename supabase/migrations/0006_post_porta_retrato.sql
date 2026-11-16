-- Post "Como montar o porta-retrato da box deste mês", publicado.
-- As imagens do post ficam em public/blog/ (porta-retrato-pecas.webp e porta-retrato-passo-1 a 6.svg) e vão junto com o site.
insert into public.blog_posts (slug, title, summary, category, content, author_name, author_id, published, published_at)
values (
  'como-montar-o-porta-retrato-da-box',
  'Como montar o porta-retrato da box deste mês',
  'Um passo a passo para recortar, colar e montar o porta-retrato que vem impresso no fundo da box Oh My Pet!, e deixar a foto do seu pet à vista.',
  'Box do mês',
  $post$No fundo da box deste mês tem uma surpresa: um porta-retrato para montar com as próprias mãos e deixar a foto do seu pet à vista. A embalagem ganha uma segunda vida e você ganha um cantinho só dele. Em poucos minutos, só com tesoura e cola, ele fica pronto.

Neste guia você vê o que precisa e como montar, peça por peça, do primeiro recorte até colocar a foto.

## O que você vai precisar

- **Tesoura** (se usar estilete, peça ajuda a um adulto).
- **Cola**, bastão ou branca.
- **Uma foto do seu pet**, um pouco maior do que a janela da moldura.
- **Um enfeite**, se quiser: laço, flor de papel ou o que você tiver em casa.

## Conheça as peças

As peças vêm impressas no fundo da box, em uma folha só. As linhas pontilhadas com a tesourinha são as de corte. Já a linha tracejada perto da ponta estreita do trapézio é a de dobra.

![As peças do porta-retrato impressas no fundo da box](/blog/porta-retrato-pecas.webp)

- **Moldura da frente:** a peça xadrez com uma janela no meio.
- **Fundo:** a peça xadrez inteira, sem janela.
- **Três tiras:** duas compridas e uma mais curta.
- **Apoio:** a peça em formato de trapézio, com uma linha de dobra perto da ponta mais estreita.

## Passo a passo

### 1. Recorte as peças

Corte cada peça pelas linhas pontilhadas, uma de cada vez. Na moldura da frente, comece pela janela do meio: faça um furinho na linha com a ponta da tesoura e siga até dar a volta. Depois recorte a moldura, o fundo, as três tiras e o apoio.

![Passo 1: as seis peças a recortar, com a janela da moldura em primeiro lugar](/blog/porta-retrato-passo-1.svg)

### 2. Cole as tiras no verso da moldura

Vire a moldura com a parte impressa para baixo, deitada, como na ilustração. Passe cola em uma das tiras compridas e cole ao longo da borda de cima. Repita embaixo com a outra tira comprida. Por fim, cole a tira curta em um dos lados, encaixada entre as duas. O lado que sobra fica aberto: é por ali que a foto vai deslizar.

![Passo 2: as três tiras coladas no verso da moldura, com um dos lados aberto](/blog/porta-retrato-passo-2.svg)

### 3. Cole o fundo sobre as tiras

Passe cola nas três tiras, sem sujar a janela, e cubra com o fundo, com a parte impressa para fora. Alinhe os quatro cantos e pressione com as mãos por alguns segundos. O lado aberto continua livre, formando um bolsinho para a foto.

![Passo 3: o fundo colado por cima das tiras, com os cantos alinhados](/blog/porta-retrato-passo-3.svg)

### 4. Monte o apoio

Dobre o apoio na linha tracejada. A abinha, que é a ponta estreita depois da dobra, vai colada no meio do verso do fundo, mais para cima do que para baixo. A parte comprida fica solta, e é ela que se abre para trás como um pezinho e deixa o porta-retrato em pé.

![Passo 4: o apoio colado pela abinha no verso, e o pezinho aberto visto de lado](/blog/porta-retrato-passo-4.svg)

### 5. Coloque a foto

Espere a cola firmar. Depois deslize a foto pelo lado aberto, com a frente voltada para a janela. Se ela estiver folgada, prenda com um pedacinho de fita adesiva por trás.

![Passo 5: a foto entrando pelo lado aberto da moldura](/blog/porta-retrato-passo-5.svg)

### 6. Enfeite e pronto

Para um toque a mais, cole um laço ou uma flor de papel em um canto da moldura. Agora é só escolher onde ele vai ficar.

![Passo 6: o porta-retrato pronto, com um laço no canto](/blog/porta-retrato-passo-6.svg)

> Dica: se a foto ficar torta, tire e coloque de novo antes de a cola secar totalmente. O lado aberto deixa trocar a foto quando você quiser.

## Quer deixar com a sua cara? (opcional)

Se você quiser mudar a cor da moldura, dá para forrar com papel colorido. O caminho é o mesmo de qualquer porta-retrato de papelão:

1. Cole a moldura no papel escolhido, que deve ser um pouco maior do que ela de todos os lados.
2. Na janela, corte um X de ponta a ponta, sem chegar nos cantos da janela.
3. Dobre as quatro pontas do X para trás e cole no verso.
4. Corte os cantos do papel que sobrou do lado de fora e dobre as bordas por cima das laterais, colando bem.

Depois é só seguir a partir do passo 2.

## Já enviou a foto do seu pet?

Se ainda não, dá para mandar ao criar ou editar o seu pet: a gente usa a foto para criar figurinhas e artes especiais para quem assina um plano. E se ainda não criou o seu, é só [criar o seu pet](/crie-seu-pet). Mostra para a gente como ficou o seu porta-retrato!$post$,
  'Equipe Oh My Pet!',
  null,
  true,
  '2026-11-16T15:00:00Z'
)
on conflict (slug) do nothing;
