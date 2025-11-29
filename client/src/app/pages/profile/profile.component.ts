import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>โปรไฟล์</h2>
        
        <div *ngIf="user" class="user-info">
          <div class="info-item">
            <label>ชื่อผู้ใช้:</label>
            <span>{{ user.username }}</span>
          </div>
          <div class="info-item">
            <label>อีเมล:</label>
            <span>{{ user.email }}</span>
          </div>
          <div class="info-item">
            <label>บทบาท:</label>
            <span>{{ user.role }}</span>
          </div>
          
          <button (click)="onLogout()" class="logout-btn">ออกจากระบบ</button>
        </div>

        <div class="back-link">
          <a routerLink="/">← กลับหน้าหลัก</a>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .profile-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 500px;
    }

    h2 {
      text-align: center;
      color: var(--primary-color);
      margin-bottom: 2rem;
    }

    .user-info {
      .info-item {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e0e0e0;

        label {
          display: block;
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        span {
          font-size: 1.1rem;
          font-weight: 500;
        }
      }

      .logout-btn {
        width: 100%;
        padding: 1rem;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 1rem;
      }

      .logout-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      }
    }

    .back-link {
      text-align: center;
      margin-top: 1.5rem;

      a {
        color: #666;
        text-decoration: none;
      }

      a:hover {
        color: var(--primary-color);
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
    user: User | null = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.authService.user$.subscribe(user => {
            this.user = user;
        });
    }

    onLogout(): void {
        this.authService.logout();
        window.location.href = '/';
    }
}
