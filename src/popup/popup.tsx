import React from 'react';
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

function App(): React.ReactElement {
  return (
    <VStack>
      <Heading>Search Shortcuts</Heading>
      <Text fontSize="sm" color="gray.600" textAlign="center">Use ! before shortcuts (e.g. !g for Google)</Text>
      <MiscButtons />
      <Button variant="outline" onClick={() => { browser.runtime.openOptionsPage(); }}>Options</Button>
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
