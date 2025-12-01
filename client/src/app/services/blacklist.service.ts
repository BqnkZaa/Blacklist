import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface BlacklistItem {
    id: number;
    user_id: number;
    name: string;
    first_name?: string;
    last_name?: string;
    id_card_number?: string;
    type: 'restaurant' | 'hotel';
    description: string;
    image_url?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    dissatisfaction_rating: number;
    upvotes: number;
    downvotes: number;
    status: string;
    created_at: string;
    updated_at: string;
    reporter?: any;
    reviews?: any[];
}

export interface PaginatedResponse {
    blacklists: BlacklistItem[];
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
export class BlacklistService {
    private baseUrl = `${environment.apiUrl}/blacklist`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    getBlacklists(
        page: number = 1,
        limit: number = 10,
        type?: string,
        search?: string,
        sortBy: string = 'created_at',
        order: string = 'DESC'
    ): Observable<PaginatedResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString())
            .set('sortBy', sortBy)
            .set('order', order);

        if (type) params = params.set('type', type);
        if (search) params = params.set('search', search);

        return this.http.get<PaginatedResponse>(this.baseUrl, { params });
    }

    getBlacklistById(id: number): Observable<{ blacklist: BlacklistItem }> {
        return this.http.get<{ blacklist: BlacklistItem }>(`${this.baseUrl}/${id}`);
    }

    createBlacklist(formData: FormData): Observable<any> {
        return this.http.post(this.baseUrl, formData, {
            headers: this.authService.getAuthHeaders()
        });
    }

    getStats(id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}/stats`);
    }

    reportFalseInfo(id: number): Observable<any> {
        return this.http.post(`${this.baseUrl}/${id}/report`, {}, {
            headers: this.authService.getAuthHeaders()
        });
    }

    deleteBlacklist(id: number): Observable<any> {
        return this.http.delete(`${environment.apiUrl}/admin/blacklists/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
