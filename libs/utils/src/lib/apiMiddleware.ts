import axios, { AxiosHeaders } from 'axios';

interface apiMiddlewareProps {
  url: string;
  method: string;
  data?: unknown;
  accessToken?: string;
  onSuccess: (data: unknown) => void;
  onFailure: (data: unknown) => void;
  onFinally?: () => void;
  headers?: AxiosHeaders;
}

export const apiMiddleware = ({
  url,
  method,
  onSuccess,
  onFailure,
  onFinally,
  accessToken,
  data,
  headers,
}: apiMiddlewareProps) => {
  const dataOrParams = ['GET', 'DELETE'].includes(method) ? 'params' : 'data';

  // axios default configs
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
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
      onFailure(error);
    })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    .finally(() => {
      onFinally && onFinally();
    });
};
