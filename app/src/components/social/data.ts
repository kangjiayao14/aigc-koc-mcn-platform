/**
 * Social Hub - Mock Data
 *
 * All mock data for the social planet features:
 * - Friends system
 * - Online cinema (movies, schedules, rooms) with Tencent Video integration
 * - Murder mystery (scripts, roles, clues)
 * - Party games (turtle soup, werewolf, ludo)
 */

import type { Friend, Movie, Script, GameRoom, ChatMessage, MovieSchedule } from './types';

// ===== FRIENDS =====
export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    username: '星际旅者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=star1',
    level: 5,
    status: 'online',
    bio: '探索宇宙的每一个角落，记录每一次心动',
    followers: 1280,
    following: 86,
    likes: 34200,
    posts: 56,
    recentActivity: '刚刚发布了新内容《星空下的咖啡馆》',
    tags: ['美食探店', '旅行', '摄影'],
  },
  {
    id: 'f2',
    username: '像素诗人',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pixel2',
    level: 4,
    status: 'watching',
    currentActivity: '正在观影《星际穿越》',
    bio: '用代码写诗，用像素作画',
    followers: 860,
    following: 120,
    likes: 15600,
    posts: 34,
    recentActivity: '2分钟前加入了观影房间',
    tags: ['编程', 'AI绘画', '科技'],
  },
  {
    id: 'f3',
    username: '霓虹甜心',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=neon3',
    level: 3,
    status: 'in-game',
    currentActivity: '正在玩海龟汤',
    bio: '赛博朋克女孩 | 穿搭博主 | 城市夜行者',
    followers: 2340,
    following: 200,
    likes: 67800,
    posts: 89,
    recentActivity: '在线中',
    tags: ['穿搭', '赛博朋克', '夜生活'],
  },
  {
    id: 'f4',
    username: '代码工匠',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=code4',
    level: 6,
    status: 'offline',
    lastSeen: '2小时前',
    bio: '全栈开发者 | 开源贡献者 | 技术分享',
    followers: 3200,
    following: 150,
    likes: 89000,
    posts: 112,
    recentActivity: '2小时前发布了《React性能优化指南》',
    tags: ['前端', 'React', '全栈'],
  },
  {
    id: 'f5',
    username: '云端漫步',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cloud5',
    level: 2,
    status: 'online',
    bio: '云计算工程师 | 技术博主新手',
    followers: 320,
    following: 45,
    likes: 2800,
    posts: 12,
    recentActivity: '刚刚完成了一局海龟汤',
    tags: ['云计算', '后端', '学习'],
  },
];

export const MOCK_SUGGESTED_FRIENDS: Friend[] = [
  {
    id: 's1',
    username: '美食猎手',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=food1',
    level: 4,
    status: 'online',
    bio: '寻找城市中最美味的角落',
    followers: 1800,
    following: 90,
    likes: 45000,
    posts: 67,
    recentActivity: '刚刚打卡了「深夜食堂」',
    tags: ['美食探店', '火锅', '甜品'],
  },
  {
    id: 's2',
    username: '旅行青蛙',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel2',
    level: 3,
    status: 'online',
    bio: '一直在路上，从未停止探索',
    followers: 950,
    following: 78,
    likes: 23400,
    posts: 45,
    recentActivity: '分享了一组西藏旅行照片',
    tags: ['旅行', '摄影', '户外'],
  },
  {
    id: 's3',
    username: 'AI炼丹师',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai3',
    level: 5,
    status: 'offline',
    lastSeen: '1小时前',
    bio: '用AI创造无限可能',
    followers: 2100,
    following: 130,
    likes: 56700,
    posts: 78,
    recentActivity: '1小时前分享了新的AI绘画作品',
    tags: ['AI绘画', 'AIGC', '设计'],
  },
];

export const MOCK_CURRENT_USER: Friend = {
  id: 'me',
  username: '创客小王子',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me',
  level: 3,
  status: 'online',
  bio: '在创客星球开启我的创作之旅',
  followers: 520,
  following: 68,
  likes: 8900,
  posts: 23,
  recentActivity: '在线',
  tags: ['创作', 'AI', '学习'],
};

// Sample posts for profile display
export const MOCK_POSTS = [
  { id: 'p1', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=400&fit=crop', title: '深夜食堂探店', likes: 234 },
  { id: 'p2', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop', title: '星空露营攻略', likes: 567 },
  { id: 'p3', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=400&fit=crop', title: '我的编程桌面', likes: 189 },
  { id: 'p4', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=400&fit=crop', title: '海边日出', likes: 892 },
  { id: 'p5', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', title: 'AI生成的赛博朋克城', likes: 1203 },
  { id: 'p6', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop', title: '新入手的键盘', likes: 456 },
];

// ===== MOVIES (with VIP categories) =====
export const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
    title: '星际穿越',
    poster: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=600&fit=crop',
    duration: '169分钟',
    rating: 9.4,
    genre: '科幻/冒险',
    description: '在地球未来面临绝境时，一组探险者利用虫洞进行星际航行，寻找人类的新家园。',
    category: 'free',
  },
  {
    id: 'm2',
    title: '千与千寻',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
    duration: '125分钟',
    rating: 9.4,
    genre: '动画/奇幻',
    description: '10岁的少女千寻误入神灵世界，为了拯救变成猪的父母，她在汤屋中展开冒险。',
    category: 'free',
  },
  {
    id: 'm3',
    title: '盗梦空间',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop',
    duration: '148分钟',
    rating: 9.3,
    genre: '科幻/悬疑',
    description: '造梦师柯布接受了一项看似不可能的任务：在能源巨头费舍尔的梦境中植入想法。',
    category: 'vip',
    vipExclusive: true,
  },
  {
    id: 'm4',
    title: '楚门的世界',
    poster: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=400&h=600&fit=crop',
    duration: '103分钟',
    rating: 9.3,
    genre: '剧情/科幻',
    description: '楚门发现自己30年来一直生活在一个巨大的摄影棚中，他的一举一动都是真人秀。',
    category: 'vip',
    vipExclusive: true,
  },
  {
    id: 'm5',
    title: '黑客帝国',
    poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop',
    duration: '136分钟',
    rating: 9.1,
    genre: '科幻/动作',
    description: '程序员尼奥发现现实世界其实是由人工智能操控的虚拟矩阵，他加入了反抗军。',
    category: 'free',
  },
  {
    id: 'm6',
    title: '肖申克的救赎',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    duration: '142分钟',
    rating: 9.7,
    genre: '剧情/犯罪',
    description: '银行家安迪被冤枉谋杀妻子入狱，他在肖申克监狱中度过了19年，最终重获自由。',
    category: 'upcoming',
  },
  {
    id: 'm7',
    title: '沙丘2',
    poster: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    duration: '166分钟',
    rating: 8.9,
    genre: '科幻/冒险',
    description: '保罗·厄崔迪与契妮和弗雷曼人联手，对毁灭他家族的阴谋者展开复仇。',
    category: 'vip',
    vipExclusive: true,
  },
  {
    id: 'm8',
    title: '流浪地球3',
    poster: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop',
    duration: '175分钟',
    rating: 9.0,
    genre: '科幻/灾难',
    description: '太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。',
    category: 'upcoming',
  },
];

// Movie schedules for 3 days
export const MOCK_SCHEDULES: MovieSchedule[] = [
  // Today
  { id: 'sch1', movieId: 'm1', movie: MOCK_MOVIES[0], time: '14:00', date: 'today', seats: [null, null, { id: 'u1', username: '星际旅者', avatar: MOCK_FRIENDS[0].avatar }, null, { id: 'u2', username: '像素诗人', avatar: MOCK_FRIENDS[1].avatar }, null, null, null] },
  { id: 'sch2', movieId: 'm3', movie: MOCK_MOVIES[2], time: '16:30', date: 'today', seats: [{ id: 'u3', username: '霓虹甜心', avatar: MOCK_FRIENDS[2].avatar }, null, null, null, null, null, null, null] },
  { id: 'sch3', movieId: 'm5', movie: MOCK_MOVIES[4], time: '19:00', date: 'today', seats: [null, null, null, null, null, null, null, null] },
  { id: 'sch4', movieId: 'm7', movie: MOCK_MOVIES[6], time: '21:00', date: 'today', seats: [{ id: 'u4', username: '代码工匠', avatar: MOCK_FRIENDS[3].avatar }, { id: 'u5', username: '云端漫步', avatar: MOCK_FRIENDS[4].avatar }, null, null, null, null, null, null] },
  // Tomorrow
  { id: 'sch5', movieId: 'm2', movie: MOCK_MOVIES[1], time: '14:00', date: 'tomorrow', seats: [null, null, null, null, null, null, null, null] },
  { id: 'sch6', movieId: 'm4', movie: MOCK_MOVIES[3], time: '16:30', date: 'tomorrow', seats: [null, null, null, null, null, null, null, null] },
  { id: 'sch7', movieId: 'm1', movie: MOCK_MOVIES[0], time: '19:00', date: 'tomorrow', seats: [null, null, null, null, null, null, null, null] },
  // Day after
  { id: 'sch8', movieId: 'm3', movie: MOCK_MOVIES[2], time: '14:00', date: 'after', seats: [null, null, null, null, null, null, null, null] },
  { id: 'sch9', movieId: 'm2', movie: MOCK_MOVIES[1], time: '19:00', date: 'after', seats: [null, null, null, null, null, null, null, null] },
];

// ===== SCRIPTS (2 complete scripts with full role cards) =====
export const MOCK_SCRIPTS: Script[] = [
  {
    id: 'script1',
    title: '古堡惊魂夜',
    type: '悬疑推理',
    players: 6,
    duration: '50分钟',
    difficulty: '进阶',
    description: '一座百年古堡中正在举办一场奢华的慈善晚宴。凌晨时分，古堡主人——亿万富翁维克多伯爵被发现死在书房，死因是中毒。六名宾客各怀秘密，而当晚的暴风雪让所有人无法离开。凶手就在你们之中...',
    cover: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=600&h=400&fit=crop',
    roles: [
      {
        id: 'r1', name: '维克多伯爵（死者）',
        description: '古堡主人，亿万富翁。表面上是慈善家，实则利用慈善洗钱。',
        background: '从小在古堡长大，继承了巨额遗产。近年来以慈善名义举办各种活动，实则转移资产。与多位宾客有金钱纠纷。',
        skill: '【遗产之谜】可以查看任意一位玩家的背景故事中是否提到"金钱纠纷"或"债务"。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=victor',
      },
      {
        id: 'r2', name: '艾琳娜·画家',
        description: '知名画家，正在筹备个人画展。与伯爵有过一段感情纠葛。',
        background: '三年前与伯爵交往，后发现伯爵同时与多名女性暧昧。伯爵承诺资助她的画展却迟迟未兑现，导致她的工作室面临倒闭。',
        skill: '【艺术直觉】可以强制查看一条尚未公开的线索卡内容。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena',
      },
      {
        id: 'r3', name: '马库斯·律师',
        description: '伯爵的私人律师，手握伯爵的所有黑料。',
        background: '为伯爵工作十年，协助处理过大量"灰色"事务。最近被伯爵威胁要解雇他，因为他拒绝在一份虚假遗嘱上签字。',
        skill: '【法律之眼】可以要求一位玩家如实回答"是否"类问题一次。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus',
      },
      {
        id: 'r4', name: '索菲亚·医生',
        description: '古堡家庭医生，负责伯爵的"特殊治疗"。',
        background: '表面是家庭医生，实际上是伯爵的秘密私人医生，为他提供各种处方药物。知道伯爵的真实健康状况，以及他正在服用的药物清单。',
        skill: '【药理知识】可以判断某条线索是否与"药物"或"中毒"有关。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia',
      },
      {
        id: 'r5', name: '雷蒙德·厨师',
        description: '古堡主厨，晚宴的所有菜品都出自他手。',
        background: '曾在米其林三星餐厅工作，被伯爵高价挖来。三个月前发现伯爵拖欠他的工资，而且伯爵还在他的菜品中下毒陷害竞争对手餐厅。',
        skill: '【味觉敏锐】可以判断晚宴的某道菜是否被"动过手脚"。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=raymond',
      },
      {
        id: 'r6', name: '莉莉安·记者',
        description: '调查记者，正在暗中调查伯爵的洗钱丑闻。',
        background: '跟踪调查伯爵已经两年，掌握了他大量洗钱证据。晚宴当晚原本计划与线人接头获取最后一份证据，但线人迟迟未到。',
        skill: '【深度调查】可以要求查看任意一位玩家的"隐藏秘密"（每人都有一个未写在角色卡上的秘密）。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lillian',
      },
    ],
    clues: [
      { id: 'c1', title: '书房毒酒', content: '书房的酒杯中检测出剧毒物质"铊"，与伯爵体内毒物一致。酒杯上有两个不同的指纹。', type: 'physical' },
      { id: 'c2', title: '艾琳娜画室', content: '画室中发现大量未寄出的威胁信，内容都是要求伯爵兑现资助承诺。最上面写着："这是你最后一次机会。"', type: 'document' },
      { id: 'c3', title: '马库斯的公文包', content: '公文包里有一份被撕毁的合同草稿，上面写着："如果维克多死亡，所有资产将..."剩余部分不见了。', type: 'document' },
      { id: 'c4', title: '索菲亚的药柜', content: '药柜中发现一瓶标有"铊化合物"的药品，但登记簿显示这瓶药一周前就应该用完了。', type: 'physical' },
      { id: 'c5', title: '厨房监控', content: '厨房监控显示雷蒙德在晚宴前独自在厨房待了20分钟，期间他反复尝了几道菜。', type: 'digital' },
      { id: 'c6', title: '莉莉安的录音笔', content: '录音笔中有一段未公开的对话："线人：伯爵今晚会被处理掉。莉莉安：谁？线人：到时候你就知道了。"', type: 'digital' },
      { id: 'c7', title: '伯爵的遗书', content: '书桌抽屉中有一封未寄出的遗书，上面写着："如果我遭遇不测，凶手一定是..."后面的名字被墨水涂掉了。', type: 'document' },
      { id: 'c8', title: '管家证词', content: '管家声称在晚宴期间，他看到索菲亚医生在书房附近徘徊，时间是伯爵死亡前30分钟。', type: 'testimony' },
    ],
    truth: '索菲亚医生是真凶。她长期为伯爵提供非法药物，知道伯爵有收藏毒药的习惯。案发当晚，她利用了伯爵收藏的那瓶铊化合物，趁晚宴混乱时在伯爵的酒杯中下毒。她之所以这么做，是因为伯爵威胁要公开她非法售药的证据，毁掉她的职业生涯。她提前一周从药柜"取走"了铊化合物，制造了药物用完的假象。',
  },
  {
    id: 'script2',
    title: '星际迷航号',
    type: '科幻推理',
    players: 5,
    duration: '45分钟',
    difficulty: '新手',
    description: '星际迷航号飞船在前往开普勒-452b的途中，船长室突然响起警报——首席科学家林博士被发现死在实验室，死因是缺氧窒息。飞船正穿越小行星带无法掉头返航，凶手就在五名船员之中...',
    cover: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=400&fit=crop',
    roles: [
      {
        id: 'r7', name: '林博士（死者）',
        description: '首席科学家，负责本次航行的核心科研项目。',
        background: '发现了能够改变人类能源格局的新物质"星核晶"，正准备返航后发表成果。近期与多名船员因成果归属问题产生争执。',
        skill: '【科研遗产】可以查看任意玩家的背景中是否提到"科研成果"或"论文"。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lin',
      },
      {
        id: 'r8', name: '凯舰长',
        description: '飞船舰长，航行的最高指挥官。',
        background: '三年前因一次指挥失误导致船员伤亡，被林博士在听证会上作证指控。虽然保住了职位，但晋升之路被彻底堵死。',
        skill: '【指挥权限】可以要求查看飞船任意区域的监控记录（限一次）。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kai',
      },
      {
        id: 'r9', name: '诺瓦工程师',
        description: '飞船工程师，负责所有舱室的生命维持系统。',
        background: '发现了林博士的"星核晶"项目存在重大安全隐患，写了一份内部报告却石沉大海。如果项目继续，整个飞船都有危险。',
        skill: '【系统破解】可以查看任意舱室的"系统日志"，了解案发前后的环境变化。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nova',
      },
      {
        id: 'r10', name: '艾伦通讯员',
        description: '通讯员，负责飞船与地球的通讯联络。',
        background: ' secretly sending research data to a rival corporation.林博士发现了他出卖数据的证据，准备返航后举报他。',
        skill: '【信号拦截】可以查看任意玩家在案发前后是否有"异常通讯记录"。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=allen',
      },
      {
        id: 'r11', name: '薇拉医生',
        description: '船医，负责船员的健康监测。',
        background: '与林博士是大学同学，曾经合作发表过多篇论文。但林博士最近一篇重要论文中没有署名她，导致她失去了晋升机会。',
        skill: '【医疗诊断】可以判断死者的真实死亡时间（精确到15分钟内）。',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vera',
      },
    ],
    clues: [
      { id: 'c9', title: '实验室氧气阀', content: '实验室的氧气供应阀门被人为关闭，关闭时间大约是死亡前10分钟。只有工程师和舰长有权限操作。', type: 'physical' },
      { id: 'c10', title: '林博士的平板', content: '平板上最后打开的文件是一封举报信，内容涉及"艾伦出卖科研数据给星际集团"。文件未发送。', type: 'digital' },
      { id: 'c11', title: '薇拉的日记', content: '日记中写到："他又一次背叛了我。这次我不会再忍下去了。我会让他付出代价——用他自己的方式。"日期是案发前一天。', type: 'document' },
      { id: 'c12', title: '舰长室通讯记录', content: '舰长在案发前20分钟收到了一条来自地球的加密信息，内容只有三个字："处理掉"。', type: 'digital' },
      { id: 'c13', title: '工程师工具箱', content: '工程师的工具箱中发现了一个小型氧气阻断装置，可以用来远程关闭特定舱室的氧气供应。', type: 'physical' },
      { id: 'c14', title: '实验室门禁日志', content: '案发前后30分钟内，进入实验室的人员有：林博士（本人）、薇拉医生（死亡前25分钟）、艾伦通讯员（死亡前15分钟）。', type: 'digital' },
    ],
    truth: '艾伦通讯员是真凶。他一直在向竞争对手星际集团出卖科研数据，被林博士发现后面临被举报的风险。案发当天，他利用自己通讯员的权限，趁薇拉医生离开实验室的间隙，利用偷偷制作的氧气阻断装置远程关闭了实验室的氧气供应。他之所以选择这种方式，是因为只有工程师和舰长才会被怀疑有权限操作氧气阀门——而他作为一个通讯员，表面上没有这个权限。',
  },
];

// ===== GAME ROOMS =====
export const MOCK_GAME_ROOMS: GameRoom[] = [
  { id: 'gr1', gameType: '海龟汤', host: '星际旅者', players: 3, maxPlayers: 8, status: 'waiting' },
  { id: 'gr2', gameType: '谁是卧底', host: '霓虹甜心', players: 5, maxPlayers: 8, status: 'waiting' },
  { id: 'gr3', gameType: '飞行棋', host: '像素诗人', players: 2, maxPlayers: 4, status: 'waiting' },
  { id: 'gr4', gameType: '海龟汤', host: '云端漫步', players: 1, maxPlayers: 8, status: 'waiting' },
];

// Turtle soup puzzles (8 puzzles)
export const MOCK_TURTLE_SOUPS = [
  {
    id: 'ts1',
    title: '雨夜归人',
    scenario: '一个男人在雨夜开车回家，途中看到路边有一个招手的女人。他停车让女人上了车。开了一段路后，他回头看后座，发现女人不见了。他吓得魂飞魄散，立刻开车去了警察局。第二天，他在新闻上看到了一则消息，悲痛欲绝。',
    answer: '那个女人是要搭车去医院的孕妇，她在车里生下了孩子后突然昏迷。男人以为见鬼了所以去报警。新闻上说医院附近发生了一起车祸，一位孕妇在雨夜走失，因失血过多不幸身亡。男人意识到如果他当时直接送女人去医院而不是去警察局，她可能不会死。',
    difficulty: '中等',
  },
  {
    id: 'ts2',
    title: '完美的早餐',
    scenario: '一位女士每天为丈夫准备完全相同的早餐：两个煎蛋、两片吐司、一杯橙汁。某天早上，丈夫看了一眼早餐，立刻报警说妻子失踪了。',
    answer: '妻子每天准备的早餐都是"两个煎蛋、两片吐司、一杯橙汁"，但那天早上煎蛋只有一个。丈夫知道妻子绝对不会忘记这个细节——她对丈夫的早餐极其讲究。唯一的可能性是有人冒充妻子准备了早餐，而真正的妻子已经失踪了。',
    difficulty: '简单',
  },
  {
    id: 'ts3',
    title: '最后一通电话',
    scenario: '一个男人在深夜接到一通电话，对方只说了一句"我到了"就挂断了。男人看完来电显示后，立刻穿上衣服冲出家门，开车去了机场。到达机场后，他看到了一个人，跪在地上痛哭。',
    answer: '男人的妻子在一年前的一场空难中失踪了，至今没有找到遗体。那通电话正是从妻子手机上打来的——虽然只说了"我到了"，但男人认出了她的声音。他去机场是因为那是妻子航班的目的地，而他在机场看到的是妻子的遗体终于被找到了。',
    difficulty: '困难',
  },
  {
    id: 'ts4',
    title: '微笑的尸体',
    scenario: '一个男人被发现死在自己的公寓里，脸上带着诡异的微笑。房间里没有任何打斗痕迹，门窗都完好无损。桌上有一杯已经凉透的咖啡和一本翻到一半的侦探小说。警方判定为自杀。',
    answer: '男人是一位业余侦探小说作家，他正在创作一部"完美谋杀"的小说。为了体验角色的感受，他按照小说中描述的方法自杀了——服下了一种毒药，这种毒药会让人在死前产生强烈的欣快感。桌上的咖啡和侦探小说都是他为自己设计的"临终场景"。',
    difficulty: '中等',
  },
  {
    id: 'ts5',
    title: '音乐会上的死亡',
    scenario: '一场音乐会上，小提琴手在演奏一首悲伤的曲子时突然倒地身亡。观众都以为他是太过投入而晕倒，但法医鉴定他是中毒死亡。毒药是通过皮肤吸收的，而小提琴手在演出前只碰过三样东西：自己的小提琴、一杯水、和指挥家握过的手。',
    answer: '毒药涂在指挥家的手上，当指挥家与小提琴手握手时，毒素通过皮肤吸收进入体内。更精妙的是，指挥家戴了手套——毒药涂在手背上，握手时手背接触小提琴手的掌心。指挥家是凶手，他嫉妒小提琴手的才华已久。',
    difficulty: '困难',
  },
  {
    id: 'ts6',
    title: '最后的旅行',
    scenario: '一对情侣去海边旅行。晚上，男人独自去海边散步，回来后告诉女人他看到了"最美的月光"。第二天早上，女人被发现死在房间里，而男人失踪了。房间里有一张纸条写着："月光让她变成了泡沫。"',
    answer: '女人患有严重的精神疾病，她对"海的女儿"童话有着病态的执念，相信自己会在月光下变成泡沫消失。男人知道这一点，那晚带她去看海时故意让她看到月光下的海面。女人趁男人睡着后，自己走到海里溺水身亡。男人的纸条是对她执念的最后回应。',
    difficulty: '困难',
  },
  {
    id: 'ts7',
    title: '电梯里的陌生人',
    scenario: '一个女人每天下班都会独自乘坐公寓电梯到15楼。某天晚上，一个陌生男人走进电梯，按了14楼。电梯上升时，女人一直盯着楼层显示屏，一言不发。到了14楼，男人走出电梯，回头对女人说："谢谢你没有尖叫。"女人这才反应过来，瘫软在地。',
    answer: '这个男人其实是一位便衣警察，正在追捕一名通缉犯。他知道通缉犯就藏在这栋楼的14楼。当他进入电梯时，发现女人面如死灰，意识到女人可能已经被通缉犯威胁过。他按14楼是为了让通缉犯以为他是普通住户。女人之所以"没有尖叫"，是因为通缉犯威胁她："如果你敢呼救，我就杀了你全家。"她刚才一直在犹豫要不要报警。',
    difficulty: '中等',
  },
  {
    id: 'ts8',
    title: '圣诞礼物',
    scenario: '圣诞节早上，一个男孩打开礼物盒，看到里面有一只死老鼠，他开心地笑了。他的母亲看到后却惊恐地尖叫起来，立刻报了警。',
    answer: '男孩患有严重的心脏病，需要进行心脏移植手术。男孩知道家里养的老鼠"小白"和他有着相同罕见血型（老鼠也有血型系统，且某些实验用鼠被培育出类似人类的血型特征）。男孩一直在等待一颗合适的心脏，而小白就是他最后的希望。圣诞礼物盒里的死老鼠意味着有人杀死了小白——也就是摧毁了他活下去的唯一希望。',
    difficulty: '困难',
  },
];

// Sample werewolf words (expanded)
export const MOCK_WEREWOLF_WORDS = [
  { civilian: '苹果', spy: '梨' },
  { civilian: '咖啡', spy: '茶' },
  { civilian: '飞机', spy: '高铁' },
  { civilian: '夏天', spy: '春天' },
  { civilian: '猫', spy: '狗' },
  { civilian: '汉堡', spy: '三明治' },
  { civilian: '足球', spy: '篮球' },
  { civilian: '钢琴', spy: '吉他' },
  { civilian: '玫瑰', spy: '百合' },
  { civilian: '太阳', spy: '月亮' },
  { civilian: '火锅', spy: '烧烤' },
  { civilian: '冰箱', spy: '空调' },
  { civilian: '手机', spy: '电脑' },
  { civilian: '眼镜', spy: '墨镜' },
  { civilian: '口红', spy: '眼影' },
];

// Cinema chat messages
export const MOCK_CINEMA_MESSAGES: ChatMessage[] = [
  { id: 'cm1', userId: 'system', username: '系统', avatar: '', content: '欢迎进入《星际穿越》观影房间！电影将在10分钟后开始。', type: 'system', timestamp: '13:50' },
  { id: 'cm2', userId: 'f1', username: '星际旅者', avatar: MOCK_FRIENDS[0].avatar, content: '超期待这部！已经三刷了但还是想看', type: 'normal', timestamp: '13:51' },
  { id: 'cm3', userId: 'f2', username: '像素诗人', avatar: MOCK_FRIENDS[1].avatar, content: '第一次看，听说很震撼', type: 'normal', timestamp: '13:52' },
  { id: 'cm4', userId: 'f3', username: '霓虹甜心', avatar: MOCK_FRIENDS[2].avatar, content: '汉斯的配乐太绝了，光是音乐就值得', type: 'normal', timestamp: '13:53' },
  { id: 'cm5', userId: 'f2', username: '像素诗人', avatar: MOCK_FRIENDS[1].avatar, content: '那种父女跨越时空的情感，看完不哭算我输', type: 'normal', timestamp: '13:54' },
];

// Murder mystery chat messages (AI DM + players) - enhanced with more guidance
export const MOCK_MM_MESSAGES: ChatMessage[] = [
  { id: 'mm1', userId: 'dm', username: 'AI DM', avatar: '', content: '欢迎各位登船/入堡。我是本次游戏的AI管理员。很遗憾地通知大家，现场发生了不幸的事件——有人在你们之中是凶手。', type: 'system', timestamp: '14:00' },
  { id: 'mm2', userId: 'dm', username: 'AI DM', avatar: '', content: '【角色分配完成】请大家查看自己的角色卡和秘密任务。记住：不要轻易相信任何人，包括你自己。', type: 'system', timestamp: '14:01' },
  { id: 'mm3', userId: 'dm', username: 'AI DM', avatar: '', content: '【游戏提示】第一轮讨论即将开始。请依次介绍自己，并描述案发时你在做什么、在哪里。从左边第一位玩家开始。', type: 'system', timestamp: '14:02' },
  { id: 'mm4', userId: 'f1', username: '星际旅者(艾琳娜)', avatar: MOCK_FRIENDS[0].avatar, content: '我当时在画室里准备明天的画展作品，大概待了两个小时。', type: 'normal', timestamp: '14:03' },
  { id: 'mm5', userId: 'f2', username: '像素诗人(马库斯)', avatar: MOCK_FRIENDS[1].avatar, content: '我在书房整理伯爵的法律文件，期间去了两次洗手间。', type: 'normal', timestamp: '14:04' },
];

// Friend requests
export const MOCK_FRIEND_REQUESTS = [
  { id: 'req1', username: '美食猎手', avatar: MOCK_SUGGESTED_FRIENDS[0].avatar, message: '你好！看到你的美食内容很喜欢，可以加个好友吗？', timestamp: '10分钟前' },
];
