import { requireAdminUser } from '@/lib/auth';

export default async function PhotoAdminPage() {
  await requireAdminUser();

  return <div className='container mx-auto mt-16'>Admin only area</div>;
}
