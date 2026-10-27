import { HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { tap, Observable } from 'rxjs';

@Service()
export class AuthService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private readonly baseUrl = '/api/auth';
    public token = signal<string | null>(isPlatformBrowser(this.platformId) ? (localStorage.getItem('authToken') ?? '') : '');

    public login(credentials: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
            tap((response: any) => {
                if (response?.token?.result) {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('authToken', response?.token?.result);
                    }
                    this.token.set(response?.token?.result);
                }
            })
        );
    }
    public register(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, payload);
    }
    public logout(): void {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('authToken');
        }
        this.token.set(null);
    }
}
