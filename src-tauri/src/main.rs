// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use std::str::FromStr;
use std::sync::Arc;

use clap::Parser;
use ddk::bitcoin::key::Secp256k1;
use ddk::builder::Builder;
use ddk::oracle::kormir::KormirOracleClient;
use ddk::storage::memory::MemoryStorage;
use ddk::transport::memory::MemoryTransport;
use ddk_app_lib::io::xprv_from_path;
use ddk_app_lib::DdkState;
use tracing::level_filters::LevelFilter;

#[derive(Parser)]
struct Cli {
    #[arg(short, long)]
    name: Option<String>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let opts = Cli::parse();
    let level = LevelFilter::from_str("info").unwrap_or(LevelFilter::INFO);
    let subscriber = tracing_subscriber::fmt()
        .with_line_number(true)
        .with_max_level(level)
        .finish();
    tracing::subscriber::set_global_default(subscriber).unwrap();
    let dir = homedir::my_home()
        .unwrap()
        .unwrap()
        .join("dlcdevkit")
        .join("workshop");
    let secp = Secp256k1::new();
    std::fs::create_dir_all(&dir).unwrap();
    let seed = xprv_from_path(dir, ddk::bitcoin::Network::Regtest).unwrap();

    let transport = Arc::new(MemoryTransport::new(&secp));
    let storage = Arc::new(MemoryStorage::new());
    let oracle = Arc::new(
        KormirOracleClient::new("https://kormir.dlcdevkit.com")
            .await
            .unwrap(),
    );

    let ddk = Builder::new()
        .set_name("ddk-tester")
        .set_seed_bytes(seed.private_key.secret_bytes())
        .set_esplora_host("https://mutinynet.com/api".to_string())
        .set_transport(transport.clone())
        .set_storage(storage.clone())
        .set_oracle(oracle.clone())
        .set_network(ddk::bitcoin::Network::Signet)
        .finish()?;

    let client = reqwest::Client::new();

    let dlcdevkit = Arc::new(DdkState { ddk, client });

    ddk_app_lib::run(dlcdevkit);
    Ok(())
}
