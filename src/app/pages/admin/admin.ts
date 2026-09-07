import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Reports } from '../../core/services/reports';


@Component({
  selector: 'app-admin',

  standalone: true,

  imports: [
    RouterLink,
    DatePipe
  ],

  templateUrl: './admin.html',

  styleUrl: './admin.css'
})


export class Admin implements OnInit {

  totalReports = 0;

  totalObservations = 0;

  totalResponses = 0;

  recentReports: any[] = [];

  filteredReports: any[] = [];

  searchTerm = '';

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

      const reports =
        await this.reportsService.getReports();

      this.totalReports =
        reports.length;

      this.totalObservations =
        reports.length;

      this.totalResponses = 0;

      this.recentReports =
        reports.slice(0, 10);

      this.filteredReports =
        [...this.recentReports];

    }

    catch (error) {

      console.error(
        'Admin dashboard loading error:',
        error
      );

      this.errorMessage =
        'Unable to load dashboard data.';

    }

    finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }


  searchReports(event: Event) {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm =
      input.value
        .toLowerCase()
        .trim();


    if (!this.searchTerm) {

      this.filteredReports =
        [...this.recentReports];

      return;

    }


    this.filteredReports =
      this.recentReports.filter(report => {

        const animal =
          (report.animal_type || '')
            .toLowerCase();

        const area =
          (report.area || '')
            .toLowerCase();

        const description =
          (report.description || '')
            .toLowerCase();

        const name =
          (report.name || '')
            .toLowerCase();


        return (
          animal.includes(this.searchTerm) ||
          area.includes(this.searchTerm) ||
          description.includes(this.searchTerm) ||
          name.includes(this.searchTerm)
        );

      });

  }

}