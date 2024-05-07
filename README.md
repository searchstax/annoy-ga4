# ANNOY + Google Analytics 4 Page Recommendation System

Recommend pages to your website users based on historical reading and click through trends.

This Docker-based project uses the [Spotify ANNOY](https://github.com/spotify/annoy) library to generate page recommendations based on Google Analytics 4 visitor data. Page recommendations are based on landing page and the most popular pages your site visitors clicked to after landing on a specific page based on engagement metrics. You can use session duration, event count, or a custom metric that you've configured in GA4.

The project includes a Flask backend for configuring Recommenders and providing recommendation data to the front end widget. Also included are a React app for administrative functions and a basic recommendation panel template for your website front end.

Run `docker-compose -up` in the `annoy-ga4` directory to start the Docker container and various services.

## How It Works

Page recommendations are generated from ANNOY embeddings based on Google Analytics 4 data. You'll need a functional Google Analytics 4 account that's collecting live traffic data in order to generate embeddings for your Recommender. You'll also need to configure a Google API project to generate the [service account credentials](https://cloud.google.com/iam/docs/service-account-overview) in order to pull Google Analytics 4 data into the recommendation system.

### GA4 API

You'll need to create a Google Analytics 4 API [Cloud project](https://console.cloud.google.com/) to access the [Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1). Typically you'll need to grant access to the service account email account in Google Analytics 4 in order to pull data through the API. Once the API project has been created you can download the `credentials.json` service account file, you can upload this file through the interface.

## Creating a New Recommender

Open the React app `localhost:3000` and click 'New'
- Enter the name of your Recommender
- Upload your credentials.json service worker file you generated in the API Console
- Enter your Google Analytics 4 Account ID - you can find this in the admin panel in GA4
- Enter the hostname for domain/sub-domain you want to use for visitor data
- Select your engagement metric (session duration or event count) or enter a custom metric if you have one configured
- Enter any URL filters for pages you don't want to show as recommendations or use for generating embeddings

Click 'Create New' to fetch Google Analytics 4 data and start generating embeddings. This process can take several minutes to pull the data and generate the vectors. Once the Recommender has been generated the interface will show the recommendations by URL, the front end code for the recommendation panel, and the Config data for the Recommender.

## Resources

- https://github.com/spotify/annoy
- https://github.com/erikbern/ann-presentation
- https://erikbern.com/2015/09/24/nearest-neighbor-methods-vector-models-part-1
- https://sds-aau.github.io/M3Port19/portfolio/ann/
- https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema