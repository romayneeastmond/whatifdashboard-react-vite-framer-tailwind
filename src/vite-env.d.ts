/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_SHOW_BMC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
