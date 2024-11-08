use std::{
    str::FromStr,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::DdkState;
use ddk::{
    dlc::{EnumerationPayout, Payout},
    dlc_messages::{
        oracle_msgs::{OracleAnnouncement, OracleAttestation},
        Message, OfferDlc, SignDlc,
    },
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
    let time = SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
    let announcement = state
        .ddk
        .oracle
        .create_event(vec![request.one, request.two], time.as_millis() as u32)
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

#[derive(Deserialize)]
pub struct SignOracleAnnouncement {
    oracle_announcement: OracleAnnouncement,
    outcome: String,
}
#[tauri::command]
pub async fn sign_oracle_announcement(
    state: State<'_, Arc<DdkState>>,
    request: SignOracleAnnouncement,
) -> Result<(OracleAttestation, String), String> {
    let attestation = state
        .ddk
        .oracle
        .sign_event(request.oracle_announcement, request.outcome)
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
    Ok((attestation, attestation_hex))
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
    let offer: OfferDlc =
        serde_json::from_str(&offer).map_err(|_| "Malformed offer".to_string())?;
    let accept = state
        .ddk
        .manager
        .on_dlc_message(&Message::Offer(offer), counter_party)
        .map_err(|e| format!("Could not accept contract. error={}", e.to_string()))?;

    match accept.unwrap() {
        Message::Sign(s) => {
            let sign_bytes = serde_json::to_vec(&s).unwrap();
            let sign_hex = hex::encode(&sign_bytes);
            Ok(sign_hex)
        }
        _ => Err("Not a sign contract.".to_string()),
    }
}

#[tauri::command]
pub async fn sign_and_broadcast_offer(
    state: State<'_, Arc<DdkState>>,
    sign: String,
    public_key: String,
) -> Result<String, String> {
    let counter_party = ddk::bitcoin::secp256k1::PublicKey::from_str(&public_key)
        .map_err(|_| "Malformed public key.")?;
    let sign_dlc: SignDlc =
        serde_json::from_str(&sign).map_err(|_| "Malformed offer".to_string())?;
    let accept = state
        .ddk
        .manager
        .on_dlc_message(&Message::Sign(sign_dlc), counter_party)
        .map_err(|e| format!("Could not accept contract. error={}", e.to_string()))?;

    match accept.unwrap() {
        Message::Sign(s) => {
            let sign_bytes = serde_json::to_vec(&s).unwrap();
            let sign_hex = hex::encode(&sign_bytes);
            Ok(sign_hex)
        }
        _ => Err("Not a sign contract.".to_string()),
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
