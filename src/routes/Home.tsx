'use client'

import { useState } from 'react'
import { StepNavigation } from '@/components/step-navigation'
import { Progress } from '@/components/ui/progress'
import { Welcome } from './walkthrough/Welcome'
import { FundWallet } from './walkthrough/FundWallet'
import { Button } from '@/components/ui/button'
import { OracleAnnouncementComponent, SignOracleAnnouncementComponent } from './walkthrough/OracleAnnouncement'
import { useDlcDevKit } from '@/hooks/use-dlcdevkit'
import { CreateOfferComponent } from './walkthrough/CreateOffer'
import { SignContract } from './walkthrough/SignContract'
import { AcceptContract } from './walkthrough/AcceptOffer'
import { CloseContract } from './walkthrough/CloseContract'
import ModalDialog from '@/components/Modal'
import { SendBitcoinBack } from './walkthrough/SendBitcoinBack'
import { Broadcast } from './walkthrough/Broadcast'
interface StepContentProps {
  title: string
  content: string
  component: React.ReactNode
}

export function StepContent({ title, content, component }: StepContentProps) {
  return (
    <div className='flex flex-col justify-start text-center py-8'>
      <div>
        <h1 className='text-2xl'>{title}</h1>
        <p>{content}</p>
      </div>
      {component}
    </div>
  )
}

interface Step {
  title: string
  content: string
  component: React.ReactNode
}

const baseSteps: Step[] = [
  { title: 'Today we are going to do a demo of DlcDevKit.', content: '', component: <Welcome /> },
  { title: 'Let\'s fund your wallet', content: '', component: <FundWallet /> },
]

const offererSteps: Step[] = [
  { title: 'Create your bet', content: 'Create the oracle announcement for your bet to be signed later to close the contract.', component: <OracleAnnouncementComponent /> },
  { title: 'Offer a contract', content: 'Pick your winner and create the betting contract. This step creates the DLC offer to be accepted by a counterparty.', component: <CreateOfferComponent /> },
  { title: 'Wait for your friend to accept the contract', content: 'Input your counterparties accept message.', component: <SignContract /> }
]

const acceptorSteps: Step[] = [
  { title: 'Accept the handshake bet', content: 'Input the offer contract from your friend to accept the contract.', component: <AcceptContract /> },
  { title: 'Broadcast the contract.', content: 'Once your counterparty has signed the contract, you can now broadcast the transaction.', component: <Broadcast /> },
]

const finalSteps: Step[] = [
  { title: 'Select the bet outcome', content: '', component: <SignOracleAnnouncementComponent /> },
  { title: 'Wait for the contract to expire to close the contract.', content: 'The contract has a contract maturity. When the maturity expires, the contract is then closed with the contract outcome.', component: <CloseContract /> },
  { title: 'Send the bitcoin back', content: 'Complete the transaction.', component: <SendBitcoinBack /> }
]

const getSteps = (isOfferer: boolean | null) => {
  if (isOfferer === null) {
    return baseSteps
  }
  return [
    ...baseSteps,
    ...(isOfferer ? offererSteps : acceptorSteps),
    ...finalSteps
  ]
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const { isOfferer, setIsOfferer } = useDlcDevKit()
  const steps = getSteps(isOfferer)

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const ChooseAdventure = () => {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className='text-2xl py-8'>Will you be offering a contract or accepting a contract?</p>
        <div className='w-40 flex flex-row justify-between'>
          <Button onClick={() => setIsOfferer(true)}>Offer</Button>
          <Button onClick={() => setIsOfferer(false)}>Accept</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col items-center justify-between h-screen">
        <header className="p-4 bg-primary text-primary-foreground w-screen flex flex-col justify-between px-8">
          <div className='flex flex-row w-full justify-between'>
            <h1 className="text-2xl font-bold">Handshake Bets with DlcDevKit</h1>
            {/* <Button onClick={async () => await context.getBalance()} className='bg-white text-black hover:bg-gray-400'>Sync Wallet</Button> */}
            <ModalDialog />
          </div>
        </header>
        <div className="w-full max-w-4xl h-screen">
          {isOfferer === null ? <ChooseAdventure /> :
            <StepContent
              title={steps[currentStep].title}
              content={steps[currentStep].content}
              component={steps[currentStep].component}
            />}
        </div>
        {isOfferer !== null &&
          <div>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="mb-8" />
            <footer className="p-4">
              <div className="w-full max-w-4xl mx-auto">
                <StepNavigation
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  isFirstStep={currentStep === 0}
                  isLastStep={currentStep === steps.length - 1}
                />
              </div>
            </footer>
          </div>}
      </main>
    </div>
  )
}