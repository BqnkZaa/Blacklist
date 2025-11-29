import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRegister(): void {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'กรุณากรอกข้อมูลให้ครบถ้วน';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'รหัสผ่านไม่ตรงกัน';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.register(this.username, this.email, this.password).subscribe({
      next: () => {
        // Redirect to login page after successful registration
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.error || 'สมัครสมาชิกไม่สำเร็จ';
        this.loading = false;
      }
    });
  }
}
