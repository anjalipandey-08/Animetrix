import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { Reports } from '../../core/services/reports';

@Component({
  selector: 'app-explore',

  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './explore.html',

  styleUrl: './explore.css'
})

export class Explore implements OnInit {

  reports: any[] = [];

  filteredReports: any[] = [];

  loading = true;

  errorMessage = '';

  searchTerm = '';


  categories = [

    {
      title: 'Urban Animals',

      text:
        'Explore observations and understand animal presence in urban spaces.',

      image:
        'images/urbancat.jpg',

      link:
        '/community'
    },

    {
      title: 'Animal Infrastructure',

      text:
        'Discover water points, shelters and other animal-friendly facilities.',

      image:
        'images/urbaninfrastrucure.jpg',

      link:
        '/report'
    },

    {
      title: 'Water & Food Facilities',

      text:
        'Learn about the availability of essential resources for animals.',

      image:
        'images/waterfacility.jpg',

      link:
        '/report'
    },

    {
      title: 'Street Animal Observations',

      text:
        'Share and understand real observations from urban environments.',

      image:
        'images/streetdog.jpg',

      link:
        '/report'
    }

  ];


  constructor(
    private reportsService: Reports,
    private cdr: ChangeDetectorRef
  ) {}


  async ngOnInit() {

    try {

      this.loading = true;

      this.reports =
        await this.reportsService.getReports();

      this.filteredReports =
        [...this.reports];

    }

    catch (error) {

      console.error(
        'Explore reports loading error:',
        error
      );

      this.errorMessage =
        'Unable to load recent observations.';

    }

    finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }


  searchObservations(event: Event) {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm =
      input.value.toLowerCase().trim();


    // If search box is empty,
    // show all reports again

    if (!this.searchTerm) {

      this.filteredReports =
        [...this.reports];

      return;

    }


    // Search by animal type,
    // area/locality,
    // or description

    this.filteredReports =
      this.reports.filter(report =>

        (report.animal_type || '')
          .toLowerCase()
          .includes(this.searchTerm)

        ||

        (report.area || '')
          .toLowerCase()
          .includes(this.searchTerm)

        ||

        (report.description || '')
          .toLowerCase()
          .includes(this.searchTerm)

      );


    // Automatically scroll to
    // Recent Observations section

    setTimeout(() => {

      document
        .getElementById('recent-observations')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });

    }, 100);

  }

}