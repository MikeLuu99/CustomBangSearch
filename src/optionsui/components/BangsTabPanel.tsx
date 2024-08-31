import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  TabPanel,
  useToast,
  VStack,
  Text,
  IconButton,
  Flex,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  CheckIcon,
  AddIcon,
  RepeatIcon,
  DownloadIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { nanoid } from 'nanoid';
import {
  ReactfulBangInfoContainer,
  reactfulBangInfoToStored,
  storedBangInfoToReactful,
  ReactfulBangInfo,
} from '../reactful';
import BangInfo from './BangInfo';
import {
  SettingsOptions,
  StoredBangInfo,
  BangsExport,
  currentSettingsVersion,
} from '../../lib/settings';
import defaultSettings from '../../lib/settings.default.json';

const defaultReactfulBangs = storedBangInfoToReactful(defaultSettings.bangs);

type BangTabPanelPropTypes = {
  options: Readonly<SettingsOptions>;
  bangInfos: Readonly<ReactfulBangInfoContainer>;
  setBangInfos: React.Dispatch<React.SetStateAction<ReactfulBangInfoContainer>>;
  bangChangesToSave: boolean;
  updateSettings: (newOptions?: SettingsOptions, newBangInfos?: StoredBangInfo[]) => Promise<void>;
};

export default function BangTabPanel(props: BangTabPanelPropTypes): React.ReactElement {
  const [bangInfoRows, setBangInfoRows] = useState<React.ReactElement[]>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const {
    options,
    bangInfos,
    setBangInfos,
    bangChangesToSave,
    updateSettings,
  } = props;
  const [searchTerm, setSearchTerm] = useState('');

  const saveBangInfo = () => {
    updateSettings(undefined, reactfulBangInfoToStored(bangInfos));
  };

  const newBangInfo = () => {
    const newUrls = new Map();
    newUrls.set(nanoid(21), 'https://example.com/?q=%s');
    const newBangId = nanoid(21);
    setBangInfos((oldBangInfos) => {
      const newBangInfos = new Map();
      newBangInfos.set(newBangId, { bang: 'e', urls: newUrls });
      return new Map([...newBangInfos, ...oldBangInfos]);
    });
    toast({
      title: 'New shortcut added',
      status: 'info',
      duration: 1500,
      isClosable: true,
      position: 'top',
    });
  };

  const importBangs = () => {
    if (fileInputRef.current !== null) {
      fileInputRef.current.click();
    }
  };

  const fileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    if (e.target.files === null) return;

    const file: File = e.target.files[0];
    if (fileInputRef.current !== null) {
      fileInputRef.current.value = '';
    }

    let imported: BangsExport;
    try {
      imported = JSON.parse(await file.text());
    } catch (_e) {
      toast({
        title: 'Import failed',
        description: 'Invalid JSON format',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (imported.version !== currentSettingsVersion) {
      toast({
        title: 'Import failed',
        description: `Version mismatch: ${imported.version} vs ${currentSettingsVersion}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    let converted: ReactfulBangInfoContainer;
    try {
      converted = storedBangInfoToReactful(imported.bangs);
    } catch (_e) {
      toast({
        title: 'Import failed',
        description: 'Could not convert JSON to bangs',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    converted = new Map([...bangInfos, ...converted]);
    setBangInfos(converted);

    toast({
      title: 'Import successful',
      description: `Loaded from ${file.name}. Don't forget to save!`,
      status: 'success',
      duration: 2500,
      isClosable: true,
      position: 'top',
    });
  };

  const importDdgBangs = () => {
    window.open('https://github.com/psidex/CustomBangSearch/tree/master/ddg', '_blank')?.focus();
  };

  const exportBangs = () => {
    const converted = reactfulBangInfoToStored(bangInfos);
    const exported: BangsExport = {
      version: currentSettingsVersion,
      bangs: converted,
    };
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exported))}`;
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'custombangs.json');
    a.click();
    a.remove();
  };

  const resetBangsToDefault = () => {
    setBangInfos(defaultReactfulBangs);
  };

  const removeBangInfo = useCallback((id: string) => {
    setBangInfos((oldBangInfos) => {
      const shallowCopy = new Map(oldBangInfos);
      shallowCopy.delete(id);
      return shallowCopy;
    });
  }, [setBangInfos]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const generateRows = () => {
    const rows = [];
    const isLonely = bangInfos.size === 1;

    let sortedBangInfos: IterableIterator<[string, ReactfulBangInfo]>;

    if (options.sortByAlpha) {
      sortedBangInfos = Array.from(bangInfos.entries())
        .sort(([, bangInfoA], [, bangInfoB]) => bangInfoA.bang.localeCompare(bangInfoB.bang))
        .values();
    } else {
      sortedBangInfos = bangInfos.entries();
    }

    for (const [id, rowInfo] of sortedBangInfos) {
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const bangMatch = rowInfo.bang.toLowerCase().includes(lowerSearchTerm);
        const urlMatch = Array.from(rowInfo.urls.values()).some(url => 
          url.toLowerCase().includes(lowerSearchTerm)
        );
        if (!bangMatch && !urlMatch) {
          continue;
        }
      }
      rows.push(
        <BangInfo
          key={id}
          bangId={id}
          info={rowInfo}
          removeBangInfo={removeBangInfo}
          setBangInfos={setBangInfos}
          isLonely={isLonely}
        />,
      );
    }
    setBangInfoRows(rows);
  };

  useEffect(() => {
    generateRows();
  }, [bangInfos, options, searchTerm]);

  return (
    <TabPanel>
      <Flex justifyContent="space-between" mb={6}>
        <HStack spacing={2}>
          <Tooltip label="Save changes">
            <IconButton
              aria-label="Save"
              icon={<CheckIcon />}
              onClick={saveBangInfo}
              colorScheme={bangChangesToSave ? 'green' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Add new shortcut">
            <IconButton
              aria-label="Add Shortcut"
              icon={<AddIcon />}
              onClick={newBangInfo}
            />
          </Tooltip>
          <Menu>
            <Tooltip label="Import bangs">
              <MenuButton as={IconButton} aria-label="Import" icon={<ArrowUpIcon />} />
            </Tooltip>
            <MenuList>
              <MenuItem onClick={importBangs}>Import from file</MenuItem>
              <MenuItem onClick={importDdgBangs}>Import DuckDuckGo bangs</MenuItem>
            </MenuList>
          </Menu>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={fileUpload}
          />
        </HStack>
        <HStack spacing={2}>
          <Tooltip label="Export bangs">
            <IconButton
              aria-label="Export"
              icon={<DownloadIcon />}
              onClick={exportBangs}
            />
          </Tooltip>
          <Tooltip label="Reset to default">
            <IconButton
              aria-label="Reset To Default"
              icon={<RepeatIcon />}
              onClick={resetBangsToDefault}
            />
          </Tooltip>
        </HStack>
      </Flex>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search bangs..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </InputGroup>
      <VStack align="stretch" spacing={4}>
        {bangInfoRows}
      </VStack>
    </TabPanel>
  );
}
