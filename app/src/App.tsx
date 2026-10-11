import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import AgentHub from './pages/AgentHub'
import ContentLab from './pages/ContentLab'
import TopicResearch from './pages/TopicResearch'
import SocialHub from './pages/SocialHub'
import Workshop from './pages/Workshop'
import Marketplace from './pages/Marketplace'
import ContentFeed from './pages/ContentFeed'
import QuestsPage from './pages/QuestsPage'

import FriendsPage from './pages/FriendsPage'

/**
 * App - HashRouter root with all page routes
 *
 * Route structure:
 * /               - Landing page
 * /onboarding     - Agent onboarding flow
 * /hub            - Personal profile page
 * /feed           - Content feed hall
 * /content-lab    - Creation workshop
 * /topic-research - Topic intelligence
 * /social         - Social planet
 * /workshop       - BigV discussion room (distillation)
 * /marketplace    - Interstellar marketplace
 * /quests         - Quest center
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/hub" element={<AgentHub />} />
        <Route path="/feed" element={<ContentFeed />} />
        <Route path="/content-lab" element={<ContentLab />} />
        <Route path="/topic-research" element={<TopicResearch />} />
        <Route path="/social" element={<SocialHub />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/friends" element={<FriendsPage />} />
      </Route>
    </Routes>
  )
}
