mod functions;
pub mod io;

use std::sync::Arc;

use ddk::{
    oracle::kormir::KormirOracleClient, storage::memory::MemoryStorage,
    transport::memory::MemoryTransport, DlcDevKit,
};
use tauri::Manager;
pub struct DdkState {
    pub ddk: DlcDevKit<MemoryTransport, MemoryStorage, KormirOracleClient>,
    pub client: reqwest::Client,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ddk: Arc<DdkState>) {
    let ddk_clone = ddk.clone();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ddk.clone())
        .invoke_handler(tauri::generate_handler![
            functions::create_oracle_announcement,
            functions::sign_oracle_announcement,
            functions::create_offer,
            functions::accept_offer,
            functions::sign_and_broadcast_offer,
            functions::get_contract,
            functions::receive_bitcoin,
            functions::new_address,
            functions::sync_and_get_balance,
            functions::pubkey
        ])
        .setup(move |app| {
            let address = ddk_clone
                .ddk
                .wallet
                .new_external_address()
                .unwrap()
                .address
                .to_string();
            let inner = ddk_clone.clone();
            tauri::async_runtime::spawn(async move {
                inner.ddk.start().expect("no run async");
            });
            app.manage(ddk_clone);
            println!("address {}", address);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
