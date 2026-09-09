import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Explore } from './pages/explore/explore';
import { Report } from './pages/report/report';
import { Survey } from './pages/survey/survey';
import { Community } from './pages/community/community';
import { Insights } from './pages/insights/insights';
import { About } from './pages/about/about';
import { Admin } from './pages/admin/admin';
import { GetHelp } from './pages/get-help/get-help';

export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'explore',
    component: Explore
  },

  {
    path: 'report',
    component: Report
  },

  {
    path: 'survey',
    component: Survey
  },

  {
    path: 'community',
    component: Community
  },

  {
    path: 'insights',
    component: Insights
  },

  {
    path: 'about',
    component: About
  },
  {
  path: 'get-help',
  component: GetHelp
},
  

  {
    path: 'admin',
    component: Admin
  },

  {
    path: '**',
    redirectTo: ''
  }

];