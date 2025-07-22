const request = require('supertest');
const app = require('../index');
const db = require('../db');
const axios = require('axios');

jest.mock('../db');
jest.mock('axios');

beforeEach(() => {
  jest.clearAllMocks(); // resets mock call history and implementations
});

describe('GET /get-joke', () => {
  test('should trigger "Joke already exists" message and match DB checksum', async () => {
    const jokeTextAPI = "mocked joke text";

    axios.get.mockResolvedValue({
      data: { value: jokeTextAPI }
    });

    const mockedRow = { id: 1, checksum: "03a8917918a797d294dae675f5e56ed3" };

    db.query.mockImplementationOnce(() => {
      return Promise.resolve([[mockedRow]]);
    });

    const response = await request(app).get('/get-joke');

    expect(response.status).toBe(200);
    expect(response.text).toContain(`Joke already exists with MD5: ${mockedRow.checksum}`);

    expect(axios.get).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith('https://api.chucknorris.io/jokes/random');

    expect(db.query.mock.calls[0][0]).toContain('SELECT id FROM sw_jokes WHERE checksum = ');
  });

  test('should insert new joke when checksum is not found in DB', async () => {
    const jokeText = "mocked joke text";

    axios.get.mockResolvedValue({
      data: { value: jokeText }
    });

    db.query
      .mockImplementationOnce(() => Promise.resolve([[]])) // No match
      .mockImplementationOnce(() => Promise.resolve([{ insertId: 123 }])); // Simulate insert

    const response = await request(app).get('/get-joke');

    expect(response.status).toBe(200);
    expect(response.text).toContain(`New joke saved with MD5: 03a8917918a797d294dae675f5e56ed3`);

    expect(axios.get).toHaveBeenCalled();
    expect(axios.get).toHaveBeenCalledWith('https://api.chucknorris.io/jokes/random');

    expect(db.query.mock.calls[0][0]).toContain('SELECT id FROM sw_jokes WHERE checksum = ');
    expect(db.query.mock.calls[1][0]).toContain('INSERT INTO sw_jokes (text, checksum) VALUES (?, ?)');
  });
});
