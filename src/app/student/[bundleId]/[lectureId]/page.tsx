import StudentLecture from '@/components/StudentLecture'

export default async function LecturePage({
  params,
}: {
  params: Promise<{ bundleId: string; lectureId: string }>
}) {
  const { bundleId, lectureId } = await params
  return <StudentLecture key={`${bundleId}-${lectureId}`} />
}
