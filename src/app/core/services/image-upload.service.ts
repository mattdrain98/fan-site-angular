import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private base = `${environment.apiBaseUrl}/images`;

  constructor(private http: HttpClient) {}

  /**
   * Upload a single image file
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await firstValueFrom(
        this.http.post<{ url: string }>(
          `${this.base}/upload`,
          formData
        )
      );
      if (!response) throw new Error('No response from server');
      return `https://localhost:5001${response.url}`;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images at once
   */
  uploadMultipleImages(files: File[]): Promise<string[]> {
    return Promise.all(
      files.map(file => this.uploadImage(file))
    );
  }

  /**
   * Delete an image
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete<void>(
          `${this.base}/delete`,
          { body: { url: imageUrl } }
        )
      );
      console.log('Image deleted:', imageUrl);
    } catch (error) {
      console.error('Image deletion error:', error);
      throw error;
    }
  }

  /**
   * Validate image before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.'
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File is too large. Maximum size is 5MB.'
      };
    }

    return { valid: true };
  }
}