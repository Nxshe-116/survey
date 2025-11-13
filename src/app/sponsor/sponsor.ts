import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleSheetService } from '../google-sheet';

@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sponsor.html',
})
export class Sponsor  {
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
    note: '',
    intendedPaymentDate: '',
    paymentType: '',
    depositAmount: null,
  };

  constructor(private googleSheet: GoogleSheetService) {}

  // Navigation
  nextStep() {
    this.showWarnings = true;

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

    if (this.activeStep === 2 && !this.formData.beneficiaryName) {
      alert('Please enter the name of the camper being sponsored.');
      return;
    }

    if (this.activeStep === 3) {
      if (!this.formData.intendedPaymentDate || !this.formData.paymentType) {
        alert('Please complete payment details.');
        return;
      }
      if (
        this.formData.paymentType === 'Deposit' &&
        (!this.formData.depositAmount || this.formData.depositAmount <= 0)
      ) {
        alert('Please enter a valid deposit amount.');
        return;
      }
    }

    this.showWarnings = false;
    this.activeStep++;
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
      note: '',
      intendedPaymentDate: '',
      paymentType: '',
      depositAmount: null,
    };
    this.activeStep = 1;
  }

  // Validation
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^\d{8,15}$/.test(phone);
  }

  isPriceIncreased(): boolean {
    if (!this.formData.intendedPaymentDate) return false;
    const paymentDate = new Date(this.formData.intendedPaymentDate);
    const cutoff = new Date('2025-11-30');
    return paymentDate > cutoff;
  }

  basePrice(): number {
    return this.isPriceIncreased() ? 115 : 100;
  }

  // Main Submission (same pattern as your Contributions component)
  submitForm() {
    if (
      (!this.formData.anonymous && (!this.formData.firstName || !this.formData.phone)) ||
      !this.formData.beneficiaryName ||
      !this.formData.intendedPaymentDate ||
      !this.formData.paymentType
    ) {
      alert('⚠️ Please fill in all required fields.');
      return;
    }

    this.loading = true;

    const amount =
      this.formData.paymentType === 'Deposit'
        ? this.formData.depositAmount
        : this.basePrice();

    const sponsorshipData = {
      'First Name': this.formData.firstName || 'Anonymous',
      'Last Name': this.formData.lastName || '',
      'Phone': this.formData.phone || '',
      'Email': this.formData.email || '',
      'Intended Payment Date': this.formData.intendedPaymentDate,
      'Payment Type': this.formData.paymentType,
      'Deposit Amount': this.formData.depositAmount || '',
      'Sponsor Type': this.formData.anonymous ? 'Anonymous' : 'Named',
      'Beneficiary Name': this.formData.beneficiaryName,
      'Amount': amount,
      'Note': this.formData.note || '',
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

        this.activeStep = 5;
        this.resetForm();
      })
      .catch((err) => {
        console.error('❌ Failed to log sponsorship', err);
        this.loading = false;
        alert('Error saving sponsorship. Please try again.');
      });
  }
}
