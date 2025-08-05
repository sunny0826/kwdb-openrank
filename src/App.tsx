import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Home from "@/pages/Home";
import OpenRank from "@/pages/OpenRank";
import Statistics from "@/pages/Statistics";
import Trends from "@/pages/Trends";
import Compare from "@/pages/Compare";

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/openrank">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/openrank" element={<OpenRank />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/compare" element={<Compare />} />
          {/* 404 页面 */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-lg text-gray-600 mb-6">页面未找到</p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  返回首页
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
