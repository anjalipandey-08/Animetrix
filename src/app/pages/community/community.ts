import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Reports } from '../../core/services/reports';

@Component({
  selector: 'app-community',
  standalone: true,

  imports: [
    RouterLink,
    DatePipe
  ],

  templateUrl: './community.html',
  styleUrl: './community.css'
})

export class Community implements OnInit {

  reports: any[] = [];

  loading = true;

  errorMessage = '';

  constructor(
    private reportsService: Reports,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {

    try {

      this.loading = true;
      this.errorMessage = '';

      this.reports =
        await this.reportsService.getReports();

    } catch (error) {

      console.error(
        'Community reports loading error:',
        error
      );

      this.errorMessage =
        'Unable to load community observations.';

    } finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }

}