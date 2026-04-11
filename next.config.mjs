/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages는 저장소 이름을 경로로 사용하므로 설정이 필요합니다.
  basePath: '/lottopage',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
