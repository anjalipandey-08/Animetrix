import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-survey',
  standalone: true,
  imports: [],
  templateUrl: './survey.html',
  styleUrl: './survey.css'
})
export class Survey {

  formUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {

    this.formUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://docs.google.com/forms/d/e/1FAIpQLSfE1uvj08lWrRamUK7VdrZQMJlUb6D9auYYCcF4GwtyQ-1DCQ/viewform?embedded=true'
    );

  }

}