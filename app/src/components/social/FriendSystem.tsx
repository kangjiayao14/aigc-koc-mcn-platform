import { useState, useCallback, useRef, useEffect } from 'react';
import type { Friend, ChatMessage } from './types';
import { MOCK_FRIENDS, MOCK_SUGGESTED_FRIENDS, MOCK_FRIEND_REQUESTS, MOCK_POSTS } from './data';
import { Search, UserPlus, X, MessageCircle, Heart, Users, Check, UserCheck, Send, Phone, Video, Smile } from 'lucide-react';

type OnlineStatus = Friend['status'];

function StatusLabel({ status }: { status: OnlineStatus }) {
  const labels: Record<OnlineStatus, string> = {
    online: '在线',
    'in-game': '游戏中',
    watching: '观影中',
    offline: '离线',
  };
  const colors: Record<OnlineStatus, string> = {
    online: 'text-neon-green',
    'in-game': 'text-neon-gold',
    watching: 'text-[#FF6B6B]',
    offline: 'text-text-muted',
  };
  return <span className={`text-[10px] ${colors[status]}`}>{labels[status]}</span>;
}

// ===== Chat Window (QQ-style with broker bubbles) =====
function ChatWindow({ friend, onClose }: { friend: Friend; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'chat_init',
      userId: friend.id,
      username: friend.username,
      avatar: friend.avatar,
      content: `嗨！最近怎么样？${friend.status === 'watching' ? '听说你在看电影，好看吗？' : friend.status === 'in-game' ? '玩游戏呢？带我一个！' : '有空一起聊聊创作呀~'}`,
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = useCallback(() => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMessage = {
      id: `me_${Date.now()}`,
      userId: 'me',
      username: '我',
      avatar: '',
      content: inputMsg.trim(),
      type: 'normal',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');

    // Simulate friend typing and replying
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        '哈哈，说得对！',
        '最近确实挺忙的，不过创作不能停~',
        '你那边天气怎么样？',
        '下次一起组队玩游戏吧！',
        '我刚发了一篇新内容，有空帮我点个赞呗~',
        '这个周末有个线下活动，要不要一起去？',
      ];
      const reply: ChatMessage = {
        id: `reply_${Date.now()}`,
        userId: friend.id,
        username: friend.username,
        avatar: friend.avatar,
        content: replies[Math.floor(Math.random() * replies.length)],
        type: 'normal',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1500 + Math.random() * 1000);
  }, [inputMsg, friend]);

  // Broker style bubble colors
  const myBubbleColor = 'bg-[#00D4FF]/15 border-[#00D4FF]/30';
  const friendBubbleColor = 'bg-white/8 border-white/12';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:w-[420px] h-[100dvh] sm:h-[600px] bg-void-light border border-white/10 sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={friend.avatar} alt={friend.username} className="w-9 h-9 rounded-full object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5">
                <div className={`w-2.5 h-2.5 rounded-full border-2 border-void-light ${
                  friend.status === 'online' ? 'bg-neon-green' : 
                  friend.status === 'in-game' ? 'bg-neon-gold' : 
                  friend.status === 'watching' ? 'bg-[#FF6B6B]' : 'bg-text-muted'
                }`} />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">{friend.username}</h4>
              <StatusLabel status={friend.status} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
              <Phone size={15} />
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
              <Video size={15} />
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.userId === 'me' ? 'flex-row-reverse' : ''}`}>
              <img 
                src={msg.userId === 'me' ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=me' : msg.avatar} 
                alt={msg.username} 
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 self-start mt-0.5" 
              />
              <div className={`max-w-[75%] ${msg.userId === 'me' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.userId === 'me'
                      ? `${myBubbleColor} border rounded-tr-sm text-text-primary`
                      : `${friendBubbleColor} border rounded-tl-sm text-text-primary`
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[9px] text-text-muted mt-1 block">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2.5">
              <img src={friend.avatar} alt={friend.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div className="px-3.5 py-2.5 rounded-2xl bg-white/8 border border-white/12 rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="px-3 py-3 border-t border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/5 transition-all">
              <Smile size={16} />
            </button>
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`给 ${friend.username} 发消息...`}
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-[#00D4FF]/30"
            />
            <button
              onClick={handleSend}
              disabled={!inputMsg.trim()}
              className="w-9 h-9 rounded-xl bg-[#00D4FF] text-void flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Profile Modal =====
function ProfileModal({ friend, onClose, onAddFriend, isFriend, onChat }: {
  friend: Friend;
  onClose: () => void;
  onAddFriend: (friend: Friend) => void;
  isFriend: boolean;
  onChat: (friend: Friend) => void;
}) {
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    setAdded(true);
    onAddFriend(friend);
  }, [friend, onAddFriend]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-void-light border border-white/10 rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-32 bg-gradient-to-br from-neon-violet/20 to-neon-cyan/20">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-text-primary hover:bg-black/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 -mt-12 pb-5">
          <div className="relative inline-block">
            <img
              src={friend.avatar}
              alt={friend.username}
              className="w-24 h-24 rounded-full border-4 border-void-light bg-void-light object-cover"
            />
            <div className="absolute bottom-1 right-1">
              <div className={`w-4 h-4 rounded-full border-2 border-void-light ${
                friend.status === 'online' ? 'bg-neon-green' : 
                friend.status === 'in-game' ? 'bg-neon-gold' : 
                friend.status === 'watching' ? 'bg-[#FF6B6B]' : 'bg-text-muted'
              }`} />
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-xl font-bold text-text-primary">{friend.username}</h3>
            <p className="text-sm text-text-muted mt-1">
              ID: {friend.id} | Lv.{friend.level}
            </p>
          </div>

          {friend.bio && (
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">{friend.bio}</p>
          )}

          <div className="flex items-center gap-6 mt-4 py-3 border-y border-white/5">
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{friend.posts || 0}</div>
              <div className="text-xs text-text-muted">内容</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{friend.followers?.toLocaleString() || 0}</div>
              <div className="text-xs text-text-muted">粉丝</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text-primary">{friend.likes?.toLocaleString() || 0}</div>
              <div className="text-xs text-text-muted">获赞</div>
            </div>
          </div>

          {friend.tags && (
            <div className="flex flex-wrap gap-2 mt-3">
              {friend.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-1 text-xs rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            {isFriend ? (
              <button 
                onClick={() => onChat(friend)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/20 transition-colors"
              >
                <MessageCircle size={16} />
                发消息
              </button>
            ) : (
              <button
                onClick={handleAdd}
                disabled={added}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  added
                    ? 'bg-neon-green/10 border border-neon-green/30 text-neon-green'
                    : 'bg-neon-cyan text-void hover:brightness-110'
                }`}
              >
                {added ? <UserCheck size={16} /> : <UserPlus size={16} />}
                {added ? '已添加' : '加好友'}
              </button>
            )}
          </div>
        </div>

        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'posts' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-text-muted hover:text-text-secondary'}`}
          >
            内容
          </button>
          <button
            onClick={() => setActiveTab('likes')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'likes' ? 'text-neon-cyan border-b-2 border-neon-cyan' : 'text-text-muted hover:text-text-secondary'}`}
          >
            赞过
          </button>
        </div>

        {activeTab === 'posts' && (
          <div className="p-3 grid grid-cols-3 gap-1">
            {MOCK_POSTS.map((post) => (
              <div key={post.id} className="relative aspect-square group overflow-hidden rounded-lg">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-xs text-white font-medium truncate">{post.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Heart size={10} className="text-neon-magenta fill-neon-magenta" />
                    <span className="text-[10px] text-white/80">{post.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="p-8 text-center text-text-muted text-sm">
            点赞内容仅自己可见
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Friend Request Modal =====
function FriendRequestModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-void-light border border-white/10 rounded-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-primary">好友申请</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X size={18} />
          </button>
        </div>
        {MOCK_FRIEND_REQUESTS.map((req) => (
          <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
            <img src={req.avatar} alt={req.username} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{req.username}</p>
              <p className="text-xs text-text-secondary mt-1">{req.message}</p>
              <p className="text-[10px] text-text-muted mt-1">{req.timestamp}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={onAccept}
                className="px-3 py-1.5 rounded-lg bg-neon-cyan text-void text-xs font-medium hover:brightness-110 transition-all flex items-center gap-1"
              >
                <Check size={12} />
                接受
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-white/10 text-text-secondary text-xs hover:bg-white/20 transition-colors">
                忽略
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===== Main Friend System =====
export default function FriendSystem() {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [suggested, setSuggested] = useState<Friend[]>(MOCK_SUGGESTED_FRIENDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [chatFriend, setChatFriend] = useState<Friend | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [requestCount, setRequestCount] = useState(1);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filteredFriends = friends.filter((f) =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFriend = useCallback((friend: Friend) => {
    setAddedIds((prev) => new Set(prev).add(friend.id));
    setTimeout(() => {
      setFriends((prev) => {
        if (prev.find((f) => f.id === friend.id)) return prev;
        return [...prev, friend];
      });
      setSuggested((prev) => prev.filter((f) => f.id !== friend.id));
    }, 500);
  }, []);

  const handleAcceptRequest = useCallback(() => {
    setRequestCount(0);
    setShowRequests(false);
    setFriends((prev) => {
      if (prev.find((f) => f.id === MOCK_SUGGESTED_FRIENDS[0].id)) return prev;
      return [...prev, MOCK_SUGGESTED_FRIENDS[0]];
    });
  }, []);

  const handleOpenChat = useCallback((friend: Friend) => {
    setChatFriend(friend);
    setSelectedFriend(null);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Users size={24} className="text-neon-cyan" />
            我的好友
          </h2>
          <p className="text-sm text-text-secondary mt-1">{friends.length} 位好友</p>
        </div>
        <button
          onClick={() => setShowRequests(true)}
          className="relative px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary hover:bg-white/10 transition-colors flex items-center gap-2"
        >
          <UserPlus size={16} />
          好友申请
          {requestCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon-magenta text-[10px] text-white flex items-center justify-center font-bold animate-badge-pulse">
              {requestCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="搜索好友..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      {/* Friends list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-6">
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-neon-cyan/20 transition-all cursor-pointer group"
          >
            <div 
              className="relative flex-shrink-0"
              onClick={() => setSelectedFriend(friend)}
            >
              <img src={friend.avatar} alt={friend.username} className="w-11 h-11 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-void-light" style={{
                backgroundColor: friend.status === 'online' ? '#39FF14' : 
                  friend.status === 'in-game' ? '#FFD700' : 
                  friend.status === 'watching' ? '#FF6B6B' : '#4A4A60'
              }} />
            </div>
            <div className="flex-1 min-w-0" onClick={() => setSelectedFriend(friend)}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-primary">{friend.username}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan">
                  Lv.{friend.level}
                </span>
              </div>
              <p className="text-xs text-text-muted truncate mt-0.5">
                {friend.status === 'online'
                  ? friend.recentActivity || '在线'
                  : friend.status === 'in-game'
                    ? friend.currentActivity || '游戏中'
                    : friend.status === 'watching'
                      ? friend.currentActivity || '观影中'
                      : friend.lastSeen || '离线'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOpenChat(friend);
              }}
              className="p-2 rounded-lg text-text-muted hover:text-neon-cyan hover:bg-white/5 transition-all flex-shrink-0"
              title="私聊"
            >
              <MessageCircle size={16} />
            </button>
          </div>
        ))}
        {filteredFriends.length === 0 && (
          <div className="text-center py-8 text-text-muted text-sm">没有找到匹配的好友</div>
        )}
      </div>

      {/* Suggested Friends */}
      <div>
        <h3 className="text-sm font-medium text-text-secondary mb-3 flex items-center gap-2">
          <UserPlus size={14} />
          可能认识的人
        </h3>
        <div className="space-y-2">
          {suggested.map((person) => (
            <div
              key={person.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <img
                src={person.avatar}
                alt={person.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
                onClick={() => setSelectedFriend(person)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{person.username}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {person.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-violet/10 text-neon-violet border border-neon-violet/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleAddFriend(person)}
                disabled={addedIds.has(person.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                  addedIds.has(person.id)
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                    : 'bg-neon-cyan text-void hover:brightness-110'
                }`}
              >
                {addedIds.has(person.id) ? (
                  <>
                    <Check size={12} />
                    已添加
                  </>
                ) : (
                  <>
                    <UserPlus size={12} />
                    添加
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedFriend && (
        <ProfileModal
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onAddFriend={handleAddFriend}
          isFriend={friends.some((f) => f.id === selectedFriend.id)}
          onChat={handleOpenChat}
        />
      )}
      {chatFriend && (
        <ChatWindow
          friend={chatFriend}
          onClose={() => setChatFriend(null)}
        />
      )}
      {showRequests && (
        <FriendRequestModal onClose={() => setShowRequests(false)} onAccept={handleAcceptRequest} />
      )}
    </div>
  );
}
