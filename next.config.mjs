/**
 * Деплой на GitHub Pages: `output: "export"` собирает полностью статический сайт
 * в папку `out/` (без Node-сервера). basePath/assetPrefix подставляются из
 * NEXT_PUBLIC_BASE_PATH (в CI = "/<имя-репозитория>").
 *
 * Ограничение экспорта: /api/attempts и /api/profile не работают — приложение
 * автоматически переходит в демо-режим (localStorage, см. lib/demo-store.ts).
 */
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  ...(base ? { basePath: base, assetPrefix: base } : {}),
};

export default nextConfig;
