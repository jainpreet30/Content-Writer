'use client';

import React from 'react';
import { useWriterStore } from '@/store/useWriterStore';
import WizardLayout from '@/components/WizardLayout';

// Import all steps
import Step0Research from '@/components/steps/Step0Research';
import Step1Outline from '@/components/steps/Step1Outline';
import Step2WordCount from '@/components/steps/Step2WordCount';
import Step3Content from '@/components/steps/Step3Content';
import Step4Entities from '@/components/steps/Step4Entities';
import Step5NGrams from '@/components/steps/Step5NGrams';
import Step6NLP from '@/components/steps/Step6NLP';
import Step7SkipGrams from '@/components/steps/Step7SkipGrams';
import Step8AutoSuggest from '@/components/steps/Step8AutoSuggest';
import Step9Grammar from '@/components/steps/Step9Grammar';
import Step10Rules from '@/components/steps/Step10Rules';
import Step11Instructions from '@/components/steps/Step11Instructions';
import Step12Prompt from '@/components/steps/Step12Prompt';
import Step13Editor from '@/components/steps/Step13Editor';

import AutopilotWriter from '@/components/AutopilotWriter';
import SavedArticles from '@/components/SavedArticles';

export default function Home() {
  const { currentStep, appMode, activeView } = useWriterStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0c16] text-[#f3f4f6] flex flex-col font-sans justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const renderStep = () => {
    // If in Autopilot mode and not yet at the Content Editor (step 13)
    if (appMode === 'autopilot' && currentStep < 13) {
      return <AutopilotWriter />;
    }

    switch (currentStep) {
      case 0:
        return <Step0Research />;
      case 1:
        return <Step1Outline />;
      case 2:
        return <Step2WordCount />;
      case 3:
        return <Step3Content />;
      case 4:
        return <Step4Entities />;
      case 5:
        return <Step5NGrams />;
      case 6:
        return <Step6NLP />;
      case 7:
        return <Step7SkipGrams />;
      case 8:
        return <Step8AutoSuggest />;
      case 9:
        return <Step9Grammar />;
      case 10:
        return <Step10Rules />;
      case 11:
        return <Step11Instructions />;
      case 12:
        return <Step12Prompt />;
      case 13:
        return <Step13Editor />;
      default:
        return <Step0Research />;
    }
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <SavedArticles />;
    }
    return renderStep();
  };

  return <WizardLayout>{renderContent()}</WizardLayout>;
}

