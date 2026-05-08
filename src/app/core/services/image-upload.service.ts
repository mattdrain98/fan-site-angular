import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private base = `${environment.apiBaseUrl}/images`;

  constructor(private http: HttpClient) {}

  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await firstValueFrom(
      this.http.post<{ url: string }>(`${this.base}/upload`, formData)
    );
    return response.url;
  }

  uploadMultipleImages(files: File[]): Promise<string[]> {
    return Promise.all(files.map(file => this.uploadImage(file)));
  }

  async deleteImage(imageUrl: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<{ message: string }>(`${this.base}/delete`, { body: { url: imageUrl } })
    );
  }

  validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type))
      return { valid: false, error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' };

    if (file.size > maxSize)
      return { valid: false, error: 'File is too large. Maximum size is 5MB.' };

    return { valid: true };
  }
}
