import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
  async redirects() {
    return [
      { source: "/entrar", destination: "/login", permanent: true },
      { source: "/admin/conteudo", destination: "/admin/cursos", permanent: true },
    ];
  },
};

export default nextConfig;
