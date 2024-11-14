use chrono::{Duration, Utc};
use std::{str::FromStr, sync::Arc};

use crate::DdkState;
use ddk::{
    dlc::{EnumerationPayout, Payout},
    dlc_manager::{contract::Contract, Oracle, Storage},
    dlc_messages::{oracle_msgs::OracleAnnouncement, AcceptDlc, Message, OfferDlc},
    Transport,
};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Deserialize)]
pub struct CreateOracleAnnouncement {
    one: String,
    two: String,
}

#[tauri::command]
pub async fn create_oracle_announcement(
    state: State<'_, Arc<DdkState>>,
    request: CreateOracleAnnouncement,
) -> Result<(OracleAnnouncement, String), String> {
    // Get current time and add 30 minutes
    let future_time = Utc::now() + Duration::minutes(30);

    // Get Unix timestamp
    let unix_timestamp = future_time.timestamp();
    let announcement = state
        .ddk
        .oracle
        .create_event(vec![request.one, request.two], unix_timestamp as u32)
        .await
        .map_err(|e| {
            format!(
                "Could not create oracle announcement. error={}",
                e.to_string()
            )
        })?;

    let announcement_bytes = serde_json::to_vec(&announcement)
        .map_err(|_| "OracleAnnouncement is malformed.".to_string())?;
    let announcement_hex = hex::encode(&announcement_bytes);
    Ok((announcement, announcement_hex))
}

#[derive(Deserialize, Debug)]
pub struct SignOracleAnnouncement {
    event_id: String,
    outcome: String,
}
#[tauri::command]
pub async fn sign_oracle_announcement(
    state: State<'_, Arc<DdkState>>,
    request: SignOracleAnnouncement,
) -> Result<String, String> {
    println!("Request: {:?}", request);
    let announcement = state
        .ddk
        .oracle
        .get_announcement(&request.event_id)
        .await
        .map_err(|e| {
            format!(
                "Could not find announcement. event_id={} error={}",
                request.event_id,
                e.to_string()
            )
        })?;

    let attestation = state
        .ddk
        .oracle
        .sign_event(announcement, request.outcome)
        .await
        .map_err(|e| {
            format!(
                "Could not sign oracle announcement. error={}",
                e.to_string()
            )
        })?;

    let attestation_bytes = serde_json::to_vec(&attestation)
        .map_err(|_| "OracleAnnouncement is malformed.".to_string())?;
    let attestation_hex = hex::encode(&attestation_bytes);
    Ok(attestation_hex)
}

#[derive(Clone, Deserialize, Serialize)]
pub struct OnchainRequest {
    sats: Option<u64>,
    address: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct OnchainResponse {
    pub txid: String,
    pub address: String,
}

#[tauri::command]
pub async fn receive_bitcoin(
    state: State<'_, Arc<DdkState>>,
    address: String,
) -> Result<String, String> {
    let request = OnchainRequest {
        sats: Some(1_250_000),
        address,
    };
    let bitcoin = state
        .client
        .post("https://faucet.mutinynet.com/api/onchain")
        .body(serde_json::to_vec(&request).unwrap())
        .send()
        .await
        .map_err(|e| format!("Could not get bitcoin from faucet. error={}", e.to_string()))?
        .json::<OnchainResponse>()
        .await
        .map_err(|e| {
            format!(
                "Malformed response for faucet bitcoin. error={}",
                e.to_string()
            )
        })?;
    Ok(bitcoin.txid)
}

#[derive(Serialize, Deserialize)]
pub struct CreateOffer {
    my_outcome: String,
    their_outcome: String,
    announcement: OracleAnnouncement,
    public_key: String,
}

#[tauri::command]
pub async fn create_offer(
    state: State<'_, Arc<DdkState>>,
    request: CreateOffer,
) -> Result<String, String> {
    let mine = request.my_outcome.clone();
    let theirs = request.their_outcome.clone();
    let payouts = vec![
        EnumerationPayout {
            outcome: mine.clone(),
            payout: Payout {
                offer: 2_000_000,
                accept: 0,
            },
        },
        EnumerationPayout {
            outcome: theirs.clone(),
            payout: Payout {
                offer: 0,
                accept: 2_000_000,
            },
        },
    ];

    let input = ddk_payouts::enumeration::create_contract_input(
        payouts,
        1_000_000,
        1_000_000,
        1,
        request.announcement.oracle_public_key.to_string(),
        request.announcement.oracle_event.event_id,
    );
    let counter_party = ddk::bitcoin::secp256k1::PublicKey::from_str(&request.public_key)
        .map_err(|_| "Malformed public key.")?;
    let offer = state
        .ddk
        .manager
        .send_offer(&input, counter_party)
        .await
        .map_err(|e| format!("Could not offer contract. error={}", e.to_string()))?;

    let offer_bytes = serde_json::to_vec(&offer).map_err(|_| "Malformed offer".to_string())?;
    let offer_hex = hex::encode(&offer_bytes);

    Ok(offer_hex)
}

#[tauri::command]
pub async fn accept_offer(
    state: State<'_, Arc<DdkState>>,
    offer: String,
    public_key: String,
) -> Result<String, String> {
    let counter_party = ddk::bitcoin::secp256k1::PublicKey::from_str(&public_key)
        .map_err(|_| "Malformed public key.")?;
    let offer_bytes = hex::decode(offer)
        .map_err(|e| format!("Could not hex decode offer. error={}", e.to_string()))?;
    let offer: OfferDlc =
        serde_json::from_slice(&offer_bytes).map_err(|_| "Malformed offer".to_string())?;
    state
        .ddk
        .manager
        .on_dlc_message(&Message::Offer(offer.clone()), counter_party)
        .map_err(|e| format!("Could not accept offered contract. error={}", e.to_string()))?;

    let accept = state
        .ddk
        .accept_dlc_offer(offer.temporary_contract_id)
        .map_err(|e| format!("Could not accept contract. error={}", e.to_string()))?;

    let accept_bytes =
        serde_json::to_vec(&accept.2).map_err(|_| "converting accept to bytes".to_string())?;
    let accept_hex = hex::encode(accept_bytes);
    Ok(accept_hex)
}

#[tauri::command]
pub async fn sign_and_broadcast_offer(
    state: State<'_, Arc<DdkState>>,
    sign: String,
    public_key: String,
) -> Result<String, String> {
    let counter_party = ddk::bitcoin::secp256k1::PublicKey::from_str(&public_key)
        .map_err(|_| "Malformed public key.")?;
    let accept_bytes =
        hex::decode(sign).map_err(|_| "Could not convert sign message to bytes".to_string())?;
    let accept_dlc: AcceptDlc =
        serde_json::from_slice(&accept_bytes).map_err(|_| "Malformed offer".to_string())?;
    let contract = state
        .ddk
        .manager
        .on_dlc_message(&Message::Accept(accept_dlc), counter_party)
        .map_err(|e| format!("Could not accept contract. error={}", e.to_string()))?;

    println!("Received contract");
    if let Some(msg) = contract {
        match msg {
            Message::Sign(s) => {
                let sign_bytes = serde_json::to_vec(&s).unwrap();
                let sign_hex = hex::encode(&sign_bytes);
                Ok(sign_hex)
            }
            _ => Ok("No contract".to_string()),
        }
    } else {
        return Ok("No contract.".to_string());
    }
}

#[tauri::command]
pub async fn new_address(state: State<'_, Arc<DdkState>>) -> Result<String, String> {
    Ok(state
        .ddk
        .wallet
        .new_external_address()
        .map_err(|_| format!("Could not get address"))?
        .address
        .to_string())
}

#[derive(Deserialize, Serialize)]
pub struct WalletBalance {
    pub confirmed: u64,
    pub unconfirmed: u64,
}

#[tauri::command]
pub fn sync_and_get_balance(state: State<'_, Arc<DdkState>>) -> Result<WalletBalance, String> {
    state
        .ddk
        .wallet
        .sync()
        .map_err(|e| format!("Could not sync wallet. error={}", e.to_string()))?;

    let balance = state
        .ddk
        .wallet
        .get_balance()
        .map_err(|e| format!("Could not get balance. error={}", e.to_string()))?;

    Ok(WalletBalance {
        confirmed: balance.confirmed.to_sat(),
        unconfirmed: balance.trusted_pending.to_sat() + balance.untrusted_pending.to_sat(),
    })
}

#[tauri::command]
pub fn pubkey(state: State<'_, Arc<DdkState>>) -> Result<String, String> {
    Ok(state.ddk.transport.public_key().to_string())
}

#[derive(Serialize, Deserialize, Default)]
pub struct DdkContract {
    contract_id: Option<String>,
    pnl: Option<i64>,
    funding_txid: Option<String>,
    state: String,
}

#[tauri::command]
pub async fn get_contract(state: State<'_, Arc<DdkState>>) -> Result<DdkContract, String> {
    let contract = state
        .ddk
        .storage
        .get_contracts()
        .map_err(|_| format!("Could not get contract."))?;

    let workshop_contract = match contract.first() {
        Some(c) => match c.to_owned() {
            Contract::Offered(o) => DdkContract {
                contract_id: Some(hex::encode(o.id)),
                pnl: None,
                funding_txid: None,
                state: "offered".to_string(),
            },
            Contract::Accepted(a) => DdkContract {
                contract_id: Some(hex::encode(a.get_contract_id())),
                pnl: None,
                funding_txid: None,
                state: "accepted".to_string(),
            },
            Contract::Confirmed(c) => DdkContract {
                contract_id: Some(hex::encode(c.accepted_contract.get_contract_id())),
                pnl: None,
                funding_txid: Some(
                    c.accepted_contract
                        .dlc_transactions
                        .fund
                        .compute_txid()
                        .to_string(),
                ),
                state: "confirmed".to_string(),
            },
            Contract::PreClosed(p) => DdkContract {
                contract_id: Some(hex::encode(
                    p.signed_contract.accepted_contract.get_contract_id(),
                )),
                pnl: None,
                funding_txid: Some(p.signed_cet.compute_txid().to_string()),
                state: "pre-closed".to_string(),
            },
            Contract::Closed(c) => DdkContract {
                contract_id: Some(hex::encode(c.contract_id)),
                pnl: Some(c.pnl),
                funding_txid: Some(c.signed_cet.unwrap().compute_txid().to_string()),
                state: "closed".to_string(),
            },
            _ => DdkContract::default(),
        },
        None => DdkContract::default(),
    };
    Ok(workshop_contract)
}
