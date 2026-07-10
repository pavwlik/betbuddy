import PollClient from './PollClient';

export default async function PollPage({
  params,
}: {
  params: Promise<{ groupId: string; pollId: string }>;
}) {
  const { groupId, pollId } = await params;
  return <PollClient groupId={groupId} pollId={pollId} />;
}
