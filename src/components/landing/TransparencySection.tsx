'use client';

import {
    AcademicCapIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline';

const complianceItems = [
  {
    icon: DocumentTextIcon,
    title: "Conformidade CPC 06 (R2)",
    description: "Cálculos baseados nas diretrizes do Comitê de Pronunciamentos Contábeis",
    detail: "Seguimos rigorosamente as normas brasileiras de contabilidade"
  },
  {
    icon: ShieldCheckIcon,
    title: "Padrão IFRS 16",
    description: "Implementação completa das normas internacionais de contabilidade",
    detail: "Cálculos alinhados com as práticas internacionais"
  },
  {
    icon: CheckCircleIcon,
    title: "Validação Contínua",
    description: "Cálculos validados por especialistas contábeis",
    detail: "Revisão periódica para garantir precisão"
  },
  {
    icon: AcademicCapIcon,
    title: "Desenvolvimento Especializado",
    description: "Equipe com formação contábil e experiência em IFRS 16",
    detail: "Conhecimento técnico aplicado ao desenvolvimento"
  }
];

const transparencyItems = [
  {
    title: "Preços Transparentes",
    description: "Sem taxas ocultas ou surpresas. Todos os custos são claramente informados."
  },
  {
    title: "Teste Gratuito Real",
    description: "30 dias completos de acesso, sem necessidade de cartão de crédito."
  },
  {
    title: "Suporte Especializado",
    description: "Equipe com conhecimento técnico em contabilidade e IFRS 16."
  },
  {
    title: "Segurança de Dados",
    description: "Backup automático e proteção de informações conforme LGPD."
  }
];

export default function TransparencySection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Transparência e conformidade ética
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprometimento com padrões profissionais e transparência total 
            em nossos processos e comunicações.
          </p>
        </div>

        {/* Compliance Grid */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Conformidade com padrões contábeis
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {complianceItems.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-gray-600 mb-2 text-sm">
                  {item.description}
                </p>
                <div className="text-xs text-blue-600 font-medium">
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transparency Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Nossos compromissos de transparência
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {transparencyItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Standards */}
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Padrões profissionais aplicados
            </h3>
            <p className="text-blue-800 mb-6 max-w-3xl mx-auto">
              Desenvolvemos o Contabilease seguindo rigorosamente os padrões profissionais 
              da contabilidade brasileira e internacional, garantindo conformidade e precisão.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-700">
              <div className="bg-white rounded-lg p-4">
                <strong className="text-blue-900">Normas Brasileiras:</strong><br />
                CPC 06 (R2) - Arrendamento Mercantil
              </div>
              <div className="bg-white rounded-lg p-4">
                <strong className="text-blue-900">Normas Internacionais:</strong><br />
                IFRS 16 - Leases
              </div>
              <div className="bg-white rounded-lg p-4">
                <strong className="text-blue-900">Proteção de Dados:</strong><br />
                Conformidade com LGPD
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
