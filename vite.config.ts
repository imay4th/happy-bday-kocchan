import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages の公開URLが `https://<user>.github.io/<repo>/` 形式になるため、
// 本番ビルドのときだけ base を `/<repo>/` に切り替える。
// ローカル開発と LAN 公開 (npm run dev:host) では `/` を使う。
const repoName = process.env.GH_REPO ?? 'happy-bday-kocchan'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    host: true,
  },
}))
