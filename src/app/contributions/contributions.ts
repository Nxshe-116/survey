import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoogleSheetService } from '../google-sheet';
import { Router } from '@angular/router';


@Component({
  selector: 'app-contributions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contributions.html',
})
export class Contributions {
  activeTab: 'dry' | 'perishables' = 'dry';
  showForm = false;
  selectedItem: any = null;
  loading = false;

  form = {
    name: '',
    phone: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
  };

  dryGoods = [
    { name: 'Basmati Rice', unit: 'kgs', needed: 10, pledged: 10 },
    { name: 'Mahatma Rice', unit: 'kgs', needed: 30, pledged: 30 },
    { name: 'Mealie Meal', unit: 'kgs', needed: 60, pledged: 60 },
    { name: 'Spaghetti', unit: 'packets', needed: 30, pledged: 30 },
    { name: 'Cooking Oil', unit: 'litres', needed: 26, pledged: 26 },
    { name: 'Paprika', unit: 'kgs', needed: 2, pledged: 0 },
    { name: 'Parsley', unit: 'g', needed: 150, pledged: 0 },
    { name: 'Black Pepper', unit: 'g', needed: 100, pledged: 100 },
    { name: 'Fish Spice', unit: 'g', needed: 150, pledged: 0 },
    { name: 'Vinegar', unit: 'litres', needed: 2, pledged: 2 },
    { name: 'Gas', unit: 'kgs', needed: 50, pledged: 0 },
  ];

  perishables = [
    { name: 'Bread', unit: 'loaves', needed: 90, pledged: 90 },
    { name: 'Butter', unit: 'kgs', needed: 3, pledged: 0 },
    { name: 'Fresh Milk', unit: 'litres', needed: 24, pledged: 24 },
    { name: 'Cabbage', unit: 'heads', needed: 10, pledged: 10 },
    { name: 'Eggs', unit: 'crates', needed: 20, pledged: 0 },
    { name: 'Apples', unit: 'kgs', needed: 25, pledged: 0 },
    { name: 'Potatoes', unit: 'pockets', needed: 4, pledged: 0 },
    { name: 'Fresh Cream', unit: 'litre', needed: 1, pledged: 1 },
    { name: 'Bananas', unit: 'kgs', needed: 15, pledged: 0 },
  ];

  contributions: any[] = [];

  constructor(private googleSheet: GoogleSheetService,private router:Router) {}

  getStatus(item: any): string {
    if (item.pledged >= item.needed) return 'Completed';
    if (item.pledged > 0) return 'Partially Contributed';
    return 'Available';
  }

  openForm(item: any) {
    this.selectedItem = item;
    this.showForm = true;
  }
goHome() {
  this.router.navigate(['/']); // navigates to your main landing page
}
 
  submitForm() {
    if (!this.form.name || !this.form.phone || this.form.quantity <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    this.loading = true;
    this.selectedItem.pledged += this.form.quantity;

    const contributionData = {
      'Name': this.form.name,
      'Phone': this.form.phone,
      'Item': this.selectedItem.name,
      'Quantity': this.form.quantity,
      'Date': this.form.date,
      'Status': this.getStatus(this.selectedItem),
    };

    this.googleSheet.sendToSheet('Contributions', contributionData).then(() => {
      console.log('✅ Contribution logged successfully');
      this.loading = false;
      this.contributions.push({
        item: this.selectedItem.name,
        ...this.form,
        status: this.getStatus(this.selectedItem),
      });

      this.showForm = false;
      this.form = {
        name: '',
        phone: '',
        quantity: 0,
        date: new Date().toISOString().split('T')[0],
      };
    }).catch((err) => {
      console.error('❌ Failed to log contribution', err);
      this.loading = false;
      alert('Error saving your contribution. Please try again.');
    });
  }


  
}
