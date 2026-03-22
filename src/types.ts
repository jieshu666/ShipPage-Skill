export interface Env {
  PAGES_BUCKET: R2Bucket;
  META: KVNamespace;
  SITE_URL: string;
  FEISHU_APP_ID: string;
  FEISHU_APP_SECRET: string;
  FEISHU_APP_TOKEN: string;
  FEISHU_TABLE_WAITLIST: string;
  FEISHU_TABLE_AGENTS: string;
  FEISHU_TABLE_PAGES: string;
  FEISHU_TABLE_DAILY_COST: string;
}

export interface AgentRecord {
  agent_id: string;
  api_key: string;
  claim_code: string;
  claimed: boolean;
  github_user: string | null;
  created_at: string;
  usage_this_month: number;
  usage_reset_at: string;
}

export type AppBindings = {
  Bindings: Env;
  Variables: {
    agent: AgentRecord | null;
  };
};
