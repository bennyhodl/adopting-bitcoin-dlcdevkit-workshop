use std::sync::Arc;

use ddk::{
    oracle::KormirOracleClient, storage::SledStorage, transport::lightning::LightningTransport,
    DlcDevKit,
};

pub struct State {
    pub ddk: DlcDevKit<LightningTransport, SledStorage, KormirOracleClient>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run(ddk: Arc<State>) {
    let ddk_clone = ddk.clone();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(ddk.clone())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
