import { AppBar, Box, Button, Tab, Tabs, Typography } from '@mui/material';
import { useContext, useState } from 'react';
import PresencePanel from '../components/PresencePanel';
import { AppContext } from '../context/AppContext';
import Chat from '../components/Chat';

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
  const appContext = useContext(AppContext);

  if (!appContext) {
    return <Typography color="error">App context not available.</Typography>;
  }

  const { me } = appContext;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
            <Typography variant="body2" sx={{ mr: 2 }}>
              {me?.name} ({me?.id.substring(0, 8)}...)
            </Typography>
            <Button color="inherit" onClick={onUserChangeRequest}>
              Change name
            </Button>
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
            {/* Feed */}
            <Typography variant="h6" gutterBottom>
              Firestore Feed
            </Typography>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Chat />
          </TabPanel>
        </Box>
        <Box sx={{ width: 300, borderLeft: '1px solid #eee', p: 2 }}>
          <PresencePanel />
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
