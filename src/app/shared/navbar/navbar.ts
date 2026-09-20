import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  isLoggedIn = false;
  isAdmin = false;

  menuOpen = false;


  constructor(
    private auth: Auth,
    private router: Router
  ) {}


  async ngOnInit() {

    // Check current login status
    await this.updateAuthState();


    // Listen for login/logout changes
    this.auth.onAuthStateChange(
      async () => {
        await this.updateAuthState();
      }
    );
  }


  async updateAuthState() {

    const user =
      await this.auth.getCurrentUser();

    this.isLoggedIn = !!user;


    if (user) {

      this.isAdmin =
        await this.auth.isAdmin();

    } else {

      this.isAdmin = false;

    }
  }


  /* ================================
     MOBILE MENU
  ================================ */

  toggleMenu() {

    this.menuOpen = !this.menuOpen;

  }


  closeMenu() {

    this.menuOpen = false;

  }


  /* ================================
     LOGOUT
  ================================ */

  async logout() {

    try {

      await this.auth.logout();

      this.isLoggedIn = false;
      this.isAdmin = false;

      this.closeMenu();

      await this.router.navigate(['/']);

    } catch (error) {

      console.error(
        'Logout error:',
        error
      );

    }
  }

}