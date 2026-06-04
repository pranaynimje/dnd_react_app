import DndDashboard from './dnd_dashboard'
import DnDPersonaHub from './dnd_persona_hub'

// Toggle: set to true to preview the new persona-based hub
const SHOW_PERSONA_HUB = true

function App() {
  return SHOW_PERSONA_HUB ? <DnDPersonaHub /> : <DndDashboard />
}

export default App