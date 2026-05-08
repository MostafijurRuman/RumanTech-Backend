export type PaginationOptions = {
  page?: number;
  limit?: number;
};

export function getPagination(options: PaginationOptions) {
  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit),
  };
}
