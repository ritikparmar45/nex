import api from '@/lib/axios';
import {
  Category,
  Product,
  ProductFormData,
  ProductsResponse,
} from '@/types/product';

export interface GetProductsOptions {
  limit?: number;
  skip?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

/**
 * Product Service
 * ---------------
 * API abstraction layer for product operations using shared Axios instance.
 * Supports AbortSignal for request cancellation to prevent race conditions.
 */
export const productService = {
  /**
   * Fetches paginated list of products with optional server-side sorting
   */
  async getProducts(
    options: GetProductsOptions = {},
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const { limit = 20, skip = 0, sortBy, order } = options;
    const params: Record<string, string | number> = { limit, skip };
    if (sortBy) {
      params.sortBy = sortBy;
      if (order) params.order = order;
    }

    const response = await api.get<ProductsResponse>('/products', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Searches products by search term with debouncing & request cancellation support
   */
  async searchProducts(
    query: string,
    options: GetProductsOptions = {},
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const { limit = 20, skip = 0, sortBy, order } = options;
    const params: Record<string, string | number> = { q: query, limit, skip };
    if (sortBy) {
      params.sortBy = sortBy;
      if (order) params.order = order;
    }

    const response = await api.get<ProductsResponse>('/products/search', {
      params,
      signal,
    });
    return response.data;
  },

  /**
   * Fetches products by category slug
   */
  async getProductsByCategory(
    category: string,
    options: GetProductsOptions = {},
    signal?: AbortSignal
  ): Promise<ProductsResponse> {
    const { limit = 20, skip = 0, sortBy, order } = options;
    const params: Record<string, string | number> = { limit, skip };
    if (sortBy) {
      params.sortBy = sortBy;
      if (order) params.order = order;
    }

    const response = await api.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      {
        params,
        signal,
      }
    );
    return response.data;
  },

  /**
   * Fetches available product categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/products/categories');
    return response.data;
  },

  /**
   * Fetches a single product details by ID
   */
  async getProductById(id: number | string): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Adds a new product (Simulated by DummyJSON)
   */
  async addProduct(data: ProductFormData): Promise<Product> {
    const response = await api.post<Product>('/products/add', data);
    return response.data;
  },

  /**
   * Updates an existing product (Simulated by DummyJSON)
   */
  async updateProduct(
    id: number | string,
    data: Partial<ProductFormData>
  ): Promise<Product> {
    const response = await api.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  /**
   * Deletes a product by ID (Simulated by DummyJSON)
   */
  async deleteProduct(id: number | string): Promise<{ id: number; isDeleted: boolean }> {
    const response = await api.delete<{ id: number; isDeleted: boolean }>(
      `/products/${id}`
    );
    return response.data;
  },
};
