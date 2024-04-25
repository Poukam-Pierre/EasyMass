import { Theme } from '@mui/material';
import { createContext } from 'react';
import { generateTheme } from '../../theme';

export interface AppThemeContextProviderProps {
  children: JSX.Element;
}

export type Action = { payload: Theme };

export interface IAppTheme {
  theme: Theme;
  themeDispatch: React.Dispatch<Action>;
}

export type State = IAppTheme;

const AppThemeContext = createContext<IAppTheme>({
  theme: generateTheme(),
  themeDispatch: () => null,
});

export default AppThemeContext;
