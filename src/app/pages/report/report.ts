import {
  Component,
  ChangeDetectorRef
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Reports,
  AnimalReport
} from '../../core/services/reports';


@Component({
  selector: 'app-report',
  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './report.html',
  styleUrl: './report.css'
})


export class Report {

  submitted = false;

  submitting = false;

  errorMessage = '';


  report = {

    // Reporter
    name: '',
    email: '',
    phone: '',

    // Animal
    animalType: '',
    animalCount: 1,
    condition: '',
    behaviour: '',
    injured: '',
    urgentHelp: '',

    // Location
    area: '',
    exactLocation: '',
    landmark: '',
    coordinates: '',

    // Observation
    observationDate: '',
    observationTime: '',
    description: '',
    recurring: '',

    // Infrastructure
    water: '',
    food: '',
    shelter: '',
    traffic: '',
    waste: '',
    infrastructure: '',

    // Evidence
    photo: null as File | null,
    additionalNotes: ''

  };


  constructor(
    private reportsService: Reports,
    private cdr: ChangeDetectorRef
  ) {}


  // =========================
  // PHOTO SELECTION
  // =========================

  onFileSelected(event: Event) {

    const input =
      event.target as HTMLInputElement;


    if (
      input.files &&
      input.files.length > 0
    ) {

      const file =
        input.files[0];


      if (!file.type.startsWith('image/')) {

        this.errorMessage =
          'Please select a valid image file.';

        return;
      }


      if (file.size > 5 * 1024 * 1024) {

        this.errorMessage =
          'Please select an image smaller than 5 MB.';

        return;
      }


      this.report.photo = file;

      this.errorMessage = '';

    }

  }


  // =========================
  // SUBMIT REPORT
  // =========================

  async submitReport() {

    // Prevent duplicate submissions
    if (this.submitting) {
      return;
    }


    this.errorMessage = '';


    // =========================
    // REQUIRED FIELDS
    // =========================

    if (!this.report.name.trim()) {

      this.errorMessage =
        'Please enter your name.';

      return;
    }


    if (!this.report.email.trim()) {

      this.errorMessage =
        'Please enter your email address.';

      return;
    }


    if (!this.report.animalType) {

      this.errorMessage =
        'Please select an animal type.';

      return;
    }


    if (!this.report.area.trim()) {

      this.errorMessage =
        'Please enter the area or locality.';

      return;
    }


    if (!this.report.description.trim()) {

      this.errorMessage =
        'Please describe what you observed.';

      return;
    }


    this.submitting = true;

    this.cdr.detectChanges();


    try {

      // =========================
      // PHOTO UPLOAD
      // =========================

      let photoUrl: string | null = null;


      if (this.report.photo) {

        photoUrl =
          await this.reportsService.uploadPhoto(
            this.report.photo
          );

      }


      // =========================
      // DATABASE OBJECT
      // =========================

      const databaseReport: AnimalReport = {

        // Reporter
        name:
          this.report.name.trim(),

        email:
          this.report.email.trim(),

        phone:
          this.report.phone.trim(),


        // Animal
        animal_type:
          this.report.animalType,

        animal_count:
          Number(this.report.animalCount) || 1,

        condition:
          this.report.condition,

        behaviour:
          this.report.behaviour,

        injured:
          this.report.injured,

        urgent_help:
          this.report.urgentHelp,


        // Location
        area:
          this.report.area.trim(),

        exact_location:
          this.report.exactLocation,

        landmark:
          this.report.landmark,

        coordinates:
          this.report.coordinates,


        // Observation
        observation_date:
          this.report.observationDate || null,

        observation_time:
          this.report.observationTime || null,

        description:
          this.report.description.trim(),

        recurring:
          this.report.recurring,


        // Infrastructure
        water:
          this.report.water,

        food:
          this.report.food,

        shelter:
          this.report.shelter,

        traffic:
          this.report.traffic,

        waste:
          this.report.waste,

        infrastructure:
          this.report.infrastructure,


        // Evidence
        photo_url:
          photoUrl,

        additional_notes:
          this.report.additionalNotes

      };


      // =========================
      // SAVE TO SUPABASE
      // =========================

      console.log(
        'Submitting report to Supabase...'
      );


      await this.reportsService.createReport(
        databaseReport
      );


      console.log(
        'Report saved successfully!'
      );


      // =========================
      // SUCCESS
      // =========================

      this.submitted = true;

      this.submitting = false;

      this.errorMessage = '';


      // Force Angular to update the screen
      this.cdr.detectChanges();


      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });


    } catch (error) {

      console.error(
        'Report submission failed:',
        error
      );


      this.errorMessage =
        'Something went wrong while submitting your report. Please try again.';


      this.submitting = false;

      this.cdr.detectChanges();

    }

  }


  // =========================
  // RESET FORM
  // =========================

  resetForm() {

    this.submitted = false;

    this.submitting = false;

    this.errorMessage = '';


    this.report = {

      // Reporter
      name: '',
      email: '',
      phone: '',


      // Animal
      animalType: '',
      animalCount: 1,
      condition: '',
      behaviour: '',
      injured: '',
      urgentHelp: '',


      // Location
      area: '',
      exactLocation: '',
      landmark: '',
      coordinates: '',


      // Observation
      observationDate: '',
      observationTime: '',
      description: '',
      recurring: '',


      // Infrastructure
      water: '',
      food: '',
      shelter: '',
      traffic: '',
      waste: '',
      infrastructure: '',


      // Evidence
      photo: null,

      additionalNotes: ''

    };


    this.cdr.detectChanges();

  }

}