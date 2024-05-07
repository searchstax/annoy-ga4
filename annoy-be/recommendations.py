import json
from annoy import AnnoyIndex
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
    FilterExpression,
    Filter
)
from google.oauth2 import service_account
import os
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credentials.json"

class recommender():
    def __init__(self, db):
        self.db = db
        self.id = -1
        self.name = ''
        self.gaCredentials = ''
        self.gaID = -1
        self.metricName = ''
        self.hostname = ''
        self.urlFilters = []
        self.gaData = []
        self.pageIDs = []
        self.pageTitles = []

    def create_new(self, reco_name, ga_credentials, ga_property_id, hostname, metric_name, url_filters):
        self.gaCredentials = ga_credentials
        self.gaID = ga_property_id
        c = self.db.cursor()
        c.execute('INSERT INTO recommenders (name, ga_credentials, ga_property_id, host_name, metric_name, url_filters, index_size, page_map, titles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            (reco_name, ga_credentials, ga_property_id, hostname, metric_name, json.dumps(url_filters), 0, json.dumps([]), json.dumps([]))
        )

        self.db.commit()
        self.name = reco_name
        self.metricName = metric_name
        self.urlFilters = url_filters
        self.id = c.lastrowid

    def get_ga_data(self):
        credentials = service_account.Credentials.from_service_account_info(json.loads(self.gaCredentials))
        client = BetaAnalyticsDataClient(credentials = credentials)
        engagementMetric = self.metricName
        if self.metricName != 'averageSessionDuration' and self.metricName != 'eventCount':
            engagementMetric = 'customEvent:' + engagementMetric

        request = RunReportRequest(
            property=f"properties/{self.gaID}",
            dimensions=[
                Dimension(name = "customEvent:visit_id"),
                Dimension(name = "pagePath"),
                Dimension(name = engagementMetric),
                Dimension(name = "hostName"),
                Dimension(name = "pageTitle")
            ],
            metrics=[Metric(name="activeUsers")],
            date_ranges=[DateRange(start_date="180daysAgo", end_date="today")],
            dimension_filter=FilterExpression(
                filter=Filter(
                    field_name="hostName",
                    string_filter=Filter.StringFilter(value=self.hostname),
                )
            ),
            limit=100000,
        )
        response = client.run_report(request)

        self.gaData = response.rows
        return self.gaData

    def load_from_id(self, ricoID):
        c = self.db.cursor()
        c.execute('SELECT * FROM recommenders WHERE id = ?',
            (ricoID,)
        )

        row = c.fetchone()
        if row is not None:
            self.id = row['id']
            self.name = row['name']
            self.gaCredentials = row['ga_credentials']
            self.gaID = row['ga_property_id']
            self.hostname = row['host_name']
            self.metricName = row['metric_name']
            self.urlFilters = json.loads(row['url_filters'])
            self.pageIDs = json.loads(row['page_map'])
            self.pageTitles = json.loads(row['titles'])

    def load_pages(self, ricoID):
        c = self.db.cursor()
        c.execute('SELECT page_map, titles FROM recommenders WHERE id = ?',
            (ricoID,)
        )

        self.id = ricoID
        row = c.fetchone()
        self.pageIDs = json.loads(row['page_map'])
        self.pageTitles = json.loads(row['titles'])

    def build_page_rating(self):
        pageData = {}
        userIDs = []
        pagePerUser = 0
        maxPagesPerUser = 0

        userID = -1
        pageID = -1

        filteredURLs = []
        for url in self.urlFilters:
            if url['analyzeTraffic'] == False:
                filteredURLs.append(url['filterString'])

        for row in self.gaData:
            filteredURL = False
            for url in filteredURLs:
                if url in row.dimension_values[1].value:
                    filteredURL = True
                    break
            if not filteredURL:
                if row.dimension_values[0].value not in userIDs:
                    userID = len(userIDs)
                    userIDs.append(row.dimension_values[0].value)
                    if pagePerUser > maxPagesPerUser:
                        maxPagesPerUser = pagePerUser
                    pagePerUser = 0
                else:
                    userID = userIDs.index(row.dimension_values[0].value)
                
                if row.dimension_values[1].value in self.pageIDs:
                    pageID = self.pageIDs.index(row.dimension_values[1].value)
                else:
                    pageID = len(self.pageIDs)
                    self.pageIDs.append(row.dimension_values[1].value)
                    self.pageTitles.append(row.dimension_values[4].value)
                    pageData[pageID] = {}
                if row.dimension_values[2].value != '(not set)' and row.dimension_values[2].value != '':
                    pageData[pageID][userID] = int(row.dimension_values[2].value)

                pagePerUser += 1

        print('Page Count:',len(self.pageIDs))
        print('User Count:',len(userIDs))

        t = AnnoyIndex(len(self.pageIDs), 'angular')

        for pageID in pageData:
            vector = []
            for i in range(len(self.pageIDs)):
                if i in pageData[pageID]:
                    vector.append(pageData[pageID][i])
                else:
                    vector.append(0)
            t.add_item(pageID, vector)

        t.build(100)
        t.save(str(self.id) + '.ann')
        
        c = self.db.cursor()
        c.execute('UPDATE recommenders SET index_size = ?, page_map = ?, titles = ? WHERE id = ?',
            (len(self.pageIDs), json.dumps(self.pageIDs), json.dumps(self.pageTitles), self.id, )
        )
        self.db.commit()
        #return self.pageIDs

    def load_recos(self, recoID, pageID):
        self.load_from_id(recoID)
        c = self.db.cursor()
        c.execute('SELECT index_size FROM recommenders WHERE id = ?',
            (recoID,)
        )

        row = c.fetchone()
        t = AnnoyIndex(row['index_size'], 'angular')
        t.load(str(self.id) + '.ann')
        recPages = t.get_nns_by_item(pageID, 15, -1, True)

        return recPages

    def load_url_recos(self, recoID, url):
        self.load_from_id(recoID)
        c = self.db.cursor()
        c.execute('SELECT index_size FROM recommenders WHERE id = ?',
            (recoID,)
        )

        row = c.fetchone()
        t = AnnoyIndex(row['index_size'], 'angular')
        t.load(str(self.id) + '.ann')
        pageID = self.pageIDs.index(url)
        recPageIDs = t.get_nns_by_item(pageID, 30)

        filteredURLs = []
        for url in self.urlFilters:
            filteredURLs.append(url['filterString'])

        recoURLs = []
        recoTitles = []
        for pageID in recPageIDs:
            if self.pageIDs[pageID] != url:
                filteredURL = False
                for furl in filteredURLs:
                    if furl in url:
                        filteredURL = True
                        break
                if not filteredURL:
                    recoURLs.append(self.pageIDs[pageID])
                    recoTitles.append(self.pageTitles[pageID])
        return [recoURLs, recoTitles]
