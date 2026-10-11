import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, SkipForward } from 'lucide-react';

/**
 * InfoBubble - Interactive question bubble for onboarding dialog
 *
 * Features:
 * - Pops out from broker with scale + bounce animation
 * - Multiple input types: text, number, single-select pills, multi-select pills, grid-select
 * - Breathing glow border animation
 * - Option stagger animation on appear
 * - Shrink + disappear on answer, then callback for next question
 * - Skip button for optional questions
 *
 * TODO: Connect to LLM API for dynamic question generation
 *   - File: src/services/onboardingLLM.ts
 *   - Call generateNextQuestion(context) to get personalized follow-ups
 */

export type BubbleType = 'text' | 'number' | 'single-select' | 'multi-select' | 'grid-select';

export interface BubbleOption {
  label: string;
  value: string;
  icon?: string; // lucide icon name or emoji
  description?: string;
}

export interface InfoBubbleData {
  id: string;
  question: string;
  subtext?: string;
  type: BubbleType;
  options?: BubbleOption[];
  placeholder?: string;
  required?: boolean;
  gridCols?: number; // for grid-select layout
}

interface InfoBubbleProps {
  data: InfoBubbleData;
  brokerGender: 'male' | 'female';
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onSkip?: (questionId: string) => void;
  visible: boolean;
}

const BROKER_COLORS = {
  male: {
    primary: '#00D4FF',
    glow: 'rgba(0, 212, 255, 0.3)',
    bg: 'rgba(0, 212, 255, 0.08)',
    border: 'rgba(0, 212, 255, 0.3)',
  },
  female: {
    primary: '#FF6B9D',
    glow: 'rgba(255, 107, 157, 0.3)',
    bg: 'rgba(255, 107, 157, 0.08)',
    border: 'rgba(255, 107, 157, 0.3)',
  },
};

export default function InfoBubble({ data, brokerGender, onAnswer, onSkip, visible }: InfoBubbleProps) {
  const [textValue, setTextValue] = useState('');
  const [selectedSingle, setSelectedSingle] = useState<string>('');
  const [selectedMulti, setSelectedMulti] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const colors = BROKER_COLORS[brokerGender];

  // Reset state when bubble changes
  useEffect(() => {
    setTextValue('');
    setSelectedSingle('');
    setSelectedMulti([]);
    setIsSubmitting(false);
  }, [data.id]);

  // Auto-focus input for text type
  useEffect(() => {
    if (visible && (data.type === 'text' || data.type === 'number') && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 400);
    }
  }, [visible, data.type]);

  const handleSubmitText = () => {
    if (!textValue.trim() && data.required) return;
    setIsSubmitting(true);
    setTimeout(() => onAnswer(data.id, textValue.trim()), 300);
  };

  const handleSelectSingle = (value: string) => {
    setSelectedSingle(value);
    setIsSubmitting(true);
    setTimeout(() => onAnswer(data.id, value), 300);
  };

  const handleToggleMulti = (value: string) => {
    setSelectedMulti((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmitMulti = () => {
    if (selectedMulti.length === 0 && data.required) return;
    setIsSubmitting(true);
    setTimeout(() => onAnswer(data.id, selectedMulti), 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (data.type === 'text' || data.type === 'number') {
        handleSubmitText();
      }
    }
  };

  const isTextType = data.type === 'text' || data.type === 'number';
  const canSubmit = isTextType
    ? textValue.trim().length > 0 || !data.required
    : data.type === 'single-select'
      ? selectedSingle !== ''
      : data.type === 'multi-select'
        ? selectedMulti.length > 0 || !data.required
        : false;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={data.id}
          className="w-full max-w-[560px] mx-auto"
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={isSubmitting ? { scale: 0, opacity: 0, y: -10 } : { scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -10 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
          }}
          style={{ transformOrigin: 'bottom center' }}
        >
          {/* Bubble triangle pointer */}
          <div className="flex justify-center mb-[-1px]">
            <div
              className="w-4 h-4 rotate-45"
              style={{
                background: colors.bg,
                borderLeft: `1px solid ${colors.border}`,
                borderTop: `1px solid ${colors.border}`,
              }}
            />
          </div>

          {/* Bubble body */}
          <motion.div
            className="relative rounded-2xl p-5 md:p-6"
            style={{
              background: 'var(--void-light)',
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}`,
            }}
            animate={{
              boxShadow: [
                `0 0 15px ${colors.glow}, inset 0 0 10px ${colors.glow}`,
                `0 0 30px ${colors.glow}, inset 0 0 20px ${colors.glow}`,
                `0 0 15px ${colors.glow}, inset 0 0 10px ${colors.glow}`,
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Question text */}
            <p className="text-text-primary text-base md:text-lg font-medium mb-1">
              {data.question}
            </p>
            {data.subtext && (
              <p className="text-text-secondary text-sm mb-4">{data.subtext}</p>
            )}

            {/* Text / Number input */}
            {isTextType && (
              <div className="mt-4">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={data.type === 'number' ? 'number' : 'text'}
                    value={textValue}
                    onChange={(e) => setTextValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={data.placeholder || '请输入...'}
                    className="w-full bg-transparent border-b-2 border-transparent focus:border-current outline-none py-2 pr-10 text-text-primary placeholder:text-text-muted transition-colors"
                    style={{
                      borderBottomColor: textValue ? colors.primary : undefined,
                      caretColor: colors.primary,
                    }}
                  />
                  <button
                    onClick={handleSubmitText}
                    disabled={!canSubmit}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all duration-300 disabled:opacity-30"
                    style={{
                      background: canSubmit ? colors.bg : 'transparent',
                      color: colors.primary,
                    }}
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Single select pills */}
            {data.type === 'single-select' && data.options && (
              <div className="flex flex-wrap gap-2 mt-4">
                {data.options.map((option, i) => (
                  <motion.button
                    key={option.value}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border"
                    style={{
                      borderColor: selectedSingle === option.value ? colors.primary : 'rgba(255,255,255,0.1)',
                      background: selectedSingle === option.value ? colors.bg : 'transparent',
                      color: selectedSingle === option.value ? colors.primary : 'var(--text-secondary)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    whileHover={{
                      borderColor: colors.primary,
                      color: colors.primary,
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSingle(option.value)}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Grid select (for MBTI, zodiac) */}
            {data.type === 'grid-select' && data.options && (
              <div
                className="grid gap-2 mt-4"
                style={{ gridTemplateColumns: `repeat(${data.gridCols || 4}, 1fr)` }}
              >
                {data.options.map((option, i) => (
                  <motion.button
                    key={option.value}
                    className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-xl text-center transition-all duration-300 border"
                    style={{
                      borderColor: selectedSingle === option.value ? colors.primary : 'rgba(255,255,255,0.08)',
                      background: selectedSingle === option.value ? colors.bg : 'rgba(255,255,255,0.02)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    whileHover={{
                      borderColor: colors.primary,
                      transform: 'translateY(-2px)',
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectSingle(option.value)}
                  >
                    {option.icon && (
                      <span className="text-lg md:text-xl">{option.icon}</span>
                    )}
                    <span
                      className="text-xs md:text-sm font-medium"
                      style={{
                        color: selectedSingle === option.value ? colors.primary : 'var(--text-primary)',
                      }}
                    >
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="text-[10px] text-text-muted leading-tight">
                        {option.description}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Multi select pills */}
            {data.type === 'multi-select' && data.options && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {data.options.map((option, i) => {
                    const isSelected = selectedMulti.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300 border flex items-center gap-1.5"
                        style={{
                          borderColor: isSelected ? colors.primary : 'rgba(255,255,255,0.1)',
                          background: isSelected ? colors.bg : 'transparent',
                          color: isSelected ? colors.primary : 'var(--text-secondary)',
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        whileHover={{
                          borderColor: colors.primary,
                          color: colors.primary,
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleMulti(option.value)}
                      >
                        {isSelected && <Check size={12} />}
                        {option.icon && <span>{option.icon}</span>}
                        {option.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Confirm button for multi-select */}
                <motion.button
                  className="mt-4 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 mx-auto transition-all duration-300"
                  style={{
                    background: selectedMulti.length > 0 ? colors.primary : 'transparent',
                    color: selectedMulti.length > 0 ? '#0A0A0F' : 'var(--text-muted)',
                    border: `1px solid ${selectedMulti.length > 0 ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                    opacity: selectedMulti.length > 0 ? 1 : 0.5,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: selectedMulti.length > 0 ? 1 : 0.5 }}
                  whileHover={{ scale: selectedMulti.length > 0 ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmitMulti}
                  disabled={selectedMulti.length === 0 && data.required}
                >
                  <Check size={14} />
                  选好了
                </motion.button>
              </div>
            )}

            {/* Skip button */}
            {!data.required && (
              <button
                onClick={() => onSkip?.(data.id)}
                className="mt-3 flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors mx-auto"
              >
                <SkipForward size={12} />
                跳过
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
