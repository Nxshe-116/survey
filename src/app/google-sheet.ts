import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class GoogleSheetService {
  private endpoint =
    'https://script.google.com/macros/s/AKfycbwhWPkKp5x9Nhh2Rd5f_huR53HeFWofl2xTinFNHKGXMzd8l_frys_KA4QmxJ1wLwTI/exec';

  constructor(private http: HttpClient) {}

  sendToSheet(sheet: string, rowData: any) {
    // use fetch() directly instead of HttpClient to control headers completely
    const payload = JSON.stringify({ sheet, row: rowData });

    return fetch(this.endpoint, {
      method: 'POST',
      body: payload,
      headers: {
        'Content-Type': 'text/plain',
      },
      mode: 'no-cors',
    });
  }
}
