'use client';

import Link from 'next/link';

export default function FooterSection() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Contabilease</h3>
            <p className="text-gray-400 text-sm">
              Ferramenta profissional para cálculos de IFRS 16, desenvolvida 
              especificamente para contadores brasileiros.
            </p>
            <div className="text-sm text-gray-400">
              <p>📧 contato@contabilease.com.br</p>
              <p>📞 (11) 99999-9999</p>
            </div>
            <div className="text-xs text-gray-500">
              <p>Conformidade: CPC 06 (R2) e IFRS 16</p>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold">Produto</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="#demo" className="block hover:text-white transition-colors">
                Demonstração
              </Link>
              <Link href="#pricing" className="block hover:text-white transition-colors">
                Preços
              </Link>
              <Link href="/pt-BR/auth/login" className="block hover:text-white transition-colors">
                Teste Grátis
              </Link>
              <Link href="/pt-BR/auth/login" className="block hover:text-white transition-colors">
                Login
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Recursos</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="#" className="block hover:text-white transition-colors">
                Cálculos IFRS 16
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Relatórios Padronizados
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Importação de Dados
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Backup na Nuvem
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Conformidade Normativa
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Suporte</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <Link href="#" className="block hover:text-white transition-colors">
                Central de Ajuda
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Contato
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <Link href="#" className="block hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2025 Contabilease. Todos os direitos reservados.
            </div>
            <div className="text-sm text-gray-400">
              Desenvolvido para contadores brasileiros • Conformidade CPC 06 (R2) e IFRS 16
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
