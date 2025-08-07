import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
// import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  base: '/openrank/',
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          // 将React相关库分离到单独的chunk
          'react-vendor': ['react', 'react-dom'],
          // 将路由相关库分离
          'router': ['react-router-dom'],
          // 将图表库分离
          'charts': ['recharts'],
          // 将工具库分离
          'utils': ['axios', 'clsx', 'tailwind-merge', 'zustand'],
          // 将图标库分离
          'icons': ['lucide-react']
        }
      }
    },
    // 提高chunk大小警告阈值
    chunkSizeWarningLimit: 1000
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    // traeBadgePlugin({
    //   variant: 'dark',
    //   position: 'bottom-right',
    //   prodOnly: true,
    //   clickable: true,
    //   clickUrl: 'https://www.trae.ai/solo?showJoin=1',
    //   autoTheme: true,
    //   autoThemeTarget: '#root'
    // }), 
    tsconfigPaths()
  ],
})
