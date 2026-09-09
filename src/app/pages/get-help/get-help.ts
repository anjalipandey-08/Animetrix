import { Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';

interface Vet {
  name: string;
  type: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface Ngo {
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

  // ==========================================
  // LOCATION
  // ==========================================

  latitude: number | null = null;
  longitude: number | null = null;

  locationMessage: string = '';
  locationSelected: boolean = false;


  // ==========================================
  // VETERINARY SERVICES
  // ==========================================

  isLoadingVets: boolean = false;

  nearbyVets: Vet[] = [];

  vetError: string = '';

  searchRadius: number = 10;


  // ==========================================
  // NGO / ANIMAL WELFARE ORGANISATIONS
  // ==========================================

  ngos: Ngo[] = [

    {
      name: 'People For Animals (PFA)',

      description:
        'A nationwide animal-welfare network providing rescue, treatment, shelters and animal-care support through its units.',

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


  // ==========================================
  // USE MY LOCATION
  // ==========================================

  useMyLocation(): void {

    this.locationMessage = '';
    this.vetError = '';

    this.nearbyVets = [];

    if (!navigator.geolocation) {

      this.locationSelected = false;

      this.locationMessage =
        'Geolocation is not supported by your browser.';

      return;
    }


    this.locationMessage =
      'Getting your location...';


    navigator.geolocation.getCurrentPosition(

      // --------------------------------------
      // SUCCESS
      // --------------------------------------

      (position) => {

        this.latitude =
          position.coords.latitude;

        this.longitude =
          position.coords.longitude;

        this.locationSelected =
          true;

        this.locationMessage =
          'Location found! Finding veterinary services near you...';


        console.log(
          'User latitude:',
          this.latitude
        );

        console.log(
          'User longitude:',
          this.longitude
        );


        // Automatically search nearby vets
        this.loadNearbyVets();

      },


      // --------------------------------------
      // ERROR
      // --------------------------------------

      (error) => {

        console.error(
          'Location error:',
          error
        );

        this.locationSelected =
          false;


        if (error.code === 1) {

          this.locationMessage =
            'Location permission was denied. Please allow location access and try again.';

        }

        else if (error.code === 2) {

          this.locationMessage =
            'Your location could not be determined. Please try again.';

        }

        else if (error.code === 3) {

          this.locationMessage =
            'Location request timed out. Please try again.';

        }

        else {

          this.locationMessage =
            'Unable to get your location. Please try again.';
        }

      },


      // --------------------------------------
      // LOCATION OPTIONS
      // --------------------------------------

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }

    );

  }


  // ==========================================
  // LOAD NEARBY VETERINARY SERVICES
  // ==========================================

  async loadNearbyVets(): Promise<void> {

    if (
      this.latitude === null ||
      this.longitude === null
    ) {

      this.locationMessage =
        'Please allow location access first.';

      return;
    }


    this.isLoadingVets =
      true;

    this.vetError =
      '';

    this.nearbyVets =
      [];


    const userLatitude =
      this.latitude;

    const userLongitude =
      this.longitude;


    const radiusInMeters =
      this.searchRadius * 1000;


    // OpenStreetMap Overpass query
    const query = `

      [out:json][timeout:25];

      (

        node["amenity"="veterinary"]
        (around:${radiusInMeters},${userLatitude},${userLongitude});

        way["amenity"="veterinary"]
        (around:${radiusInMeters},${userLatitude},${userLongitude});

        relation["amenity"="veterinary"]
        (around:${radiusInMeters},${userLatitude},${userLongitude});

      );

      out center tags;

    `;


    const apiUrl =
      'https://overpass-api.de/api/interpreter?data=' +
      encodeURIComponent(query);


    try {

      const response =
        await fetch(apiUrl);


      if (!response.ok) {

        throw new Error(
          'Veterinary API request failed.'
        );
      }


      const data =
        await response.json();


      const results: Vet[] = [];


      // ======================================
      // PROCESS RESULTS
      // ======================================

      for (
        const element of data.elements
      ) {

        const tags =
          element.tags || {};


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

            userLatitude,
            userLongitude,

            vetLatitude,
            vetLongitude

          );


        results.push({

          name:

            name,

          type:

            tags['healthcare'] === 'veterinary'
              ? 'Veterinary Care'
              : 'Veterinary Clinic',

          address:

            address,

          phone:

            phone,

          latitude:

            vetLatitude,

          longitude:

            vetLongitude,

          distance:

            distance

        });

      }


      // ======================================
      // REMOVE DUPLICATES
      // ======================================

      const uniqueVets =
        results.filter(

          (vet, index, array) =>

            index ===
            array.findIndex(

              item =>

                item.name === vet.name &&

                Math.abs(
                  item.latitude -
                  vet.latitude
                ) < 0.0001 &&

                Math.abs(
                  item.longitude -
                  vet.longitude
                ) < 0.0001

            )

        );


      // ======================================
      // SORT NEAREST FIRST
      // ======================================

      uniqueVets.sort(

        (a, b) =>
          a.distance -
          b.distance

      );


      // ======================================
      // SHOW MAXIMUM 20
      // ======================================

      this.nearbyVets =
        uniqueVets.slice(0, 20);


      // ======================================
      // NO RESULTS
      // ======================================

      if (
        this.nearbyVets.length === 0
      ) {

        this.vetError =
          `No veterinary clinics were found within ${this.searchRadius} km. Try searching for more services on the map.`;

      }

    }


    catch (error) {

      console.error(
        'Veterinary search error:',
        error
      );


      this.vetError =
        'Unable to load nearby veterinary services. Please check your internet connection and try again.';

    }


    finally {

      this.isLoadingVets =
        false;

    }

  }


  // ==========================================
  // SCROLL TO VETERINARY SECTION
  // ==========================================

  scrollToVets(): void {

    const section =
      document.getElementById('vets');


    if (section) {

      section.scrollIntoView({

        behavior:
          'smooth',

        block:
          'start'

      });

    }

  }


  // ==========================================
  // CREATE ADDRESS
  // ==========================================

  private createAddress(
    tags: any
  ): string {

    const parts: string[] = [];


    if (
      tags['addr:housenumber']
    ) {

      parts.push(
        tags['addr:housenumber']
      );

    }


    if (
      tags['addr:street']
    ) {

      parts.push(
        tags['addr:street']
      );

    }


    if (
      tags['addr:suburb']
    ) {

      parts.push(
        tags['addr:suburb']
      );

    }


    if (
      tags['addr:city']
    ) {

      parts.push(
        tags['addr:city']
      );

    }


    if (
      tags['addr:postcode']
    ) {

      parts.push(
        tags['addr:postcode']
      );

    }


    if (
      parts.length === 0
    ) {

      return 'Address not available';

    }


    return parts.join(', ');

  }


  // ==========================================
  // CALCULATE DISTANCE
  // ==========================================

  private calculateDistance(

    lat1: number,
    lon1: number,

    lat2: number,
    lon2: number

  ): number {

    const earthRadius =
      6371;


    const dLat =
      this.toRadians(
        lat2 - lat1
      );


    const dLon =
      this.toRadians(
        lon2 - lon1
      );


    const a =

      Math.sin(dLat / 2) *
      Math.sin(dLat / 2)

      +

      Math.cos(
        this.toRadians(lat1)
      )

      *

      Math.cos(
        this.toRadians(lat2)
      )

      *

      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);


    const c =

      2 *

      Math.atan2(

        Math.sqrt(a),

        Math.sqrt(1 - a)

      );


    return (
      earthRadius * c
    );

  }


  private toRadians(
    value: number
  ): number {

    return (
      value *
      Math.PI /
      180
    );

  }


  // ==========================================
  // CALL PHONE NUMBER
  // ==========================================

  callNumber(
    phone: string
  ): void {

    if (!phone) {

      return;

    }


    window.location.href =
      `tel:${phone}`;

  }


  // ==========================================
  // GOOGLE MAPS DIRECTIONS
  // ==========================================

  getDirections(

    latitude: number,
    longitude: number

  ): void {

    if (

      this.latitude === null ||

      this.longitude === null

    ) {

      return;

    }


    const mapsUrl =

      `https://www.google.com/maps/dir/?api=1` +

      `&origin=${this.latitude},${this.longitude}` +

      `&destination=${latitude},${longitude}`;


    window.open(
      mapsUrl,
      '_blank'
    );

  }


  // ==========================================
  // SEARCH MORE VETERINARY SERVICES
  // ==========================================

  searchMoreOnMaps(): void {

    if (

      this.latitude === null ||

      this.longitude === null

    ) {

      return;

    }


    const mapsUrl =

      `https://www.google.com/maps/search/veterinary+clinic/@` +

      `${this.latitude},${this.longitude},14z`;


    window.open(
      mapsUrl,
      '_blank'
    );

  }


  // ==========================================
  // OPEN NGO / OFFICIAL WEBSITE
  // ==========================================

  openWebsite(
    website: string
  ): void {

    if (!website) {

      return;

    }


    window.open(

      website,

      '_blank',

      'noopener,noreferrer'

    );

  }

}