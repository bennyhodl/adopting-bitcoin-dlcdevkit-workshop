import { createOffer } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { useDlcDevKit } from "@/hooks/use-dlcdevkit";
import { useState } from "react";

export const CreateOfferComponent = () => {
  const context = useDlcDevKit();
  const [myPick, setMyPick] = useState("")
  const [theirPick, setTheirPick] = useState("")

  const handleSubmit = async () => {
    if (!context.oracleAnnouncement) return;

    try {
      const request = {
        my_outcome: myPick,
        their_outcome: theirPick,
        announcement: context.oracleAnnouncement.ann,
        public_key: context.publicKey
      };
      console.log(request)
      const offerHex = await createOffer(request);
      context.setOfferHex(offerHex);
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  if (context.offerHex) {
    return (
      <div className="p-4">
        <h3>Offer Created!</h3>
        <p className="break-words">{context.offerHex}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p>Choose your outcome:</p>
        <div className="flex flex-col gap-2 w-1/2 justify-center m-auto">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="outcome"
              checked={myPick === context.outcomes.one}
              onChange={() => {
                setMyPick(context.outcomes.one)
                setTheirPick(context.outcomes.two)
              }}
            />
            {context.outcomes.one}
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="outcome"
              checked={myPick === context.outcomes.two}
              onChange={() => {
                setMyPick(context.outcomes.two)
                setTheirPick(context.outcomes.one)
              }}
            />
            {context.outcomes.two}
          </label>
        </div>
        <Button onClick={handleSubmit}>Create Offer</Button>
      </div>

    </div>

  );
};