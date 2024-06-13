import { createContext } from 'react';
import { MassRequested } from './offerMass.interface';

export const MassOfferContext = createContext<MassRequested>({
  massRequested: {
    faithInfos: {
      name: '',
      phone: '',
      anonymous: false,
    },
    massInfos: [
      {
        city: '',
        parish: '',
        dateTime: null,
        intension: '',
      },
    ],
  },
  massRequestDispatch: () => null,
});
