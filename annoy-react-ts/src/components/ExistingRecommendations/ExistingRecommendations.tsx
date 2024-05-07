import React, { useEffect, useState } from 'react';

// SearchStax APIs
import { getRecommenders, getRecommender, createRecommendations, getRecommended } from '../../api/recommended';

import type { recommendations, recommenders } from '../../interface/recommendations';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import LoadingButton from '@mui/lab/LoadingButton';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function RecommendationPage (): JSX.Element {
  const [selectedTab, setSelectedTab] = useState<Number>(0);
  const [availableRecommenders, setAvailableRecommenders] = useState<string[] | null>(null);
  const [gaID, setGaID] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [pageData, setPageData] = useState<string[]>([]);
  const [pageTitles, setPageTitles] = useState<string[]>([]);
  const [recoID, setRecoID] = useState<Number>(0);
  const [recoIDs, setRecoIDs] = useState<string[]>([]);
  const [recoDistances, setRecoDistances] = useState<string[]>([]);
  const [selectedPageID, setSelectedPageID] = useState<Number>(-1);
  const [pageDataLoading, setPageDataLoading] = useState<boolean>(false);
  const [recoDataLoading, setRecoDataLoading] = useState<boolean>(false);
  const [newRecoLoading, setNewRecoLoading] = useState<boolean>(false);

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

  const newReco = (): void => {
    setPageDataLoading(true);
    setNewRecoLoading(true);
    void createRecommendations(gaID, hostName).then((data: recommendations) => {
      setPageData(data.data);
      setPageTitles(data.titles);
      setRecoID(data.recoID);
      setPageDataLoading(false);
      setNewRecoLoading(false);
      setSelectedTab(2);
      getRecList();
    });
  };

  const getReco = (recoID: number): void => {
    setPageDataLoading(true);
    void getRecommender(recoID).then((data: recommendations) => {
      setPageData(data.data);
      setPageTitles(data.titles);
      setRecoID(data.recoID);
      setPageDataLoading(false);
      setSelectedTab(2);
    });
  };

  const getRecos = (pageID: number): void => {
    setRecoDataLoading(true);
    setSelectedPageID(pageID);
    void getRecommended(recoID, pageID).then((data: recommendations) => {
      setRecoIDs(data.data[0]);
      setRecoDistances(data.data[1]);
      setRecoDataLoading(false);
    });
  };

  const handleTab = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div className="App">
      <Tabs value={selectedTab} onChange={handleTab}>
        <Tab label="Existing Recommenders" />
        <Tab label="New Recommender" />
        <Tab label="Recommendations" />
      </Tabs>

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
          <Container maxWidth="sm">
            <Paper>
              <Stack spacing={1} sx={{p: 2}}>
                <TextField
                  required
                  label="Google Analytics 4 ID"
                  value={gaID}
                  onChange={(e) => { setGaID(e.target.value); }}
                />
                <TextField
                  label="Host Name/Domain Filter"
                  onChange={(e) => { setHostName(e.target.value); }}
                />
                <LoadingButton
                  onClick={newReco}
                  variant="contained"
                  loading={newRecoLoading}
                >
                  Create New
                </LoadingButton>
              </Stack>
            </Paper>
          </Container>
        ) : ('')
      }
      { selectedTab === 2 ?
        (
          <Paper elevation={0}>
            <Grid container>
              <Grid item xs={6}>
                {pageDataLoading ? (
                  <Stack spacing={2} sx={{p: 2}}>
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                  </Stack>
                ) : (
                  <Box style={{maxHeight: '100vh', overflow: 'auto'}}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell></TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>URL</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pageData.map((url: string, index: number) => (
                          <TableRow
                            key={index}
                            sx={{backgroundColor: (index === selectedPageID ? 'rgba(0,0,255,0.1)': 'rgba(255,255,255,0)')}}
                          >
                            <TableCell component="th" scope="row">
                              <Button
                                onClick={() => { getRecos(index); }}
                                variant="contained"
                                size="small"
                                sx={{width: 150}}
                              >
                                Show Related
                              </Button>
                            </TableCell>
                            <TableCell>{pageTitles[index]}</TableCell>
                            <TableCell>{url}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Grid>
              <Grid item xs={6}>
                {recoDataLoading ? (
                  <Stack spacing={2} sx={{p: 2}}>
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                    <Skeleton variant="rectangular" height={20} animation="wave" />
                  </Stack>
                ) : (
                  <Box style={{maxHeight: '100vh', overflow: 'auto'}}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Distance</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>URL</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recoIDs.map((id: string, index: number) => (
                          <TableRow
                            key={index}
                          >
                            <TableCell component="th" scope="row">
                              <Box sx={{ width: '100%' }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(Number(recoDistances[recoDistances.length - 1]) - Number(recoDistances[index])) / Number(recoDistances[recoDistances.length - 1]) * 100}
                                />
                              </Box>
                              <Typography sx={{fontSize: 12, textAlign: 'center'}}>
                                {Number(recoDistances[index]).toFixed(3)}
                              </Typography>
                            </TableCell>
                            <TableCell>{pageTitles[Number(id)]}</TableCell>
                            <TableCell>{pageData[Number(id)]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        ) : ('')
      }
    </div>
  );
}
