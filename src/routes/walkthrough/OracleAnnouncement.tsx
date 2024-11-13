import { createOracleAnnouncement, CreateOracleAnnouncement, SignOracleAnnouncement, signOracleAnnouncement } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { useDlcDevKit } from "@/hooks/use-dlcdevkit";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const OracleAnnouncementComponent = () => {
  const context = useDlcDevKit()
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const request: CreateOracleAnnouncement = {
      one: context.outcomes.one, two: context.outcomes.two
    };

    try {
      const [ann, hex] = await createOracleAnnouncement(request);
      context.setOracleAnnouncement({ ann, hex });
    } catch (error) {
      console.error("Error creating oracle announcement:", error);
      setError(error as string);
    }
  };

  if (context.oracleAnnouncement) {
    return (
      <div className="p-4">
        <pre className="whitespace-pre-wrap break-words">Oracle Pubkey: {context.oracleAnnouncement.ann.oraclePublicKey}</pre>
        <pre className="whitespace-pre-wrap break-words">Event Id: {context.oracleAnnouncement.ann.oracleEvent.eventId}</pre>
        <pre className="whitespace-pre-wrap break-words">Outcome: {context.outcomes.one}</pre>
        <pre className="whitespace-pre-wrap break-words">Outcome: {context.outcomes.two}</pre>

        <p className="break-words text-start">{context.oracleAnnouncement.hex}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <input
        type="text"
        value={context.outcomes.one}
        onChange={(e) => context.setOutcomes({ ...context.outcomes, one: e.target.value })}
        placeholder="First outcome"
        className="p-2 border rounded bg-white text-black"
      />
      <input
        type="text"
        value={context.outcomes.two}
        onChange={(e) => context.setOutcomes({ ...context.outcomes, two: e.target.value })}
        placeholder="Second outcome"
        className="p-2 border rounded bg-white text-black"
      />
      <Button onClick={handleSubmit}>Create Announcement</Button>
    </div>
  );
};

export const SignOracleAnnouncementComponent = () => {
  let { oracleAnnouncement, outcomes } = useDlcDevKit()
  const [winner, setWinner] = useState("")
  const [error, setError] = useState<string | null>(null);

  if (!oracleAnnouncement) {
    return (
      <div className="pt-12 h-96 flex flex-col justify-center">
        <h3 className="text-2xl">You are not the Oracle signer.</h3>
        <p>Wait for your friend to sign the announcement.</p>
      </div>
    )
  }
  const handleSubmit = async () => {
    const request: SignOracleAnnouncement = {
      event_id: oracleAnnouncement.ann.oracleEvent.eventId,
      outcome: winner
    };

    console.log("Request", request);

    try {
      await signOracleAnnouncement(request);
    } catch (error) {
      console.error("Error creating oracle attestation:", error);
      setError(error as string);
    }
  };
  return (
    <div>
      <h3>Pick which outcome you want to sign for.</h3>
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-2 w-1/2 justify-center m-auto">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="outcome"
            checked={winner === outcomes.one}
            onChange={() => {
              setWinner(outcomes.one)
            }}
          />
          {outcomes.one}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="outcome"
            checked={winner === outcomes.two}
            onChange={() => {
              setWinner(outcomes.two)
            }}
          />
          {outcomes.two}
        </label>
        <Button onClick={handleSubmit}>Sign Announcement</Button>
      </div>
    </div>
  )
}
