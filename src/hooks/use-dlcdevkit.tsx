import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { OracleAnnouncement, syncAndGetBalance } from '@/lib/functions';

interface DlcDevKitContextType {
  isOfferer: boolean | null;
  setIsOfferer: (offerer: boolean) => void;
  oracleAnnouncement: { ann: OracleAnnouncement; hex: string } | null;
  setOracleAnnouncement: (announcement: { ann: OracleAnnouncement; hex: string }) => void;
  outcomes: { one: string, two: string };
  setOutcomes: (outcomes: { one: string, two: string }) => void;
  offerHex: string | null;
  setOfferHex: (offer: string | null) => void;
  signHex: string | null;
  setSignHex: (sign: string | null) => void;
  txid: string | null;
  setTxid: (txid: string | null) => void;
  balance: {
    confirmed: number;
    unconfirmed: number;
  };
  setBalance: (balance: { confirmed: number; unconfirmed: number }) => void;
  getBalance: () => void
}

const DlcDevKitContext = createContext<DlcDevKitContextType | undefined>(undefined);

export function DlcDevKitProvider({ children }: { children: ReactNode }) {
  const [isOfferer, setIsOfferer] = useState<boolean | null>(null);
  const [oracleAnnouncement, setOracleAnnouncement] = useState<{ ann: OracleAnnouncement, hex: string } | null>(null);
  const [outcomes, setOutcomes] = useState<{ one: string, two: string }>({ one: "", two: "" })
  const [offerHex, setOfferHex] = useState<string | null>(null);
  const [signHex, setSignHex] = useState<string | null>(null);
  const [txid, setTxid] = useState<string | null>(null);
  const [balance, setBalance] = useState<{
    confirmed: number;
    unconfirmed: number;
  }>({ confirmed: 0, unconfirmed: 0 });

  const getBalance = async () => {
    const balance = await syncAndGetBalance();
    setBalance(balance)
  }

  useEffect(() => {
    getBalance()
  }, [])

  const value = {
    isOfferer,
    setIsOfferer,
    oracleAnnouncement,
    setOracleAnnouncement,
    outcomes,
    setOutcomes,
    offerHex,
    setOfferHex,
    signHex,
    setSignHex,
    txid,
    setTxid,
    balance,
    setBalance,
    getBalance
  };

  return (
    <DlcDevKitContext.Provider value={value}>
      {children}
    </DlcDevKitContext.Provider>
  );
}

export function useDlcDevKit() {
  const context = useContext(DlcDevKitContext);
  if (context === undefined) {
    throw new Error('useDlcDevKit must be used within a DlcDevKitProvider');
  }
  return context;
}
