import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BlacklistService, BlacklistItem } from '../../services/blacklist.service';
import { ReviewService } from '../../services/review.service';
import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-blacklist-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './blacklist-detail.component.html',
  styleUrls: ['./blacklist-detail.component.scss']
})
export class BlacklistDetailComponent implements OnInit {
  blacklist: BlacklistItem | null = null;
  loading = false;
  newComment = '';
  userVote: 'up' | 'down' | null = null;

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  constructor(
    private route: ActivatedRoute,
    private blacklistService: BlacklistService,
    private reviewService: ReviewService,
    private voteService: VoteService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.loadBlacklist(id);
    if (this.isAuthenticated) {
      this.checkUserVote(id);
    }
  }

  loadBlacklist(id: number): void {
    this.loading = true;
    this.blacklistService.getBlacklistById(id).subscribe({
      next: (response) => {
        this.blacklist = response.blacklist;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading blacklist:', error);
        this.loading = false;
      }
    });
  }

  checkUserVote(blacklist_id: number): void {
    this.voteService.checkVote(blacklist_id).subscribe({
      next: (response) => {
        this.userVote = response.vote?.vote_type || null;
      },
      error: () => { }
    });
  }

  onVote(type: 'up' | 'down'): void {
    if (!this.blacklist) return;

    this.voteService.vote(this.blacklist.id, type).subscribe({
      next: () => {
        this.userVote = type;
        this.loadBlacklist(this.blacklist!.id);
      },
      error: (error) => {
        console.error('Vote error:', error);
      }
    });
  }

  onAddReview(): void {
    if (!this.blacklist || !this.newComment.trim()) return;

    this.reviewService.addReview(this.blacklist.id, this.newComment).subscribe({
      next: () => {
        this.newComment = '';
        this.loadBlacklist(this.blacklist!.id);
      },
      error: (error) => {
        console.error('Add review error:', error);
      }
    });
  }
}
