// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// // export default defineConfig(({ mode }) => {
// //   return {
// //     base: '/CERAMIC_COMPLEX_FE/',
// //     plugins: [react()],
// //     build: {
// //       chunkSizeWarningLimit: 1600,
// //     },
// //   }
// // });

// export default defineConfig(() => {
//   return {
//     base: '/water_quality_system/',
//     plugins: [react()],
//     build: {
//       chunkSizeWarningLimit: 1600,
//     },
//   }
// });
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
