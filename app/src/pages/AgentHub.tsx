import { useGameState } from '@/hooks/useGameState';
import WelcomeSection from '@/components/WelcomeSection';
import ProfilePreview from '@/components/ProfilePreview';
import QuestSystem from '@/components/quest/QuestSystem';
import LevelProgress from '@/components/LevelProgress';
import DailyRecommendations from '@/components/DailyRecommendations';
import QuickAccess from '@/components/QuickAccess';
import ActivityTimeline from '@/components/ActivityTimeline';
import MyPosts from '@/components/MyPosts';
import BrandDNAExtractor from '@/components/BrandDNAExtractor';
import ContentBank from '@/components/ContentBank';
import FanEvolver from '@/components/FanEvolver';

/**
 * AgentHub - Main dashboard (Agent Central Hub)
 *
 * Complete implementation including:
 * - Welcome section with greeting, broker avatar, energy display
 * - Personal profile preview (Xiaohongshu/Douyin style)
 * - Quest system with 3 tabs (main/daily/easter egg quests)
 * - Level progress with hexagonal badge and XP bar
 * - Daily recommendations (10 trending topics)
 * - Quick access shortcuts to main features
 * - Recent activity timeline
 *
 * All gamification data stored in localStorage:
 * - pcg_xp, pcg_coins, pcg_level, pcg_energy, pcg_quests
 * - pcg_activities
 *
 * TODO: Integrate LLM API for AI-powered recommendations
 * TODO: Connect to real broker chat system via WebSocket/SSE
 * TODO: Add level-up animation overlay with confetti
 * TODO: Implement coin-fly animation to navbar on quest claim
 */
export default function AgentHub() {
  const {
    username,
    brokerName,
    brokerType,
    xp,
    level,
    energy,
    maxEnergy,
    quests,
    activities,
    xpProgress,
    currentLevelBaseXp,
    nextLevelXp,
    claimQuest,
    completeQuest,
  } = useGameState();

  return (
    <div className="min-h-[100dvh] pt-[72px] pb-12 bg-void">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* Welcome Section - full width */}
        <div className="mb-6">
          <WelcomeSection
            username={username}
            brokerName={brokerName}
            brokerType={brokerType}
            energy={energy}
            maxEnergy={maxEnergy}
          />
        </div>

        {/* Main 3-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Quest System + Level Progress (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Level & Progress Card */}
            <LevelProgress
              level={level}
              xp={xp}
              xpProgress={xpProgress}
              currentLevelBaseXp={currentLevelBaseXp}
              nextLevelXp={nextLevelXp}
            />

            {/* Quest System */}
            <QuestSystem
              quests={quests}
              onClaim={claimQuest}
              onComplete={completeQuest}
            />

            {/* Quick Access - shown on left on desktop */}
            <div className="hidden lg:block">
              <QuickAccess />
            </div>
          </div>

          {/* CENTER COLUMN: Activity + Recommendations (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-6">
            {/* My Published Posts */}
            <MyPosts />

            {/* Brand DNA Extractor */}
            <BrandDNAExtractor />

            {/* Daily Recommendations */}
            <DailyRecommendations />

            {/* Recent Activity */}
            <ActivityTimeline activities={activities} />

            {/* Quick Access - shown in center on mobile/tablet */}
            <div className="lg:hidden">
              <QuickAccess />
            </div>
          </div>

          {/* RIGHT COLUMN: Profile + ContentBank + FanEvolver (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-6">
            <ProfilePreview username={username} />
            <ContentBank />
            <FanEvolver />
          </div>
        </div>
      </div>
    </div>
  );
}
