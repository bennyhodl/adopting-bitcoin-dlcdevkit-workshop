import Countdown from "@/components/Countdown"
import { useDlcDevKit } from "@/hooks/use-dlcdevkit"
import Confetti from 'react-confetti'

export const CloseContract = () => {
  const { contract, balance, oracleAnnouncement } = useDlcDevKit()
  if (!contract.pnl) {
    return (
      <div className="flex flex-col py-4 text-xl text-start">
        <p className="pb-8"></p>
        <div className="flex flex-col items-center justify-center">
          <p>You can check the transaction <a href={`https://mutinynet.com/tx/${contract.fundingTxid}`} target="_blank">here.</a></p>
          <p className="pt-8">Countdown to contract maturity</p>
          <Countdown targetTimestamp={oracleAnnouncement?.ann.oracleEvent.eventMaturityEpoch ?? 0} />
        </div>
      </div>
    )
  }

  if (contract.pnl > 0) {
    return (
      <>
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        <div>
          <p className="bold text-3xl pt-14">Congratulations! You won your bet!</p>
          <p>Your wallet balance: {balance.confirmed} sats</p>
        </div>
      </>
    )
  }
  return (
    <>
      <div>
        <p>You lost your bet...</p>
        <p>Your wallet balance: {balance.confirmed} sats</p>
      </div>
    </>
  )
}