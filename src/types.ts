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
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  SESSION_SECRET: string;
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
  owner_google_id?: string | null;
  display_name?: string | null;
}

export interface UserRecord {
  google_id: string;
  email: string;
  name: string;
  picture: string;
  linked_agents: string[];
  created_at: string;
  last_login: string;
}

export type AppBindings = {
  Bindings: Env;
  Variables: {
    agent: AgentRecord | null;
    user: UserRecord | null;
  };
};
