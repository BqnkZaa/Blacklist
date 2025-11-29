import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BlacklistService } from '../../services/blacklist.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-report.component.html',
  styleUrls: ['./create-report.component.scss']
})
export class CreateReportComponent {
  name = '';
  type = '';
  description = '';
  address = '';
  dissatisfaction_rating = 3;
  selectedFile: File | null = null;
  error = '';
  loading = false;

  constructor(
    private blacklistService: BlacklistService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (!this.name || !this.type || !this.description) {
      this.error = 'กรุณากรอกข้อมูลที่จำเป็น';
      return;
    }

    this.loading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('type', this.type);
    formData.append('description', this.description);
    formData.append('dissatisfaction_rating', this.dissatisfaction_rating.toString());

    if (this.address) formData.append('address', this.address);
    if (this.selectedFile) formData.append('image', this.selectedFile);

    this.blacklistService.createBlacklist(formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.error || 'บันทึกรายงานไม่สำเร็จ';
        this.loading = false;
      }
    });
  }
}
