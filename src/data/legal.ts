/**
 * Termos de uso e Política de privacidade do Oh My Pet!
 *
 * É um texto-base escrito para o ramo de clube de assinatura pet no Brasil (CDC, Decreto 7.962/2013 e LGPD).
 * A empresa é fictícia: os dados de COMPANY são inventados. Antes de lançar de verdade, troque-os e peça para um advogado revisar.
 */

/** Dados fictícios da empresa (projeto acadêmico). Trocar pelos reais se o site for ao ar de verdade. */
export const COMPANY = {
  name: 'Oh My Pet!',
  cnpj: '12.345.678/0001-95',
  address: 'Rua das Patinhas, 123, Bela Vista, São Paulo/SP, CEP 01310-100',
  email: 'ohmypet.suporte@gmail.com',
  privacyEmail: 'ohmypet.dados@gmail.com',
}

/** Sobe quando o texto muda de um jeito que exige novo aceite. É gravado na conta junto com a data do aceite. */
export const TERMS_VERSION = '2026-11-16'
export const LEGAL_UPDATED = '16 de novembro de 2026'

export type Block = string | { list: string[] }

export interface LegalSection {
  id: string
  title: string
  body: Block[]
}

export interface LegalDoc {
  title: string
  intro: string
  summary: string[]
  sections: LegalSection[]
}

export const TERMS: LegalDoc = {
  title: 'Termos de uso',
  intro: 'As regras do clube, escritas de um jeito que dá para ler de verdade. Ao criar sua conta você concorda com elas.',
  summary: [
    'Você cria um pet virtual e a gente monta uma box mensal com a cara dele.',
    'A mensalidade é cobrada todo mês, o frete é cobrado à parte e você cancela quando quiser pelo site.',
    'Você tem 7 dias para se arrepender da compra, como manda o Código de Defesa do Consumidor.',
    'As respostas sobre saúde e alergias do seu pet ajudam a escolher os itens, mas não substituem o veterinário.',
    'As Patinhas do minigame são pontos para trocar por vantagens e não valem dinheiro.',
  ],
  sections: [
    {
      id: 'quem-somos',
      title: '1. Quem somos e o que são estes termos',
      body: [
        `O ${COMPANY.name} é um clube de assinatura pet. Mês a mês enviamos uma box com brinquedos, petiscos, acessórios, itens de higiene e mimos para cães e gatos, em uma embalagem que ganha uma segunda função. O site é operado por ${COMPANY.name}, CNPJ ${COMPANY.cnpj}, com endereço em ${COMPANY.address}.`,
        'Estes Termos de uso valem para o site, para a sua conta e para as assinaturas contratadas por ele. Eles funcionam junto com a nossa Política de privacidade, que explica como cuidamos dos seus dados.',
        'Ao marcar a caixa de aceite ao criar a conta, você declara que leu e concorda com estes termos. Se não concordar, não crie a conta.',
      ],
    },
    {
      id: 'palavras',
      title: '2. Algumas palavras que usamos',
      body: [
        {
          list: [
            'Site: o endereço do Oh My Pet! e suas páginas.',
            'Você ou Tutor: a pessoa que cria a conta e contrata a assinatura.',
            'Pet: o cão ou o gato cadastrado por você.',
            'Box: a caixa mensal enviada para o seu pet.',
            'Plano: a combinação de box (Mini, Wow ou Luxe) e forma de cobrança (mensal ou anual) que você escolheu.',
            'Conta: o seu cadastro, onde ficam seus pets e assinaturas.',
          ],
        },
      ],
    },
    {
      id: 'conta',
      title: '3. Sua conta',
      body: [
        'Para criar uma conta você precisa ter 18 anos ou mais, ou ser representado por um responsável legal. Menores de idade só podem usar o site acompanhados de um adulto que aceite estes termos.',
        'Você se compromete a informar dados verdadeiros e a mantê-los atualizados. É por eles que a gente entrega a box e fala com você.',
        'Você pode entrar com e-mail e senha ou com a sua conta Google. Precisamos confirmar o seu e-mail por um link antes do primeiro acesso. Guarde sua senha com cuidado: tudo o que acontecer na sua conta será considerado feito por você, e se perceber um uso indevido, avise a gente na hora.',
        'Uma conta pode ter vários pets e assinaturas. Cada assinatura é ligada a um pet.',
      ],
    },
    {
      id: 'pet',
      title: '4. O pet virtual e o questionário',
      body: [
        'Para montar a box a gente pede informações sobre o seu pet: espécie, raça, idade, aniversário, porte, alimentação, alergias, saúde, temperamento e brincadeiras favoritas. Também criamos um avatar com a aparência dele.',
        'Você é responsável por responder com cuidado. Informar uma alergia ou restrição de forma errada ou incompleta pode fazer com que a box traga itens que não servem para o seu pet.',
        'As respostas ajudam a nossa curadoria, mas o Oh My Pet! não é uma clínica veterinária e nada do que dizemos substitui a orientação de um médico-veterinário. Se o seu pet está doente, em tratamento ou tem dieta prescrita, converse com o veterinário antes de oferecer qualquer item novo.',
        'No fim do cadastro você pode enviar uma foto do seu pet real. Ela é opcional e serve para criarmos figurinhas e artes personalizadas para quem assina um plano. Envie só fotos suas ou que você tenha autorização para usar, e, se houver pessoas na imagem, só com a concordância delas.',
        'Você pode editar ou apagar os dados do pet, e trocar a foto, a qualquer momento na sua conta.',
      ],
    },
    {
      id: 'assinatura',
      title: '5. A assinatura e as boxes',
      body: [
        'Oferecemos três planos de box: Oh My Mini!, Oh My Wow! e Oh My Luxe!. O que vem em cada um está descrito nas páginas do site na hora da contratação.',
        'Os itens são escolhidos para o seu pet a partir das respostas do questionário e podem variar de um mês para o outro. Se um item estiver em falta, podemos trocar por outro equivalente, de valor e categoria semelhantes.',
        'Os itens são feitos para brincar e cuidar, mas todo pet precisa de supervisão. Observe o seu pet nas primeiras vezes, não deixe que ele engula partes de brinquedos, embalagens ou papelão, e retire qualquer item danificado, quebrado ou que ele consiga destruir com facilidade. Siga as orientações que vierem em cada item.',
        'A caixa pode ser transformada em outros objetos, como arranhador e porta-retrato, seguindo o passo a passo que enviamos. Use tesoura e outros materiais com cuidado e longe do pet e de crianças.',
      ],
    },
    {
      id: 'precos',
      title: '6. Preços, cobrança e frete',
      body: [
        'Os preços aparecem em reais, com a mensalidade de cada plano. O frete é cobrado à parte da mensalidade e mostrado antes de você confirmar a contratação.',
        'No plano mensal a cobrança acontece todo mês, na mesma data da contratação, até você cancelar. No plano anual você recebe um desconto sobre o valor mensal. As condições de cada forma de cobrança são mostradas na tela de assinatura antes da confirmação.',
        'Você pode pagar com os meios de pagamento mostrados no site, como cartão e Pix. O pagamento é feito por parceiros especializados, e o Oh My Pet! não guarda o número completo do seu cartão.',
        'Se uma cobrança não for aprovada, avisamos você e tentamos novamente. Se o pagamento continuar pendente, a box do mês pode ser suspensa até a regularização.',
        'Podemos reajustar os preços. Os reajustes só valem para as próximas cobranças, depois de avisarmos você com pelo menos 30 dias de antecedência, e quem não concordar pode cancelar sem custo.',
        'Enquanto o site estiver em fase de testes, as assinaturas são simuladas: nada é cobrado e nenhuma box é enviada. Avisamos claramente quando a cobrança real começar.',
      ],
    },
    {
      id: 'entrega',
      title: '7. Entrega',
      body: [
        'Enviamos as boxes pelos Correios ou por transportadoras parceiras. No começo, entregamos em São Paulo e região metropolitana, e vamos ampliar a área aos poucos. Se a sua região ainda não for atendida, avisamos antes de você finalizar a contratação.',
        'Informe um endereço completo e correto, com alguém para receber. Os prazos e o código de rastreio são enviados por e-mail. Se a entrega falhar por endereço errado ou ausência repetida do destinatário, o reenvio pode ter novo frete.',
        'Os prazos são estimativas e podem mudar por causa de feriados, clima ou problemas da transportadora. Se a box se perder ou chegar danificada, fale com a gente em até 7 dias do recebimento para resolvermos.',
      ],
    },
    {
      id: 'arrependimento',
      title: '8. Direito de arrependimento',
      body: [
        'Como a compra é feita pela internet, você tem 7 dias corridos para desistir, a contar da contratação ou do recebimento da primeira box, o que acontecer por último. É o direito de arrependimento do artigo 49 do Código de Defesa do Consumidor.',
        'Para usar esse direito, avise a gente pelos canais de atendimento. Devolvemos todos os valores pagos, inclusive o frete, pelo mesmo meio de pagamento. Orientamos você sobre como devolver a box, se ela já tiver chegado, e o custo da devolução fica por nossa conta.',
      ],
    },
    {
      id: 'cancelamento',
      title: '9. Cancelamento',
      body: [
        'Você pode cancelar a assinatura quando quiser, direto na sua conta, sem multa e sem precisar falar com ninguém. O cancelamento vale a partir da próxima cobrança. Se a box do mês já foi paga ou enviada, ela segue o caminho normal.',
        'Para o plano anual, o cancelamento antes do fim do período segue as condições mostradas na contratação. Isso não afeta o seu direito de arrependimento nem os seus direitos em caso de problema com o produto.',
        'Podemos suspender ou encerrar uma conta que descumpra estes termos, por exemplo em caso de fraude, uso abusivo ou dados falsos. Nesses casos avisamos o motivo e, se houver valores pagos por boxes que não serão enviadas, devolvemos a diferença.',
      ],
    },
    {
      id: 'problemas',
      title: '10. Problemas com a box',
      body: [
        'Se algum item chegar com defeito, vencido, quebrado, diferente do combinado ou contrário a uma restrição que você informou no cadastro, fale com a gente pelos canais de atendimento, de preferência com fotos. Vamos analisar e, conforme o caso, trocar o item, dar um crédito ou devolver o valor.',
        'Seus direitos previstos no Código de Defesa do Consumidor para produtos com vício ou defeito continuam valendo, inclusive os prazos legais para reclamar.',
      ],
    },
    {
      id: 'patinhas',
      title: '11. Clube Patinhas',
      body: [
        'O Clube Patinhas é um programa de pontos gratuito e opcional. Você ganha Patinhas jogando o minigame com o seu pet, criando pets e fazendo a sua primeira assinatura, e troca por vantagens. A página Clube Patinhas mostra os valores e as vantagens do momento.',
        {
          list: [
            'As Patinhas não são dinheiro. Não têm valor em reais, não podem ser transferidas, vendidas nem trocadas por dinheiro.',
            'Há limites para ganhar: o banho do minigame rende Patinhas uma vez por dia, e o minigame rende até 900 Patinhas por mês. Fazer o minigame com a ajuda do botão que completa a etapa por você não rende Patinhas.',
            'Só quem tem assinatura ativa pode trocar Patinhas. Por mês, dá para trocar uma vantagem de desconto ou frete grátis, mais um mimo e uma doação.',
            'Descontos e frete grátis entram na próxima cobrança ou no próximo envio. Se você cancelar a assinatura, as vantagens ainda não usadas deixam de valer.',
            'As Patinhas vencem se você ficar 180 dias sem ganhar nem trocar nenhuma. Ao apagar a conta, elas são apagadas junto.',
          ],
        },
        'Podemos mudar as regras, os valores e as vantagens, avisando você com pelo menos 30 dias de antecedência. As Patinhas que você já juntou continuam na sua conta, mas as trocas futuras seguem as regras novas.',
        'Se identificarmos robôs, contas falsas ou qualquer tentativa de burlar os limites, as Patinhas obtidas assim são canceladas e a conta pode ser encerrada.',
      ],
    },
    {
      id: 'propriedade',
      title: '12. Marca, avatar e conteúdo',
      body: [
        'O nome Oh My Pet!, o logotipo, as ilustrações, os desenhos dos avatares, os textos e o design do site são nossos ou de quem nos licenciou. Você pode usar o site para o seu uso pessoal, mas não pode copiar, vender ou alterar esse material sem a nossa autorização.',
        'O avatar que você cria para o seu pet pode ser usado por você de forma pessoal, por exemplo para compartilhar nas redes sociais. As informações que você escreve sobre o seu pet continuam sendo suas, e nos dão apenas a licença necessária para operar o serviço, como montar a sua box e criar os itens personalizados.',
        'Se você nos marcar nas redes sociais ou mandar fotos e depoimentos, só vamos publicá-los em nossos canais com a sua autorização.',
      ],
    },
    {
      id: 'uso',
      title: '13. Uso correto do site',
      body: [
        'Ao usar o site, você não pode:',
        {
          list: [
            'usar dados falsos, de outras pessoas ou criar contas em nome de terceiros;',
            'tentar acessar contas, sistemas ou dados que não são seus;',
            'usar robôs, scripts ou outros meios automáticos para coletar dados ou sobrecarregar o site;',
            'fazer engenharia reversa ou copiar o código do site;',
            'usar o site para fraude, para ofender outras pessoas ou para qualquer coisa ilegal.',
          ],
        },
      ],
    },
    {
      id: 'ongs',
      title: '14. ONGs que apoiamos',
      body: [
        'O Oh My Pet! apoia a causa animal e a adoção responsável, e apresenta na página Tudo sobre ONG’s organizações que trabalham com isso. As informações sobre cada uma vêm dos canais oficiais delas. A apresentação de uma ONG no site não significa que ela endossa os nossos produtos, que participa do serviço ou que é responsável por ele. Para adotar, o contato é feito diretamente com cada ONG, que tem o seu próprio processo de adoção.',
      ],
    },
    {
      id: 'responsabilidade',
      title: '15. Responsabilidade',
      body: [
        'Fazemos o possível para manter o site funcionando, mas ele pode ficar fora do ar por manutenção ou por problemas fora do nosso controle. Também dependemos de parceiros como meios de pagamento, transportadoras e serviços de hospedagem.',
        'Dentro do que a lei permite, não nos responsabilizamos por danos causados por informações incorretas passadas pelo tutor, por uso dos itens sem supervisão ou contra as orientações, ou por falhas de terceiros fora do nosso controle. Nada nestes termos reduz os seus direitos como consumidor.',
      ],
    },
    {
      id: 'mudancas',
      title: '16. Mudanças nestes termos',
      body: [
        'Podemos atualizar estes termos. Quando a mudança for importante, avisamos por e-mail ou no site com antecedência, e a data de atualização no topo da página muda. Se você continuar usando o site depois do aviso, entendemos que concorda com a nova versão. Se não concordar, pode cancelar a assinatura e encerrar a conta.',
      ],
    },
    {
      id: 'lei',
      title: '17. Lei aplicável e foro',
      body: [
        'Estes termos seguem as leis do Brasil. Para resolver qualquer problema que não seja resolvido na conversa, o foro é o do domicílio do consumidor. Antes disso, escreva para a gente: a maioria das questões se resolve rapidinho.',
      ],
    },
    {
      id: 'contato',
      title: '18. Fale com a gente',
      body: [
        `Dúvidas, pedidos de cancelamento, trocas ou reclamações: ${COMPANY.email}.`,
        `${COMPANY.name} · CNPJ ${COMPANY.cnpj} · ${COMPANY.address}.`,
      ],
    },
  ],
}

export const PRIVACY: LegalDoc = {
  title: 'Política de privacidade',
  intro: 'Como o Oh My Pet! coleta, usa e protege os seus dados, de acordo com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).',
  summary: [
    'Pedimos só o que precisamos para criar a sua conta, montar a box do seu pet e entregar.',
    'Não vendemos os seus dados.',
    'Só compartilhamos com quem ajuda a gente a operar o serviço, como pagamento, entrega e hospedagem.',
    'Você pode pedir acesso, correção ou exclusão dos seus dados quando quiser.',
  ],
  sections: [
    {
      id: 'quem',
      title: '1. Quem cuida dos seus dados',
      body: [
        `O controlador dos seus dados é ${COMPANY.name}, CNPJ ${COMPANY.cnpj}, ${COMPANY.address}. Para falar sobre privacidade, escreva para o nosso encarregado de dados (DPO): ${COMPANY.privacyEmail}.`,
      ],
    },
    {
      id: 'dados',
      title: '2. Quais dados coletamos',
      body: [
        {
          list: [
            'Dados da conta: nome, e-mail e senha (guardada de forma protegida, nunca em texto aberto). Se você entrar com o Google, recebemos o nome e o e-mail da sua conta Google.',
            'Dados do pet: nome, espécie, raça, idade, aniversário, porte, alimentação, alergias, saúde, temperamento, brincadeiras favoritas, a aparência do avatar e, se você enviar, a foto do pet. Esses dados são sobre o animal, mas ficam ligados à sua conta.',
            'Dados da assinatura: plano escolhido, forma de cobrança, situação (ativa ou cancelada) e datas.',
            'Dados de entrega: nome de quem recebe, endereço e telefone, quando você contratar uma box.',
            'Dados de pagamento: quem processa o pagamento é um parceiro especializado. Nós recebemos só o resultado da cobrança e os últimos dígitos do cartão, não o número completo.',
            'Dados de contato: e-mail inscrito na newsletter e as mensagens que você manda para o atendimento.',
            'Dados de uso: informações técnicas como endereço IP, tipo de navegador e páginas acessadas, para o site funcionar e ficar seguro.',
          ],
        },
        'Não pedimos dados que não precisamos, como CPF ou documentos, a não ser que a lei exija para emitir a nota fiscal ou para o pagamento.',
      ],
    },
    {
      id: 'usos',
      title: '3. Para que usamos e em que base legal',
      body: [
        {
          list: [
            'Criar e manter a sua conta, e montar a box do seu pet: execução do contrato.',
            'Usar a foto do seu pet para criar figurinhas e artes personalizadas: o seu consentimento, dado ao enviar a foto, que você pode retirar apagando a foto na conta.',
            'Cobrar, entregar, emitir nota fiscal e atender você: execução do contrato e cumprimento de obrigação legal.',
            'Enviar avisos sobre a sua assinatura, entrega e mudanças nos termos: execução do contrato.',
            'Enviar novidades, dicas e ofertas por e-mail: o seu consentimento, que você pode retirar a qualquer momento.',
            'Melhorar o site e a curadoria dos produtos, prevenir fraudes e manter o site seguro: legítimo interesse, sempre respeitando os seus direitos.',
            'Nos defender em processos ou responder a autoridades: exercício regular de direitos e cumprimento de obrigação legal.',
          ],
        },
      ],
    },
    {
      id: 'compartilhamento',
      title: '4. Com quem compartilhamos',
      body: [
        'Não vendemos os seus dados. Compartilhamos o necessário com empresas que nos ajudam a operar:',
        {
          list: [
            'Supabase: guarda o banco de dados e cuida do login da sua conta.',
            'Cloudflare: hospedagem do site.',
            'Google: se você escolher entrar com a sua conta Google.',
            'Meios de pagamento: para processar a cobrança da assinatura.',
            'Correios e transportadoras: para entregar a box.',
            'Serviços de envio de e-mail: para os avisos e a newsletter.',
            'ONGs que apoiamos: apenas se você autorizar, por exemplo em uma campanha de adoção.',
            'Autoridades públicas: quando a lei ou uma ordem judicial exigir.',
          ],
        },
        'Alguns desses parceiros ficam em outros países. Nesses casos, buscamos garantias de proteção compatíveis com a LGPD.',
      ],
    },
    {
      id: 'cookies',
      title: '5. Cookies e armazenamento no navegador',
      body: [
        'Hoje usamos apenas o armazenamento essencial do navegador: manter você conectado à sua conta e guardar o rascunho do seu pet enquanto você preenche o questionário. Sem isso o site não funciona direito.',
        'Se passarmos a usar ferramentas de estatística ou publicidade, vamos avisar e pedir o seu consentimento antes.',
      ],
    },
    {
      id: 'prazo',
      title: '6. Por quanto tempo guardamos',
      body: [
        'Guardamos os seus dados enquanto a sua conta existir. Quando você apaga a conta, apagamos ou anonimizamos os dados, exceto os que precisamos manter por obrigação legal, como registros fiscais e de compra (em geral por 5 anos), ou para nos defender em processos.',
        'Você pode apagar os dados de um pet, ou a conta inteira, pedindo pelo e-mail de privacidade.',
      ],
    },
    {
      id: 'direitos',
      title: '7. Os seus direitos',
      body: [
        'Pela LGPD, você pode pedir a qualquer momento:',
        {
          list: [
            'confirmar se tratamos os seus dados e ter acesso a eles;',
            'corrigir dados incompletos, errados ou desatualizados;',
            'pedir a anonimização, o bloqueio ou a exclusão de dados desnecessários ou tratados fora da lei;',
            'receber os seus dados em formato que outro serviço consiga ler (portabilidade);',
            'saber com quem compartilhamos os seus dados;',
            'retirar o consentimento e se opor a um tratamento feito sem ele;',
            'revisar decisões tomadas só por sistemas automáticos que afetem você.',
          ],
        },
        `Para isso, escreva para ${COMPANY.privacyEmail}. Respondemos em até 15 dias. Se achar que não resolvemos, você pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
      ],
    },
    {
      id: 'seguranca',
      title: '8. Como protegemos os seus dados',
      body: [
        'Usamos conexão segura (HTTPS), senhas guardadas de forma protegida e regras de acesso que deixam cada pessoa ver apenas os próprios dados. Só quem precisa para trabalhar tem acesso às informações.',
        'Nenhum sistema é totalmente imune a falhas. Se acontecer um incidente de segurança que possa trazer risco para você, avisamos você e a ANPD, como a lei manda.',
      ],
    },
    {
      id: 'criancas',
      title: '9. Crianças e adolescentes',
      body: [
        'O site é voltado para adultos. Não coletamos de propósito dados de menores de 18 anos sem o consentimento de um responsável. Se você acha que um menor criou uma conta sem autorização, fale com a gente que apagamos.',
      ],
    },
    {
      id: 'marketing',
      title: '10. E-mails e novidades',
      body: [
        'Os e-mails sobre a sua conta, assinatura e entrega são parte do serviço e você os recebe enquanto tiver conta. Já as novidades e ofertas só enviamos para quem se inscreveu, e todo e-mail traz um jeito de cancelar o recebimento.',
      ],
    },
    {
      id: 'mudancas',
      title: '11. Mudanças nesta política',
      body: [
        'Podemos atualizar esta política. A data de atualização fica no topo da página e, quando a mudança for relevante, avisamos você por e-mail ou no site.',
      ],
    },
    {
      id: 'contato',
      title: '12. Fale com a gente',
      body: [
        `Encarregado de dados (DPO): ${COMPANY.privacyEmail}. Atendimento geral: ${COMPANY.email}.`,
        `${COMPANY.name} · CNPJ ${COMPANY.cnpj} · ${COMPANY.address}.`,
      ],
    },
  ],
}
