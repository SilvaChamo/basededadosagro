import {
    Truck, Globe, ShieldCheck, Search,
    Zap, Store, Smartphone, Users,
    TrendingUp, Gavel, ShoppingCart,
    Calendar, Star, FileText,
    Briefcase, GraduationCap, Monitor,
    Rocket, Settings, Headphones,
    PenTool, CheckCircle2, Lightbulb
} from "lucide-react";

export const servicesConfig: any = {
    "logistica": {
        id: "logistica",
        subCategories: {
            "transporte": { slug: "transporte", icon: Truck },
            "multimodal": { slug: "multimodal", icon: Globe },
            "seguranca": { slug: "seguranca", icon: ShieldCheck },
            "rastreio": { slug: "rastreio", icon: Search }
        }
    },
    "assistencia": {
        id: "assistencia",
        subCategories: {
            "portais": { slug: "portais", icon: Rocket },
            "tecnico": { slug: "tecnico", icon: Settings },
            "apps": { slug: "apps", icon: Smartphone },
            "suporte": { slug: "suporte", icon: Headphones }
        }
    },
    "insumos": {
        id: "insumos",
        subCategories: {
            "sementes": { slug: "sementes", icon: Zap },
            "mudas": { slug: "mudas", icon: Zap },
            "matrizes-reprodutores": { slug: "matrizes-reprodutores", icon: Zap },
            "material-genetico": { slug: "material-genetico", icon: Zap },
            "microrganismos": { slug: "microrganismos", icon: ShieldCheck },
            "inoculantes": { slug: "inoculantes", icon: Zap },
            "fertilizantes-minerais": { slug: "fertilizantes-minerais", icon: Zap },
            "corretivos-solo": { slug: "corretivos-solo", icon: Zap },
            "herbicidas": { slug: "herbicidas", icon: ShieldCheck },
            "inseticidas": { slug: "inseticidas", icon: ShieldCheck },
            "fungicidas": { slug: "fungicidas", icon: ShieldCheck },
            "esterco": { slug: "esterco", icon: Zap },
            "compostagem": { slug: "compostagem", icon: Zap },
            "biofertilizantes": { slug: "biofertilizantes", icon: Zap },
            "adubacao-verde": { slug: "adubacao-verde", icon: Zap },
            "humus": { slug: "humus", icon: Zap },
            "racoes": { slug: "racoes", icon: Zap },
            "suplementos-minerais": { slug: "suplementos-minerais", icon: Zap },
            "vacinas": { slug: "vacinas", icon: ShieldCheck },
            "medicamentos-veterinarios": { slug: "medicamentos-veterinarios", icon: ShieldCheck },
            "sal-mineral": { slug: "sal-mineral", icon: Zap },
            "tratores": { slug: "tratores", icon: Truck },
            "arados": { slug: "arados", icon: Truck },
            "grades": { slug: "grades", icon: Truck },
            "colheitadeiras": { slug: "colheitadeiras", icon: Truck },
            "semeadoras": { slug: "semeadoras", icon: Truck },
            "sistemas-irrigacao": { slug: "sistemas-irrigacao", icon: Zap },
            "sensores-agricolas": { slug: "sensores-agricolas", icon: Zap },
            "drones": { slug: "drones", icon: Zap },
            "gps-agricola": { slug: "gps-agricola", icon: Zap },
            "softwares-gestao": { slug: "softwares-gestao", icon: Zap },
            "cercas": { slug: "cercas", icon: ShieldCheck },
            "postes": { slug: "postes", icon: ShieldCheck },
            "galpoes": { slug: "galpoes", icon: ShieldCheck },
            "estufas": { slug: "estufas", icon: Zap },
            "currais": { slug: "currais", icon: ShieldCheck },
            "credito-agricola": { slug: "credito-agricola", icon: Zap },
            "seguro-rural": { slug: "seguro-rural", icon: ShieldCheck },
            "investimentos": { slug: "investimentos", icon: Zap },
            "subsidios": { slug: "subsidios", icon: Zap },
            "linhas-financiamento": { slug: "linhas-financiamento", icon: Zap }
        }
    },
    "lojas": {
        id: "lojas",
        subCategories: {
            "registo": { slug: "registo", icon: Store }
        }
    },
    "compra-venda": {
        id: "compra-venda",
        subCategories: {
            "cotacoes": { slug: "cotacoes", icon: TrendingUp },
            "ofertas": { slug: "ofertas", icon: ShoppingCart },
            "leiloes": { slug: "leiloes", icon: Gavel },
            "garantia": { slug: "garantia", icon: ShieldCheck }
        }
    },
    "eventos": {
        id: "eventos",
        subCategories: {
            "calendario": { slug: "calendario", icon: Calendar },
            "promocao": { slug: "promocao", icon: Zap },
            "bilheteira": { slug: "bilheteira", icon: ShoppingCart },
            "patrocinio": { slug: "patrocinio", icon: Star }
        }
    },
    "conteudo": {
        id: "conteudo",
        subCategories: {
            "escrita": { slug: "escrita", icon: FileText },
            "redes": { slug: "redes", icon: Users },
            "video": { slug: "video", icon: FileText },
            "newsletter": { slug: "newsletter", icon: FileText }
        }
    },
    "emprego": {
        id: "emprego",
        subCategories: {
            "talento": { slug: "talento", icon: Briefcase },
            "recrutamento": { slug: "recrutamento", icon: Users },
            "estagios": { slug: "estagios", icon: GraduationCap },
            "carreira": { slug: "carreira", icon: FileText }
        }
    },
    "consultoria": {
        id: "consultoria",
        subCategories: {
            "estrategia": { slug: "estrategia", icon: Globe },
            "otimizacao": { slug: "otimizacao", icon: Zap },
            "dados": { slug: "dados", icon: TrendingUp },
            "implementacao": { slug: "implementacao", icon: Smartphone }
        }
    },
    "formacao": {
        id: "formacao",
        subCategories: {
            "academia": { slug: "academia", icon: GraduationCap },
            "capacitacao": { slug: "capacitacao", icon: Truck },
            "certificacao": { slug: "certificacao", icon: ShieldCheck },
            "elearning": { slug: "elearning", icon: Smartphone }
        }
    }
};
