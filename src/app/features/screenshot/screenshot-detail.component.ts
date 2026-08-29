import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ScreenshotService } from 'src/app/core/services/services';
import { ScreenshotDto } from 'src/app/core/models';

@Component({
  selector: 'app-screenshot-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './screenshot-detail.component.html',
  styleUrl: './screenshot-detail.component.css'
})
export class ScreenshotDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(ScreenshotService);

  screenshot: ScreenshotDto | null = null;
  loading = true;
  error = '';
  lightboxOpen = false;

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe({
      next: s => {
        this.screenshot = s;
        this.loading = false;
      },
      error: () => {
        this.error = 'Screenshot not found or has been deleted.';
        this.loading = false;
      }
    });
  }
}
