import { sendBitcoinBack } from "@/lib/functions";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const SendBitcoinBack = () => {
  const [error, setError] = useState<string | null>(null);
  const [txn, setTxn] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const txid = await sendBitcoinBack();
      setTxn(txid)
    } catch (error) {
      console.error("Error signing and broadcasting:", error);
      setError(error as string)
    }
  };

  if (txn) {
    return (
      <div className="p-4">
        <h3 className="bold text-xl">Sent bitcoin back</h3>
        <a href={`https://mutinynet.com/tx/${txn}`} target="_blank">Check the transaction.</a>
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
      <Button onClick={handleSubmit}>Send Bitcoin Back</Button>
    </div>
  );
};