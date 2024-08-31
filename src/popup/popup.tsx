import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import {
  ChakraProvider, Heading, Button, Text, VStack,
} from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import theme from '../lib/theme';
import MiscButtons from '../lib/components/MiscButtons';
import PermissionsRequester from '../lib/components/PermissionsRequester';
import { dev, version } from '../lib/esbuilddefinitions';

import DevTools from './devtools';
import { ReactfulBangInfoContainer } from '../optionsui/reactful';
import { SettingsOptions } from '../lib/settings'; // Adjust the path as needed
import CurrentBangsList from './BangsTabPanelPopup';

function App(): React.ReactElement {
  const [bangInfos, _setBangInfos] = useState<ReactfulBangInfoContainer>(new Map());
  const [options, setOptions] = useState<SettingsOptions>({
    ignoredDomains: [], ignoreCase: false, sortByAlpha: false,
  });
  return (
    <VStack>
      <Heading>Search Shortcuts</Heading>
      <Text fontSize="sm" color="gray.600" textAlign="center">Use ! before shortcuts (e.g. !g for Google)</Text>
      <CurrentBangsList />
      <MiscButtons />
      <Button variant="outline" onClick={() => { browser.runtime.openOptionsPage(); }}>Settings</Button>
      <PermissionsRequester closeWindow />
      {/* {dev && <DevTools />} */}
    </VStack>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
