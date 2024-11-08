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
      <p className="pb-8">You should have Bitcoin deposited to address: {address}</p>
      <p>{JSON.stringify(context.balance)}</p>
      <a href="https://mutinynet.com" target="_blank">Check your transaction.</a>
    </div>
  )
}