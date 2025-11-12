import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GoogleSheetService } from '../google-sheet';
 // adjust path if needed

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

  priceMap: Record<string, number> = {
    couple: 300, // shared for both spouses
    adult: 230,
    youth: 145,
    teen: 85,
    day: 15,
  };

  constructor(private router: Router, private googleSheet: GoogleSheetService) {}

  updateParticipants() {
    this.participants = [];

    const primaryName =
      `${this.formData.firstName} ${this.formData.lastName}`.trim() || 'Primary';
    this.participants.push({ name: primaryName, accommodation: '' });

    if (
      this.formData.category === 'couple' ||
      this.formData.category === 'coupleWithChildren'
    ) {
      const spouseName =
        `${this.formData.spouse.firstName} ${this.formData.spouse.lastName}`.trim() ||
        'Spouse';
      this.participants.push({ name: spouseName, accommodation: 'couple' });
    }

    this.participants.push(...this.formData.dependents);
  }

  addDependent() {
    this.formData.dependents.push({ name: '', ageGroup: '', accommodation: '' });
    this.updateParticipants();
  }

  removeDependent(i: number) {
    this.formData.dependents.splice(i, 1);
    this.updateParticipants();
  }

  nextStep() {
    if (this.activeStep < 4) {
      this.activeStep++;
      console.log('➡️ Step advanced at:', new Date().toLocaleString());
    }
  }

  prevStep() {
    if (this.activeStep > 1) this.activeStep--;
  }

  // ✅ Correct cost logic
  totalCost() {
    let total = 0;

    if (
      this.formData.category === 'couple' ||
      this.formData.category === 'coupleWithChildren'
    ) {
      total += this.priceMap['couple'];
    }

    for (const d of this.formData.dependents) {
      total += this.priceMap[d.ageGroup] || 0;
    }

    if (
      this.formData.category === 'adult' ||
      this.formData.category === 'youth'
    ) {
      total += this.priceMap[this.formData.category];
    }

    if (this.formData.wantTshirt) total += 20;
    if (this.formData.wantCap) total += 10;

    return total;
  }

  // 🚀 SUBMIT FORM + send to Google Sheet
  submitForm() {
    this.loading = true;

    const camperData = {
      'First Name': this.formData.firstName,
      'Last Name': this.formData.lastName,
      'Phone': this.formData.phone,
      'Category': this.formData.category,
      'Spouse First Name': this.formData.spouse.firstName,
      'Spouse Last Name': this.formData.spouse.lastName,
      'Dependents': this.formData.dependents.map(d => `${d.name} (${d.ageGroup})`).join(', '),
      'Paid Children': this.formData.paidChildren,
      'Expected Payment Date': this.formData.expectedPaymentDate,
      'Want T-Shirt': this.formData.wantTshirt ? 'Yes' : 'No',
      'Want Cap': this.formData.wantCap ? 'Yes' : 'No',
      'Volunteer Role': this.formData.volunteerRole,
      'Volunteer Note': this.formData.volunteerNote,
    };

    this.googleSheet.sendToSheet('Campers', camperData)
      .then(() => {
        console.log('✅ Camper data sent to Google Sheet');
        this.loading = false;
        this.nextStep();
      })
      .catch((err) => {
        console.error('❌ Failed to send data', err);
        this.loading = false;
        alert('There was an issue saving your registration. Please try again.');
      });
  }

  printSummary() {
    window.print();
  }

  restartForm() {
    console.log('form details', this.formData);
    this.router.navigate(['/']);
  }
}
