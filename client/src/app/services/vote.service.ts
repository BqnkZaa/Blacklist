import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VoteService {
    private baseUrl = `${environment.apiUrl}/votes`;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    vote(blacklist_id: number, vote_type: 'up' | 'down'): Observable<any> {
        return this.http.post(this.baseUrl,
            { blacklist_id, vote_type },
            { headers: this.authService.getAuthHeaders() }
        );
    }

    removeVote(blacklist_id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${blacklist_id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }

    checkVote(blacklist_id: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/check/${blacklist_id}`, {
            headers: this.authService.getAuthHeaders()
        });
    }
}
