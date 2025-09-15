import ContractsPageClient from './ContractsPageClient';
import { getSessionOrRedirect } from '@/lib/auth/requireSession';
import { fetchContractsForCurrentUser, Contract } from '@/lib/contracts';

export default async function ContractsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  await getSessionOrRedirect(locale);

  let contracts: Contract[] = [];
  let error: string | null = null;

  try {
    contracts = await fetchContractsForCurrentUser();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro ao carregar contratos';
  }

  return <ContractsPageClient initialContracts={contracts} initialError={error} />;
}
