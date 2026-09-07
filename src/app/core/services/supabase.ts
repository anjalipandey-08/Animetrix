import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class Supabase {

  private supabaseUrl = 'https://wbkkbtywjplruovacpxe.supabase.co';

  private supabaseKey = 'sb_publishable_8MNZVsR471wVljWftLlVkw_0OrZnH26';

  client: SupabaseClient;

  constructor() {
    this.client = createClient(
      this.supabaseUrl,
      this.supabaseKey
    );
  }
}