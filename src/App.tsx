import React, {useState} from 'react';
import {DerivativeList} from './features/derivative_catalogue/DerivativeList';
import styles from './App.module.css';
import {AtomList} from './features/atom_list/AtomList';
import {Box, Tab, Tabs} from '@mui/material';

interface TabPanelProps {
    className: string;
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <Box
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {children}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function App() {
    const [currentTab, serCurrentTab] = useState(0);
    const handleTabChange = (event: React.SyntheticEvent, newTab: number) => {
        serCurrentTab(newTab);
    };

    return (
        <Box className={styles.root}>
            <Box sx={{display: 'flex', flexDirection: 'row', height: '100%'}}>
                <Tabs sx={{flex: '0 0 auto', marginRight: '10px'}} value={currentTab} onChange={handleTabChange}
                      aria-label="basic tabs example" orientation='vertical'>
                    <Tab label="Derivatives" {...a11yProps(0)} />
                    <Tab label="Atom sync" {...a11yProps(1)} />
                </Tabs>
                <TabPanel className={styles.main_area} value={currentTab} index={0}>
                    <DerivativeList/>
                </TabPanel>
                <TabPanel className={styles.main_area} value={currentTab} index={1}>
                    <AtomList/>
                </TabPanel>
            </Box>
        </Box>
    );
}

export default App;
