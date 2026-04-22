'use client';

import { useSolarStore } from '@/lib/store';
import StepBilan from '@/components/wizard/steps/StepBilan';
import StepLocalisation from '@/components/wizard/steps/StepLocalisation';
import StepEquipements from '@/components/wizard/steps/StepEquipements';
import StepCalculs from '@/components/wizard/steps/StepCalculs';
import StepVisualisations from '@/components/wizard/steps/StepVisualisations';
import StepOffre from '@/components/wizard/steps/StepOffre';

export default function WizardPage() {
  const { currentStep } = useSolarStore();

  return (
    <div className="animate-slide-up">
      {currentStep === 0 && <StepBilan />}
      {currentStep === 1 && <StepLocalisation />}
      {currentStep === 2 && <StepEquipements />}
      {currentStep === 3 && <StepCalculs />}
      {currentStep === 4 && <StepVisualisations />}
      {currentStep === 5 && <StepOffre />}
    </div>
  );
}
