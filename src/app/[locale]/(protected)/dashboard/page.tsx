import { getSessionOrRedirect } from '@/lib/auth/requireSession';
import DashboardClient from './DashboardClient';

export default async function DashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  await getSessionOrRedirect(locale);

  return <DashboardClient />;
}
