import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReplyService } from 'src/app/core/services/reply.service';
import { ReplyDetailDto } from 'src/app/core/models';

@Component({
  selector: 'app-reply-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './reply-detail.component.html',
  styleUrl: './reply-detail.component.css'
})
export class ReplyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private replyService = inject(ReplyService);

  reply: ReplyDetailDto | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.replyService.getById(id).subscribe({
      next: reply => {
        this.reply = reply;
        this.loading = false;
      },
      error: () => {
        this.error = 'Reply not found or has been deleted.';
        this.loading = false;
      }
    });
  }
}
