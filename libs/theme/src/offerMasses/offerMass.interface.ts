import { Dayjs } from 'dayjs';

export interface OfferMassContextProviderProps {
  children: JSX.Element;
}

interface Requester {
  name: string | null;
  phone: string | null;
  anonymous: boolean;
}
interface MassInformation {
  city: string;
  parish: string;
  dateTime: Dayjs | null;
  intension: string;
}

export interface OfferMass {
  faithInfos: Requester;
  massInfos: MassInformation[];
}

export interface MassRequested {
  massRequested: OfferMass;
  massRequestDispatch: React.Dispatch<OfferMass>;
}

export type State = MassRequested;
