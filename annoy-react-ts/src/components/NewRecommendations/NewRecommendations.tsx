import React, { useEffect, useState } from 'react';

// SearchStax APIs
import { getRecommenders, createRecommendations } from '../../api/recommended';

import type { recommendations, recommenders, urlFilter } from '../../interface/recommendations';

// MUI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';

export function NewRecommendations (): JSX.Element {
  const [availableRecommenders, setAvailableRecommenders] = useState<string[] | null>(null);
  const [name, setName] = useState<string>('');
  const [gaCredentials, setGaCredentials] = useState<string>('');
  const [gaCredentialsName, setGaCredentialsName] = useState<string>('');
  const [gaID, setGaID] = useState<string>('');
  const [hostname, setHostname] = useState<string>('');
  const [newRecoLoading, setNewRecoLoading] = useState<boolean>(false);
  const [urlFilterString, setUrlFilterString] = useState<string>('');
  const [urlFilterAnalyze, setUrlFilterAnalyze] = useState<boolean>(false);
  const [urlFilters, setUrlFilters] = useState<urlFilter[]>([]);
  const [dimensionType, setDimensionType] = useState<string>('averageSessionDuration');
  const [customDimension, setCustomDimension] = useState<string>('');

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
    setNewRecoLoading(true);
    let metricName = dimensionType;
    if (dimensionType === 'custom') {
      metricName = customDimension;
    }
    void createRecommendations(name, gaCredentials, gaID, hostname, metricName, JSON.stringify(urlFilters)).then((data: recommendations) => {
      setNewRecoLoading(false);
      getRecList();
    });
  };

  const addNewURLFilter = (): void => {
    if (urlFilterString !== '' && !urlFilters.some(el=>el.filterString === urlFilterString)) {
      setUrlFilters([
        ...urlFilters,
        {
          filterString: urlFilterString,
          analyzeTraffic: urlFilterAnalyze
        }
      ]);
    }
  };

  return (
    <Container maxWidth="md" sx={{my: 2}}>
      <Paper sx={{p: 2, textAlign: 'left'}}>
        <Typography variant="h4">New Recommender</Typography>
        <Stack spacing={2}>
          <Typography variant="h5">Name</Typography>
          <TextField
            required
            label="Recommendation Engine Name"
            value={name}
            onChange={(e) => { setName(e.target.value); }}
          />
          <Typography variant="h5">Google Service Account Credentials</Typography>
          <Typography variant="body1">
            Upload the credentials file for your Google service account
          </Typography>
          <Stack direction="row" spacing={1}>
            <input
              accept="json/*"
              style={{ display: 'none' }}
              id="upload-button"
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>)=> {
                const reader = new FileReader();
                if (e.target?.files) {
                  reader.readAsText(e.target.files[0]);
                  setGaCredentialsName(e.target.files[0].name);
                  reader.onload = ((e) => {
                    if (e.target?.result) {
                      const file = e.target.result;
                      const content: string = typeof file === 'string' ? file : Buffer.from(file).toString()
                      setGaCredentials(content);
                    }
                  });
                }
              }}
            />
            <label htmlFor="upload-button">
              <Button variant="outlined" component="span">
                Upload credentials.json File
              </Button>
            </label>
            <Typography>
              {gaCredentialsName}
            </Typography>
          </Stack>
          <Typography variant="h5">Google Analytics 4</Typography>
          <Typography variant="body1">
            Enter the Google Analytics 4 ID - this is found in 'Property Details' in GA4
          </Typography>
          <TextField
            required
            label="Google Analytics 4 ID"
            value={gaID}
            onChange={(e) => { setGaID(e.target.value); }}
          />
          <Typography variant="h5">Host Name</Typography>
          <Typography variant="body1">
            Enter a hostname filter to limit analysis to a specific domain (or use '*' for all domains/sub-domain)
          </Typography>
          <TextField
            required
            label="Host Name"
            value={hostname}
            onChange={(e) => { setHostname(e.target.value); }}
          />
          <Box>
            <Typography variant="h5">Engagement Metric</Typography>
            <Stack>
              <FormControl>
                <RadioGroup
                  value={dimensionType}
                  onChange={(e) => { setDimensionType(e.target.value); }}
                >
                  <FormControlLabel value="averageSessionDuration" control={<Radio />} label="Session Duration" />
                  <FormControlLabel value="eventCount" control={<Radio />} label="Event Count" />
                  <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                </RadioGroup>
              </FormControl>
              {dimensionType === 'custom' ? (
                <TextField
                  size="small"
                  label="Custom Metric Name"
                  onChange={(e) => { setCustomDimension(e.target.value); }}
                  value={customDimension}
                  sx={{mt: 1}}
                />
              ) : ('')}
            </Stack>
          </Box>
          <Box sx={{mt: 5}}>
            <Typography variant="h5">Recommended Pages</Typography>
            <Typography variant="body2">Matching URLs won't be shown as recommended pages</Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>URL</TableCell>
                    <TableCell>Use in Analysis</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow sx={{backgroundColor: '#FBFBFB', p: 0}}>
                    <TableCell sx={{p: 1}}>
                      <TextField
                        size="small"
                        label="URL Filter String"
                        onChange={(e) => { setUrlFilterString(e.target.value); }}
                        sx={{backgroundColor: '#FFF'}}
                      />
                    </TableCell>
                    <TableCell>
                      <FormControlLabel control={<Switch onChange={(e) => { setUrlFilterAnalyze(e.target.checked); }} />} label="Analyze Traffic" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => { addNewURLFilter(); }}
                        color="primary"
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  {urlFilters.map((filter: urlFilter, key: number) => (
                    <TableRow key={key}>
                      <TableCell>{filter.filterString}</TableCell>
                      <TableCell>{filter.analyzeTraffic ? 'Yes' : 'No'}</TableCell>
                      <TableCell align="right">
                        <IconButton aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <LoadingButton
            onClick={newReco}
            variant="contained"
            loading={newRecoLoading}
            disabled={(name === '' || gaCredentials === '' || gaID === '' || hostname === '')}
          >
            Create New
          </LoadingButton>
        </Stack>
      </Paper>
    </Container>
  );
}
