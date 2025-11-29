import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private baseUrl = `${environment.apiUrl}/reviews`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    addReview(blacklist_id: number, comment: string): Observable<any> {
        return this.http.post(this.baseUrl,
            { blacklist_id, comment },
            { headers: this.authService.getAuthHeaders() }
        );
    }

    deleteReview(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
