import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Survey {

  readonly formUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSfE1uvj08lWrRamUK7VdrZQMJlUb6D9auYYCcF4GwtyQ-1DCQ/viewform?embedded=true';

  getFormUrl(): string {
    return this.formUrl;
  }
}