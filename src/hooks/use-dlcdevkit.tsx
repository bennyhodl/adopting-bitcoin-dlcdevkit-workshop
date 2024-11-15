import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Contract, getPublicKey, OracleAnnouncement, syncAndGetBalance, getContract, newAddress } from '@/lib/functions';

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
  publicKey: string
  contract: Contract
  getContract: () => void;
  attestation: string | null;
  setAttestation: (attestation: string | null) => void
  address: string | null;
  getAddress: () => void
}

const DlcDevKitContext = createContext<DlcDevKitContextType | undefined>(undefined);

export function DlcDevKitProvider({ children }: { children: ReactNode }) {
  const [publicKey, setPublicKey] = useState("")
  const [address, setAddress] = useState<string | null>(null)
  const [isOfferer, setIsOffererState] = useState<boolean | null>(null);
  const [oracleAnnouncement, setOracleAnnouncementState] = useState<{ ann: OracleAnnouncement, hex: string } | null>(null);
  const [attestation, setAttestation] = useState<string | null>(null);
  const [outcomes, setOutcomesState] = useState<{ one: string, two: string }>({ one: "", two: "" })
  const [offerHex, setOfferHexState] = useState<string | null>(null);
  const [signHex, setSignHexState] = useState<string | null>(null);
  const [txid, setTxidState] = useState<string | null>(null);
  const [balance, setBalanceState] = useState<{
    confirmed: number;
    unconfirmed: number;
  }>({ confirmed: 0, unconfirmed: 0 });
  const [contract, setContract] = useState<Contract>({ contractId: null, pnl: null, fundingTxid: "No funding transaction yet", closingTxid: "Contract not closed yet", state: "No contract yet" })

  const setIsOfferer = (value: boolean) => {
    localStorage.setItem('isOfferer', JSON.stringify(value));
    setIsOffererState(value);
  };

  const setOracleAnnouncement = (value: { ann: OracleAnnouncement, hex: string } | null) => {
    localStorage.setItem('oracleAnnouncement', JSON.stringify(value));
    setOracleAnnouncementState(value);
  };

  const setBitcoinAddress = (address: string) => {
    localStorage.setItem('address', address);
    setAddress(address)
  }

  const setOutcomes = (value: { one: string, two: string }) => {
    localStorage.setItem('outcomes', JSON.stringify(value));
    setOutcomesState(value);
  };

  const setOfferHex = (value: string | null) => {
    localStorage.setItem('offerHex', JSON.stringify(value));
    setOfferHexState(value);
  };

  const setSignHex = (value: string | null) => {
    localStorage.setItem('signHex', JSON.stringify(value));
    setSignHexState(value);
  };

  const setTxid = (value: string | null) => {
    localStorage.setItem('txid', JSON.stringify(value));
    setTxidState(value);
  };

  const setBalance = (value: { confirmed: number; unconfirmed: number }) => {
    localStorage.setItem('balance', JSON.stringify(value));
    setBalanceState(value);
  };

  const getBalance = async () => {
    const balance = await syncAndGetBalance();
    setBalance(balance)
  }

  const getPubkey = async () => {
    const pubkey = await getPublicKey()
    setPublicKey(pubkey)
  }

  const getWorkshopContract = async () => {
    const contract = await getContract();
    setContract(contract)
  }

  const getAddress = async () => {
    const address = await newAddress();
    setBitcoinAddress(address)
  }

  useEffect(() => {
    getBalance()
    getPubkey()
    getWorkshopContract()
    getAddress()
    // Load saved values from localStorage
    const savedIsOfferer = localStorage.getItem('isOfferer');
    if (savedIsOfferer) setIsOffererState(JSON.parse(savedIsOfferer));

    const savedOracleAnnouncement = localStorage.getItem('oracleAnnouncement');
    if (savedOracleAnnouncement) setOracleAnnouncementState(JSON.parse(savedOracleAnnouncement));

    const savedOutcomes = localStorage.getItem('outcomes');
    if (savedOutcomes) setOutcomesState(JSON.parse(savedOutcomes));

    const savedOfferHex = localStorage.getItem('offerHex');
    if (savedOfferHex) setOfferHexState(JSON.parse(savedOfferHex));

    const savedSignHex = localStorage.getItem('signHex');
    if (savedSignHex) setSignHexState(JSON.parse(savedSignHex));

    const savedTxid = localStorage.getItem('txid');
    if (savedTxid) setTxidState(JSON.parse(savedTxid));

    const savedBalance = localStorage.getItem('balance');
    if (savedBalance) setBalanceState(JSON.parse(savedBalance));
  }, [])


  useEffect(() => {
    const interval = setInterval(async () => {
      getWorkshopContract()
    }, 10000);

    return () => {
      clearInterval(interval);

    };
  }, []);

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
    getBalance,
    publicKey,
    contract,
    getContract,
    attestation,
    setAttestation,
    address,
    getAddress,
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

export const clearLocalStorage = () => {
  localStorage.removeItem('isOfferer');
  localStorage.removeItem('oracleAnnouncement');
  localStorage.removeItem('outcomes');
  localStorage.removeItem('offerHex');
  localStorage.removeItem('signHex');
  localStorage.removeItem('txid');
  localStorage.removeItem('balance');
};