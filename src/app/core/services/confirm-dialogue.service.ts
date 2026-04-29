import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  visible = signal(false);
  message = signal('');
  private resolveFn: ((result: boolean) => void) | null = null;


  confirm(message: string): Promise<boolean> {
    this.message.set(message);
    this.visible.set(true);
    console.log('confirm called, visible:', this.visible());
    return new Promise(resolve => {
      this.resolveFn = resolve;
    });
  }

    accept() {
      this.resolveFn?.(true);
      this.visible.set(false);
    }
    
  decline() {
    this.resolveFn?.(false);
    this.visible.set(false);
  }
}