import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import { Routes, Route } from "react-router-dom";
import { MyProSidebarProvider } from "./pages/global/sidebar/sidebarContext";

import Topbar from "./pages/global/Topbar";

import { RosProvider } from './RosContext'; // Import the RosProvider


import Dashboard from "./pages/dashboard/dashboard";
import RobotControl from "./pages/robotControl/robotControl"
import Dev from "./pages/dev/dev"
import SelectionPage from "./pages/routePlanning/routePlanning"
import SettingsComponent from "./pages/settings/settings"
import AboutComponent from "./pages/about/about"


const App = () => {
  const [theme, colorMode] = useMode();
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <MyProSidebarProvider>
          <div style={{ height: "100%", width: "100%" }}>
            <main>
            <RosProvider>
            <Topbar />
             <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/robot-control" element={<RobotControl />} />
              <Route path="/webcam" element={<Dev />} />
              <Route path="/route-planning" element={<SelectionPage />} />
              <Route path="/settings" element={<SettingsComponent />} />
              <Route path="/about" element={<AboutComponent />} />
              </Routes>
            </RosProvider>

            </main>
          </div>
        </MyProSidebarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;