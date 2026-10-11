import { motion } from 'framer-motion';
import { Heart, Sparkles, Users, FileText } from 'lucide-react';

/**
 * ProfilePreview - 小红书风格的个人主页预览
 *
 * Displays a mock social media profile card showing the user's
 * generated persona based on onboarding answers.
 *
 * Features:
 * - Avatar with neon border
 * - User stats (followers, likes, posts)
 * - Sample post grid
 * - Broker badge
 *
 * TODO: Connect to LLM API for generating personalized bio
 *   - File: src/services/onboardingLLM.ts
 *   - Call generateBio(userProfile) to create catchy profile description
 */

interface ProfilePreviewProps {
  username?: string;
  userProfile?: {
    name: string;
    age: string;
    gender: string;
    mbti: string;
    zodiac: string;
    interests: string[];
    field: string[];
    platforms: string[];
    games: string;
    goals: string[];
  };
  brokerGender?: 'male' | 'female';
  userId?: string;
}

const BROKER_NAME = { male: '凌霄', female: '梦璃' };
const BROKER_AVATAR = { male: '/broker-male.png', female: '/broker-female.png' };
const BROKER_COLOR = { male: '#00D4FF', female: '#FF6B9D' };

const ZODIAC_EMOJI: Record<string, string> = {
  '白羊座': '♈', '金牛座': '♉', '双子座': '♊', '巨蟹座': '♋',
  '狮子座': '♌', '处女座': '♍', '天秤座': '♎', '天蝎座': '♏',
  '射手座': '♐', '摩羯座': '♑', '水瓶座': '♒', '双鱼座': '♓',
};

export default function ProfilePreview({ username, userProfile, brokerGender, userId }: ProfilePreviewProps) {
  // Simple mode: used by AgentHub with just username
  if (username && !userProfile) {
    return (
      <motion.div
        className="w-full max-w-[420px] mx-auto"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--void-light)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="h-24 relative" style={{ background: 'linear-gradient(135deg, rgba(0,240,255,0.13) 0%, #12121A 100%)' }} />
          <div className="px-5 pb-5 -mt-10 relative">
            <div className="w-20 h-20 rounded-full border-2 border-[#00F0FF]/40 overflow-hidden bg-[#0A0A0F] mb-3">
              <img src="/avatar-default.png" alt={username} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-medium text-[#F0F0FF]">{username}</h3>
            <p className="text-xs font-mono text-[#8A8AA0] mb-3">@{username}</p>
            <div className="flex items-center justify-around py-3 border-t border-white/5">
              <div className="text-center"><FileText size={14} className="mx-auto text-[#8A8AA0] mb-1"/><span className="text-xs text-[#F0F0FF]">0</span></div>
              <div className="w-px h-6 bg-white/5" />
              <div className="text-center"><Users size={14} className="mx-auto text-[#8A8AA0] mb-1"/><span className="text-xs text-[#F0F0FF]">23</span></div>
              <div className="w-px h-6 bg-white/5" />
              <div className="text-center"><Heart size={14} className="mx-auto text-[#8A8AA0] mb-1"/><span className="text-xs text-[#F0F0FF]">156</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full mode: used by Onboarding with complete userProfile
  const profile = userProfile!;
  const gender = brokerGender || 'male';
  const id = userId || `${profile.name}_${Math.floor(Math.random() * 10000)}`;

  const generateBio = () => {
    const parts: string[] = [];
    if (profile.mbti) parts.push(`${profile.mbti}`);
    if (profile.zodiac) parts.push(`${ZODIAC_EMOJI[profile.zodiac] || ''}${profile.zodiac}`);
    if (profile.field.length > 0) parts.push(`专注${profile.field[0]}`);
    parts.push('创作者');
    return parts.join(' | ');
  };

  const samplePosts = [
    { image: '/sample-post-cover-1.jpg', title: `我的${profile.interests[0] || '生活'}日记`, likes: 128 },
    { image: '/sample-post-cover-2.jpg', title: `${profile.field[0] || '创作'}分享`, likes: 256 },
    { image: '/sample-post-cover-3.jpg', title: '今日份打卡', likes: 89 },
    { image: '/sample-post-cover-4.jpg', title: '新手入驻~', likes: 432 },
  ];

  return (
    <motion.div
      className="w-full max-w-[420px] mx-auto"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
    >
      {/* Profile Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--void-light)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header / Cover */}
        <div
          className="h-24 relative"
          style={{
            background: `linear-gradient(135deg, ${BROKER_COLOR[gender]}22 0%, #12121A 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)',
            }}
          />
        </div>

        {/* Avatar & Info */}
        <div className="px-5 pb-5 -mt-10 relative">
          {/* Avatar */}
          <motion.div
            className="relative inline-block"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
          >
            <div
              className="w-20 h-20 rounded-full p-0.5"
              style={{
                background: `linear-gradient(135deg, ${BROKER_COLOR[gender]}, #BD00FF)`,
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-void flex items-center justify-center">
                <img
                  src="/avatar-default.png"
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Sparkle badge */}
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: BROKER_COLOR[gender] }}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <Sparkles size={12} className="text-void" />
            </motion.div>
          </motion.div>

          {/* Name & ID */}
          <div className="mt-3">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              {profile.name || '新创客'}
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                style={{
                  background: `${BROKER_COLOR[gender]}22`,
                  color: BROKER_COLOR[gender],
                }}
              >
                @{id}
              </span>
            </h3>
            <p className="text-xs text-text-secondary mt-1">{generateBio()}</p>
          </div>

          {/* Broker badge */}
          <div
            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs w-fit"
            style={{
              background: `${BROKER_COLOR[gender]}15`,
              border: `1px solid ${BROKER_COLOR[gender]}30`,
              color: BROKER_COLOR[gender],
            }}
          >
            <img
              src={BROKER_AVATAR[gender]}
              alt="broker"
              className="w-4 h-4 rounded-full object-cover"
            />
            <span>经纪人 {BROKER_NAME[gender]}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 py-3 border-t border-b border-white/5">
            <div className="text-center flex-1">
              <div className="text-base font-bold text-text-primary flex items-center justify-center gap-1">
                <FileText size={14} className="text-neon-cyan" />
                0
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">笔记</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-base font-bold text-text-primary flex items-center justify-center gap-1">
                <Users size={14} className="text-neon-violet" />
                1
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">粉丝</div>
            </div>
            <div className="text-center flex-1">
              <div className="text-base font-bold text-text-primary flex items-center justify-center gap-1">
                <Heart size={14} className="text-neon-magenta" />
                905
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">获赞</div>
            </div>
          </div>

          {/* Interests tags */}
          {profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {profile.interests.slice(0, 6).map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-text-secondary border border-white/5"
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sample Posts Grid */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {samplePosts.map((post, i) => (
          <motion.div
            key={i}
            className="relative rounded-xl overflow-hidden aspect-square group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[10px] text-white/90 truncate">{post.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Heart size={10} className="text-neon-magenta fill-neon-magenta" />
                <span className="text-[9px] text-white/70">{post.likes}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
