import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageCircle, UserPlus, X, Clock, Gamepad2, Film, Circle } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: number;
  status: 'online' | 'gaming' | 'watching' | 'offline';
  lastSeen: string;
  bio: string;
  fans: number;
  posts: number;
  likes: number;
  tags: string[];
}

const MOCK_FRIENDS: Friend[] = [
  { id: '1', name: '美食探店酱', avatar: '/sample-post-cover-1.jpg', level: 5, status: 'online', lastSeen: '刚刚', bio: '专注上海隐藏美食地图', fans: 2340, posts: 56, likes: 12800, tags: ['美食', '探店', '上海'] },
  { id: '2', name: '科技评测君', avatar: '/sample-post-cover-2.jpg', level: 7, status: 'gaming', lastSeen: '5分钟前', bio: '数码产品第一手评测', fans: 5600, posts: 89, likes: 34500, tags: ['数码', '评测', '科技'] },
  { id: '3', name: '旅行日记', avatar: '/sample-post-cover-3.jpg', level: 4, status: 'online', lastSeen: '刚刚', bio: '用脚丈量世界', fans: 1200, posts: 34, likes: 5600, tags: ['旅行', '摄影', '攻略'] },
  { id: '4', name: '穿搭研究所', avatar: '/sample-post-cover-4.jpg', level: 6, status: 'watching', lastSeen: '20分钟前', bio: '小个子女生穿搭秘籍', fans: 3800, posts: 72, likes: 18900, tags: ['穿搭', '时尚', '美妆'] },
  { id: '5', name: 'AI工具箱', avatar: '/avatar-default.png', level: 3, status: 'offline', lastSeen: '2小时前', bio: 'ChatGPT和AI工具实测', fans: 890, posts: 23, likes: 3200, tags: ['AI', '效率', '工具'] },
  { id: '6', name: '职场小白', avatar: '/sample-post-cover-1.jpg', level: 2, status: 'online', lastSeen: '刚刚', bio: '应届生职场生存指南', fans: 450, posts: 15, likes: 1200, tags: ['职场', '面试', '干货'] },
  { id: '7', name: '咖啡研究所', avatar: '/sample-post-cover-2.jpg', level: 4, status: 'offline', lastSeen: '1天前', bio: '星巴克隐藏菜单探索者', fans: 1500, posts: 42, likes: 6700, tags: ['咖啡', '探店', '生活'] },
  { id: '8', name: '数码控', avatar: '/sample-post-cover-3.jpg', level: 5, status: 'gaming', lastSeen: '10分钟前', bio: 'iPhone和安卓深度体验', fans: 2100, posts: 48, likes: 9800, tags: ['数码', '手机', '测评'] },
  { id: '9', name: '穷游日记', avatar: '/sample-post-cover-4.jpg', level: 3, status: 'offline', lastSeen: '3天前', bio: '用最少的钱看最美的风景', fans: 780, posts: 28, likes: 3400, tags: ['旅行', '穷游', '攻略'] },
  { id: '10', name: '早餐研究所', avatar: '/avatar-default.png', level: 2, status: 'online', lastSeen: '刚刚', bio: '打工人快手营养早餐', fans: 320, posts: 19, likes: 1500, tags: ['美食', '早餐', '快手'] },
];

const statusConfig = {
  online: { color: '#39FF14', label: '在线', icon: Circle },
  gaming: { color: '#FFD700', label: '游戏中', icon: Gamepad2 },
  watching: { color: '#FF6B6B', label: '观影中', icon: Film },
  offline: { color: '#666', label: '离线', icon: Clock },
};

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'online' | 'gaming' | 'recent'>('all');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);

  const filtered = MOCK_FRIENDS.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'online' && f.status === 'online') || (activeTab === 'gaming' && f.status === 'gaming') || (activeTab === 'recent' && ['online', 'gaming', 'watching'].includes(f.status));
    return matchesSearch && matchesTab;
  });

  const tabCounts = {
    all: MOCK_FRIENDS.length,
    online: MOCK_FRIENDS.filter((f) => f.status === 'online').length,
    gaming: MOCK_FRIENDS.filter((f) => f.status === 'gaming').length,
    recent: MOCK_FRIENDS.filter((f) => ['online', 'gaming', 'watching'].includes(f.status)).length,
  };

  const openChat = (friend: Friend) => {
    setChatFriend(friend);
    setChatOpen(true);
  };

  return (
    <div className="min-h-[100dvh] pt-20 pb-8 px-4 md:px-8" style={{ background: '#0A0A0F' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black font-orbitron" style={{ color: '#00F0FF', textShadow: '0 0 20px rgba(0,240,255,0.3)' }}>
            好友星球
          </h1>
          <p className="text-text-secondary mt-2">连接创作者，拓展你的社交圈</p>
        </div>

        {/* Search + Tabs */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索好友..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-white/10 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'online', 'gaming', 'recent'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all relative"
                style={{
                  background: activeTab === tab ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.04)',
                  border: activeTab === tab ? '1px solid rgba(0,240,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color: activeTab === tab ? '#00F0FF' : '#8A8AA0',
                }}
              >
                {tab === 'all' ? '全部' : tab === 'online' ? '在线' : tab === 'gaming' ? '游戏中' : '最近联系'}
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-6">
          {/* Friend List */}
          <div className="flex-1">
            <div className="grid gap-3">
              {filtered.map((friend, index) => {
                const status = statusConfig[friend.status];
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                    style={{
                      background: selectedFriend?.id === friend.id ? 'rgba(0,240,255,0.08)' : 'rgba(255,255,255,0.03)',
                      border: selectedFriend?.id === friend.id ? '1px solid rgba(0,240,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    }}
                    onClick={() => setSelectedFriend(friend)}
                  >
                    <div className="relative">
                      <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover border-2" style={{ borderColor: status.color + '40' }} />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0A0A0F] flex items-center justify-center" style={{ background: status.color }}>
                        <StatusIcon size={8} className="text-[#0A0A0F]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{friend.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,240,255,0.12)', color: '#00F0FF' }}>Lv.{friend.level}</span>
                      </div>
                      <p className="text-xs text-text-muted mt-0.5 truncate">{friend.bio}</p>
                      <div className="flex gap-3 mt-1 text-[10px] text-text-muted">
                        <span>{friend.fans} 粉丝</span>
                        <span>{friend.posts} 内容</span>
                        <span>{friend.likes} 获赞</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[10px] text-text-muted">{friend.lastSeen}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); openChat(friend); }}
                        className="p-2 rounded-lg transition-colors hover:scale-110"
                        style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF' }}
                      >
                        <MessageCircle size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Friend Detail Sidebar */}
          <AnimatePresence>
            {selectedFriend && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                className="hidden lg:block w-80 flex-shrink-0"
              >
                <div className="sticky top-24 p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex flex-col items-center">
                    <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-20 h-20 rounded-full object-cover border-2 mb-3" style={{ borderColor: statusConfig[selectedFriend.status].color + '60' }} />
                    <h3 className="text-lg font-bold text-text-primary">{selectedFriend.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{selectedFriend.bio}</p>
                    <div className="flex gap-4 mt-4 text-center">
                      <div><div className="text-lg font-bold text-neon-cyan">{selectedFriend.fans}</div><div className="text-[10px] text-text-muted">粉丝</div></div>
                      <div><div className="text-lg font-bold text-neon-magenta">{selectedFriend.posts}</div><div className="text-[10px] text-text-muted">内容</div></div>
                      <div><div className="text-lg font-bold text-neon-gold">{selectedFriend.likes}</div><div className="text-[10px] text-text-muted">获赞</div></div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-4 justify-center">
                      {selectedFriend.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,240,255,0.1)', color: '#00F0FF', border: '1px solid rgba(0,240,255,0.2)' }}>{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-5 w-full">
                      <button onClick={() => openChat(selectedFriend)} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: '#00F0FF', color: '#0A0A0F' }}>
                        <MessageCircle size={14} className="inline mr-1" />发消息
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#F0F0FF' }}>
                        <UserPlus size={14} className="inline mr-1" />关注
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatOpen && chatFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setChatOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md h-[500px] flex flex-col rounded-2xl overflow-hidden"
              style={{ background: '#12121A', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <img src={chatFriend.avatar} alt={chatFriend.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text-primary">{chatFriend.name}</div>
                  <div className="text-[10px] flex items-center gap-1" style={{ color: statusConfig[chatFriend.status].color }}>
                    <Circle size={6} fill="currentColor" /> {statusConfig[chatFriend.status].label}
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary">
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="flex justify-start"><div className="bg-white/8 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-text-primary max-w-[75%]">嗨！最近怎么样？</div></div>
                <div className="flex justify-end"><div className="bg-neon-cyan/15 border border-neon-cyan/30 px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-text-primary max-w-[75%]">挺好的，刚发了一篇新内容！</div></div>
                <div className="flex justify-start"><div className="bg-white/8 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-text-primary max-w-[75%]">看到你的新帖子了，数据怎么样？</div></div>
                <div className="flex justify-end"><div className="bg-neon-cyan/15 border border-neon-cyan/30 px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-text-primary max-w-[75%]">阅读量还不错，互动率一般，还在优化中~</div></div>
              </div>

              {/* Input */}
              <div className="p-3 border-t border-white/10">
                <div className="flex gap-2">
                  <input type="text" placeholder={`对${chatFriend.name}说点什么...`} className="flex-1 px-4 py-2.5 rounded-xl bg-void-light border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50" />
                  <button className="px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#00F0FF', color: '#0A0A0F' }}>发送</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
