import BundleDetail from '@/components/BundleDetail'

export default async function BundlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <BundleDetail key={id} />
}
