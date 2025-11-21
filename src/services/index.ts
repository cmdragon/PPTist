import axios from './config'

// export const SERVER_URL = 'http://localhost:5000'
export const SERVER_URL = (import.meta.env.MODE === 'development') ? '/api/v1/proxy/ppt_server' : 'https://api2.cmdragon.cn/api/v1/proxy/ppt_server'
export const ASSET_URL = (import.meta.env.MODE === 'development') ? '/api/v1/proxy/ppt_asset' : 'https://api2.cmdragon.cn/api/v1/proxy/ppt_asset'

export default {
  getMockData(filename: string): Promise<any> {
    return axios.get(`./mocks/${filename}.json`)
  },

  getFileData(filename: string): Promise<any> {
    return axios.get(`/mocks/${filename}.json`)
  },

  AIPPT_Outline(
    content: string,
    language: string,
    model: string,
  ): Promise<any> {
    return fetch(`${SERVER_URL}/tools/aippt_outline?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        language,
        model,
        stream: true,
      }),
    })
  },

  AIPPT(
    content: string,
    language: string,
    model: string,
  ): Promise<any> {
    return fetch(`${SERVER_URL}/tools/aippt?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        language,
        model,
        stream: true,
      }),
    })
  },
}