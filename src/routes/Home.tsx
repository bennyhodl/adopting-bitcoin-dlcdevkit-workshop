'use client'

import { useState } from 'react'
// import { StepContent } from '@/components/step-content'
import { StepNavigation } from '@/components/step-navigation'
import { Progress } from '@/components/ui/progress'
import { Welcome } from './walkthrough/Welcome'
import { FundWallet } from './walkthrough/FundWallet'
import { Button } from '@/components/ui/button'
import { syncAndGetBalance, WalletBalance } from '@/lib/functions'
import { OracleAnnouncementComponent } from './walkthrough/OracleAnnouncement'
import { useDlcDevKit } from '@/hooks/use-dlcdevkit'
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
  { title: 'Welcome', content: 'Content!', component: <Welcome /> },
  { title: 'Let\'s fund a wallet', content: 'Getting some Bitcoin from the mutiny faucet.', component: <FundWallet /> },
]

const offererSteps: Step[] = [
  { title: 'Create an oracle announcement', content: 'Create the oracle announcement for your bet.', component: <OracleAnnouncementComponent /> },
  { title: 'Offer a contract', content: 'Create and offer the contract to your counterparty.', component: <Welcome /> },
  { title: 'Wait for signature', content: 'Wait for your counterparty to sign the contract.', component: <Welcome /> }
]

const acceptorSteps: Step[] = [
  { title: 'Wait for oracle announcement', content: 'Wait for the offerer to create the oracle announcement.', component: <Welcome /> },
  { title: 'Accept the contract', content: 'Review and accept the contract from the offerer.', component: <Welcome /> },
  { title: 'Sign the contract', content: 'Sign the accepted contract.', component: <Welcome /> }
]

const finalSteps: Step[] = [
  { title: 'Oracle Attestation', content: 'Wait for the oracle attestation.', component: <Welcome /> },
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
  const [isOfferer, setIsOfferer] = useState<boolean | null>(null)
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
          <div className='flex flex-row items-center'>
            <p className='text-white pr-4'>{JSON.stringify(context.balance)}</p>
            <Button onClick={async () => await context.getBalance()} className='bg-white text-black hover:bg-gray-400'>Sync Wallet</Button>
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