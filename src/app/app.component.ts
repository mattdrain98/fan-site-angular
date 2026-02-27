import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="text-center" style="background:skyblue">
      <img src="assets/images/chocobo.png" class="chocobo" alt="chocobo" />
      <img src="assets/images/logo.png" class="logo" alt="logo" />
      <img src="assets/images/cactuar.png" class="cactuar" alt="cactuar" />
    </div>
    <header>
      <app-navbar></app-navbar>
    </header>
    <div class="container">
      <main role="main" class="pb-3">
        <router-outlet></router-outlet>
      </main>
    </div>
    <footer class="border-top footer text-muted bg-white">
      <div class="container">
        &copy; 2021 - Final Fantasy Fan Site - <a routerLink="/privacy">Privacy</a>
      </div>
    </footer>
  `
})
export class AppComponent {}
