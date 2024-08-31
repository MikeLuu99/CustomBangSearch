import React, { useEffect, useState } from 'react';
import {
  Box,
  Input,
  List,
  ListItem,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import * as storage from '../lib/storage';
import { StoredBangInfo } from '../lib/settings';

const CurrentBangsList: React.FC = () => {
  const [bangs, setBangs] = useState<StoredBangInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBangs = async () => {
      const settings = await storage.getSettings();
      if (settings) {
        setBangs(settings.bangs);
      }
    };

    fetchBangs();
  }, []);

  const filteredBangs = bangs.filter(bang =>
    bang.bang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bang.urls.some(url => url.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box maxWidth="300px" margin="0">
      <InputGroup mb={2}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search shortcuts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="sm"
        />
      </InputGroup>
      <List spacing={1}>
        {filteredBangs.map((bang, index) => (
          <ListItem key={index} borderWidth="1px" borderRadius="md" p={1} mb={1}>
            <Flex align="center">
              <Text fontWeight="bold" fontSize="sm">!{bang.bang}</Text>
              <Text fontSize="xs" color="gray.500" ml={1} isTruncated>{bang.urls[0]}</Text>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default CurrentBangsList;
