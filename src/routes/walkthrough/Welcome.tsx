export const Welcome = () => {

  return (
    <div className="flex flex-col p-4 text-xl text-start">
      <a className="pb-8 text-center" href="https://bennyb.dev/blog/dlcdevkit" target="_blank">You can read more about DlcDevKit on my blog.</a>
      <p>1. Find a friend that you would like to do a bet with. You are going to make a "handshake" bet. Could be paper airplanes or rock, paper, scissors.</p>
      <br />
      <p>2. First you will deposit MutinyNet coins to your wallet.</p>
      <br />
      <p>3. You are going to choose whether you are going to offer the contract or accept the contract from your friend.</p>
      <br />
      <p>4. The offerer will create the Oracle Announcement with the bet you made.</p>
      <br />
      <p>5. The offerer will pick which outcome they want to win. After they create the offer, you will send the hex string to the accepting party.</p>
      <br />
      <p>5. The acceptor will input the "offer" hex string to "accept" the contract. This will return the "sign" message.</p>
      <br />
      <p>6. The offerer will input the "sign" hex string to broadcast the DLC transaction. The contract is now ready to be signed with the outcome.</p>
      <br />
      <p>7. Perform your handshake bet with your friend.</p>
      <br />
      <p>8. The offerer picks who won the bet which signs the oracle announcement.</p>
      <br />
      <p>9. Wait for the contract to close!</p>
    </div>
  )
}