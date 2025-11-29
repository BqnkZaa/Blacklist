import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    avatar_url?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
    message: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = `${environment.apiUrl}/auth`;
    private tokenKey = 'auth_token';
    private userSubject = new BehaviorSubject<User | null>(null);
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) {
        this.loadUser();
    }

    register(username: string, email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
            username,
            email,
            password
        }).pipe(
            tap(response => this.handleAuth(response))
        );
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/login`, {
            email,
            password
        }).pipe(
            tap(response => this.handleAuth(response))
        );
    }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        this.userSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    getCurrentUser(): Observable<{ user: User }> {
        return this.http.get<{ user: User }>(`${this.baseUrl}/me`).pipe(
            tap(response => this.userSubject.next(response.user))
        );
    }

    updateProfile(username: string, email: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/profile`, { username, email });
    }

    private handleAuth(response: AuthResponse): void {
        localStorage.setItem(this.tokenKey, response.token);
        this.userSubject.next(response.user);
    }

    private loadUser(): void {
        if (this.isAuthenticated()) {
            this.getCurrentUser().subscribe({
                error: () => this.logout()
            });
        }
    }

    isAdmin(): boolean {
        const user = this.userSubject.value;
        return user?.role === 'admin' || false;
    }

    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }
}
