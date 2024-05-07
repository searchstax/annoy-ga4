import React, { useState } from 'react';

// MUI
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export function ApiConfig (props: { recoID: Number }): JSX.Element {
  const {
    recoID = -1
  } = props;

  return (
    <Container maxWidth="md">
      <Paper>
        <Typography variant="h5">Recommendations API</Typography>
        <Typography variant="body2">Add the following JavaScript, CSS, and HTML to your site. Page recommendations will get fetched each time the page is loaded.</Typography>
        <Box sx={{p: 2}}>
          <Typography
            sx={{
              p: 1,
              fontFamily: 'monospace',
              fontSize: 11,
              textAlign: 'left',
              whiteSpace: 'pre',
              overflow: 'auto',
              backgroundColor: '#222',
              color: '#3F3'
            }}
          >
            <>{`
<!--start recommendation integration-->
<style>
  #page-recommendation-box {
    position: fixed;
    right: 0.5rem;
    bottom: 0.5rem;
    border: solid;
    border-width: 1px;
    border-color: rgba(150,150,150,0.5);
    border-radius: 5px;
    padding: 0.5rem;
    background-color: rgba(255,255,255,1);
    box-shadow: 1px 1px 5px rgba(50,50,50,0.3);
    z-index: 999999999;
  }
  #page-recommendation-box a {
    display: inline-block;
    padding-bottom: 5px;
  }
  #page-recommendation-box a:hover {
    text-decoration: underline;
  }
</style>
<div id="page-recommendation-box"></div>
<script>
async function fetchrecos() {
  try {
    let pagepath = window.location.pathname;
    let response = await fetch('http://127.0.0.1:5000/get-url-recommendations?recoID=`
}
{recoID}
{`&url=' + pagepath);

    if (response.status === 200) {
      let data = await response.json();
      var recoPageString = '<strong>Users also Read</strong><br />';
      for (let i = 0; i < data['data'].length; i++) { 
        recoPageString = recoPageString + '<a href="/' + data['data'][i] + '">' + data['titles'][i] + '</a><br />';
      }
      document.getElementById('page-recommendation-box').innerHTML = recoPageString;
    }
  } catch (error) {
    document.getElementById('page-recommendation-box').style.display = "none";
  }
}
fetchrecos();
</script>
<!--end recommendation integration-->
              `}</>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
