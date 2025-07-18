import { Routes, Route, useLocation } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import { AuthProvider } from "./features/auth/AuthProvider";
import { GeminiProvider } from "./features/gemini/GeminiProvider";
import ThemeProvider from "./features/theme/ThemeProvider";
import { FirestoreProvider } from "./features/firestore/FirestoreProvider";
import Header from "./components/Header";
import TooltipProvider from "./features/tooltip/TooltipProvider";
import LocalizationProvider from "./features/localization/LocalizationProvider";
import { useState } from "react";
import { useFirestore } from "./features/firestore/useFirestore";
import Translator from "./components/Translator";
import MainPanel from "./components/MainPanel";
import Saved from "./components/Saved";
import History from "./components/History";

function App() {
  const [selectedTranslation, setSelectedTranslation] = useState<{
    id: string;
    sourceText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
    createdAt: string;
  } | null>(null);
  const { deleteTranslationFromUserHistory, deleteTranslationFromUserSaved } =
    useFirestore();

  const deleteFromHistory = (id: string) => {
    if (selectedTranslation && selectedTranslation.id === id)
      setSelectedTranslation(null);
    deleteTranslationFromUserHistory(id);
  };
  const deleteFromSaved = (id: string) => {
    if (selectedTranslation && selectedTranslation.id === id)
      setSelectedTranslation(null);
    deleteTranslationFromUserSaved(id);
  };

  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
      <LocalizationProvider>
        <ThemeProvider>
          <AuthProvider>
            <FirestoreProvider>
              <GeminiProvider>
                <TooltipProvider>
                  <div
                    id="app"
                    className="h-screen p-6 m-auto flex flex-col bg-background-300 dark:bg-background-dark-400
                      text-primary-200 dark:text-primary-dark-200 transition-colors duration-300"
                  >
                    <Header />
                    <div className="flex flex-1 gap-3 justify-center overflow-hidden">
                      {isHome && (
                        <History
                          onSelect={setSelectedTranslation}
                          onDelete={deleteFromHistory}
                        />
                      )}
                      <MainPanel className={isHome ? "w-full" : "w-1/2"}>
                        <Routes>
                          <Route
                            path="/"
                            element={
                              <Translator
                                selectedTranslation={selectedTranslation}
                                setSelectedTranslation={setSelectedTranslation}
                              />
                            }
                          />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/login" element={<Login />} />
                        </Routes>
                      </MainPanel>
                      {isHome && (
                        <Saved
                          onSelect={setSelectedTranslation}
                          onDelete={deleteFromSaved}
                        />
                      )}
                    </div>
                  </div>
                </TooltipProvider>
              </GeminiProvider>
            </FirestoreProvider>
          </AuthProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </>
  );
}

export default App;
