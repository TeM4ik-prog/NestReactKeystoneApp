import React from "react";
import { type AdminConfig } from '@keystone-6/core/types'
import { CustomLogo } from './customLogo';
import { CustomNavigation } from './customNavigation';

export const components: AdminConfig['components'] = {
  Logo: CustomLogo,
  Navigation: CustomNavigation,
}
