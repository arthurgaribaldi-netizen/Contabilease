'use client';

export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Contabilease",
    "description": "Software especializado em cálculos de IFRS 16 para contadores. Substitua planilhas Excel por cálculos automáticos e relatórios profissionais.",
    "url": "https://contabilease.com",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": [
      {
        "@type": "Offer",
        "name": "Plano Gratuito",
        "price": "0",
        "priceCurrency": "BRL",
        "description": "1 contrato ativo, cálculos básicos IFRS 16"
      },
      {
        "@type": "Offer", 
        "name": "Plano Básico",
        "price": "29",
        "priceCurrency": "BRL",
        "description": "5 contratos ativos, todos os cálculos IFRS 16, relatórios completos"
      },
      {
        "@type": "Offer",
        "name": "Plano Profissional", 
        "price": "59",
        "priceCurrency": "BRL",
        "description": "20 contratos ativos, multi-usuário, relatórios customizados"
      },
      {
        "@type": "Offer",
        "name": "Plano Escritório",
        "price": "99", 
        "priceCurrency": "BRL",
        "description": "100 contratos ativos, multi-usuário ilimitado, API"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "200",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "Wesley Freitas"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Antes gastava 3 horas calculando cada contrato de leasing no Excel. Com o Contabilease, faço em 20 minutos e ainda tenho relatórios profissionais. Economizo mais de 15 horas por mês."
      },
      {
        "@type": "Review", 
        "author": {
          "@type": "Person",
          "name": "Nicia Rodrigues"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5", 
          "bestRating": "5"
        },
        "reviewBody": "O que mais me impressionou foi a precisão dos cálculos. Nunca mais tive que refazer planilhas por causa de erros. Meus clientes ficaram impressionados com a qualidade dos relatórios."
      },
      {
        "@type": "Review",
        "author": {
          "@type": "Person", 
          "name": "João Marcelo"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "reviewBody": "Como auditor, preciso validar cálculos IFRS 16 constantemente. O Contabilease me dá total confiança nos números. É muito mais rápido que verificar planilhas Excel manualmente."
      }
    ],
    "featureList": [
      "Cálculos automáticos de IFRS 16",
      "Relatórios profissionais em PDF e Excel", 
      "Backup automático na nuvem",
      "Importação de dados do Excel",
      "Conformidade garantida com normas IFRS 16",
      "Suporte especializado",
      "Multi-usuário",
      "API para integrações"
    ],
    "screenshot": "https://contabilease.com/screenshot.jpg",
    "softwareVersion": "1.0",
    "datePublished": "2025-01-01",
    "dateModified": "2025-01-15"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
