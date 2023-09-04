//import {describe, expect, test} from '@jest/globals';
import request from 'supertest'
import server from './index';

describe('Home page', () => {
  test('Hello World!', async () => {
	 /* const res = await fetch('http://localhost:8080');
	  const result = await res.json();
	  expect(result.message).toBe("Hello World!");
	  async () => {*/
      const response = await request(server).get("/");
      expect(response.statusCode).toBe(200)
  });
  afterAll(() => {server.close();});
});

