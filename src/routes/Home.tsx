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
  { title: 'Welcome', content: '', component: <Welcome /> },
  { title: 'Let\'s fund a wallet', content: 'Getting some Bitcoin from the mutiny faucet.', component: <FundWallet /> },
]

const offererSteps: Step[] = [
  { title: 'Create an oracle announcement', content: 'Create the oracle announcement for your bet.', component: <OracleAnnouncementComponent /> },
  { title: 'Offer a contract', content: 'Create and offer the contract to your counterparty.', component: <CreateOfferComponent /> },
  { title: 'Wait for signature', content: 'Wait for your counterparty to sign the contract.', component: <SignContract /> }
]

const acceptorSteps: Step[] = [
  { title: 'Accept your contract', content: 'Get the offer text from your friend', component: <AcceptContract /> },
]

const finalSteps: Step[] = [
  { title: 'Oracle Attestation', content: 'Wait for the oracle attestation.', component: <SignOracleAnnouncementComponent /> },
  { title: 'Wait for it to close', content: 'Wait for the contract to close.', component: <Welcome /> },
  { title: 'Send the bitcoin back', content: 'Complete the transaction.', component: <Welcome /> }
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
  const context = useDlcDevKit()

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
        <header className="p-4 bg-primary text-primary-foreground w-screen flex flex-row justify-between px-8">
          <h1 className="text-2xl font-bold">Handshake Bets with DlcDevK</h1>
          <div className='flex flex-row items-center text-end'>
            <div className='flex flex-col'>
              <p className='text-white pr-4'>Balance: {JSON.stringify(context.balance)}</p>
              <p className='text-white pr-4'>Pubkey: {context.publicKey}</p>
            </div>
            <Button onClick={async () => await context.getBalance()} className='bg-white text-black hover:bg-gray-400'>Sync Wallet</Button>
            <Button onClick={async () => await context.getContract()} className='bg-white text-black hover:bg-gray-400'>Get Contract</Button>
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