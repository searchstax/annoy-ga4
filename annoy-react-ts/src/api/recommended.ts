import type { recommendations, recommenders } from '../interface/recommendations';

export const getRecommenders = async (
): Promise<recommenders> => {
  const url = new URL('http://127.0.0.1:5000/get-recommenders');
  return await fetch(url.href, {
    method: 'get',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}

export const getRecommender = async (
  recoID: Number = -1
): Promise<recommendations> => {
  const url = new URL('http://127.0.0.1:5000/load-recommender');
  recoID !== -1 && url.searchParams.append('recoID', String(recoID));
  return await fetch(url.href, {
    method: 'get',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}

export const createRecommendations = async (
  name: string = '',
  gaCredentials: string = '',
  gaID: string = '',
  hostname: string = '',
  metricName: string = '',
  urlFilters: string = ''
): Promise<recommendations> => {
  const url = new URL('http://127.0.0.1:5000/new-recommendations');
  const data = {
    'name': name,
    'gaCredentials': gaCredentials,
    'gaID': gaID,
    'hostname': hostname,
    'metric': metricName,
    'urlFilters': urlFilters
  };
  return await fetch(url.href, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      'Content-type':'application/json', 
      'Accept':'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}

export const getRecommended = async (
  recoID: Number = -1,
  pageID: number = -1
): Promise<recommendations> => {
  const url = new URL('http://127.0.0.1:5000/get-recommendations');
  recoID !== -1 && url.searchParams.append('recoID', String(recoID));
  pageID !== -1 && url.searchParams.append('pageID', String(pageID));
  return await fetch(url.href, {
    method: 'get',
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('error')
      }
      return await response.json();
    })
    .catch((error: Error) => {
      throw error
    });
}
