export interface AppLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface DashboardData {
  links: AppLink[];
}
