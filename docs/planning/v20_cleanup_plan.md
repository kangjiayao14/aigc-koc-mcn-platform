# V20 功能审计与清理计划

## 审计结果

**V20创建的组件**（18个）：
1. BrandDNAExtractor → ✅ AgentHub使用
2. ViralitySimulator → ✅ ContentLab使用  
3. MonetizationRadar → ✅ ContentLab使用
4. ContentBank → ❌ 未使用（用户明确提到）
5. FanEvolver → ❌ 未使用
6. TitleFactory → ❌ 未使用
7. CommentRehearsal → ❌ 未使用
8. HeatPreloader → ❌ 未使用
9. AIVideoPipeline → ❌ 未使用
10. ViralCloner → ❌ 未使用
11. EmotionRhythmEditor → ❌ 未使用
12. PlatformAdapter → ❌ 未使用
13. CoverLab → ❌ 未使用
14. TimingOracle → ❌ 未使用
15. CompetitorWatch → ❌ 未使用
16. TopicBank → ❌ 未使用
17. AlgorithmSimulator → ❌ 未使用
18. AICopilot → ❌ 未使用

**结论**：18个组件中只有3个被页面引用，15个是僵尸组件。

---

## 执行计划

### 保留并集成（5个组件）
| 组件 | 集成到页面 | 位置 |
|------|-----------|------|
| ContentBank | AgentHub | 右栏 ProfilePreview 下方 |
| FanEvolver | AgentHub | 右栏 ContentBank 下方 |
| TitleFactory | ContentLab | 推文生成结果区域上方 |
| CommentRehearsal | ContentLab | 推文生成结果区域下方 |
| HeatPreloader | TopicResearch | 热力图区域上方 |

### 删除（10个僵尸组件文件 + 对应aiMock接口）
- AIVideoPipeline, ViralCloner, EmotionRhythmEditor, PlatformAdapter, CoverLab
- TimingOracle, CompetitorWatch, TopicBank, AlgorithmSimulator, AICopilot

### aiMock.ts清理后保留的接口（12个）
- analyzeDNA, generateWithDNA, simulateABTesting, generateVariant
- matchBrandDeals, generatePitchLetter
- getContentBank, suggestRepurposing
- analyzeFanEvolution
- generateTitles
- simulateComments
- predictHeat

### aiMock.ts删除的接口（14个）
- analyzeEmotionCurve, deconstructCompetitor, predictBestTiming
- generateVideoScript, deconstructViral, generateClone, generateByEmotionCurve
- adaptToPlatforms, generateCovers, getOptimalTiming
- getCompetitorUpdates, generateTopicBank, simulateAlgorithm, generateWeeklyPlan
