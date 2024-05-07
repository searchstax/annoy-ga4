import React, { useEffect, useState } from 'react';

// SearchStax APIs
import { getRecommenders, getRecommender } from '../../api/recommended';

import type { recommendations, recommenders } from '../../interface/recommendations';

import { ApiConfig } from '../ApiConfig/ApiConfig';
import { RecommendationSelector } from '../RecommendationSelector/RecommendationSelector';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export function RecommendationPage (): JSX.Element {
  const [selectedTab, setSelectedTab] = useState<Number>(0);
  const [availableRecommenders, setAvailableRecommenders] = useState<string[] | null>(null);
  const [recoID, setRecoID] = useState<Number>(-1);
  const [recoTitle, setRecoTitle] = useState<string>('');
  const [recoData, setRecoData] = useState<recommendations | null>(null);

  useEffect(() => {
    if (availableRecommenders === null) {
      getRecList();
    }
  }, [availableRecommenders]);

  const getRecList = (): void => {
    void getRecommenders().then((data: recommenders) => {
      setAvailableRecommenders(data.data);
    });
  }

  const getReco = (recoID: number): void => {
    void getRecommender(recoID).then((data: recommendations) => {
      setRecoID(data.recoID);
      setRecoTitle(data.name);
      setRecoData(data);
      setSelectedTab(1);
    });
  };

  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    if(newValue === 0) {
      setRecoID(-1);
    }
  };

  return (
    <div>
      <Stack direction="row">
        {recoTitle !== '' && (
          <Box sx={{p: 2, backgroundColor: 'rgba(240,240,240,0.5)' }}>{recoTitle}</Box>
        )}
        <Tabs value={selectedTab} onChange={handleTab}>
          {recoID === -1 ? (
            <Tab label="Existing Recommenders" />
          ) : (
            <Tab label="Back" />
          )}
          <Tab label="Recommendations" disabled={recoID === -1} />
          <Tab label="API" disabled={recoID === -1}  />
          <Tab label="Config" disabled={recoID === -1}  />
        </Tabs>
      </Stack>

      { selectedTab === 0 ?
        (
          <>
            { availableRecommenders === null || availableRecommenders.length === 0 ?
              (
                <>
                  Please add a recommender to get started
                </>
              ) : (
                <Container maxWidth="md">
                  <Paper>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Recommender ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>GA4 ID</TableCell>
                          <TableCell>Host Name</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {availableRecommenders.map((reco: any, index: number) => (
                          <TableRow
                            key={index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>{reco['id']}</TableCell>
                            <TableCell>{reco['name']}</TableCell>
                            <TableCell>{reco['gaID']}</TableCell>
                            <TableCell>{reco['hostname']}</TableCell>
                            <TableCell>
                              <Button
                                onClick={() => { getReco(reco['id']); }}
                                variant="contained"
                                size="small"
                              >
                                Edit Recommendations
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Container>
              )
            }
          </>
        ) : ('')
      }
      { selectedTab === 1 ?
        (
          <RecommendationSelector recoData={recoData} /> 
        ) : ('')
      }
      { selectedTab === 2 ?
        (
          <ApiConfig recoID={recoID} />
        ) : ('')
      }
      { selectedTab === 3 ?
        (
          <Container maxWidth="md" sx={{my: 2}}>
            <Paper>
              <Stack spacing={2} sx={{p: 2, textAlign: 'left'}}>
                <Typography variant="h4">Recommender Configration</Typography>
                <Typography variant="h5">Name</Typography>
                <Box>{recoData?.name}</Box>
                <Typography variant="h5">Google Analytics 4 ID</Typography>
                <Box>{recoData?.gaID}</Box>
                <Typography variant="h5">Hostname</Typography>
                <Box>{recoData?.hostname}</Box>
                <Typography variant="h5">Engagement Metric</Typography>
                <Box>{recoData?.metricName}</Box>
                <Typography variant="h5">Recommended Page Filter</Typography>
                <Box>
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>URL</TableCell>
                          <TableCell>Use in Analysis</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recoData?.urlFilters?.map((filter: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>
                              {filter.filterString}
                            </TableCell>
                            <TableCell>
                              {filter.analyzeTraffic ? "Analyze Traffic" : "Ignore"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Stack>
            </Paper>
          </Container>
        ) : ('')
      }
    </div>
  );
}
