import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  ThumbsUp,
  HelpCircle,
  AlertTriangle,
  Laugh,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { simulateComments, type SimulatedComment } from '@/services/aiMock';

/**
 * CommentRehearsal - 评论区预演
 *
 * 核心功能：
 * - 输入即将发布的内容
 * - AI模拟10条粉丝评论（正面/质疑/提问/调侃）
 * - 每条评论显示类型标签+内容+AI建议回复
 * - 人设一致性检查（绿色勾）
 * - 互动率预测
 * - 优化回复话术按钮（重新生成高情商回复）
 */

interface CommentRehearsalProps {
  content?: string;
}

type CommentType = 'positive' | 'question' | 'challenge' | 'joke';

const TYPE_CONFIG: Record<CommentType, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  positive: { label: '正面', color: '#39FF14', icon: <ThumbsUp size={12} />, bg: 'rgba(57,255,20,0.1)' },
  question: { label: '提问', color: '#00F0FF', icon: <HelpCircle size={12} />, bg: 'rgba(0,240,255,0.1)' },
  challenge: { label: '质疑', color: '#FF2A6D', icon: <AlertTriangle size={12} />, bg: 'rgba(255,42,109,0.1)' },
  joke: { label: '调侃', color: '#FFD700', icon: <Laugh size={12} />, bg: 'rgba(255,215,0,0.1)' },
};

const ENHANCED_REPLIES: Record<CommentType, string[]> = {
  positive: [
    '太开心能帮到你！觉得有用的话，顺手帮我转发给更多需要的朋友吧~',
    '感谢认可！这个秘诀我也琢磨了好久，后续还有更多干货，点个关注不迷路！',
    '你的反馈就是我更新的动力！有任何使用心得随时来评论区交流~',
    '能被你喜欢真的超开心！觉得好用的话，给我点个赞让我知道哦~',
  ],
  question: [
    '非常棒的提问！这个问题很多人都有疑问，我专门写了一篇详细对比，去主页搜一下就能找到~',
    '你问到点子上了！简单说就是...如果还有疑问欢迎私信，我看到都会回！',
    '好问题！这个问题三言两语说不清，我后续会出一期专门解答，先关注等我更新吧~',
    '很多粉丝都问过这个！我已经整理了一份FAQ，私信"攻略"发给你~',
  ],
  challenge: [
    '理解你的疑虑，刚开始我也是怀疑的。但亲自试过之后发现确实有效，建议你不妨试试看？',
    '每个人情况不同，效果确实有差异。你可以先小范围尝试，有问题随时来评论区找我~',
    '你的质疑很理性！这也正是我当时的心态。但数据不会说谎，试试看就知道啦~',
    '这个观点确实见仁见智，我的建议是...欢迎大家理性讨论，共同进步！',
  ],
  joke: [
    '哈哈哈哈你也太真实了！不过这次真的不一样，我已经把难度降到最低了，试试呗~',
    '笑死！但是说真的，这次教程连我家猫都能学会（不是），不信你试试！',
    '看来我之前的教程太难了？这次我重新做了零基础版本，真的超简单！',
    '收藏侠你好！这次我加了实践打卡环节，来评论区交作业有惊喜哦~',
  ],
};

function predictEngagement(comments: SimulatedComment[]): number {
  let score = 60;
  comments.forEach((c) => {
    if (c.type === 'positive') score += 5;
    if (c.type === 'question') score += 8;
    if (c.type === 'challenge') score += 3;
    if (c.type === 'joke') score += 6;
  });
  return Math.min(score, 98);
}

export default function CommentRehearsal({ content: initialContent = '' }: CommentRehearsalProps) {
  const [inputContent, setInputContent] = useState(initialContent);
  const [isSimulating, setIsSimulating] = useState(false);
  const [comments, setComments] = useState<SimulatedComment[]>([]);
  const [engagementScore, setEngagementScore] = useState(0);
  const [dnaMatch, setDnaMatch] = useState(true);
  const [optimized, setOptimized] = useState(false);

  const handleSimulate = useCallback(async () => {
    if (!inputContent.trim() || inputContent.trim().length < 5) {
      alert('请输入至少5个字的内容');
      return;
    }
    setIsSimulating(true);
    setComments([]);
    setOptimized(false);

    const result = await simulateComments(inputContent);
    setComments(result);
    setEngagementScore(predictEngagement(result));
    setDnaMatch(true);
    setIsSimulating(false);
  }, [inputContent]);

  const handleOptimizeReplies = useCallback(() => {
    setOptimized(true);
    setComments((prev) =>
      prev.map((c) => {
        const pool = ENHANCED_REPLIES[c.type];
        const newReply = pool[Math.floor(Math.random() * pool.length)];
        return { ...c, suggestedReply: newReply };
      })
    );
  }, []);

  const typeCounts = comments.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#0A0A0F', border: '1px solid rgba(0,240,255,0.15)' }}>
      {/* Header */}
      <div className="px-6 py-5 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,240,255,0.1)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
          <MessageCircle size={20} style={{ color: '#00F0FF' }} />
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: '#00F0FF' }}>评论区预演</h2>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>AI模拟10条粉丝评论，提前预演回复策略</p>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-5">
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
          即将发布的内容
        </label>
        <textarea
          value={inputContent}
          onChange={(e) => setInputContent(e.target.value)}
          placeholder="输入你即将发布的内容文案，AI将模拟粉丝可能的评论..."
          className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all"
          style={{
            background: '#12121A',
            border: '1px solid rgba(0,240,255,0.15)',
            color: '#fff',
            minHeight: '100px',
          }}
          rows={4}
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {inputContent.length} 字
          </span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSimulate}
            disabled={isSimulating}
            className="px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
            style={{
              background: isSimulating ? 'rgba(0,240,255,0.1)' : '#00F0FF',
              color: isSimulating ? 'rgba(0,240,255,0.5)' : '#0A0A0F',
              cursor: isSimulating ? 'not-allowed' : 'pointer',
            }}
          >
            {isSimulating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                  <Sparkles size={16} />
                </motion.div>
                AI 模拟评论区中...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                预演评论区
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {comments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 pb-6"
          >
            {/* Stats Bar */}
            <div className="flex items-center gap-4 mb-5 p-4 rounded-xl" style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Engagement Score */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(57,255,20,0.1)' }}>
                  <TrendingUp size={18} style={{ color: '#39FF14' }} />
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>互动率预测</div>
                  <div className="text-lg font-black" style={{ color: '#39FF14' }}>{engagementScore}%</div>
                </div>
              </div>

              <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />

              {/* DNA Match */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(57,255,20,0.1)' }}>
                  <CheckCircle2 size={18} style={{ color: '#39FF14' }} />
                </div>
                <div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>人设一致性</div>
                  <div className="text-sm font-bold" style={{ color: '#39FF14' }}>
                    {dnaMatch ? '全部符合DNA' : '部分需调整'}
                  </div>
                </div>
              </div>

              <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.1)' }} />

              {/* Type Distribution */}
              <div className="flex items-center gap-2">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const cfg = TYPE_CONFIG[type as CommentType];
                  return (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon} {count}条
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Optimize Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                共模拟 {comments.length} 条评论
                {optimized && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,42,109,0.15)', color: '#FF2A6D' }}>
                    已优化回复
                  </span>
                )}
              </h3>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOptimizeReplies}
                className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                style={{
                  background: optimized ? 'rgba(57,255,20,0.1)' : 'rgba(255,42,109,0.15)',
                  color: optimized ? '#39FF14' : '#FF2A6D',
                  border: `1px solid ${optimized ? 'rgba(57,255,20,0.3)' : 'rgba(255,42,109,0.3)'}`,
                }}
              >
                <RefreshCw size={14} />
                {optimized ? '已优化回复话术' : '优化回复话术'}
              </motion.button>
            </div>

            {/* Comment Cards */}
            <div className="space-y-3">
              {comments.map((comment, index) => {
                const cfg = TYPE_CONFIG[comment.type];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-xl p-4"
                    style={{
                      background: '#12121A',
                      border: `1px solid ${cfg.color}25`,
                    }}
                  >
                    {/* Comment Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.icon} {cfg.label}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        粉丝评论 #{index + 1}
                      </span>
                    </div>

                    {/* Comment Content */}
                    <p className="text-sm font-medium mb-3" style={{ color: '#F0F0FF' }}>
                      &ldquo;{comment.text}&rdquo;
                    </p>

                    {/* Suggested Reply */}
                    <div
                      className="rounded-lg p-3 flex items-start gap-2"
                      style={{ background: 'rgba(0,240,255,0.05)', border: '1px solid rgba(0,240,255,0.1)' }}
                    >
                      <Zap size={14} className="text-neon-cyan flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-[10px] font-medium mb-1" style={{ color: '#00F0FF' }}>
                          AI建议回复
                        </div>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                          {comment.suggestedReply}
                        </p>
                      </div>
                      {dnaMatch && (
                        <div className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(57,255,20,0.1)' }}>
                          <CheckCircle2 size={12} style={{ color: '#39FF14' }} />
                          <span className="text-[10px]" style={{ color: '#39FF14' }}>DNA</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
