import { Injectable } from '@angular/core';
import { Supabase } from './supabase';

export interface AnimalReport {
  name: string;
  email: string;
  phone: string;

  animal_type: string;
  animal_count: number;
  condition: string;
  behaviour: string;
  injured: string;
  urgent_help: string;

  area: string;
  exact_location: string;
  landmark: string;
  coordinates: string;

  observation_date: string | null;
  observation_time: string | null;

  description: string;
  recurring: string;

  water: string;
  food: string;
  shelter: string;
  traffic: string;
  waste: string;
  infrastructure: string;

  photo_url: string | null;

  additional_notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class Reports {

  constructor(private supabase: Supabase) {}

  // CREATE REPORT
  async createReport(report: AnimalReport) {

    const { data, error } =
      await this.supabase.client
        .from('reports')
        .insert(report)
        .select()
        .single();

    if (error) {
      console.error('Report creation error:', error);
      throw error;
    }

    return data;
  }


  // GET ALL REPORTS
  async getReports() {

    const { data, error } =
      await this.supabase.client
        .from('reports')
        .select('*')
        .order('created_at', {
          ascending: false
        });

    if (error) {
      console.error('Reports fetch error:', error);
      throw error;
    }

    return data ?? [];
  }


  // GET SINGLE REPORT
  async getReport(id: string) {

    const { data, error } =
      await this.supabase.client
        .from('reports')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
      console.error('Report fetch error:', error);
      throw error;
    }

    return data;
  }


  // DELETE REPORT
  async deleteReport(id: string) {

    const { error } =
      await this.supabase.client
        .from('reports')
        .delete()
        .eq('id', id);

    if (error) {
      console.error('Report deletion error:', error);
      throw error;
    }

    return true;
  }


  // UPLOAD PHOTO
  async uploadPhoto(file: File) {

    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg';

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`;

    const filePath =
      `reports/${fileName}`;


    const { error } =
      await this.supabase.client
        .storage
        .from('animal-photos')
        .upload(filePath, file);

    if (error) {
      console.error('Photo upload error:', error);
      throw error;
    }


    const { data } =
      this.supabase.client
        .storage
        .from('animal-photos')
        .getPublicUrl(filePath);

    return data.publicUrl;
  }
}