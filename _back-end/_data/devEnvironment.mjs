export default function () {
  return {
    environment: process.env.DEV_ENVIRONMENT || "dev"
  };
};