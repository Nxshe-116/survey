import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleSheetService } from '../google-sheet';
import { Router } from '@angular/router';
 

@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sponsor.html',
})
export class Sponsor {
  loading = false;
  activeStep = 1;
  showWarnings = false;

  steps = ['Sponsor Info', 'Beneficiary', 'Payment', 'Confirm'];
  sponsorships: any[] = [];

  formData: any = {
    anonymous: false,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    beneficiaryName: '',
    beneficiaryType: '',
    note: '',
    intendedPaymentDate: '',
    paymentType: '', // Full or Partial
    amount: null, // manual amount for partial
  };

  // Base camp fees
  priceMap: Record<string, number> = {
    adult: 230,
    youth: 145,
    teen: 85,
    day: 15,
  };

  constructor(private googleSheet: GoogleSheetService, private router:Router) {}

  /** -----------------------------
   * 🧭 Navigation
   * ----------------------------- */
  nextStep() {
    this.showWarnings = true;

    // Step 1 validation
    if (this.activeStep === 1) {
      if (!this.formData.anonymous) {
        if (
          !this.formData.firstName ||
          !this.formData.lastName ||
          !this.isValidEmail(this.formData.email) ||
          !this.isValidPhone(this.formData.phone)
        ) {
          alert('Please fill in all sponsor details correctly.');
          return;
        }
      }
    }

    // Step 2 validation
    if (
      this.activeStep === 2 &&
      (!this.formData.beneficiaryName || !this.formData.beneficiaryType)
    ) {
      alert('Please enter the beneficiary name and camper type.');
      return;
    }

    // Step 3 validation
    if (this.activeStep === 3) {
      if (!this.formData.intendedPaymentDate || !this.formData.paymentType) {
        alert('Please complete payment details.');
        return;
      }

      if (
        this.formData.paymentType === 'Partial' &&
        (!this.formData.amount || this.formData.amount <= 0)
      ) {
        alert('Please enter a valid partial amount.');
        return;
      }
    }

    this.showWarnings = false;
    this.activeStep++;
  }
goHome() {
  this.router.navigate(['/']); // navigates to your main landing page
}
  prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }

  resetForm() {
    this.formData = {
      anonymous: false,
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      beneficiaryName: '',
      beneficiaryType: '',
      note: '',
      intendedPaymentDate: '',
      paymentType: '',
      amount: null,
    };
    this.activeStep = 1;
  }

  /** -----------------------------
   * ✅ Validation helpers
   * ----------------------------- */
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^\d{8,15}$/.test(phone);
  }

  /** -----------------------------
   * 💰 Price Helpers
   * ----------------------------- */
  isPriceIncreased(): boolean {
    if (!this.formData.intendedPaymentDate) return false;
    const paymentDate = new Date(this.formData.intendedPaymentDate);
    const cutoff = new Date('2025-11-30');
    return paymentDate > cutoff;
  }

  basePrice(): number {
    const type = this.formData.beneficiaryType;
    const base = this.priceMap[type] || 0;
    const increase = this.isPriceIncreased() ? 5 : 0;
    return base + increase;
  }

 
  submitForm() {
    if (
      (!this.formData.anonymous &&
        (!this.formData.firstName || !this.formData.phone)) ||
      !this.formData.beneficiaryName ||
      !this.formData.beneficiaryType ||
      !this.formData.intendedPaymentDate ||
      !this.formData.paymentType
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    this.loading = true;

    // Calculate final amount
    const amount =
      this.formData.paymentType === 'Partial'
        ? this.formData.amount
        : this.basePrice();

    const note = this.isPriceIncreased()
      ? 'Includes $5 December increase'
      : 'Standard sponsorship rate';

  
    const sponsorshipData = {
      'First Name': this.formData.firstName || 'Anonymous',
      'Last Name': this.formData.lastName || '',
      'Phone': this.formData.phone || '',
      'Email': this.formData.email || '',
      'Sponsor Type': this.formData.anonymous ? 'Anonymous' : 'Named',
      'Beneficiary Name': this.formData.beneficiaryName,
      'Beneficiary Type': this.formData.beneficiaryType,
      'Intended Payment Date': this.formData.intendedPaymentDate,
      'Payment Type': this.formData.paymentType,
      'Amount': `$${amount}`,
      'Note': this.formData.note || '',
      'Pricing Note': note,
      'Timestamp': new Date().toLocaleString(),
    };

    this.googleSheet
      .sendToSheet('Sponsors', sponsorshipData)
      .then(() => {
        console.log('✅ Sponsorship logged successfully');
        this.loading = false;

        this.sponsorships.push({
          ...this.formData,
          amount,
          status: 'Pending',
        });

        this.activeStep = 5; // Success screen
      })
      .catch((err) => {
        console.error('❌ Failed to log sponsorship', err);
        this.loading = false;
        alert('Error saving sponsorship. Please try again.');
      });
  }
}
