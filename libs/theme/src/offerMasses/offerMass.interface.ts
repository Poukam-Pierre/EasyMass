import { Dayjs } from 'dayjs';

export interface OfferMassContextProviderProps {
  children: JSX.Element;
}

interface Person {
  name: string;
  phone: string;
}

type Requester = Person | undefined;

interface MassInformation {
  city: string;
  parish: string;
  dateTime: Dayjs | null;
  intention: string;
  price: number | null;
}

export interface OfferMass {
  faithInfos: Requester;
  massInfos: MassInformation;
}

export interface MassRequested {
  massRequested: OfferMass[] | [];
  massRequestDispatch: React.Dispatch<OfferMass[]>;
}

export type State = MassRequested;
