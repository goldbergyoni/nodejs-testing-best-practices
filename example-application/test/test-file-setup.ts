import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as colors from 'colors/safe';
import { AddressInfo } from 'net';
import nock from 'nock';
import * as sinon from 'sinon';
import { startWebServer, stopWebServer } from '../entry-points/api';

export type TestStartOptions = {
  startAPI: boolean;
  disableNetConnect: boolean;
  includeTokenInHttpClient: boolean;
};

let apiAddress: null | AddressInfo; // holds the address of the API server to bake into HTTP clients
let httpClientForArrange: AxiosInstance | undefined; // This is used for making API calls in the arrange phase, where we wish to fail fast if someting goes wrong happen
let httpClient: AxiosInstance | undefined; // Http client for the Act phase, won't throw errors but rather return statuses
let chosenOptions: TestStartOptions | undefined;

export async function setupTestFile(options: TestStartOptions) {
  chosenOptions = options;
  if (options.startAPI === true) {
    apiAddress = await startWebServer();
  }
  if (options.disableNetConnect === true) {
    disableNetworkConnect();
  }
}

export async function tearDownTestFile() {
  if (apiAddress) {
    await stopWebServer();
  }
  apiAddress = null;
  nock.cleanAll();
  nock.enableNetConnect();
  sinon.restore();
}

export async function cleanBeforeEach() {
  nock.cleanAll();
  sinon.restore();
}

export function getHTTPClienForArrange(): AxiosInstance {
  if (!httpClientForArrange) {
    httpClientForArrange = buildHttpClient(true);
  }

  return httpClientForArrange!;
}

export function getHTTPClient(): AxiosInstance {
  if (!httpClient) {
    httpClient = buildHttpClient(false);
  }

  return httpClient!;
}

function buildHttpClient(throwsIfErrorStatus: boolean = false) {
  if (!apiAddress) {
    // This is probably a faulty state - someone instantiated the setup file without starting the API
    console.log(
      colors.red(
        `Test warning: The http client will be returned without a base address, is this what you meant?
                  If you mean to test the API, ensure to pass {startAPI: true} to the setupTestFile function`
      )
    );
  }

  const axiosConfig: AxiosRequestConfig = {
    headers: { 'Content-Type': 'application/json' },
    maxRedirects: 0,
  };
  if (apiAddress) {
    axiosConfig.baseURL = `http://127.0.0.1:${apiAddress.port}`;
  }
  if (!throwsIfErrorStatus) {
    axiosConfig.validateStatus = () => true;
  }

  const axiosInstance = axios.create(axiosConfig);

  return axiosInstance;
}

function getWebServerAddress() {
  if (!apiAddress) {
    throw new Error('The API server is not started, cannot get its address');
  }
  return { port: apiAddress.port, url: apiAddress.address };
}

function disableNetworkConnect() {
  nock.disableNetConnect();
  nock.enableNetConnect(
    (host) => host.includes('127.0.0.1') || host.includes('localhost')
  );
}
