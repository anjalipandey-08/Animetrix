import { Injectable } from '@angular/core';

import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  constructor(
    private supabase: Supabase
  ) {}

  // LOGIN
  async login(
    email: string,
    password: string
  ) {

    const { data, error } =
      await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw error;
    }

    return data;
  }


  // LOGOUT
  async logout() {

    const { error } =
      await this.supabase.client.auth.signOut();

    if (error) {
      throw error;
    }
  }


  // GET CURRENT USER
  async getCurrentUser() {

    const {
      data,
      error
    } =
      await this.supabase.client.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  }


  // CHECK ADMIN ROLE
  async isAdmin(): Promise<boolean> {

    const user =
      await this.getCurrentUser();

    if (!user) {
      return false;
    }

    const { data, error } =
      await this.supabase.client
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

    if (error) {

      console.error(
        'Admin role check failed:',
        error
      );

      return false;
    }

    return data?.role === 'admin';
  }


  // LISTEN FOR LOGIN / LOGOUT CHANGES
  onAuthStateChange(
    callback: () => void
  ) {

    return this.supabase.client.auth
      .onAuthStateChange(() => {

        callback();

      });
  }
}