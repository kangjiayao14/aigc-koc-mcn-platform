import { motion } from 'framer-motion';

/**
 * ProgressIndicator - 4-step progress dots for onboarding
 *
 * Shows the current step in the onboarding flow:
 * 1. Warp tunnel / broker selection
 * 2. Broker introduction
 * 3. Info collection
 * 4. Confirmation
 */

interface ProgressIndicatorProps {
  currentStep: number; // 1-4
}

const STEP_LABELS = ['选择经纪人', '初次见面', '信息收集', '确认入驻'];

export default function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-4 px-6">
      {STEP_LABELS.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        // const isUpcoming = stepNum > currentStep;

        return (
          <div key={stepNum} className="flex items-center gap-2 md:gap-4">
            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className="relative flex items-center justify-center"
                initial={false}
                animate={isCurrent ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
              >
                {/* Glow ring for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: '0 0 10px rgba(0,240,255,0.5), 0 0 20px rgba(0,240,255,0.3)',
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${
                    isCompleted
                      ? 'bg-neon-cyan'
                      : isCurrent
                        ? 'bg-neon-cyan'
                        : 'bg-transparent border border-text-muted'
                  }`}
                />
              </motion.div>
              <span
                className={`text-[10px] md:text-xs whitespace-nowrap transition-colors duration-300 ${
                  isCurrent ? 'text-neon-cyan' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEP_LABELS.length - 1 && (
              <div
                className="w-8 md:w-16 h-px transition-colors duration-500"
                style={{
                  background:
                    isCompleted
                      ? 'var(--neon-cyan)'
                      : 'rgba(74, 74, 96, 0.5)',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
