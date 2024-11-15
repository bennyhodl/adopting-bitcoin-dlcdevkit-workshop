import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDlcDevKit, clearLocalStorage } from '@/hooks/use-dlcdevkit';

const ModalDialog = () => {
  const [open, setOpen] = React.useState(false);
  const { contract, balance, getBalance, getAddress } = useDlcDevKit()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-white text-black hover:bg-gray-400'>Contract</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md overflow-auto">
        <DialogHeader>
          <DialogTitle>Contract Information</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col'>
          <p><strong>Confirmed Balance:</strong> {balance.confirmed}</p>
          <p><strong>Unconfirmed:</strong> {balance.unconfirmed}</p>
          <p><strong>Contract State:</strong> {contract.state}</p>
          <p><strong>Funding Id:</strong> {contract.fundingTxid}</p>
          <p><strong>Closing Id:</strong> {contract.closingTxid}</p>
          <Button onClick={async () => await getBalance()} className='bg-black text-white hover:bg-gray-400 mt-4'>Sync Wallet</Button>
          <Button onClick={async () => await getAddress()} className='bg-black text-white hover:bg-gray-400 my-4'>New Address</Button>
          <Button onClick={() => clearLocalStorage()} className='bg-red-500 hover:bg-red-700 text-white'>All done? Delete data</Button>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} className='bg-white text-black hover:bg-gray-400'>Close</Button>
        </div>
      </DialogContent>
    </Dialog >
  );
};

export default ModalDialog;