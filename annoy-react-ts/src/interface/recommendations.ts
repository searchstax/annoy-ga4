
export interface recommendations {
  data: any,
  name: string,
  gaID: string,
  hostname: string,
  metricName: string,
  titles: any,
  recoID: Number,
  urlFilters: {
    filterString: string,
    analyzeTraffic: boolean,
  }[]
}

export interface recommenders {
  data: any,
}

export interface urlFilter {
  filterString: string,
  analyzeTraffic: boolean,
}