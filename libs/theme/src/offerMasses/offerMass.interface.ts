import { Dayjs } from 'dayjs';

export interface OfferMassContextProviderProps {
  children: JSX.Element;
}

interface Person {
  name: string;
  phone: string;
}

interface MassInformation {
  massId: string | null;
  city: string;
  parish: string;
  dateTime: Dayjs | null;
  intention: string;
  price: number | null;
  /** Whether this intention's requester name should be hidden ("Unknown")
   * on the final intentions list — independent of who paid for it. */
  anonymous: boolean;
}

export interface OfferMass {
  faithInfos: Person | undefined;
  massInfos: MassInformation;
}

export interface MassRequested {
  massRequested: OfferMass[] | [];
  massRequestDispatch: React.Dispatch<OfferMass[]>;
}

export type State = MassRequested;
