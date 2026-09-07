import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { RouterLink } from '@angular/router';

import { Reports } from '../../core/services/reports';

@Component({
  selector: 'app-insights',
  standalone: true,

  imports: [
    RouterLink
  ],

  templateUrl: './insights.html',

  styleUrl: './insights.css'
})

export class Insights implements OnInit {

  // Main statistics
  reports = 0;

  surveyResponses = 0;

  observations = 0;


  // Animal type data
  animalTypes: {
    name: string;
    count: number;
    percentage: number;
  }[] = [];


  // Resource observations
  resourceStats = {
    water: 0,
    food: 0,
    shelter: 0
  };


  // Location data
  locations: {
    name: string;
    count: number;
  }[] = [];


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


      // Fetch REAL reports from Supabase

      const data =
        await this.reportsService.getReports();


      const reports =
        data ?? [];


      // Main statistics

      this.reports =
        reports.length;

      this.observations =
        reports.length;


      // Calculate animal type insights

      this.calculateAnimalTypes(reports);


      // Calculate resource insights

      this.calculateResources(reports);


      // Calculate location insights

      this.calculateLocations(reports);

    }

    catch (error) {

      console.error(
        'Insights loading error:',
        error
      );

      this.errorMessage =
        'Unable to load insights from the database.';

    }

    finally {

      this.loading = false;

      this.cdr.detectChanges();

    }

  }


  // ==========================================
  // ANIMAL TYPE ANALYSIS
  // ==========================================

  calculateAnimalTypes(reports: any[]) {

    const counts: {
      [key: string]: number;
    } = {};


    reports.forEach(report => {

      const animal =
        (report.animal_type || '')
          .trim();


      if (!animal) {
        return;
      }


      const key =
        animal.toLowerCase();


      counts[key] =
        (counts[key] || 0) + 1;

    });


    const total =
      reports.length;


    this.animalTypes =
      Object.entries(counts)

        .map(([name, count]) => ({

          name:
            name.charAt(0).toUpperCase()
            + name.slice(1),

          count,

          percentage:
            total > 0
              ? Math.round((count / total) * 100)
              : 0

        }))

        .sort(
          (a, b) =>
            b.count - a.count
        );

  }


  // ==========================================
  // RESOURCE ANALYSIS
  // ==========================================

  calculateResources(reports: any[]) {

    this.resourceStats = {
      water: 0,
      food: 0,
      shelter: 0
    };


    reports.forEach(report => {

      if (
        this.isPositiveValue(
          report.water
        )
      ) {

        this.resourceStats.water++;

      }


      if (
        this.isPositiveValue(
          report.food
        )
      ) {

        this.resourceStats.food++;

      }


      if (
        this.isPositiveValue(
          report.shelter
        )
      ) {

        this.resourceStats.shelter++;

      }

    });

  }


  // ==========================================
  // LOCATION ANALYSIS
  // ==========================================

  calculateLocations(reports: any[]) {

    const counts: {
      [key: string]: number;
    } = {};


    reports.forEach(report => {

      const area =
        (report.area || '')
          .trim();


      if (!area) {
        return;
      }


      const key =
        area.toLowerCase();


      counts[key] =
        (counts[key] || 0) + 1;

    });


    this.locations =
      Object.entries(counts)

        .map(([name, count]) => ({

          name:
            name.charAt(0).toUpperCase()
            + name.slice(1),

          count

        }))

        .sort(
          (a, b) =>
            b.count - a.count
        )

        .slice(0, 5);

  }


  // ==========================================
  // CHECK YES / AVAILABLE VALUES
  // ==========================================

  isPositiveValue(
    value: string | null | undefined
  ): boolean {

    if (!value) {
      return false;
    }


    const normalized =
      value
        .toString()
        .trim()
        .toLowerCase();


    return [
      'yes',
      'available',
      'provided',
      'present',
      'good',
      'true'
    ].includes(normalized);

  }

}