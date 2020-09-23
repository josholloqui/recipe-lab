const fs = require('fs');
const pool = require('../lib/utils/pool');
const request = require('supertest');
const app = require('../lib/app');
const Recipe = require('../lib/models/recipe');
const Log = require('../lib/models/log');

describe('log routes', () => {
  beforeEach(() => {
    return pool.query(fs.readFileSync('./sql/setup.sql', 'utf-8'));
  });

  it('create a log', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ]
    });

    return request(app)
      .post('/api/v1/logs')
      .send({
        recipeId: recipe.id,
        dateOfEvent: '09-22-2020',
        notes: 'cookies for any occasion',
        rating: 7
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: '1',
          dateOfEvent: '09-22-2020',
          notes: 'cookies for any occasion',
          rating: '7'
        });
      });
  });

  it('gets all logs', async() => {
    const recipes = await Promise.all([
      { name: 'cookies', directions: [] },
      { name: 'cake', directions: [] },
      { name: 'pie', directions: [] }
    ].map(recipe => Recipe.insert(recipe)));

    const logs = await Promise.all([
      {
        recipeId: recipes[0].id,
        dateOfEvent: '09-23-2020',
        notes: 'cookie for any occasion',
        rating: 2
      }, {
        recipeId: recipes[1].id,
        dateOfEvent: '09-25-2020',
        notes: 'cook for any occasion',
        rating: 7
      }, {
        recipeId: recipes[2].id,
        dateOfEvent: '09-27-2020',
        notes: 'cookies for any occasion',
        rating: 8
      }
    ].map(log => Log.insert(log)));

    return request(app)
      .get('/api/v1/logs')
      .then(res => {
        logs.forEach(log => {
          expect(res.body).toContainEqual(log);
        });
      });
  });

  it('finds a log by its id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ]
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '09-27-2020',
      notes: 'cookies for any occasion',
      rating: 8
    });

    const response = await request(app)
      .get(`/api/v1/logs/${log.id}`);

    expect(response.body).toEqual(log);
  });

  it('updates a log by id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '09-22-2020',
      notes: 'not that bad',
      rating: 7
    });

    return request(app)
      .put(`/api/v1/logs/${log.id}`)
      .send({
        recipeId: recipe.id,
        dateOfEvent: '09-26-2020',
        notes: 'not that bad okay pretty bad',
        rating: 9
      })
      .then(res => {
        expect(res.body).toEqual({
          id: expect.any(String),
          recipeId: recipe.id,
          dateOfEvent: '09-26-2020',
          notes: 'not that bad okay pretty bad',
          rating: '9'
        });
      });
  });

  it('delete a log by its id', async() => {
    const recipe = await Recipe.insert({
      name: 'cookies',
      directions: [
        'preheat oven to 375',
        'mix ingredients',
        'put dough on cookie sheet',
        'bake for 10 minutes'
      ],
    });

    const log = await Log.insert({
      recipeId: recipe.id,
      dateOfEvent: '09-22-2020',
      notes: 'not that bad',
      rating: 7
    });

    const response = await request(app)
      .delete(`/api/v1/logs/${log.id}`);

    expect(response.body).toEqual(log);
  });
});
