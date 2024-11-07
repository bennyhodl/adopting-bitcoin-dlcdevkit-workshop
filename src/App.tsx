import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./routes/Home";
import About from "./routes/About";
import Users from "./routes/users/Users";
import UserDetail from "./routes/users/UserDetail";
import "./App.css";
import { SidebarProvider } from "./components/ui/sidebar";
import AppSidebar from "./components/AppSidebar";
import Header from "./components/Header";

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto p-6">
            <Header />

            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="users" element={<Users />}>
                  <Route path=":id" element={<UserDetail />} />
                </Route>
              </Route>
            </Routes>
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
