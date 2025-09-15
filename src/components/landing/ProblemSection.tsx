'use client';

import {
    CalculatorIcon,
    CheckCircleIcon,
    ClockIcon,
    CloudIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const problems = [
  {
    icon: ClockIcon,
    title: "Tempo Excessivo",
    description: "Cálculos manuais de IFRS 16 consomem tempo valioso do contador",
    impact: "Tempo que poderia ser usado para análise estratégica"
  },
  {
    icon: ExclamationTriangleIcon,
    title: "Risco de Inconsistências",
    description: "Cálculos manuais podem apresentar variações entre períodos",
    impact: "Necessidade de revisão e validação constante"
  },
  {
    icon: DocumentTextIcon,
    title: "Padronização Limitada",
    description: "Planilhas Excel podem não seguir padrões consistentes",
    impact: "Dificuldade na padronização de processos"
  },
  {
    icon: CloudIcon,
    title: "Gestão de Arquivos",
    description: "Controle manual de versões e backup de arquivos Excel",
    impact: "Risco de perda de informações históricas"
  }
];

const solutions = [
  {
    icon: CalculatorIcon,
    title: "Cálculos Automatizados",
    description: "Algoritmos baseados nas diretrizes IFRS 16 e CPC 06 (R2)",
    benefit: "Cálculos consistentes e validados"
  },
  {
    icon: ClockIcon,
    title: "Eficiência Operacional",
    description: "Redução significativa no tempo de processamento",
    benefit: "Mais tempo para análise e consultoria"
  },
  {
    icon: DocumentTextIcon,
    title: "Relatórios Padronizados",
    description: "Documentos profissionais com layout consistente",
    benefit: "Padronização de entregas"
  },
  {
    icon: CheckCircleIcon,
    title: "Conformidade Normativa",
    description: "Cálculos alinhados com as normas contábeis vigentes",
    benefit: "Conformidade com padrões profissionais"
  }
];

export default function ProblemSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Problem Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Desafios reais na gestão de contratos IFRS 16
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contadores enfrentam desafios operacionais significativos ao processar cálculos de IFRS 16 
            manualmente, impactando a eficiência e a padronização dos processos contábeis.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {problems.map((problem, index) => (
            <div key={index} className="text-center">
              <div className="bg-red-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <problem.icon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {problem.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {problem.description}
              </p>
              <div className="text-sm text-red-600 font-medium">
                {problem.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Solution Statement */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nossa proposta de valor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            O Contabilease oferece uma solução profissional para cálculos de IFRS 16, 
            proporcionando eficiência operacional e conformidade normativa para contadores.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div key={index} className="text-center">
              <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <solution.icon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {solution.title}
              </h3>
              <p className="text-gray-600 mb-2">
                {solution.description}
              </p>
              <div className="text-sm text-green-600 font-medium">
                {solution.benefit}
              </div>
            </div>
          ))}
        </div>

        {/* Before/After Comparison */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Comparação objetiva de processos
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-xl p-6 border border-gray-300">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <DocumentTextIcon className="h-6 w-6 mr-2" />
                Processo Manual Tradicional
              </h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-gray-500" />
                  <span>Tempo significativo por contrato</span>
                </div>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
                  <span>Validação manual necessária</span>
                </div>
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                  <span>Relatórios personalizados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CloudIcon className="h-5 w-5 text-gray-500" />
                  <span>Gestão manual de arquivos</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-700 font-medium text-sm">
                  <strong>Características:</strong> Flexibilidade total, controle manual completo
                </p>
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-xl p-6 border border-green-200">
              <h4 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
                <CheckCircleIcon className="h-6 w-6 mr-2" />
                Solução Contabilease
              </h4>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-5 w-5 text-green-500" />
                  <span>Processamento otimizado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <span>Cálculos validados automaticamente</span>
                </div>
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-5 w-5 text-green-500" />
                  <span>Relatórios padronizados</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CloudIcon className="h-5 w-5 text-green-500" />
                  <span>Backup automático na nuvem</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 font-medium text-sm">
                  <strong>Benefícios:</strong> Eficiência, padronização e conformidade normativa
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
