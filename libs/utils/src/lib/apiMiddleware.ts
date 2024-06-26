import axios, { AxiosHeaders } from 'axios';

interface apiMiddlewareProps {
  url: string;
  method: string;
  data?: unknown;
  accessToken?: string;
  onSuccess: (data: unknown) => void;
  onFailure: (data: string) => void;
  headers?: AxiosHeaders;
  accessDenied?: (data: string) => void;
}

const apiMiddleware = ({
  url,
  method,
  onSuccess,
  onFailure,
  accessToken,
  data,
  headers,
  accessDenied,
}: apiMiddlewareProps) => {
  const dataOrParams = ['GET', 'DELETE'].includes(method) ? 'params' : 'data';

  // axios default configs
  axios.defaults.baseURL = process.env.REACT_APP_URL_REMOTE_LINK || '';
  axios.defaults.headers.common['Content-Type'] = 'application/json';
  axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

  axios
    .request({
      url,
      method,
      headers,
      [dataOrParams]: data,
    })
    .then(({ data }) => {
      onSuccess(data);
    })
    .catch((error) => {
      onFailure(error.message);

      if (error.response && error.response.status === 403 && accessDenied) {
        accessDenied(window.location.pathname);
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .finally(() => {});
};

export default apiMiddleware;
