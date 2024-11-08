import { invoke } from "@tauri-apps/api/core";

export interface CreateOracleAnnouncement {
  one: string;
  two: string;
}

export interface OracleAnnouncement {
  oraclePublicKey: string;
  oracleEvent: {
    eventId: string;
  };
}

export interface SignOracleAnnouncement {
  oracle_announcement: OracleAnnouncement;
  outcome: string;
}

export interface CreateOffer {
  my_outcome: string;
  their_outcome: string;
  announcement: OracleAnnouncement;
  public_key: string;
}

export async function createOracleAnnouncement(
  request: CreateOracleAnnouncement
): Promise<[OracleAnnouncement, string]> {
  return invoke("create_oracle_announcement", { request });
}

export async function signOracleAnnouncement(
  request: SignOracleAnnouncement
): Promise<[any, string]> {
  return invoke("sign_oracle_announcement", { request });
}

export async function receiveBitcoin(address: string): Promise<string> {
  return invoke("receive_bitcoin", { address });
}

export async function createOffer(request: CreateOffer): Promise<string> {
  return invoke("create_offer", { request });
}

export async function acceptOffer(
  offer: string,
  publicKey: string
): Promise<string> {
  return invoke("accept_offer", { offer, publicKey });
}

export async function signAndBroadcastOffer(
  sign: string,
  publicKey: string
): Promise<string> {
  return invoke("sign_and_broadcast_offer", { sign, publicKey });
}

export async function newAddress(): Promise<string> {
  return invoke("new_address");
}

export interface WalletBalance {
  confirmed: number;
  unconfirmed: number;
}

export async function syncAndGetBalance(): Promise<WalletBalance> {
  return invoke("sync_and_get_balance");
}

export async function getPublicKey(): Promise<string> {
  return invoke("pubkey");
}
