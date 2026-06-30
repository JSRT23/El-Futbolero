import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Bracket from "./pages/Bracket";
import History from "./pages/History";
import Ranking from "./pages/Ranking";
import Rules from "./pages/Rules";
import Profile from "./pages/Profile";
import BottomNav from "./components/BottomNav";
import StadiumBackground from "./components/StadiumBackground";

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [page, setPage] = useState("home");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPage("home");
  };

  if (loadingSession) {
    return (
      <>
        <StadiumBackground />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "#94A3B8", fontSize: 14 }}>Cargando...</p>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <StadiumBackground />
        <div style={{ position: "relative", zIndex: 1 }}>
          <Login />
        </div>
      </>
    );
  }

  const user = session.user;

  return (
    <>
      <StadiumBackground />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          overflowY: "auto",
          paddingBottom: 80,
        }}
      >
        {page === "home" && <Home user={user} />}
        {page === "bracket" && <Bracket />}
        {page === "history" && <History user={user} />}
        {page === "ranking" && <Ranking user={user} />}
        {page === "rules" && <Rules />}
        {page === "profile" && <Profile user={user} onLogout={handleLogout} />}
      </div>

      <div
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <BottomNav active={page} onChange={setPage} />
      </div>
    </>
  );
}
