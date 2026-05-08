export type UpdateProfileInput = {
  name?: string;
  phone?: string;
};

export type AddressInput = {
  label?: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};
