import NewContractPageClient from './NewContractPageClient';
import { getSessionOrRedirect } from '@/lib/auth/requireSession';

export default async function NewContractPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  await getSessionOrRedirect(locale);

  return <NewContractPageClient />;
}
