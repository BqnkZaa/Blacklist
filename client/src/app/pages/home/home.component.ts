import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlacklistService, BlacklistItem } from '../../services/blacklist.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    blacklists: BlacklistItem[] = [];
    loading = false;
    search = '';
    typeFilter = '';
    currentPage = 1;
    totalPages = 1;

    constructor(
        private blacklistService: BlacklistService,
        private router: Router,
        public authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadBlacklists();
    }

    loadBlacklists(): void {
        this.loading = true;
        this.blacklistService.getBlacklists(
            this.currentPage,
            9,
            this.typeFilter,
            this.search
        ).subscribe({
            next: (response) => {
                this.blacklists = response.blacklists;
                this.totalPages = response.pagination.totalPages;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading blacklists:', error);
                this.loading = false;
            }
        });
    }

    onSearch(): void {
        this.currentPage = 1;
        this.loadBlacklists();
    }

    onFilterChange(type: string): void {
        this.typeFilter = type;
        this.currentPage = 1;
        this.loadBlacklists();
    }

    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.loadBlacklists();
        }
    }

    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadBlacklists();
        }
    }

    viewDetails(id: number): void {
        this.router.navigate(['/blacklist', id]);
    }

    handleImageError(item: BlacklistItem): void {
        item.image_url = '';
    }

    deleteBlacklist(event: Event, id: number): void {
        event.stopPropagation(); // Prevent card click event

        if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
            this.blacklistService.deleteBlacklist(id).subscribe({
                next: () => {
                    alert('ลบรายการสำเร็จ');
                    this.loadBlacklists(); // Reload the list
                },
                error: (err: any) => {
                    alert('เกิดข้อผิดพลาด: ' + (err.error?.error || 'ไม่สามารถลบได้'));
                }
            });
        }
    }
}
