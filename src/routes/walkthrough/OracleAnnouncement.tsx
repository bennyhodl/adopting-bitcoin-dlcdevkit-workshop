import { createOracleAnnouncement, CreateOracleAnnouncement } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { useDlcDevKit } from "@/hooks/use-dlcdevkit";

export const OracleAnnouncementComponent = () => {
  const context = useDlcDevKit()
  console.log(context.oracleAnnouncement, context.outcomes)

  const handleSubmit = async () => {
    const request: CreateOracleAnnouncement = {
      one: context.outcomes.one, two: context.outcomes.two
    };

    try {
      const [ann, hex] = await createOracleAnnouncement(request);
      context.setOracleAnnouncement({ ann, hex });
    } catch (error) {
      console.error("Error creating oracle announcement:", error);
    }
  };

  if (context.oracleAnnouncement) {
    return (
      <div className="p-4">
        <pre className="whitespace-pre-wrap break-words">Oracle: {context.oracleAnnouncement.ann.oraclePublicKey}</pre>
        <pre className="whitespace-pre-wrap break-words">Oracle: {context.oracleAnnouncement.ann.oracleEvent.eventId}</pre>
        <pre className="whitespace-pre-wrap break-words">Outcome: {context.outcomes.one}</pre>
        <pre className="whitespace-pre-wrap break-words">Outcome: {context.outcomes.two}</pre>

        <p className="break-words">{context.oracleAnnouncement.hex}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        type="text"
        value={context.outcomes.one}
        onChange={(e) => context.setOutcomes({ ...context.outcomes, one: e.target.value })}
        placeholder="Enter event description"
        className="p-2 border rounded"
      />
      <input
        type="text"
        value={context.outcomes.two}
        onChange={(e) => context.setOutcomes({ ...context.outcomes, two: e.target.value })}
        placeholder="Enter outcomes (comma separated)"
        className="p-2 border rounded"
      />
      <Button onClick={handleSubmit}>Create Announcement</Button>
    </div>
  );
};
