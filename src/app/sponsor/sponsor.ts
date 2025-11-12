import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleSheetService } from '../google-sheet';


@Component({
  selector: 'app-sponsor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sponsor.html',
  styleUrls: ['./sponsor.scss'],
})
export class Sponsor {
  activeStep = 1;
  showWarnings = false;
  loading = false;
  steps = ['Personal Info', 'Payment Timing', 'Sponsorship', 'Summary'];

  formData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    intendedPaymentDate: new Date().toISOString().split('T')[0],
    paymentType: '', // full or deposit
    depositAmount: 0,
    sponsorType: '', // full or partial
    beneficiaryName: '',
    amount: 0,
    note: '',
  };

  constructor(private router: Router, private googleSheet: GoogleSheetService) {}

  // ✅ VALIDATION HELPERS
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[0-9+\s()-]{8,15}$/;
    return !!phone && phoneRegex.test(phone);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !!email && emailRegex.test(email);
  }

  // ✅ PRICE LOGIC
  isPriceIncreased(): boolean {
    const cutoff = new Date('2025-11-30');
    const payment = new Date(this.formData.intendedPaymentDate);
    return payment > cutoff;
  }

  basePrice(): number {
    return this.isPriceIncreased() ? 315 : 300;
  }

  totalAmount(): number {
    if (this.formData.paymentType === 'deposit')
      return this.formData.depositAmount || 0;
    if (this.formData.sponsorType === 'partial')
      return this.formData.amount || 0;
    return this.basePrice();
  }

  // ✅ STEP NAVIGATION
  nextStep() {
    this.showWarnings = true;
    if (this.activeStep === 1 && !this.validateStep1()) return;
    if (this.activeStep === 2 && !this.validateStep2()) return;
    if (this.activeStep === 3 && !this.validateStep3()) return;
    this.activeStep++;
    this.showWarnings = false;
  }

  prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }

  // ✅ STEP VALIDATIONS
  validateStep1(): boolean {
    return (
      !!this.formData.firstName.trim() &&
      !!this.formData.lastName.trim() &&
      this.isValidPhone(this.formData.phone) &&
      this.isValidEmail(this.formData.email)
    );
  }

  validateStep2(): boolean {
    if (!this.formData.intendedPaymentDate) return false;
    if (!this.formData.paymentType) return false;
    if (
      this.formData.paymentType === 'deposit' &&
      (!this.formData.depositAmount || this.formData.depositAmount <= 0)
    )
      return false;
    return true;
  }

  validateStep3(): boolean {
    if (!this.formData.sponsorType) return false;
    if (
      this.formData.sponsorType === 'partial' &&
      (!this.formData.amount || this.formData.amount <= 0)
    )
      return false;
    return true;
  }

  // ✅ SUBMIT + SEND TO GOOGLE SHEET
  submitForm() {
    this.loading = true;

    const sponsorData = {
      'First Name': this.formData.firstName,
      'Last Name': this.formData.lastName,
      'Phone': this.formData.phone,
      'Email': this.formData.email,
      'Intended Payment Date': this.formData.intendedPaymentDate,
      'Payment Type': this.formData.paymentType,
      'Deposit Amount': this.formData.depositAmount,
      'Sponsor Type': this.formData.sponsorType,
      'Beneficiary Name': this.formData.beneficiaryName,
      'Amount': this.formData.amount,
      'Note': this.formData.note,
    };

    this.googleSheet.sendToSheet('Sponsors', sponsorData).then(
      () => {
        console.log('✅ Sponsor data sent to Google Sheet');
        this.loading = false;
        this.activeStep++;
      }
    ).catch(
      (err) => {
        console.error('❌ Failed to send sponsor data', err);
        this.loading = false;
        alert('There was an issue saving your sponsorship. Please try again.');
      }
    );
  }

  printSummary() {
    window.print();
  }

  restartForm() {
    this.router.navigate(['/']);
  }
}
