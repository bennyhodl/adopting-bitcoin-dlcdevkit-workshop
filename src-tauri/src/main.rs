// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::str::FromStr;
use std::sync::Arc;

use ddk::bitcoin::key::Secp256k1;
use ddk::builder::Builder;
use ddk::oracle::kormir::KormirOracleClient;
use ddk::storage::memory::MemoryStorage;
use ddk::transport::memory::MemoryTransport;
use ddk_app_lib::State;
use tracing::level_filters::LevelFilter;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let level = LevelFilter::from_str("info").unwrap_or(LevelFilter::INFO);
    let subscriber = tracing_subscriber::fmt()
        .with_line_number(true)
        .with_max_level(level)
        .finish();
    tracing::subscriber::set_global_default(subscriber).unwrap();
    let secp = Secp256k1::new();
    let seed = [1u8; 32];

    let transport = Arc::new(MemoryTransport::new(&secp));
    let storage = Arc::new(MemoryStorage::new());
    let oracle = Arc::new(KormirOracleClient::new("https://kormir.dlcdevkit.com").await?);

    let app = Builder::new()
        .set_name("ddk-app")
        .set_seed_bytes(seed)
        .set_esplora_host("http://127.0.0.1:30000".to_string())
        .set_transport(transport.clone())
        .set_storage(storage.clone())
        .set_oracle(oracle.clone())
        .set_network(ddk::bitcoin::Network::Regtest)
        .finish()?;

    let ddk = Arc::new(State { ddk: app });

    ddk.ddk.start()?;

    ddk_app_lib::run(ddk);
    Ok(())
}
