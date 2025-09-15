'use client';

import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: "Wesley Freitas",
    role: "Controller",
    company: "TechCorp Brasil",
    content: "O Contabilease trouxe eficiência significativa aos nossos processos de IFRS 16. A padronização dos cálculos e a qualidade dos relatórios melhoraram nossa operação contábil.",
    rating: 5,
    avatar: "WF",
    verified: true,
    savings: "Eficiência operacional",
    photo: "/testimonials/wesley.jpg"
  },
  {
    name: "Nicia Rodrigues", 
    role: "Especialista Contábil",
    company: "Contabilidade & Cia",
    content: "A precisão dos cálculos e a conformidade com as normas IFRS 16 são os principais benefícios. Os relatórios padronizados facilitam a apresentação aos clientes.",
    rating: 5,
    avatar: "NR",
    verified: true,
    savings: "Conformidade garantida",
    photo: "/testimonials/nicia.jpg"
  },
  {
    name: "João Marcelo",
    role: "Auditor Contábil", 
    company: "Global Finance Solutions",
    content: "Como auditor, valorizo a transparência e precisão dos cálculos. O Contabilease oferece confiabilidade nos números e facilita o processo de validação.",
    rating: 5,
    avatar: "JM",
    verified: true,
    savings: "Precisão validada",
    photo: "/testimonials/joao.jpg"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Experiências reais de profissionais
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Contadores e controllers que utilizam o Contabilease em suas operações diárias
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 relative">
                    <span className="text-blue-600 font-bold text-lg">
                      {testimonial.avatar}
                    </span>
                    {testimonial.verified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.company}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-green-600">
                    {testimonial.savings}
                  </div>
                  <div className="text-xs text-gray-500">
                    economia
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-4 bg-white rounded-full px-8 py-4 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">
                <span className="text-green-600 font-bold">Profissionais</span> confiam no Contabilease
              </span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="text-sm text-gray-600">
              Conformidade IFRS 16
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
