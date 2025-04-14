import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignUp from "./components/Signup";
import Home from "./Home";
import Footer from "./components/Footer";
import Login from "./components/Login";
import Home_tools from "./pages/Home_tools";
import ResumeForm from "./pages/ResumeForm ";
import Coverletter from "./pages/Coverletter";
import InterviewSystem from "./pages/InterviewSystem";
import QuizGenerator from "./pages/QuizGenerator";

const Layout = ({ children, showNavbar = true }) => {
  return (
    <>
      {showNavbar && <Navbar />}
      {children}
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/signup"
          element={
            <Layout>
              <SignUp />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout>
              <Login />
            </Layout>
          }
        />
        <Route
          path="/tools"
          element={
            <Layout showNavbar={false}>
              <Home_tools />
            </Layout>
          }
        />
        <Route
          path="/tools/resume"
          element={
            <Layout showNavbar={false}>
              <ResumeForm />
            </Layout>
          }
        />
        <Route
          path="/tools/coverletter"
          element={
            <Layout showNavbar={false}>
              <Coverletter />
            </Layout>
          }
        />
        <Route
          path="/tools/interview"
          element={
            <Layout showNavbar={false}>
              <InterviewSystem />
            </Layout>
          }
        />
        <Route
          path="/tools/quiz"
          element={
            <Layout showNavbar={false}>
              <QuizGenerator />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
