import React, { useState } from 'react';

// SearchStax APIs
import { getRecommended } from '../../api/recommended';

import type { recommendations } from '../../interface/recommendations';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export function RecommendationSelector (props: { recoData: recommendations | null }): JSX.Element {
  const {
    recoData = null,
  } = props;
  const [recoIDs, setRecoIDs] = useState<string[]>([]);
  const [recoDistances, setRecoDistances] = useState<string[]>([]);
  const [selectedPageID, setSelectedPageID] = useState<Number>(-1);
  const [recoDataLoading, setRecoDataLoading] = useState<boolean>(false);

  const getRecos = (pageID: number): void => {
    if (recoData !== null) {
      setRecoDataLoading(true);
      setSelectedPageID(pageID);
      void getRecommended(recoData.recoID, pageID).then((data: recommendations) => {
        setRecoIDs(data.data[0]);
        setRecoDistances(data.data[1]);
        setRecoDataLoading(false);
      });
    }
  };

  return (
    <Paper elevation={0}>
      {recoData !== null ? (
        <Grid container>
          <Grid item xs={6}>
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
                  {recoData.data.map((url: string, index: number) => (
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
                      <TableCell>{recoData.titles[index]}</TableCell>
                      <TableCell>{url}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
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
                        <TableCell>{recoData.titles[Number(id)]}</TableCell>
                        <TableCell>{recoData.data[Number(id)]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Grid>
        </Grid>
        ) : ('')
      }
    </Paper>
  );
}
