import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Post {
  id: string;
  title: string;
  content: string;
  platform: string;
  cover: string;
  likes: number;
  comments: number;
  createdAt: string;
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('pcg_posts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Support both array and single object
        const arr = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
        const mapPlatform: Record<string, string> = {
          xiaohongshu: '小红书',
          wechat: '朋友圈',
          douyin: '抖音',
          linkedin: '领英',
        };
        const normalized: Post[] = arr
          .map((p: any) => {
            const platform = mapPlatform[String(p?.platform || '')] || String(p?.platform || '小红书');
            const cover = String(p?.cover || p?.image || (Array.isArray(p?.images) ? p.images[0] : '') || '');
            const createdAt = String(p?.createdAt || p?.date || new Date().toISOString());
            return {
              id: String(p?.id || `${createdAt}_${Math.random().toString(16).slice(2)}`),
              title: String(p?.title || '').trim() || '未命名内容',
              content: String(p?.content || p?.text || ''),
              platform,
              cover,
              likes: Number(p?.likes || 0),
              comments: Number(p?.comments || 0),
              createdAt,
            };
          })
          .filter((p) => p.title);
        setPosts(normalized.slice(0, 6));
      } catch {
        setPosts([]);
      }
    }
  }, []);

  const platformColors: Record<string, string> = {
    小红书: '#FF2442',
    朋友圈: '#07C160',
    抖音: '#000000',
    领英: '#0A66C2',
  };

  const platformIcons: Record<string, string> = {
    小红书: '📕',
    朋友圈: '💬',
    抖音: '🎵',
    领英: '💼',
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-neon-cyan" />
          <h3 className="text-lg font-bold text-text-primary">我的发布</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}>
            {posts.length} 篇
          </span>
        </div>
        <button
          onClick={() => navigate('/content-lab')}
          className="flex items-center gap-1 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          去创作 <ArrowRight size={14} />
        </button>
      </div>

      {posts.length === 0 ? (
        /* Empty State */
        <div className="py-10 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.08)' }}>
            <FileText size={28} className="text-neon-cyan/50" />
          </div>
          <p className="text-sm text-text-secondary mb-1">还没有发布内容</p>
          <p className="text-xs text-text-muted mb-4">快去创作工坊生成你的第一篇内容吧！</p>
          <button
            onClick={() => navigate('/content-lab')}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
            style={{ background: '#00F0FF', color: '#0A0A0F' }}
          >
            ✨ 开始创作
          </button>
        </div>
      ) : (
        /* Posts Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {/* Cover */}
              <div className="aspect-[4/3] relative overflow-hidden">
                <img src={post.cover || '/sample-post-cover-1.jpg'} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Platform Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ background: (platformColors[post.platform] || '#666') + 'CC', color: '#fff' }}>
                  {platformIcons[post.platform] || '📝'} {post.platform}
                </div>
              </div>

              {/* Info */}
              <div className="p-2.5">
                <h4 className="text-xs font-medium text-text-primary line-clamp-2 leading-snug mb-1.5">{post.title}</h4>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><Heart size={10} /> {post.likes || 0}</span>
                    <span className="flex items-center gap-0.5"><MessageCircle size={10} /> {post.comments || 0}</span>
                  </div>
                  <span>{new Date(post.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
