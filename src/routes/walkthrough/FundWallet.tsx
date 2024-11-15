import { useEffect, useState } from "react"
import { newAddress } from "@/lib/functions"
import { useDlcDevKit } from "@/hooks/use-dlcdevkit"


export const FundWallet = () => {
  const [address, setAddress] = useState("")
  const context = useDlcDevKit()

  const getBitcoin = async () => {
    const address = await newAddress()
    setAddress(address)
  }

  useEffect(() => {
    getBitcoin()
  }, [])
  return (
    <div className="flex flex-col py-4 text-xl">
      <p>Deposit Bitcoin to this address on <a href="https://faucet.mutinynet.com">Mutiny Net</a></p>
      <p className="bold text-2xl pb-8">{address}</p>
      <p>Confirmed balance: {context.balance.confirmed}</p>
      <p>Unconfirmed balance: {context.balance.unconfirmed}</p>
    </div>
  )
}