import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedResponse, ProductFilters, ProductItem } from '../model/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = '/api/products';

  public createProduct(payload: ProductItem): Observable<ProductItem> {
    return this.http.post<ProductItem>(`${this.baseUrl}`, payload);
  }
  public getProducts(filters: ProductFilters): Observable<PaginatedResponse<ProductItem>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            params = params.append(key, v.toString());
          });
        } else {
          params = params.set(key, value.toString());
        }
      }
    });
    return this.http.get<PaginatedResponse<ProductItem>>(this.baseUrl, { params });
  }
  public deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  public updateProduct(id: string, payload: Partial<ProductItem>): Observable<ProductItem> {
    return this.http.put<ProductItem>(`${this.baseUrl}/${id}`, payload);
  }
}
