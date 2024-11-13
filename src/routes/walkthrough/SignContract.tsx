import { signAndBroadcastOffer } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { useDlcDevKit } from "@/hooks/use-dlcdevkit";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SignContract = () => {
  const context = useDlcDevKit();
  const [signInput, setSignInput] = useState("");
  const [error, setError] = useState<string | null>(null);


  const handleSubmit = async () => {
    try {
      const txid = await signAndBroadcastOffer(signInput, context.publicKey);
      context.setSignHex(signInput);
      context.setTxid(txid);
    } catch (error) {
      console.error("Error signing and broadcasting:", error);
      setError(error as string)
    }
  };

  if (context.txid) {
    return (
      <div className="p-4">
        <h3>Contract Signed!</h3>
        <p className="break-words">Transaction ID: {context.txid}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {error && (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <textarea
        className="w-full h-32 p-2 border rounded"
        value={signInput}
        onChange={(e) => setSignInput(e.target.value)}
        placeholder="Enter sign hex..."
      />
      <Button onClick={handleSubmit}>Sign and Broadcast</Button>
    </div>
  );
};