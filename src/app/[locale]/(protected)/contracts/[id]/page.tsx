import ContractDetailsPageClient from './ContractDetailsPageClient';
import { getSessionOrRedirect } from '@/lib/auth/requireSession';
import { fetchContractById } from '@/lib/contracts';

export default async function ContractDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  await getSessionOrRedirect(locale);

  let contract = null;
  let error: string | null = null;

  try {
    contract = await fetchContractById(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erro ao carregar contrato';
  }

  return (
    <ContractDetailsPageClient contractId={id} initialContract={contract} initialError={error} />
  );
}
