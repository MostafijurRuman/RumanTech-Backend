export type DateRangeQuery = {
  from?: string;
  to?: string;
};

export type DashboardStat = {
  label: string;
  value: number;
  change?: number;
};
