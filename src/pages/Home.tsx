import { AppBar, Box, Button, Menu, MenuItem, Avatar as MuiAvatar, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import Chat from '../components/Chat';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';
import PresencePanel from '../components/PresencePanel';
import UploadAvatarDialog from '../components/UploadAvatarDialog'; // Importa il nuovo componente
import { AppContext } from '../context/AppContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

interface HomeProps {
  onUserChangeRequest: () => void;
}

function Home({ onUserChangeRequest }: HomeProps) {
  const [value, setValue] = useState(0);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false); // Stato per la dialog dell'avatar
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // Stato per il menu dropdown
  const openMenu = Boolean(anchorEl);

  const appContext = useContext(AppContext);

  if (!appContext) {
    return <Typography color="error">App context not available.</Typography>;
  }

  const { me } = appContext;

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6" component="div">
            Firebase Chat Workshop
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {me && (
              <>
                <MuiAvatar
                  alt={`${me.displayName} ${me.surname}`}
                  src={me.avatar || undefined}
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  sx={{ cursor: 'pointer', mr: 1 }}
                />

                <Menu
                  anchorEl={anchorEl}
                  open={openMenu}
                  onClose={() => setAnchorEl(null)}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={() => {
                    setOpenAvatarDialog(true);
                    setAnchorEl(null);
                  }}>
                    Modifica Avatar
                  </MenuItem>

                  <MenuItem onClick={() => {
                    onUserChangeRequest();
                    setAnchorEl(null);
                  }}>
                    Cambia Nome
                  </MenuItem>
                </Menu>
              </>
            )}

            {!me && (
              <Button color="inherit" onClick={onUserChangeRequest}>
                Imposta Nome
              </Button>
            )}
          </Box>
        </Box>

        <Tabs value={value} onChange={handleChange} aria-label="chat tabs" variant="fullWidth">
          <Tab label="Feed" {...a11yProps(0)} />
          <Tab label="Chat" {...a11yProps(1)} />
        </Tabs>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <TabPanel value={value} index={0}>
            <CreatePost />
            <Feed />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Chat />
          </TabPanel>
        </Box>
        <Box sx={{ width: 300, borderLeft: '1px solid #eee', p: 2 }}>
          <PresencePanel />
        </Box>
      </Box>
      {me && (
        <UploadAvatarDialog
          open={openAvatarDialog}
          onClose={() => setOpenAvatarDialog(false)}
          userEmail={me.email}
          currentAvatarUrl={me.avatar}
          onAvatarUploaded={(newAvatarUrl) => {
            if (appContext.setMe) {
              appContext.setMe({ ...me, avatar: newAvatarUrl });
            }
          }}
        />
      )}
    </Box>
  );
}

export default Home;
