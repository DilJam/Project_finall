const request = require('supertest');
const app = require('./server');
const Event = require('./models/Event');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('API de Eventos', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
        await Event.deleteMany({});
    }, 20000); // Set timeout to 20000 ms (20 seconds)

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    it('debería devolver todos los eventos', async () => {
        const res = await request(app).get('/events');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toBeInstanceOf(Array);
    });

    it('debería agregar un nuevo evento', async () => {
        const newEvent = { nombre: 'Evento 1', fecha: new Date(), descripcion: 'Descripción del evento' };
        const res = await request(app).post('/events').send(newEvent);
        expect(res.statusCode).toEqual(201);
        expect(res.body.nombre).toEqual(newEvent.nombre);
    });

    it('debería actualizar un evento existente', async () => {
        const newEvent = { nombre: 'Evento 2', fecha: new Date(), descripcion: 'Descripción del evento' };
        const createdEvent = await Event.create(newEvent);
        
        const updatedEvent = { nombre: 'Evento 2 Actualizado', fecha: new Date(), descripcion: 'Descripción actualizada' };
        const res = await request(app).put(`/events/${createdEvent._id}`).send(updatedEvent);
        expect(res.statusCode).toEqual(200);
        expect(res.body.nombre).toEqual(updatedEvent.nombre);
    });

    it('debería eliminar un evento existente', async () => {
        const newEvent = { nombre: 'Evento 3', fecha: new Date(), descripcion: 'Descripción del evento' };
        const createdEvent = await Event.create(newEvent);
        
        const res = await request(app).delete(`/events/${createdEvent._id}`);
        expect(res.statusCode).toEqual(204);
        
        const findRes = await request(app).get(`/events`);
        expect(findRes.body).not.toContainEqual(expect.objectContaining({ nombre: newEvent.nombre }));
    });
});
