import { Box, Divider } from '@mui/material';
import Image from 'next/image';
import { ReactElement } from 'react';
import NavBar from './NavBar';
import Profile, { ProfileProps } from './Profile';

export interface SideBarItem {
  label: string;
  icon: ReactElement;
  link: string;
}

export interface SideBarSection {
  title: string;
  sideBarItems: SideBarItem[];
}

interface SideBarProps {
  sideBarSection: SideBarSection[];
  profile: ProfileProps;
  onLogout?: () => void;
}

export function SideBar({ sideBarSection, profile, onLogout }: SideBarProps) {
  return (
    <Box
      sx={{
        width: '250px',
        padding: '8px',
        position: 'relative',
        backgroundColor: 'var(--background)',
        display: 'grid',
        gridTemplateRows: 'auto auto auto',
      }}
    >
      <Box
        sx={{
          display: 'grid',
        }}
      >
        <Image
          src="/assets/LogoEasyMass.png"
          alt="Logo"
          width={150}
          height={65.57}
        />
        <Divider />
      </Box>

      {sideBarSection.map((sideBarNav, index) => (
        <NavBar key={index} sideBarNav={sideBarNav} />
      ))}
      <Profile profile={profile} onLogout={onLogout} />
    </Box>
  );
}
