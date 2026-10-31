import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../model/category.model';

@Service()
export class CategoryService {
    private http = inject(HttpClient);
    private readonly baseUrl = "/api/categories";
    public getAllCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`${this.baseUrl}`);
    }
}
