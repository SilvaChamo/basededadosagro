
import {
    Truck, Globe, ShieldCheck, Search,
    Zap, Store, Smartphone, Users,
    TrendingUp, Gavel, ShoppingCart,
    Calendar, Star, FileText,
    Briefcase, GraduationCap, Monitor,
    Rocket, Settings, Headphones,
    PenTool, CheckCircle2, Lightbulb
} from "lucide-react";

export interface SubService {
    title: string;
    description: string;
}

export interface SubCategory {
    slug: string;
    title: string;
    description: string;
    icon: any;
    fullDescription: string;
    subServices: SubService[];
    features: string[];
}

export interface CategoryData {
    id: string;
    title: string;
    subCategories: Record<string, SubCategory>;
}

export const servicesData: Record<string, CategoryData> = {
    "logistica": {
        id: "logistica",
        title: "Logística e transporte",
        subCategories: {
            "transporte": {
                slug: "transporte",
                title: "Transporte Terrestre",
                description: "Frota especializada para o transporte de produtos agrários em grandes quantidades.",
                icon: Truck,
                fullDescription: "Colocamos ao seu dispor uma rede estratégica de transportadores moçambicanos certificados, especializados no escoamento de grandes volumes agrícolas. Das terras férteis de Manica aos portos da Beira e Maputo, garantimos que a sua colheita seja transportada com rigor técnico, utilizando frotas adaptadas à nossa orografia e clima.\n\nEsta acção logística não se limita ao transporte físico; envolve uma coordenação minuciosa que visa reduzir as perdas pós-colheita, um desafio crítico para o produtor nacional. Ao confiar na nossa curadoria de transportadoras, assegura que o seu investimento chegue ao destino com a frescura e a qualidade que o mercado exige, maximizando a sua rentabilidade comercial e fortalecendo a segurança alimentar moçambicana.",
                subServices: [
                    { title: "Transporte de Granéis", description: "Cereais e oleaginosas em bruto para processamento ou exportação." },
                    { title: "Cadeia de Frio", description: "Logística climatizada para hortícolas e produtos sensíveis." }
                ],
                features: ["Frotas Certificadas", "Seguro de Carga", "Monitoria 24/7"]
            },
            "multimodal": {
                slug: "multimodal",
                title: "Logística Multimodal",
                description: "Integração eficiente entre transporte rodoviário e marítimo para exportação.",
                icon: Globe,
                fullDescription: "Facilitamos a integração entre a produção local e os mercados globais através de parcerias com os principais operadores logísticos e portuários que servem os corredores moçambicanos. A nossa solução multimodal coordena o transporte rodoviário com redes ferroviárias e marítimas, optimizando o tempo de trânsito e reduzindo custos operacionais de exportação de forma a elevar a competitividade nacional.\n\nEm colaboração com instituições aduaneiras de prestígio, garantimos a conformidade legal e documental em cada transacção internacional, permitindo que os produtores expandam as suas fronteiras comerciais. Este esforço conjunto visa a excelência na cadeia de valor, assegurando que o produto moçambicano alcance os portos de destino com a máxima eficiência e o rigor técnico exigido pelos mercados mais sofisticados do globo.\n\nAtravés desta coordenação estratégica, removemos barreiras geográficas e operacionais de forma a permitir que o pequeno e médio produtor aceda a cadeias de abastecimento globais. O nosso papel é garantir que a logística deixe de ser um obstáculo e se transforme numa vantagem competitiva inegável para o agronegócio moçambicano, assegurando que cada tonelada de produção seja valorizada no palco internacional.",
                subServices: [
                    { title: "Conexão Ferroviária", description: "Aproveitamento dos corredores logísticos nacionais." },
                    { title: "Despacho Aduaneiro", description: "Tratamento de toda a documentação necessária para exportação." },
                    { title: "Armazenagem Portuária", description: "Gestão de stocks em zonas de trânsito portuário." }
                ],
                features: ["Simplificação de burocracia", "Redução de custos logísticos", "Expansão para mercados globais"]
            },
            "seguranca": {
                slug: "seguranca",
                title: "Segurança de Carga",
                description: "Protocolos rigorosos de segurança e monitoramento em tempo real.",
                icon: ShieldCheck,
                fullDescription: "A blindagem logística dos seus activos agrários é a nossa prioridade absoluta através de protocolos rigorosos e monitoria constante. Implementamos sistemas de segurança que abrangem desde lacres de alta resistência até escoltas especializadas em corredores de trânsito crítico, garantindo que a sua mercadoria esteja protegida contra qualquer intercorrência externa ou falha operacional durante o trajecto nacional.\n\nCoordenamos com as autoridades locais e equipas de segurança certificadas para assegurar que cada carga valiosa seja tratada com o brio e a atenção necessários. Este rigor operacional minimiza riscos de perdas catastróficas e garante que o seu património agrícola alcance o destino final com a integridade técnica exigida pelos mercados de exportação mais exigentes.\n\nAo estabelecer um perímetro de confiança em torno da sua logística, a sua empresa ganha tranquilidade para se focar no crescimento da produção. A nossa segurança de carga é o escudo que protege o brio do agronegócio moçambicano em todas as províncias, assegurando que o progresso não seja interrompido por imprevistos evitáveis no terreno.",
                subServices: [
                    { title: "Escolta Dedicada", description: "Acompanhamento táctico para mercadorias de elevado valor comercial." },
                    { title: "Verificação de Lacre", description: "Protocolos rigorosos de selagem e inspecção nos pontos de carga." },
                    { title: "Gestão de Risco", description: "Análise prévia de rotas para evitar zonas de congestionamento ou perigo." },
                    { title: "Seguro Agrário", description: "Cobertura total contra sinistros e danos durante o transporte." }
                ],
                features: ["Integridade Total", "Escoltas Certificadas", "Rigor Operacional"]
            },
            "rastreio": {
                slug: "rastreio",
                title: "Rastreio em Tempo Real",
                description: "Acompanhe a sua mercadoria desde a origem até ao destino final.",
                icon: Search,
                fullDescription: "No agronegócio moderno, a informação precisa e a previsibilidade absoluta são fundamentais para o sucesso de qualquer projecto comercial. O nosso sistema de rastreio de ponta oferece visibilidade total sobre a localização exacta e o estado da carga em cada etapa da viagem, acessível a partir de qualquer dispositivo móvel ou fixo, garantindo que o gestor possua o controlo total sobre a sua logística.\n\nCentralizamos dados operacionais que permitem prever tempos de chegada com precisão cirúrgica, facilitando a coordenação com centros de descarga e compradores de forma exemplar. O fornecimento de relatórios detalhados permite a optimização contínua das rotas logísticas, reduzindo ineficiências e assegurando que a transacção de bens agrícolas ocorra sob a égide da transparência e da competência tecnológica mais avançada.\n\nEsta visibilidade em tempo real é crucial para mitigar riscos de deterioração de produtos frescos e para manter a cadência de abastecimento das unidades industriais. Ao integrar tecnologia de geolocalização robusta com a nossa rede de transportadores, proporcionamos uma camada de confiança técnica que transforma a gestão de frotas numa acção estratégica de alta performance para o sector agro-industrial moçambicano.",
                subServices: [
                    { title: "Portal do Cliente", description: "Acesso privado para gestão de todas as expedições." },
                    { title: "Notificações Automáticas", description: "Alertas por SMS ou E-mail em pontos de controlo." },
                    { title: "Relatórios de Trânsito", description: "Análise histórica de tempos e rotas de entrega." }
                ],
                features: ["Visibilidade 100%", "Previsibilidade de entrega", "Dados accionáveis"]
            }
        }
    },
    // Adicionar as restantes categorias seguindo o mesmo padrão...
    "assistencia": {
        id: "assistencia",
        title: "Assistência digital",
        subCategories: {
            "portais": {
                slug: "portais",
                title: "Criação de Portais",
                description: "Desenvolvimento de sites institucionais e catálogos agrários.",
                icon: Rocket,
                fullDescription: "A imagem institucional e a acessibilidade digital são os alicerces de qualquer empresa agrária moderna que vise o sucesso nacional e internacional. A nossa equipa de desenvolvimento técnico projecta portais web robustos e catálogos digitais optimizados que traduzem a excelência da sua produção em interfaces elegantes, garantindo que a sua marca seja descoberta pelos parceiros mais influentes do globo.\n\nEstes portais são arquitectados com o máximo rigor técnico, assegurando rapidez de carregamento e compatibilidade total com dispositivos móveis, vitais para a consulta no campo. Ao centralizar as informações do seu projecto num endereço digital proprietário e de alta performance, elevamos o prestígio da sua organização e facilitamos a expansão comercial através de uma presença online verdadeiramente profissional e impactante.\n\nAtravés de uma estrutura de navegação intuitiva e de um design focado na conversão, o seu portal transforma-se num vendedor incansável 24 horas por dia. Proporcionamos as ferramentas necessárias para que a sua empresa lidere a narrativa do seu sector, garantindo que cada visitante compreenda o valor e o brio contido em toda a sua acção produtiva moçambicana.",
                subServices: [
                    { title: "Design UI/UX", description: "Interfaces modernas e focadas na experiência do utilizador." },
                    { title: "Desenvolvimento Web", description: "Codificação robusta e optimizada para todos os dispositivos." },
                    { title: "Gestão de Projecto", description: "Acompanhamento dedicado desde a concepção até ao lançamento." }
                ],
                features: ["Design Responsivo", "SEO Optimizado", "Gestor de Conteúdo Intuitivo"]
            },
            "tecnico": {
                slug: "tecnico",
                title: "Apoio Técnico TI",
                description: "Assistência para a modernização das suas ferramentas de gestão.",
                icon: Settings,
                fullDescription: "A continuidade operacional da sua empresa depende de uma infraestrutura tecnológica resiliente e sempre disponível. O nosso suporte técnico especializado em agronegócio cobre desde a manutenção de servidores críticos até à configuração de redes de conectividade em locais remotos e campos de produção.\n\nAtravés de diagnósticos preventivos e intervenções rápidas, garantimos que os seus sistemas de gestão e recolha de dados nunca falhem, minimizando tempos de inatividade que poderiam comprometer a produtividade e a tomada de decisões em tempo real. A nossa equipa possui experiência vasta em lidar com os desafios físicos e climáticos da infraestrutura em Moçambique.\n\nProtegemos o seu património digital com protocolos rigorosos de cibersegurança e backups automatizados, assegurando que o seu projecto esteja imune a perdas de informação catastróficas. O nosso objectivo é ser a fundação sólida sobre a qual a sua empresa agrária constrói o seu futuro digital com total confiança e integridade técnica.",
                subServices: [
                    { title: "Manutenção Preventiva", description: "Verificações periódicas para evitar falhas críticas." },
                    { title: "Suporte Hardware", description: "Instalação e reparação de equipamentos informáticos." },
                    { title: "Configuração de Redes", description: "Soluções de conectividade para áreas remotas." }
                ],
                features: ["Resposta Rápida", "Técnicos Certificados", "Minimização de Downtime"]
            },
            "apps": {
                slug: "apps",
                title: "Desenvolvimento App",
                description: "Soluções móveis personalizadas para gestão de campo.",
                icon: Smartphone,
                fullDescription: "Digitalize as operações de campo e tenha o controlo total da sua produção na palma da mão através de soluções móveis customizadas. Criamos aplicações móveis que permitem o registo de actividades agrícolas, controlo de pessoal e monitoramento de pragas mesmo em áreas sem cobertura de internet, através de sistemas robustos de sincronização offline.\n\nAs nossas apps são desenhadas especificamente para o ambiente de campo, com interfaces intuitivas que facilitam a adoção tecnológica por trabalhadores de diferentes níveis técnicos, transformando o telemóvel numa ferramenta de gestão de alta precisão. Focamo-nos na utilidade prática e na rapidez de resposta sob condições reais de uso rural em Moçambique.\n\nAo integrar os dados de campo directamente nos seus sistemas centrais, ganha uma visibilidade sem precedentes sobre os custos e o progresso da sua colheita. Esta transformação digital do brio laboral permite uma optimização contínua dos recursos, reduzindo o desperdício e elevando a rentabilidade total do seu projecto agrário com a elegância que a tecnologia moderna permite.",
                subServices: [
                    { title: "Apps nativas iOS/Android", description: "Máxima performance e integração com o sistema." },
                    { title: "Sincronização Offline", description: "Trabalhe no campo sem internet e sincronize depois." },
                    { title: "Dashboards Analíticos", description: "Visualize métricas importantes directamente no telemóvel." }
                ],
                features: ["Focado no Operador", "Interface Simplificada", "Alta Segurança de Dados"]
            },
            "suporte": {
                slug: "suporte",
                title: "Suporte Online",
                description: "Equipa dedicada para garantir a operacionalidade das plataformas.",
                icon: Headphones,
                fullDescription: "Garanta a operacionalidade contínua das suas ferramentas digitais com o nosso suporte humanizado. Resolvemos incidentes em tempo real e oferecemos formação para que a sua equipa domine cada funcionalidade do sistema, minimizando tempos de inactividade que poderiam comprometer a produtividade no terreno ou na gestão administrativa.\n\nActuamos como um braço técnico estendido da sua organização, oferecendo assistência remota e presencial em casos críticos de falha de rede ou software. A nossa equipa de especialistas seniores garante que as actualizações de segurança sejam implementadas com rigor, protegendo os dados estratégicos da sua operação contra ameaças digitais de forma inabalável e competente.\n\nAo estabelecer um contrato de suporte connosco, a sua empresa assegura uma resposta técnica prioritária e personalizada. Este compromisso com a excelência do serviço técnico permite que o seu projecto se foque exclusivamente na produção, enquanto nós tratamos de toda a complexidade tecnológica que sustenta a sua presença digital e operacional no mercado nacional.",
                subServices: [
                    { title: "Suporte Instantâneo", description: "Atendimento ágil para questões de uso diário." },
                    { title: "Resolução de Bugs", description: "Correcções técnicas imediatas para manter o fluxo de trabalho." }
                ],
                features: ["Sempre Online", "Técnicos Humanos", "Resposta Ágil"]
            }
        }
    },
    "insumos": {
        id: "insumos",
        title: "Insumos",
        subCategories: {
            // 1. Insumos Biológicos
            "sementes": {
                slug: "sementes",
                title: "Sementes Certificadas",
                description: "Alta produtividade para sua colheita com sementes verificadas.",
                icon: Zap,
                fullDescription: "O sucesso da sua campanha inicia-se invariavelmente na semente. Facilitamos o acesso a insumos fornecidos por parceiros certificados e rigorosamente monitorados, garantindo altas taxas de germinação e resistência às pragas locais.",
                subServices: [
                    { title: "Sementes de Cereais", description: "Milho, arroz e trigo com alto rendimento." },
                    { title: "Oleaginosas", description: "Soja e girassol de qualidade premium." }
                ],
                features: ["Certificação Oficial", "Adaptabilidade Climática", "Rigor Genético"]
            },
            "mudas": {
                slug: "mudas",
                title: "Mudas e Propagação",
                description: "Material vegetal de alta qualidade para plantio direto.",
                icon: Zap,
                fullDescription: "Disponibilizamos mudas de fruteiras, hortícolas e espécies florestais produzidas em viveiros certificados, garantindo um arranque vigoroso e saudável para a sua plantação em qualquer província.",
                subServices: [
                    { title: "Fruteiras", description: "Citrinos, mangueiras e outras espécies tropicais." },
                    { title: "Florestais", description: "Eucalipto, pinheiro e espécies nativas." }
                ],
                features: ["Vigor Híbrido", "Isenção de Pragas", "Prontas para Plantio"]
            },
            "matrizes-reprodutores": {
                slug: "matrizes-reprodutores",
                title: "Matrizes e Reprodutores",
                description: "Excelência genética para o seu efetivo pecuário.",
                icon: Zap,
                fullDescription: "Melhore a produtividade do seu gado com matrizes e reprodutores de linhagens selecionadas, adaptadas às condições tropicais e com alto potencial de ganho de peso e produção leiteira.",
                subServices: [
                    { title: "Bovinos de Corte", description: "Raças focadas em produção de carne de qualidade." },
                    { title: "Bovinos de Leite", description: "Genética focada em alta produtividade leiteira." }
                ],
                features: ["Genética Provada", "Certificado Sanitário", "Adaptação Local"]
            },
            "material-genetico": {
                slug: "material-genetico",
                title: "Material Genético",
                description: "Inseminação artificial e biotecnologia animal.",
                icon: Zap,
                fullDescription: "Acesse as melhores linhagens globais através de sémen e embriões certificados, permitindo a evolução rápida do seu rebanho com biotecnologia de ponta e baixo risco sanitário.",
                subServices: [
                    { title: "Sémen Congelado", description: "Vasta gama de raças para inseminação artificial." },
                    { title: "Embriões", description: "Transferência de embriões de alto valor genético." }
                ],
                features: ["Linhagens de Elite", "Segurança Biológica", "Progresso Rápido"]
            },
            "microrganismos": {
                slug: "microrganismos",
                title: "Microrganismos Benéficos",
                description: "Controle biológico e saúde do solo.",
                icon: ShieldCheck,
                fullDescription: "Implemente soluções de bioproteção utilizando microrganismos que combatem pragas e doenças de forma natural, reduzindo a dependência de químicos e preservando o ecossistema da sua quinta.",
                subServices: [
                    { title: "Controle Biológico", description: "Fungos e bactérias para controle de pragas." },
                    { title: "Saúde Radicular", description: "Microrganismos que protegem as raízes." }
                ],
                features: ["Resíduo Zero", "Sustentabilidade", "Eficácia Biológica"]
            },
            "inoculantes": {
                slug: "inoculantes",
                title: "Inoculantes",
                description: "Potenciadores de fixação de nitrogênio e nutrientes.",
                icon: Zap,
                fullDescription: "Aumente a eficiência da sua adubação com inoculantes de alta concentração que promovem a fixação biológica de nitrogênio, especialmente em culturas de leguminosas como a soja.",
                subServices: [
                    { title: "Fixadores de Nitrogênio", description: "Bactérias específicas para leguminosas." },
                    { title: "Promotores de Crescimento", description: "Bioestimulantes para desenvolvimento inicial." }
                ],
                features: ["Economia de Adubo", "Raízes Fortes", "Maior Produtividade"]
            },
            // 2. Químicos
            "fertilizantes-minerais": {
                slug: "fertilizantes-minerais",
                title: "Fertilizantes Minerais",
                description: "Nutrição mineral precisa para alta produtividade.",
                icon: Zap,
                fullDescription: "Fornecemos fertilizantes NPK e macronutrientes essenciais formulados para suprir as carências específicas de cada solo moçambicano, garantindo o vigor e a qualidade da sua colheita.",
                subServices: [
                    { title: "NPK Base", description: "Fórmulas para fundação e crescimento inicial." },
                    { title: "Adubos de Cobertura", description: "Ureia e outros nitrogenados para fases críticas." }
                ],
                features: ["Pureza Garantida", "Solubilidade Rápida", "Nutrição Balanceada"]
            },
            "corretivos-solo": {
                slug: "corretivos-solo",
                title: "Corretivos de Solo",
                description: "Ajuste de acidez e estrutura do solo.",
                icon: Zap,
                fullDescription: "Corrija o pH do seu solo com calcário e gesso agrícola de alta qualidade, essenciais para neutralizar o alumínio tóxico e melhorar a absorção de nutrientes pelas plantas.",
                subServices: [
                    { title: "Calcário Agrícola", description: "Correção de acidez e fornecimento de cálcio/magnésio." },
                    { title: "Gesso Agrícola", description: "Melhoria da estrutura do solo em profundidade." }
                ],
                features: ["Neutralização Eficaz", "Melhoria da Estrutura", "Maior Enraizamento"]
            },
            "herbicidas": {
                slug: "herbicidas",
                title: "Herbicidas",
                description: "Controle eficaz de infestantes e ervas daninhas.",
                icon: ShieldCheck,
                fullDescription: "Elimine a competição por nutrientes e luz com herbicidas seletivos e não-seletivos, garantindo que a sua cultura se desenvolva limpa e com o máximo de produtividade potencial.",
                subServices: [
                    { title: "Pré-emergentes", description: "Prevenção do nascimento de infestantes." },
                    { title: "Pós-emergentes", description: "Eliminação de ervas já estabelecidas." }
                ],
                features: ["Ação Rápida", "Seletividade", "Controle Duradouro"]
            },
            "inseticidas": {
                slug: "inseticidas",
                title: "Inseticidas",
                description: "Proteção contra pragas e insetos mastigadores.",
                icon: ShieldCheck,
                fullDescription: "Proteja a sua plantação contra o ataque de lagartas, percevejos e outras pragas com inseticidas de última geração que atuam por contacto e sistemicamente.",
                subServices: [
                    { title: "Ação de Choque", description: "Eliminação imediata de pragas visíveis." },
                    { title: "Proteção Sistêmica", description: "Proteção prolongada de dentro para fora da planta." }
                ],
                features: ["Amplo Espectro", "Baixa Toxicidade Residual", "Eficácia Provada"]
            },
            "fungicidas": {
                slug: "fungicidas",
                title: "Fungicidas",
                description: "Prevenção e cura de doenças fúngicas.",
                icon: ShieldCheck,
                fullDescription: "Combata o aparecimento de manchas, oídios e podridões com fungicidas preventivos e curativos, assegurando a integridade foliar e a qualidade final dos seus produtos.",
                subServices: [
                    { title: "Fungicidas Preventivos", description: "Barreira protetora contra esporos." },
                    { title: "Fungicidas Curativos", description: "Ação direta contra fungos já instalados." }
                ],
                features: ["Saúde Foliar", "Proteção de Frutos", "Resistência a Lavagem"]
            },
            // 3. Orgânicos
            "esterco": {
                slug: "esterco",
                title: "Esterco curtido",
                description: "Matéria orgânica de origem animal para enriquecimento do solo.",
                icon: Zap,
                fullDescription: "Melhore a estrutura e a fertilidade do seu solo com esterco curtido de alta qualidade, essencial para aumentar a retenção de água e a atividade microbiana benéfica na sua propriedade.",
                subServices: [
                    { title: "Esterco Bovino", description: "Enriquecido com nutrientes para diversas culturas." },
                    { title: "Esterco de Aves", description: "Alto teor de nitrogênio para desenvolvimento rápido." }
                ],
                features: ["Totalmente Curtido", "Sem Odor Forte", "Melhoria Estrutural"]
            },
            "compostagem": {
                slug: "compostagem",
                title: "Compostagem",
                description: "Adubo orgânico estabilizado e rico em húmus.",
                icon: Zap,
                fullDescription: "Utilize o poder da decomposição controlada para nutrir as suas plantas. O nosso composto orgânico é rico em microrganismos e nutrientes de liberação lenta, ideais para hortas e pomares.",
                subServices: [
                    { title: "Composto Vegetal", description: "Produzido a partir de resíduos de colheita." },
                    { title: "Composto Enriquecido", description: "Com adição de minerais naturais." }
                ],
                features: ["Rico em Húmus", "Regulador de pH", "Livre de Patógenos"]
            },
            "biofertilizantes": {
                slug: "biofertilizantes",
                title: "Biofertilizantes",
                description: "Nutrição líquida biológica de rápida absorção.",
                icon: Zap,
                fullDescription: "Potencie a saúde das suas plantas com biofertilizantes líquidos produzidos por fermentação biológica, fornecendo micronutrientes e substâncias promotoras de crescimento de forma sustentável.",
                subServices: [
                    { title: "Biofertilizante Foliar", description: "Aplicação direta nas folhas para resposta rápida." },
                    { title: "Biofertilizante via Solo", description: "Estimula a vida microbiana radicular." }
                ],
                features: ["Absorção Rápida", "Origem Natural", "Ação Estimulante"]
            },
            "adubacao-verde": {
                slug: "adubacao-verde",
                title: "Adubação Verde",
                description: "Sementes para cobertura e proteção do solo.",
                icon: Zap,
                fullDescription: "Proteja e recupere o seu solo com sementes para adubação verde. Leguminosas e gramíneas que fixam nitrogênio e aumentam a matéria orgânica, preparando a terra para a próxima campanha.",
                subServices: [
                    { title: "Leguminosas", description: "Crotalária e feijão-guandu para fixação de N." },
                    { title: "Cobertura Morta", description: "Espécies para produção de biomassa protetora." }
                ],
                features: ["Proteção contra Erosão", "Reciclagem de Nutrientes", "Solo Vivo"]
            },
            "humus": {
                slug: "humus",
                title: "Húmus de Minhoca",
                description: "O mais completo adubo orgânico para suas plantas.",
                icon: Zap,
                fullDescription: "O húmus de minhoca é o 'ouro negro' da agricultura. Rico em ácidos fúlvicos e húmicos, promove um enraizamento extraordinário e uma saúde vigorosa para todas as suas culturas.",
                subServices: [
                    { title: "Húmus Puro", description: "Extraído de minhocários controlados." },
                    { title: "Substrato com Húmus", description: "Mistura pronta para vasos e sementeiras." }
                ],
                features: ["Alta Concentração", "Efeito Prolongado", "Saúde Vegetal"]
            },
            // 4. Pecuários
            "racoes": {
                slug: "racoes",
                title: "Rações Balanceadas",
                description: "Nutrição completa para todas as espécies animais.",
                icon: Zap,
                fullDescription: "Assegure o crescimento e a produtividade do seu efetivo com rações formuladas por especialistas, cobrindo as necessidades nutricionais de aves, suínos e bovinos em cada fase de desenvolvimento.",
                subServices: [
                    { title: "Ração Inicial", description: "Para um arranque vigoroso de pintos e leitões." },
                    { title: "Ração de Engorda", description: "Fórmulas focadas em ganho de peso eficiente." }
                ],
                features: ["Fórmulas Balanceadas", "Ingredientes de Qualidade", "Melhor Conversão"]
            },
            "suplementos-minerais": {
                slug: "suplementos-minerais",
                title: "Suplementos Minerais",
                description: "Correção de deficiências minerais no pasto.",
                icon: Zap,
                fullDescription: "Garanta que os seus animais recebam todos os minerais essenciais através de suplementos específicos, fundamentais para a fertilidade, saúde óssea e imunidade de todo o rebanho.",
                subServices: [
                    { title: "Blocos Minerais", description: "Acesso livre para animais no pasto." },
                    { title: "Aditivos para Ração", description: "Mistura mineral para dietas confinadas." }
                ],
                features: ["Previne Deficiências", "Melhora Imunidade", "Aumenta Fertilidade"]
            },
            "vacinas": {
                slug: "vacinas",
                title: "Vacinas Veterinárias",
                description: "Prevenção das principais doenças animais.",
                icon: ShieldCheck,
                fullDescription: "Proteja o seu investimento pecuário com vacinas certificadas contra a febre aftosa, peste suína, Newcastle e outras doenças críticas que afetam a produtividade em Moçambique.",
                subServices: [
                    { title: "Plano de Vacinação", description: "Calendário sanitário completo para a sua quinta." },
                    { title: "Vacinas Inativadas", description: "Segurança e eficácia na imunização coletiva." }
                ],
                features: ["Segurança Sanitária", "Cadeia de Frio Garantida", "Prevenção de Perdas"]
            },
            "medicamentos-veterinarios": {
                slug: "medicamentos-veterinarios",
                title: "Medicamentos Veterinários",
                description: "Tratamento e cura para diversas patologias animais.",
                icon: ShieldCheck,
                fullDescription: "Acesse uma gama completa de antibióticos, antiparasitários e anti-inflamatórios das melhores marcas, garantindo um tratamento rápido e eficaz para os seus animais sob orientação técnica.",
                subServices: [
                    { title: "Desparasitantes", description: "Controle de parasitas internos e externos." },
                    { title: "Antibióticos", description: "Combate a infecções bacterianas graves." }
                ],
                features: ["Ação Comprovada", "Marcas de Confiança", "Saúde Animal"]
            },
            "sal-mineral": {
                slug: "sal-mineral",
                title: "Sal Mineral",
                description: "Essencial para o equilíbrio eletrolítico do rebanho.",
                icon: Zap,
                fullDescription: "O sal mineral é fundamental para a saúde diária do seu gado. Fornecemos misturas prontas para consumo que garantem o aporte necessário de iodo, cálcio e fósforo em regimes de pastoreio.",
                subServices: [
                    { title: "Sal de Cozinha Agrário", description: "Base mineral para misturas caseiras." },
                    { title: "Sal Vitaminado", description: "Enriquecido com vitaminas lipossolúveis." }
                ],
                features: ["Essencial Diário", "Fácil Consumo", "Equilíbrio Metabólico"]
            },
            // 5. Mecânicos
            "tratores": {
                slug: "tratores",
                title: "Tratores Agrícolas",
                description: "Potência e versatilidade para todas as operações no campo.",
                icon: Truck,
                fullDescription: "Encontre tratores de diversas potências adaptados aos solos moçambicanos. Desde modelos compactos para horticultura até grandes máquinas para cereais, garantimos eficiência e baixo consumo.",
                subServices: [
                    { title: "Tratores Utilitários", description: "Para trabalhos gerais e transporte." },
                    { title: "Tratores de Alta Potência", description: "Preparados para aragem pesada e colheita." }
                ],
                features: ["Baixo Consumo", "Manutenção Facilitada", "Conforto Operacional"]
            },
            "arados": {
                slug: "arados",
                title: "Arados e Cultivadores",
                description: "Preparação primária do solo com máxima eficiência.",
                icon: Truck,
                fullDescription: "Alfaias robustas para o revolvimento e aeração do solo. Os nossos arados de discos e aivecas são projetados para durar e garantir uma base perfeita para a sua sementeira.",
                subServices: [
                    { title: "Arados de Discos", description: "Ideal para solos com raízes e pedras." },
                    { title: "Subsoladores", description: "Para quebra de camadas compactadas." }
                ],
                features: ["Aço de Alta Resistência", "Ajuste de Profundidade", "Durabilidade"]
            },
            "grades": {
                slug: "grades",
                title: "Grades Agrícolas",
                description: "Destorroamento e nivelamento para um leito de semeadura ideal.",
                icon: Truck,
                fullDescription: "Grades de discos leves e pesadas para o acabamento do terreno. Garanta um solo nivelado e sem torrões, facilitando o trabalho das semeadoras e a emergência das plantas.",
                subServices: [
                    { title: "Grades Niveladoras", description: "Para acabamento fino e fecho de sulcos." },
                    { title: "Grades de Discos", description: "Para incorporação de resíduos." }
                ],
                features: ["Nivelamento Perfeito", "Robusteza", "Fácil Acoplamento"]
            },
            "colheitadeiras": {
                slug: "colheitadeiras",
                title: "Colheitadeiras",
                description: "Tecnologia de ponta para minimizar perdas na colheita.",
                icon: Truck,
                fullDescription: "Maximize o seu rendimento com colheitadeiras modernas para cereais e oleaginosas. Máquinas com alta capacidade de processamento e sistemas de limpeza eficientes.",
                subServices: [
                    { title: "Colheita de Milho", description: "Plataformas específicas para alto rendimento." },
                    { title: "Colheita Multicereais", description: "Versatilidade para soja, trigo e arroz." }
                ],
                features: ["Mínima Perda", "Grãos Limpos", "Alta Capacidade"]
            },
            "semeadoras": {
                slug: "semeadoras",
                title: "Semeadoras e Plantadoras",
                description: "Distribuição precisa de sementes e adubo.",
                icon: Truck,
                fullDescription: "A precisão na semeadura é o segredo de uma boa população de plantas. As nossas semeadoras garantem a profundidade e o espaçamento corretos para cada cultura.",
                subServices: [
                    { title: "Semeadura de Precisão", description: "Distribuição grão a grão com GPS." },
                    { title: "Plantadoras de Adubo", description: "Aplicação simultânea de fertilizante." }
                ],
                features: ["Espaçamento Uniforme", "Profundidade Ajustável", "Alta Performance"]
            },
            // 6. Tecnológicos
            "sistemas-irrigacao": {
                slug: "sistemas-irrigacao",
                title: "Sistemas de Irrigação",
                description: "Gestão inteligente da água para produção todo o ano.",
                icon: Zap,
                fullDescription: "Não dependa apenas da chuva. Implementamos sistemas de rega por gota-a-gota, aspersão e pivôs centrais que maximizam a eficiência hídrica e garantem a colheita em qualquer época.",
                subServices: [
                    { title: "Gota-a-Gota", description: "Economia máxima de água e fertilizantes." },
                    { title: "Aspersão Convencional", description: "Cobertura total para pastagens e hortícolas." }
                ],
                features: ["Economia de Água", "Automação", "Aumento de Produtividade"]
            },
            "sensores-agricolas": {
                slug: "sensores-agricolas",
                title: "Sensores Agrícolas",
                description: "Monitoramento em tempo real do solo e clima.",
                icon: Zap,
                fullDescription: "Tome decisões baseadas em dados. Sensores de humidade, temperatura e nutrientes que informam exatamente quando regar ou adubar, otimizando os seus recursos e tempo.",
                subServices: [
                    { title: "Sondas de Solo", description: "Leitura de humidade em várias profundidades." },
                    { title: "Estações Meteorológicas", description: "Dados locais de vento, chuva e radiação." }
                ],
                features: ["Dados Precisos", "Acesso Via Mobile", "Economia de Recursos"]
            },
            "drones": {
                slug: "drones",
                title: "Drones Agrícolas",
                description: "Mapeamento e pulverização aérea de precisão.",
                icon: Zap,
                fullDescription: "O futuro chegou ao campo. Utilize drones para identificar falhas na plantação, focos de pragas ou para realizar pulverizações localizadas com rapidez e segurança.",
                subServices: [
                    { title: "Mapeamento NDVI", description: "Índice de saúde vegetal visto de cima." },
                    { title: "Drones de Pulverização", description: "Aplicação rápida de defensivos e biofertilizantes." }
                ],
                features: ["Alta Rapidez", "Precisão Centimétrica", "Redução de Custos"]
            },
            "gps-agricola": {
                slug: "gps-agricola",
                title: "GPS Agrícola",
                description: "Guiamento e barras de luz para operações retas.",
                icon: Zap,
                fullDescription: "Elimine o transpasse e as falhas nas operações de campo. Sistemas de GPS que orientam o tratorista para uma cobertura perfeita, economizando combustível e insumos.",
                subServices: [
                    { title: "Barra de Luz", description: "Orientação visual simples e eficaz." },
                    { title: "Piloto Automático", description: "Precisão máxima com condução autônoma." }
                ],
                features: ["Elimina Falhas", "Economia de Combustível", "Menor Fadiga"]
            },
            "softwares-gestao": {
                slug: "softwares-gestao",
                title: "Softwares de Gestão Rural",
                description: "Controle total das finanças e estoque da sua quinta.",
                icon: Zap,
                fullDescription: "Gerir uma quinta é gerir uma empresa. Softwares integrados para controle de custos, estoque de insumos, histórico de parcelas e gestão de mão-de-obra, tudo num só lugar.",
                subServices: [
                    { title: "Gestão Financeira", description: "Fluxo de caixa e controle de lucratividade." },
                    { title: "Caderno de Campo Digital", description: "Registro de todas as atividades agrárias." }
                ],
                features: ["Visão do Negócio", "Controle de Custos", "Relatórios Automáticos"]
            },
            // 7. Estruturais
            "cercas": {
                slug: "cercas",
                title: "Cercas e Vedações",
                description: "Segurança e delimitação para a sua propriedade rural.",
                icon: ShieldCheck,
                fullDescription: "Proteja as suas culturas e o seu gado com sistemas de vedação duráveis. Fornecemos redes, arame farpado e liso, além de acessórios para uma instalação rápida e resistente.",
                subServices: [
                    { title: "Cerca Convencional", description: "Arame farpado e postes de madeira/betão." },
                    { title: "Cerca Elétrica", description: "Segurança reforçada para contenção animal." }
                ],
                features: ["Alta Durabilidade", "Proteção de Perímetro", "Baixa Manutenção"]
            },
            "postes": {
                slug: "postes",
                title: "Postes e Esteios",
                description: "Suporte robusto para cercas e estruturas.",
                icon: ShieldCheck,
                fullDescription: "Oferecemos postes de madeira tratada, betão e metal para garantir a estabilidade das suas cercas e estruturas de suporte para culturas trepadeiras como o maracujá.",
                subServices: [
                    { title: "Postes de Madeira Tratada", description: "Resistentes a cupins e intempéries." },
                    { title: "Postes de Betão", description: "Máxima longevidade e resistência ao fogo." }
                ],
                features: ["Resistência Testada", "Várias Dimensões", "Pronto a Instalar"]
            },
            "galpoes": {
                slug: "galpoes",
                title: "Galpões e Armazéns",
                description: "Estruturas para armazenamento de colheita e maquinaria.",
                icon: ShieldCheck,
                fullDescription: "Soluções modulares e personalizadas para o armazenamento seguro da sua produção. Galpões metálicos ou de alvenaria com ventilação adequada para preservar a qualidade dos grãos.",
                subServices: [
                    { title: "Armazéns de Grãos", description: "Proteção contra pragas e humidade." },
                    { title: "Garagens de Maquinaria", description: "Espaço coberto para prolongar a vida útil das máquinas." }
                ],
                features: ["Amplo Espaço", "Segurança de Stock", "Estrutura Metálica"]
            },
            "estufas": {
                slug: "estufas",
                title: "Estufas e Túneis",
                description: "Produção protegida para hortícolas de alto valor.",
                icon: Zap,
                fullDescription: "Controle o microclima da sua plantação com estufas hidropônicas ou convencionais. Ideal para a produção de tomate, pimento e flores fora de época com qualidade superior.",
                subServices: [
                    { title: "Estufas Metálicas", description: "Estruturas profissionais com filme plástico UV." },
                    { title: "Sombras e Telados", description: "Proteção contra sol excessivo e granizo." }
                ],
                features: ["Controle Climático", "Maior Qualidade", "Produção Sazonal"]
            },
            "currais": {
                slug: "currais",
                title: "Currais e Manejo Animal",
                description: "Infraestrutura eficiente para o trato do gado.",
                icon: ShieldCheck,
                fullDescription: "Projetamos e fornecemos componentes para currais de manejo, balanças e troncos de contenção que facilitam o trabalho veterinário e reduzem o estresse animal.",
                subServices: [
                    { title: "Currais de Madeira", description: "Tradição e robustez no manejo bovino." },
                    { title: "Troncos de Contenção", description: "Segurança para vacinação e exames." }
                ],
                features: ["Bem-estar Animal", "Segurança de Manejo", "Facilidade de Limpeza"]
            },
            // 8. Financeiros
            "credito-agricola": {
                slug: "credito-agricola",
                title: "Crédito Agrícola",
                description: "Financiamento para a sua campanha e investimentos.",
                icon: Zap,
                fullDescription: "Facilitamos a ligação com instituições financeiras que oferecem linhas de crédito específicas para o campo, com taxas bonificadas e prazos ajustados ao ciclo das culturas.",
                subServices: [
                    { title: "Crédito de Campanha", description: "Para compra de sementes, adubos e mão-de-obra." },
                    { title: "Financiamento de Ativos", description: "Compra de tratores e equipamentos a longo prazo." }
                ],
                features: ["Taxas Acessíveis", "Prazos Flexíveis", "Apoio ao Investimento"]
            },
            "seguro-rural": {
                slug: "seguro-rural",
                title: "Seguro Rural",
                description: "Proteção financeira contra riscos climáticos.",
                icon: ShieldCheck,
                fullDescription: "Não deixe o seu esforço à mercê do clima. Soluções de seguro agrário que cobrem perdas por seca, inundações ou pragas, garantindo a continuidade do seu negócio em anos difíceis.",
                subServices: [
                    { title: "Seguro Paramétrico", description: "Pagamento rápido baseado em índices de chuva." },
                    { title: "Seguro Multirrisco", description: "Cobertura abrangente para toda a propriedade." }
                ],
                features: ["Garantia de Renda", "Proteção contra Perdas", "Tranquilidade"]
            },
            "investimentos": {
                slug: "investimentos",
                title: "Investimentos no Agronegócio",
                description: "Oportunidades de expansão e modernização.",
                icon: Zap,
                fullDescription: "Acesse fundos de investimento e parceiros estratégicos que procuram projetos rentáveis em Moçambique. Apoio na elaboração de planos de negócio e viabilidade financeira.",
                subServices: [
                    { title: "Equity Agrário", description: "Parcerias para expansão de grandes propriedades." },
                    { title: "Fomento à Agroindústria", description: "Criação de valor através do processamento local." }
                ],
                features: ["Expansão de Negócio", "Parcerias Estratégicas", "Apoio Técnico"]
            },
            "subsidios": {
                slug: "subsidios",
                title: "Subsídios e Apoio Estatal",
                description: "Informações sobre programas de incentivo ao produtor.",
                icon: Zap,
                fullDescription: "Mantenha-se informado sobre os subsídios governamentais e programas de doadores internacionais disponíveis na sua região para a aquisição de insumos e equipamentos.",
                subServices: [
                    { title: "Programas de Fomento", description: "Acesso a insumos a preços bonificados." },
                    { title: "Apoio a Pequenos Produtores", description: "Incentivos para a mecanização e treinamento." }
                ],
                features: ["Acesso a Incentivos", "Custo Reduzido", "Desenvolvimento Rural"]
            },
            "linhas-financiamento": {
                slug: "linhas-financiamento",
                title: "Linhas de Financiamento",
                description: "Opções diversificadas de capital para o seu negócio.",
                icon: Zap,
                fullDescription: "Explore linhas de financiamento de bancos comerciais e agências de desenvolvimento focadas na exportação e no fortalecimento da cadeia de valor agrária em Moçambique.",
                subServices: [
                    { title: "Leasing de Maquinaria", description: "Uso de equipamentos com opção de compra no final." },
                    { title: "Linhas de Exportação", description: "Crédito para produtores focados no mercado externo." }
                ],
                features: ["Variedade de Opções", "Baixa Burocracia", "Crescimento Sustentável"]
            },
        }
    },
    "lojas": {
        id: "lojas",
        title: "Lojas",
        subCategories: {
            "registo": {
                slug: "registo",
                title: "Registe a sua loja",
                description: "Aumente a visibilidade do seu negócio e alcance mais produtores.",
                icon: Store,
                fullDescription: "Coloque o seu inventário e o seu negócio na linha da frente de um mercado que não detém o seu crescimento através do nosso directório comercial de elite. Ao registar a sua loja na nossa plataforma dedicada, ganha visibilidade instantânea perante milhares de produtores, cooperativas e investidores que procuram insumos agrários de qualidade em todo o território nacional.",
                subServices: [
                    { title: "Perfil de Empresa", description: "Página dedicada com catálogo de produtos e contactos." },
                    { title: "Painel de Gestão", description: "Controle as suas ofertas e interaja com potenciais clientes." }
                ],
                features: ["Visibilidade Online", "Geração de Leads", "Marketplace Integrado"]
            }
        }
    },
    "compra-venda": {
        id: "compra-venda",
        title: "Compra e venda",
        subCategories: {
            "cotacoes": {
                slug: "cotacoes",
                title: "Cotações do Dia",
                description: "Acompanhe os preços médios nas principais praças nacionais.",
                icon: TrendingUp,
                fullDescription: "A tomada de decisão no agronegócio moçambicano exige o acesso a dados fiáveis e actualizados com rigor cirúrgico. Através do nosso boletim diário de cotações, os actores do sector podem acompanhar o pulsar das principais praças nacionais e internacionais, garantindo que cada transacção seja pautada pela transparência e pela justa valorização de cada produto agrário moçambicano.\n\nEsta ferramenta de inteligência competitiva permite antecipar variações de preço e identificar oportunidades de arbitragem comercial em tempo real, sob a égide da nossa supervisão técnica. A centralização destes dados visa equilibrar o mercado nacional, proporcionando aos produtores e compradores uma visão clara e detalhada das tendências mercantis, facilitando o planeamento estratégico de cada colheita e a maximização dos lucros operacionais.\n\nCompreender as dinâmicas de preço em Maputo, Beira ou Nampula é fundamental para o escoamento produtivo eficiente e lucrativo. O nosso compromisso é democratizar a informação de mercado, assegurando que tanto o pequeno produtor como a grande cooperativa possuam os mesmos insights valiosos para negociar as suas produções com a autoridade e o brio que o agronegócio nacional exige.",
                subServices: [
                    { title: "Relatórios Diários", description: "Preços actuais para cereais, leguminosas e mais." },
                    { title: "Análise de Tendência", description: "Projecções de subida ou descida de preços no mercado." },
                    { title: "Comparativo Regional", description: "Saiba onde o seu produto está a ser mais valorizado." }
                ],
                features: ["Dados Actualizados", "Fonte Confiável", "Histórico de Preços"]
            },
            "ofertas": {
                slug: "ofertas",
                title: "Ofertas de Venda",
                description: "Explore anúncios de produtores que procuram escoar produção.",
                icon: ShoppingCart,
                fullDescription: "A dinamização do escoamento de produção é o motor da nossa plataforma de comercialização, que actua como um ponto de encontro virtuoso entre a oferta rural e a procura industrial. Facilitamos a exposição de lotes de produção com descrições técnicas detalhadas e garantias de volume, assegurando que o comprador identifique rapidamente a qualidade e a procedência do que está a ser transacionado no portal.\n\nAtravés de um sistema de notificações inteligentes, as suas ofertas de venda alcançam decisores de compras em todo o país de forma direcional e eficaz, reduzindo o tempo de armazenamento e os custos de manutenção. O nosso compromisso é garantir que cada anúncio de venda resulte numa transação segura e lucrativa, transformando o stock em capital de giro com a agilidade que o mercado moderno exige de forma incontestável.\n\nConectamos o seu brio produtivo às indústrias de processamento e exportação mais exigentes, assegurando que o valor do seu trabalho seja reconhecido e remunerado de acordo com as melhores práticas de mercado. No nosso portal, a transacção agrária é sinónimo de progresso, transparência e eficiência comercial para todos os actores da cadeia de valor nacional.",
                subServices: [
                    { title: "Publicação de Ofertas", description: "Anuncie os seus lotes com fotos, detalhes e preços." },
                    { title: "Pesquisa Avançada", description: "Filtre ofertas por província, categoria ou volume." },
                    { title: "Mensagens Directas", description: "Negocie preços e condições directamente no portal." }
                ],
                features: ["Negócio Directo", "Zero Comissões", "Amplo Alcance"]
            },
            "leiloes": {
                slug: "leiloes",
                title: "Leilões Agrários",
                description: "Participe em licitações para compra de grandes lotes de produção.",
                icon: Gavel,
                fullDescription: "Participe na modalidade mais vibrante e competitiva de aquisição de bens agrários através do nosso sistema de leilões digitais monitorados. Esta plataforma permite que grandes lotes de produção e activos industriais sejam arrematados em lances transparentes, garantindo que o mercado dite o valor real de cada projecto sob condições de equidade total para todos os participantes registados.\n\nOs nossos leilões são regidos por normas de integridade absoluta, com verificação prévia de cada lote oferecido para assegurar que a transacção ocorra sem qualquer imprevisto técnico ou jurídico. É a solução ideal para cooperativas e grandes empresas que buscam escoar grandes volumes com rapidez ou adquirir insumos e maquinaria em condições de preço excepcionais, elevando o padrão de eficiência do sector agrário nacional.\n\nAtravés desta ferramenta innovadora, democratizamos o acesso a oportunidades de negócio de grande escala que antes estavam restritas a círculos fechados. Cada leilão é um evento de progresso comercial moçambicano, onde a transparência gera confiança e a confiança atrai o investimento necessário para a expansão sustentável de todo o ecossistema agrário.",
                subServices: [
                    { title: "Leilões em Directo", description: "Lances em tempo real monitorados pela nossa equipa." },
                    { title: "Venda de Excedentes", description: "Escoamento rápido de stock para grandes compradores." },
                    { title: "Licitação Privada", description: "Formatos exclusivos de compra para grandes parceiros." }
                ],
                features: ["Preço Justo", "Transparência Total", "Operação Segura"]
            },
            "garantia": {
                slug: "garantia",
                title: "Garantia de Negócio",
                description: "Transações seguras e monitoradas para evitar falhas.",
                icon: ShieldCheck,
                fullDescription: "A confiança é o pilar fundamental de qualquer transação comercial duradoura e de sucesso no exigente mercado agro moçambicano. O nosso serviço de garantia actua como um intermediário imparcial e seguro, assegurando que a mercadoria entregue corresponde exactamente ao que foi acordado e que o pagamento é processado sem riscos para o vendedor.\n\nAtravés de contas escrow e processos de verificação técnica rigorosos, eliminamos a incerteza jurídica e financeira que muitas vezes trava o crescimento do sector. Criamos uma rede de negócios segura que incentiva o investimento estrangeiro e o brio produtivo local, elevando o padrão de integridade comercial em toda a cadeia de valor nacional.\n\nGarantimos que cada hectare negociado resulte numa parceria de progresso e transparência inata. O nosso compromisso é ser o árbitro da excelência comercial, protegendo os interesses de produtores e compradores com a seriedade e o rigor que o agronegócio de classe mundial exige em Moçambique.",
                subServices: [
                    { title: "Verificação de Lote", description: "Inspecção técnica antes da libertação do pagamento." },
                    { title: "Conta Escrow", description: "Retenção segura do valor até confirmação de entrega." },
                    { title: "Arbitragem Comercial", description: "Resolução célere de disputas em negociações." }
                ],
                features: ["Segurança Jurídica", "Proteção Financeira", "Confiança Mútua"]
            }
        }
    },
    "eventos": {
        id: "eventos",
        title: "Feiras e eventos",
        subCategories: {
            "calendario": {
                slug: "calendario",
                title: "Calendário Regional",
                description: "Acompanhe as principais feiras provinciais e nacionais.",
                icon: Calendar,
                fullDescription: "Manter-se a par da agenda produtiva do sector é vital para o networking estratégico e para a captura de oportunidades de mercado. Em coordenação com parceiros institucionais e organizadores provinciais, centralizamos o calendário completo das feiras e congressos nacionais de agronegócio em Moçambique, desde a FACIM aos festivais agrícolas locais.\n\nAo saber antecipadamente onde ocorrem as grandes exposições, a sua empresa pode planear presenças integradas, garantindo que não perde nenhuma oportunidade de captar novos clientes ou investidores. O nosso portal oferece detalhes sobre pavilhões, custos de participação e perfis de visitantes para cada evento listado, facilitando o seu planeamento logístico e financeiro.\n\nEstar presente nos locais certos no momento exacto é a marca de uma gestão agrária de elite. Nós fornecemos a bússola para que a sua marca brilhe em todos os palcos da produção moçambicana, assegurando que o seu brio empresarial seja visível e reconhecido pelos decisores mais influentes do agronegócio nacional e regional.",
                subServices: [
                    { title: "Agenda Nacional", description: "Mapa completo de eventos do sector para o ano inteiro." },
                    { title: "Sincronização", description: "Adicione os eventos directamente ao seu calendário digital." },
                    { title: "Guia do Expositor", description: "Acesso a manuais e regras para cada feira regional." }
                ],
                features: ["Informação Centralizada", "Planeamento Prévio", "Foco em Negócios"]
            },
            "promocao": {
                slug: "promocao",
                title: "Promoção de Eventos",
                description: "Divulgue o seu evento para toda a nossa rede agrária.",
                icon: Zap,
                fullDescription: "Transformamos o seu evento na conversa central do sector através das nossas campanhas de marketing multicanal segmentadas e de alto impacto. Utilizamos o alcance da Base de Dados Agro para promover feiras, lançamentos de marcas e workshops técnicos para uma audiência qualificada de milhares de profissionais, decisores e investidores moçambicanos.\n\nA nossa abordagem combina visibilidade digital intensa com e-mail marketing directo e parcerias com a media tradicional, garantindo que a sua mensagem de brio chegue às pessoas certas no momento oportuno. O foco é gerar um tráfego qualificado que se traduza em parcerias reais e um impacto comercial duradouro para o seu projecto de evento.\n\nEstar na vanguarda da promoção agrária é garantir que o seu esforço organizacional seja recompensado com a máxima participação. Proporcionamos as ferramentas de divulgação que elevam o prestígio do seu evento, assegurando que ele seja reconhecido como um marco de progresso e inovação para o agronegócio nacional e regional.",
                subServices: [
                    { title: "E-mail Marketing", description: "Envio de convites para produtores e investidores." },
                    { title: "Banners no Portal", description: "Destaque visual nas páginas de maior tráfego." },
                    { title: "Media Social", description: "Criação de buzz e promoção nas redes da Base de Dados Agro." }
                ],
                features: ["Público Alvo", "Alto Impacto", "Retorno Mensurável"]
            },
            "bilheteira": {
                slug: "bilheteira",
                title: "Bilheteira Online",
                description: "Gestão completa de acessos e venda de bilhetes para feiras.",
                icon: ShoppingCart,
                fullDescription: "Modernize o acesso aos seus eventos e ofereça uma experiência de entrada impecável aos seus visitantes através de um sistema de gestão de acessos de elite. A nossa plataforma de bilheteira digital está integrada com os principais métodos de pagamento tradicionais e móveis de Moçambique, facilitando a transacção instantânea de ingressos para congressos e feiras nacionais de agronegócio de forma segura.\n\nOs organizadores de eventos passam a usufruir de um controlo total sobre o fluxo de entradas em tempo real, com relatórios detalhados que informam cada acção de marketing e logística. O uso de tecnologias de validação via QR Code elimina filas e garante que a gestão financeira de toda a operação de bilheteira seja transparente, exacta e isenta de qualquer falha humana, elevando o padrão de organização do seu projecto de evento moçambicano.",
                subServices: [
                    { title: "Venda Multipagamento", description: "Aceite M-Pesa, e-Mola e cartões bancários." },
                    { title: "QR Code Check-in", description: "Validação rápida de bilhetes à entrada do recinto." },
                    { title: "Gestão de VIPs", description: "Coordenação de áreas reservadas e convites especiais." }
                ],
                features: ["Conveniência", "Zero Filas", "Gestão Financeira Clara"]
            },
            "patrocinio": {
                slug: "patrocinio",
                title: "Patrocínio Digital",
                description: "Destaque a sua marca nos maiores eventos do sector.",
                icon: Star,
                fullDescription: "Elevamos o posicionamento da sua marca nos momentos de maior visibilidade do agronegócio nacional através de parcerias estratégicas com organizadores de eventos de prestígio. Criamos pacotes de patrocínio que unem a presença física nos recintos a uma cobertura digital estratégica nas nossas plataformas, garantindo que a sua marca seja associada à liderança técnica e à inovação de forma indissociável.\n\nÉ a oportunidade de platina para grandes empresas destacarem a sua autoridade no mercado, alcançando decisores, investidores e influenciadores do sector através de conteúdos exclusivos e acções de networking de alto nível. O nosso compromisso é transformar o seu investimento em patrocínio num activo de reputação sólida, assegurando que a sua mensagem seja projectada com a elegância e o rigor que o seu negócio merece em cada transacção de imagem.",
                subServices: [
                    { title: "Cobertura em Directo", description: "Associe a sua marca às nossas transmissões e lives." },
                    { title: "Logo em Destaque", description: "Presença em todo o material promocional do evento." },
                    { title: "Naming Rights", description: "Oportunidade de dar nome a áreas ou painéis específicos." }
                ],
                features: ["Brand Awareness", "Posicionamento Premium", "Networking de Elite"]
            }
        }
    },
    "conteudo": {
        id: "conteudo",
        title: "Gestão de conteúdo",
        subCategories: {
            "escrita": {
                slug: "escrita",
                title: "Escrita Técnica",
                description: "Produção de artigos e posts especializados para o agro.",
                icon: FileText,
                fullDescription: "A linguagem erudita e o rigor técnico são as pedras angulares da nossa produção de conteúdo para o agronegócio moçambicano. Desenvolvemos textos que não apenas informam, mas educam e inspiram confiança nos investidores mais exigentes, traduzindo o potencial da terra em narrativas de progresso e sucesso.\n\nCada artigo é submetido a uma revisão exaustiva para garantir que a terminologia utilizada esteja em conformidade com as melhores práticas internacionais e a realidade local dos nossos distritos produtores. Ao dotar a sua empresa de conteúdos de alta estirpe, elevamos a sua percepção de marca, tornando a sua comunicação digital um espelho fiel da excelência operacional que pratica no campo todos os dias de forma inabalável.",
                subServices: [
                    { title: "Artigos Técnicos", description: "Textos profundos sobre agronomia e gestão rural moçambicana." },
                    { title: "Relatórios de Mercado", description: "Análise detalhada das tendências de preço e procura nacional." },
                    { title: "Comunicados de Imprensa", description: "Textos formais para a media e parceiros institucionais." },
                    { title: "Copywriting de Elite", description: "Escrita persuasiva para catálogos e propostas comerciais." }
                ],
                features: ["Elegância Erudita", "Rigor Moçambicano", "Foco em ROI"]
            },
            "redes": {
                slug: "redes",
                title: "Gestão de Redes",
                description: "Presença digital estratégica para marcas do sector.",
                icon: Users,
                fullDescription: "No mundo conectado de hoje, a sua marca precisa de estar activa onde os agricultores, investidores e parceiros passam o seu tempo. Gerimos a sua presença nas redes sociais com uma estratégia editorial focada exclusivamente no agro moçambicano, criando comunidades engajadas em torno da identidade e do propósito da sua organização.\n\nDesenvolvemos artes visuais de alta estirpe, vídeos curtos impactantes e interacções directas que humanizam a sua empresa, aumentam a fidelização de clientes e garantem que a sua mensagem de inovação chegue de forma orgânica. Adaptamos a linguagem para cada plataforma, assegurando que o brio do seu projecto seja projectado com a elegância necessária.\n\nAtravés de uma gestão profissional, transformamos as redes sociais num canal de autoridade indiscutível para a sua marca. Monitoramos métricas de engajamento para ajustar continuamente a nossa acção, garantindo que o seu investimento digital resulte num crescimento sólido da reputação e num aumento tangível das oportunidades de negócio em todo o portal nacional.",
                subServices: [
                    { title: "Planeamento Editorial", description: "Calendário estratégico de publicações mensais." },
                    { title: "Design para Social Media", description: "Artes visuais impactantes e profissionais." },
                    { title: "Gestão de Comunidade", description: "Interacção directa e resposta a seguidores." }
                ],
                features: ["Consistência Visual", "Relatórios de Performance", "Estratégia Multicanal"]
            },
            "video": {
                slug: "video",
                title: "Vídeo Marketing",
                description: "Cobertura de eventos e produção de vídeos institucionais.",
                icon: FileText,
                fullDescription: "Uma imagem vale mais que mil palavras, mas um vídeo bem produzido com brio pode contar a história completa da sua produção com uma emoção inigualável. Produzimos vídeos institucionais, testemunhos de sucesso e coberturas de feiras com qualidade cinematográfica para destacar a escala, a tecnologia e a paixão da sua operação agrária nacional.\n\nO conteúdo em vídeo é a ferramenta mais poderosa para gerar confiança em compradores internacionais e para demonstrar de forma visualmente rica o rigor dos seus processos produtivos. Captamos a essência do campo moçambicano e a sofisticação da indústria, criando narrativas visuais que elevam o prestígio da sua marca perante todos os parceiros estratégicos.\n\nAtravés de uma edição dinâmica e de um storytelling focado no agronegócio, transformamos a sua operação num espectáculo de competência e progresso. O vídeo marketing da Base de Dados Agro é a janela pela qual o mundo descobre a excelência moçambicana, garantindo que a sua mensagem seja projectada com a clareza e o impacto que o mercado moderno exige.",
                subServices: [
                    { title: "Vídeos Institucionais", description: "Apresentação profissional da sua quinta ou empresa." },
                    { title: "Testemunhos", description: "Casos de sucesso contados por clientes e parceiros." },
                    { title: "Coberturas", description: "Captação de momentos chave em feiras e eventos." }
                ],
                features: ["Qualidade 4K", "Edição Dinâmica", "Storytelling Agrário"]
            },
            "newsletter": {
                slug: "newsletter",
                title: "Newsletter Agro",
                description: "Comunicação directa com a sua base de clientes e parceiros.",
                icon: FileText,
                fullDescription: "Mantenha um canal de comunicação directo, constante e altamente eficiente com a sua base de clientes e parceiros estratégicos através da nossa curadoria. Criamos newsletters personalizadas que levam informações críticas, alertas de mercado e novidades da sua empresa directamente para o e-mail de quem decide o futuro do agronegócio moçambicano.\n\nAtravés de automações inteligentes e uma segmentação de audiência rigorosa, garantimos que cada mensagem seja relevante e oportuna, aumentando as taxas de abertura de forma orgânica. Este esforço de comunicação fortalece o relacionamento de longo prazo e transforma a informação técnica em lealdade comercial inabalável para o seu projecto produtor.\n\nA newsletter agro é mais do que um meio de comunicação; é uma ferramenta de autoridade que mantém a sua marca na mente dos decisores. Proporcionamos o brio editorial necessário para que a sua empresa seja vista como uma fonte confiável de inteligência e progresso, assegurando uma ligação profunda com todo o ecossistema agrário nacional.",
                subServices: [
                    { title: "Automação de E-mail", description: "Fluxos inteligentes de comunicação personalizada." },
                    { title: "Curadoria de Conteúdo", description: "Selecção do que há de mais importante no seu sector." },
                    { title: "Análise de Clicagem", description: "Saiba exactamente o que desperta interesse no seu público." }
                ],
                features: ["Alta Taxa de Entrega", "Design Personalizado", "Segmentação Precisa"]
            }
        }
    },
    "emprego": {
        id: "emprego",
        title: "Vagas de emprego",
        subCategories: {
            "talento": {
                slug: "talento",
                title: "Talento Agrário",
                description: "Candidate-se a vagas nas maiores empresas do país.",
                icon: Briefcase,
                fullDescription: "A sua carreira no agronegócio merece um palco à altura das suas mais elevadas ambições técnicas e profissionais. Através da nossa rede de parcerias com as maiores empresas do país, conectamos profissionais apaixonados pelo campo — desde engenheiros agrónomos a especialistas em mecanização — às melhores oportunidades de progressão mercantil e técnica em Moçambique.\n\nAo registar o seu perfil no nosso banco de talentos de elite, a sua competência torna-se visível para recrutadores de prestígio que lideram a modernização agrária nacional sob a nossa supervisão de rede. Facilitamos o acesso a projectos de grande escala onde o seu conhecimento pode transformar-se em impacto real, assegurando que o seu percurso profissional seja pautado pela excelência e pela contribuição directa para a segurança alimentar do país.",
                subServices: [
                    { title: "Banco de CVs", description: "Registe o seu currículo na nossa base de dados exclusiva." },
                    { title: "Alertas de Vaga", description: "Receba notificações sobre oportunidades no seu perfil." },
                    { title: "Candidatura Directa", description: "Processo simplificado para responder a anúncios." }
                ],
                features: ["Foco no Sector", "Empresas de Renome", "Acesso Gratuito"]
            },
            "recrutamento": {
                slug: "recrutamento",
                title: "Recrutamento Especializado",
                description: "Serviços de RH focados em perfis técnicos agrícolas.",
                icon: Users,
                fullDescription: "Encontrar o profissional certo para as exigências técnicas e físicas do campo é um desafio estratégico que dominamos com precisão absoluta. Apoiamos as empresas agrárias na identificação e selecção de talentos de alto nível, utilizando uma metodologia de triagem que vai além da análise curricular convencional.\n\nAvaliamos o alinhamento cultural e a competência prática em ambiente rural moçambicano, garantindo que o colaborador esteja preparado para os desafios da produção em larga escala. O nosso serviço de headhunting foca-se em posições críticas de comando e especialização técnica que são fundamentais para o sucesso.\n\nAo confiar no nosso recrutamento especializado, a sua empresa reduz o turnover e acelera a curva de produtividade dos novos contratados. Garantimos que cada contratação seja um investimento seguro no capital humano do seu projecto, elevando o padrão de excelência da sua equipa e assegurando a continuidade das operações com o brio que o sector exige.",
                subServices: [
                    { title: "Headhunting", description: "Procura activa de talentos de alto nível no mercado." },
                    { title: "Triagem Técnica", description: "Entrevistas e testes específicos para o sector." },
                    { title: "Onboarding", description: "Apoio na integração do novo colaborador na empresa." }
                ],
                features: ["Selecção Rigorosa", "Expertise no Agro", "Redução de Turnover"]
            },
            "estagios": {
                slug: "estagios",
                title: "Estágios Profissionais",
                description: "Programas de entrada no mercado para jovens licenciados.",
                icon: GraduationCap,
                fullDescription: "O futuro do agronegócio moçambicano começa na formação das mentes jovens e na sua integração prática no ecossistema produtivo nacional de elite. Gerimos programas de estágio de excelência que servem de ponte entre a academia e a realidade operacional das grandes empresas e explorações agrícolas em todas as províncias do nosso país.\n\nProporcionamos aos recém-graduados a oportunidade de aprender com mentores experientes, aplicando conhecimentos teóricos em projectos reais de alta complexidade técnica. O foco é desenvolver habilidades práticas que abrangem desde a gestão de colheitas à implementação de tecnologias digitais, acelerando a renovação geracional qualificada do sector com brio.\n\nCada estágio é uma jornada de descoberta e crescimento que beneficia tanto o jovem talento quanto a empresa acolhedora. O nosso compromisso é garantir que a transição para o mercado de trabalho seja um processo de excelência, dotando Moçambique de profissionais preparados para enfrentar os desafios globais com a competência e a integridade que o agronegócio exige.",
                subServices: [
                    { title: "Estágios de Verão", description: "Experiências Intensivas durante a pausa académica." },
                    { title: "Primeiro Emprego", description: "Programas de transição da universidade para o campo." },
                    { title: "Mentoria", description: "Acompanhamento por profissionais experientes do sector." }
                ],
                features: ["Desenvolvimento Jovem", "Networking Inicial", "Experiência Real"]
            },
            "carreira": {
                slug: "carreira",
                title: "Consultoria de Carreira",
                description: "Apoio na elaboração de CV e preparação para entrevistas.",
                icon: FileText,
                fullDescription: "A evolução profissional no sector agrário nacional exige estratégia, actualização constante e uma rede de contactos sólida e influente. Através da nossa equipa de consultoria de carreira, oferecemos mentoria individualizada para profissionais que desejam elevar o seu posicionamento no mercado de elite moçambicano de forma célere e sustentada.\n\nAjudamos a optimizar o percurso profissional para os padrões internacionais de qualidade, preparando os candidatos para negociações de carreira complexas e posições de liderança técnica. Analisamos cada perfil com rigor para desenhar um roteiro de crescimento que maximize as forças individuais e supra lacunas de competência estratégica.\n\nO brio profissional é o resultado de uma preparação meticulosa e de uma visão clara de futuro no agronegócio. O nosso papel é prover a bússola para que o seu talento seja reconhecido e remunerado de acordo com a sua real contribuição para o progresso da produção nacional, garantindo uma carreira de sucesso e prestígio inquestionável.",
                subServices: [
                    { title: "Revisão de CV", description: "Currículos focados em resultados e competências agrárias." },
                    { title: "Treino de Entrevista", description: "Simulações para ganhar confiança e clareza." },
                    { title: "Plano de Carreira", description: "Desenho de metas e caminhos para o crescimento profissional." }
                ],
                features: ["Apoio Individualizado", "Visão de Mercado", "Confiança Reforçada"]
            }
        }
    },
    "consultoria": {
        id: "consultoria",
        title: "Consultoria digital",
        subCategories: {
            "estrategia": {
                slug: "estrategia",
                title: "Estratégia Digital",
                description: "Planos estratégicos para transformação digital do agro-negócio.",
                icon: Globe,
                fullDescription: "Trace o caminho para o futuro digital da sua organização com a nossa equipa de consultoria estratégica de elite. Ajudamos a sua empresa a identificar as tecnologias mais disruptivas e adequadas, optimizando o retorno sobre o investimento e garantindo uma vantagem competitiva inabalável através de uma transformação digital planeada ao pormenor.\n\nAnalisamos tendências globais e realidades locais para criar modelos de negócio digitais que reduzem dependências e optimizam cadeias de valor com o máximo rigor técnico. O nosso compromisso é assegurar que a sua marca esteja na vanguarda da produtividade e da inteligência competitiva em Moçambique, transformando cada desafio tecnológico numa oportunidade de expansão comercial e excelência operacional incontestável.",
                subServices: [
                    { title: "Auditoria Digital", description: "Análise do estado actual da tecnologia na empresa." },
                    { title: "Roadmap Tecnológico", description: "Plano estruturado de adopção de novas ferramentas." },
                    { title: "ROI Analysis", description: "Estudo de viabilidade económica para projectos de TI." }
                ],
                features: ["Visão de Futuro", "Base em Dados", "Planeamento Realista"]
            },
            "otimizacao": {
                slug: "otimizacao",
                title: "Otimização de Processos",
                description: "Análise e melhoria de processos operacionais através de tecnologia.",
                icon: Zap,
                fullDescription: "A maximização da eficiência operacional é o pilar da rentabilidade no agronegócio moderno nacional através da tecnologia de ponta. Analisamos os seus fluxos de trabalho actuais com rigor cirúrgico e implementamos melhorias tecnológicas que eliminam gargalos operacionais e reduzem drasticamente os desperdícios de recursos vitais.\n\nAo introduzir ferramentas de automação e revisão de processos sob a nossa supervisão técnica, conseguimos elevar a velocidade de execução e reduzir significativamente os custos marginais de cada acção. O foco é transformar a complexidade do campo numa operação fluida, onde cada tarefa é executada com a máxima precisão e economia.\n\nO objectivo final é garantir que a sua operação cresça de forma escalável e lucrativa, transformando a tecnologia numa aliada fundamental para a simplificação do trabalho e o alcance da excelência técnica. A nossa consultoria em optimização é o catalisador necessário para que a sua empresa atinja o brio produtivo que o mercado global exige de Moçambique.",
                subServices: [
                    { title: "Mapeamento de Fluxos", description: "Visualização detalhada de cada etapa operacional." },
                    { title: "Automação de Tarefas", description: "Software para gerir processos repetitivos automaticamente." },
                    { title: "Gestão Lean", description: "Metodologias de eficiência aplicadas ao campo." }
                ],
                features: ["Eficiência Máxima", "Redução de Custos", "Processos Claros"]
            },
            "dados": {
                slug: "dados",
                title: "Análise de Dados",
                description: "Insights baseados em dados para melhor tomada de decisão.",
                icon: TrendingUp,
                fullDescription: "A imagem institucional e a acessibilidade digital são os alicerces de qualquer empresa agrária moderna que vise o sucesso nacional e internacional de forma sustentada. A nossa equipa de análise de dados projecta dashboards intuitivos que traduzem a complexidade da produção em métricas claras e accionáveis para o gestor moderno.\n\nEstes sistemas são arquitectados com o máximo rigor técnico, assegurando rapidez na consulta de informações críticas sobre colheitas, clima e custos operacionais, mesmo a partir de dispositivos móveis. Ao centralizar as informações do seu projecto num sistema de Business Intelligence, elevamos a transparência e a precisão da sua gestão agrária moçambicana.\n\nAtravés de modelos preditivos e análise histórica, permitimos que a sua empresa anteveja tendências de mercado e otimize a alocação de recursos com uma eficácia sem precedentes. A nossa análise de dados é a ferramenta de platina para quem busca a liderança do sector, garantindo que cada hectare seja monitorado com o brio e a inteligência tecnológica que a era digital impõe.",
                subServices: [
                    { title: "BI Dashboard", description: "Painéis interactivos com métricas de produção." },
                    { title: "Previsão de Colheita", description: "Modelos baseados em dados históricos e actuais." },
                    { title: "Análise de Custos", description: "Controlo rigoroso da rentabilidade por hectare." }
                ],
                features: ["Precisão Decisória", "Monitoramento Real", "Inteligência de Mercado"]
            },
            "implementacao": {
                slug: "implementacao",
                title: "Implementação Tecnológica",
                description: "Suporte na adoção e integração de novas tecnologias.",
                icon: Smartphone,
                fullDescription: "Transforme a gestão da sua exploração agrícola através de aplicações móveis personalizadas e de alta performance, desenhadas para o rigor do ambiente rural moçambicano. Desenvolvemos soluções de software que permitem o controlo de stock, a monitorização de colheitas e a gestão de equipas a partir da palma da sua mão com total fluidez.\n\nAs nossas ferramentas de implementação tecnológica integram dados operacionais para uma tomada de decisão verdadeiramente lúcida, informada e baseada em evidências de campo reais. As aplicações são concebidas sob os mais elevados padrões de usabilidade, garantindo que a transacção de dados ocorra de forma segura mesmo em condições de conectividade remota limitada.\n\nAo adoptar uma solução proprietária para o seu projecto agro, introduz uma cultura de precisão e brio que reduz o desperdício de recursos e maximiza o retorno sobre cada acção planejada. O nosso compromisso é ser o parceiro que viabiliza a modernização industrial do campo moçambicano, elevando a sofisticação da sua gestão agrária para patamares de excelência global.",
                subServices: [
                    { title: "Instalação de Software", description: "Configuração de ERPs e sistemas agrários." },
                    { title: "Integração de Sistemas", description: "Ligue as suas ferramentas para que falem entre si." },
                    { title: "Suporte à Adopção", description: "Acompanhamento da equipa nas primeiras semanas de uso." }
                ],
                features: ["Transição Suave", "Sem Fricção Técnica", "Garantia de Uso"]
            }
        }
    },
    "formacao": {
        id: "formacao",
        title: "Formações e capacitações",
        subCategories: {
            "academia": {
                slug: "academia",
                title: "Academia Agro",
                description: "Cursos certificados online para capacitação técnica.",
                icon: GraduationCap,
                fullDescription: "Desenvolva as competências necessárias para liderar com brio no sector agrário através de formação técnica certificada de alta estirpe em Moçambique. Os nossos cursos cobrem desde a gestão financeira e administrativa até às mais recentes inovações pedagógicas em técnicas de cultivo e maneio sustentável da terra.\n\nProporcionamos um ambiente de aprendizagem rigoroso que une a teoria académica à prática operacional exigida pelas grandes empresas do agronegócio nacional. O foco é dotar o formando de ferramentas intelectuais robustas que permitam enfrentar os desafios de um mercado globalizado e altamente competitivo de forma eficaz e resiliente.\n\nAo concluir a sua formação na nossa academia, o profissional adquire não apenas conhecimento, mas o brio técnico necessário para transformar a produção moçambicana. O nosso compromisso é com a excelência do capital humano, garantindo que cada graduado esteja preparado para ser um agente de progresso e inovação em toda a cadeia de valor agrária.",
                subServices: [
                    { title: "Gestão Agrária", description: "Fundamentos de economia rual e administração de fazendas." },
                    { title: "Técnicas de Plantio", description: "Capacitação em métodos modernos de sementeira e maneio." }
                ],
                features: ["Certificado Oficial", "Estude de Onde Estiver"]
            },
            "capacitacao": {
                slug: "capacitacao",
                title: "Capacitação Rural",
                description: "Treinos práticos de campo para melhoria de produtividade.",
                icon: Truck,
                fullDescription: "Levamos a inovação tecnológica directamente para onde ela é mais imperativa, através de parcerias virtuosas com centros de investigação e equipas de extensão agrária. Os nossos programas de capacitação rural focam-se em workshops práticos e dias de campo realizados sob orientação técnica rigorosa para elevar a produtividade nacional.\n\nAcreditamos que a aprendizagem por demonstração e a observação directa das melhores práticas é o motor mais célere para o aumento da produção moçambicana de forma sustentada e inclusiva. Através desta acção de formação contínua, garantimos que o produtor possua as ferramentas intelectuais para enfrentar os desafios do clima e do mercado.\n\nCada projecto de capacitação é desenhado para gerar um impacto real na qualidade de vida das comunidades rurais e na rentabilidade das explorações. O nosso compromisso é transformar o conhecimento técnico num activo de progresso que se traduz em colheitas mais abundantes, processos mais limpos e um agronegócio mais resiliente em todo o território nacional.",
                subServices: [
                    { title: "Workshop de Campo", description: "Demonstrações práticas de novas técnicas." },
                    { title: "Dia de Campo", description: "Intercâmbio de experiências entre produtores de sucesso." },
                    { title: "Treino em Maquinaria", description: "Capacitação para operadores de tractores e alfaias." }
                ],
                features: ["Ensino Prático", "Impacto Directo", "Proximidade Real"]
            },
            "certificacao": {
                slug: "certificacao",
                title: "Certificação ISO",
                description: "Preparação para certificações internacionais de qualidade.",
                icon: ShieldCheck,
                fullDescription: "O acesso aos mercados de exportação mais prestigiosos e lucrativos exige a adopção de padrões internacionais de qualidade e sustentabilidade reconhecidos globalmente. Em estreita parceria com o INNOQ, apoiamos a sua empresa na jornada de preparação para as certificações ISO e GlobalG.A.P., implementando sistemas de gestão que auditam e validam cada etapa do seu processo produtivo com rigor.\n\nEsta certificação não é meramente um selo de conformidade, mas sim uma prova de excelência técnica que valoriza a sua colheita e fortalece a confiança dos compradores internacionais mais exigentes do globo. O nosso suporte especializado garante que o seu projecto agrário alcance os circuitos comerciais de elite, posicionando a produção moçambicana como uma referência de qualidade inabalável e segurança alimentar de classe mundial.",
                subServices: [
                    { title: "ISO 9001 Preparação", description: "Gestão da qualidade focada em processos agrários." },
                    { title: "Boas Práticas Agrícolas", description: "Implementação de normas GlobalG.A.P." },
                    { title: "Higiene e Segurança", description: "Normas de segurança alimentar no processamento." }
                ],
                features: ["Reconhecimento Global", "Acesso à Exportação", "Padrão de Excelência"]
            },
            "elearning": {
                slug: "elearning",
                title: "E-learning Corporativo",
                description: "Plataformas de treino personalizado para equipas de empresas.",
                icon: Smartphone,
                fullDescription: "A escala e a dispersão geográfica das grandes operações agrárias exigem uma solução de formação que seja simultaneamente robusta, moderna e altamente escalável. Desenvolvemos ecossistemas de e-learning corporativo personalizados, permitindo que a sua empresa treine centenas de colaboradores de forma uniforme e monitorizada, independentemente da sua localização geográfica em território moçambicano.\n\nAtravés de plataformas inovadoras e planos de aprendizagem adaptativos, garantimos que os padrões de segurança operacional e a excelência técnica da sua organização sejam mantidos em todos os níveis hierárquicos com eficácia. Esta solução tecnológica reduz custos de formação e acelera a competência interna, assegurando que o capital humano seja o motor da inovação e da produtividade no seu projecto agrário de grande escala.",
                subServices: [
                    { title: "Portal de Formação", description: "Ambiente virtual exclusivo com a marca da sua empresa." },
                    { title: "Gamificação", description: "Aumente a motivação com sistemas de pontos e rankings." },
                    { title: "Relatórios de Progresso", description: "Acompanhe o desenvolvimento de cada colaborador." }
                ],
                features: ["Escalabilidade", "Controlo de Conhecimento", "Custo-Benefício"]
            }
        }
    }
};
