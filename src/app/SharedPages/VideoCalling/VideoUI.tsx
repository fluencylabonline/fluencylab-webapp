import { useCallStateHooks, ParticipantView } from "@stream-io/video-react-sdk";

export const VideoUI = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  return (
    <>
      {participants.map((p) => (
        <ParticipantView participant={p} key={p.sessionId} />
      ))}
    </>
  );
};