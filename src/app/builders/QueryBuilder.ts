import { buildMeta, getPagination } from "@/app/utils/pagination";

export type QueryParams = Record<string, unknown>;

export class QueryBuilder<TWhere extends Record<string, unknown>> {
  private readonly query: QueryParams;
  private readonly searchableFields: string[];
  private readonly baseWhere: TWhere;

  constructor(query: QueryParams, searchableFields: string[] = [], baseWhere = {} as TWhere) {
    this.query = query;
    this.searchableFields = searchableFields;
    this.baseWhere = baseWhere;
  }

  buildSearch() {
    const searchTerm = String(this.query.searchTerm ?? "").trim();

    if (!searchTerm || this.searchableFields.length === 0) {
      return this.baseWhere;
    }

    return {
      ...this.baseWhere,
      OR: this.searchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    } as TWhere;
  }

  pagination() {
    return getPagination({
      page: Number(this.query.page),
      limit: Number(this.query.limit),
    });
  }

  sort(defaultSortBy = "createdAt") {
    const sortBy = String(this.query.sortBy ?? defaultSortBy);
    const sortOrder = String(this.query.sortOrder ?? "desc") === "asc" ? "asc" : "desc";

    return { [sortBy]: sortOrder };
  }

  meta(total: number, page: number, limit: number) {
    return buildMeta(total, page, limit);
  }
}
