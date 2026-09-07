import { Injectable } from '@angular/core';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class Dashboard {

  constructor(private supabase: Supabase) {}

  async getStats() {

    const reports = await this.getCount('reports');

    return {
      totalReports: reports
    };
  }

  private async getCount(table: string): Promise<number> {

    const { count, error } =
      await this.supabase.client
        .from(table)
        .select('*', {
          count: 'exact',
          head: true
        });

    if (error) {
      console.error(`Count error for ${table}:`, error);
      return 0;
    }

    return count ?? 0;
  }

  async getRecentReports(limit = 10) {

    const { data, error } =
      await this.supabase.client
        .from('reports')
        .select('*')
        .order('created_at', {
          ascending: false
        })
        .limit(limit);

    if (error) {
      console.error('Recent reports error:', error);
      throw error;
    }

    return data ?? [];
  }
}