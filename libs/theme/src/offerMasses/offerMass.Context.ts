import { createContext } from 'react';
import { MassRequested } from './offerMass.interface';

export const MassOfferContext = createContext<MassRequested>({
  massRequested: [],
  massRequestDispatch: () => null,
});
