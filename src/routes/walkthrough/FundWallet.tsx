import { useDlcDevKit } from "@/hooks/use-dlcdevkit"

export const FundWallet = () => {
  const { address, balance } = useDlcDevKit()
  return (
    <div className="flex flex-col py-4 text-xl">
      <p>Deposit Bitcoin to this address on <a href="https://faucet.mutinynet.com" target="_blank">Mutiny Net</a></p>
      <p className="bold text-2xl pb-8">{address}</p>
      <p>Confirmed balance: {balance.confirmed}</p>
      <p>Unconfirmed balance: {balance.unconfirmed}</p>
    </div>
  )
}