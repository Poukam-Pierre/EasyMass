import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { SideBarItem } from './SideBar';

interface navBarItemProps {
  navEl: SideBarItem;
}
export default function NavBarItem({
  navEl: { label, icon, link },
}: navBarItemProps) {
  const { push, asPath } = useRouter();
  const isActive = asPath === link || asPath.startsWith(link + '/');

  console.log({ label, icon, link, isActive });
  return (
    <Box
      onClick={() => push(link)}
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        alignItems: 'center',
        columnGap: '10px',
        padding: '5px 20px',
        cursor: 'pointer',
        background: isActive ? 'var(--line)' : 'none',
        borderRadius: '10px',
        '&:hover': {
          background: !isActive ? 'var(--line)' : 'none',
        },
      }}
    >
      {icon}
      <Typography
        sx={{
          color: 'var(--body)',
          size: '0.8rem',
          textWrap: 'nowrap',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
