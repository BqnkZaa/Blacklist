import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
    _activeTab: 'users' | 'blacklists' = 'users';

    get activeTab(): 'users' | 'blacklists' {
        return this._activeTab;
    }

    set activeTab(value: 'users' | 'blacklists') {
        this._activeTab = value;
        if (value === 'blacklists') {
            this.loadBlacklists();
        } else {
            this.loadUsers();
        }
    }

    stats = {
        totalUsers: 0,
        totalBlacklists: 0,
        totalReports: 0
    };

    users: any[] = [];
    blacklists: any[] = [];
    loading = false;

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.loadStats();
        this.loadUsers(); // Load users by default as it's the first tab
    }

    loadStats() {
        this.adminService.getStats().subscribe({
            next: (data) => {
                this.stats = data;
            },
            error: (err) => console.error('Error loading stats:', err)
        });
    }

    loadUsers() {
        this.loading = true;
        this.adminService.getUsers().subscribe({
            next: (res) => {
                this.users = res.users;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading users:', err);
                this.loading = false;
            }
        });
    }

    loadBlacklists() {
        this.loading = true;
        this.adminService.getAllBlacklists().subscribe({
            next: (res) => {
                this.blacklists = res.blacklists;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading blacklists:', err);
                this.loading = false;
            }
        });
    }

    deleteBlacklist(id: number) {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
            this.adminService.deleteBlacklist(id).subscribe({
                next: () => {
                    this.loadBlacklists();
                    this.loadStats();
                },
                error: (err) => alert('ลบรายการไม่สำเร็จ: ' + err.error?.error)
            });
        }
    }
}
