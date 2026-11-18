import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],

  outputFileTracingIncludes: {
    "/api/admin/receipts/retry": [
      "./node_modules/pdfkit/js/standard-fonts/**/*",
    ],
  },
};

export default nextConfig;