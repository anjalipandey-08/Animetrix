import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface Vet {
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface HelpOrganisation {
  name: string;
  description: string;
  phone: string;
  website: string;
  location: string;
  icon: string;
}

@Component({
  selector: 'app-get-help',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './get-help.html',
  styleUrl: './get-help.css'
})
export class GetHelp {

  // Location
  latitude: number | null = null;
  longitude: number | null = null;

  loadingLocation = false;
  loadingVets = false;

  locationError = '';
  vetError = '';

  // Veterinary doctors
  vets: Vet[] = [];

  // Search radius in kilometres
  searchRadius = 10;

  // --------------------------------------------------
  // GET USER LOCATION
  // --------------------------------------------------
useMyLocation() {
  this.getLocation();
}

  getLocation() {

    this.loadingLocation = true;
    this.locationError = '';
    this.vetError = '';
    this.vets = [];

    if (!navigator.geolocation) {

      this.loadingLocation = false;

      this.locationError =
        'Geolocation is not supported by your browser.';

      return;
    }

    navigator.geolocation.getCurrentPosition(

      // SUCCESS
      (position) => {

        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;

        this.loadingLocation = false;

        console.log(
          'Latitude:',
          this.latitude,
          'Longitude:',
          this.longitude
        );

        // Automatically find nearby vets
        this.findNearbyVets();
      },

      // ERROR
      (error) => {

        this.loadingLocation = false;

        console.error('Location Error:', error);

        if (error.code === 1) {

          this.locationError =
            'Location permission was denied. Please allow location access and try again.';

        } else if (error.code === 2) {

          this.locationError =
            'Your location could not be determined. Please try again.';

        } else if (error.code === 3) {

          this.locationError =
            'Location request timed out. Please try again.';

        } else {

          this.locationError =
            'Unable to get your location. Please try again.';
        }
      },

      // OPTIONS
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }


  // --------------------------------------------------
  // FIND NEARBY VETERINARY CLINICS
  // --------------------------------------------------

  async findNearbyVets() {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {

      this.locationError =
        'Please allow location access first.';

      return;
    }

    this.loadingVets = true;
    this.vetError = '';
    this.vets = [];

    const lat = this.latitude;
    const lon = this.longitude;

    /*
      Overpass API searches OpenStreetMap
      for veterinary places around the user's location.
    */

    const radiusInMeters = this.searchRadius * 1000;

    const query = `
      [out:json][timeout:25];

      (
        node["amenity"="veterinary"]
          (around:${radiusInMeters},${lat},${lon});

        way["amenity"="veterinary"]
          (around:${radiusInMeters},${lat},${lon});

        relation["amenity"="veterinary"]
          (around:${radiusInMeters},${lat},${lon});
      );

      out center tags;
    `;

    const url =
      'https://overpass-api.de/api/interpreter?data=' +
      encodeURIComponent(query);

    try {

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch veterinary data.');
      }

      const data = await response.json();

      const results: Vet[] = [];

      for (const element of data.elements) {

        const tags = element.tags || {};

        const vetLatitude =
          element.lat ??
          element.center?.lat;

        const vetLongitude =
          element.lon ??
          element.center?.lon;

        if (
          vetLatitude === undefined ||
          vetLongitude === undefined
        ) {
          continue;
        }

        const name =
          tags['name'] ||
          tags['name:en'] ||
          'Veterinary Clinic';

        const address =
          this.createAddress(tags);

        const phone =
          tags['phone'] ||
          tags['contact:phone'] ||
          '';

        const distance =
          this.calculateDistance(
            lat,
            lon,
            vetLatitude,
            vetLongitude
          );

        results.push({
          name,
          address,
          phone,
          latitude: vetLatitude,
          longitude: vetLongitude,
          distance
        });
      }

      // Remove duplicate places
      const uniqueVets =
        results.filter(
          (vet, index, self) =>
            index ===
            self.findIndex(
              item =>
                item.name === vet.name &&
                Math.abs(item.latitude - vet.latitude) < 0.0001 &&
                Math.abs(item.longitude - vet.longitude) < 0.0001
            )
        );

      // Nearest first
      uniqueVets.sort(
        (a, b) => a.distance - b.distance
      );

      // Show maximum 20 results
      this.vets = uniqueVets.slice(0, 20);

      if (this.vets.length === 0) {

        this.vetError =
          `No veterinary clinics were found within ${this.searchRadius} km. Try a larger search radius.`;
      }

    } catch (error) {

      console.error(
        'Veterinary search error:',
        error
      );

      this.vetError =
        'Unable to load nearby veterinary clinics. Please check your internet connection and try again.';
    }

    this.loadingVets = false;
  }


  // --------------------------------------------------
  // CREATE ADDRESS
  // --------------------------------------------------

  private createAddress(tags: any): string {

    const parts: string[] = [];

    if (tags['addr:housenumber']) {
      parts.push(tags['addr:housenumber']);
    }

    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }

    if (tags['addr:suburb']) {
      parts.push(tags['addr:suburb']);
    }

    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }

    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }

    if (parts.length === 0) {
      return 'Address not available';
    }

    return parts.join(', ');
  }


  // --------------------------------------------------
  // CALCULATE DISTANCE
  // --------------------------------------------------

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {

    const earthRadius = 6371;

    const dLat =
      this.toRadians(lat2 - lat1);

    const dLon =
      this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +

      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return earthRadius * c;
  }


  private toRadians(value: number): number {
    return value * Math.PI / 180;
  }


  // --------------------------------------------------
  // CALL VET
  // --------------------------------------------------

  callVet(phone: string) {

    if (!phone) {
      return;
    }

    window.location.href =
      `tel:${phone}`;
  }


  // --------------------------------------------------
  // GOOGLE MAPS DIRECTIONS
  // --------------------------------------------------

  getDirections(
    latitude: number,
    longitude: number
  ) {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${this.latitude},${this.longitude}` +
      `&destination=${latitude},${longitude}`;

    window.open(
      url,
      '_blank'
    );
  }


  // --------------------------------------------------
  // SEARCH MORE ON GOOGLE MAPS
  // --------------------------------------------------

  searchMoreOnMaps() {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/search/veterinary+clinic/@` +
      `${this.latitude},${this.longitude},14z`;

    window.open(
      url,
      '_blank'
    );
  }


  // --------------------------------------------------
  // CHANGE SEARCH RADIUS
  // --------------------------------------------------

  changeRadius() {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {
      this.getLocation();
      return;
    }

    this.findNearbyVets();
  }


  // --------------------------------------------------
  // REFRESH LOCATION + VETS
  // --------------------------------------------------

  refreshLocation() {

    this.latitude = null;
    this.longitude = null;

    this.vets = [];

    this.locationError = '';
    this.vetError = '';

    this.getLocation();
  }


  // --------------------------------------------------
  // OFFICIAL HELP ORGANISATIONS
  // --------------------------------------------------

  helpOrganisations: HelpOrganisation[] = [

    {
      name: 'People For Animals (PFA)',

      description:
        'A nationwide animal-welfare network providing rescue, treatment, shelters and other animal-care support through its units.',

      phone:
        '01120818191',

      website:
        'https://www.peopleforanimalsindia.org/',

      location:
        'Multiple locations across India',

      icon:
        '🐾'
    },

    {
      name:
        'Animal Welfare Board of India (AWBI)',

      description:
        'The statutory animal welfare body under the Government of India. Its official directory provides information about recognised animal welfare organisations.',

      phone:
        '01292555700',

      website:
        'https://www.awbi.gov.in/recognition',

      location:
        'India',

      icon:
        '🏛️'
    }
  ];


  // --------------------------------------------------
  // OPEN ORGANISATION WEBSITE
  // --------------------------------------------------

  openWebsite(
    website: string
  ) {

    window.open(
      website,
      '_blank'
    );
  }

}