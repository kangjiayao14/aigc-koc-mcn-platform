import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { glmChat } from '@/services/glmClient';
import {
  Heart, MessageCircle, Bookmark, Share2, Plus, X, ChevronLeft,
  Send, UserPlus, Mail, Check, Flame, TrendingUp, Compass, Sparkles,
  Coffee, Laptop, Plane, Shirt, Briefcase,
} from 'lucide-react';

// =============================================================================
// Types
// =============================================================================
interface Post {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  authorBio: string;
  likes: number;
  cover: string;
  category: string;
  content: string;
  comments: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  likes: number;
}

interface AuthorProfile {
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  likes: number;
  posts: number;
  isFollowing: boolean;
  postCovers: string[];
}

interface FavoriteItem {
  id: number;
  savedAt: number;
  title: string;
  author: string;
  category: string;
  cover: string;
  content: string;
}

const FAVORITES_KEY = 'pcg_favorites_v1';

function loadFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const arr = Array.isArray(parsed) ? parsed : parsed ? [parsed] : [];
    return arr
      .map((x: any) => ({
        id: Number(x?.id),
        savedAt: Number(x?.savedAt || Date.now()),
        title: String(x?.title || ''),
        author: String(x?.author || ''),
        category: String(x?.category || ''),
        cover: String(x?.cover || ''),
        content: String(x?.content || ''),
      }))
      .filter((x: any) => Number.isFinite(x.id) && x.title);
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {}
}

// =============================================================================
// Data
// =============================================================================
const TAGS = [
  { key: 'recommend', label: '推荐', icon: Compass },
  { key: 'follow', label: '关注', icon: UserPlus },
  { key: 'hot', label: '热门', icon: Flame },
  { key: 'food', label: '美食', icon: Coffee },
  { key: 'tech', label: '科技', icon: Laptop },
  { key: 'travel', label: '旅行', icon: Plane },
  { key: 'fashion', label: '穿搭', icon: Shirt },
  { key: 'career', label: '职场', icon: Briefcase },
];

const POSTS: Post[] = [
  {
    id: 1, title: '上海隐藏美食地图｜这5家店不排队', author: '美食探店酱',
    authorAvatar: '/avatar-default.png', authorBio: '专注挖掘城市角落里的美味',
    likes: 2341, cover: '/sample-post-cover-1.jpg',
    category: '美食',
    content: '如果你也讨厌“排队两小时、吃饭十分钟”，这篇给你一份不卷的上海小馆清单。\n\n我只按3个标准选：出品稳定｜环境不吵｜一个人也能吃。\n1）××路的日式小店：午市套餐很顶\n2）巷子里的牛肉粉：汤底干净，辣椒香\n3）社区面包房：可颂酥到掉渣\n4）港式烧腊：皮脆，别点错部位\n5）夜宵小龙虾：不踩雷的口味组合\n\n想要具体地址？评论区告诉我你在哪个区。',
    comments: [
      { id: 1, author: '吃货小王', avatar: '/avatar-default.png', text: '第一家我去过，真的绝了！', likes: 45 },
      { id: 2, author: '美食雷达', avatar: '/avatar-default.png', text: '收藏了，周末就冲！', likes: 32 },
      { id: 3, author: '魔都土著', avatar: '/avatar-default.png', text: '老上海味道才是yyds', likes: 28 },
    ]
  },
  {
    id: 2, title: '2024年最值得入手的数码产品Top10', author: '科技评测君',
    authorAvatar: '/avatar-default.png', authorBio: '数码产品第一手深度评测',
    likes: 4567, cover: '/sample-post-cover-2.jpg',
    category: '科技',
    content: '今年的数码“真香”不在于配置堆多高，而是有没有把你每天的麻烦减少一点。\n\n我按【提升体验/性价比/后悔概率】三个维度排了Top10：\n- 预算友好：买了就能用上的\n- 中高端：体验提升最明显的\n- 生产力：对工作流有实际帮助的\n\n如果你愿意告诉我：你的手机型号/使用习惯/预算，我可以把Top10缩成你个人的Top3。',
    comments: [
      { id: 1, author: '数码控', avatar: '/avatar-default.png', text: '第三名刚入手，确实香', likes: 67 },
      { id: 2, author: '等等党', avatar: '/avatar-default.png', text: '等双11降价再冲', likes: 23 },
    ]
  },
  {
    id: 3, title: '川西小环线7天自驾攻略｜附路线图', author: '旅行日记',
    authorAvatar: '/avatar-default.png', authorBio: '用脚步丈量世界，记录每一次出发',
    likes: 6789, cover: '/sample-post-cover-3.jpg',
    category: '旅行',
    content: '川西小环线我走了两次，第二次终于不“人车都累”。\n\n这份7天路线我按“海拔爬升”重新排过：\nDay1 成都→康定（适应）\nDay2 折多山→新都桥（日落机位）\nDay3 理塘（别急着洗头）\nDay4 稻城亚丁（体力预留）\nDay5-7 返程沿途补景点\n\n补充：加油站、卫生间、路况、住宿坑位我都标了。\n想要路线图和清单，评论区打“川西”。',
    comments: [
      { id: 1, author: '背包客', avatar: '/avatar-default.png', text: '路线图太实用了，已保存', likes: 56 },
      { id: 2, author: '摄影爱好者', avatar: '/avatar-default.png', text: '第5天的日落机位绝了', likes: 41 },
      { id: 3, author: '自驾达人', avatar: '/avatar-default.png', text: '路况信息很准确，谢谢分享', likes: 19 },
    ]
  },
  {
    id: 4, title: '小个子女生穿搭｜显腿长秘籍公开', author: '穿搭研究所',
    authorAvatar: '/avatar-default.png', authorBio: '小个子也有大气场',
    likes: 3456, cover: '/sample-post-cover-4.jpg',
    category: '穿搭',
    content: '小个子显高显腿长，不靠“穿高跟”，靠比例。\n\n我自己踩过的坑：\n- 上衣太长：直接把腿吃掉\n- 裤脚堆褶：视觉更矮\n- 外套没腰线：整个人变成一块\n\n三条最快的改法：\n1）上短下长（或者塞一点前摆）\n2）同色系拉长（鞋子别断层）\n3）把视觉重心抬高（领口/配饰/发型）\n\n你把身高+常穿风格告诉我，我给你配一套“通勤/约会/周末”三套模板。',
    comments: [
      { id: 1, author: '小个子联盟', avatar: '/avatar-default.png', text: '学到了！明天就试试', likes: 88 },
      { id: 2, author: '时尚小白', avatar: '/avatar-default.png', text: '这个博主太宝藏了', likes: 45 },
    ]
  },
  {
    id: 5, title: 'ChatGPT提示词工程｜效率提升300%', author: 'AI工具箱',
    authorAvatar: '/avatar-default.png', authorBio: '让AI成为你的超级助手',
    likes: 1234, cover: '/sample-post-cover-1.jpg',
    category: '职场',
    content: '提示词工程的重点不是“写得花”，是让模型知道你要什么、不要什么。\n\n我常用的工作流（真能省时间）：\n1）先给角色：你是谁（PM/运营/老师）\n2）再给任务：输出什么（表格/脚本/提纲）\n3）给约束：长度/语气/禁用词\n4）给例子：一段你满意的参考\n\n你把你现在最烦的一件事（写周报/想标题/做竞品）发我，我给你一套可复用prompt。',
    comments: [
      { id: 1, author: '产品经理', avatar: '/avatar-default.png', text: '第五步真的打开了新世界', likes: 112 },
      { id: 2, author: '运营小哥', avatar: '/avatar-default.png', text: '已经转发给全组了', likes: 34 },
    ]
  },
  {
    id: 6, title: '深圳租房避坑指南｜应届生必看', author: '职场小白',
    authorAvatar: '/avatar-default.png', authorBio: '应届生职场生存实录',
    likes: 890, cover: '/sample-post-cover-2.jpg',
    category: '职场',
    content: '深圳租房这事儿，最贵的不一定是房租，是“隐形成本”。\n\n我把应届生最容易踩的坑按优先级写清楚：\n1）合同里这3句一定要改（不然押金很难要回）\n2）合租看房的5个细节（噪音/漏水/电表/室友作息/隔断）\n3）通勤时间怎么测才准（别只看地图）\n\n最后给一个实用建议：先把“公司/地铁/预算”三角定死，再谈小确幸。',
    comments: [
      { id: 1, author: '深漂一族', avatar: '/avatar-default.png', text: '第三条血的教训', likes: 56 },
      { id: 2, author: 'HR小姐姐', avatar: '/avatar-default.png', text: '可以转发给新来的实习生', likes: 23 },
    ]
  },
  {
    id: 7, title: '一人食简餐｜10分钟搞定美味', author: '美食日记',
    authorAvatar: '/avatar-default.png', authorBio: '一个人也要好好吃饭',
    likes: 1567, cover: '/sample-post-cover-3.jpg',
    category: '美食',
    content: '今天的10分钟一人食：\n\n【番茄金枪鱼蛋拌饭】\n- 2个鸡蛋先炒到半凝固\n- 番茄下锅出汁，加一点点盐和黑胡椒\n- 罐头金枪鱼倒进去翻两下\n- 最后把蛋回锅，关火拌匀\n\n优点：几乎不翻车、油不多、洗碗也少。\n如果你跟我一样下班只想“快点吃点好的”，这套真的救命。',
    comments: [
      { id: 1, author: '独居青年', avatar: '/avatar-default.png', text: '昨天试做了第二道，巨好吃', likes: 45 },
      { id: 2, author: '厨房杀手', avatar: '/avatar-default.png', text: '终于有我能做的菜了', likes: 67 },
    ]
  },
  {
    id: 8, title: '星巴克隐藏菜单｜店员私藏配方', author: '咖啡研究所',
    authorAvatar: '/avatar-default.png', authorBio: '咖啡是成年人的合法兴奋剂',
    likes: 2890, cover: '/sample-post-cover-4.jpg',
    category: '美食',
    content: '这不是“玄学隐藏菜单”，是我自己点了十几次后留下的稳定配方。\n\n3个不尴尬的点单话术：\n1）拿铁 + 少糖香草 + 额外一份浓缩（适合熬夜）\n2）美式 + 冰块少一点 + 柠檬片（夏天超清爽）\n3）燕麦拿铁 + 肉桂粉（口感会更厚）\n\n别怕麻烦店员：把需求说清楚，他们其实很专业。',
    comments: [
      { id: 1, author: ' caffeine依赖', avatar: '/avatar-default.png', text: '第三款我点了半年了', likes: 34 },
      { id: 2, author: '咖啡萌新', avatar: '/avatar-default.png', text: '明天就去试试', likes: 12 },
    ]
  },
  {
    id: 9, title: 'iPhone15 Pro三个月真实体验', author: '数码控',
    authorAvatar: '/avatar-default.png', authorBio: '数码产品深度体验者',
    likes: 2345, cover: '/sample-post-cover-1.jpg',
    category: '科技',
    content: '用了三个月，我想说一句：这台机器“很强”，但你不一定需要。\n\n我只讲真实使用场景：\n- 相机：夜景提升明显，但你得会构图，不然还是“很普通”\n- 续航：重度拍照+导航，下午一定要补电\n- 发热：高负载（拍视频/游戏）还是会热，壳厚一点更明显\n\n如果你现在是14 Pro：等一等；如果是12/13：体验跃迁会很爽。',
    comments: [
      { id: 1, author: '果粉', avatar: '/avatar-default.png', text: '续航真的是痛点', likes: 89 },
      { id: 2, author: '安卓党', avatar: '/avatar-default.png', text: '拍照确实还是苹果强', likes: 56 },
    ]
  },
  {
    id: 10, title: '大理旅居一个月花费多少？', author: '穷游日记',
    authorAvatar: '/avatar-default.png', authorBio: '用最少的钱看最美的风景',
    likes: 678, cover: '/sample-post-cover-2.jpg',
    category: '旅行',
    content: '我把大理旅居一个月的账单摊开了：\n\n- 房租：××××（我选了离古城远一点的）\n- 吃饭：早餐/咖啡/正餐大概是这样分布\n- 交通：电动车 + 打车的真实成本\n- “隐形花费”：临时买衣服/门票/社交\n\n结论：省钱不是不花钱，是把钱花在你真正想要的体验上。\n如果你也想旅居，先回答自己一个问题：你想逃离什么？又想靠近什么？',
    comments: [
      { id: 1, author: '数字游民', avatar: '/avatar-default.png', text: '比我想象的便宜啊', likes: 23 },
      { id: 2, author: '打工人', avatar: '/avatar-default.png', text: '看完直接请假买机票', likes: 45 },
    ]
  },
  {
    id: 11, title: '面试穿搭指南｜不同行业怎么穿', author: '职场穿搭',
    authorAvatar: '/avatar-default.png', authorBio: '穿对衣服，面试成功一半',
    likes: 1234, cover: '/sample-post-cover-3.jpg',
    category: '职场',
    content: '面试穿搭不是“穿贵”，是“降低不确定性”。\n\n我总结了三套不会出错的搭配（男/女都能套用）：\n- 互联网：干净利落 + 一点点设计感（别过度正式）\n- 金融/咨询：正装上限更高，但合身比牌子重要\n- 制造业/国企：稳重、低饱和、鞋子必须干净\n\n最后一句：你要让面试官记住你的能力，而不是你那件太抢戏的衣服。',
    comments: [
      { id: 1, author: '应届生', avatar: '/avatar-default.png', text: '互联网公司那条太真实了', likes: 67 },
      { id: 2, author: 'HR总监', avatar: '/avatar-default.png', text: '金融行业那条说到点子上了', likes: 34 },
    ]
  },
  {
    id: 12, title: '打工人早餐｜5分钟快手营养餐', author: '早餐研究所',
    authorAvatar: '/avatar-default.png', authorBio: '美好的一天从早餐开始',
    likes: 890, cover: '/sample-post-cover-4.jpg',
    category: '美食',
    content: '早八人的早餐不需要“精致”，需要“稳定”。\n\n我这周循环的3个组合：\n1）燕麦杯（前一晚装好）+ 水果\n2）鸡蛋 + 全麦吐司 + 一点花生酱\n3）酸奶 + 坚果 + 一小把蓝莓\n\n核心是：蛋白质先到位，上午情绪就稳。\n不想早起做饭的，照抄就行。',
    comments: [
      { id: 1, author: '早八人', avatar: '/avatar-default.png', text: '三明治那个真的只要5分钟', likes: 23 },
      { id: 2, author: '养生党', avatar: '/avatar-default.png', text: '燕麦杯我已经连吃一周了', likes: 45 },
    ]
  },
  {
    id: 13, title: '2024年最火发色｜显白不挑皮', author: '美妆博主小鹿',
    authorAvatar: '/avatar-default.png', authorBio: '爱美是女生的终身事业',
    likes: 4567, cover: '/sample-post-cover-1.jpg',
    category: '穿搭',
    content: '想显白，不是找“最浅的色”，是找“对黄皮友好”的底色。\n\n我把今年最常被问的3个方向写清楚：\n- 低饱和茶棕：不挑皮，素颜也能撑住\n- 冷调巧克力：高级但要看肤色偏黄还是偏灰\n- 玫瑰棕：想要氛围感但又怕翻车的首选\n\n建议：先把发色和你常穿的衣服色系对齐（黑白灰/大地色/彩色），会更耐看。',
    comments: [
      { id: 1, author: '黄皮姐妹', avatar: '/avatar-default.png', text: '第三种发色我已经染了，巨显白', likes: 89 },
      { id: 2, author: 'Tony老师', avatar: '/avatar-default.png', text: '专业，这些色号确实热门', likes: 45 },
    ]
  },
  {
    id: 14, title: '30天减脂计划｜附每日食谱', author: '健身教练阿杰',
    authorAvatar: '/avatar-default.png', authorBio: '科学健身，健康第一',
    likes: 6789, cover: '/sample-post-cover-2.jpg',
    category: '美妆',
    content: '这是一篇关于美妆的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '减肥中', avatar: '/avatar-default.png', text: '第15天瘦了4斤，食谱太好用了', likes: 156 },
      { id: 2, author: '健身小白', avatar: '/avatar-default.png', text: '无氧那部分对新手很友好', likes: 67 },
    ]
  },
  {
    id: 15, title: '东京自由行｜7天深度游路线', author: '旅行达人CC',
    authorAvatar: '/avatar-default.png', authorBio: '旅行是唯一买了不后悔的东西',
    likes: 3456, cover: '/sample-post-cover-3.jpg',
    category: '健身',
    content: '这是一篇关于健身的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '樱花控', avatar: '/avatar-default.png', text: '浅草寺那家店我吃过，确实推荐', likes: 34 },
      { id: 2, author: '日语学习者', avatar: '/avatar-default.png', text: '交通攻略太详细了', likes: 56 },
    ]
  },
  {
    id: 16, title: 'MacBook配件清单｜必买10件', author: '数码评测君',
    authorAvatar: '/avatar-default.png', authorBio: '数码产品第一手深度评测',
    likes: 2345, cover: '/sample-post-cover-4.jpg',
    category: '科技',
    content: 'MacBook 真正提升幸福感的不是“更贵的扩展坞”，而是能把你的桌面变得更顺手。\n\n我按优先级推荐：\n1）一个靠谱的扩展坞（别贪便宜）\n2）支架 + 外接键鼠（颈椎真的会感谢你）\n3）移动硬盘/网盘策略（别等丢文件才后悔）\n\n配件买少点，但每一件都要解决一个明确的痛点。',
    comments: [
      { id: 1, author: '果粉', avatar: '/avatar-default.png', text: '支架那款我已经用了两年了', likes: 45 },
      { id: 2, author: '程序员', avatar: '/avatar-default.png', text: '机械键盘推荐很到位', likes: 23 },
    ]
  },
  {
    id: 17, title: '职场新人避坑｜HR不会说的真相', author: '职场老鸟',
    authorAvatar: '/avatar-default.png', authorBio: '十年职场，一路踩坑',
    likes: 5678, cover: '/sample-post-cover-1.jpg',
    category: '美食',
    content: '这是一篇关于美食的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '实习生', avatar: '/avatar-default.png', text: '第三条差点就中招了', likes: 89 },
      { id: 2, author: 'HR总监', avatar: '/avatar-default.png', text: '作为HR表示他说的是真的', likes: 234 },
    ]
  },
  {
    id: 18, title: '手残党也能做的5道家常菜', author: '厨房新手',
    authorAvatar: '/avatar-default.png', authorBio: '从零开始的厨房冒险',
    likes: 1234, cover: '/sample-post-cover-2.jpg',
    category: '美食',
    content: '我以前也觉得做饭很难，后来发现：难的是“同时做很多事”。\n\n这5道我按“翻车率”排过序：\n1）番茄炒蛋（先炒蛋再炒番茄）\n2）土豆炖牛腩（炖就完了）\n3）蒸鸡腿（调味+蒸）\n4）炒青菜（火大、动作快）\n5）咖喱饭（万能救场）\n\n你先从第一道开始，真的能建立信心。',
    comments: [
      { id: 1, author: '独居青年', avatar: '/avatar-default.png', text: '番茄炒蛋那个真的零失败', likes: 45 },
      { id: 2, author: '外卖党', avatar: '/avatar-default.png', text: '第一次做饭成功了！', likes: 67 },
    ]
  },
  {
    id: 19, title: '早秋穿搭｜3个万能搭配公式', author: '穿搭研究所',
    authorAvatar: '/avatar-default.png', authorBio: '小个子也有大气场',
    likes: 2890, cover: '/sample-post-cover-3.jpg',
    category: '旅行',
    content: '这是一篇关于旅行的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '学生党', avatar: '/avatar-default.png', text: '公式二太适合上课穿了', likes: 56 },
      { id: 2, author: '上班族', avatar: '/avatar-default.png', text: '公式三可以直接照搬', likes: 34 },
    ]
  },
  {
    id: 20, title: 'AI绘画入门｜Midjourney教程', author: 'AI工具箱',
    authorAvatar: '/avatar-default.png', authorBio: '让AI成为你的超级助手',
    likes: 1567, cover: '/sample-post-cover-4.jpg',
    category: '科技',
    content: '别把 Midjourney 当“玄学”，它更像一个很听话但需要你描述清楚的摄影师。\n\n我建议新手只记住一条：先把“主体/场景/光线/镜头”说清楚，再谈风格。\n\n一个能立刻用的模板：\n【主体】在【场景】，光线【柔/硬/逆光】，镜头【35mm/85mm】，风格【胶片/赛博/极简】，细节【材质/表情/背景元素】。\n\n把这套写熟，你就能稳定出图。',
    comments: [
      { id: 1, author: '设计师', avatar: '/avatar-default.png', text: 'prompt那部分讲得很清楚', likes: 78 },
      { id: 2, author: '插画师', avatar: '/avatar-default.png', text: '垫图技巧学到了', likes: 45 },
    ]
  },
  {
    id: 21, title: '考研经验分享｜3个月冲刺985', author: '学霸学姐',
    authorAvatar: '/avatar-default.png', authorBio: '考研上岸，分享方法',
    likes: 4567, cover: '/sample-post-cover-1.jpg',
    category: '职场',
    content: '这是一篇关于职场的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '考研党', avatar: '/avatar-default.png', text: '作息表我直接打印贴墙上了', likes: 123 },
      { id: 2, author: '二战生', avatar: '/avatar-default.png', text: '政治那部分讲得太好了', likes: 89 },
    ]
  },
  {
    id: 22, title: '情侣周末去哪玩｜8个宝藏地点', author: '恋爱日记',
    authorAvatar: '/avatar-default.png', authorBio: '记录我们的甜蜜日常',
    likes: 2345, cover: '/sample-post-cover-2.jpg',
    category: '美妆',
    content: '这是一篇关于美妆的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '恋爱中', avatar: '/avatar-default.png', text: '第6个地方我们上周刚去过', likes: 45 },
      { id: 2, author: '单身狗', avatar: '/avatar-default.png', text: '收藏了，等我有对象', likes: 67 },
    ]
  },
  {
    id: 23, title: '敏感肌护肤｜成分党必看', author: '成分控小美',
    authorAvatar: '/avatar-default.png', authorBio: '看懂成分，科学护肤',
    likes: 3456, cover: '/sample-post-cover-3.jpg',
    category: '健身',
    content: '这是一篇关于健身的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '敏感肌', avatar: '/avatar-default.png', text: '烟酰胺那段终于看懂了', likes: 78 },
      { id: 2, author: '皮肤科护士', avatar: '/avatar-default.png', text: '成分分析很专业', likes: 45 },
    ]
  },
  {
    id: 24, title: '居家健身｜无器械全身训练', author: '健身教练阿杰',
    authorAvatar: '/avatar-default.png', authorBio: '科学健身，健康第一',
    likes: 4567, cover: '/sample-post-cover-4.jpg',
    category: '生活',
    content: '这是一篇关于生活的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '居家办公', avatar: '/avatar-default.png', text: '每天午休做一组，太方便了', likes: 56 },
      { id: 2, author: '健身小白', avatar: '/avatar-default.png', text: '动作讲解很清晰', likes: 34 },
    ]
  },
  {
    id: 25, title: '网红甜品店测评｜这3家值得', author: '美食探店酱',
    authorAvatar: '/avatar-default.png', authorBio: '专注挖掘城市角落里的美味',
    likes: 1234, cover: '/sample-post-cover-1.jpg',
    category: '美食',
    content: '这是一篇关于美食的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '甜品控', avatar: '/avatar-default.png', text: '第一家提拉米苏绝了', likes: 45 },
      { id: 2, author: '卡路里', avatar: '/avatar-default.png', text: '看完就想去，不管了', likes: 23 },
    ]
  },
  {
    id: 26, title: '摄影构图技巧｜手机也能出大片', author: '摄影小白',
    authorAvatar: '/avatar-default.png', authorBio: '从零开始学摄影',
    likes: 2345, cover: '/sample-post-cover-2.jpg',
    category: '科技',
    content: '这是一篇关于科技的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '手机摄影', avatar: '/avatar-default.png', text: '三分法那张对比太明显了', likes: 67 },
      { id: 2, author: '单反党', avatar: '/avatar-default.png', text: '手机能拍成这样？服', likes: 45 },
    ]
  },
  {
    id: 27, title: '秋招面试复盘｜字节跳动面经', author: '职场小白',
    authorAvatar: '/avatar-default.png', authorBio: '应届生职场生存实录',
    likes: 6789, cover: '/sample-post-cover-3.jpg',
    category: '旅行',
    content: '这是一篇关于旅行的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '应届生', avatar: '/avatar-default.png', text: '算法那轮问的太深了', likes: 89 },
      { id: 2, author: '已上岸', avatar: '/avatar-default.png', text: 'HR面那部分我当年也是', likes: 56 },
    ]
  },
  {
    id: 28, title: 'ins风卧室改造｜500元搞定', author: '家居博主',
    authorAvatar: '/avatar-default.png', authorBio: '租房也要有仪式感',
    likes: 3456, cover: '/sample-post-cover-4.jpg',
    category: '穿搭',
    content: '这是一篇关于穿搭的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '租房党', avatar: '/avatar-default.png', text: '灯串那部分真的氛围感拉满', likes: 45 },
      { id: 2, author: '装修小白', avatar: '/avatar-default.png', text: '清单太实用了', likes: 67 },
    ]
  },
  {
    id: 29, title: 'Switch游戏推荐｜10款必玩', author: '游戏达人',
    authorAvatar: '/avatar-default.png', authorBio: '主机游戏深度玩家',
    likes: 4567, cover: '/sample-post-cover-1.jpg',
    category: '职场',
    content: '这是一篇关于职场的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '任豚', avatar: '/avatar-default.png', text: '塞尔达永远的神', likes: 123 },
      { id: 2, author: '情侣玩家', avatar: '/avatar-default.png', text: '双人成行确实神作', likes: 78 },
    ]
  },
  {
    id: 30, title: '轻断食指南｜一周瘦3斤', author: '营养师Lily',
    authorAvatar: '/avatar-default.png', authorBio: '吃出健康好身材',
    likes: 5678, cover: '/sample-post-cover-2.jpg',
    category: '美妆',
    content: '这是一篇关于美妆的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '减肥中', avatar: '/avatar-default.png', text: '第二天已经感觉轻盈了', likes: 89 },
      { id: 2, author: '医生', avatar: '/avatar-default.png', text: '这个断食法比较科学', likes: 156 },
    ]
  },
  {
    id: 31, title: '杭州小众景点｜避开人潮', author: '旅行日记',
    authorAvatar: '/avatar-default.png', authorBio: '用脚步丈量世界，记录每一次出发',
    likes: 2345, cover: '/sample-post-cover-3.jpg',
    category: '健身',
    content: '这是一篇关于健身的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '杭州土著', avatar: '/avatar-default.png', text: '本地人表示这些真的小众', likes: 45 },
      { id: 2, author: '周末游', avatar: '/avatar-default.png', text: '茶园那个地方太治愈了', likes: 67 },
    ]
  },
  {
    id: 32, title: '秋冬口红色号｜黄皮显白', author: '美妆博主小鹿',
    authorAvatar: '/avatar-default.png', authorBio: '爱美是女生的终身事业',
    likes: 4567, cover: '/sample-post-cover-4.jpg',
    category: '生活',
    content: '这是一篇关于生活的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '黄皮姐妹', avatar: '/avatar-default.png', text: '第二个色号我已经回购3次', likes: 78 },
      { id: 2, author: '美妆控', avatar: '/avatar-default.png', text: '试色对比图太准了', likes: 45 },
    ]
  },
  {
    id: 33, title: '网文写作技巧｜月入过万', author: '网文作者',
    authorAvatar: '/avatar-default.png', authorBio: '用文字编织世界',
    likes: 1234, cover: '/sample-post-cover-1.jpg',
    category: '美食',
    content: '这是一篇关于美食的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '写手', avatar: '/avatar-default.png', text: '黄金三章那部分启发很大', likes: 56 },
      { id: 2, author: '编辑', avatar: '/avatar-default.png', text: '确实，开头太重要了', likes: 34 },
    ]
  },
  {
    id: 34, title: '猫粮选购指南｜成分党必看', author: '铲屎官日记',
    authorAvatar: '/avatar-default.png', authorBio: '猫咪是家人',
    likes: 890, cover: '/sample-post-cover-2.jpg',
    category: '科技',
    content: '这是一篇关于科技的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '多猫家庭', avatar: '/avatar-default.png', text: '配料表那部分太实用了', likes: 45 },
      { id: 2, author: '兽医', avatar: '/avatar-default.png', text: '营养成分分析很专业', likes: 67 },
    ]
  },
  {
    id: 35, title: '冥想入门｜每天10分钟改变生活', author: '瑜伽老师',
    authorAvatar: '/avatar-default.png', authorBio: '身心合一，内外平衡',
    likes: 2345, cover: '/sample-post-cover-3.jpg',
    category: '旅行',
    content: '这是一篇关于旅行的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '焦虑党', avatar: '/avatar-default.png', text: '试了三天，睡眠质量改善了', likes: 78 },
      { id: 2, author: '程序员', avatar: '/avatar-default.png', text: '午休时冥想确实有效', likes: 45 },
    ]
  },
  {
    id: 36, title: '二手平台捡漏｜这些最值得买', author: '省钱达人',
    authorAvatar: '/avatar-default.png', authorBio: '花小钱办大事',
    likes: 1567, cover: '/sample-post-cover-4.jpg',
    category: '穿搭',
    content: '这是一篇关于穿搭的优质内容分享，希望能给你带来启发和收获！',
    comments: [
      { id: 1, author: '学生党', avatar: '/avatar-default.png', text: '相机那部分太真实了', likes: 56 },
      { id: 2, author: '数码控', avatar: '/avatar-default.png', text: '外设确实二手性价比高', likes: 34 },
    ]
  },
];

// Generate author profiles from posts
const AUTHOR_PROFILES: Record<string, AuthorProfile> = {};
POSTS.forEach((p) => {
  if (!AUTHOR_PROFILES[p.author]) {
    AUTHOR_PROFILES[p.author] = {
      name: p.author,
      avatar: p.authorAvatar,
      bio: p.authorBio,
      followers: Math.floor(Math.random() * 50000) + 5000,
      likes: Math.floor(Math.random() * 200000) + 50000,
      posts: Math.floor(Math.random() * 80) + 20,
      isFollowing: false,
      postCovers: [],
    };
  }
  AUTHOR_PROFILES[p.author].postCovers.push(p.cover);
});

// =============================================================================
// Components
// =============================================================================

/** Tag bar with horizontal scroll */
function TagBar({ activeTag, onTagChange }: { activeTag: string; onTagChange: (k: string) => void }) {
  return (
    <div className="sticky top-[72px] z-30 bg-void/90 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto scrollbar-hide">
        {TAGS.map((tag) => {
          const Icon = tag.icon;
          const isActive = activeTag === tag.key;
          return (
            <button
              key={tag.key}
              onClick={() => onTagChange(tag.key)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${
                isActive
                  ? 'text-void'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              data-cursor="pointer"
            >
              {isActive && (
                <motion.div
                  layoutId="feedTagIndicator"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: tag.key === 'hot' ? '#FF2A6D' : tag.key === 'food' ? '#39FF14' : '#00F0FF',
                    boxShadow: `0 0 16px ${tag.key === 'hot' ? '#FF2A6D60' : tag.key === 'food' ? '#39FF1460' : '#00F0FF60'}`,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Icon size={14} />
                {tag.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Single post card in waterfall */
function PostCard({ post, index, onOpen }: { post: Post; index: number; onOpen: (p: Post) => void }) {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="group cursor-pointer"
      onClick={() => onOpen(post)}
      data-cursor="pointer"
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/8 transition-all duration-300 hover:border-neon-cyan/30"
        style={{
          background: 'var(--void-light)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Cover image with aspect ratio */}
        <div className="relative overflow-hidden" style={{ aspectRatio: index % 3 === 0 ? '3/4' : index % 3 === 1 ? '1/1' : '4/5' }}>
          <img
            src={post.cover}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
          {/* Neon border glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.1)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
            }}
          />
        </div>

        {/* Card body */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-text-primary leading-snug line-clamp-2 mb-2 group-hover:text-neon-cyan transition-colors">
            {post.title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img
                src={post.authorAvatar}
                alt={post.author}
                className="w-5 h-5 rounded-full object-cover border border-white/10"
              />
              <span className="text-xs text-text-secondary truncate max-w-[80px]">{post.author}</span>
            </div>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-xs transition-colors ${
                isLiked ? 'text-neon-magenta' : 'text-text-muted hover:text-text-secondary'
              }`}
              data-cursor="pointer"
            >
              <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
              <span>{likes >= 1000 ? (likes / 1000).toFixed(1) + 'k' : likes}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Post Detail Slide-out Panel */
function PostDetail({
  post,
  onClose,
  onAuthorClick,
  isBookmarked,
  onToggleBookmark,
}: {
  post: Post;
  onClose: () => void;
  onAuthorClick: (author: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: (post: Post) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-y-0 right-0 z-[60] w-full md:w-[520px] bg-void border-l border-white/10 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-void/80 backdrop-blur-md border-b border-white/5">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" data-cursor="pointer">
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-medium">内容详情</span>
      </div>

      {/* Cover */}
      <div className="relative">
        <img src={post.cover} alt={post.title} className="w-full h-64 md:h-80 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
      </div>

      {/* Content */}
      <div className="px-5 pb-6 -mt-12 relative z-[1]">
        <h1 className="text-xl font-bold text-text-primary mb-3">{post.title}</h1>

        {/* Author */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-4 cursor-pointer transition-colors hover:bg-white/5"
          style={{ background: 'rgba(18,18,26,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
          onClick={() => onAuthorClick(post.author)}
          data-cursor="pointer"
        >
          <img src={post.authorAvatar} alt={post.author} className="w-10 h-10 rounded-full object-cover border border-neon-cyan/30" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{post.author}</p>
            <p className="text-xs text-text-secondary truncate">{post.authorBio}</p>
          </div>
          <button
            className="px-3 py-1.5 rounded-full text-xs font-medium text-void bg-neon-cyan hover:shadow-glow-cyan transition-all"
            data-cursor="pointer"
          >
            关注
          </button>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed mb-6 whitespace-pre-line">{post.content}</p>

        {/* Actions */}
        <div className="flex items-center justify-around py-4 border-t border-b border-white/5 mb-4">
          <button
            onClick={() => {
              setLiked(!liked);
              setLikeCount((p) => (liked ? p - 1 : p + 1));
            }}
            className={`flex flex-col items-center gap-1 transition-colors ${liked ? 'text-neon-magenta' : 'text-text-secondary hover:text-text-primary'}`}
            data-cursor="pointer"
          >
            <Heart size={22} fill={liked ? 'currentColor' : 'none'} />
            <span className="text-xs">{likeCount >= 1000 ? (likeCount / 1000).toFixed(1) + 'k' : likeCount}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary transition-colors" data-cursor="pointer">
            <MessageCircle size={22} />
            <span className="text-xs">{post.comments.length}</span>
          </button>
          <button
            onClick={() => onToggleBookmark(post)}
            className={`flex flex-col items-center gap-1 transition-colors ${isBookmarked ? 'text-neon-gold' : 'text-text-secondary hover:text-text-primary'}`}
            data-cursor="pointer"
          >
            <Bookmark size={22} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span className="text-xs">收藏</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-text-secondary hover:text-text-primary transition-colors" data-cursor="pointer">
            <Share2 size={22} />
            <span className="text-xs">分享</span>
          </button>
        </div>

        {/* Comments */}
        <h3 className="text-sm font-medium text-text-primary mb-3">评论 ({post.comments.length})</h3>
        <div className="space-y-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-secondary">{c.author}</span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Heart size={10} /> {c.likes}
                  </span>
                </div>
                <p className="text-sm text-text-primary">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Author Profile Modal */
function AuthorProfileModal({
  author,
  onClose,
  onChatOpen,
}: {
  author: string;
  onClose: () => void;
  onChatOpen: (author: string) => void;
}) {
  const profile = AUTHOR_PROFILES[author];
  const [following, setFollowing] = useState(profile.isFollowing);

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'var(--void-light)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="relative h-32 bg-gradient-to-r from-neon-cyan/20 via-neon-violet/20 to-neon-magenta/20">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
            data-cursor="pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Avatar & info */}
        <div className="px-5 pb-5 -mt-12">
          <img
            src={profile.avatar}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-void"
            style={{ boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}
          />
          <h2 className="text-lg font-bold text-text-primary mt-3">{profile.name}</h2>
          <p className="text-xs text-text-secondary mt-1">{profile.bio}</p>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 py-3 border-y border-white/5">
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-text-primary">
                {profile.followers >= 10000 ? (profile.followers / 10000).toFixed(1) + 'w' : profile.followers}
              </p>
              <p className="text-[10px] text-text-muted">粉丝</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-text-primary">
                {profile.likes >= 10000 ? (profile.likes / 10000).toFixed(1) + 'w' : profile.likes}
              </p>
              <p className="text-[10px] text-text-muted">获赞</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-lg font-bold text-text-primary">{profile.posts}</p>
              <p className="text-[10px] text-text-muted">笔记</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setFollowing(!following)}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                following
                  ? 'bg-white/10 text-text-secondary border border-white/10'
                  : 'bg-neon-cyan text-void hover:shadow-glow-cyan'
              }`}
              data-cursor="pointer"
            >
              {following ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Check size={14} /> 已关注
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <UserPlus size={14} /> 关注
                </span>
              )}
            </button>
            <button
              onClick={() => onChatOpen(profile.name)}
              className="flex-1 py-2.5 rounded-full text-sm font-medium border border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 transition-all"
              data-cursor="pointer"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Mail size={14} /> 私信
              </span>
            </button>
          </div>

          {/* Post grid preview */}
          <div className="mt-5">
            <h3 className="text-xs font-medium text-text-secondary mb-2">已发布</h3>
            <div className="grid grid-cols-3 gap-2">
              {profile.postCovers.slice(0, 6).map((cover, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden">
                  <img src={cover} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Chat Modal */
function ChatModal({ author, onClose }: { author: string; onClose: () => void }) {
  const [messages, setMessages] = useState([
    { id: 1, from: 'them', text: '你好呀！感谢关注我的内容～有什么想了解的吗？' },
  ]);
  const [input, setInput] = useState('');
  const profile = AUTHOR_PROFILES[author];

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: 'me', text: input.trim() }]);
    setInput('');
    // Auto reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'them', text: '收到啦！我会尽快回复你的，可以先看看我的最新笔记哦～' },
      ]);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--void-light)',
          border: '1px solid rgba(255,255,255,0.08)',
          height: '500px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <img src={profile?.avatar} alt={author} className="w-8 h-8 rounded-full object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{author}</p>
            <p className="text-[10px] text-neon-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green" /> 在线
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors" data-cursor="pointer">
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.from === 'me'
                    ? 'bg-neon-cyan text-void rounded-br-md'
                    : 'bg-white/8 text-text-primary rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 p-3 border-t border-white/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="发消息..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-neon-cyan/50 transition-colors"
          />
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-neon-cyan text-void hover:shadow-glow-cyan transition-all"
            data-cursor="pointer"
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FavoritesModal({
  items,
  analysis,
  isAnalyzing,
  onAnalyze,
  onOpen,
  onRemove,
  onClose,
}: {
  items: FavoriteItem[];
  analysis: string;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onOpen: (id: number) => void;
  onRemove: (id: number) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-[720px] rounded-2xl overflow-hidden"
        style={{ background: 'var(--void-light)', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bookmark size={16} className="text-neon-gold" />
            <div className="text-sm font-bold text-text-primary">收藏夹</div>
            <div className="text-xs text-text-muted">({items.length})</div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors" data-cursor="pointer">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-text-muted">点击条目可打开详情</div>
              <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/20 transition-colors disabled:opacity-40"
              >
                {isAnalyzing ? 'AI分析中…' : 'AI分析收藏'}
              </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto pr-1 space-y-2">
              {items.length === 0 ? (
                <div className="text-sm text-text-muted py-10 text-center">还没有收藏。打开一条内容，点“收藏”试试。</div>
              ) : (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors cursor-pointer"
                    onClick={() => onOpen(it.id)}
                    data-cursor="pointer"
                  >
                    <div className="w-14 h-10 rounded-md overflow-hidden bg-void flex-shrink-0">
                      <img src={it.cover} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-text-primary truncate">{it.title}</div>
                      <div className="mt-1 text-[10px] text-text-muted flex items-center gap-2">
                        <span>{it.author}</span>
                        <span>·</span>
                        <span>{it.category}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(it.id);
                      }}
                      className="p-2 rounded-lg text-text-muted hover:text-neon-magenta hover:bg-neon-magenta/10 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="text-xs font-medium text-neon-magenta mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-neon-magenta" />
              收藏洞察
            </div>
            <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap min-h-[360px]">
              {analysis || '点击“AI分析收藏”，我会从你的收藏里提炼：偏好主题、结构套路、可复用模板与训练计划。'}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function ContentFeed() {
  const navigate = useNavigate();
  const [activeTag, setActiveTag] = useState('recommend');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [chatAuthor, setChatAuthor] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => loadFavorites());
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritesAnalysis, setFavoritesAnalysis] = useState('');
  const [isAnalyzingFavorites, setIsAnalyzingFavorites] = useState(false);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const isBookmarked = useCallback((postId: number) => favorites.some((f) => f.id === postId), [favorites]);

  const toggleBookmark = useCallback((post: Post) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === post.id);
      if (exists) return prev.filter((f) => f.id !== post.id);
      const item: FavoriteItem = {
        id: post.id,
        savedAt: Date.now(),
        title: post.title,
        author: post.author,
        category: post.category,
        cover: post.cover,
        content: post.content,
      };
      return [item, ...prev];
    });
  }, []);

  const analyzeFavorites = useCallback(async () => {
    if (isAnalyzingFavorites) return;
    if (!favorites.length) {
      setFavoritesAnalysis('收藏夹还是空的。先收藏几条你喜欢的推文，我再帮你分析偏好与可复用套路。');
      return;
    }
    setIsAnalyzingFavorites(true);
    setFavoritesAnalysis('分析中…');
    try {
      const system =
        '你是内容策略分析师。你将根据用户收藏的推文，推断他的选题偏好、叙事结构偏好、情绪与价值取向，并给出可复用模板。' +
        '输出为中文，结构化分段：1) 你在收藏什么 2) 你讨厌什么（推断） 3) 你适合做什么赛道 4) 3个内容模板（标题公式+开头公式+结构） 5) 7天训练计划。' +
        '务必写得像真人策略顾问，不要套话，字数 380-700。';
      const user = `收藏样本（最多20条）：\n${JSON.stringify(favorites.slice(0, 20))}`;
      const res = await glmChat(system, user, { temperature: 0.5, max_tokens: 1200 });
      setFavoritesAnalysis(res);
    } catch {
      setFavoritesAnalysis('分析失败了，请稍后再试。');
    } finally {
      setIsAnalyzingFavorites(false);
    }
  }, [favorites, isAnalyzingFavorites]);

  const filteredPosts = useMemo(() => {
    if (activeTag === 'recommend') return POSTS;
    if (activeTag === 'follow') return POSTS.slice(0, 4);
    if (activeTag === 'hot') return [...POSTS].sort((a, b) => b.likes - a.likes);
    const map: Record<string, string> = {
      food: '美食',
      tech: '科技',
      travel: '旅行',
      fashion: '穿搭',
      career: '职场',
    };
    const cat = map[activeTag];
    return cat ? POSTS.filter((p) => p.category === cat) : POSTS;
  }, [activeTag]);

  // Split posts into two columns for masonry effect
  const { leftCol, rightCol } = useMemo(() => {
    const left: Post[] = [];
    const right: Post[] = [];
    filteredPosts.forEach((p, i) => {
      if (i % 2 === 0) left.push(p);
      else right.push(p);
    });
    return { leftCol: left, rightCol: right };
  }, [filteredPosts]);

  const handleAuthorClick = useCallback((author: string) => {
    setSelectedAuthor(author);
    setSelectedPost(null);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-void relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero" />

      {/* Tag Bar */}
      <TagBar activeTag={activeTag} onTagChange={setActiveTag} />

      {/* Feed Content */}
      <div className="relative z-10 px-4 pt-4 pb-24 max-w-[720px] mx-auto">
        <div className="flex gap-4">
          {/* Left column */}
          <div className="flex-1 space-y-4">
            {leftCol.map((post, i) => (
              <PostCard key={post.id} post={post} index={i * 2} onOpen={setSelectedPost} />
            ))}
          </div>
          {/* Right column - hidden on mobile */}
          <div className="flex-1 space-y-4 hidden md:block">
            {rightCol.map((post, i) => (
              <PostCard key={post.id} post={post} index={i * 2 + 1} onOpen={setSelectedPost} />
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-text-muted">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-50" />
            <p>该分类暂无内容</p>
          </div>
        )}
      </div>

      {/* Floating Publish Button */}
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-void"
        style={{
          background: 'linear-gradient(135deg, #00F0FF, #BD00FF)',
          boxShadow: '0 4px 24px rgba(0, 240, 255, 0.4)',
        }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/content-lab')}
        data-cursor="pointer"
      >
        <Plus size={24} strokeWidth={3} />
      </motion.button>

      <motion.button
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'rgba(18,18,26,0.8)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 4px 24px rgba(255, 215, 0, 0.12)',
          color: '#FFD700',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setShowFavorites(true)}
        data-cursor="pointer"
      >
        <Bookmark size={22} />
      </motion.button>

      {/* Overlays */}
      <AnimatePresence>
        {/* Post Detail */}
        {selectedPost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedPost(null)}
            />
            <PostDetail
              post={selectedPost}
              onClose={() => setSelectedPost(null)}
              onAuthorClick={handleAuthorClick}
              isBookmarked={isBookmarked(selectedPost.id)}
              onToggleBookmark={toggleBookmark}
            />
          </>
        )}

        {/* Author Profile */}
        {selectedAuthor && (
          <AuthorProfileModal
            author={selectedAuthor}
            onClose={() => setSelectedAuthor(null)}
            onChatOpen={(a) => {
              setSelectedAuthor(null);
              setChatAuthor(a);
            }}
          />
        )}

        {/* Chat */}
        {chatAuthor && (
          <ChatModal author={chatAuthor} onClose={() => setChatAuthor(null)} />
        )}

        {showFavorites && (
          <FavoritesModal
            items={favorites}
            analysis={favoritesAnalysis}
            isAnalyzing={isAnalyzingFavorites}
            onAnalyze={analyzeFavorites}
            onOpen={(id) => {
              const p = POSTS.find((x) => x.id === id);
              if (p) setSelectedPost(p);
              setShowFavorites(false);
            }}
            onRemove={(id) => setFavorites((prev) => prev.filter((f) => f.id !== id))}
            onClose={() => setShowFavorites(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
