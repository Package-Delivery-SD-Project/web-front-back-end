import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import logo from './logo.svg';
import { Routes, Route } from "react-router-dom";
import { MyProSidebarProvider } from "./pages/global/sidebar/sidebarContext";

import Topbar from "./pages/global/Topbar";

import { RosProvider } from './RosContext'; // Import the RosProvider


import Dashboard from "./pages/dashboard/dashboard";
import RobotControl from "./pages/robotControl/robotControl"
import Dev from "./pages/dev/dev"
import SelectionPage from "./pages/routePlanning/routePlanning"


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



            {/*Wrapped inside RosProvider, */}
          
             <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/robot-control" element={<RobotControl />} />
              <Route path="/webcam" element={<Dev />} />
              <Route path="/route-planning" element={<SelectionPage />} />
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