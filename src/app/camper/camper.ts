import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleSheetService } from '../google-sheet';

@Component({
  selector: 'app-camper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camper.html',
  styleUrls: ['./camper.scss'],
})
export class Camper {
  activeStep = 1;
  steps = ['Personal Info', 'Accommodation', 'Payment', 'Summary'];

  formData = {
    firstName: '',
    lastName: '',
    phone: '',
    category: '',
    spouse: { firstName: '', lastName: '' },
    dependents: [] as any[],
    paidChildren: 0,
    expectedPaymentDate: '',
    wantTshirt: false,
    wantCap: false,
    volunteerRole: '',
    volunteerNote: '',
  };

  participants: any[] = [];
  loading = false;

  /** Base price map */
  priceMap: Record<string, number> = {
    Couple: 300,
    Adult: 230,
    Youth: 145,
    Teen: 85,
    Child: 0, // under 12 = free
    Day: 15,
  };
costBreakdown: number[] = [];
  constructor(private router: Router, private googleSheet: GoogleSheetService,) {}

  /** Update dynamic list of participants based on category */
  updateParticipants() {
    this.participants = [];

    const primaryName =
      `${this.formData.firstName} ${this.formData.lastName}`.trim() || 'Primary';
    this.participants.push({ name: primaryName, accommodation: '' });

    if (
      this.formData.category === 'Couple' ||
      this.formData.category === 'CoupleWithChildren'
    ) {
      const spouseName =
        `${this.formData.spouse.firstName} ${this.formData.spouse.lastName}`.trim() ||
        'Spouse';
      this.participants.push({ name: spouseName, accommodation: 'Couple' });
    }

    this.participants.push(...this.formData.dependents);
  }

  /** Add dependent */
  addDependent() {
    this.formData.dependents.push({
      name: '',
      ageGroup: '',
      accommodation: '',
    });
    this.updateParticipants();
    console.log('Cost breakdown:', this.costBreakdown);
  }

  /** Remove dependent */
  removeDependent(i: number) {
    this.formData.dependents.splice(i, 1);
    this.updateParticipants();
  }


  nextStep() {
    if (this.activeStep < 4) {
      this.activeStep++;
      console.log('➡️ Step advanced to', this.activeStep);
    }
  }

  prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }

isPriceIncreased(): boolean {
  if (!this.formData.expectedPaymentDate) return false;
  const paymentDate = new Date(this.formData.expectedPaymentDate);
  const cutoff = new Date('2025-11-30');
  return paymentDate > cutoff;
}

basePrice(): number {

  return  5;
}
 
totalCost() {
  const breakdown: number[] = [];
  const category = this.formData.category?.toLowerCase() || '';

  // 🧾 Base category
  if (category === 'couple') {
    breakdown.push(this.priceMap['Couple']);
  } 
  else if (category === 'couplewithchildren') {
    breakdown.push(this.priceMap['Couple']);
    for (const dep of this.formData.dependents) {
      const type = dep.ageGroup?.toLowerCase();
      if (type === 'teen') breakdown.push(this.priceMap['Teen']);
      if (type === 'youth') breakdown.push(this.priceMap['Youth']);
      if (type === 'child') breakdown.push(this.priceMap['Child']);
    }
  } 
  else if (category === 'adultwithdependents') {
    breakdown.push(this.priceMap['Adult']);
    for (const dep of this.formData.dependents) {
      const type = dep.ageGroup?.toLowerCase();
      if (type === 'teen') breakdown.push(this.priceMap['Teen']);
      if (type === 'youth') breakdown.push(this.priceMap['Youth']);
      if (type === 'child') breakdown.push(this.priceMap['Child']);
    }
  } 
  else {
    const singleType = category.charAt(0).toUpperCase() + category.slice(1);
    breakdown.push(this.priceMap[singleType] || 0);
  }

  // 🧢 Extras
  if (this.formData.wantTshirt) breakdown.push(10);
  if (this.formData.wantCap) breakdown.push(5);

  // 📅 Late payment increase
  if (this.isPriceIncreased()) {
    if (category === 'couple' || category === 'couplewithchildren') {
      breakdown.push(5); // flat per couple
    } else {
      const personCount = 1 + (this.formData.dependents?.length || 0);
      for (let i = 0; i < personCount; i++) breakdown.push(5);
    }
  }

  // 🔢 Final total
  const total = breakdown.reduce((sum, val) => sum + val, 0);

  this.costBreakdown = breakdown;
  console.log('💰 Breakdown:', breakdown, 'Total:', total);
  return total;
}





submitForm() {
  this.loading = true;

  const total = this.totalCost();
  const note = this.isPriceIncreased()
    ? 'Includes $5 December increase'
    : 'Standard camp rate';

  const camperData = {
    'First Name': this.formData.firstName,
    'Last Name': this.formData.lastName,
    'Phone': this.formData.phone,
    'Category': this.formData.category,
    'Spouse First Name': this.formData.spouse.firstName,
    'Spouse Last Name': this.formData.spouse.lastName,
    'Dependents': this.formData.dependents
      .map(d => `${d.name} (${d.ageGroup || 'N/A'})`)
      .join(', '),
    'Expected Payment Date': this.formData.expectedPaymentDate || 'Not provided',
    'Want T-Shirt': this.formData.wantTshirt ? 'Yes' : 'No',
    'Want Cap': this.formData.wantCap ? 'Yes' : 'No',
    'Volunteer Role': this.formData.volunteerRole || 'None',
    'Volunteer Note': this.formData.volunteerNote || '',
    'Amount': `$${total}`,
    'Note': note,
    'Timestamp': new Date().toLocaleString(),
  };

  this.googleSheet
    .sendToSheet('Campers', camperData)
    .then(() => {
      this.loading = false;
      this.nextStep();
    })
    .catch(err => {
      console.error('Failed to send data', err);
      this.loading = false;
      alert('There was an issue saving your registration. Please try again.');
    });
}



  printSummary() {
    window.print();
  }

  restartForm() {
    console.log('🧾 Form details', this.formData);
    this.router.navigate(['/']);
  }

  goHome() {
  this.router.navigate(['/']); // navigates to your main landing page
}




}
