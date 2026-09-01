export const SITE = {
  name: "D’orus Assistência Técnica",
  shortName: "D’orus",
  origin: "https://assistenciadorus.com.br",
  phone: "(11) 91357-3932",
  phoneHref: "tel:+5511913573932",
  whatsapp: "https://wa.me/5511913573932",
  instagram: "https://instagram.com/assistenciadorus",
  serviceArea: "Guarulhos, Arujá, Itaquaquecetuba e São Paulo",
  cities: ["Guarulhos", "Arujá", "Itaquaquecetuba", "São Paulo"],
  description:
    "Assistência técnica de linha branca com atendimento em domicílio em Guarulhos, Arujá, Itaquaquecetuba e São Paulo.",
};

export const equipmentOptions = [
  "Geladeira",
  "Máquina de lavar",
  "Fogão",
  "Freezer",
  "Lava-louças",
  "Lava e seca",
  "Forno",
  "Micro-ondas",
  "Outro equipamento de linha branca",
];

export const services = [
  {
    slug: "geladeiras",
    name: "Geladeiras",
    image: "servico-geladeira",
    title: "Assistência técnica de geladeiras em Guarulhos e região",
    summary:
      "Geladeira parou de gelar, está formando gelo demais, vazando água ou fazendo um barulho diferente? Observe os sintomas e evite desmontar o aparelho.",
    issues: [
      "Não está gelando",
      "Freezer gela, geladeira não",
      "Gelo em excesso",
      "Vazamento de água",
      "Ruídos diferentes",
      "Liga e desliga demais",
    ],
    guideSlugs: ["geladeira-nao-gela", "geladeira-fazendo-barulho"],
  },
  {
    slug: "maquinas-de-lavar",
    name: "Máquinas de lavar",
    image: "servico-lavadora",
    title: "Assistência técnica de máquinas de lavar em Guarulhos e região",
    summary:
      "Falhas de centrifugação, drenagem, enchimento, vazamentos ou ciclos interrompidos podem ter causas diferentes.",
    issues: [
      "Não centrifuga",
      "Não drena",
      "Não enche",
      "Vaza água",
      "Ruídos e vibração",
      "Ciclo para no meio",
    ],
    guideSlugs: ["maquina-nao-centrifuga"],
  },
  {
    slug: "fogoes",
    name: "Fogões",
    image: "servico-fogao",
    title: "Assistência técnica de fogões em Guarulhos e região",
    summary:
      "Falhas no acendimento, chama irregular ou forno sem aquecimento precisam de avaliação segura.",
    issues: [
      "Não acende",
      "Chama irregular",
      "Forno não aquece",
      "Acendimento falha",
      "Cheiro de gás",
      "Comandos com defeito",
    ],
    guideSlugs: ["fogao-nao-acende"],
  },
  {
    slug: "freezers",
    name: "Freezers",
    image: "servico-freezer",
    title: "Assistência técnica de freezers em Guarulhos e região",
    summary:
      "Perda de congelamento, excesso de gelo, ruídos ou funcionamento contínuo merecem diagnóstico.",
    issues: [
      "Não congela",
      "Gelo em excesso",
      "Porta sem vedação",
      "Ruídos diferentes",
      "Vazamento",
      "Funcionamento contínuo",
    ],
    guideSlugs: ["freezer-nao-congela"],
  },
  {
    slug: "lava-loucas",
    name: "Lava-louças",
    image: "servico-lava-loucas",
    title: "Assistência técnica de lava-louças em Guarulhos e região",
    summary:
      "Interrupções de ciclo, falhas de drenagem ou lavagem insuficiente podem ter origens diferentes.",
    issues: [
      "Não inicia",
      "Não drena",
      "Não aquece",
      "Louças continuam sujas",
      "Vazamento",
      "Ciclo interrompido",
    ],
    guideSlugs: [],
  },
  {
    slug: "lava-e-seca",
    name: "Lava e seca",
    image: "servico-lava-e-seca",
    title: "Assistência técnica de lava e seca em Guarulhos e região",
    summary:
      "Falhas na lavagem, centrifugação, drenagem ou secagem podem ser avaliadas conforme marca e modelo.",
    issues: [
      "Não centrifuga",
      "Não seca corretamente",
      "Não drena",
      "Código no painel",
      "Vazamento",
      "Programa interrompido",
    ],
    guideSlugs: [],
  },
  {
    slug: "fornos",
    name: "Fornos",
    image: "servico-forno",
    title: "Assistência técnica de fornos em Guarulhos e região",
    summary:
      "Se o forno não aquece corretamente, apresenta funcionamento irregular ou falhas de comando, a D’orus pode avaliar o equipamento.",
    issues: [
      "Não aquece",
      "Aquecimento irregular",
      "Desliga sozinho",
      "Comandos falham",
      "Porta sem vedação",
      "Temperatura instável",
    ],
    guideSlugs: [],
  },
  {
    slug: "micro-ondas",
    name: "Micro-ondas",
    image: "servico-microondas",
    title: "Assistência técnica de micro-ondas em Guarulhos e região",
    summary:
      "Micro-ondas que liga sem aquecer, apresenta ruídos ou falhas no painel deve ser avaliado sem abrir o gabinete.",
    issues: [
      "Liga, mas não aquece",
      "Prato não gira",
      "Painel falha",
      "Ruído diferente",
      "Desliga sozinho",
      "Porta não trava",
    ],
    guideSlugs: ["micro-ondas-nao-aquece"],
  },
];

export const guides = [
  {
    slug: "geladeira-nao-gela",
    category: "Geladeira",
    title: "Geladeira não está gelando?",
    description:
      "Causas comuns, sinais seguros para observar e quando procurar assistência.",
    checks: [
      "Confira o ajuste de temperatura",
      "Observe se a porta fecha completamente",
      "Não bloqueie as saídas internas de ar",
      "Registre gelo, água ou ruídos diferentes",
    ],
    warning:
      "Se o problema continuar, evite desmontar ou forçar o funcionamento do aparelho.",
    service: "geladeiras",
  },
  {
    slug: "maquina-nao-centrifuga",
    category: "Máquina de lavar",
    title: "Máquina não centrifuga?",
    description:
      "Drenagem, distribuição da carga, trava e outros sinais importantes.",
    checks: [
      "Observe se ficou água no cesto",
      "Redistribua uma carga desequilibrada",
      "Confira se a tampa ou porta fecha",
      "Anote códigos exibidos no painel",
    ],
    warning:
      "Não force a abertura nem acesse componentes internos com o equipamento ligado.",
    service: "maquinas-de-lavar",
  },
  {
    slug: "geladeira-fazendo-barulho",
    category: "Geladeira",
    title: "Geladeira fazendo barulho",
    description:
      "Quando o som pode fazer parte do funcionamento e quando merece atenção.",
    checks: [
      "Identifique de onde vem o som",
      "Confira o nivelamento do aparelho",
      "Afaste objetos que estejam vibrando",
      "Grave o ruído para mostrar ao técnico",
    ],
    warning:
      "Ruído novo acompanhado de perda de refrigeração ou cheiro diferente exige avaliação.",
    service: "geladeiras",
  },
  {
    slug: "freezer-nao-congela",
    category: "Freezer",
    title: "Freezer não congela direito?",
    description: "Temperatura, vedação, excesso de gelo e perda de desempenho.",
    checks: [
      "Confira o ajuste de temperatura",
      "Observe a vedação da porta",
      "Evite aberturas frequentes",
      "Mantenha a ventilação externa",
    ],
    warning:
      "Gelo em excesso ou funcionamento contínuo pode indicar falha que precisa de diagnóstico.",
    service: "freezers",
  },
  {
    slug: "fogao-nao-acende",
    category: "Fogão",
    title: "Fogão não acende?",
    description:
      "Verificações simples de queimadores, acendimento e cuidados com gás.",
    checks: [
      "Confira se o queimador está encaixado",
      "Mantenha as peças limpas e secas",
      "Observe a cor e estabilidade da chama",
      "Interrompa o uso se houver cheiro de gás",
    ],
    warning:
      "Em caso de cheiro de gás, feche o registro, ventile o ambiente e não acione interruptores.",
    service: "fogoes",
  },
  {
    slug: "micro-ondas-nao-aquece",
    category: "Micro-ondas",
    title: "Micro-ondas liga, mas não aquece?",
    description:
      "Sinais que ajudam no diagnóstico e por que nunca abrir o gabinete.",
    checks: [
      "Teste somente com recipiente apropriado e água",
      "Observe se prato e ventilação funcionam",
      "Anote ruídos ou cheiro diferente",
      "Interrompa o uso se houver faíscas",
    ],
    warning:
      "O gabinete armazena alta tensão mesmo desligado. Nunca tente abrir o aparelho em casa.",
    service: "micro-ondas",
  },
];

export const brands = [
  ["Brastemp", "brastemp"],
  ["Consul", "consul"],
  ["Electrolux", "electrolux"],
  ["Samsung", "samsung"],
  ["LG", "lg"],
  ["Continental", "continental"],
  ["Atlas", "atlas"],
  ["Midea", "midea"],
  ["Mueller", "mueller"],
  ["Philco", "philco"],
  ["Panasonic", "panasonic"],
  ["GE", "ge-appliances"],
  ["Bosch", null],
];

export const reviews = [
  [
    "Romildo Oliveira",
    "Bom lugar para consertos de geladeiras e máquinas de lavar",
  ],
  ["Daiana Marques", "Ótimo"],
  ["Ju Kanashiro", "Avaliou a D’orus com 5 estrelas no Google."],
];
