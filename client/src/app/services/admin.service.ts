import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface UserListResponse {
    users: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface BlacklistListResponse {
    blacklists: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private baseUrl = `${environment.apiUrl}/admin`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    // Dashboard Stats
    getStats(): Observable<any> {
        return this.http.get(`${this.baseUrl}/stats`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    // User Management
    getUsers(page: number = 1, limit: number = 10, search?: string): Observable<UserListResponse> {
        let url = `${this.baseUrl}/users?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${search}`;
        }
        return this.http.get<UserListResponse>(url, {
            headers: this.authService.getAuthHeaders()
        });
    }

    updateUserRole(userId: number, role: 'user' | 'admin'): Observable<any> {
        return this.http.put(`${this.baseUrl}/users/${userId}/role`, { role }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    deleteUser(userId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/users/${userId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    // Blacklist Management
    getAllBlacklists(page: number = 1, limit: number = 10, status?: string, type?: string): Observable<BlacklistListResponse> {
        let url = `${this.baseUrl}/blacklists?page=${page}&limit=${limit}`;
        if (status) {
            url += `&status=${status}`;
        }
        if (type) {
            url += `&type=${type}`;
        }
        return this.http.get<BlacklistListResponse>(url, {
            headers: this.authService.getAuthHeaders()
        });
    }

    updateBlacklistStatus(blacklistId: number, status: 'active' | 'reported' | 'removed'): Observable<any> {
        return this.http.put(`${this.baseUrl}/blacklists/${blacklistId}/status`, { status }, {
            headers: this.authService.getAuthHeaders()
        });
    }

    deleteBlacklist(blacklistId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/blacklists/${blacklistId}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
