import * as chance from 'chance';
import * as supertest from 'supertest';
import * as User from '../../models/user';

const random = chance.Chance();

export const createUser = async (
    server: supertest.SuperTest<supertest.Test>,
    info?: { email: string; username: string; password: string }
) => {
    const newUser = info || {
        email: random.email(),
        password: random.word({ length: 9 }),
        username: random.name()
    };
    return await server
        .post('/api/auth/register')
        .send(newUser)
        .accept('application/json')
        .expect('Content-Type', /json/)
        .expect(200);
};

export const loginUser = async (
    server: supertest.SuperTest<supertest.Test>,
    body: { email: string; password: string }
) => {
    return await server
        .post('/api/auth/login')
        .send(body)
        .accept('application/json')
        .expect('Content-Type', /json/)
        .expect(200);
};

export const getLists = async (server: supertest.SuperTest<supertest.Test>, token: string[]) => {
    return await server
        .get('/api/list')
        .accept('application/json')
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};

export const getList = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    page: number,
    token: string[]
) => {
    return await server
        .get(`/api/list/${list}/${page}`)
        .accept('application/json')
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};

export const createList = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    token: string[]
) => {
    return await server
        .post(`/api/list/${list}`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};

export const addTodo = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    todo: User.Todo,
    token: string[]
) => {
    return await server
        .post(`/api/list/${list}/add`)
        .accept('application/json')
        .send(todo)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect('Content-Type', /json/)
        .expect(200);
};

export const moveTodo = async (
    server: supertest.SuperTest<supertest.Test>,
    oldPos: { list: string; id: number },
    body: { newList: string; newId: number },
    token: string[]
) => {
    return await server
        .post(`/api/list/${oldPos.list}/move/${oldPos.id}`)
        .accept('application/json')
        .send(body)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect('Content-Type', /json/)
        .expect(200);
};

export const renameList = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    body: { newListName: string },
    token: string[]
) => {
    return await server
        .post(`/api/list/${list}/rename`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .send(body)
        .expect(200);
};

export const updateTodo = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    id: number,
    body: { title?: string; notes?: string[]; completed?: boolean },
    token: string[]
) => {
    return await server
        .put(`/api/list/${list}/${id}`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .send(body)
        .expect(200);
};

export const clearList = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    token: string[]
) => {
    return await server
        .delete(`/api/list/${list}/update`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};

export const deleteList = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    token: string[]
) => {
    return await server
        .delete(`/api/list/${list}/delete`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};

export const deleteTodo = async (
    server: supertest.SuperTest<supertest.Test>,
    list: string,
    id: number,
    token: string[]
) => {
    return await server
        .delete(`/api/list/${list}/${id}`)
        .set('Cookie', token[0])
        .set('Authorization', `Bearer ${token[1]}`)
        .expect(200);
};
