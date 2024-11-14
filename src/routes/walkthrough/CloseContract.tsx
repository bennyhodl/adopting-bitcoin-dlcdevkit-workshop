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
          {/* <div className="flex flex-row pt-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p>Loading...</p>
          </div> */}
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