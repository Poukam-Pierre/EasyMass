import { Reducer, useContext, useReducer } from "react";
import { MassRequested, OfferMass, OfferMassContextProviderProps, State } from "./offerMass.interface";
import { MassOfferContext } from "./offerMass.Context";

const OfferMassReducer: Reducer<MassRequested, OfferMass[]> = (
    state: State,
    payload: OfferMass[]
) => {
    return {
        ...state,
        massRequested: payload
    }
}

function OfferMassContextProvider({
    children
}: OfferMassContextProviderProps
): JSX.Element {
    const initialState: MassRequested = {
        massRequested: [],
        massRequestDispatch: () => null,
    }
    const [massRequestedState, massRequestDispatch] = useReducer(
        OfferMassReducer,
        initialState
    )
    const value = {
        massRequested: massRequestedState.massRequested,
        massRequestDispatch
    }
    return (
        <MassOfferContext.Provider value={value}>
            {children}
        </MassOfferContext.Provider>
    )
}
export default OfferMassContextProvider

export const useOfferMass = () => {
    const context = useContext(MassOfferContext)
    if (!context) {
        throw new Error(
            'useOfferMass must be used as a descendant of MassOfferContext'
        );
    } else return context;
};

export const useMassRequested = () => {
    const context = useContext(MassOfferContext);
    if (!context) {
        throw new Error('useMassRequested must be used as a descendant of MassRequested');
    } else return context.massRequested;
}

export const useMassRequestDispatch = () => {
    const context = useContext(MassOfferContext);
    if (!context) {
        throw new Error('useMassRequestDispatch must be used as a descendant of MassRequestDispatch')
    } else return context.massRequestDispatch
};