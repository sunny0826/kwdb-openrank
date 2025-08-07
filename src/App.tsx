import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";

// 动态导入页面组件
const Home = lazy(() => import("@/pages/Home"));
const OpenRank = lazy(() => import("@/pages/OpenRank"));
const Statistics = lazy(() => import("@/pages/Statistics"));
const Trends = lazy(() => import("@/pages/Trends"));
const Compare = lazy(() => import("@/pages/Compare"));

export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/openrank">
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
