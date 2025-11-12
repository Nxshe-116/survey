import {Component, HostListener, OnInit} from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    NgIf,
    RouterModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {


  isMenuOpen = false;

  isMusicDropdownOpen = false;
  isManagementDropdownOpen = false;
  isPromotionDropdownOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleMusicDropdown() {
    this.isMusicDropdownOpen = !this.isMusicDropdownOpen;
  }

  toggleManagementDropdown() {
    this.isManagementDropdownOpen = !this.isManagementDropdownOpen;
  }

  togglePromotionDropdown() {
    this.isPromotionDropdownOpen = !this.isPromotionDropdownOpen;
  }

  ngOnInit(): void {
  }


  @HostListener('window:scroll', [])
  onWindowScroll(): void {

    // this.isScrolled = window.scrollY > 0;
  }
}
